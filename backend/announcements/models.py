from django.db import models

class Announcement(models.Model):
    PRIORITY_CHOICES = (
        ('NORMAL', 'Normal Notice'),
        ('IMPORTANT', 'Important Notice'),
        ('EMERGENCY', 'Emergency Advisory'),
    )

    barangay = models.ForeignKey('tenants.Barangay', on_delete=models.CASCADE, related_name='announcements', null=True, blank=True)
    author = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='authored_announcements')
    title = models.CharField(max_length=200)
    content = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='NORMAL')
    is_pinned = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_emergency_broadcast = models.BooleanField(default=False)
    alert_level = models.CharField(max_length=20, default='ADVISORY', choices=[
        ('ADVISORY', 'Advisory'),
        ('WATCH', 'Watch / Alert'),
        ('WARNING', 'Warning / Red Alert')
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'announcements'
        ordering = ['-is_pinned', '-created_at']
        indexes = [
            models.Index(fields=['barangay', 'is_active']),
            models.Index(fields=['priority']),
        ]

    def __str__(self):
        return f"[{self.priority}] {self.title} ({self.barangay.name})"
