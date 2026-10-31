# 🚀 Guía de Despliegue en Hostinger VPS con Coolify y PostgreSQL

Esta guía detalla paso a paso cómo desplegar la aplicación **Expedición Galicia 10 Días** en tu propio servidor **Hostinger VPS** utilizando **Coolify** (PaaS autoalojado con Docker) y una base de datos **PostgreSQL 16**.

---

## 🏗️ Arquitectura del Despliegue

```
┌───────────────────────────────────────────────────────────────┐
│                      Hostinger VPS (Ubuntu 22.04/24.04)        │
│                                                               │
│   ┌────────────────────────────────────────────────────────┐  │
│   │               Coolify (Traefik Reverse Proxy)          │  │
│   │              Gestión SSL Let's Encrypt Automático      │  │
│   └───────────────────────────┬────────────────────────────┘  │
│                               │ :3000                         │
│               ┌───────────────▼──────────────┐                │
│               │ Contenedor Web (Applet)      │                │
│               │ - Express (server.ts)        │                │
│               │ - Frontend React 19 (Vite)   │                │
│               │ - API Gemini & Mapas         │                │
│               └───────────────┬──────────────┘                │
│                               │ :5432 (Red interna Docker)    │
│               ┌───────────────▼──────────────┐                │
│               │ Contenedor PostgreSQL 16     │                │
│               │ - init-db.sql auto-ejecutado │                │
│               │ - Volumen persistente datos  │                │
│               └──────────────────────────────┘                │
└───────────────────────────────────────────────────────────────┘
```

---

## 📋 Requisitos Previos

- **Hostinger VPS**: Recomendado plan **KVM 2** o superior (mínimo 2 vCPU, 4 GB RAM, 50 GB NVMe).
- **Sistema Operativo**: **Ubuntu 22.04 LTS** o **Ubuntu 24.04 LTS** (instalable desde el panel de Hostinger con 1 clic).
- Un dominio o subdominio apuntando a la IP pública de tu VPS (opcional pero muy recomendado para HTTPS automático).

---

## 🛠️ Paso 1: Conexión SSH a tu Hostinger VPS

Abre tu terminal (PowerShell en Windows, Terminal en Mac/Linux) y conéctate:

```bash
ssh root@IP_DE_TU_VPS
```
*(Introduce la contraseña root configurada en el panel de Hostinger).*

Actualiza los paquetes del sistema:
```bash
apt update && apt upgrade -y
```

---

## 🐳 Paso 2: Instalación de Coolify en tu VPS

Coolify se instala con un único comando oficial que configura Docker, Traefik y todas las dependencias necesarias:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

> ⏳ El proceso tarda entre 2 y 4 minutos. Al finalizar, verás un mensaje con la URL de acceso.

Abre en tu navegador web:
```
http://IP_DE_TU_VPS:8000
```
- Registra tu cuenta de administrador (nombre, correo y contraseña).

---

## 📦 Paso 3: Despliegue de la Aplicación en Coolify

Tienes **dos opciones** sencillas:

### Opción A (Recomendada): Vía Repositorio Git (GitHub / GitLab)

1. Sube este proyecto a tu GitHub:
   ```bash
   git remote add origin https://github.com/TU_USUARIO/galicia-trip.git
   git branch -M main
   git push -u origin main
   ```
2. En el panel de **Coolify**:
   - Pulsa en **Projects** -> **Default** -> **Production** -> **+ New Resource**.
   - Selecciona **Public Repository** (o Private con GitHub App).
   - Introduce la URL de tu repositorio: `https://github.com/TU_USUARIO/galicia-trip`.
   - Branch: `main`.
   - Build Pack: Selecciona **Docker Compose**.
   - Coolify detectará automáticamente el archivo `docker-compose.yml` incluido en la raíz del proyecto.

---

### Opción B: Vía Docker Compose directo en Coolify

Si prefieres no usar GitHub:
1. En **Coolify**, pulsa en **+ New Resource** -> **Docker Compose**.
2. Asigna un nombre (ej. `galicia-trip`).
3. En la pestaña de configuración, pega el contenido del archivo `docker-compose.yml` de este proyecto.

---

## 🔑 Paso 4: Configurar Variables de Entorno en Coolify

En la pestaña **Environment Variables** de tu servicio en Coolify, añade:

| Variable | Valor Recomendado / Descripción |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URL` | `postgresql://postgres:postgres_password_2026@postgres:5432/galicia_trip_db` |
| `POSTGRES_USER` | `postgres` |
| `POSTGRES_PASSWORD` | Elige una contraseña segura (ej. `TuPassSecretaGalicia2026!`) |
| `POSTGRES_DB` | `galicia_trip_db` |
| `VITE_SUPABASE_URL` | URL de tu instancia de Supabase (`https://xyz.supabase.co` o `http://tu-vps:8000`) |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anónima de Supabase (`eyJhbGci...`) |
| `GEMINI_API_KEY` | Tu API Key de Google AI Studio (para el Copiloto con Maps Grounding) |
| `VITE_GOOGLE_MAPS_API_KEY` | Tu clave de Google Maps Platform con Maps JS API y Directions API |
| `VITE_GOOGLE_MAPS_MAP_ID` | `DEMO_MAP_ID` |
| `APP_URL` | `https://tu-dominio.com` (o la URL asignada por Coolify) |

> 💡 **Nota sobre DATABASE_URL**: Si cambias `POSTGRES_PASSWORD`, actualiza también la contraseña dentro de `DATABASE_URL`. Al estar ambos servicios en la misma red de Docker (`galicia_network`), se comunican internamente por el nombre de host `postgres`.

---

## ⚡ Paso 5: Configurar Supabase en tu Hostinger VPS / Coolify

La aplicación incluye control de acceso con Supabase, asignando a cada usuario su pareja de viaje (**Pareja ByL: Bruno y Loles** o **Pareja AyM: Alberto y Mari**) para una gestión impecable de gastos y checklist.

Tienes dos opciones excelentes para conectar Supabase:

### Opción A: Supabase 1-Click en Coolify (Recomendado para VPS)
1. En el panel de Coolify de tu VPS, pulsa en **+ New Service**.
2. Busca la plantilla oficial de **Supabase** y pulsa **Deploy**.
   - Coolify desplegará automáticamente todos los microservicios de Supabase (Kong API Gateway, GoTrue Auth, PostgREST, PostgreSQL y Supabase Studio).
3. Una vez desplegado, ve a la pestaña **Environment Variables** de Supabase en Coolify y copia:
   - `ANON_KEY` (la clave pública anónima).
   - La URL pública de Kong (ej: `https://supabase.tudominio.com` o `http://IP_VPS:8000`).
4. En tu aplicación `galicia-trip` en Coolify, define:
   ```env
   VITE_SUPABASE_URL="https://supabase.tudominio.com"
   VITE_SUPABASE_ANON_KEY="tu_anon_key"
   ```

### Opción B: Proyecto Supabase Gratuito (Cloud)
1. Si prefieres no consumir recursos de CPU/RAM en tu VPS para los 10 microservicios de Supabase, crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Ve a **Project Settings** → **API**.
3. Copia la **Project URL** y la clave **anon / public**.
4. Pégalas en las variables de entorno de tu app en Coolify:
   ```env
   VITE_SUPABASE_URL="https://xxxxxxxx.supabase.co"
   VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."
   ```

### 📋 Script SQL para Supabase (Tablas y Perfiles):
En el panel de Supabase (Studio → **SQL Editor**), puedes ejecutar este script opcional si deseas sincronizar perfiles y usuarios:

```sql
-- Tabla de perfiles vinculada a auth.users de Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  couple TEXT NOT NULL CHECK (couple IN ('ByL', 'AyM')),
  display_name TEXT,
  email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver perfiles" 
ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
```

---

## 🌐 Paso 6: Asignar Dominio y Certificado SSL (HTTPS)

1. En la pestaña **General** de tu aplicación en Coolify, busca el campo **Domains**:
   - Introduce tu dominio o subdominio: `https://galicia.tudominio.com`.
2. En tu proveedor DNS (Hostinger, Cloudflare, etc.), añade un registro **A**:
   - **Host/Nombre**: `galicia` (o `@` si es dominio raíz).
   - **Valor/IP**: `IP_DE_TU_VPS`.
3. Pulsa **Save** en Coolify.
4. Coolify y Traefik generarán automáticamente un certificado SSL gratuito de **Let's Encrypt** en segundos.

---

## 🚀 Paso 7: Desplegar y Verificar

1. Pulsa en el botón **Deploy** en la esquina superior derecha de Coolify.
2. Observa los logs en tiempo real:
   - El contenedor `postgres` arrancará y ejecutará `init-db.sql`.
   - El contenedor `web` compilará la app de Vite y arrancará `server.ts`.
3. Visita tu dominio o la IP de tu servidor:
   - Al entrar verás la pantalla de bienvenida con selección de pareja (**Pareja ByL** vs **Pareja AyM**).
   - Podrás iniciar sesión con Supabase, registrarte, o entrar con el botón de **Acceso Rápido / Modo Demo**.
   - En la cabecera verás el indicador activo de Supabase, la pareja activa, y el botón para cerrar sesión.
   - Puedes comprobar la conexión con PostgreSQL abriendo en el navegador:
     `https://tu-dominio.com/api/db/status`

---

## 🗄️ Gestión y Copias de Seguridad de PostgreSQL

Los datos de la base de datos se almacenan en el volumen Docker `postgres_data`, por lo que **nunca se pierden al actualizar o reiniciar los contenedores**.

### Hacer una copia de seguridad manual (Dump SQL):
Conéctate por SSH a tu VPS y ejecuta:
```bash
docker exec -t galicia_trip_postgres pg_dump -U postgres galicia_trip_db > backup_galicia_$(date +%F).sql
```

### Restaurar una copia de seguridad:
```bash
docker exec -i galicia_trip_postgres psql -U postgres galicia_trip_db < backup_galicia.sql
```

---

## 🪟 Solución al error de Windows ("Carpeta comprimida no válida")

Si descargaste el archivo `.zip` y Windows indicó que era inválido:
1. Esto ocurría porque las versiones anteriores descargaban el archivo `index.html` debido al enrutamiento de la SPA.
2. Ahora se ha implementado un endpoint binario dedicado:
   - Descarga directa garantizada desde: `https://tu-dominio.com/api/export-zip`
   - O usando el botón **"Exportar ZIP"** en el pie de página de la aplicación web.
   - El archivo se genera con compresión estándar ZIP32 y rutas normalizadas con `/`, compatible al 100% con el explorador nativo de Windows 10 y Windows 11.
