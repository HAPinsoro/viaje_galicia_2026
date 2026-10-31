import { StopLeg } from '../types/trip';
import { Language } from './translations';

/**
 * Complete, accurate French translations for every road leg across all 10 stages
 */
export const LEG_FR_TRANSLATIONS: Record<number, Record<number, { from?: string; to?: string; routeRoad?: string; notes?: string }>> = {
  // --- Jour 1 ---
  1: {
    0: {
      from: 'Pinsoro (Saragosse)',
      to: 'Astorga (León)',
      routeRoad: 'A-68 / A-12 / A-231 (Autoroute du Chemin)',
      notes: 'Tronçon rapide et plat sans péages traversant La Rioja, Burgos et León.',
    },
    1: {
      from: 'Astorga',
      to: 'Belvédère Balcones de Madrid (Parada de Sil)',
      routeRoad: 'A-6 / N-120 / OU-0508',
      notes: 'Entrée par El Bierzo et Monforte vers le cœur spectaculaire de la Ribeira Sacra.',
    },
    2: {
      from: 'Belvédère Balcones de Madrid',
      to: 'Ourense (Centre Historique)',
      routeRoad: 'OU-536',
      notes: 'Descente directe vers Ourense et accès aisé au Parking Alameda.',
    },
  },

  // --- Jour 2 ---
  2: {
    0: {
      from: 'Ourense (Centre)',
      to: 'Gare Maritime de Vigo (Parking Nautique)',
      routeRoad: 'A-52 (Autoroute des Rías Baixas)',
      notes: 'Accès direct sans péage au Parking de la Gare Maritime situé en face de l\'embarcadère.',
    },
    1: {
      from: 'Vigo (Quai des Transatlantiques)',
      to: 'Îles Cíes (Débarcadère de Rodas)',
      routeRoad: 'Traversée maritime en catamaran Ría de Vigo',
      notes: 'Navigation longeant les parcs à moules (bateas) et la presqu\'île de Morrazo vers le Parc National.',
    },
    2: {
      from: 'Vigo (Gare Maritime)',
      to: 'Baiona (Centre Historique)',
      routeRoad: 'PO-552 (Route côtière panoramique)',
      notes: 'Trajet côtier panoramique vers la baie fortifiée de Baiona et le château de Monterreal.',
    },
  },

  // --- Jour 3 ---
  3: {
    0: {
      from: 'Baiona (Forteresse)',
      to: 'Combarro (Ría de Pontevedra)',
      routeRoad: 'AP-9 / PO-308',
      notes: 'Passage par le spectaculaire Pont de Rande et la côte nord de la Ría de Pontevedra.',
    },
    1: {
      from: 'Combarro',
      to: 'O Grove / Île de La Toja',
      routeRoad: 'PO-308 / VG-4.1',
      notes: 'Route côtière panoramique vers la presqu\'île haut lieu des fruits de mer.',
    },
    2: {
      from: 'O Grove',
      to: 'Pontevedra (Zone Monumentale)',
      routeRoad: 'VG-4.1 / PO-308',
      notes: 'Retour direct vers le centre historique piétonnier de Pontevedra avec accès au Parking Central.',
    },
  },

  // --- Jour 4 ---
  4: {
    0: {
      from: 'Pontevedra (Zone Monumentale)',
      to: 'Cambados (Place de Fefiñáns)',
      routeRoad: 'PO-531 / PO-300',
      notes: 'Route départementale traversant les prestigieux vignobles d\'Albariño de la vallée du Salnés.',
    },
    1: {
      from: 'Cambados',
      to: 'Padrón (Herbón)',
      routeRoad: 'N-550 / PO-300',
      notes: 'Trajet longeant la Ría d\'Arousa et les berges verdoyantes du fleuve Ulla.',
    },
    2: {
      from: 'Padrón',
      to: 'Saint-Jacques-de-Compostelle (Parking San Clemente)',
      routeRoad: 'N-550 / SC-20',
      notes: 'Entrée sud directe vers le centre historique avec accès réservé au Parking San Clemente.',
    },
  },

  // --- Jour 5 ---
  5: {
    0: {
      from: 'Saint-Jacques-de-Compostelle (Départ)',
      to: 'Cascade d\'Ézaro (Dumbría)',
      routeRoad: 'AG-56 / AC-400 / AC-550',
      notes: 'Autoroute vers Brión puis route panoramique dominant la ría de Corcubión et le Monte Pindo.',
    },
    1: {
      from: 'Cascade d\'Ézaro',
      to: 'Cap Finisterre (Phare)',
      routeRoad: 'AC-445',
      notes: 'Passage par Cee et Corcubión vers la pointe sauvage de la presqu\'île de Fisterra.',
    },
    2: {
      from: 'Cap Finisterre',
      to: 'Fisterra (Hébergement Plage de Langosteira)',
      routeRoad: 'AC-445',
      notes: 'Court trajet vers le logement avec garage privé souterrain inclus dans l\'immeuble.',
    },
  },

  // --- Jour 6 ---
  6: {
    0: {
      from: 'Fisterra (Plage Langosteira)',
      to: 'Cap Touriñán (Phare)',
      routeRoad: 'DP-2301 / DP-2303',
      notes: 'Route champêtre panoramique traversant San Martiño de Duio et Lires vers le point le plus occidental.',
    },
    1: {
      from: 'Cap Touriñán',
      to: 'Muxía (Centre Urbain)',
      routeRoad: 'DP-2303 / AC-440',
      notes: 'Descente directe vers la cité de marins de Muxía et le sanctuaire face à l\'océan.',
    },
  },

  // --- Jour 7 ---
  7: {
    0: {
      from: 'Muxía',
      to: 'Cap Vilán (Camariñas)',
      routeRoad: 'AC-440 / DP-1601',
      notes: 'Longeant la ría abritée de Camariñas vers le grand promontoire granitique du Cap Vilán.',
    },
    1: {
      from: 'Cap Vilán',
      to: 'Betanzos (Centre Historique)',
      routeRoad: 'AG-55 / A-6',
      notes: 'Autoroute rapide et fluide vers la cité médiévale de Betanzos.',
    },
    2: {
      from: 'Betanzos',
      to: 'La Corogne (Tour d\'Hercule / Cantones)',
      routeRoad: 'N-VI / AP-9F',
      notes: 'Excursion d\'après-midi vers La Corogne par autoroute et voie rapide.',
    },
    3: {
      from: 'La Corogne',
      to: 'Betanzos (Retour pour la nuit)',
      routeRoad: 'N-VI',
      notes: 'Retour à Betanzos pour le dîner de la célèbre tortilla et la nuitée.',
    },
  },

  // --- Jour 8 ---
  8: {
    0: {
      from: 'Betanzos',
      to: 'Cedeira (Port)',
      routeRoad: 'AP-9F / CG-1.3 / AC-566',
      notes: 'Traversée du golfe Ártabro vers Ferrolterra et le port de Cedeira.',
    },
    1: {
      from: 'Cedeira',
      to: 'San Andrés de Teixido',
      routeRoad: 'DP-2204',
      notes: 'Route de montagne traversant la Sierra de Capelada avec panoramas vertigineux sur les falaises.',
    },
    2: {
      from: 'San Andrés de Teixido',
      to: 'Ortigueira (Ría et Port)',
      routeRoad: 'DP-2205 / AC-862',
      notes: 'Descente vers la Ría d\'Ortigueira en longeant marécages et bancs de sable sauvages.',
    },
    3: {
      from: 'Ortigueira',
      to: 'Viveiro (Centre Historique)',
      routeRoad: 'AC-862 / LU-862',
      notes: 'Tronçon littoral traversant O Vicedo et le grand pont sur la Ría de Viveiro.',
    },
  },

  // --- Jour 9 ---
  9: {
    0: {
      from: 'Viveiro',
      to: 'O Fuciño do Porco (O Vicedo)',
      routeRoad: 'LU-862',
      notes: 'Route côtière cantabrique de A Mariña Lucense.',
    },
    1: {
      from: 'O Fuciño do Porco',
      to: 'Plage des Cathédrales (Ribadeo)',
      routeRoad: 'N-642 / A-8',
      notes: 'Autoroute du Cantabrique en direction de Ribadeo.',
    },
    2: {
      from: 'Plage des Cathédrales',
      to: 'Rinlo (Port)',
      routeRoad: 'DP-5201',
      notes: 'Route littorale locale menant aux célèbres parcs à crustacés de Rinlo.',
    },
    3: {
      from: 'Rinlo',
      to: 'Lugo (Parking San Fernando)',
      routeRoad: 'A-8 / N-640',
      notes: 'Itinéraire fluide et direct vers la capitale historique et sa muraille romaine.',
    },
  },

  // --- Jour 10 ---
  10: {
    0: {
      from: 'Lugo (Muraille Romaine)',
      to: 'Astorga (Palais de Gaudí)',
      routeRoad: 'A-6 (Autoroute du Nord-Ouest)',
      notes: 'Traversée d\'O Cebreiro et de la région du Bierzo vers la comarque maragate d\'Astorga.',
    },
    1: {
      from: 'Astorga',
      to: 'Burgos (Aire de Service)',
      routeRoad: 'A-231 (Autoroute du Chemin de Saint-Jacques)',
      notes: 'Autoroute plane et rapide traversant le plateau castillan via León et Palencia.',
    },
    2: {
      from: 'Burgos',
      to: 'Pinsoro (Saragosse)',
      routeRoad: 'A-12 / A-68',
      notes: 'Passage par Logroño et Tudela jusqu\'au retour triomphal à Pinsoro.',
    },
  },
};

/**
 * Generic phrase translator for any dynamic or user-entered leg notes
 */
export function translateGenericLegNotes(notes: string, lang: Language): string {
  if (lang === 'es' || !notes) return notes;

  return notes
    .replace(/Tramo rápido y llano sin peajes cruzando/gi, 'Tronçon rapide et plat sans péages traversant')
    .replace(/Tramo rápido y llano/gi, 'Tronçon rapide et plat')
    .replace(/sin peajes/gi, 'sans péages')
    .replace(/Entrada por el Bierzo y Monforte hacia el corazón de la Ribeira Sacra\./gi, 'Entrée par El Bierzo et Monforte vers le cœur de la Ribeira Sacra.')
    .replace(/Descenso directo hacia Ourense y acceso al Parking Alameda\./gi, 'Descente directe vers Ourense et accès au Parking Alameda.')
    .replace(/Acceso directo sin peaje al Parking Estación Marítima justo frente al muelle de barcos\./gi, 'Accès direct sans péage au Parking de la Gare Maritime juste devant l\'embarcadère.')
    .replace(/Navegación bordeando las bateas y la península de Morrazo hacia el Parque Nacional\./gi, 'Navigation longeant les parcs à moules et la presqu\'île de Morrazo vers le Parc National.')
    .replace(/Paseo costero panorámico hacia la bahía de Baiona y la fortaleza\./gi, 'Trajet côtier panoramique vers la baie de Baiona et la forteresse.')
    .replace(/Paso por el Puente de Rande y costa norte de la Ría de Pontevedra\./gi, 'Passage par le Pont de Rande et la côte nord de la Ría de Pontevedra.')
    .replace(/Carretera panorámica hacia la península meca del marisco\./gi, 'Route panoramique vers la péninsule haut lieu des fruits de mer.')
    .replace(/Regreso directo al centro histórico de Pontevedra con acceso al Parking Central\./gi, 'Retour direct vers le centre historique de Pontevedra avec accès au Parking Central.')
    .replace(/Carretera comarcal cruzando los viñedos del valle del Salnés\./gi, 'Route départementale traversant les vignobles de la vallée du Salnés.')
    .replace(/Trayecto junto a la Ría de Arousa y valle del río Ulla\./gi, 'Trajet longeant la Ría d\'Arousa et la vallée du fleuve Ulla.')
    .replace(/Entrada sur directa al casco histórico con acceso a Parking San Clemente\./gi, 'Entrée sud directe vers le centre historique avec accès au Parking San Clemente.')
    .replace(/Autovía hacia Brión y carretera panorámica de la ría de Corcubión y Monte Pindo\./gi, 'Autoroute vers Brión et route panoramique de la ría de Corcubión et du Monte Pindo.')
    .replace(/Paso por Cee y Corcubión hacia la punta de la península de Fisterra\./gi, 'Passage par Cee et Corcubión vers la pointe de la presqu\'île de Fisterra.')
    .replace(/Trayecto corto hacia el alojamiento con garaje privado en el propio edificio\./gi, 'Court trajet vers le logement avec garage privé dans l\'immeuble.')
    .replace(/Carretera paisajística rural pasando por San Martiño de Duio y Lires\./gi, 'Route rurale panoramique passant par San Martiño de Duio et Lires.')
    .replace(/Descenso directo hacia la villa marinera de Muxía\./gi, 'Descente directe vers la cité de marins de Muxía.')
    .replace(/Bordeando la ría de Camariñas hacia el peñón de Cabo Vilán\./gi, 'Longeant la ría de Camariñas vers le grand promontoire du Cap Vilán.')
    .replace(/Autovía rápida y directa hacia la histórica Betanzos\./gi, 'Autoroute rapide et directe vers la cité historique de Betanzos.')
    .replace(/Excursión vespertina a A Coruña por autovía\/nacional\./gi, 'Excursion d\'après-midi vers La Corogne par autoroute/nationale.')
    .replace(/Regreso a Betanzos para la cena y noche\./gi, 'Retour à Betanzos pour le dîner et la nuitée.')
    .replace(/Paso por el golfo Ártabro hacia Ferrolterra y Cedeira\./gi, 'Traversée du golfe Ártabro vers Ferrolterra et Cedeira.')
    .replace(/Carretera de montaña por la Sierra de Capelada con vistas vertiginosas\./gi, 'Route de montagne traversant la Sierra de Capelada avec vues vertigineuses.')
    .replace(/Descenso hacia la Ría de Ortigueira bordeando marismas y ensenadas\./gi, 'Descente vers la Ría d\'Ortigueira en longeant marais et criques.')
    .replace(/Tramo costero cruzando O Vicedo y el puente sobre la Ría de Viveiro\./gi, 'Tronçon littoral traversant O Vicedo et le pont sur la Ría de Viveiro.')
    .replace(/Costa cantábrica de A Mariña Lucense\./gi, 'Côte cantabrique de A Mariña Lucense.')
    .replace(/Autovía del Cantábrico hacia Ribadeo\./gi, 'Autoroute du Cantabrique vers Ribadeo.')
    .replace(/Carretera costera local hacia la cetárea de Rinlo\./gi, 'Route côtière locale menant aux parcs à crustacés de Rinlo.')
    .replace(/Ruta ágil y directa hacia la capital lucense\./gi, 'Itinéraire fluide et direct vers la capitale de Lugo.')
    .replace(/Paso por O Cebreiro y el Bierzo hacia la comarca maragata\./gi, 'Traversée d\'O Cebreiro et du Bierzo vers la région maragate.')
    .replace(/Autovía llana y rápida cruzando la meseta castellana\./gi, 'Autoroute plane et rapide traversant le plateau castillan.')
    .replace(/Paso por Logroño y Tudela hasta llegar a Pinsoro\./gi, 'Passage par Logroño et Tudela jusqu\'au retour à Pinsoro.')
    .replace(/cruzando/gi, 'traversant')
    .replace(/llegada a/gi, 'arrivée à')
    .replace(/acceso a/gi, 'accès à')
    .replace(/conducción/gi, 'conduite')
    .replace(/casco histórico/gi, 'centre historique')
    .replace(/garaje privado/gi, 'garage privé')
    .replace(/parking/gi, 'parking');
}

/**
 * Returns a fully localized StopLeg
 */
export function getLocalizedLeg(leg: StopLeg, dayNumber: number, legIndex: number, lang: Language): StopLeg {
  if (lang !== 'fr') return leg;

  const translation = LEG_FR_TRANSLATIONS[dayNumber]?.[legIndex];
  if (translation) {
    return {
      ...leg,
      from: translation.from || leg.from,
      to: translation.to || leg.to,
      routeRoad: translation.routeRoad || leg.routeRoad,
      notes: translation.notes || (leg.notes ? translateGenericLegNotes(leg.notes, lang) : undefined),
    };
  }

  return {
    ...leg,
    from: leg.from
      .replace('Pinsoro (Zaragoza)', 'Pinsoro (Saragosse)')
      .replace('A Coruña', 'La Corogne')
      .replace('Santiago de Compostela', 'Saint-Jacques-de-Compostelle')
      .replace('Santiago', 'Saint-Jacques')
      .replace('Casco Histórico', 'Centre Historique'),
    to: leg.to
      .replace('Pinsoro (Zaragoza)', 'Pinsoro (Saragosse)')
      .replace('A Coruña', 'La Corogne')
      .replace('Santiago de Compostela', 'Saint-Jacques-de-Compostelle')
      .replace('Santiago', 'Saint-Jacques')
      .replace('Casco Histórico', 'Centre Historique'),
    notes: leg.notes ? translateGenericLegNotes(leg.notes, lang) : undefined,
  };
}
