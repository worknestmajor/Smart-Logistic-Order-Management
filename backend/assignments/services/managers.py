from django.db import transaction

from assignments.models import Assignment
from core.base_manager import BaseManager
from orders.models import OrderStatus
from orders.services.managers import OrderManager


class AssignmentManager(BaseManager):
    model = Assignment

    @transaction.atomic
    def create(self, data, context=None):
        order = data["order"]
        driver = data["driver"]
        vehicle = data["vehicle"]

        if order.status != OrderStatus.APPROVED:
            raise ValueError("Order must be in APPROVED status before assignment")
        if not driver.is_available:
            raise ValueError("Driver is not available")
        if not vehicle.is_available:
            raise ValueError("Vehicle is not available")

        instance = super().create(data, context=context)
        driver.is_available = False
        vehicle.is_available = False
        driver.save(update_fields=["is_available", "updated_at"])
        vehicle.save(update_fields=["is_available", "updated_at"])
        changed_by = context["request"].user if context and context.get("request") else None
        OrderManager().transition_status(order, OrderStatus.ASSIGNED, changed_by=changed_by)
        return instance
