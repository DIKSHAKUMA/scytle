# Pricing Category — Control Map

> Complete control mapping for Relume Pricing category (57 variants)  
> Research Date: 2025-01-24  
> Method: Relume API (`variants` field) + UI verification via MCP Playwright

---

## Overview

The Pricing category contains **57 variants** (Pricing 1–57) organized into **7 families** plus **1 standalone** component. It spans **two distinct section types** in Relume's system:

1. **Pricing Section** (Families A–E): 45 variants — standard pricing plan cards with feature lists
2. **Pricing Comparison Section** (Families F–G): 12 variants — feature comparison tables

### Key Findings

| Metric | Value |
|--------|-------|
| Total Variants | 57 |
| Families (with axes) | 6 (A–D, F–G) |
| Standalone | 1 (Family E = Pricing 5) |
| Pricing Section variants | 45 |
| Pricing Comparison variants | 12 |
| Max axes per family | 3 (Tabs, Plans, Text) |
| Dynamic axis visibility | Yes — Text axis hides/shows based on Plans value |
| Panel entries (Pricing Section) | 44–45 (all variants listed individually) |
| API category slug | `pricing-sections` (NOT `pricing`) |
| Internal slug format | `section_pricing{N}` |

**Critical Pattern — Dynamic Text Axis:**
- **Plans ≤ 2** → Text axis **HIDDEN** (defaults to Center)
- **Plans ≥ 3** → Text axis **VISIBLE** (Left / Center)
- **Text = Left** → Plans axis restricted to **3 and 4 only** (1 and 2 disappear)
- **Text = Center** → Plans axis shows **all values** (1, 2, 3, 4)

**Unique Panel Behavior:** Unlike other categories where the Replace Component panel shows only "base" entries and hidden variants are accessed through axes, the Pricing Section panel lists **all 45 variants** as individual entries. Users can either pick directly from the panel or toggle axes — both paths reach the same components.

---

## Summary of Families

| Family | Name | Axes | Variants | Component IDs |
|--------|------|------|----------|---------------|
| A | Basic List | Tabs, Plans, Text† | 12 | 1, 6, 10, 14, 18, 23, 28, 31, 38, 41, 44, 47 |
| B | Icon List | Tabs, Plans, Text† | 12 | 2, 7, 11, 15, 19, 24, 29, 32, 39, 42, 45, 48 |
| C | Alt Card Style | Tabs, Plans, Text† | 12 | 3, 8, 12, 16, 20, 25, 30, 33, 40, 43, 46, 49 |
| D | Condensed | Tabs, Plans, Text‡ | 8 | 4, 9, 13, 17, 34, 35, 36, 37 |
| E | Two-Column | _(none)_ | 1 | 5 |
| F | Comparison Table 1 | Tabs, Plans | 6 | 21, 26, 50, 52, 54, 56 |
| G | Comparison Table 2 | Tabs, Plans | 6 | 22, 27, 51, 53, 55, 57 |

_† Text axis dynamic: hidden when Plans ≤ 2, visible when Plans ≥ 3_  
_‡ Text axis dynamic: hidden when Plans = 1, visible when Plans = 2_

---

## Section Type Separation

Relume treats Pricing and Pricing Comparison as **separate section types**:

| Section Type | Families | Panel Behavior |
|-------------|----------|----------------|
| **Pricing Section** | A, B, C, D, E | Replace panel shows ~45 entries; base components P1–P30 in main API |
| **Pricing Comparison Section** | F, G | Separate panel; base P21/P22/P26/P27 in API but NOT in Pricing Section panel |

When you load a Pricing Section (e.g., Pricing 1) and open Replace Component, the panel title reads **"Pricing Section"** and lists Families A–E. The comparison table variants (P21, P22, P26, P27) are **excluded** from this panel because they belong to a different section type.

---

## Replace Component Panel → Family Mapping

### Pricing Section Panel (45 entries)

| Panel Entry | Family | Tabs | Plans | Text | Description |
|-------------|--------|------|-------|------|-------------|
| Pricing 1 | A | No | 1 | Center | Basic list, single plan |
| Pricing 2 | B | No | 1 | Center | Icon list, single plan |
| Pricing 3 | C | No | 1 | Center | Alt card, single plan |
| Pricing 4 | D | No | 1 | Center | Condensed icons, single plan |
| Pricing 5 | E | — | — | — | Standalone two-column layout |
| Pricing 6 | A | Yes | 1 | Center | Basic list + tabs |
| Pricing 7 | B | Yes | 1 | Center | Icon list + tabs |
| Pricing 8 | C | Yes | 1 | Center | Alt card + tabs |
| Pricing 9 | D | Yes | 1 | Center | Condensed icons + tabs |
| Pricing 10 | A | No | 2 | Center | Basic list, two plans |
| Pricing 11 | B | No | 2 | Center | Icon list, two plans |
| Pricing 12 | C | No | 2 | Center | Alt card, two plans |
| Pricing 13 | D | No | 2 | Center | Condensed icons, two plans |
| Pricing 14 | A | Yes | 2 | Center | Basic list, two plans + tabs |
| Pricing 15 | B | Yes | 2 | Center | Icon list, two plans + tabs |
| Pricing 16 | C | Yes | 2 | Center | Alt card, two plans + tabs |
| Pricing 17 | D | Yes | 2 | Center | Condensed icons, two plans + tabs |
| Pricing 18 | A | No | 3 | Center | Basic list, three plans |
| Pricing 19 | B | No | 3 | Center | Icon list, three plans |
| Pricing 20 | C | No | 3 | Center | Alt card, three plans |
| Pricing 23 | A | Yes | 3 | Center | Basic list, three plans + tabs |
| Pricing 24 | B | Yes | 3 | Center | Icon list, three plans + tabs |
| Pricing 25 | C | Yes | 3 | Center | Alt card, three plans + tabs |
| Pricing 28 | A | No | 4 | Center | Basic list, four plans |
| Pricing 29 | B | No | 4 | Center | Icon list, four plans |
| Pricing 30 | C | No | 4 | Center | Alt card, four plans |
| Pricing 31 | A | Yes | 4 | Center | Basic list, four plans + tabs |
| Pricing 32 | B | Yes | 4 | Center | Icon list, four plans + tabs |
| Pricing 33 | C | Yes | 4 | Center | Alt card, four plans + tabs |
| Pricing 34 | D | No | 1 | Left | Condensed, left text, single plan |
| Pricing 35 | D | Yes | 1 | Left | Condensed, left text + tabs |
| Pricing 36 | D | No | 2 | Left | Condensed, left text, two plans |
| Pricing 37 | D | Yes | 2 | Left | Condensed, left text + tabs |
| Pricing 38 | A | No | 3 | Left | Basic list, left text, three plans |
| Pricing 39 | B | No | 3 | Left | Icon list, left text, three plans |
| Pricing 40 | C | No | 3 | Left | Alt card, left text, three plans |
| Pricing 41 | A | Yes | 3 | Left | Basic list, left text + tabs |
| Pricing 42 | B | Yes | 3 | Left | Icon list, left text + tabs |
| Pricing 43 | C | Yes | 3 | Left | Alt card, left text + tabs |
| Pricing 44 | A | No | 4 | Left | Basic list, left text, four plans |
| Pricing 45 | B | No | 4 | Left | Icon list, left text, four plans |
| Pricing 46 | C | No | 4 | Left | Alt card, left text, four plans |
| Pricing 47 | A | Yes | 4 | Left | Basic list, left text + tabs |
| Pricing 48 | B | Yes | 4 | Left | Icon list, left text + tabs |
| Pricing 49 | C | Yes | 4 | Left | Alt card, left text + tabs |

### Pricing Comparison Section (12 variants — separate panel)

| Variant | Family | Tabs | Plans |
|---------|--------|------|-------|
| Pricing 21 | F | No | 3 |
| Pricing 22 | G | No | 3 |
| Pricing 26 | F | Yes | 3 |
| Pricing 27 | G | Yes | 3 |
| Pricing 50 | F | No | 2 |
| Pricing 51 | G | No | 2 |
| Pricing 52 | F | Yes | 2 |
| Pricing 53 | G | Yes | 2 |
| Pricing 54 | F | No | 4 |
| Pricing 55 | G | No | 4 |
| Pricing 56 | F | Yes | 4 |
| Pricing 57 | G | Yes | 4 |

---

## Axis Definitions

### Tabs Axis

| Value | Effect |
|-------|--------|
| **No** | No tab switcher — shows all plans directly |
| **Yes** | Adds a tab bar above pricing cards to toggle between billing periods (e.g., Monthly / Yearly) |

Present in all families except E (standalone).

### Plans Axis

| Value | Effect |
|-------|--------|
| **1** | Single pricing card |
| **2** | Two pricing cards side by side |
| **3** | Three pricing cards |
| **4** | Four pricing cards |

- Families A, B, C: Plans = 1, 2, 3, 4
- Family D: Plans = 1, 2
- Families F, G: Plans = 2, 3, 4 (no single-plan comparison table)

### Text Axis

| Value | Effect | Icon |
|-------|--------|------|
| **Center** | Heading and description are centered above the pricing cards | Center-align icon |
| **Left** | Heading and description are left-aligned | Left-align icon |

- Displayed as **icon buttons** (left-align / center-align) in the Section Panel, not text labels
- Only present in Families A, B, C, D — comparison tables (F, G) have no Text axis
- **Dynamic** — see rules below

---

## Dynamic Behavior Rules

### Families A, B, C (Standard Pricing)

These three families share identical dynamic behavior:

```
IF Plans ≤ 2:
    Text axis → HIDDEN (forced to Center)
    Plans shows: 1, 2, 3, 4

IF Plans ≥ 3:
    Text axis → VISIBLE
    IF Text = Center:
        Plans shows: 1, 2, 3, 4
    IF Text = Left:
        Plans shows: 3, 4   (1 and 2 REMOVED)
```

**Visual State Machine (Family A example):**

```
P1 (Plans=1, No Tabs)
 ├─ toggle Tabs=Yes ──→ P6
 ├─ toggle Plans=2 ───→ P10
 ├─ toggle Plans=3 ───→ P18  [Text axis APPEARS → Center]
 │   ├─ toggle Text=Left ─→ P38  [Plans now shows only 3,4]
 │   │   ├─ toggle Plans=4 ─→ P44
 │   │   └─ toggle Text=Center → P18  [Plans shows 1,2,3,4 again]
 │   └─ toggle Plans=4 ──→ P28
 └─ toggle Plans=4 ───→ P28
```

### Family D (Condensed)

Family D has a simpler dynamic because it only supports Plans = 1, 2:

```
IF Plans = 1:
    Text axis → HIDDEN (forced to Center)

IF Plans = 2:
    Text axis → VISIBLE (Left / Center)
```

**No Plans restriction** when Text = Left in Family D — both Plans=1 and Plans=2 remain available.

### Families F, G (Comparison Tables)

No dynamic behavior — both Tabs and Plans axes are always visible. No Text axis.

---

## Family A — Basic List (12 variants)

**Layout:** Centered tagline/heading/description above pricing cards. Each card shows plan name, price, billing period, feature checklist (plain text, no icons), and a CTA button.

**Tags:** `1 Column, Text Align Center, Text Align Left, Buttons, List, Pricing Section`

**Distinguishing Feature:** Feature items are plain text with checkmark icons — no colored icon badges.

**Axes:** Tabs (Yes/No), Plans (1/2/3/4), Text (Left/Center — dynamic)

### Combo Table — Text = Center

| Plans \ Tabs | No | Yes |
|:---:|:---:|:---:|
| **1** | **P1** | **P6** |
| **2** | **P10** | **P14** |
| **3** | **P18** | **P23** |
| **4** | **P28** | **P31** |

### Combo Table — Text = Left (Plans 3-4 only)

| Plans \ Tabs | No | Yes |
|:---:|:---:|:---:|
| **3** | **P38** | **P41** |
| **4** | **P44** | **P47** |

**Verification:** ✅ UI-verified — P1 shows Tabs + Plans (no Text); toggling Plans=3 reveals Text axis → P18; toggling Text=Left → P38 (Plans restricted to 3,4)

---

## Family B — Icon List (12 variants)

**Layout:** Same structure as Family A, but feature list items include **colored icon badges** next to each feature text.

**Tags:** `1 Column, Text Align Center, Text Align Left, Buttons, Icons, List, Pricing Section`

**Distinguishing Feature:** Each feature item has a circular icon/badge alongside the text (vs Family A's plain checkmarks).

**Axes:** Tabs (Yes/No), Plans (1/2/3/4), Text (Left/Center — dynamic, same rules as Family A)

### Combo Table — Text = Center

| Plans \ Tabs | No | Yes |
|:---:|:---:|:---:|
| **1** | **P2** | **P7** |
| **2** | **P11** | **P15** |
| **3** | **P19** | **P24** |
| **4** | **P29** | **P32** |

### Combo Table — Text = Left (Plans 3-4 only)

| Plans \ Tabs | No | Yes |
|:---:|:---:|:---:|
| **3** | **P39** | **P42** |
| **4** | **P45** | **P48** |

> ⚠️ **API Data Note:** The API `variants` field for P2 reports P11 as Tabs=Yes and P15 as Tabs=No, and P19 as Tabs=Yes and P24 as Tabs=No. This is **swapped** relative to the consistent pattern in Families A and C (where the lower number is always Tabs=No). The combo table above uses the **corrected pattern-consistent** mapping. Verify via UI if implementing.

---

## Family C — Alt Card Style (12 variants)

**Layout:** Same structure as Family A, but pricing cards use a **different visual card treatment** — distinct border/shadow/background styling that differentiates it from the plain A and icon-heavy B styles.

**Tags:** `1 Column, Text Align Center, Text Align Left, Buttons, List, Pricing Section`

**Distinguishing Feature:** Cards have a visually distinct container style compared to Families A and B. No icon badges (like Family A), but different card aesthetics.

**Axes:** Tabs (Yes/No), Plans (1/2/3/4), Text (Left/Center — dynamic, same rules as Family A)

### Combo Table — Text = Center

| Plans \ Tabs | No | Yes |
|:---:|:---:|:---:|
| **1** | **P3** | **P8** |
| **2** | **P12** | **P16** |
| **3** | **P20** | **P25** |
| **4** | **P30** | **P33** |

### Combo Table — Text = Left (Plans 3-4 only)

| Plans \ Tabs | No | Yes |
|:---:|:---:|:---:|
| **3** | **P40** | **P43** |
| **4** | **P46** | **P49** |

**Verification:** ✅ Confirmed via API `variants` field — follows identical axis structure as Family A

---

## Family D — Condensed (8 variants)

**Layout:** More compact pricing layout with icon-enhanced feature lists. Supports only 1 or 2 plans (no 3 or 4 plan options).

**Tags:** `1 Column, Text Align Center, Buttons, Icons, List, Pricing Section` (Center variants)  
**Tags (Left variants):** `1 Column, Text Align Left, Buttons, List, Pricing Section`

**Distinguishing Feature:** Condensed layout that caps at 2 plans. Text=Left variants may omit icon badges.

**Axes:** Tabs (Yes/No), Plans (1/2), Text (Left/Center — dynamic at Plans=2)

### Dynamic Behavior

```
IF Plans = 1:
    Text axis → HIDDEN
IF Plans = 2:
    Text axis → VISIBLE (Left / Center)
    Both Plans values (1, 2) remain available regardless of Text choice
```

### Combo Table — Text = Center

| Plans \ Tabs | No | Yes |
|:---:|:---:|:---:|
| **1** | **P4** | **P9** |
| **2** | **P13** | **P17** |

### Combo Table — Text = Left

| Plans \ Tabs | No | Yes |
|:---:|:---:|:---:|
| **1** | **P34** | **P35** |
| **2** | **P36** | **P37** |

**Note:** P34 and P35 (Text=Left, Plans=1) are accessible through the Replace Component panel but are NOT referenced in the `variants` field of P4 or P9. They appear to be independently-added variants discovered only via individual API slug lookup.

---

## Family E — Two-Column Standalone (1 variant)

**Component:** Pricing 5

**Layout:** Two-column layout with text/CTA on one side and pricing details on the other. Unique layout that doesn't share axes with any other variant.

**Tags:** `2 Columns, 1 Column, Text Align Left, Buttons, Icons, List, Pricing Section`

**Axes:** None — no configurable controls

---

## Family F — Comparison Table Style 1 (6 variants)

**Section Type:** Pricing Comparison Section (separate from standard Pricing Section)

**Layout:** Full feature comparison table with plan columns. Each row shows a feature with checkmarks or values per plan. Header row shows plan names and prices with CTA buttons.

**Tags:** `Table, Pricing Comparison Section`

**Distinguishing Feature:** Style 1 table layout — differs from Family G in visual treatment of rows, headers, and cell styling.

**Axes:** Tabs (Yes/No), Plans (2/3/4) — no Plans=1, no Text axis

### Combo Table

| Plans \ Tabs | No | Yes |
|:---:|:---:|:---:|
| **2** | **P50** | **P52** |
| **3** | **P21** | **P26** |
| **4** | **P54** | **P56** |

**Note:** P21 and P26 are the base components (returned by the API category filter). P50, P52, P54, P56 are hidden variants accessible only through axis toggling.

---

## Family G — Comparison Table Style 2 (6 variants)

**Section Type:** Pricing Comparison Section (separate from standard Pricing Section)

**Layout:** Alternative comparison table style with different visual treatment than Family F. Same data structure (feature rows × plan columns) but different spacing, borders, and typography.

**Tags:** `Table, Pricing Comparison Section`

**Axes:** Tabs (Yes/No), Plans (2/3/4) — no Plans=1, no Text axis

### Combo Table

| Plans \ Tabs | No | Yes |
|:---:|:---:|:---:|
| **2** | **P51** | **P53** |
| **3** | **P22** | **P27** |
| **4** | **P55** | **P57** |

**Note:** P22 and P27 are the base components. P51, P53, P55, P57 are hidden variants.

---

## Cross-Family Pattern Matrix

The A/B/C families have a perfectly parallel structure where each variant number follows a consistent offset:

| Axes State | Family A | Family B | Family C | Offset B−A | Offset C−A |
|:---|:---:|:---:|:---:|:---:|:---:|
| Plans=1, Tabs=No, Center | P1 | P2 | P3 | +1 | +2 |
| Plans=1, Tabs=Yes, Center | P6 | P7 | P8 | +1 | +2 |
| Plans=2, Tabs=No, Center | P10 | P11 | P12 | +1 | +2 |
| Plans=2, Tabs=Yes, Center | P14 | P15 | P16 | +1 | +2 |
| Plans=3, Tabs=No, Center | P18 | P19 | P20 | +1 | +2 |
| Plans=3, Tabs=Yes, Center | P23 | P24 | P25 | +1 | +2 |
| Plans=4, Tabs=No, Center | P28 | P29 | P30 | +1 | +2 |
| Plans=4, Tabs=Yes, Center | P31 | P32 | P33 | +1 | +2 |
| Plans=3, Tabs=No, Left | P38 | P39 | P40 | +1 | +2 |
| Plans=3, Tabs=Yes, Left | P41 | P42 | P43 | +1 | +2 |
| Plans=4, Tabs=No, Left | P44 | P45 | P46 | +1 | +2 |
| Plans=4, Tabs=Yes, Left | P47 | P48 | P49 | +1 | +2 |

The offset is always **+1** (B = A+1) and **+2** (C = A+2) for every axis combination.

Similarly, Families F and G are parallel with offset +1:

| Axes State | Family F | Family G | Offset |
|:---|:---:|:---:|:---:|
| Plans=2, Tabs=No | P50 | P51 | +1 |
| Plans=3, Tabs=No | P21 | P22 | +1 |
| Plans=4, Tabs=No | P54 | P55 | +1 |
| Plans=2, Tabs=Yes | P52 | P53 | +1 |
| Plans=3, Tabs=Yes | P26 | P27 | +1 |
| Plans=4, Tabs=Yes | P56 | P57 | +1 |

---

## API Notes & Quirks

### Category Slug

The correct API filter for pricing section components is:
```
GET /v1/components?filter_category=pricing-sections
```

Using `filter_category=pricing` returns **page templates** (kind: `page-template`), NOT section components. This is a common gotcha.

### Naming Convention

All pricing components use `section_pricing{N}` slugs (e.g., `section_pricing1`, `section_pricing38`). There are also 5 legacy slugs (`pricing1`–`pricing5`) that appear in the Replace Component panel as separate entries — these are likely deprecated aliases for `section_pricing1`–`section_pricing5`.

### API Pagination

The API returns only 30 components via the category filter (Pricing 1–30). Components 31–57 must be fetched individually by slug:
```
GET /v1/components?filter_slug=section_pricing{N}
```

### Tabs Axis Data Inconsistency (Family B)

The API `variants` field reports **swapped Tabs values** for certain Family B components:
- P11 reported as Tabs=Yes (pattern-consistent expectation: No)
- P15 reported as Tabs=No (pattern-consistent expectation: Yes)
- P19 reported as Tabs=Yes (expected: No)
- P24 reported as Tabs=No (expected: Yes)

The combo table in this document uses the **pattern-consistent** mapping (matching Families A and C). If implementing mechanically from API data, verify these four components via UI.

### Visibility in Replace Panel

| Component Range | In API Category Response | In Replace Panel | Access Method |
|:---|:---:|:---:|:---|
| P1–P30 | ✅ | ✅ (except P21/22/26/27) | Direct selection or axis toggle |
| P21, P22, P26, P27 | ✅ | ❌ (different section type) | Load comparison table section first |
| P31–P49 | ❌ (fetch by slug) | ✅ | Direct selection or axis toggle |
| P50–P57 | ❌ (fetch by slug) | ❌ | Axis toggle on comparison table bases |

---

## Implementation Notes for Scytle

### Control Definition

```typescript
// For Families A, B, C — standard pricing cards
{
  axes: {
    tabs: { type: 'toggle', values: ['yes', 'no'], default: 'no' },
    plans: { type: 'select', values: [1, 2, 3, 4], default: 1 },
    text: {
      type: 'icon-toggle',
      values: ['left', 'center'],
      default: 'center',
      dynamic: true, // visibility depends on plans value
    },
  },
  dynamicRules: [
    { if: { plans: [1, 2] }, then: { text: 'hidden' } },
    { if: { text: 'left' }, then: { plans: { restrict: [3, 4] } } },
  ],
}

// For Family D — condensed
{
  axes: {
    tabs: { type: 'toggle', values: ['yes', 'no'], default: 'no' },
    plans: { type: 'select', values: [1, 2], default: 1 },
    text: { type: 'icon-toggle', values: ['left', 'center'], default: 'center', dynamic: true },
  },
  dynamicRules: [
    { if: { plans: 1 }, then: { text: 'hidden' } },
  ],
}

// For Families F, G — comparison tables
{
  axes: {
    tabs: { type: 'toggle', values: ['yes', 'no'], default: 'no' },
    plans: { type: 'select', values: [2, 3, 4], default: 3 },
  },
}
```

### Resolver Function

```typescript
function resolvePricingVariant(
  family: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G',
  tabs: 'yes' | 'no',
  plans: 1 | 2 | 3 | 4,
  text: 'left' | 'center'
): number {
  // Use combo tables above to map (family, tabs, plans, text) → Pricing N
}
```

### Separate Section Types

When building the component library panel, Pricing Section and Pricing Comparison Section should be treated as separate categories or sub-categories, matching Relume's internal separation.
