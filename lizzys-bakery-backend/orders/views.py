from datetime import timedelta

from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from menu.models import CustomCakeRequest
from .emails import send_order_confirmation_email, send_order_status_email
from .models import BlockedDate, DeliveryZone, Order, OrderItem
from .permissions import IsBakeryAdmin
from .serializers import (
    AdminBlockedDateSerializer,
    AdminDeliveryZoneSerializer,
    BlockedDateSerializer,
    DeliveryZoneSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
)

UPCOMING_BOOKINGS_WINDOW_DAYS = 60


class DeliveryZoneListView(generics.ListAPIView):
    # Public — needed on the checkout page before the customer is necessarily logged in
    queryset = DeliveryZone.objects.filter(is_active=True)
    serializer_class = DeliveryZoneSerializer
    permission_classes = [AllowAny]


class BlockedDateListView(generics.ListAPIView):
    # Public — the checkout and custom cake date pickers use this to grey
    # out unavailable dates before the customer even tries to submit.
    serializer_class = BlockedDateSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return BlockedDate.objects.filter(date__gte=timezone.localdate())


class OrderCreateView(generics.CreateAPIView):
    # Public — guest checkout is allowed (PRD 2.1); perform_create still
    # attaches the user when a session/JWT is present.
    queryset = Order.objects.all()
    serializer_class = OrderCreateSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.save()
        send_order_confirmation_email(serializer.instance)


class MyOrdersListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items')


class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.all().prefetch_related('items')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsBakeryAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']


class AdminOrderStatusUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderStatusUpdateSerializer
    permission_classes = [IsAuthenticated, IsBakeryAdmin]

    def update(self, request, *args, **kwargs):
        previous_status = self.get_object().status
        # After saving, hand back the full order shape, not just {"status": ...}
        response = super().update(request, *args, **kwargs)
        instance = self.get_object()
        if instance.status != previous_status:
            send_order_status_email(instance)
        response.data = OrderSerializer(instance).data
        return response


class AdminDeliveryZoneListCreateView(generics.ListCreateAPIView):
    queryset = DeliveryZone.objects.all()
    serializer_class = AdminDeliveryZoneSerializer
    permission_classes = [IsAuthenticated, IsBakeryAdmin]


class AdminDeliveryZoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DeliveryZone.objects.all()
    serializer_class = AdminDeliveryZoneSerializer
    permission_classes = [IsAuthenticated, IsBakeryAdmin]


class AdminBlockedDateListCreateView(generics.ListCreateAPIView):
    queryset = BlockedDate.objects.all()
    serializer_class = AdminBlockedDateSerializer
    permission_classes = [IsAuthenticated, IsBakeryAdmin]


class AdminBlockedDateDeleteView(generics.DestroyAPIView):
    queryset = BlockedDate.objects.all()
    permission_classes = [IsAuthenticated, IsBakeryAdmin]


class AdminUpcomingBookingsView(APIView):
    # Gives the baker enough visibility to decide when a date is "full" and
    # block it herself — there's no automatic numeric cap (see BlockedDate).
    permission_classes = [IsAuthenticated, IsBakeryAdmin]

    def get(self, request):
        today = timezone.localdate()
        end = today + timedelta(days=UPCOMING_BOOKINGS_WINDOW_DAYS)

        order_counts = dict(
            Order.objects.exclude(status=Order.CANCELLED)
            .filter(date_needed__gte=today, date_needed__lte=end)
            .values_list('date_needed')
            .annotate(count=Count('id'))
        )
        cake_counts = dict(
            CustomCakeRequest.objects.exclude(status=CustomCakeRequest.DECLINED)
            .filter(date_needed__gte=today, date_needed__lte=end)
            .values_list('date_needed')
            .annotate(count=Count('id'))
        )
        blocked_dates = set(
            BlockedDate.objects.filter(date__gte=today, date__lte=end).values_list('date', flat=True)
        )

        all_dates = set(order_counts) | set(cake_counts) | blocked_dates
        results = [
            {
                'date': date.isoformat(),
                'order_count': order_counts.get(date, 0) + cake_counts.get(date, 0),
                'is_blocked': date in blocked_dates,
            }
            for date in sorted(all_dates)
        ]
        return Response(results)


class AdminStatsView(APIView):
    # Cancelled orders never happened as far as revenue/volume are
    # concerned, so every figure here excludes them.
    permission_classes = [IsAuthenticated, IsBakeryAdmin]

    def get(self, request):
        today = timezone.localdate()
        week_start = today - timedelta(days=today.weekday())
        month_start = today.replace(day=1)

        active_orders = Order.objects.exclude(status=Order.CANCELLED)
        this_week = active_orders.filter(created_at__date__gte=week_start)
        this_month = active_orders.filter(created_at__date__gte=month_start)

        most_ordered = (
            OrderItem.objects.exclude(order__status=Order.CANCELLED)
            .values('product_name')
            .annotate(total_quantity=Sum('quantity'))
            .order_by('-total_quantity')[:5]
        )

        return Response({
            'orders_this_week': this_week.count(),
            'orders_this_month': this_month.count(),
            'revenue_this_week': this_week.aggregate(total=Sum('total'))['total'] or 0,
            'revenue_this_month': this_month.aggregate(total=Sum('total'))['total'] or 0,
            'most_ordered_items': list(most_ordered),
        })
