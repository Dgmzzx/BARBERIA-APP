# 💈 Barberia App — Sistema de Citas Premium 💈

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Resend](https://img.shields.io/badge/Resend-Email_Notifications-orange?style=for-the-badge&logo=resend)](https://resend.com/)

Una sofisticada aplicación web multi-negocio diseñada para la reserva y gestión de citas en barberías y salones de estética premium. Construida con una arquitectura robusta, moderna y pensada para escalar como un modelo SaaS (Software as a Service) desde el primer día.

---

## ✨ Características Principales

*   🚀 **Arquitectura Multi-Negocio (SaaS Ready):** Enrutamiento dinámico `/[negocio]` basado en slugs (ej: `/barberiapapa`). Todas las tablas y relaciones de la base de datos están segmentadas mediante `negocio_id`.
*   📅 **Formulario de Reserva Inteligente (`BookingForm`):** Un flujo interactivo y multi-paso del lado del cliente que guía al usuario en la selección de servicios, fecha y hora de manera fluida y adaptativa.
*   🔒 **Gestión de Citas para el Administrador:** Panel privado de administración (`/[negocio]/admin/panel`) con autenticación mediante **Supabase Auth** para visualizar y gestionar la agenda diaria en tiempo real.
*   ⚡ **Prevención de Conflictos de Horario:** Mecanismo ultra-seguro a nivel de base de datos que evita la sobre-reserva mediante una restricción única (`unique_constraint`) que valida en tiempo real la disponibilidad para un `negocio_id`, fecha y hora específicos.
*   ✉️ **Notificaciones automáticas por Correo (Opcional):** Integración impecable con **Resend** para notificar al cliente y al negocio tras una confirmación exitosa de la cita.
*   🎨 **Experiencia Visual de Lujo (Midnight Copper):** Inspirada en la estética premium de los salones modernos. Colores profundos ("Midnight Blue") con acentos metálicos y cálidos de cobre cepillado ("Brushed Copper").

---

## 📂 Estructura del Proyecto

El código fuente activo está completamente integrado en la raíz del repositorio siguiendo los estándares de Next.js App Router:

```text
├── app/
│   ├── api/
│   │   └── citas/route.ts       # POST: Genera citas eludiendo RLS con la Service Role Key
│   └── [negocio]/               # Enrutamiento dinámico multi-negocio
│       ├── page.tsx             # Página pública de reserva para el negocio
│       └── admin/
│           ├── login/           # Inicio de sesión con Supabase Auth
│           └── panel/           # Dashboard privado para el dueño (gestión de citas)
├── components/
│   ├── BookingForm.tsx          # Formulario de reserva multi-paso interactivo
│   ├── PanelCitas.tsx           # Dashboard de visualización y control de citas
│   ├── AdminSidebar.tsx         # Barra de navegación lateral de administración
│   ├── AdminConfigForm.tsx      # Configuración del negocio y horarios
│   └── ServiciosList.tsx        # Catálogo interactivo de servicios del negocio
├── lib/
│   ├── supabase/
│   │   ├── client.ts            # Cliente Supabase del navegador (RLS activo)
│   │   └── server.ts            # Cliente Supabase del servidor (Manejo de Cookies)
│   ├── helpers.ts               # Utilidades de fecha y formateadores comunes
│   └── types.ts                 # Tipados estáticos de TypeScript (Negocio, Servicio, Cita)
├── supabase/
│   └── schema.sql               # Esquema SQL completo, datos semilla y políticas de RLS
├── DESIGN_SYSTEM.md             # Especificación completa del sistema de diseño visual
└── AGENTS.md                    # Documentación técnica interna y notas de arquitectura
```

> **⚠️ Nota importante:** El subdirectorio heredado `barberia-app/` se encuentra obsoleto y no debe modificarse. El desarrollo activo reside exclusivamente en los directorios de la raíz.

---

## 🛠️ Guía de Instalación y Configuración

Sigue estos pasos para ejecutar una copia local del proyecto en tu entorno de desarrollo:

### 1. Clonar y preparar las dependencias
Instala todas las dependencias requeridas en la raíz del proyecto:
```bash
npm install
```

### 2. Configurar la Base de Datos en Supabase
1. Crea un proyecto gratuito en [Supabase](https://supabase.com).
2. Ve al panel de control de tu proyecto y accede al **SQL Editor**.
3. Copia el contenido completo de `supabase/schema.sql` y ejecútalo para crear las tablas, relaciones, restricciones y poblar la base de datos con datos semilla.

### 3. Configurar las Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto (basándote en `.env.example`) y añade tus credenciales:

```env
# Supabase - Públicas (utilizadas en el navegador)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-publica

# Supabase - Privada (utilizada solo en API Routes)
SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role-privada

# Resend - Envíos de correo electrónico (Opcional)
RESEND_API_KEY=re_tu_api_key_de_resend
```

### 4. Ejecutar el Servidor de Desarrollo
Inicia el entorno de desarrollo local con el siguiente comando:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`. Accede a la página pública del negocio semilla introduciendo su slug en la URL:
👉 **`http://localhost:3000/barberiapapa`**

---

## 🔐 Configuración de Administradores

1. Para que un dueño de negocio pueda gestionar sus citas, crea su cuenta de usuario en Supabase entrando a tu proyecto → **Authentication** → **Users** → **Add user**.
2. Rellena el correo y la contraseña.
3. El dueño podrá iniciar sesión directamente desde `http://localhost:3000/barberiapapa/admin/login`. Al autenticarse con éxito, será redirigido de manera automática al panel de gestión privado (`/admin/panel`).

---

## 🎨 Sistema de Diseño: Midnight Copper

La identidad visual rompe con los tradicionales clichés vintage de barberías y se enfoca en un concepto de **lujo moderno y nocturno**:

*   **Paleta de Colores:**
    *   `Fondo Principal`: Azul profundo medianoche (`#051424`) para un ambiente inmersivo y premium.
    *   `Superficies Secundarias`: Grises pizarra (`#1E293B`) que alojan tarjetas, inputs y paneles interactivos.
    *   `Acento Principal`: Cobre cepillado (`#ffb77b` / `#ffb270`) que evoca destellos metálicos y se utiliza estrictamente para llamadas a la acción, estados activos y elementos clave de interacción.
*   **Tipografía:**
    *   `Títulos (Display)`: **Playfair Display**, con alta presencia, serifas elegantes y espaciado de letras ajustado para una estética editorial.
    *   `Cuerpo de texto`: **Inter**, garantizando legibilidad óptima y descanso visual sobre fondos oscuros.

---

## 🚀 Despliegue en Producción (Vercel)

1. Sube tu repositorio de código a **GitHub**.
2. Importa el proyecto en [Vercel](https://vercel.com) (plan Hobby/Gratuito es ideal).
3. Configura exactamente las mismas variables de entorno declaradas en tu `.env.local` dentro del panel de configuración de Vercel.
4. Despliega. Tu aplicación estará en vivo bajo un dominio como `mi-barberia.vercel.app/barberiapapa`. ¡Listo para recibir reservas de tus clientes!

---

Desarrollado con ❤️ y precisión técnica. ¡Mejora el estilo de tu negocio con reservas fluidas y automáticas!
