from datetime import date, timedelta
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from tenants.models import Barangay
from accounts.models import User, BlockedUser
from skills.models import AssistanceCategory, Skill, UserSkill, UserAvailability
from assistance.models import AssistanceRequest, AssistanceInvitation, AssistanceTransaction
from matching.matching_service import RuleBasedMatchingService
from ratings.models import Rating

class KasandiganCoreTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create two isolated barangays (Tenants)
        self.barangay_a = Barangay.objects.create(
            name="Barangay San Jose",
            code="san-jose",
            municipality_city="Pasig City",
            province="Metro Manila",
            status="ACTIVE",
            zones=["Zone 1", "Zone 2", "Zone 3"]
        )

        self.barangay_b = Barangay.objects.create(
            name="Barangay Poblacion",
            code="poblacion",
            municipality_city="Makati City",
            province="Metro Manila",
            status="ACTIVE",
            zones=["Poblacion East", "Poblacion West"]
        )

        # Create Platform Admin
        self.platform_admin = User.objects.create_superuser(
            email="platform.admin@kasandigan.gov.ph",
            password="Password123!",
            first_name="Global",
            last_name="Admin"
        )

        # Create Barangay Admin for Barangay A
        self.admin_a = User.objects.create_user(
            email="admin.sanjose@kasandigan.gov.ph",
            password="Password123!",
            first_name="Admin",
            last_name="SanJose",
            role="BARANGAY_ADMIN",
            barangay=self.barangay_a,
            verification_status="VERIFIED"
        )

        # Create Residents in Barangay A
        self.requester_a = User.objects.create_user(
            email="maria.requester@example.com",
            password="Password123!",
            first_name="Maria",
            last_name="Santos",
            role="RESIDENT",
            barangay=self.barangay_a,
            zone="Zone 2",
            verification_status="VERIFIED"
        )

        self.helper_a = User.objects.create_user(
            email="juan.helper@example.com",
            password="Password123!",
            first_name="Juan",
            last_name="Dela Cruz",
            role="RESIDENT",
            barangay=self.barangay_a,
            zone="Zone 2",
            verification_status="VERIFIED",
            rating_average=4.8,
            rating_count=5
        )

        # Create Resident in Barangay B
        self.resident_b = User.objects.create_user(
            email="pedro.b@example.com",
            password="Password123!",
            first_name="Pedro",
            last_name="Penduko",
            role="RESIDENT",
            barangay=self.barangay_b,
            zone="Poblacion East",
            verification_status="VERIFIED"
        )

        # Category and Skills
        self.cat_tech = AssistanceCategory.objects.create(
            name="Technology Help",
            icon="Laptop"
        )

        self.skill_repair = Skill.objects.create(
            category=self.cat_tech,
            name="Computer Repair"
        )

        # Assign skill and availability to helper_a
        UserSkill.objects.create(
            user=self.helper_a,
            skill=self.skill_repair,
            proficiency="EXPERT"
        )

        # Available on Saturday (day 5)
        UserAvailability.objects.create(
            user=self.helper_a,
            day_of_week=5,
            is_available=True,
            time_slot="ALL_DAY"
        )

    def test_tenant_isolation_assistance_requests(self):
        """Ensure Resident in Barangay A cannot see or access requests from Barangay B"""
        req_b = AssistanceRequest.objects.create(
            barangay=self.barangay_b,
            requester=self.resident_b,
            title="Help in Barangay B",
            description="Need help in Poblacion",
            category=self.cat_tech,
            preferred_date=date.today() + timedelta(days=2),
            zone="Poblacion East"
        )

        # Login as Resident A
        self.client.force_authenticate(user=self.requester_a)
        response = self.client.get('/api/requests/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Results should NOT contain Barangay B's request
        req_ids = [item['id'] for item in response.data.get('results', [])]
        self.assertNotIn(req_b.id, req_ids)

    def test_deterministic_rule_based_matching(self):
        """Test rule-based scoring without AI: Skill(+50) + Barangay(+20) + Zone(+15) + Avail(+10) + Rating(+5) = 100"""
        # Pick next Saturday
        today = date.today()
        saturday = today + timedelta(days=(5 - today.weekday()) % 7)

        req = AssistanceRequest.objects.create(
            barangay=self.barangay_a,
            requester=self.requester_a,
            title="Laptop not starting",
            description="Troubleshooting needed",
            category=self.cat_tech,
            required_skill=self.skill_repair,
            preferred_date=saturday,
            preferred_time="Morning",
            zone="Zone 2"
        )

        matches = RuleBasedMatchingService.find_and_rank_helpers(req)
        self.assertTrue(len(matches) > 0)
        top_match = matches[0]
        self.assertEqual(top_match['helper_id'], self.helper_a.id)
        # Score calculation: 50 (skill) + 20 (barangay) + 15 (zone 2) + 10 (saturday avail) + 5 (rating 4.8) = 100
        self.assertEqual(top_match['total_score'], 100)
        self.assertIn("Matching skill", top_match['reasons'][0])

    def test_blocked_user_excluded_from_matching(self):
        """Blocked helpers must never appear in matching recommendations"""
        BlockedUser.objects.create(
            blocker=self.requester_a,
            blocked=self.helper_a,
            barangay=self.barangay_a,
            reason="Spam"
        )

        req = AssistanceRequest.objects.create(
            barangay=self.barangay_a,
            requester=self.requester_a,
            title="Need electrical help",
            description="Broken switch",
            category=self.cat_tech,
            preferred_date=date.today(),
            zone="Zone 2"
        )

        matches = RuleBasedMatchingService.find_and_rank_helpers(req)
        matched_helper_ids = [m['helper_id'] for m in matches]
        self.assertNotIn(self.helper_a.id, matched_helper_ids)

    def test_rating_cannot_be_submitted_before_completion(self):
        """Rating can only be submitted after request status is COMPLETED"""
        req = AssistanceRequest.objects.create(
            barangay=self.barangay_a,
            requester=self.requester_a,
            assigned_helper=self.helper_a,
            title="Yard Cleaning",
            description="Lawn mowing",
            category=self.cat_tech,
            preferred_date=date.today(),
            zone="Zone 2",
            status="IN_PROGRESS"
        )

        self.client.force_authenticate(user=self.requester_a)
        response = self.client.post('/api/ratings/', {
            'request': req.id,
            'score': 5,
            'review': 'Great work!'
        })
        # Should fail with 400 validation error
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("completed", str(response.data))
