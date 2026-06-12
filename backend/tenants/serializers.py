from rest_framework import serializers
from tenants.models import Barangay
from accounts.models import User
from assistance.models import AssistanceRequest

class BarangaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Barangay
        fields = [
            'id', 'name', 'code', 'municipality_city', 'province',
            'region', 'contact_number', 'email', 'status', 'zones',
            'created_at', 'updated_at'
        ]


class BarangayDetailSerializer(serializers.ModelSerializer):
    total_residents = serializers.SerializerMethodField()
    verified_residents = serializers.SerializerMethodField()
    total_requests = serializers.SerializerMethodField()
    completed_requests = serializers.SerializerMethodField()

    class Meta:
        model = Barangay
        fields = [
            'id', 'name', 'code', 'municipality_city', 'province',
            'region', 'contact_number', 'email', 'status', 'zones',
            'total_residents', 'verified_residents', 'total_requests',
            'completed_requests', 'created_at', 'updated_at'
        ]

    def get_total_residents(self, obj):
        return User.objects.filter(barangay=obj, role='RESIDENT').count()

    def get_verified_residents(self, obj):
        return User.objects.filter(barangay=obj, role='RESIDENT', verification_status='VERIFIED').count()

    def get_total_requests(self, obj):
        return AssistanceRequest.objects.filter(barangay=obj).count()

    def get_completed_requests(self, obj):
        return AssistanceRequest.objects.filter(barangay=obj, status='COMPLETED').count()
