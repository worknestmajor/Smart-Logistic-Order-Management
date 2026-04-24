from django.conf import settings
from django.db import models

from core.base_model import BaseModel


class OrderStatus(models.TextChoices):
    CREATED = "CREATED", "Created"
    APPROVED = "APPROVED", "Approved"
    ASSIGNED = "ASSIGNED", "Assigned"
    IN_TRANSIT = "IN_TRANSIT", "In Transit"
    DELIVERED = "DELIVERED", "Delivered"
    INVOICED = "INVOICED", "Invoiced"


class Order(BaseModel):
    order_number = models.CharField(max_length=50, unique=True)
    customer_name = models.CharField(max_length=150)
    customer_email = models.EmailField()
    pickup_address = models.TextField()
    dropoff_address = models.TextField()
    distance_km = models.DecimalField(max_digits=10, decimal_places=2)
    weight_kg = models.DecimalField(max_digits=10, decimal_places=2)
    base_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.CREATED)
    current_location = models.CharField(max_length=255, blank=True)
    last_location_update = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_orders",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_orders",
    )

    def __str__(self):
        return self.order_number
