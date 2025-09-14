import { createClient } from '@supabase/supabase-js';

// Supabase client initialization for browser (Vite)
// Uses public anon key only. Never expose service-role keys in the client.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Provide a clear runtime error to help developers configure env vars
  // This logs only in dev when env is missing; production builds should have these set.
  console.error('Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default supabase;
