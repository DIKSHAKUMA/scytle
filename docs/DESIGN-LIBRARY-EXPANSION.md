# Scytle Design Library Expansion — Master Plan

> **Goal**: Expand from 45 families / 71 presets → 85+ families / 200+ presets  
> **Reference**: Relume Figma Kit (`Ehft8P02yDqutz3LhXtJqZ`)  
> **Approach**: Parametric families with controls, NOT 1:1 copy of Relume variants  
> **See also**: [RELUME-ARCHETYPE-ANALYSIS.md](./RELUME-ARCHETYPE-ANALYSIS.md) for Figma data

---

## Editing Infrastructure

Two reusable components power in-canvas interactivity across all families:

### EditableIcon — Swappable Icon Picker

**File**: `src/components/wireframe/editable-icon.tsx`  
**Exports**: `EditableIcon` component, `resolveIcon(name: string)` helper

Replaces hardcoded Lucide icon imports with a dynamic icon system. Icons are stored as **string names** in content (e.g., `'Home'`, `'ShoppingCart'`) and resolved at render time via `resolveIcon()`.

- **~80 curated Lucide icons** organized in `ICON_MAP` — covers common categories (navigation, commerce, media, social, etc.)
- **Popover picker**: 8-column grid, search input, click-outside-to-close
- **Size variants**: `sm` (w-6 h-6), `md` (w-8 h-8), `lg` (w-10 h-10)
- Only interactive when `editable={true}` — no extra UI in view mode

**Usage in family Canvas**:
```tsx
import { EditableIcon } from '@/components/wireframe/editable-icon'

// Store icon names as string array in content
const icons = (content?.icons as string[]) ?? ['Home', 'ShoppingCart', 'UtensilsCrossed']

<EditableIcon
    iconName={icons[i] || 'Star'}
    onChange={(name) => {
        const updated = [...icons]
        updated[i] = name
        onContentChange?.('icons', updated)
    }}
    editable={editable}
    size="lg"
/>
```

**Families using EditableIcon**: `content-feature-list`, `content-steps` (icon style), `content-split-features`, `content-centered-feature`, `features-grid`, `features-list`

### DynamicList — Add/Remove List Items

**File**: `src/components/wireframe/dynamic-list.tsx`  
**Exports**: `AddItemButton`, `RemoveItemButton`, `addListItem<T>()`, `removeListItem<T>()`

Replaces fixed `itemCount` / `subItemCount` / `stepCount` toggle-group controls with runtime add/remove. Item count is now driven by content array length, not a control value.

- **AddItemButton**: Dashed border, full-width, appears at bottom of list in edit mode
- **RemoveItemButton**: Red circle (✕) at top-right corner, appears on `group-hover` via `opacity-0 group-hover:opacity-100`
- **`addListItem(arr, defaultValue)`**: Returns new array with item appended
- **`removeListItem(arr, index, minItems)`**: Returns new array with item removed, or `null` if at `minItems` floor

**Usage in family Canvas**:
```tsx
import { AddItemButton, RemoveItemButton, addListItem, removeListItem } from '@/components/wireframe/dynamic-list'

const addItem = () => {
    onContentChange?.('featureTitles', addListItem(titles, `Feature ${count + 1}`))
    onContentChange?.('featureDescriptions', addListItem(descriptions, 'Default text.'))
    onContentChange?.('icons', addListItem(icons, 'Star'))
}

const removeItem = (index: number) => {
    const newTitles = removeListItem(titles, index, 2) // min 2 items
    if (newTitles) {
        onContentChange?.('featureTitles', newTitles)
        // ... remove from all parallel arrays
    }
}

// Per item:
<div className="group relative">
    {editable && itemCount > 2 && <RemoveItemButton onClick={() => removeItem(i)} />}
    {/* ... item content ... */}
</div>

// At bottom:
{editable && <AddItemButton onClick={addItem} label="Add feature" />}
```

**Families using DynamicList**: `content-feature-list`, `content-steps`, `content-split-features`, `content-centered-feature`, `features-grid`, `features-list`, `features-numbered`

> **Key migration**: When upgrading a family from fixed count to DynamicList, remove the `itemCount` / `subItemCount` / `stepCount` control from `controlsDef` and `defaultControls`. The array length in `defaultContent` now determines the initial count.

---

## Process (Same for Every Category)

Every category follows this exact 6-step pipeline:

### Step 1: Figma Extraction
- Pull metadata from the Relume Figma page for this category
- Count all numbered variants (e.g., "Layout / 1 /" through "Layout / 682 /")
- Note frame heights for rough clustering

### Step 2: Structural Sampling
- Use `get_design_context` on 4-8 representative variants
- Extract the DOM tree / flex layout structure from the generated code
- Identify: number of columns, content elements, arrangement pattern

### Step 3: Archetype Classification
- Group all variants by structural skeleton (not visual style)
- Each unique skeleton = one potential TemplateFamily
- Variants that differ only in toggleable properties (image left vs right, button count, tagline visibility) collapse into ONE family with controls

### Step 4: Gap Analysis
- Compare archetypes against existing Scytle families
- Mark: ✅ already exists, 🔧 exists but needs controls, 🆕 needs new family

### Step 5: Implementation
- Build new families following `content-split.tsx` canonical pattern
- Each family has: `Canvas` component + `controlsDef` + `defaultControls` + `defaultContent`
- Add new controls to existing families via `controlsDef` expansion
- Create 3-5 `DesignPreset` per family (named control snapshots + `Thumbnail` component)

### Step 6: Registration
- Export from category `index.ts` (add to `{category}Families` array)
- Add presets to `presets.tsx` (add to `{category}Presets` array)
- Registry auto-picks up via existing `registry.ts` imports

---

## Current Inventory (Starting Point)

| Category | Families | Presets | Notes |
|----------|----------|--------|-------|
| hero | 4 | 5 | split, centered, image-bg, video |
| features | 3 | 5 | grid, list, alternating |
| content | 3 | 5 | text, split, cards |
| cta | 3 | 5 | banner, minimal, split |
| navbar | 3 | 5 | standard, centered, mega |
| footer | 4 | 6 | simple, columns, big, cta |
| testimonials | 3 | 5 | simple, cards, slider |
| pricing | 2 | 5 | cards, comparison |
| faq | 2 | 4 | accordion, two-column |
| contact | 3 | 5 | simple, split, map |
| gallery | 3 | 4 | grid, masonry, carousel |
| team | 3 | 4 | simple, cards, grid |
| blog | 3 | 5 | grid, list, featured |
| stats | 3 | 4 | row, cards, split |
| logos | 3 | 4 | row, grid, marquee |
| **Total** | **45** | **71** | |

### Updated Inventory (After Phase 1)

| Category | Families | Presets | Notes |
|----------|----------|--------|-------|
| hero | 4 | 5 | split, centered, image-bg, video |
| features | 4 | 8 | grid, list, alternating, **numbered** |
| content | 11 | 22 | text, split, cards, **feature-list, steps, tabs, image-overlay, comparison, split-features, video, centered-feature** |
| cta | 3 | 5 | banner, minimal, split |
| navbar | 3 | 5 | standard, centered, mega |
| footer | 4 | 6 | simple, columns, big, cta |
| testimonials | 3 | 5 | simple, cards, slider |
| pricing | 2 | 5 | cards, comparison |
| faq | 2 | 4 | accordion, two-column |
| contact | 3 | 5 | simple, split, map |
| gallery | 3 | 4 | grid, masonry, carousel |
| team | 3 | 4 | simple, cards, grid |
| blog | 3 | 5 | grid, list, featured |
| stats | 3 | 4 | row, cards, split |
| logos | 3 | 4 | row, grid, marquee |
| **Total** | **54** | **91** | |

### Updated Inventory (After Phase 2)

| Category | Families | Presets | Notes |
|----------|----------|--------|-------|
| hero | 7 | 15 | split, centered, image-bg, video, **minimal, form, card** |
| features | 4 | 8 | grid, list, alternating, numbered |
| content | 11 | 22 | text, split, cards, feature-list, steps, tabs, image-overlay, comparison, split-features, video, centered-feature |
| cta | 3 | 5 | banner, minimal, split |
| navbar | 3 | 5 | standard, centered, mega |
| footer | 4 | 6 | simple, columns, big, cta |
| testimonials | 3 | 5 | simple, cards, slider |
| pricing | 2 | 5 | cards, comparison |
| faq | 2 | 4 | accordion, two-column |
| contact | 3 | 5 | simple, split, map |
| gallery | 3 | 4 | grid, masonry, carousel |
| team | 3 | 4 | simple, cards, grid |
| blog | 3 | 5 | grid, list, featured |
| stats | 3 | 4 | row, cards, split |
| logos | 3 | 4 | row, grid, marquee |
| **Total** | **55** | **107** | |

---

## Phase Plan

### Phase 1: Layout / Content / Features (CURRENT)
**Priority**: Highest — this is the backbone of every website  
**Relume source**: Feature/Layout page (682 variants)  
**Timeline**: ~2 weeks

#### 1A. Existing Family Control Expansion
Upgrade 6 existing families with missing controls:

| Family | New Controls | Covers | Status |
|--------|-------------|--------|--------|
| `content-split` | `imageAspect: square\|landscape\|portrait` | +~10 Relume variants | ✅ |
| `content-text` | `showSecondParagraph` | adequate | ✅ |
| `content-cards` | `cardStyle: flat\|bordered\|shadow`, `showDescription` | +~8 | ✅ |
| `features-grid` | `cardStyle: flat\|bordered\|filled` + **EditableIcon** + **DynamicList** (removed `itemCount` control) | +~30 | ✅ |
| `features-list` | `iconPosition: left\|top` + **EditableIcon** + **DynamicList** (removed `itemCount` control) | +~15 | ✅ |
| `features-alternating` | `imageAspect` | +~20 | ✅ |

#### 1B. New Families
Build 9 new families from scratch:

| Family | Category | Archetype | Relume Coverage | Status |
|--------|----------|-----------|-----------------|--------|
| `content-feature-list` | content | Split heading + sub-item grid (EditableIcon + DynamicList) | ~60 variants | ✅ |
| `content-steps` | content | Numbered steps / timeline (EditableIcon for icon style + DynamicList) | ~50 variants | ✅ |
| `content-tabs` | content | Tabbed content panels | ~60 variants | ✅ |
| `content-image-overlay` | content | Full image + overlaid text | ~40 variants | ✅ |
| `content-comparison` | content | Side-by-side comparison | ~30 variants | ✅ |
| `features-numbered` | features | Numbered feature items (DynamicList) | ~15 variants | ✅ |
| `content-split-features` | content | Image + stacked feature list (EditableIcon + DynamicList) | ~30 variants | ✅ |
| `content-video` | content | Content with video embed placeholder | ~20 variants | ✅ |
| `content-centered-feature` | content | Centered heading + feature grid (EditableIcon + DynamicList) | ~25 variants | ✅ |

#### 1C. Presets
Create 3-5 presets per new family + 1-2 additional presets for upgraded families:
- Target: ~25 new presets for this phase
- Each preset = frozen control snapshot + Thumbnail mini-component

#### 1D. Editing Infrastructure (NEW)
Built 2 reusable components for Relume-like interactivity:
- [x] **EditableIcon** — swappable icon picker with ~80 curated Lucide icons, search, popover grid
- [x] **DynamicList** — AddItemButton + RemoveItemButton + helper functions for runtime add/remove
- [x] Migrated 5 families from fixed `itemCount` controls → DynamicList (array-length-driven)
- [x] Migrated 6 families from hardcoded icon imports → EditableIcon (string-name-based)

#### Phase 1 Deliverables
- [x] 6 existing families upgraded with new controls
- [x] 9 new families built and registered (6 original + 3 additional)
- [x] 22 content presets + 8 features presets created
- [x] EditableIcon + DynamicList infrastructure built
- [x] All passing `npm run build`

---

### Phase 2: Hero / Header
**Priority**: High — first thing visitors see  
**Relume source**: Headers page (27 variants, numbered 44-70)  
**Timeline**: ~1 week

#### 2A. Existing Family Control Expansion

| Family | New Controls | Covers | Status |
|--------|-------------|--------|--------|
| `hero-centered` | `textAlign: left\|center\|right`, `showTagline`, `showImage`, `buttonCount` | +~8 | ✅ |
| `hero-split` | `showTagline`, `imageAspect: square\|landscape\|portrait`, `textAlign` | +~4 | ✅ |
| `hero-image-bg` | `overlayOpacity: slider`, `textAlign: left\|center\|right`, `showTagline` | +~3 | ✅ |
| `hero-video` | (adequate for now) | — | ✅ |

#### 2B. New Families

| Family | Archetype | Relume Coverage | Status |
|--------|-----------|-----------------|--------|
| `hero-minimal` | Two-column text-only split | ~8 variants (Headers 49, 56-57, 60-61) | ✅ |
| `hero-form` | Hero with signup/email form | ~5 variants (Headers 48, 58-59) | ✅ |
| `hero-card` | Hero with card overlay (BONUS) | ~4 variants | ✅ |

#### 2C. Presets
- 10 new presets created (Header 6 through Header 15)

#### Phase 2 Deliverables
- [x] 3 existing hero families upgraded
- [x] 3 new hero families built (2 planned + 1 bonus hero-card)
- [x] 10 new presets (15 total, up from 5)
- [x] Build passing

---

### Phase 3: Navbar
**Priority**: High — present on every page  
**Relume source**: Navbars page (32 variants)  
**Timeline**: ~1 week

#### 3A. Existing Family Control Expansion

| Family | New Controls | Status |
|--------|-------------|--------|
| `navbar-standard` | `ctaStyle: button\|link\|none`, `linkCount: 3\|4\|5\|6`, `showSearch` | ☐ |
| `navbar-centered` | `showAuth`, `showSearch` | ☐ |
| `navbar-mega` | `megaColumns: 2\|3\|4`, `showImages`, `megaStyle: grid\|list` | ☐ |

#### 3B. New Families

| Family | Archetype | Relume Coverage | Status |
|--------|-----------|-----------------|--------|
| `navbar-double` | Two-row (utility bar + main nav) | ~6 variants | ☐ |
| `navbar-sidebar` | Vertical sidebar navigation | ~4 variants | ☐ |

#### 3C. Presets
- ~8 new presets

#### Phase 3 Deliverables
- [ ] 3 existing navbar families upgraded
- [ ] 2 new navbar families built
- [ ] ~8 new presets

---

### Phase 4: CTA
**Priority**: High — direct conversion impact  
**Relume source**: CTA page (need to analyze — est. ~40-60 variants)  
**Timeline**: ~1 week

#### 4A. Figma Analysis Required
- [ ] Get Figma page URL for CTA section
- [ ] Extract metadata and count variants
- [ ] Sample 4-6 representative designs

#### 4B. Expected Archetypes (from common patterns)
| Family | Archetype | Status |
|--------|-----------|--------|
| `cta-banner` | ✅ Exists | Expand controls |
| `cta-minimal` | ✅ Exists | Expand controls |
| `cta-split` | ✅ Exists | Expand controls |
| `cta-newsletter` | 🆕 CTA with email input form | ☐ |
| `cta-card` | 🆕 CTA inside a card/container | ☐ |
| `cta-floating` | 🆕 CTA with background image/pattern | ☐ |

#### Phase 4 Deliverables
- [ ] Figma analysis complete
- [ ] ~3 new CTA families
- [ ] Existing 3 families expanded
- [ ] ~10 new presets

---

### Phase 5: Footer
**Priority**: High — present on every page  
**Relume source**: Footer page (need to analyze — est. ~30-50 variants)  
**Timeline**: ~1 week

#### 5A. Figma Analysis Required
- [ ] Get Figma page URL for Footer section
- [ ] Extract metadata and count variants

#### 5B. Expected Archetypes
| Family | Archetype | Status |
|--------|-----------|--------|
| `footer-simple` | ✅ Exists | Expand controls |
| `footer-columns` | ✅ Exists | Expand controls |
| `footer-big` | ✅ Exists | Expand controls |
| `footer-cta` | ✅ Exists | Expand controls |
| `footer-centered` | 🆕 Centered minimal footer | ☐ |
| `footer-mega` | 🆕 Full mega footer with newsletter + socials | ☐ |

#### Phase 5 Deliverables
- [ ] ~2 new footer families
- [ ] 4 existing families expanded
- [ ] ~8 new presets

---

### Phase 6: Pricing
**Priority**: Medium-High — critical for SaaS sites  
**Relume source**: Pricing page (need to analyze — est. ~20-30 variants)  
**Timeline**: ~1 week

#### 6A. Figma Analysis Required
- [ ] Get Figma page URL for Pricing section

#### 6B. Expected Archetypes
| Family | Archetype | Status |
|--------|-----------|--------|
| `pricing-cards` | ✅ Exists | Add `highlighted: none\|1\|2\|3`, `billingToggle` | 
| `pricing-comparison` | ✅ Exists | Add `rowCount`, `showTooltips` |
| `pricing-simple` | 🆕 Single-plan with feature list | ☐ |
| `pricing-toggle` | 🆕 Cards with monthly/annual toggle | ☐ |

#### Phase 6 Deliverables
- [ ] ~2 new pricing families
- [ ] 2 existing families expanded
- [ ] ~6 new presets

---

### Phase 7: Testimonials
**Priority**: Medium — social proof section  
**Relume source**: Testimonial page (need to analyze — est. ~30-50 variants)  
**Timeline**: ~1 week

#### 7A. Expected Archetypes
| Family | Archetype | Status |
|--------|-----------|--------|
| `testimonials-simple` | ✅ Exists | Add `layout: centered\|left`, `showRating` |
| `testimonials-cards` | ✅ Exists | Add `columns: 2\|3`, `cardStyle` |
| `testimonials-slider` | ✅ Exists | Add `showDots`, `autoplay` |
| `testimonials-logo` | 🆕 Quote with company logo prominently | ☐ |
| `testimonials-video` | 🆕 Video testimonial embed | ☐ |
| `testimonials-masonry` | 🆕 Masonry/staggered grid of quotes | ☐ |

#### Phase 7 Deliverables
- [ ] ~3 new testimonial families
- [ ] 3 existing expanded
- [ ] ~10 new presets

---

### Phase 8: FAQ
**Priority**: Medium  
**Relume source**: FAQ page (est. ~15-25 variants)  
**Timeline**: ~3 days

#### 8A. Expected Archetypes
| Family | Archetype | Status |
|--------|-----------|--------|
| `faq-accordion` | ✅ Exists | Add `style: bordered\|minimal\|card`, `showIcon` |
| `faq-two-column` | ✅ Exists | Add `showCategories` |
| `faq-grid` | 🆕 FAQ in card grid (no accordion) | ☐ |

#### Phase 8 Deliverables
- [ ] 1 new FAQ family
- [ ] 2 existing expanded
- [ ] ~4 new presets

---

### Phase 9: Contact
**Priority**: Medium  
**Relume source**: Contact page (est. ~20-30 variants)  
**Timeline**: ~3 days

#### 9A. Expected Archetypes
| Family | Archetype | Status |
|--------|-----------|--------|
| `contact-simple` | ✅ Exists | Add `formFields`, `showSocial` |
| `contact-split` | ✅ Exists | Add `infoPosition: left\|right` |
| `contact-map` | ✅ Exists | Add `mapPosition: top\|side` |
| `contact-card` | 🆕 Multiple contact cards (email, phone, office) | ☐ |

#### Phase 9 Deliverables
- [ ] 1 new contact family
- [ ] 3 existing expanded
- [ ] ~4 new presets

---

### Phase 10: Team
**Priority**: Medium-Low  
**Relume source**: Team page (est. ~15-25 variants)  
**Timeline**: ~3 days

#### 10A. Expected Archetypes
| Family | Archetype | Status |
|--------|-----------|--------|
| `team-simple` | ✅ Exists | Add `showBio`, `showSocial` |
| `team-cards` | ✅ Exists | Add `columns: 2\|3\|4`, `cardStyle` |
| `team-grid` | ✅ Exists | Add `showRole` |
| `team-featured` | 🆕 Featured team member spotlight | ☐ |

#### Phase 10 Deliverables
- [ ] 1 new team family, 3 expanded
- [ ] ~4 new presets

---

### Phase 11: Blog
**Priority**: Medium-Low  
**Relume source**: Blog page (est. ~20-30 variants)  
**Timeline**: ~3 days

#### 11A. Expected Archetypes
| Family | Archetype | Status |
|--------|-----------|--------|
| `blog-grid` | ✅ Exists | Add `columns: 2\|3`, `showExcerpt` |
| `blog-list` | ✅ Exists | Add `showThumbnail`, `showAuthor` |
| `blog-featured` | ✅ Exists | Add `featureLayout: full\|split` |
| `blog-sidebar` | 🆕 Blog list with sidebar (categories, recent) | ☐ |

#### Phase 11 Deliverables
- [ ] 1 new blog family, 3 expanded
- [ ] ~4 new presets

---

### Phase 12: Gallery / Logos / Stats (Bundle)
**Priority**: Low — supporting sections  
**Timeline**: ~3 days

#### Gallery
| Family | Status |
|--------|--------|
| `gallery-grid` | ✅ Add `columns: 2\|3\|4`, `gridPattern: uniform\|mixed` |
| `gallery-masonry` | ✅ Add `columns: 2\|3` |
| `gallery-carousel` | ✅ Add `showCaptions`, `aspectRatio` |
| `gallery-lightbox` | 🆕 Grid with lightbox click behavior |

#### Logos
| Family | Status |
|--------|--------|
| `logos-row` | ✅ Add `grayscale: switch`, `logoCount: 4\|5\|6` |
| `logos-grid` | ✅ Add `columns: 3\|4\|5` |
| `logos-marquee` | ✅ Add `speed: slow\|medium\|fast`, `direction` |
| `logos-card` | 🆕 Logos in bordered cards with names |

#### Stats
| Family | Status |
|--------|--------|
| `stats-row` | ✅ Add `dividers: switch` |
| `stats-cards` | ✅ Add `columns: 2\|3\|4`, `cardStyle` |
| `stats-split` | ✅ Add `imagePosition` |
| `stats-counter` | 🆕 Animated counter stats |

#### Phase 12 Deliverables
- [ ] 3 new families (gallery-lightbox, logos-card, stats-counter)
- [ ] 9 existing expanded
- [ ] ~10 new presets

---

### Phase 13: New Categories (Optional/Future)
**Priority**: Low — nice-to-have sections  
**Timeline**: ~1 week total

| New Category | Families Needed | Description |
|-------------|----------------|-------------|
| `auth` | login, signup, forgot-password | Sign-up / login forms |
| `error` | 404, 500, maintenance | Error & maintenance pages |
| `banner` | announcement, cookie, promo | Top-of-page banners |
| `comparison` | table, cards, toggle | Product/feature comparison |

> **Note**: These require adding new `DesignCategoryId` values to `types.ts`  
> and updating registry imports. Defer until Phases 1-12 are complete.

---

## Summary Timeline

| Phase | Category | New Families | Control Upgrades | New Presets | Est. Time |
|-------|----------|-------------|-----------------|------------|-----------|
| **1** | Layout/Content/Features | 9 ✅ | 6 ✅ | 30 ✅ | 2 weeks ✅ |
| **2** | Hero/Header | 3 ✅ | 3 ✅ | 10 ✅ | 1 week ✅ |
| **3** | Navbar | 2 | 3 | ~8 | 1 week |
| **4** | CTA | 3 | 3 | ~10 | 1 week |
| **5** | Footer | 2 | 4 | ~8 | 1 week |
| **6** | Pricing | 2 | 2 | ~6 | 1 week |
| **7** | Testimonials | 3 | 3 | ~10 | 1 week |
| **8** | FAQ | 1 | 2 | ~4 | 3 days |
| **9** | Contact | 1 | 3 | ~4 | 3 days |
| **10** | Team | 1 | 3 | ~4 | 3 days |
| **11** | Blog | 1 | 3 | ~4 | 3 days |
| **12** | Gallery/Logos/Stats | 3 | 9 | ~10 | 3 days |
| **13** | New Categories | 8+ | — | ~20 | 1 week |
| | **TOTAL** | **~35 new** | **~44 upgrades** | **~121 new** | **~10 weeks** |

### Final Target
- **Families**: 55 current (45 + 9 Phase 1 + 3 Phase 2 — includes bonus hero-card) + ~25 remaining = **80 families**
- **Presets**: 107 current (71 + 20 Phase 1 + 10 Phase 2 + 6 extra) + ~85 remaining = **192 presets**
- **Effective visual variants** (via controls): **800–1,000+**
- **Relume equivalent coverage**: ~75%+ of their ~1,500 components

---

## File Pattern Reference

Every family file follows this structure:

```typescript
// src/lib/designs/{category}/families/{category}-{name}.tsx
'use client'

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { EditableIcon } from '@/components/wireframe/editable-icon'
import { AddItemButton, RemoveItemButton, addListItem, removeListItem } from '@/components/wireframe/dynamic-list'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'

    // Read content arrays (items are dynamic, not controlled by a fixed count)
    const titles = (content?.featureTitles as string[]) ?? ['Feature 1', 'Feature 2']
    const icons = (content?.icons as string[]) ?? ['Layers', 'Zap']
    const itemCount = titles.length

    // Add/remove helpers
    const addItem = () => {
        onContentChange?.('featureTitles', addListItem(titles, `Feature ${itemCount + 1}`))
        onContentChange?.('icons', addListItem(icons, 'Star'))
    }
    const removeItem = (index: number) => {
        const res = removeListItem(titles, index, 2)
        if (res) { onContentChange?.('featureTitles', res) /* ...parallel arrays */ }
    }

    // Render layout with EditableText, EditableIcon, DynamicList
    // Use viewport for responsive layout
}

export const {Category}{Name}Family: TemplateFamily = {
    id: '{category}-{name}',
    category: '{category}',
    name: '{Display Name}',
    description: '{Short description}',
    tags: [...],
    Canvas,
    controlsDef: [...],
    defaultControls: {...},
    defaultContent: {...},
}
```

Every preset follows this structure:

```typescript
// Added to src/lib/designs/{category}/presets.tsx
function {Name}Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 ...">
            {/* Miniature representation of this preset */}
        </div>
    )
}

export const {Name}Preset: DesignPreset = {
    id: '{category}-{N}',
    familyId: '{category}-{name}',
    name: '{Category} {N}',
    description: '{What this variation looks like}',
    controls: { /* frozen control values */ },
    Thumbnail: {Name}Thumbnail,
}
```

---

## Progress Tracking

### Phase 1: Layout / Content / Features ✅ COMPLETE
- [x] **1A** — `content-split` control expansion (+imageAspect)
- [x] **1A** — `content-cards` control expansion (+cardStyle, +showDescription)
- [x] **1A** — `content-text` control expansion (+showSecondParagraph)
- [x] **1A** — `features-grid` control expansion (+cardStyle, +EditableIcon, +DynamicList)
- [x] **1A** — `features-list` control expansion (+iconPosition, +EditableIcon, +DynamicList)
- [x] **1A** — `features-alternating` control expansion (+imageAspect)
- [x] **1B** — `content-feature-list` family (NEW — EditableIcon + DynamicList)
- [x] **1B** — `content-steps` family (NEW — EditableIcon for icon style + DynamicList)
- [x] **1B** — `content-tabs` family (NEW)
- [x] **1B** — `content-image-overlay` family (NEW)
- [x] **1B** — `content-comparison` family (NEW)
- [x] **1B** — `features-numbered` family (NEW — DynamicList)
- [x] **1B** — `content-split-features` family (NEW — EditableIcon + DynamicList)
- [x] **1B** — `content-video` family (NEW)
- [x] **1B** — `content-centered-feature` family (NEW — EditableIcon + DynamicList)
- [x] **1C** — 22 content presets + 8 features presets
- [x] **1D** — EditableIcon + DynamicList infrastructure
- [x] **1E** — Registration in index.ts + registry.ts
- [x] **1F** — `npm run build` passing

### Phase 2: Hero / Header ✅ COMPLETE
- [x] **2A** — `hero-centered` control expansion (+textAlign, +showTagline, +showImage, +buttonCount)
- [x] **2A** — `hero-split` control expansion (+showTagline, +imageAspect, +textAlign)
- [x] **2A** — `hero-image-bg` control expansion (+overlayOpacity slider, +textAlign, +showTagline)
- [x] **2B** — `hero-minimal` family (NEW — two-column text-only)
- [x] **2B** — `hero-form` family (NEW — hero with email/signup form)
- [x] **2B** — `hero-card` family (NEW BONUS — hero with card overlay)
- [x] **2C** — 15 hero presets (Header 1–15)
- [x] **2D** — Registration in index.ts + registry.ts
- [x] **2E** — `npm run build` passing
