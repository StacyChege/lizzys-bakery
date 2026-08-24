// One line in the cart — a product plus whichever flavour/size the customer
// picked. Two different size choices on the same product are separate lines,
// which is why `id` is derived from product + flavour + size, not just the
// product id.
export default interface CartItem {
  id: string;
  productId: number;
  slug: string;
  name: string;
  image: string | null;
  basePrice: number;
  flavour: string | null;
  size: { label: string; price_modifier: number } | null;
  quantity: number;
}
