export type POICategory = 'tourist' | 'gastro' | 'lodging' | 'scenic' | 'start';

export interface PointOfInterest {
  id: string;
  name: string;
  category: POICategory;
  coords: { lat: number; lng: number };
  description: string;
  address: string;
  rating: number;
  reviewsCount: number;
  priceRange?: '€' | '€€' | '€€€';
  tags: string[];
  image?: string;
  timeEstimate?: string;
  stayDuration?: string; // Estimated stay duration (e.g., "1h 30m", "45 min")
  bestTimeToVisit?: string;
  tips?: string;
  dishRecommendations?: string[];
  googleMapsUrl?: string;
  dayNumber: number;
}

export interface AccommodationSpot {
  id: string;
  name: string;
  city: string;
  coords: { lat: number; lng: number };
  address: string;
  pricePerNightFor4: number;
  pricePerPerson: number;
  rating: number;
  reviewsCount: number;
  capacityPax: number;
  bedrooms: number;
  bedsDescription: string;
  distanceToCenter: string;
  publicTransport: string;
  amenities: string[];
  bookingHighlight: string;
  nearbyFood: string;
  dayNumber: number;
  image?: string;
  checkInTime?: string;
  checkOutTime?: string;
  stayDuration?: string;
  freeCancellation?: boolean;
  cancellationPolicy?: string;
  parking?: string;
  bathrooms?: number;
  notes?: string;
  isDefined?: boolean;
}

export interface UserApartment {
  id: string;
  dayNumber: number;
  nightDate: string;
  city: string;
  name: string;
  name_es?: string;
  name_fr?: string;
  address: string;
  price: number;
  checkInTime?: string; // Hora de check-in (ej. "15:00")
  checkOutTime?: string; // Hora de check-out (ej. "11:00")
  freeCancellation: boolean;
  cancellationPolicy?: string;
  cancellationPolicy_es?: string;
  cancellationPolicy_fr?: string;
  parking: string;
  parking_es?: string;
  parking_fr?: string;
  distanceToCenter: string;
  distanceToCenter_es?: string;
  distanceToCenter_fr?: string;
  bathrooms: number;
  notes: string;
  notes_es?: string;
  notes_fr?: string;
  isSelected?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimelineItem {
  time: string;
  title: string;
  description: string;
  category: 'travel' | 'activity' | 'food' | 'rest';
  locationName?: string;
  duration?: string; // Duration of stay or driving
  distanceFromPrevKm?: number; // Distance from previous stop
  driveFromPrevTime?: string; // Driving time from previous stop
}

export interface StopLeg {
  from: string;
  to: string;
  distanceKm: number;
  driveTime: string;
  routeRoad: string;
  notes?: string;
}

export interface RouteDay {
  id: string;
  dayNumber: number;
  dateFormatted: string; // e.g. "Martes, 10/11/2026"
  shortDate: string; // e.g. "Mar 10/11"
  title: string;
  subtitle: string;
  origin: string;
  destination: string;
  distanceKm: number;
  driveTimeFormatted: string;
  summary: string;
  highlights: string[];
  legs: StopLeg[]; // Exact leg-by-leg distances and driving times
  touristSpots: PointOfInterest[];
  gastroSpots: PointOfInterest[];
  accommodation: AccommodationSpot;
  schedule: TimelineItem[];
  localTips: string[];
  routePath: { lat: number; lng: number }[];
  accentColor: string;
}

export type ExpenseTarget = 'both' | 'ByL' | 'AyM';

export interface CustomExpense {
  id: string;
  title: string;
  title_es?: string;
  title_fr?: string;
  category: 'rental' | 'excursion' | 'tickets' | 'gifts' | 'other';
  amount: number;
  isPerPerson: boolean; // if true, group total = amount * totalPax (or * 2 if single couple)
  assignedTo?: ExpenseTarget; // 'both' (50/50), 'ByL' (100% ByL), 'AyM' (100% AyM)
  enabled: boolean;
  notes?: string;
  notes_es?: string;
  notes_fr?: string;
}

export interface TripOverview {
  title: string;
  startPoint: string;
  startDateFormatted: string; // "Martes, 10 de Noviembre de 2026"
  endDateFormatted: string; // "Jueves, 19 de Noviembre de 2026"
  totalDays: number;
  totalPax: number;
  totalKmEstimated: number;
  totalDrivingHours: number;
  totalLodgingBudgetMax: number;
  lodgingBudgetPerPerson: number;
  fuelEstimatedCost: number;
  tollsEstimatedCost: number;
  summary: string;
}

export interface DayNote {
  id: string; // e.g. "day-1"
  dayNumber: number;
  notes: string;
  notes_es?: string;
  notes_fr?: string;
  updatedAt?: string;
}

