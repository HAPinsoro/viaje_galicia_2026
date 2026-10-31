import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { initPostgresSchema, pool, isPostgresConfigured } from './src/db/postgres';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security hardening: hide server framework
app.disable('x-powered-by');

// Security headers middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  next();
});

app.use(express.json());

// Public runtime config endpoint: provides Supabase & Maps keys from server environment
app.get('/api/public-config', (_req: Request, res: Response) => {
  res.json({
    supabaseUrl:
      process.env.VITE_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      'https://supabase.viajes.cloud',
    supabaseAnonKey:
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      '',
    googleMapsApiKey:
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      '',
  });
});

// Initialize Gemini SDK with server-side API Key
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// API route for AI Trip Assistant with Google Maps Grounding
app.post('/api/gemini/plan-assist', async (req: Request, res: Response) => {
  try {
    const { prompt, currentDay, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'El campo prompt es obligatorio.' });
    }

    if (!ai) {
      return res.status(503).json({
        error: 'Servicio de IA no configurado (GEMINI_API_KEY no encontrada).',
        fallback: true,
      });
    }

    const systemInstruction = `
Eres el guía experto de viajes y copiloto local para una ruta de 10 días por Galicia en coche saliendo de Pinsoro (Zaragoza) para un grupo de 4 personas.
Tus prioridades:
1. Recomendar paradas turísticas auténticas, miradores, monasterios, faros y pueblos marineros.
2. Recomendar gastronomía gallega local de primer nivel (pulperías, marisquerías, tascas, bodegas de vino DO Rías Baixas/Ribeira Sacra, tortilla de Betanzos, pimientos de Padrón, etc.).
3. Para alojamientos: Priorizar SIEMPRE apartamentos completos para 4 personas con presupuesto MENOR a 120€ por noche (< 30€/persona), céntricos o con excelente conexión a transporte público, con PARKING PROPIO o PÚBLICO en las inmediaciones (<150m), y con reseñas destacadas (>4.8★).
4. Dar consejos prácticos de conducción, distancias, aparcamientos cómodos para el coche y horarios.
5. Responde siempre en español, con tono cercano, estructurado, práctico y optimista. Usa listas claras, emojis útiles y datos concretos (precios aprox, tiempos de viaje, platos estrella).
Contexto del viaje actual: ${context || 'Ruta 10 días Pinsoro (Zaragoza) -> Ribeira Sacra/Ourense -> Vigo/Allariz -> Islas Cíes/Baiona -> Combarro/O Grove/Cambados -> Santiago de Compostela -> Fisterra/Muxía (Costa da Morte Sur) -> Camariñas/Cabo Vilán/A Coruña -> Betanzos/Cedeira/San Andrés de Teixido -> Praia das Catedrais/Lugo -> Regreso a Pinsoro'}.
Día seleccionado: ${currentDay || 'General'}.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ googleMaps: {} }],
      },
    });

    const reply = response.text || 'No se pudo generar respuesta.';

    // Extract grounding metadata if available
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata || null;

    return res.json({
      text: reply,
      groundingMetadata,
    });
  } catch (error: any) {
    console.error('Error en /api/gemini/plan-assist:', error);
    return res.status(500).json({
      error: 'Error al consultar el asistente de viaje.',
      details: error.message || 'Error desconocido',
    });
  }
});

// API route for finding specialized budget apartments for 4 pax (<120€)
app.post('/api/gemini/search-apartments', async (req: Request, res: Response) => {
  try {
    const { city, maxPrice = 120, numGuests = 4, preferences = '' } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Servicio de IA no disponible.',
      });
    }

    const prompt = `Busca y recomienda los 3 mejores apartamentos turísticos o alojamientos enteros para 4 personas en ${city || 'Galicia'} con un presupuesto máximo de ${maxPrice}€ por noche total.
Deben cumplir:
- Capacidad real para 4 adultos (mínimo 2 dormitorios o cama doble + sofá cama espacioso).
- Ubicación céntrica o a menos de 10-15 minutos a pie del centro histórico, o con parada de autobús/transporte público muy cercana.
- Puntuación excelente de clientes (> 4.5/5).
- Preferencias adicionales del grupo: ${preferences || 'Buen WiFi, cocina equipada, fácil aparcamiento o parking cercano'}.
Proporciona para cada uno: nombre, ubicación exacta aproximada, precio orientativo por noche para 4 personas, distancia al centro, ventajas para el grupo y puntos destacados.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres un experto asesor de alojamiento turístico en Galicia enfocado en apartamentos de gran relación calidad-precio para grupos de 4 personas.',
        tools: [{ googleMaps: {} }],
      },
    });

    return res.json({
      city,
      text: response.text,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null,
    });
  } catch (error: any) {
    console.error('Error en /api/gemini/search-apartments:', error);
    return res.status(500).json({
      error: 'Error al buscar alojamientos.',
      details: error.message,
    });
  }
});

// API route for gastronomy finder
app.post('/api/gemini/gastronomy-guide', async (req: Request, res: Response) => {
  try {
    const { location, dishType } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Servicio de IA no disponible.',
      });
    }

    const prompt = `Recomienda los mejores lugares gastronómicos y platos imperdibles en ${location || 'Galicia'} (${dishType ? 'especialidad: ' + dishType : 'mariscos, pulpo, empanadas, carnes o vinos'}).
Incluye restaurantes, pulperías tradicionales o casas de comidas frecuentadas por gente local, con rango de precio medio (€-€€) accesible para 4 personas y platos clave para pedir.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    return res.json({
      location,
      text: response.text,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null,
    });
  } catch (error: any) {
    console.error('Error en /api/gemini/gastronomy-guide:', error);
    return res.status(500).json({
      error: 'Error al obtener guía gastronómica.',
      details: error.message,
    });
  }
});

// ==========================================
// Safe ZIP & TAR Project Download Endpoints (100% Windows Compatible)
// ==========================================
app.get(['/api/export-zip', '/galicia-trip-project.zip'], (_req: Request, res: Response) => {
  const rootZip = path.resolve(process.cwd(), 'galicia-trip-project.zip');
  const publicZip = path.resolve(process.cwd(), 'public', 'galicia-trip-project.zip');

  const targetZip = fs.existsSync(rootZip) ? rootZip : (fs.existsSync(publicZip) ? publicZip : null);

  if (targetZip) {
    const stats = fs.statSync(targetZip);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="galicia-trip-project.zip"');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');
    return res.sendFile(targetZip);
  }

  // Generate on the fly if not found
  try {
    execSync('python3 scripts/export-project.py');
    if (fs.existsSync(rootZip)) {
      const stats = fs.statSync(rootZip);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="galicia-trip-project.zip"');
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(rootZip);
    }
  } catch (err) {
    console.error('Error generating project zip on demand:', err);
  }

  return res.status(404).json({ error: 'Archivo ZIP no disponible' });
});

app.get(['/api/export-tar', '/galicia-trip-project.tar.gz'], (_req: Request, res: Response) => {
  const rootTar = path.resolve(process.cwd(), 'galicia-trip-project.tar.gz');
  const publicTar = path.resolve(process.cwd(), 'public', 'galicia-trip-project.tar.gz');

  const targetTar = fs.existsSync(rootTar) ? rootTar : (fs.existsSync(publicTar) ? publicTar : null);

  if (targetTar) {
    const stats = fs.statSync(targetTar);
    res.setHeader('Content-Type', 'application/gzip');
    res.setHeader('Content-Disposition', 'attachment; filename="galicia-trip-project.tar.gz"');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.sendFile(targetTar);
  }

  return res.status(404).json({ error: 'Archivo TAR.GZ no disponible' });
});

// ==========================================
// PostgreSQL REST API Endpoints (Hostinger / Coolify)
// ==========================================

// 1. Database Status
app.get('/api/db/status', async (_req: Request, res: Response) => {
  if (!pool || !isPostgresConfigured) {
    return res.json({ enabled: false, connected: false, engine: 'firestore_fallback' });
  }
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now');
    client.release();
    return res.json({ enabled: true, connected: true, engine: 'postgres', timestamp: result.rows[0].now });
  } catch (err: any) {
    return res.json({ enabled: true, connected: false, engine: 'postgres', error: err.message });
  }
});

// 2. Apartments Endpoints
app.get('/api/db/apartments', async (_req: Request, res: Response) => {
  if (!pool) return res.status(503).json({ error: 'Postgres not configured' });
  try {
    const { rows } = await pool.query('SELECT * FROM apartments ORDER BY day_number ASC');
    const items = rows.map((r) => ({
      id: r.id,
      dayNumber: r.day_number,
      nightDate: r.night_date,
      city: r.city,
      name: r.name,
      name_es: r.name_es,
      name_fr: r.name_fr,
      address: r.address,
      price: parseFloat(r.price) || 0,
      checkInTime: r.check_in_time,
      checkOutTime: r.check_out_time,
      freeCancellation: r.free_cancellation,
      cancellationPolicy: r.cancellation_policy,
      parking: r.parking,
      distanceToCenter: r.distance_to_center,
      bathrooms: r.bathrooms,
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
    return res.json(items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/db/apartments', async (req: Request, res: Response) => {
  if (!pool) return res.status(503).json({ error: 'Postgres not configured' });
  const a = req.body;
  try {
    const query = `
      INSERT INTO apartments (
        id, day_number, night_date, city, name, name_es, name_fr, address,
        price, check_in_time, check_out_time, free_cancellation, cancellation_policy,
        parking, distance_to_center, bathrooms, notes, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
      ON CONFLICT (day_number) DO UPDATE SET
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
        updated_at = NOW()
      RETURNING *;
    `;
    const values = [
      a.id || `apt-day-${a.dayNumber}`,
      a.dayNumber,
      a.nightDate || '',
      a.city || '',
      a.name || '',
      a.name_es || null,
      a.name_fr || null,
      a.address || '',
      a.price || 0,
      a.checkInTime || '15:00',
      a.checkOutTime || '11:00',
      a.freeCancellation ?? true,
      a.cancellationPolicy || '',
      a.parking || '',
      a.distanceToCenter || '',
      a.bathrooms || 1,
      a.notes || '',
    ];
    const { rows } = await pool.query(query, values);
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/db/apartments/:dayNumber', async (req: Request, res: Response) => {
  if (!pool) return res.status(503).json({ error: 'Postgres not configured' });
  try {
    await pool.query('DELETE FROM apartments WHERE day_number = $1', [parseInt(req.params.dayNumber, 10)]);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Custom Expenses Endpoints
app.get('/api/db/expenses', async (_req: Request, res: Response) => {
  if (!pool) return res.status(503).json({ error: 'Postgres not configured' });
  try {
    const { rows } = await pool.query('SELECT * FROM custom_expenses ORDER BY created_at DESC');
    const items = rows.map((r) => ({
      id: r.id,
      title: r.title,
      amount: parseFloat(r.amount) || 0,
      payer: r.payer,
      targetCouple: r.target_couple,
      category: r.category,
      date: r.date,
      dayNumber: r.day_number,
      notes: r.notes,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
    return res.json(items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/db/expenses', async (req: Request, res: Response) => {
  if (!pool) return res.status(503).json({ error: 'Postgres not configured' });
  const e = req.body;
  try {
    const query = `
      INSERT INTO custom_expenses (
        id, title, amount, payer, target_couple, category, date, day_number, notes, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        amount = EXCLUDED.amount,
        payer = EXCLUDED.payer,
        target_couple = EXCLUDED.target_couple,
        category = EXCLUDED.category,
        date = EXCLUDED.date,
        day_number = EXCLUDED.day_number,
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING *;
    `;
    const values = [
      e.id || `exp-${Date.now()}`,
      e.title || '',
      e.amount || 0,
      e.payer || 'ByL',
      e.targetCouple || 'shared',
      e.category || 'general',
      e.date || new Date().toISOString(),
      e.dayNumber || null,
      e.notes || '',
    ];
    const { rows } = await pool.query(query, values);
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/db/expenses/:id', async (req: Request, res: Response) => {
  if (!pool) return res.status(503).json({ error: 'Postgres not configured' });
  try {
    await pool.query('DELETE FROM custom_expenses WHERE id = $1', [req.params.id]);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Checklist Endpoints
app.get('/api/db/checklist', async (_req: Request, res: Response) => {
  if (!pool) return res.status(503).json({ error: 'Postgres not configured' });
  try {
    const { rows } = await pool.query('SELECT * FROM checklist_items ORDER BY order_index ASC, id ASC');
    const items = rows.map((r) => ({
      id: r.id,
      title: r.title,
      title_es: r.title_es,
      title_fr: r.title_fr,
      completed: r.completed,
      category: r.category,
      targetCouple: r.target_couple,
      updatedAt: r.updated_at,
    }));
    return res.json(items);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/db/checklist', async (req: Request, res: Response) => {
  if (!pool) return res.status(503).json({ error: 'Postgres not configured' });
  const c = req.body;
  try {
    const query = `
      INSERT INTO checklist_items (
        id, title, title_es, title_fr, completed, category, target_couple, order_index, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        title_es = EXCLUDED.title_es,
        title_fr = EXCLUDED.title_fr,
        completed = EXCLUDED.completed,
        category = EXCLUDED.category,
        target_couple = EXCLUDED.target_couple,
        order_index = EXCLUDED.order_index,
        updated_at = NOW()
      RETURNING *;
    `;
    const values = [
      c.id || `chk-${Date.now()}`,
      c.title || '',
      c.title_es || null,
      c.title_fr || null,
      Boolean(c.completed),
      c.category || 'general',
      c.targetCouple || 'general',
      c.orderIndex || 0,
    ];
    const { rows } = await pool.query(query, values);
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/db/checklist/:id', async (req: Request, res: Response) => {
  if (!pool) return res.status(503).json({ error: 'Postgres not configured' });
  const { completed } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE checklist_items SET completed = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [Boolean(completed), req.params.id]
    );
    return res.json(rows[0] || { success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/db/checklist/:id', async (req: Request, res: Response) => {
  if (!pool) return res.status(503).json({ error: 'Postgres not configured' });
  try {
    await pool.query('DELETE FROM checklist_items WHERE id = $1', [req.params.id]);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 5. Trip Settings Endpoints
app.get('/api/db/settings', async (_req: Request, res: Response) => {
  if (!pool) return res.status(503).json({ error: 'Postgres not configured' });
  try {
    const { rows } = await pool.query('SELECT * FROM trip_settings WHERE id = $1', ['default']);
    if (rows.length === 0) {
      return res.json({
        fuelPricePerLiter: 1.62,
        carConsumption: 6.8,
        foodDailyBudgetPerPax: 35,
        totalPax: 4,
      });
    }
    const r = rows[0];
    return res.json({
      fuelPricePerLiter: parseFloat(r.fuel_price_per_liter) || 1.62,
      carConsumption: parseFloat(r.car_consumption) || 6.8,
      foodDailyBudgetPerPax: parseFloat(r.food_daily_budget_per_pax) || 35,
      totalPax: r.total_pax || 4,
      updatedAt: r.updated_at,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/db/settings', async (req: Request, res: Response) => {
  if (!pool) return res.status(503).json({ error: 'Postgres not configured' });
  const s = req.body;
  try {
    const query = `
      INSERT INTO trip_settings (
        id, fuel_price_per_liter, car_consumption, food_daily_budget_per_pax, total_pax, updated_at
      ) VALUES ('default', $1, $2, $3, $4, NOW())
      ON CONFLICT (id) DO UPDATE SET
        fuel_price_per_liter = EXCLUDED.fuel_price_per_liter,
        car_consumption = EXCLUDED.car_consumption,
        food_daily_budget_per_pax = EXCLUDED.food_daily_budget_per_pax,
        total_pax = EXCLUDED.total_pax,
        updated_at = NOW()
      RETURNING *;
    `;
    const values = [
      s.fuelPricePerLiter || 1.62,
      s.carConsumption || 6.8,
      s.foodDailyBudgetPerPax || 35,
      s.totalPax || 4,
    ];
    const { rows } = await pool.query(query, values);
    return res.json(rows[0]);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Setup Vite middleware in dev or static serving in prod
async function startServer() {
  // Initialize PostgreSQL schema if configured
  try {
    await initPostgresSchema();
  } catch (err) {
    console.warn('[Server] PostgreSQL auto-init deferred or failed:', (err as Error).message);
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
