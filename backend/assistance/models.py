from django.db import models

class AssistanceRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('MATCHED', 'Matched'),
        ('ACCEPTED', 'Accepted'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    )

    URGENCY_CHOICES = (
        ('LOW', 'Low Urgency'),
        ('MEDIUM', 'Medium Urgency'),
        ('HIGH', 'High Urgency'),
        ('EMERGENCY', 'Urgent / Priority'),
    )

    barangay = models.ForeignKey('tenants.Barangay', on_delete=models.CASCADE, related_name='assistance_requests')
    requester = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='assistance_requests')
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey('skills.AssistanceCategory', on_delete=models.PROTECT, related_name='requests')
    required_skill = models.ForeignKey('skills.Skill', on_delete=models.SET_NULL, null=True, blank=True, related_name='requests')
    preferred_date = models.DateField()
    preferred_time = models.CharField(max_length=100, default='Flexible')
    zone = models.CharField(max_length=100, help_text="Zone or Purok")
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='MEDIUM')
    additional_notes = models.TextField(blank=True, default='')
    attachment_url = models.CharField(max_length=255, blank=True, default='')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    assigned_helper = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='helping_requests'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'assistance_requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['barangay', 'status']),
            models.Index(fields=['requester', 'status']),
            models.Index(fields=['assigned_helper']),
            models.Index(fields=['category']),
            models.Index(fields=['required_skill']),
            models.Index(fields=['preferred_date']),
        ]

    def __str__(self):
        return f"[{self.get_status_display()}] {self.title} by {self.requester.full_name}"


class AssistanceInvitation(models.Model):
    STATUS_CHOICES = (
        ('INVITED', 'Invited'),
        ('ACCEPTED', 'Accepted'),
        ('DECLINED', 'Declined'),
        ('CANCELLED', 'Cancelled'),
    )

    request = models.ForeignKey(AssistanceRequest, on_delete=models.CASCADE, related_name='invitations')
    helper = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='received_invitations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='INVITED')
    message = models.TextField(blank=True, default='')
    decline_reason = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'assistance_invitations'
        unique_together = ('request', 'helper')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['helper', 'status']),
            models.Index(fields=['request', 'status']),
        ]

    def __str__(self):
        return f"Invitation to {self.helper.full_name} for '{self.request.title}' ({self.status})"


class AssistanceTransaction(models.Model):
    request = models.OneToOneField(AssistanceRequest, on_delete=models.CASCADE, related_name='transaction')
    barangay = models.ForeignKey('tenants.Barangay', on_delete=models.CASCADE, related_name='transactions')
    requester = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='as_requester_transactions')
    helper = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='as_helper_transactions')
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assistance_transactions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['barangay']),
            models.Index(fields=['requester']),
            models.Index(fields=['helper']),
        ]

    def __str__(self):
        return f"Transaction #{self.id} for '{self.request.title}' ({self.requester.full_name} -> {self.helper.full_name})"
