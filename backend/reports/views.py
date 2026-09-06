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

    @action(detail=False, methods=['get'], url_path='dilg-summary', permission_classes=[IsBarangayStaffOrAdmin])
    def dilg_summary(self, request):
        from datetime import datetime
        from assistance.models import AssistanceRequest
        from accounts.models import User
        from skills.models import AssistanceCategory
        from tenants.models import Barangay

        user = request.user
        brgy = user.barangay
        if user.role == 'PLATFORM_ADMIN' or not brgy:
            b_id = request.query_params.get('barangay')
            brgy = Barangay.objects.filter(id=b_id).first() if b_id else Barangay.objects.first()

        now = timezone.now()
        try:
            month = int(request.query_params.get('month', now.month))
            year = int(request.query_params.get('year', now.year))
        except (ValueError, TypeError):
            month = now.month
            year = now.year

        reqs = AssistanceRequest.objects.filter(
            barangay=brgy,
            created_at__year=year,
            created_at__month=month
        )

        total_requests = reqs.count()
        completed_requests = reqs.filter(status='COMPLETED').count()
        emergency_requests = reqs.filter(urgency='EMERGENCY').count()
        in_progress = reqs.filter(status__in=['ACCEPTED', 'IN_PROGRESS']).count()

        category_breakdown = []
        for cat in AssistanceCategory.objects.all():
            c_count = reqs.filter(category=cat).count()
            c_comp = reqs.filter(category=cat, status='COMPLETED').count()
            if c_count > 0:
                category_breakdown.append({
                    'category_name': cat.name,
                    'total_filed': c_count,
                    'total_completed': c_comp,
                    'completion_rate': round((c_comp / c_count * 100), 1) if c_count > 0 else 0
                })

        # Zone equity breakdown
        zone_counts = {}
        for r in reqs:
            z = r.zone or 'Unassigned'
            zone_counts[z] = zone_counts.get(z, 0) + 1
        zone_breakdown = [{'zone': k, 'count': v} for k, v in sorted(zone_counts.items())]

        active_helpers = reqs.filter(assigned_helper__isnull=False).values('assigned_helper').distinct().count()
        total_registered_residents = User.objects.filter(barangay=brgy, role='RESIDENT').count()
        disputes_count = Report.objects.filter(barangay=brgy, created_at__year=year, created_at__month=month).count()

        try:
            month_name = datetime(year, month, 1).strftime('%B %Y')
        except Exception:
            month_name = f"{month}/{year}"

        return Response({
            'barangay': {
                'id': brgy.id if brgy else None,
                'name': brgy.name if brgy else 'Barangay Unit',
                'code': brgy.code if brgy else 'BRGY-001',
                'city': brgy.city if brgy else 'Metropolitan City',
                'province': brgy.province if brgy else 'Philippines',
            },
            'reporting_period': month_name,
            'month': month,
            'year': year,
            'generated_at': now.strftime('%B %d, %Y %I:%M %p'),
            'generated_by': user.full_name,
            'executive_summary': {
                'total_requests': total_requests,
                'completed_requests': completed_requests,
                'completion_rate': round((completed_requests / total_requests * 100), 1) if total_requests > 0 else 100.0,
                'emergency_requests': emergency_requests,
                'in_progress_requests': in_progress,
                'active_volunteer_helpers': active_helpers,
                'total_registered_residents': total_registered_residents,
                'disputes_reported': disputes_count,
            },
            'category_breakdown': category_breakdown,
            'zone_breakdown': zone_breakdown,
            'compliance_statement': f"Certified correct and generated in accordance with DILG Barangay Community Aid and Volunteer Standards."
        })

