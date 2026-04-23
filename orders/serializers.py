from rest_framework import serializers

from core.base_serializer import BaseSerializer
from orders.models import Order


class OrderSerializer(BaseSerializer):
    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "base_price", "total_price", "approved_by")


class StatusTransitionSerializer(serializers.Serializer):
    target_status = serializers.CharField(max_length=20)


class TrackingUpdateSerializer(serializers.Serializer):
    current_location = serializers.CharField(max_length=255)
