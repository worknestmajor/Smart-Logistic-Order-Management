from django.db import models

from core.base_model import BaseModel


class Vehicle(BaseModel):
    number_plate = models.CharField(max_length=30, unique=True)
    vehicle_type = models.CharField(max_length=50)
    capacity_kg = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.number_plate
