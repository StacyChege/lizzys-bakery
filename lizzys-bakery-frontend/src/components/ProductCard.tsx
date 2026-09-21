import type Product from '../types/Product';
import { Link } from 'react-router-dom';
import mediaUrl from '../utils/mediaUrl';
import categoryAccent from '../utils/categoryAccent';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const accent = categoryAccent(product.category);

  return (
    <Link
      to={`/product/${product.slug}`}
      className={`relative block rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all border-t-4 ${accent.border} ${
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
            src={mediaUrl(product.main_image) ?? undefined}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-bakery-brown/30 text-sm">No Image Available</span>
        )}
      </div>

      {/* Card Details */}
      <div className="p-4 flex flex-col justify-between grow">
        <div>
          <span className={`inline-block text-xs font-medium text-bakery-brown uppercase tracking-wider px-2 py-0.5 rounded-full ${accent.chipBg}`}>
            {product.category}
          </span>
          <h3 className="font-semibold text-bakery-brown text-lg mt-1.5">
            {product.name}
          </h3>
        </div>

        <div className="mt-4 pt-3 border-t border-bakery-cream flex items-center justify-between">
          <span className="text-bakery-pink-dark font-bold text-base">
            KES {Number(product.base_price).toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}