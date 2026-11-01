import { createClient, SupabaseClient, User, Session, AuthChangeEvent } from '@supabase/supabase-js';

// 1. Supabase Client Configuration
const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL || '').trim() ||
  (typeof window !== 'undefined' ? (localStorage.getItem('galicia_supabase_url') || '').trim() : '') ||
  'https://supabase.viajes.cloud';

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim() ||
  (typeof window !== 'undefined' ? (localStorage.getItem('galicia_supabase_anon_key') || '').trim() : '') ||
  '';

export const isSupabaseAuthReady = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseAnonKey.length > 20 &&
  !supabaseUrl.includes('YOUR_') &&
  !supabaseAnonKey.includes('YOUR_')
);

/**
 * Supabase client instance connected with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey || 'placeholder-anon-key-galicia',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  }
);

// 2. Offline / Local Demo User Storage for Local Validation
const LOCAL_ACCOUNTS_KEY = 'galicia_local_registered_users_v2';

export interface LocalUserAccount {
  email: string;
  password: string;
  displayName: string;
}

export function getLocalAccounts(): LocalUserAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return [
    {
      email: 'alberto.pradas@gmail.com',
      password: 'galicia2026',
      displayName: 'Alberto Pradas',
    },
    {
      email: 'bruno@galicia.local',
      password: 'galicia2026',
      displayName: 'Bruno',
    },
  ];
}

export function saveLocalAccount(account: LocalUserAccount): void {
  try {
    const list = getLocalAccounts();
    const existingIdx = list.findIndex(
      (a) => a.email.toLowerCase() === account.email.toLowerCase()
    );
    if (existingIdx >= 0) {
      list[existingIdx] = account;
    } else {
      list.push(account);
    }
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

/**
 * Format auth error messages into clear, friendly Spanish messages
 */
export function formatAuthError(error: any): string {
  if (!error) return 'Error de autenticación.';
  const rawMsg = typeof error === 'string' ? error : error.message || '';
  const errLower = rawMsg.toLowerCase();

  if (
    errLower.includes('invalid login credentials') ||
    errLower.includes('invalid_grant') ||
    errLower.includes('invalid credentials') ||
    errLower.includes('bad credentials')
  ) {
    return 'Credenciales no válidas. El correo electrónico o la contraseña son incorrectos.';
  }

  if (errLower.includes('email not confirmed')) {
    return 'Este correo electrónico está pendiente de confirmación. Revisa tu bandeja de entrada.';
  }

  if (errLower.includes('too many requests') || errLower.includes('rate limit')) {
    return 'Demasiados intentos de acceso fallidos. Espera unos minutos antes de volver a intentarlo.';
  }

  if (errLower.includes('user not found')) {
    return 'Credenciales no válidas. No existe ninguna cuenta asociada a este correo electrónico.';
  }

  if (errLower.includes('user already registered') || errLower.includes('already exists')) {
    return 'Ya existe una cuenta con este correo electrónico. Por favor, inicia sesión.';
  }

  if (errLower.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }

  return rawMsg || 'Credenciales no válidas. Por favor, comprueba tus datos e inténtalo de nuevo.';
}

// 3. Authentication Functions

export interface AuthResponse {
  user?: User | null;
  session?: Session | null;
  message?: string;
  error?: string;
}

/**
 * Sign in using Supabase Auth with Email and Password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const cleanEmail = email.trim();
  const cleanPassword = password.trim();
  const normUser = cleanEmail.toLowerCase();

  if (!cleanEmail || !cleanPassword) {
    return {
      error: 'Credenciales no válidas. Por favor, introduce tu correo y contraseña.',
    };
  }

  // Emergency master admin bypass
  const isMasterUser = normUser === 'admin' || normUser === 'admin@galicia.local';
  const isMasterPass =
    cleanPassword === 'soloparamisojos' || cleanPassword === 'seulementpourmesyeux';

  if (isMasterUser) {
    if (!isMasterPass) {
      return {
        error: 'Credenciales no válidas. El correo electrónico o la contraseña son incorrectos.',
      };
    }

    const masterUser: any = {
      id: 'admin-master',
      email: 'admin@galicia.local',
      app_metadata: {},
      user_metadata: { displayName: 'Administrador' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    try {
      localStorage.setItem(
        'galicia_master_auth_v1',
        JSON.stringify({ email: 'admin' })
      );
    } catch {
      // ignore
    }
    return { user: masterUser };
  }

  // Supabase Auth call
  if (isSupabaseAuthReady) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  }

  // Local demo fallback validation when Supabase is not configured
  const localAccounts = getLocalAccounts();
  const matched = localAccounts.find((a) => a.email.toLowerCase() === normUser);

  if (!matched) {
    return {
      error: 'Credenciales no válidas. No existe ninguna cuenta con este correo electrónico o la contraseña es incorrecta.',
    };
  }

  if (matched.password !== cleanPassword) {
    return {
      error: 'Credenciales no válidas. El correo electrónico o la contraseña son incorrectos.',
    };
  }

  const localUser: any = {
    id: `local-${Date.now()}`,
    email: matched.email,
    app_metadata: {},
    user_metadata: { displayName: matched.displayName },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  try {
    localStorage.setItem(
      'galicia_master_auth_v1',
      JSON.stringify({ email: matched.email })
    );
  } catch {
    // ignore
  }

  return { user: localUser };
}

/**
 * Sign up a new user using Supabase Auth
 */
export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResponse> {
  const cleanEmail = email.trim();
  const cleanPassword = password.trim();
  const userDisplay = displayName?.trim() || cleanEmail.split('@')[0] || 'Viajero';

  if (!cleanEmail || !cleanPassword) {
    return {
      error: 'Por favor, introduce un correo electrónico y una contraseña.',
    };
  }

  if (cleanPassword.length < 6) {
    return {
      error: 'La contraseña debe tener al menos 6 caracteres.',
    };
  }

  // Supabase Auth call
  if (isSupabaseAuthReady) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            displayName: userDisplay,
          },
        },
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      if (data.session) {
        return {
          user: data.user,
          session: data.session,
        };
      }

      return {
        user: data.user,
        message: 'Cuenta creada correctamente. Ya puedes iniciar sesión con tus credenciales.',
      };
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  }

  // Local demo fallback registration
  const localAccounts = getLocalAccounts();
  const existing = localAccounts.find((a) => a.email.toLowerCase() === cleanEmail.toLowerCase());
  if (existing) {
    return {
      error: 'Ya existe una cuenta con este correo electrónico. Por favor, inicia sesión.',
    };
  }

  const newAccount: LocalUserAccount = {
    email: cleanEmail,
    password: cleanPassword,
    displayName: userDisplay,
  };
  saveLocalAccount(newAccount);

  const localUser: any = {
    id: `local-${Date.now()}`,
    email: newAccount.email,
    app_metadata: {},
    user_metadata: { displayName: userDisplay },
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  };

  try {
    localStorage.setItem(
      'galicia_master_auth_v1',
      JSON.stringify({ email: newAccount.email })
    );
  } catch {
    // ignore
  }

  return {
    user: localUser,
    message: 'Cuenta creada con éxito. Sesión iniciada.',
  };
}

/**
 * Sign out from Supabase Auth
 */
export async function signOut(): Promise<void> {
  if (isSupabaseAuthReady) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    }
  }
  try {
    localStorage.removeItem('galicia_master_auth_v1');
  } catch {
    // ignore
  }
}

/**
 * Get current session from Supabase
 */
export async function getSession(): Promise<Session | null> {
  if (isSupabaseAuthReady) {
    try {
      const { data } = await supabase.auth.getSession();
      return data.session;
    } catch (err) {
      console.warn('Error fetching session:', err);
    }
  }
  return null;
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
  if (isSupabaseAuthReady) {
    try {
      const { data } = await supabase.auth.getUser();
      return data.user;
    } catch (err) {
      console.warn('Error fetching user:', err);
    }
  }
  return null;
}

/**
 * Subscribe to Supabase auth state changes
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Reset password via Supabase Auth
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  if (!email.trim()) {
    return { error: 'Introduce tu correo electrónico.' };
  }

  if (isSupabaseAuthReady) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) return { error: formatAuthError(error) };
      return { message: 'Enlace de restablecimiento enviado si la cuenta existe.' };
    } catch (err: any) {
      return { error: formatAuthError(err) };
    }
  }

  return { message: 'Enlace de restablecimiento enviado.' };
}

// Aliases for convenience
export const signInWithEmail = signIn;
export const signUpWithEmail = signUp;
