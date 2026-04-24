from django.db import models

from core.base_model import BaseModel


class Driver(BaseModel):
    full_name = models.CharField(max_length=150)
    license_number = models.CharField(max_length=50, unique=True)
    phone = models.CharField(max_length=20)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.full_name
