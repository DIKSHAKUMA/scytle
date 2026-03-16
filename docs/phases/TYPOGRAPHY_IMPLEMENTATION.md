# Typography System — Figma Parity Implementation
> Phase D2 | Branch: feat/canvas-node-system | March 2026
> Key decisions locked in. All 7 phases ready to implement.

---

## Design Decisions (Locked)

| Decision | Choice | Rationale |
|---|---|---|
| Font data source | **Bundle static JSON** (~300 curated fonts) + lazy-fetch styles on demand | No API key at runtime, instant open |
| Font preview rendering | **CSS `fontFamily` + lazy load via link injection** before visible | Simpler than server-side images, same visual result |
| Type Settings position | **Float LEFT of right panel** (same as ColorPicker pattern) | Consistent UX, doesn't cover canvas |
| Italic handling | **Add `fontStyleName: string`** alongside existing `fontWeight`/`fontStyle` | Backward compat, derive from style name |
| Variable fonts | **Skip Phase 6 for MVP** | Requires per-font axis metadata, lower priority |
| Scope | **Phases 1–5 for MVP parity** | Best ROI first |

---

## Figma UI Reference Screenshots

### 1. Text selected (right panel overview)
![text selected](./../../../Documents/scytle.ai/figma-text-selected-not-editing.png)

**Observations from this view:**
- Header: "Text" + link icon + emoji icon + component icon + "..." menu
- Typography section label "Typography" + "00" (styles) icon on right
- Font family: full-width combobox showing "Inter" + chevron
- Row 2: `[Regular ▾]` (50%) + `[12 ▾↑↓]` (50%)
- Row 3: `≡ Line height [Auto]` + `|A| Letter spacing [0%]`
- Row 4: Alignment (3 H + 3 V buttons) + Type Settings gear icon (rightmost)
- **No separate Italic button anywhere**

### 2. Type Settings — Basics tab
![type settings basics](./figma-type-settings-basics.png)

**Structure:**
```
┌─ Basics │ Details │ Variable ──────────────── [×] ─┐
│ ┌─ Preview ────────────────────────────────────────┐│
│ │           Hello World Typography                 ││
│ └──────────────────────────────────────────────────┘│
│                                                      │
│  Alignment    [≡L] [≡C] [≡R] [≡J]  ← 4 options!   │
│  Decoration   [—] [U̲]  [S̶]   [>]  ← None/U/S+details│
│  Case         [—] [AG] [ag] [Ag] [Aɢ]               │
│                                                      │
│  Vertical trim  [Ag▼] [Ag↑]                         │
│  List style     [—]  [•]  [1.]                      │
│  Paragraph spacing  [   0   ]                       │
│  Truncate text  [—]  [A…]                           │
└──────────────────────────────────────────────────────┘
```

### 3. Type Settings — Details tab (top)
![type settings details](./figma-type-settings-details.png)

**Sections visible:** Indentation (hanging punct, hanging lists, paragraph indent), Letter case (case, case-sensitive forms, capital spacing), Numbers header

### 4. Type Settings — Details tab (scrolled — letterforms)
![type settings details scrolled](./figma-type-settings-details-scrolled.png)

**Sections visible:** Rare ligatures, Contextual alternates (**default ON**), Ordinals, Stylistic sets (5 options), beginning of Character variants

### 5. Type Settings — Details tab (scrolled bottom)
![type settings details scrolled 2](./figma-type-settings-details-scrolled2.png)

**Sections visible:** Character variants end (Capital G with spur, Single-storey a), Horizontal spacing (Kerning pairs **default ON**), More features (Fraction denominators/numerators, Scientific inferiors)

### 6. Type Settings — Variable tab
![type settings variable](./figma-type-settings-variable.png)

**Structure:**
```
  Slant    [    0    ]
  ●────────────────────○   continuous slider

  Weight   [   400   ]
  ●──•──•──●──•──•──•──○   slider with named-weight stops (100/200/../900)
```

---

## Exact Icon Specifications

### Icons Available Directly from Lucide

| Control | Lucide Icon | Notes |
|---|---|---|
| Align left (H) | `AlignLeft` | ✓ exact match |
| Align center (H) | `AlignCenter` | ✓ |
| Align right (H) | `AlignRight` | ✓ |
| Align justify (H) | `AlignJustify` | ✓ |
| Underline decoration | `Underline` | ✓ |
| Strikethrough decoration | `Strikethrough` | ✓ |
| Bullet list | `List` | ✓ |
| Numbered list | `ListOrdered` | ✓ |
| Close / clear button | `X` | ✓ |
| Search (font picker) | `Search` | ✓ |
| Font style chevron | `ChevronDown` | ✓ |
| Type settings button | `SlidersHorizontal` | Good match for Figma's panel-settings icon |
| Text styles ("00") | `BookType` or `Type` | Use `BookType` from Lucide |
| Link (text header) | `Link` | ✓ |
| Create component | `Component` | ✓ |
| More actions | `MoreHorizontal` | ✓ |
| Toggle disabled state | `Minus` | Used as "—" in all toggle groups |
| Toggle enabled state | `Check` | Used in Details tab toggle pairs |
| Selected item checkmark | `Check` | In font dropdowns |
| Star / favorite | `Star` | Font picker favorite |
| Fixed size resize | `Square` | Close enough |
| Close dialog | `X` or `XIcon` | ✓ |
| Variable apply | `Variable` | ✓ |

### Custom SVG Icons (must build — not in Lucide)

#### 1. Line Height Icon
Used in: Typography section row 3, label prefix
```tsx
// LineHeightIcon.tsx
export const LineHeightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Left: vertical double-arrow bar */}
    <line x1="3" y1="2" x2="3" y2="14" />
    <polyline points="1,4 3,2 5,4" />
    <polyline points="1,12 3,14 5,12" />
    {/* Right: 3 horizontal text lines */}
    <line x1="7" y1="5" x2="14" y2="5" />
    <line x1="7" y1="8" x2="14" y2="8" />
    <line x1="7" y1="11" x2="12" y2="11" />
  </svg>
)
```

#### 2. Letter Spacing Icon
Used in: Typography section row 3, label prefix
```tsx
// LetterSpacingIcon.tsx
export const LetterSpacingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Left A */}
    <path d="M1 12 L4 4 L7 12" />
    <line x1="2.5" y1="9" x2="5.5" y2="9" />
    {/* Right A (smaller) */}
    <path d="M10 12 L12.5 6 L15 12" />
    <line x1="11" y1="10" x2="14" y2="10" />
    {/* Center gap arrows */}
    <line x1="8" y1="8" x2="8" y2="8" strokeWidth="1" />
  </svg>
)
```

#### 3. Resizing Mode — Auto Width
```tsx
// ResizeAutoWidth.tsx  (matches Figma |→ icon)
export const ResizeAutoWidthIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="2" y1="4" x2="2" y2="12" />   {/* left bar */}
    <line x1="2" y1="8" x2="13" y2="8" />   {/* horizontal arrow shaft */}
    <polyline points="10,5 13,8 10,11" />     {/* arrowhead */}
  </svg>
)
```

#### 4. Resizing Mode — Auto Height
```tsx
// ResizeAutoHeight.tsx  (matches Figma |=| icon)
export const ResizeAutoHeightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="3" y1="3" x2="3" y2="13" />   {/* left bar */}
    <line x1="13" y1="3" x2="13" y2="13" /> {/* right bar */}
    <line x1="3" y1="6" x2="13" y2="6" />   {/* top text line */}
    <line x1="3" y1="8" x2="13" y2="8" />   {/* middle text line */}
    <line x1="3" y1="10" x2="10" y2="10" /> {/* bottom text line short */}
    <polyline points="6,1 3,3 6,5" />        {/* top arrow */}
    <polyline points="6,11 3,13 6,15" />     {/* bottom arrow */}
  </svg>
)
```

#### 5. Vertical Alignment — Top
```tsx
export const AlignTopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="3" y1="2" x2="13" y2="2" />   {/* top line */}
    <line x1="5" y1="2" x2="5" y2="9" />    {/* text block tall */}
    <line x1="11" y1="2" x2="11" y2="7" />  {/* text block shorter */}
    <line x1="5" y1="5" x2="11" y2="5" />
    <line x1="5" y1="9" x2="8" y2="9" />
    <line x1="5" y1="7" x2="11" y2="7" />
  </svg>
)
```

#### 6. Vertical Alignment — Middle / Bottom
Similar structure, blocks centered or packed at bottom.

#### 7. Text Decoration — None (dash icon)
```tsx
// Just render text: "—" or use <Minus /> from Lucide at size 12
```

#### 8. Text Case Icons (render as styled text, not SVG)
```tsx
// These are rendered as typography specimens, not icon SVGs
const CASE_ICONS = {
  none:      <span style={{ fontWeight: 400 }}>—</span>,
  upper:     <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>AG</span>,
  lower:     <span style={{ fontSize: 10, fontWeight: 400 }}>ag</span>,
  title:     <span style={{ fontSize: 10, fontWeight: 500 }}>Ag</span>,
  smallCaps: <span style={{ fontSize: 10, fontVariantCaps: 'small-caps' }}>Ag</span>,
}
```

#### 9. Vertical Trim Icons (render as styled text)
```tsx
const TRIM_ICONS = {
  standard: <span>Ag</span>,     // normal descenders/ascenders visible
  capHeight: <span style={{ lineHeight: 1, overflow: 'hidden' }}>Ag</span>,
}
```

#### 10. Number Position Icons
```tsx
const NUM_POS_ICONS = {
  subscript:   <span>A<sub style={{ fontSize: 7 }}>2</sub></span>,
  normal:      <span style={{ fontSize: 11 }}>A</span>,
  superscript: <span>A<sup style={{ fontSize: 7 }}>2</sup></span>,
}
```

---

## File Structure

```
scytle/src/components/editor/properties-panel/
└── typography/                          ← NEW directory
    ├── index.tsx                        ← RENAMED from typography-section.tsx (refactored)
    ├── font-family-picker.tsx           ← NEW — floating search dialog
    ├── font-style-picker.tsx            ← NEW — dark popover
    ├── font-size-combobox.tsx           ← NEW — hybrid input+presets
    ├── line-height-input.tsx            ← NEW — Auto/px/% unified input
    ├── letter-spacing-input.tsx         ← NEW — %/px unified input
    ├── type-settings-overlay.tsx        ← NEW — 3-tab float overlay
    ├── type-settings-basics.tsx         ← NEW — Basics tab
    ├── type-settings-details.tsx        ← NEW — Details tab (scrollable)
    ├── type-settings-variable.tsx       ← NEW — Variable axes tab
    └── icons/
        ├── line-height-icon.tsx         ← NEW
        ├── letter-spacing-icon.tsx      ← NEW
        ├── resize-auto-width.tsx        ← NEW
        ├── resize-auto-height.tsx       ← NEW
        ├── align-top.tsx                ← NEW
        ├── align-middle.tsx             ← NEW
        └── align-bottom.tsx             ← NEW

scytle/src/lib/fonts/
├── google-fonts.ts                      ← NEW — load font, inject link
├── font-manifest.json                   ← NEW — ~300 curated font names + styles
└── font-utils.ts                        ← NEW — getAvailableStyles, isFontLoaded, etc.
```

---

## TypeScript Type Changes

### `src/types/canvas.ts` — TextNode additions

```typescript
export interface TextNode extends BaseNodeProperties {
  // ─── EXISTING (unchanged) ───────────────────────────────────────────────
  characters: string;
  fontFamily: string;
  fontWeight: number;
  fontStyle?: 'normal' | 'italic';
  fontSize: number;
  lineHeight: number | 'auto';
  lineHeightUnit?: 'auto' | 'px' | '%';
  letterSpacing: number;
  letterSpacingUnit?: 'px' | '%';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textAlignVertical?: 'top' | 'center' | 'bottom';
  textDecoration: 'none' | 'underline' | 'line-through';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize' | 'small-caps';
  autoResize: 'none' | 'width-and-height' | 'height' | 'truncate';
  maxLines?: number;
  color: string;
  leadingTrim?: 'none' | 'cap-height';
  paragraphSpacing?: number;
  paragraphIndent?: number;
  listStyle?: 'none' | 'ordered' | 'unordered';
  hangingPunctuation?: boolean;
  hangingList?: boolean;
  opentypeFlags?: Record<string, 0 | 1>;
  htmlTag?: 'h1'|'h2'|'h3'|'h4'|'h5'|'h6'|'p'|'span'|'a'|'li';

  // ─── NEW ─────────────────────────────────────────────────────────────────
  /**
   * Unified font style name as shown in Figma: "Regular" | "Bold" | "Italic" | "Bold Italic"
   * Takes precedence over fontWeight + fontStyle when set.
   * Enables proper dynamic style list from Google Fonts API.
   */
  fontStyleName?: string;

  /** Vertical spacing between list items in px (Figma: listSpacing) */
  listSpacing?: number;

  /**
   * Separate truncation control (Figma: textTruncation).
   * When 'ending', text clips with ellipsis. Use maxLines to limit line count.
   * Replaces the conflated autoResize:'truncate' mode.
   */
  textTruncation?: 'disabled' | 'ending';

  /** Number figure style → OpenType LNUM/ONUM + TNUM/PNUM */
  numberStyle?: 'default' | 'lining-proportional' | 'lining-tabular' | 'oldstyle-proportional' | 'oldstyle-tabular';

  /** Number vertical position → OpenType SUPS/SUBS */
  numberPosition?: 'normal' | 'superscript' | 'subscript';

  /**
   * Variable font axis values. e.g. { wght: 700, slnt: -10 }
   * Rendered as CSS font-variation-settings.
   * Keys are 4-char OT axis tags.
   */
  variableFontAxes?: Record<string, number>;
}
```

### `createText()` factory defaults (update in canvas.ts)
```typescript
// New defaults to add:
fontStyleName: 'Regular',
letterSpacingUnit: '%',   // change from undefined to '%' (Figma default)
textTruncation: 'disabled',
```

---

## Store Changes

### `src/store/editor-store.ts` additions

```typescript
// ─── State additions ────────────────────────────────────────────────────────
typeSettingsOpen: boolean;           // Type Settings overlay visible
typeSettingsTab: 'basics' | 'details' | 'variable';
fontPickerOpen: boolean;             // Font family dialog visible
fontPickerNodeId: string | null;     // Which node the picker is editing

// ─── Action additions ───────────────────────────────────────────────────────
openTypeSettings: () => void;
closeTypeSettings: () => void;
setTypeSettingsTab: (tab: 'basics' | 'details' | 'variable') => void;
openFontPicker: (nodeId: string) => void;
closeFontPicker: () => void;
```

---

## Phase 1 — Font Family Dialog + Google Fonts
**Files**: `typography/font-family-picker.tsx`, `src/lib/fonts/`
**Effort**: Large | **Impact**: ★★★★★

### Behavior Spec
- **Trigger**: Click font family row → opens floating dialog. NOT a native `<select>`.
- **Position**: Floats below the font family button in the panel (or left-of-panel if space is tight)
- **Search**: Controlled input, debounced 200ms. Pre-filled with current font name.
- **Font set filter**: `All fonts` (default) | `In document` | `Recently used`
- **Results list**: Virtualized (`react-window` `FixedSizeList`), item height 32px
- **Font row**: `[font name in its own font]  [★]`
  - Font loaded lazily: IntersectionObserver triggers `loadFont(family)` when row enters viewport
  - `loadFont()` injects `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=NAME">` idempotently
  - Font set to CSS before render, component re-renders when font loaded (via FontFace API or timeout fallback)
- **Live preview**: on arrow keys / hover, call `onUpdate({ fontFamily })` immediately. On Escape, revert.
- **Commit**: Enter key or click row → commit font, close dialog
- **Keyboard**: Arrow up/down navigate list
- **Close**: Escape (reverts), click outside (reverts), X button (reverts)

### Font Manifest (`font-manifest.json`)
```json
[
  { "family": "Inter", "styles": ["Thin","Extra Light","Light","Regular","Medium","Semi Bold","Bold","Extra Bold"], "variable": true, "axes": {"wght": [100,900], "slnt": [-10,0]} },
  { "family": "Roboto", "styles": ["Thin","Thin Italic","Light","Light Italic","Regular","Italic","Medium","Medium Italic","Bold","Bold Italic","Black","Black Italic"] },
  { "family": "Open Sans", "styles": ["Light","Light Italic","Regular","Italic","Medium","Medium Italic","Semi Bold","Semi Bold Italic","Bold","Bold Italic","Extra Bold","Extra Bold Italic"] },
  ...300 fonts total
]
```

### `google-fonts.ts` API
```typescript
// Load a font family into the document
export async function loadFont(family: string): Promise<void>

// Get available styles for a font family
export function getFontStyles(family: string): string[]

// Check if a font is currently loaded
export function isFontLoaded(family: string): boolean

// Search fonts by query
export function searchFonts(query: string, limit = 50): FontMeta[]

// Get recently used fonts (localStorage)
export function getRecentFonts(): string[]
export function addRecentFont(family: string): void
```

---

## Phase 2 — Type Settings Overlay Redesign
**Files**: `typography/type-settings-overlay.tsx`, `type-settings-basics.tsx`, `type-settings-details.tsx`
**Effort**: Medium | **Impact**: ★★★★

### Behavior Spec
- **Trigger**: "Type Settings" icon button at bottom-right of Alignment group (currently our gear icon toggle)
- **Position**: Floats LEFT of the right panel, same as ColorPicker. Fixed `width: 240px`, variable height.
  ```typescript
  // Positioning formula (same as color picker):
  const panelRect = panelRef.current.getBoundingClientRect();
  const left = panelRect.left - OVERLAY_WIDTH - 8;
  const top = btnRect.top - 20; // align near trigger
  ```
- **Draggable**: Pointer capture on header, same pattern as ColorPicker
- **Reset position**: On every open (same as ColorPicker)
- **Live Preview Box**: renders a `<div>` with all current text node styles applied + sample text "Aa Bb Cc 012"
- **THREE TABS**: Basics | Details | Variable
- **Basics tab**: controls visible in main panel but with Justify added + extra controls
- **Details tab**: OpenType features, groups collapsed/expanded
- **Variable tab**: font variable axes only shown if `fontMeta.variable === true`
- **Close**: X button, click outside, Escape

### Type Settings Basics — Control Mapping

| Control | Property | Type | Icon/Label |
|---|---|---|---|
| Alignment | `textAlign` | `'left'\|'center'\|'right'\|'justify'` | 4 icon buttons (Lucide: AlignLeft/Center/Right/Justify) |
| Decoration | `textDecoration` | `'none'\|'underline'\|'line-through'` | 3 icon buttons (Minus, Underline, Strikethrough) |
| Underline details → | (expand sub-panel) | — | ChevronRight button (future) |
| Case | `textTransform` | `'none'\|'uppercase'\|'lowercase'\|'capitalize'\|'small-caps'` | 5 text-specimen buttons |
| Vertical trim | `leadingTrim` | `'none'\|'cap-height'` | 2 custom icon buttons |
| List style | `listStyle` | `'none'\|'unordered'\|'ordered'` | 3 buttons (Minus, List, ListOrdered) |
| Paragraph spacing | `paragraphSpacing` | `number` | NumberInput |
| Truncate text | `textTruncation` | `'disabled'\|'ending'` | 2 buttons (Minus, custom "A…") |
| Max lines | `maxLines` | `number` | NumberInput, shown only when truncation = 'ending' |

### Type Settings Details — OpenType Flag Mapping

```typescript
// Each toggle maps to an openTypeFlag key
const OPENTYPE_DETAILS_CONFIG = [
  // ─── Indentation ────────────────────────────────────────────────────────
  // (not opentype, direct properties)
  { group: 'Indentation', prop: 'hangingPunctuation', label: 'Hanging punctuation', type: 'bool' },
  { group: 'Indentation', prop: 'hangingList', label: 'Hanging lists', type: 'bool' },
  { group: 'Indentation', prop: 'paragraphIndent', label: 'Paragraph indent', type: 'number' },

  // ─── Letter case (OpenType) ──────────────────────────────────────────────
  { group: 'Letter case', flag: 'CASE', label: 'Case-sensitive forms', defaultOn: false },
  { group: 'Letter case', flag: 'CPSP', label: 'Capital spacing', defaultOn: false },

  // ─── Numbers ────────────────────────────────────────────────────────────
  // numberStyle controlled via numberStyle prop (not raw OT flags)
  // numberPosition controlled via numberPosition prop
  { group: 'Numbers', flag: 'FRAC', label: 'Fractions', defaultOn: false },
  { group: 'Numbers', flag: 'ZERO', label: 'Slashed zero', defaultOn: false },

  // ─── Letterforms ────────────────────────────────────────────────────────
  { group: 'Letterforms', flag: 'DLIG', label: 'Rare ligatures', defaultOn: false },
  { group: 'Letterforms', flag: 'CALT', label: 'Contextual alternates', defaultOn: true },  // ← FIGMA DEFAULT ON
  { group: 'Letterforms', flag: 'ORDN', label: 'Ordinals', defaultOn: false },

  // ─── Stylistic sets (font-specific, rendered dynamically) ───────────────
  { group: 'Stylistic sets', flag: 'SALT', label: 'Stylistic alternates', defaultOn: false },
  { group: 'Stylistic sets', flag: 'SS01', label: 'Open digits', defaultOn: false },
  { group: 'Stylistic sets', flag: 'SS02', label: 'Disambiguation', defaultOn: false },
  { group: 'Stylistic sets', flag: 'SS03', label: 'r curves into round neighbors', defaultOn: false },
  { group: 'Stylistic sets', flag: 'SS04', label: 'Disambiguation without slashed zero', defaultOn: false },

  // ─── Character variants (Inter-specific) ────────────────────────────────
  { group: 'Character variants', flag: 'CV01', label: 'Alternate one', defaultOn: false },
  { group: 'Character variants', flag: 'CV02', label: 'Open four', defaultOn: false },
  { group: 'Character variants', flag: 'CV03', label: 'Open six', defaultOn: false },
  { group: 'Character variants', flag: 'CV04', label: 'Open nine', defaultOn: false },
  { group: 'Character variants', flag: 'CV05', label: 'Lower-case L with tail', defaultOn: false },
  { group: 'Character variants', flag: 'CV06', label: 'r with curved tail', defaultOn: false },
  { group: 'Character variants', flag: 'CV07', label: 'Alternate German double s', defaultOn: false },
  { group: 'Character variants', flag: 'CV08', label: 'Upper-case i with serif', defaultOn: false },
  { group: 'Character variants', flag: 'CV09', label: 'Flat-top three', defaultOn: false },
  { group: 'Character variants', flag: 'CV10', label: 'Capital G with spur', defaultOn: false },
  { group: 'Character variants', flag: 'CV11', label: 'Single-storey a', defaultOn: false },

  // ─── Horizontal spacing ─────────────────────────────────────────────────
  { group: 'Horizontal spacing', flag: 'KERN', label: 'Kerning pairs', defaultOn: true },  // ← FIGMA DEFAULT ON

  // ─── More features ──────────────────────────────────────────────────────
  { group: 'More features', flag: 'DNOM', label: 'Fraction denominators', defaultOn: false },
  { group: 'More features', flag: 'NUMR', label: 'Fraction numerators', defaultOn: false },
  { group: 'More features', flag: 'SINF', label: 'Scientific inferiors', defaultOn: false },
] as const;
```

### Toggle Row Component (Details tab pattern)
```tsx
// Each row: Label on left, [—] [✓] toggle pair on right
// [—] = Minus icon, inactive state
// [✓] = Check icon, active state
// Active button has filled background (e.g. bg-blue-500 or filled accent color)
<div className="flex items-center justify-between py-1">
  <span className="text-xs text-neutral-400">{label}</span>
  <div className="flex gap-0.5">
    <button className={cn("w-6 h-6 rounded", !enabled && "bg-neutral-700")}><Minus size={10}/></button>
    <button className={cn("w-6 h-6 rounded", enabled && "bg-blue-500")}><Check size={10}/></button>
  </div>
</div>
```

---

## Phase 3 — Font Style Dynamic List + Remove Italic Button
**Files**: `typography/font-style-picker.tsx`, `typography/index.tsx`
**Effort**: Medium | **Impact**: ★★★

### Behavior Spec
- **Remove** the `Italic` (`I`) toggle button from the main typography section
- **Font style dropdown** queries `getFontStyles(fontFamily)` from font manifest
- Renders as **dark popover** (`bg-neutral-900 text-white shadow-xl rounded-lg`), min-width: 160px
- Each option: weight name in plain text. Selected has `<Check size={12} />` before the name.
- On select: update `fontStyleName`, derive `fontWeight` + `fontStyle` from the name:
  ```typescript
  function parseFontStyleName(name: string): { fontWeight: number; fontStyle: 'normal'|'italic' } {
    const italic = /italic/i.test(name);
    let weight = 400;
    if (/thin/i.test(name)) weight = 100;
    else if (/extra.?light|ultra.?light/i.test(name)) weight = 200;
    else if (/light/i.test(name)) weight = 300;
    else if (/medium/i.test(name)) weight = 500;
    else if (/semi.?bold|demi/i.test(name)) weight = 600;
    else if (/extra.?bold|ultra.?bold/i.test(name)) weight = 800;
    else if (/black|heavy/i.test(name)) weight = 900;
    else if (/bold/i.test(name)) weight = 700;
    return { fontWeight: weight, fontStyle: italic ? 'italic' : 'normal' };
  }
  ```

---

## Phase 4 — Main Panel Input Refines
**Files**: `typography/line-height-input.tsx`, `typography/letter-spacing-input.tsx`, `typography/font-size-combobox.tsx`, `typography/index.tsx`
**Effort**: Small | **Impact**: ★★★

### Line Height — New Unified Behavior
```
Input value logic (matching Figma exactly):
- lineHeight='auto'  → display "Auto", placeholder = computed px value (fontSize * 1.2)
- lineHeight=px val  → display "18" (number only, no unit shown)
- lineHeight=% val   → display "150%"

Parse on commit:
- empty string       → set auto
- "auto" (case insensitive) → set auto
- "150%"             → set { value: 150, unit: '%' }
- "18"               → set { value: 18, unit: 'px' }
- "18px"             → set { value: 18, unit: 'px' }
```

**Remove the unit cycle badge** — no more clicking a badge to toggle auto/px/%. It's all inferred from input.

### Letter Spacing — Fix Default Unit
```
Default: 0% (not 0px)
Display: always show unit suffix "%" or "px"
Parse: "2%" → letterSpacing=2, unit='%' | "4px" → letterSpacing=4, unit='px'
```

### Font Size Combobox
```tsx
// Show chevron button that opens dark dropdown with common sizes:
const COMMON_FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 120];

// Display: 6 sizes centered around current value
function getPresetSizes(current: number): number[] {
  const idx = COMMON_FONT_SIZES.findIndex(s => s >= current);
  const start = Math.max(0, idx - 3);
  return COMMON_FONT_SIZES.slice(start, start + 6);
}
```

### Alignment — Remove Justify from Main Panel
```tsx
// Main panel: only 3 buttons
const H_ALIGNMENTS = ['left', 'center', 'right'] as const;  // ← remove 'justify'

// Justify moved to Type Settings > Basics > Alignment (all 4 options there)
```

---

## Phase 5 — OpenType Rendering + New Properties
**Files**: `src/components/editor/text-renderer.tsx`, `src/components/editor/render-utils.ts`
**Effort**: Small | **Impact**: ★★

### New CSS Mappings in `text-renderer.tsx`

```typescript
// ─── numberPosition ────────────────────────────────────────────────────────
if (node.numberPosition === 'superscript') {
  style.verticalAlign = 'super';
  style.fontSize = `${(node.fontSize || 16) * 0.65}px`;
}
if (node.numberPosition === 'subscript') {
  style.verticalAlign = 'sub';
  style.fontSize = `${(node.fontSize || 16) * 0.65}px`;
}

// ─── numberStyle → merge into opentypeFlags ────────────────────────────────
const numberStyleFlags: Record<string, 0|1> = {};
if (node.numberStyle === 'lining-proportional') {
  numberStyleFlags['lnum'] = 1; numberStyleFlags['pnum'] = 1;
}
if (node.numberStyle === 'lining-tabular') {
  numberStyleFlags['lnum'] = 1; numberStyleFlags['tnum'] = 1;
}

// ─── textTruncation (separate from autoResize) ─────────────────────────────
if (node.textTruncation === 'ending' && node.autoResize === 'none') {
  style.overflow = 'hidden';
  if (node.maxLines && node.maxLines === 1) {
    style.whiteSpace = 'nowrap';
    style.textOverflow = 'ellipsis';
  } else if (node.maxLines && node.maxLines > 1) {
    style.display = '-webkit-box';
    (style as any).WebkitLineClamp = node.maxLines;
    (style as any).WebkitBoxOrient = 'vertical';
    style.overflow = 'hidden';
  }
}

// ─── variableFontAxes → font-variation-settings ────────────────────────────
if (node.variableFontAxes && Object.keys(node.variableFontAxes).length > 0) {
  style.fontVariationSettings = Object.entries(node.variableFontAxes)
    .map(([axis, val]) => `"${axis.toLowerCase()}" ${val}`)
    .join(', ');
}

// ─── Merge all opentypeFlags (node + derived from numberStyle) ─────────────
const allFlags = { ...numberStyleFlags, ...(node.opentypeFlags || {}) };
if (Object.keys(allFlags).length > 0) {
  style.fontFeatureSettings = Object.entries(allFlags)
    .map(([tag, val]) => `"${tag.toLowerCase()}" ${val}`)
    .join(', ');
}
```

---

## Phase 6 — Variable Font Axes (Post-MVP)
**Files**: `typography/type-settings-variable.tsx`, `src/lib/fonts/variable-fonts.ts`

- Only show Variable tab if `fontMeta.variable === true` for selected font
- Axis sliders: `input[type=range]` min/max from axis range in font manifest
- Named stops on weight slider (Inter: 100, 200, 300, 400, 500, 600, 700, 800, 900)
- Stores in `variableFontAxes` on `TextNode`

---

## Phase 7 — Export + Parser Updates (After All Above)

### `src/lib/export/class-builder.ts`
- Add `fontStyleName` → emit as `font-[style]` or raw CSS `font-weight` + `font-style`
- Add `textTruncation='ending'` → emit `line-clamp-{n}` Tailwind class
- Add `numberPosition` → emit `align-[sub|super]`

### `src/lib/parser/class-parser.ts`
- Add parsing of `line-clamp-*` → `textTruncation='ending'` + `maxLines`
- Add parsing of `font-[style]` → `fontStyleName`

---

## Implementation Checklist

### Phase 1 (Font Family Dialog + Fonts)
- [ ] Create `src/lib/fonts/font-manifest.json` with ~300 fonts + styles
- [ ] Create `src/lib/fonts/google-fonts.ts` (loadFont, searchFonts, getFontStyles, getRecentFonts)
- [ ] Create `typography/font-family-picker.tsx` (dialog, search, virtualized list, live preview)
- [ ] Wire trigger in `typography/index.tsx` (click font family row → openFontPicker)
- [ ] Add `fontPickerOpen`, `fontPickerNodeId` to store
- [ ] Test: search, live preview, Escape revert, Enter commit

### Phase 2 (Type Settings Overlay)
- [ ] Create `typography/type-settings-overlay.tsx` (draggable float, 3 tabs, preview box, X close)
- [ ] Create `typography/type-settings-basics.tsx` (all Basics tab controls wired)
- [ ] Create `typography/type-settings-details.tsx` (OpenType toggle groups, scrollable)
- [ ] Add `typeSettingsOpen`, `typeSettingsTab` to store
- [ ] Move Type Settings button from inline toggle → open overlay action
- [ ] Move Justify from main alignment group → Basics tab only
- [ ] Test: open/close, drag, tab switching, all controls update node

### Phase 3 (Font Style Dynamic)
- [ ] Create `typography/font-style-picker.tsx` (dark popover, dynamic from manifest)
- [ ] Remove `Italic` button from `typography/index.tsx`
- [ ] Add `fontStyleName` to `TextNode` type + `createText()` defaults
- [ ] Implement `parseFontStyleName()` util
- [ ] Wire: selecting style → updates fontStyleName + derives fontWeight + fontStyle
- [ ] Test: Roboto shows 12 styles including Italic variants, Inter shows no Italic

### Phase 4 (Input Refinements)
- [ ] Create `typography/line-height-input.tsx` (Auto/px/% unified, no badge toggle)
- [ ] Create `typography/letter-spacing-input.tsx` (% default, px suffix override)
- [ ] Create `typography/font-size-combobox.tsx` (dark dropdown presets + free-type)
- [ ] Update `typography/index.tsx` to use all new inputs
- [ ] Update `createText()` default: `letterSpacingUnit: '%'`
- [ ] Test: "Auto" shows, type number sets px, type "150%" sets %, Escape reverts

### Phase 5 (Rendering + New Props)
- [ ] Add `listSpacing`, `textTruncation`, `maxLines`, `numberStyle`, `numberPosition`, `variableFontAxes`, `fontStyleName` to `TextNode` in `canvas.ts`
- [ ] Update `text-renderer.tsx` with new CSS mappings
- [ ] Add icons to `typography/icons/` dir
- [ ] Test: OpenType flags render in browser, variable font axes apply, truncation works

### Phase 6 (Variable Fonts — Post-MVP)
- [ ] Create `typography/type-settings-variable.tsx`
- [ ] Create `src/lib/fonts/variable-fonts.ts`
- [ ] Wire to Variable tab in type-settings-overlay

### Phase 7 (Export/Parser)
- [ ] Update `class-builder.ts` for new properties
- [ ] Update `class-parser.ts` for new properties
- [ ] Regression test: round-trip HTML → nodes → HTML
