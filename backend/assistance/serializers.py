from rest_framework import serializers
from assistance.models import AssistanceRequest, AssistanceInvitation, AssistanceTransaction
from skills.serializers import AssistanceCategorySerializer, SkillSerializer
from accounts.serializers import UserSerializer

class AssistanceRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.ReadOnlyField(source='requester.full_name')
    requester_avatar = serializers.ReadOnlyField(source='requester.avatar_url')
    requester_rating = serializers.ReadOnlyField(source='requester.rating_average')
    category_name = serializers.ReadOnlyField(source='category.name')
    required_skill_name = serializers.ReadOnlyField(source='required_skill.name')
    assigned_helper_name = serializers.ReadOnlyField(source='assigned_helper.full_name')
    assigned_helper_avatar = serializers.ReadOnlyField(source='assigned_helper.avatar_url')
    assigned_helper_rating = serializers.ReadOnlyField(source='assigned_helper.rating_average')
    invitation_status = serializers.SerializerMethodField()
    has_rating = serializers.SerializerMethodField()

    class Meta:
        model = AssistanceRequest
        fields = [
            'id', 'barangay', 'requester', 'requester_name', 'requester_avatar',
            'requester_rating', 'title', 'description', 'category', 'category_name',
            'required_skill', 'required_skill_name', 'preferred_date',
            'preferred_time', 'zone', 'urgency', 'status', 'assigned_helper',
            'assigned_helper_name', 'assigned_helper_avatar', 'assigned_helper_rating',
            'additional_notes', 'attachment_url', 'invitation_status', 'has_rating',
            'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'barangay', 'requester', 'status', 'assigned_helper',
            'created_at', 'updated_at', 'completed_at'
        ]

    def get_invitation_status(self, obj):
        # If user is viewing, return their specific invitation status if helper
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            inv = obj.invitations.filter(helper=request.user).first()
            return inv.status if inv else None
        return None

    def get_has_rating(self, obj):
        return hasattr(obj, 'rating')


class AssistanceRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssistanceRequest
        fields = [
            'title', 'description', 'category', 'required_skill',
            'preferred_date', 'preferred_time', 'zone', 'urgency',
            'additional_notes', 'attachment_url'
        ]

    def validate(self, attrs):
        user = self.context['request'].user
        if user.role == 'RESIDENT' and user.verification_status != 'VERIFIED':
            raise serializers.ValidationError("Only verified residents can post assistance requests.")
        return attrs


class AssistanceInvitationSerializer(serializers.ModelSerializer):
    request_title = serializers.ReadOnlyField(source='request.title')
    request_zone = serializers.ReadOnlyField(source='request.zone')
    requester_name = serializers.ReadOnlyField(source='request.requester.full_name')
    requester_avatar = serializers.ReadOnlyField(source='request.requester.avatar_url')
    helper_name = serializers.ReadOnlyField(source='helper.full_name')
    helper_avatar = serializers.ReadOnlyField(source='helper.avatar_url')
    category_name = serializers.ReadOnlyField(source='request.category.name')
    preferred_date = serializers.ReadOnlyField(source='request.preferred_date')

    class Meta:
        model = AssistanceInvitation
        fields = [
            'id', 'request', 'request_title', 'request_zone', 'category_name',
            'preferred_date', 'requester_name', 'requester_avatar', 'helper',
            'helper_name', 'helper_avatar', 'status', 'message', 'decline_reason',
            'created_at', 'responded_at'
        ]
        read_only_fields = ['id', 'status', 'created_at', 'responded_at']


class AssistanceTransactionSerializer(serializers.ModelSerializer):
    request_title = serializers.ReadOnlyField(source='request.title')
    requester_name = serializers.ReadOnlyField(source='requester.full_name')
    helper_name = serializers.ReadOnlyField(source='helper.full_name')

    class Meta:
        model = AssistanceTransaction
        fields = [
            'id', 'request', 'request_title', 'barangay', 'requester',
            'requester_name', 'helper', 'helper_name', 'started_at',
            'completed_at', 'cancelled_at', 'cancellation_reason', 'notes',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
