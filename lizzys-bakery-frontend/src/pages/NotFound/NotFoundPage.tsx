import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 font-body">
      <div className="text-center">
        <p className="font-script text-5xl text-bakery-pink-dark mb-3">Oops!</p>
        <p className="text-bakery-brown/70 mb-6">We couldn't find that page.</p>
        <Link
          to="/"
          className="inline-block bg-bakery-pink-dark text-white font-semibold px-6 py-2.5 rounded-full hover:bg-bakery-brown transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
