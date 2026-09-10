import axiosInstance from './axiosInstance';
import type Testimonial from '../types/Testimonial';
import type { AdminTestimonial, AdminTestimonialInput } from '../types/Testimonial';

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const res = await axiosInstance.get<Testimonial[]>('/menu/testimonials/');
  return res.data;
}

export async function fetchAdminTestimonials(): Promise<AdminTestimonial[]> {
  const res = await axiosInstance.get<AdminTestimonial[]>('/menu/admin/testimonials/');
  return res.data;
}

export async function createTestimonial(data: AdminTestimonialInput): Promise<AdminTestimonial> {
  const res = await axiosInstance.post<AdminTestimonial>('/menu/admin/testimonials/', data);
  return res.data;
}

export async function updateTestimonial(
  id: number,
  data: Partial<AdminTestimonialInput>
): Promise<AdminTestimonial> {
  const res = await axiosInstance.patch<AdminTestimonial>(`/menu/admin/testimonials/${id}/`, data);
  return res.data;
}

export async function deleteTestimonial(id: number): Promise<void> {
  await axiosInstance.delete(`/menu/admin/testimonials/${id}/`);
}
