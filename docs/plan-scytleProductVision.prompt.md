# Scytle Product Vision & Execution Plan

## Problem Statement

Current AI coding tools (Bolt, v0, Lovable, Cursor) share the same fundamental flaw: **they skip design and jump straight to code.** The result:

1. **Cookie-cutter outputs** — Every generated site looks the same because there's no design vocabulary, no style system, no layout library. Users get generic skeletons they don't know how to improve.
2. **No planning phase** — Non-technical users (and even experienced devs) don't know *what* they need. They type a prompt, get 50 files, then feel lost. There's no structured flow from idea → information architecture → layout → visual identity → code.
3. **Post-generation confusion** — After generation, users are told "describe what to change" or "upload a screenshot." But they don't have the design language to articulate what's wrong. The edit loop is painful: paste a screenshot → wait → hope the AI understood → repeat.
4. **Design is an afterthought** — These tools treat design as CSS that gets sprinkled on top, not as a structured process that comes *before* code. Real product development goes: Plan → Structure → Wireframe → Style → Design → Build.

### What Exists Today (Competitors)

| Tool | Does Well | Doesn't Do |
|---|---|---|
| **Relume** | 1,000+ wireframe components, AI sitemap → wireframe → style guide → Figma/Webflow/React export. Structured design-first flow. | No code generation, no deployment, no SaaS/app design (marketing sites only), static components |
| **Banani** | AI generates multi-screen interactive prototypes from text/screenshots, click-to-generate next screens, style transfer from references | No code, no deployment, no wireframe library, no sitemap planning, no structured flow |
| **Bolt/v0/Lovable** | Full-stack code generation, database setup, deployment | No design system, no planning, no wireframes, no style guide, identical outputs |
| **Cursor** | Best-in-class code editing AI | Not a product builder — requires knowing what to build first |

### The Gap

Nobody does the full loop: **Idea → Plan → Sitemap → Wireframe → Style Guide → Design → Code → Database → Deploy** — all in one product, with a rich design library as the foundation.

---

## Scytle's Vision: The Full-Stack Design-to-Deploy Studio

**One-liner:** The design-first AI product studio that takes you from idea to deployed product — not by skipping design, but by making design the fastest part.

### Core Thesis

> Design is not a bottleneck to eliminate — it's the layer that makes everything else meaningful. By giving users a massive design vocabulary (1,000+ components), structured planning, and AI that operates within that vocabulary, we make the *design step* take minutes instead of days, and the *code step* takes care of itself.

### What Makes Scytle Different

1. **Design-first, not code-first** — Users build with visual components before a single line of code is generated
2. **Structured flow, not blank prompt** — Guided Idea → Sitemap → Wireframe → Style Guide → Design → Code pipeline
3. **Parametric design system, not copy-paste** — One component family produces 10+ variants via controls (text alignment, layout direction, button count) — more flexible than Relume's 1-per-variant model
4. **Not just marketing sites** — Full SaaS dashboards, app UIs, multi-page products with authentication, database, and deployment
5. **Reference-driven design** — Upload screenshots or paste live URLs and the AI extracts the design system, creating custom families on the fly (Banani-style, but integrated into the component system)
6. **Code is the output, not the experience** — Users never need to think about code until they're ready. When they are, it's production-ready Next.js, not throwaway prototypes

---

## Current State (What's Built)

### ✅ Done
- **Foundation**: Next.js 16, React 19, TypeScript strict, Tailwind CSS 4, Appwrite auth/DB, Zustand stores
- **Sitemap**: AI generates sitemap from prompt, ReactFlow node editor, page/section structure with undo/redo
- **Wireframe viewer**: Canvas renders sections from the unified store, section reordering with dnd-kit
- **Design library**: 15 categories, 45 parametric families, 71 presets — parametric controls system (toggle-group, switch, slider, select, color, number). Categories: hero, cta, navbar, footer, features, testimonials, pricing, faq, contact, content, gallery, team, blog, stats, logos
- **Chat**: AI-powered chat sidebar with streaming responses, project-scoped conversations
- **AI client**: Vertex AI Gemini with model fallback chain and SSE streaming

### ❌ Not Built Yet
- Style Guide system (colors, typography, spacing, radius, UI element styles)
- Design view (styled wireframes with style guide applied)
- Code generation pipeline
- Database schema design
- Deployment system
- Missing component categories (banner, portfolio, signup/login, 404, product, comparison, newsletter, timeline, event, career, application shells, dashboard layouts)
- Reference/screenshot-based design extraction
- Custom design family creation from references
- SaaS/app component categories (dashboard, forms, tables, modals, settings)

---

## Execution Plan

### Layer Model (Think of Scytle as Layers, Not Phases)

```
Layer 7: Deploy          ← Live URL, hosting, CI/CD
Layer 6: Code            ← Production Next.js/React output
Layer 5: Database        ← Schema design, Appwrite collections, API routes
Layer 4: Design          ← Styled wireframes (style guide applied to wireframes)
Layer 3: Style Guide     ← Colors, typography, spacing, radius, UI tokens
Layer 2: Wireframe       ← Layout structure with real copy (using design library)
Layer 1: Sitemap         ← Page structure, information architecture
Layer 0: Brief           ← User's idea, clarifying questions, project scope
```

Each layer feeds into the next. Users can enter at any layer, skip layers, or go back. The AI operates within the constraints set by higher layers (e.g., wireframe respects sitemap, design respects style guide).

---

### Sprint 1: Design Library Expansion (2-3 weeks)
**Goal:** Go from 71 presets to 300+ presets across 25+ categories. This is the foundation everything else depends on.

#### 1A. Add Missing Marketing Categories
Each new category = 1 directory with families/, presets.tsx, index.ts, registered in registry.ts.

| Category | Families to Build | Controls | Est. Presets |
|---|---|---|---|
| `banner` | banner-bar, banner-floating | position, dismissible, icon | 8 |
| `portfolio` | portfolio-grid, portfolio-masonry, portfolio-case-study | columns, hover-style, filter-bar | 12 |
| `signup` | auth-centered, auth-split, auth-social | form-fields, social-providers, layout-direction | 10 |
| `error` | error-simple, error-illustrated | show-search, show-nav | 6 |
| `career` | career-listing, career-culture | card-style, show-filters | 8 |
| `event` | event-list, event-card-grid, event-schedule | columns, show-dates, show-location | 10 |
| `newsletter` | newsletter-inline, newsletter-modal, newsletter-banner | input-style, show-benefits | 8 |
| `comparison` | comparison-table, comparison-cards | column-count, highlight-recommended | 6 |
| `timeline` | timeline-vertical, timeline-horizontal | show-icons, alternate-sides | 6 |
| `product` | product-hero, product-features, product-gallery | image-count, show-price, show-reviews | 10 |

**Subtotal: +84 presets across 10 new categories**

#### 1B. Deepen Existing Categories
Add 2-3 new families per existing high-value category:

| Category | New Families | What They Cover |
|---|---|---|
| `hero` | hero-video-bg, hero-carousel, hero-animated | Relume Header 20-76 patterns |
| `features` | features-tabs, features-accordion, features-bento | Interactive feature sections |
| `content` | content-timeline, content-steps, content-split-scroll | Process flows, step-by-step |
| `pricing` | pricing-toggle (monthly/annual switch) | SaaS pricing standard |
| `testimonials` | testimonials-carousel, testimonials-video | Rich social proof |
| `gallery` | gallery-lightbox, gallery-masonry | Image-heavy layouts |

**Subtotal: +60 presets from deepened existing categories**

#### 1C. Add SaaS/App Component Categories (Scytle's Differentiator)
This is what Relume doesn't do — full application UI components:

| Category | Families | Controls | Est. Presets |
|---|---|---|---|
| `dashboard` | dashboard-overview, dashboard-analytics, dashboard-kanban | sidebar-style, card-count, chart-type | 12 |
| `sidebar` | sidebar-nav, sidebar-collapsible, sidebar-with-header | collapsed, show-icons, show-labels | 8 |
| `table` | table-basic, table-sortable, table-with-filters | pagination, row-select, column-count | 10 |
| `form` | form-simple, form-multi-step, form-with-sidebar | field-count, validation-style, submit-position | 10 |
| `modal` | modal-confirmation, modal-form, modal-multi-step | size, show-footer, close-style | 8 |
| `settings` | settings-profile, settings-billing, settings-team | tab-style, form-layout | 8 |
| `empty-state` | empty-state-simple, empty-state-illustrated, empty-state-with-action | show-illustration, action-count | 6 |
| `notification` | notification-toast, notification-panel, notification-inline | position, auto-dismiss, show-icon | 6 |
| `onboarding` | onboarding-stepper, onboarding-cards, onboarding-checklist | step-count, show-progress, skip-option | 8 |

**Subtotal: +76 presets for SaaS/app components**

**Sprint 1 Total: ~220 new presets → 291 total (from current 71)**

#### 1D. Unlock Unused Control Types
Current families only use `toggle-group` and `switch`. The type system supports 4 more:
- `slider` → spacing, column count, item count
- `select` → card style variants, animation types
- `color` → background theme (light/dark/colored)
- `number` → explicit numeric inputs

Retrofit 2-3 controls to existing families to multiply their variants without new code.

---

### Sprint 2: Style Guide System (2-3 weeks)
**Goal:** Build the Relume-style style guide layer — colors, typography, spacing, and UI tokens that transform wireframes into designs.

#### 2A. Style Guide Data Model
```typescript
// New Zod schema in src/types/index.ts
export const StyleGuideSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  
  // Colors
  colors: z.object({
    primary: z.string(),      // oklch value
    secondary: z.string(),
    accent: z.string(),
    background: z.string(),
    foreground: z.string(),
    muted: z.string(),
    mutedForeground: z.string(),
    border: z.string(),
    // Auto-generated shades (50-950)
    shades: z.record(z.string(), z.array(z.string())),
  }),
  
  // Typography
  typography: z.object({
    headingFont: z.string(),    // Google Font name
    bodyFont: z.string(),
    monoFont: z.string(),
    scale: z.enum(['compact', 'default', 'spacious']),
    headingWeight: z.enum(['400', '500', '600', '700', '800', '900']),
  }),
  
  // Spacing & Layout
  spacing: z.object({
    unit: z.number(),           // base unit in px (4, 8, etc.)
    sectionPadding: z.enum(['tight', 'default', 'loose']),
    containerWidth: z.enum(['narrow', 'default', 'wide', 'full']),
  }),
  
  // UI Elements
  ui: z.object({
    borderRadius: z.enum(['none', 'sm', 'md', 'lg', 'full']),
    buttonStyle: z.enum(['solid', 'outline', 'ghost', 'gradient']),
    cardStyle: z.enum(['flat', 'bordered', 'elevated', 'glass']),
    inputStyle: z.enum(['underline', 'bordered', 'filled']),
    shadowIntensity: z.enum(['none', 'subtle', 'medium', 'dramatic']),
  }),
})
```

#### 2B. Style Guide UI
- **Canvas view**: New "Style Guide" tab in the top bar switcher
- **Left panel**: Color picker, font selector (Google Fonts API), spacing controls, UI element previews
- **Right canvas**: Live preview showing a sample homepage with current style guide applied
- **AI generation**: "Generate style guide from brand description" → AI picks colors, fonts, spacing that match
- **Reference extraction**: Upload a screenshot or paste a URL → AI extracts the color palette, fonts, border radius, spacing system

#### 2C. Style Guide → Wireframe Application
The critical bridge: style guide tokens must flow into wireframe rendering.

```
Wireframe (gray, no styles) + Style Guide → Styled Preview
```

- Wire each design family's Canvas component to accept a `styleGuide` prop
- Map style guide tokens to Tailwind utilities at render time
- Toggle between "wireframe mode" (gray, structural) and "design mode" (styled)

---

### Sprint 3: Design View & AI Copy Generation (2-3 weeks)
**Goal:** The "Design" tab that shows fully styled wireframes with generated copy, images, and brand treatment.

#### 3A. Design Rendering Engine
- Apply style guide to all wireframe sections
- Replace placeholder images with AI-generated or stock images
- Apply responsive behavior across breakpoints
- Add micro-interactions and hover states

#### 3B. AI Copy Generation (Relume-level)
- Section-aware copy generation: AI writes copy that fits each section type (hero headline vs. testimonial quote vs. FAQ answer)
- Tone control: professional, playful, technical, minimal
- Length matching: copy fits the component's visual space
- Regenerate per-section or per-page

#### 3C. Design Refinement
- Click any section → sidebar shows design controls + content editing
- "Shuffle" button per section — swaps to a different preset within same category
- "Regenerate copy" per section
- Full-page regenerate option

---

### Sprint 4: Reference-Based Design (Banani-Style) (2-3 weeks)
**Goal:** Users can feed screenshots, live URLs, or design references and the AI extracts/applies visual language.

#### 4A. Screenshot/URL → Style Guide Extraction
- Upload image or paste URL
- AI extracts: color palette, font families (via what-font-is or visual matching), border radius, spacing patterns, shadow styles, button styles
- Outputs a StyleGuide object that can be applied to current wireframes
- Show side-by-side: "Reference" vs "Your design with extracted style"

#### 4B. Screenshot → Custom Design Family
- When no existing family matches a section in a screenshot, AI generates a new custom family:
  - Analyzes the screenshot section layout
  - Generates a React component matching that layout pattern
  - Creates controlsDef for the parametric variants
  - Saves to project-level custom families (not global library)
- This is the "Cursor for designers" angle — click something in a reference image, get a buildable component

#### 4C. Interactive Screen Flow (Banani Feature)
- "Click this button — what screen comes next?"
- AI generates the next logical screen in the flow
- Builds a screen-flow graph (like a user journey sitemap)
- Each generated screen uses components from the design library

---

### Sprint 5: Code Generation Pipeline (3-4 weeks)
**Goal:** Turn the designed project into production-ready Next.js code with real components, routing, and layout.

#### 5A. Code Generation Architecture
```
Design (styled wireframes with content)
  → Page Generator (one .tsx per page)
      → Section-level code (each design family has a code template)
      → Layout wrapper (navbar + footer + page content)
      → Route generation (app/ directory structure)
  → Style System
      → globals.css with CSS variables from style guide
      → tailwind theme extension
      → component tokens
  → Shared Components
      → Button, Card, Badge, etc. from style guide UI tokens
```

#### 5B. Section-to-Code Mapping
Each TemplateFamily gets a `generateCode()` method:
- Takes the Canvas props (content, controls, style guide)
- Outputs clean, production-ready JSX + Tailwind CSS
- No inline styles, no magic numbers — uses the style guide tokens
- Responsive by default (mobile-first)

#### 5C. Code Preview & Edit
- "Code" tab shows generated code with syntax highlighting
- File tree on the left (mirrors Next.js app/ structure)
- Inline editing: change code → see changes in preview
- AI chat can modify code ("make the hero section full-width")

---

### Sprint 6: Database & Backend Generation (2-3 weeks)
**Goal:** For SaaS products, generate the database schema, API routes, and data models.

#### 6A. Schema Designer
- Visual database schema designer (like Prisma Studio or DrawSQL)
- AI generates initial schema from product description and pages
- Users can modify: add tables, fields, relationships
- Supports: users, content, settings, transactions, subscriptions

#### 6B. API Route Generation
- Auto-generate CRUD API routes for each collection
- Authentication middleware setup
- Role-based access control setup
- Zod validation schemas for all endpoints

#### 6C. Data Connection
- Connect generated components to API routes
- Replace static content with dynamic data fetching
- Generate server components where appropriate
- Set up proper loading/error states

---

### Sprint 7: Deployment & Live Preview (2-3 weeks)
**Goal:** One-click deploy to a live URL.

#### 7A. Build Pipeline
- Take the generated Next.js project
- Run type checking and build validation
- Package for deployment

#### 7B. Deployment Targets
- **Vercel** (primary) — one-click deploy with environment variables
- **Scytle Cloud** (future) — managed hosting for Scytle-generated projects
- Custom domain support

#### 7C. Live Preview
- Preview mode: render the project in an iframe within Scytle
- Hot reload: changes in the wireframe/design update the preview
- Share link: send a preview URL to stakeholders

---

## Priority Order (What to Build When)

```
NOW (Sprint 1 — immediate ROI, foundation for everything):
├── Design Library Expansion (categories + families + presets)
└── Unlock unused control types

NEXT (Sprint 2 — this is the "wow" moment):
├── Style Guide system
└── Style Guide → wireframe application

THEN (Sprint 3 — makes the product demo-ready):
├── Design view (styled wireframes)
├── AI copy generation
└── Section shuffle/regenerate

AFTER (Sprint 4 — competitive differentiation):
├── Reference-based design extraction
├── Custom family generation from screenshots
└── Interactive screen flow generation

LATER (Sprint 5-7 — full product vision):
├── Code generation pipeline
├── Database schema design
└── Deployment system
```

---

## Key Architecture Decisions

### 1. Parametric Families > Static Components
We do NOT copy Relume's 1-component-per-variant model. Our `TemplateFamily` + `controlsDef` system is 30× more maintainable:
- Relume: 1,524 separate React components
- Scytle: ~100 families → 1,000+ visual variants via controls

### 2. Style Guide as a Separate Layer
The style guide is NOT baked into components. It's applied at render time:
- Wireframe mode: gray, structural, no brand
- Design mode: style guide tokens applied via CSS variables
- This means one wireframe can look completely different with a different style guide

### 3. AI Operates Within the Design Vocabulary
The AI doesn't "generate arbitrary HTML." It:
- Picks components from the library (family + preset)
- Sets controls to match the user's intent
- Fills content fields with generated copy
- Applies style guide tokens
This constrains AI output to always look professional.

### 4. Everything is a Section
The unified store (`unified-store.ts`) treats everything as pages containing ordered sections. Each section references a family ID, a preset, control values, and content. This model works for:
- Marketing sites (hero → features → pricing → CTA)
- SaaS dashboards (sidebar + header + content-area with widgets)
- Multi-page apps (each page has its own section stack)

### 5. Progressive Enhancement, Not Big Bang
Users can stop at any layer:
- Just want a sitemap? Export it.
- Just want wireframes? Use them in Figma.
- Want styled designs? Apply a style guide.
- Want code? Generate it.
- Want it live? Deploy it.
Each layer adds value independently. No "you must go through all 7 steps" bottleneck.

---

## Success Metrics (How Do We Know It's Working)

| Metric | Target | Why |
|---|---|---|
| Time from prompt to wireframe | < 2 minutes | Relume does this; we must match or beat |
| Design library coverage | 25+ categories, 300+ presets | Competitive with Relume's breadth |
| Style guide application | < 30 seconds to restyle all pages | This is the "magic moment" |
| Reference extraction accuracy | 80%+ color/font match | Must feel reliable, not gimmicky |
| Code generation quality | Passes `npm run build` on first try | Non-negotiable for credibility |
| Deploy success rate | 95%+ first-attempt deploys | Users won't retry if first deploy fails |

---

## Open Questions for Refinement

1. **Scope for v1 launch**: Should v1 be Sprints 1-3 only (Relume-competitive) and defer code/deploy to v2? Or is the code generation the differentiator that must ship in v1?

2. **SaaS components priority**: Build dashboard/table/form families in Sprint 1, or defer to after the marketing site foundation is solid?

3. **Figma export**: Should we support Figma export (like Relume) as an intermediate value prop, or skip it and go straight to code?

4. **Custom family persistence**: Where do user-created design families live — project-level only, or can users share them publicly as a marketplace?

5. **Pricing model positioning**: Free tier = sitemap + limited wireframes? Or free tier = full wireframe + style guide, paid = code generation + deploy?
