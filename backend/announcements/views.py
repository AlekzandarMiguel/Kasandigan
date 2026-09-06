from rest_framework import viewsets, permissions, status
from announcements.models import Announcement
from announcements.serializers import AnnouncementSerializer
from kasandigan_core.permissions import IsBarangayStaffOrAdmin
from notifications.services import NotificationService
from activity_logs.services import AuditLogger

class AnnouncementViewSet(viewsets.ModelViewSet):
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsBarangayStaffOrAdmin()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Announcement.objects.none()

        if user.role == 'PLATFORM_ADMIN':
            qs = Announcement.objects.all()
        elif user.role in ['BARANGAY_STAFF', 'BARANGAY_ADMIN']:
            qs = Announcement.objects.filter(barangay=user.barangay)
        else:
            # Residents only see active announcements
            qs = Announcement.objects.filter(barangay=user.barangay, is_active=True)

        return qs.order_by('-is_pinned', '-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        announcement = serializer.save(
            author=user,
            barangay=user.barangay
        )

        # Broadcast notification to all residents of the barangay
        NotificationService.broadcast_barangay(
            barangay=user.barangay,
            title=f"Barangay Notice: {announcement.title}",
            message=announcement.content[:140] + ('...' if len(announcement.content) > 140 else ''),
            notif_type='ANNOUNCEMENT',
            link='/dashboard'
        )

        AuditLogger.log(
            user=user,
            action='ANNOUNCEMENT_POSTED',
            description=f"Announcement posted: '{announcement.title}' [{announcement.priority}]",
            target_type='Announcement',
            target_id=str(announcement.id),
            barangay=user.barangay
        )
