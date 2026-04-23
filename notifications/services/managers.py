from core.base_manager import BaseManager
from notifications.models import Notification


class NotificationManager(BaseManager):
    model = Notification
