import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContext } from './auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (emailOrPhone: string, password: string) => {
    const value = emailOrPhone.trim();
    let email = value;

    if (!value.includes('@')) {
      // Phone login: look up the email saved for this phone number.
      const { data, error } = await supabase.from('profiles').select('email').eq('phone', value).single();
      if (error || !data?.email) throw new Error('No account found with this phone number');
      email = data.email;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async (name: string, phone: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name, phone } },
    });
    if (error) throw error;

    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, name, phone, email: email.trim() });
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'signup' });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
