from rest_framework import viewsets, permissions
from activity_logs.models import ActivityLog
from activity_logs.serializers import ActivityLogSerializer
from kasandigan_core.permissions import IsBarangayAdmin, IsPlatformAdmin

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsBarangayAdmin]

    def get_queryset(self):
        user = self.request.user
        action_param = self.request.query_params.get('action')

        if user.role == 'PLATFORM_ADMIN':
            qs = ActivityLog.objects.all()
            b_id = self.request.query_params.get('barangay')
            if b_id:
                qs = qs.filter(barangay_id=b_id)
        else:
            qs = ActivityLog.objects.filter(barangay=user.barangay)

        if action_param:
            qs = qs.filter(action=action_param)

        return qs.select_related('user', 'barangay').order_by('-created_at')
