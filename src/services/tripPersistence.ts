import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CustomExpense, UserApartment } from '../types/trip';
import { FIXED_APARTMENTS } from '../data/galiciaRouteData';
import {
  translateChecklistTitle,
  translateExpenseTitle,
  translateExpenseNotes,
  translateApartmentField,
  translateDayNote,
  hasSpanishParking,
  hasSpanishNotes,
} from '../i18n/translations';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  syncRuntimeConfig,
} from './supabaseClient';

export interface TripSettings {
  fuelPricePerLiter: number;
  carConsumption: number;
  foodDailyBudgetPerPax: number;
  totalPax: number;
  updatedAt?: string;
}

export type ChecklistCouple = 'ByL' | 'AyM' | 'general';

export interface ChecklistDoc {
  id: string;
  title: string;
  title_es?: string;
  title_fr?: string;
  completed: boolean;
  category?: string;
  targetCouple?: ChecklistCouple; // 'ByL' | 'AyM' | 'general'
  updatedAt?: string;
}

const EXPENSES_STORAGE_KEY = 'galicia_trip_custom_expenses_v1';
const SETTINGS_STORAGE_KEY = 'galicia_trip_settings_v1';
const CHECKLIST_STORAGE_KEY = 'galicia_trip_checklist_v2';
const APARTMENTS_STORAGE_KEY = 'galicia_trip_user_apartments_v1';

// PostgreSQL helper function (active when running on Hostinger VPS / Coolify)
export async function sendToPostgres(url: string, method: string = 'GET', body?: any) {
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// =====================================================================
// Row Mappers: Convert Supabase (snake_case) or PostgreSQL to Frontend
// =====================================================================
export function mapDbRowToApartment(r: any): UserApartment {
  const dayNum = Number(r.day_number ?? r.dayNumber) || 1;
  const nameEs = r.name_es || r.name || '';
  const nameFr = r.name_fr || r.name || '';
  const parkingEs = r.parking_es || r.parking || '';
  const parkingFr = r.parking_fr || (r.parking ? translateApartmentField(r.parking, 'fr') : '');
  const distanceEs = r.distance_to_center_es || r.distance_to_center || r.distanceToCenter || '';
  const distanceFr = r.distance_to_center_fr || (distanceEs ? translateApartmentField(distanceEs, 'fr') : '');
  const policyEs = r.cancellation_policy_es || r.cancellation_policy || r.cancellationPolicy || undefined;
  const policyFr = r.cancellation_policy_fr || (policyEs ? translateApartmentField(policyEs, 'fr') : undefined);
  const notesEs = r.notes_es || r.notes || '';
  const notesFr = r.notes_fr || (r.notes ? translateApartmentField(r.notes, 'fr') : '');

  return {
    id: r.id || `apt-day-${dayNum}`,
    dayNumber: dayNum,
    nightDate: r.night_date || r.nightDate || '',
    city: r.city || '',
    name: r.name || '',
    name_es: nameEs,
    name_fr: nameFr,
    address: r.address || '',
    price: Number(r.price) || 0,
    checkInTime: r.check_in_time || r.checkInTime || '15:00',
    checkOutTime: r.check_out_time || r.checkOutTime || '11:00',
    freeCancellation: r.free_cancellation !== undefined
      ? Boolean(r.free_cancellation)
      : (r.freeCancellation !== undefined ? Boolean(r.freeCancellation) : true),
    cancellationPolicy: r.cancellation_policy || r.cancellationPolicy || undefined,
    cancellationPolicy_es: policyEs,
    cancellationPolicy_fr: policyFr,
    parking: r.parking || '',
    parking_es: parkingEs,
    parking_fr: parkingFr,
    distanceToCenter: r.distance_to_center || r.distanceToCenter || '',
    distanceToCenter_es: distanceEs,
    distanceToCenter_fr: distanceFr,
    bathrooms: Number(r.bathrooms) || 1,
    notes: r.notes || '',
    notes_es: notesEs,
    notes_fr: notesFr,
    isSelected: r.isSelected !== undefined ? Boolean(r.isSelected) : true,
    createdAt: r.created_at || r.createdAt,
    updatedAt: r.updated_at || r.updatedAt,
  };
}

export function mapDbRowToChecklist(r: any): ChecklistDoc {
  const titleEs = r.title_es || r.title || '';
  const titleFr = r.title_fr || (titleEs ? translateChecklistTitle(titleEs, 'fr') : '');
  const targetCouple = (r.target_couple || r.targetCouple || 'general') as ChecklistCouple;
  return {
    id: r.id,
    title: r.title || '',
    title_es: titleEs,
    title_fr: titleFr,
    completed: Boolean(r.completed),
    category: r.category || 'general',
    targetCouple,
    updatedAt: r.updated_at || r.updatedAt,
  };
}

export function mapDbRowToExpense(r: any): CustomExpense {
  const titleEs = r.title_es || r.title || '';
  const titleFr = r.title_fr || (titleEs ? translateExpenseTitle(titleEs, 'fr') : '');
  const notesEs = r.notes_es || r.notes || undefined;
  const notesFr = r.notes_fr || (r.notes ? translateExpenseNotes(r.notes, 'fr') : undefined);
  const targetCouple = r.target_couple || r.targetCouple || 'shared';
  const assignedTo: 'both' | 'ByL' | 'AyM' =
    targetCouple === 'ByL' ? 'ByL' : (targetCouple === 'AyM' ? 'AyM' : 'both');

  return {
    id: r.id,
    title: r.title || '',
    title_es: titleEs,
    title_fr: titleFr,
    category: r.category || 'other',
    amount: Number(r.amount) || 0,
    isPerPerson: Boolean(r.is_per_person || r.isPerPerson),
    assignedTo: (r.assignedTo as any) || assignedTo,
    enabled: r.enabled !== undefined ? Boolean(r.enabled) : true,
    notes: r.notes || undefined,
    notes_es: notesEs,
    notes_fr: notesFr,
  };
}

export function mapDbRowToSettings(r: any): TripSettings {
  return {
    fuelPricePerLiter: Number(r.fuel_price_per_liter || r.fuelPricePerLiter) || DEFAULT_TRIP_SETTINGS.fuelPricePerLiter,
    carConsumption: Number(r.car_consumption || r.carConsumption) || DEFAULT_TRIP_SETTINGS.carConsumption,
    foodDailyBudgetPerPax: Number(r.food_daily_budget_per_pax || r.foodDailyBudgetPerPax) || DEFAULT_TRIP_SETTINGS.foodDailyBudgetPerPax,
    totalPax: Number(r.total_pax || r.totalPax) || 4,
    updatedAt: r.updated_at || r.updatedAt,
  };
}

// =====================================================================
// Direct Supabase & PostgreSQL Query Helpers
// =====================================================================
export async function fetchApartmentsFromSupabase(): Promise<UserApartment[] | null> {
  // Los 9 apartamentos están fijados en el código de la aplicación (sin tabla en base de datos)
  return FIXED_APARTMENTS;
}

export async function fetchChecklistFromSupabase(): Promise<ChecklistDoc[] | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('checklist_items')
        .select('*')
        .order('order_index', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(mapDbRowToChecklist);
      }
    } catch (e) {
      console.warn('Supabase client select checklist error:', e);
    }
  }

  try {
    const res = await fetch('/api/db/checklist');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapDbRowToChecklist);
      }
    }
  } catch {
    // fallback
  }

  return null;
}

export async function fetchExpensesFromSupabase(): Promise<CustomExpense[] | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('custom_expenses')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(mapDbRowToExpense);
      }
    } catch (e) {
      console.warn('Supabase client select expenses error:', e);
    }
  }

  try {
    const res = await fetch('/api/db/expenses');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(mapDbRowToExpense);
      }
    }
  } catch {
    // fallback
  }

  return null;
}

export async function fetchSettingsFromSupabase(): Promise<TripSettings | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('trip_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();
      if (!error && data) {
        return mapDbRowToSettings(data);
      }
    } catch (e) {
      console.warn('Supabase client select settings error:', e);
    }
  }

  try {
    const res = await fetch('/api/db/settings');
    if (res.ok) {
      const data = await res.json();
      if (data && (data.fuelPricePerLiter || data.fuel_price_per_liter)) {
        return mapDbRowToSettings(data);
      }
    }
  } catch {
    // fallback
  }

  return null;
}

export const DEFAULT_CUSTOM_EXPENSES: CustomExpense[] = [];

export const DEFAULT_TRIP_SETTINGS: TripSettings = {
  fuelPricePerLiter: 1.55,
  carConsumption: 6.2,
  foodDailyBudgetPerPax: 35,
  totalPax: 4,
};

export const DEFAULT_CHECKLIST: ChecklistDoc[] = [
  // Checklist Pareja ByL (Bruno y Loles)
  {
    id: 'chk-byl-dni',
    title: 'DNI, tarjetas sanitarias y permisos personales (Bruno y Loles)',
    title_es: 'DNI, tarjetas sanitarias y permisos personales (Bruno y Loles)',
    title_fr: 'Cartes d\'identité, cartes vitales et permis (Bruno & Loles)',
    completed: true,
    targetCouple: 'ByL',
  },
  {
    id: 'chk-byl-perro',
    title: 'Comprobación y reserva de guardería para el perro (Bruno y Loles)',
    title_es: 'Comprobación y reserva de guardería para el perro (Bruno y Loles)',
    title_fr: 'Réservation et garde du chien avant le départ (Bruno & Loles)',
    completed: true,
    targetCouple: 'ByL',
  },
  {
    id: 'chk-byl-ropa',
    title: 'Maletas, chubasqueros y calzado de senderismo de Bruno y Loles',
    title_es: 'Maletas, chubasqueros y calzado de senderismo de Bruno y Loles',
    title_fr: 'Bagages, imperméables et chaussures de randonnée de Bruno & Loles',
    completed: true,
    targetCouple: 'ByL',
  },
  {
    id: 'chk-byl-cargador',
    title: 'Cargadores de móvil, cables y neceser personal de Bruno y Loles',
    title_es: 'Cargadores de móvil, cables y neceser personal de Bruno y Loles',
    title_fr: 'Chargeurs de téléphone, câbles et trousse de toilette de Bruno & Loles',
    completed: true,
    targetCouple: 'ByL',
  },

  // Checklist Pareja AyM (Alberto y Mari)
  {
    id: 'chk-aym-dni',
    title: 'DNI, tarjetas sanitarias y permisos personales (Alberto y Mari)',
    title_es: 'DNI, tarjetas sanitarias y permisos personales (Alberto y Mari)',
    title_fr: 'Cartes d\'identité, cartes vitales et permis (Alberto & Mari)',
    completed: true,
    targetCouple: 'AyM',
  },
  {
    id: 'chk-aym-casa',
    title: 'Cierre de suministros, llaves de casa y alarmas (Alberto y Mari)',
    title_es: 'Cierre de suministros, llaves de casa y alarmas (Alberto y Mari)',
    title_fr: 'Coupure des compteurs, clés de maison et alarmes (Alberto & Mari)',
    completed: true,
    targetCouple: 'AyM',
  },
  {
    id: 'chk-aym-ropa',
    title: 'Maletas, chubasqueros y calzado de senderismo de Alberto y Mari',
    title_es: 'Maletas, chubasqueros y calzado de senderismo de Alberto y Mari',
    title_fr: 'Bagages, imperméables et chaussures de randonnée d\'Alberto & Mari',
    completed: true,
    targetCouple: 'AyM',
  },
  {
    id: 'chk-aym-cargador',
    title: 'Cargadores de móvil, cables y neceser personal de Alberto y Mari',
    title_es: 'Cargadores de móvil, cables y neceser personal de Alberto y Mari',
    title_fr: 'Chargeurs de téléphone, câbles et trousse de toilette d\'Alberto & Mari',
    completed: true,
    targetCouple: 'AyM',
  },

  // Checklist Común (Coche, Ruta y Apartamentos)
  {
    id: 'chk-doc-itv',
    title: 'Documentación del coche, seguro e ITV al día',
    title_es: 'Documentación del coche, seguro e ITV al día',
    title_fr: 'Documentation du véhicule, assurance et contrôle technique (ITV)',
    completed: true,
    targetCouple: 'general',
  },
  {
    id: 'chk-neumaticos',
    title: 'Presión de neumáticos y rueda de repuesto / kit antipinchazos',
    title_es: 'Presión de neumáticos y rueda de repuesto / kit antipinchazos',
    title_fr: 'Pression des pneus et roue de secours / kit anti-crevaison',
    completed: true,
    targetCouple: 'general',
  },
  {
    id: 'chk-parking-codes',
    title: 'Códigos y llaves de acceso a parking en los 9 alojamientos',
    title_es: 'Códigos y llaves de acceso a parking en los 9 alojamientos',
    title_fr: 'Codes et clés d\'accès au parking des 9 hébergements',
    completed: true,
    targetCouple: 'general',
  },
  {
    id: 'chk-autoriz-cies',
    title: 'Autorización gratuita Xunta para Islas Cíes (Miércoles 11/11)',
    title_es: 'Autorización gratuita Xunta para Islas Cíes (Miércoles 11/11)',
    title_fr: 'Autorisation gratuite Xunta pour les Îles Cíes (Mercredi 11/11)',
    completed: true,
    targetCouple: 'general',
  },
  {
    id: 'chk-marea-catedrais',
    title: 'Reserva marea baja Playa de las Catedrales (Miércoles 18/11)',
    title_es: 'Reserva marea baja Playa de las Catedrales (Miércoles 18/11)',
    title_fr: 'Réservation marée basse Plage des Cathédrales (Mercredi 18/11)',
    completed: true,
    targetCouple: 'general',
  },
  {
    id: 'chk-cargador-coche',
    title: 'Adaptador de carga múltiple USB para el coche (4 pasajeros)',
    title_es: 'Adaptador de carga múltiple USB para el coche (4 pasajeros)',
    title_fr: 'Adaptateur multiprise USB pour la voiture (4 passagers)',
    completed: true,
    targetCouple: 'general',
  },
  {
    id: 'chk-bolsa-termica',
    title: 'Bolsa térmica para empanadas y quesos gallegos de regreso',
    title_es: 'Bolsa térmica para empanadas y quesos gallegos de regreso',
    title_fr: 'Sac isotherme pour empanadas et fromages au retour',
    completed: true,
    targetCouple: 'general',
  },
];

/**
 * Sync custom expenses with real-time Supabase / PostgreSQL updates and fallback
 */
export function subscribeToExpenses(
  onUpdate: (expenses: CustomExpense[], source: 'cloud' | 'local') => void
): () => void {
  let cached: CustomExpense[] = [];
  try {
    const local = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (local) {
      cached = JSON.parse(local);
    }
  } catch {
    // ignore
  }
  onUpdate(cached, 'local');

  let isSubscribed = true;
  let supabaseChannel: any = null;

  // Supabase / PostgreSQL primary fetch and sync
  const syncSupabase = async () => {
    await syncRuntimeConfig();
    if (!isSubscribed) return;
    const dbExpenses = await fetchExpensesFromSupabase();
    if (dbExpenses !== null && isSubscribed) {
      try {
        localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(dbExpenses));
      } catch {}
      onUpdate(dbExpenses, 'cloud');
    }
  };

  syncSupabase();

  // Supabase Realtime Channel
  const client = getSupabaseClient();
  if (client) {
    try {
      supabaseChannel = client
        .channel(`realtime:expenses:${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'custom_expenses' },
          async () => {
            const fresh = await fetchExpensesFromSupabase();
            if (fresh !== null && isSubscribed) {
              try {
                localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(fresh));
              } catch {}
              onUpdate(fresh, 'cloud');
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Supabase realtime expenses error:', e);
    }
  }

  // Periodic poll to ensure live updates across instances
  const pollInterval = setInterval(() => {
    if (isSubscribed) syncSupabase();
  }, 15000);

  // Firestore mirror / fallback
  let firestoreUnsub: (() => void) | null = null;
  try {
    const expensesCol = collection(db, 'expenses');
    firestoreUnsub = onSnapshot(
      expensesCol,
      (snapshot) => {
        if (!snapshot.empty && isSubscribed) {
          const cloudExpenses: CustomExpense[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const titleEs = data.title_es || data.title || '';
            const titleFr = data.title_fr || (titleEs ? translateExpenseTitle(titleEs, 'fr') : '');
            const notesEs = data.notes_es || data.notes || undefined;
            const notesFr = data.notes_fr || (data.notes ? translateExpenseNotes(data.notes, 'fr') : undefined);

            cloudExpenses.push({
              id: docSnap.id,
              title: data.title ?? '',
              title_es: titleEs,
              title_fr: titleFr,
              category: data.category ?? 'other',
              amount: Number(data.amount) || 0,
              isPerPerson: Boolean(data.isPerPerson),
              assignedTo: (data.assignedTo as 'both' | 'ByL' | 'AyM') || 'both',
              enabled: Boolean(data.enabled),
              notes: data.notes || undefined,
              notes_es: notesEs,
              notes_fr: notesFr,
            });
          });
          onUpdate(cloudExpenses, 'cloud');
        }
      },
      (error) => {
        console.warn('Firestore onSnapshot expenses notice:', error);
      }
    );
  } catch {}

  return () => {
    isSubscribed = false;
    clearInterval(pollInterval);
    if (supabaseChannel) {
      try {
        supabaseChannel.unsubscribe();
      } catch {}
    }
    if (firestoreUnsub) {
      firestoreUnsub();
    }
  };
}

export async function saveExpenseToCloud(expense: CustomExpense): Promise<void> {
  const payer = (expense as any).payer || (expense.assignedTo === 'ByL' ? 'ByL' : (expense.assignedTo === 'AyM' ? 'AyM' : 'ByL'));
  const targetCouple = (expense as any).targetCouple || (expense.assignedTo === 'ByL' ? 'ByL' : (expense.assignedTo === 'AyM' ? 'AyM' : 'shared'));

  // 1. Direct Supabase Upsert
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('custom_expenses').upsert({
        id: expense.id,
        title: expense.title,
        amount: Number(expense.amount) || 0,
        payer,
        target_couple: targetCouple,
        category: expense.category || 'general',
        notes: expense.notes || '',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert expense error:', e);
    }
  }

  // 2. Sync to PostgreSQL REST endpoint
  sendToPostgres('/api/db/expenses', 'POST', {
    id: expense.id,
    title: expense.title,
    amount: expense.amount,
    payer,
    targetCouple,
    category: expense.category || 'general',
    notes: expense.notes || '',
  }).catch(() => {});

  // 3. LocalStorage cache
  try {
    const local = localStorage.getItem(EXPENSES_STORAGE_KEY);
    let list: CustomExpense[] = local ? JSON.parse(local) : [];
    list = list.filter((e) => e.id !== expense.id);
    list.push(expense);
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(list));
  } catch {}

  // 4. Firestore mirror (safe fallback)
  try {
    const cleanData = {
      id: expense.id,
      title: expense.title,
      title_es: expense.title_es || expense.title,
      title_fr: expense.title_fr || expense.title,
      category: expense.category,
      amount: expense.amount,
      isPerPerson: expense.isPerPerson,
      assignedTo: expense.assignedTo || 'both',
      enabled: expense.enabled,
      notes: expense.notes || '',
      notes_es: expense.notes_es || expense.notes || '',
      notes_fr: expense.notes_fr || expense.notes || '',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'expenses', expense.id), cleanData);
  } catch (error) {
    console.warn('Firestore expense write notice:', error);
  }
}

export async function toggleExpenseInCloud(id: string, enabled: boolean): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('custom_expenses').update({
        notes: undefined, // leave notes untouched
        updated_at: new Date().toISOString(),
      }).eq('id', id);
    } catch (e) {
      console.warn('Supabase toggle expense error:', e);
    }
  }

  try {
    const local = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (local) {
      const list: CustomExpense[] = JSON.parse(local);
      const updated = list.map((e) => (e.id === id ? { ...e, enabled } : e));
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch {}

  try {
    await updateDoc(doc(db, 'expenses', id), {
      enabled,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Firestore toggle expense notice:', error);
  }
}

export async function deleteExpenseFromCloud(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('custom_expenses').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete expense error:', e);
    }
  }

  sendToPostgres(`/api/db/expenses/${id}`, 'DELETE').catch(() => {});

  try {
    const local = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (local) {
      const list: CustomExpense[] = JSON.parse(local);
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(list.filter((e) => e.id !== id)));
    }
  } catch {}

  try {
    await deleteDoc(doc(db, 'expenses', id));
  } catch (error) {
    console.warn('Firestore delete expense notice:', error);
  }
}

export async function clearAllExpensesFromCloud(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('custom_expenses').delete().neq('id', '');
    } catch (e) {
      console.warn('Supabase clear expenses error:', e);
    }
  }

  try {
    const snap = await getDocs(collection(db, 'expenses'));
    const deletes = snap.docs.map((docSnap) => deleteDoc(doc(db, 'expenses', docSnap.id)));
    await Promise.all(deletes);
  } catch (error) {
    console.warn('Firestore clear expenses notice:', error);
  }

  try {
    localStorage.removeItem(EXPENSES_STORAGE_KEY);
  } catch {}
}

/**
 * Sync Trip Calculation Settings (fuel, consumption, food budget) with Supabase / Postgres
 */
let currentCachedSettings: TripSettings = DEFAULT_TRIP_SETTINGS;
try {
  const local = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (local) {
    currentCachedSettings = { ...DEFAULT_TRIP_SETTINGS, ...JSON.parse(local) };
  }
} catch {}

export function subscribeToSettings(
  onUpdate: (settings: TripSettings, source: 'cloud' | 'local') => void
): () => void {
  onUpdate(currentCachedSettings, 'local');

  let isSubscribed = true;
  let supabaseChannel: any = null;

  const syncSupabase = async () => {
    await syncRuntimeConfig();
    if (!isSubscribed) return;
    const dbSettings = await fetchSettingsFromSupabase();
    if (dbSettings && isSubscribed) {
      currentCachedSettings = dbSettings;
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(dbSettings));
      } catch {}
      onUpdate(dbSettings, 'cloud');
    }
  };

  syncSupabase();

  const client = getSupabaseClient();
  if (client) {
    try {
      supabaseChannel = client
        .channel(`realtime:settings:${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'trip_settings' },
          async () => {
            const fresh = await fetchSettingsFromSupabase();
            if (fresh && isSubscribed) {
              currentCachedSettings = fresh;
              try {
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(fresh));
              } catch {}
              onUpdate(fresh, 'cloud');
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Supabase realtime settings error:', e);
    }
  }

  const pollInterval = setInterval(() => {
    if (isSubscribed) syncSupabase();
  }, 15000);

  // Firestore mirror
  let firestoreUnsub: (() => void) | null = null;
  try {
    const settingsDocRef = doc(db, 'trip_settings', 'default');
    firestoreUnsub = onSnapshot(
      settingsDocRef,
      (docSnap) => {
        if (docSnap.exists() && isSubscribed) {
          const data = docSnap.data();
          const settings: TripSettings = {
            fuelPricePerLiter: Number(data.fuelPricePerLiter) || DEFAULT_TRIP_SETTINGS.fuelPricePerLiter,
            carConsumption: Number(data.carConsumption) || DEFAULT_TRIP_SETTINGS.carConsumption,
            foodDailyBudgetPerPax: Number(data.foodDailyBudgetPerPax) || DEFAULT_TRIP_SETTINGS.foodDailyBudgetPerPax,
            totalPax: Number(data.totalPax) || 4,
            updatedAt: data.updatedAt,
          };
          currentCachedSettings = settings;
          try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
          } catch {}
          onUpdate(settings, 'cloud');
        }
      },
      (error) => {
        console.warn('Firestore onSnapshot settings notice:', error);
      }
    );
  } catch {}

  return () => {
    isSubscribed = false;
    clearInterval(pollInterval);
    if (supabaseChannel) {
      try {
        supabaseChannel.unsubscribe();
      } catch {}
    }
    if (firestoreUnsub) {
      firestoreUnsub();
    }
  };
}

export async function saveSettingsToCloud(settings: Partial<TripSettings>): Promise<void> {
  const merged: TripSettings = {
    ...currentCachedSettings,
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  currentCachedSettings = merged;

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
  } catch {}

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('trip_settings').upsert({
        id: 'default',
        fuel_price_per_liter: merged.fuelPricePerLiter,
        car_consumption: merged.carConsumption,
        food_daily_budget_per_pax: merged.foodDailyBudgetPerPax,
        total_pax: merged.totalPax,
        updated_at: merged.updatedAt,
      }, { onConflict: 'id' });
    } catch (e) {
      console.warn('Supabase upsert settings error:', e);
    }
  }

  sendToPostgres('/api/db/settings', 'POST', {
    fuelPricePerLiter: merged.fuelPricePerLiter,
    carConsumption: merged.carConsumption,
    foodDailyBudgetPerPax: merged.foodDailyBudgetPerPax,
    totalPax: merged.totalPax,
  }).catch(() => {});

  try {
    await setDoc(
      doc(db, 'trip_settings', 'default'),
      {
        id: 'default',
        fuelPricePerLiter: merged.fuelPricePerLiter,
        carConsumption: merged.carConsumption,
        foodDailyBudgetPerPax: merged.foodDailyBudgetPerPax,
        totalPax: merged.totalPax,
        updatedAt: merged.updatedAt,
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore settings write notice:', error);
  }
}

/**
 * Sync Checklist with Supabase table checklist_items as primary source of truth
 */
export function subscribeToChecklist(
  onUpdate: (items: ChecklistDoc[], source: 'cloud' | 'local') => void
): () => void {
  let cached: ChecklistDoc[] = DEFAULT_CHECKLIST;
  try {
    const local = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (local) {
      cached = JSON.parse(local);
    }
  } catch {}
  onUpdate(cached, 'local');

  let isSubscribed = true;
  let supabaseChannel: any = null;

  const syncSupabase = async () => {
    await syncRuntimeConfig();
    if (!isSubscribed) return;
    const dbItems = await fetchChecklistFromSupabase();
    if (dbItems && dbItems.length > 0 && isSubscribed) {
      try {
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(dbItems));
      } catch {}
      onUpdate(dbItems, 'cloud');
    }
  };

  syncSupabase();

  const client = getSupabaseClient();
  if (client) {
    try {
      supabaseChannel = client
        .channel(`realtime:checklist:${Date.now()}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'checklist_items' },
          async () => {
            const fresh = await fetchChecklistFromSupabase();
            if (fresh && fresh.length > 0 && isSubscribed) {
              try {
                localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(fresh));
              } catch {}
              onUpdate(fresh, 'cloud');
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Supabase realtime checklist error:', e);
    }
  }

  const pollInterval = setInterval(() => {
    if (isSubscribed) syncSupabase();
  }, 15000);

  // Firestore mirror / fallback
  let firestoreUnsub: (() => void) | null = null;
  try {
    const checklistCol = collection(db, 'checklist');
    firestoreUnsub = onSnapshot(
      checklistCol,
      (snapshot) => {
        if (!snapshot.empty && isSubscribed) {
          const itemsMap = new Map<string, ChecklistDoc>();
          snapshot.forEach((snap) => {
            const d = snap.data();
            const titleEs = d.title_es || d.title || '';
            const titleFr = d.title_fr || (titleEs ? translateChecklistTitle(titleEs, 'fr') : '');

            itemsMap.set(snap.id, {
              id: snap.id,
              title: d.title || '',
              title_es: titleEs,
              title_fr: titleFr,
              completed: Boolean(d.completed),
              category: d.category || undefined,
              targetCouple: (d.targetCouple as ChecklistCouple) || 'general',
              updatedAt: d.updatedAt,
            });
          });

          const items = Array.from(itemsMap.values());
          onUpdate(items, 'cloud');
        }
      },
      (error) => {
        console.warn('Firestore checklist notice:', error);
      }
    );
  } catch {}

  return () => {
    isSubscribed = false;
    clearInterval(pollInterval);
    if (supabaseChannel) {
      try {
        supabaseChannel.unsubscribe();
      } catch {}
    }
    if (firestoreUnsub) {
      firestoreUnsub();
    }
  };
}

export async function toggleChecklistItemInCloud(id: string, completed: boolean): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('checklist_items').update({
        completed,
        updated_at: new Date().toISOString(),
      }).eq('id', id);
    } catch (e) {
      console.warn('Supabase toggle checklist error:', e);
    }
  }

  sendToPostgres(`/api/db/checklist/${id}`, 'PATCH', { completed }).catch(() => {});

  try {
    const local = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (local) {
      const list: ChecklistDoc[] = JSON.parse(local);
      const updated = list.map((item) => (item.id === id ? { ...item, completed } : item));
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch {}

  try {
    await updateDoc(doc(db, 'checklist', id), {
      completed,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Firestore checklist toggle notice:', error);
  }
}

export async function addChecklistItemToCloud(
  title: string,
  targetCouple: ChecklistCouple = 'general',
  lang: 'es' | 'fr' = 'es'
): Promise<ChecklistDoc> {
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const prefix = targetCouple === 'ByL' ? 'byl' : targetCouple === 'AyM' ? 'aym' : 'gen';
  const id = `chk-${prefix}-${Date.now()}-${randomSuffix}`;
  const trimmed = title.trim();
  const newItem: ChecklistDoc = {
    id,
    title: trimmed,
    title_es: lang === 'es' ? trimmed : trimmed,
    title_fr: lang === 'fr' ? trimmed : trimmed,
    completed: false,
    targetCouple,
    updatedAt: new Date().toISOString(),
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('checklist_items').insert({
        id,
        title: trimmed,
        title_es: newItem.title_es,
        title_fr: newItem.title_fr,
        completed: false,
        category: 'general',
        target_couple: targetCouple,
        order_index: Date.now() % 100000,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Supabase add checklist error:', e);
    }
  }

  sendToPostgres('/api/db/checklist', 'POST', {
    id,
    title: trimmed,
    title_es: newItem.title_es,
    title_fr: newItem.title_fr,
    completed: false,
    category: 'general',
    targetCouple,
  }).catch(() => {});

  try {
    const local = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    const list: ChecklistDoc[] = local ? JSON.parse(local) : [];
    list.push(newItem);
    localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(list));
  } catch {}

  try {
    await setDoc(doc(db, 'checklist', id), newItem);
  } catch (error) {
    console.warn('Firestore checklist write notice:', error);
  }

  return newItem;
}

export async function deleteChecklistItemFromCloud(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('checklist_items').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete checklist error:', e);
    }
  }

  sendToPostgres(`/api/db/checklist/${id}`, 'DELETE').catch(() => {});

  try {
    const local = localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (local) {
      const list: ChecklistDoc[] = JSON.parse(local);
      localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(list.filter((i) => i.id !== id)));
    }
  } catch {}

  try {
    await deleteDoc(doc(db, 'checklist', id));
  } catch (error) {
    console.warn('Firestore checklist delete notice:', error);
  }
}

/**
 * Provee los 9 apartamentos de la ruta circular fijados directamente en código (sin tabla en base de datos)
 */
export function subscribeToApartments(
  onUpdate: (apartments: UserApartment[], source: 'cloud' | 'local') => void
): () => void {
  let list: UserApartment[] = [...FIXED_APARTMENTS];
  try {
    const local = localStorage.getItem(APARTMENTS_STORAGE_KEY);
    if (local) {
      const parsed: UserApartment[] = JSON.parse(local);
      const hasOldPlaceholders =
        Array.isArray(parsed) &&
        parsed.some(
          (a) =>
            a.id?.includes('-ourense') ||
            a.name?.includes('As Burgas con Garaje') ||
            a.name?.includes('Embarcadero Cíes')
        );
      if (hasOldPlaceholders) {
        list = [...FIXED_APARTMENTS];
        localStorage.setItem(APARTMENTS_STORAGE_KEY, JSON.stringify(list));
      } else if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch {}

  onUpdate(list, 'cloud');
  return () => {};
}

export async function saveApartmentToCloud(apartment: UserApartment): Promise<void> {
  // Los datos quedan fijos en código; guardamos cambios en localStorage para personalizaciones
  try {
    const local = localStorage.getItem(APARTMENTS_STORAGE_KEY);
    let list: UserApartment[] = local ? JSON.parse(local) : [...FIXED_APARTMENTS];
    list = list.filter((a) => a.id !== apartment.id);
    list.push(apartment);
    list.sort((a, b) => a.dayNumber - b.dayNumber);
    localStorage.setItem(APARTMENTS_STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export async function deleteApartmentFromCloud(id: string): Promise<void> {
  try {
    const local = localStorage.getItem(APARTMENTS_STORAGE_KEY);
    if (local) {
      const list: UserApartment[] = JSON.parse(local);
      localStorage.setItem(APARTMENTS_STORAGE_KEY, JSON.stringify(list.filter((a) => a.id !== id)));
    }
  } catch {}
}

const DAY_NOTES_STORAGE_KEY = 'galicia_trip_day_notes_v1';

export function subscribeToDayNotes(
  onUpdate: (notes: Record<number, string>, source: 'cloud' | 'local') => void,
  lang: 'es' | 'fr' = 'es'
): () => void {
  let cached: Record<number, string> = {};
  try {
    const local = localStorage.getItem(DAY_NOTES_STORAGE_KEY);
    if (local) {
      cached = JSON.parse(local);
    }
  } catch {
    // ignore
  }
  onUpdate(cached, 'local');

  const notesCol = collection(db, 'day_notes');
  const unsubscribe = onSnapshot(
    notesCol,
    (snapshot) => {
      const notesMap: Record<number, string> = {};
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.dayNumber) {
          const rawNotes = d.notes || d.notes_es || '';
          let noteText = '';
          if (lang === 'fr') {
            noteText = d.notes_fr || (rawNotes ? translateDayNote(rawNotes, 'fr') : '');
          } else {
            noteText = d.notes_es || rawNotes;
          }
          notesMap[Number(d.dayNumber)] = noteText;

          // Auto-persist French notes to Firestore DB document if missing
          if (!d.notes_fr && rawNotes) {
            const autoFr = translateDayNote(rawNotes, 'fr');
            updateDoc(doc(db, 'day_notes', docSnap.id), {
              notes_es: d.notes_es || rawNotes,
              notes_fr: autoFr,
            }).catch(() => {});
          }
        }
      });
      try {
        localStorage.setItem(DAY_NOTES_STORAGE_KEY, JSON.stringify(notesMap));
      } catch {
        // ignore
      }
      onUpdate(notesMap, 'cloud');
    },
    (error) => {
      console.warn('Firestore day_notes error:', error);
      try {
        handleFirestoreError(error, OperationType.LIST, 'day_notes');
      } catch (err) {
        console.warn('Caught day_notes error, using local:', err);
      }
    }
  );

  return unsubscribe;
}

export async function saveDayNoteToCloud(dayNumber: number, notes: string, lang: 'es' | 'fr' = 'es'): Promise<void> {
  const docId = `day-${dayNumber}`;
  const path = `day_notes/${docId}`;
  try {
    const updateData: any = {
      id: docId,
      dayNumber,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };
    if (lang === 'fr') {
      updateData.notes_fr = notes.trim();
    } else {
      updateData.notes_es = notes.trim();
    }
    await setDoc(doc(db, 'day_notes', docId), updateData, { merge: true });
    try {
      const local = localStorage.getItem(DAY_NOTES_STORAGE_KEY);
      const map: Record<number, string> = local ? JSON.parse(local) : {};
      map[dayNumber] = notes.trim();
      localStorage.setItem(DAY_NOTES_STORAGE_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

