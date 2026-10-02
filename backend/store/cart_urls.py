from django.urls import path

from .cart_views import CartView, CartItemView, CartItemDetailView

urlpatterns = [
    path("", CartView.as_view()),
    path("items", CartItemView.as_view()),
    path("items/<int:product_id>", CartItemDetailView.as_view()),
]
