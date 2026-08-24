import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="font-body">
      {/* ---------- HERO ---------- */}
      <div className="bg-gradient-to-b from-bakery-pink/20 to-bakery-cream px-4 py-20 text-center">
        <h1 className="font-script text-5xl sm:text-6xl text-bakery-pink-dark mb-4">
          Lizzy's Bakery
        </h1>
        <p className="text-bakery-brown/70 max-w-md mx-auto mb-8">
          Handmade cakes, cupcakes, and pastries — baked fresh for every occasion.
        </p>
        <Link
          to="/menu"
          className="inline-block bg-bakery-pink text-white font-semibold px-6 py-3 rounded-lg hover:bg-bakery-pink-dark transition-colors"
        >
          View Our Menu
        </Link>
      </div>

      {/* ---------- HIGHLIGHTS ---------- */}
      <div className="max-w-5xl mx-auto px-4 py-16 grid gap-8 sm:grid-cols-3 text-center">
        <div>
          <p className="font-script text-3xl text-bakery-pink-dark mb-2">Baked Fresh</p>
          <p className="text-bakery-brown/70 text-sm">
            Every order is made to order, never sitting in a freezer.
          </p>
        </div>
        <div>
          <p className="font-script text-3xl text-bakery-pink-dark mb-2">Made With Love</p>
          <p className="text-bakery-brown/70 text-sm">
            Recipes perfected over years, for your most special moments.
          </p>
        </div>
        <div>
          <p className="font-script text-3xl text-bakery-pink-dark mb-2">Custom Orders</p>
          <p className="text-bakery-brown/70 text-sm">
            Flavours and sizes to match exactly what you're celebrating.
          </p>
        </div>
      </div>
    </div>
  );
}
