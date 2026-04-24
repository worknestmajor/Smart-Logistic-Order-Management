from django.conf import settings
from django.db import models

from core.base_model import BaseModel
from drivers.models import Driver
from orders.models import Order
from vehicles.models import Vehicle


class Assignment(BaseModel):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="assignment")
    driver = models.ForeignKey(Driver, on_delete=models.PROTECT, related_name="assignments")
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT, related_name="assignments")
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    assigned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.order.order_number} -> {self.driver.full_name}"
