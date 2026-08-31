from django.urls import path
from .views import (
    AdminCategoryDetailView,
    AdminCategoryListCreateView,
    AdminCustomCakeRequestListView,
    AdminCustomCakeRequestUpdateView,
    AdminProductDetailView,
    AdminProductListCreateView,
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

    path('admin/categories/', AdminCategoryListCreateView.as_view(), name='admin-category-list-create'),
    path('admin/categories/<int:pk>/', AdminCategoryDetailView.as_view(), name='admin-category-detail'),
    path('admin/products/', AdminProductListCreateView.as_view(), name='admin-product-list-create'),
    path('admin/products/<int:pk>/', AdminProductDetailView.as_view(), name='admin-product-detail'),
    path(
        'admin/custom-cake-requests/',
        AdminCustomCakeRequestListView.as_view(),
        name='admin-custom-cake-request-list',
    ),
    path(
        'admin/custom-cake-requests/<int:pk>/',
        AdminCustomCakeRequestUpdateView.as_view(),
        name='admin-custom-cake-request-update',
    ),
]
