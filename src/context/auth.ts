import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, email: string, password: string) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
