-- =====================================================================
-- Esquema de Base de Datos PostgreSQL para Expedición Galicia 10 Días
-- Compatible con PostgreSQL 14+, 15, 16 y 17 (Hostinger VPS & Coolify)
-- =====================================================================

-- 1. Tabla de Configuración General del Viaje
CREATE TABLE IF NOT EXISTS trip_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
    fuel_price_per_liter NUMERIC(5, 3) DEFAULT 1.620,
    car_consumption NUMERIC(4, 2) DEFAULT 6.80,
    food_daily_budget_per_pax NUMERIC(6, 2) DEFAULT 35.00,
    total_pax INTEGER DEFAULT 4,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO trip_settings (id, fuel_price_per_liter, car_consumption, food_daily_budget_per_pax, total_pax)
VALUES ('default', 1.620, 6.80, 35.00, 4)
ON CONFLICT (id) DO UPDATE SET
    fuel_price_per_liter = EXCLUDED.fuel_price_per_liter,
    car_consumption = EXCLUDED.car_consumption,
    food_daily_budget_per_pax = EXCLUDED.food_daily_budget_per_pax,
    total_pax = EXCLUDED.total_pax,
    updated_at = CURRENT_TIMESTAMP;

-- 2. Tabla de los 9 Apartamentos de la Ruta Circular
CREATE TABLE IF NOT EXISTS apartments (
    id VARCHAR(100) PRIMARY KEY,
    day_number INTEGER NOT NULL UNIQUE CHECK (day_number BETWEEN 1 AND 9),
    night_date VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    name_es VARCHAR(255),
    name_fr VARCHAR(255),
    address TEXT,
    price NUMERIC(8, 2) DEFAULT 0.00,
    check_in_time VARCHAR(50) DEFAULT '15:00',
    check_out_time VARCHAR(50) DEFAULT '11:00',
    free_cancellation BOOLEAN DEFAULT TRUE,
    cancellation_policy TEXT,
    parking TEXT,
    distance_to_center TEXT,
    bathrooms INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO apartments (
    id, day_number, night_date, city, name, name_es, name_fr, address, price,
    check_in_time, check_out_time, free_cancellation, cancellation_policy,
    parking, distance_to_center, bathrooms, notes
) VALUES
(
    'apt-day-1-ourense',
    1,
    'Martes, 10 de Noviembre de 2026',
    'Ourense',
    'Apartamento Centro & As Burgas con Garaje',
    'Apartamento Centro & As Burgas con Garaje',
    'Appartement Centre & As Burgas avec Garage',
    'Rúa Progreso / Alameda, 32003 Ourense',
    105.00,
    '15:00',
    '11:00',
    TRUE,
    'Cancelación gratuita hasta 48h antes de la llegada',
    'Plaza concertada en Parking subterráneo Alameda a 100m incluida',
    '150 m de As Burgas y 3 min a pie de la Plaza Mayor',
    1,
    'Base ideal para la primera noche tras recorrer los Cañones del Sil y cena de pulpo en Rúa dos Viños.'
),
(
    'apt-day-2-baiona-vigo',
    2,
    'Miércoles, 11 de Noviembre de 2026',
    'Baiona / Vigo',
    'Apartamento Ría de Vigo & Embarcadero Cíes',
    'Apartamento Ría de Vigo & Embarcadero Cíes',
    'Appartement Ría de Vigo & Embarcadère Cíes',
    'Avenida de García Barbón / Puerto, 36201 Vigo',
    110.00,
    '15:00',
    '11:00',
    TRUE,
    'Cancelación gratuita hasta 3 días antes',
    'Plaza de aparcamiento privada subterránea en el mismo edificio con acceso por ascensor',
    '250 m del Puerto de Vigo (estación marítima hacia las Islas Cíes)',
    1,
    'Ubicación óptima para el embarque a las Cíes por la mañana y paseo nocturno por el Casco Vello.'
),
(
    'apt-day-3-pontevedra',
    3,
    'Jueves, 12 de Noviembre de 2026',
    'Pontevedra',
    'Apartamento Monumental Praza da Leña',
    'Apartamento Monumental Praza da Leña',
    'Appartement Monumental Praza da Leña',
    'Rúa Real / Praza da Leña, 36002 Pontevedra',
    95.00,
    '15:00',
    '11:00',
    TRUE,
    'Cancelación gratuita hasta 24h antes',
    'Garaje privado cubierto a 80 metros en calle peatonal',
    'Pleno Casco Histórico peatonal junto a las tascas de marisco',
    1,
    'En el corazón peatonal de Pontevedra, rodeado de cruceiros, pazos y tabernas con vino Albariño.'
),
(
    'apt-day-4-santiago',
    4,
    'Viernes, 13 de Noviembre de 2026',
    'Santiago de Compostela',
    'Apartamento Obradoiro & Alameda (4 Pax)',
    'Apartamento Obradoiro & Alameda (4 Pax)',
    'Appartement Obradoiro & Alameda (4 Pax)',
    'Rúa do Pombal / Rúa do Franco, 15705 Santiago de Compostela',
    115.00,
    '15:00',
    '11:00',
    TRUE,
    'Cancelación gratuita hasta 5 días antes',
    'Aparcamiento concertado Parking San Clemente a 150m',
    'A solo 300 metros de la Praza do Obradoiro y la Catedral de Santiago',
    2,
    'Apartamento espacioso con 2 cuartos de baño completos para máxima comodidad del grupo de 4.'
),
(
    'apt-day-5-fisterra',
    5,
    'Sábado, 14 de Noviembre de 2026',
    'Finisterre (Fisterra)',
    'Apartamento Costa da Morte & Faro de Fisterra',
    'Apartamento Costa da Morte & Faro de Fisterra',
    'Appartement Costa da Morte & Phare de Fisterra',
    'Paseo Marítimo de Langosteira, 15155 Fisterra',
    90.00,
    '15:00',
    '11:00',
    TRUE,
    'Cancelación gratuita hasta 48h antes',
    'Aparcamiento privado exterior frente al portal',
    'Frente a la playa de Langosteira y a 5 min en coche del Faro de Fisterra',
    1,
    'Vistas directas a la ría, atardecer en el Fin del Mundo y mariscada nocturna en el puerto.'
),
(
    'apt-day-6-muxia',
    6,
    'Domingo, 15 de Noviembre de 2026',
    'Muxía',
    'Apartamento Santuario Virxe da Barca',
    'Apartamento Santuario Virxe da Barca',
    'Appartement Sanctuaire Virxe da Barca',
    'Rúa Mariña / Paseo do Porto, 15124 Muxía',
    85.00,
    '15:00',
    '11:00',
    TRUE,
    'Cancelación gratuita hasta 24h antes',
    'Aparcamiento privado propio en patio interior cerrado',
    '100 m del puerto pesquero y 10 min a pie de la Virxe da Barca',
    1,
    'Auténtico ambiente marinero de la Costa da Morte profunda, sonido del Atlántico y percebes locales.'
),
(
    'apt-day-7-betanzos',
    7,
    'Lunes, 16 de Noviembre de 2026',
    'Betanzos',
    'Apartamento Señorial Betanzos dos Cabaleiros',
    'Apartamento Señorial Betanzos dos Cabaleiros',
    'Appartement Seigneurial Betanzos dos Cabaleiros',
    'Praza García Hermanos / Rúa do Castro, 15300 Betanzos',
    95.00,
    '15:00',
    '11:00',
    TRUE,
    'Cancelación gratuita hasta 48h antes',
    'Garaje cerrado privado individual en planta baja',
    'Plaza central de Betanzos, a pie de las tascas de tortilla de Betanzos',
    1,
    'Base perfecta para cenar la mejor tortilla de España y visitar A Coruña (Torre de Hércules a 20 min).'
),
(
    'apt-day-8-viveiro',
    8,
    'Martes, 17 de Noviembre de 2026',
    'Viveiro',
    'Apartamento Ría de Viveiro & Mariña Lucense',
    'Apartamento Ría de Viveiro & Mariña Lucense',
    'Appartement Ría de Viveiro & Mariña Lucense',
    'Avenida de Galicia / Paseo de Covas, 27850 Viveiro',
    90.00,
    '15:00',
    '11:00',
    TRUE,
    'Cancelación gratuita hasta 3 días antes',
    'Plaza de garaje comunitaria en sótano con ascensor',
    'Frente a la playa de Covas y a 8 min cruzando el puente hacia el Casco Histórico amurallado',
    1,
    'Descanso en la Mariña Lucense tras visitar San Andrés de Teixido y los acantilados de Loiba.'
),
(
    'apt-day-9-lugo',
    9,
    'Miércoles, 18 de Noviembre de 2026',
    'Lugo',
    'Apartamento Muralla Romana & Praza Maior',
    'Apartamento Muralla Romana & Praza Maior',
    'Appartement Muraille Romaine & Praza Maior',
    'Rúa de San Pedro / Porta de San Pedro, 27001 Lugo',
    95.00,
    '15:00',
    '11:00',
    TRUE,
    'Cancelación gratuita hasta 24h antes',
    'Plaza en garaje subterráneo privado a 50m con mando a distancia',
    'Dentro del recinto histórico amurallado junto a la Plaza de Santo Domingo y Praza Maior',
    1,
    'Última noche del viaje: tapeo tradicional en Rúa da Cruz y paseo por lo alto de la Muralla Romana (UNESCO).'
)
ON CONFLICT (id) DO UPDATE SET
    day_number = EXCLUDED.day_number,
    night_date = EXCLUDED.night_date,
    city = EXCLUDED.city,
    name = EXCLUDED.name,
    name_es = EXCLUDED.name_es,
    name_fr = EXCLUDED.name_fr,
    address = EXCLUDED.address,
    price = EXCLUDED.price,
    check_in_time = EXCLUDED.check_in_time,
    check_out_time = EXCLUDED.check_out_time,
    free_cancellation = EXCLUDED.free_cancellation,
    cancellation_policy = EXCLUDED.cancellation_policy,
    parking = EXCLUDED.parking,
    distance_to_center = EXCLUDED.distance_to_center,
    bathrooms = EXCLUDED.bathrooms,
    notes = EXCLUDED.notes,
    updated_at = CURRENT_TIMESTAMP;

-- 3. Tabla de Checklist de Salida con Sincronización Doble
CREATE TABLE IF NOT EXISTS checklist_items (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_es VARCHAR(255),
    title_fr VARCHAR(255),
    completed BOOLEAN DEFAULT FALSE,
    category VARCHAR(50) DEFAULT 'general',
    target_couple VARCHAR(50) DEFAULT 'general',
    order_index INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO checklist_items (id, title, title_es, title_fr, completed, category, target_couple, order_index)
VALUES
(
    'chk-byl-dni',
    'DNI, tarjetas sanitarias y permisos personales (Bruno y Loles)',
    'DNI, tarjetas sanitarias y permisos personales (Bruno y Loles)',
    'Cartes d''identité, cartes vitales et permis (Bruno & Loles)',
    TRUE,
    'documentacion',
    'ByL',
    1
),
(
    'chk-byl-perro',
    'Comprobación y reserva de guardería para el perro (Bruno y Loles)',
    'Comprobación y reserva de guardería para el perro (Bruno y Loles)',
    'Réservation et garde du chien avant le départ (Bruno & Loles)',
    TRUE,
    'personal',
    'ByL',
    2
),
(
    'chk-byl-ropa',
    'Maletas, chubasqueros y calzado de senderismo de Bruno y Loles',
    'Maletas, chubasqueros y calzado de senderismo de Bruno y Loles)',
    'Bagages, imperméables et chaussures de randonnée de Bruno & Loles',
    TRUE,
    'equipaje',
    'ByL',
    3
),
(
    'chk-byl-cargador',
    'Cargadores de móvil, cables y neceser personal de Bruno y Loles',
    'Cargadores de móvil, cables y neceser personal de Bruno y Loles',
    'Chargeurs de téléphone, câbles et trousse de toilette de Bruno & Loles',
    TRUE,
    'tecnologia',
    'ByL',
    4
),
(
    'chk-aym-dni',
    'DNI, tarjetas sanitarias y permisos personales (Alberto y Mari)',
    'DNI, tarjetas sanitarias y permisos personales (Alberto y Mari)',
    'Cartes d''identité, cartes vitales et permis (Alberto & Mari)',
    TRUE,
    'documentacion',
    'AyM',
    5
),
(
    'chk-aym-casa',
    'Cierre de suministros, llaves de casa y alarmas (Alberto y Mari)',
    'Cierre de suministros, llaves de casa y alarmas (Alberto y Mari)',
    'Coupure des compteurs, clés de maison et alarmes (Alberto & Mari)',
    TRUE,
    'personal',
    'AyM',
    6
),
(
    'chk-aym-ropa',
    'Maletas, chubasqueros y calzado de senderismo de Alberto y Mari',
    'Maletas, chubasqueros y calzado de senderismo de Alberto y Mari',
    'Bagages, imperméables et chaussures de randonnée d''Alberto & Mari',
    TRUE,
    'equipaje',
    'AyM',
    7
),
(
    'chk-aym-cargador',
    'Cargadores de móvil, cables y neceser personal de Alberto y Mari',
    'Cargadores de móvil, cables y neceser personal de Alberto y Mari',
    'Chargeurs de téléphone, câbles et trousse de toilette d''Alberto & Mari',
    TRUE,
    'tecnologia',
    'AyM',
    8
),
(
    'chk-doc-itv',
    'Documentación del coche, seguro e ITV al día',
    'Documentación del coche, seguro e ITV al día',
    'Documentation du véhicule, assurance et contrôle technique (ITV)',
    TRUE,
    'coche',
    'general',
    9
),
(
    'chk-neumaticos',
    'Presión de neumáticos y rueda de repuesto / kit antipinchazos',
    'Presión de neumáticos y rueda de repuesto / kit antipinchazos',
    'Pression des pneus et roue de secours / kit anti-crevaison',
    TRUE,
    'coche',
    'general',
    10
),
(
    'chk-parking-codes',
    'Códigos y llaves de acceso a parking en los 9 alojamientos',
    'Códigos y llaves de acceso a parking en los 9 alojamientos',
    'Codes et clés d''accès au parking des 9 hébergements',
    TRUE,
    'alojamiento',
    'general',
    11
),
(
    'chk-autoriz-cies',
    'Autorización gratuita Xunta para Islas Cíes (Miércoles 11/11)',
    'Autorización gratuita Xunta para Islas Cíes (Miércoles 11/11)',
    'Autorisation gratuite Xunta pour les Îles Cíes (Mercredi 11/11)',
    TRUE,
    'actividades',
    'general',
    12
),
(
    'chk-marea-catedrais',
    'Reserva marea baja Playa de las Catedrales (Miércoles 18/11)',
    'Reserva marea baja Playa de las Catedrales (Miércoles 18/11)',
    'Réservation marée basse Plage des Cathédrales (Mercredi 18/11)',
    TRUE,
    'actividades',
    'general',
    13
),
(
    'chk-cargador-coche',
    'Adaptador de carga múltiple USB para el coche (4 pasajeros)',
    'Adaptador de carga múltiple USB para el coche (4 pasajeros)',
    'Adaptateur multiprise USB pour la voiture (4 passagers)',
    TRUE,
    'coche',
    'general',
    14
),
(
    'chk-bolsa-termica',
    'Bolsa térmica para empanadas y quesos gallegos de regreso',
    'Bolsa térmica para empanadas y quesos gallegos de regreso',
    'Sac isotherme pour empanadas et fromages au retour',
    TRUE,
    'equipaje',
    'general',
    15
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    title_es = EXCLUDED.title_es,
    title_fr = EXCLUDED.title_fr,
    completed = EXCLUDED.completed,
    category = EXCLUDED.category,
    target_couple = EXCLUDED.target_couple,
    order_index = EXCLUDED.order_index,
    updated_at = CURRENT_TIMESTAMP;

-- 4. Tabla de Gastos Personalizados con Imputación por Parejas (ByL vs AyM)
CREATE TABLE IF NOT EXISTS custom_expenses (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(9, 2) NOT NULL,
    payer VARCHAR(100) NOT NULL,
    target_couple VARCHAR(50) DEFAULT 'shared',
    category VARCHAR(50) DEFAULT 'general',
    date VARCHAR(50),
    day_number INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO custom_expenses (id, title, amount, payer, target_couple, category, date, day_number, notes)
VALUES
(
    'exp-gas-pinsoro',
    'Depósito lleno inicial salida Pinsoro (Gasóleo A)',
    85.00,
    'AyM',
    'shared',
    'gasolina',
    '2026-11-10',
    1,
    'Depósito lleno antes de salir por la A-68 hacia La Rioja y León.'
),
(
    'exp-peajes-a68',
    'Peajes y tramos autopista Pinsoro - Astorga - Ourense',
    28.00,
    'ByL',
    'shared',
    'peajes',
    '2026-11-10',
    1,
    'Peajes de autopista cubiertos por Bruno y Loles.'
),
(
    'exp-cies-tickets',
    'Billetes Barco Islas Cíes (4 personas ida y vuelta)',
    96.00,
    'AyM',
    'shared',
    'actividades',
    '2026-11-11',
    2,
    '4 billetes a 24€ por pasajero para el catamarán desde la estación marítima de Vigo.'
),
(
    'exp-cena-ourense',
    'Cena de bienvenida en Ourense (Rúa dos Viños: pulpo y vino Mencía)',
    72.00,
    'ByL',
    'shared',
    'restaurantes',
    '2026-11-10',
    1,
    'Pulpo á feira con cachelos, pimientos de Padrón y empanada gallega.'
),
(
    'exp-parking-ourense',
    'Parking Alameda Ourense (24 horas coche)',
    18.00,
    'AyM',
    'shared',
    'parking',
    '2026-11-10',
    1,
    'Aparcamiento vigilado subterráneo a 100m del apartamento.'
),
(
    'exp-super-astorga',
    'Aperitivos, agua mineral y empanada para el coche en Astorga',
    24.50,
    'ByL',
    'shared',
    'supermercado',
    '2026-11-10',
    1,
    'Provisiones de viaje compradas durante la parada técnica en Astorga.'
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    amount = EXCLUDED.amount,
    payer = EXCLUDED.payer,
    target_couple = EXCLUDED.target_couple,
    category = EXCLUDED.category,
    date = EXCLUDED.date,
    day_number = EXCLUDED.day_number,
    notes = EXCLUDED.notes,
    updated_at = CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_apartments_day ON apartments(day_number);
CREATE INDEX IF NOT EXISTS idx_expenses_target_couple ON custom_expenses(target_couple);
CREATE INDEX IF NOT EXISTS idx_checklist_couple ON checklist_items(target_couple);
