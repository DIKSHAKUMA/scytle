# Footer Category — Control Map

> Complete control mapping for Relume Footer category (17 variants)  
> Research Date: 2025-01-24  
> Method: Relume API (`variants` field) + UI verification via MCP Playwright

---

## Overview

The Footer category contains **17 variants** (Footer 1–17). It has a simple control structure: only 3 families use a single **Style** axis (Normal / Card), while the remaining 11 variants are standalone with no configurable axes.

### Key Findings

| Metric | Value |
|--------|-------|
| Total Variants | 17 |
| Families (with axes) | 3 |
| Variants in families | 6 |
| Standalone (no axes) | 11 |
| Axis Name | "Style" |
| Axis Values | Normal, Card |

**Pattern:** The Style axis toggles between a flat layout ("Normal") and a card-wrapped layout ("Card"). The "Cards" API tag is a reliable indicator — every variant with the "Cards" tag is the Card variant of a family.

---

## Summary of Families

| Family | Base | Axes | Variants | Component IDs |
|--------|------|------|----------|---------------|
| A | Footer 1 | Style (Normal/Card) | 2 | 1, 9 |
| B | Footer 2 | Style (Normal/Card) | 2 | 2, 10 |
| C | Footer 3 | Style (Normal/Card) | 2 | 3, 11 |
| — | Footer 4 | _(none)_ | 1 | 4 |
| — | Footer 5 | _(none)_ | 1 | 5 |
| — | Footer 6 | _(none)_ | 1 | 6 |
| — | Footer 7 | _(none)_ | 1 | 7 |
| — | Footer 8 | _(none)_ | 1 | 8 |
| — | Footer 12 | _(none)_ | 1 | 12 |
| — | Footer 13 | _(none)_ | 1 | 13 |
| — | Footer 14 | _(none)_ | 1 | 14 |
| — | Footer 15 | _(none)_ | 1 | 15 |
| — | Footer 16 | _(none)_ | 1 | 16 |
| — | Footer 17 | _(none)_ | 1 | 17 |

---

## Replace Component Panel → Family Mapping (17 components)

| Panel Entry | Family | Description |
|-------------|--------|-------------|
| Footer 1 | A | Normal style — 4 Columns, Newsletter Sign Up |
| Footer 2 | B | Normal style — 5+ Columns, Newsletter Sign Up |
| Footer 3 | C | Normal style — 3 Columns, Contact Details |
| Footer 4 | — | Standalone — Text Align Center |
| Footer 5 | — | Standalone — 5+ Columns, Newsletter Sign Up |
| Footer 6 | — | Standalone — 5+ Columns, Newsletter Sign Up |
| Footer 7 | — | Standalone — Text Align Center |
| Footer 8 | — | Standalone — Newsletter Sign Up |
| Footer 9 | A | Card style — 4 Columns, Newsletter Sign Up, Cards |
| Footer 10 | B | Card style — 5+ Columns, Newsletter Sign Up, Cards |
| Footer 11 | C | Card style — 3 Columns, Contact Details, Cards |
| Footer 12 | — | Standalone — 3 Columns, Buttons |
| Footer 13 | — | Standalone — 3 Columns, Buttons, Cards |
| Footer 14 | — | Standalone — 5+ Columns, Buttons |
| Footer 15 | — | Standalone — 3 Columns |
| Footer 16 | — | Standalone — 4 Columns, Newsletter Sign Up |
| Footer 17 | — | Standalone — Newsletter Sign Up |

---

## Axis Definition

### Style Axis

| Value | Effect |
|-------|--------|
| **Normal** | Flat layout — content sections laid out directly on background |
| **Card** | Content sections wrapped in card containers with subtle borders/shadows |

This axis is present only in Families A, B, C. All other variants have no configurable axes.

---

## Family A — Footer 1

**Layout:** Logo + newsletter sign-up on the left, 2 link columns in the middle, social media links on the right. Bottom bar with copyright and legal links.

**Tags:** 4 Columns, Text Align Left, Newsletter Sign Up

**Axes:** Style (Normal / Card)

### Combo Table

| Style | Footer # |
|-------|----------|
| Normal | **1** |
| Card | **9** |

### Axis Transition Paths

```
Footer 1 (Normal) → click Card   → Footer 9 (Card)
Footer 9 (Card)   → click Normal → Footer 1 (Normal)
```

**Verification:** ✅ Verified in UI — Footer 1 Style axis toggles to Footer 9

---

## Family B — Footer 2

**Layout:** Logo + newsletter sign-up on the left, 3+ link columns on the right. Bottom bar with copyright and legal links. More columns than Family A.

**Tags:** 5+ Columns, Text Align Left, Newsletter Sign Up

**Axes:** Style (Normal / Card)

### Combo Table

| Style | Footer # |
|-------|----------|
| Normal | **2** |
| Card | **10** |

### Axis Transition Paths

```
Footer 2 (Normal)  → click Card   → Footer 10 (Card)
Footer 10 (Card)   → click Normal → Footer 2 (Normal)
```

**Verification:** ✅ Confirmed via API `variants` field

---

## Family C — Footer 3

**Layout:** Logo + contact details (address, phone, email) on the left, 1–2 link columns on the right. Bottom bar with copyright and social icons.

**Tags:** 3 Columns, Text Align Left, Contact Details

**Axes:** Style (Normal / Card)

### Combo Table

| Style | Footer # |
|-------|----------|
| Normal | **3** |
| Card | **11** |

### Axis Transition Paths

```
Footer 3 (Normal)  → click Card   → Footer 11 (Card)
Footer 11 (Card)   → click Normal → Footer 3 (Normal)
```

**Verification:** ✅ Confirmed via API `variants` field

---

## Standalone Variants (No Axes)

These 11 variants have no configurable axes — they are fixed layouts.

| Footer # | Slug | Tags | Layout Description |
|----------|------|------|--------------------|
| 4 | footer4_component | Text Align Center | Centered minimal footer |
| 5 | footer5_component | 5+ Columns, Text Align Left, Newsletter Sign Up | Multi-column with newsletter |
| 6 | footer6_component | 5+ Columns, Text Align Left, Newsletter Sign Up | Multi-column with newsletter (alt layout) |
| 7 | footer7_component | Text Align Center | Centered minimal footer (alt layout) |
| 8 | footer8_component | Text Align Left, Newsletter Sign Up | Newsletter-focused left-aligned |
| 12 | footer12_component | 3 Columns, Text Align Left, Buttons | Button CTAs with link columns |
| 13 | footer13_component | 3 Columns, Text Align Left, Buttons, Cards | Button CTAs with card-style columns |
| 14 | footer14_component | 5+ Columns, Text Align Left, Buttons | Multi-column with button CTAs |
| 15 | footer15_component | 3 Columns, Text Align Left | Simple 3-column links |
| 16 | footer16_component | 4 Columns, Text Align Left, Newsletter Sign Up | 4-column with newsletter |
| 17 | footer17_component | Text Align Left, Newsletter Sign Up | Newsletter-focused left-aligned (alt) |

### Notable: Footer 12 & 13

Footer 12 (3 Columns, Buttons) and Footer 13 (3 Columns, Buttons, Cards) share similar tags — the only difference is the "Cards" tag on Footer 13. Despite this, the API shows **no `variants` link** between them, meaning they are treated as independent standalone components. This differs from the Footer 1/9, 2/10, 3/11 pairs where the Normal/Card relationship is explicitly encoded.

**Verification:** ✅ Footer 12 verified in UI — no axes shown in Section Panel

---

## Complete Variant List with API Tags

All 17 Footer variants retrieved from Relume API:

| # | Slug | Tags | Family | Style |
|---|------|------|--------|-------|
| 1 | footer1_component | 4 Columns, Text Align Left, Newsletter Sign Up | A | Normal |
| 2 | footer2_component | 5+ Columns, Text Align Left, Newsletter Sign Up | B | Normal |
| 3 | footer3_component | 3 Columns, Text Align Left, Contact Details | C | Normal |
| 4 | footer4_component | Text Align Center | — | — |
| 5 | footer5_component | 5+ Columns, Text Align Left, Newsletter Sign Up | — | — |
| 6 | footer6_component | 5+ Columns, Text Align Left, Newsletter Sign Up | — | — |
| 7 | footer7_component | Text Align Center | — | — |
| 8 | footer8_component | Text Align Left, Newsletter Sign Up | — | — |
| 9 | footer9_component | 4 Columns, Text Align Left, Newsletter Sign Up, Cards | A | Card |
| 10 | footer10_component | 5+ Columns, Text Align Left, Newsletter Sign Up, Cards | B | Card |
| 11 | footer11_component | 3 Columns, Text Align Left, Contact Details, Cards | C | Card |
| 12 | footer12_component | 3 Columns, Text Align Left, Buttons | — | — |
| 13 | footer13_component | 3 Columns, Text Align Left, Buttons, Cards | — | — |
| 14 | footer14_component | 5+ Columns, Text Align Left, Buttons | — | — |
| 15 | footer15_component | 3 Columns, Text Align Left | — | — |
| 16 | footer16_component | 4 Columns, Text Align Left, Newsletter Sign Up | — | — |
| 17 | footer17_component | Text Align Left, Newsletter Sign Up | — | — |

---

## Pattern Analysis

### "Cards" Tag Correlation

The "Cards" API tag is a **reliable but not complete** indicator of the Style axis:

| Has "Cards" Tag | Has Style Axis | Variants |
|-----------------|----------------|----------|
| Yes | Yes | Footer 9, 10, 11 |
| Yes | **No** | Footer 13 |
| No | Yes (as Normal) | Footer 1, 2, 3 |
| No | No | Footer 4, 5, 6, 7, 8, 12, 14, 15, 16, 17 |

Footer 13 is the sole exception — it has the "Cards" tag but no Style axis (standalone).

### Tag Categories

#### Column Count
- `3 Columns` — 3, 11, 12, 13, 15
- `4 Columns` — 1, 9, 16
- `5+ Columns` — 2, 5, 6, 10, 14
- _(no column tag)_ — 4, 7, 8, 17

#### Alignment
- `Text Align Left` — 1, 2, 3, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17
- `Text Align Center` — 4, 7

#### Content Features
- `Newsletter Sign Up` — 1, 2, 5, 6, 8, 9, 10, 16, 17
- `Contact Details` — 3, 11
- `Buttons` — 12, 13, 14
- `Cards` — 9, 10, 11, 13

---

## API Reference

### Endpoints Used

```
# All footers
https://apis.relume.io/v1/components?filter_category=footers&page_size=50

# Single component
https://apis.relume.io/v1/components?filter_component_slug=footer{N}_component
```

### API Response Structure

Each component includes a `variants` array:

```json
{
  "name": "Footer 1",
  "componentSlug": "footer1_component",
  "tags": ["4 Columns", "Text Align Left", "Newsletter Sign Up", "Footer"],
  "variants": [
    {
      "kind": "Style",
      "items": [
        { "kind": "Normal", "componentSlug": "footer1_component" },
        { "kind": "Card", "componentSlug": "footer9_component" }
      ]
    }
  ]
}
```

Standalone variants have `"variants": []`.

### Internal Naming

- Slug format: `footer{N}_component` (e.g., `footer1_component`)
- Unlike sections that use `section_` prefix, footers use `footer` prefix

---

## Implementation Recommendations

For Scytle implementation:

1. **3 Families + 11 Standalone:** Families A/B/C each need a Style axis (Normal/Card). The 11 standalone variants are fixed-layout components.
2. **Default Style:** Normal (the flat layout variant)
3. **Cards variant tag:** Can be used as a heuristic filter but Footer 13 is a false positive

### TypeScript Definition

```typescript
// src/lib/designs/v2/layouts/footer/types.ts

export type FooterStyle = 'normal' | 'card'

export interface FooterControlState {
  style?: FooterStyle  // Only present for Families A, B, C
}

// Families with Style axis
export const FOOTER_FAMILIES = {
  A: { normal: 1, card: 9 },   // 4 Columns, Newsletter
  B: { normal: 2, card: 10 },  // 5+ Columns, Newsletter
  C: { normal: 3, card: 11 },  // 3 Columns, Contact Details
} as const

// Standalone variants (no controls)
export const FOOTER_STANDALONE_VARIANTS = [4, 5, 6, 7, 8, 12, 13, 14, 15, 16, 17]
```

---

## Notes & Caveats

1. **Full API Coverage:** All 17 variants checked via API `variants` field — comprehensive
2. **UI Verification:** Footer 1/9 (Style axis) and Footer 12 (standalone) verified in Relume UI
3. **Simple Structure:** Footer is one of the simplest Relume categories — single axis (Style), only 2 values (Normal/Card), no dynamic axis visibility
4. **Footer 12/13 Anomaly:** Despite sharing similar tags (only difference is "Cards"), these are NOT linked by a Style axis — they are independent standalone variants
5. **Footer 16 vs Footer 1:** Both have "4 Columns, Text Align Left, Newsletter Sign Up" tags, but Footer 16 is standalone while Footer 1 is in Family A. Different internal layouts.

---

*Document generated from Relume API data + MCP Playwright UI verification*
