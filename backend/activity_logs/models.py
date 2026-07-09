from django.db import models

class ActivityLog(models.Model):
    ACTION_CHOICES = (
        ('LOGIN', 'User Login'),
        ('LOGOUT', 'User Logout'),
        ('REGISTER', 'User Registration'),
        ('ACCOUNT_VERIFICATION', 'Account Verification'),
        ('ACCOUNT_SUSPENSION', 'Account Suspension'),
        ('REQUEST_CREATION', 'Request Creation'),
        ('REQUEST_ACCEPTANCE', 'Request Acceptance'),
        ('REQUEST_CANCELLATION', 'Request Cancellation'),
        ('REQUEST_COMPLETION', 'Request Completion'),
        ('RATING_SUBMISSION', 'Rating Submission'),
        ('REPORT_CREATION', 'Report Creation'),
        ('REPORT_RESOLUTION', 'Report Resolution'),
        ('ANNOUNCEMENT_POSTED', 'Announcement Posted'),
        ('ADMIN_ACTION', 'Administrative Action'),
    )

    user = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='activity_logs')
    barangay = models.ForeignKey('tenants.Barangay', on_delete=models.CASCADE, null=True, blank=True, related_name='activity_logs')
    action = models.CharField(max_length=40, choices=ACTION_CHOICES)
    description = models.TextField()
    target_type = models.CharField(max_length=50, blank=True, default='')
    target_id = models.CharField(max_length=50, blank=True, default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['barangay', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['action']),
        ]

    def __str__(self):
        actor = self.user.full_name if self.user else "System"
        return f"[{self.created_at.strftime('%Y-%m-%d %H:%M')}] {actor} - {self.action}"
