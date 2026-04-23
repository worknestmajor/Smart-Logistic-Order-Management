from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/", include("orders.urls")),
    path("api/", include("vehicles.urls")),
    path("api/", include("drivers.urls")),
    path("api/", include("assignments.urls")),
    path("api/", include("pricing.urls")),
    path("api/", include("invoices.urls")),
    path("api/", include("notifications.urls")),
]
