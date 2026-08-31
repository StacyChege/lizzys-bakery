// Covers staff clock-in/stock/sales tracking, menu management (/admin/menu),
// order management (/admin/orders), and basic sales stats.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchAdminSummary } from '../../api/staff';
import { fetchAdminStats } from '../../api/orders';
import type { AdminDailySummary } from '../../types/StaffShift';
import type { AdminStats } from '../../types/Order';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AdminDailySummary | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchAdminSummary(), fetchAdminStats()])
      .then(([s, st]) => {
        setSummary(s);
        setStats(st);
      })
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="bg-bakery-pink/10 min-h-screen py-10 px-4">
    <div className="max-w-3xl mx-auto font-body">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-script text-4xl text-bakery-pink-dark mb-1">Admin Dashboard</h1>
          <p className="text-bakery-brown/60">Welcome, {user?.full_name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/orders"
            className="bg-white text-bakery-pink-dark border-2 border-bakery-pink-dark font-semibold px-5 py-2 rounded-full hover:bg-bakery-pink/10 transition-colors text-sm"
          >
            View Orders
          </Link>
          <Link
            to="/admin/custom-cake-requests"
            className="bg-white text-bakery-pink-dark border-2 border-bakery-pink-dark font-semibold px-5 py-2 rounded-full hover:bg-bakery-pink/10 transition-colors text-sm"
          >
            Cake Requests
          </Link>
          <Link
            to="/admin/menu"
            className="bg-bakery-pink-dark text-white font-semibold px-5 py-2 rounded-full hover:bg-bakery-brown transition-colors text-sm"
          >
            Manage Menu
          </Link>
        </div>
      </div>

      {isLoading ? (
        <p className="text-bakery-brown/60">Loading…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          {stats && (
            <div className="mb-8">
              <h2 className="font-semibold text-bakery-brown text-lg mb-4">Stats</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-bakery-pink-dark text-center">
                  <p className="text-2xl font-bold text-bakery-pink-dark">{stats.orders_this_week}</p>
                  <p className="text-xs text-bakery-brown/60">Orders this week</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-bakery-brown text-center">
                  <p className="text-2xl font-bold text-bakery-brown">{stats.orders_this_month}</p>
                  <p className="text-xs text-bakery-brown/60">Orders this month</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-bakery-pink-dark text-center">
                  <p className="text-lg font-bold text-bakery-pink-dark">
                    KES {stats.revenue_this_week.toLocaleString()}
                  </p>
                  <p className="text-xs text-bakery-brown/60">Revenue this week</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-bakery-brown text-center">
                  <p className="text-lg font-bold text-bakery-brown">
                    KES {stats.revenue_this_month.toLocaleString()}
                  </p>
                  <p className="text-xs text-bakery-brown/60">Revenue this month</p>
                </div>
              </div>

              {stats.most_ordered_items.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-5 border-t-4 border-bakery-pink">
                  <h3 className="font-semibold text-bakery-brown mb-2 text-sm">Most Ordered</h3>
                  <ul className="text-sm space-y-1">
                    {stats.most_ordered_items.map((item) => (
                      <li key={item.product_name} className="flex justify-between text-bakery-brown/80">
                        <span>{item.product_name}</span>
                        <span>{item.total_quantity} sold</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <h2 className="font-semibold text-bakery-brown text-lg mb-4">
            Today's Summary {summary && `— ${summary.date}`}
          </h2>

      {!summary || summary.by_staff.length === 0 ? (
        <p className="text-bakery-brown/50">No staff shifts recorded yet today.</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {summary.by_staff.map((shift, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-5 border-t-4 border-bakery-pink-dark">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-semibold text-bakery-brown">{shift.staff_name}</h3>
                  <span className="text-xs text-bakery-brown/50">
                    {new Date(shift.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' – '}
                    {shift.clock_out
                      ? new Date(shift.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'still clocked in'}
                  </span>
                </div>
                {shift.sales.length === 0 ? (
                  <p className="text-sm text-bakery-brown/40">No sales logged.</p>
                ) : (
                  <ul className="space-y-1 mb-3 text-sm">
                    {shift.sales.map((s) => (
                      <li key={s.id} className="flex justify-between text-bakery-brown/80">
                        <span>{s.quantity} x {s.product_name}</span>
                        <span>KES {(Number(s.unit_price) * s.quantity).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="border-t border-bakery-pink/20 pt-2 flex justify-between text-sm font-medium text-bakery-brown">
                  <span>{shift.total_quantity} items</span>
                  <span>KES {shift.total_revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-bakery-pink/10 rounded-xl p-5 flex justify-between items-center">
            <span className="font-semibold text-bakery-brown">Total for the day</span>
            <span className="font-bold text-bakery-pink-dark text-lg">
              {summary.grand_total_quantity} items — KES {summary.grand_total_revenue.toLocaleString()}
            </span>
          </div>
        </>
      )}
        </>
      )}
    </div>
    </div>
  );
}
