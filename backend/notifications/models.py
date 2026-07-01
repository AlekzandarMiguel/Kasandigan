from django.db import models

class Notification(models.Model):
    TYPE_CHOICES = (
        ('ACCOUNT_VERIFIED', 'Account Verified'),
        ('REQUEST_CREATED', 'Request Created'),
        ('INVITATION_RECEIVED', 'Invitation Received'),
        ('REQUEST_ACCEPTED', 'Request Accepted'),
        ('REQUEST_DECLINED', 'Request Declined'),
        ('ASSISTANCE_STARTED', 'Assistance Started'),
        ('ASSISTANCE_COMPLETED', 'Assistance Completed'),
        ('RATING_RECEIVED', 'Rating Received'),
        ('REPORT_STATUS_UPDATED', 'Report Status Updated'),
        ('ANNOUNCEMENT', 'Barangay Announcement'),
        ('RESOURCE_BORROWED', 'Resource Borrowed'),
        ('GENERAL', 'General Notice'),
    )

    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='notifications')
    barangay = models.ForeignKey('tenants.Barangay', on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='GENERAL')
    link = models.CharField(max_length=200, blank=True, default='')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"[{self.type}] to {self.user.email}: {self.title}"
