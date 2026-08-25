// Matches the backend's CustomCakeRequestSerializer.MIN_LEAD_DAYS and the
// policy stated in the Footer — keep these three in sync if it ever changes.
export const MIN_LEAD_DAYS = 5;

export function earliestCakeDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + MIN_LEAD_DAYS);
  return date;
}

export function isValidCakeDate(date: Date): boolean {
  return date.getTime() >= earliestCakeDate().setHours(0, 0, 0, 0);
}
