from django.contrib import admin
from .models import AssistanceCategory, Skill, UserSkill, UserAvailability

@admin.register(AssistanceCategory)
class AssistanceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'barangay', 'icon', 'is_active', 'created_at')
    search_fields = ('name',)
    list_filter = ('is_active', 'barangay')

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'barangay', 'is_active', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('category', 'is_active', 'barangay')

@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ('user', 'skill', 'proficiency', 'years_experience', 'created_at')
    search_fields = ('user__email', 'skill__name')
    list_filter = ('proficiency',)

@admin.register(UserAvailability)
class UserAvailabilityAdmin(admin.ModelAdmin):
    list_display = ('user', 'day_of_week', 'is_available', 'time_slot')
    search_fields = ('user__email',)
    list_filter = ('day_of_week', 'is_available', 'time_slot')
