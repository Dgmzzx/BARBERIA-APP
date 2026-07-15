# App de Citas — Barbería

Aplicación web para reservar citas en la barbería. Construida pensando en escalar a SaaS multi-negocio en el futuro (por eso todo está organizado por `negocio_id` desde el inicio).

## Estructura del proyecto

```
app/
  [negocio]/                 → página pública de reserva (ej. /barberiapapa)
    admin/
      login/                 → login del dueño del negocio
      panel/                 → panel para ver y gestionar citas
components/
  BookingForm.tsx            → formulario de reserva (cliente)
  PanelCitas.tsx              → lista de citas del admin
lib/
  supabase/                  → clientes de conexión a la base de datos
  types.ts                   → tipos compartidos
supabase/
  schema.sql                 → esquema completo de base de datos
```

## Cómo levantar el proyecto

1. Crear un proyecto en [supabase.com](https://supabase.com) (plan gratuito es suficiente).
2. En el editor SQL de Supabase, ejecutar el contenido de `supabase/schema.sql`.
3. Copiar `.env.example` a `.env.local` y llenar con las credenciales de tu proyecto Supabase (Project Settings → API).
4. Instalar dependencias:
   ```
   npm install
   ```
5. Levantar en local:
   ```
   npm run dev
   ```
6. Abrir `http://localhost:3000/barberiapapa` para ver la página de reserva.

## Crear el usuario admin (tu padre)

En Supabase → Authentication → Users → "Add user", crear su correo y contraseña. Con eso podrá entrar a `/barberiapapa/admin/login`.

## Desplegar a producción

1. Subir el proyecto a un repositorio de GitHub.
2. Conectar el repo en [vercel.com](https://vercel.com) (plan gratuito).
3. Agregar las mismas variables de entorno del `.env.local` en la configuración del proyecto en Vercel.
4. Desplegar. El link final será algo como `tuapp.vercel.app/barberiapapa` (luego se puede conectar un dominio propio).

## Siguientes pasos sugeridos

- Ajustar nombre real de la barbería, servicios y precios en `supabase/schema.sql`.
- Reemplazar la política de RLS "placeholder" de la tabla `citas` (ver comentario en `schema.sql`) para que el panel solo muestre las citas del negocio del usuario autenticado.
- Agregar notificación por correo o WhatsApp al confirmar una cita (fase 2).
