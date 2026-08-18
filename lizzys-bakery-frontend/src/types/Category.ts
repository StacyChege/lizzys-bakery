// This matches CategorySerializer's fields exactly, in the same order Django returns them.
// TypeScript will now warn us if we try to use a field that doesn't exist — catches typos early.
export default interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string | null;   // Django sends null if no image was uploaded
  sort_order: number;
}