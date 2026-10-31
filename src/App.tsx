import React, { useState, useEffect, useMemo } from 'react';
import { ROUTE_DAYS, TRIP_OVERVIEW, ALL_POIS, PINSORO_START } from './data/galiciaRouteData';
import { RouteDay, PointOfInterest, AccommodationSpot, UserApartment } from './types/trip';
import { subscribeToApartments } from './services/tripPersistence';
import { MapComponent } from './components/MapComponent';
import { DaySelector } from './components/DaySelector';
import { DayDetailView } from './components/DayDetailView';
import { ApartmentsHub } from './components/ApartmentsHub';
import { GastronomyGuide } from './components/GastronomyGuide';
import { TripCostCalculator } from './components/TripCostCalculator';
import { ChecklistHub } from './components/ChecklistHub';
import { AIAssistantModal } from './components/AIAssistantModal';
import { ExportProjectModal } from './components/ExportProjectModal';
import { Header } from './components/Header';
import { generateTripPDF } from './utils/pdfGenerator';
import { useLanguage } from './context/LanguageContext';
import {
  Compass,
  Layers,
  Utensils,
  Home,
  Star,
  MapPin,
  ExternalLink,
  Navigation,
  Sparkles,
  X,
  Info,
  ChevronRight,
  ShieldAlert,
  Download,
  Share2,
  Check,
  Clock,
  FolderArchive,
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'map' | 'itinerary' | 'apartments' | 'gastronomy' | 'budget' | 'checklist'
  >('map');
  const [selectedDayId, setSelectedDayId] = useState<string | null>('day-1');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'tourist' | 'gastro' | 'lodging' | 'scenic'
  >('all');
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);
  const [selectedAcc, setSelectedAcc] = useState<AccommodationSpot | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [userApartments, setUserApartments] = useState<UserApartment[]>([]);

  const { language, t, getLocalizedDay, getLocalizedPoi } = useLanguage();
  const isFr = language === 'fr';

  // Subscribe to real-time apartments from Firestore
  useEffect(() => {
    const unsub = subscribeToApartments((items) => {
      setUserApartments(items);
    });
    return () => unsub();
  }, []);

  const selectedDay = useMemo(() => {
    const raw = ROUTE_DAYS.find((d) => d.id === selectedDayId) || null;
    return raw ? getLocalizedDay(raw) : null;
  }, [selectedDayId, language, getLocalizedDay]);

  const localizedAllDays = useMemo(() => {
    return ROUTE_DAYS.map((d) => getLocalizedDay(d));
  }, [language, getLocalizedDay]);

  const localizedPoi = selectedPoi ? getLocalizedPoi(selectedPoi) : null;

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            {isFr ? 'Chargement de l’expédition...' : 'Cargando Expedición Galicia...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const handleSelectDay = (dayId: string | null) => {
    setSelectedDayId(dayId);
    setSelectedPoi(null);
    setSelectedAcc(null);
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      let customExpenses = undefined;
      let settings = undefined;
      try {
        const savedExpenses = localStorage.getItem('galicia_trip_custom_expenses_v1');
        if (savedExpenses) {
          customExpenses = JSON.parse(savedExpenses);
        }
        const savedSettings = localStorage.getItem('galicia_trip_settings_v1');
        if (savedSettings) {
          settings = JSON.parse(savedSettings);
        }
      } catch {
        // ignore
      }
      generateTripPDF({
        customExpenses,
        userApartments,
        fuelPricePerLiter: settings?.fuelPricePerLiter,
        carConsumption: settings?.carConsumption,
        foodDailyBudgetPerPax: settings?.foodDailyBudgetPerPax,
        language,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 1200);
    }
  };

  const handleShare = () => {
    const shareTitle = isFr ? 'Circuit Galice 10 Jours depuis Pinsoro' : 'Ruta Galicia 10 Días desde Pinsoro';
    const shareText = isFr
      ? 'Planificateur et carte interactive pour 4 personnes avec 9 hébergements <120€ et parking'
      : 'Planificador y mapa interactivo para 4 personas con 9 alojamientos <120€ con parking';
    if (navigator.share) {
      navigator
        .share({
          title: shareTitle,
          text: shareText,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAiModal={() => setIsAiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Main Tab View: Map & Itinerary */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Day Selector Tabs Bar */}
            <div className="bg-[#0F0F0F] p-3 rounded-xl border border-slate-800 shadow-xl">
              <DaySelector
                days={ROUTE_DAYS}
                selectedDayId={selectedDayId}
                onSelectDay={handleSelectDay}
              />
            </div>

            {/* Map & Quick Filters Layout */}
            <div className="space-y-3">
              {/* Filter Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
                  <span className="text-slate-500 mr-1 hidden sm:inline flex items-center gap-1 uppercase tracking-wider text-[10px]">
                    <Layers className="w-3.5 h-3.5" /> {t('layers', 'Capas:')}
                  </span>

                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-semibold uppercase tracking-wider text-[10px] ${
                      activeFilter === 'all'
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-[#0F0F0F] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {t('filterAll', 'Mostrar Todo')}
                  </button>

                  <button
                    onClick={() => setActiveFilter('tourist')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px] ${
                      activeFilter === 'tourist'
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-[#0F0F0F] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Compass className="w-3 h-3" />
                    <span>{t('filterTourist', 'Turismo')}</span>
                  </button>

                  <button
                    onClick={() => setActiveFilter('gastro')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px] ${
                      activeFilter === 'gastro'
                        ? 'bg-amber-500 text-black shadow font-bold'
                        : 'bg-[#0F0F0F] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Utensils className="w-3 h-3" />
                    <span>{t('filterGastro', 'Gastronomía')}</span>
                  </button>

                  <button
                    onClick={() => setActiveFilter('lodging')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 font-semibold uppercase tracking-wider text-[10px] ${
                      activeFilter === 'lodging'
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                        : 'bg-[#0F0F0F] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Home className="w-3 h-3" />
                    <span>{t('filterLodging', 'Aptos <120€')}</span>
                  </button>
                </div>

                {selectedDay && (
                  <div className="text-[11px] text-slate-500 font-mono">
                    {t('stageLabel', 'ETAPA:')} <span className="text-blue-400 font-bold uppercase">{selectedDay.destination}</span>
                  </div>
                )}
              </div>

              {/* Google Map Container */}
              <div className="w-full h-[520px]">
                <MapComponent
                  selectedDay={selectedDay}
                  activeFilter={activeFilter}
                  onSelectPoi={(poi) => setSelectedPoi(poi)}
                  onSelectAccommodation={(acc) => setSelectedAcc(acc)}
                  allDays={localizedAllDays}
                  userApartments={userApartments}
                />
              </div>
            </div>

            {/* Day Detail View (if a day is selected) */}
            {selectedDay ? (
              <DayDetailView
                day={selectedDay}
                onSelectPoi={(poi) => setSelectedPoi(poi)}
              />
            ) : (
              /* All 10 Days Grid */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-400" />
                    <span>{t('allStagesTitle', 'Resumen de las 10 Etapas desde Pinsoro (Zaragoza)')}</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {t('selectStageToExplore', 'Selecciona una etapa para explorar')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ROUTE_DAYS.map((day) => {
                    const locDay = getLocalizedDay(day);
                    return (
                      <div
                        key={day.id}
                        onClick={() => handleSelectDay(day.id)}
                        className="bg-[#0F0F0F] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition-all hover:scale-[1.01] cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                              {t('dayWord', 'DÍA')} {day.dayNumber}
                            </span>
                            <span className="text-xs font-mono text-slate-500">
                              {day.distanceKm} km
                            </span>
                          </div>

                          <h4 className="text-sm sm:text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {locDay.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
                            {locDay.summary}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                          {(() => {
                            const registeredApt = userApartments.find((a) => a.dayNumber === day.dayNumber);
                            if (registeredApt) {
                              return (
                                <div className="flex flex-col">
                                  <span className="text-emerald-400 font-bold">
                                    {registeredApt.price}€ <span className="text-[10px] text-slate-500 font-normal">{isFr ? 'total' : 'total'}</span> (~{(registeredApt.price / 2).toFixed(1)}€/{isFr ? 'couple' : 'pareja'})
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    In: {registeredApt.checkInTime || '15:00'} · Out: {registeredApt.checkOutTime || '11:00'}
                                  </span>
                                </div>
                              );
                            }
                            if (day.dayNumber <= 9) {
                              return (
                                <span className="text-slate-500 font-medium text-[11px]">
                                  {isFr ? `Héb. ${day.destination} (En attente)` : `Apto ${day.destination} (Pendiente)`}
                                </span>
                              );
                            }
                            return (
                              <span className="text-blue-400 font-medium text-[11px]">
                                {isFr ? 'Arrivée à Pinsoro' : 'Llegada a Pinsoro'}
                              </span>
                            );
                          })()}
                          <span className="text-slate-400 group-hover:text-white flex items-center gap-1 font-bold text-[11px] ml-auto">
                            <span>{t('viewDay', 'VER DÍA')}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Apartments Hub */}
        {activeTab === 'apartments' && (
          <ApartmentsHub
            onSelectAccommodation={(acc) => {
              setSelectedAcc(acc);
            }}
          />
        )}

        {/* Tab 3: Gastronomy Guide */}
        {activeTab === 'gastronomy' && (
          <GastronomyGuide
            onSelectPoi={(poi) => {
              setSelectedPoi(poi);
            }}
          />
        )}

        {/* Tab 4: Budget & Cost Breakdown */}
        {activeTab === 'budget' && <TripCostCalculator />}

        {/* Tab 5: Checklist de Salida */}
        {activeTab === 'checklist' && <ChecklistHub />}
      </main>

      {/* POI Modal */}
      {/* POI Modal */}
      {localizedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0F0F0F] border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`p-2 rounded-lg text-white font-bold ${
                    localizedPoi.category === 'gastro'
                      ? 'bg-amber-500 text-black'
                      : localizedPoi.category === 'scenic'
                      ? 'bg-sky-600'
                      : 'bg-blue-600'
                  }`}
                >
                  {localizedPoi.category === 'gastro' ? (
                    <Utensils className="w-4 h-4" />
                  ) : (
                    <Compass className="w-4 h-4" />
                  )}
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
                    {isFr ? 'JOUR' : 'DÍA'} {localizedPoi.dayNumber} ·{' '}
                    {localizedPoi.category === 'gastro'
                      ? (isFr ? 'Gastronomie' : 'Gastronomía')
                      : localizedPoi.category === 'scenic'
                      ? (isFr ? 'Belvédère Panoramique' : 'Mirador Panorámico')
                      : (isFr ? 'Tourisme' : 'Turismo')}
                  </span>
                  <h3 className="text-base font-bold text-white">{localizedPoi.name}</h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedPoi(null)}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {localizedPoi.description}
            </p>

            {localizedPoi.dishRecommendations && (
              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg text-xs">
                <div className="font-mono text-[10px] text-blue-300 font-bold uppercase tracking-wider mb-1">
                  {isFr ? 'Recommandations pour 4 personnes :' : 'Recomendación para 4 personas:'}
                </div>
                <p className="text-slate-300">
                  {localizedPoi.dishRecommendations.join(' • ')}
                </p>
              </div>
            )}

            {localizedPoi.tips && (
              <div className="bg-[#141414] p-3 rounded-lg border border-slate-800 text-xs text-slate-300">
                <span className="font-mono text-[10px] text-slate-500 uppercase block mb-0.5">
                  {isFr ? 'Note du Guide :' : 'Nota del Guía:'}
                </span>
                <span>{localizedPoi.tips}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono">
              <div className="flex text-yellow-500 text-xs">
                ★★★★★ <span className="text-slate-500 ml-1">({localizedPoi.reviewsCount})</span>
              </div>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  localizedPoi.name + ' ' + localizedPoi.address
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
              >
                <span>{isFr ? 'Ouvrir dans Maps' : 'Abrir Maps'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Accommodation Modal */}
      {selectedAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0A0A]/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0F0F0F] border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
                  <Home className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
                    {isFr ? `Hébergement Nuit ${selectedAcc.dayNumber} · ${selectedAcc.city}` : `Alojamiento Noche ${selectedAcc.dayNumber} · ${selectedAcc.city}`}
                  </span>
                  <h3 className="text-base font-bold text-white">{selectedAcc.name}</h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedAcc(null)}
                className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#141414] p-4 rounded-xl border border-slate-800 flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">
                  {isFr ? 'Prix Total Nuit (4 pax)' : 'Precio Total Noche (4 pax)'}
                </span>
                <span className="text-2xl font-bold text-emerald-400">
                  {selectedAcc.pricePerNightFor4 > 0 ? `${selectedAcc.pricePerNightFor4} €` : (isFr ? 'En attente' : 'Pendiente de registrar')}
                </span>
              </div>
              {selectedAcc.pricePerNightFor4 > 0 && (
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 uppercase block">
                    {isFr ? 'Par Couple' : 'Por Pareja'}
                  </span>
                  <span className="text-sm font-semibold text-emerald-300">
                    ~{(selectedAcc.pricePerNightFor4 / 2).toFixed(1)} € / {isFr ? 'couple' : 'pareja'}
                  </span>
                </div>
              )}
            </div>

            {(selectedAcc.checkInTime || selectedAcc.checkOutTime) && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="bg-[#141414] px-2.5 py-1 rounded text-blue-300 border border-slate-800 flex items-center gap-1.5 font-semibold">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>Check-in: {selectedAcc.checkInTime || '15:00'}</span>
                </span>
                <span className="bg-[#141414] px-2.5 py-1 rounded text-amber-300 border border-slate-800 flex items-center gap-1.5 font-semibold">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Check-out: {selectedAcc.checkOutTime || '11:00'}</span>
                </span>
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-400">
              {selectedAcc.parking && (
                <p>🅿️ <strong className="text-slate-200">Parking:</strong> {selectedAcc.parking}</p>
              )}
              {selectedAcc.bedrooms > 0 && (
                <p>🛏️ <strong className="text-slate-200">{isFr ? 'Chambres :' : 'Dormitorios:'}</strong> {selectedAcc.bedrooms} ({selectedAcc.bedsDescription})</p>
              )}
              <p>📍 <strong className="text-slate-200">{isFr ? 'Localisation :' : 'Ubicación:'}</strong> {selectedAcc.distanceToCenter}</p>
              {selectedAcc.publicTransport && selectedAcc.publicTransport !== 'Pendiente' && (
                <p>🚌 <strong className="text-slate-200">{isFr ? 'Transports :' : 'Transporte:'}</strong> {selectedAcc.publicTransport}</p>
              )}
              {selectedAcc.bookingHighlight && (
                <p className="italic text-slate-500">"{selectedAcc.bookingHighlight}"</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 font-mono">
              <button
                onClick={() => {
                  setSelectedAcc(null);
                  setActiveTab('apartments');
                }}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-mono text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow cursor-pointer transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{isFr ? 'Gérer dans Hébergements' : 'Ver en Apartamentos'}</span>
              </button>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  selectedAcc.name + ' ' + selectedAcc.city
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow"
              >
                <span>{isFr ? 'Voir sur Maps' : 'Ver en Maps'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        selectedDay={selectedDay}
      />

      {/* Export Project Modal */}
      <ExportProjectModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Footer matching Elegant Dark specification */}
      <footer className="h-12 bg-[#0F0F0F] border-t border-slate-800 flex items-center px-4 sm:px-8 justify-between mt-auto">
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
            {isFr ? 'Conduite : ~26h au total (10 jours)' : 'Conducción: ~26h total (10 días)'}
          </span>
          <span className="flex items-center gap-1.5 hidden sm:inline-flex">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            {isFr ? '9 Hébergements <120€ avec 🅿️ Parking' : '9 Alojamientos <120€ con 🅿️ Parking'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-white uppercase tracking-widest bg-blue-600 px-3.5 py-1.5 rounded hover:bg-blue-500 transition-colors cursor-pointer disabled:opacity-60 shadow-lg shadow-blue-500/20"
          >
            <Download className={`w-3.5 h-3.5 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
            <span>{isGeneratingPdf ? t('generatingPdf', 'Génération du PDF...') : t('downloadPdf', 'Descargar Ruta PDF')}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest border border-slate-700 px-3 py-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            title="Exportar código fuente completo en ZIP (Compatible con Windows, OpenCode y Coolify)"
          >
            <FolderArchive className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Exportar ZIP</span>
            <span className="sm:hidden">ZIP</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest border border-slate-700 px-3.5 py-1.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{t('linkCopied', '¡Enlace Copiado!')}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('shareRoute', 'Compartir Grupo')}</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
