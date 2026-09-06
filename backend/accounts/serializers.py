from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from urllib.parse import urlparse
from accounts.models import User, BlockedUser
from tenants.models import Barangay
from tenants.serializers import BarangaySerializer

def validate_safe_url(value):
    if value:
        parsed = urlparse(value)
        if parsed.scheme not in ('http', 'https'):
            raise serializers.ValidationError("Only valid http:// or https:// URLs are allowed.")
    return value

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    barangay_details = BarangaySerializer(source='barangay', read_only=True)
    bayanihan_badges = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'mobile_number', 'role', 'barangay', 'barangay_details',
            'zone', 'bio', 'avatar_url', 'verification_status',
            'verification_notes', 'verified_at', 'assistance_radius',
            'id_document_url', 'id_document_type',
            'completed_assistance_count', 'rating_average', 'rating_count',
            'bayanihan_badges',
            'is_active', 'created_at'
        ]
        read_only_fields = [
            'role', 'verification_status', 'verification_notes',
            'verified_at', 'completed_assistance_count', 'rating_average',
            'rating_count', 'bayanihan_badges', 'is_active', 'created_at'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        current_user = getattr(request, 'user', None) if request else None

        # Data Privacy Act (RA 10173): Shield sensitive ID proof and mask mobile numbers
        is_self = current_user and current_user.is_authenticated and (current_user.id == instance.id)
        is_authorized_staff = current_user and current_user.is_authenticated and (
            current_user.role == 'PLATFORM_ADMIN' or
            (current_user.role in ['BARANGAY_STAFF', 'BARANGAY_ADMIN'] and current_user.barangay_id == instance.barangay_id)
        )

        if not (is_self or is_authorized_staff):
            data.pop('id_document_url', None)
            data.pop('id_document_type', None)

            raw_phone = data.get('mobile_number')
            if raw_phone and len(raw_phone) >= 7:
                data['mobile_number'] = raw_phone[:4] + '****' + raw_phone[-3:]

        return data

    def get_bayanihan_badges(self, obj):
        badges = []
        count = obj.completed_assistance_count or 0
        rating = float(obj.rating_average or 0)

        if count >= 1:
            badges.append({
                'id': 'starter',
                'name': 'Bayanihan Starter',
                'description': 'Completed first community assistance',
                'tier': 'BRONZE',
                'icon': 'Medal',
                'color': 'amber'
            })
        if count >= 5 and rating >= 4.0:
            badges.append({
                'id': 'pillar',
                'name': 'Community Pillar',
                'description': 'Completed 5+ assists with 4.0+ rating',
                'tier': 'SILVER',
                'icon': 'Award',
                'color': 'slate'
            })
        if count >= 10:
            badges.append({
                'id': 'champion',
                'name': 'Barangay Champion',
                'description': 'Completed 10+ verified community assists',
                'tier': 'GOLD',
                'icon': 'Trophy',
                'color': 'yellow'
            })
        try:
            if obj.helping_requests.filter(urgency='EMERGENCY', status='COMPLETED').exists():
                badges.append({
                    'id': 'hero',
                    'name': 'Emergency Responder',
                    'description': 'Volunteered and resolved an urgent priority ticket',
                    'tier': 'RUBY',
                    'icon': 'ShieldAlert',
                    'color': 'rose'
                })
        except Exception:
            pass
        return badges


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    id_document_url = serializers.CharField(required=False, allow_blank=True, validators=[validate_safe_url])
    barangay_id = serializers.PrimaryKeyRelatedField(
        queryset=Barangay.objects.filter(status='ACTIVE'),
        source='barangay',
        write_only=True,
        required=True
    )

    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'first_name',
            'last_name', 'mobile_number', 'barangay_id', 'zone',
            'id_document_url', 'id_document_type'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(
            role='RESIDENT',
            verification_status='PENDING_VERIFICATION',
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user


class StaffCreationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'mobile_number']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(
            role='BARANGAY_STAFF',
            verification_status='VERIFIED',
            **validated_data
        )
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    id_document_url = serializers.CharField(required=False, allow_blank=True, validators=[validate_safe_url])

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'mobile_number', 'zone',
            'bio', 'avatar_url', 'assistance_radius',
            'id_document_url', 'id_document_type'
        ]


class VerificationActionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['VERIFIED', 'REJECTED', 'SUSPENDED'])
    notes = serializers.CharField(required=False, allow_blank=True, default='')


class BlockedUserSerializer(serializers.ModelSerializer):
    blocked_user_name = serializers.ReadOnlyField(source='blocked.full_name')
    blocked_user_email = serializers.ReadOnlyField(source='blocked.email')

    class Meta:
        model = BlockedUser
        fields = ['id', 'blocked', 'blocked_user_name', 'blocked_user_email', 'reason', 'created_at']
        read_only_fields = ['id', 'created_at']
