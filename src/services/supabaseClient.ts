import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://supabase.viajes.cloud';

const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

let runtimeUrl = '';
let runtimeAnonKey = '';

export function getEffectiveSupabaseUrl(): string {
  const localUrl = typeof window !== 'undefined' ? (localStorage.getItem('galicia_supabase_url') || '').trim() : '';
  return localUrl || runtimeUrl || envUrl || DEFAULT_SUPABASE_URL;
}

export function getEffectiveSupabaseAnonKey(): string {
  const localKey = typeof window !== 'undefined' ? (localStorage.getItem('galicia_supabase_anon_key') || '').trim() : '';
  return localKey || runtimeAnonKey || envAnonKey || '';
}

export function isSupabaseConfigured(): boolean {
  const url = getEffectiveSupabaseUrl();
  const key = getEffectiveSupabaseAnonKey();

  if (!url || !key) return false;
  if (
    url.includes('YOUR_') ||
    url.includes('your-supabase') ||
    key.includes('YOUR_') ||
    key.length < 20
  ) {
    return false;
  }

  try {
    const parsed = new URL(url);
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
      const url = getEffectiveSupabaseUrl();
      const key = getEffectiveSupabaseAnonKey();
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
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

/**
 * Fetch server-side runtime config from /api/public-config (Coolify environment variables)
 */
export async function syncRuntimeConfig(): Promise<{ configured: boolean; url: string }> {
  try {
    const res = await fetch('/api/public-config');
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl) {
        runtimeUrl = data.supabaseUrl.trim();
      }
      if (data.supabaseAnonKey) {
        runtimeAnonKey = data.supabaseAnonKey.trim();
      }
      if (runtimeAnonKey && !clientInstance) {
        clientInstance = null; // Re-create with runtime keys
        getSupabaseClient();
      }
    }
  } catch {
    // Ignore offline or dev mode fetch errors
  }

  return {
    configured: isSupabaseConfigured(),
    url: getEffectiveSupabaseUrl(),
  };
}

export function saveCustomSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    const cleanUrl = url.trim() || DEFAULT_SUPABASE_URL;
    const cleanKey = anonKey.trim();
    localStorage.setItem('galicia_supabase_url', cleanUrl);
    localStorage.setItem('galicia_supabase_anon_key', cleanKey);
    runtimeUrl = cleanUrl;
    runtimeAnonKey = cleanKey;
    clientInstance = null; // reset to force re-instantiation
  }
}

export function clearCustomSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('galicia_supabase_url');
    localStorage.removeItem('galicia_supabase_anon_key');
    runtimeAnonKey = '';
    clientInstance = null;
  }
}

export const SUPABASE_URL = getEffectiveSupabaseUrl();
export const SUPABASE_ANON_KEY = getEffectiveSupabaseAnonKey();
export const supabase = getSupabaseClient();
