from django.db import transaction
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, OrderItem, Product


def order_data(order):
    items = [
        {
            "id": item.id,
            "product_id": item.product_id,
            "name": item.name,
            "price": item.price,
            "qty": item.qty,
        }
        for item in order.items.all()
    ]

    return {
        "id": order.id,
        "name": order.name,
        "email": order.email,
        "phone": order.phone,
        "address": order.address,
        "pickup_time": order.pickup_time,
        "note": order.note,
        "status": order.status,
        "total": order.total,
        "created_at": order.created_at,
        "items": items,
    }


class OrderListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related("items")

        return Response([order_data(order) for order in orders])

    @transaction.atomic
    def post(self, request):
        items = request.data.get("items", [])

        if not items:
            return Response(
                {"error": "Your order must contain at least one item."},
                status=400,
            )

        total = 0
        order_items = []

        for item in items:
            product_id = item.get("product_id")
            qty = int(item.get("qty", 0))

            if qty <= 0:
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
                    {"error": f"Not enough stock for {product.name}."},
                    status=400,
                )

            total += product.price * qty

            order_items.append(
                {
                    "product": product,
                    "name": product.name,
                    "price": product.price,
                    "qty": qty,
                }
            )

        order = Order.objects.create(
            user=request.user,
            total=total,
            name=request.data.get("name", request.user.get_full_name()),
            email=request.data.get("email", request.user.email),
            phone=request.data.get("phone", ""),
            address=request.data.get("address", ""),
            pickup_time=request.data.get("pickup_time", ""),
            note=request.data.get("note", ""),
        )

        for item in order_items:
            OrderItem.objects.create(
                order=order,
                product=item["product"],
                name=item["name"],
                price=item["price"],
                qty=item["qty"],
            )

        return Response(order_data(order), status=201)


class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_order(self, request, order_id):
        try:
            return Order.objects.prefetch_related("items").get(
                id=order_id,
                user=request.user,
            )
        except Order.DoesNotExist:
            return None

    def get(self, request, order_id):
        order = self.get_order(request, order_id)

        if not order:
            return Response(
                {"error": "Order not found."},
                status=404,
            )

        return Response(order_data(order))

    @transaction.atomic
    def put(self, request, order_id):
        order = self.get_order(request, order_id)

        if not order:
            return Response(
                {"error": "Order not found."},
                status=404,
            )

        if order.status != Order.Status.PENDING:
            return Response(
                {"error": "Only pending orders can be edited."},
                status=400,
            )

        items = request.data.get("items", [])

        if not items:
            return Response(
                {"error": "Your order must contain at least one item."},
                status=400,
            )

        total = 0
        new_items = []

        for item in items:
            product_id = item.get("product_id")
            qty = int(item.get("qty", 0))

            if qty <= 0:
                continue

            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response(
                    {"error": "Product not found."},
                    status=404,
                )

            if qty > product.stock:
                return Response(
                    {"error": f"Not enough stock for {product.name}."},
                    status=400,
                )

            total += product.price * qty

            new_items.append(
                {
                    "product": product,
                    "name": product.name,
                    "price": product.price,
                    "qty": qty,
                }
            )

        if not new_items:
            return Response(
                {"error": "Your order must contain at least one item."},
                status=400,
            )

        order.phone = request.data.get("phone", order.phone)
        order.pickup_time = request.data.get(
            "pickup_time",
            order.pickup_time,
        )
        order.note = request.data.get("note", order.note)
        order.total = total
        order.save()

        order.items.all().delete()

        for item in new_items:
            OrderItem.objects.create(
                order=order,
                product=item["product"],
                name=item["name"],
                price=item["price"],
                qty=item["qty"],
            )

        order.refresh_from_db()

        return Response(order_data(order))

    def delete(self, request, order_id):
        order = self.get_order(request, order_id)

        if not order:
            return Response(
                {"error": "Order not found."},
                status=404,
            )

        if order.status != Order.Status.PENDING:
            return Response(
                {"error": "Only pending orders can be cancelled."},
                status=400,
            )

        order.status = Order.Status.CANCELLED
        order.save(update_fields=["status", "updated_at"])

        return Response(order_data(order))