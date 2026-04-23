from celery import shared_task


@shared_task
def send_notification_task(user_id, subject, message, channel="SYSTEM", metadata=None):
    from notifications.models import Notification

    Notification.objects.create(
        user_id=user_id,
        subject=subject,
        message=message,
        channel=channel,
        metadata=metadata or {},
    )
    return True
