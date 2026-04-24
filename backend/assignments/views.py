from rest_framework import status, viewsets

from accounts.permissions import IsAdminOrManager
from assignments.models import Assignment
from assignments.serializers import AssignmentSerializer
from assignments.services.managers import AssignmentManager
from core.base_response import error_response, success_response


class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.filter(is_active=True).order_by("-created_at")
    serializer_class = AssignmentSerializer
    permission_classes = [IsAdminOrManager]
    manager = AssignmentManager()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = dict(serializer.validated_data)
        data["assigned_by"] = request.user
        try:
            instance = self.manager.create(data, context={"request": request})
        except ValueError as exc:
            return error_response(str(exc), status_code=status.HTTP_400_BAD_REQUEST)
        return success_response("Assignment created", self.get_serializer(instance).data, status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        assignment = self.get_object()
        self.manager.delete(assignment)
        return success_response("Assignment archived")
