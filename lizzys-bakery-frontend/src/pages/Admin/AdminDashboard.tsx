// Covers staff clock-in/stock/sales tracking, menu management (/admin/menu),
// order management (/admin/orders), and basic sales stats.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { fetchAdminSummary } from '../../api/staff';
import { fetchAdminStats } from '../../api/orders';
import { fetchAdminSiteSettings, updateHeroImage, resetHeroImage } from '../../api/siteSettings';
import mediaUrl from '../../utils/mediaUrl';
import defaultHeroImage from '../../assets/hero-cake-coffee.jpg';
import type { AdminDailySummary } from '../../types/StaffShift';
import type { AdminStats } from '../../types/Order';
import type SiteSettings from '../../types/SiteSettings';

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data && typeof data === 'object') {
      const firstValue = Object.values(data as Record<string, unknown>)[0];
      if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') return firstValue[0];
    }
  }
  return 'Something went wrong. Please try again.';
}

export default function AdminDashboard() {
  useDocumentTitle('Admin Dashboard');
  const { user } = useAuth();
  const [summary, setSummary] = useState<AdminDailySummary | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [heroSettings, setHeroSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingHero, setIsUpdatingHero] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchAdminSummary(), fetchAdminStats(), fetchAdminSiteSettings()])
      .then(([s, st, site]) => {
        setSummary(s);
        setStats(st);
        setHeroSettings(site);
      })
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleHeroUpload(file: File) {
    setIsUpdatingHero(true);
    try {
      setHeroSettings(await updateHeroImage(file));
      toast.success('Homepage background updated');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsUpdatingHero(false);
    }
  }

  async function handleHeroReset() {
    setIsUpdatingHero(true);
    try {
      setHeroSettings(await resetHeroImage());
      toast.success('Back to the default photo');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsUpdatingHero(false);
    }
  }

  return (
    <div className="min-h-screen py-10 px-4">
    <div className="max-w-3xl mx-auto font-body">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="font-script text-4xl text-bakery-pink-dark mb-1">Admin Dashboard</h1>
          <p className="text-bakery-brown/70">Welcome, {user?.full_name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
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
            to="/admin/testimonials"
            className="bg-white text-bakery-pink-dark border-2 border-bakery-pink-dark font-semibold px-5 py-2 rounded-full hover:bg-bakery-pink/10 transition-colors text-sm"
          >
            Testimonials
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
        <p className="text-bakery-brown/70">Loading…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm p-5 mb-8 border-t-4 border-bakery-pink">
            <h2 className="font-semibold text-bakery-brown mb-1">Homepage Background Photo</h2>
            <p className="text-xs text-bakery-brown/70 mb-3">
              Shown behind the hero on the homepage. Swap it for a seasonal theme — Christmas,
              Thanksgiving, or anything else — any time.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <img
                src={mediaUrl(heroSettings?.hero_image) ?? defaultHeroImage}
                alt="Current homepage background"
                className="w-32 h-20 object-cover rounded-lg border border-bakery-pink/30"
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm text-bakery-pink-dark font-medium cursor-pointer">
                  {heroSettings?.hero_image ? 'Replace photo' : 'Upload a photo'}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUpdatingHero}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleHeroUpload(file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
                {heroSettings?.hero_image && (
                  <button
                    onClick={handleHeroReset}
                    disabled={isUpdatingHero}
                    className="text-sm text-bakery-brown/70 hover:text-red-500 text-left"
                  >
                    Reset to default photo
                  </button>
                )}
                {isUpdatingHero && <p className="text-xs text-bakery-brown/70">Updating…</p>}
              </div>
            </div>
          </div>

          {stats && (
            <div className="mb-8">
              <h2 className="font-semibold text-bakery-brown text-lg mb-4">Stats</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-bakery-pink-dark text-center">
                  <p className="text-2xl font-bold text-bakery-pink-dark">{stats.orders_this_week}</p>
                  <p className="text-xs text-bakery-brown/70">Orders this week</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-bakery-brown text-center">
                  <p className="text-2xl font-bold text-bakery-brown">{stats.orders_this_month}</p>
                  <p className="text-xs text-bakery-brown/70">Orders this month</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-bakery-pink-dark text-center">
                  <p className="text-lg font-bold text-bakery-pink-dark">
                    KES {stats.revenue_this_week.toLocaleString()}
                  </p>
                  <p className="text-xs text-bakery-brown/70">Revenue this week</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border-t-4 border-bakery-brown text-center">
                  <p className="text-lg font-bold text-bakery-brown">
                    KES {stats.revenue_this_month.toLocaleString()}
                  </p>
                  <p className="text-xs text-bakery-brown/70">Revenue this month</p>
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
        <p className="text-bakery-brown/70">No staff shifts recorded yet today.</p>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {summary.by_staff.map((shift, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-5 border-t-4 border-bakery-pink-dark">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-semibold text-bakery-brown">{shift.staff_name}</h3>
                  <span className="text-xs text-bakery-brown/70">
                    {new Date(shift.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' – '}
                    {shift.clock_out
                      ? new Date(shift.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'still clocked in'}
                  </span>
                </div>
                {shift.sales.length === 0 ? (
                  <p className="text-sm text-bakery-brown/70">No sales logged.</p>
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
