from rest_framework import serializers
from reports.models import Report

class ReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.ReadOnlyField(source='reporter.full_name')
    reported_user_name = serializers.ReadOnlyField(source='reported_user.full_name')
    reported_request_title = serializers.ReadOnlyField(source='reported_request.title')
    resolved_by_name = serializers.ReadOnlyField(source='resolved_by.full_name')
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'barangay', 'reporter', 'reporter_name', 'reported_user',
            'reported_user_name', 'reported_request', 'reported_request_title',
            'report_type', 'report_type_display', 'description', 'evidence_url',
            'status', 'status_display', 'moderation_notes', 'resolved_by',
            'resolved_by_name', 'resolved_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reporter', 'barangay', 'resolved_by', 'resolved_at', 'created_at', 'updated_at']


class ReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['reported_user', 'reported_request', 'report_type', 'description', 'evidence_url']


class ReportActionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['UNDER_REVIEW', 'RESOLVED', 'DISMISSED'])
    moderation_notes = serializers.CharField(required=False, allow_blank=True, default='')
    suspend_user = serializers.BooleanField(required=False, default=False)
