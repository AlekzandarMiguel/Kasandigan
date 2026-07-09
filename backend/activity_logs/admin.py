from django.contrib import admin
from .models import ActivityLog

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'user', 'barangay', 'description', 'created_at')
    search_fields = ('action', 'description', 'user__email')
    list_filter = ('action', 'barangay')
