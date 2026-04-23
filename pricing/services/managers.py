from decimal import Decimal

from core.base_manager import BaseManager
from pricing.models import PricingConfig


class PricingManager(BaseManager):
    model = PricingConfig

    def get_active_config(self):
        config = PricingConfig.objects.filter(is_active=True).order_by("-created_at").first()
        if not config:
            config = PricingConfig.objects.create(name="default")
        return config

    def calculate_order_price(self, distance_km, weight_kg):
        config = self.get_active_config()
        distance_km = Decimal(distance_km)
        weight_kg = Decimal(weight_kg)
        base_price = (distance_km * config.base_rate_per_km) + (weight_kg * config.weight_rate_per_kg)
        surcharge = (base_price * config.fuel_surcharge_percent) / Decimal("100")
        total_price = base_price + surcharge
        return {
            "base_price": base_price.quantize(Decimal("0.01")),
            "total_price": total_price.quantize(Decimal("0.01")),
        }
