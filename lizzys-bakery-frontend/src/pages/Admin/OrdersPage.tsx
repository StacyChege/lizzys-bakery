import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  fetchAdminOrders,
  updateOrderStatus,
  fetchAdminDeliveryZones,
  createDeliveryZone,
  deleteDeliveryZone,
} from '../../api/orders';
import { ORDER_STATUS_LABELS } from '../../types/Order';
import type { AdminDeliveryZone, Order, OrderStatus } from '../../types/Order';

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

const STATUS_OPTIONS = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [zones, setZones] = useState<AdminDeliveryZone[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneFee, setNewZoneFee] = useState('');

  const loadOrders = useCallback((status: OrderStatus | '') => {
    fetchAdminOrders(status || undefined)
      .then(setOrders)
      .catch(() => setError('Could not load orders.'));
  }, []);

  const loadZones = useCallback(() => {
    fetchAdminDeliveryZones().then(setZones).catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([fetchAdminOrders(), fetchAdminDeliveryZones()])
      .then(([o, z]) => {
        setOrders(o);
        setZones(z);
      })
      .catch(() => setError('Could not load orders.'))
      .finally(() => setIsLoading(false));
  }, []);

  function handleFilterChange(status: OrderStatus | '') {
    setStatusFilter(status);
    loadOrders(status);
  }

  async function handleStatusChange(order: Order, status: OrderStatus) {
    try {
      await updateOrderStatus(order.id, status);
      loadOrders(statusFilter);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleAddZone(e: React.FormEvent) {
    e.preventDefault();
    if (!newZoneName.trim() || !newZoneFee) return;
    try {
      await createDeliveryZone(newZoneName, newZoneFee);
      setNewZoneName('');
      setNewZoneFee('');
      loadZones();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  async function handleDeleteZone(id: number) {
    if (!confirm('Delete this delivery zone?')) return;
    try {
      await deleteDeliveryZone(id);
      loadZones();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto font-body">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-script text-4xl text-bakery-pink-dark">Orders</h1>
          <Link to="/admin" className="text-sm text-bakery-brown/60 hover:text-bakery-pink-dark underline">
            Back to Dashboard
          </Link>
        </div>

        {isLoading ? (
          <p className="text-bakery-brown/60">Loading…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <>
            {/* --- ORDER INBOX --- */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border-t-4 border-bakery-pink-dark">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-bakery-brown">All Orders</h2>
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange(e.target.value as OrderStatus | '')}
                  className="border border-bakery-pink/30 rounded-lg px-3 py-1.5 text-sm"
                >
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              {orders.length === 0 ? (
                <p className="text-bakery-brown/50 text-sm">No orders match this filter.</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-bakery-pink/20 rounded-xl p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div>
                          <span className="font-semibold text-bakery-brown">Order #{order.id}</span>
                          <span className="text-bakery-brown/60 text-sm ml-2">{order.contact_name} · {order.contact_phone}</span>
                        </div>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order, e.target.value as OrderStatus)}
                          className="border border-bakery-pink/30 rounded-full px-3 py-1 text-xs"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                      </div>
                      <ul className="text-sm text-bakery-brown/80 space-y-0.5 mb-2">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            {item.quantity} x {item.product_name}
                            {item.flavour && ` (${item.flavour})`}
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap justify-between text-xs text-bakery-brown/60">
                        <span>
                          Needed {order.date_needed} ·{' '}
                          {order.fulfilment_method === 'PICKUP'
                            ? 'Pickup'
                            : order.fulfilment_method === 'OWN_DELIVERY'
                            ? 'Own delivery'
                            : `Bakery delivery — ${order.delivery_zone?.name ?? ''}`}
                          {order.delivery_address && ` (${order.delivery_address})`}
                        </span>
                        <span className="font-medium text-bakery-brown">
                          KES {Number(order.total).toLocaleString()}
                        </span>
                      </div>
                      {order.notes && (
                        <p className="text-xs text-bakery-brown/50 mt-1 italic">Note: {order.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* --- DELIVERY ZONES --- */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-bakery-brown">
              <h2 className="font-semibold text-bakery-brown mb-3">Delivery Zones</h2>
              <ul className="space-y-1 mb-4 text-sm">
                {zones.map((z) => (
                  <li key={z.id} className="flex items-center justify-between py-1">
                    <span className="text-bakery-brown">{z.name} — KES {Number(z.fee).toLocaleString()}</span>
                    <button
                      onClick={() => handleDeleteZone(z.id)}
                      className="text-bakery-brown/40 hover:text-red-500 text-xs"
                    >
                      Delete
                    </button>
                  </li>
                ))}
                {zones.length === 0 && (
                  <li className="text-bakery-brown/50 text-sm">No delivery zones set up yet.</li>
                )}
              </ul>
              <form onSubmit={handleAddZone} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Zone name"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="flex-1 border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Fee (KES)"
                  value={newZoneFee}
                  onChange={(e) => setNewZoneFee(e.target.value)}
                  className="w-32 border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="bg-bakery-brown text-white font-medium px-4 rounded-full text-sm hover:bg-bakery-pink-dark"
                >
                  Add
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
