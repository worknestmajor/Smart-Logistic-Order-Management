from decimal import Decimal

from django.db import models

from core.base_model import BaseModel
from orders.models import Order


class InvoiceStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    ISSUED = "ISSUED", "Issued"
    PAID = "PAID", "Paid"


class Invoice(BaseModel):
    invoice_number = models.CharField(max_length=50, unique=True)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="invoice")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    status = models.CharField(max_length=10, choices=InvoiceStatus.choices, default=InvoiceStatus.DRAFT)
    issued_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.invoice_number
