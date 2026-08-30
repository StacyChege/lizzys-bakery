from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import DeliveryZone, Order
from .permissions import IsBakeryAdmin
from .serializers import (
    AdminDeliveryZoneSerializer,
    DeliveryZoneSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
)


class DeliveryZoneListView(generics.ListAPIView):
    # Public — needed on the checkout page before the customer is necessarily logged in
    queryset = DeliveryZone.objects.filter(is_active=True)
    serializer_class = DeliveryZoneSerializer
    permission_classes = [AllowAny]


class OrderCreateView(generics.CreateAPIView):
    # Public — guest checkout is allowed (PRD 2.1); perform_create still
    # attaches the user when a session/JWT is present.
    queryset = Order.objects.all()
    serializer_class = OrderCreateSerializer
    permission_classes = [AllowAny]


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
        # After saving, hand back the full order shape, not just {"status": ...}
        response = super().update(request, *args, **kwargs)
        instance = self.get_object()
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
