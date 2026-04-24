from core.base_serializer import BaseSerializer
from pricing.models import PricingConfig


class PricingConfigSerializer(BaseSerializer):
    class Meta:
        model = PricingConfig
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")
