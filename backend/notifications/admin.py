from django.contrib import admin
from .models import Notification

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'type', 'is_read', 'barangay', 'created_at')
    search_fields = ('title', 'message', 'user__email')
    list_filter = ('type', 'is_read', 'barangay')
