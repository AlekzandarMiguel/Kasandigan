from django.db import models

class AssistanceCategory(models.Model):
    barangay = models.ForeignKey(
        'tenants.Barangay',
        on_delete=models.CASCADE,
        related_name='categories',
        null=True,
        blank=True,
        help_text="Null represents global/default categories accessible across barangays"
    )
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True, default='')
    icon = models.CharField(max_length=50, default='HeartHandshake')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assistance_categories'
        ordering = ['name']
        verbose_name_plural = 'Assistance Categories'
        indexes = [
            models.Index(fields=['barangay', 'is_active']),
        ]

    def __str__(self):
        tenant = self.barangay.name if self.barangay else "Global"
        return f"{self.name} ({tenant})"


class Skill(models.Model):
    barangay = models.ForeignKey(
        'tenants.Barangay',
        on_delete=models.CASCADE,
        related_name='skills',
        null=True,
        blank=True,
        help_text="Null represents global/default skills"
    )
    category = models.ForeignKey(
        AssistanceCategory,
        on_delete=models.CASCADE,
        related_name='skills'
    )
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True, default='')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'skills'
        ordering = ['name']
        indexes = [
            models.Index(fields=['barangay', 'is_active']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f"{self.name} [{self.category.name}]"


class UserSkill(models.Model):
    PROFICIENCY_CHOICES = (
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('EXPERT', 'Expert'),
    )

    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='users')
    proficiency = models.CharField(max_length=20, choices=PROFICIENCY_CHOICES, default='INTERMEDIATE')
    years_experience = models.PositiveIntegerField(default=1)
    notes = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_skills'
        unique_together = ('user', 'skill')
        indexes = [
            models.Index(fields=['user', 'skill']),
        ]

    def __str__(self):
        return f"{self.user.full_name} - {self.skill.name} ({self.proficiency})"


class UserAvailability(models.Model):
    DAY_CHOICES = (
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    )

    SLOT_CHOICES = (
        ('MORNING', 'Morning (8:00 AM - 12:00 PM)'),
        ('AFTERNOON', 'Afternoon (1:00 PM - 5:00 PM)'),
        ('EVENING', 'Evening (5:00 PM - 8:00 PM)'),
        ('ALL_DAY', 'All Day (Flexible)'),
    )

    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    is_available = models.BooleanField(default=True)
    time_slot = models.CharField(max_length=20, choices=SLOT_CHOICES, default='ALL_DAY')
    custom_start_time = models.TimeField(null=True, blank=True)
    custom_end_time = models.TimeField(null=True, blank=True)

    class Meta:
        db_table = 'user_availabilities'
        unique_together = ('user', 'day_of_week', 'time_slot')
        ordering = ['day_of_week']
        indexes = [
            models.Index(fields=['user', 'day_of_week']),
        ]

    def __str__(self):
        return f"{self.user.full_name}: {self.get_day_of_week_display()} ({self.get_time_slot_display()})"
