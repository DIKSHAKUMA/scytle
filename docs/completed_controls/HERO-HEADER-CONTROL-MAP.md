# Hero Header Section — Complete Control Map

> Generated from exhaustive Relume browser testing of all 30 base components (Header 1–30) in the Add panel,
> plus ~80 additional variants discovered via the Replace Component panel and search.
> Total: **11 configurable families** (69 axis-driven variants) + **~43 standalone layouts** (no axes).
> Internal naming: `section_headerN` (shared prefix with Header category but different ID ranges).

---

## Summary of Families

| Family | Base(s) | Axes | # Variants | Component IDs |
|--------|---------|------|-----------|---------------|
| A | Header 1 | Style, Asset, Asset Placement, Element | 16 | 1–4, 19–22, 84–87, 92–95 |
| B | Header 5 | Style, Background, Element | 8 | 5–8, 88–91 |
| C | Header 9 | Asset, Element | 4 | 9, 10, 13, 14 |
| D | Header 15 | Asset, Element | 4 | 15–18 |
| E | Header 26 | Asset, Element | 4 | 26–29 |
| F | Header 23 | Style, Background†, Element | 12 | 23, 24, 30, 31, 33, 34, 96–101 |
| G | Header 11 | Element | 2 | 11, 12 |
| H | Header 25 | Background† | 3 | 25, 32, 35 |
| I | Header 36 | Asset, Asset Placement, Element | 8 | 36–43 |
| J | Header 145 | Text, Asset | 4 | 145, 147, 149, 151 |
| K | Header 146 | Text, Asset | 4 | 146, 148, 150, 152 |
| — | _(standalone)_ | _(none)_ | ~43 | 71, 74–83, 102–103, 110–142, 144 |

> † Background axis has 3 options: None / Image / Video (unlike Asset which has 2: Image / Video)

---

## Axis Definitions

| Axis | Options | Notes |
|------|---------|-------|
| **Style** | Normal, Card | Card variant adds background/border treatment around content |
| **Asset** | Image 🖼, Video 🎬 | Side or embedded media; 2 options (icon buttons, no labels) |
| **Asset Placement** | Left ◀, Right ▶ | Which side the image/video sits on; icon buttons |
| **Background** | None ○, Image 🖼, Video 🎬 | Full-width background behind content; 3 options |
| **Element** | Form, Button | Form = email input + submit + terms; Button = two CTA buttons |
| **Text** | Left ◀, Center ● | Text alignment/positioning; icon buttons, only in Families J/K |

---

## Family A — Header 1

**Layout**: Standard split hero. Heading + paragraph + buttons/form on one side, image/video on the other.

**Axes**: Style (Normal/Card) × Asset (Image/Video) × Asset Placement (Left/Right) × Element (Form/Button) = **16 variants**

### Combo Table

| Style | Asset | Placement | Element | Header # |
|-------|-------|-----------|---------|----------|
| Normal | Image | Right | Button | **1** |
| Normal | Image | Right | Form | **2** |
| Normal | Video | Right | Button | **3** |
| Normal | Video | Right | Form | **4** |
| Normal | Image | Left | Button | **19** |
| Normal | Image | Left | Form | **20** |
| Normal | Video | Left | Button | **21** |
| Normal | Video | Left | Form | **22** |
| Card | Image | Right | Button | **84** |
| Card | Image | Right | Form | **85** |
| Card | Video | Right | Button | **86** |
| Card | Video | Right | Form | **87** |
| Card | Image | Left | Button | **92** |
| Card | Image | Left | Form | **93** |
| Card | Video | Left | Button | **94** |
| Card | Video | Left | Form | **95** |

---

## Family B — Header 5

**Layout**: Full-width background hero. Text + buttons/form centered over a background image or video.

**Axes**: Style (Normal/Card) × Background (Image/Video) × Element (Form/Button) = **8 variants**

> Note: This family uses "Background" axis (not "Asset"), and has only 2 background options (Image/Video), unlike Family F which has 3 (None/Image/Video).

### Combo Table

| Style | Background | Element | Header # |
|-------|-----------|---------|----------|
| Normal | Image | Button | **5** |
| Normal | Image | Form | **6** |
| Normal | Video | Button | **7** |
| Normal | Video | Form | **8** |
| Card | Image | Button | **88** |
| Card | Image | Form | **89** |
| Card | Video | Button | **90** |
| Card | Video | Form | **91** |

---

## Family C — Header 9

**Layout**: Image/video on top (full-width), heading below left-aligned, paragraph + buttons/form alongside description to the right.

**Axes**: Asset (Image/Video) × Element (Form/Button) = **4 variants**

### Combo Table

| Asset | Element | Header # |
|-------|---------|----------|
| Image | Button | **9** |
| Image | Form | **10** |
| Video | Button | **13** |
| Video | Form | **14** |

---

## Family D — Header 15

**Layout**: Text column on left (heading + paragraph + description), image/video on right. Split layout with description alongside the main paragraph.

**Axes**: Asset (Image/Video) × Element (Form/Button) = **4 variants**

### Combo Table

| Asset | Element | Header # |
|-------|---------|----------|
| Image | Button | **15** |
| Image | Form | **16** |
| Video | Button | **17** |
| Video | Form | **18** |

---

## Family E — Header 26

**Layout**: Text + image side-by-side. Structurally similar to Families D and I but with a distinct layout treatment.

**Axes**: Asset (Image/Video) × Element (Form/Button) = **4 variants**

### Combo Table

| Asset | Element | Header # |
|-------|---------|----------|
| Image | Button | **26** |
| Image | Form | **27** |
| Video | Button | **28** |
| Video | Form | **29** |

---

## Family F — Header 23/30

**Layout**: Centered full-width hero. Heading + paragraph + buttons/form centered vertically, with optional background (none, image, or video).

**Axes**: Style (Normal/Card) × Background (None/Image/Video) × Element (Form/Button) = **12 variants**

> Note: Background axis has **3 options** (None/Image/Video), unlike Family B's 2-option Background. The "None" option produces a clean text-only hero with no media.

### Combo Table

| Style | Background | Element | Header # |
|-------|-----------|---------|----------|
| Normal | None | Button | **23** |
| Normal | None | Form | **24** |
| Normal | Image | Button | **30** |
| Normal | Image | Form | **31** |
| Normal | Video | Button | **33** |
| Normal | Video | Form | **34** |
| Card | None | Button | **96** |
| Card | None | Form | **97** |
| Card | Image | Button | **98** |
| Card | Image | Form | **99** |
| Card | Video | Button | **100** |
| Card | Video | Form | **101** |

---

## Family G — Header 11

**Layout**: Full-width image on top, heading below, paragraph + buttons/form beneath. A simpler, minimal hero with no media toggles.

**Axes**: Element (Form/Button) = **2 variants**

### Combo Table

| Element | Header # |
|---------|----------|
| Button | **11** |
| Form | **12** |

---

## Family H — Header 25

**Layout**: Search-focused hero. Centered heading + paragraph with a search box (search input + search button + icon). No CTA buttons or form.

**Axes**: Background (None/Image/Video) = **3 variants**

> Note: No Element axis — always shows a search field instead of buttons/form.

### Combo Table

| Background | Header # |
|-----------|----------|
| None | **25** |
| Image | **32** |
| Video | **35** |

---

## Family I — Header 36

**Layout**: Split hero, compact. Heading + paragraph + buttons/form on one side, image/video on the other. Similar to Family A but without the Style (Normal/Card) axis.

**Axes**: Asset (Image/Video) × Asset Placement (Left/Right) × Element (Form/Button) = **8 variants**

### Combo Table

| Asset | Placement | Element | Header # |
|-------|-----------|---------|----------|
| Image | Right | Button | **36** |
| Image | Right | Form | **38** |
| Image | Left | Button | **37** |
| Image | Left | Form | **39** |
| Video | Right | Button | **40** |
| Video | Right | Form | **42** |
| Video | Left | Button | **41** |
| Video | Left | Form | **43** |

---

## Families J & K — Header 145/146

**Layout**: Text + image side-by-side. Large heading with paragraph, buttons or form, and image/video. Distinct from Families A/I with a different structural layout and a **Text alignment** axis.

Family J (Button element) and Family K (Form element) share the same axes but the Element (Form vs Button) is **baked into the family** rather than being a toggleable axis. They navigate independently.

**Axes (both)**: Text (Left/Center) × Asset (Image/Video) = **4 variants each**

### Combo Table — Family J (Button)

| Text | Asset | Header # |
|------|-------|----------|
| Center | Image | **145** |
| Center | Video | **147** |
| Left | Image | **149** |
| Left | Video | **151** |

### Combo Table — Family K (Form)

| Text | Asset | Header # |
|------|-------|----------|
| Center | Image | **146** |
| Center | Video | **148** |
| Left | Image | **150** |
| Left | Video | **152** |

> Note: Families J and K have the same axis structure and layout but are isolated — toggling axes in J never reaches K variants, and vice versa. The Element choice is structural, not a panel toggle.

---

## Standalone Variants (No Axes)

These variants have unique layouts with no configurable axes in the Section Panel. Each is a one-off design. They include specialty layouts such as:

- **Image grids / bento layouts** — e.g., Header 76, 77, 102 (hero with image grid/collage)
- **Minimal text-only** — e.g., Header 110, 120 (hero with single side image, no toggles)
- **Feature-card hybrids** — e.g., Header 102, 103 (hero with inline feature cards)

### Known Standalone IDs

From the Replace Component Suggested tab and search:

```
71, 74, 75, 76, 77, 78, 79, 80, 81, 83,
102, 103,
110, 111, 113, 114, 116, 117, 118, 119, 120,
121, 122, 123, 124, 125, 126, 127, 128, 129, 130,
131, 132, 133, 134, 135, 136, 137, 138,
140, 141, 142, 144
```

> ~43 standalone variants. Additional IDs may exist in the 44–70 and 104–109 ranges but were not visible in either the Suggested tab or the search results.

---

## Axis Comparison Across Families

| Feature | A | B | C | D | E | F | G | H | I | J | K |
|---------|---|---|---|---|---|---|---|---|---|---|---|
| Style axis | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Asset axis | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Background axis (2-opt) | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Background axis (3-opt) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Asset Placement axis | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Element axis | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Text axis | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Variant count | 16 | 8 | 4 | 4 | 4 | 12 | 2 | 3 | 8 | 4 | 4 |

---

## List Item Add Behavior ("2 Dots → + Icon")

### Result: NOT PRESENT

Hero Header sections do **not** have the `slot_adding` mechanism. DOM inspection confirmed zero `slot_adding__expandingAddButton` elements in any Hero Header variant.

**Why**: Hero Headers have a fixed content structure — heading, description, buttons/form, and media. There are no repeatable list items (unlike FAQ, Features, Team, etc.). The content elements are static slots, not dynamic lists.

**Implication**: Hero Header block trees in Scytle should use fixed `children: Block[]` arrays. No hover-triggered add/remove controls are needed between content items.

---

## Replace Component Panel Observations

### Suggested Tab

The Suggested tab in Replace Component shows ~55 variants (the "primary" variant of each family + all standalone variants). Form variants and some axis-toggled variants are NOT shown in Suggested — they're only reachable by:
1. Toggling axes in the Section Panel, or
2. Searching by exact name (e.g. "Header 146")

### Add Panel

The Add panel's "Hero Header" category lists 30 base components (Header 1 through Header 30). These are the "entry points" for each family. Families discovered through axis toggling extend well beyond these 30 bases:
- Family A starts at Header 1 but goes up to Header 95
- Family F starts at Header 23 but goes up to Header 101
- Family I starts at Header 36 but goes up to Header 43

---

## Implementation Recommendations

### V2 Layout Integration

1. **Family A** should be the primary hero family — 16 variants covering the most common split-hero layout
2. **Family I** is Family A without the Style axis — can be merged as a "compact" style variant
3. **Family B** and **Family F** cover full-width/background heroes — differentiated by Background option count (2 vs 3)
4. **Families C, D, E** share the same simple 2-axis structure — differentiated only by layout
5. **Families J+K** can be merged into one family by adding an Element axis

### Suggested Axis Mapping for Scytle

```typescript
// Potential unified Hero Header family axes
type HeroHeaderAxes = {
  layout: 'split' | 'split-compact' | 'stacked' | 'centered' | 'search' | 'background';
  style: 'normal' | 'card';
  asset: 'image' | 'video' | 'none';
  assetPlacement: 'left' | 'right';
  element: 'button' | 'form' | 'search';
  textAlign: 'left' | 'center';
};
```

### Family Consolidation

```
Scytle Family 1 (split hero):     Relume A + I + D + E    (layout variations)
Scytle Family 2 (background hero): Relume B + F            (background variations)
Scytle Family 3 (stacked hero):    Relume C + G            (image-top variations)
Scytle Family 4 (search hero):     Relume H                (unique element type)
Scytle Family 5 (text-aligned):    Relume J + K            (merge with element axis)
Standalone:                         ~43 unique layouts       (implement as needed)
```
