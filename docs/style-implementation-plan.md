d# Design System Panel — Variables & Styles Implementation Plan

## Context

**Problem**: The app has a working theme system under the hood (variable table, theme resolver, diamond badges, auto-detach), but users can't _see_ or _manage_ the design system. The diamond icon shows a tooltip ("Linked to: accent"), but there's no browsable panel where users can:
- View all their design tokens organized by collection
- Edit variable values
- Pick a variable to bind to a property
- Understand what their design system actually contains

**Inspiration**: Figma splits this into **Variables** (single values with modes, aliasing, scoping) and **Styles** (bundles of properties).

**Outcome**: A Design System panel that lets users see, browse, edit, and apply their design tokens — making the invisible system visible.

---

## Key Decision: Variables, Not Styles

**Variables** is the right choice because:

1. We already HAVE a variable system (`VariableTable` with 24 keys, light/dark modes, resolution pipeline) — it's just invisible
2. Variables map directly to our existing `*Ref` / `*Detached` pattern on nodes
3. Variables cover the broadest use case: colors, spacing, typography sizes, radii, shadows
4. Styles (bundled presets) would require an entirely new data model and multi-property binding mechanism

**What we'll build**: A Variables Panel that surfaces the existing `VariableTable` and lets users browse, edit, and apply variables to node properties — inspired by Figma's Variables modal and the Relume Kit's structure.

---

## Architecture Overview

### Existing Data Model (unchanged)

```typescript
type VariableTable = Record<string, VariableValue>
interface VariableValue { light: string; dark: string }
```

Nodes store `*Ref` and `*Detached` fields. `conceptToVariableTable()` converts Concept → flat table. Theme-resolver resolves refs at render time. **None of this changes.**

### New: Collection & Group Metadata Layer

Added to `src/lib/theme/variable-table.ts` (Phase 1 — COMPLETE):

```typescript
interface VariableCollection {
  id: string
  name: string
  icon: string               // lucide icon name
  groups: VariableGroup[]
}

interface VariableGroup {
  id: string
  name: string
  variableKeys: VariableKey[]
}
```

### Collections Map (our 24 keys)

| Collection | Group | Variables |
|---|---|---|
| **Colors** | Backgrounds | `bg/primary`, `bg/secondary` |
| | Text | `text/primary`, `text/secondary` |
| | Accent | `accent`, `text/on-accent` |
| | Border | `border` |
| **Typography** | Font Families | `font/heading`, `font/body` |
| | Font Weights | `fontWeight/heading`, `fontWeight/body` |
| | Font Sizes | `fontSize/h1`, `fontSize/h2`, `fontSize/body` |
| **Spacing** | Spacing | `spacing/sm`, `spacing/md`, `spacing/lg`, `spacing/gap` |
| | Radius | `radius/sm`, `radius/md`, `radius/lg` |
| **Effects** | Shadows | `shadow/sm`, `shadow/md` |

### Variable Scoping Map

Controls which variables appear in pickers for each property type (like Figma's VariableScope):

```typescript
const VARIABLE_SCOPES = {
  'fill.color':       ['bg/primary', 'bg/secondary', 'accent', 'text/primary', 'text/secondary', 'text/on-accent', 'border'],
  'text.color':       ['text/primary', 'text/secondary', 'text/on-accent', 'accent'],
  'text.fontFamily':  ['font/heading', 'font/body'],
  'text.fontSize':    ['fontSize/h1', 'fontSize/h2', 'fontSize/body'],
  'text.fontWeight':  ['fontWeight/heading', 'fontWeight/body'],
  'shadow.color':     ['accent', 'text/primary', 'border'],
  'borderRadius':     ['radius/sm', 'radius/md', 'radius/lg'],
  'padding':          ['spacing/sm', 'spacing/md', 'spacing/lg'],
  'gap':              ['spacing/gap', 'spacing/sm', 'spacing/md', 'spacing/lg'],
}
```

---

## Implementation Phases

### Phase 1: Organizational Data Model ✅ COMPLETE
**File**: `src/lib/theme/variable-table.ts`

- Added `VariableCollection`, `VariableGroup`, `VariableValueType`, `VariableMeta` interfaces
- Added `VARIABLE_META` registry (display names + value types for all 24 keys)
- Added `STANDARD_COLLECTIONS` constant (4 collections with groups)
- Added `getVariableDisplayName()`, `getVariableValueType()`, `getVariableMeta()`, `getCollectionForKey()` helpers
- Added `VARIABLE_SCOPES` map and `getScopedVariables()` function
- **Zero changes** to existing resolution code or VariableTable

---

### Phase 2: Variables Panel Component
**File**: `src/components/editor/properties-panel/variables-panel.tsx` (NEW)

A browsable panel showing all 24 variables organized by collection:

1. **Collection tabs** — Colors, Typography, Spacing, Effects (clickable to switch views)
2. **Variable table** — rows per variable with:
   - Name (with group section dividers)
   - Light value (editable — color swatch, number input, or text)
   - Dark value (editable — same type)
3. **Inline editing**: Color → opens ColorPicker; Number/Font → direct input
4. **Live preview**: Edits immediately update `VariableTable` in style-guide-store → all linked nodes re-resolve
5. **Visual indicators**: Color swatches for colors, numeric values, font names for fonts, mini shadow preview

---

### Phase 3: Variable Picker Popover
**File**: `src/components/editor/properties-panel/variable-picker.tsx` (NEW)

Opened when user clicks the diamond icon or a "link variable" button on any property:

1. Shows variables **scoped to that property type** (uses `VARIABLE_SCOPES` map)
2. Each row shows: variable name, current resolved value, color swatch (if color)
3. Clicking a variable **binds it** to the property (sets `*Ref` on the node)
4. "Detach" option at top to remove the binding

---

### Phase 4: Integrate into Properties Panel
**Files**:
- `src/components/editor/properties-panel/theme-link-badge.tsx` — Make clickable → opens VariablePicker
- `src/components/editor/properties-panel/fill-section.tsx` — Add diamond button next to each color swatch
- `src/components/editor/properties-panel/typography-section.tsx` — Add diamond buttons next to font fields
- `src/components/editor/properties-panel/effects-section.tsx` — Add diamond button next to shadow color

Changes:
1. **ThemeLinkBadge**: Add `onOpen?: () => void` prop, make it a button, open VariablePicker on click
2. **Property sections**: Add `propertyType` strings to pass to VariablePicker for scoping
3. **Bound state**: Show variable name as a small chip next to the resolved value

---

### Phase 5: Integrate Panel into Workspace
**Files**:
- `src/components/workspace/theme-tab.tsx` — Add Variables section with collection counts
- OR `src/components/workspace/right-panel.tsx` — Add Variables tab

Options:
- **Option A** (simpler): Add a collapsible "Variables" section inside the Theme tab showing all 4 collections inline
- **Option B** (fuller): Add a third "Variables" tab to the right panel (alongside Design/Theme)

---

## What We're NOT Building (Scope Boundaries)

- **Figma Styles** (Text Styles, Effect Styles, Color Styles) — separate feature for later
- **Custom variables** — users can't add their own variable keys yet (24 standard keys are sufficient for v1)
- **Aliasing UI** — variables are already semantic internally, no user-facing alias chains needed
- **Mode creation** — light/dark already supported, no custom modes yet
- **Variable scoping UI** — scoping is hardcoded in `VARIABLE_SCOPES`, not user-configurable

---

## Files Summary

| File | Action | Purpose |
|---|---|---|
| `src/lib/theme/variable-table.ts` | ✅ Modified | Collection/group types + constants |
| `src/components/editor/properties-panel/variables-panel.tsx` | Create | Main variables browsing panel |
| `src/components/editor/properties-panel/variable-picker.tsx` | Create | Popover for binding variables to properties |
| `src/components/editor/properties-panel/theme-link-badge.tsx` | Modify | Make clickable → opens variable picker |
| `src/components/editor/properties-panel/fill-section.tsx` | Modify | Add variable binding buttons |
| `src/components/editor/properties-panel/typography-section.tsx` | Modify | Add variable binding buttons |
| `src/components/editor/properties-panel/effects-section.tsx` | Modify | Add variable binding buttons |
| `src/components/workspace/theme-tab.tsx` | Modify | Integrate variables panel |

---

## Verification Checklist

- [ ] Variables Panel: Open Theme tab → see all 24 variables in 4 collections with light/dark columns
- [ ] Inline Edit: Click a color swatch → color picker opens → edit → linked canvas nodes update immediately
- [ ] Variable Picker: Select a frame → Fill section → click diamond → picker shows Color variables → select one → fill binds → badge appears
- [ ] Detach: Click bound badge → picker opens → "Detach" → binding removed → badge disappears
- [ ] Mode switching: Toggle light/dark in Theme tab → all bound properties update
- [ ] Scope filtering: Font size field picker shows only fontSize variables (not colors or spacing)
