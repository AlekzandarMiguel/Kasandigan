from rest_framework import serializers
from announcements.models import Announcement

class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.full_name')
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    barangay_name = serializers.SerializerMethodField()

    def get_barangay_name(self, obj):
        if obj.barangay:
            return obj.barangay.name
        return "LGU Maramag Municipal MDRRMO"

    class Meta:
        model = Announcement
        fields = [
            'id', 'barangay', 'barangay_name', 'author', 'author_name', 'title',
            'content', 'priority', 'priority_display', 'is_pinned',
            'is_active', 'is_emergency_broadcast', 'alert_level',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
