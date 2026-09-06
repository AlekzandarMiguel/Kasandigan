from rest_framework import serializers
from skills.models import AssistanceCategory, Skill, UserSkill, UserAvailability

class AssistanceCategorySerializer(serializers.ModelSerializer):
    skills_count = serializers.SerializerMethodField()

    class Meta:
        model = AssistanceCategory
        fields = ['id', 'barangay', 'name', 'description', 'icon', 'is_active', 'skills_count', 'created_at']
        read_only_fields = ['id', 'created_at', 'skills_count']

    def get_skills_count(self, obj):
        return obj.skills.filter(is_active=True).count()


class SkillSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Skill
        fields = ['id', 'barangay', 'category', 'category_name', 'name', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.ReadOnlyField(source='skill.name')
    category_name = serializers.ReadOnlyField(source='skill.category.name')
    category_id = serializers.ReadOnlyField(source='skill.category.id')

    class Meta:
        model = UserSkill
        fields = [
            'id', 'skill', 'skill_name', 'category_id', 'category_name',
            'proficiency', 'years_experience', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserAvailabilitySerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    slot_name = serializers.CharField(source='get_time_slot_display', read_only=True)

    class Meta:
        model = UserAvailability
        fields = [
            'id', 'day_of_week', 'day_name', 'is_available',
            'time_slot', 'slot_name', 'custom_start_time', 'custom_end_time'
        ]
        read_only_fields = ['id']
