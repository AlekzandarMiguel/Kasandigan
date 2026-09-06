from django.utils import timezone
from django.db import models
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User, BlockedUser
from accounts.serializers import (
    UserSerializer, UserRegistrationSerializer, UserUpdateSerializer,
    VerificationActionSerializer, StaffCreationSerializer, BlockedUserSerializer
)
from kasandigan_core.permissions import IsPlatformAdmin, IsBarangayAdmin, IsBarangayStaffOrAdmin
from activity_logs.services import AuditLogger
from notifications.services import NotificationService

class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for instant login upon registration
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        AuditLogger.log(
            user=user,
            action='REGISTER',
            description=f"Resident '{user.full_name}' registered in Barangay '{user.barangay.name if user.barangay else 'N/A'}'",
            target_type='User',
            target_id=str(user.id),
            barangay=user.barangay
        )

        return Response({
            'user': user_data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'detail': 'Registration successful. Account is pending verification by barangay staff.'
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not old_password or not new_password:
            return Response({'detail': 'Both old and new passwords are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({'detail': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        AuditLogger.log(
            user=user,
            action='ADMIN_ACTION',
            description="User updated password",
            target_type='User',
            target_id=str(user.id)
        )

        return Response({'detail': 'Password changed successfully.'})


class ResidentDirectoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Allows Barangay Staff and Barangay Admin to browse and search residents in their barangay.
    Platform Admin can filter by barangay.
    """
    serializer_class = UserSerializer
    permission_classes = [IsBarangayStaffOrAdmin]

    def get_queryset(self):
        user = self.request.user
        queryset = User.objects.filter(role='RESIDENT')

        if user.role != 'PLATFORM_ADMIN':
            queryset = queryset.filter(barangay=user.barangay)
        else:
            b_id = self.request.query_params.get('barangay')
            if b_id:
                queryset = queryset.filter(barangay_id=b_id)

        # Filters
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(verification_status=status_param)

        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                models.Q(first_name__icontains=search_query) |
                models.Q(last_name__icontains=search_query) |
                models.Q(email__icontains=search_query) |
                models.Q(zone__icontains=search_query)
            )

        return queryset.order_by('-created_at')

    @action(detail=True, methods=['post'], permission_classes=[IsBarangayStaffOrAdmin])
    def verify(self, request, pk=None):
        resident = self.get_object()
        serializer = VerificationActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes', '')

        resident.verification_status = new_status
        resident.verification_notes = notes
        resident.verified_at = timezone.now()
        resident.verified_by = request.user
        resident.save(update_fields=['verification_status', 'verification_notes', 'verified_at', 'verified_by'])

        # Notify resident
        status_label = dict(User.VERIFICATION_STATUS_CHOICES).get(new_status, new_status)
        NotificationService.send(
            user=resident,
            title="Account Verification Status Updated",
            message=f"Your account status in Barangay {resident.barangay.name if resident.barangay else ''} has been updated to: {status_label}. {notes}".strip(),
            notif_type='ACCOUNT_VERIFIED' if new_status == 'VERIFIED' else 'GENERAL',
            link='/profile'
        )

        AuditLogger.log(
            user=request.user,
            action='ACCOUNT_VERIFICATION',
            description=f"Resident '{resident.full_name}' status changed to {new_status} by {request.user.full_name}. Notes: {notes}",
            target_type='User',
            target_id=str(resident.id),
            barangay=resident.barangay
        )

        return Response({
            'detail': f"Resident status updated to {new_status}.",
            'resident': UserSerializer(resident).data
        })


class StaffManagementViewSet(viewsets.ModelViewSet):
    """
    Allows Barangay Admin to manage staff accounts within their barangay.
    """
    serializer_class = UserSerializer
    permission_classes = [IsBarangayAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'PLATFORM_ADMIN':
            return User.objects.filter(role='BARANGAY_STAFF')
        return User.objects.filter(role='BARANGAY_STAFF', barangay=user.barangay)

    def create(self, request, *args, **kwargs):
        serializer = StaffCreationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        staff_user = serializer.save(barangay=request.user.barangay)

        AuditLogger.log(
            user=request.user,
            action='ADMIN_ACTION',
            description=f"Created staff account '{staff_user.email}' for Barangay '{request.user.barangay.name}'",
            target_type='User',
            target_id=str(staff_user.id),
            barangay=request.user.barangay
        )

        return Response(UserSerializer(staff_user).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        staff_member = self.get_object()
        staff_member.is_active = not staff_member.is_active
        staff_member.save(update_fields=['is_active'])
        state = "activated" if staff_member.is_active else "deactivated"
        return Response({'detail': f"Staff member {state}.", 'is_active': staff_member.is_active})


class BlockedUserViewSet(viewsets.ModelViewSet):
    serializer_class = BlockedUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BlockedUser.objects.filter(blocker=self.request.user)

    def perform_create(self, serializer):
        serializer.save(
            blocker=self.request.user,
            barangay=self.request.user.barangay
        )


class PlatformUsersViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Allows Platform Administrator to manage and monitor all users across all barangays.
    """
    serializer_class = UserSerializer
    permission_classes = [IsPlatformAdmin]
    queryset = User.objects.all().order_by('-created_at')

    def get_queryset(self):
        qs = super().get_queryset()
        barangay_id = self.request.query_params.get('barangay')
        role = self.request.query_params.get('role')
        search = self.request.query_params.get('search')

        if barangay_id:
            qs = qs.filter(barangay_id=barangay_id)
        if role:
            qs = qs.filter(role=role)
        if search:
            from django.db import models
            qs = qs.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(email__icontains=search)
            )
        return qs

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user_obj = self.get_object()
        user_obj.is_active = not user_obj.is_active
        user_obj.save(update_fields=['is_active'])

        AuditLogger.log(
            user=request.user,
            action='ACCOUNT_SUSPENSION' if not user_obj.is_active else 'ADMIN_ACTION',
            description=f"Platform Admin toggled active status for user {user_obj.email} to {user_obj.is_active}",
            target_type='User',
            target_id=str(user_obj.id)
        )

        return Response({
            'detail': f"User {'activated' if user_obj.is_active else 'suspended'}.",
            'is_active': user_obj.is_active
        })
