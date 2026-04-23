from django.urls import include, path
from rest_framework.routers import DefaultRouter

from pricing.views import PricingConfigViewSet

router = DefaultRouter()
router.register(r"pricing-configs", PricingConfigViewSet, basename="pricing-config")

urlpatterns = [path("", include(router.urls))]
