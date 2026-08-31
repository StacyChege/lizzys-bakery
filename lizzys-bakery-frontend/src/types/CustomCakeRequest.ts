// Matches CustomCakeRequestSerializer's writable fields — status and
// created_at are baker-managed, set server-side, never sent by the client.
export default interface CustomCakeRequest {
  name: string;
  email: string;
  phone_number: string;
  date_needed: string; // ISO date string, e.g. "2026-09-01"
  description: string;
  budget?: number;
}

export type CustomCakeRequestStatus = 'PENDING' | 'REVIEWED' | 'QUOTED' | 'CONFIRMED' | 'DECLINED';

// The admin-facing shape — everything the customer submitted, plus the
// baker-managed status/quote. Matches AdminCustomCakeRequestSerializer.
export interface AdminCustomCakeRequest {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  date_needed: string;
  description: string;
  budget: string | null;
  status: CustomCakeRequestStatus;
  quoted_price: string | null;
  created_at: string;
}

export const CUSTOM_CAKE_STATUS_LABELS: Record<CustomCakeRequestStatus, string> = {
  PENDING: 'Pending',
  REVIEWED: 'Reviewed',
  QUOTED: 'Quoted',
  CONFIRMED: 'Confirmed',
  DECLINED: 'Declined',
};
