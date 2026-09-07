// Matches CustomCakeRequestSerializer's writable fields — status and
// created_at are baker-managed, set server-side, never sent by the client.
// Submitted as multipart/form-data (not JSON) so reference photos can ride
// along — see api/customCakes.ts.
export default interface CustomCakeRequest {
  name: string;
  email: string;
  phone_number: string;
  date_needed: string; // ISO date string, e.g. "2026-09-01"
  occasion: string;
  tier_count: number;
  servings?: number;
  flavour: string;
  filling: string;
  frosting_style: string;
  colour_theme: string; // comma-joined, e.g. "Pink, Gold"
  toppings: string; // comma-joined, e.g. "Fresh Flowers, Custom Message/Name"
  custom_message?: string;
  special_notes?: string;
  budget?: number;
  reference_images: File[]; // up to 3, handled separately from the JSON-like fields
}

export type CustomCakeRequestStatus = 'PENDING' | 'REVIEWED' | 'QUOTED' | 'CONFIRMED' | 'DECLINED';

export interface CustomCakeReferenceImage {
  id: number;
  image: string;
}

// The admin-facing shape — everything the customer submitted, plus the
// baker-managed status/quote. Matches AdminCustomCakeRequestSerializer.
export interface AdminCustomCakeRequest {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  date_needed: string;
  occasion: string;
  tier_count: number;
  servings: number | null;
  flavour: string;
  filling: string;
  frosting_style: string;
  colour_theme: string;
  toppings: string;
  custom_message: string;
  special_notes: string;
  reference_images: CustomCakeReferenceImage[];
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
