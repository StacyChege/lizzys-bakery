from django.urls import path
from .views import (
    AdminDeliveryZoneDetailView,
    AdminDeliveryZoneListCreateView,
    AdminOrderListView,
    AdminOrderStatusUpdateView,
    DeliveryZoneListView,
    MyOrdersListView,
    OrderCreateView,
)

urlpatterns = [
    path('', OrderCreateView.as_view(), name='order-create'),
    path('mine/', MyOrdersListView.as_view(), name='order-mine'),
    path('delivery-zones/', DeliveryZoneListView.as_view(), name='delivery-zone-list'),

    path('admin/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/<int:pk>/', AdminOrderStatusUpdateView.as_view(), name='admin-order-status-update'),
    path('admin/delivery-zones/', AdminDeliveryZoneListCreateView.as_view(), name='admin-delivery-zone-list-create'),
    path('admin/delivery-zones/<int:pk>/', AdminDeliveryZoneDetailView.as_view(), name='admin-delivery-zone-detail'),
]
