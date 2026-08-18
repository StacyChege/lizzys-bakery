import { Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-bakery-brown text-bakery-cream font-body mt-16">
      {/* 3-Column layout grid that stacks vertically on mobile, splits up on medium desktops */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        
        {/* Column 1: Short brand description */}
        <div>
          <h3 className="font-script text-2xl text-bakery-pink mb-2">Lizzy's Bakery</h3>
          <p className="text-sm opacity-80">Creating sweet memories for every occasion.</p>
        </div>

        {/* Column 2: Quick contact information layout */}
        <div className="text-sm space-y-2">
          <p className="flex items-center gap-2">
            <Phone className="w-4 h-4" /> 0725 941 831
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4" /> [Bakery address here]
          </p>
        </div>

        {/* Column 3: Crucial policy guidelines to prevent late-notice orders */}
        <div className="text-sm space-y-1 opacity-90">
          <p className="font-semibold text-bakery-pink">Ordering Policy</p>
          <p>All orders — standard or custom — must be placed at least 5 days before the date needed.</p>
          <p>Choose pickup, your own delivery rider, or our bakery delivery at checkout.</p>
        </div>
      </div>

      {/* Footer copyright stamp line at the absolute bottom margin */}
      <div className="text-center text-xs opacity-60 py-3 border-t border-bakery-cream/10">
        © {new Date().getFullYear()} Lizzy's Bakery. Made with love, just for you.
      </div>
    </footer>
  );
}