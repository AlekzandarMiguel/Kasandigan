from django.db import models

class Barangay(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('SUSPENDED', 'Suspended'),
    )

    name = models.CharField(max_length=150)
    code = models.SlugField(max_length=100, unique=True)
    municipality_city = models.CharField(max_length=150, default='Maramag')
    province = models.CharField(max_length=150, default='Bukidnon')
    region = models.CharField(max_length=100, default='Region X - Northern Mindanao')
    contact_number = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    zones = models.JSONField(default=list, blank=True, help_text="List of zones/puroks within this barangay")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'barangays'
        ordering = ['name']
        verbose_name = 'Barangay'
        verbose_name_plural = 'Barangays'
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.name}, {self.municipality_city}"
