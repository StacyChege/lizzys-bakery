// TEMP placeholder — real dashboard (orders, menu management, stats) comes in Week 8
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 font-body">
      <h1 className="font-script text-4xl text-bakery-pink-dark mb-4">Admin Dashboard</h1>
      <p className="text-bakery-brown">Welcome, {user?.full_name} — you're logged in as ADMIN.</p>
      <p className="text-bakery-brown/60 text-sm mt-6">
        (Real dashboard — orders, menu, stats — arrives in Week 8.)
      </p>
    </div>
  );
}