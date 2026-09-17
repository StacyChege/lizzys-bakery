import django_filters
from .models import Order


class OrderFilter(django_filters.FilterSet):
    # PRD F8: the order inbox must be filterable by status and date.
    # date_needed is exact-match ("show me what's due on this day");
    # date_from/date_to let the baker widen that to a range (e.g. "this week").
    date_needed = django_filters.DateFilter(field_name='date_needed', lookup_expr='exact')
    date_from = django_filters.DateFilter(field_name='date_needed', lookup_expr='gte')
    date_to = django_filters.DateFilter(field_name='date_needed', lookup_expr='lte')

    class Meta:
        model = Order
        fields = ['status', 'date_needed', 'date_from', 'date_to']
