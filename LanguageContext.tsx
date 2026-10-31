import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  UI_TRANSLATIONS,
  DAY_TRANSLATIONS,
  translateChecklistTitle,
  translateExpenseCategory,
  translateExpenseTitle,
  translateApartmentField,
  translateDayNote,
  translateSuggestedArea,
  translateTargetNotes,
  translateExpenseNotes,
} from '../i18n/translations';
import { getLocalizedPoi } from '../i18n/poiTranslations';
import { getLocalizedLeg } from '../i18n/legTranslations';
import { RouteDay, TimelineItem, StopLeg, PointOfInterest } from '../types/trip';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  getLocalizedDay: (day: RouteDay) => RouteDay;
  getLocalizedPoi: (poi: PointOfInterest) => PointOfInterest;
  translateChecklistTitle: (title: string) => string;
  translateExpenseCategory: (category: string) => string;
  translateExpenseTitle: (title: string) => string;
  translateApartmentField: (text: string) => string;
  translateDayNote: (text: string) => string;
  translateSuggestedArea: (area: string) => string;
  translateTargetNotes: (notes: string) => string;
  translateExpenseNotes: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'galicia_trip_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'fr' || saved === 'es') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'es';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const dict = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.es;
    return dict[key] || fallback || key;
  };

  const getLocalizedDay = (day: RouteDay): RouteDay => {
    const dayTrans = DAY_TRANSLATIONS[language]?.[day.dayNumber];
    if (!dayTrans) return day;

    const isFr = language === 'fr';

    // Localize schedule
    let localizedSchedule: TimelineItem[] = day.schedule;
    if (isFr) {
      if (dayTrans.schedule && dayTrans.schedule.length === day.schedule.length) {
        localizedSchedule = day.schedule.map((item, idx) => {
          const trans = dayTrans.schedule![idx];
          return {
            ...item,
            title: trans.title,
            description: trans.description,
            duration: trans.duration || item.duration?.replace('conducción', 'de route').replace('estancia', 'sur place').replace('parada', 'de halte'),
          };
        });
      } else {
        localizedSchedule = day.schedule.map((item) => ({
          ...item,
          title: item.title
            .replace(/^Salida de /i, 'Départ de ')
            .replace(/^Llegada a /i, 'Arrivée à ')
            .replace(/^Parada en /i, 'Halte à ')
            .replace(/^Paseo por /i, 'Promenade à ')
            .replace(/^Visita a /i, 'Visite de ')
            .replace(/^Cena en /i, 'Dîner à ')
            .replace(/^Almuerzo en /i, 'Déjeuner à ')
            .replace(/Check-in con Parking/i, 'Check-in avec Parking'),
          description: item.description
            .replace(/conducción/gi, 'de route')
            .replace(/parada/gi, 'arrêt')
            .replace(/descanso/gi, 'repos')
            .replace(/apartamento/gi, 'hébergement')
            .replace(/parking/gi, 'parking')
            .replace(/cena/gi, 'dîner')
            .replace(/almuerzo/gi, 'déjeuner'),
          duration: item.duration
            ?.replace('conducción', 'de conduite')
            .replace('de estancia', 'de visite')
            .replace('de parada', 'de pause')
            .replace('de visita', 'de découverte')
            .replace('de cena', 'de dîner'),
        }));
      }
    }

    // Localize legs
    let localizedLegs: StopLeg[] = day.legs;
    if (isFr && day.legs) {
      localizedLegs = day.legs.map((leg, index) =>
        getLocalizedLeg(leg, day.dayNumber, index, language)
      );
    }

    // Fully localize tourist and gastro spots using dedicated translations dictionary
    const localizedTouristSpots: PointOfInterest[] = (day.touristSpots || []).map((poi) =>
      getLocalizedPoi(poi, language)
    );

    const localizedGastroSpots: PointOfInterest[] = (day.gastroSpots || []).map((spot) =>
      getLocalizedPoi(spot, language)
    );

    return {
      ...day,
      title: dayTrans.title || day.title,
      subtitle: dayTrans.subtitle || day.subtitle,
      summary: dayTrans.summary || day.summary,
      dateFormatted: dayTrans.dateFormatted || day.dateFormatted,
      shortDate: dayTrans.shortDate || day.shortDate,
      driveTimeFormatted: dayTrans.driveTimeFormatted || day.driveTimeFormatted,
      highlights: dayTrans.highlights || day.highlights,
      localTips: dayTrans.localTips || day.localTips,
      schedule: localizedSchedule,
      legs: localizedLegs,
      touristSpots: localizedTouristSpots,
      gastroSpots: localizedGastroSpots,
    };
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        getLocalizedDay,
        getLocalizedPoi: (poi: PointOfInterest) => getLocalizedPoi(poi, language),
        translateChecklistTitle: (title: string) => translateChecklistTitle(title, language),
        translateExpenseCategory: (cat: string) => translateExpenseCategory(cat, language),
        translateExpenseTitle: (title: string) => translateExpenseTitle(title, language),
        translateApartmentField: (text: string) => translateApartmentField(text, language),
        translateDayNote: (text: string) => translateDayNote(text, language),
        translateSuggestedArea: (area: string) => translateSuggestedArea(area, language),
        translateTargetNotes: (notes: string) => translateTargetNotes(notes, language),
        translateExpenseNotes: (text: string) => translateExpenseNotes(text, language),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
