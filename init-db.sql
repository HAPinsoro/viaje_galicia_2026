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

-- Insertar valores iniciales si no existen
INSERT INTO trip_settings (id, fuel_price_per_liter, car_consumption, food_daily_budget_per_pax, total_pax)
VALUES ('default', 1.620, 6.80, 35.00, 4)
ON CONFLICT (id) DO NOTHING;

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

-- 3. Tabla de Gastos Personalizados con Imputación por Parejas (ByL vs AyM)
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

-- 4. Tabla de Checklist de Salida con Sincronización Doble
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

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_apartments_day ON apartments(day_number);
CREATE INDEX IF NOT EXISTS idx_expenses_target_couple ON custom_expenses(target_couple);
CREATE INDEX IF NOT EXISTS idx_checklist_couple ON checklist_items(target_couple);
