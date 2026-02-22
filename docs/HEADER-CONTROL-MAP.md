# Header Section — Complete Control Map

> Generated from exhaustive Relume browser testing of all 30 base components in the Replace Component panel (Header 44–70, 96–98).
> Total: **4 families**, **33 unique component variants** (Header 44–70, 96–101).
> 3 additional variants (99–101) discovered through axis sweeping beyond the panel's listed range.

---

## Summary of Families

| Family | Name | Base | Axes | Variants | Component IDs |
|--------|------|------|------|----------|---------------|
| A | Simple Header | Header 44 | Text, Background, Element (dropdown) | 18 | 44–46, 50–55, 62–70 |
| B | Split Header | Header 47 | Background, Element (toggle) | 6 | 47–48, 56–59 |
| C | Minimal Split | Header 49 | Background | 3 | 49, 60–61 |
| D | Card Header | Header 96 | Style, Background, Element (toggle) | 6 | 96–101 |

---

## Replace Component Panel → Family Mapping (30 entries)

| Panel Entry | Family | Description |
|-------------|--------|-------------|
| Header 44 | A | Left + None + Button |
| Header 45 | A | Left + None + Form |
| Header 46 | A | Left + None + None |
| Header 47 | B | None + Button |
| Header 48 | B | None + Form |
| Header 49 | C | None |
| Header 50 | A | Left + Image + Button |
| Header 51 | A | Left + Video + Button |
| Header 52 | A | Left + Image + Form |
| Header 53 | A | Left + Video + Form |
| Header 54 | A | Left + Image + None |
| Header 55 | A | Left + Video + None |
| Header 56 | B | Image + Button |
| Header 57 | B | Video + Button |
| Header 58 | B | Image + Form |
| Header 59 | B | Video + Form |
| Header 60 | C | Image |
| Header 61 | C | Video |
| Header 62 | A | Center + None + Button |
| Header 63 | A | Center + None + Form |
| Header 64 | A | Center + None + None |
| Header 65 | A | Center + Image + Button |
| Header 66 | A | Center + Video + Button |
| Header 67 | A | Center + Image + Form |
| Header 68 | A | Center + Video + Form |
| Header 69 | A | Center + Image + None |
| Header 70 | A | Center + Video + None |
| Header 96 | D | Card + None + Button |
| Header 97 | D | Card + None + Form |
| Header 98 | D | Card + Image + Button |

> Headers 99–101 are NOT listed in the Replace Component panel but are reachable by toggling axes on Header 96–98.

---

## Family A — Simple Header (18 variants)

**Layout**: Full-width banner. Heading, subtext, and optional element (buttons or email form) with optional background media. Content alignment controlled by Text axis.

**Axes**:
- **Text** — `Left` / `Center` (icon buttons) — controls content alignment
- **Background** — `None` / `Image` / `Video` (icon buttons) — controls background media
- **Element** — `None` / `Form` / `Button` (**dropdown**, 3 options) — controls CTA type

> **Key distinction**: Family A is the ONLY header family with a 3-option Element **dropdown** (includes "None"). Families B and D use a 2-option **toggle** (Form/Button only).

### Dynamic Behavior
**None** — All 3 axes always visible regardless of combination. No axis hiding.

### Combo Table (2 × 3 × 3 = 18 variants)

#### Text = Left (9 variants)

| Background | Element | Header # |
|-----------|---------|----------|
| None | Button | **44** |
| None | Form | **45** |
| None | None | **46** |
| Image | Button | **50** |
| Video | Button | **51** |
| Image | Form | **52** |
| Video | Form | **53** |
| Image | None | **54** |
| Video | None | **55** |

#### Text = Center (9 variants)

| Background | Element | Header # |
|-----------|---------|----------|
| None | Button | **62** |
| None | Form | **63** |
| None | None | **64** |
| Image | Button | **65** |
| Video | Button | **66** |
| Image | Form | **67** |
| Video | Form | **68** |
| Image | None | **69** |
| Video | None | **70** |

---

## Family B — Split Header (6 variants)

**Layout**: Two-column split layout. Left column has heading, subtext, and element (buttons or form). Right column has placeholder content/media. No text alignment axis — content is always left-aligned in the left column.

**Axes**:
- **Background** — `None` / `Image` / `Video` (icon buttons) — controls right-column media
- **Element** — `Form` / `Button` (**toggle**, 2 options) — controls CTA type

### Dynamic Behavior
**None** — Both axes always visible. No axis hiding.

### Combo Table (3 × 2 = 6 variants)

| Background | Element | Header # |
|-----------|---------|----------|
| None | Button | **47** |
| None | Form | **48** |
| Image | Button | **56** |
| Video | Button | **57** |
| Image | Form | **58** |
| Video | Form | **59** |

---

## Family C — Minimal Split (3 variants)

**Layout**: Minimal two-column split. Left column has heading and paragraph only — no buttons, no form, no CTA. Right column has placeholder/media. The simplest header family.

**Axes**:
- **Background** — `None` / `Image` / `Video` (icon buttons) — controls right-column media

> No Text axis, no Element axis. This is the only header family with a single axis.

### Dynamic Behavior
**None** — Single axis, always visible.

### Combo Table (3 variants)

| Background | Header # |
|-----------|----------|
| None | **49** |
| Image | **60** |
| Video | **61** |

---

## Family D — Card Header (6 Card variants)

**Layout**: Card overlay on background. Content (heading, subtext, element) is contained within a card component, optionally overlaying a background image/video. Visually distinct from other families due to the card container.

**Axes**:
- **Style** — `Normal` / `Card` (toggle) — controls card vs flat layout
- **Background** — `None` / `Image` / `Video` (icon buttons) — controls background media
- **Element** — `Form` / `Button` (**toggle**, 2 options) — controls CTA type

### ⚠️ Critical: Cross-Category Style Axis

The Style axis bridges **two Relume categories**:
- **Card** (selected) → produces Header Section component numbers (96–101)
- **Normal** (selected) → switches to **Hero Header** category numbers (e.g., Header 23)

When Style=Normal is selected, the component is no longer a "Header Section" — it becomes a "Hero Header" component. This is **cross-category behavior** unique to Family D.

> For the Header Section category map, only the **Card** variants are documented. The Normal variants belong to the Hero Header category and will be mapped when that category is analyzed.

### Dynamic Behavior
- **Style=Card**: All 3 axes visible (Style, Background, Element)
- **Style=Normal**: Component switches to Hero Header category — axes may change to match that category's control set

### Combo Table — Card Only (3 × 2 = 6 variants)

| Background | Element | Header # |
|-----------|---------|----------|
| None | Button | **96** |
| None | Form | **97** |
| Image | Button | **98** |
| Image | Form | **99** |
| Video | Button | **100** |
| Video | Form | **101** |

> Headers 99, 100, 101 were NOT in the Replace Component panel's enumeration (only 96–98 listed). They are hidden variants reachable only through axis toggling.

---

## Cross-Family Patterns

### Axis Types Used

| Axis | UI Control | Values | Used By |
|------|-----------|--------|---------|
| **Text** | Icon buttons (2) | Left / Center | Family A only |
| **Background** | Icon buttons (3) | None / Image / Video | Families A, B, C, D |
| **Element** | **Dropdown** (3) | None / Form / Button | Family A only |
| **Element** | **Toggle** (2) | Form / Button | Families B, D |
| **Style** | Toggle (2) | Normal / Card | Family D only |

### Key Differences from CTA Category

| Feature | CTA | Header Section |
|---------|-----|---------------|
| Families | 8 | 4 |
| Total variants | 63 | 33 |
| Asset axis | Yes (None/Image) | No |
| Asset Style axis | Yes (Default/Expand) | No |
| Expand mode | Yes (collapses all axes) | No |
| Element "None" option | No (always Form/Button) | Yes (Family A dropdown) |
| Cross-category axis | No | Yes (Family D Style axis) |
| Dynamic axis hiding | Complex (5 families) | Minimal (only Family D cross-category) |

### Universal Rules (Header Section)
1. `[disabled]` in the accessibility tree = currently selected option
2. Icon buttons show tooltips on hover: "None", "Image", "Video"
3. Component numbers are sequential within a family's combo space (with gaps between families)
4. **No dynamic axis hiding within a family** — all axes for a given family are always visible (except the Style axis in Family D, which changes the category entirely)
5. Background axis icon buttons are always in order: None (1st), Image (2nd), Video (3rd)

### Numbering Pattern

| Range | Family | Description |
|-------|--------|-------------|
| 44–46 | A | Left + None + all Elements |
| 47–48 | B | None + Button/Form |
| 49 | C | None |
| 50–55 | A | Left + Image/Video + all Elements |
| 56–59 | B | Image/Video + Button/Form |
| 60–61 | C | Image/Video |
| 62–70 | A | Center + all Background × Element combos |
| 96–101 | D | Card + all Background × Element combos |

> Gap: Headers 71–95 are not part of the Header Section category. Numbers 96+ are a separate block for Card variants.

---

## Implementation Notes for Scytle

### LayoutControlDef Strategy

Header Section is significantly simpler than CTA — 4 families, no dynamic axis hiding, no expand mode.

```typescript
// Per-family control defs
HEADER_CONTROL_DEFS = {
  'header-simple': {
    // Family A: Text (Left/Center), Background (None/Image/Video), Element dropdown (None/Form/Button)
    axes: ['text', 'background', 'element-dropdown'],
    variants: 18,
    range: [44, 46, 50, 55, 62, 70], // with gaps
  },
  'header-split': {
    // Family B: Background (None/Image/Video), Element toggle (Form/Button)
    axes: ['background', 'element-toggle'],
    variants: 6,
    range: [47, 48, 56, 59],
  },
  'header-minimal': {
    // Family C: Background (None/Image/Video) only
    axes: ['background'],
    variants: 3,
    range: [49, 60, 61],
  },
  'header-card': {
    // Family D: Style (Card only), Background (None/Image/Video), Element toggle (Form/Button)
    // Note: Style=Normal exits Header Section category → handle as category switch
    axes: ['style', 'background', 'element-toggle'],
    variants: 6,
    range: [96, 101],
  },
}
```

### Key Considerations

1. **Element dropdown vs toggle**: Family A uses a 3-option dropdown (None/Form/Button) while Families B and D use a 2-option toggle (Form/Button). The UI control type must differ.
2. **Family D cross-category behavior**: When a user selects Style=Normal on a Card Header, it should navigate to the corresponding Hero Header variant — not just hide the card. This needs special routing logic.
3. **Hidden panel variants**: Headers 99–101 exist but aren't shown in Relume's Replace Component panel. In Scytle, these should be accessible through axis controls even if not listed as standalone presets.
4. **No Asset/Expand complexity**: Unlike CTA, Header Section has no Asset axis, no Asset Style axis, and no Expand mode. This makes implementation straightforward.
5. **Families B and C are closely related**: Family C is essentially Family B without the Element axis (heading + paragraph only). Could potentially be modeled as Family B with Element=None, though Relume treats them as separate component ranges.
