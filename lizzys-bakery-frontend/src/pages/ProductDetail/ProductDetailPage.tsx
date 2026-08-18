import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductDetail } from '../../api/products';
import type { ProductDetail } from '../../types/Product';

export default function ProductDetailPage() {
  // useParams() reads whatever value is in the URL where the route defines :slug.
  // Example: URL is /product/chocolate-cake → slug === "chocolate-cake"
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Which gallery photo is currently the big one — starts at the first photo (index 0)
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Which flavour/size the customer has clicked — start as null meaning "nothing chosen yet"
  const [selectedFlavour, setSelectedFlavour] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<{ label: string; price_modifier: number } | null>(null);

  // This effect depends on [slug] — meaning if slug ever changes (e.g. you click a DIFFERENT
  // product while already on this page), it re-runs and fetches the new product's data.
  // Compare to MenuPage's effects, which depended on [] (run once) or filter state.
  useEffect(() => {
    if (!slug) return; // safety check — shouldn't happen if the route is set up correctly, but keeps TypeScript happy

    let isMounted = true;

    const loadProduct = async () => {
      setIsLoading(true);

      try {
        const data = await fetchProductDetail(slug);
        if (!isMounted) return;

        // Assert the fetched data matches ProductDetail — the API helper may have a broader return type
        setProduct(data as unknown as ProductDetail);
        setError('');
        // Reset selections whenever a new product loads, so a leftover choice
        // from a previous product doesn't accidentally carry over
        setActiveImageIndex(0);
        setSelectedFlavour(null);
        setSelectedSize(null);
      } catch {
        if (!isMounted) return;
        setError('Could not load this product. It may no longer be available.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // --- Loading and error states — same pattern as MenuPage ---
  if (isLoading) {
    return <p className="text-center py-20 font-body text-bakery-brown">Loading…</p>;
  }
  if (error || !product) {
    return <p className="text-center py-20 font-body text-red-600">{error || 'Product not found.'}</p>;
  }

  // --- Price calculation ---
  // base_price comes in as a string (e.g. "2500.00") — Number() converts it to an actual number
  // so we can do math on it. price_modifier from the selected size gets added on top, if one is chosen.
  const displayPrice = Number(product.base_price) + (selectedSize?.price_modifier ?? 0);
  // `??` is the "nullish coalescing" operator: if selectedSize is null, use 0 instead of crashing
  // trying to read .price_modifier off of null.

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 font-body grid md:grid-cols-2 gap-10">

      {/* ---------- IMAGE GALLERY ---------- */}
      <div>
        <div className="aspect-square bg-bakery-pink/10 rounded-xl overflow-hidden flex items-center justify-center">
          {product.images.length > 0 ? (
            <img
              src={product.images[activeImageIndex].image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-bakery-pink/40 font-script text-2xl">Lizzy's Bakery</span>
          )}
        </div>

        {/* Thumbnail strip — only show it if there's more than one photo to switch between */}
        {product.images.length > 1 && (
          <div className="flex gap-2 mt-3">
            {product.images.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setActiveImageIndex(index)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                  index === activeImageIndex ? 'border-bakery-pink' : 'border-transparent'
                }`}
              >
                <img src={img.image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---------- DETAILS + SELECTORS ---------- */}
      <div>
        <p className="text-xs text-bakery-brown/50 uppercase tracking-wide mb-1">
          {product.category.name}
        </p>
        <h1 className="font-script text-4xl text-bakery-pink-dark mb-2">{product.name}</h1>
        <p className="text-bakery-brown/70 mb-4">{product.description}</p>

        {/* Live price — updates automatically because displayPrice is recalculated
            on every render, and selecting a size triggers a re-render via setSelectedSize */}
        <p className="text-2xl font-semibold text-bakery-pink-dark mb-6">
          KES {displayPrice.toLocaleString()}
        </p>

        {!product.is_available && (
          <p className="text-red-500 font-medium mb-4">This item is currently sold out.</p>
        )}

        {/* FLAVOUR SELECTOR — only render this section if the product actually has flavours listed */}
        {product.available_flavours.length > 0 && (
          <div className="mb-6">
            <p className="font-semibold text-bakery-brown mb-2">Choose a flavour:</p>
            <div className="flex flex-wrap gap-2">
              {product.available_flavours.map((flavour) => (
                <button
                  key={flavour}
                  onClick={() => setSelectedFlavour(flavour)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedFlavour === flavour
                      ? 'bg-bakery-pink text-white border-bakery-pink'
                      : 'bg-white text-bakery-brown border-bakery-pink/30'
                  }`}
                >
                  {flavour}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SIZE SELECTOR — same button pattern as flavours, but each option carries a price_modifier */}
        {product.available_sizes.length > 0 && (
          <div className="mb-6">
            <p className="font-semibold text-bakery-brown mb-2">Choose a size:</p>
            <div className="flex flex-wrap gap-2">
              {product.available_sizes.map((size) => (
                <button
                  key={size.label}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                    selectedSize?.label === size.label
                      ? 'bg-bakery-pink text-white border-bakery-pink'
                      : 'bg-white text-bakery-brown border-bakery-pink/30'
                  }`}
                >
                  {size.label}
                  {size.price_modifier > 0 && ` (+KES ${size.price_modifier.toLocaleString()})`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder note — deliberately no Add to Cart button tonight.
            That's Week 4 Monday's task, once CartContext actually exists to add TO. */}
        <p className="text-sm text-bakery-brown/40 italic">
          Quantity selector and Add to Cart button arrive next week, once the cart system is built.
        </p>
      </div>
    </div>
  );
}