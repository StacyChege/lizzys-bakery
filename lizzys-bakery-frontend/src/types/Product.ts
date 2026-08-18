import axiosInstance from '../api/axiosInstance';
import type Category from './Category';

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

// Fetches ONE product by its slug — matches ProductDetailView's lookup_field = 'slug'
export default async function fetchProductDetail(slug: string): Promise<ProductDetail> {
  const response = await axiosInstance.get<ProductDetail>(`/products/${slug}/`);
  return response.data;
}