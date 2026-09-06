from django.db.models import Count, Avg, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from tenants.models import Barangay
from accounts.models import User
from assistance.models import AssistanceRequest, AssistanceTransaction
from reports.models import Report
from announcements.models import Announcement
from notifications.models import Notification
from skills.models import AssistanceCategory

class DashboardMetricsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role

        if role == 'PLATFORM_ADMIN':
            # 1. Platform Administrator Metrics
            total_barangays = Barangay.objects.count()
            active_barangays = Barangay.objects.filter(status='ACTIVE').count()
            suspended_barangays = Barangay.objects.filter(status='SUSPENDED').count()

            total_residents = User.objects.filter(role='RESIDENT').count()
            total_requests = AssistanceRequest.objects.count()
            completed_requests = AssistanceRequest.objects.filter(status='COMPLETED').count()
            pending_requests = AssistanceRequest.objects.filter(status__in=['PENDING', 'MATCHED']).count()
            reported_accounts = Report.objects.filter(reported_user__isnull=False).values('reported_user').distinct().count()

            # Requests per barangay breakdown
            barangay_stats = Barangay.objects.annotate(
                req_count=Count('assistance_requests'),
                resident_count=Count('users', filter=Q(users__role='RESIDENT'))
            ).values('id', 'name', 'status', 'req_count', 'resident_count')[:10]

            # Top categories platform-wide
            top_categories = AssistanceCategory.objects.annotate(
                req_count=Count('requests')
            ).order_by('-req_count').values('id', 'name', 'icon', 'req_count')[:6]

            completion_rate = round((completed_requests / total_requests * 100), 1) if total_requests > 0 else 0

            return Response({
                'role': role,
                'summary': {
                    'total_barangays': total_barangays,
                    'active_barangays': active_barangays,
                    'suspended_barangays': suspended_barangays,
                    'total_residents': total_residents,
                    'total_requests': total_requests,
                    'completed_requests': completed_requests,
                    'pending_requests': pending_requests,
                    'completion_rate': f"{completion_rate}%",
                    'reported_accounts': reported_accounts,
                },
                'barangay_stats': list(barangay_stats),
                'top_categories': list(top_categories)
            })

        elif role in ['BARANGAY_ADMIN', 'BARANGAY_STAFF']:
            # 2. Barangay Admin & Staff Metrics
            b = user.barangay
            if not b:
                return Response({'detail': 'User has no assigned barangay.'}, status=status.HTTP_400_BAD_REQUEST)

            residents_qs = User.objects.filter(barangay=b, role='RESIDENT')
            total_residents = residents_qs.count()
            active_residents = residents_qs.filter(is_active=True, verification_status='VERIFIED').count()
            pending_verifications = residents_qs.filter(verification_status='PENDING_VERIFICATION').count()

            requests_qs = AssistanceRequest.objects.filter(barangay=b)
            total_requests = requests_qs.count()
            pending_requests = requests_qs.filter(status__in=['PENDING', 'MATCHED']).count()
            active_requests = requests_qs.filter(status__in=['ACCEPTED', 'IN_PROGRESS']).count()
            completed_requests = requests_qs.filter(status='COMPLETED').count()
            cancelled_requests = requests_qs.filter(status='CANCELLED').count()

            open_reports = Report.objects.filter(barangay=b, status__in=['PENDING', 'UNDER_REVIEW']).count()

            # Top categories in this barangay
            top_categories = AssistanceCategory.objects.filter(
                Q(barangay__isnull=True) | Q(barangay=b)
            ).annotate(
                req_count=Count('requests', filter=Q(requests__barangay=b))
            ).order_by('-req_count').values('id', 'name', 'icon', 'req_count')[:5]

            # Top helpers
            top_helpers = residents_qs.filter(completed_assistance_count__gt=0).order_by('-completed_assistance_count', '-rating_average').values(
                'id', 'first_name', 'last_name', 'avatar_url', 'zone',
                'completed_assistance_count', 'rating_average'
            )[:5]

            return Response({
                'role': role,
                'barangay_name': b.name,
                'summary': {
                    'total_residents': total_residents,
                    'active_residents': active_residents,
                    'pending_verifications': pending_verifications,
                    'total_requests': total_requests,
                    'pending_requests': pending_requests,
                    'active_requests': active_requests,
                    'completed_requests': completed_requests,
                    'cancelled_requests': cancelled_requests,
                    'open_reports': open_reports,
                },
                'top_categories': list(top_categories),
                'top_helpers': list(top_helpers)
            })

        else:
            # 3. Resident Metrics
            b = user.barangay
            my_active_requests = AssistanceRequest.objects.filter(
                requester=user,
                status__in=['PENDING', 'MATCHED', 'ACCEPTED', 'IN_PROGRESS']
            ).count()

            requests_helping = AssistanceRequest.objects.filter(
                assigned_helper=user,
                status__in=['ACCEPTED', 'IN_PROGRESS']
            ).count()

            completed_assistance = user.completed_assistance_count
            my_rating = float(user.rating_average)

            # Announcements preview
            announcements = Announcement.objects.filter(
                barangay=b,
                is_active=True
            ).order_by('-is_pinned', '-created_at')[:3].values('id', 'title', 'content', 'priority', 'created_at')

            # Recent notifications
            recent_notifs = Notification.objects.filter(
                user=user
            ).order_by('-created_at')[:4].values('id', 'title', 'message', 'type', 'is_read', 'created_at')

            return Response({
                'role': role,
                'barangay_name': b.name if b else 'Unassigned',
                'summary': {
                    'my_active_requests': my_active_requests,
                    'requests_helping': requests_helping,
                    'completed_assistance': completed_assistance,
                    'my_rating': my_rating,
                    'verification_status': user.verification_status,
                },
                'announcements': list(announcements),
                'recent_notifications': list(recent_notifs)
            })
