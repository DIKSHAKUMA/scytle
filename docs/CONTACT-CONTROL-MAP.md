# Contact Category — Control Map

> Complete control mapping for Relume Contact category (30 variants)  
> Research Date: 2025-02-24  
> Method: Relume API (`variants` field) + UI verification via MCP Playwright

---

## Overview

The Contact category contains **30 variants** (Contact 1–30) organized into **8 families** across **3 section types**. It is the most structurally complex category mapped so far, with one family featuring 4 dynamic axes and context-dependent axis visibility.

### Key Findings

| Metric | Value |
|--------|-------|
| Total Variants | 30 |
| Families (with axes) | 8 (A–H) |
| Standalone | 0 |
| Section Types | 3 (Contact Form, Contact Info, Locations) |
| Max axes per family | 4 (Text, Asset, Form, Asset Placement — Family A) |
| Dynamic axis visibility | Yes — extensive in Family A |
| Replace Component panel entries | 12 (C13–C24 only) |
| Add Section panel entries | 24 (C1–C24; C25–C30 under Locations) |
| API category slug | `contact-sections` |
| Internal slug format | `section_contact{N}` |

**Critical Pattern — Dynamic Axis Visibility (Family A):**
- **Text = Center** → Asset axis **HIDDEN** (only Text + Form visible)
- **Text = Left, Asset = None** → all of Text, Asset, Form visible
- **Text = Left, Asset = Image/Map** → Text **HIDDEN**, Form **HIDDEN**, Asset Placement **APPEARS**
- **Text = Left, Asset = Icon** → Text **HIDDEN**, Asset Placement **HIDDEN**, Form visible
- **Asset Placement = Left** → Asset options **RESTRICTED** to Image/Map only (None and Icon disappear)

**Unique Panel Behavior — C1–C12 Missing from Replace Panel:**
Unlike all other mapped categories, the Replace Component panel does NOT list C1–C12 as entries. When opening the Replace panel from ANY Contact Section variant (including C1), only C13–C24 appear. C1–C12 are accessible exclusively through the Add Section panel and axis toggles. C25–C30 (Locations) have their own separate section type.

---

## Section Type Separation

Relume organizes the 30 Contact variants into **3 distinct section types**:

| Section Type | Families | Variants | Replace Panel | Add Section Panel |
|-------------|----------|----------|---------------|-------------------|
| **Contact Form Section** | A, B | C1–C12 (12) | NOT listed | Listed as C1–C12 |
| **Contact Section** | C, D, E, F | C13–C24 (12) | C13–C24 shown | Listed as C13–C24 |
| **Locations Section** | G, H | C25–C30 (6) | Separate panel | Separate category |

When you load any Contact Section (C1–C24) and open Replace Component, the panel shows **12 entries: C13–C24**. The Contact Form variants (C1–C12) are omitted from the Replace panel but can be added from the Add Section panel.

---

## Summary of Families

| Family | Name | Section Type | Axes | Variants | Component IDs |
|--------|------|-------------|------|----------|---------------|
| A | Contact Form | Contact Form | Text†, Asset†, Form†, Asset Placement† | 10 | 1, 2, 3, 4, 7, 8, 9, 10, 11, 12 |
| B | Icon Contact Form | Contact Form | Form | 2 | 5, 6 |
| C | Info + Side Asset | Contact | Asset | 2 | 13, 14 |
| D | Info + Center Asset | Contact | Asset | 2 | 15, 16 |
| E | Card Grid Left | Contact | Heading, Columns | 4 | 17, 19, 22, 24 |
| F | Card Grid Center | Contact | Heading, Columns | 4 | 18, 20, 21, 23 |
| G | Location Detail | Locations | Text, Asset | 4 | 25, 26, 27, 28 |
| H | Location Tab | Locations | Asset | 2 | 29, 30 |

_† All 4 axes in Family A are dynamically shown/hidden. No state shows all 4 simultaneously._

---

## Family A — Contact Form (10 variants)

The most complex family in the Contact category. Features a **4-axis system** where axis visibility changes dramatically based on the current state. The axes form 5 distinct "states" with different visible controls.

### Axes

| Axis | Type | All Values | Behavior |
|------|------|-----------|----------|
| **Text** | Icon toggle | Left, Center | Visible in States 1, 2. Hidden in States 3, 4, 5. |
| **Asset** | Icon toggle | None, Image, Icon, Map | Visible in States 2–5. Hidden in State 1. Options vary by state. |
| **Form** | Text toggle | Short, Long | Visible in States 1, 2, 4. Hidden in States 3, 5. |
| **Asset Placement** | Icon toggle | Left, Right | Visible in States 3, 5. Hidden in States 1, 2, 4. |

### State Machine

```
┌─────────────────────────────┐
│ STATE 1: Text=Center        │
│ Visible: Text, Form         │
│ Hidden: Asset, Placement    │
│ Variants: C1, C2            │
└──────────┬──────────────────┘
           │ Text → Left
           ▼
┌─────────────────────────────┐
│ STATE 2: Text=Left,         │
│          Asset=None          │
│ Visible: Text, Asset, Form  │
│ Hidden: Placement            │
│ Variants: C3, C4            │
├──────┬──────────┬───────────┤
│Asset=│ Asset=   │ Asset=    │
│Image │ Map      │ Icon      │
│ or   │          │           │
│Map   │          │           │
▼      ▼          ▼           
┌─────────────────┐  ┌───────────────────┐
│ STATE 3: Asset=  │  │ STATE 4: Asset=   │
│ Image/Map,       │  │ Icon              │
│ Placement=Right  │  │ Visible: Asset,   │
│ Visible: Asset,  │  │   Form            │
│   Placement      │  │ Hidden: Text,     │
│ Hidden: Text,    │  │   Placement       │
│   Form           │  │ Variants: C11, C12│
│ Variants: C7, C8 │  └───────────────────┘
└────────┬─────────┘
         │ Placement → Left
         ▼
┌─────────────────────────────┐
│ STATE 5: Asset=Image/Map,   │
│          Placement=Left      │
│ Visible: Asset(2), Placement │
│ Hidden: Text, Form           │
│ Asset restricted: Image, Map │
│ Variants: C9, C10           │
└─────────────────────────────┘
```

### State 1 — Text Center (Text + Form visible)

| Variant | Text | Form | Description |
|---------|------|------|-------------|
| Contact 1 | Center | Short | Centered heading + short contact form |
| Contact 2 | Center | Long | Centered heading + long contact form |

### State 2 — Text Left, Asset None (Text + Asset + Form visible)

| Variant | Text | Asset | Form | Description |
|---------|------|-------|------|-------------|
| Contact 3 | Left | None | Short | Left-aligned heading + short form |
| Contact 4 | Left | None | Long | Left-aligned heading + long form |

- **Asset axis shows 4 options**: None (selected), Image, Icon, Map
- Note: C4 (Form=Long) has restricted Asset options — only None and Icon (no Image/Map)

### State 3 — Asset Image/Map, Placement Right (Asset + Placement visible)

| Variant | Asset | Placement | Description |
|---------|-------|-----------|-------------|
| Contact 7 | Image | Right | Form left + image right |
| Contact 8 | Map | Right | Form left + map right |

- **Asset axis shows 4 options**: None, Image, Icon, Map
- Selecting Asset=None returns to State 2 (C3)
- Selecting Asset=Icon goes to State 4 (C11)

### State 4 — Asset Icon (Asset + Form visible)

| Variant | Asset | Form | Description |
|---------|-------|------|-------------|
| Contact 11 | Icon | Short | Form + icon contact details, short form |
| Contact 12 | Icon | Long | Form + icon contact details, long form |

- **Asset axis**: C11 shows 4 options (None/Image/Icon/Map); C12 shows 2 options (None/Icon)
- This mirrors the Form-dependent Asset restriction: Form=Long limits available Assets

### State 5 — Asset Image/Map, Placement Left (Asset(restricted) + Placement visible)

| Variant | Asset | Placement | Description |
|---------|-------|-----------|-------------|
| Contact 9 | Image | Left | Image left + form right |
| Contact 10 | Map | Left | Map left + form right |

- **Asset axis RESTRICTED**: Only 2 options (Image, Map) — None and Icon disappear
- To reach None/Icon, must first switch Placement → Right (returns to State 3)

### Navigation Matrix

| From (State) | → Text=Center | → Text=Left | → Asset=None | → Asset=Image | → Asset=Icon | → Asset=Map | → Form=Short | → Form=Long | → Place=Left | → Place=Right |
|---|---|---|---|---|---|---|---|---|---|---|
| **C1** (S1) | — | C3 | — | — | — | — | — | C2 | — | — |
| **C2** (S1) | — | C4 | — | — | — | — | C1 | — | — | — |
| **C3** (S2) | C1 | — | — | C7 | C11 | C8 | — | C4 | — | — |
| **C4** (S2) | C2 | — | — | — | C12 | — | C3 | — | — | — |
| **C7** (S3) | — | — | C3 | — | C11 | C8 | — | — | C9 | — |
| **C8** (S3) | — | — | C3 | C7 | C11 | — | — | — | C10 | — |
| **C9** (S5) | — | — | — | — | — | C10 | — | — | — | C7 |
| **C10** (S5) | — | — | — | C9 | — | — | — | — | — | C8 |
| **C11** (S4) | — | — | C3 | C7 | — | C8 | — | C12 | — | — |
| **C12** (S4) | — | — | C4 | — | — | — | C11 | — | — | — |

_Cells marked "—" indicate the axis is hidden or the option is the current value._

### Form-Dependent Asset Restriction

A critical asymmetry in Family A:

| Form Value | Available Asset Options | Reason |
|-----------|------------------------|--------|
| **Short** | None, Image, Icon, Map (all 4) | Image/Map states exist without form |
| **Long** | None, Icon (only 2) | No Image+Long or Map+Long variants exist |

When Form=Long (C2, C4, C12), switching to Asset=Image/Map is impossible because those states (C7–C10) don't have a Form axis — they'd lose the Long form selection with no way to restore it.

---

## Family B — Icon Contact Form (2 variants)

A simple two-variant family with contact icons and a form.

### Axes

| Axis | Type | Values |
|------|------|--------|
| **Form** | Text toggle | Short, Long |

### Variant Table

| Variant | Form | Tags |
|---------|------|------|
| Contact 5 | Short | 2 Columns, Text Align Left, Form, Icons |
| Contact 6 | Long | 2 Columns, Text Align Left, Form, Icons |

---

## Family C — Contact Info + Side Asset (2 variants)

Contact information cards with an image or map alongside, positioned to the side.

### Axes

| Axis | Type | Values |
|------|------|--------|
| **Asset** | Icon toggle | Image, Map |

### Variant Table

| Variant | Asset | Tags |
|---------|-------|------|
| Contact 13 | Image | 2 Columns, Text Align Left, Icons, Image, Buttons |
| Contact 14 | Map | 2 Columns, Text Align Left, Icons, Buttons, Map |

---

## Family D — Contact Info + Center Asset (2 variants)

Similar to Family C but with image/map centered or positioned at the bottom.

### Axes

| Axis | Type | Values |
|------|------|--------|
| **Asset** | Icon toggle | Image, Map |

### Variant Table

| Variant | Asset | Tags |
|---------|-------|------|
| Contact 15 | Image | 2 Columns, Image/Video Center, Text Align Left, Icons, Image, Buttons |
| Contact 16 | Map | 2 Columns, Text Align Left, Icons, Buttons, Map |

---

## Family E — Contact Card Grid, Left-Aligned (4 variants)

A grid of contact information cards (email, phone, office) with left-aligned text.

### Axes

| Axis | Type | Values |
|------|------|--------|
| **Heading** | Text toggle | Yes, No |
| **Columns** | Numeric toggle | 3, 4 |

### Variant Table

| Variant | Heading | Columns | Tags |
|---------|---------|---------|------|
| Contact 17 | No | 3 | 3 Columns, Text Align Left, Icons, Buttons |
| Contact 19 | Yes | 3 | 3 Columns, Text Align Left, Icons, Buttons |
| Contact 22 | No | 4 | 4 Columns, Text Align Left, Icons, Buttons |
| Contact 24 | Yes | 4 | 4 Columns, Text Align Left, Icons, Buttons |

### Navigation

| From | Heading=Yes | Heading=No | Col=3 | Col=4 |
|------|-------------|------------|-------|-------|
| C17 | → C19 | _(stay)_ | _(stay)_ | → C22 |
| C19 | _(stay)_ | → C17 | _(stay)_ | → C24 |
| C22 | → C24 | _(stay)_ | → C17 | _(stay)_ |
| C24 | _(stay)_ | → C22 | → C19 | _(stay)_ |

---

## Family F — Contact Card Grid, Center-Aligned (4 variants)

Identical layout concept to Family E but with center-aligned text. **Not navigable from Family E** — no Text axis connects them.

### Axes

| Axis | Type | Values |
|------|------|--------|
| **Heading** | Text toggle | Yes, No |
| **Columns** | Numeric toggle | 3, 4 |

### Variant Table

| Variant | Heading | Columns | Tags |
|---------|---------|---------|------|
| Contact 18 | No | 3 | 3 Columns, Text Align Center, Icons, Buttons |
| Contact 20 | Yes | 3 | 3 Columns, Text Align Center, Icons, Buttons |
| Contact 21 | No | 4 | 4 Columns, Text Align Center, Icons, Buttons |
| Contact 23 | Yes | 4 | 4 Columns, Text Align Center, Icons, Buttons |

### Navigation

| From | Heading=Yes | Heading=No | Col=3 | Col=4 |
|------|-------------|------------|-------|-------|
| C18 | → C20 | _(stay)_ | _(stay)_ | → C21 |
| C20 | _(stay)_ | → C18 | _(stay)_ | → C23 |
| C21 | → C23 | _(stay)_ | → C18 | _(stay)_ |
| C23 | _(stay)_ | → C21 | → C20 | _(stay)_ |

---

## Family G — Location Detail (4 variants)

Location-specific sections with address info, supporting left or center text alignment and either an image gallery or embedded map.

### Axes

| Axis | Type | Values |
|------|------|--------|
| **Text** | Icon toggle | Left, Center |
| **Asset** | Icon toggle | Image, Map |

### Variant Table

| Variant | Text | Asset | Tags |
|---------|------|-------|------|
| Contact 25 | Center | Map | 2 Columns, Text Align Center, Map, Buttons, Locations Section |
| Contact 26 | Center | Image | 2 Columns, Text Align Center, Buttons, Multiple Images, Locations Section |
| Contact 27 | Left | Map | 2 Columns, Text Align Left, Map, Buttons, Locations Section |
| Contact 28 | Left | Image | 2 Columns, Text Align Left, Buttons, Multiple Images, Locations Section |

### Navigation

| From | Text=Left | Text=Center | Asset=Image | Asset=Map |
|------|-----------|-------------|-------------|-----------|
| C25 | → C27 | _(stay)_ | → C26 | _(stay)_ |
| C26 | → C28 | _(stay)_ | _(stay)_ | → C25 |
| C27 | _(stay)_ | → C25 | → C28 | _(stay)_ |
| C28 | _(stay)_ | → C26 | _(stay)_ | → C27 |

---

## Family H — Location Tab (2 variants)

Location sections with a tab switcher for multiple locations, supporting image or map display.

### Axes

| Axis | Type | Values |
|------|------|--------|
| **Asset** | Icon toggle | Image, Map |

### Variant Table

| Variant | Asset | Tags |
|---------|-------|------|
| Contact 29 | Map | 2 Columns, Text Align Left, Tabs, Map, Locations Section |
| Contact 30 | Image | 2 Columns, Text Align Left, Tabs, Image, Multiple Images, Locations Section |

---

## Axis Definitions

### Text Axis

| Value | Effect |
|-------|--------|
| **Center** | Heading and description centered. In Family A, hides Asset axis. |
| **Left** | Heading and description left-aligned. In Family A, reveals Asset axis. |

Present in: Family A (dynamic), Family G (static).  
NOT present in: Families E and F (despite having different text alignments — they're separate families instead).

### Asset Axis

| Value | Family A Effect | Family C/D/G/H Effect |
|-------|-----------------|------------------------|
| **None** | No side content. Text + Asset + Form visible. | — |
| **Image** | Side image. Text and Form hidden, Asset Placement appears. | Static image alongside content |
| **Icon** | Icon contact details. Text hidden, Form visible. | — |
| **Map** | Embedded map. Text and Form hidden, Asset Placement appears. | Embedded map alongside content |

- Family A: 4 values (None/Image/Icon/Map), dynamically restricted by Form and Placement
- Families C, D, H: 2 values (Image/Map)
- Family G: 2 values (Image/Map)

### Form Axis

| Value | Effect |
|-------|--------|
| **Short** | Basic contact form (Name, Email, Message, Terms, Submit) |
| **Long** | Extended form (adds Phone, Topic dropdown, Radio group) |

Present in: Families A, B. Hidden in Family A when Asset = Image/Map.

### Asset Placement Axis

| Value | Effect |
|-------|--------|
| **Left** | Image/Map positioned to the left of the form |
| **Right** | Image/Map positioned to the right of the form |

Present only in Family A, States 3 and 5. When Placement = Left, Asset options are restricted to Image/Map only.

### Heading Axis

| Value | Effect |
|-------|--------|
| **Yes** | Section heading (tagline + title + description) shown above the contact cards |
| **No** | No section heading — cards displayed directly |

Present in: Families E, F.

### Columns Axis

| Value | Effect |
|-------|--------|
| **3** | Three contact info cards per row |
| **4** | Four contact info cards per row |

Present in: Families E, F.

---

## Replace Component Panel

### Contact Section Panel (12 entries)

The Replace Component panel for Contact Sections shows **only C13–C24**, sorted as:

Contact 13, Contact 14, Contact 15, Contact 16, Contact 17, Contact 18, Contact 19, Contact 20, Contact 21, Contact 22, Contact 23, Contact 24

**Missing entries:** C1–C12 (Contact Form variants) do NOT appear in this panel despite being the same "Contact Section" category. They are only accessible from the Add Section panel. This is unique among all mapped Relume categories.

### Add Section Panel (24 entries)

The Add Section panel's Contact category shows **C1–C24** in sequential order. This is the only way to add Contact Form variants (C1–C12) to a wireframe.

### Locations Section Panel

C25–C30 appear under a separate section type and are not shown in the Contact Section Replace panel.

---

## Complete Slug Map

| Contact # | Relume Slug | Family | State/Axes |
|-----------|-------------|--------|------------|
| 1 | `section_contact1` | A | Text=Center, Form=Short |
| 2 | `section_contact2` | A | Text=Center, Form=Long |
| 3 | `section_contact3` | A | Text=Left, Asset=None, Form=Short |
| 4 | `section_contact4` | A | Text=Left, Asset=None, Form=Long |
| 5 | `section_contact5` | B | Form=Short |
| 6 | `section_contact6` | B | Form=Long |
| 7 | `section_contact7` | A | Asset=Image, Placement=Right |
| 8 | `section_contact8` | A | Asset=Map, Placement=Right |
| 9 | `section_contact9` | A | Asset=Image, Placement=Left |
| 10 | `section_contact10` | A | Asset=Map, Placement=Left |
| 11 | `section_contact11` | A | Asset=Icon, Form=Short |
| 12 | `section_contact12` | A | Asset=Icon, Form=Long |
| 13 | `section_contact13` | C | Asset=Image |
| 14 | `section_contact14` | C | Asset=Map |
| 15 | `section_contact15` | D | Asset=Image |
| 16 | `section_contact16` | D | Asset=Map |
| 17 | `section_contact17` | E | Heading=No, Columns=3 |
| 18 | `section_contact18` | F | Heading=No, Columns=3 |
| 19 | `section_contact19` | E | Heading=Yes, Columns=3 |
| 20 | `section_contact20` | F | Heading=Yes, Columns=3 |
| 21 | `section_contact21` | F | Heading=No, Columns=4 |
| 22 | `section_contact22` | E | Heading=No, Columns=4 |
| 23 | `section_contact23` | F | Heading=Yes, Columns=4 |
| 24 | `section_contact24` | E | Heading=Yes, Columns=4 |
| 25 | `section_contact25` | G | Text=Center, Asset=Map |
| 26 | `section_contact26` | G | Text=Center, Asset=Image |
| 27 | `section_contact27` | G | Text=Left, Asset=Map |
| 28 | `section_contact28` | G | Text=Left, Asset=Image |
| 29 | `section_contact29` | H | Asset=Map |
| 30 | `section_contact30` | H | Asset=Image |

---

## Implementation Notes

### For Scytle Design System

1. **Family A** is the implementation priority — it's the most common contact form pattern with the most complex dynamic axis behavior.

2. **Section type separation** should be considered in the UI:
   - Contact Form components (C1–C12) should allow users to add forms
   - Contact Info components (C13–C24) are non-form layouts for displaying contact details
   - Location components (C25–C30) are for multi-location businesses

3. **Family A state machine** requires careful implementation:
   - Track 4 underlying values (Text, Asset, Form, Placement) even when axes are hidden
   - When switching Asset from Image/Map → None, restore the hidden Text value (Left)
   - When switching Asset to Image/Map from Form=Long context, block the transition (only None and Icon available)

4. **Families E and F** are structurally identical but with different text alignment. Consider implementing as a single parameterized family with a fixed text alignment setting rather than 2 separate families.

5. **Form-dependent Asset restriction** (Family A) is a novel pattern not seen in other categories. When Form=Long, the Image and Map asset options are unavailable because those variants don't support the long form.

### Control Definition Sketch

```typescript
// Family A — Contact Form
{
  axes: {
    text: { values: ['Left', 'Center'], default: 'Center', dynamicVisibility: 'always' },
    asset: { values: ['None', 'Image', 'Icon', 'Map'], default: 'None', dynamicVisibility: 'text=Left', dynamicOptions: { 'form=Long': ['None', 'Icon'] } },
    form: { values: ['Short', 'Long'], default: 'Short', dynamicVisibility: 'asset=None|Icon' },
    assetPlacement: { values: ['Left', 'Right'], default: 'Right', dynamicVisibility: 'asset=Image|Map' },
  }
}

// Family B — Icon Contact Form
{
  axes: {
    form: { values: ['Short', 'Long'], default: 'Short' },
  }
}

// Family C/D — Contact Info + Asset
{
  axes: {
    asset: { values: ['Image', 'Map'], default: 'Image' },
  }
}

// Family E/F — Contact Card Grid
{
  axes: {
    heading: { values: ['Yes', 'No'], default: 'No' },
    columns: { values: [3, 4], default: 3 },
  }
}

// Family G — Location Detail
{
  axes: {
    text: { values: ['Left', 'Center'], default: 'Center' },
    asset: { values: ['Image', 'Map'], default: 'Map' },
  }
}

// Family H — Location Tab
{
  axes: {
    asset: { values: ['Image', 'Map'], default: 'Map' },
  }
}
```
