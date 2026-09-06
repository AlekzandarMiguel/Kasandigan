from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from resources.models import Resource, ResourceRequest
from resources.serializers import ResourceSerializer, ResourceRequestSerializer
from activity_logs.services import AuditLogger
from notifications.services import NotificationService

class ResourceViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        category_param = self.request.query_params.get('category')
        status_param = self.request.query_params.get('status')

        if user.role == 'PLATFORM_ADMIN':
            qs = Resource.objects.all()
        else:
            qs = Resource.objects.filter(barangay=user.barangay)

        if category_param:
            qs = qs.filter(category=category_param)
        if status_param:
            qs = qs.filter(status=status_param)

        return qs.select_related('owner', 'barangay')

    def perform_create(self, serializer):
        user = self.request.user
        res = serializer.save(
            owner=user,
            barangay=user.barangay,
            status='AVAILABLE'
        )

        AuditLogger.log(
            user=user,
            action='ADMIN_ACTION',
            description=f"Listed community resource '{res.name}' in {res.zone}",
            target_type='Resource',
            target_id=str(res.id),
            barangay=user.barangay
        )

    @action(detail=True, methods=['post'])
    def request_borrow(self, request, pk=None):
        resource = self.get_object()
        user = request.user

        if resource.owner == user:
            return Response({'detail': 'You cannot borrow your own resource.'}, status=status.HTTP_400_BAD_REQUEST)

        if resource.status != 'AVAILABLE':
            return Response({'detail': f"Resource is currently {resource.get_status_display().lower()}."}, status=status.HTTP_400_BAD_REQUEST)

        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        purpose = request.data.get('purpose', '')

        if not start_date or not end_date:
            return Response({'detail': 'Both start_date and end_date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        borrow_req = ResourceRequest.objects.create(
            resource=resource,
            borrower=user,
            start_date=start_date,
            end_date=end_date,
            purpose=purpose,
            status='PENDING'
        )

        resource.status = 'REQUESTED'
        resource.save(update_fields=['status'])

        # Notify resource owner
        NotificationService.send(
            user=resource.owner,
            title="Resource Borrow Request",
            message=f"{user.full_name} requested to borrow '{resource.name}' ({start_date} to {end_date}).",
            notif_type='RESOURCE_BORROWED',
            link='/resources'
        )

        return Response({
            'detail': 'Borrow request submitted to owner.',
            'request': ResourceRequestSerializer(borrow_req).data
        })


class ResourceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        tab = self.request.query_params.get('tab')

        if tab == 'borrowed_by_me':
            return ResourceRequest.objects.filter(borrower=user).order_by('-created_at')
        # Default: requests received for user's owned resources
        return ResourceRequest.objects.filter(resource__owner=user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        borrow_req = self.get_object()
        if borrow_req.resource.owner != request.user:
            return Response({'detail': 'Only the item owner can accept.'}, status=status.HTTP_403_FORBIDDEN)

        borrow_req.status = 'BORROWED'
        borrow_req.responded_at = timezone.now()
        borrow_req.save(update_fields=['status', 'responded_at'])

        borrow_req.resource.status = 'BORROWED'
        borrow_req.resource.save(update_fields=['status'])

        NotificationService.send(
            user=borrow_req.borrower,
            title="Borrow Request Approved!",
            message=f"{request.user.full_name} approved your request to borrow '{borrow_req.resource.name}'.",
            notif_type='RESOURCE_BORROWED',
            link='/resources'
        )

        return Response({'detail': 'Borrow request approved.', 'status': 'BORROWED'})

    @action(detail=True, methods=['post'])
    def mark_returned(self, request, pk=None):
        borrow_req = self.get_object()
        if borrow_req.resource.owner != request.user and borrow_req.borrower != request.user:
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        borrow_req.status = 'RETURNED'
        borrow_req.returned_at = timezone.now()
        borrow_req.save(update_fields=['status', 'returned_at'])

        borrow_req.resource.status = 'AVAILABLE'
        borrow_req.resource.save(update_fields=['status'])

        return Response({'detail': 'Resource marked as returned.', 'status': 'RETURNED'})
