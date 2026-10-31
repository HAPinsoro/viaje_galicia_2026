import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { PointOfInterest, AccommodationSpot, RouteDay, UserApartment } from '../types/trip';
import { PINSORO_START, TARGET_NIGHTS } from '../data/galiciaRouteData';
import {
  MapPin,
  Utensils,
  Home,
  Compass,
  Star,
  ExternalLink,
  Navigation,
  Layers,
  Sparkles,
  Maximize2,
  Car,
  Ship,
  Clock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MapComponentProps {
  selectedDay: RouteDay | null;
  activeFilter: 'all' | 'tourist' | 'gastro' | 'lodging' | 'scenic';
  onSelectPoi?: (poi: PointOfInterest | null) => void;
  onSelectAccommodation?: (acc: AccommodationSpot | null) => void;
  allDays: RouteDay[];
  userApartments?: UserApartment[];
}

export interface RouteStats {
  distanceText: string;
  durationText: string;
  isRealRoads: boolean;
}

// Subcomponent to draw real road driving directions using Maps JS API DirectionsService
function RoutePolyline({
  selectedDay,
  allDays,
  onRouteStatsChange,
}: {
  selectedDay: RouteDay | null;
  allDays: RouteDay[];
  onRouteStatsChange?: (stats: RouteStats | null) => void;
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const directionsCacheRef = useRef<Record<string, { path: google.maps.LatLng[]; stats: RouteStats }>>({});

  useEffect(() => {
    if (!map || !mapsLib) return;

    // Clear previous polylines
    polylinesRef.current.forEach((pl) => pl.setMap(null));
    polylinesRef.current = [];

    if (selectedDay) {
      const dayId = selectedDay.id;

      const renderRealRoadPath = (path: google.maps.LatLng[], stats: RouteStats) => {
        polylinesRef.current.forEach((pl) => pl.setMap(null));
        polylinesRef.current = [];

        // 1. Casing / road outline for high contrast on dark map
        const casing = new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#1e3a8a', // Deep navy blue halo
          strokeOpacity: 0.6,
          strokeWeight: 7,
          map,
          zIndex: 1,
        });
        polylinesRef.current.push(casing);

        // 2. Main vivid road trajectory following actual streets and highways
        const mainLine = new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: '#3b82f6', // Vivid royal blue
          strokeOpacity: 0.95,
          strokeWeight: 4,
          map,
          zIndex: 2,
          icons: [
            {
              icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 2.2,
                strokeColor: '#ffffff',
                fillColor: '#1d4ed8',
                fillOpacity: 1,
                strokeWeight: 1.5,
              },
              repeat: '140px',
              offset: '50px',
            },
          ],
        });
        polylinesRef.current.push(mainLine);

        // 3. Special case for Day 2: Boat crossing across Ría de Vigo to Islas Cíes
        if (selectedDay.dayNumber === 2) {
          const boatPath = [
            { lat: 42.2415, lng: -8.7275 }, // Vigo Estación Marítima
            { lat: 42.2230, lng: -8.9040 }, // Islas Cíes (Muelle de Rodas)
          ];
          const boatLine = new google.maps.Polyline({
            path: boatPath,
            strokeColor: '#06b6d4',
            strokeOpacity: 0,
            strokeWeight: 3,
            map,
            zIndex: 3,
            icons: [
              {
                icon: {
                  path: 'M 0,-1 0,1',
                  strokeOpacity: 1,
                  scale: 3,
                  strokeColor: '#22d3ee',
                },
                offset: '0',
                repeat: '12px',
              },
            ],
          });
          polylinesRef.current.push(boatLine);
        }

        onRouteStatsChange?.(stats);
      };

      // Drivable points for Google Maps road calculations
      // For Day 2, car driving is Ourense -> Vigo Estación Marítima -> Baiona.
      // (The ferry crossing across the estuary to Islas Cíes is rendered separately as a maritime trajectory)
      const drivablePath = selectedDay.dayNumber === 2
        ? [
            { lat: 42.3353, lng: -7.8639 }, // Ourense
            { lat: 42.2415, lng: -8.7275 }, // Vigo Estación Marítima / Parking
            { lat: 42.1215, lng: -8.8482 }, // Baiona
          ]
        : selectedDay.routePath.filter(
            (pt) => !(Math.abs(pt.lat - 42.2235) < 0.05 && Math.abs(pt.lng - -8.9038) < 0.05)
          );

      const renderFallback = () => {
        polylinesRef.current.forEach((pl) => pl.setMap(null));
        polylinesRef.current = [];

        const polyline = new google.maps.Polyline({
          path: drivablePath,
          geodesic: true,
          strokeColor: '#3b82f6',
          strokeOpacity: 0.95,
          strokeWeight: 4,
          map,
        });
        polylinesRef.current.push(polyline);

        if (selectedDay.dayNumber === 2) {
          const boatPath = [
            { lat: 42.2415, lng: -8.7275 }, // Vigo Estación Marítima
            { lat: 42.2230, lng: -8.9040 }, // Islas Cíes (Muelle de Rodas)
          ];
          const boatLine = new google.maps.Polyline({
            path: boatPath,
            strokeColor: '#06b6d4',
            strokeOpacity: 0,
            strokeWeight: 3,
            map,
            zIndex: 3,
            icons: [
              {
                icon: {
                  path: 'M 0,-1 0,1',
                  strokeOpacity: 1,
                  scale: 3,
                  strokeColor: '#22d3ee',
                },
                offset: '0',
                repeat: '12px',
              },
            ],
          });
          polylinesRef.current.push(boatLine);
        }

        onRouteStatsChange?.({
          distanceText: `${selectedDay.distanceKm} km`,
          durationText: selectedDay.driveTimeFormatted.split(' de')[0],
          isRealRoads: false,
        });
      };

      // Check cache first
      if (directionsCacheRef.current[dayId]) {
        const cached = directionsCacheRef.current[dayId];
        renderRealRoadPath(cached.path, cached.stats);
        return;
      }

      // If routes library is available, calculate actual driving route
      if (routesLib && drivablePath.length >= 2) {
        const origin = drivablePath[0];
        const dest = drivablePath[drivablePath.length - 1];
        const intermediate = drivablePath.slice(1, -1);

        const directionsService = new routesLib.DirectionsService();

        directionsService.route(
          {
            origin: new google.maps.LatLng(origin.lat, origin.lng),
            destination: new google.maps.LatLng(dest.lat, dest.lng),
            waypoints: intermediate.map((pt) => ({
              location: new google.maps.LatLng(pt.lat, pt.lng),
              stopover: true,
            })),
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false, // Maintain planned route sequence
          },
          (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result && result.routes[0]) {
              const route = result.routes[0];
              const path = route.overview_path;

              let totalMeters = 0;
              let totalSeconds = 0;
              route.legs.forEach((leg) => {
                totalMeters += leg.distance?.value || 0;
                totalSeconds += leg.duration?.value || 0;
              });

              const kmText = `${Math.round(totalMeters / 1000)} km`;
              const hours = Math.floor(totalSeconds / 3600);
              const mins = Math.round((totalSeconds % 3600) / 60);
              const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

              const stats: RouteStats = {
                distanceText: kmText,
                durationText,
                isRealRoads: true,
              };

              directionsCacheRef.current[dayId] = { path, stats };
              renderRealRoadPath(path, stats);
            } else {
              renderFallback();
            }
          }
        );
      } else {
        renderFallback();
      }
    } else {
      // All days overview
      allDays.forEach((day, index) => {
        const polyline = new google.maps.Polyline({
          path: day.routePath,
          geodesic: true,
          strokeColor: index % 2 === 0 ? '#3b82f6' : '#10b981',
          strokeOpacity: 0.8,
          strokeWeight: 3.5,
          map,
        });
        polylinesRef.current.push(polyline);
      });

      // Ferry crossing to Cíes in all-days overview
      const boatPath = [
        { lat: 42.2415, lng: -8.7275 }, // Vigo Estación Marítima
        { lat: 42.2230, lng: -8.9040 }, // Islas Cíes (Muelle de Rodas)
      ];
      const boatLine = new google.maps.Polyline({
        path: boatPath,
        strokeColor: '#06b6d4',
        strokeOpacity: 0,
        strokeWeight: 3,
        map,
        zIndex: 3,
        icons: [
          {
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 1,
              scale: 3,
              strokeColor: '#22d3ee',
            },
            offset: '0',
            repeat: '12px',
          },
        ],
      });
      polylinesRef.current.push(boatLine);

      onRouteStatsChange?.(null);
    }

    return () => {
      polylinesRef.current.forEach((pl) => pl.setMap(null));
      polylinesRef.current = [];
    };
  }, [map, mapsLib, routesLib, selectedDay?.id]);

  return null;
}

// Subcomponent to animate camera bounds ONLY on day selection, filter change or explicit recenter
function CameraController({
  selectedDay,
  allDays,
  activeFilter,
  resetTrigger,
}: {
  selectedDay: RouteDay | null;
  allDays: RouteDay[];
  activeFilter?: string;
  resetTrigger?: number;
}) {
  const map = useMap();
  const lastStateKeyRef = useRef<string>('');

  useEffect(() => {
    if (!map) return;

    const dayKey = selectedDay?.id || 'all';
    const filterKey = activeFilter || 'all';
    const triggerKey = resetTrigger || 0;
    const currentStateKey = `${dayKey}__${filterKey}__${triggerKey}`;

    // IMPORTANT: Do NOT re-fit bounds if the user is dragging, panning or zooming freely!
    // Only fitBounds when the selected day ID changes, the layer filter changes, or user clicks "Centrar".
    if (lastStateKeyRef.current === currentStateKey) {
      return;
    }
    lastStateKeyRef.current = currentStateKey;

    const bounds = new google.maps.LatLngBounds();

    if (activeFilter === 'lodging') {
      // Zoom to encompass all 9 accommodation locations across Galicia
      allDays.forEach((day) => {
        if (day.dayNumber >= 1 && day.dayNumber <= 9 && day.accommodation?.coords) {
          bounds.extend(day.accommodation.coords);
        }
      });
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    } else if (selectedDay) {
      selectedDay.routePath.forEach((pt) => bounds.extend(pt));
      selectedDay.touristSpots.forEach((poi) => bounds.extend(poi.coords));
      selectedDay.gastroSpots.forEach((poi) => bounds.extend(poi.coords));
      if (selectedDay.accommodation?.coords) {
        bounds.extend(selectedDay.accommodation.coords);
      }
      map.fitBounds(bounds, { top: 75, right: 75, bottom: 75, left: 75 });
    } else {
      bounds.extend(PINSORO_START.coords);
      allDays.forEach((day) => {
        day.routePath.forEach((pt) => bounds.extend(pt));
        if (day.accommodation?.coords) {
          bounds.extend(day.accommodation.coords);
        }
      });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [map, selectedDay?.id, activeFilter, resetTrigger]);

  return null;
}

// Helper to merge default route accommodation coordinates with user registered apartment details
export function getEffectiveAccommodation(
  day: RouteDay,
  userAptList?: UserApartment[]
): AccommodationSpot {
  const userApt = userAptList?.find((a) => a.dayNumber === day.dayNumber);
  const target = TARGET_NIGHTS.find((tn) => tn.dayNumber === day.dayNumber);

  if (userApt && (userApt.name?.trim() || userApt.price > 0)) {
    return {
      ...day.accommodation,
      id: userApt.id || day.accommodation.id,
      name: userApt.name || day.accommodation.name,
      city: userApt.city || target?.city || day.accommodation.city,
      address: userApt.address || `${userApt.city || target?.city || day.accommodation.city}, Galicia`,
      pricePerNightFor4: userApt.price || 0,
      pricePerPerson: userApt.price ? userApt.price / 4 : 0,
      checkInTime: userApt.checkInTime || '15:00',
      checkOutTime: userApt.checkOutTime || '11:00',
      parking: userApt.parking || 'Consultar',
      bathrooms: userApt.bathrooms || 1,
      distanceToCenter: userApt.distanceToCenter || target?.suggestedArea || 'Centro',
      bookingHighlight: userApt.notes || target?.notes || 'Apartamento registrado para 4 pax',
      freeCancellation: userApt.freeCancellation,
      cancellationPolicy: userApt.cancellationPolicy,
      notes: userApt.notes,
      isDefined: true,
    };
  }

  return {
    ...day.accommodation,
    name: target ? `Alojamiento Noche ${day.dayNumber} · ${target.city}` : day.accommodation.name,
    city: target?.city || day.accommodation.city,
    address: `${target?.city || day.accommodation.city}, Galicia`,
    pricePerNightFor4: 0,
    pricePerPerson: 0,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    parking: target?.notes?.toLowerCase().includes('parking') ? 'Recomendable con garaje o parking' : 'Zona con aparcamiento',
    bathrooms: 1,
    distanceToCenter: target?.suggestedArea || 'Zona céntrica recomendada',
    bookingHighlight: target?.notes || 'Pendiente de registrar en la pestaña Apartamentos',
    isDefined: false,
  };
}

export const MapComponent: React.FC<MapComponentProps> = ({
  selectedDay,
  activeFilter,
  onSelectPoi,
  onSelectAccommodation,
  allDays,
  userApartments,
}) => {
  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    'AIzaSyD2M10m6SheEHKmLtfUcqS604NOyBy3PA4';

  const [activeMarker, setActiveMarker] = useState<{
    type: 'poi' | 'acc' | 'start';
    data: PointOfInterest | AccommodationSpot;
  } | null>(null);

  const { language, getLocalizedPoi } = useLanguage();
  const isFr = language === 'fr';

  const [routeStats, setRouteStats] = useState<RouteStats | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'hybrid' | 'terrain'>('roadmap');
  const [resetTrigger, setResetTrigger] = useState(0);

  const defaultCenter = { lat: 42.6, lng: -5.5 };
  const defaultZoom = 7;

  const daysToShow = selectedDay ? [selectedDay] : allDays;

  const handleMarkerClick = (
    type: 'poi' | 'acc' | 'start',
    item: PointOfInterest | AccommodationSpot
  ) => {
    setActiveMarker({ type, data: item });
    if (type === 'poi') {
      onSelectPoi?.(item as PointOfInterest);
    } else if (type === 'acc') {
      onSelectAccommodation?.(item as AccommodationSpot);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-[#0F0F0F]">
      <APIProvider apiKey={apiKey}>
        <Map
          mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'}
          defaultCenter={defaultCenter}
          defaultZoom={defaultZoom}
          mapTypeId={mapType}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          styles={[
            {
              elementType: 'geometry',
              stylers: [{ color: '#18181b' }],
            },
            {
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#18181b' }],
            },
            {
              elementType: 'labels.text.fill',
              stylers: [{ color: '#a1a1aa' }],
            },
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#e4e4e7' }],
            },
            {
              featureType: 'poi',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#27272a' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#18181b' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{ color: '#3f3f46' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#09090b' }],
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#71717a' }],
            },
          ]}
        >
          <RoutePolyline
            selectedDay={selectedDay}
            allDays={allDays}
            onRouteStatsChange={setRouteStats}
          />
          <CameraController
            selectedDay={selectedDay}
            allDays={allDays}
            activeFilter={activeFilter}
            resetTrigger={resetTrigger}
          />

          {/* Marker: Start in Pinsoro */}
          <AdvancedMarker
            position={PINSORO_START.coords}
            title={PINSORO_START.name}
            onClick={() => handleMarkerClick('start', PINSORO_START)}
          >
            <div className="flex items-center gap-1.5 bg-red-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-lg border border-red-400/50 cursor-pointer transform hover:scale-110 transition-transform">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
              <span>Salida: Pinsoro</span>
            </div>
          </AdvancedMarker>

          {/* Markers per day for Tourist & Gastro Spots */}
          {daysToShow.map((day) => {
            const showTourist = activeFilter === 'all' || activeFilter === 'tourist' || activeFilter === 'scenic';
            const showGastro = activeFilter === 'all' || activeFilter === 'gastro';

            return (
              <React.Fragment key={day.id}>
                {/* Tourist & Scenic Spots */}
                {showTourist &&
                  day.touristSpots.map((rawPoi) => {
                    const poi = getLocalizedPoi(rawPoi);
                    return (
                      <AdvancedMarker
                        key={poi.id}
                        position={poi.coords}
                        title={poi.name}
                        onClick={() => handleMarkerClick('poi', poi)}
                      >
                        <div className="relative group cursor-pointer">
                          <Pin
                            background={poi.category === 'scenic' ? '#0284c7' : '#3b82f6'}
                            glyphColor="#ffffff"
                            borderColor="#0f172a"
                            scale={1.0}
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex whitespace-nowrap bg-[#0F0F0F]/95 backdrop-blur text-slate-100 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 pointer-events-none z-50">
                            {poi.name}
                          </div>
                        </div>
                      </AdvancedMarker>
                    );
                  })}

                {/* Gastronomic Spots */}
                {showGastro &&
                  day.gastroSpots.map((rawPoi) => {
                    const poi = getLocalizedPoi(rawPoi);
                    return (
                      <AdvancedMarker
                        key={poi.id}
                        position={poi.coords}
                        title={poi.name}
                        onClick={() => handleMarkerClick('poi', poi)}
                      >
                        <div className="relative group cursor-pointer">
                          <Pin
                            background="#f59e0b"
                            glyphColor="#000000"
                            borderColor="#78350f"
                            scale={1.0}
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex whitespace-nowrap bg-[#0F0F0F]/95 backdrop-blur text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30 pointer-events-none z-50">
                            🍲 {poi.name}
                          </div>
                        </div>
                      </AdvancedMarker>
                    );
                  })}
              </React.Fragment>
            );
          })}

          {/* 9 Accommodation / Apartment Markers along the Galicia Loop */}
          {(activeFilter === 'all' || activeFilter === 'lodging') &&
            allDays
              .filter((d) => d.dayNumber >= 1 && d.dayNumber <= 9 && d.accommodation?.coords)
              .map((day) => {
                const effectiveAcc = getEffectiveAccommodation(day, userApartments);
                const isSelectedDay = selectedDay?.dayNumber === day.dayNumber;
                const userApt = userApartments?.find((a) => a.dayNumber === day.dayNumber);
                const isRegistered = !!userApt && (userApt.name?.trim().length > 0 || userApt.price > 0);
                const price = effectiveAcc.pricePerNightFor4;

                return (
                  <AdvancedMarker
                    key={`acc-night-${day.dayNumber}`}
                    position={effectiveAcc.coords}
                    title={`${isFr ? 'Hébergement Nuit' : 'Apartamento Noche'} ${day.dayNumber}: ${effectiveAcc.name}`}
                    onClick={() => handleMarkerClick('acc', effectiveAcc)}
                    zIndex={isSelectedDay ? 50 : 25}
                  >
                    <div
                      className={`group cursor-pointer transition-all duration-200 transform hover:scale-115 ${
                        isSelectedDay ? 'scale-110 z-40' : ''
                      }`}
                    >
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg shadow-2xl font-mono text-[11px] font-bold backdrop-blur border transition-all ${
                          isSelectedDay
                            ? 'bg-emerald-950/95 text-emerald-200 border-emerald-400 ring-2 ring-emerald-400/80 shadow-emerald-500/40'
                            : isRegistered
                            ? 'bg-[#0f1715]/95 text-emerald-300 border-emerald-500/80 hover:border-emerald-300 hover:ring-2 hover:ring-emerald-400/30'
                            : 'bg-[#0F0F0F]/95 text-emerald-400/90 border-emerald-700/60 hover:border-emerald-400'
                        }`}
                      >
                        <div
                          className={`p-1 rounded flex items-center justify-center ${
                            isSelectedDay
                              ? 'bg-emerald-400 text-slate-950 font-black'
                              : isRegistered
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-emerald-400'
                          }`}
                        >
                          <Home className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex flex-col text-left leading-tight pr-0.5">
                          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-sans">
                            <span className={isSelectedDay ? 'text-emerald-300 font-extrabold' : 'text-slate-400 font-semibold'}>
                              {isFr ? `Nuit ${day.dayNumber}` : `Noche ${day.dayNumber}`}
                            </span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-200 font-bold truncate max-w-[85px]">
                              {effectiveAcc.city}
                            </span>
                          </div>

                          <span className="text-[11px] font-bold text-white truncate max-w-[125px]">
                            {price > 0 ? `${price} €` : (isRegistered ? effectiveAcc.name : (isFr ? 'En attente' : 'Pendiente'))}
                          </span>
                        </div>
                      </div>

                      {/* Hover Tooltip Card */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col whitespace-nowrap bg-[#0F0F0F]/95 backdrop-blur text-slate-200 text-[10px] font-mono px-3 py-1.5 rounded-lg border border-emerald-500/50 shadow-2xl pointer-events-none z-50">
                        <span className="font-bold text-emerald-400 flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          <span>{effectiveAcc.name}</span>
                        </span>
                        <span className="text-slate-400 text-[9px]">
                          📍 {effectiveAcc.city} · {price > 0 ? `${price} € (4 pax) ~${(price / 2).toFixed(1)}€/pareja` : (isFr ? 'Non enregistré' : 'Sin registrar')}
                        </span>
                        {effectiveAcc.parking && (
                          <span className="text-slate-300 text-[9px]">
                            🅿️ {effectiveAcc.parking}
                          </span>
                        )}
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

          {/* Info Window */}
          {activeMarker && (() => {
            const localizedPoi = activeMarker.type === 'poi'
              ? getLocalizedPoi(activeMarker.data as PointOfInterest)
              : null;
            const displayName = localizedPoi?.name || activeMarker.data.name;
            const displayDesc = activeMarker.type === 'acc'
              ? (activeMarker.data as AccommodationSpot).bookingHighlight
              : (localizedPoi?.description || (activeMarker.data as PointOfInterest).description);

            return (
              <InfoWindow
                position={
                  activeMarker.type === 'start'
                    ? PINSORO_START.coords
                    : activeMarker.type === 'poi'
                    ? (activeMarker.data as PointOfInterest).coords
                    : (activeMarker.data as AccommodationSpot).coords
                }
                onCloseClick={() => setActiveMarker(null)}
                headerContent={
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5 font-mono uppercase">
                    <span>{displayName}</span>
                  </div>
                }
              >
                <div className="max-w-[280px] text-slate-800 text-xs py-1 space-y-2">
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {displayDesc}
                  </p>

                {activeMarker.type === 'acc' && (() => {
                  const acc = activeMarker.data as AccommodationSpot;
                  const price = acc.pricePerNightFor4;
                  return (
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 space-y-2 font-sans text-xs">
                      <div className="flex items-center justify-between font-mono pb-1 border-b border-slate-200">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                          <Home className="w-3 h-3" />
                          <span>{isFr ? `HÉBERGEMENT NUIT ${acc.dayNumber}` : `APARTAMENTO NOCHE ${acc.dayNumber}`}</span>
                        </span>
                        <span className="text-slate-700 font-bold text-[11px]">{acc.city}</span>
                      </div>

                      {acc.address && (
                        <div className="text-[11px] text-slate-600 flex items-start gap-1">
                          <span className="text-emerald-600">📍</span>
                          <span>{acc.address}</span>
                        </div>
                      )}

                      {/* Price row */}
                      <div className="bg-emerald-50 p-2 rounded border border-emerald-200 flex justify-between items-center font-mono">
                        <div>
                          <span className="text-[9px] text-emerald-800 uppercase block font-bold">
                            {isFr ? 'Prix Total (4 pax)' : 'Precio Total (4 pax)'}
                          </span>
                          <span className="text-sm font-bold text-emerald-900">
                            {price > 0 ? `${price} €/${isFr ? 'nuit' : 'noche'}` : (isFr ? 'En attente' : 'Pendiente de registrar')}
                          </span>
                        </div>
                        {price > 0 && (
                          <div className="text-right">
                            <span className="text-[9px] text-emerald-800 uppercase block font-bold">
                              {isFr ? 'Par couple' : 'Por pareja'}
                            </span>
                            <span className="text-xs font-bold text-emerald-800">
                              ~{(price / 2).toFixed(1)} €
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Check-in / Check-out & Parking */}
                      <div className="space-y-1 font-mono text-[10px] text-slate-700">
                        {(acc.checkInTime || acc.checkOutTime) && (
                          <div className="flex justify-between bg-white px-2 py-1 rounded border border-slate-200">
                            <span>🕒 In: <strong>{acc.checkInTime || '15:00'}</strong></span>
                            <span>🕒 Out: <strong>{acc.checkOutTime || '11:00'}</strong></span>
                          </div>
                        )}
                        {acc.parking && (
                          <div className="bg-white px-2 py-1 rounded border border-slate-200">
                            🅿️ <strong>Parking:</strong> {acc.parking}
                          </div>
                        )}
                        {acc.distanceToCenter && (
                          <div className="text-slate-500">
                            📍 <strong>Zona:</strong> {acc.distanceToCenter}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-[10px]">
                  {activeMarker.type === 'acc' ? (
                    <button
                      onClick={() => onSelectAccommodation?.(activeMarker.data as AccommodationSpot)}
                      className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                    >
                      {isFr ? 'Voir fiche complète' : 'Ver ficha completa'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{activeMarker.data.rating}</span>
                    </div>
                  )}

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      activeMarker.data.name + ' ' + (activeMarker.type === 'acc' ? (activeMarker.data as AccommodationSpot).city : activeMarker.data.address)
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-semibold underline flex items-center gap-0.5"
                  >
                    <span>{isFr ? 'Ouvrir la carte' : 'Abrir mapa'}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            </InfoWindow>
          );
        })()}
        </Map>
      </APIProvider>

      {/* Floating Map Mode Selector */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <div className="bg-[#0F0F0F]/90 backdrop-blur border border-slate-700 p-1 rounded-lg shadow-xl flex items-center gap-1">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded transition-all ${
              mapType === 'roadmap'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFr ? 'Sombre' : 'Oscuro'}
          </button>
          <button
            onClick={() => setMapType('hybrid')}
            className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded transition-all ${
              mapType === 'hybrid'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFr ? 'Satellite' : 'Satélite'}
          </button>
          <button
            onClick={() => setMapType('terrain')}
            className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded transition-all ${
              mapType === 'terrain'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFr ? 'Relief' : 'Relieve'}
          </button>

          <div className="w-px h-4 bg-slate-700 mx-0.5" />

          <button
            onClick={() => setResetTrigger((prev) => prev + 1)}
            title={isFr ? 'Recentrer la vue de l’étape' : 'Volver a centrar la etapa'}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-all cursor-pointer"
          >
            <Maximize2 className="w-3 h-3 text-blue-400" />
            <span>{isFr ? 'Centrer' : 'Centrar'}</span>
          </button>
        </div>
      </div>

      {/* Floating Selected Stage Badge */}
      {selectedDay && (
        <div className="absolute top-4 left-4 z-10 bg-[#0F0F0F]/90 backdrop-blur border border-slate-700 p-3 rounded-xl max-w-xs shadow-2xl hidden sm:block">
          <div className="flex justify-between items-start mb-1.5">
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-mono px-2 py-0.5 rounded border border-blue-500/30 font-bold uppercase tracking-wider">
              {isFr ? `JOUR ${selectedDay.dayNumber} • ACTIF` : `DÍA ${selectedDay.dayNumber} · ACTIVO`}
            </span>
            <span className="text-slate-400 text-xs font-mono">
              ☖ {routeStats ? `${routeStats.distanceText} ${isFr ? 'réel' : 'real'}` : `${selectedDay.distanceKm} km`}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mb-0.5">{selectedDay.destination}</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
            {selectedDay.summary}
          </p>

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <Car className="w-3.5 h-3.5 text-blue-400" />
              <span>{isFr ? 'Distance routière réelle :' : 'Distancia real por carretera:'}</span>
            </span>
            <span className="text-emerald-400 font-bold">
              {routeStats ? `${routeStats.distanceText} · ${routeStats.durationText}` : `${selectedDay.distanceKm} km`}
            </span>
          </div>
        </div>
      )}

      {/* Floating Bottom Legend */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 bg-[#0F0F0F]/90 backdrop-blur px-3.5 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span>Pinsoro</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>{isFr ? 'Itinéraire & Tourisme' : 'Ruta & Turismo'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>{isFr ? 'Gastronomie' : 'Gastronomía'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-300"></span>
          <span className="text-emerald-300 font-semibold">{isFr ? '9 Hébergements' : '9 Apartamentos'}</span>
        </div>
      </div>
    </div>
  );
};
