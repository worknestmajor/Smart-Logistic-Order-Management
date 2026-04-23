from django.utils import timezone

from core.base_manager import BaseManager
from invoices.models import Invoice, InvoiceStatus
from orders.models import OrderStatus
from orders.services.managers import OrderManager


class InvoiceManager(BaseManager):
    model = Invoice

    def issue_invoice(self, invoice):
        if invoice.order.status != OrderStatus.DELIVERED:
            raise ValueError("Invoice can be issued only for delivered orders")
        invoice.status = InvoiceStatus.ISSUED
        invoice.issued_at = timezone.now()
        invoice.amount = invoice.order.total_price
        invoice.save(update_fields=["status", "issued_at", "amount", "updated_at"])
        OrderManager().transition_status(invoice.order, OrderStatus.INVOICED)
        return invoice
