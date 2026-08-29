import { Link } from 'react-router-dom';
import { Cake, Cookie, Heart, Sparkles } from 'lucide-react';
import ScallopDivider from '../../components/ScallopDivider';

export default function HomePage() {
  return (
    <div className="font-body">
      {/* ---------- HERO ---------- */}
      <div className="relative bg-bakery-pink/15 px-4 pt-16 pb-10 md:pt-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          {/* Text side */}
          <div className="text-center md:text-left">
            <p className="font-script text-2xl text-bakery-pink-dark mb-1">Freshly baked, daily</p>
            <h1 className="font-script text-5xl sm:text-6xl text-bakery-pink-dark leading-tight mb-4">
              Lizzy's Bakery
            </h1>
            <p className="text-bakery-brown/70 max-w-sm mx-auto md:mx-0 mb-8">
              Handmade cakes, cupcakes, and pastries — baked fresh for every occasion.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                to="/menu"
                className="inline-block bg-bakery-pink-dark text-white font-semibold px-6 py-3 rounded-full hover:bg-bakery-brown transition-colors shadow-sm"
              >
                View Our Menu
              </Link>
              <Link
                to="/custom-cake"
                className="inline-block bg-white text-bakery-pink-dark font-semibold px-6 py-3 rounded-full border-2 border-bakery-pink-dark/30 hover:border-bakery-pink-dark transition-colors"
              >
                Design a Custom Cake
              </Link>
            </div>
          </div>

          {/* Decorative side — a little stack of "cake tier" motifs, not a stock photo */}
          <div className="relative h-64 md:h-80 hidden sm:block" aria-hidden="true">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-bakery-pink/30" />
            <div className="absolute left-[38%] top-[55%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-bakery-pink/50 flex items-center justify-center rotate-[-8deg]">
              <Cake className="w-12 h-12 text-bakery-pink-dark" strokeWidth={1.5} />
            </div>
            <div className="absolute left-[68%] top-[30%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center rotate-[10deg]">
              <Cookie className="w-7 h-7 text-bakery-pink-dark" strokeWidth={1.5} />
            </div>
            <div className="absolute left-[25%] top-[25%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center rotate-[-6deg]">
              <Heart className="w-5 h-5 text-bakery-pink-dark" strokeWidth={1.5} />
            </div>
            <div className="absolute left-[75%] top-[68%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-bakery-pink-dark/90 flex items-center justify-center rotate-[12deg]">
              <Sparkles className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Scallop "bites into" the pink hero's bottom edge — must overlap
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
