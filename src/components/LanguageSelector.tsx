import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="region"
      aria-label="Selector de idioma / Sélecteur de langue"
      className="inline-flex items-center bg-[#141414] border border-slate-700/80 p-0.5 rounded-lg shadow-inner font-mono text-xs"
    >
      {/* Spanish Option */}
      <button
        type="button"
        onClick={() => setLanguage('es')}
        aria-pressed={language === 'es'}
        title="Español (ES)"
        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer select-none font-bold text-[11px] ${
          language === 'es'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        }`}
      >
        <span className="text-xs leading-none">🇪🇸</span>
        <span>ES</span>
      </button>

      {/* French Option */}
      <button
        type="button"
        onClick={() => setLanguage('fr')}
        aria-pressed={language === 'fr'}
        title="Français (FR)"
        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer select-none font-bold text-[11px] ${
          language === 'fr'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        }`}
      >
        <span className="text-xs leading-none">🇫🇷</span>
        <span>FR</span>
      </button>
    </div>
  );
};
