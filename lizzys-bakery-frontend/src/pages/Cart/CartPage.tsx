import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

export default function CartPage() {
  const { items, totalPrice, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="bg-bakery-pink/10 min-h-[70vh] flex items-center px-4">
        <div className="max-w-2xl mx-auto text-center font-body">
          <p className="font-script text-3xl text-bakery-pink-dark mb-2">Your cart is empty</p>
          <p className="text-bakery-brown/60 mb-6">Looks like you haven't added anything yet.</p>
          <Link
            to="/menu"
            className="inline-block bg-bakery-pink-dark text-white font-semibold px-6 py-2.5 rounded-full hover:bg-bakery-brown transition-colors"
          >
            Browse the Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bakery-pink/10 min-h-screen py-10 px-4">
    <div className="max-w-3xl mx-auto font-body">
      <h1 className="font-script text-4xl text-bakery-pink-dark mb-6">Your Cart</h1>

      <div className="space-y-4 mb-8">
        {items.map((item) => {
          const unitPrice = item.basePrice + (item.size?.price_modifier ?? 0);
          return (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-20 h-20 rounded-lg bg-bakery-cream/60 flex items-center justify-center overflow-hidden shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-bakery-pink/40 text-xs text-center px-1">No Image</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-bakery-brown truncate">{item.name}</h3>
                {(item.flavour || item.size) && (
                  <p className="text-xs text-bakery-brown/60">
                    {[item.flavour, item.size?.label].filter(Boolean).join(' · ')}
                  </p>
                )}
                <p className="text-bakery-pink-dark font-medium text-sm mt-1">
                  KES {unitPrice.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center border border-bakery-pink/30 rounded-lg">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-2.5 py-1 text-bakery-brown hover:text-bakery-pink-dark"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="px-2.5 text-sm font-medium text-bakery-brown">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2.5 py-1 text-bakery-brown hover:text-bakery-pink-dark"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="text-bakery-brown/40 hover:text-red-500 text-sm shrink-0"
                aria-label={`Remove ${item.name} from cart`}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
        <span className="text-lg font-semibold text-bakery-brown">Total</span>
        <span className="text-xl font-bold text-bakery-pink-dark">
          KES {totalPrice.toLocaleString()}
        </span>
      </div>

      <button
        disabled
        title="Checkout is coming soon"
        className="w-full mt-6 bg-bakery-pink-dark text-white font-semibold py-3 rounded-full opacity-50 cursor-not-allowed"
      >
        Checkout (coming soon)
      </button>
    </div>
    </div>
  );
}
