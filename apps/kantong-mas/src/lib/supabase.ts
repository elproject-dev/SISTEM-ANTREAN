import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fprtzdlaeobkuzqhdqaf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcnR6ZGxhZW9ia3V6cWhkcWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NjQzMzksImV4cCI6MjA5OTM0MDMzOX0.dniOa1dBajexguQvjy-xkO5qQha1GNVKmVkel2kmxxg';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

if (!supabaseUrl.startsWith('http')) {
  throw new Error('Invalid Supabase URL. Please check your VITE_SUPABASE_URL environment variable.');
}

/** Client data — login via auth, query memakai role anon (kompatibel policy publik)
 * Realtime diaktifkan untuk mendukung update data secara real-time
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'cvaulia-kasir-auth',
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});