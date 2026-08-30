export interface DeliveryZone {
  id: number;
  name: string;
  fee: string;
}

export interface AdminDeliveryZone extends DeliveryZone {
  is_active: boolean;
}

export interface OrderItem {
  id: number;
  product: number | null;
  product_name: string;
  flavour: string;
  size_label: string;
  unit_price: string;
  quantity: number;
}

export type FulfilmentMethod = 'PICKUP' | 'OWN_DELIVERY' | 'BAKERY_DELIVERY';

export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'IN_KITCHEN'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Order {
  id: number;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  date_needed: string;
  fulfilment_method: FulfilmentMethod;
  delivery_zone: DeliveryZone | null;
  delivery_address: string;
  delivery_fee: string;
  notes: string;
  status: OrderStatus;
  subtotal: string;
  total: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItemInput {
  product: number;
  quantity: number;
  flavour?: string;
  size_label?: string;
}

export interface OrderCreateInput {
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  date_needed: string;
  fulfilment_method: FulfilmentMethod;
  delivery_zone?: number;
  delivery_address?: string;
  notes?: string;
  items: OrderItemInput[];
}

export interface MostOrderedItem {
  product_name: string;
  total_quantity: number;
}

export interface AdminStats {
  orders_this_week: number;
  orders_this_month: number;
  revenue_this_week: number;
  revenue_this_month: number;
  most_ordered_items: MostOrderedItem[];
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: 'Pending Confirmation',
  CONFIRMED: 'Confirmed',
  IN_KITCHEN: 'In the Kitchen',
  READY: 'Ready for Pickup / Out for Delivery',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};
