from rest_framework import viewsets

from accounts.permissions import IsAdminOrManager
from core.base_response import success_response
from pricing.models import PricingConfig
from pricing.serializers import PricingConfigSerializer
from pricing.services.managers import PricingManager


class PricingConfigViewSet(viewsets.ModelViewSet):
    queryset = PricingConfig.objects.filter(is_active=True).order_by("-created_at")
    serializer_class = PricingConfigSerializer
    permission_classes = [IsAdminOrManager]
    manager = PricingManager()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.manager.delete(instance)
        return success_response("Pricing config archived")
