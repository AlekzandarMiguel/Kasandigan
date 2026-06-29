from django.db import models

class Resource(models.Model):
    CATEGORY_CHOICES = (
        ('TOOLS', 'Tools & Hardware'),
        ('GARDENING', 'Gardening & Outdoor'),
        ('ELECTRONICS', 'Electronics & Appliances'),
        ('EVENT_EQUIPMENT', 'Event & Party Equipment'),
        ('HOME_CARE', 'Home & Cleaning Care'),
        ('OTHER', 'Other Resource'),
    )

    CONDITION_CHOICES = (
        ('EXCELLENT', 'Excellent'),
        ('GOOD', 'Good'),
        ('FAIR', 'Fair'),
    )

    STATUS_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('REQUESTED', 'Requested'),
        ('BORROWED', 'Currently Borrowed'),
        ('MAINTENANCE', 'Under Maintenance'),
    )

    barangay = models.ForeignKey('tenants.Barangay', on_delete=models.CASCADE, related_name='resources')
    owner = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='owned_resources')
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='TOOLS')
    description = models.TextField(blank=True, default='')
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='GOOD')
    zone = models.CharField(max_length=100, help_text="Zone where item is located")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'resources'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['barangay', 'status']),
            models.Index(fields=['owner']),
        ]

    def __str__(self):
        return f"{self.name} ({self.owner.full_name}) [{self.status}]"


class ResourceRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('DECLINED', 'Declined'),
        ('BORROWED', 'Borrowed'),
        ('RETURNED', 'Returned'),
        ('CANCELLED', 'Cancelled'),
    )

    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='borrow_requests')
    borrower = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='resource_requests')
    start_date = models.DateField()
    end_date = models.DateField()
    purpose = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    returned_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'resource_requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['resource', 'status']),
            models.Index(fields=['borrower']),
        ]

    def __str__(self):
        return f"Borrow Request: {self.borrower.full_name} for '{self.resource.name}' ({self.status})"
