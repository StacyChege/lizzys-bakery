import axiosInstance from './axiosInstance';
import type CustomCakeRequest from '../types/CustomCakeRequest';

export async function submitCustomCakeRequest(data: CustomCakeRequest) {
  const response = await axiosInstance.post('/menu/custom-cake-requests/', data);
  return response.data;
}
