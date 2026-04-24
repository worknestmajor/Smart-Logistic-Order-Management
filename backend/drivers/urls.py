from django.urls import include, path
from rest_framework.routers import DefaultRouter

from drivers.views import DriverViewSet

router = DefaultRouter()
router.register(r"drivers", DriverViewSet, basename="driver")

urlpatterns = [path("", include(router.urls))]
