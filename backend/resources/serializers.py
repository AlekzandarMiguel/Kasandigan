from rest_framework import serializers
from resources.models import Resource, ResourceRequest

class ResourceSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source='owner.full_name')
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    condition_display = serializers.CharField(source='get_condition_display', read_only=True)

    class Meta:
        model = Resource
        fields = [
            'id', 'barangay', 'owner', 'owner_name', 'name',
            'category', 'category_display', 'description',
            'condition', 'condition_display', 'zone', 'status',
            'status_display', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'barangay', 'owner', 'created_at', 'updated_at']


class ResourceRequestSerializer(serializers.ModelSerializer):
    resource_name = serializers.ReadOnlyField(source='resource.name')
    resource_zone = serializers.ReadOnlyField(source='resource.zone')
    owner_id = serializers.ReadOnlyField(source='resource.owner.id')
    owner_name = serializers.ReadOnlyField(source='resource.owner.full_name')
    borrower_name = serializers.ReadOnlyField(source='borrower.full_name')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ResourceRequest
        fields = [
            'id', 'resource', 'resource_name', 'resource_zone',
            'owner_id', 'owner_name', 'borrower', 'borrower_name',
            'start_date', 'end_date', 'purpose', 'status', 'status_display',
            'created_at', 'responded_at', 'returned_at'
        ]
        read_only_fields = ['id', 'borrower', 'status', 'created_at', 'responded_at', 'returned_at']
