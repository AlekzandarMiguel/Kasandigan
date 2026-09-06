from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from reports.models import Report
from reports.serializers import ReportSerializer, ReportCreateSerializer, ReportActionSerializer
from kasandigan_core.permissions import IsBarangayStaffOrAdmin
from activity_logs.services import AuditLogger
from notifications.services import NotificationService

class ReportViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return ReportCreateSerializer
        return ReportSerializer

    def get_queryset(self):
        user = self.request.user
        status_param = self.request.query_params.get('status')

        if user.role in ['BARANGAY_STAFF', 'BARANGAY_ADMIN']:
            qs = Report.objects.filter(barangay=user.barangay)
        elif user.role == 'PLATFORM_ADMIN':
            qs = Report.objects.all()
            b_id = self.request.query_params.get('barangay')
            if b_id:
                qs = qs.filter(barangay_id=b_id)
        else:
            # Residents only see reports filed by themselves
            qs = Report.objects.filter(reporter=user)

        if status_param:
            qs = qs.filter(status=status_param)

        return qs.select_related('reporter', 'reported_user', 'reported_request', 'resolved_by')

    def perform_create(self, serializer):
        user = self.request.user
        report = serializer.save(
            reporter=user,
            barangay=user.barangay,
            status='PENDING'
        )

        AuditLogger.log(
            user=user,
            action='REPORT_CREATION',
            description=f"New report filed: {report.get_report_type_display()} by {user.full_name}",
            target_type='Report',
            target_id=str(report.id),
            barangay=user.barangay
        )

    @action(detail=True, methods=['post'], permission_classes=[IsBarangayStaffOrAdmin])
    def triage(self, request, pk=None):
        report = self.get_object()
        serializer = ReportActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('moderation_notes', '')
        suspend_user = serializer.validated_data.get('suspend_user', False)

        report.status = new_status
        report.moderation_notes = notes
        report.resolved_by = request.user
        report.resolved_at = timezone.now()
        report.save(update_fields=['status', 'moderation_notes', 'resolved_by', 'resolved_at', 'updated_at'])

        # If moderation action specifies suspending user
        if suspend_user and report.reported_user:
            reported_user = report.reported_user
            reported_user.is_active = False
            reported_user.verification_status = 'SUSPENDED'
            reported_user.verification_notes = f"Suspended due to report #{report.id}: {notes}"
            reported_user.save(update_fields=['is_active', 'verification_status', 'verification_notes'])

            AuditLogger.log(
                user=request.user,
                action='ACCOUNT_SUSPENSION',
                description=f"User {reported_user.full_name} suspended by {request.user.full_name} following report #{report.id}",
                target_type='User',
                target_id=str(reported_user.id),
                barangay=report.barangay
            )

        # Notify reporter
        NotificationService.send(
            user=report.reporter,
            title="Report Status Update",
            message=f"Your report regarding {report.get_report_type_display()} has been updated to '{report.get_status_display()}'.",
            notif_type='REPORT_STATUS_UPDATED',
            link="/reports"
        )

        AuditLogger.log(
            user=request.user,
            action='REPORT_RESOLUTION',
            description=f"Report #{report.id} updated to {new_status} by {request.user.full_name}",
            target_type='Report',
            target_id=str(report.id),
            barangay=report.barangay
        )

        return Response({
            'detail': f"Report #{report.id} marked as {new_status}.",
            'report': ReportSerializer(report).data
        })
