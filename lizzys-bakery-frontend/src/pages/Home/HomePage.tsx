import { Link } from 'react-router-dom';
import { Cake, Heart, Sparkles } from 'lucide-react';
import ScallopDivider from '../../components/ScallopDivider';
import heroImage from '../../assets/hero-cake-coffee.jpg';

export default function HomePage() {
  return (
    <div className="font-body">
      {/* ---------- HERO ---------- */}
      <div
        className="relative bg-cover bg-center px-4 pt-28 pb-20 md:pt-40 md:pb-28"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Scrim: darkest at the left where the text sits, fading toward the photo on the right */}
        <div className="absolute inset-0 bg-linear-to-r from-bakery-brown/90 via-bakery-brown/60 to-bakery-brown/20" />

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center md:text-left max-w-lg mx-auto md:mx-0">
            <p className="font-script text-2xl text-bakery-pink mb-1">Freshly baked, daily</p>
            <h1 className="font-script text-5xl sm:text-6xl text-white leading-tight mb-4 drop-shadow-sm">
              Lizzy's Bakery
            </h1>
            <p className="text-white/85 max-w-sm mx-auto md:mx-0 mb-8">
              Handmade cakes, cupcakes, pastries, and coffee — baked and brewed fresh for every occasion.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                to="/menu"
                className="inline-block bg-bakery-pink-dark text-white font-semibold px-6 py-3 rounded-full hover:bg-bakery-pink transition-colors shadow-sm"
              >
                View Our Menu
              </Link>
              <Link
                to="/custom-cake"
                className="inline-block bg-white/10 text-white font-semibold px-6 py-3 rounded-full border-2 border-white/60 backdrop-blur-sm hover:bg-white hover:text-bakery-pink-dark transition-colors"
              >
                Design a Custom Cake
              </Link>
            </div>
          </div>
        </div>

        {/* Scallop "bites into" the hero's bottom edge — must overlap
            it to work, since the wave's gaps are transparent, not colored */}
        <ScallopDivider fill="#FFFCF9" className="absolute bottom-0 left-0" />
      </div>

      {/* ---------- HIGHLIGHTS ---------- */}
      <div className="max-w-5xl mx-auto px-4 py-14 grid gap-8 sm:grid-cols-3 text-center">
        <div>
          <div className="w-12 h-12 rounded-full bg-bakery-pink/20 flex items-center justify-center mx-auto mb-3">
            <Cake className="w-6 h-6 text-bakery-pink-dark" strokeWidth={1.5} />
          </div>
          <p className="font-script text-2xl text-bakery-pink-dark mb-1">Baked Fresh</p>
          <p className="text-bakery-brown/70 text-sm">
            Every order is made to order, never sitting in a freezer.
          </p>
        </div>
        <div>
          <div className="w-12 h-12 rounded-full bg-bakery-pink/20 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 text-bakery-pink-dark" strokeWidth={1.5} />
          </div>
          <p className="font-script text-2xl text-bakery-pink-dark mb-1">Made With Love</p>
          <p className="text-bakery-brown/70 text-sm">
            Recipes perfected over years, for your most special moments.
          </p>
        </div>
        <div>
          <div className="w-12 h-12 rounded-full bg-bakery-pink/20 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-bakery-pink-dark" strokeWidth={1.5} />
          </div>
          <p className="font-script text-2xl text-bakery-pink-dark mb-1">Custom Orders</p>
          <p className="text-bakery-brown/70 text-sm">
            Flavours and sizes to match exactly what you're celebrating.
          </p>
        </div>
      </div>
    </div>
  );
}
