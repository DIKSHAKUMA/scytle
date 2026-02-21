# Style Guide Editor — Feature Summary

> Summary of the Style Guide Editor feature for Scytle V2 wireframes.  
> Deep implementation details live in `WIREFRAME-V2-ARCHITECTURE.md` §5.  
> We'll do focused deep-dives per panel when we build them.

---

## What It Is

A left-sidebar panel that controls **global design tokens** for the entire wireframe. Changing any token instantly repaints all sections — no per-component updates needed. Has 4 sub-panels: **Colors**, **Typography**, **UI Styling**, **Concepts**.

---

## What's Already Built ✅

### Token System (`src/lib/designs/v2/tokens/`)
- **44 CSS custom properties** (`--sg-*`) covering colors, typography, borders, buttons, cards, scheme
- `TokenProvider` wrapper applies computed CSS to the canvas
- `SectionTokenProvider` handles per-section color scheme overrides
- All blocks already read tokens via `var(--sg-*)` — zero hardcoded values

### Curated Libraries
- **~60 color palettes** across 8 categories (Warm, Cool, Earth, Vibrant, Pastel, Monochrome, Tech, Nature) in `palettes.ts`
- **~80 font pairs** across 5 categories (Modern, Classic, Creative, Clean, Bold) in `font-pairs.ts`

### Style Guide Store (`src/store/style-guide-store.ts` — 562 lines)
Every action is fully implemented with Zustand + immer:

| Group | Actions |
|-------|---------|
| **Lifecycle** | `loadData`, `resetToDefaults`, `exportData` |
| **Concepts** | `getActiveConcept`, `switchConcept`, `createConcept`, `duplicateConcept`, `deleteConcept`, `renameConcept` |
| **Colors** | `toggleMode`, `setMode`, `applyPalette`, `shuffleColors`, `updateAccent`, `addAccent`, `removeAccent`, `setMainAccent` |
| **Typography** | `applyFontPair`, `shuffleTypography`, `setHeadingFont`, `setBodyFont`, `setHeadingWeight`, `setBodyWeight`, `setSizeScale`, `setLetterSpacingStyle` |
| **UI Styling** | `setButtonStyle`, `setButtonRadius`, `setCardStyle`, `setCardRadius`, `setImageRadius`, `shuffleUI` |
| **Section Schemes** | `setSectionScheme`, `getSectionScheme`, `getSectionSchemeCSS`, `shuffleSectionScheme`, `clearAllSectionSchemes` |

### Token Types (`src/lib/designs/v2/tokens/index.ts`)
- `ColorTokens` — mode, backgrounds, text, borders, neutrals, accents
- `TypographyTokens` — heading/body font, weights, sizeScale, letterSpacingStyle
- `UITokens` — buttonStyle, buttonRadius, cardStyle, cardRadius, imageRadius
- `Concept` — complete snapshot (colors + typography + UI)
- `StyleGuideData` — activeConceptId + concepts[] + sectionSchemeOverrides
- `ColorScheme` — `'light' | 'dark' | 'accent'` (per-section)

---

## What Needs to Be Built ❌

**Zero UI panel components exist.** The store is 100% done — we just need the panels that call it.

### Panel 1: Colors (Step 6 — ~2-3 sessions)
- Light/Dark mode toggle
- Shuffle button (random palette from curated library)
- Neutral swatch strip (auto-derived from neutralBase)
- Accent color cards (name, hex, shade slider, main badge)
- Add/remove accent buttons
- Per-section scheme override bar (light/dark/accent per section)

### Panel 2: Typography (Step 7 — ~1-2 sessions)
- Size scale selector (Small / Regular / Large)
- Heading weight selector
- Letter spacing style selector (default / tight / wide)
- Shuffle button (random font pair)
- Heading font preview + picker
- Body font preview + picker
- **Google Fonts dynamic loading** (`loadGoogleFonts()` exists in font-pairs.ts but no `<link>` injection yet)
- Font browser overlay (search, browse, liked fonts — stretch goal)

### Panel 3: UI Styling (Step 8 — ~1-2 sessions)
- **Buttons & Forms sub-panel**
  - Corner radius presets (sharp → slight → medium → large → pill)
  - Style selector (solid / outline / ghost / brick / gradient) with live preview
  - Primary + secondary button previews
- **Cards & Images sub-panel**
  - Corner radius presets
  - Style selector (default / outlined / flat) with live preview
- Shuffle button (random style + radius combo)

### Panel 4: Concepts (Step 9 — ~1 session)
- Concept switcher dropdown at top of style guide panel
- Create new concept (clones active)
- Duplicate / delete / rename
- Same wireframe → different visual treatment per concept
- All concepts exported when doing Figma export (future)

### Integration Work
- **Panel host**: Style guide panel inside left sidebar (tab or toggle)
- **Google Fonts `<link>` injection**: Dynamic loading when font pair changes
- **Persistence**: Wire `exportData()` → Appwrite `STYLE_GUIDES` collection on autosave
- **Keyboard shortcuts**: `C` for shuffle colors, `T` for shuffle typography (stretch)

---

## Build Order

| Order | Panel | Store Ready? | Notes |
|-------|-------|:---:|-------|
| 1 | **Colors** | ✅ | Biggest visual impact — dark mode toggle repaints everything |
| 2 | **Typography** | ✅ | Needs Google Fonts loading mechanism |
| 3 | **UI Styling** | ✅ | Buttons + Cards, relatively straightforward |
| 4 | **Concepts** | ✅ | Lightweight — just CRUD UI + switcher dropdown |

> **Strategy**: Build each panel → test with hero layout (hero-44 / hero-57) → confirm tokens flow correctly → move to next panel. Scale layout categories *after* style guide is fully working.

---

## Key Files Reference

| File | What | LOC |
|------|------|-----|
| `src/store/style-guide-store.ts` | Zustand store (all actions) | 562 |
| `src/lib/designs/v2/tokens/index.ts` | Type definitions | 256 |
| `src/lib/designs/v2/tokens/defaults.ts` | Default values + `computeTokenCSS()` | 303 |
| `src/lib/designs/v2/tokens/palettes.ts` | ~60 curated color palettes | 658 |
| `src/lib/designs/v2/tokens/font-pairs.ts` | ~80 curated font pairs + `loadGoogleFonts()` | 645 |
| `src/lib/designs/v2/tokens/provider.tsx` | `TokenProvider` + `SectionTokenProvider` | ~140 |
| `docs/WIREFRAME-V2-ARCHITECTURE.md` §5 | Full spec (panel layouts, token tables, wireframes) | — |