from activity_logs.models import ActivityLog

class AuditLogger:
    @staticmethod
    def log(user, action, description, target_type='', target_id='', ip_address=None, barangay=None):
        try:
            if barangay is None and user and hasattr(user, 'barangay'):
                barangay = user.barangay
            ActivityLog.objects.create(
                user=user if (user and user.is_authenticated) else None,
                barangay=barangay,
                action=action,
                description=description,
                target_type=target_type,
                target_id=str(target_id),
                ip_address=ip_address
            )
        except Exception as e:
            # Audit logging must not crash main transaction
            pass
