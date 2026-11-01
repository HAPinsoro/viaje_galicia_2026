import React, { useState, useEffect, useCallback } from 'react';
import { RouteDay } from '../types/trip';
import {
  fetchDayWeather,
  DAY_LOCATIONS_MAP,
  DayWeatherData,
  DayLocationOption,
} from '../services/weatherService';
import { useLanguage } from '../context/LanguageContext';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudFog,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  Compass,
  RefreshCw,
  Umbrella,
  Shirt,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Sparkles,
  Luggage,
} from 'lucide-react';

interface WeatherWidgetProps {
  day: RouteDay;
  className?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ day, className = '' }) => {
  const { language } = useLanguage();
  const isFr = language === 'fr';

  // Available locations for this day
  const availableLocations = DAY_LOCATIONS_MAP[day.dayNumber] || [
    {
      id: `d${day.dayNumber}-dest`,
      name: day.destination,
      name_fr: day.destination,
      lat: day.touristSpots?.[0]?.coords.lat || 42.8782,
      lng: day.touristSpots?.[0]?.coords.lng || -8.5448,
      isPrimary: true,
    },
  ];

  const [selectedLocation, setSelectedLocation] = useState<DayLocationOption>(
    availableLocations[0]
  );
  const [weatherData, setWeatherData] = useState<DayWeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

  // Update selected location when day changes
  useEffect(() => {
    const locs = DAY_LOCATIONS_MAP[day.dayNumber] || [
      {
        id: `d${day.dayNumber}-dest`,
        name: day.destination,
        name_fr: day.destination,
        lat: day.touristSpots?.[0]?.coords.lat || 42.8782,
        lng: day.touristSpots?.[0]?.coords.lng || -8.5448,
        isPrimary: true,
      },
    ];
    setSelectedLocation(locs[0]);
  }, [day.dayNumber, day.destination, day.touristSpots]);

  const loadWeather = useCallback(
    async (loc: DayLocationOption, showRefreshSpin = false) => {
      if (showRefreshSpin) setIsRefreshing(true);
      else setLoading(true);

      try {
        const locName = isFr ? (loc.name_fr || loc.name) : loc.name;
        const data = await fetchDayWeather(loc.lat, loc.lng, locName, isFr);
        setWeatherData(data);
      } catch (err) {
        console.error('Error fetching weather:', err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [isFr]
  );

  useEffect(() => {
    if (selectedLocation) {
      loadWeather(selectedLocation);
    }
  }, [selectedLocation, loadWeather]);

  // Temperature conversion helper
  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  // Weather Icon Component
  const renderWeatherIcon = (
    iconType: string,
    iconClass: string = 'w-6 h-6',
    glow: boolean = false
  ) => {
    switch (iconType) {
      case 'sun':
        return (
          <Sun
            className={`${iconClass} text-amber-400 ${
              glow ? 'drop-shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-pulse' : ''
            }`}
          />
        );
      case 'cloud-sun':
        return <CloudSun className={`${iconClass} text-amber-300`} />;
      case 'cloud':
        return <Cloud className={`${iconClass} text-slate-300`} />;
      case 'drizzle':
        return <CloudDrizzle className={`${iconClass} text-sky-400`} />;
      case 'rain':
        return (
          <CloudRain
            className={`${iconClass} text-blue-400 ${
              glow ? 'drop-shadow-[0_0_12px_rgba(59,130,246,0.5)]' : ''
            }`}
          />
        );
      case 'thunderstorm':
        return (
          <CloudLightning
            className={`${iconClass} text-amber-400 ${
              glow ? 'drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]' : ''
            }`}
          />
        );
      case 'fog':
        return <CloudFog className={`${iconClass} text-slate-400`} />;
      case 'snow':
        return <CloudSnow className={`${iconClass} text-indigo-300`} />;
      case 'wind':
        return <Wind className={`${iconClass} text-cyan-400`} />;
      default:
        return <CloudSun className={`${iconClass} text-amber-300`} />;
    }
  };

  return (
    <div
      className={`bg-[#0F0F0F] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all ${className}`}
    >
      {/* Background Subtle Gradient */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/25 flex items-center gap-1">
              <Sun className="w-3 h-3 text-sky-400" />
              <span>{isFr ? 'Météo en Direct' : 'Tiempo en Vivo'}</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{isFr ? 'Préparation de l\'étape' : 'Preparación de etapa'}</span>
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <span>
              {isFr ? 'Pronostic Météo & Équipement' : 'Pronóstico Meteorológico & Equipamiento'}
            </span>
            <span className="text-xs font-mono font-normal text-slate-400">
              · {isFr ? `Jour ${day.dayNumber}` : `Día ${day.dayNumber}`}
            </span>
          </h3>
        </div>

        {/* Action Controls: Refresh & Temp Unit */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Celsius / Fahrenheit Switcher */}
          <div className="flex items-center bg-[#141414] border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setTempUnit('C')}
              className={`px-2 py-0.5 rounded transition-colors ${
                tempUnit === 'C'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setTempUnit('F')}
              className={`px-2 py-0.5 rounded transition-colors ${
                tempUnit === 'F'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              °F
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadWeather(selectedLocation, true)}
            disabled={isRefreshing || loading}
            title={isFr ? 'Actualiser la météo' : 'Actualizar el tiempo'}
            className="p-1.5 rounded-lg bg-[#141414] border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Location Selector Tabs (if multiple stops exist for this day) */}
      {availableLocations.length > 1 && (
        <div className="mb-4">
          <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>{isFr ? 'Lieu de l\'étape :' : 'Punto de la etapa:'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableLocations.map((loc) => {
              const isSelected = selectedLocation.id === loc.id;
              const displayName = isFr ? (loc.name_fr || loc.name) : loc.name;
              return (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-mono transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500/50 shadow-sm font-semibold'
                      : 'bg-[#141414] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-blue-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <span>{displayName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !weatherData && (
        <div className="py-8 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-7 h-7 text-blue-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400">
            {isFr
              ? 'Récupération du pronostic météo en direct...'
              : 'Obteniendo pronóstico meteorológico en vivo...'}
          </p>
        </div>
      )}

      {/* Weather Content */}
      {weatherData && (
        <div className="space-y-4">
          {/* Top Main Cards: Current Conditions & Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Main Current Temp Card (5 cols) */}
            <div className="md:col-span-5 bg-[#141414] border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    {weatherData.locationName}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
                      {formatTemp(weatherData.current.temperature)}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {isFr ? 'Ressenti' : 'Sensación'}{' '}
                      <span className="text-slate-300 font-semibold">
                        {formatTemp(weatherData.current.apparentTemperature)}
                      </span>
                    </span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                  {renderWeatherIcon(weatherData.current.weatherIcon, 'w-8 h-8', true)}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/70 flex items-center justify-between">
                <span className="text-xs text-blue-300 font-medium">
                  {weatherData.current.weatherDescription}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {isFr ? 'Mis à jour à' : 'Actualizado a las'} {weatherData.current.updatedAt}
                </span>
              </div>
            </div>

            {/* Quick Galicia Metrics Grid (7 cols) */}
            <div className="md:col-span-7 grid grid-cols-3 gap-2.5">
              {/* Rain / Precipitation Probability */}
              <div
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  (weatherData.daily[0]?.precipitationProb || 0) >= 40
                    ? 'bg-blue-950/20 border-blue-500/30'
                    : 'bg-[#141414] border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">
                    {isFr ? 'Pluie' : 'Lluvia'}
                  </span>
                  <Umbrella
                    className={`w-3.5 h-3.5 ${
                      (weatherData.daily[0]?.precipitationProb || 0) >= 40
                        ? 'text-blue-400'
                        : 'text-slate-500'
                    }`}
                  />
                </div>
                <div className="mt-2">
                  <span className="text-lg font-bold font-mono text-white block">
                    {weatherData.daily[0]?.precipitationProb ?? 0}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {weatherData.daily[0]?.precipitationSum ?? 0} mm
                  </span>
                </div>
              </div>

              {/* Wind Speed & Gusts */}
              <div
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  weatherData.current.windSpeed >= 28
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : 'bg-[#141414] border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">
                    {isFr ? 'Vent' : 'Viento'}
                  </span>
                  <Wind
                    className={`w-3.5 h-3.5 ${
                      weatherData.current.windSpeed >= 28 ? 'text-amber-400' : 'text-slate-500'
                    }`}
                  />
                </div>
                <div className="mt-2">
                  <span className="text-lg font-bold font-mono text-white block">
                    {weatherData.current.windSpeed}{' '}
                    <span className="text-[10px] font-normal text-slate-400">km/h</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {weatherData.daily[0]?.windSpeedMax
                      ? `Max ${weatherData.daily[0].windSpeedMax} km/h`
                      : `${weatherData.current.windDirection}°`}
                  </span>
                </div>
              </div>

              {/* Humidity */}
              <div className="bg-[#141414] border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-mono uppercase tracking-wider">
                    {isFr ? 'Humidité' : 'Humedad'}
                  </span>
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="mt-2">
                  <span className="text-lg font-bold font-mono text-white block">
                    {weatherData.current.humidity}%
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatTemp(weatherData.daily[0]?.tempMin ?? 10)} /{' '}
                    {formatTemp(weatherData.daily[0]?.tempMax ?? 18)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5-Day Forecast Strip */}
          {weatherData.daily.length > 0 && (
            <div className="bg-[#141414] border border-slate-800/80 rounded-xl p-3.5">
              <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-2.5 flex items-center justify-between">
                <span>{isFr ? 'Prévisions sur 5 jours' : 'Pronóstico para los próximos 5 días'}</span>
                <span className="text-slate-500 font-mono">
                  {isFr ? 'T. Max / Min · Prob. Pluie' : 'T. Máx / Mín · Prob. Lluvia'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {weatherData.daily.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border flex flex-col items-center text-center transition-colors ${
                      idx === 0
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-[#181818] border-slate-800/70 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[11px] font-mono font-bold text-white mb-1">
                      {item.dayName}
                    </span>
                    <div className="my-1">{renderWeatherIcon(item.weatherIcon, 'w-5 h-5')}</div>
                    <div className="text-[11px] font-mono font-bold text-slate-200 mt-1">
                      {formatTemp(item.tempMax)}{' '}
                      <span className="text-slate-400 font-normal">
                        {formatTemp(item.tempMin)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-mono">
                      <Umbrella className="w-2.5 h-2.5 text-blue-400" />
                      <span
                        className={
                          item.precipitationProb >= 40
                            ? 'text-blue-400 font-bold'
                            : 'text-slate-400'
                        }
                      >
                        {item.precipitationProb}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trip Preparation Advice (Special Galicia Value-Add) */}
          <div className="bg-gradient-to-r from-blue-950/20 via-slate-900/40 to-slate-900/20 border border-blue-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Luggage className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold text-blue-300 font-mono uppercase tracking-wider">
                  {isFr
                    ? 'Conseils de Préparation du Voyage pour cette Étape'
                    : 'Consejos de Preparación del Viaje para esta Etapa'}
                </h4>
              </div>
              {weatherData.advice.umbrellaNeeded && (
                <span className="text-[10px] font-mono bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                  <Umbrella className="w-3 h-3" />
                  {isFr ? 'Parapluie / Imperméable requis' : 'Chubasquero recomendado'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Packing Advice */}
              <div className="bg-[#141414] p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase">
                  <Luggage className="w-3 h-3 text-amber-400" />
                  <span>{isFr ? 'Dans le Sac & Chaussures :' : 'En la Mochila & Calzado:'}</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {weatherData.advice.packingTip}
                </p>
              </div>

              {/* Clothing Advice */}
              <div className="bg-[#141414] p-3 rounded-lg border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase">
                  <Shirt className="w-3 h-3 text-blue-400" />
                  <span>{isFr ? 'Tenue Recommandée :' : 'Vestimenta Sugerida:'}</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {weatherData.advice.clothingAdvice}
                </p>
              </div>
            </div>

            {/* Smart Activity Notice */}
            <div className="flex items-start gap-2 pt-1 text-slate-400 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <span className="text-slate-300 font-semibold font-mono">
                  {isFr ? 'Plan de visite :' : 'Plan para la ruta:'}
                </span>{' '}
                {weatherData.advice.activityAdvice}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
