from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from skills.models import AssistanceCategory, Skill, UserSkill, UserAvailability
from skills.serializers import (
    AssistanceCategorySerializer, SkillSerializer,
    UserSkillSerializer, UserAvailabilitySerializer
)
from kasandigan_core.permissions import IsBarangayAdmin, IsPlatformAdmin

class AssistanceCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = AssistanceCategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsBarangayAdmin()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return AssistanceCategory.objects.none()

        # Categories include global (barangay is null) and tenant-specific
        if user.role == 'PLATFORM_ADMIN':
            return AssistanceCategory.objects.all()
        return AssistanceCategory.objects.filter(
            Q(barangay__isnull=True) | Q(barangay=user.barangay),
            is_active=True
        )

    def perform_create(self, serializer):
        user = self.request.user
        # Barangay Admin creates categories for their barangay
        b = user.barangay if user.role != 'PLATFORM_ADMIN' else None
        serializer.save(barangay=b)


class SkillViewSet(viewsets.ModelViewSet):
    serializer_class = SkillSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsBarangayAdmin()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Skill.objects.none()

        category_id = self.request.query_params.get('category')
        qs = Skill.objects.filter(is_active=True)

        if user.role != 'PLATFORM_ADMIN':
            qs = qs.filter(Q(barangay__isnull=True) | Q(barangay=user.barangay))

        if category_id:
            qs = qs.filter(category_id=category_id)

        return qs.order_by('name')

    def perform_create(self, serializer):
        user = self.request.user
        b = user.barangay if user.role != 'PLATFORM_ADMIN' else None
        serializer.save(barangay=b)


class UserSkillViewSet(viewsets.ModelViewSet):
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserSkill.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserAvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = UserAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserAvailability.objects.filter(user=self.request.user).order_by('day_of_week')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def bulk_save(self, request):
        """
        Allows bulk updating all 7 days of availability in one call from the UI.
        """
        schedule_data = request.data.get('schedule', [])
        user = request.user

        # Replace existing availabilities
        UserAvailability.objects.filter(user=user).delete()
        created_objects = []

        for item in schedule_data:
            day = item.get('day_of_week')
            is_avail = item.get('is_available', True)
            slot = item.get('time_slot', 'ALL_DAY')
            if day is not None:
                obj = UserAvailability.objects.create(
                    user=user,
                    day_of_week=day,
                    is_available=is_avail,
                    time_slot=slot
                )
                created_objects.append(obj)

        serializer = UserAvailabilitySerializer(created_objects, many=True)
        return Response({'detail': 'Availability updated successfully.', 'schedule': serializer.data})
