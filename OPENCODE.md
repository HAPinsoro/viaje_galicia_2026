# OpenCode Project Specification & Developer Guide

## 📌 Proyecto: Expedición Galicia 10 Días (Pinsoro a Galicia)

Este proyecto es una aplicación web full-stack diseñada para la planificación, navegación, cálculo de costes por parejas y gestión de tareas de una ruta circular de 10 días y 9 noches por Galicia para 4 personas (2 parejas: **ByL** y **AyM**), con salida y llegada en Pinsoro (Zaragoza).

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 19, TypeScript, Vite 8
- **Estilos**: Tailwind CSS v4 (`@tailwindcss/vite`), Lucide React icons, Motion
- **Autenticación**: Supabase Auth (`@supabase/supabase-js`) con asignación de pareja (ByL vs AyM), persistencia de sesión y modo demo/invitado
- **Mapas**: Google Maps JavaScript API (`@vis.gl/react-google-maps`) con Advanced Markers, Polyline en carretera real y estilo nocturno personalizado.
- **Backend**: Node.js + Express (`server.ts`) ejecutado con `tsx` para proxy de IA Gemini, base de datos PostgreSQL y exportación ZIP.
- **Persistencia Dual**: PostgreSQL (`pg` + `init-db.sql`) para VPS auto-alojado, Firebase Firestore v12 (`tripPersistence.ts`) y fallback offline (`localStorage`).
- **Exportación**: jsPDF y jsPDF-AutoTable para generación de PDF profesional de la ruta con desglose financiero.
- **Internacionalización**: Español (ES) y Francés (FR) mediante `LanguageContext`.

---

## 🚀 Inicio Rápido en OpenCode

### 1. Instalación de dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```
Rellena las claves necesarias:
- `GEMINI_API_KEY`: Tu clave de Google AI Studio (para el asistente de IA con Grounding de Google Maps).
- `VITE_GOOGLE_MAPS_API_KEY`: Clave de Google Maps Platform (Maps JS API, Directions API y Places API).
- `VITE_GOOGLE_MAPS_MAP_ID`: ID de mapa vectorial (opcional, por defecto `DEMO_MAP_ID`).

### 3. Ejecutar en desarrollo
```bash
npm run dev
```
La aplicación se abrirá en `http://localhost:3000`.

### 4. Compilar para producción
```bash
npm run build
npm run start
```

### 5. Comprobar tipos TypeScript
```bash
npm run lint
```

---

## 📁 Arquitectura y Archivos Clave

```
├── server.ts                       # Servidor Express: API Gemini con Maps Grounding + Vite middlewares
├── firebase-applet-config.json     # Configuración de Firebase Firestore del proyecto
├── firestore.rules                 # Reglas de seguridad de Firestore
├── package.json                    # Scripts y dependencias
├── vite.config.ts                  # Configuración de Vite con Tailwind v4 y React
├── public/                         # Assets estáticos y descargables (galicia-trip-project.zip)
├── src/
│   ├── App.tsx                     # Shell principal con navegación por pestañas y modales
│   ├── main.tsx                    # Punto de entrada React
│   ├── firebase.ts                 # Inicialización de Firebase SDK y Firestore
│   ├── types/
│   │   └── trip.ts                 # Tipos TS: RouteDay, PointOfInterest, CustomExpense, UserApartment, etc.
│   ├── data/
│   │   └── galiciaRouteData.ts     # Master data: 10 etapas, paradas turísticas, restaurantes, coordenadas
│   ├── context/
│   │   └── LanguageContext.tsx     # Contexto bilingüe Español / Francés
│   ├── services/
│   │   ├── tripPersistence.ts      # Suscripciones y operaciones Firestore (apartamentos, gastos, checklist)
│   │   └── pdfGenerator.ts         # Generador de informe PDF completo con desglose por parejas
│   ├── components/
│   │   ├── MapComponent.tsx        # Mapa Google Maps con los 9 apartamentos, ruta vial y puntos de interés
│   │   ├── TripCostCalculator.tsx  # Calculadora financiera con imputación por pareja (ByL vs AyM) y balance
│   │   ├── ChecklistHub.tsx        # Checklist de salida ultra-compacto con vista por parejas y syncing doble
│   │   ├── ApartmentsHub.tsx       # Gestión de los 9 apartamentos con horarios de check-in/out, parking y precio
│   │   ├── GastronomyGuide.tsx     # Guía gastronómica gallega por ciudades y especialidades
│   │   ├── DayDetailView.tsx       # Ficha detallada de la etapa diaria con línea de tiempo y paradas
│   │   ├── DaySelector.tsx         # Selector horizontal de etapas (Día 1 a Día 10)
│   │   ├── Header.tsx              # Cabecera con selector de idiomas, tabs y botón Copiloto
│   │   └── AIAssistantModal.tsx    # Modal de copiloto de viaje alimentado por Gemini
└── scripts/
    └── export-project.py           # Script para empaquetar el proyecto en ZIP/TAR.GZ
```

---

## 🧩 Características de Negocio Importantes

### 1. Imputación de Gastos por Pareja (Bruno y Loles [ByL] vs Alberto y Mari [AyM])
- En `src/components/TripCostCalculator.tsx`:
  - Los gastos pueden ser **Compartidos (50% cada pareja)** o imputables exclusivamente a **Bruno y Loles [ByL] (100%)** o a **Alberto y Mari [AyM] (100%)** (ej. guardería canina, compras personales).
  - Incluye tarjeta de balance y liquidación que indica exactamente quién debe pagar a quién para saldar cuentas.
  - El PDF descargable incluye el desglose individual por pareja.

### 2. Checklist de Salida (ChecklistHub)
- Pestaña dedicada optimizada para máxima densidad en pantalla.
- Filtros por categoría: Todas, Maletas, Coche, Documentos, Apartamentos, General.
- Vista individual o **Vista por Parejas** (Bruno y Loles [ByL] a la izquierda, Alberto y Mari [AyM] a la derecha).
- Al añadir una tarea en modo "Vista por Parejas", la tarea se duplica y añade automáticamente tanto a ByL como a AyM con identificadores únicos (`chk-${Date.now()}-byl` y `chk-${Date.now()}-aym`).

### 3. Situación de los 9 Apartamentos en el Mapa
- `src/components/MapComponent.tsx` renderiza los 9 alojamientos nocturnos en Galicia con etiquetas esmeralda `🏠 Noche X · [Ciudad]`.
- Muestra el precio total (4 pax) y por pareja, horarios de check-in/out, estado del parking y enlace directo a Google Maps.
- El filtro "Aptos <120€" enfoca automáticamente los 9 alojamientos en el mapa y oculta el resto de puntos.

---

## 🐳 Despliegue con Docker

El proyecto incluye un `Dockerfile` multi-stage optimizado para producción (Coolify, Dokku, Render, Fly.io o VPS con Docker):

```bash
docker build -t galicia-trip .
docker run -p 3000:3000 --env-file .env galicia-trip
```
El contenedor arranca en el puerto 3000 con `server.ts` y los assets compilados en `/dist`.
