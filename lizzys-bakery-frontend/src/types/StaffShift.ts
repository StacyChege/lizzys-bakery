export interface StaffMember {
  id: number;
  name: string;
}

export interface SaleEntry {
  id: number;
  product: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  created_at: string;
}

export interface DailyStockItem {
  id: number;
  product: number;
  product_name: string;
  date: string;
  quantity_stocked: number;
  quantity_sold: number;
  quantity_remaining: number;
}

export interface ShiftSummary {
  staff_name: string;
  clock_in: string;
  clock_out: string | null;
  total_quantity: number;
  total_revenue: number;
  sales: SaleEntry[];
}

export interface AdminDailySummary {
  date: string;
  by_staff: ShiftSummary[];
  grand_total_quantity: number;
  grand_total_revenue: number;
}
