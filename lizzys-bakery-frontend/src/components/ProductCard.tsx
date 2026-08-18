import type Product from '../types/Product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div
      className={`relative border border-bakery-pink/20 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col ${
        !product.is_available ? 'opacity-60' : ''
      }`}
    >
      {/* Sold Out Badge */}
      {!product.is_available && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
          Sold Out
        </div>
      )}

      {/* Product Image or Placeholder */}
      <div className="h-48 w-full bg-bakery-cream/40 flex items-center justify-center overflow-hidden">
        {product.main_image ? (
          <img
            src={product.main_image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-bakery-brown/30 text-sm">No Image Available</span>
        )}
      </div>

      {/* Card Details */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <span className="text-xs font-medium text-bakery-pink-dark uppercase tracking-wider">
            {product.category}
          </span>
          <h3 className="font-semibold text-bakery-brown text-lg mt-0.5">
            {product.name}
          </h3>
        </div>

        <div className="mt-4 pt-3 border-t border-bakery-cream flex items-center justify-between">
          <span className="text-bakery-pink-dark font-bold text-base">
            KES {Number(product.base_price).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}