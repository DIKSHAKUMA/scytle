# FAQ Section — Complete Control Map

> Generated from exhaustive Relume browser testing of all 14 base components in the Replace Component panel.
> Total: **6 families**, **14 unique component variants** (FAQ 1–14, sequential, no gaps).

---

## Summary of Families

| Family | Base | Axes | Variants | Component IDs |
|--------|------|------|----------|---------------|
| A | FAQ 1 | Text, Style, Columns | 6 | 1, 2, 4, 5, 10, 11 |
| B | FAQ 3 | Style | 2 | 3, 6 |
| C | FAQ 7 | Columns | 3 | 7, 12, 13 |
| D | FAQ 8 | _(none)_ | 1 | 8 |
| E | FAQ 9 | _(none)_ | 1 | 9 |
| F | FAQ 14 | _(none)_ | 1 | 14 |

---

## Replace Component Panel → Family Mapping (14 components)

| Panel Entry | Family | Description |
|-------------|--------|-------------|
| FAQ 1 | A | Base (Text=Center, Style=Normal, Columns=1) |
| FAQ 2 | A | Text=Left, Style=Normal |
| FAQ 3 | B | Base (Style=Normal) |
| FAQ 4 | A | Text=Center, Style=Card, Columns=1 |
| FAQ 5 | A | Text=Left, Style=Card |
| FAQ 6 | B | Style=Card |
| FAQ 7 | C | Base (Columns=1) |
| FAQ 8 | D | Standalone (no axes) |
| FAQ 9 | E | Standalone (no axes) |
| FAQ 10 | A | Style=Normal, Columns=2 |
| FAQ 11 | A | Style=Card, Columns=2 |
| FAQ 12 | C | Columns=2 |
| FAQ 13 | C | Columns=3 |
| FAQ 14 | F | Standalone (no axes) |

---

## Family A — FAQ 1

**Layout**: Accordion FAQ with bottom CTA. Heading + description at top (centered or left), accordion FAQ items below, and a "Still have questions?" bottom CTA with contact link.

**Max Axes**: Text (Left/Center), Style (Normal/Card), Columns (1/2)

### Dynamic Behavior (CRITICAL)

Family A has **dynamic axis visibility** — axes appear and disappear based on other axis values:

1. **Text=Center** → Columns axis **APPEARS** (options: 1, 2)
2. **Text=Left** → Columns axis **HIDES** (always single column)
3. **Columns=2** → Text axis **HIDES** (always behaves as "center")
4. **Style axis** → Always visible in Family A (Normal/Card)

This creates a constraint graph:
```
Text=Center + Columns=1 → 3 axes visible: Text, Style, Columns
Text=Center + Columns=2 → 2 axes visible: Style, Columns (Text HIDES)
Text=Left             → 2 axes visible: Text, Style (Columns HIDES)
```

### Combo Table

| Text | Style | Columns | Axes Visible | FAQ # |
|------|-------|---------|-------------|-------|
| Center | Normal | 1 | Text, Style, Columns | **1** |
| Left | Normal | — | Text, Style | **2** |
| Center | Card | 1 | Text, Style, Columns | **4** |
| Left | Card | — | Text, Style | **5** |
| — | Normal | 2 | Style, Columns | **10** |
| — | Card | 2 | Style, Columns | **11** |

> Note: "—" means the axis is hidden in that configuration.

### Axis Transition Paths

```
FAQ 1 (Center/Normal/1) → click Left    → FAQ 2 (Left/Normal/—)    [Columns hides]
FAQ 1 (Center/Normal/1) → click Card    → FAQ 4 (Center/Card/1)    [Same axes]
FAQ 1 (Center/Normal/1) → click Col=2   → FAQ 10 (—/Normal/2)     [Text hides]
FAQ 2 (Left/Normal/—)   → click Center  → FAQ 1 (Center/Normal/1)  [Columns appears]
FAQ 2 (Left/Normal/—)   → click Card    → FAQ 5 (Left/Card/—)      [Same axes]
FAQ 10 (—/Normal/2)     → click Col=1   → FAQ 1 (Center/Normal/1)  [Text appears]
FAQ 10 (—/Normal/2)     → click Card    → FAQ 11 (—/Card/2)        [Same axes]
```

---

## Family B — FAQ 3

**Layout**: Accordion FAQ with top CTA button. Heading + description on the left side with a CTA button, accordion FAQ items on the right side. No bottom CTA section.

**Axes**: Style (Normal/Card)

### Combo Table

| Style | FAQ # |
|-------|-------|
| Normal | **3** |
| Card | **6** |

---

## Family C — FAQ 7

**Layout**: Non-accordion grid FAQ with bottom CTA. Heading + description at top, plain FAQ question/answer pairs displayed in a grid below (not expandable/collapsible). Bottom CTA section with "Still have questions?" and contact link.

**Axes**: Columns (1/2/3)

### Combo Table

| Columns | FAQ # |
|---------|-------|
| 1 | **7** |
| 2 | **12** |
| 3 | **13** |

---

## Family D — FAQ 8

**Layout**: Non-accordion grid FAQ with top CTA button. Heading + description on the left side with a CTA button, non-accordion FAQ question/answer pairs in a grid on the right side. No bottom CTA section.

**Axes**: _(none — fixed layout, standalone variant)_

| FAQ # |
|-------|
| **8** |

---

## Family E — FAQ 9

**Layout**: Accordion FAQ with full bottom CTA section. Left-aligned heading + description at top, accordion FAQ items below, and a full-width bottom CTA with its own heading ("Ready to begin?"), description, and button.

**Axes**: _(none — fixed layout, standalone variant)_

**Key Difference from Family A**: Family A has a simple "Still have questions?" bottom CTA with just a contact link/button. Family E has a full CTA section with separate heading, description paragraph, and prominent action button.

| FAQ # |
|-------|
| **9** |

---

## Family F — FAQ 14

**Layout**: Non-accordion FAQ with icons + full bottom CTA. Centered heading + description at top, FAQ items displayed in a 3×2 grid where each item has an icon + question heading + answer paragraph. Full bottom CTA section with heading, description, and button. Not accordion (items are always expanded/visible).

**Axes**: _(none — fixed layout, standalone variant)_

**Key Difference from Family C**: Family C has plain text FAQ items. Family F has icon-supplemented items in a fixed 3×2 grid layout and a more elaborate bottom CTA.

| FAQ # |
|-------|
| **14** |

---

## Structural Comparison

### By Layout Type

| | Accordion | Non-Accordion |
|---|-----------|---------------|
| **Bottom CTA (simple)** | Family A (6 variants) | Family C (3 variants) |
| **Top CTA button** | Family B (2 variants) | Family D (1 variant) |
| **Bottom CTA (full)** | Family E (1 variant) | Family F (1 variant) |

### By Feature Set

| Feature | A | B | C | D | E | F |
|---------|---|---|---|---|---|---|
| Accordion | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Bottom CTA | ✅ simple | ❌ | ✅ simple | ❌ | ✅ full | ✅ full |
| Top CTA button | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Icons | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Text alignment axis | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Style axis | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Columns axis | ✅ (dynamic) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Dynamic axis behavior | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## List Item Add Behavior ("2 Dots → + Icon")

### Discovery

When a FAQ section is selected/hovered on the Relume canvas, **small dots appear between list items**. These dots are interactive add-item controls that allow adding new FAQ items to the list.

### Mechanism

Relume's editor renders **slot-adding controls** between repeated list elements. The DOM structure is:

```
src-editor-selection-frame__actions           ← parent: part of selection frame
  └─ slot_adding__expandingAddButton           ← 28×28px container
       ├─ slot_adding__dot                     ← 10×10px white circle (visible at rest)
       └─ slot_adding__realButton              ← 12×12px button (opacity: 0 at rest)
            └─ <button class="background-ai onlyIcon">  ← AI-styled + icon
```

### Interaction Flow

1. **Section selected/hovered** → Selection frame appears around the section
2. **Small white dots (10px circles)** appear centered between adjacent list items
3. **Hover over a dot** → The dot fades out (opacity transition 0.15s) and the `realButton` fades in (+ icon appears)
4. **Click the + icon** → A new list item is added to the FAQ wrapper at that position
5. The new item is created with default placeholder content

### CSS Properties

| Element | Property | Value |
|---------|----------|-------|
| `expandingAddButton` | transition | `all` |
| `dot` | background | `rgb(255, 255, 255)` (white) |
| `dot` | border-radius | `50%` (circle) |
| `dot` | transition | `opacity 0.15s linear, transform 0.15s linear` |
| `realButton` | opacity | `0` (hidden at rest) |
| `realButton` | transition | `opacity 0.15s linear, transform 0.15s linear` |
| `realButton` | pointer-events | `auto` |
| `realButton` inner `<button>` | class | `background-ai`, `onlyIcon`, `small` |

### Scope

- Appears between **all repeated/list elements** within a component slot
- Works for FAQ items, navigation links, feature cards, and other list-type content
- Part of the `src-component_renderer-slots_dnd` (drag-and-drop) system
- Dots are **only visible when the containing section is selected** (part of `selection-frame__actions`)

### Implication for Scytle

This list-item-adding behavior is **separate from the axis/variant system**. While axes change the overall component layout/style, the slot-adding system allows **dynamic list length**. This means:

1. **Components are not fixed-length** — users can add/remove FAQ items regardless of the component variant
2. **The block tree needs to support dynamic children** — the `children: Block[]` array for FAQ list containers must be mutable
3. **Canvas interaction must include** hover-triggered add/remove controls between list items
4. **Drag-and-drop reordering** is also supported via the `slots_dnd__draggable` wrapper on each list item

---

## Implementation Recommendations

### V2 Layout Integration

1. **Family A** should be the primary FAQ family — 6 variants covering most use cases
2. **Family B** can be an axis variant of Family A (differ only in CTA position: top vs bottom)
3. **Family C** could merge with A using a "Display" axis (accordion/grid)
4. Standalone variants (D, E, F) represent edge cases — implement as needed

### Suggested Axis Mapping for Scytle

```typescript
// Potential unified FAQ family axes
type FAQAxes = {
  display: 'accordion' | 'grid';          // Families A+B vs C+D
  text: 'left' | 'center';                // Family A only
  style: 'normal' | 'card';              // Families A+B
  columns: 1 | 2 | 3;                    // Families A (1,2) + C (1,2,3)
  cta: 'bottom-simple' | 'bottom-full' | 'top' | 'none';  // CTA position
  icons: boolean;                         // Family F only
};
```

### Dynamic Axis Rules to Implement

```typescript
// When text='left', hide columns axis (always 1)
// When columns=2, hide text axis (always center-ish)
// When display='grid', hide text axis, expand columns to include 3
// When cta='top', hide text axis (always left-aligned split layout)
```
