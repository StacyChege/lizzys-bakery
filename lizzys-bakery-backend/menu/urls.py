from django.urls import path
from .views import (
    CategoryListView,
    CustomCakeRequestCreateView,
    ProductListView,
    ProductDetailView,
)

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),
    path('custom-cake-requests/', CustomCakeRequestCreateView.as_view(), name='custom-cake-request-create'),
]
