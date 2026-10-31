import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  SUPABASE_URL,
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
  continueAsGuest: (couple: CoupleId, name?: string) => void;
  signOut: () => Promise<void>;
  updateSupabaseConfig: (url: string, anonKey: string) => void;
  resetSupabaseConfig: () => void;
  supabaseUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'galicia_auth_guest_user';
const COUPLE_STORAGE_KEY = 'galicia_active_couple';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [activeCouple, setActiveCoupleState] = useState<CoupleId>(() => {
    try {
      const saved = localStorage.getItem(COUPLE_STORAGE_KEY);
      if (saved === 'ByL' || saved === 'AyM') return saved;
    } catch {
      // ignore
    }
    return 'ByL';
  });
  const [guestName, setGuestName] = useState<string>('Invitado');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(isSupabaseConfigured());

  const setActiveCouple = (couple: CoupleId) => {
    setActiveCoupleState(couple);
    try {
      localStorage.setItem(COUPLE_STORAGE_KEY, couple);
    } catch {
      // ignore
    }
  };

  const clearError = () => setAuthError(null);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    const client = getSupabaseClient();
    setIsConfigured(isSupabaseConfigured());

    // Check if we have an active master session
    try {
      const savedMaster = localStorage.getItem('galicia_master_auth_v1');
      if (savedMaster) {
        const parsed = JSON.parse(savedMaster);
        const assignedCouple: CoupleId = parsed.couple || 'ByL';
        const masterUser: any = {
          id: 'admin-master',
          email: 'admin',
          app_metadata: {},
          user_metadata: { displayName: 'Admin', couple: assignedCouple },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };
        setUser(masterUser);
        setActiveCoupleState(assignedCouple);
        setIsGuest(false);
        setIsLoading(false);
        return;
      }
    } catch {
      // ignore
    }

    if (!client) {
      // Check if we have a saved guest session
      try {
        const savedGuest = localStorage.getItem(GUEST_STORAGE_KEY);
        if (savedGuest) {
          const parsed = JSON.parse(savedGuest);
          if (parsed && parsed.isGuest) {
            setIsGuest(true);
            if (parsed.couple) setActiveCoupleState(parsed.couple);
            if (parsed.name) setGuestName(parsed.name);
          }
        }
      } catch {
        // ignore
      }
      setIsLoading(false);
      return;
    }

    // Supabase client is configured, check initial session
    client.auth.getSession().then(({ data: { session: currentSession }, error }) => {
      if (!mounted) return;
      if (error) {
        console.warn('Supabase getSession error:', error.message);
      }
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        setIsGuest(false);
        const userCouple = (currentSession.user.user_metadata?.couple as CoupleId) || 'ByL';
        setActiveCoupleState(userCouple);
      } else {
        // Check for guest fallback
        try {
          const savedGuest = localStorage.getItem(GUEST_STORAGE_KEY);
          if (savedGuest) {
            const parsed = JSON.parse(savedGuest);
            if (parsed && parsed.isGuest) {
              setIsGuest(true);
              if (parsed.couple) setActiveCoupleState(parsed.couple);
              if (parsed.name) setGuestName(parsed.name);
            }
          }
        } catch {
          // ignore
        }
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession) {
        setIsGuest(false);
        try {
          localStorage.removeItem(GUEST_STORAGE_KEY);
        } catch {
          // ignore
        }
        const userCouple = (newSession.user.user_metadata?.couple as CoupleId) || activeCouple;
        setActiveCouple(userCouple);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string, couple?: CoupleId) => {
    setAuthError(null);
    setIsLoading(true);

    const normUser = email.trim().toLowerCase();
    const isMasterUser = normUser === 'admin' || normUser === 'admin@galicia.local';
    const isMasterPass = password === 'soloparamisojos' || password === 'seulementpourmesyeux';

    if (isMasterUser && isMasterPass) {
      const assignedCouple: CoupleId = couple || activeCouple || 'ByL';
      const masterUser: any = {
        id: 'admin-master',
        email: 'admin',
        app_metadata: {},
        user_metadata: { displayName: 'Admin', couple: assignedCouple },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      setUser(masterUser);
      setIsGuest(false);
      setActiveCouple(assignedCouple);
      try {
        localStorage.setItem(
          'galicia_master_auth_v1',
          JSON.stringify({ email: 'admin', couple: assignedCouple })
        );
        localStorage.removeItem(GUEST_STORAGE_KEY);
      } catch {
        // ignore
      }
      setIsLoading(false);
      return {};
    }

    const client = getSupabaseClient();

    if (!client) {
      setIsLoading(false);
      const msg = 'Credenciales no válidas.';
      setAuthError(msg);
      return { error: msg };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError('Credenciales no válidas.');
        setIsLoading(false);
        return { error: 'Credenciales no válidas.' };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        setIsGuest(false);
        const assignedCouple = couple || (data.user.user_metadata?.couple as CoupleId) || 'ByL';
        setActiveCouple(assignedCouple);
      }
      setIsLoading(false);
      return {};
    } catch {
      const msg = 'Credenciales no válidas.';
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
      const msg = 'Supabase no está configurado en las variables de entorno. Puedes usar el Acceso Rápido/Demo o conectar tu instancia.';
      setAuthError(msg);
      return { error: msg };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email,
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
        setIsGuest(false);
        setActiveCouple(couple);
        setIsLoading(false);
        return {};
      } else {
        // Confirmation email required by Supabase settings
        setIsLoading(false);
        return {
          message:
            'Cuenta creada. Si la confirmación de email está activa en Supabase, revisa tu bandeja de entrada para verificar tu cuenta.',
        };
      }
    } catch (err: any) {
      const msg = err?.message || 'Error al registrar usuario';
      setAuthError(msg);
      setIsLoading(false);
      return { error: msg };
    }
  };

  const continueAsGuest = (couple: CoupleId, name?: string) => {
    const finalName = name || (couple === 'ByL' ? 'Bruno & Loles' : 'Alberto & Mari');
    setIsGuest(true);
    setUser(null);
    setSession(null);
    setActiveCouple(couple);
    setGuestName(finalName);
    try {
      localStorage.setItem(
        GUEST_STORAGE_KEY,
        JSON.stringify({ isGuest: true, couple, name: finalName, timestamp: Date.now() })
      );
    } catch {
      // ignore
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
    setIsGuest(false);
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
      localStorage.removeItem('galicia_master_auth_v1');
    } catch {
      // ignore
    }
    setIsLoading(false);
  };

  const updateSupabaseConfig = (url: string, anonKey: string) => {
    saveCustomSupabaseConfig(url, anonKey);
    setIsConfigured(isSupabaseConfigured());
  };

  const resetSupabaseConfig = () => {
    clearCustomSupabaseConfig();
    setIsConfigured(isSupabaseConfigured());
  };

  const displayName =
    user?.user_metadata?.displayName ||
    user?.email?.split('@')[0] ||
    (isGuest ? guestName : 'Pasajero');

  const isAuthenticated = Boolean(user || isGuest);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        activeCouple,
        setActiveCouple,
        displayName,
        isGuest,
        isAuthenticated,
        isConfigured,
        isLoading,
        authError,
        clearError,
        signInWithEmail,
        signUpWithEmail,
        continueAsGuest,
        signOut,
        updateSupabaseConfig,
        resetSupabaseConfig,
        supabaseUrl: SUPABASE_URL,
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
