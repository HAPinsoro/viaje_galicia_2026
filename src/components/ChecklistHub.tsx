import React, { useState, useEffect } from 'react';
import {
  Check,
  Plus,
  Trash2,
  ListChecks,
  CheckCircle2,
  Circle,
  RotateCcw,
  Car,
  User,
  Users,
  Luggage,
  ShieldAlert,
  ArrowRightLeft,
} from 'lucide-react';
import {
  subscribeToChecklist,
  toggleChecklistItemInCloud,
  addChecklistItemToCloud,
  deleteChecklistItemFromCloud,
  ChecklistDoc,
  ChecklistCouple,
  DEFAULT_CHECKLIST,
} from '../services/tripPersistence';
import { useLanguage } from '../context/LanguageContext';

export const ChecklistHub: React.FC = () => {
  const { language, t, translateChecklistTitle } = useLanguage();
  const isFr = language === 'fr';

  const [items, setItems] = useState<ChecklistDoc[]>([]);
  const [activeTab, setActiveTab] = useState<'dual' | 'ByL' | 'AyM' | 'general'>('dual');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [dualInput, setDualInput] = useState('');
  const [quickInputByL, setQuickInputByL] = useState('');
  const [quickInputAyM, setQuickInputAyM] = useState('');
  const [quickInputGeneral, setQuickInputGeneral] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Subscribe to real-time checklist items in Firestore
  useEffect(() => {
    const unsub = subscribeToChecklist((docs) => {
      const map = new Map<string, ChecklistDoc>();
      docs.forEach((d) => map.set(d.id, d));
      setItems(Array.from(map.values()));
    });
    return () => unsub();
  }, []);

  // Separate items by couple with deduplication
  const uniqueItems = Array.from(
    new Map(items.map((item) => [item.id, item])).values()
  );

  const byLItems = uniqueItems.filter((i) => i.targetCouple === 'ByL');
  const ayMItems = uniqueItems.filter((i) => i.targetCouple === 'AyM');
  const generalItems = uniqueItems.filter((i) => !i.targetCouple || i.targetCouple === 'general');

  // Stats
  const calcStats = (list: ChecklistDoc[]) => {
    const total = list.length;
    const completed = list.filter((i) => i.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending: total - completed, percent };
  };

  const byLStats = calcStats(byLItems);
  const ayMStats = calcStats(ayMItems);
  const generalStats = calcStats(generalItems);
  const globalStats = calcStats(uniqueItems);

  const applyStatusFilter = (list: ChecklistDoc[]) => {
    if (filter === 'pending') return list.filter((i) => !i.completed);
    if (filter === 'completed') return list.filter((i) => i.completed);
    return list;
  };

  const handleToggle = async (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const nextCompleted = !target.completed;
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed: nextCompleted } : i))
    );
    await toggleChecklistItemInCloud(id, nextCompleted);
  };

  const handleAdd = async (title: string, targetCouple: ChecklistCouple, clearFn: () => void) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    clearFn();
    setIsAdding(true);
    try {
      // Requisito: solo cuando la vista sea por parejas, al añadir una tarea se ha de añadir a las dos parejas
      if (activeTab === 'dual' && (targetCouple === 'ByL' || targetCouple === 'AyM')) {
        const [created1, created2] = await Promise.all([
          addChecklistItemToCloud(trimmed, 'ByL', language),
          addChecklistItemToCloud(trimmed, 'AyM', language),
        ]);
        setItems((prev) => {
          const ids = new Set(prev.map((i) => i.id));
          const toAdd: ChecklistDoc[] = [];
          if (!ids.has(created1.id)) toAdd.push(created1);
          if (!ids.has(created2.id)) toAdd.push(created2);
          return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
        });
        setSyncNotice(
          isFr
            ? '✓ Tâche ajoutée aux 2 couples (ByL et AyM) !'
            : '✓ ¡Tarea añadida a las 2 parejas (ByL y AyM)!'
        );
      } else {
        // Vista de una sola pareja o tarea general de vehículo
        const created = await addChecklistItemToCloud(trimmed, targetCouple, language);
        setItems((prev) => {
          if (prev.some((item) => item.id === created.id)) return prev;
          return [...prev, created];
        });
        setSyncNotice(
          isFr
            ? `✓ Tâche ajoutée à ${targetCouple === 'ByL' ? 'ByL' : targetCouple === 'AyM' ? 'AyM' : 'la liste commune'} !`
            : `✓ ¡Tarea añadida a ${targetCouple === 'ByL' ? 'ByL' : targetCouple === 'AyM' ? 'AyM' : 'la lista común'}!`
        );
      }
      setTimeout(() => setSyncNotice(null), 2500);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => prev.filter((i) => i.id !== id));
    await deleteChecklistItemFromCloud(id);
  };

  const handleMarkCouple = async (couple: ChecklistCouple | 'all', completed: boolean) => {
    const targets = couple === 'all' ? items : items.filter((i) => (i.targetCouple || 'general') === couple);
    setItems((prev) =>
      prev.map((i) => {
        if (couple === 'all' || (i.targetCouple || 'general') === couple) {
          return { ...i, completed };
        }
        return i;
      })
    );
    for (const item of targets) {
      if (item.completed !== completed) {
        await toggleChecklistItemInCloud(item.id, completed);
      }
    }
  };

  const handleRestoreDefaults = async () => {
    const existingIds = new Set(items.map((i) => i.id));
    for (const def of DEFAULT_CHECKLIST) {
      if (!existingIds.has(def.id)) {
        await addChecklistItemToCloud(def.title, def.targetCouple || 'general', 'es');
      }
    }
    setSyncNotice(isFr ? 'Éléments par défaut synchronisés' : 'Checklists por defecto restauradas');
    setTimeout(() => setSyncNotice(null), 2500);
  };

  // Helper renderer for a single checklist column
  const renderCoupleChecklist = (
    title: string,
    subtitle: string,
    couple: ChecklistCouple,
    list: ChecklistDoc[],
    stats: { total: number; completed: number; pending: number; percent: number },
    color: 'purple' | 'emerald' | 'blue',
    quickInput: string,
    setQuickInput: (v: string) => void
  ) => {
    const filteredList = applyStatusFilter(list);

    const colorStyles = {
      purple: {
        border: 'border-purple-500/40',
        bgHeader: 'bg-purple-950/20',
        textAccent: 'text-purple-300',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        progress: 'bg-purple-500',
        btn: 'bg-purple-600 hover:bg-purple-500',
      },
      emerald: {
        border: 'border-emerald-500/40',
        bgHeader: 'bg-emerald-950/20',
        textAccent: 'text-emerald-300',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        progress: 'bg-emerald-500',
        btn: 'bg-emerald-600 hover:bg-emerald-500',
      },
      blue: {
        border: 'border-blue-500/40',
        bgHeader: 'bg-blue-950/20',
        textAccent: 'text-blue-300',
        badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        progress: 'bg-blue-500',
        btn: 'bg-blue-600 hover:bg-blue-500',
      },
    }[color];

    return (
      <div className={`bg-[#0F0F0F] border ${colorStyles.border} rounded-xl p-3 shadow-lg flex flex-col space-y-2.5`}>
        {/* Column Header */}
        <div className={`p-2.5 rounded-lg ${colorStyles.bgHeader} border border-slate-800/80 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            {couple === 'general' ? (
              <Car className="w-4 h-4 text-blue-400" />
            ) : (
              <User className={`w-4 h-4 ${colorStyles.textAccent}`} />
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {title}
                </h3>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${colorStyles.badge}`}>
                  {stats.completed}/{stats.total} ({stats.percent}%)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-16 sm:w-20 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full ${colorStyles.progress} transition-all duration-300`}
                style={{ width: `${stats.percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Add Inline Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd(quickInput, couple, () => setQuickInput(''));
          }}
          className="flex items-center gap-1.5"
        >
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder={
              activeTab === 'dual' && couple !== 'general'
                ? (isFr ? 'Ajouter pour les 2 couples (ByL & AyM)...' : 'Añadir para las 2 parejas (ByL y AyM)...')
                : couple === 'ByL'
                ? (isFr ? 'Ajouter tâche pour ByL...' : 'Añadir tarea para ByL...')
                : couple === 'AyM'
                ? (isFr ? 'Ajouter tâche pour AyM...' : 'Añadir tarea para AyM...')
                : (isFr ? 'Ajouter tâche commune / voiture...' : 'Añadir tarea común / coche...')
            }
            className="flex-1 bg-[#141414] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
          />
          <button
            type="submit"
            disabled={isAdding || !quickInput.trim()}
            className={`${colorStyles.btn} disabled:opacity-40 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors flex-shrink-0`}
          >
            <Plus className="w-3 h-3" />
            <span>
              {activeTab === 'dual' && couple !== 'general'
                ? (isFr ? '+ Aux 2' : '+ Ambas')
                : (isFr ? 'Ajouter' : 'Añadir')}
            </span>
          </button>
        </form>

        {/* Ultra-compact Item Rows */}
        <div className="space-y-1 flex-1 min-h-[140px]">
          {filteredList.length === 0 ? (
            <div className="py-4 text-center text-[11px] text-slate-500 font-mono">
              {isFr ? 'Aucune tâche dans cette sélection' : 'No hay tareas en esta selección'}
            </div>
          ) : (
            filteredList.map((item) => {
              const itemTitle = isFr
                ? item.title_fr || translateChecklistTitle(item.title)
                : item.title_es || item.title;

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={`group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border transition-all text-left cursor-pointer select-none ${
                    item.completed
                      ? 'bg-[#111111] border-emerald-950/60 text-slate-300 hover:border-emerald-800/60'
                      : 'bg-[#151515] border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-[#191919]'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Compact Custom Checkbox */}
                    <div
                      className={`h-3.5 w-3.5 rounded flex items-center justify-center flex-shrink-0 border transition-all ${
                        item.completed
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-900 border-slate-700 text-transparent group-hover:border-slate-500'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>

                    <span
                      className={`text-xs leading-tight break-words line-clamp-2 ${
                        item.completed
                          ? 'line-through text-slate-400 font-normal'
                          : 'text-slate-100 font-medium'
                      }`}
                    >
                      {itemTitle}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-0.5 rounded transition-all cursor-pointer"
                      title={isFr ? 'Supprimer' : 'Eliminar'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Batch actions footer for this column */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
          <span>{stats.pending} {isFr ? 'restants' : 'pendientes'}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCoupleAction(couple, true)}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              ✓ {isFr ? 'Tout cocher' : 'Marcar todo'}
            </button>
            <span>·</span>
            <button
              onClick={() => handleCoupleAction(couple, false)}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              ○ {isFr ? 'Tout décocher' : 'Desmarcar'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleCoupleAction = (couple: ChecklistCouple, completed: boolean) => {
    handleMarkCouple(couple, completed);
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-[#0F0F0F] border border-slate-800 rounded-xl px-4 py-3 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight uppercase font-sans">
                {isFr ? 'Check-list de Départ par Couple (ByL & AyM)' : 'Checklist de Salida por Pareja (ByL & AyM)'}
              </h2>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded font-bold">
                ByL: {byLStats.completed}/{byLStats.total}
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold">
                AyM: {ayMStats.completed}/{ayMStats.total}
              </span>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1.5 py-0.2 rounded font-bold">
                Coche: {generalStats.completed}/{generalStats.total}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              {isFr
                ? 'Listes indépendantes pour le couple ByL, le couple AyM et les vérifications communes du véhicule.'
                : 'Listas independientes para la pareja ByL, la pareja AyM y las comprobaciones comunes del viaje.'}
            </p>
          </div>
        </div>

        {/* Global Progress */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end font-mono">
              <span className="text-xs font-bold text-white">
                {globalStats.completed} / {globalStats.total}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                  globalStats.percent === 100
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                }`}
              >
                {globalStats.percent}% {isFr ? 'Total' : 'Total'}
              </span>
            </div>
            <div className="w-28 sm:w-36 bg-slate-900 h-1.5 rounded-full mt-1 overflow-hidden border border-slate-800">
              <div
                className={`h-full ${
                  globalStats.percent === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                } transition-all duration-300`}
                style={{ width: `${globalStats.percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: View Tabs + Status Filter */}
      <div className="bg-[#0F0F0F] border border-slate-800 rounded-xl px-3 py-2 shadow flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Couple View Mode Selector */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dual')}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'dual'
                ? 'bg-blue-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isFr ? 'Vue Parallèle (Bruno & Loles / Alberto & Mari)' : 'Vista por Parejas (Bruno & Loles / Alberto & Mari)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('ByL')}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ByL'
                ? 'bg-purple-600 text-white font-bold shadow'
                : 'text-purple-300 hover:bg-purple-950/40 border border-purple-500/20'
            }`}
          >
            <User className="w-3.5 h-3.5 text-purple-300" />
            <span>ByL · Bruno & Loles ({byLStats.completed}/{byLStats.total})</span>
          </button>

          <button
            onClick={() => setActiveTab('AyM')}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'AyM'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/20'
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-300" />
            <span>AyM · Alberto & Mari ({ayMStats.completed}/{ayMStats.total})</span>
          </button>

          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-slate-700 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-blue-400" />
            <span>{isFr ? 'Véhicule & Route' : 'Coche & Ruta'} ({generalStats.completed}/{generalStats.total})</span>
          </button>
        </div>

        {/* Status Filter (All / Pending / Done) */}
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isFr ? 'Tous' : 'Todos'}
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              filter === 'pending'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Circle className="w-2.5 h-2.5" />
            <span>{isFr ? 'En attente' : 'Pendientes'}</span>
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>{isFr ? 'Prêts' : 'Listos'}</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={handleRestoreDefaults}
            className="text-slate-400 hover:text-blue-400 px-1.5 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1"
            title={isFr ? 'Restaurer les checklists recommandées' : 'Restaurar checklists recomendadas'}
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">{isFr ? 'Initialiser' : 'Restaurar'}</span>
          </button>
        </div>
      </div>

      {syncNotice && (
        <div className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Main Content Area based on Selected View Tab */}
      {activeTab === 'dual' && (
        <div className="space-y-3">
          {/* Dual Unified Quick Add for Both Couples */}
          <div className="bg-[#141414] border border-blue-500/30 rounded-xl p-3 shadow-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white font-mono block">
                  {isFr ? 'Ajout simultané pour les deux couples (ByL & AyM)' : 'Añadir tarea a las dos parejas a la vez'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isFr
                    ? 'La tâche sera créée dans la liste de ByL et dans celle d\'AyM'
                    : 'La comprobación se creará en la lista de ByL y en la de AyM simultáneamente'}
                </span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdd(dualInput, 'ByL', () => setDualInput(''));
              }}
              className="flex-1 min-w-[280px] max-w-xl flex items-center gap-1.5"
            >
              <input
                type="text"
                value={dualInput}
                onChange={(e) => setDualInput(e.target.value)}
                placeholder={
                  isFr
                    ? 'Ajouter pour les deux couples (ex: Vérifier passeport, Parapluie...)'
                    : 'Añadir para las dos parejas (ej. Revisar DNI, Cargadores, Chubasquero...)'
                }
                className="flex-1 bg-[#0A0A0A] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans"
              />
              <button
                type="submit"
                disabled={isAdding || !dualInput.trim()}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-mono text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors flex-shrink-0 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isFr ? 'Ajouter aux 2' : 'Añadir a ambas'}</span>
              </button>
            </form>
          </div>

          {/* Side-by-Side Dual Columns: ByL and AyM (Ultra-compact, maximum screen density) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Column 1: Pareja ByL */}
            {renderCoupleChecklist(
              'Checklist ByL · Bruno y Loles',
              isFr ? 'Préparation & bagages de Bruno et Loles' : 'Preparación, equipaje y tareas de Bruno y Loles',
              'ByL',
              byLItems,
              byLStats,
              'purple',
              quickInputByL,
              setQuickInputByL
            )}

            {/* Column 2: Pareja AyM */}
            {renderCoupleChecklist(
              'Checklist AyM · Alberto y Mari',
              isFr ? 'Préparation & bagages d\'Alberto et Mari' : 'Preparación, equipaje y tareas de Alberto y Mari',
              'AyM',
              ayMItems,
              ayMStats,
              'emerald',
              quickInputAyM,
              setQuickInputAyM
            )}
          </div>

          {/* Full-width Shared Vehicle / Route Checklist */}
          {renderCoupleChecklist(
            isFr ? 'Check-list Véhicule & Voyage Commun (4 Passagers)' : 'Checklist Coche & Ruta Común (4 Pasajeros)',
            isFr
              ? 'ITV, pression des pneus, codes des 9 hébergements et réservations Cíes / Cathédrales'
              : 'ITV, ruedas, llaves/códigos de los 9 apartamentos, permisos Cíes y Catedrales',
            'general',
            generalItems,
            generalStats,
            'blue',
            quickInputGeneral,
            setQuickInputGeneral
          )}
        </div>
      )}

      {activeTab === 'ByL' && (
        <div className="max-w-4xl mx-auto">
          {renderCoupleChecklist(
            'Checklist ByL · Bruno y Loles',
            isFr ? 'Vérifications et préparatifs exclusifs pour Bruno et Loles' : 'Comprobaciones y preparativos exclusivos para Bruno y Loles',
            'ByL',
            byLItems,
            byLStats,
            'purple',
            quickInputByL,
            setQuickInputByL
          )}
        </div>
      )}

      {activeTab === 'AyM' && (
        <div className="max-w-4xl mx-auto">
          {renderCoupleChecklist(
            'Checklist AyM · Alberto y Mari',
            isFr ? 'Vérifications et préparatifs exclusifs pour Alberto et Mari' : 'Comprobaciones y preparativos exclusivos para Alberto y Mari',
            'AyM',
            ayMItems,
            ayMStats,
            'emerald',
            quickInputAyM,
            setQuickInputAyM
          )}
        </div>
      )}

      {activeTab === 'general' && (
        <div className="max-w-4xl mx-auto">
          {renderCoupleChecklist(
            isFr ? 'Check-list Véhicule & Route Commune' : 'Checklist Coche & Ruta Común',
            isFr
              ? 'Vérifications mécaniques et administratives pour les 4 voyageurs'
              : 'Comprobaciones mecánicas y de reservas para los 4 ocupantes',
            'general',
            generalItems,
            generalStats,
            'blue',
            quickInputGeneral,
            setQuickInputGeneral
          )}
        </div>
      )}
    </div>
  );
};
