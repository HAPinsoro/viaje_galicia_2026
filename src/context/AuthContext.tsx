import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  syncRuntimeConfig,
  getEffectiveSupabaseUrl,
  getEffectiveSupabaseAnonKey,
  DEFAULT_SUPABASE_URL,
} from '../services/supabaseClient';

export type CoupleId = 'ByL' | 'AyM';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  activeCouple: CoupleId;
  setActiveCouple: (couple: CoupleId) => void;
  displayName: string;
  isGuest: boolean;
  isAuthenticated: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  authError: string | null;
  clearError: () => void;
  signInWithEmail: (email: string, password: string, couple?: CoupleId) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    couple: CoupleId,
    displayName?: string
  ) => Promise<{ error?: string; message?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  updateSupabaseConfig: (url: string, anonKey: string) => void;
  resetSupabaseConfig: () => void;
  supabaseUrl: string;
  supabaseAnonKey: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COUPLE_STORAGE_KEY = 'galicia_active_couple';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeCouple, setActiveCoupleState] = useState<CoupleId>(() => {
    try {
      const saved = localStorage.getItem(COUPLE_STORAGE_KEY);
      if (saved === 'ByL' || saved === 'AyM') return saved;
    } catch {
      // ignore
    }
    return 'ByL';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(isSupabaseConfigured());
  const [supabaseUrl, setSupabaseUrl] = useState<string>(getEffectiveSupabaseUrl());
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>(getEffectiveSupabaseAnonKey());

  const setActiveCouple = (couple: CoupleId) => {
    setActiveCoupleState(couple);
    try {
      localStorage.setItem(COUPLE_STORAGE_KEY, couple);
    } catch {
      // ignore
    }
  };

  const clearError = () => setAuthError(null);

  // Initialize auth state and fetch runtime configuration if needed
  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      // 1. Check emergency master admin
      try {
        const savedMaster = localStorage.getItem('galicia_master_auth_v1');
        if (savedMaster) {
          const parsed = JSON.parse(savedMaster);
          const assignedCouple: CoupleId = parsed.couple || 'ByL';
          const masterUser: any = {
            id: 'admin-master',
            email: 'admin@galicia.local',
            app_metadata: {},
            user_metadata: { displayName: 'Administrador', couple: assignedCouple },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          };
          if (mounted) {
            setUser(masterUser);
            setActiveCoupleState(assignedCouple);
            setIsLoading(false);
          }
          return;
        }
      } catch {
        // ignore
      }

      // 2. Sync runtime config from server /api/public-config
      await syncRuntimeConfig();
      if (!mounted) return;

      const configured = isSupabaseConfigured();
      setIsConfigured(configured);
      setSupabaseUrl(getEffectiveSupabaseUrl());
      setSupabaseAnonKey(getEffectiveSupabaseAnonKey());

      const client = getSupabaseClient();
      if (!client) {
        setIsLoading(false);
        return;
      }

      // 3. Check existing Supabase session
      try {
        const { data, error } = await client.auth.getSession();
        if (mounted) {
          if (!error && data?.session) {
            setSession(data.session);
            setUser(data.session.user);
            const userCouple = (data.session.user.user_metadata?.couple as CoupleId) || 'ByL';
            setActiveCoupleState(userCouple);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Supabase getSession error:', err);
        if (mounted) setIsLoading(false);
      }

      // 4. Listen to auth changes
      const authListener = client.auth.onAuthStateChange((_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession) {
          const userCouple = (newSession.user.user_metadata?.couple as CoupleId) || activeCouple;
          setActiveCouple(userCouple);
        }
      });
      subscription = authListener.data.subscription;
    };

    initAuth();

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string, couple?: CoupleId) => {
    setAuthError(null);
    setIsLoading(true);

    const normUser = email.trim().toLowerCase();
    const isMasterUser = normUser === 'admin' || normUser === 'admin@galicia.local';
    const isMasterPass = password === 'soloparamisojos' || password === 'seulementpourmesyeux';

    // Emergency master admin bypass
    if (isMasterUser && isMasterPass) {
      const assignedCouple: CoupleId = couple || activeCouple || 'ByL';
      const masterUser: any = {
        id: 'admin-master',
        email: 'admin@galicia.local',
        app_metadata: {},
        user_metadata: { displayName: 'Administrador', couple: assignedCouple },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      setUser(masterUser);
      setActiveCouple(assignedCouple);
      try {
        localStorage.setItem(
          'galicia_master_auth_v1',
          JSON.stringify({ email: 'admin', couple: assignedCouple })
        );
      } catch {
        // ignore
      }
      setIsLoading(false);
      return {};
    }

    const client = getSupabaseClient();
    if (!client) {
      setIsLoading(false);
      const msg = 'Supabase no está configurado con la clave pública (Anon Key). Por favor, indícala en Configurar Supabase.';
      setAuthError(msg);
      return { error: msg };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let userFriendlyMsg = error.message;
        if (error.message.includes('Invalid login credentials')) {
          userFriendlyMsg = 'Credenciales no válidas. Comprueba el email y la contraseña registrados en Supabase.';
        } else if (error.message.includes('Email not confirmed')) {
          userFriendlyMsg = 'Tu usuario en Supabase está pendiente de confirmación. Confírmalo en Supabase Studio -> Users o revisa tu email.';
        }
        setAuthError(userFriendlyMsg);
        setIsLoading(false);
        return { error: userFriendlyMsg };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        const assignedCouple = couple || (data.user.user_metadata?.couple as CoupleId) || 'ByL';
        setActiveCouple(assignedCouple);
      }
      setIsLoading(false);
      return {};
    } catch (err: any) {
      const msg = err?.message || 'Error al conectar con Supabase Auth';
      setAuthError(msg);
      setIsLoading(false);
      return { error: msg };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    couple: CoupleId,
    displayName?: string
  ) => {
    setAuthError(null);
    setIsLoading(true);
    const client = getSupabaseClient();

    if (!client) {
      setIsLoading(false);
      const msg = 'Supabase no está configurado. Introduce la clave Anon en Configurar Supabase.';
      setAuthError(msg);
      return { error: msg };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            couple,
            displayName: displayName || (couple === 'ByL' ? 'Bruno y Loles (ByL)' : 'Alberto y Mari (AyM)'),
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return { error: error.message };
      }

      if (data.session) {
        setUser(data.user);
        setSession(data.session);
        setActiveCouple(couple);
        setIsLoading(false);
        return {};
      } else {
        // Confirmation email required
        setIsLoading(false);
        return {
          message:
            'Usuario registrado en Supabase. Si tu instancia requiere confirmación por email, actívalo en Supabase Studio -> Users o revisa tu bandeja.',
        };
      }
    } catch (err: any) {
      const msg = err?.message || 'Error al registrar usuario en Supabase';
      setAuthError(msg);
      setIsLoading(false);
      return { error: msg };
    }
  };

  const resetPassword = async (email: string) => {
    const client = getSupabaseClient();
    if (!client) {
      return { error: 'Supabase no configurado' };
    }
    try {
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { error: error.message };
      return { message: 'Enlace de restablecimiento enviado si el email existe en Supabase.' };
    } catch (err: any) {
      return { error: err?.message || 'Error al solicitar restablecimiento' };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setUser(null);
    setSession(null);
    try {
      localStorage.removeItem('galicia_master_auth_v1');
    } catch {
      // ignore
    }
    setIsLoading(false);
  };

  const updateSupabaseConfig = (url: string, anonKey: string) => {
    saveCustomSupabaseConfig(url, anonKey);
    setIsConfigured(isSupabaseConfigured());
    setSupabaseUrl(getEffectiveSupabaseUrl());
    setSupabaseAnonKey(getEffectiveSupabaseAnonKey());
  };

  const resetSupabaseConfig = () => {
    clearCustomSupabaseConfig();
    setIsConfigured(isSupabaseConfigured());
    setSupabaseUrl(DEFAULT_SUPABASE_URL);
    setSupabaseAnonKey('');
  };

  const displayName =
    user?.user_metadata?.displayName ||
    user?.email?.split('@')[0] ||
    (activeCouple === 'ByL' ? 'Bruno & Loles' : 'Alberto & Mari');

  // Supabase (or emergency master user) strictly controls access
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        activeCouple,
        setActiveCouple,
        displayName,
        isGuest: false,
        isAuthenticated,
        isConfigured,
        isLoading,
        authError,
        clearError,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
        updateSupabaseConfig,
        resetSupabaseConfig,
        supabaseUrl,
        supabaseAnonKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
