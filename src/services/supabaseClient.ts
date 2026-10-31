import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase URL and Anon Key from Vite env or user localStorage overrides
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('galicia_supabase_url') || '' : '';
const localAnonKey = typeof window !== 'undefined' ? localStorage.getItem('galicia_supabase_anon_key') || '' : '';

export const SUPABASE_URL = (localUrl || envUrl || '').trim();
export const SUPABASE_ANON_KEY = (localAnonKey || envAnonKey || '').trim();

export function isSupabaseConfigured(): boolean {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  if (
    SUPABASE_URL.includes('YOUR_') ||
    SUPABASE_URL.includes('your-supabase') ||
    SUPABASE_ANON_KEY.includes('YOUR_')
  ) {
    return false;
  }
  try {
    const parsed = new URL(SUPABASE_URL);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (clientInstance) return clientInstance;

  if (isSupabaseConfigured()) {
    try {
      clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return clientInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
}

export function saveCustomSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('galicia_supabase_url', url.trim());
    localStorage.setItem('galicia_supabase_anon_key', anonKey.trim());
    clientInstance = null; // reset to force re-instantiation
  }
}

export function clearCustomSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('galicia_supabase_url');
    localStorage.removeItem('galicia_supabase_anon_key');
    clientInstance = null;
  }
}

export const supabase = getSupabaseClient();
