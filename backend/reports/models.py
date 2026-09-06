from django.db import models

class Report(models.Model):
    REPORT_TYPE_CHOICES = (
        ('INAPPROPRIATE_BEHAVIOR', 'Inappropriate Behavior'),
        ('SPAM', 'Spam / Misleading Information'),
        ('FRAUDULENT_ACTIVITY', 'Fraudulent Activity'),
        ('MISUSE_OF_PLATFORM', 'Misuse of Platform'),
        ('HARASSMENT', 'Harassment or Threats'),
        ('OTHER', 'Other Issue'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('UNDER_REVIEW', 'Under Review'),
        ('RESOLVED', 'Resolved'),
        ('DISMISSED', 'Dismissed'),
    )

    barangay = models.ForeignKey('tenants.Barangay', on_delete=models.CASCADE, related_name='reports')
    reporter = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='filed_reports')
    reported_user = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports_against'
    )
    reported_request = models.ForeignKey(
        'assistance.AssistanceRequest',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reports'
    )
    report_type = models.CharField(max_length=30, choices=REPORT_TYPE_CHOICES)
    description = models.TextField()
    evidence_url = models.CharField(max_length=255, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    moderation_notes = models.TextField(blank=True, default='')
    resolved_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='moderated_reports'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['barangay', 'status']),
            models.Index(fields=['reported_user']),
            models.Index(fields=['reporter']),
        ]

    def __str__(self):
        return f"Report #{self.id}: {self.get_report_type_display()} [{self.status}]"
