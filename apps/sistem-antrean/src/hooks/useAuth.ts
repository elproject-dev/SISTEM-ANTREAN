import { useCallback, useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import type { DbStaffUser } from '../lib/supabase';

const AUTH_STORAGE_KEY = 'sistem_antrean_staff_id';

export interface AuthState {
  user: DbStaffUser | null;
  staffProfile: DbStaffUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    staffProfile: null,
    loading: true,
    error: null,
  });

  const loadStaffProfile = useCallback(async (id: string) => {
    try {
      const { data, error } = await db
        .from('staff_users')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return data as DbStaffUser;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedId) {
        const profile = await loadStaffProfile(savedId);
        if (mounted) {
          setState({ user: profile, staffProfile: profile, loading: false, error: null });
        }
      } else {
        if (mounted) {
          setState({ user: null, staffProfile: null, loading: false, error: null });
        }
      }
    };
    init();
    return () => { mounted = false; };
  }, [loadStaffProfile]);

  const signIn = useCallback(async (email: string, password?: string): Promise<{ error: string | null }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    if (password) {
      const { error: authError } = await db.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (authError) {
        const msg = authError.message;
        setState(prev => ({ ...prev, loading: false, error: msg }));
        return { error: msg };
      }
    }

    // Cari user berdasarkan email
    const { data: profiles, error } = await db
      .from('staff_users')
      .select('*')
      .eq('email', email.trim());

    if (error || !profiles || profiles.length === 0) {
      const msg = 'User dengan email tersebut tidak ditemukan.';
      setState(prev => ({ ...prev, loading: false, error: msg }));
      return { error: msg };
    }

    const profile = profiles[0] as DbStaffUser;

    if (profile.status !== 'active') {
      const msg = profile.status === 'pending'
        ? '⏳ Akun Anda masih menunggu persetujuan Admin.'
        : '🚫 Akun Anda telah dinonaktifkan.';
      setState(prev => ({ ...prev, loading: false, error: msg }));
      return { error: msg };
    }

    localStorage.setItem(AUTH_STORAGE_KEY, profile.id);
    setState({ user: profile, staffProfile: profile, loading: false, error: null });
    return { error: null };
  }, [loadStaffProfile]);

  const signUp = useCallback(async (params: {
    email: string;
    password?: string;
    name: string;
    phone: string;
    role?: 'admin' | 'operator';
  }): Promise<{ error: string | null }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    if (params.password) {
      const { error: authError } = await db.auth.signUp({
        email: params.email.trim(),
        password: params.password,
      });
      if (authError && !authError.message.includes('User already registered')) {
         return { error: authError.message };
      }
    }
    
    const { error: profileError } = await db
      .from('staff_users')
      .insert({
        name: params.name,
        email: params.email.trim(),
        phone: params.phone,
        role: params.role ?? 'operator',
        status: 'pending',
      });
      
    if (profileError) {
      const msg = profileError.message.includes('unique constraint') || profileError.message.includes('duplicate key')
        ? '❌ Email sudah terdaftar.' 
        : 'Gagal mendaftar.';
      setState(prev => ({ ...prev, loading: false, error: msg }));
      return { error: msg };
    }
    
    setState(prev => ({ ...prev, loading: false, error: null }));
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setState({ user: null, staffProfile: null, loading: false, error: null });
  }, []);

  const isAdmin = state.staffProfile?.role === 'admin';
  const isOperator = state.staffProfile?.role === 'operator';
  const isActive = state.staffProfile?.status === 'active';
  const isAuthenticated = !!state.staffProfile && isActive;

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    isAdmin,
    isOperator,
    isActive,
    isAuthenticated,
    loadStaffProfile,
  };
}
