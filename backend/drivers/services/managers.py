from core.base_manager import BaseManager
from drivers.models import Driver


class DriverManager(BaseManager):
    model = Driver
