from rest_framework import viewsets

from accounts.permissions import IsAdminOrManager
from core.base_response import success_response
from vehicles.models import Vehicle
from vehicles.serializers import VehicleSerializer
from vehicles.services.managers import VehicleManager


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.filter(is_active=True).order_by("-created_at")
    serializer_class = VehicleSerializer
    permission_classes = [IsAdminOrManager]
    manager = VehicleManager()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.manager.delete(instance, soft=True)
        return success_response("Vehicle archived")
