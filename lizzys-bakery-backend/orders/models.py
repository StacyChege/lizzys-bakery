from django.conf import settings
from django.db import models


class DeliveryZone(models.Model):
    name = models.CharField(max_length=100)
    fee = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)  # inactive zones stop showing at checkout without deleting history

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f'{self.name} (KES {self.fee})'


class Order(models.Model):
    PENDING_CONFIRMATION = 'PENDING_CONFIRMATION'
    CONFIRMED = 'CONFIRMED'
    IN_KITCHEN = 'IN_KITCHEN'
    READY = 'READY'
    COMPLETED = 'COMPLETED'
    CANCELLED = 'CANCELLED'
    STATUS_CHOICES = [
        (PENDING_CONFIRMATION, 'Pending Confirmation'),
        (CONFIRMED, 'Confirmed'),
        (IN_KITCHEN, 'In the Kitchen'),
        (READY, 'Ready for Pickup / Out for Delivery'),
        (COMPLETED, 'Completed'),
        (CANCELLED, 'Cancelled'),
    ]

    PICKUP = 'PICKUP'
    OWN_DELIVERY = 'OWN_DELIVERY'
    BAKERY_DELIVERY = 'BAKERY_DELIVERY'
    FULFILMENT_CHOICES = [
        (PICKUP, 'Pickup at Bakery'),
        (OWN_DELIVERY, "Customer's Own Delivery/Rider"),
        (BAKERY_DELIVERY, 'Bakery Delivery'),
    ]

    # Nullable — guest checkout is allowed (PRD 2.1), so not every order has
    # an account behind it. Contact fields are always captured regardless.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders'
    )
    contact_name = models.CharField(max_length=150)
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField(blank=True)

    date_needed = models.DateField()
    fulfilment_method = models.CharField(max_length=20, choices=FULFILMENT_CHOICES)
    delivery_zone = models.ForeignKey(
        DeliveryZone, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders'
    )
    delivery_address = models.CharField(max_length=255, blank=True)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)

    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default=PENDING_CONFIRMATION)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Order #{self.id} — {self.contact_name}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    # SET_NULL, not PROTECT — a discontinued product shouldn't be stuck
    # forever just because an old order references it. product_name/
    # unit_price are snapshotted below so the order stays readable either way.
    product = models.ForeignKey('menu.Product', on_delete=models.SET_NULL, null=True, related_name='order_items')
    product_name = models.CharField(max_length=150)
    flavour = models.CharField(max_length=100, blank=True)
    size_label = models.CharField(max_length=100, blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f'{self.quantity} x {self.product_name}'
