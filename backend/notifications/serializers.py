from core.base_serializer import BaseSerializer
from notifications.models import Notification


class NotificationSerializer(BaseSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")
