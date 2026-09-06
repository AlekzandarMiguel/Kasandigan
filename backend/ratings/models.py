from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg

class Rating(models.Model):
    request = models.OneToOneField(
        'assistance.AssistanceRequest',
        on_delete=models.CASCADE,
        related_name='rating'
    )
    barangay = models.ForeignKey('tenants.Barangay', on_delete=models.CASCADE, related_name='ratings')
    requester = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='submitted_ratings')
    helper = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='received_ratings')
    score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    review = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ratings'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['helper']),
            models.Index(fields=['barangay']),
            models.Index(fields=['score']),
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Recalculate helper average rating and count
        helper = self.helper
        agg = Rating.objects.filter(helper=helper).aggregate(avg_score=Avg('score'), total=models.Count('id'))
        helper.rating_average = round(agg['avg_score'] or 0, 2)
        helper.rating_count = agg['total'] or 0
        helper.save(update_fields=['rating_average', 'rating_count'])

    def __str__(self):
        return f"{self.score}★ for {self.helper.full_name} on '{self.request.title}'"
