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
import {
  translateChecklistTitle,
  translateExpenseTitle,
  translateExpenseNotes,
  translateApartmentField,
  translateDayNote,
  hasSpanishParking,
  hasSpanishNotes,
} from '../i18n/translations';

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
 * Sync custom expenses with real-time updates and fallback to localStorage
 */
export function subscribeToExpenses(
  onUpdate: (expenses: CustomExpense[], source: 'cloud' | 'local') => void
): () => void {
  // First, provide local cached version immediately (defaults to empty)
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

  const expensesCol = collection(db, 'expenses');

  const unsubscribe = onSnapshot(
    expensesCol,
    (snapshot) => {
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

        // Auto-persist French translations in Firestore DB document if missing
        if ((!data.title_fr && titleFr) || (!data.notes_fr && notesFr)) {
          updateDoc(doc(db, 'expenses', docSnap.id), {
            title_es: titleEs,
            title_fr: titleFr,
            notes_es: notesEs || '',
            notes_fr: notesFr || '',
            assignedTo: data.assignedTo || 'both',
          }).catch(() => {});
        }
      });

      // Update local storage cache
      try {
        localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(cloudExpenses));
      } catch {
        // ignore
      }

      onUpdate(cloudExpenses, 'cloud');
    },
    (error) => {
      console.warn('Firestore onSnapshot expenses error:', error);
      try {
        handleFirestoreError(error, OperationType.LIST, 'expenses');
      } catch (err) {
        console.warn('Caught and fallback to local cache:', err);
      }
    }
  );

  return unsubscribe;
}

export async function saveExpenseToCloud(expense: CustomExpense): Promise<void> {
  const path = `expenses/${expense.id}`;
  // Sync to PostgreSQL (Hostinger VPS / Coolify)
  sendToPostgres('/api/db/expenses', 'POST', {
    id: expense.id,
    title: expense.title,
    amount: expense.amount,
    payer: (expense as any).payer || (expense.assignedTo === 'ByL' ? 'ByL' : (expense.assignedTo === 'AyM' ? 'AyM' : 'ByL')),
    targetCouple: (expense as any).targetCouple || (expense.assignedTo === 'ByL' ? 'ByL' : (expense.assignedTo === 'AyM' ? 'AyM' : 'shared')),
    category: expense.category || 'general',
    notes: expense.notes || '',
  }).catch(() => {});

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
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function toggleExpenseInCloud(id: string, enabled: boolean): Promise<void> {
  const path = `expenses/${id}`;
  try {
    await updateDoc(doc(db, 'expenses', id), {
      enabled,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteExpenseFromCloud(id: string): Promise<void> {
  const path = `expenses/${id}`;
  sendToPostgres(`/api/db/expenses/${id}`, 'DELETE').catch(() => {});
  try {
    await deleteDoc(doc(db, 'expenses', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearAllExpensesFromCloud(): Promise<void> {
  const path = 'expenses';
  try {
    const snap = await getDocs(collection(db, 'expenses'));
    const deletes = snap.docs.map((docSnap) => deleteDoc(doc(db, 'expenses', docSnap.id)));
    await Promise.all(deletes);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
  try {
    localStorage.removeItem(EXPENSES_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Sync Trip Calculation Settings (fuel, consumption, food budget)
 */
let currentCachedSettings: TripSettings = DEFAULT_TRIP_SETTINGS;
try {
  const local = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (local) {
    currentCachedSettings = { ...DEFAULT_TRIP_SETTINGS, ...JSON.parse(local) };
  }
} catch {
  // ignore
}

export function subscribeToSettings(
  onUpdate: (settings: TripSettings, source: 'cloud' | 'local') => void
): () => void {
  onUpdate(currentCachedSettings, 'local');

  const settingsDocRef = doc(db, 'trip_settings', 'default');

  const unsubscribe = onSnapshot(
    settingsDocRef,
    async (docSnap) => {
      if (!docSnap.exists()) {
        try {
          await setDoc(settingsDocRef, {
            ...currentCachedSettings,
            id: 'default',
            updatedAt: new Date().toISOString(),
          });
        } catch {
          // ignore
        }
        return;
      }

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
      } catch {
        // ignore
      }

      onUpdate(settings, 'cloud');
    },
    (error) => {
      console.warn('Firestore onSnapshot settings error:', error);
      try {
        handleFirestoreError(error, OperationType.GET, 'trip_settings/default');
      } catch (err) {
        console.warn('Caught and fallback to local settings:', err);
      }
    }
  );

  return unsubscribe;
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
  } catch {
    // ignore
  }

  const path = 'trip_settings/default';
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
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Sync Checklist
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
  } catch {
    // ignore
  }
  onUpdate(cached, 'local');

  const checklistCol = collection(db, 'checklist');

  const unsubscribe = onSnapshot(
    checklistCol,
    async (snapshot) => {
      if (snapshot.empty) {
        try {
          for (const item of cached) {
            await setDoc(doc(db, 'checklist', item.id), {
              ...item,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch {
          // ignore
        }
        return;
      }

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

        // Persist French title directly to Firestore DB document if missing
        if (!d.title_fr && titleFr) {
          updateDoc(doc(db, 'checklist', snap.id), {
            title_es: titleEs,
            title_fr: titleFr,
            targetCouple: d.targetCouple || 'general',
          }).catch(() => {});
        }
      });

      const items = Array.from(itemsMap.values());
      try {
        localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // ignore
      }

      onUpdate(items, 'cloud');
    },
    (error) => {
      console.warn('Firestore checklist error:', error);
      try {
        handleFirestoreError(error, OperationType.LIST, 'checklist');
      } catch (err) {
        console.warn('Caught and fallback to local checklist:', err);
      }
    }
  );

  return unsubscribe;
}

export async function toggleChecklistItemInCloud(id: string, completed: boolean): Promise<void> {
  const path = `checklist/${id}`;
  try {
    await updateDoc(doc(db, 'checklist', id), {
      completed,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
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
  const path = `checklist/${id}`;
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
  try {
    await setDoc(doc(db, 'checklist', id), newItem);
    return newItem;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return newItem;
  }
}

export async function deleteChecklistItemFromCloud(id: string): Promise<void> {
  const path = `checklist/${id}`;
  try {
    await deleteDoc(doc(db, 'checklist', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

const APARTMENTS_STORAGE_KEY = 'galicia_trip_user_apartments_v1';

/**
 * Subscribe to user-defined apartments with real-time Firestore sync & localStorage fallback
 */
export function subscribeToApartments(
  onUpdate: (apartments: UserApartment[], source: 'cloud' | 'local') => void
): () => void {
  let cached: UserApartment[] = [];
  try {
    const local = localStorage.getItem(APARTMENTS_STORAGE_KEY);
    if (local) {
      cached = JSON.parse(local);
    }
  } catch {
    // ignore
  }
  onUpdate(cached, 'local');

  const apartmentsCol = collection(db, 'apartments');

  const unsubscribe = onSnapshot(
    apartmentsCol,
    (snapshot) => {
      const items: UserApartment[] = [];
      snapshot.forEach((snap) => {
        const d = snap.data();
        const nameEs = d.name_es || d.name || '';
        const nameFr = d.name_fr || d.name || '';
        const parkingEs = d.parking_es || d.parking || '';
        const parkingFr = (d.parking_fr && !hasSpanishParking(d.parking_fr))
          ? d.parking_fr
          : (d.parking ? translateApartmentField(d.parking, 'fr') : (d.parking_fr ? translateApartmentField(d.parking_fr, 'fr') : ''));
        const distanceEs = d.distanceToCenter_es || d.distanceToCenter || '';
        const distanceFr = d.distanceToCenter_fr || (d.distanceToCenter ? translateApartmentField(d.distanceToCenter, 'fr') : '');
        const policyEs = d.cancellationPolicy_es || d.cancellationPolicy || undefined;
        const policyFr = d.cancellationPolicy_fr || (d.cancellationPolicy ? translateApartmentField(d.cancellationPolicy, 'fr') : undefined);
        const notesEs = d.notes_es || d.notes || '';
        const notesFr = (d.notes_fr && !hasSpanishNotes(d.notes_fr))
          ? d.notes_fr
          : (d.notes ? translateApartmentField(d.notes, 'fr') : (d.notes_fr ? translateApartmentField(d.notes_fr, 'fr') : ''));

        items.push({
          id: snap.id,
          dayNumber: Number(d.dayNumber) || 1,
          nightDate: d.nightDate || '',
          city: d.city || '',
          name: d.name || '',
          name_es: nameEs,
          name_fr: nameFr,
          address: d.address || '',
          price: Number(d.price) || 0,
          checkInTime: d.checkInTime || '',
          checkOutTime: d.checkOutTime || '',
          freeCancellation: Boolean(d.freeCancellation),
          cancellationPolicy: d.cancellationPolicy || undefined,
          cancellationPolicy_es: policyEs,
          cancellationPolicy_fr: policyFr,
          parking: d.parking || '',
          parking_es: parkingEs,
          parking_fr: parkingFr,
          distanceToCenter: d.distanceToCenter || '',
          distanceToCenter_es: distanceEs,
          distanceToCenter_fr: distanceFr,
          bathrooms: Number(d.bathrooms) || 1,
          notes: d.notes || '',
          notes_es: notesEs,
          notes_fr: notesFr,
          isSelected: d.isSelected !== undefined ? Boolean(d.isSelected) : true,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        });

        // Persist French translations directly to Firestore DB document if missing or updated
        if ((d.parking_fr !== parkingFr && parkingFr) || (d.notes_fr !== notesFr && notesFr) || (!d.distanceToCenter_fr && distanceFr) || (!d.cancellationPolicy_fr && policyFr)) {
          updateDoc(doc(db, 'apartments', snap.id), {
            parking_es: parkingEs,
            parking_fr: parkingFr,
            notes_es: notesEs,
            notes_fr: notesFr,
            distanceToCenter_es: distanceEs,
            distanceToCenter_fr: distanceFr,
            ...(policyFr ? { cancellationPolicy_es: policyEs, cancellationPolicy_fr: policyFr } : {}),
          }).catch(() => {});
        }
      });

      // Sort by dayNumber ascending
      items.sort((a, b) => a.dayNumber - b.dayNumber);

      try {
        localStorage.setItem(APARTMENTS_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // ignore
      }

      onUpdate(items, 'cloud');
    },
    (error) => {
      console.warn('Firestore apartments error:', error);
      try {
        handleFirestoreError(error, OperationType.LIST, 'apartments');
      } catch (err) {
        console.warn('Caught and fallback to local apartments cache:', err);
      }
    }
  );

  return unsubscribe;
}

export async function saveApartmentToCloud(apartment: UserApartment): Promise<void> {
  const path = `apartments/${apartment.id}`;
  // Sync to PostgreSQL (Hostinger VPS / Coolify)
  sendToPostgres('/api/db/apartments', 'POST', {
    ...apartment,
    price: Number(apartment.price) || 0,
  }).catch(() => {});

  try {
    const cleanData = {
      id: apartment.id,
      dayNumber: apartment.dayNumber,
      nightDate: apartment.nightDate || '',
      city: apartment.city || '',
      name: apartment.name,
      name_es: apartment.name_es || apartment.name,
      name_fr: apartment.name_fr || apartment.name,
      address: apartment.address,
      price: Number(apartment.price) || 0,
      checkInTime: apartment.checkInTime || '',
      checkOutTime: apartment.checkOutTime || '',
      freeCancellation: Boolean(apartment.freeCancellation),
      cancellationPolicy: apartment.cancellationPolicy || '',
      cancellationPolicy_es: apartment.cancellationPolicy_es || apartment.cancellationPolicy || '',
      cancellationPolicy_fr: apartment.cancellationPolicy_fr || apartment.cancellationPolicy || '',
      parking: apartment.parking,
      parking_es: apartment.parking_es || apartment.parking,
      parking_fr: (apartment.parking_fr && !hasSpanishParking(apartment.parking_fr))
        ? apartment.parking_fr
        : translateApartmentField(apartment.parking || apartment.parking_fr || '', 'fr'),
      distanceToCenter: apartment.distanceToCenter,
      distanceToCenter_es: apartment.distanceToCenter_es || apartment.distanceToCenter,
      distanceToCenter_fr: apartment.distanceToCenter_fr || translateApartmentField(apartment.distanceToCenter || '', 'fr'),
      bathrooms: Number(apartment.bathrooms) || 1,
      notes: apartment.notes || '',
      notes_es: apartment.notes_es || apartment.notes || '',
      notes_fr: (apartment.notes_fr && !hasSpanishNotes(apartment.notes_fr))
        ? apartment.notes_fr
        : translateApartmentField(apartment.notes || apartment.notes_fr || '', 'fr'),
      isSelected: apartment.isSelected !== undefined ? Boolean(apartment.isSelected) : true,
      updatedAt: new Date().toISOString(),
      createdAt: apartment.createdAt || new Date().toISOString(),
    };
    await setDoc(doc(db, 'apartments', apartment.id), cleanData);

    // Update local cache as well
    try {
      const local = localStorage.getItem(APARTMENTS_STORAGE_KEY);
      let list: UserApartment[] = local ? JSON.parse(local) : [];
      list = list.filter((a) => a.id !== apartment.id);
      list.push({ ...apartment, ...cleanData });
      list.sort((a, b) => a.dayNumber - b.dayNumber);
      localStorage.setItem(APARTMENTS_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteApartmentFromCloud(id: string): Promise<void> {
  const path = `apartments/${id}`;
  const dayNum = id.replace(/[^0-9]/g, '');
  if (dayNum) {
    sendToPostgres(`/api/db/apartments/${dayNum}`, 'DELETE').catch(() => {});
  }
  try {
    await deleteDoc(doc(db, 'apartments', id));

    // Update local cache
    try {
      const local = localStorage.getItem(APARTMENTS_STORAGE_KEY);
      if (local) {
        const list: UserApartment[] = JSON.parse(local);
        const filtered = list.filter((a) => a.id !== id);
        localStorage.setItem(APARTMENTS_STORAGE_KEY, JSON.stringify(filtered));
      }
    } catch {
      // ignore
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
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

