import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ROUTE_DAYS, TRIP_OVERVIEW, TARGET_NIGHTS } from '../data/galiciaRouteData';
import { CustomExpense, UserApartment } from '../types/trip';
import { DAY_TRANSLATIONS, translateExpenseTitle, translateApartmentField } from '../i18n/translations';

export interface PDFTripOptions {
  fuelPricePerLiter?: number;
  carConsumption?: number;
  foodDailyBudgetPerPax?: number;
  customExpenses?: CustomExpense[];
  userApartments?: UserApartment[];
  language?: 'es' | 'fr';
}

export function generateTripPDF(options?: PDFTripOptions) {
  const lang = options?.language || 'es';
  const isFr = lang === 'fr';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor: [number, number, number] = [30, 58, 138]; // Deep blue
  const secondaryColor: [number, number, number] = [15, 23, 42]; // Slate 900

  const fuelPrice = options?.fuelPricePerLiter ?? 1.55;
  const consumption = options?.carConsumption ?? 6.2;
  const foodPerPax = options?.foodDailyBudgetPerPax ?? 35;
  const customExpenses = options?.customExpenses?.filter((e) => e.enabled) ?? [];

  let userApts = options?.userApartments;
  if (!userApts) {
    try {
      const stored = localStorage.getItem('galicia_trip_user_apartments_v1');
      if (stored) {
        userApts = JSON.parse(stored);
      }
    } catch {
      // ignore
    }
  }
  userApts = userApts || [];

  const totalKm = TRIP_OVERVIEW.totalKmEstimated;
  const fuelLiters = (totalKm * consumption) / 100;
  const fuelCost = fuelLiters * fuelPrice;
  const tollsCost = TRIP_OVERVIEW.tollsEstimatedCost;
  const lodgingCost = userApts.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const foodCost = foodPerPax * 4 * 10;
  const baseSharedTotal = lodgingCost + fuelCost + tollsCost + foodCost;

  let customSharedTotal = 0;
  let customExclusiveByL = 0;
  let customExclusiveAyM = 0;

  customExpenses.forEach((exp) => {
    const target = exp.assignedTo || 'both';
    if (target === 'both') {
      const cost = exp.isPerPerson ? exp.amount * 4 : exp.amount;
      customSharedTotal += cost;
    } else if (target === 'ByL') {
      const cost = exp.isPerPerson ? exp.amount * 2 : exp.amount;
      customExclusiveByL += cost;
    } else if (target === 'AyM') {
      const cost = exp.isPerPerson ? exp.amount * 2 : exp.amount;
      customExclusiveAyM += cost;
    }
  });

  const sharedHalfPerCouple = (baseSharedTotal + customSharedTotal) / 2;
  const totalByL = sharedHalfPerCouple + customExclusiveByL;
  const totalAyM = sharedHalfPerCouple + customExclusiveAyM;
  const grandTotal = totalByL + totalAyM;

  // Page 1: Header & Trip Overview
  doc.setFillColor(...secondaryColor);
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text(
    isFr
      ? 'EXPEDITION GALICE 10 JOURS (PINSORO - GALICE)'
      : 'EXPEDICION GALICIA 10 DIAS (PINSORO - GALICIA)',
    14,
    15
  );

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(147, 197, 253);
  doc.text(
    isFr
      ? 'Depart: Mardi, 10/11/2026 | Arrivee: Jeudi, 19/11/2026 | 2 Couples: Bruno & Loles (ByL) / Alberto & Mari (AyM) | 2.142 km reels'
      : 'Salida: Martes, 10/11/2026 | Llegada: Jueves, 19/11/2026 | 2 Parejas: Bruno y Loles (ByL) / Alberto y Mari (AyM) | 2.142 km reales',
    14,
    23
  );
  doc.text(
    isFr
      ? '9 Hebergements avec Parking reserve | Calculs Separes Bruno & Loles / Alberto & Mari | Cies: Mercredi 11/11'
      : '9 Alojamientos con Parking garantizado | Calculos Separados Bruno y Loles / Alberto y Mari | Cies: Miercoles 11/11',
    14,
    30
  );

  // Overview Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(
    isFr
      ? '1. Budget Ventile : Totaux et Ventilation par Couple (Bruno & Loles / Alberto & Mari)'
      : '1. Presupuesto Desglosado: Totales y Reparto por Pareja (Bruno y Loles / Alberto y Mari)',
    14,
    46
  );

  const budgetBody: (string | number)[][] = [
    [
      isFr ? 'Hebergement (9 Nuits)' : 'Alojamiento (9 Noches)',
      `${lodgingCost} EUR`,
      `${(lodgingCost / 2).toFixed(1)} EUR`,
      isFr ? '9 Logements entiers avec parking garanti (50/50)' : '9 Aptos. enteros con parking garantizado (50/50)',
    ],
    [
      isFr ? 'Carburant (2.142 km reels)' : 'Combustible (2.142 km reales)',
      `${fuelCost.toFixed(0)} EUR`,
      `${(fuelCost / 2).toFixed(1)} EUR`,
      isFr
        ? `Consommation ${consumption} L/100km (${fuelPrice} EUR/L) (50/50)`
        : `Consumo ${consumption} L/100km (${fuelPrice} EUR/L) (50/50)`,
    ],
    [
      isFr ? 'Peages estimes' : 'Peajes estimados',
      `${tollsCost} EUR`,
      `${(tollsCost / 2).toFixed(1)} EUR`,
      isFr ? 'Autoroutes principales + section AP-9 (50/50)' : 'Autovias principales + tramo AP-9 (50/50)',
    ],
    [
      isFr ? 'Repas et Restaurants' : 'Comidas y Restaurantes',
      `${foodCost} EUR`,
      `${(foodCost / 2).toFixed(1)} EUR`,
      isFr
        ? `Estimation ${foodPerPax * 2} EUR/jour par couple (10 jours, 50/50)`
        : `Estimado ${foodPerPax * 2} EUR/dia por pareja (10 dias, 50/50)`,
    ],
  ];

  if (customExpenses.length > 0) {
    customExpenses.forEach((exp) => {
      const target = exp.assignedTo || 'both';
      const totalExp =
        target === 'both'
          ? (exp.isPerPerson ? exp.amount * 4 : exp.amount)
          : (exp.isPerPerson ? exp.amount * 2 : exp.amount);

      const expTitle = isFr ? exp.title_fr || translateExpenseTitle(exp.title, 'fr') : exp.title;
      let targetLabel = '';
      let perCoupleDesc = '';

      if (target === 'ByL') {
        targetLabel = '[Solo ByL] ';
        perCoupleDesc = `100% ByL (${totalExp.toFixed(1)} EUR) | AyM: 0 EUR`;
      } else if (target === 'AyM') {
        targetLabel = '[Solo AyM] ';
        perCoupleDesc = `100% AyM (${totalExp.toFixed(1)} EUR) | ByL: 0 EUR`;
      } else {
        targetLabel = '[50/50] ';
        perCoupleDesc = `${(totalExp / 2).toFixed(1)} EUR / ${isFr ? 'couple' : 'pareja'}`;
      }

      budgetBody.push([
        `${targetLabel}${expTitle}`,
        `${totalExp.toFixed(0)} EUR`,
        perCoupleDesc,
        exp.notes || (isFr ? 'Depense enregistree' : 'Gasto registrado'),
      ]);
    });
  }

  const baseSharedHalf = baseSharedTotal / 2;
  const customSharedHalf = customSharedTotal / 2;

  budgetBody.push([
    isFr ? 'TOTAL PAREJA ByL (Bruno & Loles)' : 'TOTAL PAREJA ByL (Bruno y Loles)',
    `${totalByL.toFixed(1)} EUR`,
    `~${(totalByL / 2).toFixed(1)} EUR / pax`,
    isFr
      ? `Base voyage (${baseSharedHalf.toFixed(1)} EUR) + Extras partagés 50% (${customSharedHalf.toFixed(1)} EUR) + Frais exclusifs ByL (${customExclusiveByL.toFixed(1)} EUR)`
      : `Base viaje (${baseSharedHalf.toFixed(1)} EUR) + Extras compartidos 50% (${customSharedHalf.toFixed(1)} EUR) + Gastos propios ByL (${customExclusiveByL.toFixed(1)} EUR)`,
  ]);

  budgetBody.push([
    isFr ? 'TOTAL PAREJA AyM (Alberto & Mari)' : 'TOTAL PAREJA AyM (Alberto y Mari)',
    `${totalAyM.toFixed(1)} EUR`,
    `~${(totalAyM / 2).toFixed(1)} EUR / pax`,
    isFr
      ? `Base voyage (${baseSharedHalf.toFixed(1)} EUR) + Extras partagés 50% (${customSharedHalf.toFixed(1)} EUR) + Frais exclusifs AyM (${customExclusiveAyM.toFixed(1)} EUR)`
      : `Base viaje (${baseSharedHalf.toFixed(1)} EUR) + Extras compartidos 50% (${customSharedHalf.toFixed(1)} EUR) + Gastos propios AyM (${customExclusiveAyM.toFixed(1)} EUR)`,
  ]);

  budgetBody.push([
    isFr ? 'TOTAL GENERAL GROUPE (10 JOURS)' : 'TOTAL GENERAL GRUPO (10 DIAS)',
    `${grandTotal.toFixed(1)} EUR`,
    `ByL (${totalByL.toFixed(0)} EUR) + AyM (${totalAyM.toFixed(0)} EUR)`,
    isFr
      ? 'Somme totale des deux couples avec ventilation individuelle exacte'
      : 'Suma total de ambas parejas con imputacion individual exacta',
  ]);

  autoTable(doc, {
    startY: 50,
    head: [
      isFr
        ? ['Poste / Depense', 'Total Groupe', 'Repartition Couple / Pax', 'Details / Remarques']
        : ['Concepto / Gasto', 'Total Grupo', 'Reparto Pareja / Pax', 'Detalles / Notas'],
    ],
    body: budgetBody,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.8 },
  });

  // Table of 10 Days Summary
  const lastY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 105;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(
    isFr
      ? '2. Itineraire Complet Etape par Etape (10/11/2026 - 19/11/2026)'
      : '2. Itinerario Completo Etapa por Etapa (10/11/2026 - 19/11/2026)',
    14,
    lastY + 9
  );

  const itineraryRows = ROUTE_DAYS.map((day) => {
    const apt = userApts.find((a) => a.dayNumber === day.dayNumber);
    const dayTrans = DAY_TRANSLATIONS[lang]?.[day.dayNumber];
    const dayTitle = dayTrans?.title || day.title;
    const highlights = dayTrans?.highlights || day.highlights;

    let lodgingText = isFr ? 'Retour a Pinsoro (Maison)' : 'Llegada a Pinsoro (Hogar)';
    if (day.dayNumber <= 9) {
      if (apt) {
        const aptName = isFr ? apt.name_fr || apt.name : apt.name;
        const aptParking = isFr ? apt.parking_fr || translateApartmentField(apt.parking, 'fr') : apt.parking;
        lodgingText = `${aptName}\n${apt.price} EUR (~${(apt.price / 2).toFixed(1)} EUR/${isFr ? 'couple' : 'pareja'})\nCheck-in: ${apt.checkInTime || '15:00'} | Out: ${apt.checkOutTime || '11:00'}\n[P] ${aptParking}`;
      } else {
        lodgingText = isFr
          ? `Hebergement a ${day.destination}\n(En attente)`
          : `Apartamento en ${day.destination}\n(Pendiente de registrar)`;
      }
    }
    return [
      `${isFr ? 'Jour' : 'Dia'} ${day.dayNumber}\n${day.shortDate}`,
      `${day.origin} -> ${day.destination}\n(${day.distanceKm} km)`,
      highlights.slice(0, 3).join('; '),
      lodgingText,
    ];
  });

  autoTable(doc, {
    startY: lastY + 13,
    head: [
      isFr
        ? ['Jour / Date', 'Trajet & Distance', 'Etapes Cles & Visites', 'Hebergement & Parking']
        : ['Dia / Fecha', 'Ruta & Distancia', 'Paradas Clave & Estancias', 'Alojamiento & Parking'],
    ],
    body: itineraryRows,
    theme: 'striped',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: 'bold' },
      1: { cellWidth: 42 },
      2: { cellWidth: 74 },
      3: { cellWidth: 56 },
    },
  });

  // Page 2: Detailed Breakdown
  doc.addPage();
  doc.setFillColor(...secondaryColor);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(
    isFr
      ? '3. Details des Troncons, Temps d\'Arret et Gastronomie'
      : '3. Desglose de Tramos, Tiempos de Parada y Gastronomia por Dia',
    14,
    12
  );

  let currentY = 25;

  ROUTE_DAYS.forEach((day) => {
    if (currentY > 240) {
      doc.addPage();
      currentY = 20;
    }

    const dayTrans = DAY_TRANSLATIONS[lang]?.[day.dayNumber];
    const dayTitle = dayTrans?.title || day.title;
    const dateFormatted = dayTrans?.dateFormatted || day.dateFormatted;

    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY - 4, 182, 7, 'F');
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${isFr ? 'JOUR' : 'DIA'} ${day.dayNumber} (${dateFormatted}): ${dayTitle}`, 16, currentY + 1);

    currentY += 8;

    const legsText = day.legs
      .map((l) => `  * ${l.from} -> ${l.to}: ${l.distanceKm} km (${l.driveTime}) via ${l.routeRoad}`)
      .join('\n');

    const touristText = day.touristSpots
      .map((t) => `  * ${t.name}: ${t.stayDuration || (isFr ? 'Visite' : 'Visita')} - ${t.description.slice(0, 85)}...`)
      .join('\n');

    const gastroText = day.gastroSpots
      .map((g) => `  * ${g.name} (${g.stayDuration || (isFr ? '1h 30m' : '1h 30m')}): ${g.dishRecommendations?.join(', ') || g.description.slice(0, 60)}`)
      .join('\n');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);

    const dayInfo = isFr
      ? `TRONCONS DE ROUTE (${day.distanceKm} km au total):\n${legsText}\n\nARRETS ET VISITES:\n${touristText}\n\nGASTRONOMIE RECOMMANDEE:\n${gastroText}\n\nHEBERGEMENT (${day.accommodation.pricePerNightFor4} EUR/nuit):\n  * ${day.accommodation.name} a ${day.accommodation.city}\n`
      : `TRAMOS DE CONDUCCION (${day.distanceKm} km totales):\n${legsText}\n\nPARADAS Y TIEMPOS DE ESTANCIA:\n${touristText}\n\nGASTRONOMIA RECOMENDADA:\n${gastroText}\n\nALOJAMIENTO (${day.accommodation.pricePerNightFor4} EUR/noche):\n  * ${day.accommodation.name} en ${day.accommodation.city}\n`;

    const splitInfo = doc.splitTextToSize(dayInfo, 180);
    doc.text(splitInfo, 16, currentY);
    currentY += splitInfo.length * 3.6 + 6;
  });

  // Page 3: Directory of Accommodations
  doc.addPage();
  doc.setFillColor(...secondaryColor);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(
    isFr
      ? '4. Repertoire des Hebergements avec Parking, Horaires & Tarifs'
      : '4. Directorio de Alojamientos con Parking, Horarios & Precios',
    14,
    12
  );

  const accRows = TARGET_NIGHTS.map((target) => {
    const apt = userApts.find((a) => a.dayNumber === target.dayNumber);
    if (apt) {
      const aptName = isFr ? apt.name_fr || apt.name : apt.name;
      const aptParking = isFr ? apt.parking_fr || translateApartmentField(apt.parking, 'fr') : apt.parking;
      const aptDistance = isFr ? apt.distanceToCenter_fr || translateApartmentField(apt.distanceToCenter, 'fr') : apt.distanceToCenter;
      const freeCanc = apt.freeCancellation ? (isFr ? 'Oui' : 'Si') : 'Non';

      return [
        `${isFr ? 'Nuit' : 'Noche'} ${target.dayNumber}\n${target.city}`,
        `${aptName}\nIn: ${apt.checkInTime || '15:00'} | Out: ${apt.checkOutTime || '11:00'}`,
        `${apt.price} EUR total\n(~${(apt.price / 2).toFixed(1)} EUR/${isFr ? 'couple' : 'pareja'})`,
        `${apt.address}\nDist: ${aptDistance}\n${isFr ? 'Salles de bain' : 'Banos'}: ${apt.bathrooms}`,
        `${aptParking}\nCanc: ${freeCanc}`,
      ];
    }
    return [
      `${isFr ? 'Nuit' : 'Noche'} ${target.dayNumber}\n${target.city}`,
      isFr ? 'En attente d\'enregistrement' : 'Pendiente de registrar por el usuario',
      '-',
      `${isFr ? 'Zone conseillee' : 'Zona recomendada'}: ${target.suggestedArea}`,
      isFr ? 'A definir' : 'Por definir',
    ];
  });

  autoTable(doc, {
    startY: 25,
    head: [
      isFr
        ? ['Nuit / Ville', 'Hebergement & Horaires', 'Prix Total et Couple', 'Adresse & Emplacement', 'Parking & Conditions']
        : ['Noche / Ciudad', 'Apartamento & Horarios', 'Precio Total y Pareja', 'Dirección & Ubicación', 'Parking & Condiciones'],
    ],
    body: accRows,
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 44 },
      2: { cellWidth: 32 },
      3: { cellWidth: 40 },
      4: { cellWidth: 38 },
    },
  });

  const checklistY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 160;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(
    isFr
      ? '5. Conseils Essentiels pour les 2 Couples (4 Voyageurs)'
      : '5. Consejos Clave para las 2 Parejas (4 Pasajeros)',
    14,
    checklistY + 12
  );

  const tips = isFr
    ? [
        '1. Excursion aux Iles Cies: Validee le Mercredi 11/11 (embarquement a 10h15 a Vigo). N\'oubliez pas la piece d\'identite et l\'autorisation gratuite de la Xunta.',
        '2. Plage des Cathedrales (Jour 9, Mercredi 18/11): Verifier la table des marees pour arriver 1h avant la basse mer exacte.',
        '3. Bagages et Voiture: Plein fait au depart de Pinsoro le 10/11 a 07h30. Prevoir adaptateur USB multiple pour la voiture et chaussures etanches confortables.',
        '4. Gastronomie: Poulpe a la galicienne, couteaux et petoncles, riz au homard a O Grove, pouce-pieds et omelette cremeuse de Betanzos.',
      ]
    : [
        '1. Excursion a las Islas Cies: Confirmada el Miercoles 11/11 (embarque 10:15h en Vigo). Tramitar con antelacion la autorizacion gratuita de la Xunta de Galicia.',
        '2. Playa de las Catedrales (Dia 9, Miercoles 18/11): Consultar tabla de mareas para coincidir con la bajamar exacta.',
        '3. Maletero y Coche: Deposito lleno al salir de Pinsoro el 10/11 a las 07:30. Llevar cable cargador multiple USB y calzado impermeable comodo.',
        '4. Gastronomia: Pulpo a feira, zamburinas, arroz con bogavante en O Grove, percebes en Corme/Roncudo y tortilla de Betanzos.',
      ];

  let tipY = checklistY + 18;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  tips.forEach((tip) => {
    const splitTip = doc.splitTextToSize(tip, 180);
    doc.text(splitTip, 16, tipY);
    tipY += splitTip.length * 4.2 + 2;
  });

  const pdfFileName = isFr ? 'Circuit_Galice_10_Jours_Pinsoro.pdf' : 'Ruta_Galicia_10_Dias_Pinsoro.pdf';
  doc.save(pdfFileName);
}
