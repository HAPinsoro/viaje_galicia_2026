import React, { useState } from 'react';
import { useAuth, CoupleId } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  UserPlus,
  KeyRound,
  CheckCircle2,
  Users,
  Settings,
  X,
  Server,
} from 'lucide-react';
import bgGalicia from '../assets/images/galicia_dark_bg.jpg';

export const LoginScreen: React.FC = () => {
  const {
    signInWithEmail,
    signUpWithEmail,
    authError,
    clearError,
    isConfigured,
    supabaseUrl,
    supabaseAnonKey,
    updateSupabaseConfig,
  } = useAuth();
  const { language } = useLanguage();
  const isFr = language === 'fr';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [selectedCouple, setSelectedCouple] = useState<CoupleId>('AyM');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Config modal for Supabase Anon Key
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState(supabaseUrl || 'https://supabase.viajes.cloud');
  const [inputKey, setInputKey] = useState(supabaseAnonKey || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const emailVal = email.trim();
    const passVal = password.trim();

    if (mode === 'login') {
      const res = await signInWithEmail(emailVal, passVal, selectedCouple);
      setIsSubmitting(false);
      if (res.error) {
        setLocalError(res.error);
      }
    } else {
      // Register
      if (passVal.length < 6) {
        setLocalError(
          isFr
            ? 'Le mot de passe doit comporter au moins 6 caractères'
            : 'La contraseña debe tener al menos 6 caracteres'
        );
        setIsSubmitting(false);
        return;
      }

      const res = await signUpWithEmail(emailVal, passVal, selectedCouple, displayName.trim());
      setIsSubmitting(false);

      if (res.error) {
        setLocalError(res.error);
      } else if (res.message) {
        setSuccessMessage(res.message);
        setMode('login');
      }
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) {
      setLocalError(isFr ? 'Clé Anon requise' : 'Se requiere la clave Anon de Supabase');
      return;
    }
    updateSupabaseConfig(inputUrl.trim() || 'https://supabase.viajes.cloud', inputKey.trim());
    setIsConfigOpen(false);
    setLocalError(null);
    setSuccessMessage(
      isFr ? 'Supabase configuré avec succès' : 'Supabase conectado correctamente'
    );
  };

  const errorMessage = localError || authError;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none bg-black">
      {/* Dark Galicia Coast Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: `url(${bgGalicia})`,
        }}
      />

      {/* Deep Black Overlays for Cinematic Atmosphere */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-neutral-950/85 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 transition-all duration-300">
        {/* Header with Title and Mode Switch */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
            <Lock className="w-5 h-5 text-emerald-300" />
          </div>
          <h2 className="text-sm uppercase tracking-[0.25em] font-semibold text-neutral-200 font-sans">
            {isFr ? 'Accès Privé · Galice 2026' : 'Acceso Privado · Galicia 2026'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {isFr ? 'Authentification gérée par Supabase' : 'Autenticación gestionada por Supabase'}
          </p>

          {/* Mode Switch Tabs */}
          <div className="flex items-center w-full max-w-xs bg-neutral-900/90 border border-neutral-800 rounded-xl p-1 mt-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearError();
                setLocalError(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                mode === 'login'
                  ? 'bg-emerald-500 text-black font-semibold shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {isFr ? 'Connexion' : 'Iniciar Sesión'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                clearError();
                setLocalError(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                mode === 'register'
                  ? 'bg-emerald-500 text-black font-semibold shadow'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {isFr ? 'Créer Compte' : 'Crear Cuenta'}
            </button>
          </div>
        </div>

        {/* Supabase Connection Status Banner */}
        <div className="mb-4">
          {isConfigured ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] truncate max-w-[200px]">
                  supabase.viajes.cloud
                </span>
              </span>
              <button
                type="button"
                onClick={() => setIsConfigOpen(true)}
                className="text-neutral-400 hover:text-neutral-200 text-[10px] flex items-center gap-1 cursor-pointer"
                title="Configuración de Supabase"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{isFr ? 'Clé Anon requise' : 'Falta Clave Anon Supabase'}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsConfigOpen(true)}
                className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-medium border border-amber-500/40 cursor-pointer transition-all"
              >
                {isFr ? 'Configurer' : 'Pegar Clave'}
              </button>
            </div>
          )}
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Success Feedback */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">
                {isFr ? 'Nom / Surnom' : 'Nombre o Apodo'}
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={isFr ? 'Ex: Alberto' : 'Ej: Alberto'}
                  className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) {
                    setLocalError(null);
                    clearError();
                  }
                }}
                placeholder={isFr ? 'votre@email.com' : 'tu@email.com'}
                className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">
              {isFr ? 'Mot de passe' : 'Contraseña'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) {
                    setLocalError(null);
                    clearError();
                  }
                }}
                placeholder={isFr ? '••••••••' : '••••••••'}
                className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-10 pr-11 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-3.5 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Couple Selection for Shared Itinerary & Apartment Votes */}
          <div>
            <label className="block text-[11px] text-neutral-400 uppercase tracking-wider mb-1.5 font-mono">
              {isFr ? 'Équipage / Couple' : 'Pareja / Pasajeros'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedCouple('AyM')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-all ${
                  selectedCouple === 'AyM'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <span>Alberto & Mari</span>
                <span className="text-[10px] font-mono text-neutral-500">AyM</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedCouple('ByL')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium text-left flex items-center justify-between transition-all ${
                  selectedCouple === 'ByL'
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <span>Bruno & Loles</span>
                <span className="text-[10px] font-mono text-neutral-500">ByL</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !email || !password}
            className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span className="text-xs uppercase tracking-wider font-mono">
                {isFr ? 'Authentification Supabase...' : 'Autenticando en Supabase...'}
              </span>
            ) : mode === 'login' ? (
              <>
                <span>{isFr ? 'Entrer avec Supabase' : 'Acceder con Supabase'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            ) : (
              <>
                <span>{isFr ? 'Créer le compte' : 'Crear Cuenta en Supabase'}</span>
                <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-neutral-900 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Supabase Auth
          </span>
          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            className="text-neutral-400 hover:text-emerald-400 flex items-center gap-1 text-[10px] transition-colors cursor-pointer"
          >
            <KeyRound className="w-3 h-3" />
            Configuración VPS
          </button>
        </div>
      </div>

      {/* Supabase VPS Key Configuration Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl relative text-neutral-200">
            <button
              onClick={() => setIsConfigOpen(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Conexión a Supabase VPS</h3>
                <p className="text-xs text-neutral-400">Hostinger · Coolify · Supabase</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
              Para que Supabase verifique los usuarios en tu VPS, se necesita la URL y la{' '}
              <strong className="text-white">Clave Anon (pública)</strong> de tu servicio Supabase en Coolify.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                  URL de Supabase
                </label>
                <input
                  type="text"
                  required
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://supabase.viajes.cloud"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-1">
                  Clave Anon (ANON_KEY / Public API Key)
                </label>
                <textarea
                  rows={3}
                  required
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 break-all"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  💡 Encuéntrala en Coolify: Entra en tu servicio <strong>Supabase</strong> &rarr; <strong>Variables de Entorno</strong> (busca <code className="text-neutral-400">ANON_KEY</code>) o en Supabase Studio &rarr; Project Settings &rarr; API.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors cursor-pointer"
                >
                  Guardar y Conectar Supabase
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
