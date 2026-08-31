import axiosInstance from './axiosInstance';
import type Category from '../types/Category';
import type AdminProduct from '../types/AdminProduct';
import type { AdminProductInput } from '../types/AdminProduct';
import type { AdminCustomCakeRequest, CustomCakeRequestStatus } from '../types/CustomCakeRequest';

export async function fetchAdminCategories(): Promise<Category[]> {
  const res = await axiosInstance.get<Category[]>('/menu/admin/categories/');
  return res.data;
}

export async function createCategory(name: string, description: string): Promise<Category> {
  const res = await axiosInstance.post<Category>('/menu/admin/categories/', { name, description });
  return res.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await axiosInstance.delete(`/menu/admin/categories/${id}/`);
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const res = await axiosInstance.get<AdminProduct[]>('/menu/admin/products/');
  return res.data;
}

export async function createProduct(data: AdminProductInput): Promise<AdminProduct> {
  const res = await axiosInstance.post<AdminProduct>('/menu/admin/products/', data);
  return res.data;
}

export async function updateProduct(
  id: number,
  data: Partial<AdminProductInput>
): Promise<AdminProduct> {
  const res = await axiosInstance.patch<AdminProduct>(`/menu/admin/products/${id}/`, data);
  return res.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await axiosInstance.delete(`/menu/admin/products/${id}/`);
}

export async function fetchAdminCustomCakeRequests(
  status?: CustomCakeRequestStatus
): Promise<AdminCustomCakeRequest[]> {
  const res = await axiosInstance.get<AdminCustomCakeRequest[]>('/menu/admin/custom-cake-requests/', {
    params: status ? { status } : {},
  });
  return res.data;
}

export async function updateCustomCakeRequest(
  id: number,
  data: { status?: CustomCakeRequestStatus; quoted_price?: string }
): Promise<AdminCustomCakeRequest> {
  const res = await axiosInstance.patch<AdminCustomCakeRequest>(
    `/menu/admin/custom-cake-requests/${id}/`,
    data
  );
  return res.data;
}
