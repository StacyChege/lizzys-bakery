// src/api/auth.ts
import axiosInstance from './axiosInstance';

export const registerUser = (email: string, full_name: string, phone_number: string, password: string) =>
  axiosInstance.post('/auth/register/', { email, full_name, phone_number, password });

export const loginUser = (email: string, password: string) =>
  axiosInstance.post('/auth/login/', { email, password });

export const getMe = () => axiosInstance.get('/auth/me/');