from rest_framework import status, viewsets
from rest_framework.decorators import action

from accounts.permissions import IsAdminOrManager
from core.base_response import error_response, success_response
from orders.models import Order
from orders.serializers import OrderSerializer, StatusTransitionSerializer, TrackingUpdateSerializer
from orders.services.managers import OrderManager


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.filter(is_active=True).order_by("-created_at")
    serializer_class = OrderSerializer
    permission_classes = [IsAdminOrManager]
    manager = OrderManager()

    def perform_create(self, serializer):
        data = dict(serializer.validated_data)
        data["created_by"] = self.request.user
        self.instance = self.manager.create(data, context={"request": self.request})

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return success_response("Order created", self.get_serializer(self.instance).data, status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="transition-status")
    def transition_status(self, request, pk=None):
        order = self.get_object()
        serializer = StatusTransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            updated = self.manager.transition_status(order, serializer.validated_data["target_status"], request.user)
        except ValueError as exc:
            return error_response(str(exc), status_code=status.HTTP_400_BAD_REQUEST)
        return success_response("Status updated", self.get_serializer(updated).data)

    @action(detail=True, methods=["post"], url_path="tracking")
    def tracking(self, request, pk=None):
        order = self.get_object()
        serializer = TrackingUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated = self.manager.update_tracking(order, serializer.validated_data["current_location"])
        return success_response("Tracking updated", self.get_serializer(updated).data)

    def destroy(self, request, *args, **kwargs):
        order = self.get_object()
        self.manager.delete(order, soft=True)
        return success_response("Order archived")
