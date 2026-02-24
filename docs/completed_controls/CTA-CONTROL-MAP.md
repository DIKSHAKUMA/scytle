# CTA Section — Complete Control Map

> Generated from exhaustive Relume browser testing of all 27 base components in the Replace Component panel.
> Total: **8 families**, **63 unique component variants** (CTA 1–66, with gaps at 37–38).

---

## Summary of Families

| Family | Base | Axes | Variants | Component IDs |
|--------|------|------|----------|---------------|
| A | CTA 1 | Style, Asset Style, Element | 6 | 1, 2, 39, 40, 59, 60 |
| B | CTA 13 | Asset, Background/Asset Style, Element | 10 | 13–18, 21–22, 61–62 |
| C | CTA 3 | Text, Style, Background, Element (+Asset, Asset Style) | 25 | 3–6, 19–20, 25–32, 41–44, 51–56, 65 |
| D | CTA 7 | Style, Background, Element | 12 | 7–12, 45–50 |
| E | CTA 23 | Asset Style, Element | 4 | 23–24, 63–64 |
| F | CTA 33 | Element | 2 | 33–34 |
| G | CTA 35 | Text | 2 | 35–36 |
| H | CTA 57 | Element | 2 | 57–58 |

---

## Replace Component Panel → Family Mapping (27 components)

| Panel Entry | Family | Description |
|-------------|--------|-------------|
| CTA 1 | A | Base (Normal + Default + Button) |
| CTA 3 | C | Base (Left + Normal + Image + Button) |
| CTA 7 | D | Base (Normal + None + Button) |
| CTA 9 | D | Normal + Image + Button |
| CTA 13 | B | Base (Asset=None + BG=None + Button) |
| CTA 15 | B | Asset=None + BG=Image + Button |
| CTA 19 | C | Left + Normal + None + Button |
| CTA 21 | B | Asset=None + BG=None + Button (same as 13?) |
| CTA 23 | E | Base (Default + Button) |
| CTA 25 | C | Center + Normal + Asset=None + BG=None + Button |
| CTA 27 | C | Center + Normal + Image + Button |
| CTA 31 | C | Center + Asset=Image + Default + Button |
| CTA 33 | F | Base (Button) |
| CTA 35 | G | Base (Left) |
| CTA 36 | G | Center |
| CTA 39 | A | Card + Button |
| CTA 40 | A | Card + Form |
| CTA 41 | C | Left + Card + Image + Button |
| CTA 45 | D | Card + None + Button |
| CTA 47 | D | Card + Image + Button |
| CTA 51 | C | Center + Card + None + Button |
| CTA 53 | C | Center + Card + Image + Button |
| CTA 57 | H | Base (Button) |
| CTA 59 | A | Expand (from Button) |
| CTA 61 | B | Expand (from Button) |
| CTA 63 | E | Expand (from Button) |
| CTA 65 | C | Center + Expand (from Button) |

---

## Family A — CTA 1

**Layout**: Side-by-side text + image, centered content.
**Base Axes**: Style (Normal/Card), Asset Style (Default/Expand), Element (Form/Button)

### Dynamic Behavior
- **Card mode** → Asset Style axis **HIDES**
- **Expand mode** → Style and Element axes **HIDE** (only Asset Style visible)
- Expand retains hidden Element value in component number

### Combo Table

| Style | Asset Style | Element | CTA # |
|-------|-------------|---------|-------|
| Normal | Default | Button | **1** |
| Normal | Default | Form | **2** |
| Card | — | Button | **39** |
| Card | — | Form | **40** |
| — | Expand | (Button) | **59** |
| — | Expand | (Form) | **60** |

---

## Family B — CTA 13

**Layout**: Side-by-side with optional asset image; Background image/video when no asset.
**Base Axes**: Asset (None/Image icons), Background OR Asset Style, Element (Form/Button)

### Dynamic Behavior
- **Asset=None** → shows Background (None/Image/Video), hides Asset Style
- **Asset=Image** → shows Asset Style (Default/Expand), hides Background
- **BG≠None** → hides Asset axis (can't switch back without going through None first)
- **Expand** → hides Asset and Element axes (only Asset Style visible)

### Combo Table — Asset=None Path

| BG | Element | CTA # |
|----|---------|-------|
| None | Button | **13** |
| None | Form | **14** |
| Image | Button | **15** |
| Image | Form | **16** |
| Video | Button | **17** |
| Video | Form | **18** |

### Combo Table — Asset=Image Path

| Asset Style | Element | CTA # |
|-------------|---------|-------|
| Default | Button | **21** |
| Default | Form | **22** |
| Expand | (Button) | **61** |
| Expand | (Form) | **62** |

---

## Family C — CTA 3

**Layout**: Most complex family. Text+image side-by-side with many axis combinations.
**Max Axes**: Text (Left/Center), Style (Normal/Card), Background (None/Image/Video), Element (Form/Button), Asset (None/Image), Asset Style (Default/Expand)

### Dynamic Behavior — Text=Left

- All combos: Text, Style, Background, Element
- **BG=None + Normal** → Style axis **DISAPPEARS** (only Text, BG, Element remain)
- **Card mode** → BG loses None option (only Image/Video)
- No Asset or Asset Style axes in Text=Left path

### Combo Table — Text=Left (10 variants)

| Style | Background | Element | CTA # |
|-------|-----------|---------|-------|
| Normal | None | Button | **19** |
| Normal | None | Form | **20** |
| Normal | Image | Button | **3** |
| Normal | Image | Form | **4** |
| Normal | Video | Button | **5** |
| Normal | Video | Form | **6** |
| Card | Image | Button | **41** |
| Card | Image | Form | **42** |
| Card | Video | Button | **43** |
| Card | Video | Form | **44** |

> Note: Card+None combos don't exist for Text=Left (BG loses None option in Card mode).

### Dynamic Behavior — Text=Center

- **Asset=None + BG=None**: 5 axes visible (Text, Style, Asset, BG, Element)
- **Asset=Image**: switches to Asset Style mode (Asset, Asset Style, Element) — hides Text, Style, BG
- **Card mode**: Text axis HIDES, BG **keeps** all 3 options (unlike Text=Left)
- **BG≠None (Normal)**: Text axis reappears, all 4 standard axes show (Text, Style, BG, Element)
- **Expand**: hides all except Asset Style

### Combo Table — Text=Center, Normal (6 variants)

| BG | Element | CTA # |
|----|---------|-------|
| None | Button | **25** |
| None | Form | **26** |
| Image | Button | **27** |
| Image | Form | **28** |
| Video | Button | **29** |
| Video | Form | **30** |

### Combo Table — Text=Center, Card (6 variants)

| BG | Element | CTA # |
|----|---------|-------|
| None | Button | **51** |
| None | Form | **52** |
| Image | Button | **53** |
| Image | Form | **54** |
| Video | Button | **55** |
| Video | Form | **56** |

### Combo Table — Text=Center, Asset=Image (3 variants)

| Asset Style | Element | CTA # |
|-------------|---------|-------|
| Default | Button | **31** |
| Default | Form | **32** |
| Expand | (Button) | **65** |

> Note: Expand+Form variant likely = CTA 66 (not tested, inferred from pattern).

---

## Family D — CTA 7

**Layout**: Centered CTA with optional background; simpler than Family C.
**Base Axes**: Style (Normal/Card), Background (None/Image/Video), Element (Form/Button)

### Dynamic Behavior
**NONE** — All 3 axes always visible. Card keeps all 3 BG options. This is the only family with zero dynamic axis hiding.

### Combo Table (12 variants)

| Style | Background | Element | CTA # |
|-------|-----------|---------|-------|
| Normal | None | Button | **7** |
| Normal | None | Form | **8** |
| Normal | Image | Button | **9** |
| Normal | Image | Form | **10** |
| Normal | Video | Button | **11** |
| Normal | Video | Form | **12** |
| Card | None | Button | **45** |
| Card | None | Form | **46** |
| Card | Image | Button | **47** |
| Card | Image | Form | **48** |
| Card | Video | Button | **49** |
| Card | Video | Form | **50** |

---

## Family E — CTA 23

**Layout**: Side-by-side text + image, similar to Family A but without Style axis.
**Base Axes**: Asset Style (Default/Expand), Element (Form/Button)

### Dynamic Behavior
- **Expand** → Element axis **HIDES** (only Asset Style remains)
- Hidden Element value still determines component number

### Combo Table (4 variants)

| Asset Style | Element | CTA # |
|-------------|---------|-------|
| Default | Button | **23** |
| Default | Form | **24** |
| Expand | (Button) | **63** |
| Expand | (Form) | **64** |

---

## Family F — CTA 33

**Layout**: CTA with logo/social proof strip (6 brand images).
**Base Axes**: Element (Form/Button)

### No Dynamic Behavior

| Element | CTA # |
|---------|-------|
| Button | **33** |
| Form | **34** |

---

## Family G — CTA 35

**Layout**: Two-column CTA (two CTA blocks side-by-side with shared image).
**Base Axes**: Text (Left/Center icon buttons)

### No Dynamic Behavior

| Text | CTA # |
|------|-------|
| Left | **35** |
| Center | **36** |

---

## Family H — CTA 57

**Layout**: Large centered CTA with headline + subheadline, no image.
**Base Axes**: Element (Form/Button)

### No Dynamic Behavior

| Element | CTA # |
|---------|-------|
| Button | **57** |
| Form | **58** |

---

## Cross-Family Patterns

### Common Axis Types

| Axis | Values | Behavior |
|------|--------|----------|
| **Style** | Normal / Card | Card may hide other axes; may restrict BG options |
| **Background** | None / Image / Video (icons) | None may hide Style axis; Card may lose None option |
| **Element** | Form / Button | Form = email input + submit; Button = CTA buttons |
| **Asset** | None / Image (icons) | None → BG path; Image → Asset Style path |
| **Asset Style** | Default / Expand | Expand hides most other axes |
| **Text** | Left / Center (icons) | Controls text alignment; Center may introduce additional axes |

### Universal Rules
1. **Expand mode** always collapses to just the Asset Style axis (all others hide)
2. Hidden axis values still affect the component number (e.g., CTA 59 vs 60 differ by hidden Element)
3. Icon buttons in the Section Panel show tooltips on hover: "None", "Image", "Video", "Left", "Center"
4. `[disabled]` in the accessibility tree = currently selected option
5. Component numbers are sequential within a family's combo space

### Numbering Pattern
- **1–6**: Family A (Normal) + Family C Text=Left (Normal+Image/Video)
- **7–12**: Family D (Normal)
- **13–22**: Family B
- **19–20**: Family C Text=Left (Normal+None) — overlaps with B range but different family
- **23–36**: Families E, C-Center(Normal), F, G
- **39–56**: Card variants across families A, C, D
- **57–66**: Families H + Expand variants from A, B, E, C

### Gaps
- **CTA 37, 38**: Not discovered in any family. Possibly don't exist or are unreachable from standard axes.
- **CTA 66**: Inferred (Text=Center + Expand + Form) but not explicitly tested.

---

## Implementation Notes for Scytle

### LayoutControlDef Strategy

Given the complexity, CTA needs **multiple control definitions** or a single complex one with deep conditions:

```typescript
// Option 1: Per-family control defs
CTA_CONTROL_DEFS = {
  'cta-family-a': { /* Style, Asset Style, Element */ },
  'cta-family-b': { /* Asset, BG/Asset Style, Element */ },
  'cta-family-c': { /* Text, Style, BG, Element, Asset, Asset Style */ },
  'cta-family-d': { /* Style, BG, Element */ },
  'cta-family-e': { /* Asset Style, Element */ },
  'cta-family-f': { /* Element */ },
  'cta-family-g': { /* Text */ },
  'cta-family-h': { /* Element */ },
}

// Option 2: Single CTA control def with component-range routing
CTA_CONTROL_DEF = {
  axes: [/* all possible axes */],
  condition: (axisId, values, componentId) => {
    // Route to correct visibility rules based on component range
  }
}
```

### Key Considerations
1. **Family C is the most complex** — axis visibility depends on BOTH Text value AND current selections of Asset/BG
2. **Expand mode** needs special handling — hidden axis values must be preserved
3. **Card mode** behavior varies by family — Family D keeps all BG options, Family C Text=Left loses None
4. **Families F, G, H** are trivial (1-2 axes, no dynamics)
