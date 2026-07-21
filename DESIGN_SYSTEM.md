# Sistema de Diseño — Barbería Clásica

## Identidad

**Concepto:** "Brass & Leather" — La interfaz se siente como el interior de una barbería tradicional: carbón, cuero, latón pulido y el rojo característico del poste de barbero. Todo tiene peso, calidez y oficio.

**Audiencia:** Hombres que buscan un corte de pelo rápido, sin vueltas. La página debe transmitir confianza y calidad en segundos.

**Job de la página:** Permitir reservar una cita en menos de 30 segundos con cero dudas.

## Paleta

| Token | Hex | RGB | Uso |
|---|---|---|---|
| `ink` | `#1A1A1A` | `26,26,26` | Fondo principal — carbón profundo |
| `surface` | `#2A2A2A` | `42,42,42` | Superficies elevadas (cards, sidebar) |
| `cream` | `#F5F5F0` | `245,245,240` | Fondo secundario — inputs, formularios, texto sobre oscuro |
| `signal` | `#C41E3A` | `196,30,58` | Rojo barbería — CTAs, acentos principales |
| `brass` | `#B08D57` | `176,141,87` | Dorado/latón — detalles premium, hover, adornos |
| `line` | `#3A3A3A` | `58,58,58` | Bordes y reglas |
| `muted` | `#8A8A8A` | `138,138,138` | Texto secundario, placeholders |
| `cream-dark` | `#D4D4C8` | `212,212,200` | Texto cream con más contraste sobre oscuro |

## Tipografía

| Uso | Fuente | Peso | Tracking |
|---|---|---|---|
| Display | **Fraunces** (variable) | 400, 700 | -0.02em |
| Body | **Inter** | 400, 500, 600 | 0 |
| Mono | **JetBrains Mono** | 400 | 0.05em (números) |

## Botones

### Primario (rojo barbería — acción principal)

```
bg-signal hover:bg-signal/90 active:scale-[0.97]
text-cream font-semibold tracking-wide
rounded-md px-8 py-3.5
shadow-lg shadow-signal/20
transition-all duration-150
disabled:opacity-30 disabled:cursor-not-allowed
```

### Secundario (latón — acción secundaria)

```
border-2 border-brass text-brass
hover:bg-brass hover:text-ink
rounded-md px-6 py-2.5 font-medium
transition-all duration-150
```

### Terciario (outline — acción sutil)

```
border border-line text-cream/70
hover:border-cream/30 hover:text-cream
rounded-md px-4 py-2 text-sm
transition-all duration-150
```

### Hora (grilla de slots)

```
border border-line text-cream/70 hover:border-brass/30 hover:text-cream
rounded-md py-2.5 px-2 text-sm font-mono
selected: bg-brass text-ink border-brass font-medium
transition-all duration-150
```

### Tarjeta de servicio

```
border border-line hover:border-brass/30 hover:bg-surface
rounded-md p-4 text-left w-full
selected: border-signal/60 bg-signal/[0.06]
transition-all duration-150
```

### Toggle día (AdminConfig)

```
Activo:  bg-signal text-cream border-signal
Inactivo: border-line text-cream/40 hover:border-brass/30
rounded-md px-3 py-2 text-xs uppercase tracking-wider
transition-all duration-150
```

## Inputs

```
bg-surface border border-line rounded-md px-4 py-3
text-cream placeholder:text-muted font-body text-sm
focus:outline-none focus:border-brass/50 focus:ring-1 focus:ring-brass/20
transition-all duration-150
```

Sobre fondo cream (formulario):
```
bg-cream border border-line/30 rounded-md px-4 py-3
text-ink placeholder:text-muted/50 font-body text-sm
focus:outline-none focus:border-signal/50 focus:ring-1 focus:ring-signal/20
transition-all duration-150
```

## Elemento Signature

**Barber Rule** — Una regla decorativa que evoca el poste de barbero. Rayas diagonales rojo, hueso y latón. Usada con extrema moderación (1-2 veces por página como máximo).

```css
.barber-rule {
  background: repeating-linear-gradient(
    45deg,
    #C41E3A 0px, #C41E3A 4px,
    #F5F5F0 4px, #F5F5F0 8px,
    #B08D57 8px, #B08D57 12px
  );
  height: 3px;
}
```

## Animaciones

| Nombre | Trigger | Efecto |
|---|---|---|
| `fade-up` | Secciones al montar | Opacity 0→1, translateY 8→0 |
| `stamp-in` | Confirmación de cita | Slide + rotate, como hierro marcando cuero |
| `press-in` | Click en botón | scale 1→0.97, sombra interior |

## Espaciado

- Componentes: `space-y-6` entre secciones, `space-y-3` entre items
- Padding interior: `p-6` en cards, `px-4 py-3` en inputs
- Layout máximo: `max-w-lg mx-auto` para formulario público

## Archivos modificados

| Archivo | Cambios |
|---|---|
| `tailwind.config.ts` | Paleta nueva, keyframes press-in, colores renombrados |
| `app/globals.css` | Base colors, barber-rule, inputs, selection |
| `app/layout.tsx` | Fuente display → Fraunces |
| `components/BookingForm.tsx` | Botones, cards, divisores, confirmación |
| `components/AdminSidebar.tsx` | Sidebar con rojo/dorado |
| `components/AdminConfigForm.tsx` | Botones, switches de día |
| `components/PanelCitas.tsx` | Cards de citas, badges |
