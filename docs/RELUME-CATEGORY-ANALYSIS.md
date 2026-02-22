# Relume — Comprehensive Category & Feature Analysis

> **Date**: 2025-07-11
> **Target**: https://www.relume.io (Project: "Cloudify" → accounting SaaS)
> **Method**: Hands-on exploration via MCP Playwright browser automation
> **Component Library**: https://www.relume.io/components (1,757 total components)

---

## Table of Contents

1. [Project-Level Architecture](#1-project-level-architecture)
2. [Complete Category Taxonomy](#2-complete-category-taxonomy)
3. [Builder Add Panel vs Component Library](#3-builder-add-panel-vs-component-library)
4. [Per-Section Control Axes System](#4-per-section-control-axes-system)
5. [Filter System](#5-filter-system)
6. [Replace Component Flow](#6-replace-component-flow)
7. [Style Guide System](#7-style-guide-system)
8. [Design Mode](#8-design-mode)
9. [Responsive Breakpoints](#9-responsive-breakpoints)
10. [AI Features](#10-ai-features)
11. [Uncommon Features & Interactions](#11-uncommon-features--interactions)
12. [Implications for Scytle V2](#12-implications-for-scytle-v2)

---

## 1. Project-Level Architecture

### Four Tabs (Left-to-Right Workflow)

| Tab | Purpose | URL Param | Key Features |
|---|---|---|---|
| **Sitemap** | Page hierarchy & structure | `mode=sitemap` | Tree view, page cards with section lists, sub-page branching |
| **Wireframe** | Layout editing & section composition | `mode=wireframe` | Canvas editor, section panels, drag/drop, controls |
| **Style Guide** | Visual identity configuration | `mode=styleguide` | Colors, Typography, UI Styling, Scheme shuffle |
| **Design** | Fully styled preview + fine-tuning | `mode=design` | Scheme per-section, Image controls, final output |

### Sitemap Tab
- **Visual**: Tree/hierarchy view with page cards connected by branching lines
- **Page Cards**: Each shows page name + ordered list of section types (e.g., "Navbar, Hero Header Section, Features List Section...")
- **Hierarchy**: Home at root → child pages (About, Features, Pricing, Blog, etc.) branch below
- **Zoom**: Independent from wireframe (~18% vs ~7%)
- **Interaction**: Click to select pages, drag to reorder

### Wireframe Tab (Primary Editor)
- **Canvas**: Large scrollable workspace showing all sections stacked vertically per page
- **Section Blocks**: Each section is a discrete unit that can be selected, moved, replaced, or configured
- **Hover**: Shows section name label + drag handle
- **Click**: Opens Section Panel on the right with controls
- **Between sections**: "Add Section" button appears on hover (plus icon)
- **Top bar**: Add panel trigger, Generate copy, page selector
- **Bottom bar**: Project button, viewport toggles (Desktop/Tablet/Mobile), zoom controls

### Style Guide Tab
- **Left panel** (~40%): Colors → Typography → UI Styling controls, vertically scrollable
- **Right panel** (~55%): Live preview with applied styles
- **See**: `docs/RELUME-STYLE-GUIDE-UX-RESEARCH.md` for full deep-dive

### Design Tab
- **Shows**: Fully styled wireframes with Style Guide colors/typography/images applied
- **Section Panel**: All wireframe controls PLUS Scheme selector and Image controls
- **Scheme Selector**: Per-section color scheme (Scheme 1/2/3 + custom)
- **Image Controls**: Upload, Ratio, Position, Fill Mode, Width, Shape, Overlay, Foreground

---

## 2. Complete Category Taxonomy

### Summary
- **3 Top-Level Groups**: Marketing, Ecommerce, Application UI
- **50 Total Categories** (on `/components` page)
- **32 Categories** available in Builder Add panel
- **1,757 Total Components**

### Marketing (32 categories, ~1,457 components)

| # | Category | Component Count | Notes |
|---|---|---|---|
| 1 | Navbars | 32 | Navigation bars, mega menus |
| 2 | Footers | 17 | Site footers |
| 3 | Hero Header Sections | 130 | Largest marketing category after Features |
| 4 | Header Sections | 27 | Page-level headers (non-hero) |
| 5 | Feature Sections | 682 | **Largest single category** — nearly 40% of all components |
| 6 | CTA Sections | 67 | Call-to-action blocks |
| 7 | Contact Sections | 30 | Contact forms & info |
| 8 | Pricing Sections | 57 | Pricing tables & cards |
| 9 | FAQ Sections | 14 | Accordion/list FAQs |
| 10 | Testimonial Sections | 67 | Reviews & social proof |
| 11 | Logo Sections | 6 | Logo strips/grids |
| 12 | Team Sections | 22 | Team member displays |
| 13 | Blog Header Sections | 32 | Blog index page headers |
| 14 | Blog Sections | 36 | Blog post lists/grids |
| 15 | Blog Post Headers | 5 | Individual blog post headers |
| 16 | Career Sections | 27 | Job listings & career pages |
| 17 | Gallery Sections | 27 | Image galleries |
| 18 | Contact Modals | 6 | Modal contact forms |
| 19 | Portfolio Headers | 12 | Portfolio page headers |
| 20 | Portfolio Sections | 23 | Portfolio project grids/lists |
| 21 | Banners | 16 | Announcement/notification banners |
| 22 | Event Item Headers | 11 | Individual event page headers |
| 23 | Event Headers | 6 | Event listing page headers |
| 24 | Event Sections | 37 | Event lists/calendars |
| 25 | Multi-step Forms | 46 | Wizard/stepper forms |
| 26 | Stats Sections | 60 | Statistics/metrics displays |
| 27 | Long Form Content | 32 | Rich text/article content |
| 28 | Loaders | 5 | Loading states/animations |
| 29 | Comparison Sections | 15 | Feature comparison tables |
| 30 | Link Pages | 16 | Link-in-bio style pages |
| 31 | Cookie Consent | 5 | GDPR cookie banners |
| 32 | Timeline Sections | 21 | Chronological timelines |

### Ecommerce (3 categories, 27 components)

| # | Category | Component Count | Notes |
|---|---|---|---|
| 1 | Product List Sections | 12 | Product grids & lists |
| 2 | Product Headers | 9 | Product detail page headers |
| 3 | Category Filters | 6 | Filter/sort UI for product lists |

### Application UI (15 categories, 141 components)

| # | Category | Component Count | Notes |
|---|---|---|---|
| 1 | Application Shells | 16 | Full page app layouts |
| 2 | Sidebars | 9 | Application sidebars |
| 3 | Topbars | 4 | Application top navigation |
| 4 | Page Headers | 5 | App page headers |
| 5 | Section Headers | 4 | App section headers |
| 6 | Card Headers | 2 | Card component headers |
| 7 | Sign Up/Login Pages | 17 | Authentication pages |
| 8 | Onboarding Forms | 17 | User onboarding wizards |
| 9 | Sign Up/Login Modals | 5 | Auth modal dialogs |
| 10 | Tables | 10 | Data tables |
| 11 | Stacked Lists | 10 | Vertical list layouts |
| 12 | Grid Lists | 10 | Grid-based list layouts |
| 13 | Stat Cards | 8 | Dashboard metric cards |
| 14 | Forms | 20 | Application form layouts |
| 15 | Description Lists | 4 | Key-value detail lists |

---

## 3. Builder Add Panel vs Component Library

### Builder Add Panel (32 categories)
Available when clicking "Add" in the wireframe editor. These are the section types users can add to a page.

**Full list** (alphabetical):
1. Blank Section
2. About
3. Announcement Banner
4. Benefits
5. Blog List
6. Blog List Header
7. Blog Post Body
8. Blog Post Header
9. Contact
10. CTA
11. Event Item Header
12. Events List
13. FAQ
14. Feature
15. Features List
16. Footer
17. Gallery
18. Header
19. Hero Header
20. How It Works
21. Job Listings
22. Logo List
23. Navbar
24. Portfolio Item Body
25. Portfolio Item Header
26. Portfolio List
27. Pricing
28. Product Header
29. Products List
30. Stats
31. Team
32. Testimonial

### Naming Differences (Builder → Component Library)
Some categories use simplified names in the builder vs the component library:

| Builder Name | Component Library Name |
|---|---|
| About | Header Sections (partial overlap) |
| Announcement Banner | Banners |
| Benefits | Feature Sections (subset) |
| Blog List | Blog Sections |
| Blog List Header | Blog Header Sections |
| Blog Post Body | Long Form Content (partial) |
| Events List | Event Sections |
| Feature | Feature Sections |
| Features List | Feature Sections (different layout) |
| How It Works | Feature Sections (subset) |
| Job Listings | Career Sections |
| Logo List | Logo Sections |
| Portfolio Item Body | (no direct equivalent) |
| Products List | Product List Sections |

### Categories in Library but NOT in Builder
- Contact Modals
- Gallery Sections (partially — only via "Gallery" builder)
- Multi-step Forms
- Timeline Sections
- Comparison Sections
- Link Pages
- Cookie Consent
- Loaders
- All Application UI categories
- All Ecommerce categories (partially — Product Header and Products List are in builder)

**Key insight**: The builder panel curates a subset focused on marketing page-building, while the component library includes everything. The "Replace Component" panel provides access to ALL components including those not in the builder add panel.

---

## 4. Per-Section Control Axes System

### How It Works
When you select a section on the wireframe canvas, a **Section Panel** opens on the right showing:
1. **Component identifier** (e.g., "Header 84")
2. **Component selector** (chevron to open Replace Component)
3. **Control axes** — toggle/select buttons that swap the entire component variant

### CRITICAL FINDING: Axes Vary Per Category
Control axes are **NOT fixed** — they are specific to each section type/category. Each axis combination maps to a **unique component number** in Relume's system.

### Documented Examples

#### Hero Header (e.g., Header 84)
| Axis | Options | Default |
|---|---|---|
| Style | Normal / Card | Normal |
| Asset | Image / Video | Image |
| Asset Placement | Left / Right | Left |
| Element | Form / Button | Button |

**Switching behavior**:
- Header 84 → Asset=Image, Placement=Left, Element=Button
- Header 85 → Asset=Image, Placement=Left, Element=Form
- Header 86 → Asset=Video, Placement=Left, Element=Button
- Header 87 → Asset=Video, Placement=Left, Element=Form
- Some axis options are **disabled** for certain families (e.g., "Right" placement + "Card" style were disabled for this family)

#### Features List (e.g., Layout 522)
| Axis | Options | Default |
|---|---|---|
| Background | None / Image | None |

**Minimal** — only 1 axis with 2 options (2 total variants).

#### Pricing (e.g., Pricing 18)
| Axis | Options | Default |
|---|---|---|
| Text | (alignment/style options) | — |
| Tabs | Yes / No | Yes |
| Plans | 1 / 2 / 3 / 4 | 3 |

**3 axes** with different types — includes a **numeric selector** (Plans count).

#### CTA (e.g., CTA 53)
| Axis | Options | Default |
|---|---|---|
| Text Direction | (Left/Center/Right) | — |
| Style | Normal / Card | Normal |
| Background | None / Image / Video | None |
| Element | Form / Button | Button |

**4 axes** similar to Hero but with different options (Background has 3 options including "None" vs Hero's binary Image/Video).

### Axis Types Discovered
1. **Binary toggle**: Image / Video, Yes / No, Normal / Card
2. **Multi-option selector**: 3+ discrete options (e.g., Background: None/Image/Video)
3. **Numeric selector**: Count-based (e.g., Plans: 1/2/3/4, Columns)
4. **Alignment selector**: Left / Center / Right
5. **Disabled options**: Some toggle options are grayed out / not clickable for certain component families

### Pattern Summary
```
Category Type        → Unique Axis Set → Each Combo = Unique Component #
Hero Header          → Style × Asset × Placement × Element = up to 16 combos
Features List        → Background = 2 combos
Pricing              → Text × Tabs × Plans = many combos
CTA                  → Direction × Style × Background × Element = many combos
```

---

## 5. Filter System

### Where Filters Appear
1. **Add Panel** — when browsing categories to add new sections
2. **Component Library** (`/components`) — when browsing all components
3. **Replace Component Panel** — when swapping an existing section

### Filter Categories

#### Layout Filter
| Sub-filter | Options |
|---|---|
| Text Alignment | Left, Center |
| Content Alignment | Image/Video Left, Center, Right |
| Columns | 1, 2, 3, 4, 5+ |
| Off-grid | Toggle (checkbox) |
| Bento | Toggle (checkbox) |

#### Elements Filter (33 checkboxes)
Organized as a multi-select checkbox list:

**Media**: Image, Multiple Images, Overlapping Images, Video Lightbox, Image Lightbox, Background Image, Background Video

**Interactive**: Buttons, Form, Slider, Modal, Tabs, Accordion, Search Bar, Dropdown, Filters, Mega Menu

**Content**: Text Only, Icons, Cards, Logos, Rich Text, List, Tags, Table of Contents

**UI Components**: Pagination, Sidebar, Topbar, Side Panel, Checkboxes, Radio Buttons, Toggles

**Other**: Loading Animation, Progress Bar

#### More Filters
| Filter | Type | Description |
|---|---|---|
| Interactions | Toggle | Show only components with animation/interaction |
| Uncommon | Toggle | Show unusual/rare component variants |

### Filter Behavior
- Filters are **combinable** — Layout + Elements + More Filters can all be active simultaneously
- **Clear button** resets all active filters
- Filters **persist** within a session when switching between categories
- Component count updates in real-time as filters are applied
- Empty states show "No components match your filters" message

---

## 6. Replace Component Flow

### How to Access
1. Select a section on the wireframe canvas
2. Click the **component name chevron** (e.g., "Header 84 ▾") in the Section Panel
3. **Replace Component** panel slides in from the right

### Panel Structure

```
┌─────────────────────────────────┐
│  🔍 Search...     [Filter icon] │
│  ─────────────────────────────  │
│  [ Suggested ]  [ Saved ]       │  ← Tab switcher
│  ─────────────────────────────  │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ H84 │ │ H88 │ │ H92 │      │  ← Component grid
│  │ ☆   │ │ ☆   │ │ ☆   │      │  ← Bookmark (Save)
│  └─────┘ └─────┘ └─────┘      │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ H98 │ │ H1  │ │H110 │      │
│  └─────┘ └─────┘ └─────┘      │
│  ...                            │
│  ─────────────────────────────  │
│  [✦ Shuffle component]          │  ← Random replacement
└─────────────────────────────────┘
```

### Features

#### Search
- Text search across component names/IDs
- Instant filtering as you type

#### Tabs
| Tab | Content |
|---|---|
| **Suggested** | Shows all components in the same category (default) |
| **Saved** | Shows bookmarked/favorited components |

#### Component Cards
- **Thumbnail**: Wireframe preview of the component layout
- **Label**: Component identifier (e.g., "Header 84")
- **Bookmark icon** (☆): Click to add/remove from Saved tab
- **Click**: Instantly replaces the selected section with this component

#### Filter Bar (in Replace Panel)
More granular than the main filter:
- **Category dropdown**: ALL 31 section categories — enables **cross-category replacement**
- **Layout filter**: Same as main filter
- **Elements filter**: Same as main filter
- **Uncommon checkbox**: Toggle uncommon variants
- **Clear button**: Reset filters

#### Shuffle Button
- `✦ Shuffle component` at the bottom
- Randomly selects a component from the current category
- Quick way to explore variants

### Cross-Category Replacement
**Key feature**: The Category dropdown in the Replace panel allows replacing a Hero with a CTA, or any section type with any other. This means sections are not locked to their original category.

---

## 7. Style Guide System

> **Full details**: See `docs/RELUME-STYLE-GUIDE-UX-RESEARCH.md`

### Quick Summary

#### Colors
- **Light/Dark mode toggle** (sun/moon icons)
- **Shuffle C** shortcut — AI-powered color generation
- **Palette cards**: Neutrals (7 shades in 3 groups) + Accent colors (each with auto-generated shade range)
- **Per-color actions**: Delete, Copy, Edit (2D picker + hue slider + hex input)
- **"Main" badge** on primary accent
- **Add button** (+) to create new accent colors

#### Typography
- **Heading font**: Selectable from Google Free / paid fonts (e.g., Inter)
- **Body font**: Separate selector (e.g., Roboto)
- **Weight selector**: "Regular - medium" style picker
- **Shuffle T** shortcut — AI-powered font pairing

#### UI Styling
- **Buttons & Forms**: Filled + Outlined styles, border radius, padding
- **Cards & Images**: Outlined Card style, border radius, shadow
- **Shuffle U** shortcut — AI-powered UI style generation

#### Global Features
- **Scheme shuffle SPACE** — randomizes entire style guide at once
- **Pitch Concepts** — generates multiple complete style concepts
- **Concept N dropdown** — switch between saved concepts
- **Live preview** — right panel updates in real-time

---

## 8. Design Mode

### What Changes from Wireframe Mode
Design mode shows the same sections but with **full styling applied** (colors, typography, images, shadows, etc.).

### Additional Controls (Design-only)

#### Scheme Selector
- **Location**: Section Panel (appears for each selected section)
- **UI**: "Scheme 2" dropdown → opens Schemes panel
- **Schemes Panel**:
  - Scheme 1 (tinted/colored background)
  - Scheme 2 (white/neutral background — most common default)
  - Scheme 3 (alternate neutral)
  - **+ button** to create additional schemes
  - Each scheme has an **Options menu** (⋯)
  - Selected scheme shows ✅ checkmark

#### Image Controls
- **Location**: Section Panel (appears for each selected section)
- **Label**: "Assets and Image controls"
- **Controls**:

| Control | Options | Default |
|---|---|---|
| Upload | Upload button (file picker) | — |
| Ratio | 1:1, 4:3, 16:9, etc. | 1:1 |
| Position | Center, Top, Bottom, Left, Right | Center |
| Fill Mode | Cover, Contain | Cover |
| Width | Select dropdown | — |
| Shape | Rectangle / Rounded | Rectangle |
| Overlay | Yes / No | No |
| Foreground | Color / None | None |

- **Note**: Some options show compatibility warnings (e.g., "Not compatible with Outlined style")

---

## 9. Responsive Breakpoints

### Three Breakpoints

| Breakpoint | Shortcut | URL Param | Description |
|---|---|---|---|
| Desktop | `1` | `breakpoint=desktop` | Full-width layout (default) |
| Tablet | `2` | `breakpoint=tablet` | Medium-width responsive |
| Mobile | `3` | `breakpoint=mobile` | Narrow mobile layout |

### UI Location
- **Bottom bar** next to zoom controls
- Three icons: Desktop monitor, Tablet, Phone
- Active breakpoint is highlighted

### Behavior
- Viewport switch is **instant** — no page reload
- Components automatically reflow for the selected breakpoint
- All editing features remain functional at every breakpoint
- Zoom level is independent per breakpoint

---

## 10. AI Features

### Generate Copy
- **Trigger**: "Generate copy" button in the top bar (wireframe mode)
- **Behavior**: AI generates placeholder text/copy for all sections based on the project brief
- **Streaming**: Uses SSE (Server-Sent Events) for real-time text appearance

### Prompt in Description
- Each section can have a description/prompt that guides AI copy generation
- Context-aware: references the section type and surrounding sections

### Shuffle Operations (All AI-powered)
| Shortcut | Scope | What It Does |
|---|---|---|
| `C` | Colors | Generates new color palette |
| `T` | Typography | Generates new font pairing |
| `U` | UI Styling | Generates new button/card styles |
| `SPACE` | Scheme (all) | Shuffles entire style guide |

### Pitch Concepts
- Generates multiple complete style guide variations
- Each concept is a unique combination of colors, typography, and UI styling
- Users can switch between concepts via dropdown

### AI Feedback
- System appears to use project brief + section context for informed generation
- Streaming responses with loading states
- Retry/regenerate capability

---

## 11. Uncommon Features & Interactions

### 1. Cross-Category Component Replacement
Replace panel's Category dropdown allows swapping any section type with any other — not locked to original category.

### 2. Axis-Based Component Switching
Instead of simple variant toggles, Relume uses a multi-dimensional axis system where each axis combination maps to a unique component. This creates a navigable hypercube of variants.

### 3. Disabled Axis Options
Some axis values are grayed out for specific component families — not all combinations exist. This suggests a sparse matrix rather than a full cartesian product.

### 4. Component Numbering System
Components have unique numbers (Header 84, Header 85, etc.) that are NOT sequential within a category. The numbering appears to be global across the entire library.

### 5. Shuffle Component (Random)
Replace panel has a dedicated "Shuffle component" button for random selection — useful for exploration/inspiration.

### 6. Saved Components (Bookmarks)
Users can bookmark individual components and access them via the "Saved" tab in the Replace panel. This persists across the session.

### 7. Scheme Per Section
In Design mode, each section can have a different color scheme — not just one global scheme. This allows visual rhythm and section differentiation.

### 8. Image Shape Control
Design mode allows per-section image shape (Rectangle vs Rounded) — a design-level control that doesn't exist in wireframe mode.

### 9. Foreground Color on Images
Images can have a foreground color overlay, but with compatibility restrictions (e.g., "Not compatible with Outlined style").

### 10. Concept System
Multiple complete style concepts can be generated and compared. Each concept bundles colors + typography + UI styling as a single unit.

### 11. Off-Grid & Bento Layout Filters
Specific filters for non-standard layouts — "Off-grid" (asymmetric/broken grid) and "Bento" (Apple-style bento grid) are explicitly filterable.

### 12. 33 Element Checkboxes
The Elements filter has 33 distinct checkboxes — extremely granular filtering that suggests Relume has tagged every component with precise element metadata.

### 13. Keyboard Shortcuts
- `1/2/3` — Viewport switching (Desktop/Tablet/Mobile)
- `C/T/U/SPACE` — Shuffle operations
- `⌘Z/⌘⇧Z` — Undo/Redo

---

## 12. Implications for Scytle V2

### Category Priority for Implementation

Based on component count and usage frequency:

| Priority | Category | Count | Rationale |
|---|---|---|---|
| P0 (Done) | Hero Header | 130 | Already implemented (5 variants) |
| P0 | Navbar | 32 | Essential — every page needs one |
| P0 | Footer | 17 | Essential — every page needs one |
| P1 | Feature Sections | 682 | Largest category by far |
| P1 | CTA Sections | 67 | High usage, drives conversions |
| P1 | Testimonial | 67 | Social proof, very common |
| P2 | Pricing | 57 | Complex (numeric axes) |
| P2 | Stats | 60 | Common on marketing pages |
| P2 | FAQ | 14 | Simple accordion, high utility |
| P2 | Contact | 30 | Lead generation essential |
| P3 | Blog Sections | 36 | Content-heavy sites |
| P3 | Team | 22 | About pages |
| P3 | Gallery | 27 | Portfolio/showcase sites |
| P3 | Logo | 6 | Simple, trust signal |

### Control Axis Architecture

**Current state**: Our `controls.ts` has a single "layout" axis for hero.

**Required evolution**: The axis system needs to support:

1. **Per-category axis definitions** — each category defines its own axes (not just "layout")
2. **Multiple axis types**:
   - Binary toggle (Image/Video, Yes/No)
   - Multi-option select (None/Image/Video)
   - Numeric selector (1/2/3/4 columns or plans)
   - Alignment (Left/Center/Right)
3. **Sparse matrix support** — not all axis combinations need to produce valid components
4. **Disabled states** — some axis values should be grayed out per component family

**Proposed schema**:
```typescript
type AxisType = 'toggle' | 'select' | 'numeric' | 'alignment'

interface ControlAxis {
  id: string           // e.g., 'style', 'asset', 'placement', 'element'
  label: string        // e.g., 'Style', 'Asset', 'Asset Placement', 'Element'
  type: AxisType
  options: {
    value: string
    label: string
    disabled?: boolean  // per-component-family disabling
  }[]
  default: string
}

interface CategoryControls {
  category: string
  axes: ControlAxis[]
  // Maps axis combination → component variant ID
  variantMap: Record<string, string>  // e.g., "image-left-button" → "hero-1"
}
```

### Filter System Architecture

For our component library panel / add section panel:

1. **Layout filters**: Text alignment, content alignment, columns, off-grid, bento
2. **Element filters**: Tag each component with element metadata (image, video, form, cards, etc.)
3. **Uncommon filter**: Mark rare variants
4. **Search**: Full-text search across component names

### Style Guide → Design Mode Pipeline

Relume's 4-tab workflow maps to our existing architecture:
- **Sitemap** → Our sitemap tab (already built)
- **Wireframe** → Our wireframe tab (already built)
- **Style Guide** → Planned in Design Mode Phase 2 (Style Guide Editor)
- **Design** → Planned in Design Mode Phase 3+ (Design application)

Key Relume features to adopt:
1. **Per-section scheme selection** — each section can have different color scheme
2. **Image controls** — ratio, position, fill mode, shape, overlay
3. **Concept generation** — AI creates complete style packages
4. **Shuffle operations** — quick AI-powered randomization per category

### Component Numbering
Relume uses globally unique numbers. Our system uses category-prefixed IDs (e.g., `hero-1`, `hero-3`). Our approach is more semantic and maintainable. **Keep our naming convention.**

---

## Appendix A: Component Library URL Patterns

```
/components                          → All components overview
/components/{category-slug}          → Category page with all variants
/components/{category-slug}?f=...    → Filtered view
```

## Appendix B: Project URL Structure

```
/app/project/{projectId}
  #mode=sitemap                      → Sitemap tab
  #mode=wireframe&breakpoint=desktop → Wireframe tab (desktop)
  #mode=wireframe&breakpoint=tablet  → Wireframe tab (tablet)
  #mode=wireframe&breakpoint=mobile  → Wireframe tab (mobile)
  #mode=styleguide                   → Style Guide tab
  #mode=design                       → Design tab
```

## Appendix C: Raw Category → Component Count Data

**Grand totals**:
- Marketing: ~1,457 components across 32 categories
- Ecommerce: 27 components across 3 categories
- Application UI: 141 components across 15 categories
- **Total: 1,625** (component library claims 1,757 — delta likely from shared/cross-listed components)

## Appendix D: Elements Filter Complete List (33 items)

1. Buttons
2. Form
3. Image
4. Text Only
5. Multiple Images
6. Overlapping Images
7. Video Lightbox
8. Image Lightbox
9. Background Image
10. Background Video
11. Icons
12. Cards
13. Logos
14. Slider
15. Modal
16. Tabs
17. List
18. Accordion
19. Search Bar
20. Dropdown
21. Rich Text
22. Filters
23. Pagination
24. Mega Menu
25. Tags
26. Table of Contents
27. Loading Animation
28. Progress Bar
29. Sidebar
30. Topbar
31. Side Panel
32. Checkboxes
33. Radio Buttons
34. Toggles

*(Note: 34 items listed — Relume UI says 33, likely grouping Checkboxes+Radio+Toggles or similar)*
