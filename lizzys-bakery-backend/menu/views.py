from rest_framework import generics
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, CustomCakeRequest, Product
from .serializers import (
    CategorySerializer,
    CustomCakeRequestSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
)
from .filters import ProductFilter


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_available=True)
    serializer_class = ProductListSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ProductFilter


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'  # look up by slug in the URL, not numeric id


class CustomCakeRequestCreateView(generics.CreateAPIView):
    # Public — a customer doesn't need an account to ask for a custom cake
    queryset = CustomCakeRequest.objects.all()
    serializer_class = CustomCakeRequestSerializer
    permission_classes = [AllowAny]