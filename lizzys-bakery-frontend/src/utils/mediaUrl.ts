// Django returns media (product photos, etc.) as paths relative to the backend host,
// e.g. "/media/products/x.jpg" — not the "/api" host axios talks to. Strip the API
// suffix to get the backend origin and prefix relative paths with it.
const BACKEND_ORIGIN = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '');

export default function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BACKEND_ORIGIN}${path}`;
}
