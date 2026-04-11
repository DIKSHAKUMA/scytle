# Theme Tab — Problems, Root Causes & Research

> Captured: April 2026. To be fixed in a future sprint.

---

## The 5 Problems

### Problem 1: Changing palette breaks ALL designs

**What happens:**
- User generates Design A (blue palette) → linked to `accent` variable
- User generates Design B (orange palette) → SAME `accent` variable
- User changes palette in theme tab → accent changes → BOTH designs change

**Root cause:** There's ONE global `activeConceptId` → ONE variable table → ALL designs share the SAME `accent`, `bg/primary`, etc. There's no per-design or per-frame color isolation.

**Code:**
- `style-guide-store.ts` line 192-196 — `recomputeVariableTable()` always uses the single active concept
- `style-guide-store.ts` line 312-319 — `switchConcept()` is a global switch affecting everything
- Every node on the canvas resolves against the same table

---

### Problem 2: Font sizes/spacing not responsive

**What happens:**
- AI generates desktop page → h1 = 48px, padding = 120px
- User wants mobile version → h1 should be 32px, padding = 40px
- Theme tab only has sizeScale (0.875 / 1 / 1.125)
- Changing it scales EVERYTHING uniformly → can't have desktop AND mobile on same canvas

**Root cause:** Font sizes are derived from a single scalar: `48 * sizeScale`. Spacing is hardcoded (`16, 24, 48`). No breakpoint/mode system exists.

**Code:**
- `variable-table.ts` lines 81-89 — `deriveFontSizes()` uses one multiplier for all headings
- `variable-table.ts` lines 153-156 — spacing values are literal constants
- `style-guide-store.ts` line 574-581 — `setSizeScale()` updates one scalar for entire project

---

### Problem 3 & 4: Radius coupling (button ↔ card ↔ image)

**What happens:**
```
User sets buttonRadius=8, cardRadius=12
deriveRadiusScale(8, 12) → sm=8, md=12, lg=24

User changes cardRadius to 16:
deriveRadiusScale(8, 16) → sm=8, md=16, lg=32  ← section containers also changed!

Image radius? Stored in ui.imageRadius but NEVER USED in variable table.
No 'radius/image' variable exists. Images get closest match from sm/md/lg.
```

**Root cause:** `deriveRadiusScale()` mathematically couples button and card radius. Only 3 radius variables exist (`radius/sm`, `radius/md`, `radius/lg`). Image radius is stored but ignored.

**Code:**
- `variable-table.ts` lines 58-65 — the coupling formula
- `variable-table.ts` line 106 — `ui.imageRadius` is never passed to anything
- `relink-nodes.ts` lines 380-390 — `closestRadiusRef()` only knows about 3 radius variables
- `variable-table.ts` lines 29-45 — `VARIABLE_KEYS` has no `radius/image`

---

### Problem 5: Color accessibility broken

**What happens:**
- User picks bright yellow accent (#FFFF00)
- `textOnAccent` is hardcoded to `#ffffff` (white)
- White text on yellow = invisible
- No warning, no auto-correction

**Root cause:** Zero contrast validation. `textOnAccent` is hardcoded to `#ffffff` in defaults. No WCAG ratio calculation anywhere. `updateAccent()` does `Object.assign(accent, updates)` with no checks.

**Code:**
- `tokens/defaults.ts` lines 36-37 — hardcoded white
- `style-guide-store.ts` line 462 — no validation on color change
- `theme-resolver.ts` — `resolveColor()` just returns hex, no contrast check

---

## How Figma Handles This

### Variable Architecture: 3-Tier System

```
PRIMITIVES (raw values, hidden from users)
├── blue/500: #3B82F6
├── blue/600: #2563EB
├── gray/50: #F9FAFB
├── gray/900: #111827
├── spacing/4: 16
├── spacing/8: 32
└── radius/2: 8

SEMANTIC (role-based, what users interact with)
├── color/surface/primary    → aliases blue/500 in Brand-A, green/500 in Brand-B
├── color/text/primary       → aliases gray/900 in light, gray/50 in dark
├── radius/button            → separate variable, scoped to CORNER_RADIUS
├── radius/card              → separate variable, scoped to CORNER_RADIUS
├── radius/image             → separate variable, scoped to CORNER_RADIUS
└── spacing/section          → different value per Mobile/Desktop mode

COMPONENT (optional, enterprise)
├── button/primary/background
└── card/border-color
```

### Key Figma Features That Solve These Problems:

**1. Modes per collection (solves Problem 1 & 2):**
- A single variable can have values for `Light`, `Dark`, `Mobile`, `Desktop`, `Brand-A`, `Brand-B`
- Modes are set **per-frame** — different frames can have different modes
- Mode inheritance: children inherit parent's mode automatically
- So Design A can be in "Brand-A" mode, Design B in "Brand-B" mode — same canvas, different colors

**2. Variable Scoping (solves Problem 3 & 4):**
- Number variables can be scoped to ONLY show in specific pickers:
  - `CORNER_RADIUS` — only appears in radius fields
  - `GAP` — only in gap/spacing fields
  - `FONT_SIZE` — only in font size fields
- So `radius/button`, `radius/card`, `radius/image` are three **completely independent** variables

**3. Detach/Bind per node (solves Problem 1):**
- Any node can **detach** from a variable → value becomes hardcoded
- Or **bind** to a different variable
- This is per-node, not global

---

## How Pencil.dev Handles This

### Variables with Multi-Axis Themes

```json
"variables": {
  "color.background": {
    "type": "color",
    "value": [
      { "value": "#FFFFFF", "theme": { "mode": "light" } },
      { "value": "#1A1A2E", "theme": { "mode": "dark" } }
    ]
  },
  "spacing.container": {
    "type": "number",
    "value": [
      { "value": 48, "theme": { "density": "comfortable" } },
      { "value": 24, "theme": { "density": "compact" } }
    ]
  }
}
```

### Key Pencil Features:

**1. Theme context per frame (solves Problem 1):**
```json
{ "id": "landing-dark", "theme": { "mode": "dark" }, "fill": "$color.background" }
{ "id": "landing-light", "theme": { "mode": "light" }, "fill": "$color.background" }
```
- Same variable, different theme context → different resolved values
- Theme inherits down the tree

**2. Flat naming with dot-paths (simpler than Figma collections):**
- `radius.button`, `radius.card`, `radius.image` — completely independent
- No mathematical coupling, no derivation formulas

**3. Three-tier detachment:**
- Variable detach → property becomes hardcoded
- Property override on instance → skipped during sync
- Full component detach → breaks all connections

**4. No built-in accessibility** — same gap as Scytle

---

## Summary: What's Architecturally Wrong in Scytle

| What Figma/Pencil Have | What Scytle Has | Problem |
|---|---|---|
| **Modes per frame** (light/dark/brand per section) | **One global mode** for entire canvas | Problem 1 |
| **Independent radius variables** (button/card/image) | **3 coupled variables** derived from 2 inputs | Problem 3 & 4 |
| **Responsive modes** (mobile/desktop values per variable) | **Single scalar** sizeScale for all fonts | Problem 2 |
| **Variable scoping** (restrict where vars appear) | **No scoping** — any ref can go anywhere | Problem 3 & 4 |
| **Contrast validation** or smart defaults | **Hardcoded** textOnAccent = white | Problem 5 |
| **Per-node bind/detach** | **Global concept switch** affecting everything | Problem 1 |

The core architectural issue is: **Scytle treats the variable table as a single global palette, but it should be a multi-mode system where different frames can resolve the same variable names to different values.**

---

## Fix Applied: AI Output Protection (April 2026)

Before tackling the theme tab redesign, we applied a critical fix in `domparser.ts`:

**`detachAIGeneratedValues()`** — walks all AI-generated nodes and sets detached flags (`fill.detached`, `paddingDetached`, `colorDetached`, `fontFamilyDetached`, etc.) so that `relinkNodes()` doesn't force-fit AI's intentional color/spacing/font choices into the limited theme buckets.

This ensures AI output looks correct on the canvas. The theme tab redesign is the next step.
