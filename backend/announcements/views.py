from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from announcements.models import Announcement
from announcements.serializers import AnnouncementSerializer
from kasandigan_core.permissions import IsBarangayStaffOrAdmin, IsPlatformAdmin
from notifications.services import NotificationService
from activity_logs.services import AuditLogger

class AnnouncementViewSet(viewsets.ModelViewSet):
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'active_emergency']:
            return [permissions.IsAuthenticated()]
        # Allow Platform Admin or Barangay Staff/Admin to post
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Announcement.objects.none()

        if user.role == 'PLATFORM_ADMIN':
            qs = Announcement.objects.all()
        elif user.role in ['BARANGAY_STAFF', 'BARANGAY_ADMIN']:
            qs = Announcement.objects.filter(
                Q(barangay=user.barangay) | Q(is_emergency_broadcast=True) | Q(barangay__isnull=True)
            )
        else:
            # Residents see their barangay announcements + active municipal emergency broadcasts
            qs = Announcement.objects.filter(
                (Q(barangay=user.barangay) | Q(is_emergency_broadcast=True) | Q(barangay__isnull=True)) & Q(is_active=True)
            )

        return qs.order_by('-is_pinned', '-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        is_emergency = serializer.validated_data.get('is_emergency_broadcast', False)
        barangay = None if (is_emergency and user.role == 'PLATFORM_ADMIN') else user.barangay

        announcement = serializer.save(
            author=user,
            barangay=barangay
        )

        if announcement.is_emergency_broadcast:
            # Broadcast to all 20 barangays in Maramag
            NotificationService.broadcast_municipal(
                title=f"MDRRMO {announcement.alert_level} ALERT: {announcement.title}",
                message=announcement.content[:160] + ('...' if len(announcement.content) > 160 else ''),
                notif_type='EMERGENCY_ALERT',
                link='/dashboard'
            )
            AuditLogger.log(
                user=user,
                action='MUNICIPAL_EMERGENCY_BROADCAST',
                description=f"Municipal Emergency Alert broadcasted: '{announcement.title}' [{announcement.alert_level}]",
                target_type='Announcement',
                target_id=str(announcement.id),
                barangay=None
            )
        else:
            # Broadcast notification to all residents of the barangay
            if user.barangay:
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

    @action(detail=False, methods=['get'], url_path='active-emergency')
    def active_emergency(self, request):
        latest_emergency = Announcement.objects.filter(
            is_emergency_broadcast=True,
            is_active=True
        ).order_by('-created_at').first()

        if not latest_emergency:
            return Response(None)
        return Response(AnnouncementSerializer(latest_emergency).data)
