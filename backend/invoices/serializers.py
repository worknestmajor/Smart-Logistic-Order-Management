from rest_framework import serializers

from core.base_serializer import BaseSerializer
from invoices.models import Invoice


class InvoiceSerializer(BaseSerializer):
    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "amount", "issued_at", "paid_at")


class IssueInvoiceSerializer(serializers.Serializer):
    confirm = serializers.BooleanField()
