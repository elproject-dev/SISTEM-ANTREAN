import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const supabase = createClient(supabaseUrl, supabaseAnonKey, { db: { schema: 'sistem-antrean' } });
const { data, error } = await supabase.from('staff_users').select('*');
console.log('Result global schema:', data, error);
const db2 = supabase.schema('sistem-antrean');
const { data: d2, error: e2 } = await db2.from('staff_users').select('*');
console.log('Result schema method:', d2, e2);
