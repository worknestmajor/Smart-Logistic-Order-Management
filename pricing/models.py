from decimal import Decimal

from django.db import models

from core.base_model import BaseModel


class PricingConfig(BaseModel):
    name = models.CharField(max_length=100, default="default")
    base_rate_per_km = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("10.00"))
    weight_rate_per_kg = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("2.00"))
    fuel_surcharge_percent = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("5.00"))

    class Meta:
        verbose_name = "Pricing Config"
        verbose_name_plural = "Pricing Configs"

    def __str__(self):
        return self.name
