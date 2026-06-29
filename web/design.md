---
name: Obsidian Violet
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#cfc2d6'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#988d9f'
  outline-variant: '#4d4354'
  surface-tint: '#ddb7ff'
  primary: '#ddb7ff'
  on-primary: '#490080'
  primary-container: '#b76dff'
  on-primary-container: '#400071'
  inverse-primary: '#842bd2'
  secondary: '#d3bbff'
  on-secondary: '#3f008d'
  secondary-container: '#5d03ca'
  on-secondary-container: '#c7aaff'
  tertiary: '#d3bbff'
  on-tertiary: '#3f0689'
  tertiary-container: '#a37af1'
  on-tertiary-container: '#37007c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f0dbff'
  primary-fixed-dim: '#ddb7ff'
  on-primary-fixed: '#2c0051'
  on-primary-fixed-variant: '#6900b3'
  secondary-fixed: '#ebddff'
  secondary-fixed-dim: '#d3bbff'
  on-secondary-fixed: '#250059'
  on-secondary-fixed-variant: '#5b00c5'
  tertiary-fixed: '#ebdcff'
  tertiary-fixed-dim: '#d3bbff'
  on-tertiary-fixed: '#260059'
  on-tertiary-fixed-variant: '#572ba0'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  container-max: 1200px
---

## Brand & Style

The design system is built on a foundation of **Obsidian Minimalism** infused with **Cyber-Atmospheric** accents. It targets a sophisticated, tech-forward audience that values focus, depth, and clarity. The aesthetic is intentionally dark, leveraging an obsidian-black canvas to eliminate visual noise and allow content to emerge through light and color.

The emotional response should be one of "Focused Intensity"—a sense of being in a high-performance, private digital space. By removing all blue hues and shifting to a monochromatic purple spectrum, the system adopts a more mysterious, energetic, and premium tone.

**Key Stylistic Pillars:**
- **Deep Immersion:** A true-black background (#0a0a0a) serves as the void, creating an infinite sense of space.
- **Vibrant Accents:** Electric purples are used sparingly but with high impact to guide the eye and signal interactivity.
- **Atmospheric Glow:** Using soft, blurred radial gradients and subtle "electric" borders to create depth without traditional shadows.
- **High-Contrast Clarity:** Stark white typography ensures immediate legibility against the dark void.

## Colors

The palette is strictly monochromatic in its chromaticity, relying on the purple hue (270-285°) across varying luminosities.

- **Background (Obsidian):** `#0a0a0a` is the absolute base for all surfaces.
- **Primary (Electric Purple):** `#a855f7` is used for high-visibility actions, active states, and focus indicators.
- **Secondary (Deep Violet):** `#6d28d9` is used for secondary actions and structural gradients.
- **Accent (Deepest Purple):** `#4c1d95` provides subtle depth for hover states and container backgrounds.
- **Typography:** Primary text is `#ffffff` (100% opacity), secondary text is `#a1a1aa` (Zinc-400), and tertiary/hint text is `#52525b` (Zinc-600).
- **Surface Overlays:** All overlays use a semi-transparent purple tint rather than gray to maintain the monochromatic theme.

## Typography

This design system utilizes **Geist** for its core experience—a typeface designed for precision, legibility, and a distinct "developer-centric" modernism.

- **Headlines:** Use tight letter-spacing and bold weights. Headlines should feel architectural.
- **Body:** Standard weight (400) for high readability. On dark backgrounds, ensure line height is generous (1.5x) to prevent "halpation" (text bleeding).
- **Labels & Data:** **JetBrains Mono** is used for metadata, labels, and small technical details to reinforce the systematic nature of the product. Use all-caps for labels to distinguish them from body copy.

## Layout & Spacing

The layout follows a **Rigid Fluidity** model. While the grid is fluid, elements are pinned to a strict 4px/8px baseline rhythm.

- **Grid:** A 12-column grid for desktop with 24px gutters. On mobile, transition to a 4-column grid with 16px margins.
- **Density:** High whitespace is encouraged around primary data visualizations, while utility panels should maintain a compact, "instrumental" density.
- **Alignment:** Consistent left-alignment for all text hierarchies. Right-alignment is reserved only for numerical data in tables.
- **Safe Areas:** Interactive elements must maintain a minimum 44px touch target on mobile, regardless of their visual size.

## Elevation & Depth

In an obsidian environment, depth is created through **Luminance and Color Bleed** rather than traditional drop shadows.

- **Z-Index 0 (Base):** `#0a0a0a`.
- **Z-Index 1 (Cards/Panels):** A subtle 1px border using `#ffffff10` (white at 10% opacity) or a dark purple tint `#6d28d920`.
- **Z-Index 2 (Popovers/Modals):** Use a "Purple Halo" effect—a soft, diffuse shadow with color: `0px 10px 40px -10px rgba(109, 40, 217, 0.3)`.
- **Glassmorphism:** For floating navigation or headers, use a backdrop filter (`blur: 12px`) combined with a `#0a0a0a80` (80% opaque) fill to maintain contrast.
- **Active Glow:** Primary interactive elements (like active buttons) should emit a faint #a855f7 outer glow to simulate electricity.

## Shapes

The shape language is **Soft-Technical**. We avoid perfectly sharp corners to maintain an approachable feel, but avoid overly rounded "bubbly" shapes to keep the professional tone.

- **Standard Radius:** 0.25rem (4px) for inputs, small buttons, and tags.
- **Large Radius:** 0.5rem (8px) for cards, modals, and major containers.
- **Interactive States:** On hover, shapes do not change radius, but their border-color should transition from a subtle gray/purple to the vibrant Electric Purple (#a855f7).

## Components

### Buttons
- **Primary:** Background: `#a855f7`; Text: `#0a0a0a` (High contrast). On hover, add a 10px purple glow.
- **Secondary:** Border: 1px solid `#6d28d9`; Background: Transparent; Text: `#ffffff`.
- **Ghost:** Background: Transparent; Text: `#a855f7`.

### Input Fields
- **Default:** Background: `#121212`; Border: 1px solid `#27272a`; Text: `#ffffff`.
- **Focus:** Border color: `#a855f7`; Inner Glow: 2px blur `#a855f740`.

### Cards
- **Container:** Background: `#0a0a0a`; Border: 1px solid `#ffffff10`.
- **Interactive Card:** On hover, border changes to `#6d28d9` and a subtle radial gradient `circle at top left` appears using `#a855f710`.

### Chips & Tags
- Small, uppercase JetBrains Mono text. 
- Background: `#6d28d920`; Border: 1px solid `#6d28d940`; Color: `#a855f7`.

### Progress & Loading
- Use a "Linear Flow" gradient: `linear-gradient(90deg, #6d28d9, #a855f7)`.
- Loading spinners should be a simple broken circle in Electric Purple.

### Selection (Checkboxes/Radios)
- Active state: Fill with `#a855f7`, using a white checkmark/dot for maximum contrast.
