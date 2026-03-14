# Phase D1 — Figma-Style Fill System

> Research date: 2026-03-14
> Source: Live Figma session on demo file + screenshot analysis
> Screenshots: `screenshots/figma-fill-01-*.png` through `figma-fill-12-*.png`

---

## Table of Contents

1. [Figma Fill System — Complete Analysis](#1-figma-fill-system--complete-analysis)
   - 1.1 Fill Panel (Properties Sidebar)
   - 1.2 Fill Types Overview
   - 1.3 Solid Fill — Color Picker Deep Dive
   - 1.4 Gradient Fill
   - 1.5 Image Fill
   - 1.6 Pattern Fill
   - 1.7 Video Fill
   - 1.8 Blend Modes
   - 1.9 Keyboard Shortcuts
   - 1.10 Interaction States
2. [Data Model Design](#2-data-model-design)
3. [Component Architecture](#3-component-architecture)
4. [Phase 1 — Solid Fill](#4-phase-1--solid-fill)
5. [Phase 2 — Gradient Fill](#5-phase-2--gradient-fill)
6. [Phase 3 — Image Fill](#6-phase-3--image-fill)
7. [Phase 4 — Blend Modes](#7-phase-4--blend-modes)
8. [Phase 5 — Polish & Extras](#8-phase-5--polish--extras)
9. [Canvas Rendering Strategy](#9-canvas-rendering-strategy)
10. [File Checklist](#10-file-checklist)

---

## 1. Figma Fill System — Complete Analysis

### 1.1 Fill Panel (Properties Sidebar)

> Screenshot: `figma-fill-03-scrolled.png`

The Fill section lives in the right Design panel, below "Appearance". Structure:

```
Fill                    [⧉ style]  [+]
─────────────────────────────────────
[▓ swatch] Solid   D8D8D8  100  %  [👁] [−]
[▓ swatch] Linear            100  %  [👁] [−]
```

**Section header row:**
- Lock icon + "Fill" label
- **Style/Variable button** (`⧉`) — opens saved color style/variable picker
- **Add fill button** (`+`) — appends a new default solid white fill

**Each fill row contains:**

| Element | Behaviour |
|---|---|
| Color swatch | Click → open color picker for that fill |
| Type label | "Solid", "Linear", "Image", "Pattern", "Video" |
| Hex value | Inline-editable text field |
| Opacity `%` | Inline-editable, 0–100 |
| Eye icon (👁) | Toggle visibility (fill remains in list but renders transparent) |
| Remove button (−) | Only visible on row **hover**; removes fill permanently |

**Multiple fills:** Stacked top→bottom. **Top fill = foreground** (rendered last / highest `z`). Drag handles allow reorder.

---

### 1.2 Fill Types Overview

> Screenshot: `figma-fill-04-color-picker-open.png`

The color picker dialog shows a row of 7 icon tabs (but logically maps to 5 radio button types):

| Tab | Radio value | Description |
|---|---|---|
| ■ Solid square | `SOLID` | Flat color |
| → Linear gradient | `GRADIENT_LINEAR` | Sub-type of Gradient |
| ◉ Radial gradient | `GRADIENT_RADIAL` | Sub-type of Gradient |
| ↻ Angular gradient | `GRADIENT_ANGULAR` | Sub-type of Gradient |
| ◇ Diamond gradient | `GRADIENT_DIAMOND` | Sub-type of Gradient |
| 🖼 Image | `IMAGE` | Raster image fill |
| ⊞ Pattern | `PATTERN` | Tiled component |
| ● Video | `VIDEO` | Video fill (Pro plan) |

In the accessibility tree, the radio group has 5 items: **Solid, Gradient, Pattern, Image, Video**. "Gradient" shows a sub-type dropdown when selected; the 4 gradient icons are shortcuts to each sub-type directly.

---

### 1.3 Solid Fill — Color Picker Deep Dive

> Screenshots: `figma-fill-04-color-picker-open.png`, `figma-fill-10-color-formats.png`

#### Dialog Structure

```
┌──────────────────────────────────────────────────┐
│  Custom    Libraries                    [+] [✕]  │
├──[■]──[→]──[◉]──[↻]──[◇]──[🖼]──[⊞]──[🔇]──[⊡]─┤  fill type tabs
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │           2D GRADIENT FIELD              │    │
│  │  x-axis = Saturation (0→100%)            │    │
│  │  y-axis = Value/Lightness (100→0%)       │    │
│  │                                          │    │
│  │  ○ (draggable reticle)                   │    │
│  └──────────────────────────────────────────┘    │
│  [🔍]  [══════════ Hue slider ══════════════]    │
│        [══════════ Opacity slider ══════════]    │
│  [Hex▾]  [D8D8D8           ]  [ 100   %]        │
├──────────────────────────────────────────────────┤
│  On this page ▾                                  │
│  [■] [░] [▭]   (document color swatches)        │
└──────────────────────────────────────────────────┘
```

#### 2D Gradient Field
- Background: CSS `background: linear-gradient(to right, white, hsl(hue, 100%, 50%))` + `linear-gradient(to top, black, transparent)`
- White circle reticle with shadow, draggable
- X-axis controls **saturation** (0 at left, 100 at right)
- Y-axis controls **brightness/value** (100 at top, 0 at bottom)

#### Hue Slider
- Left→Right: rainbow from 0° to 360°
- CSS: `background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)`
- Circular thumb, draggable

#### Opacity Slider
- Left: transparent (checkerboard), Right: fully opaque (current hue color)
- CSS: checkerboard pseudo-element + `linear-gradient(to right, transparent, currentColor)`

#### Eyedropper
- Activates OS color sampler
- Shortcut: `I`

#### Color Format Selector
> Screenshot: `figma-fill-10-color-formats.png`

Dropdown with 5 options — each changes the input field(s) below:

| Format | Inputs shown |
|---|---|
| **Hex** | Single `rrggbb` hex field |
| **RGB** | Three fields: R (0-255), G (0-255), B (0-255) |
| **CSS** | Single field: `rgba(r, g, b, a)` |
| **HSL** | Three fields: H (0-360°), S (0-100%), L (0-100%) |
| **HSB** | Three fields: H (0-360°), S (0-100%), B (0-100%) |

All formats show a separate opacity `%` field, **except CSS** (which embeds alpha in the `rgba()`).

#### Document Swatches Panel
- Dropdown: "On this page" / "Recent colors" / team library swatches
- Shows all unique colors used in the current page
- Click a swatch → immediately applies that color
- "+" button in header → save current color as a new style/variable

#### Header Buttons
- **Custom** tab: Always-visible, shows local picker
- **Libraries** tab: Browse design system color styles/variables
- **New style or variable** (`+`): Creates a saved color style from current value

---

### 1.4 Gradient Fill

> Screenshots: `figma-fill-05-gradient.png`, `figma-fill-06-gradient-types.png`

#### Picker Layout (when Gradient is selected)

```
┌──────────────────────────────────┐
│  [Linear ▾]    [⇄ Flip] [↺ Rotate]│
│  ┌────[○]───────────────[○]────┐  │  ← gradient stop handles (draggable)
│  │ ░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓│  │  ← gradient preview bar
│  └─────────────────────────────┘  │
│  Stops                     [+]   │
│  ┌──────────────────────────────┐ │
│  │  0%   [░] D8D8D8  100  %  [−]│ │
│  │ 100%  [▓] 727272  100  %  [−]│ │
│  └──────────────────────────────┘ │
└──────────────────────────────────┘
```

#### Gradient Sub-types
> Screenshot: `figma-fill-06-gradient-types.png`

| Type | CSS equivalent | Description |
|---|---|---|
| **Linear** | `linear-gradient()` | Straight directional gradient |
| **Radial** | `radial-gradient(circle, ...)` | Emanates from center point |
| **Angular** | `conic-gradient()` | Sweeps 360° around a center |
| **Diamond** | Custom SVG/canvas | Diamond-shaped (no direct CSS) |

#### Gradient Controls
| Control | Description |
|---|---|
| Type dropdown | Switch between Linear/Radial/Angular/Diamond |
| Flip button | Reverses stop order (0%↔100%) |
| Rotate button | Rotates gradient direction 90° |
| Preview bar | Visual gradient preview |
| Stop handles | Circular handles on bar, draggable to reposition |
| Add stop (+) | Click empty area of bar OR the + button |
| Stop selected | Click handle → color picker below shows that stop's color |
| Delete stop | Select handle → Backspace/Delete, or − button in list |
| Min stops | Always 2 (cannot delete if only 2 remain) |

#### Stop Row Fields
Each stop in the list shows:
- Position `%` (editable text field, 0–100)
- Color swatch (click → opens nested color picker for that stop)
- Hex value (editable)
- Opacity `%` (editable)
- Remove button (`−`)

#### On-Canvas Handles
When the gradient picker is open, Figma renders handles directly on the canvas element:
- Two circular handles connected by a line
- Drag handle to move gradient start/end point
- Drag line to translate the gradient
- For radial: three handles (center, radius x, radius y)

---

### 1.5 Image Fill

> Screenshots: `figma-fill-07-image.png`, `figma-fill-08-image-scale-modes.png`

#### Picker Layout

```
┌──────────────────────────────────┐
│  [Fill ▾]                [↺ 90°] │
│  ┌────────────────────────────┐  │
│  │   [Upload from computer]  │  │
│  │   [✨ Make an image]      │  │
│  └────────────────────────────┘  │
│  Exposure     [━━━━━━━━━○━━━━━]  │
│  Contrast     [━━━━━━━━━○━━━━━]  │
│  Saturation   [━━━━━━━━━○━━━━━]  │
│  Temperature  [━━━━━━━━━○━━━━━]  │
│  Tint         [━━━━━━━━━○━━━━━]  │
│  Highlights   [━━━━━━━━━○━━━━━]  │
│  Shadows      [━━━━━━━━━○━━━━━]  │
└──────────────────────────────────┘
```

#### Scale Modes
> Screenshot: `figma-fill-08-image-scale-modes.png`

| Mode | CSS equivalent | Behaviour |
|---|---|---|
| **Fill** | `background-size: cover` | Fills container, crops edges |
| **Fit** | `background-size: contain` | Fits entirely, letterboxes |
| **Crop** | `background-size: auto` + position | Original size, repositionable |
| **Tile** | `background-repeat: repeat` | Repeats to fill container |

#### Image Adjustments (7 sliders)
All sliders are centered at 0 (neutral), range approximately −100 to +100:

| Slider | CSS filter equivalent |
|---|---|
| Exposure | `brightness()` |
| Contrast | `contrast()` |
| Saturation | `saturate()` |
| Temperature | Custom (warm/cool shift — no direct CSS) |
| Tint | Custom (green/magenta shift) |
| Highlights | Custom (tone mapping) |
| Shadows | Custom (tone mapping) |

#### Upload Options
- **Upload from computer** — file picker, accepts image formats
- **Make an image** — opens Figma AI image generation (prompt-based)

---

### 1.6 Pattern Fill

> Screenshot: `figma-fill-09-pattern.png`

#### Picker Layout

```
┌──────────────────────────────────┐
│  [Select source…  🖼]            │
│  ┌────────────────────────────┐  │
│  │   (source component        │  │
│  │    preview visible here)   │  │
│  └────────────────────────────┘  │
│  Tile type  [⊞ Rect] [⬡ Hex]   │
│  Scale      [100%              ] │
│  Spacing  X [0%               ] │
│           Y [0%               ] │
│  Alignment  [· · ·]             │
│             [· · ·]             │
│             [· · ·]             │
└──────────────────────────────────┘
```

#### Controls

| Control | Description |
|---|---|
| Select source | Pick any component from the Figma canvas to use as tile unit |
| Tile type: Rectangular | Standard grid pattern (rows × cols) |
| Tile type: Hexagonal | Offset rows (honeycomb pattern) |
| Scale `%` | Size of each tile relative to original |
| Spacing X / Y | Gap between tiles as `%` of tile size |
| Alignment (9-pt) | Anchor point for pattern origin within container |

---

### 1.7 Video Fill

> Screenshot: `figma-fill-12-video.png`

Same shape as Image Fill but:
- Uploads video files instead of images
- Requires **Professional plan** (shows upgrade prompt on Free)
- Has the same Scale modes: Fill, Fit, Crop, Tile
- No adjustment sliders (video-specific playback controls instead)

**Our plan**: Implement UI shell but note as "Pro feature — not in MVP scope."

---

### 1.8 Blend Modes

> Screenshot: `figma-fill-11-blend-modes.png`

Accessed via the blend mode button (top-right of color picker, looks like overlapping circles icon). Per-fill blend mode (applies to how this fill composites with layers below it).

18 blend modes in 5 visual groups:

```
✓ Normal
──────────────────
  Darken
  Multiply
  Plus darker
  Color burn
──────────────────
  Lighten
  Screen
  Plus lighter
  Color dodge
──────────────────
  Overlay
  Soft light
  Hard light
──────────────────
  Difference
  Exclusion
──────────────────
  Hue
  Saturation
  Color
  Luminosity
```

CSS `mix-blend-mode` mapping:

| Figma | CSS |
|---|---|
| Normal | `normal` |
| Darken | `darken` |
| Multiply | `multiply` |
| Plus darker | `plus-darker` (non-standard, use `darken` fallback) |
| Color burn | `color-burn` |
| Lighten | `lighten` |
| Screen | `screen` |
| Plus lighter | `plus-lighter` (non-standard, use `screen` fallback) |
| Color dodge | `color-dodge` |
| Overlay | `overlay` |
| Soft light | `soft-light` |
| Hard light | `hard-light` |
| Difference | `difference` |
| Exclusion | `exclusion` |
| Hue | `hue` |
| Saturation | `saturation` |
| Color | `color` |
| Luminosity | `luminosity` |

---

### 1.9 Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `I` | Activate eyedropper (sample color from screen) |
| `Delete` / `Backspace` | Remove selected gradient stop |
| `Tab` | Cycle between color channel inputs (R→G→B, H→S→L, etc.) |
| `Enter` | Confirm current input field |
| `Esc` | Close color picker without confirming |
| `↑` / `↓` | Nudge numeric input by 1 |
| `Shift+↑` / `Shift+↓` | Nudge numeric input by 10 |
| Click+drag on hue slider | Move hue |
| Click+drag on opacity slider | Move opacity |
| Click+drag on gradient field | Move color reticle |
| Click on gradient bar | Add new stop at that position |
| Drag gradient stop handle | Move stop position |
| Type hex directly in field | Accepts 3-digit (`ABC`) or 6-digit (`AABBCC`) hex |
| Paste `rgb(...)` / `hsl(...)` | Auto-parsed into current format |

---

### 1.10 Interaction States

#### Fill Row States

| State | Visual |
|---|---|
| Default | `[swatch] [label] [hex] [opacity%] [👁]` — no remove button |
| Hover | Remove `[−]` button appears on right edge |
| Active (picker open) | Row has highlighted background |
| Visibility off | Eye icon closed, swatch shown with reduced opacity |
| Dragging (reorder) | Row has drag affordance, other rows shift |

#### Color Picker States

| State | Visual |
|---|---|
| Initial open | Shows current fill values pre-filled |
| Reticle dragging | Real-time color update on canvas |
| Hue dragging | Gradient field background updates live |
| Opacity dragging | Canvas element opacity updates live |
| Input focused | Cursor in text field, full content selected |
| Input commit | Press Enter or Tab — validates and applies |
| Input invalid | Red border, reverts to last valid value |
| Eyedropper active | Cursor changes to crosshair, Figma dims UI |

---

## 2. Data Model Design

### Core Types (`src/types/canvas.ts`)

```typescript
// ─────────────────────────────────────────────────────
// Blend Modes
// ─────────────────────────────────────────────────────
export type BlendMode =
  | 'NORMAL' | 'DARKEN' | 'MULTIPLY' | 'PLUS_DARKER' | 'COLOR_BURN'
  | 'LIGHTEN' | 'SCREEN' | 'PLUS_LIGHTER' | 'COLOR_DODGE'
  | 'OVERLAY' | 'SOFT_LIGHT' | 'HARD_LIGHT'
  | 'DIFFERENCE' | 'EXCLUSION'
  | 'HUE' | 'SATURATION' | 'COLOR' | 'LUMINOSITY'

// ─────────────────────────────────────────────────────
// Gradient Stop
// ─────────────────────────────────────────────────────
export interface GradientStop {
  id: string              // nanoid, for React keys
  position: number        // 0–1 (maps to 0%–100%)
  color: string           // 6-digit hex, no '#'
  opacity: number         // 0–1
}

// ─────────────────────────────────────────────────────
// Fill Types
// ─────────────────────────────────────────────────────
export interface SolidFill {
  id: string
  type: 'SOLID'
  color: string           // 6-digit hex, no '#'
  opacity: number         // 0–1 (fill-level opacity, not node opacity)
  visible: boolean
  blendMode: BlendMode
}

export type GradientType =
  | 'GRADIENT_LINEAR'
  | 'GRADIENT_RADIAL'
  | 'GRADIENT_ANGULAR'
  | 'GRADIENT_DIAMOND'

export interface GradientFill {
  id: string
  type: GradientType
  stops: GradientStop[]
  // Normalized transform: [[a,b,tx],[c,d,ty]] for angle/position
  // Linear default: [[1,0,0],[0,1,0]] = left-to-right
  transform: [[number, number, number], [number, number, number]]
  opacity: number
  visible: boolean
  blendMode: BlendMode
}

export type ImageScaleMode = 'FILL' | 'FIT' | 'CROP' | 'TILE'

export interface ImageAdjustments {
  exposure: number      // -1 to 1
  contrast: number      // -1 to 1
  saturation: number    // -1 to 1
  temperature: number   // -1 to 1
  tint: number          // -1 to 1
  highlights: number    // -1 to 1
  shadows: number       // -1 to 1
}

export interface ImageFill {
  id: string
  type: 'IMAGE'
  imageUrl: string      // data URL or Appwrite storage URL
  scaleMode: ImageScaleMode
  opacity: number
  visible: boolean
  blendMode: BlendMode
  adjustments: ImageAdjustments
  rotation: number      // 0 | 90 | 180 | 270
}

export type Fill = SolidFill | GradientFill | ImageFill

// ─────────────────────────────────────────────────────
// Add to BaseNodeProperties
// ─────────────────────────────────────────────────────
// fills: Fill[]     ← replaces/augments the existing backgroundColor field
// Default: [{ type: 'SOLID', color: 'ffffff', opacity: 1,
//             visible: true, blendMode: 'NORMAL' }]
```

### Default Fill Factory

```typescript
// src/lib/fills.ts
import { nanoid } from 'nanoid'
import type { SolidFill, GradientFill, ImageFill, GradientStop } from '@/types/canvas'

export const defaultSolidFill = (color = 'ffffff'): SolidFill => ({
  id: nanoid(),
  type: 'SOLID',
  color,
  opacity: 1,
  visible: true,
  blendMode: 'NORMAL',
})

export const defaultGradientStop = (position: number, color: string): GradientStop => ({
  id: nanoid(),
  position,
  color,
  opacity: 1,
})

export const defaultLinearGradient = (): GradientFill => ({
  id: nanoid(),
  type: 'GRADIENT_LINEAR',
  stops: [
    defaultGradientStop(0, 'ffffff'),
    defaultGradientStop(1, '000000'),
  ],
  transform: [[1, 0, 0], [0, 1, 0]],
  opacity: 1,
  visible: true,
  blendMode: 'NORMAL',
})
```

---

## 3. Component Architecture

```
src/components/editor/
├── properties-panel/
│   ├── fill-section.tsx              ← Section: header + fill list + add button
│   └── color-picker/
│       ├── index.tsx                 ← ColorPicker modal/popover wrapper
│       ├── solid-picker.tsx          ← 2D field + hue/opacity sliders + format input
│       ├── gradient-picker.tsx       ← gradient bar + stop handles + stops list
│       ├── image-picker.tsx          ← upload button + scale mode + adjustments
│       ├── pattern-picker.tsx        ← select source + tile controls
│       ├── gradient-field.tsx        ← 2D saturation/lightness canvas component
│       ├── hue-slider.tsx            ← rainbow hue slider
│       ├── opacity-slider.tsx        ← checkerboard opacity slider
│       ├── gradient-stop-bar.tsx     ← gradient preview + draggable stop handles
│       ├── color-input.tsx           ← format-aware hex/rgb/hsl input
│       ├── swatch-palette.tsx        ← "On this page" color swatches
│       └── blend-mode-menu.tsx       ← 18-item blend mode dropdown
```

### Component Responsibility Split

| Component | Owns | Calls |
|---|---|---|
| `fill-section.tsx` | Fill list rendering, add/remove row | `color-picker/index.tsx` |
| `color-picker/index.tsx` | Modal open/close, tab routing | All sub-pickers |
| `solid-picker.tsx` | HSB↔Hex conversion, field sync | `gradient-field`, `hue-slider`, `opacity-slider`, `color-input` |
| `gradient-picker.tsx` | Stop list state, selected stop | `gradient-stop-bar`, and delegates stop color to `solid-picker` |
| `gradient-field.tsx` | Canvas rendering, mouse events | — (pure visual component) |
| `hue-slider.tsx` | Hue value input/output | — |
| `opacity-slider.tsx` | Opacity value input/output | — |

---

## 4. Phase 1 — Solid Fill

### Goal
Replicate Figma's solid fill: fill row in properties panel + full color picker (2D field + sliders + hex input + color format selector + opacity + swatches).

### Files to Create

| File | Purpose |
|---|---|
| `src/types/canvas.ts` | Add `Fill`, `SolidFill`, `BlendMode` types + `fills` to `BaseNodeProperties` |
| `src/lib/fills.ts` | Factory functions + color conversion utils |
| `src/store/editor-store.ts` | `addFill`, `removeFill`, `updateFill`, `toggleFillVisibility`, `reorderFills` |
| `src/components/editor/properties-panel/fill-section.tsx` | Rewrite existing stub |
| `src/components/editor/properties-panel/color-picker/index.tsx` | Picker modal wrapper |
| `src/components/editor/properties-panel/color-picker/solid-picker.tsx` | Solid color picker body |
| `src/components/editor/properties-panel/color-picker/gradient-field.tsx` | 2D canvas picker |
| `src/components/editor/properties-panel/color-picker/hue-slider.tsx` | Hue rainbow slider |
| `src/components/editor/properties-panel/color-picker/opacity-slider.tsx` | Opacity slider |
| `src/components/editor/properties-panel/color-picker/color-input.tsx` | Hex/RGB/HSL input |
| `src/components/editor/properties-panel/color-picker/swatch-palette.tsx` | Doc swatches |
| `src/components/editor/canvas.tsx` | Apply `fills` array to node background rendering |

### Store Actions

```typescript
// In editor-store.ts, add to EditorState interface:
addFill: (nodeId: string, fill?: Partial<SolidFill>) => void
removeFill: (nodeId: string, fillId: string) => void
updateFill: (nodeId: string, fillId: string, patch: Partial<Fill>) => void
toggleFillVisibility: (nodeId: string, fillId: string) => void
reorderFills: (nodeId: string, fromIndex: number, toIndex: number) => void
```

### Color Conversion Utils (`src/lib/fills.ts`)

```typescript
// Required conversions:
hexToHsb(hex: string): { h: number; s: number; b: number }
hsbToHex(h: number, s: number, b: number): string
hexToRgb(hex: string): { r: number; g: number; b: number }
rgbToHex(r: number, g: number, b: number): string
hexToHsl(hex: string): { h: number; s: number; l: number }
hslToHex(h: number, s: number, l: number): string
parseColorInput(value: string): string | null   // accepts hex3, hex6, rgb(), hsl()
```

### Canvas Rendering

```typescript
// In canvas.tsx node rendering — replace `backgroundColor` with fills array:
function nodeBackgroundStyle(node: FrameNode | TextNode): React.CSSProperties {
  const fills = node.fills?.filter(f => f.visible) ?? []
  if (fills.length === 0) return { background: 'transparent' }

  // Multiple CSS backgrounds: first in array = topmost layer
  const backgrounds = fills.map(fill => {
    switch (fill.type) {
      case 'SOLID':
        return `rgba(${hexToRgb(fill.color).join(',')}, ${fill.opacity})`
      case 'GRADIENT_LINEAR':
        return linearGradientCSS(fill)
      case 'IMAGE':
        return `url(${fill.imageUrl})`
      default:
        return 'transparent'
    }
  })

  return {
    background: backgrounds.join(', '),
    // For mix-blend-mode on individual fills, we need wrapper divs
    // (Phase 4 concern — skip for Phase 1)
  }
}
```

### Acceptance Criteria — Phase 1

- [ ] Clicking the fill color swatch opens the color picker popover
- [ ] 2D gradient field updates live as reticle is dragged
- [ ] Hue slider updates gradient field background and live node color
- [ ] Opacity slider updates fill opacity live
- [ ] Hex input: typing updates the picker live; Enter commits
- [ ] Color format selector switches between Hex / RGB / CSS / HSL / HSB
- [ ] Eye toggle hides/shows fill on canvas without removing it
- [ ] Remove (−) button deletes fill (only visible on hover)
- [ ] `+` button adds a new default white fill row
- [ ] "On this page" swatches show all unique `SOLID` fill colors in the document
- [ ] Canvas renders multiple stacked solid fills correctly
- [ ] Opacity `%` field in fill row syncs with picker's opacity slider

---

## 5. Phase 2 — Gradient Fill

### Goal
Four gradient types (Linear, Radial, Angular, Diamond) with the full Figma-style stop bar and stop list.

### Files to Create / Modify

| File | Change |
|---|---|
| `src/types/canvas.ts` | Add `GradientFill`, `GradientStop`, `GradientType` |
| `src/lib/fills.ts` | Add gradient factory, `gradientToCss()` |
| `src/store/editor-store.ts` | Add `addGradientStop`, `removeGradientStop`, `updateGradientStop`, `setGradientType` |
| `color-picker/gradient-picker.tsx` | New: full gradient UI |
| `color-picker/gradient-stop-bar.tsx` | New: preview bar + draggable stop handles |
| `color-picker/index.tsx` | Route to `GradientPicker` when fill type is gradient |
| `src/components/editor/canvas.tsx` | Add `linearGradientCSS`, `radialGradientCSS`, `conicGradientCSS` helpers |

### Gradient Bar Interaction

```
Stop handle states:
  Default:  hollow circle on the gradient preview bar
  Hovered:  slightly larger, cursor: grab
  Selected: filled blue circle, color picker below shows this stop's color
  Dragging: cursor: grabbing, position% updates live

Click on empty bar space → add stop at that position
  new stop color = interpolated color at that gradient position
  new stop opacity = 1
```

### CSS Generation

```typescript
// Linear gradient: uses transform matrix to derive angle
function linearGradientCSS(fill: GradientFill): string {
  const angle = transformToAngle(fill.transform) // degrees
  const stops = fill.stops
    .sort((a, b) => a.position - b.position)
    .map(s => `rgba(${hexToRgb(s.color).join(',')},${s.opacity}) ${s.position * 100}%`)
    .join(', ')
  return `linear-gradient(${angle}deg, ${stops})`
}

// Radial gradient
function radialGradientCSS(fill: GradientFill): string {
  const stops = /* similar to above */
  return `radial-gradient(circle, ${stops})`
}

// Angular → conic-gradient
function angularGradientCSS(fill: GradientFill): string {
  const stops = /* similar */
  return `conic-gradient(${stops})`
}

// Diamond gradient: no direct CSS — render via SVG or canvas overlay
// For MVP: approximate with 2-stop radial
function diamondGradientCSS(fill: GradientFill): string {
  return radialGradientCSS(fill) // approximation
}
```

### Acceptance Criteria — Phase 2

- [ ] All 4 gradient type icons in fill type row work
- [ ] Gradient type dropdown (Linear/Radial/Angular/Diamond) switches sub-type
- [ ] Flip button reverses stop positions
- [ ] Rotate button changes transform matrix by 90°
- [ ] Clicking gradient bar adds a new stop at click position
- [ ] Clicking a stop handle selects it (shows that stop's color in picker area)
- [ ] Dragging a stop handle repositions it live
- [ ] Deleting selected stop via Backspace or − button (min 2 stops enforced)
- [ ] Per-stop: color, opacity, and position are all editable
- [ ] Canvas renders linear/radial gradients correctly with CSS
- [ ] Fill row shows "Linear", "Radial", etc. as the type label

---

## 6. Phase 3 — Image Fill

### Goal
Image fill with scale modes and exposure/adjustment sliders.

### Files to Create / Modify

| File | Change |
|---|---|
| `src/types/canvas.ts` | Add `ImageFill`, `ImageScaleMode`, `ImageAdjustments` |
| `src/lib/fills.ts` | Add `imageAdjustmentsToFilter()` CSS helper |
| `src/store/editor-store.ts` | Add `setImageFillUrl`, `setImageScaleMode`, `updateImageAdjustment` |
| `color-picker/image-picker.tsx` | New: upload + preview + scale mode + 7 sliders |
| `src/components/editor/canvas.tsx` | Handle `IMAGE` fill type in background renderer |

### Image Scale Mode → CSS

```typescript
function imageScaleModeToCss(mode: ImageScaleMode, url: string): React.CSSProperties {
  const base = { backgroundImage: `url(${url})` }
  switch (mode) {
    case 'FILL': return { ...base, backgroundSize: 'cover', backgroundPosition: 'center' }
    case 'FIT':  return { ...base, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }
    case 'CROP': return { ...base, backgroundSize: 'auto' }
    case 'TILE': return { ...base, backgroundSize: 'auto', backgroundRepeat: 'repeat' }
  }
}
```

### Image Adjustments → CSS Filter

```typescript
function imageAdjustmentsToFilter(adj: ImageAdjustments): string {
  const filters = [
    adj.exposure   !== 0 ? `brightness(${1 + adj.exposure})` : '',
    adj.contrast   !== 0 ? `contrast(${1 + adj.contrast})` : '',
    adj.saturation !== 0 ? `saturate(${1 + adj.saturation})` : '',
    // Temperature and Tint: approximate with hue-rotate
    adj.temperature !== 0 ? `hue-rotate(${adj.temperature * 30}deg)` : '',
  ].filter(Boolean).join(' ')
  return filters || 'none'
}
```

### Acceptance Criteria — Phase 3

- [ ] Clicking "Upload from computer" opens file picker, accepts image formats
- [ ] Uploaded image previews in the picker thumbnail
- [ ] Scale mode dropdown (Fill/Fit/Crop/Tile) applies correct CSS background-size
- [ ] Rotate 90° button increments `rotation` by 90° (mod 360)
- [ ] All 7 adjustment sliders update CSS filter in real time
- [ ] Canvas renders image fill correctly at correct scale mode
- [ ] Fill row shows "Image" label and a thumbnail swatch

---

## 7. Phase 4 — Blend Modes

### Goal
Per-fill blend mode via 18-item dropdown in the color picker.

### Files to Create / Modify

| File | Change |
|---|---|
| `color-picker/blend-mode-menu.tsx` | New: grouped dropdown menu |
| `color-picker/index.tsx` | Wire blend mode button → menu |
| `src/lib/fills.ts` | Add `blendModeToCSS()` helper |
| `src/components/editor/canvas.tsx` | Apply `mix-blend-mode` per fill layer |

### Multi-Fill Blend Mode Rendering

CSS `mix-blend-mode` on a single `background` shorthand does **not** work — each fill needs its own DOM layer:

```tsx
// Each fill = one absolutely-positioned div child
// IMPORTANT: renders fills bottom-first (last in array = bottom)
{node.fills.filter(f => f.visible).map((fill, i) => (
  <div
    key={fill.id}
    style={{
      position: 'absolute', inset: 0,
      ...fillToBackgroundStyle(fill),
      mixBlendMode: blendModeToCSS(fill.blendMode),
      opacity: fill.opacity,
    }}
  />
))}
```

### Blend Mode CSS Mapping

```typescript
const BLEND_MODE_MAP: Record<BlendMode, React.CSSProperties['mixBlendMode']> = {
  NORMAL: 'normal', DARKEN: 'darken', MULTIPLY: 'multiply',
  PLUS_DARKER: 'darken', COLOR_BURN: 'color-burn',
  LIGHTEN: 'lighten', SCREEN: 'screen', PLUS_LIGHTER: 'screen',
  COLOR_DODGE: 'color-dodge', OVERLAY: 'overlay',
  SOFT_LIGHT: 'soft-light', HARD_LIGHT: 'hard-light',
  DIFFERENCE: 'difference', EXCLUSION: 'exclusion',
  HUE: 'hue', SATURATION: 'saturation', COLOR: 'color', LUMINOSITY: 'luminosity',
}
```

### Acceptance Criteria — Phase 4

- [ ] Blend mode button in color picker opens grouped 18-item menu
- [ ] Current blend mode has checkmark in menu
- [ ] Selecting a blend mode updates the fill's `blendMode` field
- [ ] Canvas applies `mix-blend-mode` CSS to each fill layer div
- [ ] Multiple fills with different blend modes composite correctly

---

## 8. Phase 5 — Polish & Extras

### a) Color Format Selector
- Dropdown in color picker: Hex, RGB, CSS, HSL, HSB
- Selected format determines which input fields are shown
- Persist user's last-used format (localStorage)

### b) Document Swatches
- "On this page" — collect all `SOLID` fill colors across all nodes in the current page
- Clicking a swatch applies it instantly
- Deduplicate by hex value

### c) Eyedropper
- Browser `EyeDropper` API (Chrome 95+):
  ```typescript
  const eyeDropper = new EyeDropper()
  const result = await eyeDropper.open()
  // result.sRGBHex = '#rrggbb'
  ```
- Show keyboard shortcut hint `I` on hover of eyedropper icon

### d) Style/Variable Button (`⧉`)
- Opens a side panel listing saved color variables from Appwrite
- For now: stub with "Coming soon" tooltip

### e) Fill Row Drag-to-Reorder
- Use `@dnd-kit/sortable` (already likely in the project)
- Drag handle visible on hover (left side of row)
- `reorderFills` store action

### f) Gradient Field Click-to-Sample
- Click anywhere on the 2D gradient field: no drag → samples that exact color
- Drag: updates reticle position

---

## 9. Canvas Rendering Strategy

### Node Structure (after Phase 4)

```tsx
// FrameNode rendered structure:
<div
  data-node-id={node.id}
  style={{
    position: 'absolute',
    left: node.x, top: node.y,
    width: node.width, height: node.height,
    // Do NOT set background here when using fills layer approach
    overflow: node.clipContent ? 'hidden' : 'visible',
    borderRadius: node.borderRadius,
  }}
>
  {/* Fill layers — Phase 1: just one div for solid; Phase 4: one per fill */}
  {node.fills?.filter(f => f.visible).map(fill => (
    <div
      key={fill.id}
      style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        borderRadius: 'inherit',
        ...fillToStyle(fill),
        mixBlendMode: blendModeToCSS(fill.blendMode),
      }}
    />
  ))}

  {/* Children */}
  {node.children?.map(child => renderNode(child))}
</div>
```

### Backward Compatibility

For existing nodes that have `backgroundColor` but no `fills`:

```typescript
// Migration helper — run when loading a project
function migrateLegacyFills(node: BaseNodeProperties): void {
  if (!node.fills && node.backgroundColor) {
    node.fills = [{
      id: nanoid(),
      type: 'SOLID',
      color: node.backgroundColor.replace('#', ''),
      opacity: 1, visible: true, blendMode: 'NORMAL',
    }]
  } else if (!node.fills) {
    node.fills = []
  }
}
```

---

## 10. File Checklist

### Phase 1 — Solid Fill ✅ Ready to implement

- [ ] `src/types/canvas.ts` — add Fill types
- [ ] `src/lib/fills.ts` — factory + color utils
- [ ] `src/store/editor-store.ts` — fill actions
- [ ] `properties-panel/color-picker/gradient-field.tsx`
- [ ] `properties-panel/color-picker/hue-slider.tsx`
- [ ] `properties-panel/color-picker/opacity-slider.tsx`
- [ ] `properties-panel/color-picker/color-input.tsx`
- [ ] `properties-panel/color-picker/swatch-palette.tsx`
- [ ] `properties-panel/color-picker/solid-picker.tsx`
- [ ] `properties-panel/color-picker/index.tsx`
- [ ] `properties-panel/fill-section.tsx` — rewrite
- [ ] `components/editor/canvas.tsx` — apply fills

### Phase 2 — Gradient Fill

- [ ] `src/types/canvas.ts` — GradientFill types
- [ ] `src/lib/fills.ts` — gradient CSS generators
- [ ] `src/store/editor-store.ts` — gradient stop actions
- [ ] `properties-panel/color-picker/gradient-stop-bar.tsx`
- [ ] `properties-panel/color-picker/gradient-picker.tsx`
- [ ] `components/editor/canvas.tsx` — gradient rendering

### Phase 3 — Image Fill

- [ ] `src/types/canvas.ts` — ImageFill types
- [ ] `src/lib/fills.ts` — image CSS + filter utils
- [ ] `src/store/editor-store.ts` — image fill actions
- [ ] `properties-panel/color-picker/image-picker.tsx`
- [ ] `components/editor/canvas.tsx` — image rendering

### Phase 4 — Blend Modes

- [ ] `properties-panel/color-picker/blend-mode-menu.tsx`
- [ ] `src/lib/fills.ts` — blendModeToCSS
- [ ] `components/editor/canvas.tsx` — multi-layer fill rendering

### Phase 5 — Polish

- [ ] Color format selector (Hex/RGB/CSS/HSL/HSB)
- [ ] Document swatches panel
- [ ] Eyedropper (EyeDropper API)
- [ ] Fill row drag-to-reorder
- [ ] Style/variable button stub

---

## Appendix: Reference Screenshots

| Screenshot | What it shows |
|---|---|
| `figma-fill-01-initial.png` | Figma canvas before node selection |
| `figma-fill-02-frame-selected.png` | Frame selected, right panel visible |
| `figma-fill-03-scrolled.png` | Fill section visible in panel |
| `figma-fill-04-color-picker-open.png` | Solid fill color picker open |
| `figma-fill-05-gradient.png` | Gradient fill picker with stop bar |
| `figma-fill-06-gradient-types.png` | Gradient sub-type dropdown (Linear/Radial/Angular/Diamond) |
| `figma-fill-07-image.png` | Image fill picker with adjustments |
| `figma-fill-08-image-scale-modes.png` | Image scale mode dropdown (Fill/Fit/Crop/Tile) |
| `figma-fill-09-pattern.png` | Pattern fill with tile controls |
| `figma-fill-10-color-formats.png` | Color format selector (Hex/RGB/CSS/HSL/HSB) |
| `figma-fill-11-blend-modes.png` | Blend mode menu (18 options in 5 groups) |
| `figma-fill-12-video.png` | Video fill (requires Pro plan) |

---

*Document created: 2026-03-14*
*Branch: feat/canvas-node-system*
*Next step: Begin Phase 1 implementation — see checklist in section 10*
