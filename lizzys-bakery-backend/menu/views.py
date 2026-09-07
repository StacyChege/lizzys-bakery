from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, CustomCakeReferenceImage, CustomCakeRequest, Product, ProductImage
from .permissions import IsBakeryAdmin
from .serializers import (
    AdminCategorySerializer,
    AdminCustomCakeRequestSerializer,
    AdminProductImageUploadSerializer,
    AdminProductSerializer,
    CategorySerializer,
    CustomCakeRequestSerializer,
    ProductListSerializer,
    ProductDetailSerializer,
)
from .emails import send_custom_cake_confirmation_email, send_custom_cake_status_email
from .filters import ProductFilter

MAX_REFERENCE_IMAGES = 3


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
    # Public — a customer doesn't need an account to ask for a custom cake.
    # Reference photos ride along as extra files under the 'reference_images'
    # form key rather than as a serializer field — DRF can't bind a list of
    # files to a nested model from multipart data in a single ModelSerializer.
    queryset = CustomCakeRequest.objects.all()
    serializer_class = CustomCakeRequestSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        for image in request.FILES.getlist('reference_images')[:MAX_REFERENCE_IMAGES]:
            CustomCakeReferenceImage.objects.create(request=instance, image=image)

        send_custom_cake_confirmation_email(instance)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


# --- Admin menu management (Django admin still handles available_sizes
# editing for now — this covers the fields the baker changes day to day:
# name, price, description, flavours, availability, photos) ---

class AdminCategoryListCreateView(generics.ListCreateAPIView):
    # Unlike CategoryListView, not filtered — the baker needs to see/manage
    # every category, not just ones with visible products.
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAuthenticated, IsBakeryAdmin]


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAuthenticated, IsBakeryAdmin]


class AdminProductListCreateView(generics.ListCreateAPIView):
    # Unlike ProductListView, includes unavailable products — the baker
    # needs to see and re-enable sold-out items, not just what's live.
    queryset = Product.objects.all()
    serializer_class = AdminProductSerializer
    permission_classes = [IsAuthenticated, IsBakeryAdmin]


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = AdminProductSerializer
    permission_classes = [IsAuthenticated, IsBakeryAdmin]


class AdminProductImageUploadView(generics.CreateAPIView):
    # Nested under a product id: POST an 'image' file to add a photo to
    # that product's gallery. New photos append after any existing ones.
    serializer_class = AdminProductImageUploadSerializer
    permission_classes = [IsAuthenticated, IsBakeryAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        product = get_object_or_404(Product, pk=self.kwargs['product_id'])
        next_sort_order = product.images.count()
        serializer.save(product=product, sort_order=next_sort_order)


class AdminProductImageDeleteView(generics.DestroyAPIView):
    queryset = ProductImage.objects.all()
    permission_classes = [IsAuthenticated, IsBakeryAdmin]


class AdminCustomCakeRequestListView(generics.ListAPIView):
    queryset = CustomCakeRequest.objects.all()
    serializer_class = AdminCustomCakeRequestSerializer
    permission_classes = [IsAuthenticated, IsBakeryAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']


class AdminCustomCakeRequestUpdateView(generics.UpdateAPIView):
    # Only status/quoted_price are writable (enforced by the serializer's
    # read_only_fields) — the baker triages and quotes, doesn't edit what
    # the customer actually asked for.
    queryset = CustomCakeRequest.objects.all()
    serializer_class = AdminCustomCakeRequestSerializer
    permission_classes = [IsAuthenticated, IsBakeryAdmin]

    def update(self, request, *args, **kwargs):
        previous_status = self.get_object().status
        response = super().update(request, *args, **kwargs)
        instance = self.get_object()
        if instance.status != previous_status:
            send_custom_cake_status_email(instance)
        return response