from rest_framework import permissions


class HasRoleCode(permissions.BasePermission):
    allowed_roles = set()

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser:
            return True
        if not user.role:
            return False
        return user.role.code in self.allowed_roles


class IsAdminOrManager(HasRoleCode):
    allowed_roles = {"admin", "manager"}
