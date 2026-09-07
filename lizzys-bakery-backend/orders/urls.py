from django.urls import path
from .views import (
    AdminBlockedDateDeleteView,
    AdminBlockedDateListCreateView,
    AdminDeliveryZoneDetailView,
    AdminDeliveryZoneListCreateView,
    AdminOrderListView,
    AdminOrderStatusUpdateView,
    AdminStatsView,
    AdminUpcomingBookingsView,
    BlockedDateListView,
    DeliveryZoneListView,
    MyOrdersListView,
    OrderCreateView,
)

urlpatterns = [
    path('', OrderCreateView.as_view(), name='order-create'),
    path('mine/', MyOrdersListView.as_view(), name='order-mine'),
    path('delivery-zones/', DeliveryZoneListView.as_view(), name='delivery-zone-list'),
    path('blocked-dates/', BlockedDateListView.as_view(), name='blocked-date-list'),

    path('admin/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-order-stats'),
    path('admin/upcoming-bookings/', AdminUpcomingBookingsView.as_view(), name='admin-upcoming-bookings'),
    path('admin/<int:pk>/', AdminOrderStatusUpdateView.as_view(), name='admin-order-status-update'),
    path('admin/delivery-zones/', AdminDeliveryZoneListCreateView.as_view(), name='admin-delivery-zone-list-create'),
    path('admin/delivery-zones/<int:pk>/', AdminDeliveryZoneDetailView.as_view(), name='admin-delivery-zone-detail'),
    path('admin/blocked-dates/', AdminBlockedDateListCreateView.as_view(), name='admin-blocked-date-list-create'),
    path('admin/blocked-dates/<int:pk>/', AdminBlockedDateDeleteView.as_view(), name='admin-blocked-date-delete'),
]
