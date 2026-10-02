from django.urls import include, path

from .auth_views import RegisterView, LoginView, MeView

urlpatterns = [
    path("auth/register", RegisterView.as_view()),
    path("auth/login", LoginView.as_view()),
    path("auth/me", MeView.as_view()),

    path("products/", include("store.product_urls")),
    path("cart/", include("store.cart_urls")),
    path("orders/", include("store.order_urls")),
]