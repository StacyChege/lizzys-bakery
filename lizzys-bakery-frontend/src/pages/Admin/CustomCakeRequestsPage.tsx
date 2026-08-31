import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchAdminCustomCakeRequests, updateCustomCakeRequest } from '../../api/adminMenu';
import { CUSTOM_CAKE_STATUS_LABELS } from '../../types/CustomCakeRequest';
import type { AdminCustomCakeRequest, CustomCakeRequestStatus } from '../../types/CustomCakeRequest';

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

const STATUS_OPTIONS = Object.keys(CUSTOM_CAKE_STATUS_LABELS) as CustomCakeRequestStatus[];

export default function CustomCakeRequestsPage() {
  const [requests, setRequests] = useState<AdminCustomCakeRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<CustomCakeRequestStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quoteDrafts, setQuoteDrafts] = useState<Record<number, string>>({});

  const loadRequests = useCallback((status: CustomCakeRequestStatus | '') => {
    fetchAdminCustomCakeRequests(status || undefined)
      .then(setRequests)
      .catch(() => setError('Could not load custom cake requests.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadRequests('');
  }, [loadRequests]);

  function handleFilterChange(status: CustomCakeRequestStatus | '') {
    setStatusFilter(status);
    setIsLoading(true);
    loadRequests(status);
  }

  async function handleStatusChange(request: AdminCustomCakeRequest, status: CustomCakeRequestStatus) {
    try {
      await updateCustomCakeRequest(request.id, { status });
      loadRequests(statusFilter);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleSendQuote(request: AdminCustomCakeRequest) {
    const price = quoteDrafts[request.id];
    if (!price) return;
    try {
      await updateCustomCakeRequest(request.id, { quoted_price: price, status: 'QUOTED' });
      setQuoteDrafts((d) => ({ ...d, [request.id]: '' }));
      loadRequests(statusFilter);
      toast.success('Quote saved');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  return (
    <div className="bg-bakery-pink/10 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto font-body">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-script text-4xl text-bakery-pink-dark">Custom Cake Requests</h1>
          <Link to="/admin" className="text-sm text-bakery-brown/60 hover:text-bakery-pink-dark underline">
            Back to Dashboard
          </Link>
        </div>

        {isLoading ? (
          <p className="text-bakery-brown/60">Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-bakery-pink-dark">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-bakery-brown">All Requests</h2>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(e.target.value as CustomCakeRequestStatus | '')}
                className="border border-bakery-pink/30 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{CUSTOM_CAKE_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {requests.length === 0 ? (
              <p className="text-bakery-brown/50 text-sm">No requests match this filter.</p>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div key={req.id} className="border border-bakery-pink/20 rounded-xl p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div>
                        <span className="font-semibold text-bakery-brown">{req.name}</span>
                        <span className="text-bakery-brown/60 text-sm ml-2">
                          {req.email} · {req.phone_number}
                        </span>
                      </div>
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusChange(req, e.target.value as CustomCakeRequestStatus)}
                        className="border border-bakery-pink/30 rounded-full px-3 py-1 text-xs"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{CUSTOM_CAKE_STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>

                    <p className="text-sm text-bakery-brown/80 mb-2">{req.description}</p>

                    <div className="flex flex-wrap justify-between text-xs text-bakery-brown/60 mb-3">
                      <span>Needed by {req.date_needed}</span>
                      {req.budget && <span>Customer's budget: KES {Number(req.budget).toLocaleString()}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      {req.quoted_price ? (
                        <span className="text-sm font-medium text-bakery-pink-dark">
                          Quoted: KES {Number(req.quoted_price).toLocaleString()}
                        </span>
                      ) : (
                        <>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Quote (KES)"
                            value={quoteDrafts[req.id] ?? ''}
                            onChange={(e) =>
                              setQuoteDrafts((d) => ({ ...d, [req.id]: e.target.value }))
                            }
                            className="border border-bakery-pink/30 rounded-lg px-3 py-1.5 text-sm w-36"
                          />
                          <button
                            onClick={() => handleSendQuote(req)}
                            className="bg-bakery-pink-dark text-white font-medium px-4 py-1.5 rounded-full text-sm hover:bg-bakery-brown"
                          >
                            Save Quote
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
