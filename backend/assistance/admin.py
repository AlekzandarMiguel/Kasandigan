from django.contrib import admin
from .models import AssistanceRequest, AssistanceInvitation, AssistanceTransaction, TicketMessage

@admin.register(AssistanceRequest)
class AssistanceRequestAdmin(admin.ModelAdmin):
    list_display = ('title', 'barangay', 'requester', 'assigned_helper', 'urgency', 'status', 'preferred_date', 'created_at')
    search_fields = ('title', 'description', 'requester__email', 'assigned_helper__email')
    list_filter = ('status', 'urgency', 'barangay')

@admin.register(AssistanceInvitation)
class AssistanceInvitationAdmin(admin.ModelAdmin):
    list_display = ('request', 'helper', 'status', 'created_at')
    list_filter = ('status',)

@admin.register(AssistanceTransaction)
class AssistanceTransactionAdmin(admin.ModelAdmin):
    list_display = ('request', 'barangay', 'requester', 'helper', 'started_at', 'completed_at', 'created_at')
    list_filter = ('barangay',)

@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ('request', 'sender', 'created_at')
    search_fields = ('message', 'sender__email')
