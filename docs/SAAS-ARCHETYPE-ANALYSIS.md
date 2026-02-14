# Relume SaaS/Application Kit → Scytle Archetype Analysis

> Extracted from Relume Figma Kit (fileKey: `Ehft8P02yDqutz3LhXtJqZ`)
> Analysis date: 2025-07-18
> Purpose: Map Relume's SaaS/application UI components to Scytle's parametric family architecture
> Companion to: [RELUME-ARCHETYPE-ANALYSIS.md](./RELUME-ARCHETYPE-ANALYSIS.md) (marketing library)

---

## Executive Summary

| Category | Relume Variants | Scytle Category | Families Needed | Effective Coverage |
|----------|----------------|-----------------|-----------------|-------------------|
| Application Shells | 16 | _(page-level layout)_ | — | 4 shell configs |
| Sidebars | 9 | _(app-sidebar component)_ | — | 6 configs (3 levels × collapsed) |
| Topbars | 4 | _(app-topbar component)_ | — | 3 configs (3 levels) |
| Page Headers | 5 | `dashboard` | 1 family | ~6 variants via controls |
| Section Headers | 4 | _(shared chrome)_ | — | Pattern reused across sections |
| Card Headers | 2 | _(shared chrome)_ | — | Pattern reused across cards |
| Sign Up & Login Pages | 17 | `auth` | 2 families | ~20 variants via controls |
| Sign Up & Login Modals | 5 | `auth` | 1 family | ~4 variants via controls |
| Onboarding Forms | 17 | `auth` | 1 family | ~8 variants via controls |
| Tables | 10 | `data-table` | 3 families | ~24 variants via controls |
| Stacked Lists | 10 | `app-list` | 2 families | ~12 variants via controls |
| Grid Lists | 10 | `app-list` | 2 families | ~12 variants via controls |
| Stat Cards | 8 | `dashboard` | 1 family | ~8 variants via controls |
| Forms | 20 | `app-form` | 4 families | ~20 variants via controls |
| Description Lists | 4 | `app-form` | 1 family | ~4 variants via controls |
| **Total** | **141** | **5 categories** | **18 families** | **~124 variants** |

**Key insight**: 141 Relume SaaS components → 18 parametric families covering ~124 visual variants. Plus 3 page-level components (app-shell, sidebar, topbar) with ~13 configurations. Charts and empty-states will be custom additions (not in this Figma kit).

---

## 1. Application Shells (Page-Level Layout)

### Relume Inventory
- **16 variants**: Shell 1 through Shell 16
- **Page node**: `4174:116704`
- **Not a section category** — shells define the page-level `app-shell` layout

### Structural Archetypes Identified

#### Archetype A: **Topbar Only** (Shell 1–4)
```
┌─────────────────────────────────────────────┐
│  Logo      Search...          🔔  Avatar    │  ← Topbar Level 3
├─────────────────────────────────────────────┤
│                                             │
│              Content Area                   │
│                                             │
└─────────────────────────────────────────────┘
```
- Shell 1 (4174:117187): Single content pane
- Shell 5 (4174:117377): Two-column content (secondary + main)
- Topbar has logo, search, notification bell, user avatar
- Full-width content below

#### Archetype B: **Sidebar Level 2 + Topbar Level 1** (Shell 9–12)
```
┌─────────────────────────────────────────────┐
│  Logo      Search...          🔔  Avatar    │  ← Topbar Level 2 (full width)
├──────────┬──────────────────────────────────┤
│  ☰ Nav   │                                  │
│  Item 1  │        Content Area              │
│  Item 2  │                                  │
│  Item 3  │                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```
- Shell 9 (4174:117501): Topbar above, sidebar below topbar
- Sidebar has nav items but NO logo/search/avatar (those are in topbar)
- Two-tier: topbar handles identity, sidebar handles navigation

#### Archetype C: **Sidebar Level 3 (Standalone)** (Shell 13–16)
```
┌──────────┬──────────────────────────────────┐
│  Logo    │                                  │
│  🔍      │                                  │
│          │                                  │
│  📊 Dash │        Content Area              │
│  📁 Proj │                                  │
│  📈 Ana  │                                  │
│  ⚙️ Set  │                                  │
│          │                                  │
│  👤 User │                                  │
└──────────┴──────────────────────────────────┘
```
- Shell 15 (4174:117645): Full sidebar with logo, search, nav, user profile
- NO topbar — sidebar handles everything
- Shell 16: Three-column variant (sidebar + secondary + main)

### Shell → Page Layout Mapping

| Shell Archetype | `sidebarLevel` | `topbarLevel` | Config |
|-----------------|---------------|---------------|--------|
| Topbar-only | — | 3 (full) | `{ sidebar: false, topbar: true, topbarLevel: 3 }` |
| Sidebar L2 + Topbar L1 | 2 | 1 or 2 | `{ sidebar: true, sidebarLevel: 2, topbar: true, topbarLevel: 1 }` |
| Sidebar L3 standalone | 3 | — | `{ sidebar: true, sidebarLevel: 3, topbar: false }` |

---

## 2. Sidebars (App Shell Component)

### Relume Inventory
- **9 variants**: Sidebar 1 through Sidebar 9
- **Page node**: `4174:121341`
- **Component**: `src/components/wireframe/app-sidebar.tsx`

### Structural Archetypes by Level

#### Level 3 — Standalone Sidebar (Sidebar 1–3)
```
┌──────────────┐
│  [Logo]      │
│  🔍 Search   │
│              │
│  Section 1   │
│  ├─ Item ●   │  ← icon + label + badge
│  ├─ Item     │
│  └─ Sub-item │  ← collapsible sub-nav
│              │
│  Section 2   │
│  ├─ Item     │
│  └─ Item     │
│              │
│  ──────────  │
│  👤 User     │  ← avatar + name at bottom
└──────────────┘
```
- **Sidebar 1** (4174:121343): Expanded — logo, search, grouped nav items with icons + badges, sub-items, user profile at bottom
- **Sidebar 2**: Similar with variations in grouping
- **Sidebar 3** (4174:121647): **Collapsed** — icon-only mode (no labels), narrow width (~64px)

**Features**: Logo, search input, avatar/profile, nav groups with headers, badges, sub-items, active state indicator

#### Level 2 — Below Topbar (Sidebar 4–6)
```
┌──────────────┐
│  [Logo]      │
│              │
│  Section 1   │
│  ├─ Item ●   │
│  ├─ Item     │
│  └─ Item     │
│              │
│  Section 2   │
│  ├─ Item     │
│  └─ Item     │
└──────────────┘
```
- **Sidebar 4** (4174:121799): Expanded — logo + nav items, NO search/avatar (those are in topbar)
- **Sidebar 5**: Variation
- **Sidebar 6** (4174:122103): **Collapsed** — icon-only mode

**Features**: Logo (optional), nav items with icons, grouped sections, NO search/avatar

#### Level 1 — Simple Nav (Sidebar 7–9)
```
┌──────────────┐
│  Item        │
│  Item ●      │  ← active state
│  Item        │
│  Item        │
│  Item        │
└──────────────┘
```
- **Sidebar 7** (4174:122255): Expanded — plain nav items, no logo/search/avatar
- **Sidebar 8**: Variation
- **Sidebar 9** (4174:122487): **Collapsed** — icon-only mode

**Features**: Nav items only, minimal chrome

### Sidebar Controls

```typescript
controlsDef: {
  level: { type: 'toggle-group', options: ['1', '2', '3'], default: '2' },
  collapsed: { type: 'switch', default: false },
  showGroups: { type: 'switch', default: true },
  showBadges: { type: 'switch', default: false },
}
```

---

## 3. Topbars (App Shell Component)

### Relume Inventory
- **4 variants**: Topbar 1 through Topbar 4
- **Page node**: `4174:122640`
- **Component**: `src/components/wireframe/app-topbar.tsx`

### Structural Archetypes by Level

#### Level 3 — Full Topbar (Topbar 1)
```
┌──────────────────────────────────────────────────┐
│  [Logo]   Link  Link  Link  Link    🔍  🔔  👤  │  (1440px)
└──────────────────────────────────────────────────┘
```
- **Topbar 1** (4174:122642): Logo + navigation links + search + bell + avatar
- Full 1440px width, used WITHOUT sidebar (topbar-only shells)

#### Level 2 — Above Sidebar (Topbar 2)
```
┌──────────────────────────────────────────────────┐
│  [Logo]              🔍 Search...       🔔  👤  │  (1440px)
└──────────────────────────────────────────────────┘
```
- **Topbar 2** (4174:122714): Logo + search + bell + avatar, NO nav links
- Full width, sits above a Level 2 sidebar

#### Level 1 — Beside Sidebar (Topbar 3–4)
```
                    ┌──────────────────────────────┐
                    │  🔍 Search...       🔔  👤  │  (1144px, narrower)
                    └──────────────────────────────┘
```
- **Topbar 3** (4174:122758): Search + bell + avatar, NO logo, NO nav links
- **Topbar 4** (4174:122802): Similar variant
- Narrower (1144px) — sits beside a Level 2/3 sidebar

### Topbar Controls

```typescript
controlsDef: {
  level: { type: 'toggle-group', options: ['1', '2', '3'], default: '1' },
  showSearch: { type: 'switch', default: true },
  showNavLinks: { type: 'switch', default: false },  // only for level 3
}
```

---

## 4. Page Headers → `dashboard` Category

### Relume Inventory
- **5 variants**: Page Header 1 through Page Header 5
- **Page node**: `4174:122818`

### Structural Archetypes Identified

#### Archetype A: **Standard Page Header** (Page Header 1–2)
```
┌──────────────────────────────────────────────┐
│  Home / Projects / Current Project           │  ← Breadcrumb
│  Page Title                                  │
│  Description text for this page...           │
│  🔍 Search...         [+ Add New]            │
└──────────────────────────────────────────────┘
```
- **Page Header 1** (4174:122824): Breadcrumb + title + description + search + button
- **Page Header 2** (4174:122882): Minimal — search + button only (no breadcrumb/title in header)

#### Archetype B: **Profile Banner Header** (Page Header 3–5)
```
┌──────────────────────────────────────────────┐
│  ░░░░░░░░░░ Cover Image Banner ░░░░░░░░░░░  │
│  ┌────┐                                      │
│  │ 👤 │  Home / People / John Doe            │
│  └────┘  John Doe                            │
│          UX Designer at Company              │
│  🔍 Search...                   [Edit]       │
└──────────────────────────────────────────────┘
```
- **Page Header 3** (4174:122940): Cover image + overlapping avatar + breadcrumb + name + title
- **Page Header 4–5**: Variations with different content density

### Family: `page-header`

```typescript
controlsDef: {
  style: { type: 'toggle-group', options: ['standard', 'minimal', 'profile'], default: 'standard' },
  showBreadcrumb: { type: 'switch', default: true },
  showSearch: { type: 'switch', default: true },
  showDescription: { type: 'switch', default: true },
}
```

**Result**: 1 family × 6 control combos = ~6 visual variants (covers all 5 Relume page headers)

---

## 5. Section & Card Headers (Shared Chrome Pattern)

### Relume Inventory
- **Section Headers**: 4 variants (node `4174:123110`)
- **Card Headers**: 2 variants (node `4174:123252`)

These are NOT standalone families. They define a **shared chrome pattern** used at the top of dashboard sections, table sections, form sections, etc.

### Standard Pattern
```
┌──────────────────────────────────────────────┐
│  Section Title         [+ Button]  [⋯]      │
│  Description text...                         │
└──────────────────────────────────────────────┘
```
- **Section Header 1** (4174:123112): Heading + description + button + ellipsis menu
- **Card Header 1** (4174:123255): Same pattern, scoped to card width

### Implementation
This is a **shared sub-component** used inside other families (tables, stat cards, forms, lists). Each family renders the section/card header internally based on controls:
- `showSectionHeader: boolean`
- `showDescription: boolean`
- `showAction: boolean`
- `showMenu: boolean`

---

## 6. Sign Up & Login Pages → `auth` Category

### Relume Inventory
- **17 page variants**: Signup 1–9 + Login 1–8
- **Page node**: `1919:420` (pages), `1919:1146` (modals)

### Structural Archetypes Identified

#### Archetype A: **Centered Full-Page** (Signup 1, Login 1)
```
┌──────────────────────────────────────────────┐
│                                              │
│           Logo                               │
│           Sign up                            │
│           Lorem ipsum dolor sit amet         │
│                                              │
│           ┌───────────────────┐              │
│           │ First name        │              │
│           └───────────────────┘              │
│           ┌───────────────────┐              │
│           │ Email             │              │
│           └───────────────────┘              │
│           ┌───────────────────┐              │
│           │ Password          │              │
│           └───────────────────┘              │
│           [Sign up ─────────────]            │
│                                              │
│           ── or sign up with ──              │
│           [G Google]                         │
│                                              │
│           Already have an account? Log in    │
│                                              │
└──────────────────────────────────────────────┘
```
- **Signup 1** (4174:123314): Full-page centered, no card border
- **Login 1** (4174:123891): Same layout for login (email + password only)
- Fields: name/email/password + primary button + divider + social login + switch link
- No outer card container — form floats on page background

#### Archetype B: **Centered Card** (Signup 4, Login 4)
```
┌──────────────────────────────────────────────┐
│                                              │
│         ┌────────────────────────┐           │
│         │  Logo                  │           │
│         │  Sign up               │           │
│         │                        │           │
│         │  [Name          ]      │           │
│         │  [Email         ]      │           │
│         │  [Password      ]      │           │
│         │  [Sign up ────────]    │           │
│         │                        │           │
│         │  ── or ──              │           │
│         │  [G] [F] [🍎]         │           │
│         │                        │           │
│         │  Already have acc?     │           │
│         └────────────────────────┘           │
│                                              │
└──────────────────────────────────────────────┘
```
- **Signup 4** (4174:123471): Form inside bordered card container
- **Login 4** (4174:124050): Same for login
- Multiple social login buttons (Google, Facebook, Apple) shown as row of icons
- Clear card boundary with padding

#### Archetype C: **Split + Testimonial** (Signup 5, Login 5)
```
┌──────────────────────────┬───────────────────┐
│  Logo                    │                   │
│  Sign up                 │  ★★★★★            │
│  Lorem ipsum...          │  "Quote text      │
│                          │   goes here..."   │
│  [Name          ]        │                   │
│  [Email         ]        │  👤 Name          │
│  [Password      ]        │  Position, Company│
│  [Sign up ────────]      │                   │
│                          │  [Logo] [Logo]    │
│  ── or ──                │                   │
│  [G Google]              │  ○ ● ○ ○          │
│                          │  (dot navigation) │
│  Already have account?   │                   │
└──────────────────────────┴───────────────────┘
```
- **Signup 5** (4174:123518): Left: form, Right: testimonial carousel
- Stars + quote + avatar + company logo + dot-nav pagination
- Split ratio ~55/45

#### Archetype D: **Split + Image** (Signup 7, Login 7)
```
┌──────────────────────────┬───────────────────┐
│  Logo                    │                   │
│  Sign up                 │  ┌─────────────┐  │
│  Lorem ipsum...          │  │             │  │
│                          │  │  Placeholder│  │
│  [Name          ]        │  │    Image    │  │
│  [Email         ]        │  │             │  │
│  [Password      ]        │  └─────────────┘  │
│  [Sign up ────────]      │                   │
│                          │                   │
│  Already have account?   │                   │
└──────────────────────────┴───────────────────┘
```
- **Signup 7** (4174:123724): Left: form, Right: image placeholder
- **Login 7** (4174:124310): Same for login
- Clean split with full-height image

#### Archetype E: **Tabbed (Sign Up / Login Toggle)** (Signup 9)
```
┌──────────────────────────────────────────────┐
│                                              │
│           Logo                               │
│           [Sign Up] [Log In]                 │  ← Tab switcher
│                                              │
│           ┌───────────────────┐              │
│           │ Name              │              │
│           └───────────────────┘              │
│           ┌───────────────────┐              │
│           │ Email             │              │
│           └───────────────────┘              │
│           ┌───────────────────┐              │
│           │ Password          │              │
│           └───────────────────┘              │
│           [Create account ──────]            │
│                                              │
│           ── or sign up with ──              │
│           [G Google]                         │
│                                              │
└──────────────────────────────────────────────┘
```
- **Signup 9** (4174:123830): Centered with tab switcher between Sign Up / Log In
- Same form fields, but with tab toggle at top

### Auth Login/Signup Family Action Plan

| Family | Variants Covered | Controls |
|--------|-----------------|----------|
| `auth-signup` | Signup 1–9 (9 variants) | `layout: centered \| card \| split-testimonial \| split-image \| tabbed`, `showSocial: boolean`, `socialCount: 1 \| 3`, `showTerms: boolean` |
| `auth-login` | Login 1–8 (8 variants) | `layout: centered \| card \| split-testimonial \| split-image`, `showSocial: boolean`, `showRemember: boolean`, `showForgot: boolean` |

**Result**: 2 families × ~10 control combos each = ~20 visual variants (covers all 17 page variants)

---

## 7. Sign Up & Login Modals → `auth` Category

### Relume Inventory
- **5 variants**: Modal 1 through Modal 5
- **Page node**: `1919:1146`

### Structural Archetype
```
┌──────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░ ┌────────────────────┐ ░░░░░░░░░░  │
│  ░░░░░░░ │  Sign up       [✕] │ ░░░░░░░░░░  │
│  ░░░░░░░ │  Lorem ipsum...    │ ░░░░░░░░░░  │
│  ░░░░░░░ │                    │ ░░░░░░░░░░  │
│  ░░░░░░░ │  [Name       ]     │ ░░░░░░░░░░  │
│  ░░░░░░░ │  [Email      ]     │ ░░░░░░░░░░  │
│  ░░░░░░░ │  [Password   ]     │ ░░░░░░░░░░  │
│  ░░░░░░░ │  [Sign up ──────]  │ ░░░░░░░░░░  │
│  ░░░░░░░ │                    │ ░░░░░░░░░░  │
│  ░░░░░░░ │  ── or ──          │ ░░░░░░░░░░  │
│  ░░░░░░░ │  [G Google]        │ ░░░░░░░░░░  │
│  ░░░░░░░ │                    │ ░░░░░░░░░░  │
│  ░░░░░░░ │  Already have acc? │ ░░░░░░░░░░  │
│  ░░░░░░░ └────────────────────┘ ░░░░░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└──────────────────────────────────────────────┘
```
- **Modal 1** (4174:124770): Dark overlay + centered dialog
- Close [✕] button top-right
- Same form fields as page variants but inside modal dialog

### Family: `auth-modal`

```typescript
controlsDef: {
  formType: { type: 'toggle-group', options: ['login', 'signup'], default: 'login' },
  showSocial: { type: 'switch', default: true },
  showClose: { type: 'switch', default: true },
}
```

**Result**: 1 family × 4 control combos = ~4 visual variants (covers all 5 modal variants)

---

## 8. Onboarding Forms → `auth` Category

### Relume Inventory
- **17 variants**: Onboarding 1 through Onboarding 17
- **Page node**: `4174:125085`

### Structural Archetypes Identified

#### Archetype A: **Multi-Step Stacked** (Onboarding 1–6)
```
┌──────────────────────────────────────────────┐
│  Logo                                        │
│  ████████░░░░░░░░░░░░░░░░░░  (progress bar)  │
│                                              │
│  Step 1 of 4                                 │
│  Your details                                │
│  Please provide your name and email           │
│                                              │
│  ┌───────────────────┐                       │
│  │ Name              │                       │
│  └───────────────────┘                       │
│  ┌───────────────────┐                       │
│  │ Email             │                       │
│  └───────────────────┘                       │
│  ┌───────────────────┐                       │
│  │ Phone             │                       │
│  └───────────────────┘                       │
│                                              │
│                              [Next ──────]   │
│                                              │
│  ─── Step 2 ──────────────────────────────── │
│  Choose your plan                            │
│  ┌────────┐ ┌────────┐ ┌────────┐           │
│  │ Basic  │ │  Pro   │ │ Enter  │           │
│  │ $9/mo  │ │ $29/mo │ │ prise  │           │
│  └────────┘ └────────┘ └────────┘           │
│                              [Next ──────]   │
│                                              │
│  ─── Step 3 ──────────────────────────────── │
│  Almost there!                               │
│  Set up your workspace                       │
│  ┌───────────────────┐                       │
│  │ Workspace name    │                       │
│  └───────────────────┘                       │
│                         [Get started ─────]  │
└──────────────────────────────────────────────┘
```
- **Onboard 1** (4174:125087): All steps visible on one long page
- Progress bar at top showing current step
- Each step: "Step X of N" + title + description + fields + Next button
- Final step has "Get started" button instead of "Next"
- Steps separated by dividers

#### Archetype B: **Multi-Step Split + Testimonial** (Onboarding 7–17)
```
┌──────────────────────────┬───────────────────┐
│  Logo                    │                   │
│  ████████░░░░░░░░░░░░░░  │  ★★★★★            │
│                          │  "Great product   │
│  Step 1 of 4             │   that changed    │
│  Your details            │   our workflow"   │
│                          │                   │
│  ┌───────────────────┐   │  👤 Jane Smith    │
│  │ Name              │   │  CEO, Acme Inc    │
│  └───────────────────┘   │                   │
│  ┌───────────────────┐   │  [Logo] [Logo]    │
│  │ Email             │   │                   │
│  └───────────────────┘   │  ○ ● ○ ○          │
│                          │                   │
│              [Next ────] │                   │
│                          │                   │
└──────────────────────────┴───────────────────┘
```
- **Onboard 7** (4174:126569): Split layout — left: step form, right: testimonial carousel
- Same step progression but in split layout
- Testimonial panel includes stars, quote, avatar, company logos, dot navigation

### Family: `auth-onboarding`

```typescript
controlsDef: {
  layout: { type: 'toggle-group', options: ['stacked', 'split-testimonial'], default: 'stacked' },
  stepCount: { type: 'toggle-group', options: ['3', '4', '5'], default: '4' },
  showProgress: { type: 'switch', default: true },
  progressStyle: { type: 'toggle-group', options: ['bar', 'steps'], default: 'bar' },
}
```

**Result**: 1 family × 8 control combos = ~8 visual variants (covers all 17 onboarding variants)

---

## 9. Tables → `data-table` Category

### Relume Inventory
- **10 variants**: Table 1 through Table 10
- **Page node**: `2322:52`

### Structural Archetypes Identified

#### Archetype A: **Standard Table** (Table 1–3, 8–10)
```
┌──────────────────────────────────────────────┐
│  Table Title              [+ Add]  [⋯]      │
│  Description text...                         │
├──────────────────────────────────────────────┤
│  Name ▾    │ Company  │ Number │ Team │ Date │
├────────────┼──────────┼────────┼──────┼──────┤
│  John Doe  │ Acme Inc │ 12345  │ Dev  │ Jan  │ → [View]
│  Jane Smi  │ Beta Co  │ 67890  │ Ops  │ Feb  │ → [View]
│  Bob Wil   │ Corp Ltd │ 11223  │ PM   │ Mar  │ → [View]
│  Alice J   │ Delta    │ 44556  │ QA   │ Apr  │ → [View]
│  Eve Bro   │ Echo Inc │ 77889  │ Dev  │ May  │ → [View]
├──────────────────────────────────────────────┤
│  < 1 2 3 4 5 >                              │  ← Pagination
└──────────────────────────────────────────────┘
```
- **Table 1** (4174:130871): Card header + column headers + text-only data rows + "View" action + pagination
- **Table 8** (4174:132537): **Rich rows** — avatar + name/email in Name column, badge icons in Products column
- **Table 10** (4174:133115): **Transaction rows** — Transaction ID, Price ($55.00), Quantity, Status badge ("Complete") + row ellipsis [⋯]

Variations map to controls:
- `showAvatar: boolean` (Table 8 adds avatar circles)
- `showStatusBadge: boolean` (Table 10 adds status badges)
- `rowAction: 'view' | 'menu' | 'none'` (View link vs ellipsis vs none)

#### Archetype B: **Filtered Table** (Table 4–6)
```
┌──────────────────────────────────────────────┐
│  Table Title              [+ Add]  [⋯]      │
│  Description text...                         │
├──────────────────────────────────────────────┤
│  🔍 Search...    🔧 Filters                  │
│  [Tag: Active ✕] [Tag: Team A ✕]            │
│  Showing 1-50 of 500                         │
├──────────────────────────────────────────────┤
│  Name ▾    │ Company  │ Number │ Team │ Date │
├────────────┼──────────┼────────┼──────┼──────┤
│  John Doe  │ Acme Inc │ 12345  │ Dev  │ Jan  │
│  ...                                        │
├──────────────────────────────────────────────┤
│  < 1 2 3 4 5 >                              │
└──────────────────────────────────────────────┘
```
- **Table 4** (4174:131540): Search bar + filter icon + tag chips + result count above column headers
- **Table 5** (4174:131787): **Grouped rows** — rows organized under "Group name" category sub-headers
- **Table 6**: Additional filter variation

Grouped rows map to control: `showGroups: boolean`

#### Archetype C: **Expandable Table** (Table 7)
```
┌──────────────────────────────────────────────┐
│  Name      │ Company  │ Number │ Team │ Date │
├────────────┼──────────┼────────┼──────┼──────┤
│ ▸ John Doe │ Acme Inc │ 12345  │ Dev  │ Jan  │
│ ▾ Jane Smi │ Beta Co  │ 67890  │ Ops  │ Feb  │
│ ┌─────────────────────────────────────────┐  │
│ │ Date joined    Job title     Level      │  │
│ │ Jan 2023       Designer      Senior     │  │
│ │                                         │  │
│ │ Address        Phone         Email      │  │
│ │ 123 Main St    555-0123      j@co.com   │  │
│ │                                         │  │  ← Expanded detail panel
│ │ Skills         Languages    Experience  │  │
│ │ Figma, CSS     EN, FR       8 years     │  │
│ │                         ┌──────────┐    │  │
│ │                         │  Image   │    │  │
│ │                         └──────────┘    │  │
│ └─────────────────────────────────────────┘  │
│ ▸ Bob Wil  │ Corp Ltd │ 11223  │ PM   │ Mar  │
└──────────────────────────────────────────────┘
```
- **Table 7** (4174:132251): Rows with chevron ▸/▾ that expand to show detail panel
- Detail panel: 3-column metadata grid (Date joined, Job title, Level, Address, Phone, Email, Skills, Languages, Experience) + image
- Only one row expanded at a time

### Table Family Action Plan

| Family | Variants Covered | Controls |
|--------|-----------------|----------|
| `table-standard` | Table 1–3, 8–10 (6 variants) | `columns: 4 \| 5 \| 6`, `rows: 5 \| 8 \| 10`, `showCheckbox: boolean`, `showPagination: boolean`, `showAvatar: boolean`, `rowAction: view \| menu \| none` |
| `table-filtered` | Table 4–6 (3 variants) | `showSearch: boolean`, `showFilters: boolean`, `showCount: boolean`, `showGroups: boolean`, `filterStyle: chips \| dropdown` |
| `table-expandable` | Table 7 (1 variant) | `detailColumns: 2 \| 3`, `showImage: boolean` |

**Result**: 3 families × ~8 control combos each = ~24 visual variants (covers all 10 Relume table variants)

---

## 10. Stacked Lists → `app-list` Category

### Relume Inventory
- **10 variants**: List 1 through List 10
- **Page node**: `4174:133785`

### Structural Archetypes Identified

#### Archetype A: **User/Person List** (List 1–3, 6–8)
```
┌──────────────────────────────────────────────┐
│  Team Members              [+ Invite]  [⋯]  │
│                                              │
│  🔍 Search...         [Department ▾]         │
├──────────────────────────────────────────────┤
│  👤 John Doe                                 │
│     john@acme.com          UX Designer  [⋯]  │
├──────────────────────────────────────────────┤
│  👤 Jane Smith                               │
│     jane@acme.com          Engineer     [⋯]  │
├──────────────────────────────────────────────┤
│  👤 Bob Wilson                               │
│     bob@acme.com           PM           [⋯]  │
└──────────────────────────────────────────────┘
```
- **List 1** (4174:133836): Section header + search + dropdown filter
- Each row: avatar + name + email (left), job title + ellipsis menu (right)
- Rows separated by dividers

#### Archetype B: **Progress/Task List** (List 4–5, 9–10)
```
┌──────────────────────────────────────────────┐
│  Active Projects              [+ New]  [⋯]  │
├──────────────────────────────────────────────┤
│  Website Redesign                            │
│  ████████████░░░░░░░░░░░░░░░░░  45%     [⋯]  │
├──────────────────────────────────────────────┤
│  Mobile App v2                               │
│  ██████████████████░░░░░░░░░░░  72%     [⋯]  │
├──────────────────────────────────────────────┤
│  API Migration                               │
│  ██████████████████████████░░░  89%     [⋯]  │
└──────────────────────────────────────────────┘
```
- **List 4** (4174:134145): Section header + button + ellipsis
- Each row: project name + progress bar + percentage + ellipsis menu
- No avatar, no search

### Family: `list-stacked`

```typescript
controlsDef: {
  style: { type: 'toggle-group', options: ['user', 'progress'], default: 'user' },
  showSearch: { type: 'switch', default: true },     // user style
  showFilter: { type: 'switch', default: false },    // user style
  showAvatar: { type: 'switch', default: true },     // user style
  itemCount: { type: 'toggle-group', options: ['5', '8', '10'], default: '5' },
}
```

**Result**: 1 family × ~12 control combos = ~12 visual variants (covers all 10 stacked list variants)

---

## 11. Grid Lists → `app-list` Category

### Relume Inventory
- **10 variants**: Grid List 1 through Grid List 10
- **Page node**: `4174:135105`

### Structural Archetypes Identified

#### Archetype A: **People/Profile Grid** (Grid 1–3, 6–8)
```
┌──────────────────────────────────────────────┐
│  Team Members              [+ Invite]  [⋯]  │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │    👤    │  │    👤    │  │    👤    │   │
│  │ John Doe │  │ Jane Smi │  │ Bob Wil  │   │
│  │ Designer │  │ Engineer │  │ PM       │   │
│  │ Lorem... │  │ Lorem... │  │ Lorem... │   │
│  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │    👤    │  │    👤    │  │    👤    │   │
│  │ Alice J  │  │ Eve Bro  │  │ Charlie  │   │
│  │ QA Lead  │  │ DevOps   │  │ Support  │   │
│  │ Lorem... │  │ Lorem... │  │ Lorem... │   │
│  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────────────────────────┘
```
- **Grid 1** (4174:135115): 3×2 card grid, centered content
- Each card: large avatar circle (centered) + name + job title + description text
- Section header with button + menu

#### Archetype B: **Project/Item Grid** (Grid 4–5, 9–10)
```
┌──────────────────────────────────────────────┐
│  Projects                     [+ New]  [⋯]  │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 📦       │  │ 📊       │  │ 🎨       │   │
│  │ Project A│  │ Project B│  │ Project C│   │
│  │ Jan 2024 │  │ Feb 2024 │  │ Mar 2024 │   │
│  │ [Design] │  │ [Dev   ] │  │ [Res   ] │   │
│  │ Lorem... │  │ Lorem... │  │ Lorem... │   │
│  │      [⋯] │  │      [⋯] │  │      [⋯] │   │
│  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 📱       │  │ 🔧       │  │ 📝       │   │
│  │ Project D│  │ Project E│  │ Project F│   │
│  │ ...      │  │ ...      │  │ ...      │   │
│  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────────────────────────┘
```
- **Grid 4** (4174:135544): 3×2 card grid, left-aligned content
- Each card: icon + project name + date + category tag badge + description + ellipsis menu
- Content is left-aligned (vs centered in people grid)

### Family: `list-grid`

```typescript
controlsDef: {
  style: { type: 'toggle-group', options: ['people', 'project'], default: 'people' },
  columns: { type: 'toggle-group', options: ['2', '3', '4'], default: '3' },
  showDescription: { type: 'switch', default: true },
  showTag: { type: 'switch', default: false },     // project style
  itemCount: { type: 'toggle-group', options: ['3', '6', '9'], default: '6' },
}
```

**Result**: 1 family × ~12 control combos = ~12 visual variants (covers all 10 grid list variants)

---

## 12. Stat Cards → `dashboard` Category

### Relume Inventory
- **8 variants**: Stat Card 1 through Stat Card 8
- **Page node**: `4174:138040`

### Structural Archetypes Identified

#### Archetype A: **3-Column Stats** (Stat 1–4)
```
┌──────────────────────────────────────────────┐
│  Overview                        [⋯]        │
│                                              │
│  ┌────────────┐ ┌────────────┐ ┌───────────┐│
│  │ 📈    [⋯]  │ │ 👥    [⋯]  │ │ 💰   [⋯] ││
│  │ Revenue    │ │ Users      │ │ Sales     ││
│  │ $45,231    │ │ 2,300      │ │ 12,234    ││
│  │ ↑ 20.1%   │ │ ↓ 4.1%    │ │ ↑ 100%    ││
│  │            │ │            │ │           ││
│  │ View report│ │ View report│ │ View rep  ││  ← Optional CTA
│  └────────────┘ └────────────┘ └───────────┘│
└──────────────────────────────────────────────┘
```
- **Stat 1** (4174:138042): 3 cards — icon + ellipsis + label + large number + trend badge (↑/↓ percentage)
- **Stat 4** (4174:138267): Same + "View report" link at bottom of each card

#### Archetype B: **4-Column Stats** (Stat 5–8)
```
┌───────────────────────────────────────────────────────┐
│  Overview                                    [⋯]     │
│                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ 📈  [⋯]  │ │ 👥  [⋯]  │ │ 💰  [⋯]  │ │ 📊  [⋯] ││
│  │ Revenue  │ │ Users    │ │ Sales    │ │ Growth   ││
│  │ $45,231  │ │ 2,300   │ │ 12,234  │ │ 8.5%     ││
│  │ ↑ 20.1%  │ │ ↓ 4.1%  │ │ ↑ 100%  │ │ ↑ 12%    ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘│
└───────────────────────────────────────────────────────┘
```
- **Stat 5** (4174:138358): 4 cards — same pattern but 4 across
- **Stat 8** (4174:138651): 4 cards + "View report" CTA link

### Family: `stat-cards`

```typescript
controlsDef: {
  columns: { type: 'toggle-group', options: ['3', '4'], default: '3' },
  showIcon: { type: 'switch', default: true },
  showTrend: { type: 'switch', default: true },
  showCTA: { type: 'switch', default: false },
  showMenu: { type: 'switch', default: true },
}
```

**Result**: 1 family × 8 control combos = ~8 visual variants (covers all 8 Relume stat card variants)

---

## 13. Forms → `app-form` Category

### Relume Inventory
- **20 variants**: Form 1 through Form 20
- **Page node**: `4174:139087`

### Structural Archetypes Identified

#### Archetype A: **Account/Profile Form** (Form 1–5)
```
┌──────────────────────────────────────────────┐
│  Account                          [Save]     │
│                                              │
│  ┌──────┐  Upload photo                      │
│  │  👤  │  [Choose file]                     │
│  └──────┘                                    │
│                                              │
│  Username          Website                   │
│  ┌────────────┐    ┌────────────┐            │
│  │ johndoe    │    │ example.com│            │
│  └────────────┘    └────────────┘            │
│                                              │
│  Email                                       │
│  ┌────────────────────────────┐  ℹ️  ❓       │
│  │ john@example.com          │              │
│  └────────────────────────────┘              │
│  This is a hint text to help user            │
│                                              │
│  About                                       │
│  ┌────────────────────────────┐              │
│  │ Write a short bio...      │  128/240     │
│  │                            │              │
│  └────────────────────────────┘              │
│                                              │
│  ──── Password ────                          │
│  Old password      New password              │
│  ┌────────────┐    ┌────────────┐  ❓        │
│  │ ••••••••   │    │ ••••••••   │            │
│  └────────────┘    └────────────┘            │
│                                              │
│  Language                                    │
│  ┌────────────────────────── ▾┐              │
│  │ English                    │              │
│  └────────────────────────────┘              │
│                                    [Save]    │
└──────────────────────────────────────────────┘
```
- **Form 1** (4174:140349): Title "Account" + avatar upload
- Fields: username, website (side-by-side), email with icon + help tooltip, about textarea (with char count), password fields (old + new + help), language dropdown
- Save button at bottom

#### Archetype B: **Personal Info / Address Form** (Form 6–8)
```
┌──────────────────────────────────────────────┐
│  Personal information             [Save]     │
│                                              │
│  First name            Last name             │
│  ┌────────────┐        ┌────────────┐        │
│  │ John       │        │ Doe        │        │
│  └────────────┘        └────────────┘        │
│                                              │
│  Email                                       │
│  ┌────────────────────────────┐  ℹ️  ❓       │
│  │ john@example.com          │              │
│  └────────────────────────────┘              │
│                                              │
│  Country                                     │
│  ┌────────────────────────── ▾┐              │
│  │ United States              │              │
│  └────────────────────────────┘              │
│                                              │
│  Street address                              │
│  ┌────────────────────────────┐              │
│  │ 123 Main Street           │              │
│  └────────────────────────────┘              │
│                                              │
│  City            State/Province    ZIP       │
│  ┌──────────┐   ┌──────────┐   ┌─────────┐  │
│  │ New York │   │ NY       │   │ 10001   │  │
│  └──────────┘   └──────────┘   └─────────┘  │
│                                              │
│                                    [Save]    │
└──────────────────────────────────────────────┘
```
- **Form 6** (4174:139111): Title "Personal information" + Save top-right
- Side-by-side field pairs: first+last name, city+state+ZIP
- Country dropdown, email with icon + help

#### Archetype C: **Payment + Plan Form** (Form 9–12)
```
┌──────────────────────────────────────────────┐
│  Payment method                              │
│                                              │
│  Card number                                 │
│  ┌────────────────────────────┐              │
│  │ 4242 4242 4242 4242       │              │
│  └────────────────────────────┘              │
│                                              │
│  Expiry              CVV                     │
│  ┌────────────┐      ┌────────────┐          │
│  │ 12/28      │      │ 123        │          │
│  └────────────┘      └────────────┘          │
│                                              │
│  Email / Country / Street / City+State+ZIP   │
│  (same as address form)                      │
│                                              │
│  ──── Choose your plan ────                  │
│                                              │
│  ◉ Basic Plan   — $9/month                   │
│    Feature list...                           │
│  ○ Pro Plan     — $29/month                  │
│    Feature list...                           │
│  ○ Enterprise   — Custom                     │
│    Feature list...                           │
│                                              │
│                           [Continue ──────]  │
└──────────────────────────────────────────────┘
```
- **Form 9** (4174:139387): Payment fields + plan selection with radio buttons
- Card number, expiry+CVV side-by-side, billing address
- "Choose your plan" sub-section with radio options showing price + features

#### Archetype D: **Notifications / Preferences Form** (Form 13–20)
```
┌──────────────────────────────────────────────┐
│  Notifications                               │
│                                              │
│  ──── Email Notifications ────               │
│                                              │
│  Marketing emails                  [═══●]    │
│  Product updates                   [●═══]    │
│  Security alerts                   [═══●]    │
│                                              │
│  ──── Push Notifications ────                │
│                                              │
│  ☑ New messages                              │
│  ☐ Project updates                           │
│  ☑ Mentions                                  │
│  ☐ Weekly digest                             │
│                                              │
│  ──── Frequency ────                         │
│                                              │
│  ◉ Real-time                                 │
│  ○ Daily digest                              │
│  ○ Weekly digest                             │
│                                              │
│                                    [Save]    │
└──────────────────────────────────────────────┘
```
- **Form 13** (4174:139785): Title "Notifications"
- Multiple grouped sub-sections
- Toggle switches for notification channels
- Checkboxes for email categories
- Radio buttons for frequency preferences
- Section dividers between groups

### Form Family Action Plan

| Family | Variants Covered | Controls |
|--------|-----------------|----------|
| `form-profile` | Form 1–5 (5 variants) | `showAvatar: boolean`, `showPasswordSection: boolean`, `layout: stacked \| two-column` |
| `form-address` | Form 6–8 (3 variants) | `fieldLayout: stacked \| side-by-side`, `showCountryDropdown: boolean` |
| `form-payment` | Form 9–12 (4 variants) | `showPlanSelector: boolean`, `planStyle: radio \| card`, `showBillingAddress: boolean` |
| `form-preferences` | Form 13–20 (8 variants) | `inputType: toggles \| checkboxes \| radios \| mixed`, `groupCount: 2 \| 3 \| 4`, `showDividers: boolean` |

**Result**: 4 families × ~5 control combos each = ~20 visual variants (covers all 20 Relume form variants)

---

## 14. Description Lists → `app-form` Category

### Relume Inventory
- **4 variants**: Description List 1 through Description List 4
- **Page node**: `4174:142227`

### Structural Archetypes Identified

#### Archetype A: **Two-Column Grid (Read-Only)** (DL 1–2)
```
┌──────────────────────────────────────────────┐
│  Account                                     │
│                                              │
│  Full name           Website                 │
│  John Doe            example.com             │
│                                              │
│  About                                       │
│  Lorem ipsum dolor sit amet, consectetur     │
│  adipiscing elit. Sed do eiusmod tempor      │
│  incididunt ut labore et dolore magna aliqua.│
│                                              │
│  Email               Password               │
│  john@example.com    ••••••••                │
│                                              │
│  Language                                    │
│  English                                     │
└──────────────────────────────────────────────┘
```
- **DL 1** (4174:142229): Title "Account" + label-value pairs in 2-column grid
- Some fields span full width (About paragraph)
- No edit actions — read-only display

#### Archetype B: **Three-Column with Edit Actions** (DL 3–4)
```
┌──────────────────────────────────────────────┐
│  Account                                     │
│                                              │
│  Full name       │ John Doe        │ Change  │
│  ───────────────────────────────────────────  │
│  Email           │ john@example.com│ Change  │
│  ───────────────────────────────────────────  │
│  Password        │ ••••••••       │ Change  │
│  ───────────────────────────────────────────  │
│  Language        │ English         │ Change  │
│  ───────────────────────────────────────────  │
│  About           │ Lorem ipsum... │ Change  │
└──────────────────────────────────────────────┘
```
- **DL 3** (4174:142331): Title "Account" + rows with label | value | "Change" link
- Rows separated by horizontal dividers
- Three-column layout: label (left) | value (middle) | action (right)

### Family: `description-list`

```typescript
controlsDef: {
  layout: { type: 'toggle-group', options: ['grid', 'rows'], default: 'grid' },
  showEditAction: { type: 'switch', default: false },
  showDividers: { type: 'switch', default: true },    // rows layout
  columns: { type: 'toggle-group', options: ['1', '2'], default: '2' },  // grid layout
}
```

**Result**: 1 family × 4 control combos = ~4 visual variants (covers all 4 Relume description list variants)

---

## 15. Categories Not in Figma Kit (Custom Additions)

The following categories from the expansion plan are NOT present in the Relume SaaS Figma kit and will be designed from scratch (referencing common SaaS patterns):

### Charts (`chart` category)
- `chart-bar` — Bar chart wireframe with axis labels
- `chart-line` — Line chart wireframe with data points
- `chart-pie` — Pie/donut chart wireframe
- `chart-area` — Stacked area chart wireframe

**Rationale**: Charts are essential for dashboards but Relume's kit focuses on UI chrome, not data visualization.

### Empty States (`empty-state` category)
- `empty-state-default` — Centered illustration + heading + description + CTA
- `empty-state-onboarding` — Step-by-step checklist

**Rationale**: Zero-data states guide users to take first action.

---

## 16. Relume → Scytle Pattern Translation Guide

### How SaaS Variants Map to Parametric Controls

```
Relume (flat)                       Scytle (parametric)
─────────────                       ──────────────────
Table 1 (text-only, 5 cols)    ─┐
Table 2 (text-only, 4 cols)     ├──→  table-standard { columns: 4|5, showAvatar: false }
Table 3 (text-only, 6 cols)    ─┘

Table 8 (avatar rows)          ──→  table-standard { showAvatar: true, rowAction: 'menu' }
Table 10 (transaction rows)    ──→  table-standard { showStatusBadge: true, rowAction: 'menu' }

Table 4 (search + chips)      ─┐
Table 6 (search + dropdown)    ├──→  table-filtered { showGroups: false, filterStyle: ... }
Table 5 (grouped rows)        ─┘    table-filtered { showGroups: true }

Stat 1 (3-col basic)          ─┐
Stat 4 (3-col + CTA)           ├──→  stat-cards { columns: '3', showCTA: false|true }
Stat 5 (4-col basic)          ─┐
Stat 8 (4-col + CTA)           ├──→  stat-cards { columns: '4', showCTA: false|true }

Signup 1 (centered)            ──→  auth-signup { layout: 'centered' }
Signup 4 (card)                ──→  auth-signup { layout: 'card' }
Signup 5 (split + testimonial) ──→  auth-signup { layout: 'split-testimonial' }
Signup 7 (split + image)       ──→  auth-signup { layout: 'split-image' }
Signup 9 (tabbed)              ──→  auth-signup { layout: 'tabbed' }

Sidebar 1 (L3 expanded)       ──→  app-sidebar { level: '3', collapsed: false }
Sidebar 3 (L3 collapsed)      ──→  app-sidebar { level: '3', collapsed: true }
Sidebar 4 (L2 expanded)       ──→  app-sidebar { level: '2', collapsed: false }
Sidebar 6 (L2 collapsed)      ──→  app-sidebar { level: '2', collapsed: true }
Sidebar 7 (L1 expanded)       ──→  app-sidebar { level: '1', collapsed: false }
Sidebar 9 (L1 collapsed)      ──→  app-sidebar { level: '1', collapsed: true }
```

### Shared Chrome Patterns

These patterns appear across multiple families and should be implemented as reusable sub-components:

| Pattern | Used In | Implementation |
|---------|---------|---------------|
| Section Header | Tables, Lists, Stat Cards | `<SectionHeader title={...} showAction showMenu />` |
| Card Header | Stat Cards, Form Groups | `<CardHeader title={...} showMenu />` |
| Pagination | Tables, Lists | `<Pagination pages={5} current={1} />` |
| Search + Filter Bar | Tables, Stacked Lists | `<FilterBar showSearch showFilter filterStyle={...} />` |
| Avatar + Name | User Lists, Tables | `<UserRow avatar name email />` |
| Progress Bar | Progress Lists, Onboarding | `<ProgressBar value={45} />` |
| Trend Badge | Stat Cards | `<TrendBadge direction="up" value="20.1%" />` |

---

## 17. Summary: Final Category & Family Mapping

### Figma-Derived Categories (5 new categories)

| Category | Families | Presets (target) | Context | Figma Pages |
|----------|----------|-----------------|---------|-------------|
| `auth` | 4 (login, signup, modal, onboarding) | ~16 | auth | Sign Up & Login, Modals, Onboarding |
| `data-table` | 3 (standard, filtered, expandable) | ~10 | application | Tables |
| `app-list` | 2 (stacked, grid) | ~8 | application | Stacked Lists, Grid Lists |
| `dashboard` | 2 (stat-cards, page-header) | ~8 | application | Stat Cards, Page Headers |
| `app-form` | 5 (profile, address, payment, preferences, description-list) | ~14 | application | Forms, Description Lists |
| **Subtotal** | **16** | **~56** | | |

### Custom Categories (no Figma reference)

| Category | Families | Presets (target) | Context |
|----------|----------|-----------------|---------|
| `chart` | 4 (bar, line, pie, area) | ~10 | application |
| `empty-state` | 2 (default, onboarding) | ~4 | application |
| **Subtotal** | **6** | **~14** | |

### Page-Level Components (not categories)

| Component | Configs | Figma Pages |
|-----------|---------|-------------|
| `app-sidebar` | 6 (3 levels × collapsed) | Sidebars |
| `app-topbar` | 3 (3 levels) | Topbars |
| **Subtotal** | **9 configs** | |

### Grand Total

| | Families | Presets | Variants (via controls) |
|---|---------|--------|------------------------|
| Existing marketing | 55 | 107 | ~500+ |
| New SaaS (Figma-derived) | 16 | ~56 | ~124 |
| New SaaS (custom) | 6 | ~14 | ~30 |
| **Total** | **77** | **~177** | **~654+** |

### Parametric Advantage
- Relume SaaS kit: 141 hand-built components
- Scytle: 22 parametric families → ~154 visual appearances
- Maintenance ratio: **~6.4:1** (Relume needs ~6× more components for equivalent coverage)

---

## 18. Figma Node ID Reference

Quick lookup for all analyzed pages and key variants:

| Page | Node ID | Key Variant Nodes |
|------|---------|------------------|
| Application Shells | 4174:116704 | Shell 1: 4174:117187, Shell 9: 4174:117501, Shell 15: 4174:117645 |
| Sidebars | 4174:121341 | L3: 4174:121343/121647, L2: 4174:121799/122103, L1: 4174:122255/122487 |
| Topbars | 4174:122640 | L3: 4174:122642, L2: 4174:122714, L1: 4174:122758 |
| Page Headers | 4174:122818 | Standard: 4174:122824, Profile: 4174:122940 |
| Section Headers | 4174:123110 | 4174:123112 |
| Card Headers | 4174:123252 | 4174:123255 |
| Sign Up & Login | 1919:420 | Signup 1: 4174:123314, Signup 5: 4174:123518, Login 1: 4174:123891 |
| Modals | 1919:1146 | Modal 1: 4174:124770 |
| Onboarding | 4174:125085 | Onboard 1: 4174:125087, Onboard 7: 4174:126569 |
| Tables | 2322:52 | Table 1: 4174:130871, Table 4: 4174:131540, Table 7: 4174:132251 |
| Stacked Lists | 4174:133785 | List 1: 4174:133836, List 4: 4174:134145 |
| Grid Lists | 4174:135105 | Grid 1: 4174:135115, Grid 4: 4174:135544 |
| Stat Cards | 4174:138040 | Stat 1: 4174:138042, Stat 5: 4174:138358 |
| Forms | 4174:139087 | Form 1: 4174:140349, Form 6: 4174:139111, Form 9: 4174:139387, Form 13: 4174:139785 |
| Description Lists | 4174:142227 | DL 1: 4174:142229, DL 3: 4174:142331 |
