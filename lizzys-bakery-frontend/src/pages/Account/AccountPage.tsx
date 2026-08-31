import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchMyOrders } from '../../api/orders';
import { ORDER_STATUS_LABELS } from '../../types/Order';
import type { Order } from '../../types/Order';

export default function AccountPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyOrders()
      .then(setOrders)
      .catch(() => setError('Could not load your orders.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto font-body space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 border-t-4 border-bakery-pink-dark">
          <h1 className="font-script text-4xl text-bakery-pink-dark mb-4">My Account</h1>
          <p className="text-bakery-brown">Logged in as: {user?.email}</p>
          <p className="text-bakery-brown">Role: {user?.role}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 border-t-4 border-bakery-brown">
          <h2 className="font-semibold text-bakery-brown text-lg mb-4">Order History</h2>

          {isLoading ? (
            <p className="text-bakery-brown/60">Loading…</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : orders.length === 0 ? (
            <p className="text-bakery-brown/50">You haven't placed any orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-bakery-pink/20 rounded-xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-semibold text-bakery-brown">Order #{order.id}</span>
                    <span className="text-xs font-medium text-bakery-pink-dark bg-bakery-pink/10 px-2 py-1 rounded-full">
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <ul className="text-sm text-bakery-brown/80 space-y-0.5 mb-2">
                    {order.items.map((item) => (
                      <li key={item.id}>{item.quantity} x {item.product_name}</li>
                    ))}
                  </ul>
                  <div className="flex justify-between text-sm text-bakery-brown/60">
                    <span>Needed by {order.date_needed}</span>
                    <span className="font-medium text-bakery-brown">
                      KES {Number(order.total).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
