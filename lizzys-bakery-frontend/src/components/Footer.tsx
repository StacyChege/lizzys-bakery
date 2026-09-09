import { Link } from 'react-router-dom';
import { Phone, MapPin, MessageCircle } from 'lucide-react';
import ScallopDivider from './ScallopDivider';

const WHATSAPP_NUMBER = '254725941831'; // 0725 941 831 in international format, no leading 0

export default function Footer() {
  return (
    <footer className="relative bg-bakery-brown text-bakery-cream font-body mt-16">
      <ScallopDivider fill="#3B2621" className="absolute -top-5 left-0" />
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
            <MapPin className="w-4 h-4" /> Kikuyu, Kenya
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-bakery-pink-light hover:text-bakery-cream transition-colors w-fit"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp Us
          </a>
        </div>

        {/* Column 3: Crucial policy guidelines to prevent late-notice orders */}
        <div className="text-sm space-y-1 opacity-90">
          <p className="font-semibold text-bakery-pink-light">Ordering Policy</p>
          <p>All orders — standard or custom — must be placed at least 5 days before the date needed.</p>
          <p>Choose pickup, your own delivery rider, or our bakery delivery at checkout.</p>
        </div>
      </div>

      {/* Footer copyright stamp line at the absolute bottom margin — the
          staff link lives here rather than the main nav since it's an
          internal tool, not something customers need to see */}
      <div className="text-center text-xs opacity-60 py-3 border-t border-bakery-cream/10 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
        <span>© {new Date().getFullYear()} Lizzy's Bakery. Made with love, just for you.</span>
        <Link to="/staff" className="hover:opacity-100 underline">
          Staff Login
        </Link>
      </div>
    </footer>
  );
}