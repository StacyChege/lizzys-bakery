import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { fetchDeliveryZones, submitOrder } from '../../api/orders';
import { earliestAllowedDate, formatDateForApi } from '../../utils/dateRules';
import { isValidEmail } from '../../utils/validateForm';
import type { DeliveryZone, FulfilmentMethod, Order } from '../../types/Order';

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data && typeof data === 'object') {
      const firstValue = Object.values(data as Record<string, unknown>)[0];
      if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') return firstValue[0];
      if (typeof firstValue === 'string') return firstValue;
    }
  }
  return 'Could not place your order. Please try again.';
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [hasPrefilled, setHasPrefilled] = useState(false);
  const [dateNeeded, setDateNeeded] = useState<Date | null>(null);
  const [fulfilmentMethod, setFulfilmentMethod] = useState<FulfilmentMethod>('PICKUP');
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [deliveryZoneId, setDeliveryZoneId] = useState<number | ''>('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchDeliveryZones().then(setDeliveryZones).catch(() => {});
  }, []);

  // AuthContext resolves the logged-in user asynchronously, so it may not
  // be ready on first render — sync it in once it arrives, but only the
  // first time, so it never clobbers something the customer already typed.
  useEffect(() => {
    if (user && !hasPrefilled) {
      queueMicrotask(() => {
        setContactName(user.full_name);
        setContactPhone(user.phone_number);
        setContactEmail(user.email);
        setHasPrefilled(true);
      });
    }
  }, [user, hasPrefilled]);

  const selectedZone = deliveryZones.find((z) => z.id === deliveryZoneId);
  const deliveryFee = fulfilmentMethod === 'BAKERY_DELIVERY' && selectedZone ? Number(selectedZone.fee) : 0;
  const orderTotal = totalPrice + deliveryFee;

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!contactName.trim()) errors.contactName = 'Name is required';
    if (!contactPhone.trim()) errors.contactPhone = 'Phone number is required';
    if (contactEmail && !isValidEmail(contactEmail)) errors.contactEmail = 'Enter a valid email address';
    if (!dateNeeded) errors.dateNeeded = 'Pick the date you need this by';
    if (fulfilmentMethod === 'BAKERY_DELIVERY' && !deliveryZoneId) {
      errors.deliveryZoneId = 'Choose a delivery zone';
    }
    if (fulfilmentMethod !== 'PICKUP' && !deliveryAddress.trim()) {
      errors.deliveryAddress = 'Address is required for delivery';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || !dateNeeded) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const order = await submitOrder({
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail || undefined,
        date_needed: formatDateForApi(dateNeeded),
        fulfilment_method: fulfilmentMethod,
        delivery_zone: fulfilmentMethod === 'BAKERY_DELIVERY' && deliveryZoneId ? deliveryZoneId : undefined,
        delivery_address: fulfilmentMethod !== 'PICKUP' ? deliveryAddress : undefined,
        notes: notes || undefined,
        items: items.map((item) => ({
          product: item.productId,
          quantity: item.quantity,
          flavour: item.flavour ?? undefined,
          size_label: item.size?.label ?? undefined,
        })),
      });
      clearCart();
      setPlacedOrder(order);
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (placedOrder) {
    return (
      <div className="bg-bakery-pink/10 min-h-[70vh] py-16 px-4">
        <div className="max-w-lg mx-auto text-center font-body">
          <p className="font-script text-4xl text-bakery-pink-dark mb-2">Order placed!</p>
          <p className="text-bakery-brown/70 mb-6">
            Order #{placedOrder.id} — we'll be in touch at {placedOrder.contact_phone} to confirm
            details and arrange payment via M-Pesa.
          </p>
          <div className="bg-white rounded-2xl shadow-md p-6 text-left border-t-4 border-bakery-pink-dark">
            <ul className="space-y-1 mb-3 text-sm">
              {placedOrder.items.map((i) => (
                <li key={i.id} className="flex justify-between text-bakery-brown">
                  <span>{i.quantity} x {i.product_name}</span>
                  <span>KES {(Number(i.unit_price) * i.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            {Number(placedOrder.delivery_fee) > 0 && (
              <div className="flex justify-between text-sm text-bakery-brown/70 border-t border-bakery-pink/20 pt-2">
                <span>Delivery</span>
                <span>KES {Number(placedOrder.delivery_fee).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-bakery-brown border-t border-bakery-pink/20 mt-2 pt-2">
              <span>Total</span>
              <span>KES {Number(placedOrder.total).toLocaleString()}</span>
            </div>
          </div>
          <Link to="/menu" className="inline-block mt-6 text-bakery-pink-dark underline text-sm">
            Back to the menu
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-bakery-pink/10 min-h-[70vh] flex items-center px-4">
        <div className="max-w-lg mx-auto text-center font-body">
          <p className="font-script text-3xl text-bakery-pink-dark mb-2">Nothing to check out</p>
          <p className="text-bakery-brown/60 mb-6">Your cart is empty — add something from the menu first.</p>
          <Link
            to="/menu"
            className="inline-block bg-bakery-pink-dark text-white font-semibold px-6 py-2.5 rounded-full hover:bg-bakery-brown transition-colors"
          >
            Browse the Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bakery-pink/10 min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto font-body">
        <h1 className="font-script text-4xl text-bakery-pink-dark mb-6">Checkout</h1>

        <div className="grid md:grid-cols-5 gap-6">
          <form onSubmit={handleSubmit} className="md:col-span-3 bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
                />
                {fieldErrors.contactName && <p className="text-red-500 text-xs mt-1">{fieldErrors.contactName}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
                />
                {fieldErrors.contactPhone && <p className="text-red-500 text-xs mt-1">{fieldErrors.contactPhone}</p>}
              </div>
            </div>

            <div>
              <input
                type="email"
                placeholder="Email (optional)"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
              />
              {fieldErrors.contactEmail && <p className="text-red-500 text-xs mt-1">{fieldErrors.contactEmail}</p>}
            </div>

            <div>
              <DatePicker
                selected={dateNeeded}
                onChange={(date: Date | null) => setDateNeeded(date)}
                minDate={earliestAllowedDate()}
                placeholderText="Date you need it by"
                className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
              />
              {fieldErrors.dateNeeded && <p className="text-red-500 text-xs mt-1">{fieldErrors.dateNeeded}</p>}
            </div>

            <div>
              <p className="text-sm font-medium text-bakery-brown mb-2">How will you get your order?</p>
              <div className="flex flex-col gap-2">
                {(['PICKUP', 'OWN_DELIVERY', 'BAKERY_DELIVERY'] as FulfilmentMethod[]).map((method) => (
                  <label key={method} className="flex items-center gap-2 text-sm text-bakery-brown">
                    <input
                      type="radio"
                      name="fulfilment"
                      checked={fulfilmentMethod === method}
                      onChange={() => setFulfilmentMethod(method)}
                    />
                    {method === 'PICKUP' && 'Pickup at the bakery'}
                    {method === 'OWN_DELIVERY' && 'My own delivery rider/courier'}
                    {method === 'BAKERY_DELIVERY' && 'Bakery delivery'}
                  </label>
                ))}
              </div>
            </div>

            {fulfilmentMethod === 'BAKERY_DELIVERY' && (
              <div>
                <select
                  value={deliveryZoneId}
                  onChange={(e) => setDeliveryZoneId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Choose a delivery zone</option>
                  {deliveryZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} (+KES {Number(z.fee).toLocaleString()})
                    </option>
                  ))}
                </select>
                {fieldErrors.deliveryZoneId && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.deliveryZoneId}</p>
                )}
              </div>
            )}

            {fulfilmentMethod !== 'PICKUP' && (
              <div>
                <textarea
                  placeholder={
                    fulfilmentMethod === 'BAKERY_DELIVERY'
                      ? 'Delivery address'
                      : 'Address your rider will collect from / deliver to'
                  }
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={2}
                  className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm resize-none"
                />
                {fieldErrors.deliveryAddress && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.deliveryAddress}</p>
                )}
              </div>
            )}

            <textarea
              placeholder="Order notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm resize-none"
            />

            {submitError && <p className="text-red-600 text-sm">{submitError}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-bakery-pink-dark text-white font-semibold py-2.5 rounded-full hover:bg-bakery-brown transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Placing order…' : 'Place Order'}
            </button>
            <p className="text-xs text-bakery-brown/50 text-center">
              No payment happens on this site — we'll confirm your order and arrange M-Pesa payment directly.
            </p>
          </form>

          {/* --- ORDER SUMMARY --- */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-bakery-brown">
              <h2 className="font-semibold text-bakery-brown mb-3">Your Order</h2>
              <ul className="space-y-2 mb-4 text-sm">
                {items.map((item) => {
                  const unitPrice = item.basePrice + (item.size?.price_modifier ?? 0);
                  return (
                    <li key={item.id} className="flex justify-between text-bakery-brown">
                      <span>{item.quantity} x {item.name}</span>
                      <span>KES {(unitPrice * item.quantity).toLocaleString()}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-bakery-pink/20 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-bakery-brown/70">
                  <span>Subtotal</span>
                  <span>KES {totalPrice.toLocaleString()}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-bakery-brown/70">
                    <span>Delivery</span>
                    <span>KES {deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-bakery-pink-dark text-base pt-1">
                  <span>Total</span>
                  <span>KES {orderTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
