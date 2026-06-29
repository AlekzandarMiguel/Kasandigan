from django.contrib import admin
from .models import Resource, ResourceRequest

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'barangay', 'owner', 'status', 'condition', 'created_at')
    search_fields = ('name', 'description', 'owner__email')
    list_filter = ('status', 'category', 'condition', 'barangay')

@admin.register(ResourceRequest)
class ResourceRequestAdmin(admin.ModelAdmin):
    list_display = ('resource', 'borrower', 'status', 'start_date', 'end_date', 'created_at')
    search_fields = ('resource__name', 'borrower__email')
    list_filter = ('status',)
