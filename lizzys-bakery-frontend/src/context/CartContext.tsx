/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type CartItem from '../types/CartItem';

const STORAGE_KEY = 'cart';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity: number) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | null>(null);

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    // corrupted or unavailable storage — start fresh rather than crash the app
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(item: Omit<CartItem, 'quantity'>, quantity: number) {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }

  function updateQuantity(lineId: string, quantity: number) {
    if (quantity < 1) return;
    setItems((prev) => prev.map((i) => (i.id === lineId ? { ...i, quantity } : i)));
  }

  function removeItem(lineId: string) {
    setItems((prev) => prev.filter((i) => i.id !== lineId));
  }

  function clearCart() {
    setItems([]);
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + (i.basePrice + (i.size?.price_modifier ?? 0)) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, addItem, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}
