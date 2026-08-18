import axiosInstance from './axiosInstance';
import type Category from '../types/Category';

// This function does ONE thing: ask the backend for all categories.
// It doesn't touch React state at all — that happens in the component that calls this.
export async function fetchCategories(): Promise<Category[]> {
  // Added 'menu/' prefix to match Django's main urls.py path('api/menu/', ...)
  const response = await axiosInstance.get<Category[]>('/menu/categories/');
  return response.data;
}