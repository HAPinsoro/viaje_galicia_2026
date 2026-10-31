import React from 'react';
import { RouteDay } from '../types/trip';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DaySelectorProps {
  days: RouteDay[];
  selectedDayId: string | null;
  onSelectDay: (dayId: string | null) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  selectedDayId,
  onSelectDay,
}) => {
  const { language, getLocalizedDay } = useLanguage();
  const isFr = language === 'fr';

  return (
    <div className="w-full">
      {/* Horizontal Scrollable Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {/* All Days Overview Button */}
        <button
          onClick={() => onSelectDay(null)}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all border ${
            selectedDayId === null
              ? 'bg-blue-600 text-white border-blue-400 shadow-md font-bold'
              : 'bg-[#0F0F0F] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isFr ? 'Circuit 10 Jours' : 'Ruta 10 Días'}</span>
        </button>

        {days.map((day) => {
          const locDay = getLocalizedDay(day);
          const isSelected = selectedDayId === day.id;
          return (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className={`flex-shrink-0 flex flex-col items-start px-3.5 py-2 rounded-lg text-xs transition-all border text-left min-w-[145px] ${
                isSelected
                  ? 'bg-blue-500/10 border-blue-500/40 text-white shadow-sm ring-1 ring-blue-500/20'
                  : 'bg-[#0D0D0D] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${
                  isSelected ? 'text-blue-400' : 'text-slate-500'
                }`}>
                  {isFr ? 'JOUR' : 'DÍA'} {day.dayNumber} {isSelected && (isFr ? '• ACTIF' : '• ACTIVO')}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {day.distanceKm} km
                </span>
              </div>
              <span className="font-medium text-xs mt-1 truncate max-w-[135px] text-slate-200">
                {locDay.destination}
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-[135px]">
                {locDay.highlights[0]?.replace('•', '').trim() || locDay.driveTimeFormatted}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
