import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // only happens if a component tries to use this outside AuthProvider — a coding mistake, not a runtime edge case
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}