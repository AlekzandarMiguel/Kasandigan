from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'PLATFORM_ADMIN')
        extra_fields.setdefault('verification_status', 'VERIFIED')
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('PLATFORM_ADMIN', 'Platform Administrator'),
        ('BARANGAY_ADMIN', 'Barangay Administrator'),
        ('BARANGAY_STAFF', 'Barangay Staff'),
        ('RESIDENT', 'Resident'),
    )

    VERIFICATION_STATUS_CHOICES = (
        ('PENDING_VERIFICATION', 'Pending Verification'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
        ('SUSPENDED', 'Suspended'),
    )

    RADIUS_CHOICES = (
        ('ZONE', 'Within My Zone'),
        ('BARANGAY', 'Anywhere Within Barangay'),
    )

    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(_('first name'), max_length=100)
    last_name = models.CharField(_('last name'), max_length=100)
    mobile_number = models.CharField(max_length=30, blank=True, null=True)

    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='RESIDENT')
    barangay = models.ForeignKey(
        'tenants.Barangay',
        on_delete=models.SET_NULL,
        related_name='users',
        null=True,
        blank=True
    )
    zone = models.CharField(max_length=100, blank=True, null=True, help_text="Zone or Purok")
    bio = models.TextField(blank=True, default='')
    avatar_url = models.CharField(max_length=255, blank=True, default='')

    verification_status = models.CharField(
        max_length=30,
        choices=VERIFICATION_STATUS_CHOICES,
        default='PENDING_VERIFICATION'
    )
    verification_notes = models.TextField(blank=True, default='')
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='verified_residents'
    )
    id_document_url = models.CharField(max_length=500, blank=True, null=True, help_text="Barangay clearance, Voter ID, or CMU ID proof")
    id_document_type = models.CharField(max_length=50, blank=True, default='BARANGAY_CLEARANCE', choices=[
        ('BARANGAY_CLEARANCE', 'Barangay Clearance'),
        ('VOTER_ID', "COMELEC Voter's ID"),
        ('CMU_ID', 'CMU Student / Faculty ID'),
        ('GOV_ID', 'Government Issued ID')
    ])

    assistance_radius = models.CharField(
        max_length=20,
        choices=RADIUS_CHOICES,
        default='BARANGAY'
    )
    completed_assistance_count = models.PositiveIntegerField(default=0)
    rating_average = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    rating_count = models.PositiveIntegerField(default=0)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['barangay', 'role']),
            models.Index(fields=['verification_status']),
            models.Index(fields=['email']),
        ]

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return f"{self.full_name} ({self.email}) - {self.get_role_display()}"


class BlockedUser(models.Model):
    blocker = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocking')
    blocked = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked_by')
    barangay = models.ForeignKey('tenants.Barangay', on_delete=models.CASCADE, related_name='blocks')
    reason = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'blocked_users'
        unique_together = ('blocker', 'blocked')
        indexes = [
            models.Index(fields=['blocker', 'blocked']),
            models.Index(fields=['barangay']),
        ]

    def __str__(self):
        return f"{self.blocker.full_name} blocked {self.blocked.full_name}"
