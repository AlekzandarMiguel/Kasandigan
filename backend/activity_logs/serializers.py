from rest_framework import serializers
from activity_logs.models import ActivityLog

class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.full_name')
    user_email = serializers.ReadOnlyField(source='user.email')
    barangay_name = serializers.ReadOnlyField(source='barangay.name')
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_name', 'user_email', 'barangay',
            'barangay_name', 'action', 'action_display', 'description',
            'target_type', 'target_id', 'ip_address', 'created_at'
        ]
        read_only_fields = fields
