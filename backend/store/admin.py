from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, Product, CartItem, Order, OrderItem


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    list_display = ("email", "first_name", "last_name", "phone", "is_staff")
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Personal information",
            {"fields": ("first_name", "last_name", "phone", "address")},
        ),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2"),
            },
        ),
    )

    search_fields = ("email", "first_name", "last_name")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "stock")
    search_fields = ("name", "category")
    list_filter = ("category",)


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "qty")
    search_fields = ("user__email", "product__name")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "total", "status", "created_at")
    search_fields = ("user__email", "name", "email")
    list_filter = ("status", "created_at")


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "name", "price", "qty")
