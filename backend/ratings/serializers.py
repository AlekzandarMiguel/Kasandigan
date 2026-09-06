from rest_framework import serializers
from ratings.models import Rating
from assistance.models import AssistanceRequest

class RatingSerializer(serializers.ModelSerializer):
    requester_name = serializers.ReadOnlyField(source='requester.full_name')
    requester_avatar = serializers.ReadOnlyField(source='requester.avatar_url')
    helper_name = serializers.ReadOnlyField(source='helper.full_name')
    request_title = serializers.ReadOnlyField(source='request.title')

    class Meta:
        model = Rating
        fields = [
            'id', 'request', 'request_title', 'score', 'review',
            'requester', 'requester_name', 'requester_avatar',
            'helper', 'helper_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'requester', 'helper', 'barangay']


class RatingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['request', 'score', 'review']

    def validate_request(self, value):
        user = self.context['request'].user
        if value.requester != user:
            raise serializers.ValidationError("Only the requester can submit a rating.")
        if value.status != 'COMPLETED':
            raise serializers.ValidationError("Ratings can only be submitted for completed assistance.")
        if hasattr(value, 'rating'):
            raise serializers.ValidationError("A rating has already been submitted for this request.")
        if not value.assigned_helper:
            raise serializers.ValidationError("No helper was assigned to this request.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        req_obj = validated_data['request']
        return Rating.objects.create(
            request=req_obj,
            barangay=req_obj.barangay,
            requester=user,
            helper=req_obj.assigned_helper,
            score=validated_data['score'],
            review=validated_data.get('review', '')
        )
