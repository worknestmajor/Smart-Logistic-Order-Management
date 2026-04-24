from core.base_manager import BaseManager
from vehicles.models import Vehicle


class VehicleManager(BaseManager):
    model = Vehicle
