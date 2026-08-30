from datetime import timedelta

from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from menu.models import Product
from .models import DeliveryZone, Order, OrderItem

MIN_LEAD_DAYS = 5


class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = ['id', 'name', 'fee']


class AdminDeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = ['id', 'name', 'fee', 'is_active']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'flavour', 'size_label', 'unit_price', 'quantity']


class OrderItemInputSerializer(serializers.Serializer):
    # What the frontend cart actually has: a product id, quantity, and
    # whichever flavour/size were picked (both optional).
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)
    flavour = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    size_label = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class OrderSerializer(serializers.ModelSerializer):
    # Read-only view — used for both the customer's own order history and
    # the admin inbox, since nothing on an order is sensitive between the
    # two once you already know it's yours or you're the admin.
    items = OrderItemSerializer(many=True, read_only=True)
    delivery_zone = DeliveryZoneSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'contact_name', 'contact_phone', 'contact_email',
            'date_needed', 'fulfilment_method', 'delivery_zone', 'delivery_address',
            'delivery_fee', 'notes', 'status', 'subtotal', 'total',
            'created_at', 'items',
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemInputSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'contact_name', 'contact_phone', 'contact_email',
            'date_needed', 'fulfilment_method', 'delivery_zone', 'delivery_address',
            'notes', 'items',
        ]

    def validate_date_needed(self, value):
        earliest = timezone.localdate() + timedelta(days=MIN_LEAD_DAYS)
        if value < earliest:
            raise serializers.ValidationError(
                f'Orders need at least {MIN_LEAD_DAYS} days notice — '
                f'earliest available date is {earliest.isoformat()}.'
            )
        return value

    def validate(self, attrs):
        if not attrs.get('items'):
            raise serializers.ValidationError({'items': 'Your cart is empty.'})

        method = attrs.get('fulfilment_method')
        if method == Order.BAKERY_DELIVERY:
            if not attrs.get('delivery_zone'):
                raise serializers.ValidationError(
                    {'delivery_zone': 'Choose a delivery zone for bakery delivery.'}
                )
            if not attrs.get('delivery_address', '').strip():
                raise serializers.ValidationError(
                    {'delivery_address': 'Delivery address is required for bakery delivery.'}
                )
        elif method == Order.OWN_DELIVERY and not attrs.get('delivery_address', '').strip():
            raise serializers.ValidationError(
                {'delivery_address': 'Enter the address your rider will collect from/deliver to.'}
            )
        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        delivery_zone = validated_data.get('delivery_zone')
        delivery_fee = delivery_zone.fee if delivery_zone else 0

        # Prices come from the live Product, never trusting whatever the
        # client sent — a stale cart shouldn't be able to check out at an
        # old price.
        subtotal = 0
        line_items = []
        for item in items_data:
            product = item['product']
            unit_price = product.base_price
            quantity = item['quantity']
            subtotal += unit_price * quantity
            line_items.append({
                'product': product,
                'product_name': product.name,
                'flavour': item.get('flavour') or '',
                'size_label': item.get('size_label') or '',
                'unit_price': unit_price,
                'quantity': quantity,
            })

        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None

        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                delivery_fee=delivery_fee,
                subtotal=subtotal,
                total=subtotal + delivery_fee,
                **validated_data,
            )
            OrderItem.objects.bulk_create([
                OrderItem(order=order, **line) for line in line_items
            ])
        return order

    def to_representation(self, instance):
        # Return the fuller read shape (items, totals, etc.) after create,
        # not just the writable input fields.
        return OrderSerializer(instance, context=self.context).data


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']
