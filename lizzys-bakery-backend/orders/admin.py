from django.contrib import admin
from .models import DeliveryZone, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'product_name', 'flavour', 'size_label', 'unit_price', 'quantity']
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'contact_name', 'status', 'fulfilment_method', 'date_needed', 'total', 'created_at']
    list_filter = ['status', 'fulfilment_method']
    list_editable = ['status']
    search_fields = ['contact_name', 'contact_phone', 'contact_email']
    readonly_fields = ['subtotal', 'total', 'delivery_fee', 'created_at', 'updated_at']
    inlines = [OrderItemInline]


@admin.register(DeliveryZone)
class DeliveryZoneAdmin(admin.ModelAdmin):
    list_display = ['name', 'fee', 'is_active']
    list_editable = ['fee', 'is_active']
