# Style Guide Editor — Phased Implementation Plan

> **Project**: Scytle.ai  
> **Target**: Build the Style Guide Editor UI panels inspired by Relume's Style Guide Editor  
> **Research**: [RELUME-STYLE-GUIDE-UX-RESEARCH.md](../docs/RELUME-STYLE-GUIDE-UX-RESEARCH.md)  
> **Architecture Spec**: [WIREFRAME-V2-ARCHITECTURE.md §5](../docs/WIREFRAME-V2-ARCHITECTURE.md)  
> **Screenshots**: [`../.playwright-mcp/style-guide-anaylsis-pngs/`](../.playwright-mcp/style-guide-anaylsis-pngs/)

---

## Existing Backend (100% Complete — No Changes Needed)

| File | LOC | What It Provides |
|------|-----|-----------------|
| `src/store/style-guide-store.ts` | 562 | All CRUD: concepts, colors, typography, UI, schemes, shuffle, undo-friendly |
| `src/lib/designs/v2/tokens/index.ts` | 256 | AccentColor, ColorTokens, TypographyTokens, UITokens, Concept, StyleGuideData, 35+ CSS vars |
| `src/lib/designs/v2/tokens/defaults.ts` | — | `computeTokenCSS()`, `computeSchemeOverrideCSS()`, `createDefaultConcept()` |
| `src/lib/designs/v2/tokens/palettes.ts` | 658 | 56 curated palettes, 8 categories, `getRandomPalette()` |
| `src/lib/designs/v2/tokens/font-pairs.ts` | 645 | 80 curated pairs, 5 categories, `loadGoogleFonts()`, `buildGoogleFontsUrl()` |
| `src/lib/designs/v2/tokens/provider.tsx` | — | `<TokenProvider>` + `<SectionTokenProvider>` — CSS var injection |

---

## Phase 1 — Foundation: Panel Shell & Toolbar Entry Point

**Goal**: Wire the Style Guide panel into the existing sidebar infrastructure so users can open/close it from the left toolbar.

### Reference Screenshots

| Screenshot | Shows |
|-----------|-------|
| `page-2026-02-20T16-28-27-251Z.png` | Overall layout — left panel vs. right preview, icon strip |
| `page-2026-02-20T16-29-03-009Z.png` | Style Guide icon active in left sidebar strip |

### 1.1 — Extend `activePanelView` Type

**File**: `src/store/unified-store.ts`  
**Lines**: 908, 1037

Add `'style-guide'` to the type union:

```diff
- activePanelView: 'page' | 'section' | 'library' | null
+ activePanelView: 'page' | 'section' | 'library' | 'style-guide' | null
```

Same change on line 1037 for `setActivePanelView`:

```diff
- setActivePanelView: (view: 'page' | 'section' | 'library' | null) => void
+ setActivePanelView: (view: 'page' | 'section' | 'library' | 'style-guide' | null) => void
```

### 1.2 — Add Palette Button to Left Toolbar

**File**: `src/components/wireframe/wireframe-view.tsx`  
**Lines**: ~477–502 (the `<div>` with `absolute left-3 top-3 z-30`)

Add a third button below the existing two:

```tsx
import { Palette } from 'lucide-react'

{/* Style Guide Button */}
<button
    onClick={() => {
        if (activePanelView === 'style-guide') {
            setActivePanelView(null)
        } else {
            setActivePanelView('style-guide')
        }
    }}
    className={cn(
        'w-10 h-10 flex items-center justify-center transition-colors',
        activePanelView === 'style-guide'
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    )}
    title="Style Guide"
>
    <Palette className="h-5 w-5" />
</button>
```

### 1.3 — Create `StyleGuidePanel` Container

**New file**: `src/components/wireframe/panels/style-guide-panel.tsx` (~200 LOC)

This is the top-level panel that hosts the 3 collapsible sections (Colors, Typography, UI Styling) in a single scrollable column — matching Relume's left-panel structure.

```
StyleGuidePanel
├── Header: "Style Guide" + X close
├── ConceptDropdown (Phase 5)
├── ScrollArea
│   ├── <ColorsSection />       (Phase 2)
│   ├── <Separator />
│   ├── <TypographySection />   (Phase 3)
│   ├── <Separator />
│   └── <UIStylingSection />    (Phase 4)
└── Footer: [✦ Scheme shuffle SPACE] button
```

Skeleton:

```tsx
'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface StyleGuidePanelProps {
    onCloseAction: () => void
    className?: string
}

export function StyleGuidePanel({ onCloseAction, className }: StyleGuidePanelProps) {
    return (
        <div className={cn('flex flex-col h-full', className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="text-sm font-semibold">Style Guide</h2>
                <button onClick={onCloseAction} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {/* ColorsSection placeholder */}
                    {/* TypographySection placeholder */}
                    {/* UIStylingSection placeholder */}
                </div>
            </ScrollArea>
        </div>
    )
}
```

### 1.4 — Wire into `WireframeSidebar`

**File**: `src/components/wireframe/wireframe-sidebar.tsx`

1. **Line 56** — add to `isVisible` check:
   ```diff
   - const isVisible = activePanelView === 'page' || activePanelView === 'section' || activePanelView === 'library'
   + const isVisible = activePanelView === 'page' || activePanelView === 'section' || activePanelView === 'library' || activePanelView === 'style-guide'
   ```

2. **After the library panel block (~line 104)** — add new render case:
   ```tsx
   {/* Style Guide Panel */}
   {activePanelView === 'style-guide' && (
       <StyleGuidePanel
           onCloseAction={handleClose}
           className="flex-1"
       />
   )}
   ```

3. **Import** at top:
   ```tsx
   import { StyleGuidePanel } from './panels/style-guide-panel'
   ```

### 1.5 — Barrel Export

**File**: `src/components/wireframe/panels/index.ts`

```diff
+ export { StyleGuidePanel } from './style-guide-panel'
```

### Phase 1 Verification

- [ ] Palette icon appears in left toolbar (third button)
- [ ] Clicking toggles the Style Guide panel open/closed
- [ ] Panel shows "Style Guide" header + X close button
- [ ] Panel closes when X is clicked or Palette icon is re-clicked
- [ ] `npm run build` passes clean

---

## Phase 2 — Colors Section

**Goal**: Build the full Colors panel with light/dark toggle, accent color cards, neutrals card, add accent, shuffle, and the Color Picker subpanel.

### Reference Screenshots

| Screenshot | Shows |
|-----------|-------|
| `page-2026-02-20T16-29-20-931Z.png` | Colors panel — accent cards grid, light/dark toggle, shuffle |
| `page-2026-02-20T16-29-53-315Z.png` | Accent card hover states — delete, copy, shade dots |
| `page-2026-02-20T16-36-15-891Z.png` | Color Picker subpanel — 2D picker + hue slider + hex + shades |
| `page-2026-02-20T16-36-37-552Z.png` | Neutrals subpanel — tint toggle + 7-shade breakdown |

### 2.0 — Install `react-colorful`

```bash
cd scytle && npm install react-colorful
```

2KB gzip, zero dependencies. Provides `<HexColorPicker>` (2D saturation/brightness + hue slider) and `<HexColorInput>`.

### 2.1 — `ColorsSection` Component

**New file**: `src/components/wireframe/panels/style-guide/colors-section.tsx` (~250 LOC)

```
ColorsSection
├── Header Row
│   ├── "Colors" label
│   ├── Light/Dark toggle (Sun ☀️ / Moon 🌙 icon buttons)
│   └── [✦ Shuffle C] button
├── Accent Cards Grid (2-col)
│   ├── AccentColorCard × N (click → opens ColorPickerSubpanel)
│   └── [+] Add accent button
└── Neutrals Card (click → opens NeutralsSubpanel — stretch goal)
```

#### Store bindings:
- `useStyleGuideStore` → `getActiveConcept().colors.accents`, `toggleMode()`, `shuffleColors()`, `addAccent()`, `removeAccent()`, `updateAccent()`, `setMainAccent()`

#### Light/Dark Toggle:
Two adjacent icon buttons (`Sun` / `Moon` from lucide-react). Active button gets `bg-muted` to match the Relume pattern of a visually depressed state.

#### Accent Color Cards:
Each card renders:
- Background fill = accent hex
- Name (top-left), Hex value (bottom-left)
- "Main" badge (bottom-right) if `isMain`
- Hover → reveal delete (trash) + copy icons (top-right)
- Click → set local state `openPickerForAccentId` to open `ColorPickerSubpanel`

#### Add Accent (+):
Empty dashed-border card. Click → `addAccent('New Color', randomHex)`.

### 2.2 — `AccentColorCard` Component

**New file**: `src/components/wireframe/panels/style-guide/accent-color-card.tsx` (~80 LOC)

Small card component with hover reveal pattern:

```tsx
interface AccentColorCardProps {
    accent: AccentColor
    onClickAction: () => void
    onDeleteAction?: () => void
    onSetMainAction?: () => void
}
```

### 2.3 — `ColorPickerSubpanel` Component

**New file**: `src/components/wireframe/panels/style-guide/color-picker-subpanel.tsx` (~150 LOC)

Slide-in subpanel (replaces main content, same sidebar slot):

```
ColorPickerSubpanel
├── Header: "{Color Name}" + X close (back to colors)
├── <HexColorPicker> from react-colorful (2D + hue)
├── Hex input row: # [______] [📋 Copy]
├── Name input: [______]
├── [✦ Shuffle this color] button
├── Shades preview (auto-generated from hex)
│   ├── Pastel: Lightest, Lighter
│   ├── Mid-Tone: Light, Base, Dark
│   └── Deep: Darker, Darkest
```

#### Shade Generation Utility:

**New file**: `src/lib/designs/v2/tokens/shade-utils.ts` (~60 LOC)

```typescript
export function generateShades(hex: string): { label: string; hex: string }[]
```

Takes a hex color and generates 7 shades by manipulating lightness in oklch space (to match Tailwind v4's oklch approach). Three groups:
- Pastel: L=0.95, L=0.88
- Mid-Tone: L=0.75, L=0.60, L=0.45
- Deep: L=0.30, L=0.18

### 2.4 — Wire `ColorsSection` into `StyleGuidePanel`

Replace the placeholder comment with:
```tsx
<ColorsSection />
```

### Phase 2 Verification

- [ ] Colors section renders in the Style Guide panel
- [ ] Light/Dark toggle switches mode instantly; preview updates
- [ ] Accent cards show correct colors, names, hex values
- [ ] "Main" badge appears on the primary accent
- [ ] Hover reveals delete/copy icons
- [ ] Clicking an accent card opens Color Picker subpanel
- [ ] 2D picker + hue slider change color in real-time
- [ ] Hex input and name input work
- [ ] Shades display 7 auto-generated shades
- [ ] [+] Add accent creates a new accent card
- [ ] Delete removes an accent (cannot delete last one)
- [ ] Shuffle C randomizes the entire palette
- [ ] `npm run build` passes clean

---

## Phase 3 — Typography Section

**Goal**: Build the Typography panel with heading/body font cards, style dropdown (size/weight/spacing), shuffle, and the Font Browser subpanel.

### Reference Screenshots

| Screenshot | Shows |
|-----------|-------|
| `page-2026-02-20T16-37-10-060Z.png` | Typography panel — heading/body cards, style dropdown |
| `page-2026-02-20T16-39-35-886Z.png` | Typography style command-palette dropdown |
| `page-2026-02-20T16-40-01-222Z.png` | Font Browser — Liked Fonts tab, AI recommendations |
| `page-2026-02-20T16-40-21-119Z.png` | Font Browser — Browse tab with category buttons |
| `page-2026-02-20T16-41-40-682Z.png` | Font Browser — Category drill-down (Sans Serif results) |

### 3.1 — `TypographySection` Component

**New file**: `src/components/wireframe/panels/style-guide/typography-section.tsx` (~200 LOC)

```
TypographySection
├── Header Row
│   ├── "Typography" label
│   ├── Style Dropdown Button: "Regular - medium ∨"
│   └── [✦ Shuffle T] button
├── Heading Font Card (click → FontBrowserSubpanel for heading)
│   ├── Font name rendered in that font
│   ├── "Google" + "Free" badges
│   └── Hover: shuffle + lock icons
├── Body Font Card (click → FontBrowserSubpanel for body)
│   ├── Font name rendered in that font
│   ├── "Google" + "Free" badges
│   └── Hover: shuffle + lock icons
```

#### Style Dropdown:
Use shadcn `<DropdownMenu>` with grouped options:

| Group | Options | Store Action |
|-------|---------|--------------|
| Size | Small (0.875) · Regular (1) · Large (1.125) | `setSizeScale()` |
| Weight | Normal (400) · Medium (500) · Bold (700) | `setHeadingWeight()` |
| Style | Default · Tight · Wide | `setLetterSpacingStyle()` |

Button label format: `"{Size} - {weight}"` (e.g., "Regular - medium"). Checkmarks on selected items.

#### Font Cards:
Each card shows the font name rendered in that font (use `style={{ fontFamily }}`) + source badges. Click opens the Font Browser.

### 3.2 — `FontCard` Component

**New file**: `src/components/wireframe/panels/style-guide/font-card.tsx` (~80 LOC)

```tsx
interface FontCardProps {
    label: 'Heading' | 'Body'
    fontFamily: string
    onClickAction: () => void
    onShuffleAction: () => void
}
```

### 3.3 — `FontBrowserSubpanel` Component

**New file**: `src/components/wireframe/panels/style-guide/font-browser-subpanel.tsx` (~250 LOC)

Slide-in subpanel:

```
FontBrowserSubpanel
├── Header: "Heading" or "Body" + X close
├── Search input (magnifying glass icon)
├── Category filter toggle-group: [Sans Serif] [Serif] [Display] [Mono] [All]
├── Results count: "80 pairs" (or filtered count)
├── Scrollable font pair list
│   ├── FontPairCard × N
│   │   ├── Heading specimen ("The quick brown fox" in heading font)
│   │   ├── Body specimen ("The quick brown fox" in body font)
│   │   ├── Font names + source badges
│   │   └── Click → applies pair (applyFontPair) and closes
│   └── Active pair highlighted with accent ring
└── Sticky bottom: active font indicator
```

Sources the 80 pairs from `src/lib/designs/v2/tokens/font-pairs.ts`. Search filters by font family name. Category filter uses the `category` field on each pair.

Google Fonts are loaded dynamically with `loadGoogleFonts()` when new pairs scroll into view (use IntersectionObserver or load all visible pairs on mount).

### 3.4 — Wire `TypographySection` into `StyleGuidePanel`

Replace the typography placeholder with:
```tsx
<Separator />
<TypographySection />
```

### Phase 3 Verification

- [ ] Typography section renders below Colors
- [ ] Style dropdown shows Size/Weight/Style groups with checkmarks
- [ ] Changing size/weight/style updates tokens and preview instantly
- [ ] Heading and Body font cards show correct font names in correct fonts
- [ ] Clicking a font card opens the Font Browser subpanel
- [ ] Search filters pairs by name
- [ ] Category toggles filter pairs (Sans Serif, Serif, Display, Mono)
- [ ] Clicking a pair applies it (`applyFontPair`) and updates preview
- [ ] Active pair is visually highlighted
- [ ] Shuffle T randomizes the font pair
- [ ] `npm run build` passes clean

---

## Phase 4 — UI Styling Section

**Goal**: Build the UI Styling panel with Buttons & Forms card, Cards & Images card, radius pickers, style preset cards, and their respective subpanels.

### Reference Screenshots

| Screenshot | Shows |
|-----------|-------|
| `page-2026-02-20T16-42-03-400Z.png` | UI Styling panel — Buttons & Forms + Cards & Images cards |
| `page-2026-02-20T16-42-38-071Z.png` | Buttons & Forms subpanel — radius picker + 6 style presets |
| `page-2026-02-20T16-42-59-589Z.png` | Buttons & Forms — style preset detail with eye toggle |
| `page-2026-02-20T16-43-20-317Z.png` | Cards & Images subpanel — radius picker + 4 card presets |
| `page-2026-02-20T16-43-50-719Z.png` | Cards & Images — preset detail view |

### 4.1 — `UIStylingSection` Component

**New file**: `src/components/wireframe/panels/style-guide/ui-styling-section.tsx` (~120 LOC)

```
UIStylingSection
├── Header Row
│   ├── "UI Styling" label
│   └── [✦ Shuffle U] button
├── Cards Grid (2-col)
│   ├── ButtonsFormsCard (click → ButtonsFormsSubpanel)
│   │   ├── "Buttons & Forms" label
│   │   └── Mini preview: solid + outline button + input field
│   └── CardsImagesCard (click → CardsImagesSubpanel)
│       ├── "Cards & Images" label
│       └── Mini preview: card with image + text
```

### 4.2 — `RadiusPicker` Shared Component

**New file**: `src/components/wireframe/panels/style-guide/radius-picker.tsx` (~60 LOC)

Reused by both Buttons & Forms and Cards & Images subpanels.

```tsx
interface RadiusPickerProps {
    value: RadiusPreset
    onChangeAction: (r: RadiusPreset) => void
}
```

4 icon buttons in a row — each renders a small rounded-rect SVG icon with the corresponding radius:
| Preset | Value | Icon Shape |
|--------|-------|-----------|
| Sharp | `0` | ⬜ Square corners |
| Slight | `4` | Slightly rounded |
| Medium | `8` | Medium rounded |
| Pill | `9999` | Fully rounded |

Selected preset gets accent ring. Maps to `RadiusPreset` from `tokens/index.ts` (note: our type has 5 values `0 | 4 | 8 | 12 | 9999` — we map the picker's 4 positions to 0, 4, 8, 9999; value `12` remains available programmatically).

### 4.3 — `ButtonsFormsSubpanel` Component

**New file**: `src/components/wireframe/panels/style-guide/buttons-forms-subpanel.tsx` (~180 LOC)

```
ButtonsFormsSubpanel
├── Header: "Buttons & Forms" + X close
├── RadiusPicker (shared)
├── Style Preset Cards (scrollable)
│   ├── Solid (default)
│   ├── Outline
│   ├── Ghost
│   ├── Brick
│   └── Gradient
│   Each shows:
│     ├── Style name + "Selected" badge if active
│     ├── 👁️ Preview toggle (hover)
│     └── Preview: Primary button + Secondary button + Label + Input
├── [✦ Shuffle] button (bottom, sticky)
```

Maps to `ButtonStyle` from tokens: `'solid' | 'outline' | 'ghost' | 'brick' | 'gradient'` (5 styles).

Each preset card is a clickable container. Clicking calls `setButtonStyle(style)`. Active preset gets a green ✅ "Selected" badge.

The preview within each card renders actual mini-button elements styled with the appropriate CSS variables — this gives an accurate representation of the final look.

### 4.4 — `CardsImagesSubpanel` Component

**New file**: `src/components/wireframe/panels/style-guide/cards-images-subpanel.tsx` (~150 LOC)

```
CardsImagesSubpanel
├── Header: "Cards & Images" + X close
├── RadiusPicker (shared)
├── Style Preset Cards (scrollable)
│   ├── Default
│   ├── Outlined
│   └── Flat
│   Each shows:
│     ├── Style name + "Selected" badge if active
│     ├── 👁️ Preview toggle (hover)
│     └── Preview: Image card + text card thumbnail
├── [✦ Shuffle] button (bottom, sticky)
```

Maps to `CardStyle` from tokens: `'default' | 'outlined' | 'flat'` (3 styles).

### 4.5 — Wire `UIStylingSection` into `StyleGuidePanel`

Replace the UI Styling placeholder with:
```tsx
<Separator />
<UIStylingSection />
```

### Phase 4 Verification

- [ ] UI Styling section renders below Typography
- [ ] Buttons & Forms card shows mini preview matching current button style + radius
- [ ] Cards & Images card shows mini preview matching current card style + radius
- [ ] Clicking opens respective subpanel
- [ ] Radius picker shows 4 options, selected has accent ring
- [ ] Changing radius updates tokens and canvas instantly
- [ ] Style presets show accurate previews
- [ ] Active preset has "Selected" badge
- [ ] Clicking a preset changes `buttonStyle` / `cardStyle`
- [ ] Shuffle U randomizes both button and card styles + radii
- [ ] `npm run build` passes clean

---

## Phase 5 — Concepts, Keyboard Shortcuts & Section Schemes

**Goal**: Wire up the Concepts dropdown, keyboard shortcuts, and per-section scheme overlays.

### Reference Screenshots

| Screenshot | Shows |
|-----------|-------|
| `page-2026-02-20T16-44-25-725Z.png` | Concepts dropdown — command palette with New/Duplicate/Delete |
| `page-2026-02-20T16-45-10-229Z.png` | Concept generation — 3 parallel AI streams |
| `page-2026-02-20T16-45-39-419Z.png` | "Surprise me" button and generation state |
| `page-2026-02-20T16-46-15-993Z.png` | "New schemes available" notification overlay |
| `page-2026-02-20T16-46-59-364Z.png` | Per-section scheme overlay — scheme chips on hover |
| `page-2026-02-20T16-47-22-764Z.png` | Scheme shuffle SPACE bar at bottom |
| `page-2026-02-20T16-48-04-450Z.png` | Pitch Concepts page — 3-column presentation view |
| `page-2026-02-20T16-48-56-277Z.png` | Per-section scheme chips detail |
| `page-2026-02-20T16-50-07-071Z.png` | Bottom bar with scheme shuffle |
| `page-2026-02-20T16-50-45-025Z.png` | Keyboard shortcuts in action |
| `page-2026-02-20T16-51-24-799Z.png` | Complete style guide with all panels filled |

### 5.1 — `ConceptDropdown` Component

**New file**: `src/components/wireframe/panels/style-guide/concept-dropdown.tsx` (~120 LOC)

Placed at the top of `StyleGuidePanel` (above ScrollArea). Uses shadcn `<DropdownMenu>`:

```
ConceptDropdown
├── Trigger: "Concept 1 ∨" button
├── Content (command palette style)
│   ├── Concept 1 ✓ (selected)
│   ├── Concept 2
│   ├── Concept 3
│   ├── Separator
│   ├── New Concept → createConcept()
│   ├── Duplicate Concept → duplicateConcept(activeId)
│   └── Delete Concept → deleteConcept(activeId) — disabled when count === 1
```

Store bindings: `data.concepts`, `data.activeConceptId`, `switchConcept()`, `createConcept()`, `duplicateConcept()`, `deleteConcept()`.

### 5.2 — Keyboard Shortcuts

**File**: `src/components/wireframe/use-keyboard-shortcuts.ts`

Add to the existing keyboard shortcut hook:

| Key | Action | Guard |
|-----|--------|-------|
| `C` | `shuffleColors()` | Not in text input/textarea |
| `T` | `shuffleTypography()` | Not in text input/textarea |
| `U` | `shuffleUI()` | Not in text input/textarea |
| `Space` | `shuffleSectionScheme()` | Not in text input/textarea, must have selectedSectionId |

```typescript
import { useStyleGuideStore } from '@/store'

// Inside the keydown handler:
if (e.key === 'c' && !isEditing) {
    e.preventDefault()
    useStyleGuideStore.getState().shuffleColors()
}
if (e.key === 't' && !isEditing) {
    e.preventDefault()
    useStyleGuideStore.getState().shuffleTypography()
}
if (e.key === 'u' && !isEditing) {
    e.preventDefault()
    useStyleGuideStore.getState().shuffleUI()
}
if (e.key === ' ' && !isEditing) {
    e.preventDefault()
    useStyleGuideStore.getState().shuffleSectionScheme()
}
```

### 5.3 — Section Scheme Overlay

**New file**: `src/components/wireframe/section-scheme-overlay.tsx` (~100 LOC)

Appears on hover at the top edge of each section in the wireframe canvas. Shows scheme chips:

```
SectionSchemeOverlay
├── [☀️ Light] [🌙 Dark] [🎨 Accent1] [🎨 Accent2…]
└── Active scheme gets ring indicator
```

This component is rendered inside each section wrapper in the wireframe canvas (e.g., inside `section-block.tsx` or `page-frame.tsx`). It uses:
- `useStyleGuideStore.getState().getSectionScheme(sectionId)` to read current scheme
- `useStyleGuideStore.getState().setSectionScheme(sectionId, scheme)` to set

Show on hover with a fade-in transition. Each chip is a small button with the scheme color as background.

### 5.4 — Scheme Shuffle Footer Button

In the `StyleGuidePanel` footer area:

```tsx
<button
    onClick={() => useStyleGuideStore.getState().shuffleSectionScheme()}
    className="w-full py-2 text-sm border-t flex items-center justify-center gap-2 hover:bg-muted transition-colors"
>
    <Sparkles className="h-3.5 w-3.5" />
    Scheme shuffle
    <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded">SPACE</kbd>
</button>
```

### Phase 5 Verification

- [ ] Concept dropdown shows all concepts with checkmark on active
- [ ] Switching concepts updates all panels and preview
- [ ] New Concept creates and switches to a new concept
- [ ] Duplicate clones the current concept
- [ ] Delete removes concept (disabled when only 1)
- [ ] `C` key shuffles colors (not when typing)
- [ ] `T` key shuffles typography
- [ ] `U` key shuffles UI styling
- [ ] `Space` shuffles section schemes
- [ ] Section scheme overlay appears on hover
- [ ] Clicking a scheme chip changes that section's scheme
- [ ] Scheme shuffle footer button works
- [ ] `npm run build` passes clean

---

## File Summary

### New Files (14 files, ~1,725 LOC estimated)

| # | File | Est. LOC | Phase |
|---|------|---------|-------|
| 1 | `src/components/wireframe/panels/style-guide-panel.tsx` | 200 | 1 |
| 2 | `src/components/wireframe/panels/style-guide/colors-section.tsx` | 250 | 2 |
| 3 | `src/components/wireframe/panels/style-guide/accent-color-card.tsx` | 80 | 2 |
| 4 | `src/components/wireframe/panels/style-guide/color-picker-subpanel.tsx` | 150 | 2 |
| 5 | `src/lib/designs/v2/tokens/shade-utils.ts` | 60 | 2 |
| 6 | `src/components/wireframe/panels/style-guide/typography-section.tsx` | 200 | 3 |
| 7 | `src/components/wireframe/panels/style-guide/font-card.tsx` | 80 | 3 |
| 8 | `src/components/wireframe/panels/style-guide/font-browser-subpanel.tsx` | 250 | 3 |
| 9 | `src/components/wireframe/panels/style-guide/ui-styling-section.tsx` | 120 | 4 |
| 10 | `src/components/wireframe/panels/style-guide/radius-picker.tsx` | 60 | 4 |
| 11 | `src/components/wireframe/panels/style-guide/buttons-forms-subpanel.tsx` | 180 | 4 |
| 12 | `src/components/wireframe/panels/style-guide/cards-images-subpanel.tsx` | 150 | 4 |
| 13 | `src/components/wireframe/panels/style-guide/concept-dropdown.tsx` | 120 | 5 |
| 14 | `src/components/wireframe/section-scheme-overlay.tsx` | 100 | 5 |

### Modified Files (6 files, ~50 LOC changes)

| # | File | Change | Phase |
|---|------|--------|-------|
| 1 | `src/store/unified-store.ts` | Add `'style-guide'` to type union (2 lines) | 1 |
| 2 | `src/components/wireframe/wireframe-view.tsx` | Add Palette toolbar button (~15 lines) | 1 |
| 3 | `src/components/wireframe/wireframe-sidebar.tsx` | Add style-guide visibility + render case (~5 lines) | 1 |
| 4 | `src/components/wireframe/panels/index.ts` | Add barrel export (1 line) | 1 |
| 5 | `src/components/wireframe/use-keyboard-shortcuts.ts` | Add C/T/U/SPACE handlers (~15 lines) | 5 |
| 6 | `src/components/wireframe/section-block.tsx` or `page-frame.tsx` | Add SectionSchemeOverlay on hover (~10 lines) | 5 |

### External Dependency

| Package | Size | Purpose |
|---------|------|---------|
| `react-colorful` | 2KB gzip | HexColorPicker + HexColorInput for accent color editing |

---

## Phase Dependency Graph

```
Phase 1 (Foundation) ──┬── Phase 2 (Colors)
                       ├── Phase 3 (Typography)
                       └── Phase 4 (UI Styling)
                                │
                       All of 2,3,4
                                │
                       Phase 5 (Concepts + Shortcuts + Schemes)
```

Phases 2, 3, and 4 are **independent** of each other and can be built in any order after Phase 1. Phase 5 depends on all three being in place.

---

## Out of MVP Scope (Future)

- Font "likes" and AI recommendations
- Pitch Concepts presentation page
- Brand/Logo panel
- "Surprise me" full AI regeneration
- Neutral tint from accent colors
- Lock icons on font/color cards (prevent shuffle)
- "New schemes available" notification overlay
