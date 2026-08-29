from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers

from .models import ClockRecord, DailyStock, SaleEntry, StaffMember


class StaffMemberPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffMember
        fields = ['id', 'name']


class ClockInSerializer(serializers.Serializer):
    staff_id = serializers.IntegerField()
    pin = serializers.CharField()

    def validate(self, attrs):
        try:
            staff = StaffMember.objects.get(id=attrs['staff_id'], is_active=True)
        except StaffMember.DoesNotExist:
            raise serializers.ValidationError('Staff member not found.')
        if not staff.check_pin(attrs['pin']):
            raise serializers.ValidationError('Incorrect PIN.')
        attrs['staff'] = staff
        return attrs


class DailyStockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    quantity_sold = serializers.SerializerMethodField()
    quantity_remaining = serializers.SerializerMethodField()

    class Meta:
        model = DailyStock
        fields = [
            'id', 'product', 'product_name', 'date',
            'quantity_stocked', 'quantity_sold', 'quantity_remaining',
        ]
        read_only_fields = ['date']

    def get_quantity_sold(self, obj):
        return SaleEntry.objects.filter(
            product=obj.product, created_at__date=obj.date
        ).aggregate(total=Sum('quantity'))['total'] or 0

    def get_quantity_remaining(self, obj):
        return obj.quantity_stocked - self.get_quantity_sold(obj)


class SaleEntrySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = SaleEntry
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'created_at']
        read_only_fields = ['unit_price', 'created_at']

    def validate(self, attrs):
        product = attrs['product']
        quantity = attrs['quantity']
        today = timezone.localdate()

        try:
            stock = DailyStock.objects.get(product=product, date=today)
        except DailyStock.DoesNotExist:
            raise serializers.ValidationError('No stock has been entered for this item today.')

        sold_so_far = SaleEntry.objects.filter(
            product=product, created_at__date=today
        ).aggregate(total=Sum('quantity'))['total'] or 0
        remaining = stock.quantity_stocked - sold_so_far

        if quantity > remaining:
            raise serializers.ValidationError(f'Only {remaining} left in stock today.')
        return attrs

    def create(self, validated_data):
        validated_data['unit_price'] = validated_data['product'].base_price
        validated_data['shift'] = self.context['request'].auth
        return super().create(validated_data)


class ShiftSummarySerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.name', read_only=True)
    sales = SaleEntrySerializer(many=True, read_only=True)
    total_quantity = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()

    class Meta:
        model = ClockRecord
        fields = [
            'staff_name', 'clock_in', 'clock_out',
            'total_quantity', 'total_revenue', 'sales',
        ]

    def get_total_quantity(self, obj):
        return sum(s.quantity for s in obj.sales.all())

    def get_total_revenue(self, obj):
        return sum(s.unit_price * s.quantity for s in obj.sales.all())
