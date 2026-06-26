from django.db import models

class RequestMatch(models.Model):
    request = models.ForeignKey(
        'assistance.AssistanceRequest',
        on_delete=models.CASCADE,
        related_name='matches'
    )
    helper = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='matched_requests'
    )
    total_score = models.PositiveIntegerField(default=0)
    skill_score = models.PositiveIntegerField(default=0)
    barangay_score = models.PositiveIntegerField(default=0)
    zone_score = models.PositiveIntegerField(default=0)
    availability_score = models.PositiveIntegerField(default=0)
    rating_score = models.PositiveIntegerField(default=0)
    reasons = models.JSONField(default=list, help_text="Explanation badges why helper was matched")
    calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'request_matches'
        unique_together = ('request', 'helper')
        ordering = ['-total_score', '-calculated_at']
        indexes = [
            models.Index(fields=['request', '-total_score']),
            models.Index(fields=['helper']),
        ]

    def __str__(self):
        return f"Match: {self.helper.full_name} for '{self.request.title}' ({self.total_score} pts)"
