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
