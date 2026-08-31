from django.contrib import admin
from .models import Category, CustomCakeRequest, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    # lets you upload product photos directly from the Product edit page,
    # instead of managing ProductImage as a separate admin section
    model = ProductImage
    extra = 1


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
    list_display = ['name', 'date_needed', 'status', 'quoted_price', 'created_at']
    list_filter = ['status']
    list_editable = ['status', 'quoted_price']  # triage requests without opening each one
    search_fields = ['name', 'email', 'phone_number', 'description']
    readonly_fields = ['created_at']