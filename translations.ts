export type Language = 'es' | 'fr';

export interface DayTranslation {
  title: string;
  subtitle: string;
  summary: string;
  dateFormatted: string;
  shortDate: string;
  driveTimeFormatted: string;
  highlights: string[];
  localTips: string[];
  schedule?: {
    time: string;
    title: string;
    description: string;
    duration?: string;
  }[];
  legs?: {
    from: string;
    to: string;
    notes?: string;
    routeRoad?: string;
    driveTime?: string;
  }[];
}

export const DAY_TRANSLATIONS: Record<Language, Record<number, DayTranslation>> = {
  es: {
    1: {
      title: 'Día 1: Pinsoro → Ribeira Sacra (Cañón del Sil) → Ourense Termal',
      subtitle: 'Viaje hacia el oeste, viñedos en bancales y aguas termales nocturnas',
      summary: 'Salida el Martes 10/11 a las 07:30 desde Pinsoro. Parada en Astorga para estirar piernas y almorzar, visita vespertina al Mirador de Balcones de Madrid sobre los Cañones del Sil y llegada a Ourense con aparcamiento reservado en parking subterráneo.',
      dateFormatted: 'Martes, 10 de Noviembre de 2026',
      shortDate: 'Mar 10/11',
      driveTimeFormatted: '6h 40m de conducción en total',
      highlights: [
        'Entrada monumental a Galicia por los Cañones del Sil',
        'Mirador de Balcones de Madrid sobre el cañón de 500m de profundidad',
        'Casco histórico de Ourense y fuente termal As Burgas a 67ºC',
        'Primera cena gallega: Pulpo á feira y vino Mencía D.O. Ribeira Sacra',
      ],
      localTips: [
        'En Astorga aparcad junto a la Muralla/Plaza San Roque para almorzar rápido.',
        'En Ourense el apartamento dispone de plaza en el Parking Alameda a 100m.',
      ],
      schedule: [
        { time: '07:30', title: 'Salida de Pinsoro', description: 'Inicio del viaje en coche por la A-68 / A-231.', duration: '4h 15m conducción' },
        { time: '12:00', title: 'Parada en Astorga (Comida & Paseo)', description: 'Almuerzo rápido de tapas de cecina o empanada y vista al Palacio de Gaudí.', duration: '1h 15m de parada' },
        { time: '15:15', title: 'Mirador Balcones de Madrid (Cañones del Sil)', description: 'Contemplar los meandros del Sil y viñedos en laderas verticales.', duration: '50 min de estancia' },
        { time: '17:00', title: 'Llegada a Ourense & Check-in con Parking', description: 'Aparcar en Parking Alameda y dejar equipaje en el apartamento.', duration: '1h descanso / check-in' },
        { time: '18:30', title: 'Paseo Termal por As Burgas y Catedral', description: 'Manantiales calientes a 67ºC y Pórtico do Paraíso.', duration: '1h 45m de visita' },
        { time: '20:30', title: 'Cena en Casco Vello de Ourense', description: 'Tapeo en Rúa dos Viños: pulpo á feira, zorza y vino Mencía.', duration: '2h de cena' },
      ],
    },
    2: {
      title: 'Día 2: Ourense → Barco a Islas Cíes (Playa de Rodas) → Bahía de Baiona',
      subtitle: 'Navegación al Parque Nacional Illas Atlánticas, Faro de Cíes y noche amurallada en Baiona',
      summary: 'Miércoles 11/11 (Día de barco activo). Salida temprana desde Ourense a la Estación Marítima de Vigo con aparcamiento subterráneo directo en el muelle. Catamarán a las Islas Cíes: 5h de estancia para recorrer la Playa de Rodas y la ruta al Faro de Cíes. Retorno por la tarde, tapeo de ostras en Vigo y traslado a Baiona con garaje privado propio.',
      dateFormatted: 'Miércoles, 11 de Noviembre de 2026',
      shortDate: 'Mié 11/11',
      driveTimeFormatted: '1h 35m de coche (+ 40 min navegación en catamarán)',
      highlights: [
        'Excursión en barco asegurada el Miércoles 11/11',
        'Playa de Rodas: Declarada una de las mejores playas del mundo',
        'Ruta senderista al Faro de Cíes y Mirador de Pedra da Campá sobre acantilados',
        'Ostras frescas en Vigo y noche en la villa marinera amurallada de Baiona con garaje',
      ],
      localTips: [
        'El barco a Cíes zarpa a las 10:15 / 10:30. Es imprescindible llevar DNI y la autorización del Parque Nacional.',
        'En Baiona el apartamento incluye plaza de garaje subterránea privada con ascensor directo.',
      ],
      schedule: [
        { time: '08:30', title: 'Salida de Ourense hacia Vigo', description: 'Trayecto por autovía AG-53 y A-52 hacia la ría.', duration: '1h conducción' },
        { time: '09:40', title: 'Parking Estación Marítima de Vigo', description: 'Aparcamiento subterráneo en el muelle de embarque.', duration: '25 min' },
        { time: '10:15', title: 'Embarque Catamarán a Islas Cíes', description: 'Travesía guiada por la Ría de Vigo divisando las bateas.', duration: '40 min navegación' },
        { time: '11:00', title: 'Llegada a Cíes & Playa de Rodas', description: 'Paseo por el arenal de Rodas y ruta al Faro de Cíes.', duration: '4h 30m en la isla' },
        { time: '16:00', title: 'Barco de Retorno a Vigo', description: 'Regreso al puerto marítimo de Vigo.', duration: '40 min navegación' },
        { time: '17:30', title: 'Ostras en A Pedra (Vigo)', description: 'Degustación de ostras abiertas en vivo y vino Albariño.', duration: '1h 15m' },
        { time: '19:15', title: 'Llegada a Baiona & Check-in con Parking', description: 'Entrada al garaje privado y descanso en el apartamento.', duration: '1h descanso' },
        { time: '20:45', title: 'Cena Marinera en Baiona', description: 'Tapeo de marisco y zamburiñas por el casco histórico.', duration: '2h de cena' },
      ],
    },
    3: {
      title: 'Día 3: Fortaleza de Baiona → Hórreos de Combarro → O Grove → Pontevedra',
      subtitle: 'Ruta terrestre por las Rías Baixas: Murallas atlánticas, hórreos sobre el mar, marisco en O Grove y casco histórico de Pontevedra',
      summary: 'Jueves 12/11 (Ruta terrestre). Paseo matinal por las murallas de Monterreal en Baiona. Salida hacia Combarro para admirar sus 30 hórreos a pie de ría, almuerzo de marisco en la península de O Grove e Illa da Toxa (Capilla de las Conchas) y llegada a Pontevedra para disfrutar de su premiado centro histórico peatonal y parking reservado.',
      dateFormatted: 'Jueves, 12 de Noviembre de 2026',
      shortDate: 'Jue 12/11',
      driveTimeFormatted: '2h 10m de conducción en total',
      highlights: [
        'Paseo por las murallas de la Fortaleza de Monterreal sobre las olas en Baiona',
        'Combarro: El pueblo marinero más fotografiado de Galicia con 30 hórreos costeros',
        'Illa da Toxa (Capilla de las Conchas de vieira) y mariscada en O Grove',
        'Casco histórico peatonal de Pontevedra (Praza da Leña y Santuario de la Peregrina)',
      ],
      localTips: [
        'En Combarro calzad zapatillas con buen agarre para las rampas de piedra hacia la ría.',
        'En O Grove pedid mariscada o arroz con bogavante en el puerto marinero.',
      ],
      schedule: [
        { time: '09:30', title: 'Paseo por la Fortaleza de Monterreal', description: 'Recorrido perimetral de 3 km sobre el mar en Baiona.', duration: '1h 30m paseo' },
        { time: '11:30', title: 'Hórreos y Cruceiros de Combarro', description: 'Visita a los 30 hórreos de piedra alineados junto a la marea.', duration: '1h 15m visita' },
        { time: '13:30', title: 'Almuerzo de Marisco en O Grove', description: 'Centollo, navajas y nécoras en el puerto marinero.', duration: '2h almuerzo' },
        { time: '16:00', title: 'Illa da Toxa & Capilla de las Conchas', description: 'Paseo por la isla termal y capilla recubierta de vieiras.', duration: '45 min' },
        { time: '17:30', title: 'Check-in en Pontevedra con Parking', description: 'Llegada al apartamento céntrico con plaza de parking.', duration: '1h descanso' },
        { time: '19:00', title: 'Ruta Peatonal por Pontevedra', description: 'Praza da Leña, Praza da Verdura y Santuario da Peregrina.', duration: '2h paseo y tapeo' },
      ],
    },
    4: {
      title: 'Día 4: Pontevedra → Cambados (Cuna del Albariño) → Padrón → Santiago',
      subtitle: 'Plaza señorial de Fefiñáns, cata de vino Albariño, tierra de Rosalía y llegada triunfal a Santiago de Compostela',
      summary: 'Viernes 13/11. Mañana dedicada al enoturismo en Cambados, capital del vino Albariño, recorriendo la Plaza de Fefiñáns y el barrio marinero de Santo Tomé. Parada gastronómica en Padrón para probar sus célebres pimientos y llegada a Santiago de Compostela para contemplar la Plaza del Obradoiro iluminada.',
      dateFormatted: 'Viernes, 13 de Noviembre de 2026',
      shortDate: 'Vie 13/11',
      driveTimeFormatted: '1h 50m de conducción en total',
      highlights: [
        'Plaza de Fefiñáns en Cambados y arquitectura señorial de granito',
        'Cata de Albariño D.O. Rías Baixas en bodega histórica',
        'Padrón: cuna de los pimientos más famosos de España y de Camilo José Cela',
        'Llegada al Obradoiro: Fachada iluminada de la Catedral de Santiago de Compostela',
      ],
      localTips: [
        'En Santiago el apartamento cuenta con parking concertado a 150m del Obradoiro.',
        'Probad la queimada tradicional en las tabernas de la Rúa do Franco tras la cena.',
      ],
    },
    5: {
      title: 'Día 5: Santiago de Compostela → Cascada de Ézaro → Cabo Fisterra (Fin del Mundo)',
      subtitle: 'La Catedral del Apóstol, la única cascada de Europa que cae al mar y la puesta de sol en el Cabo del Finisterre',
      summary: 'Sábado 14/11. Mañana en la Catedral de Santiago (Abrazo al Apóstol, Cripta y Pórtico de la Gloria). Ruta hacia la Costa da Morte para contemplar la Cascada de Ézaro desembocando en el océano Atlántico y puesta de sol legendaria en el Cabo Fisterra.',
      dateFormatted: 'Sábado, 14 de Noviembre de 2026',
      shortDate: 'Sáb 14/11',
      driveTimeFormatted: '2h 15m de conducción en total',
      highlights: [
        'Catedral de Santiago de Compostela, Plaza de Quintana y Rúa do Franco',
        'Cascada de Ézaro (Río Xallas): caída de agua fluvial directa al mar',
        'Cabo Fisterra: Km 0,00 del Camino y vistas oceánicas infinitas',
        'Puesta de sol atlántica desde los acantilados del Fin del Mundo',
      ],
      localTips: [
        'Llevad calzado cómodo para el sendero de rocas en el Cabo Fisterra.',
        'Cenar lubina o longueiróns (navajas de Fisterra) en las tabernas del puerto.',
      ],
    },
    6: {
      title: 'Día 6: Cabo Fisterra → Cabo Touriñán → Muxía (Santuario Virxe da Barca)',
      subtitle: 'El punto más occidental de la España peninsular, leyendas de piedra celtas y el bravo oleaje atlántico',
      summary: 'Domingo 15/11. Jornada tranquila de exploración en el corazón más bravo de la Costa da Morte. Visita a Cabo Touriñán y llegada a Muxía para tocar las piedras oscilantes milagrosas de la Virxe da Barca.',
      dateFormatted: 'Domingo, 15 de Noviembre de 2026',
      shortDate: 'Dom 15/11',
      driveTimeFormatted: '1h 10m de conducción en total',
      highlights: [
        'Cabo Touriñán: El extremo occidental de la España peninsular',
        'Santuario da Virxe da Barca azotado por el Atlántico en Muxía',
        'Piedras legendarias: Pedra de Abalar y Pedra dos Cadrís',
        'Marisco fresco en el puerto pesquero de Muxía frente a la ría',
      ],
      localTips: [
        'Atentos al viento y al oleaje junto al santuario de Muxía: no sobrepasar las rocas húmedas.',
        'El congrio seco al sol en los secaderos tradicionales de Muxía es una estampa única.',
      ],
    },
    7: {
      title: 'Día 7: Cabo Vilán → Betanzos (Dormir en Betanzos) & Visita a A Coruña',
      subtitle: 'Faro de Camariñas, check-in en Betanzos, visita a la Torre de Hércules y cena de tortilla',
      summary: 'Lunes 16/11. Mañana en el Faro de Cabo Vilán sobre su peñasco rojo de 100m. Viaje hacia Betanzos para check-in y descanso, y excursión de tarde a A Coruña para contemplar la Torre de Hércules y las Galerías de la Marina, regresando a cenar la mejor tortilla melosa a Betanzos.',
      dateFormatted: 'Lunes, 16 de Noviembre de 2026',
      shortDate: 'Lun 16/11',
      driveTimeFormatted: '2h 50m de conducción en total (incluye visita a Coruña)',
      highlights: [
        'Faro de Cabo Vilán en Camariñas: enclave eléctrico monumental',
        'Torre de Hércules en A Coruña: el faro romano en funcionamiento más antiguo del mundo',
        'Paseo por las Galerías acristaladas de la Marina en A Coruña',
        'Cena en Betanzos: degustación de la auténtica tortilla de Betanzos jugosa',
      ],
      localTips: [
        'En A Coruña aparcad en el Parking subterráneo Los Cantones para pasear la Marina.',
        'En Betanzos es obligatorio reservar o llegar pronto para la tortilla en Casa Miranda o O Pote.',
      ],
    },
    8: {
      title: 'Día 8: Betanzos → Cedeira & San Andrés de Teixido → Ortigueira → Dormir en Viveiro',
      subtitle: 'Acantilados de Vixía Herbeira (los más altos de la Europa continental), leyendas y Rías Altas',
      summary: 'Martes 17/11. Ruta por las Rías Altas hacia Cedeira y el santuario de San Andrés de Teixido ("vai de morto quen non foi de vivo"). Vistas desde los sobrecogedores acantilados de Vixía Herbeira (613m sobre el mar) y llegada a Viveiro para pernoctar con parking.',
      dateFormatted: 'Martes, 17 de Noviembre de 2026',
      shortDate: 'Mar 17/11',
      driveTimeFormatted: '2h 45m de conducción en total',
      highlights: [
        'San Andrés de Teixido y tradición de los sanandresiños de miga de pan',
        'Acantilados de Vixía Herbeira (613m): los más altos sobre el mar de la Europa continental',
        'El "Mejor Banco del Mundo" en los acantilados de Loiba',
        'Casco medieval de Viveiro y Puerta de Carlos V junto a la ría',
      ],
      localTips: [
        'Conducid con precaución en la sierra de A Capelada: caballos y vacas salvajes suelen pastar al borde de la carretera.',
        'Comprad los sanandresiños de colores en Teixido como recuerdo de buena suerte.',
      ],
    },
    9: {
      title: 'Día 9: Viveiro → Fuciño do Porco → Praia das Catedrais → Rinlo → Lugo Murada',
      subtitle: 'Pasarelas sobre el mar cantábrico, catedrales de roca esculpidas por las mareas y murallas romanas de Lugo',
      summary: 'Miércoles 18/11. Mañana por la espectacular senda de madera de Fuciño do Porco. Visita con marea baja a la Praia das Catedrais con sus arcos góticos naturales, almuerzo de arroz caldoso en Rinlo y traslado a Lugo para recorrer su muralla romana Patrimonio de la Humanidad.',
      dateFormatted: 'Miércoles, 18 de Noviembre de 2026',
      shortDate: 'Mié 18/11',
      driveTimeFormatted: '2h 30m de conducción en total',
      highlights: [
        'Senda volada de madera sobre los acantilados en O Fuciño do Porco',
        'Praia das Catedrais en marea baja: arcos de roca natural de más de 30 metros',
        'Arroz caldoso con bogavante en las antiguas cetáreas de Rinlo',
        'Muralla Romana de Lugo: paseo perimetral completo sobre sus 2,2 km',
      ],
      localTips: [
        'Consultar tabla de mareas para Catedrais: bajar 1 hora antes de la bajamar.',
        'En Lugo el tapeo de la Rúa Nova y Praza do Campo incluye tapa caliente gratis con cada consumición.',
      ],
    },
    10: {
      title: 'Día 10: Lugo (Muralla Romana) → Astorga → Burgos → Regreso a Pinsoro',
      subtitle: 'Despedida de Galicia por la A-6 y la Autovía del Camino, comida castellana y llegada a Pinsoro',
      summary: 'Jueves 19/11. Último paseo matinal por Lugo y salida en coche de regreso a Aragón. Parada para almorzar cecina en Astorga o lechazo en Burgos y llegada a Pinsoro a las 19:30 con todos los recuerdos y productos gallegos en el maletero.',
      dateFormatted: 'Jueves, 19 de Noviembre de 2026',
      shortDate: 'Jue 19/11',
      driveTimeFormatted: '6h 30m de conducción en total',
      highlights: [
        'Paseo de despedida por la Muralla Romana de Lugo',
        'Parada en Astorga: compra de mantecadas y hojaldres artesanos',
        'Comida en Burgos a la sombra de su Catedral gótica',
        'Llegada a Pinsoro a las 19:30 para celebrar el final de la expedición',
      ],
      localTips: [
        'Revisar niveles y neumáticos antes de emprender el viaje de regreso.',
        'Conservar los quesos gallegos (Tetilla, San Simón da Costa) en bolsas térmicas en el maletero.',
      ],
    },
  },
  fr: {
    1: {
      title: 'Jour 1: Pinsoro → Ribeira Sacra (Canyon du Sil) → Ourense Thermale',
      subtitle: 'Cap vers l\'ouest, vignobles en terrasses vertigineux et eaux thermales nocturnes',
      summary: 'Départ le mardi 10/11 à 07h30 depuis Pinsoro. Arrêt à Astorga pour déjeuner et se dégourdir les jambes, visite au Belvédère des Balcones de Madrid dominant les spectaculaires Canyons du Sil, et arrivée à Ourense avec place en parking souterrain réservée.',
      dateFormatted: 'Mardi 10 Novembre 2026',
      shortDate: 'Mar 10/11',
      driveTimeFormatted: '6h 40m de conduite au total',
      highlights: [
        'Entrée grandiose en Galice à travers les Canyons du Sil',
        'Belvédère des Balcones de Madrid suspendu au-dessus du gouffre de 500m',
        'Centre historique d\'Ourense et sources thermales romaines d\'As Burgas à 67°C',
        'Premier dîner galicien: Poulpe à la galicienne et vin rouge Mencía D.O.',
      ],
      localTips: [
        'À Astorga, garez-vous près des Remparts pour un déjeuner rapide.',
        'À Ourense, l\'appartement dispose d\'une place au Parking Alameda à 100m.',
      ],
      schedule: [
        { time: '07:30', title: 'Départ de Pinsoro', description: 'Début de l\'aventure en voiture via l\'A-68 / A-231.', duration: '4h 15m de route' },
        { time: '12:00', title: 'Halte à Astorga (Déjeuner & Promenade)', description: 'Pause gourmande de cecina ou empanada et coup d\'œil au Palais Gaudí.', duration: '1h 15m de pause' },
        { time: '15:15', title: 'Belvédère Balcones de Madrid (Canyon du Sil)', description: 'Observation des méandres du Sil et vignobles sur pentes vertigineuses.', duration: '50 min de visite' },
        { time: '17:00', title: 'Arrivée à Ourense & Check-in avec Parking', description: 'Stationnement au Parking Alameda et installation à l\'hébergement.', duration: '1h d\'installation' },
        { time: '18:30', title: 'Balade Thermale As Burgas et Cathédrale', description: 'Sources d\'eau chaude à 67°C et Portique du Paradis.', duration: '1h 45m de balade' },
        { time: '20:30', title: 'Dîner dans la Vieille Ville d\'Ourense', description: 'Tournée de tapas dans la Rúa dos Viños: poulpe, zorza et vin Mencía.', duration: '2h de dîner' },
      ],
    },
    2: {
      title: 'Jour 2: Ourense → Bateau pour les Îles Cíes (Plage de Rodas) → Baie de Baiona',
      subtitle: 'Navigation vers le Parc National des Îles Atlantiques, Phare de Cíes et nuit fortifiée à Baiona',
      summary: 'Mercredi 11/11 (Journée bateau assurée). Départ matinal vers le port de Vigo avec parking souterrain sur le quai. Catamaran vers les Îles Cíes: 5h sur place pour arpenter la sublime Plage de Rodas et monter au Phare. Dégustation d\'huîtres à Vigo et nuit dans la cité fortifiée de Baiona avec garage privé.',
      dateFormatted: 'Mercredi 11 Novembre 2026',
      shortDate: 'Mer 11/11',
      driveTimeFormatted: '1h 35m de route (+ 40 min de traversée en catamaran)',
      highlights: [
        'Excursion en bateau garantie le mercredi 11/11',
        'Plage de Rodas: élue parmi les plus belles plages du monde',
        'Randonnée côtière vers le Phare de Cíes et le Belvédère de Pedra da Campá',
        'Huîtres fraîches à Vigo et nuit au sein de la forteresse médiévale de Baiona',
      ],
      localTips: [
        'Le bateau pour les Cíes part à 10h15. Munissez-vous impérativement de votre pièce d\'identité.',
        'À Baiona, l\'hébergement comprend un box de garage souterrain privé avec ascenseur.',
      ],
      schedule: [
        { time: '08:30', title: 'Départ d\'Ourense vers Vigo', description: 'Trajet rapide par l\'autoroute AG-53 et A-52 vers l\'estuaire.', duration: '1h de route' },
        { time: '09:40', title: 'Parking Gare Maritime de Vigo', description: 'Stationnement au parking souterrain face au quai d\'embarquement.', duration: '25 min' },
        { time: '10:15', title: 'Embarquement Catamaran pour les Îles Cíes', description: 'Traversée de la Ría de Vigo au milieu des parcs à moules.', duration: '40 min de mer' },
        { time: '11:00', title: 'Arrivée aux Cíes & Plage de Rodas', description: 'Balade sur le banc de sable blanc de Rodas et sentier vers le Phare.', duration: '4h 30m sur l\'île' },
        { time: '16:00', title: 'Bateau de Retour vers Vigo', description: 'Traversée retour vers le port de Vigo.', duration: '40 min de mer' },
        { time: '17:30', title: 'Dégustation d\'Huîtres à A Pedra (Vigo)', description: 'Huîtres fraîchement ouvertes sur le pavé accompagnées d\'Albariño.', duration: '1h 15m' },
        { time: '19:15', title: 'Arrivée à Baiona & Check-in avec Parking', description: 'Accès au garage privé et installation dans le logement.', duration: '1h d\'installation' },
        { time: '20:45', title: 'Dîner Maritime à Baiona', description: 'Plateaux de coquillages et tapas dans les ruelles historiques.', duration: '2h de dîner' },
      ],
    },
    3: {
      title: 'Jour 3: Forteresse de Baiona → Greniers de Combarro → O Grove → Pontevedra',
      subtitle: 'Parcours côtier des Rías Baixas: Remparts atlantiques, hórreos sur l\'eau, fruits de mer et ruelles pavées',
      summary: 'Jeudi 12/11 (Route terrestre). Promenade matinale sur les remparts de Monterreal à Baiona. Départ vers Combarro pour admirer ses 30 célèbres greniers à grains en pierre en bord de mer, festin de fruits de mer dans la presqu\'île d\'O Grove et arrivée à Pontevedra avec parking réservé.',
      dateFormatted: 'Jeudi 12 Novembre 2026',
      shortDate: 'Jeu 12/11',
      driveTimeFormatted: '2h 10m de conduite au total',
      highlights: [
        'Promenade sur les remparts de la Forteresse de Monterreal au ras des vagues',
        'Combarro: Le village de pêcheurs le plus emblématique avec ses greniers marins',
        'Île de La Toja (Chapelle des Coquilles Saint-Jacques) et plateau de fruits de mer',
        'Cœur piéton historique de Pontevedra (Praza da Leña et Sanctuaire de la Peregrina)',
      ],
      localTips: [
        'À Combarro, portez de bonnes chaussures antidérapantes sur les pavés en pente.',
        'À O Grove, dégustez la mariscada ou le riz au homard sur le port de pêche.',
      ],
      schedule: [
        { time: '09:30', title: 'Tour des Remparts de Monterreal', description: 'Circuit pédestre de 3 km dominant l\'océan à Baiona.', duration: '1h 30m de visite' },
        { time: '11:30', title: 'Greniers en Pierre de Combarro', description: 'Visite des 30 hórreos bordant directement l\'eau.', duration: '1h 15m de visite' },
        { time: '13:30', title: 'Festin de Fruits de Mer à O Grove', description: 'Tourteau, couteaux et langoustines sur le port.', duration: '2h de déjeuner' },
        { time: '16:00', title: 'Île de La Toja & Chapelle aux Coquilles', description: 'Découverte de l\'île thermale et sa chapelle couverte de coquilles.', duration: '45 min' },
        { time: '17:30', title: 'Check-in à Pontevedra avec Parking', description: 'Installation dans l\'hébergement et accès au parking réservé.', duration: '1h d\'installation' },
        { time: '19:00', title: 'Balade Nocturne Piétonne à Pontevedra', description: 'Praza da Leña, Praza da Verdura et Sanctuaire de la Pèlerine.', duration: '2h de balade' },
      ],
    },
    4: {
      title: 'Jour 4: Pontevedra → Cambados (Berceau de l\'Albariño) → Padrón → Saint-Jacques',
      subtitle: 'Place seigneuriale de Fefiñáns, dégustation d\'Albariño, pays des piments et arrivée à Saint-Jacques-de-Compostelle',
      summary: 'Vendredi 13/11. Matinée œnologique à Cambados, capitale mondiale du cépage blanc Albariño. Arrêt gourmand à Padrón pour goûter les fameux piments doux et piquants, puis arrivée triomphale sur la Place de l\'Obradoiro à Saint-Jacques-de-Compostelle.',
      dateFormatted: 'Vendredi 13 Novembre 2026',
      shortDate: 'Ven 13/11',
      driveTimeFormatted: '1h 50m de conduite au total',
      highlights: [
        'Place de Fefiñáns à Cambados et palais seigneuriaux en granit',
        'Dégustation de vin blanc D.O. Rías Baixas dans un domaine historique',
        'Padrón: terroir des célèbres piments galiciens',
        'Arrivée à Compostelle: Façade illuminée de la Cathédrale de Saint-Jacques',
      ],
      localTips: [
        'À Saint-Jacques, l\'appartement dispose d\'un parking couvert à 150m de l\'Obradoiro.',
        'Dégustez la traditionnelle Queimada dans les tavernes de la Rúa do Franco.',
      ],
    },
    5: {
      title: 'Jour 5: Saint-Jacques-de-Compostelle → Cascade d\'Ézaro → Cap Finisterre (Bout du Monde)',
      subtitle: 'La Cathédrale de l\'Apôtre, la seule cascade d\'Europe se jetant dans l\'océan et coucher de soleil au Finistère',
      summary: 'Samedi 14/11. Matinée dans la Cathédrale de Saint-Jacques (Crypte, Portique de la Gloire). Trajet vers la Côte de la Mort pour admirer la Cascade d\'Ézaro et son plongeon direct dans la mer, suivi d\'un coucher de soleil inoubliable sur les falaises du Cap Finisterre.',
      dateFormatted: 'Samedi 14 Novembre 2026',
      shortDate: 'Sam 14/11',
      driveTimeFormatted: '2h 15m de conduite au total',
      highlights: [
        'Cathédrale de Saint-Jacques-de-Compostelle et Place de la Quintana',
        'Cascade d\'Ézaro (Fleuve Xallas): impressionnante chute d\'eau fluviale dans l\'océan',
        'Cap Finisterre: Borne Km 0,00 du Chemin de Compostelle et panorama infini',
        'Coucher de soleil atlantique légendaire depuis le Phare du Bout du Monde',
      ],
      localTips: [
        'Prévoyez des chaussures stables pour marcher sur les dalles de granit du Cap.',
        'Dînez de bar sauvage ou de couteaux de mer (longueiróns) sur le port de Fisterra.',
      ],
    },
    6: {
      title: 'Jour 6: Cap Finisterre → Cap Touriñán → Muxía (Sanctuaire de la Vierge de la Barque)',
      subtitle: 'Le point le plus occidental d\'Espagne péninsulaire, pierres de légendes et puissance de l\'océan',
      summary: 'Dimanche 15/11. Exploration sauvage du cœur de la Côte de la Mort. Passage au Cap Touriñán, puis arrêt à Muxía pour effleurer les rochers oscillants sacrés face aux vagues déchaînées de l\'Atlantique.',
      dateFormatted: 'Dimanche 15 Novembre 2026',
      shortDate: 'Dim 15/11',
      driveTimeFormatted: '1h 10m de conduite au total',
      highlights: [
        'Cap Touriñán: L\'extrémité la plus à l\'ouest de la péninsule ibérique',
        'Sanctuaire Notre-Dame de la Barque fouetté par les embruns marins à Muxía',
        'Rochers légendaires celtes: Pedra de Abalar et Pedra dos Cadrís',
        'Fruits de mer ultra frais sur le port de pêche artisanal de Muxía',
      ],
      localTips: [
        'Prenez garde au vent et aux fortes vagues près du sanctuaire: ne descendez pas sur les rochers mouillés.',
        'Les séchoirs traditionnels de congre de Muxía offrent une carte postale maritime unique.',
      ],
    },
    7: {
      title: 'Jour 7: Cap Vilán → Betanzos (Nuit à Betanzos) & Visite de La Corogne',
      subtitle: 'Phare de Camariñas, check-in à Betanzos, Tour d\'Hercule et dégustation de la fameuse omelette',
      summary: 'Lundi 16/11. Visite matinale du Phare du Cap Vilán perché sur son promontoire rougeoyant. Route vers Betanzos pour le check-in, suivie d\'une escapade l\'après-midi à La Corogne pour gravir la Tour d\'Hercule et admirer les verrières de la Marina, avant de savourer l\'omelette baveuse de Betanzos.',
      dateFormatted: 'Lundi 16 Novembre 2026',
      shortDate: 'Lun 16/11',
      driveTimeFormatted: '2h 50m de conduite au total (visite de La Corogne incluse)',
      highlights: [
        'Phare du Cap Vilán à Camariñas: site maritime sauvage grandiose',
        'Tour d\'Hercule à La Corogne: le plus ancien phare romain encore en service au monde',
        'Flânerie le long des verrières blanches de la Marina à La Corogne',
        'Dîner d\'anthologie à Betanzos: la véritable omelette crémeuse réputée d\'Espagne',
      ],
      localTips: [
        'À La Corogne, garez-vous au parking souterrain Los Cantones face aux galeries.',
        'À Betanzos, arrivez tôt pour déguster l\'omelette chez Casa Miranda ou O Pote.',
      ],
    },
    8: {
      title: 'Jour 8: Betanzos → Cedeira & San Andrés de Teixido → Ortigueira → Nuit à Viveiro',
      subtitle: 'Falaises de Vixía Herbeira (les plus hautes d\'Europe continentale), légendes et Rías Altas',
      summary: 'Mardi 17/11. Échappée vers les Rías Altas via Cedeira et le sanctuaire mystique de San Andrés de Teixido. Vertige garanti sur les falaises de Vixía Herbeira (613m à pic sur la mer) et installation à Viveiro dans un charmant hébergement avec parking.',
      dateFormatted: 'Mardi 17 Novembre 2026',
      shortDate: 'Mar 17/11',
      driveTimeFormatted: '2h 45m de conduite au total',
      highlights: [
        'San Andrés de Teixido et statuettes votives traditionnelles en mie de pain',
        'Falaises de Vixía Herbeira (613m): les plus hautes falaises marines d\'Europe continentale',
        'Le "Plus Beau Banc du Monde" face aux récifs sauvages de Loiba',
        'Cœur médiéval de Viveiro et Porte de Charles Quint bordant la ria',
      ],
      localTips: [
        'Conduisez prudemment dans la sierra de A Capelada: chevaux et vaches sauvages paissent en liberté.',
        'Achetez un porte-bonheur sanandresiño artisanal en souvenir.',
      ],
    },
    9: {
      title: 'Jour 9: Viveiro → Fuciño do Porco → Plage des Cathédrales → Rinlo → Lugo Murée',
      subtitle: 'Passerelles côtières, arches de pierre monumentales et remparts romains millénaires de Lugo',
      summary: 'Mercredi 18/11. Matinée sur les passerelles suspendues de Fuciño do Porco. Visite à marée basse de la spectaculaire Plage des Cathédrales avec ses voûtes rocheuses naturelles, déjeuner de riz au homard à Rinlo et route vers Lugo pour faire le tour de sa muraille romaine UNESCO.',
      dateFormatted: 'Mercredi 18 Novembre 2026',
      shortDate: 'Mer 18/11',
      driveTimeFormatted: '2h 30m de conduite au total',
      highlights: [
        'Sentier de passerelles en bois suspendu sur la mer à O Fuciño do Porco',
        'Plage des Cathédrales à marée basse: cathédrales de roche naturelle de plus de 30m',
        'Riz mijoté au homard dans les anciens parcs à crustacés de Rinlo',
        'Muraille Romaine de Lugo: tour complet à pied sur son chemin de ronde de 2,2 km',
      ],
      localTips: [
        'Surveillez attentivement la marée pour la Plage des Cathédrales: arrivez 1h avant la basse mer.',
        'À Lugo, la tournée des bars à tapas de la Rúa Nova offre une tapa chaude avec chaque verre.',
      ],
    },
    10: {
      title: 'Jour 10: Lugo (Muraille Romaine) → Astorga → Burgos → Retour à Pinsoro',
      subtitle: 'Adieux à la Galice par l\'autoroute du Chemin, étape gourmande castillane et arrivée à bon port',
      summary: 'Jeudi 19/11. Dernier regard sur les remparts de Lugo et route du retour vers l\'Aragon. Pause déjeuner gourmande à Astorga ou Burgos et arrivée festive à Pinsoro à 19h30, les bagages remplis de fromages et de souvenirs.',
      dateFormatted: 'Jeudi 19 Novembre 2026',
      shortDate: 'Jeu 19/11',
      driveTimeFormatted: '6h 30m de conduite au total',
      highlights: [
        'Promenade d\'adieu sur les remparts antiques romains de Lugo',
        'Halte à Astorga: achat de feuilletés et mantecadas artisanales',
        'Déjeuner à Burgos à l\'ombre de sa cathédrale gothique royale',
        'Arrivée à Pinsoro à 19h30 pour clore en beauté cette formidable expédition',
      ],
      localTips: [
        'Vérifiez la pression des pneus et les niveaux avant le long trajet de retour.',
        'Conservez les fromages galiciens (Tetilla, San Simón fumé) dans des sacs isothermes.',
      ],
    },
  },
};

export const CHECKLIST_TRANSLATIONS: Record<string, { es: string; fr: string }> = {
  'chk-doc-itv': {
    es: 'Documentación del coche e ITV al día',
    fr: 'Documentation du véhicule et contrôle technique (ITV) à jour',
  },
  'chk-neumaticos': {
    es: 'Presión de neumáticos y rueda de repuesto / kit antipinchazos',
    fr: 'Pression des pneus et roue de secours / kit anti-crevaison',
  },
  'chk-parking-codes': {
    es: 'Verificación de llaves/códigos de parking en los 9 apartamentos',
    fr: 'Vérification des clés/codes de parking dans les 9 hébergements',
  },
  'chk-ropa-impermeable': {
    es: 'Chubasquero o calzado impermeable cómodo para caminar',
    fr: 'Imperméable ou chaussures étanches de marche confortables',
  },
  'chk-autoriz-cies': {
    es: 'Autorización gratuita Xunta para Islas Cíes (Miércoles 11/11)',
    fr: 'Autorisation gratuite Xunta pour les Îles Cíes (Mercredi 11/11)',
  },
  'chk-marea-catedrais': {
    es: 'Reserva marea baja Playa de las Catedrales (Miércoles 18/11)',
    fr: 'Réservation marée basse Plage des Cathédrales (Mercredi 18/11)',
  },
  'chk-bolsa-termica': {
    es: 'Bolsa térmica para comprar quesos y empanadas en el viaje de regreso',
    fr: 'Sac isotherme pour achat de fromages et empanadas au retour',
  },
  'chk-cargador-coche': {
    es: 'Adaptador de carga múltiple USB para el coche (4 pasajeros)',
    fr: 'Adaptateur multiprise USB pour la voiture (4 passagers)',
  },
};

export function translateChecklistTitle(title: string, lang: Language): string {
  if (lang === 'es') {
    // If it's already Spanish, return or map from French
    for (const item of Object.values(CHECKLIST_TRANSLATIONS)) {
      if (item.fr.toLowerCase() === title.toLowerCase()) return item.es;
    }
    return title;
  }
  // Otherwise translate to French
  for (const item of Object.values(CHECKLIST_TRANSLATIONS)) {
    if (item.es.toLowerCase() === title.toLowerCase()) return item.fr;
  }
  // Fallback simple phrase replacement if custom entered
  return title
    .replace(/documentación/gi, 'documentation')
    .replace(/coche/gi, 'voiture')
    .replace(/aparcamiento/gi, 'stationnement')
    .replace(/parking/gi, 'parking')
    .replace(/apartamentos/gi, 'appartements')
    .replace(/neumáticos/gi, 'pneus')
    .replace(/reserva/gi, 'réservation');
}

export function translateExpenseCategory(category: string, lang: Language): string {
  const isFr = lang === 'fr';
  switch (category) {
    case 'rental':
      return isFr ? 'Location Voiture' : 'Alquiler Coche';
    case 'excursion':
      return isFr ? 'Excursion / Bateau' : 'Excursión / Barco';
    case 'tickets':
      return isFr ? 'Billets / Monuments' : 'Entradas / Monumentos';
    case 'gifts':
      return isFr ? 'Cadeaux / Achats' : 'Regalos / Compras';
    default:
      return isFr ? 'Autres / Divers' : 'Otros / Varios';
  }
}

export function translateExpenseTitle(title: string, lang: Language): string {
  if (lang === 'es') return title;
  const lower = title.toLowerCase();
  if (lower.includes('alquiler') && (lower.includes('coche') || lower.includes('furgoneta'))) {
    return 'Location de véhicule (10 jours)';
  }
  if (lower.includes('barco') || lower.includes('ferry') || lower.includes('cíes')) {
    return 'Traversée en bateau Îles Cíes';
  }
  if (lower.includes('termas') || lower.includes('prexigueiro')) {
    return 'Bains thermaux de Prexigueiro';
  }
  if (lower.includes('regalo') || lower.includes('vino')) {
    return 'Cadeaux de vin et spécialités';
  }
  if (lower.includes('peaje')) {
    return 'Péages autoroutes';
  }
  return title;
}

export function translateExpenseNotes(text: string, lang: Language): string {
  if (lang === 'es' || !text) return text;
  return text
    .replace(/para 4 personas/gi, 'pour 4 personnes')
    .replace(/para 2 parejas/gi, 'pour 2 couples')
    .replace(/por pareja/gi, 'par couple')
    .replace(/por persona/gi, 'par personne')
    .replace(/incluye/gi, 'comprend')
    .replace(/ida y vuelta/gi, 'aller-retour')
    .replace(/peajes/gi, 'péages')
    .replace(/gasolina/gi, 'carburant')
    .replace(/comida/gi, 'repas')
    .replace(/desayuno/gi, 'petit-déjeuner')
    .replace(/cena/gi, 'dîner')
    .replace(/almuerzo/gi, 'déjeuner')
    .replace(/billetes/gi, 'billets')
    .replace(/entradas/gi, 'entrées');
}

export function translateSuggestedArea(area: string, lang: Language): string {
  if (lang === 'es' || !area) return area;
  return area
    .replace(/Casco Histórico/gi, 'Centre Historique')
    .replace(/Casco Monumental/gi, 'Centre Monumental')
    .replace(/Puerto/gi, 'Port')
    .replace(/Paseo marítimo/gi, 'Front de mer')
    .replace(/Paseo del Río/gi, 'Promenade de la Rivière')
    .replace(/Playa de/gi, 'Plage de')
    .replace(/Plaza/gi, 'Place')
    .replace(/aledaño a la Muralla/gi, 'proche des Remparts')
    .replace(/Interior o aledaño/gi, 'Intérieur ou abords')
    .replace(/amurallado/gi, 'fortifié');
}

export function translateTargetNotes(notes: string, lang: Language): string {
  if (lang === 'es' || !notes) return notes;
  return notes
    .replace(/Llegada tras Cañones del Sil\. Conveniente con parking o garaje\./gi, 'Arrivée après le Canyon du Sil. Préférable avec parking ou garage.')
    .replace(/Salida \/ regreso del barco a las Islas Cíes\./gi, 'Départ / retour du bateau pour les Îles Cíes.')
    .replace(/Ciudad con gran centro peatonal, recomendable garaje concertado\./gi, 'Ville avec vaste centre piéton, garage réservé recommandé.')
    .replace(/A 5-10 min a pie de la Catedral de Santiago\./gi, 'À 5-10 min à pied de la Cathédrale de Saint-Jacques.')
    .replace(/Puesta de sol en el Faro de Fisterra \(Fin del Mundo\)\./gi, 'Coucher de soleil au Phare de Fisterra (Bout du Monde).')
    .replace(/Pueblo marinero en la Costa da Morte\./gi, 'Village de pêcheurs sur la Côte de la Mort.')
    .replace(/Alojamiento en Betanzos\. Base perfecta para visitar A Coruña \(a sólo 20 min\) y cenar la famosa tortilla\./gi, 'Hébergement à Betanzos. Base idéale pour visiter La Corogne (à 20 min) et déguster la fameuse tortilla.')
    .replace(/Ruta desde Betanzos pasando por Cedeira y Ortigueira\. Noche en Viveiro \(Mariña Lucense\)\./gi, 'Itinéraire depuis Betanzos via Cedeira et Ortigueira. Nuit à Viveiro (Mariña Lucense).')
    .replace(/Última noche en Galicia antes del regreso a Pinsoro\./gi, 'Dernière nuit en Galice avant le retour à Pinsoro.')
    .replace(/parking o garaje/gi, 'parking ou garage')
    .replace(/a pie/gi, 'à pied');
}

export function translateDayNote(text: string, lang: Language): string {
  if (lang === 'es' || !text) return text;
  let t = text;
  t = t
    .replace(/código de la puerta/gi, 'code de la porte')
    .replace(/código del portal/gi, 'code de l\'immeuble')
    .replace(/código/gi, 'code')
    .replace(/llaves en el cajetín/gi, 'clés dans la boîte à clés')
    .replace(/llaves/gi, 'clés')
    .replace(/llave/gi, 'clé')
    .replace(/buzón/gi, 'boîte aux lettres')
    .replace(/cajetín con combinación/gi, 'boîte à clés sécurisée')
    .replace(/anfitrión/gi, 'hôte')
    .replace(/anfitriona/gi, 'hôte')
    .replace(/propietario/gi, 'propriétaire')
    .replace(/llamar al llegar/gi, 'appeler à l\'arrivée')
    .replace(/llamar antes de llegar/gi, 'appeler avant l\'arrivée')
    .replace(/apartamento/gi, 'hébergement')
    .replace(/piso/gi, 'appartement')
    .replace(/planta/gi, 'étage')
    .replace(/primera planta/gi, '1er étage')
    .replace(/segunda planta/gi, '2ème étage')
    .replace(/tercera planta/gi, '3ème étage')
    .replace(/ascensor/gi, 'ascenseur')
    .replace(/sin ascensor/gi, 'sans ascenseur')
    .replace(/plaza de garaje/gi, 'place de garage')
    .replace(/plaza número/gi, 'place numéro')
    .replace(/plaza nº/gi, 'place n°')
    .replace(/aparcamiento/gi, 'stationnement')
    .replace(/mando del garaje/gi, 'télécommande du garage')
    .replace(/mando a distancia/gi, 'télécommande')
    .replace(/horario de entrada/gi, 'heure d\'arrivée')
    .replace(/horario de salida/gi, 'heure de départ')
    .replace(/check-in a las/gi, 'check-in à')
    .replace(/check-out a las/gi, 'check-out à')
    .replace(/wifi/gi, 'Wi-Fi')
    .replace(/clave del wifi/gi, 'mot de passe Wi-Fi')
    .replace(/contraseña/gi, 'mot de passe')
    .replace(/toallas/gi, 'serviettes')
    .replace(/sábanas/gi, 'draps')
    .replace(/cocina equipada/gi, 'cuisine équipée')
    .replace(/lavadora/gi, 'lave-linge')
    .replace(/calefacción/gi, 'chauffage')
    .replace(/aire acondicionado/gi, 'climatisation')
    .replace(/supermercado/gi, 'supermarché')
    .replace(/panadería/gi, 'boulangerie')
    .replace(/entradas sacadas/gi, 'billets réservés')
    .replace(/reserva confirmada/gi, 'réservation confirmée')
    .replace(/barco a cies/gi, 'bateau pour les Cíes')
    .replace(/barco a cíes/gi, 'bateau pour les Cíes')
    .replace(/autorización/gi, 'autorisation')
    .replace(/catedral/gi, 'cathédrale')
    .replace(/marea baja/gi, 'marée basse')
    .replace(/depósito lleno/gi, 'plein de carburant')
    .replace(/gasolinera/gi, 'station-service')
    .replace(/peaje/gi, 'péage');
  return t;
}

export function hasSpanishParking(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes('aparcamiento') ||
    lower.includes('garaje') ||
    lower.includes('plaza') ||
    lower.includes('mando') ||
    lower.includes('gratuito') ||
    lower.includes('gratuita') ||
    lower.includes('subterráneo') ||
    lower.includes('subterranea') ||
    lower.includes('calle') ||
    lower.includes('edificio') ||
    lower.includes('especificado') ||
    lower.includes('definir') ||
    lower.includes('registrar') ||
    lower.includes('incluido') ||
    lower.includes('cubierto') ||
    lower.includes('ascensor directo')
  );
}

export function hasSpanishNotes(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes('apartamento') ||
    lower.includes('piso') ||
    lower.includes('habitacion') ||
    lower.includes('dormitorio') ||
    lower.includes('cama') ||
    lower.includes('llave') ||
    lower.includes('cajetín') ||
    lower.includes('cajetin') ||
    lower.includes('portal') ||
    lower.includes('anfitrión') ||
    lower.includes('anfitrion') ||
    lower.includes('llegada') ||
    lower.includes('toalla') ||
    lower.includes('sábana') ||
    lower.includes('sabana') ||
    lower.includes('calefacción') ||
    lower.includes('calefaccion') ||
    lower.includes('cocina') ||
    lower.includes('baño') ||
    lower.includes('planta') ||
    lower.includes('vistas') ||
    lower.includes('sin notas')
  );
}

export function translateApartmentField(text: string, lang: Language = 'es'): string {
  if (lang === 'es' || !text) return text;
  let translated = text;

  // 1. Specific Complete Parking Phrases
  translated = translated.replace(/incluido en garaje privado bajo el edificio con mando a distancia/gi, 'Inclus en garage privé sous le bâtiment avec télécommande');
  translated = translated.replace(/plaza de garaje subterránea privada en el propio edificio con ascensor directo/gi, 'Place de garage souterrain privée dans l\'immeuble avec ascenseur direct');
  translated = translated.replace(/plaza de garaje subterránea privada en el propio edificio con ascensor/gi, 'Place de garage souterrain privée dans l\'immeuble avec ascenseur');
  translated = translated.replace(/plaza de garaje subterránea privada en el edificio/gi, 'Place de garage souterrain privée dans l\'immeuble');
  translated = translated.replace(/plaza de garaje subterránea privada/gi, 'Place de garage souterrain privée');
  translated = translated.replace(/garaje privado cerrado en planta baja/gi, 'Garage privé fermé au rez-de-chaussée');
  translated = translated.replace(/garaje privado incluido en el edificio/gi, "Garage privé inclus dans l'immeuble");
  translated = translated.replace(/garaje privado en el propio edificio/gi, "Garage privé dans l'immeuble");
  translated = translated.replace(/garaje subterráneo privado gratuito/gi, 'Garage souterrain privé gratuit');
  translated = translated.replace(/garaje subterráneo gratuito/gi, 'Garage souterrain gratuit');
  translated = translated.replace(/garaje subterráneo privado/gi, 'Garage souterrain privé');
  translated = translated.replace(/garaje subterráneo/gi, 'Garage souterrain');
  translated = translated.replace(/garaje privado cerrado/gi, 'Garage privé fermé');
  translated = translated.replace(/garaje privado gratuito/gi, 'Garage privé gratuit');
  translated = translated.replace(/garaje privado/gi, 'Garage privé');
  translated = translated.replace(/garaje cerrado/gi, 'Garage fermé');
  translated = translated.replace(/garaje en el sótano/gi, 'Garage au sous-sol');
  translated = translated.replace(/garaje con mando/gi, 'Garage avec télécommande');
  translated = translated.replace(/garaje incluido/gi, 'Garage inclus');
  translated = translated.replace(/garaje/gi, 'Garage');
  translated = translated.replace(/plaza de garaje con mando a distancia/gi, 'Place de garage avec télécommande');
  translated = translated.replace(/plaza de garaje con mando/gi, 'Place de garage avec télécommande');
  translated = translated.replace(/plaza de garaje privada/gi, 'Place de garage privée');
  translated = translated.replace(/plaza de garaje incluida/gi, 'Place de garage incluse');
  translated = translated.replace(/plaza de garaje cubierta/gi, 'Place de garage couverte');
  translated = translated.replace(/plaza de garaje/gi, 'Place de garage');
  translated = translated.replace(/plaza reservada/gi, 'Place réservée');
  translated = translated.replace(/plaza de aparcamiento/gi, 'Place de stationnement');
  translated = translated.replace(/parking alameda concertado a 100m con plaza reservada/gi, 'Parking Alameda réservé à 100m avec place dédiée');
  translated = translated.replace(/parking público san lázaro a 150m con pase semanal/gi, 'Parking public San Lázaro à 150m avec pass hebdomadaire');
  translated = translated.replace(/parking público concertado/gi, 'Parking public conventionné');
  translated = translated.replace(/parking público a (\d+)m/gi, 'Parking public à $1m');
  translated = translated.replace(/parking público en las inmediaciones/gi, 'Parking public à proximité');
  translated = translated.replace(/parking subterráneo/gi, 'Parking souterrain');
  translated = translated.replace(/parking cubierto/gi, 'Parking couvert');
  translated = translated.replace(/parking privado/gi, 'Parking privé');
  translated = translated.replace(/parking gratuito/gi, 'Parking gratuit');
  translated = translated.replace(/parking incluido/gi, 'Parking inclus');
  translated = translated.replace(/parking público/gi, 'Parking public');
  translated = translated.replace(/aparcamiento gratuito en la misma calle y plaza reservada/gi, 'Stationnement gratuit dans la rue et place réservée');
  translated = translated.replace(/aparcamiento gratuito en la misma calle/gi, 'Stationnement gratuit dans la même rue');
  translated = translated.replace(/aparcamiento gratuito en la calle/gi, 'Stationnement gratuit dans la rue');
  translated = translated.replace(/aparcamiento gratuito en las inmediaciones/gi, 'Stationnement gratuit à proximité');
  translated = translated.replace(/aparcamiento gratuito/gi, 'Stationnement gratuit');
  translated = translated.replace(/aparcamiento privado gratuito/gi, 'Stationnement privé gratuit');
  translated = translated.replace(/aparcamiento privado en el establecimiento/gi, 'Stationnement privé dans l\'établissement');
  translated = translated.replace(/aparcamiento privado/gi, 'Stationnement privé');
  translated = translated.replace(/aparcamiento subterráneo/gi, 'Stationnement souterrain');
  translated = translated.replace(/aparcamiento cubierto/gi, 'Stationnement couvert');
  translated = translated.replace(/aparcamiento en la calle/gi, 'Stationnement dans la rue');
  translated = translated.replace(/aparcamiento en la vía pública/gi, 'Stationnement sur la voie publique');
  translated = translated.replace(/aparcamiento público/gi, 'Parking public');
  translated = translated.replace(/aparcamiento fácil/gi, 'Stationnement facile');
  translated = translated.replace(/fácil aparcamiento/gi, 'Stationnement facile');
  translated = translated.replace(/zona de fácil aparcamiento/gi, 'Zone de stationnement facile');
  translated = translated.replace(/zona azul/gi, 'Zone bleue (payante)');
  translated = translated.replace(/zona blanca/gi, 'Zone blanche (gratuite)');
  translated = translated.replace(/aparcamiento incluido/gi, 'Stationnement inclus');
  translated = translated.replace(/aparcamiento/gi, 'Stationnement');
  translated = translated.replace(/sin parking/gi, 'Sans parking');
  translated = translated.replace(/no dispone de parking/gi, 'Ne dispose pas de parking');
  translated = translated.replace(/no incluye parking/gi, 'N\'inclut pas de parking');
  translated = translated.replace(/no especificado/gi, 'Non spécifié');
  translated = translated.replace(/no especificada/gi, 'Non spécifiée');
  translated = translated.replace(/pendiente de registrar/gi, 'En attente d\'enregistrement');
  translated = translated.replace(/pendiente de definir/gi, 'À définir');
  translated = translated.replace(/pendiente/gi, 'En attente');

  // Parking Modifiers
  translated = translated.replace(/con mando a distancia/gi, 'avec télécommande');
  translated = translated.replace(/con mando/gi, 'avec télécommande');
  translated = translated.replace(/bajo el edificio/gi, 'sous le bâtiment');
  translated = translated.replace(/en el propio edificio/gi, 'dans l\'immeuble même');
  translated = translated.replace(/en el mismo edificio/gi, 'dans le même immeuble');
  translated = translated.replace(/en planta baja/gi, 'au rez-de-chaussée');
  translated = translated.replace(/con ascensor directo/gi, 'avec ascenseur direct');
  translated = translated.replace(/con ascensor/gi, 'avec ascenseur');
  translated = translated.replace(/sin ascensor/gi, 'sans ascenseur');
  translated = translated.replace(/en la calle/gi, 'dans la rue');
  translated = translated.replace(/en las inmediaciones/gi, 'à proximité');
  translated = translated.replace(/con suplemento/gi, 'avec supplément');
  translated = translated.replace(/reserva previa/gi, 'sur réservation préalable');

  // 2. Cancellation phrases
  translated = translated.replace(/cancelación gratuita hasta 48h antes/gi, "Annulation gratuite jusqu'à 48h avant");
  translated = translated.replace(/cancelación gratuita hasta 24h antes/gi, "Annulation gratuite jusqu'à 24h avant");
  translated = translated.replace(/cancelación gratuita hasta el 8 de noviembre/gi, "Annulation gratuite jusqu'au 8 novembre");
  translated = translated.replace(/cancelación gratuita hasta el 9 de noviembre/gi, "Annulation gratuite jusqu'au 9 novembre");
  translated = translated.replace(/cancelación gratuita hasta el 10 de noviembre/gi, "Annulation gratuite jusqu'au 10 novembre");
  translated = translated.replace(/cancelación gratuita hasta el (\d+) de noviembre/gi, "Annulation gratuite jusqu'au $1 novembre");
  translated = translated.replace(/cancelación gratuita/gi, 'Annulation gratuite');
  translated = translated.replace(/sin cancelación gratuita/gi, 'Sans annulation gratuite');
  translated = translated.replace(/no reembolsable/gi, 'Non remboursable');

  // 3. Distance phrases
  translated = translated.replace(/a (\d+) m de la plaza mayor \((\d+) min a pie\)/gi, 'À $1 m de la Plaza Mayor ($2 min à pied)');
  translated = translated.replace(/a (\d+) m del puerto pesquero \((\d+) min a pie\)/gi, 'À $1 m du port de pêche ($2 min à pied)');
  translated = translated.replace(/a (\d+) m de la catedral del obradoiro \((\d+) min a pie\)/gi, 'À $1 m de la Cathédrale de l\'Obradoiro ($2 min à pied)');
  translated = translated.replace(/a (\d+) m de la catedral/gi, 'À $1 m de la cathédrale');
  translated = translated.replace(/a (\d+) m del centro/gi, 'À $1 m du centre');
  translated = translated.replace(/a (\d+) m de/gi, 'À $1 m de');
  translated = translated.replace(/a (\d+) metros de/gi, 'À $1 mètres de');
  translated = translated.replace(/en pleno centro histórico/gi, 'En plein cœur du centre historique');
  translated = translated.replace(/en el centro histórico/gi, 'Dans le centre historique');
  translated = translated.replace(/en el casco antiguo/gi, 'Dans la vieille ville');
  translated = translated.replace(/en el centro/gi, 'En centre-ville');
  translated = translated.replace(/primera línea de playa/gi, 'Première ligne de plage');
  translated = translated.replace(/a pie de playa/gi, 'En bord de plage');
  translated = translated.replace(/a pie de/gi, 'Au pied de');
  translated = translated.replace(/min a pie/gi, 'min à pied');
  translated = translated.replace(/vistas a la ría/gi, 'Vues sur la ría');
  translated = translated.replace(/vistas al mar/gi, 'Vues sur la mer');

  // 4. Notes & Apartment Description Phrases
  translated = translated.replace(/apartamento de dos dormitorios/gi, 'appartement de deux chambres');
  translated = translated.replace(/apartamento de tres dormitorios/gi, 'appartement de trois chambres');
  translated = translated.replace(/apartamento de un dormitorio/gi, 'appartement d\'une chambre');
  translated = translated.replace(/apartamento céntrico con ascensor/gi, 'appartement central avec ascenseur');
  translated = translated.replace(/apartamento céntrico/gi, 'appartement central');
  translated = translated.replace(/apartamento amplio para 4 personas/gi, 'appartement spacieux pour 4 personnes');
  translated = translated.replace(/apartamento amplio/gi, 'appartement spacieux');
  translated = translated.replace(/apartamento completo/gi, 'logement entier');
  translated = translated.replace(/piso céntrico con ascensor/gi, 'appartement central avec ascenseur');
  translated = translated.replace(/piso céntrico/gi, 'appartement central');
  translated = translated.replace(/piso reformado/gi, 'appartement rénové');
  translated = translated.replace(/piso luminoso/gi, 'appartement lumineux');
  translated = translated.replace(/piso amplio/gi, 'appartement spacieux');
  translated = translated.replace(/piso tranquilo/gi, 'appartement calme');
  translated = translated.replace(/cama de matrimonio/gi, 'grand lit double');
  translated = translated.replace(/camas individuales/gi, 'lits simples');
  translated = translated.replace(/dos camas individuales/gi, 'deux lits simples');
  translated = translated.replace(/cama doble/gi, 'lit double');
  translated = translated.replace(/sofá cama/gi, 'canapé-lit');
  translated = translated.replace(/dos dormitorios/gi, 'deux chambres');
  translated = translated.replace(/tres dormitorios/gi, 'trois chambres');
  translated = translated.replace(/un dormitorio/gi, 'une chambre');
  translated = translated.replace(/dos habitaciones/gi, 'deux chambres');
  translated = translated.replace(/tres habitaciones/gi, 'trois chambres');
  translated = translated.replace(/habitaciones amplias/gi, 'chambres spacieuses');
  translated = translated.replace(/baño completo/gi, 'salle de bain complète');
  translated = translated.replace(/dos baños completos/gi, 'deux salles de bain complètes');
  translated = translated.replace(/dos baños/gi, 'deux salles de bain');
  translated = translated.replace(/un baño/gi, 'une salle de bain');
  translated = translated.replace(/llegada autónoma con cajetín/gi, 'arrivée autonome avec boîte à clés');
  translated = translated.replace(/llegada autónoma/gi, 'arrivée autonome');
  translated = translated.replace(/cajetín con combinación/gi, 'boîte à clés avec code');
  translated = translated.replace(/cajetín de llaves/gi, 'boîte à clés');
  translated = translated.replace(/cajetín/gi, 'boîte à clés');
  translated = translated.replace(/código de acceso/gi, 'code d\'accès');
  translated = translated.replace(/código del portal/gi, 'code de l\'immeuble');
  translated = translated.replace(/código de la puerta/gi, 'code de la porte');
  translated = translated.replace(/código/gi, 'code');
  translated = translated.replace(/llaves en el cajetín/gi, 'clés dans la boîte à clés');
  translated = translated.replace(/llaves en mano/gi, 'remise des clés en main propre');
  translated = translated.replace(/llaves/gi, 'clés');
  translated = translated.replace(/anfitrión nos espera en el portal/gi, 'l\'hôte nous attend devant l\'immeuble');
  translated = translated.replace(/anfitrión nos espera/gi, 'l\'hôte nous accueille');
  translated = translated.replace(/anfitrión/gi, 'hôte');
  translated = translated.replace(/anfitriona/gi, 'hôte');
  translated = translated.replace(/propietario/gi, 'propriétaire');
  translated = translated.replace(/llamar al llegar/gi, 'appeler à l\'arrivée');
  translated = translated.replace(/llamar antes de llegar/gi, 'appeler avant d\'arriver');
  translated = translated.replace(/avisar media hora antes/gi, 'prévenir 30 min avant l\'arrivée');
  translated = translated.replace(/toallas y sábanas incluidas/gi, 'serviettes et draps inclus');
  translated = translated.replace(/toallas/gi, 'serviettes');
  translated = translated.replace(/sábanas/gi, 'draps');
  translated = translated.replace(/cocina totalmente equipada/gi, 'cuisine entièrement équipée');
  translated = translated.replace(/cocina equipada/gi, 'cuisine équipée');
  translated = translated.replace(/calefacción encendida/gi, 'chauffage allumé');
  translated = translated.replace(/calefacción/gi, 'chauffage');
  translated = translated.replace(/aire acondicionado/gi, 'climatisation');
  translated = translated.replace(/lavadora/gi, 'lave-linge');
  translated = translated.replace(/secadora/gi, 'sèche-linge');
  translated = translated.replace(/lavavajillas/gi, 'lave-vaisselle');
  translated = translated.replace(/balcón con vistas/gi, 'balcon avec vue');
  translated = translated.replace(/balcón/gi, 'balcon');
  translated = translated.replace(/terraza con vistas/gi, 'terrasse avec vue');
  translated = translated.replace(/terraza/gi, 'terrasse');
  translated = translated.replace(/primera planta/gi, '1er étage');
  translated = translated.replace(/segunda planta/gi, '2ème étage');
  translated = translated.replace(/tercera planta/gi, '3ème étage');
  translated = translated.replace(/cuarta planta/gi, '4ème étage');
  translated = translated.replace(/planta baja/gi, 'rez-de-chaussée');
  translated = translated.replace(/silencioso/gi, 'calme');
  translated = translated.replace(/tranquilo/gi, 'paisible');
  translated = translated.replace(/reformado/gi, 'rénové');
  translated = translated.replace(/luminoso/gi, 'lumineux');
  translated = translated.replace(/wifi rápido/gi, 'Wi-Fi rapide');
  translated = translated.replace(/clave del wifi/gi, 'mot de passe Wi-Fi');
  translated = translated.replace(/contraseña/gi, 'mot de passe');
  translated = translated.replace(/sin notas/gi, 'Sans notes particulières');
  translated = translated.replace(/para 4 personas/gi, 'pour 4 personnes');
  translated = translated.replace(/para 2 parejas/gi, 'pour 2 couples');
  translated = translated.replace(/por pareja/gi, 'par couple');

  return translated;
}

export const UI_TRANSLATIONS: Record<Language, Record<string, string>> = {
  es: {
    // Header
    appTitle: 'Expedición Noroeste · Galicia 10 Días',
    appSubtitle: 'Pinsoro (Zgz) → Galicia | 10 Días (9 Noches) | Circuito Completo',
    twoCouples: '2 Parejas (4 Pasajeros)',
    firestoreActive: 'Firestore Activo',
    lodgings: 'Alojamientos',
    customNightsCount: '9 Noches personalizadas',
    realDistance: 'Distancia Real',
    copilotButton: 'Copiloto Maps',
    language: 'Idioma',

    // Tabs
    tabMap: 'Itinerario y Mapa',
    tabApartments: 'Apartamentos (<120€)',
    tabGastronomy: 'Gastronomía y Vinos',
    tabBudget: 'Calculadora de Costes y Gastos',
    tabChecklist: 'Checklist de Salida',

    // Day Selector
    dayWord: 'DÍA',
    allDaysView: 'Todas las Etapas',
    seeAll10Days: 'Resumen Global',
    selectStageToExplore: 'Selecciona una etapa para explorar',
    viewDay: 'VER DÍA',
    allStagesTitle: 'Resumen de las 10 Etapas desde Pinsoro (Zaragoza)',

    // Map filters & layers
    layers: 'Capas:',
    filterAll: 'Mostrar Todo',
    filterTourist: 'Turismo',
    filterGastro: 'Gastronomía',
    filterLodging: 'Aptos <120€',
    stageLabel: 'ETAPA:',
    mapDark: 'Oscuro',
    mapSatellite: 'Satélite',
    mapTerrain: 'Relieve',
    dayActiveBadge: 'ACTIVO',
    realRoadDistance: 'Distancia real por carretera:',
    openMapLink: 'Abrir mapa',
    startPointPinsoro: 'Salida: Pinsoro',

    // Actions
    downloadPdf: 'Descargar Dossier PDF',
    generatingPdf: 'Generando PDF...',
    shareRoute: 'Compartir Itinerario',
    linkCopied: '¡Enlace copiado al portapapeles!',

    // Day Detail
    kmReal: 'km reales',
    driveTimeLabel: 'conducción',
    stagesAndStops: 'Tramos de Carretera & Distancias',
    touristAttractions: 'Visitas Turísticas & Miradores Recomendados',
    gastronomyRecommendations: 'Gastronomía & Platos Típicos en Ruta',
    stageNotes: 'Apuntes & Notas de la Etapa',
    stageNotesDesc: 'Añade recordatorios, códigos de llaves o notas personales (guardado en la nube).',
    saveNotes: 'Guardar Notas',
    savingNotes: 'Guardando...',
    notesSaved: '¡Notas guardadas en Firestore!',
    emptyNotesPlaceholder: 'Escribe aquí anotaciones, recomendaciones de amigos o detalles del día...',

    // Accommodation Card
    editAptButton: 'Modificar Datos de este Apartamento',
    addAptButton: 'Añadir / Registrar Apartamento Real',
    aptTitle: 'Alojamiento Reservado con Parking',
    aptPendingTitle: 'Alojamiento Pendiente de Registrar',
    aptPendingSubtitle: 'Introduce el apartamento que reserves para este día',
    perNightTotal: 'Precio Total Noche (4 Pax):',
    perCoupleNight: 'Por Pareja:',
    checkInLabel: 'Check-in:',
    checkOutLabel: 'Check-out:',
    parkingLabel: 'Parking:',
    distanceCenterLabel: 'Distancia al Centro:',
    bathroomsLabel: 'Baños:',
    cancellationLabel: 'Cancelación:',
    freeCancellation: 'Cancelación Gratuita',

    // Budget & Calculator
    budgetTitle: 'Calculadora de Presupuesto & Gastos Compartidos',
    fuelPriceLabel: 'Precio Carburante:',
    consumptionLabel: 'Consumo del Coche:',
    mealsBudgetLabel: 'Comidas & Restaurantes (Pareja / Día):',
    addExpenseButton: 'Añadir Nuevo Gasto',
    cancel: 'Cancelar',
    clearAllExpenses: 'Eliminar Todos los Gastos',
    expenseConceptLabel: 'Concepto / Título *',
    expenseCategoryLabel: 'Categoría',
    expenseAmountLabel: 'Importe (€) *',
    expenseNotesLabel: 'Notas adicionales (opcional)',
    saveExpenseCloud: 'Guardar Gasto en la Nube',
    breakdownTitle: 'Desglose Completo del Presupuesto (Totales y Por Pareja)',
    grandTotalLabel: 'Total Presupuesto:',
    totalLodgingTitle: '9 Noches en Apartamentos Reales con Parking',
    fuelBreakdownTitle: 'Combustible',
    mealsBreakdownTitle: 'Comidas, Tapas & Vinos (10 días para 2 parejas)',
    checklistTitle: 'Checklist de Salida desde Pinsoro (4 Pasajeros)',
    addChecklistPlaceholder: 'Añadir nueva tarea o recordatorio...',
    addButton: 'Añadir',

    // Attribution ByL & AyM
    assignedToLabel: 'Imputar gasto a:',
    assignBoth: 'Ambas Parejas (50% Bruno y Loles / 50% Alberto y Mari)',
    assignByL: 'Solo Pareja ByL · Bruno y Loles (100%)',
    assignAyM: 'Solo Pareja AyM · Alberto y Mari (100%)',
    coupleByL: 'Pareja ByL (Bruno y Loles)',
    coupleAyM: 'Pareja AyM (Alberto y Mari)',
    totalByL: 'Total Pareja ByL (Bruno y Loles)',
    totalAyM: 'Total Pareja AyM (Alberto y Mari)',
    sharedBaseCosts: 'Base común compartida (Aloj., Comb., Peajes, Comidas)',
    sharedBaseTravelHalf: 'Base fija del viaje (50% Aloj., Comb., Peajes, Comidas)',
    sharedCustomHalf: 'Gastos adicionales compartidos (50%)',
    sharedCustomDetailTitle: 'Detalle de gastos adicionales compartidos (50% cada pareja):',
    exclusiveCosts: 'Gastos exclusivos de esta pareja',
    sharedHalf: '50% de gastos comunes',
    settlementTitle: 'Liquidación y Reparto entre Parejas (Bruno y Loles vs Alberto y Mari)',
    settlementSubtitle: 'Cálculo transparente con imputación 50/50 de gastos comunes y 100% de gastos propios',
    exclusiveNotice: 'Gasto exclusivo',
    sharedNotice: 'Gasto compartido (50/50)',

    // Checklist Hub
    checklistNavTitle: 'Checklist de Salida desde Pinsoro',
    checklistSubtitle: 'Listado optimizado de preparación del coche, documentación, autorizaciones y equipaje para 4 viajeros',
    filterAllChecklist: 'Todos',
    filterPendingChecklist: 'Pendientes',
    filterDoneChecklist: 'Listos',
    progressLabel: 'Progreso de comprobaciones',
    allDoneSuccess: '¡Todo preparado para la salida desde Pinsoro!',
    pendingItemsAlert: 'tareas pendientes antes de emprender viaje',

    // Copilot
    copilotTitle: 'Copiloto de Viaje Galicia con IA',
    copilotSubtitle: 'Asistente experto en rutas, paradas, parkings y gastronomía con Google Maps',
    askCopilotPlaceholder: 'Ej. ¿Dónde comer el mejor pulpo en Ourense? ¿Cómo llegar a Cíes?',
    sendButton: 'Enviar',
    closeButton: 'Cerrar',
  },
  fr: {
    // Header
    appTitle: 'Expédition Nord-Ouest · Galice 10 Jours',
    appSubtitle: 'Pinsoro (Saragosse) → Galice | 10 Jours (9 Nuits) | Circuit Complet',
    twoCouples: '2 Couples (4 Voyageurs)',
    firestoreActive: 'Firestore Actif',
    lodgings: 'Hébergements',
    customNightsCount: '9 Nuits personnalisées',
    realDistance: 'Distance Réelle',
    copilotButton: 'Copilote Maps',
    language: 'Langue',

    // Tabs
    tabMap: 'Itinéraire et Carte',
    tabApartments: 'Hébergements (<120€)',
    tabGastronomy: 'Gastronomie et Vins',
    tabBudget: 'Calculateur de Coûts et Dépenses',
    tabChecklist: 'Checklist de Départ',

    // Day Selector
    dayWord: 'JOUR',
    allDaysView: 'Toutes les Étapes',
    seeAll10Days: 'Vue d\'Ensemble',
    selectStageToExplore: 'Sélectionnez une étape à explorer',
    viewDay: 'VOIR JOUR',
    allStagesTitle: 'Résumé des 10 Étapes depuis Pinsoro (Saragosse)',

    // Map filters & layers
    layers: 'Calques:',
    filterAll: 'Tout Afficher',
    filterTourist: 'Tourisme',
    filterGastro: 'Gastronomie',
    filterLodging: 'Héb. <120€',
    stageLabel: 'ÉTAPE:',
    mapDark: 'Sombre',
    mapSatellite: 'Satellite',
    mapTerrain: 'Relief',
    dayActiveBadge: 'ACTIF',
    realRoadDistance: 'Distance routière réelle:',
    openMapLink: 'Ouvrir la carte',
    startPointPinsoro: 'Départ: Pinsoro',

    // Actions
    downloadPdf: 'Télécharger le Dossier PDF',
    generatingPdf: 'Génération du PDF...',
    shareRoute: 'Partager l\'Itinéraire',
    linkCopied: 'Lien copié dans le presse-papier !',

    // Day Detail
    kmReal: 'km réels',
    driveTimeLabel: 'conduite',
    stagesAndStops: 'Tronçons Routiers & Distances',
    touristAttractions: 'Visites Touristiques & Belvédères Conseillés',
    gastronomyRecommendations: 'Gastronomie & Spécialités Régionales',
    stageNotes: 'Notes & Rappels de l\'Étape',
    stageNotesDesc: 'Ajoutez des rappels, codes de clés ou notes personnelles (synchronisé dans le cloud).',
    saveNotes: 'Enregistrer les Notes',
    savingNotes: 'Enregistrement...',
    notesSaved: 'Notes enregistrées sur Firestore !',
    emptyNotesPlaceholder: 'Écrivez ici vos mémos, recommandations d\'amis ou détails de la journée...',

    // Accommodation Card
    editAptButton: 'Modifier les Données de cet Hébergement',
    addAptButton: 'Ajouter / Enregistrer l\'Hébergement Réel',
    aptTitle: 'Hébergement Réservé avec Parking',
    aptPendingTitle: 'Hébergement en Attente d\'Enregistrement',
    aptPendingSubtitle: 'Renseignez l\'appartement réservé pour ce jour',
    perNightTotal: 'Prix Total par Nuit (4 Pax):',
    perCoupleNight: 'Par Couple:',
    checkInLabel: 'Arrivée (Check-in):',
    checkOutLabel: 'Départ (Check-out):',
    parkingLabel: 'Parking:',
    distanceCenterLabel: 'Distance du Centre:',
    bathroomsLabel: 'Salles de Bain:',
    cancellationLabel: 'Annulation:',
    freeCancellation: 'Annulation Gratuite',

    // Budget & Calculator
    budgetTitle: 'Calculateur de Budget & Dépenses Partagées',
    fuelPriceLabel: 'Prix du Carburant:',
    consumptionLabel: 'Consommation du Véhicule:',
    mealsBudgetLabel: 'Repas & Restaurants (Couple / Jour):',
    addExpenseButton: 'Ajouter une Nouvelle Dépense',
    cancel: 'Annuler',
    clearAllExpenses: 'Supprimer Toutes les Dépenses',
    expenseConceptLabel: 'Libellé / Titre *',
    expenseCategoryLabel: 'Catégorie',
    expenseAmountLabel: 'Montant (€) *',
    expenseNotesLabel: 'Notes complémentaires (facultatif)',
    saveExpenseCloud: 'Enregistrer la Dépense dans le Cloud',
    breakdownTitle: 'Ventilation Complète du Budget (Totaux et Par Couple)',
    grandTotalLabel: 'Budget Total Estimé:',
    totalLodgingTitle: '9 Nuits en Appartements Entiers avec Parking',
    fuelBreakdownTitle: 'Carburant',
    mealsBreakdownTitle: 'Repas, Tapas & Vins (10 jours pour 2 couples)',
    checklistTitle: 'Check-list de Départ depuis Pinsoro (4 Voyageurs)',
    addChecklistPlaceholder: 'Ajouter une tâche ou un rappel...',
    addButton: 'Ajouter',

    // Attribution ByL & AyM
    assignedToLabel: 'Imputer la dépense à :',
    assignBoth: 'Deux Couples (50% Bruno & Loles / 50% Alberto & Mari)',
    assignByL: 'Seulement Couple ByL · Bruno & Loles (100%)',
    assignAyM: 'Seulement Couple AyM · Alberto & Mari (100%)',
    coupleByL: 'Couple ByL (Bruno & Loles)',
    coupleAyM: 'Couple AyM (Alberto & Mari)',
    totalByL: 'Total Couple ByL (Bruno & Loles)',
    totalAyM: 'Total Couple AyM (Alberto & Mari)',
    sharedBaseCosts: 'Base commune partagée (Héb., Carb., Péages, Repas)',
    sharedBaseTravelHalf: 'Base fixe du voyage (50% Héb., Carb., Péages, Repas)',
    sharedCustomHalf: 'Frais supplémentaires partagés (50%)',
    sharedCustomDetailTitle: 'Détail des frais supplémentaires partagés (50% par couple) :',
    exclusiveCosts: 'Dépenses exclusives de ce couple',
    sharedHalf: '50% des dépenses communes',
    settlementTitle: 'Bilan et Répartition par Couple (Bruno & Loles vs Alberto & Mari)',
    settlementSubtitle: 'Calcul transparent avec répartition 50/50 des coûts communs et 100% des frais exclusifs',
    exclusiveNotice: 'Dépense exclusive',
    sharedNotice: 'Dépense partagée (50/50)',

    // Checklist Hub
    checklistNavTitle: 'Check-list de Départ depuis Pinsoro',
    checklistSubtitle: 'Liste optimisée pour la préparation du véhicule, permis, réservations et bagages pour 4 voyageurs',
    filterAllChecklist: 'Tous',
    filterPendingChecklist: 'En attente',
    filterDoneChecklist: 'Prêts',
    progressLabel: 'Progression des vérifications',
    allDoneSuccess: 'Tout est prêt pour le départ depuis Pinsoro !',
    pendingItemsAlert: 'vérifications restantes avant de prendre la route',

    // Copilot
    copilotTitle: 'Copilote IA Voyage en Galice',
    copilotSubtitle: 'Assistant expert en itinéraires, arrêts, parkings et gastronomie avec Google Maps',
    askCopilotPlaceholder: 'Ex: Où déguster le meilleur poulpe à Ourense ? Comment aller aux Cíes ?',
    sendButton: 'Envoyer',
    closeButton: 'Fermer',
  },
};
