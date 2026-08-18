import axiosInstance from './axiosInstance';
import type Product  from '../types/Product';
import type ProductDetail from '../types/Product';

// category and search are both optional — if you don't pass them, we fetch everything.
// This one function will be reused for both Hr 1 (no filters) and Hr 2 (with filters).
export default async function fetchProducts(category?: string, search?: string): Promise<Product[]> {
  // Added 'menu/' prefix to match Django's main urls.py path('api/menu/', ...)
  const response = await axiosInstance.get<Product[]>('/menu/products/', {
    params: { category, search },
  });
  return response.data;
}

// Fetches ONE product by its slug — matches ProductDetailView's lookup_field = 'slug'
export async function fetchProductDetail(slug: string): Promise<ProductDetail> {
  const response = await axiosInstance.get<ProductDetail>(`/menu/products/${slug}/`);
  return response.data;
}