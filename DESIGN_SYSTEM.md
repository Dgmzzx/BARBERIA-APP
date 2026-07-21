---
name: Midnight Copper
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#ffb77b'
  on-secondary: '#4d2700'
  secondary-container: '#7a4100'
  on-secondary-container: '#ffb270'
  tertiary: '#bcc7de'
  on-tertiary: '#263143'
  tertiary-container: '#0c1829'
  on-tertiary-container: '#768197'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdcc2'
  secondary-fixed-dim: '#ffb77b'
  on-secondary-fixed: '#2e1500'
  on-secondary-fixed-variant: '#6d3a00'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system establishes a premium, urban, and sophisticated aesthetic for a modern barbershop. It departs from traditional vintage barber tropes in favor of a "Modern Midnight" style—combining deep, atmospheric tones with metallic warmth.

The brand personality is confident, masculine, and meticulous. It leverages **Minimalism** with **Tactile** accents, using subtle gradients to mimic brushed metal and depth. The visual response should evoke the feeling of a high-end grooming lounge: quiet luxury, precision, and an evening-inspired atmosphere. White space is replaced with "dark space," using intentional gaps to create a sense of exclusivity and calm.

## Colors

The palette is anchored by **Deep Midnight Blue**, serving as the foundation for all backgrounds to establish a moody, premium environment. **Brushed Copper** acts as the singular high-contrast accent, used sparingly for calls to action, active indicators, and iconography to guide the eye.

**Surface hierarchies:**
- **Primary Background:** Deep Midnight (#0F172A).
- **Secondary Surfaces:** Slate Gray (#1E293B) for primary cards and content sections.
- **Tertiary Surfaces:** Light Slate (#334155) for borders, subtle dividers, and input fields.

Interactive elements use a "Lustre" effect: hover states on copper elements should transition to a lighter, more vibrant metallic shade, while active/pressed states deepen to a rich bronze.

## Typography

The typographic strategy balances authority with utility. **Playfair Display** provides a sophisticated, editorial feel for headlines, reminiscent of luxury lifestyle publications. Its high-contrast serifs contrast beautifully against the dark UI.

**Inter** is utilized for all functional text, ensuring maximum readability on dark backgrounds.
- **Headlines:** Use Playfair Display with tighter letter spacing for a "locked-in" professional look.
- **Body Text:** Use Inter with slightly increased line-height to prevent "vibrating" text on dark surfaces.
- **Labels:** Small labels and overlines should use uppercase Inter with wide letter spacing to denote precision and detail.

## Layout & Spacing

The design system utilizes an **8px spacing scale** to maintain mathematical harmony. The layout follows a **Fluid Grid** model with a maximum content width of 1200px to maintain an intimate, centered feel on large displays.

**Breakpoints:**
- **Mobile (<768px):** 4-column layout with 16px side margins. Cards usually stack vertically.
- **Tablet (768px - 1024px):** 8-column layout with 24px gutters.
- **Desktop (>1024px):** 12-column layout with 24px gutters and generous 48px margins to emphasize the premium "space."

Component spacing should prioritize large vertical padding (top/bottom) to evoke a sense of luxury and lack of clutter.

## Elevation & Depth

Depth is achieved through **Tonal Layers** and **Subtle Gradients** rather than heavy shadows.
- **Base Level:** Deep Midnight (#0F172A).
- **Raised Level (Cards/Modals):** Slate Gray (#1E293B) with a 1px border in #334155 to define edges.
- **Interactive Depth:** Buttons feature a subtle linear gradient from the top-left (Brushed Copper) to bottom-right (Deep Bronze) to simulate light hitting a metallic surface.
- **Shadows:** Use extremely soft, low-opacity shadows (e.g., `0 12px 24px rgba(0,0,0,0.4)`) to lift elements without breaking the dark, cohesive atmosphere.

## Shapes

The system uses **Rounded (Value 2)** corners to soften the industrial nature of the color palette.
- **Standard UI elements (Buttons, Inputs):** 8px (`0.5rem`) radius.
- **Containers & Cards:** 16px (`1rem`) radius.
- **Imagery:** Photos of barbers and tools should feature the same 16px radius to maintain a consistent language of "approachable precision."

## Components

### Buttons
Primary buttons use the Brushed Copper gradient with white or deep navy text. Secondary buttons should be "Ghost" style—transparent with a 1px Copper border. Icons within buttons should always be placed on the leading edge.

### Input Fields
Inputs use the #1E293B surface with a #334155 border. On focus, the border transitions to Brushed Copper. Placeholders should be low-contrast (Slate #94A3B8) to keep the UI clean.

### Cards
Cards are the primary vehicle for services (e.g., "The Signature Cut"). They should use a subtle vertical gradient of the slate colors. Service prices should be highlighted in Brushed Copper.

### Chips & Tags
Use chips for "Barber Availability" or "Specialties." These should be dark (#334155) with light text, except for "Active" states which switch to a Copper fill.

### List Items
Booking slots and service lists use thin #334155 horizontal dividers. Hovering over a list item should subtly shift the background color to a slightly lighter slate.
