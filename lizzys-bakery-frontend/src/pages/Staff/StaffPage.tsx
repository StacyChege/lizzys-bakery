import { useState, useEffect, useCallback } from 'react';
import {
  fetchRoster,
  clockIn,
  clockOut,
  fetchMyShift,
  fetchTodayStock,
  setStock,
  logSale,
} from '../../api/staff';
import fetchProducts from '../../api/products';
import type { StaffMember, DailyStockItem, ShiftSummary } from '../../types/StaffShift';
import type Product from '../../types/Product';

const TOKEN_KEY = 'staffShiftToken';
const NAME_KEY = 'staffShiftName';

function extractErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data && typeof data === 'object') {
      const asRecord = data as Record<string, unknown>;
      const nonField = asRecord.non_field_errors;
      if (Array.isArray(nonField) && typeof nonField[0] === 'string') return nonField[0];
      if (typeof asRecord.detail === 'string') return asRecord.detail;
    }
  }
  return 'Something went wrong. Please try again.';
}

export default function StaffPage() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [staffName, setStaffName] = useState<string | null>(() => localStorage.getItem(NAME_KEY));

  // --- Clock-in screen state ---
  const [roster, setRoster] = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isClockingIn, setIsClockingIn] = useState(false);

  // --- Shift screen state ---
  const [products, setProducts] = useState<Product[]>([]);
  const [todayStock, setTodayStock] = useState<DailyStockItem[]>([]);
  const [shift, setShift] = useState<ShiftSummary | null>(null);
  const [stockProductId, setStockProductId] = useState<number | ''>('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [saleProductId, setSaleProductId] = useState<number | ''>('');
  const [saleQuantity, setSaleQuantity] = useState('1');
  const [actionError, setActionError] = useState('');
  const [finalSummary, setFinalSummary] = useState<ShiftSummary | null>(null);

  useEffect(() => {
    if (!token) {
      fetchRoster().then(setRoster).catch(() => setLoginError('Could not load staff list.'));
    }
  }, [token]);

  const refreshShiftData = useCallback(() => {
    fetchProducts().then(setProducts).catch(() => {});
    fetchTodayStock().then(setTodayStock).catch(() => {});
    fetchMyShift().then(setShift).catch(() => {});
  }, []);

  useEffect(() => {
    if (token) refreshShiftData();
  }, [token, refreshShiftData]);

  async function handleClockIn(e: React.FormEvent) {
    e.preventDefault();
    if (selectedStaffId === null || !pin) return;
    setLoginError('');
    setIsClockingIn(true);
    try {
      const data = await clockIn(selectedStaffId, pin);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(NAME_KEY, data.staff_name);
      setToken(data.token);
      setStaffName(data.staff_name);
      setPin('');
    } catch (err) {
      setLoginError(extractErrorMessage(err));
    } finally {
      setIsClockingIn(false);
    }
  }

  async function handleSetStock(e: React.FormEvent) {
    e.preventDefault();
    if (stockProductId === '' || !stockQuantity) return;
    setActionError('');
    try {
      await setStock(stockProductId, Number(stockQuantity));
      setStockQuantity('');
      setStockProductId('');
      refreshShiftData();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  async function handleLogSale(e: React.FormEvent) {
    e.preventDefault();
    if (saleProductId === '' || !saleQuantity) return;
    setActionError('');
    try {
      await logSale(saleProductId, Number(saleQuantity));
      setSaleQuantity('1');
      refreshShiftData();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  async function handleClockOut() {
    try {
      const summary = await clockOut();
      setFinalSummary(summary);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(NAME_KEY);
      setToken(null);
      setStaffName(null);
      setShift(null);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  // --- Post-clock-out summary screen ---
  if (finalSummary) {
    return (
      <div className="bg-bakery-pink/10 min-h-[70vh] py-16 px-4">
        <div className="max-w-lg mx-auto text-center font-body">
        <p className="font-script text-3xl text-bakery-pink-dark mb-2">Clocked out</p>
        <p className="text-bakery-brown/70 mb-6">
          Thanks, {finalSummary.staff_name}. Here's what you sold today:
        </p>
        <div className="bg-white rounded-2xl shadow-md p-6 text-left border-t-4 border-bakery-pink-dark">
          {finalSummary.sales.length === 0 ? (
            <p className="text-bakery-brown/50 text-sm">No sales logged this shift.</p>
          ) : (
            <ul className="space-y-1 mb-4">
              {finalSummary.sales.map((s) => (
                <li key={s.id} className="flex justify-between text-sm text-bakery-brown">
                  <span>{s.quantity} x {s.product_name}</span>
                  <span>KES {(Number(s.unit_price) * s.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-bakery-pink/20 pt-3 flex justify-between font-semibold text-bakery-brown">
            <span>Total ({finalSummary.total_quantity} items)</span>
            <span>KES {finalSummary.total_revenue.toLocaleString()}</span>
          </div>
        </div>
        <button
          onClick={() => setFinalSummary(null)}
          className="mt-6 text-bakery-pink-dark underline text-sm"
        >
          Back to clock-in
        </button>
        </div>
      </div>
    );
  }

  // --- Clock-in screen ---
  if (!token) {
    return (
      <div className="bg-bakery-pink/10 min-h-[70vh] flex items-center px-4 py-16">
      <div className="max-w-sm mx-auto w-full">
        <h1 className="font-script text-4xl text-bakery-pink-dark text-center mb-6">
          Staff Clock In
        </h1>
        <form onSubmit={handleClockIn} className="relative bg-white rounded-3xl shadow-lg p-6 pt-8 border-2 border-dashed border-bakery-pink/40 space-y-4">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-bakery-pink-dark shadow-md" />
          <div>
            <label className="block text-sm font-medium text-bakery-brown mb-1">Who are you?</label>
            <select
              value={selectedStaffId ?? ''}
              onChange={(e) => setSelectedStaffId(e.target.value ? Number(e.target.value) : null)}
              className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink"
            >
              <option value="">Select your name</option>
              {roster.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-bakery-brown mb-1">PIN</label>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full border border-bakery-pink/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-bakery-pink"
            />
          </div>
          {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
          <button
            type="submit"
            disabled={isClockingIn || selectedStaffId === null || !pin}
            className="w-full bg-bakery-pink-dark text-white font-semibold py-2.5 rounded-full hover:bg-bakery-brown transition-colors disabled:opacity-50"
          >
            {isClockingIn ? 'Clocking in…' : 'Clock In'}
          </button>
        </form>
      </div>
      </div>
    );
  }

  // --- Active shift screen ---
  const stockedProductIds = new Set(todayStock.map((s) => s.product));

  return (
    <div className="bg-bakery-pink/10 min-h-screen py-10 px-4">
    <div className="max-w-2xl mx-auto font-body">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-script text-3xl text-bakery-pink-dark">Hi, {staffName}</h1>
        <button
          onClick={handleClockOut}
          className="text-sm text-bakery-brown/60 hover:text-red-500 border border-bakery-pink/30 rounded-full px-4 py-1.5 bg-white"
        >
          Clock Out
        </button>
      </div>

      {actionError && (
        <p className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-6">{actionError}</p>
      )}

      {/* --- SET TODAY'S STOCK --- */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border-t-4 border-bakery-pink-dark">
        <h2 className="font-semibold text-bakery-brown mb-3">Set Today's Stock</h2>
        <form onSubmit={handleSetStock} className="flex gap-2">
          <select
            value={stockProductId}
            onChange={(e) => setStockProductId(e.target.value ? Number(e.target.value) : '')}
            className="flex-1 border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Choose an item</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            placeholder="Qty"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            className="w-20 border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="bg-bakery-pink-dark text-white font-medium px-4 rounded-full text-sm hover:bg-bakery-brown"
          >
            Set
          </button>
        </form>

        {todayStock.length > 0 && (
          <ul className="mt-4 space-y-1 text-sm">
            {todayStock.map((s) => (
              <li key={s.id} className="flex justify-between text-bakery-brown">
                <span>{s.product_name}</span>
                <span className="text-bakery-brown/60">
                  {s.quantity_remaining} left of {s.quantity_stocked}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- LOG A SALE --- */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border-t-4 border-bakery-brown">
        <h2 className="font-semibold text-bakery-brown mb-3">Log a Sale</h2>
        {stockedProductIds.size === 0 ? (
          <p className="text-sm text-bakery-brown/50">Set today's stock above before logging sales.</p>
        ) : (
          <form onSubmit={handleLogSale} className="flex gap-2">
            <select
              value={saleProductId}
              onChange={(e) => setSaleProductId(e.target.value ? Number(e.target.value) : '')}
              className="flex-1 border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Choose an item</option>
              {todayStock.map((s) => (
                <option key={s.product} value={s.product}>
                  {s.product_name} ({s.quantity_remaining} left)
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={saleQuantity}
              onChange={(e) => setSaleQuantity(e.target.value)}
              className="w-20 border border-bakery-pink/30 rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="bg-bakery-brown text-white font-medium px-4 rounded-full text-sm hover:bg-bakery-pink-dark"
            >
              Sold
            </button>
          </form>
        )}
      </div>

      {/* --- YOUR SALES TODAY --- */}
      <div className="bg-white rounded-2xl shadow-sm p-5 border-t-4 border-bakery-pink">
        <h2 className="font-semibold text-bakery-brown mb-3">Your Sales Today</h2>
        {!shift || shift.sales.length === 0 ? (
          <p className="text-sm text-bakery-brown/50">No sales logged yet this shift.</p>
        ) : (
          <>
            <ul className="space-y-1 mb-3 text-sm">
              {shift.sales.map((s) => (
                <li key={s.id} className="flex justify-between text-bakery-brown">
                  <span>{s.quantity} x {s.product_name}</span>
                  <span>KES {(Number(s.unit_price) * s.quantity).toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-bakery-pink/20 pt-3 flex justify-between font-semibold text-bakery-brown text-sm">
              <span>Total ({shift.total_quantity} items)</span>
              <span>KES {shift.total_revenue.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>
    </div>
    </div>
  );
}
