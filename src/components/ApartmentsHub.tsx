import React, { useState, useEffect } from 'react';
import { TARGET_NIGHTS, TargetNightInfo } from '../data/galiciaRouteData';
import { UserApartment } from '../types/trip';
import {
  subscribeToApartments,
  saveApartmentToCloud,
  deleteApartmentFromCloud,
  fetchApartmentsFromSupabase,
} from '../services/tripPersistence';
import {
  Home,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Car,
  Bath,
  FileText,
  Clock,
  Check,
  Copy,
  X,
  RefreshCw,
  Database,
  Building,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { hasSpanishParking, hasSpanishNotes } from '../i18n/translations';

interface ApartmentsHubProps {
  onSelectDay?: (dayId: string) => void;
  onSelectAccommodation?: (acc: any) => void;
}

export const ApartmentsHub: React.FC<ApartmentsHubProps> = () => {
  const { language, translateApartmentField, translateSuggestedArea, translateTargetNotes } = useLanguage();
  const isFr = language === 'fr';

  const [apartments, setApartments] = useState<UserApartment[]>([]);
  const [, setSyncStatus] = useState<'syncing' | 'synced' | 'local'>('syncing');
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDayNumber, setEditingDayNumber] = useState<number>(1);
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPrice, setFormPrice] = useState<string>('');
  const [formCheckInTime, setFormCheckInTime] = useState<string>('15:00');
  const [formCheckOutTime, setFormCheckOutTime] = useState<string>('11:00');
  const [formFreeCancellation, setFormFreeCancellation] = useState(true);
  const [formCancellationPolicy, setFormCancellationPolicy] = useState('');
  const [formParking, setFormParking] = useState('');
  const [formDistanceToCenter, setFormDistanceToCenter] = useState('');
  const [formBathrooms, setFormBathrooms] = useState<number>(1);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);

  // Subscribe to real-time apartments from Supabase / Postgres
  useEffect(() => {
    const unsub = subscribeToApartments((items, source) => {
      setApartments(items);
      if (source === 'cloud') {
        setSyncStatus('synced');
      }
    });
    return () => unsub();
  }, []);

  const handleRestoreDefaults = async () => {
    setIsSyncing(true);
    try {
      localStorage.removeItem('galicia_trip_user_apartments_v1');
    } catch {}
    const fresh = await fetchApartmentsFromSupabase();
    if (fresh && fresh.length > 0) {
      setApartments(fresh);
      setSyncStatus('synced');
    }
    setTimeout(() => setIsSyncing(false), 500);
  };

  const totalRegistered = apartments.length;
  const totalCost = apartments.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
  const totalPerCouple = totalCost / 2;
  const withFreeCancellation = apartments.filter((a) => a.freeCancellation).length;

  const openAddForDay = (target: TargetNightInfo) => {
    const existing = apartments.find((a) => a.dayNumber === target.dayNumber);
    setEditingDayNumber(target.dayNumber);
    setFormError(null);

    if (existing) {
      setFormName(existing.name);
      setFormAddress(existing.address);
      setFormPrice(existing.price ? String(existing.price) : '');
      setFormCheckInTime(existing.checkInTime || '15:00');
      setFormCheckOutTime(existing.checkOutTime || '11:00');
      setFormFreeCancellation(Boolean(existing.freeCancellation));
      setFormCancellationPolicy(existing.cancellationPolicy || '');
      setFormParking(existing.parking || '');
      setFormDistanceToCenter(existing.distanceToCenter || '');
      setFormBathrooms(existing.bathrooms || 1);
      setFormNotes(existing.notes || '');
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

    setIsModalOpen(true);
  };

  const handleSaveApartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError(isFr ? 'Veuillez saisir le nom du logement.' : 'Por favor, introduce el Nombre del apartamento.');
      return;
    }
    if (!formAddress.trim()) {
      setFormError(isFr ? 'Veuillez saisir l\'adresse du logement.' : 'Por favor, introduce la Dirección del apartamento.');
      return;
    }
    const numPrice = Number(formPrice);
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError(isFr ? 'Veuillez saisir un prix valide en euros.' : 'Introduce un precio válido en euros.');
      return;
    }

    const target = TARGET_NIGHTS.find((t) => t.dayNumber === editingDayNumber);
    const existing = apartments.find((a) => a.dayNumber === editingDayNumber);

    const apartmentData: UserApartment = {
      id: existing ? existing.id : `apt-day-${editingDayNumber}`,
      dayNumber: editingDayNumber,
      nightDate: target ? target.shortDate : `Día ${editingDayNumber}`,
      city: target ? target.city : '',
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
      parking_es: !isFr ? formParking.trim() : formParking.trim(),
      parking_fr: isFr ? formParking.trim() : translateApartmentField(formParking.trim()),
      distanceToCenter: formDistanceToCenter.trim() || (isFr ? 'Non spécifiée' : 'No especificada'),
      distanceToCenter_es: !isFr ? formDistanceToCenter.trim() : formDistanceToCenter.trim(),
      distanceToCenter_fr: isFr ? formDistanceToCenter.trim() : translateApartmentField(formDistanceToCenter.trim()),
      bathrooms: Number(formBathrooms) || 1,
      notes: formNotes.trim(),
      notes_es: !isFr ? formNotes.trim() : formNotes.trim(),
      notes_fr: isFr ? formNotes.trim() : translateApartmentField(formNotes.trim()),
      isSelected: true,
      updatedAt: new Date().toISOString(),
      createdAt: existing?.createdAt || new Date().toISOString(),
    };

    try {
      await saveApartmentToCloud(apartmentData);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving apartment:', err);
      setFormError(isFr ? 'Erreur lors de la sauvegarde dans le cloud. Enregistré localement.' : 'Error al guardar en la nube. Se ha guardado localmente.');
      setIsModalOpen(false);
    }
  };

  const handleDeleteApartment = async (id: string) => {
    const confirmMsg = isFr ? 'Souhaitez-vous supprimer cet hébergement ?' : '¿Deseas eliminar los datos de este apartamento?';
    if (window.confirm(confirmMsg)) {
      try {
        await deleteApartmentFromCloud(id);
      } catch (err) {
        console.error('Error deleting apartment:', err);
      }
    }
  };

  const handleCopySummary = () => {
    let summary = isFr
      ? `📋 RÉCAPITULATIF DES HÉBERGEMENTS ROUTE GALICE (2 COUPLES - TOTAL 4 VOYAGEURS)\n`
      : `📋 RESUMEN DE APARTAMENTOS RUTA GALICIA (2 PAREJAS - TOTAL 4 PERSONAS)\n`;
    summary += isFr
      ? `Total Enregistrés : ${totalRegistered} sur 9 nuits | Budget Total : ${totalCost} € (~${totalPerCouple.toFixed(1)} €/couple)\n\n`
      : `Total Registrados: ${totalRegistered} de 9 noches | Presupuesto Total: ${totalCost} € (~${totalPerCouple.toFixed(1)} €/pareja)\n\n`;

    TARGET_NIGHTS.forEach((target) => {
      const apt = apartments.find((a) => a.dayNumber === target.dayNumber);
      summary += isFr
        ? `--- Nuit ${target.dayNumber} (${target.shortDate} - ${target.city}) ---\n`
        : `--- Noche ${target.dayNumber} (${target.shortDate} - ${target.city}) ---\n`;
      if (apt) {
        summary += isFr
          ? `• Nom : ${apt.name}\n`
          : `• Nombre: ${apt.name}\n`;
        summary += isFr
          ? `• Adresse : ${apt.address}\n`
          : `• Dirección: ${apt.address}\n`;
        summary += isFr
          ? `• Prix : ${apt.price} € (${(apt.price / 2).toFixed(1)} €/couple)\n`
          : `• Precio: ${apt.price} € (${(apt.price / 2).toFixed(1)} €/pareja)\n`;
        summary += isFr
          ? `• Horaires : Arrivée : ${apt.checkInTime || '15:00'} | Départ : ${apt.checkOutTime || '11:00'}\n`
          : `• Horarios: Check-in: ${apt.checkInTime || '15:00'} | Check-out: ${apt.checkOutTime || '11:00'}\n`;
        summary += isFr
          ? `• Annulation gratuite : ${apt.freeCancellation ? 'Oui' : 'Non'} ${apt.cancellationPolicy ? `(${apt.cancellationPolicy})` : ''}\n`
          : `• Cancelación gratuita: ${apt.freeCancellation ? 'Sí' : 'No'} ${apt.cancellationPolicy ? `(${apt.cancellationPolicy})` : ''}\n`;
        const parkingText = isFr
          ? (apt.parking_fr && !hasSpanishParking(apt.parking_fr)
              ? apt.parking_fr
              : translateApartmentField(apt.parking || apt.parking_fr || ''))
          : (apt.parking_es || apt.parking);
        summary += isFr
          ? `• Parking : ${parkingText}\n`
          : `• Aparcamiento: ${parkingText}\n`;
        const distanceText = isFr
          ? (apt.distanceToCenter_fr || translateApartmentField(apt.distanceToCenter))
          : (apt.distanceToCenter_es || apt.distanceToCenter);
        summary += isFr
          ? `• Distance du centre : ${distanceText}\n`
          : `• Distancia al centro: ${distanceText}\n`;
        summary += isFr
          ? `• Salles de bain : ${apt.bathrooms}\n`
          : `• Baños: ${apt.bathrooms}\n`;
        const notesText = isFr
          ? (apt.notes_fr && !hasSpanishNotes(apt.notes_fr)
              ? apt.notes_fr
              : translateApartmentField(apt.notes || apt.notes_fr || 'Sans notes'))
          : (apt.notes_es || apt.notes || 'Sin notas');
        summary += isFr
          ? `• Notes : ${notesText}\n\n`
          : `• Notas: ${notesText}\n\n`;
      } else {
        summary += isFr
          ? `• STATUT : En attente de recherche et d'enregistrement\n\n`
          : `• ESTADO: Pendiente de buscar y registrar\n\n`;
      }
    });

    navigator.clipboard?.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Instructions */}
      <div className="bg-[#0F0F0F] border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
                {isFr ? 'Hébergements Confirmés dans le Code (2 Couples)' : 'Alojamientos Confirmados en Código (2 Parejas)'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isFr ? '9 Nuits Confirmées en Route' : '9 Noches Confirmadas en Ruta'}
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            {isFr
              ? 'Les données des 9 hébergements sont intégrées directement dans le code de l\'application (sans table en base de données). Chaque adresse inclut parking garanti, budget maîtrisé (<120€/nuit), annulation gratuite et horaires de check-in/out.'
              : 'Los datos de los 9 alojamientos están integrados directamente en el código de la aplicación (sin tabla en base de datos). Cada apartamento incluye parking garantizado, presupuesto optimizado (<120€/noche), cancelación gratuita y horarios de check-in/out.'}
          </p>
        </div>

        {/* KPI Box */}
        <div className="bg-[#141414] p-4 rounded-xl border border-slate-800 text-right min-w-[240px] flex-shrink-0">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            {isFr ? 'Nuits Enregistrées' : 'Noches Registradas'}
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalRegistered} <span className="text-slate-500 text-sm font-normal">/ 9 {isFr ? 'nuits' : 'noches'}</span>
          </div>
          <div className="text-sm font-bold text-emerald-400 font-mono mt-1">
            {totalCost > 0 ? `${totalCost} € total` : '0 €'}
            <span className="text-xs text-slate-400 font-normal">
              {' '}
              (~{totalPerCouple.toFixed(1)} €/{isFr ? 'couple' : 'pareja'})
            </span>
          </div>
          {withFreeCancellation > 0 && (
            <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center justify-end gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>{withFreeCancellation} {isFr ? 'avec annulation gratuite' : 'con cancelación gratuita'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0F0F0F] border border-slate-800/80 p-3 rounded-xl">
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-500 text-[11px] uppercase tracking-wider mr-1">
            {isFr ? 'Filtrer :' : 'Filtrar:'}
          </span>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-[#141414] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {isFr ? 'Toutes' : 'Todas'} ({TARGET_NIGHTS.length})
          </button>
          <button
            onClick={() => setFilterMode('completed')}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              filterMode === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-[#141414] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {isFr ? 'Enregistrés' : 'Registrados'} ({totalRegistered})
          </button>
          <button
            onClick={() => setFilterMode('pending')}
            className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              filterMode === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-[#141414] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {isFr ? 'En Attente' : 'Pendientes'} ({9 - totalRegistered})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRestoreDefaults}
            disabled={isSyncing}
            title={isFr ? 'Recharger directement depuis Supabase' : 'Recargar directamente desde Supabase'}
            className="bg-[#141414] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isFr ? 'Données Fixes' : 'Restaurar Fijos'}</span>
          </button>
          <button
            onClick={handleCopySummary}
            className="bg-[#141414] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedSummary ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{isFr ? 'Copié' : 'Copiado'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>{isFr ? 'Copier le Résumé' : 'Copiar Resumen'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of the 9 Nights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TARGET_NIGHTS.filter((t) => {
          const hasApt = apartments.some((a) => a.dayNumber === t.dayNumber);
          if (filterMode === 'completed') return hasApt;
          if (filterMode === 'pending') return !hasApt;
          return true;
        }).map((target) => {
          const apt = apartments.find((a) => a.dayNumber === target.dayNumber);

          if (!apt) {
            // Unassigned / Pending Card
            return (
              <div
                key={target.dayNumber}
                className="bg-[#0F0F0F] border border-dashed border-slate-800 hover:border-blue-500/60 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all hover:bg-[#121212] group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono font-bold bg-[#141414] text-amber-400 px-2.5 py-1 rounded border border-amber-500/20 uppercase tracking-wider">
                      {isFr ? `Nuit ${target.dayNumber} · ${target.shortDate}` : `Noche ${target.dayNumber} · ${target.shortDate}`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{isFr ? 'En Attente' : 'Pendiente'}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {target.city}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span>{isFr ? 'Secteur conseillé :' : 'Zona recomendada:'} {isFr ? translateSuggestedArea(target.suggestedArea) : target.suggestedArea}</span>
                  </p>

                  <div className="mt-4 p-3 bg-[#141414] rounded-lg border border-slate-800/80 text-xs text-slate-400 space-y-1">
                    <div className="text-[11px] font-mono text-slate-500 font-medium">
                      {isFr ? 'Données requises :' : 'Requisitos a pedir:'}
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {isFr
                        ? 'Nom, Adresse, Prix total/couple, Check-in, Check-out, Annulation, Parking, Distance, Salles de bain et Notes.'
                        : 'Nombre, Dirección, Precio total/pareja, Check-in, Check-out, Cancelación, Parking, Distancia, Baños y Notas.'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-500">{isFr ? translateTargetNotes(target.notes) : target.notes}</span>
                  <button
                    onClick={() => openAddForDay(target)}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Ajouter Hébergement' : 'Añadir Datos'}</span>
                  </button>
                </div>
              </div>
            );
          }

          // Registered Apartment Card
          const displayName = isFr ? (apt.name_fr || apt.name) : (apt.name_es || apt.name);
          const displayParking = isFr
            ? (apt.parking_fr && !hasSpanishParking(apt.parking_fr)
                ? apt.parking_fr
                : translateApartmentField(apt.parking || apt.parking_fr || ''))
            : (apt.parking_es || apt.parking);
          const displayDistance = isFr
            ? (apt.distanceToCenter_fr || translateApartmentField(apt.distanceToCenter))
            : (apt.distanceToCenter_es || apt.distanceToCenter);
          const displayPolicy = apt.cancellationPolicy
            ? (isFr ? (apt.cancellationPolicy_fr || translateApartmentField(apt.cancellationPolicy)) : apt.cancellationPolicy)
            : undefined;
          const displayNotes = (apt.notes || apt.notes_fr || apt.notes_es)
            ? (isFr
                ? (apt.notes_fr && !hasSpanishNotes(apt.notes_fr)
                    ? apt.notes_fr
                    : translateApartmentField(apt.notes || apt.notes_fr || ''))
                : (apt.notes_es || apt.notes))
            : undefined;

          return (
            <div
              key={target.dayNumber}
              className="bg-[#0F0F0F] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold bg-[#141414] text-blue-400 px-2.5 py-1 rounded border border-slate-800 uppercase tracking-wider">
                    {isFr ? `Nuit ${target.dayNumber} · ${target.shortDate} · ${target.city}` : `Noche ${target.dayNumber} · ${target.shortDate} · ${target.city}`}
                  </span>

                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/30 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {isFr ? 'Enregistré' : 'Registrado'}
                  </span>
                </div>

                {/* Apartment Name */}
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  {displayName}
                </h3>

                {/* Price (Total and Per Couple) */}
                <div className="flex items-baseline gap-2 mt-2 font-mono">
                  <span className="text-2xl font-black text-emerald-400">{apt.price}€</span>
                  <span className="text-xs text-slate-500">{isFr ? '/ nuit totale' : '/ noche total'}</span>
                  <span className="text-xs text-emerald-400/90 ml-auto font-sans font-medium">
                    ~{(apt.price / 2).toFixed(1)}€ / {isFr ? 'couple' : 'pareja'}
                  </span>
                </div>

                {/* Check-in & Check-out Horarios */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-[#141414] p-2 rounded-lg border border-slate-800 text-[11px] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-slate-500 block text-[9px] uppercase font-mono">
                        {isFr ? 'Arrivée :' : 'Check-in:'}
                      </span>
                      <span className="font-semibold text-slate-200 font-mono truncate block">
                        {apt.checkInTime || '15:00'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#141414] p-2 rounded-lg border border-slate-800 text-[11px] flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-slate-500 block text-[9px] uppercase font-mono">
                        {isFr ? 'Départ :' : 'Check-out:'}
                      </span>
                      <span className="font-semibold text-slate-200 font-mono truncate block">
                        {apt.checkOutTime || '11:00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Required Fields Details */}
                <div className="mt-2.5 space-y-2 text-xs">
                  {/* Address */}
                  <div className="flex items-start gap-2 text-slate-300 bg-[#141414] p-2.5 rounded-lg border border-slate-800">
                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-white block text-[10px] uppercase tracking-wider font-mono">
                        {isFr ? 'Adresse :' : 'Dirección:'}
                      </span>
                      <span className="text-xs text-slate-300 font-mono break-words">
                        {apt.address}
                      </span>
                    </div>
                  </div>

                  {/* Free Cancellation Badge */}
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-mono font-medium border ${
                      apt.freeCancellation
                        ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/30'
                        : 'text-amber-400 bg-amber-950/20 border-amber-500/30'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <div className="truncate">
                      <span>{apt.freeCancellation ? (isFr ? 'Annulation Gratuite' : 'Cancelación Gratuita') : (isFr ? 'Sans annulation gratuite' : 'Sin cancelación gratuita')}</span>
                      {displayPolicy && (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {displayPolicy}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Parking info */}
                  <div className="flex items-start gap-2 text-slate-300 bg-[#141414] p-2 rounded-lg border border-slate-800">
                    <Car className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block text-[10px] uppercase tracking-wider font-mono">
                        {isFr ? 'Parking :' : 'Aparcamiento:'}
                      </span>
                      <span className="text-xs text-slate-300">{displayParking}</span>
                    </div>
                  </div>

                  {/* Distance and Bathrooms */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#141414] p-2 rounded-lg border border-slate-800 text-[11px]">
                      <span className="text-slate-500 block text-[9px] uppercase font-mono">
                        {isFr ? 'Dist. Centre :' : 'Dist. Centro:'}
                      </span>
                      <span className="font-medium text-slate-200 truncate block">
                        {displayDistance}
                      </span>
                    </div>

                    <div className="bg-[#141414] p-2 rounded-lg border border-slate-800 text-[11px] flex items-center gap-1.5">
                      <Bath className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-mono">
                          {isFr ? 'Salles de bain :' : 'Baños:'}
                        </span>
                        <span className="font-medium text-slate-200">
                          {apt.bathrooms} {isFr ? (apt.bathrooms === 1 ? 'bain' : 'bains') : (apt.bathrooms === 1 ? 'baño' : 'baños')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {displayNotes && (
                    <div className="p-2.5 bg-[#141414] rounded-lg border border-slate-800/80 text-[11px] text-slate-400">
                      <span className="font-bold text-slate-300 font-mono block mb-0.5 flex items-center gap-1 text-[10px]">
                        <FileText className="w-3 h-3 text-blue-400" />
                        {isFr ? 'Notes :' : 'Notas:'}
                      </span>
                      <p className="line-clamp-3 italic text-slate-300 leading-snug">{displayNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    apt.name + ' ' + apt.address + ' ' + apt.city
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-mono text-[11px] font-bold flex items-center gap-1"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openAddForDay(target)}
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={isFr ? 'Modifier le logement' : 'Editar apartamento'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteApartment(apt.id)}
                    className="p-1.5 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                    title={isFr ? 'Supprimer le logement' : 'Eliminar apartamento'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Form to Register / Edit Apartment with all 8 fields */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
                {isFr ? `Nuit ${editingDayNumber} · ` : `Noche ${editingDayNumber} · `}
                {TARGET_NIGHTS.find((t) => t.dayNumber === editingDayNumber)?.dateFormatted}
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {isFr ? 'Données du Logement à ' : 'Datos del Apartamento en '}
                {TARGET_NIGHTS.find((t) => t.dayNumber === editingDayNumber)?.city}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isFr
                  ? 'Remplissez les détails du logement pour synchroniser et recalculer les dépenses globales et par couple.'
                  : 'Completa los datos del apartamento seleccionado (incluyendo horarios de check-in y check-out) para guardarlo y recalcular los gastos totales y por pareja.'}
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-950/30 border border-rose-500/40 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveApartment} className="space-y-4">
              {/* 1. Nombre */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  {isFr ? '1. Nom du Logement *' : '1. Nombre del Apartamento *'}
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={isFr ? 'Ex: Appartement Vue Mer, Résidence Praza Maior' : 'Ej: Apartamentos Turísticos Praza Maior'}
                  className="w-full bg-[#181818] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 2. Dirección */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  {isFr ? '2. Adresse Complète *' : '2. Dirección Completa *'}
                </label>
                <input
                  type="text"
                  required
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Ej: Rúa do Progreso 58, 1ºA, Ourense"
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

              {/* 3. Precio & 7. Baños */}
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

              {/* 4. Cancelación Gratuita */}
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
                    placeholder={isFr ? "Précision (ex: Annulable jusqu'à 48h avant)" : 'Detalle (Ej: Hasta el 8 de Noviembre / hasta 48h antes)'}
                    className="w-full bg-[#121212] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>

              {/* 5. Aparcamiento */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  {isFr ? '5. Stationnement (Parking) *' : '5. Aparcamiento (Parking) *'}
                </label>
                <input
                  type="text"
                  required
                  value={formParking}
                  onChange={(e) => setFormParking(e.target.value)}
                  placeholder={isFr ? 'Ex: Garage privé gratuit en sous-sol / Parking San Lázaro à 100m' : 'Ej: Garaje privado incluido en el edificio / Parking público San Lázaro a 100m'}
                  className="w-full bg-[#181818] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 6. Distancia al Centro */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  {isFr ? '6. Distance du Centre *' : '6. Distancia al Centro *'}
                </label>
                <input
                  type="text"
                  required
                  value={formDistanceToCenter}
                  onChange={(e) => setFormDistanceToCenter(e.target.value)}
                  placeholder={isFr ? 'Ex: 250m de la cathédrale / 5 min à pied de la place centrale' : 'Ej: 250m de la Catedral / 5 min a pie de la Plaza Mayor'}
                  className="w-full bg-[#181818] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* 8. Notas */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                  {isFr ? '8. Notes & Remarques du Logement' : '8. Notas del Apartamento'}
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder={isFr ? 'Ex: Boîte à clés sécurisée, caution de 100€, lien de réservation Booking...' : 'Ej: Check-in automático con código, fianza de 100€, enlace de reserva en Booking, cama de matrimonio + 2 individuales...'}
                  className="w-full bg-[#181818] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#181818] hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  {isFr ? 'Annuler' : 'Cancelar'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {isFr ? 'Enregistrer le Logement' : 'Guardar Apartamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
