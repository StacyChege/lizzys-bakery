// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu as MenuIcon, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const cartItemCount = 0; // still a stub — CartContext isn't built until Week 4, this one's fine to leave

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Menu', to: '/menu' },
    { label: 'Custom Cake', to: '/custom-cake' },
    { label: 'Location', to: '/location' },
  ];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="bg-bakery-cream border-b border-bakery-pink/20 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="font-script text-3xl text-bakery-pink-dark">
          Lizzy's Bakery
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-body text-bakery-brown">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="hover:text-bakery-pink transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative">
            <ShoppingCart className="w-6 h-6 text-bakery-brown" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-bakery-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3 font-body text-sm">
              <Link to="/account" className="flex items-center gap-1 text-bakery-brown hover:text-bakery-pink">
                <User className="w-5 h-5" />
                {user?.full_name?.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-bakery-brown/60 hover:text-bakery-pink"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block">
              <User className="w-6 h-6 text-bakery-brown" />
            </Link>
          )}

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            <MenuIcon className="w-6 h-6 text-bakery-brown" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden flex flex-col gap-3 px-4 pb-4 font-body text-bakery-brown">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="border-t border-bakery-pink/20 pt-3 mt-1">
            {isAuthenticated ? (
              <>
                <Link to="/account" onClick={() => setMobileOpen(false)}>
                  {user?.full_name}
                </Link>
                <button onClick={handleLogout} className="block mt-2 text-bakery-pink-dark">
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}