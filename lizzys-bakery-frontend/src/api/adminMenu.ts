import axiosInstance from './axiosInstance';
import type Category from '../types/Category';
import type AdminProduct from '../types/AdminProduct';
import type { AdminProductInput } from '../types/AdminProduct';

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
