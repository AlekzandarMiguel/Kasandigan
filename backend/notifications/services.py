from notifications.models import Notification

class NotificationService:
    @staticmethod
    def send(user, title, message, notif_type='GENERAL', link='', barangay=None):
        try:
            if barangay is None and user and hasattr(user, 'barangay'):
                barangay = user.barangay
            return Notification.objects.create(
                user=user,
                barangay=barangay,
                title=title,
                message=message,
                type=notif_type,
                link=link
            )
        except Exception:
            return None

    @staticmethod
    def broadcast_barangay(barangay, title, message, notif_type='ANNOUNCEMENT', link=''):
        from accounts.models import User
        residents = User.objects.filter(barangay=barangay, is_active=True)
        notifs = [
            Notification(
                user=u,
                barangay=barangay,
                title=title,
                message=message,
                type=notif_type,
                link=link
            )
            for u in residents
        ]
        Notification.objects.bulk_create(notifs)

    @staticmethod
    def broadcast_municipal(title, message, notif_type='EMERGENCY_ALERT', link=''):
        from accounts.models import User
        users = User.objects.filter(is_active=True)
        notifs = [
            Notification(
                user=u,
                barangay=u.barangay,
                title=title,
                message=message,
                type=notif_type,
                link=link
            )
            for u in users
        ]
        Notification.objects.bulk_create(notifs)
