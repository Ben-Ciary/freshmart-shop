from rest_framework import serializers

from .models import CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(
        source="product.id",
        read_only=True,
    )

    name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    category = serializers.CharField(
        source="product.category",
        read_only=True,
    )

    price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    stock = serializers.IntegerField(
        source="product.stock",
        read_only=True,
    )

    image_url = serializers.CharField(
        source="product.image_url",
        read_only=True,
    )

    class Meta:
        model = CartItem
        fields = [
            "product_id",
            "name",
            "category",
            "price",
            "stock",
            "image_url",
            "qty",
        ]


def cart_data(user):
    items = list(
        CartItem.objects
        .filter(user=user)
        .select_related("product")
    )

    serialized_items = CartItemSerializer(
        items,
        many=True,
    ).data

    total = sum(
        item.product.price * item.qty
        for item in items
    )

    return {
        "items": serialized_items,
        "total": total,
    }