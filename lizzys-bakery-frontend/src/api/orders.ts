import axiosInstance from './axiosInstance';
import type {
  AdminDeliveryZone,
  DeliveryZone,
  Order,
  OrderCreateInput,
  OrderStatus,
} from '../types/Order';

export async function fetchDeliveryZones(): Promise<DeliveryZone[]> {
  const res = await axiosInstance.get<DeliveryZone[]>('/orders/delivery-zones/');
  return res.data;
}

export async function submitOrder(data: OrderCreateInput): Promise<Order> {
  const res = await axiosInstance.post<Order>('/orders/', data);
  return res.data;
}

export async function fetchMyOrders(): Promise<Order[]> {
  const res = await axiosInstance.get<Order[]>('/orders/mine/');
  return res.data;
}

export async function fetchAdminOrders(status?: OrderStatus): Promise<Order[]> {
  const res = await axiosInstance.get<Order[]>('/orders/admin/', {
    params: status ? { status } : {},
  });
  return res.data;
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  const res = await axiosInstance.patch<Order>(`/orders/admin/${id}/`, { status });
  return res.data;
}

export async function fetchAdminDeliveryZones(): Promise<AdminDeliveryZone[]> {
  const res = await axiosInstance.get<AdminDeliveryZone[]>('/orders/admin/delivery-zones/');
  return res.data;
}

export async function createDeliveryZone(name: string, fee: string): Promise<AdminDeliveryZone> {
  const res = await axiosInstance.post<AdminDeliveryZone>('/orders/admin/delivery-zones/', {
    name,
    fee,
    is_active: true,
  });
  return res.data;
}

export async function updateDeliveryZone(
  id: number,
  data: Partial<Pick<AdminDeliveryZone, 'name' | 'fee' | 'is_active'>>
): Promise<AdminDeliveryZone> {
  const res = await axiosInstance.patch<AdminDeliveryZone>(`/orders/admin/delivery-zones/${id}/`, data);
  return res.data;
}

export async function deleteDeliveryZone(id: number): Promise<void> {
  await axiosInstance.delete(`/orders/admin/delivery-zones/${id}/`);
}
