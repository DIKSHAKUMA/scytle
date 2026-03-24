# FlutterFlow Designer — Theme System Research

> **Date**: 2025-07-15  
> **Source**: [designer.flutterflow.io](https://designer.flutterflow.io)  
> **Method**: Playwright browser automation (Flutter CanvasKit → screenshot-based analysis)  
> **Purpose**: Inform Scytle's Theme tab implementation

---

## 1. Product Overview

FlutterFlow Designer is an AI-powered app builder that generates multi-screen mobile/desktop apps from natural language prompts. It's built as a **Flutter Web app using CanvasKit** (all UI rendered to `<canvas>`, no DOM elements) with a storyboard-style editor.

**Tech stack observed:**
- Flutter Web (CanvasKit rendering)
- Firebase/Firestore for real-time sync
- `api.flutterflow.io/v1/dsl/storyboard/{project-id}` for project data
- `dimg.dreamflow.cloud` for AI-generated images
- Google Fonts API

---

## 2. Dashboard — Two Generation Modes

The dashboard offers a **toggle between two modes**:

### Instant Generation
- Direct prompt → generates 5–7 screens immediately
- User enters project editor with generated frames
- Theme is "Generated Theme" — AI-selected colors/fonts matching the prompt

### Explore Styles (Style Explorer)
- Same prompt → generates **8 style variants** before committing
- Full-page masonry layout showing distinct visual directions for the same app
- Each variant is a fully rendered mobile app screen with unique identity

**Style Explorer actions (per variant):**
1. **More Like This** — generates nearby style variations
2. **Remix Colors** — shifts the color palette instantly
3. **Prompt** — free-text modifications to the variant
4. **Regenerate** — re-generates the variant to fix issues
5. **Use This Style** — commits and starts full multi-screen generation

**Key insight**: Style exploration happens *before* full generation. Users pick a style direction first, then the system generates all screens in that style.

---

## 3. Editor Layout

```
┌─────────┬──────────────────────────────────┬──────────────┐
│ Left    │                                   │ Right       │
│ Sidebar │          Canvas                   │ Properties  │
│ (3 tabs)│     (storyboard/frames)          │ Panel       │
│         │                                   │             │
│ Frames  │                                   │ "No select" │
│ Comps   │                                   │ or node     │
│ Theme ← │                                   │ properties  │
└─────────┴──────────────────────────────────┴──────────────┘
```

**Left sidebar has 3 tabs:**
1. **Frames** — page/screen list (Layers count)
2. **Components** — reusable component library
3. **Theme** — global design tokens ← *this is what we're studying*

---

## 4. Theme Panel — Complete Structure

The Theme tab is a **scrollable single-column panel** with collapsible sections:

### 4.1 Preset Themes (15)

Dropdown selector with 15+1 options. Each shows a **dual-color swatch** for quick visual ID.

| # | Theme Name | Style Description |
|---|-----------|-------------------|
| — | Generated Theme | AI-generated per project (selected by default) |
| 1 | Bold & Vibrant | Bright, high-contrast, energetic |
| 2 | Soft & Organic | Natural, muted, earthy |
| 3 | Sharp & Professional | Clean, corporate, precise |
| 4 | Playful & Chunky | Rounded, colorful, fun |
| 5 | Luxe & Editorial | Premium, refined, editorial |
| 6 | Retro & Nostalgic | Vintage, warm, textured feel |
| 7 | Clean & Technical | Minimal, systematic, tech |
| 8 | Warm & Cozy | Soft, warm tones, inviting |
| 9 | Futuristic & Immersive | Neon, dark mode, sci-fi |
| 10 | Scandinavian & Functional | Minimal, functional, Nordic |
| 11 | Brutalist & Raw | Bold typography, raw, unconventional |
| 12 | Pastel & Dreamy | Soft pastels, light, airy |
| 13 | Industrial & Utilitarian | Functional, monochrome, pragmatic |
| 14 | Art Deco & Elegant | Geometric, ornate, luxurious |
| 15 | Nature & Grounded | Earth tones, organic shapes |

**Naming pattern**: `{Adjective} & {Adjective}` — mood/persona-based, NOT color-based.

### 4.2 Fonts (2–3)

| Role | Description |
|------|-------------|
| primary | Headlines, titles — the "personality" font |
| secondary | Body text, UI labels — the "workhorse" font |
| mono | Code, tabular data (only in some presets) |

**Examples observed:**
- Generated Theme (Invoice): primary=Inter, secondary=Inter
- Generated Theme (Forge): primary=Inter, secondary=Space Grotesk
- Bold & Vibrant preset: primary=Poppins, secondary=Urbanist, mono=JetBrains Mono

Font selector uses Google Fonts dropdown.

### 4.3 Colors (Light) (16–31 tokens)

Color token count varies between themes:
- **Generated themes**: 16 simplified tokens
- **Preset themes**: 31 full Material Design 3 tokens

#### Generated Theme — 16 Tokens (Simplified)

| Token | Project 1 (Forge AI) | Project 2 (Invoice) | Role |
|-------|---------------------|---------------------|------|
| primary | #000000 | #1A1A1A | Main brand color |
| on_primary | #FFFFFF | #FFFFFF | Text/icon on primary |
| secondary | #334155 | #7C9CB4 | Secondary brand |
| on_secondary | #FFFFFF | #FFFFFF | Text on secondary |
| background | #F8FAFC | #FFFFFF | Page background |
| surface | #FFFFFF | #F5F5F5 | Card/container surfaces |
| on_surface | #0F172A | #1A1A1A | Text on surfaces |
| error | #EF4444 | #B00020 | Error states |
| on_error | #FFFFFF | #FFFFFF | Text on error |
| accent | #22D3EE | #C4836A | Accent/highlight |
| divider | #E2E8F0 | #E0E0E0 | Separators/borders |
| hint | #94A3B8 | #A0A0A0 | Placeholder/hint text |
| primary_text | #0F172A | #1A1A1A | Primary text color |
| secondary_text | #64748B | #666666 | Secondary text color |
| success | #22C55E | #4A6741 | Success states |
| transparent | #00000000 | #00000000 | Transparent color |

#### Preset Theme (Bold & Vibrant) — 31 Tokens (Full MD3)

| Token | Value | Token | Value |
|-------|-------|-------|-------|
| primary | #0066FF | on_primary | #FFFFFF |
| secondary | #FF2D87 | on_secondary | #FFFFFF |
| tertiary | #FFE500 | on_tertiary | #1A1A00 |
| background | #FFFFFF | on_background | #0A0A0F |
| surface | #FFFFFF | on_surface | #0A0A0F |
| error | #FF3B3B | on_error | #FFFFFF |
| outline | #75757F | shadow | #000000 |
| divider | #C6C6D0 | scrim | #000000 |
| primary_container | #D6E4FF | on_primary_container | #001A4D |
| secondary_container | #FFD9E8 | on_secondary_container | #3D0020 |
| error_container | #FFDAD6 | on_error_container | #410002 |
| surface_variant | #E8E8EC | on_surface_variant | #44444F |
| inverse_surface | #0A0A0F | inverse_on_surface | #F2F2F5 |
| inverse_primary | #9DBFFF | — | — |
| secondary_background | #F5F5F7 | transparent | #00000000 |
| primary_text | #0A0A0F | secondary_text | #44444F |

**Key insight**: Generated themes use a simplified 16-token schema for AI-friendliness. Preset themes expand to the full 31-token MD3 schema with container colors, inverse variants, and more.

### 4.4 Spacing — Slider Control

- Label: "Spacing"
- Shows: "Tight" (at low end)
- UI: Horizontal slider
- Adjusts global spacing multiplier

### 4.5 Corner Radius — Slider Control

- Label: "Corner Radius"
- Shows: "Subtle" (at low end)
- UI: Horizontal slider
- Adjusts global border radius scale

### 4.6 Text Size — Multiplier Slider

- Label: "Text Size"
- Shows: "1.0x" (default)
- UI: Horizontal slider with multiplier display
- Scales all typography proportionally

### 4.7 Spacing Constants (5)

Editable numeric inputs with semantic names:

| Name | Value (px) |
|------|-----------|
| xs | 4 |
| sm | 8 |
| md | 16 |
| lg | 24 |
| xl | 32 |

**Pattern**: 4px base unit. `xs=4, sm=2×xs, md=2×sm, lg=1.5×md, xl=2×md`

### 4.8 Radii Constants (4)

| Name | Value (px) |
|------|-----------|
| sm | 8 |
| md | 10 |
| lg | 12 |
| full | 9999 |

**Pattern**: Tight range (8–12) for subtle variations, plus `full` for pill shapes.

### 4.9 Typography Constants (10)

Follows Material Design 3 type scale naming:

| Name | Size (px) | Category |
|------|----------|----------|
| headline_large | 32 | Headlines |
| headline_medium | 26 | Headlines |
| title_large | 20 | Titles |
| title_medium | 16 | Titles |
| body_large | 16 | Body |
| body_medium | 14 | Body |
| body_small | 12 | Body |
| label_large | 14 | Labels |
| label_medium | 12 | Labels |
| label_small | 10 | Labels |

Each typography constant is expandable (arrow `>`) for detailed properties (font family, weight, letter spacing, etc.).

### 4.10 Shadows Constants (4)

Clean doubling scale. All use same shadow color (`#0000000D` = black at ~5% opacity):

| Name | Color | dx | dy | blur | spread | CSS equivalent |
|------|-------|----|----|------|--------|----------------|
| sm | #0000000D | 0 | 1 | 2 | 0 | `0 1px 2px rgba(0,0,0,0.05)` |
| md | #0000000D | 0 | 2 | 4 | 0 | `0 2px 4px rgba(0,0,0,0.05)` |
| lg | #0000000D | 0 | 4 | 8 | 0 | `0 4px 8px rgba(0,0,0,0.05)` |
| xl | #0000000D | 0 | 8 | 16 | 0 | `0 8px 16px rgba(0,0,0,0.05)` |

**Pattern**: `dy` and `blur` both double at each level. `spread` always 0. `dx` always 0.

---

## 5. Theme Switching Behavior

When switching presets:
- **Instant canvas update** — all frames re-render simultaneously
- **Font families change** — both heading and body fonts swap
- **Color tokens remap** — all semantic tokens get new values
- **Layout unchanged** — spacing, sizing, structure remain the same
- **No confirmation dialog** — switch is immediate and reversible

---

## 6. Architecture Observations

### Token-Based Color System
- All colors are referenced by **semantic token names**, not raw hex values
- Components bind to tokens like `primary`, `on_surface`, not `#0066FF`
- Switching themes remaps token values → all components update automatically

### Two-Tier Token Schema
1. **Simplified (16 tokens)**: Used by AI generation for fewer decisions
2. **Full MD3 (31 tokens)**: Used by preset themes for complete control

### Slider Controls → Constants
- The slider controls (Spacing, Corner Radius, Text Size) appear to be **high-level adjusters** that modify the underlying constants
- Constants sections (Spacing Constants, Radii Constants, etc.) are the **low-level editable values**
- This creates a two-level UX: casual users adjust sliders, power users edit constants

### Generation Pipeline
1. User enters prompt
2. AI generates screens + theme simultaneously
3. Generated theme uses simplified 16-token schema
4. User can switch to preset theme (expands to 31 tokens)
5. All screens update via token remapping

---

## 7. Key Takeaways for Scytle

### What to Adopt

1. **Mood-based preset names** — "Bold & Vibrant" is much better than "Blue Theme" or "Theme 1"
2. **Dual-color swatches** in dropdown for quick visual identification
3. **Semantic color tokens** — components reference roles, not colors
4. **Slider controls for quick adjustments** — Spacing/Radius/TextSize sliders are genius UX for casual users
5. **Collapsible constants** for power users who want granular control
6. **Two-tier token schema** — simplified for AI, full for presets
7. **Instant theme preview** — switch themes and see canvas update immediately
8. **Shadow doubling scale** — elegant, predictable shadow system
9. **4px spacing base unit** — industry standard, clean math

### What to Differentiate

1. **Style Explorer is a pre-generation concept** — Scytle could integrate style exploration into the wireframe phase, not just at project creation
2. **FlutterFlow lacks dark mode toggle in theme panel** — we could expose light/dark as twin token sets
3. **31 tokens may be overkill for web** — Scytle could use ~16–20 tokens optimized for web (not Flutter/MD3)
4. **No CSS variable export** — FlutterFlow's tokens are Flutter-specific. Scytle should generate CSS custom properties
5. **No node-level token binding UI** — FlutterFlow abstracts this via their widget system. Scytle needs explicit token binding in the node properties panel

### Recommended Token Set for Scytle (~20 tokens)

Based on FF's system, optimized for web:

| Token | Description |
|-------|------------|
| `primary` | Main brand color |
| `on-primary` | Text/icon on primary |
| `secondary` | Secondary brand color |
| `on-secondary` | Text on secondary |
| `accent` | Highlight/CTA color |
| `background` | Page background |
| `surface` | Card/container background |
| `on-surface` | Primary text color |
| `muted` | Secondary/hint text |
| `border` | Borders/dividers |
| `error` | Error states |
| `success` | Success states |
| `warning` | Warning states |
| `ring` | Focus ring color |
| `input` | Input field background |
| `card` | Card background |
| `popover` | Popover/dropdown bg |
| `destructive` | Danger/delete actions |

### Recommended Constants

```
Spacing: xs=4, sm=8, md=16, lg=24, xl=32, 2xl=48, 3xl=64
Radii:   sm=6, md=8, lg=12, xl=16, full=9999
Shadows: sm=0 1px 2px, md=0 2px 4px, lg=0 4px 8px, xl=0 8px 16px
Type:    h1=36, h2=30, h3=24, h4=20, body=16, small=14, xs=12
```

---

## 8. API & Data Model

**Endpoint discovered**: `GET api.flutterflow.io/v1/dsl/storyboard/{project-id}`  
**Auth**: Firebase token (CORS-restricted)  
**Real-time**: Firestore for live collaboration

The theme data is embedded in the project DSL, not stored separately. This means theme = part of project state, not a standalone entity.

---

## 9. Screenshot References

All screenshots captured during research (stored in Playwright output directory):

| Screenshot | Content |
|-----------|---------|
| ff-dashboard-styles-toggle.png | Dashboard with Explore Styles / Instant Generation toggle |
| ff-theme-top-presets.png | Theme panel top: Preset Themes + Fonts + Colors |
| ff-preset-dropdown.png | All 15 preset theme names with color swatches |
| ff-bold-vibrant-applied.png | Bold & Vibrant theme applied — 3 fonts, 31 colors |
| ff-bold-vibrant-colors-2.png | Full color token list (middle section) |
| ff-bold-vibrant-colors-3.png | Container/inverse tokens |
| ff-bold-vibrant-colors-4.png | Remaining tokens + spacing slider |
| ff-radii-constants.png | Spacing Constants (5) + Radii Constants (4) |
| ff-shadow-sm-blur.png | Shadow sm: color, dx, dy, blur, spread |
| ff-shadow-md-detail.png | Shadow md + sm comparison |
| ff-shadow-lg-xl.png | Shadow lg detail |
| ff-shadow-xl-detail.png | Shadow xl: dx=0, dy=8, blur=16 |
| ff-explore-styles-generating.png | Style Explorer: 8 variants generated |
| ff-style-explorer-more.png | More variants + hover actions visible |
