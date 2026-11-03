-- =====================================================================
-- Expedición Noroeste · Galicia 10 Días
-- Script Completo de Inicialización y Población de Datos para Supabase
-- Compatible con PostgreSQL 14, 15, 16 y 17 (Supabase / Coolify / Hostinger)
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

-- 2. Apartamentos de la Ruta Circular
-- Los datos de los 9 apartamentos quedan fijados directamente dentro del código de la aplicación (src/data/galiciaRouteData.ts).
-- Si la tabla existía previamente en la base de datos, se elimina:
DROP TABLE IF EXISTS apartments CASCADE;

-- 3. Tabla de Checklist de Salida con Sincronización Doble
CREATE TABLE IF NOT EXISTS checklist_items (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_es VARCHAR(255),
    title_fr VARCHAR(255),
    completed BOOLEAN DEFAULT FALSE,
    category VARCHAR(50) DEFAULT 'general',
    target_couple VARCHAR(50) DEFAULT 'general', -- 'ByL', 'AyM', 'general'
    order_index INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar los 15 Elementos del Checklist de Salida
INSERT INTO checklist_items (id, title, title_es, title_fr, completed, category, target_couple, order_index)
VALUES
-- Bruno y Loles (ByL)
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

-- Alberto y Mari (AyM)
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

-- Tareas Comunes de Vehículo y Reservas (general)
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
    payer VARCHAR(100) NOT NULL, -- 'ByL', 'AyM'
    target_couple VARCHAR(50) DEFAULT 'shared', -- 'shared' (50/50), 'ByL' (100%), 'AyM' (100%)
    category VARCHAR(50) DEFAULT 'general',
    date VARCHAR(50),
    day_number INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar los Gastos Iniciales de la Ruta Compartida
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

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_expenses_target_couple ON custom_expenses(target_couple);
CREATE INDEX IF NOT EXISTS idx_checklist_couple ON checklist_items(target_couple);
