from django.urls import path

from .product_views import (
    ProductListView,
    ProductDetailView,
    CategoryListView,
)

urlpatterns = [
    path("", ProductListView.as_view()),
    path("categories", CategoryListView.as_view()),
    path("<int:product_id>", ProductDetailView.as_view()),
]
