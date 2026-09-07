import { Phone, MapPin, Clock, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '254725941831'; // 0725 941 831 in international format, no leading 0
const PHONE_DISPLAY = '0725 941 831';
const AREA = 'Kikuyu, Kenya';

export default function LocationPage() {
  return (
    <div className="py-12 px-4 font-body">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-script text-4xl text-bakery-pink-dark mb-2 text-center">Find Us</h1>
        <p className="text-bakery-brown/70 text-center mb-10 max-w-lg mx-auto">
          We're based in {AREA}. Since we bake from a home kitchen, we share the exact pickup
          address by phone or WhatsApp once your order is confirmed.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Map */}
          <div className="rounded-2xl overflow-hidden border-t-4 border-bakery-pink shadow-sm h-72 md:h-full min-h-72">
            <iframe
              title="Map of Kikuyu, Kenya"
              src="https://www.google.com/maps?q=Kikuyu,+Kenya&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-bakery-pink-dark">
              <h2 className="font-semibold text-bakery-brown mb-3">Contact & Hours</h2>
              <div className="space-y-3 text-sm text-bakery-brown/80">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-bakery-pink-dark shrink-0" /> {AREA} (exact address shared on confirmation)
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-bakery-pink-dark shrink-0" /> Monday – Saturday, 8:00am – 6:00pm
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-bakery-pink-dark shrink-0" /> {PHONE_DISPLAY}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-bakery-pink-dark text-white font-semibold px-5 py-2.5 rounded-full hover:bg-bakery-brown transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Us
                </a>
                <a
                  href={`tel:${PHONE_DISPLAY.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2 bg-white text-bakery-pink-dark font-semibold px-5 py-2.5 rounded-full border-2 border-bakery-pink-dark/30 hover:border-bakery-pink-dark transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call Us
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-bakery-brown">
              <h2 className="font-semibold text-bakery-brown mb-3">Ordering Policy</h2>
              <ul className="space-y-2 text-sm text-bakery-brown/80 list-disc list-inside">
                <li>All orders — standard or custom — must be placed at least 5 days before the date needed.</li>
                <li>Choose pickup, your own delivery rider, or our bakery delivery at checkout.</li>
                <li>We confirm every order by phone or WhatsApp and arrange payment via M-Pesa paybill directly.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
