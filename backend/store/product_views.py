from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Product
from .product_serializers import ProductSerializer


class ProductListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.all()

        search = request.query_params.get("search")
        category = request.query_params.get("category")

        if search:
            products = products.filter(name__icontains=search)

        if category:
            products = products.filter(category__iexact=category)

        serializer = ProductSerializer(products, many=True)

        return Response(serializer.data)


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=404)

        return Response(ProductSerializer(product).data)


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = (
            Product.objects
            .values_list("category", flat=True)
            .distinct()
            .order_by("category")
        )

        return Response(list(categories))
