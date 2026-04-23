from core.base_serializer import BaseSerializer
from vehicles.models import Vehicle


class VehicleSerializer(BaseSerializer):
    class Meta:
        model = Vehicle
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")
