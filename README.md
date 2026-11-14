# Barbería App

Aplicación web de reservas para barberías con página pública por negocio y panel de administración. Construida con Next.js 14, TypeScript, Tailwind CSS y Supabase.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_%26_Auth-green?logo=supabase)](https://supabase.com/)

## Funcionalidades

- **Reserva pública por negocio:** página en `/[slug]` con flujo de tres pasos: servicio, fecha y hora, datos del cliente.
- **Disponibilidad real:** horarios por día de la semana, varios bloques de atención por día, días bloqueados y horas ya ocupadas.
- **Panel de administración:** resumen del día, agenda, cambio de estado, reprogramación y cancelación con motivo.
- **Ficha de cliente:** datos de contacto, historial de citas e historial de cambios.
- **Gestión de servicios:** crear, editar, activar y desactivar servicios.
- **Configuración del negocio:** horarios semanales y bloqueo de fechas por vacaciones, feriados u otros motivos.
- **Avisos en tiempo real:** nuevas citas y recordatorios mediante Server-Sent Events.
- **Contacto por WhatsApp:** enlaces directos con mensajes prellenados para confirmar, reprogramar o cancelar una cita.
- **Correo opcional al negocio:** notificación con Resend al recibir una nueva reserva.

## Stack

- Next.js 14.2 (App Router) y React 18
- TypeScript 5
- Tailwind CSS 3
- Supabase (Postgres, Auth y Realtime)
- Resend (opcional)
- date-fns

## Estructura

```text
app/
  [negocio]/              # Página pública y rutas del panel por slug
  api/                    # Endpoints de citas, servicios, negocio, bloqueos y SSE
components/               # Componentes de reserva y administración
lib/                      # Clientes de Supabase, tipos, helpers y hooks
supabase/schema.sql       # Esquema, datos iniciales y políticas RLS
```

## Puesta en marcha

### Requisitos

- Node.js 18.17 o superior
- Un proyecto de Supabase
- Una API key de Resend solo si se desea enviar correo

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear la base de datos

En el proyecto de Supabase, abre el **SQL Editor** y ejecuta el contenido completo de `supabase/schema.sql`. El script crea las tablas, índices, políticas RLS y un negocio de ejemplo con slug `barberiapapa`.

Ejecútalo una sola vez en un proyecto nuevo, ya que las tablas se crean sin `IF NOT EXISTS`.

### 3. Configurar variables de entorno

Crea `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
RESEND_API_KEY=re_tu_api_key
```

`SUPABASE_SERVICE_ROLE_KEY` solo debe usarse en el servidor. `RESEND_API_KEY` es opcional.

### 4. Iniciar desarrollo

```bash
npm run dev
```

Con los datos iniciales del esquema:

- Reservas: `http://localhost:3000/barberiapapa`
- Login de administración: `http://localhost:3000/barberiapapa/admin/login`
- Panel: `http://localhost:3000/barberiapapa/admin/panel`

La portada `/` muestra el negocio definido en `SLUG` dentro de `app/page.tsx` (actualmente `barberiawady`). Si usas los datos del seed, cámbialo a `barberiapapa` o accede directamente a `/[slug]`.

### 5. Crear usuario administrador

En el Dashboard de Supabase entra a **Authentication > Users > Add user** y crea el usuario con correo y contraseña. Ese usuario podrá iniciar sesión en `/[slug]/admin/login`.

## Multi-negocio

Cada negocio se identifica por un `slug` y todos los registros incluyen `negocio_id`. Para agregar otro negocio, crea su fila en `negocios` y sus servicios y horarios en las tablas correspondientes. La página pública quedará disponible en `/[slug]` sin cambios de código.

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # ESLint
```

## Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en Vercel.
3. Configura las mismas variables de entorno de `.env.local`.
4. Despliega.

Para enviar correos en producción, verifica un dominio en Resend y actualiza el remitente en `app/api/citas/route.ts`; el valor por defecto `onboarding@resend.dev` es solo para pruebas.

## Notas

- El esquema se aplica manualmente desde el SQL Editor de Supabase; el proyecto no incluye herramientas de migración.
- El endpoint SSE usa el runtime de Node.js, ya configurado en `app/api/sse/route.ts`.
