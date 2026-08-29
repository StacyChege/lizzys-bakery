import uuid

from django.contrib.auth.hashers import check_password, make_password
from django.db import models
from django.utils import timezone


class StaffMember(models.Model):
    # Deliberately not a full User account — a PIN is enough for an
    # in-person kiosk flow, and staff don't need email/password logins
    # just to clock in and log a sale.
    name = models.CharField(max_length=100)
    pin_hash = models.CharField(max_length=128)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def set_pin(self, raw_pin):
        self.pin_hash = make_password(raw_pin)

    def check_pin(self, raw_pin):
        return check_password(raw_pin, self.pin_hash)

    def __str__(self):
        return self.name


class ClockRecord(models.Model):
    # Clocking in IS the login — there's no separate auth step. The token
    # returned here is the bearer credential for every staff action until
    # clock-out closes it.
    staff = models.ForeignKey(StaffMember, on_delete=models.CASCADE, related_name='shifts')
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    clock_in = models.DateTimeField(auto_now_add=True)
    clock_out = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-clock_in']

    def __str__(self):
        return f"{self.staff.name} — {self.clock_in:%Y-%m-%d %H:%M}"


class DailyStock(models.Model):
    # What's available to sell today, entered once per product per day.
    # Only references existing menu Products — no separate item catalog.
    date = models.DateField(default=timezone.localdate)
    product = models.ForeignKey('menu.Product', on_delete=models.CASCADE, related_name='daily_stock')
    quantity_stocked = models.PositiveIntegerField()

    class Meta:
        unique_together = ('date', 'product')
        ordering = ['product__name']

    def __str__(self):
        return f"{self.product.name} — {self.date} ({self.quantity_stocked})"


class SaleEntry(models.Model):
    # unit_price is a snapshot at sale time, not a live lookup — so a later
    # price change on the Product doesn't rewrite history.
    shift = models.ForeignKey(ClockRecord, on_delete=models.CASCADE, related_name='sales')
    product = models.ForeignKey('menu.Product', on_delete=models.PROTECT, related_name='sale_entries')
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.quantity} x {self.product.name} by {self.shift.staff.name}"
