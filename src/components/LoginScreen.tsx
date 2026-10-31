import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import bgGalicia from '../assets/images/galicia_dark_bg.jpg';

export const LoginScreen: React.FC = () => {
  const { signInWithEmail, authError, clearError } = useAuth();
  const { language } = useLanguage();
  const isFr = language === 'fr';

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setIsSubmitting(true);

    const inputVal = usernameOrEmail.trim();
    const passVal = password.trim();

    // Check master credentials or Supabase
    const isMasterUser = inputVal.toLowerCase() === 'admin' || inputVal.toLowerCase() === 'admin@galicia.local';
    const isMasterPass = passVal === 'soloparamisojos' || passVal === 'seulementpourmesyeux';

    if (isMasterUser && isMasterPass) {
      const res = await signInWithEmail('admin', passVal);
      setIsSubmitting(false);
      if (res.error) {
        setLocalError(isFr ? 'Identifiants incorrects' : 'Credenciales incorrectas');
      }
      return;
    }

    // Try standard sign in (Supabase)
    const res = await signInWithEmail(inputVal, passVal);
    setIsSubmitting(false);

    if (res.error) {
      setLocalError(isFr ? 'Identifiants incorrects' : 'Credenciales incorrectas');
    }
  };

  const errorMessage = localError || (authError ? (isFr ? 'Identifiants incorrects' : 'Credenciales incorrectas') : null);

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
      <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />

      {/* Minimalist Card - Absolutely no content clues */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-neutral-950/80 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl p-8 sm:p-10 transition-all duration-300">
        {/* Subtle Icon Accent */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 mb-4 shadow-inner">
            <Lock className="w-5 h-5 text-neutral-300" />
          </div>
          <h2 className="text-sm uppercase tracking-[0.25em] font-medium text-neutral-300 font-sans">
            {isFr ? 'Accès Privé' : 'Acceso Privado'}
          </h2>
          <div className="h-0.5 w-8 bg-neutral-700/80 rounded-full mt-3" />
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Minimal Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                value={usernameOrEmail}
                onChange={(e) => {
                  setUsernameOrEmail(e.target.value);
                  if (errorMessage) {
                    setLocalError(null);
                    clearError();
                  }
                }}
                placeholder={isFr ? 'Email / Identifiant' : 'Email o Usuario'}
                className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) {
                    setLocalError(null);
                    clearError();
                  }
                }}
                placeholder={isFr ? 'Mot de passe' : 'Contraseña'}
                className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl pl-10 pr-11 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all font-sans"
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
            disabled={isSubmitting || !usernameOrEmail || !password}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span className="text-xs uppercase tracking-wider font-mono">
                {isFr ? 'Vérification...' : 'Comprobando...'}
              </span>
            ) : (
              <>
                <span>{isFr ? 'Entrer' : 'Acceder'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Minimal Footer */}
        <div className="mt-8 pt-4 border-t border-neutral-900 flex items-center justify-center text-[10px] text-neutral-600 font-mono tracking-widest uppercase">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
            2026
          </span>
        </div>
      </div>
    </div>
  );
};
