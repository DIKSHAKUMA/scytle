# Scytle SaaS / Application Design Library — Expansion Plan

> **Goal**: Extend the design library beyond marketing sites to support SaaS products, dashboards, and application UIs  
> **Approach**: Context-aware library (Option B) — pages tagged as `marketing | application | auth`, section picker filters accordingly  
> **Prerequisite**: Phases 1–12 of DESIGN-LIBRARY-EXPANSION.md (marketing library) mostly complete  
> **See also**: [DESIGN-LIBRARY-EXPANSION.md](./DESIGN-LIBRARY-EXPANSION.md) for existing marketing library  
> **Figma Analysis**: [SAAS-ARCHETYPE-ANALYSIS.md](./SAAS-ARCHETYPE-ANALYSIS.md) — detailed archetype breakdown with ASCII skeletons, controls, and node IDs

---

## Problem Statement

The current design library only covers **marketing/static website sections** (hero, features, pricing, testimonials, etc.). When a user describes a SaaS product — e.g., "project management tool" or "fintech dashboard" — the AI generates a sitemap but the wireframe can only render marketing sections.

SaaS products need **application UI sections**: dashboards, data tables, charts, settings forms, auth flows, empty states, and more. These live inside an **app shell** (sidebar + topbar) rather than full-width stacked sections.

---

## Architecture Overview

### Page Context System

Every page gets tagged with a **context** that drives layout rendering and section filtering:

```
PageContext: 'marketing' | 'application' | 'auth'
PageLayout:  'stacked'   | 'app-shell'   | 'centered'
```

| Context | Layout | Chrome | Section Categories |
|---------|--------|--------|--------------------|
| `marketing` | `stacked` | Navbar + Footer sections (user-added) | hero, features, cta, testimonials, pricing, faq, contact, content, gallery, team, blog, stats, logos, navbar, footer |
| `application` | `app-shell` | Built-in Topbar + Sidebar (page-level) | dashboard, data-table, chart, app-form, empty-state |
| `auth` | `centered` | None (card on plain background) | auth |

### App Shell Layout

App pages render inside a fixed chrome — sidebar nav + topbar — with sections filling the content area:

```
┌───────────────────────────────────────────┐
│  Logo        Search...       🔔  Avatar   │  ← Topbar (built-in, editable)
├──────────┬────────────────────────────────┤
│          │                                │
│  📊 Dash │   ┌──────────────────────┐     │
│  📁 Proj │   │ Stats Cards Row      │     │  ← Section (from dashboard category)
│  📈 Ana  │   └──────────────────────┘     │
│  ⚙️ Set  │   ┌──────────────────────┐     │
│          │   │ Revenue Chart        │     │  ← Section (from chart category)
│          │   └──────────────────────┘     │
│          │   ┌──────────────────────┐     │
│          │   │ Recent Orders Table  │     │  ← Section (from data-table category)
│          │   └──────────────────────┘     │
├──────────┴────────────────────────────────┤
└───────────────────────────────────────────┘
```

Auth pages render as a centered card:

```
┌───────────────────────────────────────────┐
│                                           │
│            ┌──────────────┐               │
│            │  Logo        │               │
│            │  Email       │               │
│            │  Password    │               │
│            │  [Sign In]   │               │
│            │  Forgot?     │               │
│            └──────────────┘               │
│                                           │
└───────────────────────────────────────────┘
```

### Sitemap AI Auto-Detection

The AI analyzes the project description and auto-detects whether pages are marketing, application, or auth:

- **"project management SaaS"** → Home (marketing), Features (marketing), Pricing (marketing), Dashboard (app), Projects (app), Analytics (app), Settings (app), Login (auth), Signup (auth)
- **"portfolio website"** → All marketing pages, no app/auth pages
- **"e-commerce marketplace"** → Home (marketing), Products (marketing), Dashboard (app), Orders (app), Cart (app), Checkout (app), Login (auth)

---

## Phase Plan

### Phase A: Foundation — Types & Store Infrastructure
**Timeline**: ~1 day  
**What**: Extend the type system and unified store to support page context, page layout, and new section categories.

#### A1. Type System (`src/types/index.ts`)
- [ ] Add `PageContext` type: `'marketing' | 'application' | 'auth'`
- [ ] Add `PageLayout` type: `'stacked' | 'app-shell' | 'centered'`
- [ ] Extend `SectionTypeSchema` with new app types: `dashboard`, `data-table`, `chart`, `app-form`, `auth`, `empty-state`, `app-header`, `sidebar-nav`
- [ ] Add `pageContext` and `pageLayout` to `WireframePage` interface
- [ ] Update `WireframeSectionContent` with app-specific content fields (table columns, chart data, form fields)

#### A2. Design Types (`src/lib/designs/types.ts`)
- [ ] Extend `DesignCategoryId` with: `'dashboard' | 'data-table' | 'app-list' | 'chart' | 'app-form' | 'auth' | 'empty-state'`
- [ ] Add `context?: PageContext` field to `CategoryMeta`

#### A3. Registry (`src/lib/designs/registry.ts`)
- [ ] Add new `CategoryMeta` entries with context field (existing categories get `context: 'marketing'`)
- [ ] Add `context` to all existing `DESIGN_CATEGORIES` entries
- [ ] Add helper: `getCategoriesForContext(context: PageContext): CategoryMeta[]`

#### A4. Unified Store (`src/store/unified-store.ts`)
- [ ] Add `pageContext` and `pageLayout` to `UnifiedPage` interface
- [ ] Extend `inferSectionType()` with app-aware keywords:
  - `dashboard | overview | metrics → 'dashboard'`
  - `table | list view | records → 'data-table'`
  - `list | grid | directory | people | team members → 'app-list'`
  - `chart | analytics | graph | report → 'chart'`
  - `form | settings | preferences | profile | account | payment → 'app-form'`
  - `login | sign in | sign up | register | forgot | verify | onboarding → 'auth'`
  - `empty | onboarding | getting started | zero → 'empty-state'`
- [ ] Extend `DEFAULT_COMPONENT_IDS` with app category defaults
- [ ] Add `inferPageContext()` helper: analyzes page name/slug → returns `PageContext`
- [ ] Add `inferPageLayout()` helper: derives layout from context
- [ ] Update `createSection()` to pass context through

#### A5. Page Context Inference Logic
```
inferPageContext(name, slug):
  /dashboard, /app, /admin, /settings, /analytics, /projects, /orders → 'application'
  /login, /signup, /register, /forgot-password, /verify, /reset → 'auth'
  everything else → 'marketing'

inferPageLayout(context):
  'marketing' → 'stacked'
  'application' → 'app-shell'
  'auth' → 'centered'
```

#### Phase A Deliverables
- [ ] All type extensions in place
- [ ] Registry extended with new categories + context filtering
- [ ] Store creates pages with correct context/layout from AI sitemap data
- [ ] `npm run build` passing (no new families yet — just infrastructure)

---

### Phase B: Sitemap AI Enhancement
**Timeline**: ~1 day  
**What**: Update the sitemap generation prompt to auto-detect product type and generate context-tagged pages.

#### B1. System Prompt Update (`src/app/api/ai/generate-sitemap/route.ts`)
- [ ] Add product-type detection instructions:
  - SaaS / web app → generate marketing + application + auth pages
  - Static site / portfolio / agency → marketing pages only
  - E-commerce → marketing + application pages (cart, orders, account)
  - Marketplace → marketing + application pages (seller dashboard, buyer dashboard)
- [ ] Add `context` and `layout` fields to expected JSON response
- [ ] Add examples for SaaS products:
  ```
  "project management SaaS":
    Home (marketing/stacked), Features (marketing/stacked), Pricing (marketing/stacked),
    Dashboard (application/app-shell), Projects (application/app-shell),
    Settings (application/app-shell), Login (auth/centered), Signup (auth/centered)
  ```
- [ ] Instruct AI: no navbar/footer sections on application/auth pages (chrome is built-in)
- [ ] Instruct AI: application pages use section names like "Stats Overview", "Revenue Chart", "Recent Orders Table", "Activity Feed" — not marketing names

#### B2. Response Schema Update
- [ ] Add `context` and `layout` to `SitemapNodeSchema`
- [ ] Update `SitemapNode` interface with optional `context` and `layout` fields
- [ ] Fallback: if AI doesn't provide context, infer from page name/slug using `inferPageContext()`

#### B3. Section Suggestion Update (`src/app/api/ai/suggest-section/route.ts`)
- [ ] Pass page context to the suggestion prompt
- [ ] AI should suggest sections appropriate for the context (dashboard widgets for app pages, marketing sections for marketing pages)

#### B4. Wireframe Prompt Update (`src/lib/ai/prompts/wireframe-generation.ts`)
- [ ] Extend `WIREFRAME_SECTION_PROMPT` with app section types
- [ ] Add section types list: `dashboard, data-table, chart, app-form, auth, empty-state`
- [ ] Update `buildSectionGenerationPrompt()` to pass page context

#### B5. Page Generation Fallbacks (`src/app/api/ai/generate-page/route.ts`)
- [ ] Add fallback sections for app page types:
  - `dashboard` → stats cards, chart, activity feed, data table
  - `settings` → settings nav, profile form, notification preferences
  - `analytics` → charts, date picker, data table
  - `login` → auth-login
  - `signup` → auth-signup

#### Phase B Deliverables
- [ ] AI generates context-aware sitemaps for SaaS products
- [ ] Application pages come with app-appropriate sections
- [ ] Auth pages come with auth sections only
- [ ] Marketing pages unchanged from current behavior
- [ ] Tested with prompts: "project management SaaS", "analytics dashboard", "e-commerce marketplace"

---

### Phase C: App Shell and Page Frame Rendering
**Timeline**: ~2 days  
**What**: Implement the three layout modes in the wireframe canvas.

#### C1. App Topbar Component (`src/components/wireframe/app-topbar.tsx`)
- [ ] Fixed topbar chrome rendered by page-frame for `app-shell` layout
- [ ] **3 levels from Figma** (see [SAAS-ARCHETYPE-ANALYSIS.md §3](./SAAS-ARCHETYPE-ANALYSIS.md)):
  - Level 3: Full — logo, nav links, search, bell, avatar (1440px, topbar-only shells)
  - Level 2: Above sidebar — logo, search, bell, avatar, NO nav links
  - Level 1: Beside sidebar — search, bell, avatar, NO logo/nav (1144px narrower)
- [ ] Controls: `level: 1|2|3`, `showSearch: boolean`, `showNavLinks: boolean`
- [ ] Responsive: collapses on mobile viewport
- [ ] Editable: `EditableText` for logo text, `EditableIcon` for icons
- [ ] Gray wireframe style — no colors, just outlines and fills

#### C2. App Sidebar Component (`src/components/wireframe/app-sidebar.tsx`)
- [ ] Fixed sidebar chrome rendered by page-frame for `app-shell` layout
- [ ] **3 levels × collapsed from Figma** (see [SAAS-ARCHETYPE-ANALYSIS.md §2](./SAAS-ARCHETYPE-ANALYSIS.md)):
  - Level 3: Standalone — logo, search, avatar, nav groups with icons+badges, sub-items, user profile
  - Level 2: Below topbar — logo + nav items, NO search/avatar
  - Level 1: Simple nav items only, no logo/search/avatar
  - Each level has expanded (with labels) and collapsed (icon-only, ~64px) states
- [ ] Controls: `level: 1|2|3`, `collapsed: boolean`, `showGroups: boolean`, `showBadges: boolean`
- [ ] Editable: nav items are `EditableText`, icons are `EditableIcon`
- [ ] Nav items stored in page-level content (not section content)
- [ ] Responsive: hidden on mobile (hamburger menu instead)

#### C3. Page Frame Layout Branching (`src/components/wireframe/page-frame.tsx`)
- [ ] Branch rendering on `page.pageLayout`:
  ```
  'stacked'   → current behavior (sections stack vertically, full-width)
  'app-shell' → AppTopbar + AppSidebar + content area with sections
  'centered'  → centered container on gray background, sections inside card
  ```
- [ ] App-shell content area: scrollable, sections stack vertically within it
- [ ] Centered layout: max-width card (e.g., 440px), vertically centered

#### C4. Viewport Frame Updates (`src/components/wireframe/viewport-frame.tsx`)
- [ ] App-shell layout adapts to viewport:
  - Desktop: sidebar (240px) + topbar + content
  - Tablet: collapsed sidebar (64px icons only) + topbar + content
  - Mobile: no sidebar, topbar with hamburger, full-width content

#### C5. Section Block Adjustments (`src/components/wireframe/section-block.tsx`)
- [ ] App-context sections render without the outer padding/max-width that marketing sections have
- [ ] No drag-handle for topbar/sidebar chrome (only content sections are reorderable)

#### Phase C Deliverables
- [ ] Three layout modes rendering correctly in wireframe canvas
- [ ] App topbar and sidebar are editable wireframe chrome
- [ ] Responsive across desktop/tablet/mobile viewports
- [ ] Marketing pages unaffected (same as before)
- [ ] `npm run build` passing

---

### Phase D: Dashboard Families (Stat Cards + Page Headers)
**Timeline**: ~2 days  
**Figma Source**: Stat Cards (8 variants, `4174:138040`), Page Headers (5 variants, `4174:122818`)  
**What**: Build wireframe families for dashboard stat cards and page headers.  
**See**: [SAAS-ARCHETYPE-ANALYSIS.md §4 & §12](./SAAS-ARCHETYPE-ANALYSIS.md) for full archetype breakdown.

#### D1. Families (Figma-Derived)

| Family | Description | Figma Variants | Controls |
|--------|-------------|----------------|----------|
| `stat-cards` | Row of KPI stat cards with trend badges | Stat 1–8 (8 variants) | `columns: 3\|4`, `showIcon: boolean`, `showTrend: boolean`, `showCTA: boolean`, `showMenu: boolean` |
| `page-header` | App page header with breadcrumb and actions | Page Header 1–5 (5 variants) | `style: standard\|minimal\|profile`, `showBreadcrumb: boolean`, `showSearch: boolean`, `showDescription: boolean` |

#### D2. Shared Sub-Components
- [ ] `<SectionHeader>` — reusable chrome: title + description + button + ellipsis menu (from Figma Section Headers `4174:123110`)
- [ ] `<TrendBadge>` — ↑/↓ percentage with color indicator
- [ ] These sub-components will be reused across tables, lists, forms, etc.

#### D3. Presets
- [ ] ~8 presets (Stat Cards 1–8 mapped to control snapshots)
- [ ] ~4 presets (Page Header standard, minimal, profile, profile-minimal)
- [ ] Named: Dashboard 1 through Dashboard 12

#### D4. Design Style
- Stat cards: gray rounded rect, bold large number, small label, icon placeholder, trend arrow badge
- Page header standard: breadcrumb trail + heading + description + search input + button
- Page header profile: cover image placeholder (gray band) + overlapping avatar circle + breadcrumb + name

#### Phase D Deliverables
- [ ] 2 dashboard families built and registered
- [ ] ~12 presets with thumbnails
- [ ] `<SectionHeader>` and `<TrendBadge>` sub-components available for reuse
- [ ] Works inside app-shell layout
- [ ] `npm run build` passing

---

### Phase E: Data Table Families
**Timeline**: ~2 days  
**Figma Source**: Tables (10 variants, `2322:52`)  
**What**: Wireframe data tables — standard, filtered, and expandable.  
**See**: [SAAS-ARCHETYPE-ANALYSIS.md §9](./SAAS-ARCHETYPE-ANALYSIS.md) for full archetype breakdown.

#### E1. Families (Figma-Derived)

| Family | Description | Figma Variants | Controls |
|--------|-------------|----------------|----------|
| `table-standard` | Simple table with header row and data rows | Table 1–3, 8–10 (6 variants) | `columns: 4\|5\|6`, `rows: 5\|8\|10`, `showCheckbox: boolean`, `showPagination: boolean`, `showAvatar: boolean`, `rowAction: view\|menu\|none` |
| `table-filtered` | Table with search bar, filter chips, result count | Table 4–6 (3 variants) | `showSearch: boolean`, `showFilters: boolean`, `showCount: boolean`, `showGroups: boolean`, `filterStyle: chips\|dropdown` |
| `table-expandable` | Rows with chevron that expand to detail panel | Table 7 (1 variant) | `detailColumns: 2\|3`, `showImage: boolean` |

#### E2. Variant Coverage via Controls
```
Table 1 (text-only, 5 cols)     → table-standard { columns: 5, showAvatar: false }
Table 8 (avatar rows)           → table-standard { showAvatar: true, rowAction: 'menu' }
Table 10 (transaction rows)     → table-standard { showStatusBadge: true, rowAction: 'menu' }
Table 4 (search + chips)        → table-filtered { showGroups: false, filterStyle: 'chips' }
Table 5 (grouped rows)          → table-filtered { showGroups: true }
Table 7 (expandable)            → table-expandable { detailColumns: 3 }
```

#### E3. Presets
- [ ] ~10 presets mapping to Figma Tables 1–10
- [ ] Named: Table 1 through Table 10

#### E4. Shared Sub-Components
- [ ] `<Pagination>` — page number blocks: `< 1 2 3 4 5 >`
- [ ] `<FilterBar>` — search input + filter icon + tag chips + result count

#### E5. Design Style
- Header row: slightly darker gray background
- Data rows: alternating gray-50/white
- Checkbox: small gray square
- Pagination: numbered gray blocks with active highlight
- Search: input field with search icon
- Filter chips: small rounded rects with text + ✕ dismiss
- Grouped rows: category sub-header row in bold
- Expandable: chevron ▸/▾ icon, detail panel with 3-col metadata grid

#### Phase E Deliverables
- [ ] 3 data-table families built and registered
- [ ] ~10 presets with thumbnails
- [ ] `<Pagination>` and `<FilterBar>` sub-components available
- [ ] `npm run build` passing

---

### Phase F: App List Families (Stacked + Grid)
**Timeline**: ~2 days  
**Figma Source**: Stacked Lists (10 variants, `4174:133785`), Grid Lists (10 variants, `4174:135105`)  
**What**: Wireframe list views — stacked rows and card grids.  
**See**: [SAAS-ARCHETYPE-ANALYSIS.md §10 & §11](./SAAS-ARCHETYPE-ANALYSIS.md) for full archetype breakdown.

#### F1. Families (Figma-Derived)

| Family | Description | Figma Variants | Controls |
|--------|-------------|----------------|----------|
| `list-stacked` | Vertical list of items (user rows or progress rows) | List 1–10 (10 variants) | `style: user\|progress`, `showSearch: boolean`, `showFilter: boolean`, `showAvatar: boolean`, `itemCount: 5\|8\|10` |
| `list-grid` | Card grid of items (people cards or project cards) | Grid 1–10 (10 variants) | `style: people\|project`, `columns: 2\|3\|4`, `showDescription: boolean`, `showTag: boolean`, `itemCount: 3\|6\|9` |

#### F2. Variant Coverage via Controls
```
List 1 (user + search + filter)   → list-stacked { style: 'user', showSearch: true, showFilter: true }
List 4 (progress bars)            → list-stacked { style: 'progress', showSearch: false }
Grid 1 (people, centered)         → list-grid { style: 'people', columns: 3 }
Grid 4 (projects, left-aligned)   → list-grid { style: 'project', columns: 3, showTag: true }
```

#### F3. Presets
- [ ] ~6 presets for stacked lists (user 3-col, user filtered, progress, etc.)
- [ ] ~6 presets for grid lists (people 3-col, people 2-col, project 3-col, etc.)
- [ ] Named: List 1 through List 12

#### F4. Shared Sub-Components
- [ ] `<UserRow>` — avatar + name + email + title + menu
- [ ] `<ProgressBar>` — gray track with filled portion + percentage label

#### F5. Design Style
- User rows: avatar circle (w-8) + name/email stack + job title + ellipsis, separated by dividers
- Progress rows: project name + gray track bar with fill + percentage
- People grid: large avatar circle (centered) + name + title + description text
- Project grid: icon placeholder (left-aligned) + name + date + tag badge + description + ellipsis

#### Phase F Deliverables
- [ ] 2 app-list families built and registered
- [ ] ~12 presets with thumbnails
- [ ] `<UserRow>` and `<ProgressBar>` sub-components
- [ ] `npm run build` passing

---

### Phase G: App Form Families
**Timeline**: ~3 days  
**Figma Source**: Forms (20 variants, `4174:139087`), Description Lists (4 variants, `4174:142227`)  
**What**: Settings forms, payment forms, notification preferences, and read-only description lists.  
**See**: [SAAS-ARCHETYPE-ANALYSIS.md §13 & §14](./SAAS-ARCHETYPE-ANALYSIS.md) for full archetype breakdown.

#### G1. Families (Figma-Derived)

| Family | Description | Figma Variants | Controls |
|--------|-------------|----------------|----------|
| `form-profile` | Account/profile editing with avatar upload | Form 1–5 (5 variants) | `showAvatar: boolean`, `showPasswordSection: boolean`, `layout: stacked\|two-column` |
| `form-address` | Personal info / address fields | Form 6–8 (3 variants) | `fieldLayout: stacked\|side-by-side`, `showCountryDropdown: boolean` |
| `form-payment` | Payment method + plan selection | Form 9–12 (4 variants) | `showPlanSelector: boolean`, `planStyle: radio\|card`, `showBillingAddress: boolean` |
| `form-preferences` | Notifications / preferences with toggles, checkboxes, radios | Form 13–20 (8 variants) | `inputType: toggles\|checkboxes\|radios\|mixed`, `groupCount: 2\|3\|4`, `showDividers: boolean` |
| `description-list` | Read-only or editable label-value display | DL 1–4 (4 variants) | `layout: grid\|rows`, `showEditAction: boolean`, `showDividers: boolean`, `columns: 1\|2` |

#### G2. Variant Coverage via Controls
```
Form 1 (account + avatar)         → form-profile { showAvatar: true, showPasswordSection: true }
Form 6 (address, side-by-side)    → form-address { fieldLayout: 'side-by-side' }
Form 9 (payment + plan radios)    → form-payment { showPlanSelector: true, planStyle: 'radio' }
Form 13 (toggles + checkboxes)    → form-preferences { inputType: 'mixed', groupCount: 3 }
DL 1 (two-column grid read-only)  → description-list { layout: 'grid', showEditAction: false }
DL 3 (rows with "Change" links)   → description-list { layout: 'rows', showEditAction: true }
```

#### G3. Presets
- [ ] ~5 presets for form-profile
- [ ] ~3 presets for form-address
- [ ] ~3 presets for form-payment
- [ ] ~4 presets for form-preferences
- [ ] ~3 presets for description-list
- [ ] Named: Form 1 through Form 18

#### G4. Design Style
- Input fields: gray rounded rects (h-10) with label text above
- Textarea: taller gray rect with char count "128/240" in corner
- Buttons: darker gray rect with white text
- Toggle switches: small pill shape with circle indicator
- Checkboxes: small gray squares with ☑ checked state
- Radio buttons: small circles with ◉ selected state
- Dropdowns: input field with chevron-down icon
- Avatar upload: gray circle + "Upload photo" + file button
- Description list grid: label in gray-400 above value in regular weight
- Description list rows: label | value | "Change" link, separated by dividers

#### Phase G Deliverables
- [ ] 5 app-form families built and registered
- [ ] ~18 presets with thumbnails
- [ ] `npm run build` passing

---

### Phase H: Auth Families
**Timeline**: ~3 days  
**Figma Source**: Sign Up & Login Pages (17 variants, `1919:420`), Modals (5 variants, `1919:1146`), Onboarding (17 variants, `4174:125085`)  
**What**: Login, signup, onboarding, and auth modals.  
**See**: [SAAS-ARCHETYPE-ANALYSIS.md §6, §7, §8](./SAAS-ARCHETYPE-ANALYSIS.md) for full archetype breakdown.

#### H1. Families (Figma-Derived)

| Family | Description | Figma Variants | Controls |
|--------|-------------|----------------|----------|
| `auth-signup` | Registration form with 5 layout options | Signup 1–9 (9 variants) | `layout: centered\|card\|split-testimonial\|split-image\|tabbed`, `showSocial: boolean`, `socialCount: 1\|3`, `showTerms: boolean` |
| `auth-login` | Login form with 4 layout options | Login 1–8 (8 variants) | `layout: centered\|card\|split-testimonial\|split-image`, `showSocial: boolean`, `showRemember: boolean`, `showForgot: boolean` |
| `auth-modal` | Auth form in dialog overlay | Modal 1–5 (5 variants) | `formType: login\|signup`, `showSocial: boolean`, `showClose: boolean` |
| `auth-onboarding` | Multi-step onboarding wizard | Onboarding 1–17 (17 variants) | `layout: stacked\|split-testimonial`, `stepCount: 3\|4\|5`, `showProgress: boolean`, `progressStyle: bar\|steps` |

#### H2. Variant Coverage via Controls
```
Signup 1 (centered)               → auth-signup { layout: 'centered' }
Signup 4 (card)                   → auth-signup { layout: 'card', socialCount: 3 }
Signup 5 (split + testimonial)    → auth-signup { layout: 'split-testimonial' }
Signup 7 (split + image)          → auth-signup { layout: 'split-image' }
Signup 9 (tabbed)                 → auth-signup { layout: 'tabbed' }
Login 1 (centered)                → auth-login { layout: 'centered' }
Login 7 (split + image)           → auth-login { layout: 'split-image' }
Modal 1 (dialog overlay)          → auth-modal { formType: 'signup', showSocial: true }
Onboard 1 (stacked multi-step)    → auth-onboarding { layout: 'stacked', stepCount: 4 }
Onboard 7 (split + testimonial)   → auth-onboarding { layout: 'split-testimonial' }
```

#### H3. Presets
- [ ] ~6 presets for auth-signup (one per layout + common combos)
- [ ] ~5 presets for auth-login
- [ ] ~2 presets for auth-modal (login + signup)
- [ ] ~4 presets for auth-onboarding (stacked, split, 3-step, 5-step)
- [ ] Named: Auth 1 through Auth 17

#### H4. Design Style
- Centered layout: form floats on page background, no card border
- Card layout: form inside bordered card container with padding
- Split layouts: 55/45 split — form left, testimonial/image right
- Testimonial panel: 5 stars + blockquote + avatar + company logo + dot-nav pagination
- Image panel: full-height gray placeholder image
- Social login: icon button row (Google "G", Facebook "F", Apple "🍎") or full-width "[G] Continue with Google"
- Divider: horizontal line with "or" centered
- Progress bar: gray track with colored fill, "Step X of N" label
- Onboarding stacked: all steps visible on one long page, separated by dividers

#### H5. Special: Centered Layout Rendering
- Auth sections render inside the `centered` page layout
- No navbar/footer chrome
- Background: subtle gray (like Figma's canvas background)
- Card: white with slight shadow, max-width 440px, centered vertically
- Split layouts: full-width of the centered container (wider, ~960px)

#### Phase H Deliverables
- [ ] 4 auth families built and registered
- [ ] ~17 presets with thumbnails
- [ ] Renders correctly in centered page layout
- [ ] Split layouts work at wider container width
- [ ] `npm run build` passing

---

### Phase I: Chart + Empty State Families (Custom — No Figma Reference)
**Timeline**: ~2 days  
**What**: Wireframe chart placeholders and zero-data empty states. These are NOT in the Relume Figma kit — designed from common SaaS patterns.

#### I1. Chart Families (Custom)

| Family | Description | Controls |
|--------|-------------|----------|
| `chart-bar` | Bar chart wireframe with axis labels | `orientation: vertical\|horizontal`, `showLegend: boolean`, `showGrid: boolean`, `barCount: 5\|7\|12` |
| `chart-line` | Line chart wireframe with data points | `lineCount: 1\|2\|3`, `showArea: boolean`, `showDots: boolean`, `showGrid: boolean` |
| `chart-pie` | Pie/donut chart wireframe | `style: pie\|donut`, `segments: 3\|4\|5\|6`, `showLegend: boolean` |
| `chart-area` | Stacked area chart wireframe | `areaCount: 1\|2\|3`, `showGrid: boolean`, `showLegend: boolean` |

#### I2. Empty State Families (Custom)

| Family | Description | Controls |
|--------|-------------|----------|
| `empty-state-default` | Centered illustration + heading + description + CTA | `showIllustration: boolean`, `showButton: boolean`, `illustrationStyle: icon\|image` |
| `empty-state-onboarding` | Step-by-step onboarding checklist | `stepCount: 3\|4\|5`, `showProgress: boolean`, `style: checklist\|cards` |

#### I3. Presets
- [ ] ~8 chart presets (2 per chart type)
- [ ] ~4 empty state presets
- [ ] Named: Chart 1–8, Empty State 1–4

#### I4. Design Style
- Bar chart: gray rectangles of varying heights on axis
- Line chart: gray polyline SVG path with optional circles at data points
- Pie chart: gray circle divided into segments (3-4 shades of gray)
- Area chart: gray filled area under polyline, stacked layers
- Axis labels: small gray text placeholders
- Empty state: large centered icon placeholder + heading "No projects yet" + description + CTA button

#### Phase I Deliverables
- [ ] 4 chart families + 2 empty-state families built and registered
- [ ] ~12 presets with thumbnails
- [ ] `npm run build` passing

---

### Phase J: Section Picker & Integration Testing
**Timeline**: ~1 day  
**What**: Wire everything together — filtered section picker, end-to-end flow testing.

#### J1. Section Picker Filtering (`src/components/wireframe/add-section-sidebar.tsx`)
- [ ] Read `pageContext` from the currently selected page
- [ ] Filter `DESIGN_CATEGORIES` by context:
  - `marketing` → show existing 15 marketing categories
  - `application` → show dashboard, data-table, app-list, chart, app-form, empty-state
  - `auth` → show auth only
- [ ] "All" tab still shows everything (power users can mix)

#### J2. Sitemap View Updates (`src/components/canvas/sitemap-view.tsx`)
- [ ] Show page context badge on sitemap nodes (small label: "App" / "Auth")
- [ ] Allow user to change page context via right-click menu or page details panel

#### J3. Page Details Panel (`src/components/canvas/page-details-panel.tsx`)
- [ ] Add page context selector: Marketing / Application / Auth
- [ ] Add page layout selector: Stacked / App Shell / Centered
- [ ] Changing context re-filters available sections in wireframe view

#### J4. End-to-End Testing
- [ ] Test: Enter "SaaS CRM tool" → verify AI generates mixed marketing + app + auth pages
- [ ] Test: Switch to wireframe → verify app pages show app-shell layout
- [ ] Test: Add section to app page → verify only app categories shown
- [ ] Test: Auth pages render centered layout
- [ ] Test: Marketing pages behave exactly as before (no regression)
- [ ] Test: Viewport responsiveness for all three layout modes

#### Phase J Deliverables
- [ ] Section picker filters by page context
- [ ] Page context editable in UI
- [ ] Full pipeline works: description → sitemap → wireframe with correct layouts
- [ ] No regressions on existing marketing flow
- [ ] `npm run build` passing

---

## New Category Summary

| Category | Families | Presets | Context | Figma Source |
|----------|----------|--------|---------|--------------|
| `dashboard` | 2 (stat-cards, page-header) | ~12 | application | Stat Cards, Page Headers |
| `data-table` | 3 (table-standard, table-filtered, table-expandable) | ~10 | application | Tables |
| `app-list` | 2 (list-stacked, list-grid) | ~12 | application | Stacked Lists, Grid Lists |
| `app-form` | 5 (form-profile, form-address, form-payment, form-preferences, description-list) | ~18 | application | Forms, Description Lists |
| `auth` | 4 (auth-signup, auth-login, auth-modal, auth-onboarding) | ~17 | auth | Sign Up/Login, Modals, Onboarding |
| `chart` | 4 (chart-bar, chart-line, chart-pie, chart-area) | ~8 | application | _(custom)_ |
| `empty-state` | 2 (empty-state-default, empty-state-onboarding) | ~4 | application | _(custom)_ |
| **Total** | **22** | **~81** | | |

### Page-Level Components (Not Categories)

| Component | Configs | Figma Source |
|-----------|---------|--------------|
| `app-sidebar.tsx` | 6 (3 levels × collapsed) | Sidebars |
| `app-topbar.tsx` | 3 (3 levels) | Topbars |

### Shared Sub-Components (Reusable Across Families)

| Sub-Component | Used In |
|--------------|---------|
| `<SectionHeader>` | Tables, Lists, Stat Cards, Forms |
| `<Pagination>` | Tables, Stacked Lists |
| `<FilterBar>` | Tables, Stacked Lists |
| `<UserRow>` | Stacked Lists, Tables |
| `<ProgressBar>` | Progress Lists, Onboarding |
| `<TrendBadge>` | Stat Cards |

### Final Target (Marketing + App Combined)
- **Families**: ~77 (55 marketing + 22 app)
- **Presets**: ~188 (107 marketing + 81 app)
- **Effective visual variants**: 654+ (via controls)
- **Product types supported**: Marketing sites, SaaS products, E-commerce, Marketplaces

---

## File Structure for New Categories

```
src/lib/designs/
├── dashboard/
│   ├── families/
│   │   ├── stat-cards.tsx            ← Figma Stat Cards 1–8
│   │   └── page-header.tsx           ← Figma Page Headers 1–5
│   ├── presets.tsx
│   └── index.ts
├── data-table/
│   ├── families/
│   │   ├── table-standard.tsx        ← Figma Tables 1–3, 8–10
│   │   ├── table-filtered.tsx        ← Figma Tables 4–6
│   │   └── table-expandable.tsx      ← Figma Table 7
│   ├── presets.tsx
│   └── index.ts
├── app-list/
│   ├── families/
│   │   ├── list-stacked.tsx          ← Figma Stacked Lists 1–10
│   │   └── list-grid.tsx             ← Figma Grid Lists 1–10
│   ├── presets.tsx
│   └── index.ts
├── app-form/
│   ├── families/
│   │   ├── form-profile.tsx          ← Figma Forms 1–5
│   │   ├── form-address.tsx          ← Figma Forms 6–8
│   │   ├── form-payment.tsx          ← Figma Forms 9–12
│   │   ├── form-preferences.tsx      ← Figma Forms 13–20
│   │   └── description-list.tsx      ← Figma DL 1–4
│   ├── presets.tsx
│   └── index.ts
├── auth/
│   ├── families/
│   │   ├── auth-signup.tsx           ← Figma Signup 1–9
│   │   ├── auth-login.tsx            ← Figma Login 1–8
│   │   ├── auth-modal.tsx            ← Figma Modals 1–5
│   │   └── auth-onboarding.tsx       ← Figma Onboarding 1–17
│   ├── presets.tsx
│   └── index.ts
├── chart/
│   ├── families/
│   │   ├── chart-bar.tsx             ← Custom (no Figma)
│   │   ├── chart-line.tsx            ← Custom (no Figma)
│   │   ├── chart-pie.tsx             ← Custom (no Figma)
│   │   └── chart-area.tsx            ← Custom (no Figma)
│   ├── presets.tsx
│   └── index.ts
├── empty-state/
│   ├── families/
│   │   ├── empty-state-default.tsx   ← Custom (no Figma)
│   │   └── empty-state-onboarding.tsx← Custom (no Figma)
│   ├── presets.tsx
│   └── index.ts
```

### Shared Sub-Components

```
src/components/wireframe/
├── app-topbar.tsx          (NEW — 3 levels from Figma)
├── app-sidebar.tsx         (NEW — 3 levels × collapsed from Figma)
├── shared/
│   ├── section-header.tsx  (NEW — reusable section/card header chrome)
│   ├── pagination.tsx      (NEW — page number navigation)
│   ├── filter-bar.tsx      (NEW — search + filters + count)
│   ├── user-row.tsx        (NEW — avatar + name/email row)
│   ├── progress-bar.tsx    (NEW — track + fill + percentage)
│   └── trend-badge.tsx     (NEW — ↑/↓ trend indicator)
```

---

## Design Style Guide for App Sections

All app wireframe sections follow the **same gray placeholder style** as marketing sections:

- **No real data** — all content is placeholder
- **No colors** — grayscale only (gray-50 through gray-400)
- **No borders** on outer containers — clean, minimal
- **Consistent spacing** — use same padding scale as marketing sections
- **Responsive** — all families handle desktop/tablet/mobile via `viewport` prop
- **Editable** — use `EditableText`, `EditableIcon`, `DynamicList` where appropriate
- **Controls** — sidebar controls for layout variations, same `controlsDef` pattern

### Specific Patterns

| Element | Wireframe Style |
|---------|-----------------|
| Stat card | Gray rounded rect, bold number, small label, optional trend arrow |
| Table cell | Text on alternating gray-50/white rows |
| Chart bar | Gray rect of varying height |
| Chart line | Gray polyline SVG path |
| Pie segment | Gray circle slices (3-4 shades of gray) |
| Input field | Gray rounded rect (h-10) with label above |
| Button | Darker gray rect with white text |
| Avatar | Gray circle (w-8 h-8 or w-10 h-10) |
| Icon | Lucide icon in gray-400 via `EditableIcon` |
| Activity item | Avatar + text lines + small timestamp |

---

## Progress Tracking

### Phase A: Foundation ☐
- [ ] Type extensions (PageContext, PageLayout, new SectionTypes)
- [ ] DesignCategoryId extension (+ `app-list`)
- [ ] CategoryMeta context field
- [ ] UnifiedPage context/layout fields
- [ ] inferSectionType() expansion
- [ ] inferPageContext() + inferPageLayout() helpers
- [ ] DEFAULT_COMPONENT_IDS expansion
- [ ] `npm run build` passing

### Phase B: Sitemap AI ☐
- [ ] System prompt rewrite with auto-detection
- [ ] Response schema with context/layout fields
- [ ] Section suggestion context awareness
- [ ] Wireframe prompt update
- [ ] Page generation fallbacks for app types
- [ ] Tested with 3+ SaaS prompts

### Phase C: App Shell Rendering ☐
- [ ] AppTopbar component (3 levels from Figma)
- [ ] AppSidebar component (3 levels × collapsed from Figma)
- [ ] page-frame.tsx layout branching
- [ ] viewport-frame.tsx responsive app-shell
- [ ] section-block.tsx context adjustments
- [ ] All three layouts rendering correctly

### Phase D: Dashboard ☐
- [ ] 2 families (stat-cards, page-header) built
- [ ] Shared sub-components: SectionHeader, TrendBadge
- [ ] ~12 presets created
- [ ] Registered in registry

### Phase E: Data Table ☐
- [ ] 3 families (table-standard, table-filtered, table-expandable) built
- [ ] Shared sub-components: Pagination, FilterBar
- [ ] ~10 presets created
- [ ] Registered in registry

### Phase F: App List ☐
- [ ] 2 families (list-stacked, list-grid) built
- [ ] Shared sub-components: UserRow, ProgressBar
- [ ] ~12 presets created
- [ ] Registered in registry

### Phase G: App Form ☐
- [ ] 5 families (form-profile, form-address, form-payment, form-preferences, description-list) built
- [ ] ~18 presets created
- [ ] Registered in registry

### Phase H: Auth ☐
- [ ] 4 families (auth-signup, auth-login, auth-modal, auth-onboarding) built
- [ ] ~17 presets created
- [ ] Renders in centered layout
- [ ] Split layouts at wider container width

### Phase I: Chart + Empty State ☐
- [ ] 4 chart families + 2 empty-state families built
- [ ] ~12 presets created
- [ ] Registered in registry

### Phase J: Integration ☐
- [ ] Section picker context filtering
- [ ] Sitemap node context badges
- [ ] Page details panel context/layout selectors
- [ ] End-to-end testing
- [ ] No regressions
- [ ] `npm run build` passing
