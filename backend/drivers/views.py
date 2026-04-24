from rest_framework import viewsets

from accounts.permissions import IsAdminOrManager
from core.base_response import success_response
from drivers.models import Driver
from drivers.serializers import DriverSerializer
from drivers.services.managers import DriverManager


class DriverViewSet(viewsets.ModelViewSet):
    queryset = Driver.objects.filter(is_active=True).order_by("-created_at")
    serializer_class = DriverSerializer
    permission_classes = [IsAdminOrManager]
    manager = DriverManager()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.manager.delete(instance, soft=True)
        return success_response("Driver archived")
