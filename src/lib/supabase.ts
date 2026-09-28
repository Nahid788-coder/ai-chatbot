import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// createClient throws when the URL is missing, which leaves a blank page.
// Use placeholders so main.tsx can show a setup message instead.
export const supabase = createClient(
  supabaseUrl || 'http://localhost',
  supabaseKey || 'missing-key',
);
