import React, { useState, useEffect } from 'react';
import { RouteDay, PointOfInterest, UserApartment } from '../types/trip';
import {
  subscribeToApartments,
  saveApartmentToCloud,
  subscribeToDayNotes,
  saveDayNoteToCloud,
} from '../services/tripPersistence';
import {
  Clock,
  Navigation,
  Compass,
  Utensils,
  Home,
  Star,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Car,
  Calendar,
  Hourglass,
  ArrowRight,
  Plus,
  X,
  AlertCircle,
  FileText,
  Save,
  Check,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { hasSpanishParking, hasSpanishNotes } from '../i18n/translations';
import { WeatherWidget } from './WeatherWidget';

interface DayDetailViewProps {
  day: RouteDay;
  onSelectPoi?: (poi: PointOfInterest) => void;
}

export const DayDetailView: React.FC<DayDetailViewProps> = ({ day, onSelectPoi }) => {
  const { language, translateApartmentField } = useLanguage();
  const isFr = language === 'fr';

  const [apartments, setApartments] = useState<UserApartment[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Day notes state
  const [dayNoteText, setDayNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // Form fields for apartment
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCheckInTime, setFormCheckInTime] = useState('15:00');
  const [formCheckOutTime, setFormCheckOutTime] = useState('11:00');
  const [formFreeCancellation, setFormFreeCancellation] = useState(true);
  const [formCancellationPolicy, setFormCancellationPolicy] = useState('');
  const [formParking, setFormParking] = useState('');
  const [formDistanceToCenter, setFormDistanceToCenter] = useState('');
  const [formBathrooms, setFormBathrooms] = useState<number>(1);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToApartments((items) => {
      setApartments(items);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeToDayNotes((notesMap) => {
      if (notesMap[day.dayNumber] !== undefined) {
        setDayNoteText(notesMap[day.dayNumber]);
      } else {
        setDayNoteText('');
      }
    }, language);
    return () => unsub();
  }, [day.dayNumber, language]);

  const handleSaveDayNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNote(true);
    try {
      await saveDayNoteToCloud(day.dayNumber, dayNoteText, language);
      setNoteSavedFeedback(true);
      setTimeout(() => setNoteSavedFeedback(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingNote(false);
    }
  };

  const userApartment = apartments.find((a) => a.dayNumber === day.dayNumber);

  useEffect(() => {
    if (userApartment) {
      setFormName(userApartment.name);
      setFormAddress(userApartment.address);
      setFormPrice(String(userApartment.price));
      setFormCheckInTime(userApartment.checkInTime || '15:00');
      setFormCheckOutTime(userApartment.checkOutTime || '11:00');
      setFormFreeCancellation(userApartment.freeCancellation);
      setFormCancellationPolicy(userApartment.cancellationPolicy || '');
      setFormParking(userApartment.parking);
      setFormDistanceToCenter(userApartment.distanceToCenter);
      setFormBathrooms(userApartment.bathrooms || 1);
      setFormNotes(userApartment.notes || '');
    } else {
      setFormName('');
      setFormAddress('');
      setFormPrice('');
      setFormCheckInTime('15:00');
      setFormCheckOutTime('11:00');
      setFormFreeCancellation(true);
      setFormCancellationPolicy(
        isFr ? "Annulation gratuite jusqu'à 48h avant" : 'Cancelación gratuita hasta 48h antes'
      );
      setFormParking('');
      setFormDistanceToCenter('');
      setFormBathrooms(1);
      setFormNotes('');
    }
  }, [userApartment, day.dayNumber, isFr]);

  const handleSaveApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError(isFr ? 'Veuillez saisir le nom du logement.' : 'Introduce el nombre del apartamento.');
      return;
    }
    if (!formAddress.trim()) {
      setFormError(isFr ? 'Veuillez saisir l\'adresse.' : 'Introduce la dirección.');
      return;
    }
    const numPrice = Number(formPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError(isFr ? 'Veuillez saisir un prix valide.' : 'Introduce un precio válido.');
      return;
    }

    const aptData: UserApartment = {
      id: userApartment ? userApartment.id : `apt-day-${day.dayNumber}`,
      dayNumber: day.dayNumber,
      nightDate: day.shortDate,
      city: day.destination,
      name: formName.trim(),
      name_es: !isFr ? formName.trim() : formName.trim(),
      name_fr: isFr ? formName.trim() : formName.trim(),
      address: formAddress.trim(),
      price: numPrice,
      checkInTime: formCheckInTime.trim() || '15:00',
      checkOutTime: formCheckOutTime.trim() || '11:00',
      freeCancellation: formFreeCancellation,
      cancellationPolicy: formCancellationPolicy.trim() || undefined,
      cancellationPolicy_es: formCancellationPolicy.trim() || undefined,
      cancellationPolicy_fr: isFr ? formCancellationPolicy.trim() : translateApartmentField(formCancellationPolicy.trim()),
      parking: formParking.trim() || (isFr ? 'Non spécifié' : 'No especificado'),
      parking_es: !isFr ? formParking.trim() : (userApartment?.parking_es || formParking.trim()),
      parking_fr: isFr ? formParking.trim() : translateApartmentField(formParking.trim()),
      distanceToCenter: formDistanceToCenter.trim() || (isFr ? 'Non spécifiée' : 'No especificada'),
      distanceToCenter_es: !isFr ? formDistanceToCenter.trim() : (userApartment?.distanceToCenter_es || formDistanceToCenter.trim()),
      distanceToCenter_fr: isFr ? formDistanceToCenter.trim() : translateApartmentField(formDistanceToCenter.trim()),
      bathrooms: Number(formBathrooms) || 1,
      notes: formNotes.trim(),
      notes_es: !isFr ? formNotes.trim() : (userApartment?.notes_es || formNotes.trim()),
      notes_fr: isFr ? formNotes.trim() : translateApartmentField(formNotes.trim()),
      isSelected: true,
      updatedAt: new Date().toISOString(),
      createdAt: userApartment?.createdAt || new Date().toISOString(),
    };

    try {
      await saveApartmentToCloud(aptData);
      setIsEditModalOpen(false);
      setFormError(null);
    } catch (err) {
      console.error(err);
      setIsEditModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Day Header Banner */}
      <div className="bg-[#0F0F0F] border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
              {isFr ? `JOUR ${day.dayNumber} • ${day.shortDate}` : `DÍA ${day.dayNumber} • ${day.shortDate}`}
            </span>
            <span className="text-xs text-slate-300 font-mono flex items-center gap-1.5 bg-[#141414] px-2.5 py-1 rounded border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{day.dateFormatted}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>{day.distanceKm} {isFr ? 'km réels' : 'km reales'}</span>
            </div>
            <div className="w-px h-3 bg-slate-800"></div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{day.driveTimeFormatted}</span>
            </div>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {day.title}
        </h2>
        <p className="text-xs sm:text-sm text-blue-400 font-medium mt-1">
          {day.subtitle}
        </p>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-3 border-t border-slate-800/80 pt-3">
          {day.summary}
        </p>

        {/* Highlights Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {day.highlights.map((highlight, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-xs text-slate-300 bg-[#141414] p-2.5 rounded-lg border border-slate-800"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>{highlight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Forecast & Trip Preparation Advice */}
      <WeatherWidget day={day} />

      {/* Stop-to-Stop Distance & Driving Time Breakdown */}
      {day.legs && day.legs.length > 0 && (
        <div className="bg-[#0F0F0F] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-400" />
              <span>
                {isFr
                  ? `Distance & Durée de Conduite entre Arrêts (Jour ${day.dayNumber})`
                  : `Distancia & Tiempos de Conducción entre Paradas (Día ${day.dayNumber})`}
              </span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">
              {day.legs.length} {isFr ? 'Tronçons' : 'Tramos'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {day.legs.map((leg, i) => (
              <div
                key={i}
                className="bg-[#141414] p-3.5 rounded-lg border border-slate-800/90 flex flex-col justify-between space-y-2 hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                    <span>{isFr ? `Tronçon ${i + 1}` : `Tramo ${i + 1}`}</span>
                    <span className="text-blue-400 font-bold">{leg.distanceKm} km</span>
                  </div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                    <span>{leg.from}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 flex-shrink-0" />
                    <span className="text-blue-300">{leg.to}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded text-[10px] border border-slate-800">
                    🛣️ {leg.routeRoad}
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{leg.driveTime}</span>
                  </span>
                </div>
                {leg.notes && (
                  <p className="text-[10px] text-slate-500 leading-snug italic">
                    {leg.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Schedule with Stays & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Itinerary Timeline & Stay Times (5 cols) */}
        <div className="lg:col-span-5 bg-[#0D0D0D] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 font-mono">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{isFr ? 'Planning & Temps à chaque Étape' : 'Cronograma & Tiempo en cada Parada'}</span>
            </h3>
            <span className="text-[10px] font-mono text-blue-400">{day.shortDate}</span>
          </div>

          <div className="relative pl-6 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
            {day.schedule.map((item, index) => (
              <div key={index} className="relative group">
                <div
                  className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#0D0D0D] ${
                    item.category === 'food'
                      ? 'bg-amber-500'
                      : item.category === 'activity'
                      ? 'bg-blue-500'
                      : item.category === 'travel'
                      ? 'bg-emerald-500'
                      : 'bg-slate-500'
                  }`}
                />

                <div className="bg-[#141414] p-3.5 rounded-lg border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold text-blue-400">
                      {item.time}
                    </span>
                    {item.duration && (
                      <span className="text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                        <Hourglass className="w-2.5 h-2.5" />
                        <span>{item.duration}</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-white mt-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                  {item.distanceFromPrevKm && (
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                      <span>{isFr ? `Distance : ${item.distanceFromPrevKm} km` : `Distancia tramo: ${item.distanceFromPrevKm} km`}</span>
                      <span>{isFr ? `Durée : ${item.driveFromPrevTime}` : `Tiempo trayecto: ${item.driveFromPrevTime}`}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Accommodation with Parking & Stops (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Alojamiento Card with Parking Specs */}
          {day.dayNumber <= 9 && (
            <div className="bg-[#0F0F0F] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <Home className="w-3 h-3" />
                    <span>{isFr ? `Nuit ${day.dayNumber} · ${day.shortDate}` : `Noche ${day.dayNumber} · ${day.shortDate}`}</span>
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                    {day.destination}
                  </span>
                </div>

                {userApartment && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {isFr ? 'Enregistré' : 'Registrado'}
                  </span>
                )}
              </div>

              {userApartment ? (
                <div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-28 h-24 bg-slate-900 rounded-lg flex flex-col items-center justify-center border border-slate-800 overflow-hidden flex-shrink-0">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">{isFr ? 'Localité' : 'Localidad'}</div>
                      <div className="text-xs font-bold text-white font-mono text-center px-1">
                        {userApartment.city || day.destination}
                      </div>
                      <div className="text-[9px] text-emerald-400 font-mono mt-1">
                        {userApartment.freeCancellation ? (isFr ? '✓ Annulation OK' : '✓ Cancelación OK') : (isFr ? 'Logement' : 'Alojamiento')}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h5 className="text-base font-bold text-white">{isFr ? (userApartment.name_fr || userApartment.name) : (userApartment.name_es || userApartment.name)}</h5>
                      <div className="flex items-center gap-1.5 text-xs text-blue-300 font-mono my-1 bg-[#141414] p-1.5 rounded border border-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="break-all">{userApartment.address}</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-2 text-xs">
                        <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                          🚶 {translateApartmentField(userApartment.distanceToCenter_fr || userApartment.distanceToCenter)}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                          🚿 {userApartment.bathrooms} {isFr ? (userApartment.bathrooms === 1 ? 'Salle de bain' : 'Salles de bain') : (userApartment.bathrooms === 1 ? 'Baño' : 'Baños')}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            userApartment.freeCancellation
                              ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-950/20 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {userApartment.freeCancellation
                            ? (isFr ? '🛡️ Annulation Gratuite' : '🛡️ Cancelación Gratuita')
                            : (isFr ? '⚠️ Sans Annulation Gratuite' : '⚠️ Sin Cancelación Gratuita')}
                        </span>
                      </div>

                      {/* Horaires Check-in & Check-out */}
                      <div className="flex flex-wrap gap-2 mb-2.5 text-xs">
                        <span className="text-[10px] font-mono bg-[#141414] px-2.5 py-1 rounded text-blue-300 border border-slate-800 flex items-center gap-1.5 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-blue-400" />
                          <span>{isFr ? 'Arrivée :' : 'Check-in:'} {userApartment.checkInTime || '15:00'}</span>
                        </span>
                        <span className="text-[10px] font-mono bg-[#141414] px-2.5 py-1 rounded text-amber-300 border border-slate-800 flex items-center gap-1.5 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isFr ? 'Départ :' : 'Check-out:'} {userApartment.checkOutTime || '11:00'}</span>
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1.5 font-mono">
                        <span className="text-xl font-bold text-emerald-400">
                          {userApartment.price}€
                        </span>
                        <span className="text-xs text-slate-500">{isFr ? '/ nuit totale' : '/ noche total'}</span>
                        <span className="text-xs text-emerald-400/90 ml-auto font-sans font-medium">
                          ~{(userApartment.price / 2).toFixed(1)}€ / {isFr ? 'couple' : 'pareja'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 p-2.5 bg-[#141414] rounded-lg border border-slate-800 text-[11px] text-slate-300">
                    <span className="font-bold text-emerald-400 font-mono mb-0.5 flex items-center gap-1">
                      <Car className="w-3.5 h-3.5" /> {isFr ? 'Stationnement (Parking) :' : 'Aparcamiento:'}
                    </span>
                    <p className="text-slate-300">
                      {isFr
                        ? (userApartment.parking_fr && !hasSpanishParking(userApartment.parking_fr)
                            ? userApartment.parking_fr
                            : translateApartmentField(userApartment.parking || userApartment.parking_fr || ''))
                        : (userApartment.parking_es || userApartment.parking)}
                    </p>
                  </div>

                  {(userApartment.notes || userApartment.notes_fr || userApartment.notes_es) && (
                    <div className="mt-2 p-2.5 bg-[#141414] rounded-lg border border-slate-800 text-[11px] text-slate-400">
                      <span className="font-bold text-slate-300 font-mono block mb-0.5">{isFr ? 'Notes :' : 'Notas:'}</span>
                      <p className="text-slate-300 italic">
                        {isFr
                          ? (userApartment.notes_fr && !hasSpanishNotes(userApartment.notes_fr)
                              ? userApartment.notes_fr
                              : translateApartmentField(userApartment.notes || userApartment.notes_fr || ''))
                          : (userApartment.notes_es || userApartment.notes)}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        userApartment.name + ' ' + userApartment.address + ' ' + (userApartment.city || day.destination)
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:text-blue-300 font-mono text-[11px] font-bold flex items-center gap-1"
                    >
                      <span>{isFr ? 'Voir sur Google Maps' : 'Ver en Google Maps'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="text-slate-300 hover:text-white font-mono text-[11px] font-bold px-2.5 py-1 rounded bg-[#181818] border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                    >
                      {isFr ? 'Modifier' : 'Editar Datos'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 rounded-lg p-5 text-center space-y-3 bg-[#141414]/50">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 mx-auto flex items-center justify-center">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">
                      {isFr
                        ? `Hébergement à ${day.destination} en attente d'enregistrement`
                        : `Apartamento en ${day.destination} pendiente de registrar`}
                    </h5>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      {isFr
                        ? 'Saisissez les données du logement pour cette nuit (Nom, Adresse, Heures d\'arrivée/départ, Prix total/couple, Annulation, Parking, Distance, Salles de bain et Notes).'
                        : 'Introduce los datos del apartamento para esta noche (Nombre, Dirección, Horarios de Check-in y Check-out, Precio total/pareja, Cancelación, Parking, Distancia, Baños y Notas).'}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isFr ? `Enregistrer Logement Jour ${day.dayNumber}` : `Registrar Apartamento Día ${day.dayNumber}`}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tourist Stops with Stay Duration */}
          <div className="bg-[#0F0F0F] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>{isFr ? 'Sites Touristiques & Belvédères (Temps de Visite)' : 'Paradas Turísticas & Miradores (Tiempos de Estancia)'}</span>
            </h3>

            <div className="space-y-3">
              {day.touristSpots.map((poi) => (
                <div
                  key={poi.id}
                  onClick={() => onSelectPoi?.(poi)}
                  className="bg-[#141414] hover:bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                          {poi.name}
                        </span>
                        {poi.stayDuration && (
                          <span className="text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                            <Hourglass className="w-2.5 h-2.5" />
                            <span>{poi.stayDuration}</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {poi.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-yellow-500 font-mono font-bold text-xs flex-shrink-0 bg-[#0A0A0A] px-2 py-1 rounded border border-slate-800">
                      <Star className="w-3 h-3 fill-current" />
                      <span>{poi.rating}</span>
                    </div>
                  </div>

                  {poi.tips && (
                    <div className="mt-2.5 p-2 bg-blue-500/5 border border-blue-500/20 rounded-lg text-xs text-blue-200 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <p className="text-[11px]">{isFr ? 'Conseil du Guide : ' : 'Nota del Guía: '}{poi.tips}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Gastronomic Stops */}
          <div className="bg-[#0F0F0F] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>{isFr ? 'Étape Gourmande & Spécialités Prévues' : 'Parada Gastronómica & Tapeo Previsto'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {day.gastroSpots.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => onSelectPoi?.(spot)}
                  className="bg-[#141414] hover:bg-slate-900 p-4 rounded-lg border border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h5 className="text-xs font-semibold text-white">
                        {spot.name}
                      </h5>
                      <span className="text-[10px] font-mono text-amber-400 font-bold bg-[#0A0A0A] px-1.5 py-0.5 rounded border border-slate-800">
                        {spot.priceRange}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 inline-block">
                        ⏱️ {spot.stayDuration || (isFr ? '1h 30m sur place' : '1h 30m de estancia')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      {spot.description}
                    </p>

                    {spot.dishRecommendations && (
                      <div className="mt-auto p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                          <p className="text-[10px] font-mono font-medium text-blue-200 uppercase tracking-wider">
                            {isFr ? 'Recommandations (4 pers.) :' : 'Recomendación (4 pax):'}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          {spot.dishRecommendations.join(' • ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Notes & Observations for this Day (Stored in Firestore) */}
          <div className="bg-[#0F0F0F] border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>
                  {isFr
                    ? `Notes & Mémos de l'Étape (Jour ${day.dayNumber})`
                    : `Apuntes & Notas de la Etapa (Día ${day.dayNumber})`}
                </span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                ☁️ {isFr ? 'Enregistré en Base de Données' : 'Guardado en Base de Datos'}
              </span>
            </div>

            <form onSubmit={handleSaveDayNote} className="space-y-3">
              <textarea
                rows={3}
                value={dayNoteText}
                onChange={(e) => setDayNoteText(e.target.value)}
                placeholder={
                  isFr
                    ? `Ajoutez ici des notes ou mémos pour le Jour ${day.dayNumber} (ex: acheter du pain de maïs, prévoir des chaussures étanches, prévenir l'hôte, etc.). Sauvegardé en ligne.`
                    : `Añade aquí notas o recordatorios para el Día ${day.dayNumber} (ej: comprar pan artesano, llevar calzado de repuesto, avisar al anfitrión, etc.). Se guardará en la nube.`
                }
                className="w-full bg-[#141414] border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  {noteSavedFeedback ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> {isFr ? 'Enregistré dans la Base de Données !' : '¡Guardado en la Base de Datos!'}
                    </span>
                  ) : (
                    isFr ? 'Synchronisé en temps réel' : 'Sincronizado en tiempo real'
                  )}
                </span>

                <button
                  type="submit"
                  disabled={isSavingNote}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingNote ? (isFr ? 'Enregistrement...' : 'Guardando...') : (isFr ? 'Enregistrer les Notes' : 'Guardar Apuntes')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Modal for Day's Apartment */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
                {isFr ? `Nuit ${day.dayNumber} · ${day.shortDate}` : `Noche ${day.dayNumber} · ${day.shortDate}`}
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {isFr ? `Hébergement à ${day.destination}` : `Apartamento en ${day.destination}`}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isFr
                  ? 'Enregistrez les détails du logement pour synchroniser et recalculer les totaux par couple.'
                  : 'Registra los datos del apartamento seleccionado (incluyendo horarios de check-in y check-out) para los cálculos totales y por pareja.'}
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-950/30 border border-rose-500/40 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveApartment} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  {isFr ? '1. Nom du Logement *' : '1. Nombre del Apartamento *'}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={isFr ? 'Ex: Appartement Vue Mer, Praza Maior' : 'Ej: Apartamento Mirador da Ría'}
                  className="w-full bg-[#181818] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  {isFr ? '2. Adresse Complète *' : '2. Dirección Completa *'}
                </label>
                <input
                  type="text"
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Ej: Rúa Mayor 12, Planta 2"
                  className="w-full bg-[#181818] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Check-in & Check-out Horarios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{isFr ? 'Heure d\'Arrivée (Check-in) *' : 'Hora de Check-in *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCheckInTime}
                    onChange={(e) => setFormCheckInTime(e.target.value)}
                    placeholder="Ej: 15:00 o 15:00 - 20:00"
                    className="w-full bg-[#181818] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isFr ? 'Heure de Départ (Check-out) *' : 'Hora de Check-out *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCheckOutTime}
                    onChange={(e) => setFormCheckOutTime(e.target.value)}
                    placeholder="Ej: 11:00 o 12:00"
                    className="w-full bg-[#181818] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    {isFr ? '3. Prix Total (€ / nuit) *' : '3. Precio Total (€ / noche) *'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="Ej: 95"
                      className="w-full bg-[#181818] border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute left-2.5 top-2 text-slate-500 font-mono text-xs">€</span>
                  </div>
                  {Number(formPrice) > 0 && (
                    <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block font-medium">
                      ~{(Number(formPrice) / 2).toFixed(1)} € / {isFr ? 'couple' : 'pareja'}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    {isFr ? 'Nombre de Salles de Bain *' : 'Número de Baños *'}
                  </label>
                  <select
                    value={formBathrooms}
                    onChange={(e) => setFormBathrooms(Number(e.target.value))}
                    className="w-full bg-[#181818] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value={1}>{isFr ? '1 Salle de bain' : '1 Baño completo'}</option>
                    <option value={2}>{isFr ? '2 Salles de bain' : '2 Baños completos'}</option>
                    <option value={3}>{isFr ? '3 Salles de bain ou +' : '3 Baños o más'}</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#181818] p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-medium text-slate-200 cursor-pointer flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formFreeCancellation}
                      onChange={(e) => setFormFreeCancellation(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <span>{isFr ? '4. Annulation Gratuite' : '4. Cancelación Gratuita'}</span>
                  </label>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      formFreeCancellation
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {formFreeCancellation ? (isFr ? 'OUI' : 'SÍ') : 'NO'}
                  </span>
                </div>

                {formFreeCancellation && (
                  <input
                    type="text"
                    value={formCancellationPolicy}
                    onChange={(e) => setFormCancellationPolicy(e.target.value)}
                    placeholder={isFr ? "Précision (ex: Annulable jusqu'à 48h avant)" : 'Condición (ej: Cancelable hasta 48h antes)'}
                    className="w-full bg-[#121212] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  {isFr ? '5. Stationnement (Parking) *' : '5. Aparcamiento (Parking) *'}
                </label>
                <input
                  type="text"
                  required
                  value={formParking}
                  onChange={(e) => setFormParking(e.target.value)}
                  placeholder={isFr ? 'Ex: Garage souterrain privé gratuit inclus' : 'Ej: Garaje subterráneo privado gratuito incluido'}
                  className="w-full bg-[#181818] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  {isFr ? '6. Distance du Centre *' : '6. Distancia al Centro *'}
                </label>
                <input
                  type="text"
                  required
                  value={formDistanceToCenter}
                  onChange={(e) => setFormDistanceToCenter(e.target.value)}
                  placeholder={isFr ? 'Ex: 300m à pied de la place centrale' : 'Ej: 300m a pie de la plaza principal'}
                  className="w-full bg-[#181818] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  {isFr ? '8. Notes & Remarques' : '8. Notas del Apartamento'}
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder={isFr ? 'Ex: Code de serrure électronique, caution, check-in 16:00...' : 'Ej: Código de cerradura digital, fianza, check-in 16:00...'}
                  className="w-full bg-[#181818] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#181818] hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  {isFr ? 'Annuler' : 'Cancelar'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {isFr ? 'Enregistrer' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
