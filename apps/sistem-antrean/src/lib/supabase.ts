import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY harus dikonfigurasi di .env'
  );
}

// ─── Database Types ────────────────────────────────────────────────────────────
// Tipe row dari skema "sistem-antrean" di Supabase
export type DbService = {
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DbCounter = {
  service_code: string;
  date: string;
  value: number;
  created_at: string;
  updated_at: string;
};

export type DbStaffUser = {
  id: string;
  auth_id: string | null;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'operator';
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

export type DbOperatorSession = {
  id: string;
  staff_id: string | null;
  name: string;
  loket: number;
  status: 'available' | 'busy' | 'offline';
  service_codes: string[];
  current_ticket_id: string | null;
  total_served: number;
  total_skipped: number;
  login_at: string;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
};

export type DbTicket = {
  id: string;
  number: number;
  display_number: string;
  service_code: string;
  type: 'offline' | 'online' | 'priority';
  status: 'pending_checkin' | 'waiting' | 'calling' | 'serving' | 'done' | 'skipped';
  customer_name: string | null;
  customer_phone: string | null;
  purpose: string | null;
  booking_code: string | null;
  assigned_loket: number | null;
  operator_id: string | null;
  operator_name: string | null;
  taken_at: string;
  checked_in_at: string | null;
  assigned_at: string | null;
  called_at: string | null;
  done_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DbRunningText = {
  id: string;
  text: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// ─── Supabase Client Tunggal ───────────────────────────────────────────────────
// Satu client dipakai untuk auth DAN data.
// Menggunakan storageKey unik agar tidak bertabrakan dengan app lain.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'sb-sistem-antrean-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  db: {
    schema: 'sistem-antrean',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper: query langsung ke schema "sistem-antrean"
// Digunakan di useSupabaseQueue untuk semua tabel
export const db = supabase;

// Alias untuk backward compat (useAuth menggunakan authClient)
export const authClient = supabase;
