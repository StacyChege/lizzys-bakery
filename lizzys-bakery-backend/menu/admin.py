from django.contrib import admin
from .models import (
    Category,
    CustomCakeReferenceImage,
    CustomCakeRequest,
    Product,
    ProductImage,
    Testimonial,
)


class ProductImageInline(admin.TabularInline):
    # lets you upload product photos directly from the Product edit page,
    # instead of managing ProductImage as a separate admin section
    model = ProductImage
    extra = 1


class CustomCakeReferenceImageInline(admin.TabularInline):
    model = CustomCakeReferenceImage
    extra = 0
    readonly_fields = ['uploaded_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'sort_order']
    prepopulated_fields = {'slug': ('name',)}  # auto-fills slug field in the admin form as you type


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'base_price', 'is_available']
    list_filter = ['category', 'is_available']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]


@admin.register(CustomCakeRequest)
class CustomCakeRequestAdmin(admin.ModelAdmin):
    list_display = ['name', 'occasion', 'date_needed', 'status', 'quoted_price', 'created_at']
    list_filter = ['status', 'occasion']
    list_editable = ['status', 'quoted_price']  # triage requests without opening each one
    search_fields = ['name', 'email', 'phone_number', 'special_notes']
    readonly_fields = ['created_at']
    inlines = [CustomCakeReferenceImageInline]


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['author_name', 'occasion', 'is_published', 'sort_order', 'created_at']
    list_filter = ['is_published']
    list_editable = ['is_published', 'sort_order']
    search_fields = ['author_name', 'quote']
    readonly_fields = ['created_at']