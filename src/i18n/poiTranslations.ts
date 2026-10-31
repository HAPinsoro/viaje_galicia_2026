import { PointOfInterest } from '../types/trip';
import { Language } from './translations';

export interface LocalizedPoiContent {
  name?: string;
  description: string;
  tips?: string;
  dishRecommendations?: string[];
  stayDuration?: string;
}

export const POI_FR_TRANSLATIONS: Record<string, LocalizedPoiContent> = {
  // ==========================================
  // --- JOUR 1 : PINSORO → SIL → OURENSE ---
  // ==========================================
  'poi-pinsoro-start': {
    name: 'Pinsoro (Saragosse)',
    description: 'Point de départ de l\'expédition de 10 jours le mardi 10 novembre 2026. Départ matinal prévu à 07h30.',
    tips: 'Vérifier la pression des pneumatiques, coffre optimisé pour 4 personnes et plein d\'essence effectué avant d\'emprunter l\'A-68 en direction de La Rioja/Burgos.',
    stayDuration: 'Départ 07h30',
  },
  'poi-balcones-madrid': {
    name: 'Belvédère Balcones de Madrid (Canyon du Sil)',
    description: 'L\'un des belvédères les plus spectaculaires d\'Espagne, suspendu au-dessus des gorges du fleuve Sil à plus de 500 mètres d\'altitude au cœur de la Ribeira Sacra.',
    tips: 'Stationnement gratuit à 200 m du belvédère. Sentier aménagé, plat et sécurisé avec balustrades.',
    stayDuration: '50 min de visite',
  },
  'poi-as-burgas': {
    name: 'Sources Thermales d\'As Burgas',
    description: 'Sources thermales emblématiques du centre historique d\'Ourense où l\'eau minérale jaillit naturellement à plus de 67 °C depuis l\'époque romaine.',
    tips: 'Admirez le bassin thermal public et les fontaines néoclassiques. L\'eau sort très chaude directement de la roche.',
    stayDuration: '45 min de visite',
  },
  'poi-catedral-ourense': {
    name: 'Cathédrale San Martiño et Portique du Paradis',
    description: 'Majestueuse cathédrale-forteresse romane et gothique abritant le Portique du Paradis, chef-d\'œuvre polychrome de la sculpture médiévale galicienne.',
    tips: 'Audioguide très complet inclus avec l\'entrée. Ne manquez pas la chapelle Santo Cristo et les détails peints du portique.',
    stayDuration: '1 heure de visite',
  },
  'gastro-a-taberna-ourense': {
    name: 'Restaurant A Taberna (Ourense)',
    description: 'Restaurant galicien emblématique dans une demeure seigneuriale en pierre. Référence gastronomique pour les viandes de bœuf Rubia Gallega, le poulpe et les vins de Ribeira Sacra.',
    tips: 'Réservation conseillée pour le premier dîner galicien. Demandez une table dans la salle voûtée en pierre.',
    dishRecommendations: ['Poulpe á feira et cachelos (pommes de terre galiciennes)', 'Côtelettes d\'agneau de lait rôties', 'Gâteau maison aux châtaignes d\'Ourense'],
    stayDuration: '1h 30m de dîner',
  },

  // ==========================================
  // --- JOUR 2 : OURENSE → VIGO / ÎLES CÍES → BAIONA ---
  // ==========================================
  'poi-islas-cies': {
    name: 'Parc National des Îles Cíes (Plage de Rodas & Phare)',
    description: 'L\'archipel atlantique vierge des Îles Cíes : sable blanc nacré, eaux turquoise cristallines et sentiers côtiers aux falaises de plus de 150 mètres.',
    tips: 'Réservation des billets de catamaran et autorisation Xunta indispensables. Prévoir des chaussures confortables pour la montée au phare.',
    stayDuration: '5h 15m sur l\'île',
  },
  'poi-faro-cies': {
    name: 'Sentier du Phare de Cíes & Belvédère Pedra da Campá',
    description: 'Randonnée côtière spectaculaire montant en lacets doux jusqu\'au phare des Cíes, dominant de vertigineuses falaises océaniques où niche la colonie de mouettes.',
    tips: 'Montée progressive de 3,5 km sans difficulté technique. Emportez de l\'eau fraîche et des baskets confortables.',
    stayDuration: '2h de marche',
  },
  'poi-monterreal-baiona': {
    name: 'Forteresse de Monterreal & Remparts de Baiona',
    description: 'Citadelle fortifiée du XIVe siècle protégée par 3 km de courtines en granit dominant les vagues de l\'Atlantique et l\'entrée de la baie abritée de Baiona.',
    tips: 'Promenade splendide sur les remparts face au coucher de soleil sur les îles Cíes au large.',
    stayDuration: '1h 30m de balade',
  },
  'gastro-rua-ostras': {
    name: 'Rúa da Pescadería (Rue des Huîtres de Vigo)',
    description: 'Les célèbres ostréicultrices traditionnelles de Vigo ouvrent des douzaines d\'huîtres vivantes ultra fraîches sur les comptoirs en granit, accompagnées d\'un verre d\'Albariño bien frais.',
    tips: 'Commandez vos huîtres ouvertes à la minute sur le trottoir et installez-vous à la terrasse attenante pour un verre de vin blanc.',
    dishRecommendations: ['Douzaine d\'huîtres plates de la Ría de Vigo', 'Pétoncles noirs (zamburiñas) à la plancha', 'Verre d\'Albariño D.O. Rías Baixas'],
    stayDuration: '1h de dégustation',
  },
  'gastro-ostras-a-pedra': {
    name: 'Rue des Huîtres (A Pedra, Vigo)',
    description: 'Ruelle maritime mythique du vieux port de Vigo où les huîtres plates fraîches de la ría sont ouvertes et dégustées à la minute.',
    tips: 'Commandez votre douzaine d\'huîtres sur le pavé et installez-vous à la terrasse attenante avec un verre de vin Albariño.',
    dishRecommendations: ['Douzaine d\'huîtres plates de la Ría de Vigo', 'Verre de vin blanc D.O. Rías Baixas', 'Beignets de calamars dorés'],
    stayDuration: '1h de dégustation',
  },
  'gastro-meson-baiona': {
    name: 'Mesón Fonte de Zeta / O Moscón (Baiona)',
    description: 'Marisquería traditionnelle au cœur du centre historique de Baiona, spécialisée dans les étrilles (nécoras), coques et poissons sauvages préparés à la galicienne.',
    tips: 'Situé dans la chaleureuse rue piétonne Ventura Misa. Les fruits de mer de la criée y sont d\'une fraîcheur incomparable.',
    dishRecommendations: ['Plat d\'étrilles (nécoras) fraîches pour 4 personnes', 'Pétoncles sautés aux herbes et ail', 'Calamars frais de pêche côtière'],
    stayDuration: '1h 45m de dîner',
  },
  'gastro-puerto-baiona': {
    name: 'Restaurant O Moscón (Baiona)',
    description: 'Taverne de marins historique face au port de pêche de Baiona, réputée pour ses arrivages de la criée et plateaux de fruits de mer vivants.',
    tips: 'Commandez le riz au homard ou l\'araignée de mer décortiquée.',
    dishRecommendations: ['Plateau de fruits de mer royal (araignée de mer, pouces-pieds, langoustines)', 'Riz crémeux au homard bleu', 'Gâteau traditionnel de Saint-Jacques'],
    stayDuration: '1h 45m de dîner',
  },

  // ==========================================
  // --- JOUR 3 : BAIONA → COMBARRO → O GROVE → PONTEVEDRA ---
  // ==========================================
  'poi-combarro-horreos': {
    name: 'Ensemble Historique de Combarro & ses 30 Greniers (Hórreos)',
    description: 'Village marin classé Bien d\'Intérêt Culturel avec plus de 30 hórreos centenaires en granit alignés directement le long du rivage à marée montante.',
    tips: 'Garez-vous au parking du port de plaisance à l\'entrée pour éviter les ruelles étroites pavées.',
    stayDuration: '1h 30m de visite',
  },
  'poi-illa-toxa': {
    name: 'Île de La Toja & Chapelle des Coquilles',
    description: 'Île thermale historique reliée par un pont centenaire, renommée pour sa chapelle recouverte de coquilles Saint-Jacques et ses jardins maritimes.',
    tips: 'Visitez la chapelle couverte de coquilles et profitez de la pinède parfumée longeant l\'estuaire.',
    stayDuration: '45 min de visite',
  },
  'poi-pontevedra-casco': {
    name: 'Centre Historique de Pontevedra & Praza da Leña',
    description: 'L\'un des centres historiques piétonniers les mieux préservés d\'Europe, avec arcades de granit, calvaires anciens et places animées bordées de terrasses.',
    tips: 'La Praza da Leña est l\'endroit parfait pour savourer tapas et vin rouge Mencía en soirée.',
    stayDuration: '2 heures de balade',
  },
  'gastro-o-grove-marisco': {
    name: 'Taberna Lavandeiro / Asador O Chiringuito (O Grove)',
    description: 'Restaurant marin réputé près du port de pêche d\'O Grove, capitale incontestée du fruit de mer, célèbre pour ses arrivages de la criée et ses riz parfumés.',
    tips: 'Goûtez l\'incroyable riz crémeux au homard ou les couteaux de mer grillés à l\'huile d\'olive et citron.',
    dishRecommendations: ['Riz crémeux au homard bleu pour 4 personnes', 'Couteaux de mer grillés à la plancha avec citron', 'Bouteille d\'Albariño frais des Rías Baixas'],
    stayDuration: '1h 45m de déjeuner',
  },
  'gastro-d-berto-grove': {
    name: 'D\'Berto / Marisqueiras d\'O Grove',
    description: 'Temple gastronomique absolu des produits de la mer d\'O Grove, célèbre pour ses pièces sauvages d\'exception et ses coquillages géants.',
    tips: 'L\'un des meilleurs restaurants de fruits de mer d\'Espagne. Dégustez les pouces-pieds cuits à la vapeur d\'eau de mer.',
    dishRecommendations: ['Pouces-pieds géants de la côte atlantique', 'Palourdes géantes à la marinière', 'Turbot sauvage grillé au feu de bois'],
    stayDuration: '2h de déjeuner',
  },
  'gastro-pontevedra-taberna': {
    name: 'Casa Fidel O Pulpeiro / Taberna Verdura (Pontevedra)',
    description: 'Taverne galicienne emblématique au cœur du quartier des vins de Pontevedra, réputée pour son poulpe découpé aux ciseaux fumant et sa caldeirada de poissons nobles.',
    tips: 'Commandez le poulpe á feira servi sur assiette en bois avec un pichet de vin servi dans la traditionnelle cunca en faïence.',
    dishRecommendations: ['Poulpe á feira au paprika de la Vera et huile vierge', 'Piments de Padrón sautés', 'Vin de pays Ribeiro servi dans la coupelle traditionnelle'],
    stayDuration: '2h de dîner',
  },
  'gastro-casa-fidel-pontevedra': {
    name: 'Casa Fidel O Pulpeiro (Pontevedra)',
    description: 'Institution emblématique depuis 1953, où le poulpe est préparé dans de grands chaudrons traditionnels en cuivre selon la recette séculaire de Carballiño.',
    tips: 'Le poulpe á feira est découpé aux ciseaux et servi chaud sur un plateau en bois avec huile d\'olive vierge et paprika.',
    dishRecommendations: ['Poulpe á feira servi sur bois avec cachelos', 'Empanada maison aux pétoncles galiciens', 'Pichet de vin blanc Ribeiro'],
    stayDuration: '1h 30m de dîner',
  },

  // ==========================================
  // --- JOUR 4 : PONTEVEDRA → CAMBADOS → PADRÓN → SAINT-JACQUES ---
  // ==========================================
  'poi-fefinans-cambados': {
    name: 'Place et Palais de Fefiñáns (Cambados)',
    description: 'L\'une des places pavées les plus harmonieuses d\'Espagne, entourée par le manoir féodal du XVIe siècle, son pont en arc et les chais historiques de vin Albariño.',
    tips: 'Stationnement public gratuit aménagé sur le front de mer à 80 m de la place Fefiñáns.',
    stayDuration: '2 heures de visite et dégustation',
  },
  'poi-feifinans-cambados': {
    name: 'Place et Palais de Fefiñáns (Cambados)',
    description: 'Chef-d\'œuvre architectural Renaissance en granit du XVIe siècle dans la capitale mondiale du prestigieux cépage blanc Albariño.',
    tips: 'Admirez la tour de l\'hommage et le pont en arc reliant le pazo aux jardins seigneuriaux.',
    stayDuration: '45 min de visite',
  },
  'poi-bodega-albarino': {
    name: 'Domaine Viticole Palais de Fefiñanes / Gil Armada',
    description: 'Caves voûtées séculaires et vignes centenaires en treille de cépage blanc Albariño au sein même du pazo historique.',
    tips: 'Dégustation comparative des cuvées élevées sur lies fines.',
    stayDuration: '1h de visite œnologique',
  },
  'poi-padron': {
    name: 'Padrón & Terroir d\'Herbón',
    description: 'Bourgade fluviale mythique baignée par la Sar, terre d\'origine des célèbres piments galiciens (« uns pican e outros non »).',
    tips: 'Commandez une portion de piments de Padrón frits à l\'huile d\'olive et fleur de sel dans une auberge locale.',
    stayDuration: '1h de halte',
  },
  'poi-padron-pedron': {
    name: 'Église Saint-Jacques et « O Pedrón » (Padrón)',
    description: 'Sanctuaire historique abritant la borne romaine légendaire où la tradition rapporte que fut amarrée la barque de pierre apportant la dépouille de l\'Apôtre Jacques.',
    tips: 'Visite courte et émouvante au pied de l\'autel de l\'église Saint-Jacques en bord de rivière.',
    stayDuration: '1 heure de visite',
  },
  'poi-catedral-santiago': {
    name: 'Cathédrale de Saint-Jacques & Place de l\'Obradoiro',
    description: 'Point d\'aboutissement spirituel du millénaire Chemin de Compostelle. Façade baroque grandiose, crypte de l\'Apôtre et nef romane monumentale.',
    tips: 'Admirez la façade ouest illuminée depuis le centre de la Praza do Obradoiro à la tombée de la nuit.',
    stayDuration: '2h de visite',
  },
  'gastro-padron-alpendre': {
    name: 'Mesón O Alpendre / Chef Rivera (Padrón)',
    description: 'Auberge traditionnelle galicienne célèbre pour ses authentiques piments d\'Herbón dorés à l\'huile d\'olive vierge et ses généreuses viandes grillées.',
    tips: 'Incontournable : demandez une grande assiette de piments verts de saison avec fleur de sel et pain de maïs galicien.',
    dishRecommendations: ['Piments de Padrón dorés avec gros sel de mer', 'Viande marinée (zorza) et pommes boulangères', 'Gâteau traditionnel de Saint-Jacques'],
    stayDuration: '1h 30m de déjeuner',
  },
  'gastro-chef-rivera-padron': {
    name: 'Pulpería Rial / Asador à Padrón',
    description: 'Auberge galicienne réputée pour ses viandes braisées et ses piments authentiques de la vallée d\'Herbón.',
    tips: 'Goûtez la combinaison de poulpe braisé et piments verts poêlés.',
    dishRecommendations: ['Assiette de piments de Padrón dorés à l\'huile d\'olive', 'Poulpe grillé aux braises de chêne', 'Fromage de Tetilla crémeux et pâte de coing'],
    stayDuration: '1h 15m de repas',
  },
  'gastro-gato-negro-santiago': {
    name: 'Taberna O Gato Negro (Saint-Jacques-de-Compostelle)',
    description: 'La taverne centenaire la plus authentique et populaire du vieux Saint-Jacques, où le vin est servi dans les traditionnelles tasses en terre cuite (cuncas).',
    tips: 'Arrivez vers 20h30 car les tables en bois sont très prisées. Ambiance pèlerine inoubliable.',
    dishRecommendations: ['Empanada de maïs aux coques fraîches de la ría', 'Poulpe á feira tranché à la commande', 'Vin blanc jeune servi dans la coupelle de porcelaine'],
    stayDuration: '2 heures de soirée tapas',
  },
  'gastro-taberna-franco': {
    name: 'Taberna do Bispo / O Gato Negro (Saint-Jacques)',
    description: 'Tavernes historiques de la légendaire Rúa do Franco où se mêlent pèlerins et compostellans dans une ambiance festive et chaleureuse.',
    tips: 'Terminez la soirée par le rituel de la Queimada flambée en prononçant l\'incantation traditionnelle.',
    dishRecommendations: ['Brochettes de lotte et crevettes grillées', 'Poulpe fondant aux herbes et paprika fumé', 'Queimada traditionnelle flambée'],
    stayDuration: '2h de soirée',
  },

  // ==========================================
  // --- JOUR 5 : SAINT-JACQUES → ÉZARO → FISTERRA ---
  // ==========================================
  'poi-portico-gloria': {
    name: 'Portique de la Gloire & Toits de la Cathédrale',
    description: 'Sommet universel de la sculpture romane sculpté par Maître Mateo, dont les couleurs d\'origine du XIIe siècle ont été minutieusement restaurées.',
    tips: 'Réservation horaire obligatoire. La visite des toits en granit offre une vue plongeante spectaculaire sur tout Saint-Jacques.',
    stayDuration: '1h 15m de visite',
  },
  'poi-cascada-ezaro': {
    name: 'Cascade d\'Ézaro (Fleuve Xallas)',
    description: 'Spectacle naturel unique en Europe continentale : le fleuve Xallas se jette directement dans les eaux salées de l\'océan en une chute d\'eau de 40 mètres.',
    tips: 'Passerelle en bois sécurisée jusqu\'au bassin d\'écume. Parking aménagé gratuit au départ du sentier.',
    stayDuration: '50 min de visite',
  },
  'poi-mirador-ezaro': {
    name: 'Belvédère d\'Ézaro et Panorama du Monte Pindo',
    description: 'Belvédère spectaculaire perché en hauteur face au Monte Pindo (l\'Olympe celtique de Galice), au barrage et à l\'embouchure infinie vers l\'Atlantique.',
    tips: 'Montée raide et courte en voiture avec panorama à couper le souffle au sommet.',
    stayDuration: '45 min de visite',
  },
  'poi-cabo-fisterra': {
    name: 'Cap Finisterre, Phare et Km 0 du Chemin',
    description: 'Le légendaire « Bout du Monde » antique où les Romains voyaient le soleil disparaître dans les abîmes de l\'océan. Borne officielle du kilomètre 0,00.',
    tips: 'Installez-vous sur les dalles de granit du cap 40 minutes avant le coucher du soleil pour observer le crépuscule océanique.',
    stayDuration: '1h 30m de contemplation',
  },
  'poi-faro-fisterra': {
    name: 'Cap et Phare de Fisterra (Finis Terrae & Km 0)',
    description: 'Le phare le plus mythique d\'Europe dressé au sommet de la falaise océanique, borne zéro du pèlerinage jacobéen face au couchant.',
    tips: 'Le vent d\'ouest peut être frais au crépuscule : prévoyez un vêtement chaud ou coupe-vent.',
    stayDuration: '2h de visite et coucher de soleil',
  },
  'gastro-o-pirata-fisterra': {
    name: 'Restaurant O Pirata (Port de Fisterra)',
    description: 'Restaurant chaleureux dominant directement les quais du port de pêche de Fisterra. Poissons sauvages tout juste débarqués de la criée et crustacés vivants.',
    tips: 'Excellente terrasse et salle avec vue sur les chalutiers. Ne manquez pas le bar de ligne ou les couteaux.',
    dishRecommendations: ['Bar sauvage grillé à l\'huile d\'olive et éclats d\'ail', 'Pouces-pieds de la Costa da Morte', 'Couteaux de mer (longueiróns) de Fisterra'],
    stayDuration: '1h 45m de déjeuner',
  },
  'gastro-tira-cordel-fisterra': {
    name: 'Restaurant Tira do Cordel (Plage de Langosteira)',
    description: 'Maison de légende installée dans une ancienne usine de salaison posée sur la plage, réputée mondialement pour son bar sauvage cuit sur la braise.',
    tips: 'Le bar entier grillé aux sarments et arrosé de vinaigrette chaude à l\'ail est une référence absolue.',
    dishRecommendations: ['Bar de ligne sauvage rôti à la braise de chêne', 'Araignée de mer ou tourteau frais des casiers', 'Vin blanc Ribeiro ou Albariño'],
    stayDuration: '2 heures de dîner',
  },
  'gastro-tira-do-cordel': {
    name: 'Restaurant Tira do Cordel (Fisterra)',
    description: 'Ancienne usine de salaison posée sur la plage de Langosteira, mondialement reconnue pour son bar sauvage rôti sur la braise.',
    tips: 'Le bar est grillé entier avec une légère vinaigrette tiède à l\'ail : un sommet gustatif galicien.',
    dishRecommendations: ['Bar de ligne sauvage grillé au feu de bois', 'Couteaux de mer (longueiróns) de Fisterra à la plancha', 'Torta d\'amandes galicienne'],
    stayDuration: '1h 45m de dîner',
  },
  'gastro-o-semaforo': {
    name: 'O Semáforo de Fisterra',
    description: 'Ancienne vigie de signalisation maritime restaurée à l\'extrémité du cap, avec une terrasse surplombant les vagues de l\'Atlantique.',
    tips: 'Cadre magique pour prendre un café ou un cocktail au coucher du soleil face à l\'immensité océanique.',
    dishRecommendations: ['Apéritif au coucher du soleil', 'Planche de jambon ibérique et fromages artisanaux de Galice', 'Vins blancs côtiers'],
    stayDuration: '45 min de pause',
  },

  // ==========================================
  // --- JOUR 6 : FISTERRA → CABO TOURIÑÁN → MUXÍA ---
  // ==========================================
  'poi-playa-langosteira': {
    name: 'Plage de Langosteira (Fisterra)',
    description: 'La plage la plus emblématique de Fisterra, déployant près de 2 km de sable fin et d\'eaux calmes cristallines face au massif du Monte Pindo.',
    tips: 'Parfaite pour une balade matinale vivifiante les pieds dans l\'eau avant de prendre la route.',
    stayDuration: '1h de balade matinale',
  },
  'poi-cabo-tourinan': {
    name: 'Cap Touriñán (Point le Plus Occidental d\'Espagne)',
    description: 'Le véritable point géographique le plus à l\'ouest de toute l\'Espagne péninsulaire et de l\'Europe continentale méridionale. Beauté sauvage indomptée.',
    tips: 'Site vierge et préservé, beaucoup plus sauvage et moins fréquenté que Fisterra.',
    stayDuration: '1h 15m de visite',
  },
  'poi-virxe-barca-muxia': {
    name: 'Sanctuaire da Virxe da Barca (Muxía)',
    description: 'Site sacré grandiose dressé sur les chaos de granit noir face aux assauts de l\'océan, célèbre pour les légendaires Pedra de Abalar et Pedra dos Cadrís.',
    tips: 'Restez prudents sur les rochers en cas de houle atlantique. Le coucher de soleil y est d\'une rare intensité mystique.',
    stayDuration: '1h 45m de visite',
  },
  'poi-santuario-barca': {
    name: 'Sanctuaire da Virxe da Barca & Pierre d\'Abalar',
    description: 'Sanctuaire marin battu par les lames de l\'océan sur la presqu\'île rocheuse de Muxía, lieu de légendes et de pèlerinage celtique.',
    tips: 'Approchez-vous avec prudence de la Pierre d\'Abalar et de la Pierre des Cadrís sur les rochers balayés par les embruns.',
    stayDuration: '1h de visite',
  },
  'poi-cabo-vilan': {
    name: 'Phare de Cabo Vilán (Camariñas)',
    description: 'Premier phare électrifié d\'Espagne (1896), dressé sur un promontoire de granit rose de plus de 100 mètres sur la côte la plus sauvage.',
    tips: 'Le phare abrite le musée des naufrages maritimes. Panorama grandiose sur les écueils atlantiques.',
    stayDuration: '1h 15m de visite',
  },
  'poi-museo-encaixe': {
    name: 'Musée de la Dentelle aux Fuseaux (Camariñas)',
    description: 'Tradition artisanale séculaire de Camariñas où les dentellières manient les fuseaux de bois avec une virtuosité stupéfiante.',
    tips: 'Démonstrations de dentelle en direct par les artisanes locales dans les ateliers du port.',
    stayDuration: '40 min de visite',
  },
  'gastro-tasca-marina-muxia': {
    name: 'A Marina Tasca do Mar (Muxía)',
    description: 'Petite taverne de pêcheurs au bord du port de Muxía réputée pour ses produits de première fraîcheur : merlu de ligne, couteaux et ragoûts de poissons (caldeiradas).',
    tips: 'Produits issus des bateaux de pêche artisanale locale. Service amical et authentique.',
    dishRecommendations: ['Caldeirada de merlu de ligne à la façon de Muxía', 'Couteaux de mer dorés à la plancha', 'Sar commun sauvage rôti au four'],
    stayDuration: '1h 45m de déjeuner',
  },
  'gastro-d-alvaro-muxia': {
    name: 'Restaurant D\'Alvaro (Muxía)',
    description: 'Restaurant traditionnel du port spécialisé dans les poissons nobles sauvages grillés aux sarments de bois et les tourtes (empanadas) tout juste sorties du four.',
    tips: 'Cadre chaleureux en pierre. Les poissons du jour dépendent directement de la criée du matin.',
    dishRecommendations: ['Poulpe á feira et pommes de terre fondantes', 'Poissons sauvages du jour cuits à la braise', 'Tarte maison aux noix et amandes'],
    stayDuration: '2 heures de dîner',
  },
  'gastro-a-lonxa-muxia': {
    name: 'Restaurant A Lonxa / D\'Álvaro (Muxía)',
    description: 'Taverne de pêcheurs authentique face aux quais de Muxía, cuisinant les poissons et céphalopodes tout juste débarqués de la criée.',
    tips: 'Les poissons sont présentés entiers avant cuisson. Goûtez la seiche à l\'encre préparée à l\'ancienne.',
    dishRecommendations: ['Seiche fraîche cuisinée dans son encre', 'Bar de ligne rôti au four', 'Poulpe sauté aux oignons doux et piment'],
    stayDuration: '1h 30m de dîner',
  },
  'gastro-mar-viva': {
    name: 'Mar Viva (Corcubión)',
    description: 'Concept original d\'étal de poissonnerie moderne où les clients choisissent leur poisson sur glace pour une préparation immédiate à la minute.',
    tips: 'Choisissez vos poissons et crustacés préférés au poids comme chez le poissonnier.',
    dishRecommendations: ['Dorade royale sauvage grillée', 'Palourdes de la ría sautées à la poêle', 'Bouteille d\'Albariño servie fraîche'],
    stayDuration: '1h 30m de repas',
  },

  // ==========================================
  // --- JOUR 7 : MUXÍA → CAMARIÑAS → BETANZOS & LA COROGNE ---
  // ==========================================
  'poi-torre-hercules': {
    name: 'Tour d\'Hercule (La Corogne)',
    description: 'Monument classé au Patrimoine Mondial de l\'UNESCO : l\'unique phare romain au monde en activité continue depuis le Ier siècle de notre ère.',
    tips: 'Parc de sculptures et Rose des Vents monumentale autour du phare. Vue panoramique spectaculaire sur tout le golfe.',
    stayDuration: '1h 30m de visite',
  },
  'poi-galerias-marina': {
    name: 'Galeries de la Marina & Place María Pita (La Corogne)',
    description: 'Le plus grand ensemble de façades à verrières blanches du XIXe siècle au monde, qui valut à La Corogne son surnom poétique de « Cité de Cristal ».',
    tips: 'Flânerie idéale entre le port de plaisance et les terrasses de la grandiose Praza de María Pita.',
    stayDuration: '1h 45m de promenade',
  },
  'poi-betanzos-medieval': {
    name: 'Cité Médiévale & Remparts de Betanzos',
    description: 'Ancienne capitale historique du Royaume de Galice : portes fortifiées en ogive, églises gothiques de Santa María et ruelles pavées descendant vers le fleuve Mandeo.',
    tips: 'Déambulation romantique dans les venelles médiévales avant d\'aller déguster la célèbre omelette.',
    stayDuration: '1h 15m de promenade',
  },
  'poi-casco-betanzos': {
    name: 'Cité Médiévale & Remparts de Betanzos',
    description: 'Ancienne capitale historique d\'un des sept royaumes de Galice, célèbre pour ses portes fortifiées, palais médiévaux et places à arcades.',
    tips: 'Promenez-vous sur la Praza dos Irmáns García Naveira avant de vous attabler dans une taverne traditionnelle.',
    stayDuration: '1h 15m de promenade',
  },
  'poi-monte-san-pedro': {
    name: 'Mont San Pedro et Ascenseur Panoramique',
    description: 'Ancienne forteresse côtière transformée en parc paysager avec ascenseur sphérique vitré grimpant le long de la falaise rocheuse.',
    tips: 'Le plus beau panorama pour contempler La Corogne et l\'anse océanique de Riazor.',
    stayDuration: '1h de balade',
  },
  'gastro-meson-o-pote': {
    name: 'Mesón O Pote (Betanzos)',
    description: 'Vainqueur historique du Championnat d\'Espagne de la Meilleure Omelette de Pommes de Terre. Tortilla fondante et coulante (jugosa), œufs fermiers et pommes de terre dorées.',
    tips: 'Commandez l\'omelette entière de Betanzos pour la table (4 personnes). Cuisson baveuse emblématique sans oignon.',
    dishRecommendations: ['Véritable Tortilla de Betanzos médaille d\'or', 'Croquettes artisanales de jambon ibérique', 'Porc mariné (zorza) aux piments doux'],
    stayDuration: '1h 45m de dîner',
  },
  'gastro-mesón-o-pote': {
    name: 'Mesón O Pote (La Meilleure Omelette d\'Espagne)',
    description: 'Taverne historique plusieurs fois sacrée championne d\'Espagne pour sa célèbre tortilla de Betanzos, extra-baveuse aux œufs fermiers jaunes et pommes de terre frites.',
    tips: 'Ne manquez sous aucun prétexte la tortilla de Betanzos fondante, servie avec un pichet de vin de pays.',
    dishRecommendations: ['Tortilla de Betanzos médaille d\'or (extra coulante)', 'Zorza marinée sautée à la galicienne', 'Pichet de vin rouge de pays'],
    stayDuration: '1h 30m de dîner',
  },
  'gastro-rua-estrella-coruna': {
    name: 'Tavernes de la Rúa da Galera et Rúa da Estrella (La Corogne)',
    description: 'L\'artère gourmande la plus vivante et festive de La Corogne pour le picoteo : pétoncles zamburiñas, lanières de porc raxo, croustillants et vins régionaux.',
    tips: 'Faites la tournée des bars à tapas entre la rue Estrella et la rue Olmos dans une atmosphère très conviviale.',
    dishRecommendations: ['Pétoncles noirs (zamburiñas) dorés à la plancha', 'Émincé de porc galicien (raxo) aux frites maison', 'Croquettes crémeuses à l\'araignée de mer'],
    stayDuration: '1h 30m de tapas',
  },
  'gastro-marisqueria-a-coruna': {
    name: 'O Bebedeiro / Marisquería à La Corogne',
    description: 'Restaurant rustique chaleureux et généreux au cœur de La Corogne, réputé pour ses poissons de roche et fruits de mer cuisinés à la perfection.',
    tips: 'Ambiance chaleureuse avec boiseries et service attentif.',
    dishRecommendations: ['Poêlée de chipirons aux oignons confits', 'Araignée de mer décortiquée servie dans sa carapace', 'Tarte grand-mère au chocolat noir'],
    stayDuration: '1h 45m de repas',
  },

  // ==========================================
  // --- JOUR 8 : BETANZOS → CEDEIRA → SAN ANDRÉS → VIVEIRO ---
  // ==========================================
  'poi-san-andres': {
    name: 'Sanctuaire de San Andrés de Teixido',
    description: 'Lieu de pèlerinage millénaire blotti au pied des plus hautes falaises d\'Europe continentale. Le proverbe galicien dit : « Vai de morto quen non foi de vivo ».',
    tips: 'Achetez les petits sanandresiños traditionnels façonnés en mie de pain cuite et colorée.',
    stayDuration: '1h 15m de visite',
  },
  'poi-san-andres-teixido': {
    name: 'Sanctuaire de San Andrés de Teixido',
    description: 'Haut lieu de pèlerinage niché au creux d\'une vallée côtière sauvage. Le dicton prévient : « À San Andrés de Teixido va de mort qui n\'y fut de vivant ».',
    tips: 'Achetez les petits sanandresiños traditionnels façonnés en mie de pain cuite et colorée.',
    stayDuration: '1h de visite',
  },
  'poi-cedeira-puerto': {
    name: 'Port et Ría de Cedeira',
    description: 'Charmante cité marine abritée au fond de son estuaire, réputée pour sa flottille de pêche côtière et ses célèbres récoltes de pouces-pieds de falaise.',
    tips: 'Halte parfaite pour déjeuner de fruits de mer et flâner sur les quais de déchargement.',
    stayDuration: '50 min de promenade',
  },
  'poi-ortigueira-loiba': {
    name: 'Ría d\'Ortigueira et Falaises de Loiba',
    description: 'Espace littoral grandiose mêlant marais maritimes et falaises cantabriques où trône le célèbre banc offrant les plus spectaculaires panoramas marins d\'Espagne.',
    tips: 'Parking aménagé à 300 mètres du banc. Vues inoubliables sur le cap Estaca de Bares au loin.',
    stayDuration: '1h de balade',
  },
  'poi-banco-loiba': {
    name: 'Le Banc de Loiba (« Le Plus Beau Banc du Monde »)',
    description: 'Banc en bois devenu célèbre dans le monde entier, perché au sommet de falaises vertigineuses dominant la rencontre de l\'Atlantique et de la mer Cantabrique.',
    tips: 'Parking à 300 mètres. Les points de vue sur la côte découpée sont parmi les plus photogéniques du voyage.',
    stayDuration: '45 min de visite',
  },
  'poi-viveiro-historico': {
    name: 'Centre Historique de Viveiro et Porte de Charles Quint',
    description: 'Cité seigneuriale d\'origine médiévale ceinte de remparts, abritant la majestueuse Porta do Castelo (XVIe siècle), le ruisselant fleuve Landro et de jolies rues marchandes.',
    tips: 'Empruntez la rue piétonne jusqu\'au Callejón del Muro, l\'une des ruelles les plus étroites d\'Espagne.',
    stayDuration: '1h 30m de balade',
  },
  'poi-acantilados-vixia': {
    name: 'Falaises de Vixía de Herbeira (San Andrés de Teixido)',
    description: 'Les plus hautes falaises maritimes d\'Europe continentale, plongeant à pic de 613 mètres d\'altitude dans l\'océan rugissant.',
    tips: 'Petite guérite en pierre du XVIIIe siècle au bord du précipice. Vents puissants fréquents : prévoyez un vêtement chaud coupe-vent.',
    stayDuration: '45 min de contemplation',
  },
  'poi-cabo-estaca-bares': {
    name: 'Cap Estaca de Bares (Point le Plus au Nord d\'Espagne)',
    description: 'Pointe la plus septentrionale de toute la péninsule Ibérique, marquant la séparation géographique officielle entre l\'océan Atlantique et la mer Cantabrique.',
    tips: 'Passerelle piétonne jusqu\'au phare historique et observatoire ornithologique international réputé.',
    stayDuration: '50 min de visite',
  },
  'gastro-cedeira-percebes': {
    name: 'Tavernes du Port de Cedeira (Mesón O Mencer)',
    description: 'Le temple des pouces-pieds sauvages des Rías Altas, récoltés à flanc de falaise par les percebeiros locaux, et tourtes savoureuses aux coques.',
    tips: 'Dégustez les pouces-pieds tout juste pochés à l\'eau de mer avec une empanada artisanale.',
    dishRecommendations: ['Pouces-pieds sauvages de Cedeira pochés à la vapeur', 'Calamars frais de pêche côtière', 'Empanada fine aux pétoncles galiciens'],
    stayDuration: '1h de dégustation',
  },
  'gastro-mesón-teixido': {
    name: 'Mesón San Andrés / Marisquería O Muelle (Cedeira)',
    description: 'Auberge côtière réputée pour ses pouces-pieds cueillis à flanc de falaise par les courageux percebeiros de Cedeira.',
    tips: 'Les pouces-pieds de Cedeira sont considérés parmi les plus savoureux au monde.',
    dishRecommendations: ['Pouces-pieds sauvages de Cedeira tout juste pochés', 'Tourte aux poissons nobles locaux', 'Vins blancs galiciens frais'],
    stayDuration: '1h 30m de déjeuner',
  },
  'gastro-meson-teixido': {
    name: 'Mesón San Andrés / Marisquería O Muelle (Cedeira)',
    description: 'Auberge côtière réputée pour ses pouces-pieds cueillis à flanc de falaise par les courageux percebeiros de Cedeira.',
    tips: 'Les pouces-pieds de Cedeira sont considérés parmi les plus savoureux au monde.',
    dishRecommendations: ['Pouces-pieds sauvages de Cedeira tout juste pochés', 'Tourte aux poissons nobles locaux', 'Vins blancs galiciens frais'],
    stayDuration: '1h 30m de déjeuner',
  },
  'gastro-viveiro-celeiro': {
    name: 'Taberna da Ría / O Val do Naseiro (Viveiro)',
    description: 'La reine incontestée de la table : le merlu de ligne de Celeiro (pêché à l\'hameçon un par un dans le Grand Sol), chipirons et vins blancs vifs.',
    tips: 'Le merlu de Celeiro est reconnu dans toute l\'Europe pour sa chair blanche nacrée et ferme.',
    dishRecommendations: ['Merlu de ligne de Celeiro préparé à la galicienne', 'Pétoncles noirs sautés à la plancha', 'Tarte traditionnelle aux amandes de Viveiro'],
    stayDuration: '2h de dîner marin',
  },
  'gastro-porto-viveiro': {
    name: 'Restaurant O Val do Naseiro / Louzao (Viveiro)',
    description: 'Grande table de la Mariña Lucense, spécialiste de la pêche côtière locale et du fameux merlu de ligne du port de Celeiro.',
    tips: 'Le merlu de Celeiro est d\'une fraîcheur incomparable.',
    dishRecommendations: ['Merlu de ligne de Celeiro rôti aux éclats d\'ail doré', 'Assiette de couteaux et palourdes à la marinière', 'Gâteau fondant aux amandes'],
    stayDuration: '1h 45m de dîner',
  },

  // ==========================================
  // --- JOUR 9 : VIVEIRO → PLAGE CATHÉDRALES → RINLO → LUGO ---
  // ==========================================
  'poi-fucino-do-porco': {
    name: 'O Fuciño do Porco (O Vicedo)',
    description: 'Passerelle en bois suspendue au-dessus des gouffres marins entre la Ría de Viveiro et la mer ouverte, l\'un des sentiers côtiers les plus spectaculaires de toute l\'Espagne.',
    tips: 'Sentier en planches de bois très bien sécurisé. Vues grandioses sur les falaises cantabriques.',
    stayDuration: '1h de balade côtière',
  },
  'poi-praia-catedrais': {
    name: 'Plage des Cathédrales (As Catedrais, Ribadeo)',
    description: 'Monument naturel d\'exception façonné par la force du Cantabrique : des voûtes gothiques en pierre de plus de 30 mètres de hauteur et des grottes ouvertes à marée basse.',
    tips: 'Visite impérativement synchronisée avec la marée basse. Retirez vos chaussures pour marcher pieds nus sur le sable humide sous les arches géantes.',
    stayDuration: '1h 30m de promenade à marée basse',
  },
  'poi-playa-catedrales': {
    name: 'Plage des Cathédrales (As Catedrais, Ribadeo)',
    description: 'Chef-d\'œuvre naturel façonné par l\'océan : arches gothiques en pierre de plus de 30 mètres de hauteur et grottes creusées dans le schiste et le quartz.',
    tips: 'Accessible exclusivement pendant les deux heures entourant la marée basse. Retirez vos chaussures pour marcher pieds nus sous les arches monumentales.',
    stayDuration: '1h 30m de promenade à marée basse',
  },
  'poi-isla-pancha': {
    name: 'Phare d\'Isla Pancha (Ribadeo)',
    description: 'Îlot rocheux pittoresque relié par une passerelle en béton, coiffé de deux phares maritimes historiques marquant l\'entrée de la ría de Ribadeo.',
    tips: 'Sentier littoral aménagé offrant des vues splendides sur les écueils et la côte asturienne voisine.',
    stayDuration: '45 min de promenade',
  },
  'poi-muralla-lugo': {
    name: 'Muraille Romaine de Lugo (UNESCO)',
    description: 'L\'unique enceinte fortifiée romaine au monde intégralement préservée, longue de 2 140 mètres de périmètre avec ses 85 tours de défense et son chemin de ronde herbeux.',
    tips: 'Promenade continue et libre sur le chemin de ronde sommital dominant les toits de la ville illuminée en soirée.',
    stayDuration: '1h 30m de tour sur les remparts',
  },
  'gastro-cofradia-rinlo': {
    name: 'A Cofradía de Rinlo (Port de Rinlo)',
    description: 'Le célèbre riz au homard bleu et fruits de mer cuit en marmite de terre cuite dans le port de pêche de Rinlo, ancien fief des premiers viviers de crustacés de Galice.',
    tips: 'Le plat de référence de toute la côte cantabrique : un riz mijoté très copieux et généreux en homard.',
    dishRecommendations: ['Riz crémeux aux fruits de mer et homard pour 4', 'Pouces-pieds frais de la Mariña', 'Vin blanc frais galicien'],
    stayDuration: '1h 45m de déjeuner',
  },
  'gastro-san-miguel-ribadeo': {
    name: 'Restaurant San Miguel (Ribadeo)',
    description: 'Restaurant gastronomique panoramique surplombant le port de plaisance de Porcillán et l\'estuaire partagé entre la Galice et les Asturies.',
    tips: 'Installez-vous près des baies vitrées pour contempler le balancement des bateaux dans le port.',
    dishRecommendations: ['Riz crémeux aux coquillages et homard', 'Poissons nobles sauvages selon arrivage de la criée', 'Tarte chaude aux pommes de verger'],
    stayDuration: '1h 45m de déjeuner',
  },
  'gastro-ou-galo-lugo': {
    name: 'Pulpería O Galo / Bar Anda (Lugo)',
    description: 'Au cœur de la pittoresque Praza do Campo de Lugo : poulpe mijoté au grand chaudron de cuivre selon la tradition et tournée des généreuses tapas chaudes offertes avec le vin.',
    tips: 'Fidèle à la devise « ...e para comer, Lugo », chaque consommation s\'accompagne d\'une tapa chaude offerte.',
    dishRecommendations: ['Poulpe á feira tranché à l\'ancienne', 'Viande fondante au caldero avec cachelos au pimentón', 'Verre de vin Mencía de Ribeira Sacra'],
    stayDuration: '2 heures de dîner tapas',
  },
  'gastro-tapas-rua-nova': {
    name: 'Rúa Nova / Mesón de Alberto (Lugo)',
    description: 'Le cœur de la fameuse tradition lucense : « ...e para comer, Lugo ». À chaque consommation commandée, une généreuse tapa chaude est offerte gracieusement.',
    tips: 'Parcourez les tavernes de la Rúa Nova et de la Praza do Campo en goûtant différentes tapas offertes.',
    dishRecommendations: ['Tapas offertes de poulpe et ragoût galicien mijoté', 'Poêlée de champignons des forêts galiciennes', 'Verre de vin rouge Mencía D.O. Ribeira Sacra'],
    stayDuration: '2h de tournée de tapas',
  },

  // ==========================================
  // --- JOUR 10 : LUGO → ASTORGA → RETOUR PINSORO ---
  // ==========================================
  'poi-palacio-astorga': {
    name: 'Palais Épiscopal de Gaudí & Cathédrale d\'Astorga',
    description: 'Fantaisie néogothique en granit blanc dessinée par le génial Antoni Gaudí dans la ville historique maragate, halte monumentale parfaite sur la route du retour.',
    tips: 'Promenez-vous sur la Plaza Mayor et admirez les détails féeriques du palais de Gaudí.',
    stayDuration: '1h 45m de visite',
  },
  'poi-catedral-leon': {
    name: 'Cathédrale Santa María de Regla de Léon',
    description: 'La célèbre « Pulchra Leonina » : joyau du gothique français en Espagne abritant 1 800 mètres carrés de vitraux médiévaux d\'une clarté féerique.',
    tips: 'Visitez en milieu de journée pour voir la lumière traverser les rosaces multicolores de la nef.',
    stayDuration: '1h de visite',
  },
  'poi-barrio-humedo': {
    name: 'Barrio Húmedo & Plaza Mayor de Léon',
    description: 'Quartier historique légendaire réputé pour sa convivialité festive et ses tapas gratuites de cecina séchée, morcilla fondante et fromages de montagne.',
    tips: 'Halte parfaite sur le trajet de retour vers Pinsoro pour déjeuner et faire les derniers achats gourmands.',
    stayDuration: '1h 30m de pause déjeuner',
  },
  'gastro-casa-maragata-astorga': {
    name: 'Casa Maragata / Restaurant Serrano (Astorga)',
    description: 'Haut lieu de la gastronomie castillane célèbre pour son cocido maragato traditionnel servi en trois services inversés et sa véritable cecina de bœuf fumée au chêne.',
    tips: 'Le festin traditionnel débute par les viandes, puis les pois chiches et choux, pour finir par le bouillon fumant.',
    dishRecommendations: ['Cecina de León IGP affinée avec huile d\'olive vierge extra', 'Cocido maragato complet servi dans la tradition', 'Mantecadas et feuilletés artisanaux d\'Astorga'],
    stayDuration: '1h 45m de déjeuner convivial',
  },
  'gastro-barrio-humedo-leon': {
    name: 'El Rincón del Tuerto / Taberna de Mon (Léon)',
    description: 'Taverne léonaise authentique servant la véritable cecina de León IGP fumée au bois de chêne et de généreuses tapas régionales.',
    tips: 'Dégustez la cecina coupée très finement avec un filet d\'huile d\'olive vierge.',
    dishRecommendations: ['Planche de cecina de bœuf fumée à l\'huile d\'olive', 'Bouchées de boudin noir léonais aux pignons', 'Vin rouge D.O. Bierzo'],
    stayDuration: '1h 15m de repas',
  },
  'gastro-pinsoro-llegada': {
    name: 'Arrivée finale et clôture de l\'expédition à Pinsoro',
    description: 'Retour triomphal à Pinsoro (Saragosse) après 10 journées inoubliables, 2 142 kilomètres parcourus et la découverte intégrale des merveilles de Galice.',
    tips: 'Déchargement des souvenirs, vins galiciens et fromages rapportés du voyage.',
    dishRecommendations: ['Dîner convivial de retrouvailles', 'Dégustation des fromages et empanadas rapportés de Galice'],
    stayDuration: 'Arrivée finale vers 18h30',
  },
};

/**
 * Normalizes text for case-insensitive and accent-insensitive matching
 */
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Returns a fully localized PointOfInterest based on active language
 */
export function getLocalizedPoi(poi: PointOfInterest, lang: Language = 'es'): PointOfInterest {
  if (lang !== 'fr') return poi;

  // Direct ID match
  let translation = POI_FR_TRANSLATIONS[poi.id];

  // Accent-insensitive fallback check
  if (!translation) {
    const normId = normalizeKey(poi.id);
    const matchedKey = Object.keys(POI_FR_TRANSLATIONS).find(
      (k) => normalizeKey(k) === normId
    );
    if (matchedKey) {
      translation = POI_FR_TRANSLATIONS[matchedKey];
    }
  }

  // Name-based fallback check if ID didn't match
  if (!translation) {
    const normName = normalizeKey(poi.name);
    const matchedKey = Object.keys(POI_FR_TRANSLATIONS).find((k) => {
      const entry = POI_FR_TRANSLATIONS[k];
      return entry.name && normalizeKey(entry.name).includes(normName.slice(0, 15));
    });
    if (matchedKey) {
      translation = POI_FR_TRANSLATIONS[matchedKey];
    }
  }

  if (!translation) {
    // Smart generic translation fallback
    const transDesc = poi.description
      .replace(/Punto de partida/gi, 'Point de départ')
      .replace(/Mirador/gi, 'Belvédère')
      .replace(/Catedral/gi, 'Cathédrale')
      .replace(/Restaurante/gi, 'Restaurant')
      .replace(/Parque Nacional/gi, 'Parc National')
      .replace(/Plaza/gi, 'Place')
      .replace(/Faro/gi, 'Phare')
      .replace(/Casco histórico/gi, 'Centre historique')
      .replace(/aparcamiento gratuito/gi, 'stationnement gratuit')
      .replace(/vistas panorámicas/gi, 'vues panoramiques')
      .replace(/mariscada/gi, 'plateau de fruits de mer')
      .replace(/pulpo á feira/gi, 'poulpe á feira')
      .replace(/lubina salvaje a la brasa/gi, 'bar sauvage grillé à la braise')
      .replace(/lubina a la brasa/gi, 'bar grillé à la braise')
      .replace(/percebes/gi, 'pouces-pieds')
      .replace(/navajas/gi, 'couteaux de mer')
      .replace(/zamburiñas/gi, 'pétoncles')
      .replace(/empanada gallega/gi, 'empanada galicienne')
      .replace(/conducción/gi, 'conduite');

    const transTips = poi.tips
      ? poi.tips
          .replace(/Aparcamiento gratuito/gi, 'Stationnement gratuit')
          .replace(/Sendero llano y accesible/gi, 'Sentier plat et accessible')
          .replace(/Llevar calzado cómodo/gi, 'Prévoir des chaussures confortables')
          .replace(/Reservar con antelación/gi, 'Réserver à l\'avance')
          .replace(/coche/gi, 'voiture')
          .replace(/parking/gi, 'parking')
      : undefined;

    const transDishes = poi.dishRecommendations
      ? poi.dishRecommendations.map((d) =>
          d
            .replace(/Pulpo á feira con cachelos/gi, 'Poulpe á feira et cachelos (pommes de terre)')
            .replace(/Pulpo á feira/gi, 'Poulpe á feira')
            .replace(/Pimientos de Padrón con sal gorda/gi, 'Piments de Padrón et fleur de sel')
            .replace(/Pimientos de Padrón/gi, 'Piments de Padrón')
            .replace(/Lubina a la brasa/gi, 'Bar sauvage à la braise')
            .replace(/Percebes de/gi, 'Pouces-pieds de')
            .replace(/Navajas a la plancha/gi, 'Couteaux de mer à la plancha')
            .replace(/Zamburiñas a la brasa/gi, 'Pétoncles grillés')
            .replace(/Zamburiñas a la plancha/gi, 'Pétoncles à la plancha')
            .replace(/Zorza con patatas/gi, 'Porc mariné (zorza) et pommes de terre')
            .replace(/Arroz caldoso con bogavante/gi, 'Riz crémeux au homard bleu')
            .replace(/Arroz caldoso de mariscos/gi, 'Riz crémeux aux fruits de mer')
            .replace(/para 4/gi, 'pour 4 personnes')
            .replace(/Tarta de Santiago/gi, 'Tarte de Saint-Jacques')
            .replace(/Tarta de castañas/gi, 'Tarte aux châtaignes')
        )
      : undefined;

    return {
      ...poi,
      description: transDesc,
      tips: transTips,
      dishRecommendations: transDishes,
    };
  }

  return {
    ...poi,
    name: translation.name || poi.name,
    description: translation.description,
    tips: translation.tips !== undefined ? translation.tips : poi.tips,
    dishRecommendations: translation.dishRecommendations || poi.dishRecommendations,
    stayDuration: translation.stayDuration || poi.stayDuration,
  };
}
