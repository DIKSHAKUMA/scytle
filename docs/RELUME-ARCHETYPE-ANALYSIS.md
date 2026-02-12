# Relume Figma Kit → Scytle Archetype Analysis

> Extracted from Relume Figma Kit (fileKey: `Ehft8P02yDqutz3LhXtJqZ`)
> Analysis date: 2025-07-17
> Purpose: Map Relume's flat variant library to Scytle's parametric family architecture

---

## Executive Summary

| Category | Relume Variants | Scytle Families (Current) | Families Needed | Effective Coverage After |
|----------|----------------|--------------------------|-----------------|-------------------------|
| Headers (→ hero) | 27 (44–70) | 4 | +2 new, +controls | ~25 variants via 6 families |
| Navbars | 32 (1–32) | 3 | +2 new, +controls | ~30 variants via 5 families |
| Layouts (→ features/content) | 682 (1–682) | 6 | +6 new, +controls | ~500+ variants via 12 families |
| **Total (3 pages)** | **741** | **13** | **+10 new** | **~555+ variants via 23 families** |

**Key insight**: Relume uses 1 component per visual variant. Scytle's parametric controls mean one family with 3–5 toggle-groups produces 10–30 visual variants. Adding 10 new families + expanding controls on existing ones will match ~75% of Relume's 741 variants from just these 3 pages.

---

## 1. Headers Page → `hero` Category

### Relume Inventory
- **27 variants**: Header 44 through Header 70
- **Breakpoints**: Each has Desktop (1440px) + Mobile variant
- **Documentation**: `https://library.relume.io/components/header-{N}`

### Structural Archetypes Identified

#### Archetype A: **Text-Only Left-Aligned** (Headers 44, 46, 54–55, 64, 69–70)
```
┌──────────────────────────────────────────────┐
│  Tagline                                     │
│  Short heading here                          │
│  Lorem ipsum paragraph text...               │
│  [Button]  [Button >]                        │
└──────────────────────────────────────────────┘
```
- Single column, left-aligned
- Optional tagline, 1-2 buttons
- ~417px height (compact)
- **Maps to**: `hero-centered` with `textAlign: 'left'` control
- **Control gap**: need `textAlign` toggle-group on hero-centered

#### Archetype B: **Two-Column Split (Text + Image)** (Headers 50–53, 62–63, 65–68)
```
┌──────────────────────────────────────────────┐
│  Tagline              │                      │
│  Heading              │   ┌──────────────┐   │
│  Paragraph            │   │  Placeholder │   │
│  [Button] [Button >]  │   │    Image     │   │
│                       │   └──────────────┘   │
└──────────────────────────────────────────────┘
```
- Text left, image right (or reversed)
- ~537–588px height
- **Maps to**: `hero-split` ✅ (already exists)
- **Control additions needed**: image position (left/right), tagline toggle

#### Archetype C: **Two-Column Text-Only Split** (Headers 49, 56–57, 60–61)
```
┌──────────────────────────────────────────────┐
│  Heading              │  Paragraph text       │
│                       │  describing the       │
│                       │  product in detail    │
└──────────────────────────────────────────────┘
```
- Heading left column, description right column
- No image, no tagline in some variants
- ~412–520px height
- **Maps to**: NEW `hero-minimal`
- **Controls**: showTagline, buttonCount, textBalance

#### Archetype D: **Split with Signup Form** (Headers 48, 58–59)
```
┌──────────────────────────────────────────────┐
│  Tagline              │  Paragraph text       │
│  Heading              │  ┌─────────┐ [Sign]  │
│                       │  │Email    │  Up     │
│                       │  └─────────┘          │
│                       │  Terms & Conditions ↗ │
└──────────────────────────────────────────────┘
```
- Text left, form/CTA right
- Includes input field + submit button + fine print
- ~636px height
- **Maps to**: NEW `hero-form`
- **Controls**: formType (email/newsletter/waitlist), showTerms, buttonStyle

### Hero Family Action Plan

| Family | Status | New Controls Needed |
|--------|--------|-------------------|
| `hero-split` | ✅ Exists | + `imagePosition: left\|right`, + `showTagline` |
| `hero-centered` | ✅ Exists | + `textAlign: left\|center`, + `maxWidth: narrow\|wide` |
| `hero-image-bg` | ✅ Exists | + `overlayOpacity`, + `textAlign` |
| `hero-video` | ✅ Exists | (adequate) |
| `hero-minimal` | 🆕 Create | `showTagline`, `buttonCount: 0\|1\|2`, `splitRatio` |
| `hero-form` | 🆕 Create | `formType`, `showTerms`, `formPosition: inline\|stacked` |

**Result**: 6 families × ~5 control combos each = ~30 visual variants (covers all 27 Relume headers)

---

## 2. Navbars Page → `navbar` Category

### Relume Inventory
- **32 variants**: Navbar 1 through Navbar 32
- **Breakpoints**: Each has Desktop + Mobile (with hamburger menu expansion)
- **Documentation**: `https://library.relume.io/components/navbar-{N}`

### Structural Archetypes Identified

#### Archetype A: **Standard Bar** (Navbars 1–3, 11–12)
```
┌──────────────────────────────────────────────┐
│  [Logo]  Link  Link  Link  Link    [Button]  │
└──────────────────────────────────────────────┘
```
- Desktop height: 72px (single row)
- Logo left, links center/right, CTA button right
- Mobile: hamburger → vertical menu
- **Maps to**: `navbar-standard` ✅
- **Control adds**: `ctaStyle: button|link|none`, `linkCount: 3|4|5|6`

#### Archetype B: **Centered Logo** (Navbars 13–15)
```
┌──────────────────────────────────────────────┐
│  Link  Link   [Logo]   Link  Link  [Button]  │
└──────────────────────────────────────────────┘
```
- Desktop height: 96px (slightly taller)
- Logo centered, links split on both sides
- **Maps to**: `navbar-centered` ✅
- **Control adds**: `showSearch`, `showAuth`

#### Archetype C: **Double Row / Sub-nav** (Navbars 4, 16–17)
```
┌──────────────────────────────────────────────┐
│  [Logo]          Phone  Email       [Button]  │
├──────────────────────────────────────────────┤
│  Link   Link   Link   Link   Link   Link     │
└──────────────────────────────────────────────┘
```
- Desktop height: 900px (includes expanded dropdown preview in Figma)
- Two navigation tiers: utility bar + main nav
- **Maps to**: NEW `navbar-double`
- **Controls**: `showUtilityBar`, `utilityContent: contact|social|search`

#### Archetype D: **Mega Menu** (Navbars 5–10, 18–30)
```
┌──────────────────────────────────────────────┐
│  [Logo]  Link  Link▾  Link  Link    [Button] │
├──────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ Cat1 │ │ Cat2 │ │ Cat3 │ │ Cat4 │        │
│  │ Link │ │ Link │ │ Link │ │ Link │        │
│  │ Link │ │ Link │ │ Link │ │ Link │        │
│  └──────┘ └──────┘ └──────┘ └──────┘        │
└──────────────────────────────────────────────┘
```
- Massive expanded states (475–900px desktop height)
- Multi-column dropdowns, image thumbnails, category grids
- 26 variants (!) — most variety in this archetype
- **Maps to**: `navbar-mega` ✅
- **Control adds**: `megaColumns: 2|3|4`, `showImages`, `megaStyle: grid|list`

#### Archetype E: **Sidebar Navigation** (Navbars 31–32)
```
┌────────┬─────────────────────────────────────┐
│  Logo  │                                     │
│  Link  │         Main Content Area           │
│  Link  │                                     │
│  Link  │                                     │
│  Link  │                                     │
│ [CTA]  │                                     │
└────────┴─────────────────────────────────────┘
```
- Desktop height: ~900px (full viewport)
- Vertical sidebar, persistent
- **Maps to**: NEW `navbar-sidebar`
- **Controls**: `collapsed: true|false`, `position: left|right`

### Navbar Family Action Plan

| Family | Status | New Controls Needed |
|--------|--------|-------------------|
| `navbar-standard` | ✅ Exists | + `ctaStyle`, + `linkCount`, + `showSearch` |
| `navbar-centered` | ✅ Exists | + `showAuth`, + `showSearch` |
| `navbar-mega` | ✅ Exists | + `megaColumns`, + `showImages`, + `megaStyle` |
| `navbar-double` | 🆕 Create | `showUtilityBar`, `utilityContent`, `navSpacing` |
| `navbar-sidebar` | 🆕 Create | `collapsed`, `position`, `showFooter` |

**Result**: 5 families × ~4 control combos each = ~20 visual variants (covers 30 of 32 Relume navbars)

---

## 3. Layouts Page → `features` + `content` Categories

### Relume Inventory
- **682 variants**: Layout 1 through Layout 682
- **Breakpoints**: Each has Desktop (1440px) + Mobile
- **Documentation**: `https://library.relume.io/components/layout-{N}`
- **This is by far the largest category** — the Feature/Layout page is 204KB of metadata

### Height-Based Classification

From frame height analysis, variants cluster into natural groups:

| Height Range | Count (est.) | Pattern |
|-------------|------|---------|
| 400–650px | ~80 | Simple text blocks, minimal content |
| 650–900px | ~150 | Standard feature sections with icons/images |
| 900–1200px | ~250 | Complex sections with grids, lists, cards |
| 1200–1550px | ~200 | Multi-element sections with alternating rows |

### Structural Archetypes Identified

#### Archetype A: **Split Text + Image** (Layouts 1–3, 25–27)
```
┌──────────────────────────────────────────────┐
│  Tagline              │   ┌──────────────┐   │
│  Medium heading       │   │  Placeholder │   │
│  Paragraph text       │   │    Image     │   │
│  [Button] [Button >]  │   └──────────────┘   │
└──────────────────────────────────────────────┘
```
- Classic 50/50 split, text left + image right (or reversed)
- **Maps to**: `content-split` ✅ or `features-alternating` ✅
- **Control adds**: `imagePosition: left|right`, `imageAspect: square|landscape|portrait`

#### Archetype B: **Text-Only Content Block** (Layouts 35–46)
```
┌──────────────────────────────────────────────┐
│  Long heading is what you see here in this   │
│  feature section                             │
│  Lorem ipsum paragraph text...               │
└──────────────────────────────────────────────┘
```
- Single column, max-width constrained, no image
- H3 heading + paragraph only
- **Maps to**: `content-text` ✅
- **Control adds**: `maxWidth: narrow|medium|wide`, `textAlign: left|center`

#### Archetype C: **Split with Feature Sub-list** (Layouts 47–50, 59–64)
```
┌──────────────────────────────────────────────┐
│  Tagline              │  Paragraph text       │
│  Medium heading       │  ┌─────┐  ┌─────┐   │
│                       │  │Sub 1│  │Sub 2│   │
│                       │  │text │  │text │   │
│                       │  └─────┘  └─────┘   │
│                       │  [Button] [Button >]  │
└──────────────────────────────────────────────┘
```
- Heading left, description + feature sub-items right
- Sub-items as 2-column grid of title+description pairs
- **Maps to**: NEW `content-feature-list`
- **Controls**: `subItemColumns: 1|2`, `showSubIcons`, `listLayout: grid|stack`

#### Archetype D: **Feature Cards Grid** (Layouts 4–12, 28–34)
```
┌──────────────────────────────────────────────┐
│  Tagline                                     │
│  Medium heading    Paragraph text            │
│  ┌────────┐  ┌────────┐  ┌────────┐         │
│  │ [icon] │  │ [icon] │  │ [icon] │         │
│  │ Title  │  │ Title  │  │ Title  │         │
│  │ desc   │  │ desc   │  │ desc   │         │
│  └────────┘  └────────┘  └────────┘         │
└──────────────────────────────────────────────┘
```
- Section heading top, then grid of feature cards below
- Cards have icon/number + title + description
- 2×2, 3×1, 3×2, 2×3 grid arrangements
- **Maps to**: `features-grid` ✅
- **Control adds**: `columns: 2|3|4`, `showIcons: true|false`, `cardStyle: flat|bordered|shadow`

#### Archetype E: **Alternating Image Rows** (Layouts 13–24, 51–58)
```
┌──────────────────────────────────────────────┐
│  Tagline                                     │
│  Medium heading    Paragraph text            │
│  ┌──────────┐  Text + bullets               │
│  │  Image   │  Feature description 1         │
│  └──────────┘  Feature description 2         │
│  Text + bullets  ┌──────────┐               │
│  Feature desc 3  │  Image   │               │
│  Feature desc 4  └──────────┘               │
└──────────────────────────────────────────────┘
```
- Section header, then alternating image+text rows
- **Maps to**: `features-alternating` ✅
- **Control adds**: `rowCount: 2|3|4`, `firstImagePosition: left|right`

#### Archetype F: **Icon Feature List (Vertical)** (Layouts 65–78)
```
┌──────────────────────────────────────────────┐
│  Tagline                                     │
│  Heading        Description text              │
│  ─────────────────────────────────────────── │
│  [icon]  Feature title  │  Description text   │
│  [icon]  Feature title  │  Description text   │
│  [icon]  Feature title  │  Description text   │
└──────────────────────────────────────────────┘
```
- Vertical stack of icon + title + description items
- Sometimes 2-column layout with heading left, list right
- **Maps to**: `features-list` ✅
- **Control adds**: `iconPosition: left|top`, `showDividers`, `layout: full|split`

#### Archetype G: **Stats/Metrics Section** (est. Layouts ~100–150)
```
┌──────────────────────────────────────────────┐
│  Heading        Description text              │
│  ┌────┐    ┌────┐    ┌────┐    ┌────┐       │
│  │ 50%│    │ 3x │    │99% │    │10k+│       │
│  │stat│    │stat│    │stat│    │stat│       │
│  └────┘    └────┘    └────┘    └────┘       │
└──────────────────────────────────────────────┘
```
- Maps to existing `stats-cards`, `stats-row`, `stats-split`
- **These categories already exist in Scytle**

#### Archetype H: **Numbered Steps / Timeline** (est. Layouts ~200–300)
```
┌──────────────────────────────────────────────┐
│  Heading        Description text              │
│  ○───────○───────○───────○                   │
│  Step 1   Step 2   Step 3   Step 4           │
│  desc     desc     desc     desc             │
└──────────────────────────────────────────────┘
```
- Sequential process visualization
- Numbered or connected steps
- **Maps to**: NEW `content-steps`
- **Controls**: `stepCount: 3|4|5`, `style: numbered|timeline|connected`, `layout: horizontal|vertical`

#### Archetype I: **Tabbed Content** (est. Layouts ~300–400)
```
┌──────────────────────────────────────────────┐
│  Heading                                     │
│  [Tab 1] [Tab 2] [Tab 3]                    │
│  ┌──────────────────────────────────────┐    │
│  │  Tab content with text and image     │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```
- Content with tab switcher
- Each tab reveals different content panel
- **Maps to**: NEW `content-tabs`
- **Controls**: `tabCount: 2|3|4|5`, `tabStyle: underline|pill|boxed`, `showImages`

#### Archetype J: **Large Image + Overlaid Content** (est. Layouts ~400–500)
```
┌──────────────────────────────────────────────┐
│  ┌──────────────────────────────────────┐    │
│  │                                      │    │
│  │         Large Background Image       │    │
│  │                                      │    │
│  │   Heading overlaid on image          │    │
│  │   [Button]                           │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```
- Full-width/near-full-width image with text overlay
- **Maps to**: NEW `content-image-overlay`
- **Controls**: `textPosition: bottom-left|center|bottom-right`, `overlayDarkness: light|medium|dark`

#### Archetype K: **Comparison / Side-by-Side** (est. Layouts ~500–600)
```
┌──────────────────────────────────────────────┐
│  Heading                                     │
│  ┌───────────────┐  ┌───────────────┐       │
│  │  Option A     │  │  Option B     │       │
│  │  Feature 1 ✓  │  │  Feature 1 ✓  │       │
│  │  Feature 2 ✓  │  │  Feature 2 ✗  │       │
│  │  Feature 3 ✓  │  │  Feature 3 ✓  │       │
│  └───────────────┘  └───────────────┘       │
└──────────────────────────────────────────────┘
```
- Side-by-side content comparison
- **Maps to**: NEW `content-comparison`
- **Controls**: `columns: 2|3`, `showCheckmarks`, `highlightColumn`

#### Archetype L: **Multi-Image Gallery Layout** (est. Layouts ~600–682)
```
┌──────────────────────────────────────────────┐
│  Heading                                     │
│  ┌──────┐  ┌──────────────────┐             │
│  │ img1 │  │     img2         │             │
│  └──────┘  └──────────────────┘             │
│  ┌──────────────────┐  ┌──────┐             │
│  │     img3         │  │ img4 │             │
│  └──────────────────┘  └──────┘             │
└──────────────────────────────────────────────┘
```
- Grid of images with mixed sizes
- **Partially maps to**: `gallery-grid`, `gallery-masonry` ✅
- **Control adds**: `gridPattern: uniform|mixed|featured`, `imageCount: 3|4|6`

### Features/Content Family Action Plan

| Family | Category | Status | New Controls Needed |
|--------|----------|--------|-------------------|
| `features-alternating` | features | ✅ Exists | + `rowCount`, + `firstImagePosition` |
| `features-grid` | features | ✅ Exists | + `columns`, + `cardStyle`, + `showIcons` |
| `features-list` | features | ✅ Exists | + `iconPosition`, + `showDividers`, + `layout` |
| `content-split` | content | ✅ Exists | + `imagePosition`, + `imageAspect` |
| `content-text` | content | ✅ Exists | + `maxWidth`, + `textAlign` |
| `content-cards` | content | ✅ Exists | + `columns`, + `cardStyle` |
| `content-feature-list` | content | 🆕 Create | `subItemColumns`, `showSubIcons`, `listLayout` |
| `content-steps` | content | 🆕 Create | `stepCount`, `style`, `stepLayout` |
| `content-tabs` | content | 🆕 Create | `tabCount`, `tabStyle`, `showImages` |
| `content-image-overlay` | content | 🆕 Create | `textPosition`, `overlayDarkness`, `imageHeight` |
| `content-comparison` | content | 🆕 Create | `columns`, `showCheckmarks`, `highlightColumn` |
| `features-numbered` | features | 🆕 Create | `startNumber`, `layout: grid\|list`, `showDividers` |

**Result**: 12 families × ~8 control combos each = ~96 visual variants from families alone, covering the full structural range of 682 Relume variants

---

## 4. Implementation Priority Order

### Phase 1: Quick Wins (1-2 days each)
High-impact families that cover the most Relume variants per effort:

1. **`hero-minimal`** — 2-column text-only hero (covers ~8 Relume headers)
2. **`hero-form`** — Hero with signup form (covers ~5 Relume headers)
3. **`content-feature-list`** — Split with sub-item list (covers ~20 Relume layouts)
4. **`content-steps`** — Numbered steps/timeline (covers ~30 layouts)

### Phase 2: Medium Complexity (2-3 days each)
5. **`navbar-double`** — Two-row navigation (covers ~6 Relume navbars)
6. **`content-tabs`** — Tabbed content sections (covers ~25 layouts)
7. **`features-numbered`** — Numbered feature items (covers ~15 layouts)
8. **`content-image-overlay`** — Full image with overlay text (covers ~20 layouts)

### Phase 3: Advanced (3-5 days each)
9. **`navbar-sidebar`** — Vertical sidebar navigation (covers ~4 navbars)
10. **`content-comparison`** — Side-by-side comparison (covers ~15 layouts)

### Phase 4: Control Expansion (spread across all phases)
Add missing controls to ALL existing 13 families:
- **Universal**: `textAlign: left|center`, `maxWidth: narrow|wide`
- **Image families**: `imagePosition: left|right`, `imageAspect`
- **Grid families**: `columns: 2|3|4`, `cardStyle: flat|bordered|shadow`
- **Navbar families**: `showSearch`, `showAuth`, `ctaStyle`

---

## 5. Relume → Scytle Pattern Translation Guide

### Structural Pattern: How Relume 1:1 maps to Scytle parametric

```
Relume (flat)                    Scytle (parametric)
─────────────                    ──────────────────
Header 44 (text-left)     ─┐
Header 46 (text-left)      ├──→  hero-centered { textAlign: 'left' }
Header 54 (text-left-no-tag)│
Header 69 (text-left)     ─┘

Header 50 (split, img-right) ─┐
Header 51 (split, img-right)  ├──→ hero-split { imagePosition: 'right' }
Header 62 (split, img-right) ─┘

Header 52 (split, img-left)  ─┐
Header 53 (split, img-left)   ├──→ hero-split { imagePosition: 'left' }
Header 63 (split, img-left)  ─┘

Header 48 (split, form-right)  ─┐
Header 58 (split, form-right)   ├──→ hero-form { formPosition: 'right' }
Header 59 (split, form-right)  ─┘

Header 49 (text-split, no CTA) ─┐
Header 60 (text-split, 1 CTA)  ├──→ hero-minimal { buttonCount: 0|1|2 }
Header 61 (text-split, 2 CTAs) ─┘
```

### Content Architecture: Relume's Compositional Atoms

From analyzing the design context code, Relume uses these consistent inner components:

| Atom | Figma data-name | Purpose | Scytle Equivalent |
|------|-----------------|---------|-------------------|
| `Container` | `max-w-[1280px]` wrapper | Content width constraint | Section wrapper in Canvas |
| `Section Title` | Tagline + Heading + Description | Top header area | `EditableText` group |
| `Component` | Main layout flex container | Content arrangement | flex layout in Canvas |
| `Column` | `flex-[1_0_0]` child | Split column | Responsive column |
| `Actions` | Button row | CTA area | Button group |
| `List Item` | Icon + Title + Description | Feature item | Mapped to content items |
| `Tagline Wrapper` | Small label above heading | Category indicator | Optional EditableText |

### Responsive Pattern

All Relume variants follow the same responsive strategy:
- **Desktop**: Horizontal flex with `gap-[80px]`, `max-w-[1280px]`
- **Mobile**: Vertical flex with `flex-col gap-[20px]`, `w-[375px]`
- **Font scaling**: Desktop H1 = 56px → Mobile H1 = 40px
- **Padding**: Desktop = 64px → Mobile = 20px

This maps perfectly to Scytle's viewport-aware `CanvasProps`:
```typescript
const isMobile = viewport === 'mobile'
const isTablet = viewport === 'tablet'
```

---

## 6. Control Type Expansion Needed

Current Scytle control types (from `types.ts`):
- `toggle-group` ✅ (used)
- `switch` ✅ (used)
- `slider` ⚠️ (defined, unused)
- `select` ⚠️ (defined, unused)
- `color` ⚠️ (defined, unused)
- `number` ⚠️ (defined, unused)

**To support new families, activate:**
- `slider` — for `overlayDarkness`, `imageAspect`, `stepCount`
- `select` — for `gridPattern`, `tabStyle`, `megaStyle`
- `number` — for `columns` (if more than 3 options)

**New control type needed:**
- `range` or extend `slider` — for continuous values like overlay opacity

---

## 7. File Structure for New Families

```
src/lib/designs/
├── hero/
│   └── families/
│       ├── hero-centered.tsx     ← add textAlign control
│       ├── hero-split.tsx        ← add imagePosition control
│       ├── hero-image-bg.tsx     ← add textAlign, overlayOpacity
│       ├── hero-video.tsx        ← (adequate)
│       ├── hero-minimal.tsx      ← 🆕 NEW
│       └── hero-form.tsx         ← 🆕 NEW
├── navbar/
│   └── families/
│       ├── navbar-standard.tsx   ← add ctaStyle, linkCount
│       ├── navbar-centered.tsx   ← add showSearch, showAuth
│       ├── navbar-mega.tsx       ← add megaColumns, showImages
│       ├── navbar-double.tsx     ← 🆕 NEW
│       └── navbar-sidebar.tsx    ← 🆕 NEW
├── features/
│   └── families/
│       ├── features-alternating.tsx  ← add rowCount
│       ├── features-grid.tsx         ← add columns, cardStyle
│       ├── features-list.tsx         ← add iconPosition, layout
│       └── features-numbered.tsx     ← 🆕 NEW
└── content/
    └── families/
        ├── content-split.tsx         ← add imagePosition
        ├── content-text.tsx          ← add maxWidth, textAlign
        ├── content-cards.tsx         ← add columns
        ├── content-feature-list.tsx  ← 🆕 NEW
        ├── content-steps.tsx         ← 🆕 NEW
        ├── content-tabs.tsx          ← 🆕 NEW
        ├── content-image-overlay.tsx ← 🆕 NEW
        └── content-comparison.tsx    ← 🆕 NEW
```

---

## 8. Pages Not Yet Analyzed

The Relume Figma kit has many more pages beyond the 3 analyzed:

| Page | Expected Variants | Scytle Category | Priority |
|------|------------------|-----------------|----------|
| CTA | ~40-60 | cta | High |
| Footer | ~30-50 | footer | High |
| Pricing | ~20-30 | pricing | High |
| Testimonial | ~30-50 | testimonials | Medium |
| FAQ | ~15-25 | faq | Medium |
| Contact | ~20-30 | contact | Medium |
| Team | ~15-25 | team | Medium |
| Blog | ~20-30 | blog | Medium |
| Gallery | ~15-25 | gallery | Low |
| Logo | ~10-20 | logos | Low |
| Stats | ~15-25 | stats | Low |
| Banner | ~10-15 | (new category?) | Low |
| 404/Error | ~5-10 | (new category?) | Low |
| Signup/Login | ~15-25 | (new category?) | Medium |

**Recommendation**: Analyze CTA, Footer, and Pricing pages next — these are the highest-impact remaining categories.

---

## 9. Summary: Before & After

### Before (Current State)
- 15 categories, 45 families, 71 presets
- 2 control types actively used (toggle-group, switch)
- ~71 unique visual appearances

### After Phase 1–4 (Target State)
- 15 categories, **55 families**, ~120 presets
- 4+ control types actively used
- **~500+ unique visual appearances** (via parametric controls)
- Coverage of ~75% of Relume's component variants from analyzed pages

### Parametric Advantage
- Relume: 741 hand-built components for 3 pages → ~1,500+ for full library
- Scytle: 55 parametric families → ~500+ appearances, **growing to ~1,000+ with presets**
- Maintenance ratio: **27:1** (Relume needs 27× more components for equivalent coverage)
