import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { signIn, signUp, supabase } from '../services/auth';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  UserPlus,
  CheckCircle2,
  Users,
} from 'lucide-react';
import bgGalicia from '../assets/images/galicia_dark_bg.jpg';

export const LoginScreen: React.FC = () => {
  const {
    signInWithEmail,
    authError,
    clearError,
  } = useAuth();
  const { language } = useLanguage();
  const isFr = language === 'fr';

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const emailVal = email.trim();
    const passVal = password.trim();

    if (mode === 'login') {
      const res = await signIn(emailVal, passVal);
      setIsSubmitting(false);
      if (res.error) {
        setLocalError(res.error);
        return;
      }
      if (res.user) {
        await signInWithEmail(emailVal, passVal);
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

      const res = await signUp(emailVal, passVal, displayName.trim());
      setIsSubmitting(false);

      if (res.error) {
        setLocalError(res.error);
      } else if (res.session) {
        await signInWithEmail(emailVal, passVal);
      } else if (res.message) {
        setSuccessMessage(res.message);
        setMode('login');
      }
    }
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

        {/* Error Feedback */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-fadeIn shadow-lg shadow-red-950/30">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <span className="font-semibold text-red-200 block">
                {isFr ? 'Erreur d’identification' : 'Credenciales no válidas'}
              </span>
              <span className="text-red-300/90 leading-relaxed block">{errorMessage}</span>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    clearError();
                    setLocalError(null);
                  }}
                  className="text-[11px] text-amber-300 hover:text-amber-200 underline mt-1 cursor-pointer font-medium block"
                >
                  {isFr
                    ? 'Vous n’avez pas encore de compte ? Cliquez ici pour créer un compte'
                    : '¿No tienes cuenta aún? Pulsa aquí para Crear Cuenta'}
                </button>
              )}
            </div>
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
                className={`w-full bg-neutral-900/90 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none transition-all font-sans ${
                  errorMessage
                    ? 'border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/40'
                    : 'border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                }`}
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
                className={`w-full bg-neutral-900/90 border rounded-xl pl-10 pr-11 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none transition-all font-sans ${
                  errorMessage
                    ? 'border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/40'
                    : 'border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                }`}
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

          <button
            type="submit"
            disabled={isSubmitting || !email || !password}
            className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span className="text-xs uppercase tracking-wider font-mono">
                {isFr ? 'Connexion en cours...' : 'Iniciando sesión...'}
              </span>
            ) : mode === 'login' ? (
              <>
                <span>{isFr ? 'Entrer' : 'Acceder'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            ) : (
              <>
                <span>{isFr ? 'Créer le compte' : 'Crear Cuenta'}</span>
                <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-neutral-900 flex items-center justify-center text-[11px] text-neutral-500 font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
            {isFr ? 'Accès sécurisé' : 'Acceso seguro'}
          </span>
        </div>
      </div>
    </div>
  );
};
