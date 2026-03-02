# Gallery Category — Control Map

> Complete control mapping for Relume Gallery category (27 variants)  
> Research Date: 2025-01-24  
> Method: Relume API (`variants` field) + UI verification via MCP Playwright

---

## Overview

The Gallery category contains **27 variants** (Gallery 1–27) organized into **3 families** plus **10 standalone** components. All variants share the same section type ("Gallery Section") and appear in a single Replace Component panel.

### Key Findings

| Metric | Value |
|--------|-------|
| Total Variants | 27 |
| Families (with axes) | 3 (A, B, C) |
| Standalone (no axes) | 10 (G7–G12, G13, G15, G16, G24) |
| Max axes per family | 3 (Text, Columns, Slider — Family A only) |
| Dynamic axis visibility | Yes — axes hide/show based on other axis values |
| Panel entries | 27 (all variants listed individually) |
| API category slug | `gallery-sections` |
| Internal slug format | `section_gallery{N}` |

**Critical Pattern — Dynamic Axis Visibility (Family A):**
- **Slider = No** → Text axis **HIDDEN** (only Columns + Slider visible)
- **Slider = Yes, Text = Center** → **all 3 axes** visible (Text, Columns, Slider)
- **Text = Left** → Slider axis **HIDDEN** (only Text + Columns visible; Slider implicitly = Yes)

This creates a **3-layer structure** within Family A where different axis combinations select between 12 variants.

---

## Summary of Families

| Family | Name | Axes | Variants | Component IDs |
|--------|------|------|----------|---------------|
| A | Standard Gallery | Text†, Columns, Slider† | 12 | 1, 2, 3, 4, 14, 17, 18, 19, 20, 21, 22, 23 |
| B | Alt Grid | Columns | 2 | 5, 6 |
| C | Side-by-Side | Columns | 3 | 25, 26, 27 |
| — | Standalone | _(none)_ | 10 | 7, 8, 9, 10, 11, 12, 13, 15, 16, 24 |

_† Text and Slider axes are dynamically shown/hidden depending on each other's values_

---

## Family A — Standard Gallery (12 variants)

The core gallery family with a **3-axis dynamic control system**. The key innovation is that axes appear and disappear based on other axis values, creating three distinct "layers."

### Axes

| Axis | Values | Behavior |
|------|--------|----------|
| **Columns** | 1, 2, 3, 4 | Always visible. Controls grid column count. |
| **Slider** | Yes, No | Visible when Text ≠ Left. Toggles carousel mode. |
| **Text** | Left, Center | Visible only when Slider = Yes. Controls text alignment. |

### Dynamic Axis Rules

```
IF Slider = No:
  → Show: Columns, Slider
  → Hide: Text
  → Text defaults to Center

IF Slider = Yes AND Text = Center:
  → Show: Text, Columns, Slider
  → All 3 axes visible

IF Text = Left:
  → Show: Text, Columns
  → Hide: Slider
  → Slider implicitly = Yes
```

### Layer 1 — No Slider (Text hidden, defaults Center)

| Variant | Columns | Slider | Text | Tags |
|---------|---------|--------|------|------|
| Gallery 1 | 1 | No | _(Center)_ | 1 Column, Text Align Center, Image Lightbox |
| Gallery 2 | 2 | No | _(Center)_ | 2 Columns |
| Gallery 3 | 3 | No | _(Center)_ | 3 Columns |
| Gallery 4 | 4 | No | _(Center)_ | 4 Columns |

### Layer 2 — Slider + Text Center

| Variant | Columns | Slider | Text | Tags |
|---------|---------|--------|------|------|
| Gallery 14 | 1 | Yes | Center | 1 Column, Slider |
| Gallery 17 | 2 | Yes | Center | 2 Columns, Slider |
| Gallery 18 | 3 | Yes | Center | 3 Columns, Slider |
| Gallery 19 | 4 | Yes | Center | 4 Columns, Slider |

### Layer 3 — Text Left (Slider hidden, implicitly Yes)

| Variant | Columns | Text | Tags |
|---------|---------|------|------|
| Gallery 20 | 1 | Left | 1 Column, Text Align Left, Slider |
| Gallery 21 | 2 | Left | 2 Columns, Text Align Left, Slider |
| Gallery 22 | 3 | Left | 3 Columns, Text Align Left, Slider |
| Gallery 23 | 4 | Left | 4 Columns, Text Align Left, Slider |

### Navigation Transitions

Starting from any Family A variant, axes navigate to other Family A variants:

| From → | Col=1 | Col=2 | Col=3 | Col=4 | Slider=Yes | Slider=No | Text=Left | Text=Center |
|--------|-------|-------|-------|-------|------------|-----------|-----------|-------------|
| **Layer 1** (No Slider) | G1 | G2 | G3 | G4 | → Layer 2 | _(stay)_ | — | — |
| **Layer 2** (Slider+Center) | G14 | G17 | G18 | G19 | _(stay)_ | → Layer 1 | → Layer 3 | _(stay)_ |
| **Layer 3** (Text Left) | G20 | G21 | G22 | G23 | — | — | _(stay)_ | → Layer 2 |

---

## Family B — Alt Grid (2 variants)

A simpler gallery family with a distinct grid layout style. Only has a single axis.

### Axes

| Axis | Values | Behavior |
|------|--------|----------|
| **Columns** | 3, 4 | Always visible. Toggles between 3 and 4 column layouts. |

### Variant Table

| Variant | Columns | Tags |
|---------|---------|------|
| Gallery 5 | 3 | 3 Columns |
| Gallery 6 | 4 | 4 Columns |

### Navigation

| From | Col=3 | Col=4 |
|------|-------|-------|
| Gallery 5 | _(stay)_ | → G6 |
| Gallery 6 | → G5 | _(stay)_ |

---

## Family C — Side-by-Side Gallery (3 variants)

A side-by-side layout with image/video on the right and text content on the left. Only has a single axis.

### Axes

| Axis | Values | Behavior |
|------|--------|----------|
| **Columns** | 1, 2, 3 | Always visible. Controls number of gallery items visible. |

### Variant Table

| Variant | Columns | Tags |
|---------|---------|------|
| Gallery 25 | 1 | 2 Columns, Text Align Left, Image/Video Right |
| Gallery 26 | 2 | 2 Columns, Text Align Left, Image/Video Right |
| Gallery 27 | 3 | 2 Columns, Text Align Left, Image/Video Right |

_Note: The "Columns" axis here functions differently than in Families A/B — it controls the number of items in the gallery grid within the right-side column, not the overall section column count._

### Navigation

| From | Col=1 | Col=2 | Col=3 |
|------|-------|-------|-------|
| Gallery 25 | _(stay)_ | → G26 | → G27 |
| Gallery 26 | → G25 | _(stay)_ | → G27 |
| Gallery 27 | → G25 | → G26 | _(stay)_ |

---

## Standalone Variants (10 components)

These variants have **no axes** — they cannot be transformed into any other variant through controls. Each is a fixed, unique layout.

| Variant | Tags | Layout Description |
|---------|------|--------------------|
| Gallery 7 | 3 Columns | Static 3-column image grid |
| Gallery 8 | 3 Columns | Alternate 3-column image grid |
| Gallery 9 | 2 Columns | Static 2-column image grid |
| Gallery 10 | 2 Columns | Alternate 2-column image grid |
| Gallery 11 | 2 Columns | Another 2-column image grid |
| Gallery 12 | 3 Columns | Another 3-column image grid |
| Gallery 13 | 1 Column, Slider | Single column image slider (no axis controls) |
| Gallery 15 | 1 Column, Slider | Alternate single column slider |
| Gallery 16 | 2 Columns, Slider | Two-column slider layout |
| Gallery 24 | 1 Column | Single column gallery |

_Note: G13, G15, and G16 are tagged as "Slider" layouts but unlike Family A slider variants, they have no axis controls — slider mode is fixed and cannot be toggled._

---

## Axis Definitions

### Columns Axis

| Value | Family A Effect | Family B Effect | Family C Effect |
|-------|-----------------|-----------------|-----------------|
| **1** | 1 image per row | — | 1 item in gallery grid |
| **2** | 2 images per row | — | 2 items in gallery grid |
| **3** | 3 images per row | 3 images per row | 3 items in gallery grid |
| **4** | 4 images per row | 4 images per row | — |

- Present in all 3 families
- Family A: 4 values (1, 2, 3, 4)
- Family B: 2 values (3, 4)
- Family C: 3 values (1, 2, 3)

### Slider Axis

| Value | Effect |
|-------|--------|
| **Yes** | Images displayed as a horizontally scrollable carousel. Text axis becomes visible. |
| **No** | Images displayed as a static grid. Text axis hidden. |

- Present only in Family A
- Dynamically hidden when Text = Left

### Text Axis

| Value | Effect |
|-------|--------|
| **Center** | Section heading and subheading centered above the gallery |
| **Left** | Section heading and subheading left-aligned. Slider axis becomes hidden. |

- Present only in Family A
- Dynamically hidden when Slider = No

---

## Replace Component Panel

The Gallery Section panel lists all **27 Gallery variants** as individual entries, sorted alphabetically:

Gallery 1, Gallery 10, Gallery 11, Gallery 12, Gallery 13, Gallery 14, Gallery 15, Gallery 16, Gallery 17, Gallery 18, Gallery 19, Gallery 2, Gallery 20, Gallery 21, Gallery 22, Gallery 23, Gallery 24, Gallery 25, Gallery 26, Gallery 27, Gallery 3, Gallery 4, Gallery 5, Gallery 6, Gallery 7, Gallery 8, Gallery 9

All variants appear in a single panel — there is no section type separation (unlike Pricing). Users can navigate between variants either by selecting directly from the panel or by toggling axes in the Section Panel.

---

## API Response Structure

Each Gallery component returned by the API includes:

```json
{
  "title": "Gallery 1",
  "category_slug": "gallery-sections",
  "relume_slug": "section_gallery1",
  "variants": [
    {
      "title": "Columns",
      "options": [
        { "label": "1", "relume_slug": "section_gallery1" },
        { "label": "2", "relume_slug": "section_gallery2" },
        { "label": "3", "relume_slug": "section_gallery3" },
        { "label": "4", "relume_slug": "section_gallery4" }
      ]
    },
    {
      "title": "Slider",
      "options": [
        { "label": "Yes", "relume_slug": "section_gallery14" },
        { "label": "No", "relume_slug": "section_gallery1" }
      ]
    }
  ]
}
```

Note: The API returns **all** axes for a component regardless of which are currently visible in the UI. Dynamic hiding is purely a UI behavior — the API always shows the full axis set.

---

## Complete Slug Map

| Gallery # | Relume Slug | Family | Axes |
|-----------|-------------|--------|------|
| 1 | `section_gallery1` | A | Columns(1), Slider(No) |
| 2 | `section_gallery2` | A | Columns(2), Slider(No) |
| 3 | `section_gallery3` | A | Columns(3), Slider(No) |
| 4 | `section_gallery4` | A | Columns(4), Slider(No) |
| 5 | `section_gallery5` | B | Columns(3) |
| 6 | `section_gallery6` | B | Columns(4) |
| 7 | `section_gallery7` | — | _(standalone)_ |
| 8 | `section_gallery8` | — | _(standalone)_ |
| 9 | `section_gallery9` | — | _(standalone)_ |
| 10 | `section_gallery10` | — | _(standalone)_ |
| 11 | `section_gallery11` | — | _(standalone)_ |
| 12 | `section_gallery12` | — | _(standalone)_ |
| 13 | `section_gallery13` | — | _(standalone)_ |
| 14 | `section_gallery14` | A | Columns(1), Slider(Yes), Text(Center) |
| 15 | `section_gallery15` | — | _(standalone)_ |
| 16 | `section_gallery16` | — | _(standalone)_ |
| 17 | `section_gallery17` | A | Columns(2), Slider(Yes), Text(Center) |
| 18 | `section_gallery18` | A | Columns(3), Slider(Yes), Text(Center) |
| 19 | `section_gallery19` | A | Columns(4), Slider(Yes), Text(Center) |
| 20 | `section_gallery20` | A | Columns(1), Text(Left) |
| 21 | `section_gallery21` | A | Columns(2), Text(Left) |
| 22 | `section_gallery22` | A | Columns(3), Text(Left) |
| 23 | `section_gallery23` | A | Columns(4), Text(Left) |
| 24 | `section_gallery24` | — | _(standalone)_ |
| 25 | `section_gallery25` | C | Columns(1) |
| 26 | `section_gallery26` | C | Columns(2) |
| 27 | `section_gallery27` | C | Columns(3) |

---

## Implementation Notes

### For Scytle Design System

1. **Family A** is the primary gallery family — implement first with full 3-axis dynamic control support
2. The dynamic axis visibility is the most complex behavior to replicate:
   - When `Slider = No`: render only Columns + Slider controls
   - When `Slider = Yes`: render Text + Columns + Slider controls  
   - When `Text = Left`: render only Text + Columns controls
3. **Standalone variants** (10 total) each need their own template/preset since they can't be parameterized
4. **Family B** and **Family C** are simple single-axis families — straightforward Columns control
5. The "Columns" axis has **different semantics** across families:
   - Family A: overall grid columns (1–4)
   - Family B: overall grid columns (3–4)
   - Family C: items within a sub-grid (1–3), not the overall section layout

### Control Definition Sketch

```typescript
// Family A
{
  axes: {
    text: { values: ['Left', 'Center'], default: 'Center', dynamicVisibility: 'slider=Yes' },
    columns: { values: [1, 2, 3, 4], default: 3 },
    slider: { values: ['Yes', 'No'], default: 'No', dynamicVisibility: 'text!=Left' },
  }
}

// Family B
{
  axes: {
    columns: { values: [3, 4], default: 3 },
  }
}

// Family C
{
  axes: {
    columns: { values: [1, 2, 3], default: 1 },
  }
}
```
