// Matches the backend's MIN_LEAD_DAYS in both CustomCakeRequestSerializer
// and OrderCreateSerializer, and the policy stated in the Footer — keep
// all of these in sync if it ever changes. Used by both the Custom Cake
// form and regular checkout, since the PRD applies the same 5-day rule
// to every order, custom or not.
export const MIN_LEAD_DAYS = 5;

export function earliestAllowedDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + MIN_LEAD_DAYS);
  return date;
}

export function isValidOrderDate(date: Date): boolean {
  return date.getTime() >= earliestAllowedDate().setHours(0, 0, 0, 0);
}

// date.toISOString() converts to UTC first — in any timezone ahead of UTC
// (Kenya is UTC+3, this app's actual market), a date picked as local
// midnight rolls back to the previous day once converted, silently
// submitting the wrong date to the backend. Format from the Date's own
// local fields instead, no timezone conversion involved.
export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
