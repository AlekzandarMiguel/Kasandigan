from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from ratings.models import Rating
from ratings.serializers import RatingSerializer, RatingCreateSerializer
from activity_logs.services import AuditLogger
from notifications.services import NotificationService

class RatingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return RatingCreateSerializer
        return RatingSerializer

    def get_queryset(self):
        user = self.request.user
        helper_id = self.request.query_params.get('helper')
        request_id = self.request.query_params.get('request')

        if user.role == 'PLATFORM_ADMIN':
            qs = Rating.objects.all()
        else:
            qs = Rating.objects.filter(barangay=user.barangay)

        if helper_id:
            qs = qs.filter(helper_id=helper_id)
        if request_id:
            qs = qs.filter(request_id=request_id)

        return qs.select_related('requester', 'helper', 'request')

    def perform_create(self, serializer):
        rating_obj = serializer.save()

        NotificationService.send(
            user=rating_obj.helper,
            title=f"New {rating_obj.score}★ Rating Received!",
            message=f"{rating_obj.requester.full_name} gave you a {rating_obj.score}-star rating for '{rating_obj.request.title}'.",
            notif_type='RATING_RECEIVED',
            link=f"/requests/{rating_obj.request.id}"
        )

        AuditLogger.log(
            user=self.request.user,
            action='RATING_SUBMISSION',
            description=f"{self.request.user.full_name} submitted {rating_obj.score}★ for {rating_obj.helper.full_name}",
            target_type='Rating',
            target_id=str(rating_obj.id),
            barangay=rating_obj.barangay
        )
