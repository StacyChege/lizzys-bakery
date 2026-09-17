import axiosInstance from './axiosInstance';
import type SiteSettings from '../types/SiteSettings';

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const res = await axiosInstance.get<SiteSettings>('/menu/site-settings/');
  return res.data;
}

export async function fetchAdminSiteSettings(): Promise<SiteSettings> {
  const res = await axiosInstance.get<SiteSettings>('/menu/admin/site-settings/');
  return res.data;
}

export async function updateHeroImage(file: File): Promise<SiteSettings> {
  const formData = new FormData();
  formData.append('hero_image', file);
  const res = await axiosInstance.patch<SiteSettings>('/menu/admin/site-settings/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function resetHeroImage(): Promise<SiteSettings> {
  const res = await axiosInstance.delete<SiteSettings>('/menu/admin/site-settings/');
  return res.data;
}
