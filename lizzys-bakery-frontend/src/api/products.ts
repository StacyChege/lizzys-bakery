import axiosInstance from './axiosInstance';
import type Product from '../types/Product';
import type { ProductDetail } from '../types/Product';

export interface ProductFilters {
  category?: string;
  search?: string;
  flavour?: string;
  minPrice?: number;
  maxPrice?: number;
}

// All filters are optional — call with nothing to fetch everything.
export default async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  // Added 'menu/' prefix to match Django's main urls.py path('api/menu/', ...)
  const response = await axiosInstance.get<Product[]>('/menu/products/', {
    params: {
      category: filters.category,
      search: filters.search,
      flavour: filters.flavour,
      min_price: filters.minPrice,
      max_price: filters.maxPrice,
    },
  });
  return response.data;
}

// Fetches ONE product by its slug — matches ProductDetailView's lookup_field = 'slug'
export async function fetchProductDetail(slug: string): Promise<ProductDetail> {
  const response = await axiosInstance.get<ProductDetail>(`/menu/products/${slug}/`);
  return response.data;
}