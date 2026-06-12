from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from tenants.models import Barangay
from tenants.serializers import BarangaySerializer, BarangayDetailSerializer
from kasandigan_core.permissions import IsPlatformAdmin
from activity_logs.services import AuditLogger

class BarangayViewSet(viewsets.ModelViewSet):
    queryset = Barangay.objects.all().order_by('name')
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.action in ['retrieve', 'stats']:
            return BarangayDetailSerializer
        return BarangaySerializer

    def get_permissions(self):
        # Allow anyone to list active barangays (needed for registration form)
        if self.action in ['list', 'retrieve', 'active_list']:
            return [permissions.AllowAny()]
        return [IsPlatformAdmin()]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated or user.role != 'PLATFORM_ADMIN':
            return Barangay.objects.filter(status='ACTIVE')
        return Barangay.objects.all()

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def active_list(self, request):
        active = Barangay.objects.filter(status='ACTIVE').order_by('name')
        serializer = BarangaySerializer(active, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsPlatformAdmin])
    def toggle_status(self, request, id=None):
        barangay = self.get_object()
        new_status = 'SUSPENDED' if barangay.status == 'ACTIVE' else 'ACTIVE'
        barangay.status = new_status
        barangay.save(update_fields=['status', 'updated_at'])

        AuditLogger.log(
            user=request.user,
            action='ADMIN_ACTION',
            description=f"Barangay '{barangay.name}' status updated to {new_status}",
            target_type='Barangay',
            target_id=str(barangay.id),
            barangay=barangay
        )

        return Response({
            'detail': f"Barangay status updated to {new_status}",
            'status': new_status
        })

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def zones(self, request, id=None):
        barangay = self.get_object()
        return Response({'zones': barangay.zones or []})
