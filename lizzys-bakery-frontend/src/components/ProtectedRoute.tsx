import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'CUSTOMER' | 'ADMIN';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // wait for the auth check to finish before deciding — otherwise a logged-in
  // user gets bounced to /login for a split second on every page refresh
  if (isLoading) {
    return <div className="text-center py-20 font-body text-bakery-brown">Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // logged in, but wrong role (e.g. a customer trying to hit /admin)
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}