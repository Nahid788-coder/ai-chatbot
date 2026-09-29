import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// createClient throws when the URL is missing, which would leave a blank page.
// Placeholders let main.tsx show a setup message instead.
export const supabase = createClient(supabaseUrl || 'http://localhost', supabaseKey || 'missing-key');
