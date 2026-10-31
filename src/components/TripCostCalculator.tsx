import React, { useState, useEffect, useRef } from 'react';
import { TRIP_OVERVIEW } from '../data/galiciaRouteData';
import { generateTripPDF } from '../utils/pdfGenerator';
import { CustomExpense, UserApartment, ExpenseTarget } from '../types/trip';
import {
  subscribeToExpenses,
  saveExpenseToCloud,
  toggleExpenseInCloud,
  deleteExpenseFromCloud,
  clearAllExpensesFromCloud,
  subscribeToSettings,
  saveSettingsToCloud,
  subscribeToApartments,
  DEFAULT_TRIP_SETTINGS,
  TripSettings,
} from '../services/tripPersistence';
import {
  Calculator,
  Car,
  Home,
  Utensils,
  Ticket,
  Gift,
  Ship,
  Plus,
  Trash2,
  Download,
  Sparkles,
  Cloud,
  Tag,
  Check,
  X,
  Users,
  User,
  Receipt,
  Scale,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const TripCostCalculator: React.FC = () => {
  const {
    language,
    t,
    translateExpenseCategory,
    translateExpenseTitle,
  } = useLanguage();
  const isFr = language === 'fr';

  const [fuelPricePerLiter, setFuelPricePerLiter] = useState(DEFAULT_TRIP_SETTINGS.fuelPricePerLiter);
  const [carConsumption, setCarConsumption] = useState(DEFAULT_TRIP_SETTINGS.carConsumption);
  const [foodDailyBudgetPerPax, setFoodDailyBudgetPerPax] = useState(DEFAULT_TRIP_SETTINGS.foodDailyBudgetPerPax);
  const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>([]);
  const [userApartments, setUserApartments] = useState<UserApartment[]>([]);
  const [, setSyncStatus] = useState<'syncing' | 'synced' | 'local'>('syncing');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // New Expense Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CustomExpense['category']>('excursion');
  const [newAmount, setNewAmount] = useState('');
  const [newIsPerPerson, setNewIsPerPerson] = useState(false);
  const [newAssignedTo, setNewAssignedTo] = useState<ExpenseTarget>('both');
  const [newNotes, setNewNotes] = useState('');

  // 1. Subscribe to Expenses
  useEffect(() => {
    const unsub = subscribeToExpenses((items, source) => {
      setCustomExpenses(items);
      if (source === 'cloud') {
        setSyncStatus('synced');
      }
    });
    return () => unsub();
  }, []);

  const settingsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 2. Subscribe to Settings
  useEffect(() => {
    const unsub = subscribeToSettings((settings, source) => {
      if (!settingsTimerRef.current) {
        setFuelPricePerLiter((prev) => (prev !== settings.fuelPricePerLiter ? settings.fuelPricePerLiter : prev));
        setCarConsumption((prev) => (prev !== settings.carConsumption ? settings.carConsumption : prev));
        setFoodDailyBudgetPerPax((prev) => (prev !== settings.foodDailyBudgetPerPax ? settings.foodDailyBudgetPerPax : prev));
      }
      if (source === 'cloud') {
        setSyncStatus('synced');
      }
    });
    return () => {
      unsub();
      if (settingsTimerRef.current) {
        clearTimeout(settingsTimerRef.current);
      }
    };
  }, []);

  // 3. Subscribe to User Apartments
  useEffect(() => {
    const unsub = subscribeToApartments((items) => {
      setUserApartments(items);
    });
    return () => unsub();
  }, []);

  // Base shared calculations
  const totalKm = TRIP_OVERVIEW.totalKmEstimated;
  const fuelLiters = (totalKm * carConsumption) / 100;
  const totalFuelCost = fuelLiters * fuelPricePerLiter;
  const totalTollsCost = TRIP_OVERVIEW.tollsEstimatedCost;

  const totalLodgingCost = userApartments.reduce(
    (acc, curr) => acc + (Number(curr.price) || 0),
    0
  );

  const totalFoodCost = foodDailyBudgetPerPax * 4 * 10;
  const sharedBaseTotal = totalFuelCost + totalTollsCost + totalLodgingCost + totalFoodCost;

  // Custom expenses attribution calculations
  const enabledCustomExpenses = customExpenses.filter((e) => e.enabled);

  let customSharedTotal = 0;
  let customExclusiveByL = 0;
  let customExclusiveAyM = 0;

  enabledCustomExpenses.forEach((exp) => {
    const target = exp.assignedTo || 'both';
    if (target === 'both') {
      const cost = exp.isPerPerson ? exp.amount * 4 : exp.amount;
      customSharedTotal += cost;
    } else if (target === 'ByL') {
      // 2 people in couple ByL
      const cost = exp.isPerPerson ? exp.amount * 2 : exp.amount;
      customExclusiveByL += cost;
    } else if (target === 'AyM') {
      // 2 people in couple AyM
      const cost = exp.isPerPerson ? exp.amount * 2 : exp.amount;
      customExclusiveAyM += cost;
    }
  });

  const totalSharedCosts = sharedBaseTotal + customSharedTotal;
  const sharedHalfPerCouple = totalSharedCosts / 2;

  const totalByL = sharedHalfPerCouple + customExclusiveByL;
  const totalAyM = sharedHalfPerCouple + customExclusiveAyM;
  const grandTotal = totalByL + totalAyM;

  const sharedCustomList = enabledCustomExpenses.filter(
    (e) => (e.assignedTo || 'both') === 'both'
  );
  const exclusiveByLList = enabledCustomExpenses.filter((e) => e.assignedTo === 'ByL');
  const exclusiveAyMList = enabledCustomExpenses.filter((e) => e.assignedTo === 'AyM');

  const handleToggleExpense = async (id: string) => {
    const target = customExpenses.find((e) => e.id === id);
    if (!target) return;
    const nextState = !target.enabled;
    setCustomExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, enabled: nextState } : e))
    );
    await toggleExpenseInCloud(id, nextState);
  };

  const handleDeleteExpense = async (id: string) => {
    setCustomExpenses((prev) => prev.filter((e) => e.id !== id));
    await deleteExpenseFromCloud(id);
  };

  const handleClearAllExpenses = async () => {
    setCustomExpenses([]);
    await clearAllExpensesFromCloud();
  };

  // Auto-clear legacy expenses if requested
  useEffect(() => {
    const hasCleared = localStorage.getItem('galicia_expenses_purged_by_request_v2');
    if (!hasCleared) {
      clearAllExpensesFromCloud().catch(() => {});
      localStorage.setItem('galicia_expenses_purged_by_request_v2', 'true');
    }
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || isNaN(Number(newAmount))) return;

    const rawNum = Math.abs(Number(newAmount));

    const newExp: CustomExpense = {
      id: `exp-${Date.now()}`,
      title: newTitle.trim(),
      title_es: newTitle.trim(),
      title_fr: isFr ? newTitle.trim() : translateExpenseTitle(newTitle.trim()),
      category: newCategory,
      amount: rawNum,
      isPerPerson: newIsPerPerson,
      assignedTo: newAssignedTo,
      enabled: true,
      notes: newNotes.trim() || undefined,
    };

    setCustomExpenses((prev) => [newExp, ...prev]);
    setNewTitle('');
    setNewAmount('');
    setNewNotes('');
    setNewIsPerPerson(false);
    setNewAssignedTo('both');
    setIsFormOpen(false);

    await saveExpenseToCloud(newExp);
  };

  const pendingSettingsRef = useRef<Partial<TripSettings>>({});

  const debouncedSaveSettings = (partial: Partial<TripSettings>) => {
    pendingSettingsRef.current = {
      ...pendingSettingsRef.current,
      ...partial,
    };
    if (settingsTimerRef.current) {
      clearTimeout(settingsTimerRef.current);
    }
    settingsTimerRef.current = setTimeout(() => {
      const toSave = { ...pendingSettingsRef.current };
      pendingSettingsRef.current = {};
      saveSettingsToCloud(toSave);
      settingsTimerRef.current = null;
    }, 250);
  };

  const handleFuelPriceChange = (val: number) => {
    setFuelPricePerLiter(val);
    debouncedSaveSettings({ fuelPricePerLiter: val });
  };

  const handleCarConsumptionChange = (val: number) => {
    setCarConsumption(val);
    debouncedSaveSettings({ carConsumption: val });
  };

  const handleFoodDailyBudgetChange = (val: number) => {
    setFoodDailyBudgetPerPax(val);
    debouncedSaveSettings({ foodDailyBudgetPerPax: val });
  };

  const handlePrint = () => {
    setIsGeneratingPdf(true);
    try {
      generateTripPDF({
        fuelPricePerLiter,
        carConsumption,
        foodDailyBudgetPerPax,
        customExpenses,
        userApartments,
        language,
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 1200);
    }
  };

  const getCategoryIcon = (category: CustomExpense['category']) => {
    switch (category) {
      case 'rental':
        return <Car className="w-3.5 h-3.5 text-indigo-400" />;
      case 'excursion':
        return <Ship className="w-3.5 h-3.5 text-cyan-400" />;
      case 'tickets':
        return <Ticket className="w-3.5 h-3.5 text-amber-400" />;
      case 'gifts':
        return <Gift className="w-3.5 h-3.5 text-pink-400" />;
      default:
        return <Tag className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#0F0F0F] border border-slate-800 rounded-xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold">
                  {isFr
                    ? 'Budget Séparé par Couple · ByL & AyM (4 Voyageurs)'
                    : 'Presupuesto Separado por Pareja · ByL & AyM (4 Personas)'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  <span>{isFr ? 'Synchronisé avec Firestore' : 'Sincronizado con Firestore'}</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isFr ? 'Calculateur de Dépenses & Répartition Par Couple' : 'Calculadora de Costes & Reparto por Pareja'}
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
            {isFr
              ? 'Imputez n\'importe quelle dépense aux deux couples (50/50) ou à un seul couple (100% ByL ou 100% AyM). Tous les calculs sont mis à jour en temps réel.'
              : 'Imputa cualquier gasto a ambas parejas (50/50) o a una sola pareja en exclusiva (100% ByL o 100% AyM). El desglose final y la liquidación se calculan automáticamente.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 bg-[#141414] hover:bg-slate-800 text-white font-mono text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg border border-slate-700 cursor-pointer transition-colors disabled:opacity-60 shadow-lg"
          >
            <Download className={`w-3.5 h-3.5 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
            <span>{isGeneratingPdf ? t('generatingPdf', 'Génération...') : (isFr ? 'Télécharger PDF avec Dépenses' : 'Descargar PDF con Gastos')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Total General, Pareja ByL, Pareja AyM, Alojamientos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Grand Total */}
        <div className="bg-[#0F0F0F] border border-slate-800 p-5 rounded-xl shadow-lg">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">
            {isFr ? 'Coût Total Groupe (10 Jours)' : 'Coste Total Grupo (10 Días)'}
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1">
            {grandTotal.toFixed(0)} €
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 font-mono">
            <span>ByL ({totalByL.toFixed(0)} €)</span>
            <span>+</span>
            <span>AyM ({totalAyM.toFixed(0)} €)</span>
          </div>
        </div>

        {/* Card 2: Pareja ByL */}
        <div className="bg-[#0F0F0F] border border-purple-500/40 p-5 rounded-xl shadow-lg bg-purple-950/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-purple-400 font-mono uppercase tracking-wider font-bold flex items-center gap-1">
              <User className="w-3 h-3 text-purple-400" />
              <span>{t('totalByL', 'Total Pareja ByL')}</span>
            </span>
            <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-semibold">
              Bruno & Loles
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-300 font-mono mt-1">
            {totalByL.toFixed(1)} €
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5 space-y-0.5">
            <div>Base común: <span className="text-slate-300">{sharedHalfPerCouple.toFixed(1)} €</span></div>
            {customExclusiveByL > 0 && (
              <div className="text-purple-400 font-semibold">+ Exclusivo ByL: {customExclusiveByL.toFixed(1)} €</div>
            )}
          </div>
        </div>

        {/* Card 3: Pareja AyM */}
        <div className="bg-[#0F0F0F] border border-emerald-500/40 p-5 rounded-xl shadow-lg bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider font-bold flex items-center gap-1">
              <User className="w-3 h-3 text-emerald-400" />
              <span>{t('totalAyM', 'Total Pareja AyM')}</span>
            </span>
            <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
              Alberto & Mari
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-300 font-mono mt-1">
            {totalAyM.toFixed(1)} €
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5 space-y-0.5">
            <div>Base común: <span className="text-slate-300">{sharedHalfPerCouple.toFixed(1)} €</span></div>
            {customExclusiveAyM > 0 && (
              <div className="text-emerald-400 font-semibold">+ Exclusivo AyM: {customExclusiveAyM.toFixed(1)} €</div>
            )}
          </div>
        </div>

        {/* Card 4: Alojamientos */}
        <div className="bg-[#0F0F0F] border border-slate-800 p-5 rounded-xl shadow-lg">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">
            {isFr ? `Hébergements (${userApartments.length}/9 Nuits)` : `Alojamientos (${userApartments.length}/9 Noches)`}
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono mt-1">
            {totalLodgingCost} €
          </div>
          <span className="text-xs text-emerald-400 font-mono">
            {(totalLodgingCost / 2).toFixed(1)} € / {isFr ? 'couple' : 'pareja'} ({userApartments.length === 9 ? (isFr ? '9 nuits complètes' : '9 de 9 listas') : (isFr ? `${9 - userApartments.length} en attente` : `${9 - userApartments.length} por registrar`)})
          </span>
        </div>
      </div>

      {/* SECTION: Relación de Gastos por Pareja */}
      <div className="bg-[#0F0F0F] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono tracking-tight flex items-center gap-2">
                <span>{isFr ? 'État des Dépenses par Couple' : 'Relación de Gastos por Pareja'}</span>
                <span className="text-[10px] font-normal text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/30">
                  Bruno y Loles vs Alberto y Mari
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isFr
                  ? 'Détail de chaque poste de dépense attribué à chaque couple (Base commune 50% + Frais partagés 50% + Dépenses exclusives 100%).'
                  : 'Detalle de cada partida de gasto imputada a cada pareja (Base común 50% + Gastos compartidos 50% + Gastos propios 100%).'}
              </p>
            </div>
          </div>

          {/* Comparative badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg">
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isFr ? 'Comparaison Directe en Parallèle' : 'Comparativa en Paralelo (Lado a Lado)'}</span>
            </span>
          </div>
        </div>

        {/* Vista en Paralelo (Una al lado de la otra) */}
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="grid grid-cols-2 gap-3 sm:gap-5 min-w-[620px]">
            {/* Columna 1: Bruno y Loles (ByL) */}
            <div className="bg-[#141414] border border-purple-500/30 rounded-xl p-4 sm:p-5 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-4">
                {/* Header ByL */}
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-xs font-mono">
                      ByL
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                        <span>Bruno & Loles</span>
                        <span className="text-[10px] text-purple-400 bg-purple-950/60 px-1.5 py-0.2 rounded border border-purple-500/30 font-normal">
                          {isFr ? '2 personnes' : '2 personas'}
                        </span>
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {isFr ? 'Quote-part :' : 'Cuota de gasto :'}{' '}
                        <strong className="text-purple-300">{((totalByL / (grandTotal || 1)) * 100).toFixed(1)}%</strong> del viaje
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-300 font-mono">
                      {totalByL.toFixed(1)} €
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ~{(totalByL / 2).toFixed(1)} € / {isFr ? 'pers.' : 'persona'}
                    </div>
                  </div>
                </div>

                {/* 1. Base Común del Viaje (50%) */}
                <div className="space-y-2 bg-[#0C0C0C] p-3.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-xs font-mono">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                      {isFr ? '1. Frais de Voyage Communs (50%)' : '1. Gastos de Viaje Comunes (50%)'}
                    </span>
                    <span className="text-slate-200 font-bold">{(sharedBaseTotal / 2).toFixed(1)} €</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono text-slate-300 pt-1">
                    <div className="flex justify-between items-center text-slate-400 hover:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isFr ? 'Hébergements (9 Nuits)' : 'Alojamientos (9 Noches)'}</span>
                      </span>
                      <span className="text-white">{(totalLodgingCost / 2).toFixed(1)} €</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 hover:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isFr ? 'Carburant estimé' : 'Combustible estimado'} (~{totalKm} km)</span>
                      </span>
                      <span className="text-white">{(totalFuelCost / 2).toFixed(1)} €</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 hover:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isFr ? 'Péages autoroutes' : 'Peajes autopista'}</span>
                      </span>
                      <span className="text-white">{(totalTollsCost / 2).toFixed(1)} €</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 hover:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isFr ? 'Restauration estimée' : 'Comidas estimadas'} (10 días)</span>
                      </span>
                      <span className="text-white">{(totalFoodCost / 2).toFixed(1)} €</span>
                    </div>
                  </div>
                </div>

                {/* 2. Gastos Adicionales Compartidos (50%) */}
                <div className="space-y-2 bg-[#0C0C0C] p-3.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-xs font-mono">
                    <span className="text-blue-400 uppercase tracking-wider text-[10px] font-bold">
                      {isFr ? '2. Frais Supplémentaires Partagés (50%)' : '2. Gastos Adicionales Compartidos (50%)'}
                    </span>
                    <span className="text-blue-300 font-bold">
                      {customSharedTotal > 0 ? `+${(customSharedTotal / 2).toFixed(1)} €` : '0.0 €'}
                    </span>
                  </div>
                  {sharedCustomList.length > 0 ? (
                    <div className="space-y-1.5 text-xs font-mono pt-1">
                      {sharedCustomList.map((item) => {
                        const totalItem = item.isPerPerson ? item.amount * 4 : item.amount;
                        const halfItem = totalItem / 2;
                        const title = isFr ? item.title_fr || item.title : item.title_es || item.title;
                        return (
                          <div key={item.id} className="flex justify-between items-center text-slate-300">
                            <span className="truncate pr-2 text-slate-300">· {title}</span>
                            <span className="text-blue-300 flex-shrink-0 font-medium">
                              +{halfItem.toFixed(1)} €{' '}
                              <span className="text-[10px] text-slate-500">(50%)</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 font-mono italic pt-0.5">
                      {isFr ? 'Aucun frais partagé supplémentaire activé' : 'Sin gastos adicionales compartidos activos'}
                    </p>
                  )}
                </div>

                {/* 3. Gastos Exclusivos de Bruno y Loles (100%) */}
                <div className="space-y-2 bg-purple-950/15 p-3.5 rounded-lg border border-purple-500/20">
                  <div className="flex items-center justify-between border-b border-purple-500/30 pb-1.5 text-xs font-mono">
                    <span className="text-purple-300 uppercase tracking-wider text-[10px] font-bold">
                      {isFr ? '3. Dépenses Exclusives Bruno & Loles (100%)' : '3. Gastos Exclusivos Bruno y Loles (100%)'}
                    </span>
                    <span className="text-purple-300 font-bold">
                      {customExclusiveByL > 0 ? `+${customExclusiveByL.toFixed(1)} €` : '0.0 €'}
                    </span>
                  </div>
                  {exclusiveByLList.length > 0 ? (
                    <div className="space-y-1.5 text-xs font-mono pt-1">
                      {exclusiveByLList.map((item) => {
                        const totalItem = item.isPerPerson ? item.amount * 2 : item.amount;
                        const title = isFr ? item.title_fr || item.title : item.title_es || item.title;
                        return (
                          <div key={item.id} className="flex justify-between items-center text-slate-200">
                            <div className="truncate pr-2">
                              <span>· {title}</span>
                              {item.isPerPerson && (
                                <span className="text-[10px] text-slate-400 block ml-2">
                                  ({item.amount.toFixed(1)} € × 2 {isFr ? 'pers.' : 'personas'})
                                </span>
                              )}
                            </div>
                            <span className="text-purple-300 font-bold flex-shrink-0">
                              +{totalItem.toFixed(1)} €
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 font-mono italic pt-0.5">
                      {isFr ? 'Aucune dépense exclusive enregistrée pour ce couple' : 'Sin gastos propios exclusivos registrados para ByL'}
                    </p>
                  )}
                </div>
              </div>

              {/* Total Card Footer ByL */}
              <div className="pt-3 border-t border-purple-500/30 flex items-center justify-between font-mono">
                <span className="text-xs text-slate-300 uppercase font-bold tracking-wider">
                  {isFr ? 'Total attribué à Bruno & Loles :' : 'Total Imputado a Bruno y Loles :'}
                </span>
                <span className="text-lg font-bold text-purple-300">
                  {totalByL.toFixed(1)} €
                </span>
              </div>
            </div>

            {/* Columna 2: Alberto y Mari (AyM) */}
            <div className="bg-[#141414] border border-emerald-500/30 rounded-xl p-4 sm:p-5 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-4">
                {/* Header AyM */}
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xs font-mono">
                      AyM
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                        <span>Alberto & Mari</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30 font-normal">
                          {isFr ? '2 personnes' : '2 personas'}
                        </span>
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {isFr ? 'Quote-part :' : 'Cuota de gasto :'}{' '}
                        <strong className="text-emerald-300">{((totalAyM / (grandTotal || 1)) * 100).toFixed(1)}%</strong> del viaje
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-300 font-mono">
                      {totalAyM.toFixed(1)} €
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ~{(totalAyM / 2).toFixed(1)} € / {isFr ? 'pers.' : 'persona'}
                    </div>
                  </div>
                </div>

                {/* 1. Base Común del Viaje (50%) */}
                <div className="space-y-2 bg-[#0C0C0C] p-3.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-xs font-mono">
                    <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                      {isFr ? '1. Frais de Voyage Communs (50%)' : '1. Gastos de Viaje Comunes (50%)'}
                    </span>
                    <span className="text-slate-200 font-bold">{(sharedBaseTotal / 2).toFixed(1)} €</span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono text-slate-300 pt-1">
                    <div className="flex justify-between items-center text-slate-400 hover:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isFr ? 'Hébergements (9 Nuits)' : 'Alojamientos (9 Noches)'}</span>
                      </span>
                      <span className="text-white">{(totalLodgingCost / 2).toFixed(1)} €</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 hover:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isFr ? 'Carburant estimé' : 'Combustible estimado'} (~{totalKm} km)</span>
                      </span>
                      <span className="text-white">{(totalFuelCost / 2).toFixed(1)} €</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 hover:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isFr ? 'Péages autoroutes' : 'Peajes autopista'}</span>
                      </span>
                      <span className="text-white">{(totalTollsCost / 2).toFixed(1)} €</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400 hover:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isFr ? 'Restauration estimée' : 'Comidas estimadas'} (10 días)</span>
                      </span>
                      <span className="text-white">{(totalFoodCost / 2).toFixed(1)} €</span>
                    </div>
                  </div>
                </div>

                {/* 2. Gastos Adicionales Compartidos (50%) */}
                <div className="space-y-2 bg-[#0C0C0C] p-3.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-xs font-mono">
                    <span className="text-blue-400 uppercase tracking-wider text-[10px] font-bold">
                      {isFr ? '2. Frais Supplémentaires Partagés (50%)' : '2. Gastos Adicionales Compartidos (50%)'}
                    </span>
                    <span className="text-blue-300 font-bold">
                      {customSharedTotal > 0 ? `+${(customSharedTotal / 2).toFixed(1)} €` : '0.0 €'}
                    </span>
                  </div>
                  {sharedCustomList.length > 0 ? (
                    <div className="space-y-1.5 text-xs font-mono pt-1">
                      {sharedCustomList.map((item) => {
                        const totalItem = item.isPerPerson ? item.amount * 4 : item.amount;
                        const halfItem = totalItem / 2;
                        const title = isFr ? item.title_fr || item.title : item.title_es || item.title;
                        return (
                          <div key={item.id} className="flex justify-between items-center text-slate-300">
                            <span className="truncate pr-2 text-slate-300">· {title}</span>
                            <span className="text-blue-300 flex-shrink-0 font-medium">
                              +{halfItem.toFixed(1)} €{' '}
                              <span className="text-[10px] text-slate-500">(50%)</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 font-mono italic pt-0.5">
                      {isFr ? 'Aucun frais partagé supplémentaire activé' : 'Sin gastos adicionales compartidos activos'}
                    </p>
                  )}
                </div>

                {/* 3. Gastos Exclusivos de Alberto y Mari (100%) */}
                <div className="space-y-2 bg-emerald-950/15 p-3.5 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1.5 text-xs font-mono">
                    <span className="text-emerald-300 uppercase tracking-wider text-[10px] font-bold">
                      {isFr ? '3. Dépenses Exclusives Alberto & Mari (100%)' : '3. Gastos Exclusivos Alberto y Mari (100%)'}
                    </span>
                    <span className="text-emerald-300 font-bold">
                      {customExclusiveAyM > 0 ? `+${customExclusiveAyM.toFixed(1)} €` : '0.0 €'}
                    </span>
                  </div>
                  {exclusiveAyMList.length > 0 ? (
                    <div className="space-y-1.5 text-xs font-mono pt-1">
                      {exclusiveAyMList.map((item) => {
                        const totalItem = item.isPerPerson ? item.amount * 2 : item.amount;
                        const title = isFr ? item.title_fr || item.title : item.title_es || item.title;
                        return (
                          <div key={item.id} className="flex justify-between items-center text-slate-200">
                            <div className="truncate pr-2">
                              <span>· {title}</span>
                              {item.isPerPerson && (
                                <span className="text-[10px] text-slate-400 block ml-2">
                                  ({item.amount.toFixed(1)} € × 2 {isFr ? 'pers.' : 'personas'})
                                </span>
                              )}
                            </div>
                            <span className="text-emerald-300 font-bold flex-shrink-0">
                              +{totalItem.toFixed(1)} €
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 font-mono italic pt-0.5">
                      {isFr ? 'Aucune dépense exclusive enregistrée pour ce couple' : 'Sin gastos propios exclusivos registrados para AyM'}
                    </p>
                  )}
                </div>
              </div>

              {/* Total Card Footer AyM */}
              <div className="pt-3 border-t border-emerald-500/30 flex items-center justify-between font-mono">
                <span className="text-xs text-slate-300 uppercase font-bold tracking-wider">
                  {isFr ? 'Total attribué à Alberto & Mari :' : 'Total Imputado a Alberto y Mari :'}
                </span>
                <span className="text-lg font-bold text-emerald-300">
                  {totalAyM.toFixed(1)} €
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section bottom note / Balance */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#141414] border border-slate-800 p-3 rounded-lg text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>
              {Math.abs(totalByL - totalAyM) < 0.05 ? (
                isFr ? 'Répartition 50/50 parfaite : les deux couples ont la même charge financière.' : 'Reparto 50/50 equilibrado : ambas parejas asumen la misma carga económica.'
              ) : totalByL > totalAyM ? (
                isFr ? (
                  <>
                    <strong className="text-purple-300">Bruno & Loles</strong> ont une charge supérieure de <strong className="text-white">{(totalByL - totalAyM).toFixed(1)} €</strong> en raison de leurs dépenses exclusives.
                  </>
                ) : (
                  <>
                    <strong className="text-purple-300">Bruno y Loles</strong> asumen <strong className="text-white">{(totalByL - totalAyM).toFixed(1)} €</strong> más debido a sus gastos propios imputados.
                  </>
                )
              ) : (
                isFr ? (
                  <>
                    <strong className="text-emerald-300">Alberto & Mari</strong> ont une charge supérieure de <strong className="text-white">{(totalAyM - totalByL).toFixed(1)} €</strong> en raison de leurs dépenses exclusives.
                  </>
                ) : (
                  <>
                    <strong className="text-emerald-300">Alberto y Mari</strong> asumen <strong className="text-white">{(totalAyM - totalByL).toFixed(1)} €</strong> más debido a sus gastos propios imputados.
                  </>
                )
              )}
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            {isFr ? 'Base commune par couple :' : 'Base común por pareja :'}{' '}
            <strong className="text-white">{sharedHalfPerCouple.toFixed(1)} €</strong>
          </div>
        </div>
      </div>

      {/* SECTION: Custom Expenses Manager */}
      <div className="bg-[#0F0F0F] border border-slate-800 rounded-xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono tracking-tight flex items-center gap-2">
                <span>{isFr ? 'Gestionnaire de Dépenses Supplémentaires' : 'Gestor de Gastos Adicionales'}</span>
                <span className="text-[10px] font-normal text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                  ☁️ {isFr ? 'Synchronisation en direct' : 'Sincronización en vivo'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isFr
                  ? 'Ajoutez des frais de garde de chien, location, carburant supplémentaire, cadeaux... Imputables à ByL, AyM ou aux deux.'
                  : 'Añade guardería de perro, alquiler de coche, regalos, billetes de barco... Imputables solo a ByL, solo a AyM o a ambas parejas.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-md"
            >
              {isFormOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isFormOpen ? (isFr ? 'Annuler' : 'Cancelar') : (isFr ? 'Ajouter une Dépense' : 'Añadir Nuevo Gasto')}</span>
            </button>
          </div>
        </div>

        {/* Add Custom Expense Form */}
        {isFormOpen && (
          <form
            onSubmit={handleAddExpense}
            className="bg-[#141414] border border-slate-700 rounded-xl p-5 space-y-4 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>{isFr ? 'Nouvelle Dépense (Avec Imputation Par Couple)' : 'Nuevo Gasto (Con Imputación por Pareja)'}</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">{isFr ? 'Enregistré dans Firestore' : 'Guardado en Firestore'}</span>
            </div>

            {/* Imputation Selector: both | ByL | AyM */}
            <div className="space-y-1.5 bg-[#0D0D0D] p-3 rounded-lg border border-slate-800">
              <label className="text-[11px] font-mono text-blue-400 uppercase font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{t('assignedToLabel', 'Imputar gasto a:')}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewAssignedTo('both')}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-xs font-medium font-mono transition-all cursor-pointer ${
                    newAssignedTo === 'both'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md font-bold'
                      : 'bg-[#181818] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{t('assignBoth', 'Ambas Parejas (50% ByL / 50% AyM)')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewAssignedTo('ByL')}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-xs font-medium font-mono transition-all cursor-pointer ${
                    newAssignedTo === 'ByL'
                      ? 'bg-purple-600 text-white border-purple-400 shadow-md font-bold'
                      : 'bg-[#181818] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-purple-300" />
                  <span>{t('assignByL', 'Solo Pareja ByL (100%)')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewAssignedTo('AyM')}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-xs font-medium font-mono transition-all cursor-pointer ${
                    newAssignedTo === 'AyM'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-bold'
                      : 'bg-[#181818] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{t('assignAyM', 'Solo Pareja AyM (100%)')}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  {isFr ? 'Libellé / Titre *' : 'Concepto / Título *'}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={
                    newAssignedTo === 'ByL'
                      ? (isFr ? 'Ex: Garde chien Bruno & Loles, extras...' : 'Ej. Guardería perro Bruno y Loles, extras...')
                      : newAssignedTo === 'AyM'
                      ? (isFr ? 'Ex: Achats Alberto & Mari, souvenirs...' : 'Ej. Compras Alberto y Mari, souvenirs...')
                      : (isFr ? 'Ex: Location van, Bateaux Cíes...' : 'Ej. Alquiler furgoneta, Barco Cíes...')
                  }
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  {isFr ? 'Catégorie' : 'Categoría'}
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as CustomExpense['category'])}
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="rental">🚗 {isFr ? 'Location Voiture' : 'Alquiler de Coche'}</option>
                  <option value="excursion">⛵ {isFr ? 'Excursion / Bateau' : 'Excursión / Barco'}</option>
                  <option value="tickets">🎟️ {isFr ? 'Billets / Visites' : 'Entradas / Visitas'}</option>
                  <option value="gifts">🎁 {isFr ? 'Cadeaux / Souvenirs' : 'Regalos / Souvenirs'}</option>
                  <option value="other">📌 {isFr ? 'Divers / Autre' : 'Varios / Otros'}</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  {isFr ? 'Montant (€) *' : 'Importe (€) *'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2 flex flex-col justify-end">
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  {isFr ? 'Calcul du Montant' : 'Cálculo de Importe'}
                </label>
                <button
                  type="button"
                  onClick={() => setNewIsPerPerson(!newIsPerPerson)}
                  className={`w-full text-xs font-mono font-bold py-2 px-2 rounded-lg border transition-all cursor-pointer text-center ${
                    newIsPerPerson
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}
                >
                  {newIsPerPerson
                    ? (isFr ? 'Par Personne' : 'Por Persona')
                    : (isFr ? 'Montant Total' : 'Importe Total')}
                </button>
              </div>

              <div className="sm:col-span-12">
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  {isFr ? 'Notes / Précisions (Facultatif)' : 'Notas / Detalles Adicionales (Opcional)'}
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder={
                    isFr
                      ? 'Ex: Garde pour 10 jours, payé par Bruno & Loles...'
                      : 'Ej. Guardería 10 días, pagado por Bruno y Loles por adelantado...'
                  }
                  className="w-full bg-[#0A0A0A] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white font-mono cursor-pointer"
              >
                {isFr ? 'Annuler' : 'Cancelar'}
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {isFr ? 'Enregistrer dans le Cloud' : 'Guardar en la Nube'}
              </button>
            </div>
          </form>
        )}

        {/* Custom Expenses List Table */}
        <div className="space-y-2">
          {customExpenses.length === 0 ? (
            <div className="bg-[#141414] rounded-lg p-6 text-center border border-slate-800 text-slate-500 text-xs">
              {isFr
                ? 'Aucune dépense supplémentaire enregistrée. Le budget est calculé à partir des 9 hébergements, du carburant et des repas. Vous pouvez ajouter des dépenses exclusives (ex: garde de chien) ou partagées.'
                : 'No hay ningún gasto adicional en la lista. El presupuesto se calcula a partir de los 9 alojamientos, combustible y comidas. Puedes añadir gastos exclusivos (ej. guardería de perro) o compartidos.'}
            </div>
          ) : (
            customExpenses.map((expense) => {
              const target = expense.assignedTo || 'both';
              const totalAmount =
                target === 'both'
                  ? (expense.isPerPerson ? expense.amount * 4 : expense.amount)
                  : (expense.isPerPerson ? expense.amount * 2 : expense.amount);

              const displayTitle = isFr
                ? expense.title_fr || translateExpenseTitle(expense.title)
                : expense.title_es || expense.title;

              return (
                <div
                  key={expense.id}
                  className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                    expense.enabled
                      ? 'bg-[#141414] border-slate-800 hover:border-slate-700'
                      : 'bg-[#0D0D0D] border-slate-800/50 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => handleToggleExpense(expense.id)}
                      className={`h-5 w-5 rounded flex items-center justify-center border transition-colors cursor-pointer ${
                        expense.enabled
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-transparent'
                      }`}
                      title={expense.enabled ? (isFr ? 'Dépense activée' : 'Gasto activado') : (isFr ? 'Dépense désactivée' : 'Gasto desactivado')}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold ${
                            expense.enabled ? 'text-white' : 'text-slate-400 line-through'
                          }`}
                        >
                          {displayTitle}
                        </span>

                        {/* Attribution Badge */}
                        {target === 'ByL' && (
                          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold">
                            <User className="w-2.5 h-2.5" />
                            <span>Solo ByL (100%)</span>
                          </span>
                        )}
                        {target === 'AyM' && (
                          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                            <User className="w-2.5 h-2.5" />
                            <span>Solo AyM (100%)</span>
                          </span>
                        )}
                        {target === 'both' && (
                          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                            <Users className="w-2.5 h-2.5" />
                            <span>{isFr ? 'Partagé (50/50)' : 'Compartido (50/50)'}</span>
                          </span>
                        )}

                        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {getCategoryIcon(expense.category)}
                          <span>{translateExpenseCategory(expense.category)}</span>
                        </span>
                      </div>

                      {expense.notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isFr ? expense.notes_fr || expense.notes.replace(/pareja/gi, 'couple') : expense.notes_es || expense.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-auto font-mono">
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">
                        {totalAmount.toFixed(0)} €
                        <span className="text-[10px] text-slate-500 font-normal"> total</span>
                      </div>
                      <div className="text-[10px] font-medium">
                        {target === 'ByL' && (
                          <span className="text-purple-400">100% ByL · 0 € AyM</span>
                        )}
                        {target === 'AyM' && (
                          <span className="text-emerald-400">100% AyM · 0 € ByL</span>
                        )}
                        {target === 'both' && (
                          <span className="text-blue-400">
                            ~{(totalAmount / 2).toFixed(1)} € / {isFr ? 'couple' : 'pareja'}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                      title={isFr ? 'Supprimer de Firestore' : 'Eliminar de Firestore'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Adjustments & Route Parameters Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Parameter Sliders */}
        <div className="lg:col-span-5 bg-[#0F0F0F] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-400" />
              <span>{isFr ? 'Paramètres Routiers Persistants' : 'Parámetros de Ruta Persistentes'}</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              {isFr ? 'Cloud Sync' : 'Sync Cloud'}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Slider 1: Fuel Price */}
            <div>
              <div className="flex justify-between font-mono mb-1">
                <span className="text-slate-400">{isFr ? 'Prix du Carburant :' : 'Precio Carburante :'}</span>
                <span className="font-bold text-white">{fuelPricePerLiter.toFixed(2)} €/L</span>
              </div>
              <input
                type="range"
                min="1.30"
                max="2.10"
                step="0.01"
                value={fuelPricePerLiter}
                onChange={(e) => handleFuelPriceChange(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono block">
                {isFr ? 'Moyenne Espagne stations-service' : 'Media estaciones de servicio en ruta'}
              </span>
            </div>

            {/* Slider 2: Car Consumption */}
            <div>
              <div className="flex justify-between font-mono mb-1">
                <span className="text-slate-400">{isFr ? 'Consommation du Véhicule :' : 'Consumo del Coche :'}</span>
                <span className="font-bold text-white">{carConsumption.toFixed(1)} L/100km</span>
              </div>
              <input
                type="range"
                min="4.5"
                max="10.0"
                step="0.1"
                value={carConsumption}
                onChange={(e) => handleCarConsumptionChange(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono block">
                {isFr ? 'Véhicule 4 personnes + coffre chargé' : 'Coche para 4 ocupantes y maletero'}
              </span>
            </div>

            {/* Slider 3: Meals budget per person */}
            <div>
              <div className="flex justify-between font-mono mb-1">
                <span className="text-slate-400">{isFr ? 'Repas & Restaurants (Couple / Jour) :' : 'Comidas & Restaurantes (Pareja / Día) :'}</span>
                <span className="font-bold text-white">{foodDailyBudgetPerPax * 2} €</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                step="5"
                value={foodDailyBudgetPerPax}
                onChange={(e) => handleFoodDailyBudgetChange(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono block">
                {foodDailyBudgetPerPax} € / {isFr ? 'personne / jour (10 jours complets)' : 'persona / día (10 días completos)'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Detailed Budget Breakdown */}
        <div className="lg:col-span-7 bg-[#0F0F0F] border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>{isFr ? 'Ventilation Complète du Budget' : 'Desglose Completo del Presupuesto'}</span>
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {grandTotal.toFixed(0)} € {isFr ? 'Total' : 'Total'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Lodgings row */}
            <div className="flex items-center justify-between p-3 bg-[#141414] rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <Home className="w-4 h-4 text-emerald-400" />
                <span>{isFr ? '9 Nuits en Appartements Entiers avec Parking' : '9 Noches en Apartamentos Reales con Parking'}</span>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-white block">{totalLodgingCost} €</span>
                <span className="text-[10px] text-slate-400 font-medium">{(totalLodgingCost / 2).toFixed(1)} € / {isFr ? 'couple' : 'pareja'}</span>
              </div>
            </div>

            {/* Fuel row */}
            <div className="flex items-center justify-between p-3 bg-[#141414] rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <Car className="w-4 h-4 text-blue-400" />
                <span>{isFr ? `Carburant (~${fuelLiters.toFixed(0)} L pour ${totalKm} km)` : `Combustible (~${fuelLiters.toFixed(0)} L para ${totalKm} km)`}</span>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-white block">{totalFuelCost.toFixed(0)} €</span>
                <span className="text-[10px] text-slate-400 font-medium">{(totalFuelCost / 2).toFixed(1)} € / {isFr ? 'couple' : 'pareja'}</span>
              </div>
            </div>

            {/* Tolls row */}
            <div className="flex items-center justify-between p-3 bg-[#141414] rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <Tag className="w-4 h-4 text-purple-400" />
                <span>{isFr ? 'Péages d\'Autoroute' : 'Peajes de Autovía/Autopista'}</span>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-white block">{totalTollsCost} €</span>
                <span className="text-[10px] text-slate-400 font-medium">{(totalTollsCost / 2).toFixed(1)} € / {isFr ? 'couple' : 'pareja'}</span>
              </div>
            </div>

            {/* Food row */}
            <div className="flex items-center justify-between p-3 bg-[#141414] rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-slate-300">
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>{isFr ? 'Repas, Tapas & Vins (10 jours pour 2 couples)' : 'Comidas, Tapas & Vinos (10 días para 2 parejas)'}</span>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-white block">{totalFoodCost} €</span>
                <span className="text-[10px] text-slate-400 font-medium">{(totalFoodCost / 2).toFixed(1)} € / {isFr ? 'couple' : 'pareja'}</span>
              </div>
            </div>

            {/* Additional custom expenses */}
            {enabledCustomExpenses.map((exp) => {
              const target = exp.assignedTo || 'both';
              const totalExp =
                target === 'both'
                  ? (exp.isPerPerson ? exp.amount * 4 : exp.amount)
                  : (exp.isPerPerson ? exp.amount * 2 : exp.amount);

              const expTitle = isFr
                ? exp.title_fr || translateExpenseTitle(exp.title)
                : exp.title_es || exp.title;

              return (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3 bg-[#141414] rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-2.5 text-slate-300 min-w-0 pr-2">
                    <div className="mt-0.5 flex-shrink-0">
                      {exp.category === 'rental' && <Car className="w-4 h-4 text-indigo-400" />}
                      {exp.category === 'excursion' && <Ship className="w-4 h-4 text-cyan-400" />}
                      {exp.category === 'tickets' && <Ticket className="w-4 h-4 text-emerald-400" />}
                      {exp.category === 'gifts' && <Gift className="w-4 h-4 text-pink-400" />}
                      {exp.category === 'other' && <Tag className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white block text-xs break-words">
                          {expTitle}
                        </span>
                        {target === 'ByL' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Solo ByL
                          </span>
                        )}
                        {target === 'AyM' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Solo AyM
                          </span>
                        )}
                        {target === 'both' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            50/50
                          </span>
                        )}
                      </div>
                      {exp.notes && (
                        <span className="text-[10px] text-slate-400 block truncate">
                          {isFr ? exp.notes_fr || exp.notes : exp.notes_es || exp.notes}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right font-mono flex-shrink-0">
                    <span className="font-bold text-white block">
                      {totalExp.toFixed(0)} €
                    </span>
                    <span className="text-[10px] font-medium">
                      {target === 'ByL' && <span className="text-purple-400">100% ByL</span>}
                      {target === 'AyM' && <span className="text-emerald-400">100% AyM</span>}
                      {target === 'both' && (
                        <span className="text-slate-400">
                          {(totalExp / 2).toFixed(1)} € / {isFr ? 'couple' : 'pareja'}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
