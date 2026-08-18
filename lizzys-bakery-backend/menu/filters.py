import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    # ?category=wedding-cakes — filters by the Category's slug, not its numeric id
    category = django_filters.CharFilter(field_name='category__slug', lookup_expr='exact')

    # ?search=chocolate — case-insensitive partial match on name OR description
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = Product
        fields = ['category', 'search']

    def filter_search(self, queryset, name, value):
        from django.db.models import Q
        return queryset.filter(
            Q(name__icontains=value) | Q(description__icontains=value)
        )