import type Category from './Category';

// Matches ProductListSerializer — the lighter shape used on the menu grid
export default interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;    // StringRelatedField — just the category name here, not the full object
  base_price: string;  // Decimal serialized as string by DRF
  main_image: string | null;
  is_available: boolean;
}

// Matches ProductImage model — one photo in a product's gallery
export interface ProductImage {
  id: number;
  image: string;       // the photo URL
  sort_order: number;
}

// Matches ProductDetailSerializer exactly — this is a DIFFERENT, fuller shape
// than the `Product` interface above, which only matches the list version.
export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  category: Category;              // full nested object here, NOT just a string like in the list version
  description: string;
  base_price: string;              // still a string — same reason as before, it's a Decimal from Django
  available_flavours: string[];
  available_sizes: { label: string; price_modifier: number }[];
  images: ProductImage[];
  is_available: boolean;
  is_made_to_order: boolean;
}
