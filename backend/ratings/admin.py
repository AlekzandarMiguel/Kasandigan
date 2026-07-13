from django.contrib import admin
from .models import Rating

@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('request', 'barangay', 'requester', 'helper', 'score', 'created_at')
    search_fields = ('requester__email', 'helper__email', 'review')
    list_filter = ('score', 'barangay')
