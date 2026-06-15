from django.contrib import admin
from .models import User, BlockedUser, PasswordResetOTP

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'barangay', 'verification_status', 'is_active', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('role', 'verification_status', 'barangay', 'is_active')

@admin.register(BlockedUser)
class BlockedUserAdmin(admin.ModelAdmin):
    list_display = ('blocker', 'blocked', 'created_at')

@admin.register(PasswordResetOTP)
class PasswordResetOTPAdmin(admin.ModelAdmin):
    list_display = ('email', 'otp', 'is_used', 'created_at')
    search_fields = ('email', 'otp')
    list_filter = ('is_used',)
