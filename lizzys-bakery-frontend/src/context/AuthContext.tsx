/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { loginUser, registerUser, getMe } from '../api/auth';
import type User from '../types/User';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;   // true while we check for a stored session on first load
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, fullName: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // on app load, check if we already have a token and re-fetch the user
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      
      queueMicrotask(() => setIsLoading(false));
      return;
    }
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => {
        // token was invalid/expired and refresh already failed inside axiosInstance
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await loginUser(email, password);
    localStorage.setItem('accessToken', res.data.access);
    localStorage.setItem('refreshToken', res.data.refresh);
    const me = await getMe();
    setUser(me.data);
  }

  async function register(email: string, fullName: string, phone: string, password: string) {
    await registerUser(email, fullName, phone, password);
    await login(email, password);   // log them straight in after registering
  }

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}