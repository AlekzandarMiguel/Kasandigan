from django.contrib import admin
from .models import Announcement

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'barangay', 'author', 'priority', 'alert_level', 'is_pinned', 'is_active', 'is_emergency_broadcast', 'created_at')
    search_fields = ('title', 'content', 'author__email')
    list_filter = ('priority', 'alert_level', 'is_pinned', 'is_active', 'is_emergency_broadcast', 'barangay')
