from core.base_serializer import BaseSerializer
from drivers.models import Driver


class DriverSerializer(BaseSerializer):
    class Meta:
        model = Driver
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")
