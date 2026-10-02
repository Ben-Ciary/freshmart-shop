from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .cart_serializers import CartItemSerializer, cart_data
from .models import CartItem, Product


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(cart_data(request.user))


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("productId")
        qty = int(request.data.get("qty", 1))

        if qty < 1:
            return Response(
                {"error": "Quantity must be at least 1."},
                status=400,
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found."},
                status=404,
            )

        if qty > product.stock:
            return Response(
                {"error": "Not enough stock available."},
                status=400,
            )

        item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={"qty": qty},
        )

        if not created:
            new_qty = item.qty + qty

            if new_qty > product.stock:
                return Response(
                    {"error": "Not enough stock available."},
                    status=400,
                )

            item.qty = new_qty
            item.save()

        return Response(cart_data(request.user))


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, product_id):
        try:
            item = CartItem.objects.select_related("product").get(
                user=request.user,
                product_id=product_id,
            )
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Cart item not found."},
                status=404,
            )

        qty = int(request.data.get("qty", 1))

        if qty <= 0:
            item.delete()
            return Response(cart_data(request.user))

        if qty > item.product.stock:
            return Response(
                {"error": "Not enough stock available."},
                status=400,
            )

        item.qty = qty
        item.save()

        return Response(cart_data(request.user))

    def delete(self, request, product_id):
        CartItem.objects.filter(
            user=request.user,
            product_id=product_id,
        ).delete()

        return Response(cart_data(request.user))
