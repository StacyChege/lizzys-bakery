import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    // only happens if a component tries to use this outside CartProvider — a coding mistake, not a runtime edge case
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
