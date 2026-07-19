# AGENTS.md

## Stack
- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Supabase** (BD + Auth) — anon key para uso público, service role key para API route
- **Resend** para notificaciones por correo
- Todo en español

## Comandos
```bash
npm install
# Requiere .env.local con credenciales de Supabase
npm run dev          # → http://localhost:3000/barberiapapa
npm run build
npm run lint         # next lint — no hay script de typecheck
```

## Variables de entorno
| Variable | De dónde se obtiene |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role (solo API route) |
| `RESEND_API_KEY` | Resend API key (opcional, para correo) |

`.env.local` está en `.gitignore`. `.env.example` está en `barberia-app/.env.example`.

## Estructura
```
app/
  [negocio]/              → página pública de reserva (/barberiapapa)
    admin/login/          → inicio de sesión con Supabase Auth
    admin/panel/          → lista de citas para el dueño
  api/citas/route.ts      → POST: crea cita (service role)
components/
  BookingForm.tsx          → formulario multi-paso del lado cliente
  PanelCitas.tsx           → lista de citas del lado cliente
lib/
  supabase/client.ts       → createBrowserClient
  supabase/server.ts       → createServerClient (cookies)
  types.ts                 → Negocio, Servicio, Cita
supabase/schema.sql        → esquema completo + datos semilla + políticas RLS
```

## Notas de arquitectura
- **Multi-negocio desde el día uno:** el segmento dinámico `[negocio]]` rutea por `slug`. Todas las tablas tienen `negocio_id`.
- **Dos clientes Supabase:** el cliente del navegador usa anon key (RLS público); la API route `api/citas/route.ts` usa `createClient` con service role key para saltarse RLS.
- **RLS:** lectura pública en `negocios`/`servicios` (solo activos), inserción pública en `citas`, y la política de selección del dueño en `citas` es un **placeholder** (`using (true)`) — falta conectar con auth.
- **Conflictos de horario** se manejan con una restricción única en la BD; la API responde 409 ante duplicados (negocio_id, fecha, hora).
- **Correo** con Resend es opcional — solo se envía si el negocio tiene `correo_notificaciones` y existe `RESEND_API_KEY`.
- **No hay tests** — no hay corredor de tests en dependencias.

## Convenciones de estilo
- Tema oscuro: bg `#141110`, surface `#1c1917`, accent `#c8752c`, texto `#efe7dc`
- Fuentes: Fraunces (`--font-display`) para títulos, Inter (`--font-body`) para cuerpo
- Alias de ruta: `@/` apunta a la raíz del proyecto

## Cosas importantes
- **Subdirectorio `barberia-app/` obsoleto** — es una copia de la plantilla original. El código activo está en la raíz del repo. No editar archivos dentro de `barberia-app/`.
- El esquema de la BD está en `supabase/schema.sql` — los cambios deben aplicarse a mano en el editor SQL de Supabase (no hay herramientas de migración).
- El login de administrador usa la tabla `auth.users` de Supabase — el usuario admin debe crearse desde el Dashboard de Supabase.
