from django.contrib import admin
from .models import Barangay

@admin.register(Barangay)
class BarangayAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'municipality_city', 'province', 'status', 'created_at')
    search_fields = ('name', 'code', 'municipality_city')
    list_filter = ('status', 'municipality_city', 'province')
