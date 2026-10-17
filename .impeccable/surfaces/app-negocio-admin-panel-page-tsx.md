---
version: 1
slug: "app-negocio-admin-panel-page-tsx"
primary_target: "app/[negocio]/admin/panel/page.tsx"
related_targets: ["app/[negocio]/admin/login/page.tsx","components/AdminSidebar.tsx","components/PanelCitas.tsx"]
---

# Admin — login y panel

Surface: `/[negocio]/admin/*` (login y todo el panel). Modo: Operate.

## Direction contract

**THESIS:** El panel es el libro del día de la barbería: una agenda cronológica con marcas de hora en mono y estados cálidos, que reemplaza el panel genérico de tarjetas y los restos de la paleta azul "midnight" y del rojo `signal`.

**OWN-WORLD:** Paleta del sistema fijada por el usuario (ink #141110, surface #1c1917, cream #efe7dc, brass #c8752c, line #2e2822, muted #8a7f72); campos y botones con el vocabulario del formulario público (bordes white/10, fondos white/[0.06], radios xl, foco brass, caret brass); Fraunces solo en títulos, JetBrains Mono para horas y cifras; rojo únicamente para peligro/error; chips de estado cálidos.

**STORY:** El dueño abre el panel y en segundos sabe cuántas citas hay hoy, cuántas esperan confirmación y qué sigue; actúa con un toque: confirmar, reprogramar, avisar por WhatsApp, abrir la ficha del cliente.

**FIRST VIEWPORT (login):** pórtico de marca centrado sobre glow ambiental: monograma con inicial, nombre del negocio en Fraunces, tarjeta de acceso con campos etiquetados, error con recuperación y enlace de vuelta a la reserva pública.

**FIRST VIEWPORT (panel):** la fecha del día como título, una franja única de resumen (citas hoy / pendientes / completadas) y la agenda de hoy en filas con gutter de hora.

**FORM:** rework code-led dentro del mundo del sistema fijado por el usuario; sin torneo de conceptos; seed: none (unavailable).

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
