from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers
from .models import Category, CustomCakeRequest, Product, ProductImage

MIN_LEAD_DAYS = 5


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'sort_order']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'sort_order']


class ProductListSerializer(serializers.ModelSerializer):
    # lighter version for the menu grid — just the main image, not the full gallery
    category = serializers.StringRelatedField()  # shows category name instead of its ID
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'category', 'base_price', 'main_image', 'is_available']

    def get_main_image(self, obj):
        first_image = obj.images.first()  # relies on ProductImage's Meta ordering = ['sort_order']
        return first_image.image.url if first_image else None


class ProductDetailSerializer(serializers.ModelSerializer):
    # fuller version for the single product page — full gallery, flavours, sizes
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'description', 'base_price',
            'available_flavours', 'available_sizes', 'images',
            'is_available', 'is_made_to_order',
        ]


class CustomCakeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomCakeRequest
        # status/created_at are baker-managed, not customer-settable — omitted from input
        fields = [
            'id', 'name', 'email', 'phone_number', 'date_needed',
            'description', 'budget',
        ]

    def validate_date_needed(self, value):
        earliest = timezone.localdate() + timedelta(days=MIN_LEAD_DAYS)
        if value < earliest:
            raise serializers.ValidationError(
                f'Custom cake requests need at least {MIN_LEAD_DAYS} days notice — '
                f'earliest available date is {earliest.isoformat()}.'
            )
        return value