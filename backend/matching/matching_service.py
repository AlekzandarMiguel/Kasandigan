from datetime import datetime
from accounts.models import User, BlockedUser
from skills.models import UserSkill, UserAvailability
from matching.models import RequestMatch

class RuleBasedMatchingService:
    """
    Deterministic rule-based matching engine.
    Computes transparent scores and human-readable explanation badges.
    Strictly NO AI / ML.
    """

    SKILL_POINTS = 50
    BARANGAY_POINTS = 20
    ZONE_POINTS = 15
    AVAILABILITY_POINTS = 10
    RATING_POINTS = 5

    @classmethod
    def find_and_rank_helpers(cls, request_obj):
        """
        Calculates and persists match scores for all eligible helpers for an AssistanceRequest.
        Returns a sorted list of ranked helper dictionaries with score breakdown and badges.
        """
        barangay = request_obj.barangay
        requester = request_obj.requester

        # 1. Identify blocked relationships (bi-directional check)
        blocked_ids = set(
            BlockedUser.objects.filter(blocker=requester).values_list('blocked_id', flat=True)
        ).union(
            set(BlockedUser.objects.filter(blocked=requester).values_list('blocker_id', flat=True))
        )

        # 2. Filter eligible candidate pool
        # Must be verified, active, same barangay, not the requester, not blocked, not suspended
        candidates = User.objects.filter(
            barangay=barangay,
            role='RESIDENT',
            verification_status='VERIFIED',
            is_active=True
        ).exclude(
            id=requester.id
        ).exclude(
            id__in=blocked_ids
        )

        # Day of week for preferred_date (0=Monday, ..., 6=Sunday)
        req_day = request_obj.preferred_date.weekday()

        ranked_results = []

        for candidate in candidates:
            skill_score = 0
            barangay_score = cls.BARANGAY_POINTS
            zone_score = 0
            avail_score = 0
            rating_score = 0
            reasons = []

            # 3. Check Skill Match (+50)
            has_direct_skill = False
            if request_obj.required_skill:
                user_skill = UserSkill.objects.filter(
                    user=candidate,
                    skill=request_obj.required_skill
                ).first()
                if user_skill:
                    has_direct_skill = True
                    skill_score = cls.SKILL_POINTS
                    reasons.append(f"Matching skill: {request_obj.required_skill.name} ({user_skill.get_proficiency_display()})")
            else:
                # If no specific skill required, check category overlap
                has_category_skill = UserSkill.objects.filter(
                    user=candidate,
                    skill__category=request_obj.category
                ).exists()
                if has_category_skill:
                    has_direct_skill = True
                    skill_score = cls.SKILL_POINTS
                    reasons.append(f"Experienced in {request_obj.category.name}")

            # If request specified a skill and helper doesn't have it, skip or keep 0?
            # Matching rules: "Have the required skill/category"
            if request_obj.required_skill and not has_direct_skill:
                # If helper has another skill in same category, grant partial or check
                has_category_skill = UserSkill.objects.filter(
                    user=candidate,
                    skill__category=request_obj.category
                ).exists()
                if not has_category_skill:
                    continue  # Ineligible helper per Section 15
                else:
                    skill_score = 30  # Related category skill
                    reasons.append(f"Related skills in {request_obj.category.name}")

            reasons.append(f"Verified resident of {barangay.name}")

            # 4. Check Zone Match (+15)
            if candidate.zone and request_obj.zone:
                if candidate.zone.strip().lower() == request_obj.zone.strip().lower():
                    zone_score = cls.ZONE_POINTS
                    reasons.append(f"Located in the same zone ({candidate.zone})")
                elif candidate.assistance_radius == 'BARANGAY':
                    zone_score = 10
                    reasons.append("Can travel anywhere within the barangay")
            elif candidate.assistance_radius == 'BARANGAY':
                zone_score = 10
                reasons.append("Can assist anywhere within the barangay")

            # 5. Check Availability (+10)
            avail_records = UserAvailability.objects.filter(
                user=candidate,
                day_of_week=req_day,
                is_available=True
            )

            is_available = False
            if avail_records.exists():
                # Check slot matching
                pref_time_lower = request_obj.preferred_time.lower()
                for av in avail_records:
                    if av.time_slot == 'ALL_DAY':
                        is_available = True
                        break
                    elif 'morning' in pref_time_lower and av.time_slot == 'MORNING':
                        is_available = True
                        break
                    elif 'afternoon' in pref_time_lower and av.time_slot == 'AFTERNOON':
                        is_available = True
                        break
                    elif 'evening' in pref_time_lower and av.time_slot == 'EVENING':
                        is_available = True
                        break
                    else:
                        is_available = True  # General availability on that day

            if is_available:
                avail_score = cls.AVAILABILITY_POINTS
                reasons.append(f"Available on {request_obj.preferred_date.strftime('%A')}")
            else:
                # If user hasn't explicitly set availability, treat as general
                if not UserAvailability.objects.filter(user=candidate).exists():
                    avail_score = 5
                    reasons.append("Flexible schedule")

            # 6. Good Community Rating (+5)
            # Either high rating (>= 4.0) or newly verified helper with clean record
            if candidate.rating_average >= 4.0 and candidate.rating_count > 0:
                rating_score = cls.RATING_POINTS
                reasons.append(f"High community rating ({candidate.rating_average:.1f} ★ from {candidate.rating_count} reviews)")
            elif candidate.rating_count == 0 and candidate.verification_status == 'VERIFIED':
                rating_score = 4
                reasons.append("Verified community member")

            total_score = min(100, skill_score + barangay_score + zone_score + avail_score + rating_score)

            # Update or create cached match
            match_record, _ = RequestMatch.objects.update_or_create(
                request=request_obj,
                helper=candidate,
                defaults={
                    'total_score': total_score,
                    'skill_score': skill_score,
                    'barangay_score': barangay_score,
                    'zone_score': zone_score,
                    'availability_score': avail_score,
                    'rating_score': rating_score,
                    'reasons': reasons
                }
            )

            ranked_results.append({
                'id': match_record.id,
                'helper_id': candidate.id,
                'helper_name': candidate.full_name,
                'helper_avatar': candidate.avatar_url,
                'helper_zone': candidate.zone,
                'rating_average': float(candidate.rating_average),
                'rating_count': candidate.rating_count,
                'completed_assistance_count': candidate.completed_assistance_count,
                'total_score': total_score,
                'breakdown': {
                    'skill_match': skill_score,
                    'same_barangay': barangay_score,
                    'same_zone': zone_score,
                    'availability': avail_score,
                    'good_rating': rating_score
                },
                'reasons': reasons
            })

        # Sort descending by total score, then by rating average
        ranked_results.sort(key=lambda x: (x['total_score'], x['rating_average'], x['completed_assistance_count']), reverse=True)
        return ranked_results
