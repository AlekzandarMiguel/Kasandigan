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
                'city': brgy.municipality_city if brgy else 'Maramag',
                'province': brgy.province if brgy else 'Bukidnon',
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

    @action(detail=False, methods=['get'], url_path='municipal-dilg-summary', permission_classes=[permissions.IsAuthenticated])
    def municipal_dilg_summary(self, request):
        from datetime import datetime
        from assistance.models import AssistanceRequest
        from accounts.models import User
        from skills.models import AssistanceCategory
        from tenants.models import Barangay
        from ratings.models import Rating
        from resources.models import Resource

        now = timezone.now()
        try:
            month = int(request.query_params.get('month', now.month))
            year = int(request.query_params.get('year', now.year))
        except (ValueError, TypeError):
            month = now.month
            year = now.year

        barangays = list(Barangay.objects.all().order_by('name'))
        b_ids = [b.id for b in barangays]

        all_reqs = AssistanceRequest.objects.filter(
            barangay_id__in=b_ids,
            created_at__year=year,
            created_at__month=month
        )

        total_requests = all_reqs.count()
        completed_requests = all_reqs.filter(status='COMPLETED').count()
        emergency_requests = all_reqs.filter(urgency='EMERGENCY').count()
        in_progress = all_reqs.filter(status__in=['ACCEPTED', 'IN_PROGRESS', 'EN_ROUTE']).count()

        # 20 Barangays Comparative Breakdown
        barangay_breakdown = []
        for b in barangays:
            b_reqs = all_reqs.filter(barangay=b)
            b_total = b_reqs.count()
            b_comp = b_reqs.filter(status='COMPLETED').count()
            b_rate = round((b_comp / b_total * 100), 1) if b_total > 0 else 100.0
            b_helpers = b_reqs.filter(assigned_helper__isnull=False).values('assigned_helper').distinct().count()
            b_residents = User.objects.filter(barangay=b, role='RESIDENT').count()
            b_ratings = Rating.objects.filter(barangay=b)
            b_avg_score = round(sum(r.score for r in b_ratings) / b_ratings.count(), 2) if b_ratings.exists() else 5.0

            barangay_breakdown.append({
                'id': b.id,
                'name': b.name,
                'code': b.code,
                'total_requests': b_total,
                'completed_requests': b_comp,
                'completion_rate': b_rate,
                'active_helpers': b_helpers,
                'registered_residents': b_residents,
                'average_rating': b_avg_score
            })

        # Sort by total requests then completion rate
        barangay_breakdown.sort(key=lambda x: (x['total_requests'], x['completion_rate']), reverse=True)

        # Municipality-wide category breakdown
        category_breakdown = []
        for cat in AssistanceCategory.objects.all():
            c_count = all_reqs.filter(category=cat).count()
            c_comp = all_reqs.filter(category=cat, status='COMPLETED').count()
            if c_count > 0:
                category_breakdown.append({
                    'category_name': cat.name,
                    'total_filed': c_count,
                    'total_completed': c_comp,
                    'completion_rate': round((c_comp / c_count * 100), 1) if c_count > 0 else 0
                })

        total_registered_residents = User.objects.filter(barangay_id__in=b_ids, role='RESIDENT').count()
        total_active_helpers = all_reqs.filter(assigned_helper__isnull=False).values('assigned_helper').distinct().count()
        total_shared_resources = Resource.objects.filter(barangay_id__in=b_ids).count()
        total_disputes = Report.objects.filter(barangay_id__in=b_ids, created_at__year=year, created_at__month=month).count()

        try:
            month_name = datetime(year, month, 1).strftime('%B %Y')
        except Exception:
            month_name = f"{month}/{year}"

        return Response({
            'lgu': {
                'municipality': 'Maramag',
                'province': 'Bukidnon',
                'region': 'Region X - Northern Mindanao',
                'total_barangays_count': len(barangays),
            },
            'reporting_period': month_name,
            'month': month,
            'year': year,
            'generated_at': now.strftime('%B %d, %Y %I:%M %p'),
            'generated_by': request.user.full_name,
            'executive_summary': {
                'total_requests': total_requests,
                'completed_requests': completed_requests,
                'completion_rate': round((completed_requests / total_requests * 100), 1) if total_requests > 0 else 100.0,
                'emergency_requests': emergency_requests,
                'in_progress_requests': in_progress,
                'active_volunteer_helpers': total_active_helpers,
                'total_registered_residents': total_registered_residents,
                'total_shared_resources': total_shared_resources,
                'total_disputes_reported': total_disputes,
            },
            'barangay_breakdown': barangay_breakdown,
            'category_breakdown': category_breakdown,
            'compliance_statement': "Certified consolidated municipal report for submission to the Sangguniang Bayan of Maramag and DILG Bukidnon Provincial Operations Office."
        })

    @action(detail=False, methods=['get'], url_path='municipal-overview', permission_classes=[permissions.IsAuthenticated])
    def municipal_overview(self, request):
        from tenants.models import Barangay
        from assistance.models import AssistanceRequest
        from accounts.models import User
        from resources.models import Resource

        barangays = Barangay.objects.all().order_by('name')
        grid = []
        for b in barangays:
            active_reqs = AssistanceRequest.objects.filter(
                barangay=b,
                status__in=['OPEN', 'MATCHED', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS']
            ).count()
            comp_reqs = AssistanceRequest.objects.filter(barangay=b, status='COMPLETED').count()
            residents_count = User.objects.filter(barangay=b, role='RESIDENT').count()
            resources_count = Resource.objects.filter(barangay=b).count()

            grid.append({
                'id': b.id,
                'name': b.name,
                'code': b.code,
                'contact_number': b.contact_number,
                'email': b.email,
                'status': b.status,
                'zones_count': len(b.zones) if isinstance(b.zones, list) else 0,
                'active_requests': active_reqs,
                'completed_requests': comp_reqs,
                'residents_count': residents_count,
                'resources_count': resources_count
            })

        return Response({
            'municipality': 'Maramag',
            'province': 'Bukidnon',
            'barangays_count': len(grid),
            'grid': grid
        })

