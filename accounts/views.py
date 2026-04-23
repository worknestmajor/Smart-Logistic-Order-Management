from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.models import Role, User
from accounts.permissions import IsAdminOrManager
from accounts.serializers import RoleSerializer, UserSerializer
from core.base_response import success_response


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.filter(is_active=True).order_by("-created_at")
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_active=True).order_by("-created_at")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrManager]

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.soft_delete()
        return success_response("User deactivated")
