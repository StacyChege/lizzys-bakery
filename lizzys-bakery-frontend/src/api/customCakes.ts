import axiosInstance from './axiosInstance';
import type CustomCakeRequest from '../types/CustomCakeRequest';

export async function submitCustomCakeRequest(data: CustomCakeRequest) {
  const { reference_images, ...fields } = data;

  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });
  reference_images.forEach((file) => formData.append('reference_images', file));

  const response = await axiosInstance.post('/menu/custom-cake-requests/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
