from core.base_manager import BaseManager

from accounts.models import Role, User


class RoleManager(BaseManager):
    model = Role


class UserManager(BaseManager):
    model = User
