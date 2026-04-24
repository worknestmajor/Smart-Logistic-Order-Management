from rest_framework import status, viewsets
from rest_framework.decorators import action

from accounts.permissions import IsAdminOrManager
from core.base_response import error_response, success_response
from invoices.models import Invoice
from invoices.serializers import InvoiceSerializer, IssueInvoiceSerializer
from invoices.services.managers import InvoiceManager


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.filter(is_active=True).order_by("-created_at")
    serializer_class = InvoiceSerializer
    permission_classes = [IsAdminOrManager]
    manager = InvoiceManager()

    @action(detail=True, methods=["post"], url_path="issue")
    def issue(self, request, pk=None):
        invoice = self.get_object()
        serializer = IssueInvoiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not serializer.validated_data["confirm"]:
            return error_response("Confirmation is required", status_code=status.HTTP_400_BAD_REQUEST)
        try:
            invoice = self.manager.issue_invoice(invoice)
        except ValueError as exc:
            return error_response(str(exc), status_code=status.HTTP_400_BAD_REQUEST)
        return success_response("Invoice issued", self.get_serializer(invoice).data)

    def destroy(self, request, *args, **kwargs):
        invoice = self.get_object()
        self.manager.delete(invoice)
        return success_response("Invoice archived")
