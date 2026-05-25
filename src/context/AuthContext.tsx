import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (emailOrPhone: string, password: string) => {
    const isEmail = emailOrPhone.includes('@');

    if (isEmail) {
      // Login with email directly
      const { error } = await supabase.auth.signInWithPassword({ email: emailOrPhone, password });
      if (error) throw error;
    } else {
      // Login with phone — find email from profiles table
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('email')
        .eq('phone', emailOrPhone)
        .single();

      if (fetchError || !data?.email) throw new Error('No account found with this phone number');

      const { error } = await supabase.auth.signInWithPassword({ email: data.email, password });
      if (error) throw error;
    }
  };

  const register = async (name: string, phone: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } },
    });
    if (error) throw error;

    // Save to profiles table
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        phone,
        email,
      });
    }
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
