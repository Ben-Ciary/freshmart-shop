from django.urls import path

from .order_views import OrderListView, OrderDetailView


urlpatterns = [
    path("", OrderListView.as_view()),
    path("<int:order_id>", OrderDetailView.as_view()),
]