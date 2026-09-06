from rest_framework import serializers
from urllib.parse import urlparse
from django.utils.html import strip_tags
from assistance.models import AssistanceRequest, AssistanceInvitation, AssistanceTransaction, TicketMessage
from skills.serializers import AssistanceCategorySerializer, SkillSerializer
from accounts.serializers import UserSerializer
from resources.models import Resource

def validate_safe_url(value):
    if value:
        parsed = urlparse(value)
        if parsed.scheme not in ('http', 'https'):
            raise serializers.ValidationError("Only valid http:// or https:// URLs are allowed.")
    return value

class AssistanceRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.ReadOnlyField(source='requester.full_name')
    requester_avatar = serializers.ReadOnlyField(source='requester.avatar_url')
    requester_rating = serializers.ReadOnlyField(source='requester.rating_average')
    category_name = serializers.ReadOnlyField(source='category.name')
    required_skill_name = serializers.ReadOnlyField(source='required_skill.name')
    assigned_helper_name = serializers.ReadOnlyField(source='assigned_helper.full_name')
    assigned_helper_avatar = serializers.ReadOnlyField(source='assigned_helper.avatar_url')
    assigned_helper_rating = serializers.ReadOnlyField(source='assigned_helper.rating_average')
    linked_resource_name = serializers.ReadOnlyField(source='linked_resource.name')
    linked_resource_category = serializers.ReadOnlyField(source='linked_resource.category')
    reschedule_proposed_by_name = serializers.ReadOnlyField(source='reschedule_proposed_by.full_name')
    invitation_status = serializers.SerializerMethodField()
    has_rating = serializers.SerializerMethodField()

    class Meta:
        model = AssistanceRequest
        fields = [
            'id', 'barangay', 'requester', 'requester_name', 'requester_avatar',
            'requester_rating', 'title', 'description', 'category', 'category_name',
            'required_skill', 'required_skill_name', 'preferred_date',
            'preferred_time', 'zone', 'urgency', 'status', 'helpers_needed',
            'assigned_helper', 'assigned_helper_name', 'assigned_helper_avatar', 'assigned_helper_rating',
            'additional_notes', 'attachment_url', 'invitation_status', 'has_rating',
            'completion_proof_url', 'completion_notes',
            'linked_resource', 'linked_resource_name', 'linked_resource_category',
            'reschedule_proposed_date', 'reschedule_proposed_time',
            'reschedule_proposed_by', 'reschedule_proposed_by_name', 'reschedule_reason',
            'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = [
            'id', 'barangay', 'requester', 'status', 'assigned_helper',
            'completion_proof_url', 'completion_notes',
            'linked_resource', 'reschedule_proposed_date', 'reschedule_proposed_time',
            'reschedule_proposed_by', 'reschedule_reason',
            'created_at', 'updated_at', 'completed_at'
        ]

    def get_invitation_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            inv = obj.invitations.filter(helper=request.user).first()
            return inv.status if inv else None
        return None

    def get_has_rating(self, obj):
        return hasattr(obj, 'rating')


class AssistanceRequestCreateSerializer(serializers.ModelSerializer):
    auto_dispatch = serializers.BooleanField(write_only=True, required=False, default=False)
    attachment_url = serializers.CharField(required=False, allow_blank=True, validators=[validate_safe_url])

    class Meta:
        model = AssistanceRequest
        fields = [
            'id', 'title', 'description', 'category', 'required_skill',
            'preferred_date', 'preferred_time', 'zone', 'urgency',
            'helpers_needed', 'additional_notes', 'attachment_url', 'auto_dispatch'
        ]
        read_only_fields = ['id']

    def validate_title(self, value):
        clean = strip_tags(value).strip() if value else ''
        if not clean:
            raise serializers.ValidationError("Title cannot be empty.")
        return clean

    def validate_description(self, value):
        clean = strip_tags(value).strip() if value else ''
        if not clean:
            raise serializers.ValidationError("Description cannot be empty.")
        return clean

    def validate_additional_notes(self, value):
        return strip_tags(value).strip() if value else ''

    def validate(self, attrs):
        user = self.context['request'].user
        if user.role == 'RESIDENT' and user.verification_status != 'VERIFIED':
            raise serializers.ValidationError("Only verified residents can post assistance requests.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('auto_dispatch', None)
        return super().create(validated_data)


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


class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.full_name')
    sender_avatar = serializers.ReadOnlyField(source='sender.avatar_url')
    sender_role = serializers.ReadOnlyField(source='sender.role')

    class Meta:
        model = TicketMessage
        fields = [
            'id', 'request', 'sender', 'sender_name', 'sender_avatar',
            'sender_role', 'message', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'request', 'sender', 'created_at']

    def validate_message(self, value):
        clean = strip_tags(value).strip() if value else ''
        if not clean:
            raise serializers.ValidationError("Message content cannot be empty.")
        return clean
