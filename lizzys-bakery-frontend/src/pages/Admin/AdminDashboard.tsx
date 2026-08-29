// Order inbox, menu management, and broader stats are still future work —
// this only covers the staff clock-in/stock/sales tracking built so far.
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchAdminSummary } from '../../api/staff';
import type { AdminDailySummary } from '../../types/StaffShift';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AdminDailySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminSummary()
      .then(setSummary)
      .catch(() => setError('Could not load today\'s summary.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="bg-bakery-pink/10 min-h-screen py-10 px-4">
    <div className="max-w-3xl mx-auto font-body">
      <h1 className="font-script text-4xl text-bakery-pink-dark mb-1">Admin Dashboard</h1>
      <p className="text-bakery-brown/60 mb-8">Welcome, {user?.full_name}</p>

      <h2 className="font-semibold text-bakery-brown text-lg mb-4">
        Today's Summary {summary && `— ${summary.date}`}
      </h2>

      {isLoading ? (
        <p className="text-bakery-brown/60">Loading…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : !summary || summary.by_staff.length === 0 ? (
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
    </div>
    </div>
  );
}
