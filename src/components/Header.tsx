import React from 'react';
import {
  Compass,
  Home,
  Utensils,
  Calculator,
  Sparkles,
  Navigation,
  ListChecks,
  LogOut,
  User,
  Users,
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: 'map' | 'itinerary' | 'apartments' | 'gastronomy' | 'budget' | 'checklist';
  onTabChange: (tab: 'map' | 'itinerary' | 'apartments' | 'gastronomy' | 'budget' | 'checklist') => void;
  onOpenAiModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAiModal,
}) => {
  const { t } = useLanguage();
  const { user, displayName, isGuest, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#0F0F0F] border-b border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Route Origin */}
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl border border-slate-700 bg-slate-800/80 flex items-center justify-center text-blue-400 shadow-inner">
              <Navigation className="w-5 h-5 fill-current" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white uppercase font-sans">
                  {t('appTitle', 'Expedición Noroeste · Galicia 10 Días')}
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-semibold tracking-wider uppercase">
                  {t('twoCouples', '2 Parejas (4 Pasajeros)')}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">
                {t('appSubtitle', 'Pinsoro (Zgz) → Galicia | 10 Días (9 Noches) | Circuito Completo')}
              </span>
            </div>
          </div>

          {/* User Profile Pill & Actions */}
          <div className="flex items-center gap-2">
            {/* User display & Sign Out */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300 font-medium max-w-[140px] truncate" title={user?.email || displayName}>
                {displayName}
              </span>
              {isGuest && (
                <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded">
                  Demo
                </span>
              )}
            </div>

            <button
              onClick={() => signOut()}
              title="Cerrar sesión / Salir"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Stats Badges */}
          <div className="hidden xl:flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">{t('lodgings', 'Alojamientos')}</p>
              <p className="text-xs sm:text-sm font-semibold text-emerald-400 font-mono">{t('customNightsCount', '9 Noches personalizadas')}</p>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">{t('realDistance', 'Distancia Real')}</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 font-mono">2.142 km</p>
            </div>
          </div>

          {/* Language Selector & AI Copilot Button */}
          <div className="flex items-center gap-2.5">
            {/* 2-Language Selector: ES / FR */}
            <LanguageSelector />

            <button
              onClick={onOpenAiModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-lg border border-blue-400/30 shadow-lg shadow-blue-500/20 cursor-pointer transition-all transform hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('copilotButton', 'Copiloto Maps')}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800/80 overflow-x-auto scrollbar-none no-scrollbar">
          <button
            onClick={() => onTabChange('map')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'map'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{t('tabMap', 'Itinerario y Mapa')}</span>
          </button>

          <button
            onClick={() => onTabChange('apartments')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'apartments'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>{t('tabApartments', 'Apartamentos (<120€)')}</span>
          </button>

          <button
            onClick={() => onTabChange('gastronomy')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'gastronomy'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>{t('tabGastronomy', 'Gastronomía y Vinos')}</span>
          </button>

          <button
            onClick={() => onTabChange('budget')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'budget'
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{t('tabBudget', 'Presupuesto y Gastos')}</span>
          </button>

          {/* New dedicated Departure Checklist tab */}
          <button
            onClick={() => onTabChange('checklist')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all flex-shrink-0 cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
            }`}
          >
            <ListChecks className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('tabChecklist', 'Checklist de Salida')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

