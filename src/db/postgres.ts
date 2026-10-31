import pg from 'pg';

const { Pool } = pg;

// Connection Pool Configuration
// Reads standard DATABASE_URL (provided automatically by Coolify or Docker Compose)
// e.g. postgresql://postgres:password@postgres:5432/galicia_trip_db
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

export const isPostgresConfigured = Boolean(
  databaseUrl || (process.env.PGHOST && process.env.PGDATABASE)
);

export const pool = isPostgresConfigured
  ? new Pool({
      connectionString: databaseUrl,
      host: process.env.PGHOST,
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : null;

// Test connection
export async function testPostgresConnection(): Promise<boolean> {
  if (!pool) return false;
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (err) {
    console.warn('[PostgreSQL] Connection check failed:', (err as Error).message);
    return false;
  }
}

// Automatic Schema Initialization on Server Start
export async function initPostgresSchema() {
  if (!pool) {
    console.log('[PostgreSQL] No database configuration found. Running in hybrid/Firestore mode.');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Settings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trip_settings (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'default',
        fuel_price_per_liter NUMERIC DEFAULT 1.62,
        car_consumption NUMERIC DEFAULT 6.8,
        food_daily_budget_per_pax NUMERIC DEFAULT 35,
        total_pax INTEGER DEFAULT 4,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Apartments Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS apartments (
        id VARCHAR(100) PRIMARY KEY,
        day_number INTEGER NOT NULL UNIQUE,
        night_date VARCHAR(100),
        city VARCHAR(100) NOT NULL,
        name VARCHAR(255) NOT NULL,
        name_es VARCHAR(255),
        name_fr VARCHAR(255),
        address TEXT,
        price NUMERIC DEFAULT 0,
        check_in_time VARCHAR(50),
        check_out_time VARCHAR(50),
        free_cancellation BOOLEAN DEFAULT TRUE,
        cancellation_policy TEXT,
        parking TEXT,
        distance_to_center TEXT,
        bathrooms INTEGER DEFAULT 1,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 3. Custom Expenses Table (with ByL / AyM couple attribution)
    await client.query(`
      CREATE TABLE IF NOT EXISTS custom_expenses (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        amount NUMERIC NOT NULL,
        payer VARCHAR(100) NOT NULL,
        target_couple VARCHAR(50) DEFAULT 'shared',
        category VARCHAR(50) DEFAULT 'general',
        date VARCHAR(50),
        day_number INTEGER,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 4. Checklist Items Table (with ByL / AyM couple sync)
    await client.query(`
      CREATE TABLE IF NOT EXISTS checklist_items (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        title_es VARCHAR(255),
        title_fr VARCHAR(255),
        completed BOOLEAN DEFAULT FALSE,
        category VARCHAR(50) DEFAULT 'general',
        target_couple VARCHAR(50) DEFAULT 'general',
        order_index INTEGER DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    await client.query('COMMIT');
    console.log('[PostgreSQL] Database schema verified and initialized successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[PostgreSQL] Error initializing database schema:', error);
    throw error;
  } finally {
    client.release();
  }
}
