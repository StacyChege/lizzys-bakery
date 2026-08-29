// Matches AdminProductSerializer — category is a plain FK id here, unlike
// the public Product/ProductDetail types which nest the category object/name.
export default interface AdminProduct {
  id: number;
  category: number;
  name: string;
  slug: string;
  description: string;
  base_price: string;
  available_flavours: string[];
  available_sizes: { label: string; price_modifier: number }[];
  is_available: boolean;
  is_made_to_order: boolean;
}

export type AdminProductInput = Omit<AdminProduct, 'id' | 'slug'>;
