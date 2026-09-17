import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    # ?category=wedding-cakes — filters by the Category's slug, not its numeric id
    category = django_filters.CharFilter(field_name='category__slug', lookup_expr='exact')

    # ?search=chocolate — case-insensitive partial match on name, description,
    # category name, or flavour. PRD F1 gives "graduation" as an example
    # search term, but that word only ever appears in the Category name
    # ("Graduation Cakes"), never in a product's own name/description — so
    # category name has to be part of this or that example returns nothing.
    search = django_filters.CharFilter(method='filter_search')

    # ?flavour=vanilla — matches any entry in the available_flavours JSON list.
    # Filtered in Python rather than a DB lookup: available_flavours is a plain
    # JSONField list (["Vanilla", "Red Velvet", ...]), and a portable
    # case-insensitive "any element contains this" query isn't expressible as
    # a single ORM lookup across both sqlite (tests) and Postgres (prod).
    # Menu sizes here are small (tens of products), so this is cheap.
    flavour = django_filters.CharFilter(method='filter_flavour')

    min_price = django_filters.NumberFilter(field_name='base_price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='base_price', lookup_expr='lte')

    class Meta:
        model = Product
        fields = ['category', 'search', 'flavour', 'min_price', 'max_price']

    def filter_search(self, queryset, name, value):
        from django.db.models import Q
        needle = value.lower()
        flavour_matches = [
            product.id for product in queryset
            if any(needle in (flavour or '').lower() for flavour in product.available_flavours)
        ]
        return queryset.filter(
            Q(name__icontains=value)
            | Q(description__icontains=value)
            | Q(category__name__icontains=value)
            | Q(id__in=flavour_matches)
        )

    def filter_flavour(self, queryset, name, value):
        needle = value.lower()
        matching_ids = [
            product.id for product in queryset
            if any(needle in (flavour or '').lower() for flavour in product.available_flavours)
        ]
        return queryset.filter(id__in=matching_ids)