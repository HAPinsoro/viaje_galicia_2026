# 🧭 Gran Expedición a Galicia (10 Días) · Pinsoro a Galicia

Aplicación web integral para la planificación, navegación en carretera real, cálculo financiero por parejas y lista de tareas para una expedición circular de 10 días (9 noches) por Galicia saliendo desde Pinsoro (Zaragoza) para 2 parejas (4 personas: **Bruno y Loles [ByL]** y **Alberto y Mari [AyM]**).

---

## ✨ Funcionalidades Principales

1. **Mapa Interactivo con Google Maps Platform**:
   - Trazado de ruta vial real siguiendo carreteras y autovías gallegas.
   - **Situación de los 9 Apartamentos**: Localización destacada de cada noche de alojamiento (Ourense, Baiona, Pontevedra, Santiago, Finisterre, Muxía, Betanzos, Viveiro, Lugo) con precios por pareja, horarios de check-in/out y disponibilidad de parking.
   - Puntos turísticos, miradores espectaculares y restaurantes tradicionales recomendados.
   - Selector de vistas: Satélite, Modo Oscuro y Relieve topográfico.

2. **Calculadora de Costes y Liquidación por Parejas**:
   - Imputación de gastos flexible: **Compartido al 50%**, **100% Bruno y Loles (ByL)** o **100% Alberto y Mari (AyM)** (ej. guardería canina, gastos personales).
   - Cálculo automático de saldos y tarjeta de liquidación ("ByL debe pagar a AyM...").
   - Estimación de combustible según precio por litro y consumo de vehículo.
   - Exportación de informe completo en PDF con tablas detalladas por pareja.

3. **Checklist de Salida (Optimizado para Pantalla)**:
   - Vista por Parejas (listas sincronizadas e independientes para Bruno y Loles [ByL] y Alberto y Mari [AyM]).
   - Inserción simultánea en ambas parejas con identificadores únicos.
   - Filtrado por categorías: Maletas, Coche, Documentos, Apartamentos y General.
   - Barras de progreso en tiempo real y contador de tareas completadas.

4. **Copiloto de Viaje con IA (Gemini 2.5 Flash)**:
   - Asistente inteligente con Grounding en Google Maps para resolver dudas sobre aparcamientos, tiempos de conducción y recomendaciones gastronómicas.

5. **Sincronización en la Nube (Firebase Firestore)**:
   - Persistencia multiusuario en tiempo real para que ambas parejas consulten y editen gastos, apartamentos y tareas desde cualquier dispositivo, con soporte offline local.

6. **Bilingüe (Español / Francés)**:
   - Interfaz y contenidos adaptados tanto en español como en francés.

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js 20+ o Node.js 22+
- npm o bun

### Pasos

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd galicia-trip
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   Rellena en `.env`:
   - `VITE_GOOGLE_MAPS_API_KEY`: Tu clave de Google Maps Platform.
   - `GEMINI_API_KEY`: Tu clave de Google Gemini (opcional para el asistente de IA).

4. **Iniciar en modo desarrollo**:
   ```bash
   npm run dev
   ```
   Visita `http://localhost:3000` en tu navegador.

5. **Compilar para producción**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📦 Exportación y Transición a OpenCode

Para migrar este proyecto a **OpenCode** o a cualquier entorno autónomo:

1. Ejecuta el script de empaquetado:
   ```bash
   npm run export:bundle
   ```
   Esto generará un archivo ZIP limpio (`public/galicia-trip-project.zip` y `galicia-trip-project.zip`) que contiene todo el código fuente listo para abrirse en OpenCode.

2. También puedes descargar el ZIP directamente desde la propia aplicación web o a través de la URL `/galicia-trip-project.zip`.

3. En OpenCode:
   - Abre la carpeta descomprimida o clona el repositorio git.
   - Consulta `OPENCODE.md` para las directrices arquitectónicas y comandos clave.

---

## 🐳 Despliegue con Docker

El proyecto cuenta con un `Dockerfile` multi-stage ligero listo para desplegar en Coolify, Docker Compose o VPS:

```bash
docker build -t galicia-trip .
docker run -p 3000:3000 --env-file .env galicia-trip
```

---

## 📄 Licencia

Uso privado para la expedición de 10 días por Galicia.
