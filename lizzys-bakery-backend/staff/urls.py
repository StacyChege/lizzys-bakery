from django.urls import path
from .views import (
    AdminDailySummaryView,
    ClockInView,
    ClockOutView,
    DailyStockView,
    MyShiftView,
    SaleEntryView,
    StaffRosterView,
)

urlpatterns = [
    path('roster/', StaffRosterView.as_view(), name='staff-roster'),
    path('clock-in/', ClockInView.as_view(), name='staff-clock-in'),
    path('clock-out/', ClockOutView.as_view(), name='staff-clock-out'),
    path('me/shift/', MyShiftView.as_view(), name='staff-my-shift'),
    path('stock/', DailyStockView.as_view(), name='staff-daily-stock'),
    path('sales/', SaleEntryView.as_view(), name='staff-sales'),
    path('summary/', AdminDailySummaryView.as_view(), name='staff-admin-summary'),
]
