/* eslint-env node */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carrega variáveis de ambiente para testes (usa .env.test se existir)
dotenv.config();

// Supabase client for Node.js testing environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables for testing');
}

export const testSupabase = createClient(supabaseUrl, supabaseAnonKey);