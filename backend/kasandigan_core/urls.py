"""
URL configuration for kasandigan_core project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from accounts.views import (
    RegisterView, CurrentUserView, ChangePasswordView,
    ResidentDirectoryViewSet, StaffManagementViewSet,
    BlockedUserViewSet, PlatformUsersViewSet
)
from tenants.views import BarangayViewSet
from skills.views import (
    AssistanceCategoryViewSet, SkillViewSet,
    UserSkillViewSet, UserAvailabilityViewSet
)
from assistance.views import (
    AssistanceRequestViewSet, AssistanceInvitationViewSet,
    AssistanceWorkflowViewSet
)
from ratings.views import RatingViewSet
from reports.views import ReportViewSet
from notifications.views import NotificationViewSet
from announcements.views import AnnouncementViewSet
from resources.views import ResourceViewSet, ResourceRequestViewSet
from activity_logs.views import ActivityLogViewSet
from kasandigan_core.dashboard_views import DashboardMetricsView

router = DefaultRouter()

# Tenants
router.register(r'barangays', BarangayViewSet, basename='barangay')

# Accounts & Moderation
router.register(r'residents', ResidentDirectoryViewSet, basename='resident')
router.register(r'staff', StaffManagementViewSet, basename='staff')
router.register(r'blocked-users', BlockedUserViewSet, basename='blocked-user')
router.register(r'platform/users', PlatformUsersViewSet, basename='platform-user')

# Skills & Availabilities
router.register(r'categories', AssistanceCategoryViewSet, basename='category')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'user-skills', UserSkillViewSet, basename='user-skill')
router.register(r'user-availability', UserAvailabilityViewSet, basename='user-availability')

# Assistance
router.register(r'requests', AssistanceRequestViewSet, basename='request')
router.register(r'invitations', AssistanceInvitationViewSet, basename='invitation')
router.register(r'assistance/workflow', AssistanceWorkflowViewSet, basename='assistance-workflow')

# Trust, Safety, and Community
router.register(r'ratings', RatingViewSet, basename='rating')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'resource-requests', ResourceRequestViewSet, basename='resource-request')
router.register(r'activity-logs', ActivityLogViewSet, basename='activity-log')

class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_scope = 'auth'

class ThrottledTokenRefreshView(TokenRefreshView):
    throttle_scope = 'auth'

urlpatterns = [
    path('admin/', admin.site.urls),

    # Authentication Endpoints
    path('api/auth/register/', RegisterView.as_view(), name='auth-register'),
    path('api/auth/login/', ThrottledTokenObtainPairView.as_view(), name='auth-login'),
    path('api/auth/refresh/', ThrottledTokenRefreshView.as_view(), name='auth-refresh'),
    path('api/auth/me/', CurrentUserView.as_view(), name='auth-me'),
    path('api/auth/change-password/', ChangePasswordView.as_view(), name='auth-change-password'),

    # Metrics & Dashboard
    path('api/dashboard/', DashboardMetricsView.as_view(), name='dashboard-metrics'),

    # DRF Router endpoints
    path('api/', include(router.urls)),
]
