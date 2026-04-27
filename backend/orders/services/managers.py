from decimal import Decimal

from django.utils import timezone

from core.base_manager import BaseManager
from orders.models import Order, OrderStatus
from pricing.services.managers import PricingManager


class OrderManager(BaseManager):
    model = Order

    VALID_TRANSITIONS = {
        OrderStatus.CREATED: {OrderStatus.APPROVED},
        OrderStatus.APPROVED: {OrderStatus.ASSIGNED},
        OrderStatus.ASSIGNED: {OrderStatus.IN_TRANSIT},
        OrderStatus.IN_TRANSIT: {OrderStatus.DELIVERED},
        OrderStatus.DELIVERED: {OrderStatus.INVOICED},
        OrderStatus.INVOICED: set(),
    }

    def _generate_order_number(self):
        max_order = 100
        for value in Order.objects.values_list("order_number", flat=True):
            if value and str(value).isdigit():
                max_order = max(max_order, int(value))
        return str(max_order + 1)

    def pre_create(self, data, context=None):
        data["order_number"] = self._generate_order_number()
        pricing = PricingManager().calculate_order_price(data.get("distance_km", Decimal("0")), data.get("weight_kg", Decimal("0")))
        data["base_price"] = pricing["base_price"]
        data["total_price"] = pricing["total_price"]
        return data

    def transition_status(self, order, target_status, changed_by=None):
        if target_status not in self.VALID_TRANSITIONS.get(order.status, set()):
            raise ValueError(f"Invalid transition from {order.status} to {target_status}")
        if target_status == OrderStatus.ASSIGNED and not hasattr(order, "assignment"):
            raise ValueError("Order must have a driver and vehicle assignment before moving to ASSIGNED")
        order.status = target_status
        if target_status == OrderStatus.APPROVED:
            order.approved_by = changed_by
        if target_status == OrderStatus.DELIVERED:
            # Release assigned resources once delivery is completed.
            assignment = getattr(order, "assignment", None)
            if assignment:
                assignment.driver.is_available = True
                assignment.vehicle.is_available = True
                assignment.driver.save(update_fields=["is_available", "updated_at"])
                assignment.vehicle.save(update_fields=["is_available", "updated_at"])
        order.save(update_fields=["status", "approved_by", "updated_at"])
        return order

    def update_tracking(self, order, location):
        order.current_location = location
        order.last_location_update = timezone.now()
        order.save(update_fields=["current_location", "last_location_update", "updated_at"])
        return order
