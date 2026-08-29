import axios from 'axios';
import axiosInstance from './axiosInstance';
import type {
  StaffMember,
  DailyStockItem,
  SaleEntry,
  ShiftSummary,
  AdminDailySummary,
} from '../types/StaffShift';

// A separate instance on purpose: the shared axiosInstance's interceptor
// refreshes JWTs and redirects to /login on 401, which is the wrong
// behaviour for the staff kiosk's own token scheme (a stale shift token
// should just prompt a re-clock-in, not bounce to the customer login page).
const staffAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

staffAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('staffShiftToken');
  if (token) {
    config.headers['X-Staff-Token'] = token;
  }
  return config;
});

export async function fetchRoster(): Promise<StaffMember[]> {
  const res = await staffAxios.get<StaffMember[]>('/staff/roster/');
  return res.data;
}

export async function clockIn(staffId: number, pin: string) {
  const res = await staffAxios.post<{
    token: string;
    staff_id: number;
    staff_name: string;
    clock_in: string;
  }>('/staff/clock-in/', { staff_id: staffId, pin });
  return res.data;
}

export async function clockOut(): Promise<ShiftSummary> {
  const res = await staffAxios.post<ShiftSummary>('/staff/clock-out/');
  return res.data;
}

export async function fetchMyShift(): Promise<ShiftSummary> {
  const res = await staffAxios.get<ShiftSummary>('/staff/me/shift/');
  return res.data;
}

export async function fetchTodayStock(): Promise<DailyStockItem[]> {
  const res = await staffAxios.get<DailyStockItem[]>('/staff/stock/');
  return res.data;
}

export async function setStock(productId: number, quantity: number): Promise<DailyStockItem> {
  const res = await staffAxios.post<DailyStockItem>('/staff/stock/', {
    product: productId,
    quantity_stocked: quantity,
  });
  return res.data;
}

export async function logSale(productId: number, quantity: number): Promise<SaleEntry> {
  const res = await staffAxios.post<SaleEntry>('/staff/sales/', {
    product: productId,
    quantity,
  });
  return res.data;
}

export async function fetchAdminSummary(date?: string): Promise<AdminDailySummary> {
  const res = await axiosInstance.get<AdminDailySummary>('/staff/summary/', {
    params: date ? { date } : {},
  });
  return res.data;
}
