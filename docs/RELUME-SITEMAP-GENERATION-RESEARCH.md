# Relume Sitemap & Wireframe Generation — Deep Research

> **Date**: 2026-02-24  
> **Method**: Live Playwright browser automation on relume.io (Cloudify project)  
> **Account**: Free plan (DK user)  
> **Project**: "Cloudify" — cloud-based accounting SaaS  
> **Settings**: 10–15 pages, English, example brief

---

## Table of Contents

1. [Project Setup & Configuration](#1-project-setup--configuration)
2. [Sitemap Generation Pipeline](#2-sitemap-generation-pipeline)
3. [Sitemap View — UI & Interactions](#3-sitemap-view--ui--interactions)
4. [Add Section Flow (Sitemap)](#4-add-section-flow-sitemap)
5. [Wireframe Tab — Automatic Generation](#5-wireframe-tab--automatic-generation)
6. [Wireframe Section Panel & Controls](#6-wireframe-section-panel--controls)
7. [Replace Component — Variant Browser](#7-replace-component--variant-browser)
8. [Filter System — 3 Dimensions](#8-filter-system--3-dimensions)
9. [Style Guide Tab](#9-style-guide-tab)
10. [Design Tab](#10-design-tab)
11. [Complete Category Taxonomy (31 Categories)](#11-complete-category-taxonomy-31-categories)
12. [Complete Elements Taxonomy (43 Elements)](#12-complete-elements-taxonomy-43-elements)
13. [AI Completion Types — Full Pipeline](#13-ai-completion-types--full-pipeline)
14. [API & CDN Architecture](#14-api--cdn-architecture)
15. [Generated Sitemap — Full Page Tree](#15-generated-sitemap--full-page-tree)
16. [Key Insights for Scytle](#16-key-insights-for-scytle)

---

## 1. Project Setup & Configuration

### Project Creation Screen
- **Company/product name field**: Pre-filled "Cloudify"
- **Description/brief**: Text area for describing the project (uses example brief about cloud accounting)
- **Page Count Dropdown**: Options: `1`, `2-5`, `5-10`, `10-15`, `15-20`, `20+`
- **Language Dropdown**: Default "English", supports multiple languages
- **"Generate sitemap"** button: Purple sparkle icon + "Generate sitemap" text

### Project Header (All Tabs)
```
[Logo ▼] [Cloudify] [Invite & earn]     [Sitemap] [Wireframe] [Style Guide] [Design]     [DK] [💬] [Share] [⚙ ▼] [Export] [Upgrade]
```

### Bottom Bar
```
[? Help]     [Project ≡]     [🖥 📱 📲 🗑] [20%/29%/6% ▼]
```
- Desktop / Tablet / Mobile viewport toggles
- Zoom control dropdown
- "Project" info button

---

## 2. Sitemap Generation Pipeline

### AI Completion Sequence (from console logs)

```
Step 1: POST apis.relume.io/llm/v1/infer
        → Streaming "family-style-2" completion
        → Purpose: Classify project type/family (e.g., SaaS, agency, e-commerce)

Step 2: POST apis.relume.io/llm/v1/infer  
        → Streaming "brief-to-homepage-3" completion
        → Purpose: Generate homepage structure (sections + descriptions)

Step 3: POST apis.relume.io/llm/v1/infer (×N, one per child page)
        → Streaming "page-completion-3" completion (×10 for 10-15 pages setting)
        → Purpose: Generate each child page's structure (sections + descriptions)
```

### Network Requests During Sitemap Generation
- **12 total `POST apis.relume.io/llm/v1/infer` calls** (AI completions)
- **Slot type fetches**: `GET apis.relume.io/v1/slot_type/ST265`, `ST331`, `ST366`, `ST365`, `ST232`
- **Component JSON fetches from CDN**:
  - `GET components-public.relume.io/scrambled/footer12_component.json`
  - `GET components-public.relume.io/scrambled/navbar1_component.json`
  - `GET components-public.relume.io/scrambled/section_pricing38.json`
  - `GET components-public.relume.io/scrambled/footer3_component.json`

### Generation Animation
- Full-screen overlay with particle effects (star sparkles) ✨
- Button changes to "Generating..." (disabled state, animated)
- Progress is streaming — sections appear incrementally
- Completion toast: **"Boom! Sitemap complete"** (confetti-style notification)

### Timing
- Total generation: ~15-20 seconds for 10 pages + 1 sub-page
- Streaming means partial results appear before completion

---

## 3. Sitemap View — UI & Interactions

### Tree Structure
The sitemap renders as a **horizontal tree** (left-to-right):
- **Root**: Home page (centered, larger)
- **Children**: Spread horizontally below
- **Sub-children**: Blog → Blog Post (only 2-level hierarchy observed)

### Page Node Anatomy
Each page node is a card showing:
```
┌─────────────────────┐
│ 📄 Page Name    ... │  ← Header with icon + name + "..." menu button
├─────────────────────┤
│ Navbar              │  ← Section list
│ ─────────────────── │
│ Hero Header Section │  ← Each section shows:
│ Description text... │     - Name (bold)
│ ─────────────────── │     - Description (gray, truncated)
│ Features List Sect. │
│ Description...      │
│ ─────────────────── │
│ ...more sections... │
│ ─────────────────── │
│ Footer              │  ← Footer always last
└─────────────────────┘
     [+Section] [⚡Generate]   ← Buttons below card
```

### Page Panel (Right Sidebar)
Clicking a page node opens the **Page panel**:
- **Title**: "Page"
- **"Change to Page Group"** button (converts page to category folder — only shows for non-home pages)
- **Name** *(required)*: Text input
- **Description**: Text area with "Add a unique description to regenerate the page with a new layout and copy..." placeholder + "Prompt +" button
- **"Generate page"** button (purple sparkle icon): "This will override all page sections and copy"

> **Note**: Home page does NOT show "Change to Page Group" button. Blog page (with child) shows it.

### Section Panel (Right Sidebar)  
Clicking a section in sitemap shows:
- **Title**: "Section"
- **"Make a global section"** button (green diamond icon)
- **Color** dropdown: Default, Grey, Brown, Orange, Yellow, Green, Blue, Purple, Pink, Red (10 options with search)

### Page Context Menu (Right-click / "..." button)
```
┌──────────────────────────────┐
│ 🔍 Search actions...        │
├──────────────────────────────┤
│ ✨ Ask AI                  →│
│    Duplicate           ⌘D   │
│    Delete               ⌫   │
│    Copy                ⌘C   │
│    Cut                 ⌘X   │
│    Paste               ⌘V   │
│    Add page            ⌘↵   │
│    Add section               │
│ 🔖 Save as template         │
│ 🏠 Set as home page  (gray) │
│    Change to page group      │
│ 🔍 Find page in wireframe   │
└──────────────────────────────┘
```

---

## 4. Add Section Flow (Sitemap)

Clicking "Add section" (from context menu or "+" button) opens the **Add panel**:

### Panel Structure
```
┌──────────────────────────┐
│ Add                    ✕ │
├──────────────────────────┤
│ 🔍 Search                │
├──────────────────────────┤
│ Global sections          │
│ ♦ Footer    11 instances │  ← Auto-detected shared sections
│ ♦ Navbar    11 instances │
├──────────────────────────┤
│ Saved                    │
│ 📋 Page Templates 0 saved│
├──────────────────────────┤
│ Categories               │
│ 📋 Page Templates     → │
│ ☐ Blank Section       + │
│ ☐ About               + │
│ ☐ Announcement Banner + │
│ ☐ Benefits            + │
│ ☐ Blog List Header    + │
│ ☐ Blog List           + │
│ ☐ Blog Post Body      + │
│ ☐ Blog Post Header    + │
│ ☐ Contact             + │
│ ☐ CTA                 + │  ← Each has icon + "+" button
│ ☐ Event Item Header   + │
│ ☐ Events List         + │
│ ☐ FAQ                 + │
│ ☐ Feature             + │
│ ☐ Features List       + │
│ ☐ Footer              + │
│ ☐ Gallery             + │
│ ☐ Header              + │
│ ☐ Hero Header         + │
│ ☐ How It Works        + │
│ ☐ Job Listings        + │
│ ☐ Logo List           + │
│ ☐ Navbar              + │
│ ☐ Portfolio Item Body  + │
│ ☐ Portfolio Item Header+ │
│ ☐ Portfolio List       + │
│ ☐ Pricing             + │
│ ☐ Product Header      + │
│ ☐ Products List       + │
│ ☐ Stats               + │
│ ☐ Team                + │
│ ☐ Testimonial         + │
└──────────────────────────┘
```

### Critical Behavior
**Clicking a category "+" button immediately adds a generic section** of that type to the page — there is NO sub-variant selection at the sitemap level.

The added section gets:
- Default name: "{Category} Section" (e.g., "CTA Section")
- Default description: Generic text (e.g., "Invite visitors to inquire about or purchase the product or service")

**Variant/template selection happens only in the Wireframe tab.**

---

## 5. Wireframe Tab — Automatic Generation

### Transition Behavior
Switching from Sitemap → Wireframe tab **automatically triggers wireframe generation** if wireframes don't exist yet.

### Wireframe Generation AI Pipeline
```
Step 4: POST apis.relume.io/llm/v1/infer (×N, one per page)
        → Streaming "page-content-1" completion
        → Purpose: Generate actual text/copy content for each section's wireframe
        
Step 5: POST apis.relume.io/llm/v1/infer (per section, on selection)
        → Streaming "section-text-count-1" completion
        → Purpose: Section-specific content generation
```

### Generation UI
- Bottom bar shows: **"✨ Generating wireframes..."** with stop button (⬛)  
- Pages fill in progressively (Home first, then children)
- Completion shows: **"AI feedback 👍 👎"** toast

### Wireframe Layout
- All pages displayed side-by-side horizontally (similar to sitemap but vertical page frames)
- Home page is tallest (most sections)
- Zoom defaults to 7%, adjustable up to 100%+
- Each page is a full-width vertical strip of sections
- Responsive viewport toggles: Desktop 🖥 / Tablet 📱 / Mobile 📲

### Free Plan Limitation
- Only **Home page** wireframe is fully visible
- Other pages show **"⚡ Upgrade to view pages"** message

---

## 6. Wireframe Section Panel & Controls

Clicking a section in wireframe view opens a much richer panel than sitemap view:

### Section Panel Structure
```
┌──────────────────────────────┐
│ Section                    ✕ │
├──────────────────────────────┤
│ ♦ Make a global section      │
├──────────────────────────────┤
│ Name *                       │
│ [Hero Header Section      ]  │
├──────────────────────────────┤
│ Description                  │
│ [Catchy introduction to   ]  │
│ [Cloudify, highlighting   ]  │
│ [cloud-based accounting...]  │
│                    Prompt + │
├──────────────────────────────┤
│ ⚙ Header 84              → │  ← Component variant selector
├──────────────────────────────┤
│ Style        [Normal] [Card] │  ← Toggle buttons
│ Asset        [📷]    [🎬]   │  ← Image / Video
│ Asset        [←]     [→]    │  ← Left / Right placement
│ Placement                    │
│ Element      [Form] [Button] │  ← Form / Button
├──────────────────────────────┤
│ ✨ Generate copy             │  ← Re-generate section text
└──────────────────────────────┘
```

### Control Dimensions (per section)
The controls are **context-dependent** — different section categories expose different controls:

| Control | Values | Description |
|---------|--------|-------------|
| **Style** | Normal, Card | Visual container style |
| **Asset** | Image 📷, Video 🎬 | Media type |
| **Asset Placement** | Left ←, Right → | Media position |
| **Element** | Form, Button | CTA element type |

### Key Features
- **Component variant**: Shows current template name (e.g., "Header 84") with thumbnail
- **Click to browse variants**: Opens the Replace Component panel
- **"Generate copy"**: Per-section AI content regeneration
- **"Prompt +"**: Provides context for AI generation in the description field
- The controls change the wireframe component **in real-time** (live preview)

---

## 7. Replace Component — Variant Browser

Clicking the component variant selector (e.g., "Header 84 →") opens:

### Panel Structure
```
┌──────────────────────────────────┐
│ ← Replace Component           ✕ │
├──────────────────────────────────┤
│ 🔍 Search                    ⚙ │  ← Search + filter toggle
├──────────────────────────────────┤
│ [Suggested] [Saved]              │  ← Tabs
├──────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐       │
│ │Header 84 ✅│ │Header 88 🔖│    │  ← Grid of variant thumbnails
│ │[wireframe]│ │[wireframe]│      │     Current = green check
│ │[preview  ]│ │[preview  ]│      │     Each has save/bookmark button
│ └──────────┘ └──────────┘       │
│ ┌──────────┐ ┌──────────┐       │
│ │Header 1  🔖│ │Header 110🔖│   │
│ │[wireframe]│ │[wireframe]│      │
│ │[preview  ]│ │[preview  ]│      │
│ └──────────┘ └──────────┘       │
│ ... (scrollable grid) ...       │
├──────────────────────────────────┤
│ ✕✕ Shuffle component            │  ← Random variant
└──────────────────────────────────┘
```

### Header Variant Count
~55 Header variants observed (not sequential — gaps in numbering):
`1, 5, 9, 15, 19, 26, 30, 36, 37, 76, 77, 78, 79, 80, 81, 83, 84, 88, 92, 98, 102, 103, 110, 111, 113, 114, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 140, 141, 142, 144, 145, 149`

### Key Features
- **Suggested tab**: AI-recommended variants appear first (84, 88, 92, 98), then full list
- **Saved tab**: User's bookmarked/favorited components
- **Search**: Full-text search across all variants
- **Shuffle component**: Randomize to another variant
- **"Add to saved"**: Bookmark icon on each variant
- Each variant shows a **wireframe thumbnail preview**

### Component Naming Convention
Internal names follow: `section_{category}{number}`
- `section_header84` → Header 84
- `section_pricing38` → Pricing 38
- `navbar1_component` → Navbar 1
- `footer12_component` → Footer 12

CDN URL pattern: `https://components-public.relume.io/scrambled/{name}.json`

---

## 8. Filter System — 3 Dimensions

The filter icon (⚙) in Replace Component reveals 3 filter groups + 1 toggle:

### A. Category Filter (31 options — see Section 11)
Multi-select checkboxes with icons for each category.

### B. Layout Filter

| Sub-group | Options |
|-----------|---------|
| **Style** | Standard, Card, Background, Off-grid, Overlapping, Edge-to-edge |
| **Text Alignment** | Left, Center |
| **Asset Alignment** | Left, Right, Center, Top, Bottom |
| **Columns** | 1, 2, 3, 4, 5+ |

### C. Elements Filter (43 options — see Section 12)
Multi-select checkboxes for fine-grained element filtering.

### D. Uncommon Toggle
Checkbox to include/exclude uncommon/rare component variants.

### Clear Button
Resets all applied filters.

---

## 9. Style Guide Tab

### Layout
- **Left panel**: Colors + Typography controls
- **Right panel**: Live wireframe preview with styles applied

### Colors Section
- **Light/Dark mode** toggle (☀️/🌙)
- **"Shuffle" button** (keyboard shortcut: `C`) — randomize palette
- **Color palettes** (3-4 cards):
  - **Neutrals**: Grayscale palette
  - **Primary**: "Azure Radiance" `#0A74FF` (labeled "Main") with tint/shade scale
  - **Secondary**: "Jade" `#00A86B` with scale
  - **Accent**: "Flush Orange" `#FF7A00` with scale
  - **"+" button**: Add additional colors
- Each color card shows:
  - Name (truncated if long)
  - Hex value
  - Circluar dots showing tint/shade variations (5-6 dots)
  - "Main" label on the primary color

### Typography Section
- **Font weight dropdown**: "Regular - medium" (configurable)
- **"Shuffle" button** (keyboard shortcut: `T`) — randomize fonts
- **Heading font**: Inter (default)
- **Body font**: Roboto (default)
- Each shows a preview of the font family name

### Concept System
- **"Concept 2" dropdown** at top — switch between multiple concepts
- **"Pitch Concepts" button** — manage/present concept variations

### Bottom Bar
- **Undo/Redo** buttons
- **"Scheme shuffle" (SPACE)** — randomize entire scheme (colors + fonts)
- Desktop/Tablet/Mobile viewport toggles

### Live Preview
The right panel shows the Homepage wireframe with the selected style guide applied:
- Colors from the palette are applied to buttons, backgrounds, text
- Typography is applied to headings and body text
- Updates in real-time as settings change

---

## 10. Design Tab

### Overview
The Design tab shows the **styled version** of wireframes:
- Same page grid as Wireframe tab (all pages side-by-side)
- Style Guide colors and fonts are applied visually
- Sections have proper background colors, button colors, etc.
- "AI feedback 👍 👎" toast appears after generation
- Zoom defaults to ~6%

### Difference from Wireframe Tab
- **Wireframe**: Grayscale/monochrome structural layouts
- **Design**: Same structure but with Style Guide (colors + fonts) applied

---

## 11. Complete Category Taxonomy (31 Categories)

These are used in both the Sitemap "Add Section" panel and the Wireframe "Replace Component" category filter:

| # | Category | Sitemap Name | Filter Name |
|---|----------|-------------|-------------|
| 1 | About | About | About Section |
| 2 | Announcement Banner | Announcement Banner | Announcement Banner |
| 3 | Benefits | Benefits | Benefits Section |
| 4 | Blog List Header | Blog List Header | Blog List Header Section |
| 5 | Blog List | Blog List | Blog List Section |
| 6 | Blog Post Body | Blog Post Body | Blog Post Body Section |
| 7 | Blog Post Header | Blog Post Header | Blog Post Header Section |
| 8 | Contact | Contact | Contact Section |
| 9 | CTA | CTA | CTA Section |
| 10 | Event Item Header | Event Item Header | Event Item Header Section |
| 11 | Events List | Events List | Events List Section |
| 12 | FAQ | FAQ | FAQ Section |
| 13 | Feature | Feature | Feature Section |
| 14 | Features List | Features List | Features List Section |
| 15 | Footer | Footer | Footer |
| 16 | Gallery | Gallery | Gallery Section |
| 17 | Header | Header | Header Section |
| 18 | Hero Header | Hero Header | Hero Header Section |
| 19 | How It Works | How It Works | How It Works Section |
| 20 | Job Listings | Job Listings | Job Listings Section |
| 21 | Logo List | Logo List | Logo List Section |
| 22 | Navbar | Navbar | Navbar |
| 23 | Portfolio Item Body | Portfolio Item Body | Portfolio Item Body Section |
| 24 | Portfolio Item Header | Portfolio Item Header | Portfolio Item Header Section |
| 25 | Portfolio List | Portfolio List | Portfolio List Section |
| 26 | Pricing | Pricing | Pricing Section |
| 27 | Product Header | Product Header | Product Header Section |
| 28 | Products List | Products List | Products List Section |
| 29 | Stats | Stats | Stats Section |
| 30 | Team | Team | Team Section |
| 31 | Testimonial | Testimonial | Testimonial Section |

### Category Groupings (Conceptual)

**Navigation**: Navbar, Footer, Announcement Banner  
**Hero/Landing**: Hero Header, Header  
**Content**: Feature, Features List, Benefits, About, How It Works, Stats, Gallery  
**Social Proof**: Testimonial, Logo List  
**Conversion**: CTA, Pricing, Contact  
**Blog/Content**: Blog List Header, Blog List, Blog Post Header, Blog Post Body  
**Portfolio/Products**: Portfolio List, Portfolio Item Header, Portfolio Item Body, Products List, Product Header  
**Engagement**: FAQ, Newsletter (implicit), Events List, Event Item Header, Job Listings  
**Utility**: Team, Blank Section, Page Templates

---

## 12. Complete Elements Taxonomy (43 Elements)

Elements are the building blocks WITHIN sections. Used as filter in the Replace Component panel:

| # | Element |
|---|---------|
| 1 | Accordion |
| 2 | Author |
| 3 | Avatar Image |
| 4 | Background Image |
| 5 | Background Video |
| 6 | Buttons |
| 7 | Cards |
| 8 | Checkboxes |
| 9 | Contact Details |
| 10 | Date |
| 11 | Dropdown |
| 12 | Featured Blog Posts |
| 13 | Filters |
| 14 | Form |
| 15 | Hamburger Menu (Desktop) |
| 16 | Icons |
| 17 | Image |
| 18 | Image Lightbox |
| 19 | List |
| 20 | Loading Animation |
| 21 | Logos |
| 22 | Map |
| 23 | Mega Menu |
| 24 | Modal |
| 25 | Multiple Images |
| 26 | Newsletter Sign Up |
| 27 | Overlapping Images |
| 28 | Pagination |
| 29 | Progress Bar |
| 30 | Radio Buttons |
| 31 | Rich Text |
| 32 | Search Bar |
| 33 | Side Panel |
| 34 | Sidebar |
| 35 | Slider |
| 36 | Star Rating |
| 37 | Table of Contents |
| 38 | Tabs |
| 39 | Tags |
| 40 | Text Only |
| 41 | Toggles |
| 42 | Topbar |
| 43 | Video Lightbox |

---

## 13. AI Completion Types — Full Pipeline

| Order | Completion Type | Count | Tab | Purpose |
|-------|----------------|-------|-----|---------|
| 1 | `family-style-2` | 1 | Sitemap | Classify project type/family |
| 2 | `brief-to-homepage-3` | 1 | Sitemap | Generate homepage structure (section names + descriptions) |
| 3 | `page-completion-3` | N (10) | Sitemap | Generate each child page structure |
| 4 | `page-content-1` | N (5+) | Wireframe | Generate actual wireframe content/copy per page |
| 5 | `section-text-count-1` | On-demand | Wireframe | Section-specific content counting/adjustment |

### Key Insight: Two-Phase Content Generation
1. **Sitemap phase** generates STRUCTURE: page names, section categories, section descriptions
2. **Wireframe phase** generates CONTENT: actual headlines, body text, button labels, feature descriptions

This means the sitemap AI knows nothing about specific wireframe templates — it only assigns section *categories* and *descriptions*.

---

## 14. API & CDN Architecture

### API Endpoints
```
apis.relume.io/
├── llm/v1/infer                          → POST: AI completions (all types)
├── v1/slot_type/ST{id}                   → GET: Section type definitions
├── accounts/
│   ├── me                                → GET: User profile
│   ├── feature_flags                     → GET: Feature flags
│   ├── preferences                       → GET: User preferences
│   ├── pricing_table                     → GET: Pricing data
│   ├── coupons                           → GET: Active coupons
│   └── growth_nudge                      → GET: Growth prompts
├── blocks/
│   ├── projects?ownerType=all            → GET: All user projects
│   ├── project/sharing_settings          → GET: Project sharing config
│   ├── project/owner                     → GET: Project ownership info
│   ├── favourite_components/count        → GET: Saved component count
│   ├── page_templates/count              → GET: Saved template count
│   └── page_templates                    → GET: Saved templates list
└── v1/ae                                 → POST: Analytics event
```

### Component CDN
```
components-public.relume.io/scrambled/
├── navbar1_component.json
├── footer3_component.json
├── footer12_component.json
├── section_pricing38.json
├── section_header84.json          ← Pattern: section_{category}{number}.json
└── ...
```

### Naming Convention
- **Section components**: `section_{category}{number}` → `section_header84`, `section_pricing38`
- **Standalone components**: `{category}{number}_component` → `navbar1_component`, `footer12_component`
- **Slot types**: `ST{id}` → `ST265`, `ST331`, `ST366`, `ST365`, `ST232`

### Third-Party Integrations Observed
- **PostHog** (analytics): `us.i.posthog.com` + `php.relume.io` (self-hosted proxy)
- **Sentry** (error tracking): `o4505247884640256.ingest.sentry.io`
- **Stripe** (billing): `js.stripe.com`, `m.stripe.com`
- **Intercom** (support): `api-iam.intercom.io`
- **Google Analytics**: GA4 (`G-4F5ELX0KXH`) + Google Ads (`AW-428198720`)
- **Facebook Pixel**: `371246391460828` (SubscribedButtonClick events)
- **LinkedIn**: Attribution tracking
- **Rewardful**: Affiliate program

---

## 15. Generated Sitemap — Full Page Tree

### Home Page (Root)
13 sections:
1. **Navbar** (global)
2. **Hero Header Section** — "Catchy introduction to Cloudify, highlighting cloud-based accounting, accessibility, and integrations."
3. **Features List Section** — "Showcase top 3 features: cloud access, easy invoicing, and real-time reporting."
4. **Feature Section** — "Highlight seamless integration with 1,000+ apps."
5. **Benefits Section** — "Explain key advantages for small-business owners using Cloudify."
6. **Stats Section** — "Display usage statistics, customer numbers, or time/money saved."
7. **Testimonial Section** — "Share positive feedback from real Cloudify users."
8. **Pricing Section** — "Present clear overview of pricing plans for Cloudify."
9. **CTA Section** — "Encourage visitors to start a free trial or schedule a demo."
10. **Newsletter Section** — "Invite visitors to subscribe for product updates and accounting tips."
11. **FAQ Section** — "Answer most common questions about Cloudify and its use."
12. **Footer** (global)

### Child Pages

| Page | Sections |
|------|----------|
| **Features** | Navbar, Header, Features List, Feature (×7), Testimonial, CTA, Footer |
| **Pricing** | Navbar, Header, Pricing, Pricing Comparison, Testimonial, CTA, FAQ, Footer |
| **Integrations** | Navbar, Header, Features List, Feature, Logo List, CTA, FAQ, Footer |
| **About Us** | Navbar, Header, About, Team, Stats, Award Logos List, Customer Logos List, Testimonial, CTA, Footer |
| **Blog** | Navbar, Featured Blog List Header, Blog List, Footer |
| **Blog Post** (child of Blog) | Navbar, Blog Post Header, Blog Post Body, Testimonial, CTA, Newsletter, FAQ, Footer |
| **Resources** | Navbar, Header, Resources List, Featured Resources List Header, Newsletter, FAQ, Footer |
| **Contact Us** | Navbar, Header, Contact, Contact Form, Locations, FAQ, Footer |
| **Support** | Navbar, Header, Features List, Contact, Contact Form, FAQ, CTA, Footer |
| **Product Demo** | Navbar, Header, Feature, How It Works, CTA Form, Testimonial, FAQ, Footer |

### Observations
- Every page starts with **Navbar** and ends with **Footer** (both global)
- **Header Section** (non-hero) used for child pages instead of Hero Header
- Section selection is contextually intelligent (Pricing page gets Pricing + Pricing Comparison, Blog gets Blog List, Contact gets Contact Form + Locations, etc.)
- Blog is the only page with a sub-page (Blog Post) — 2-level max observed
- Total: 11 pages, ~85 sections

---

## 16. Key Insights for Scytle

### A. Sitemap ≠ Wireframe — Two Distinct Phases
Relume's sitemap phase ONLY assigns:
- Page names
- Section category names (e.g., "CTA Section")  
- Section descriptions (brief context for AI)

It does NOT choose:
- Specific wireframe templates/variants
- Visual layout controls
- Actual text content

**Gap in Scytle**: We currently assign family + preset at sitemap time. We should separate these phases:
1. Sitemap → section categories + descriptions
2. Wireframe → template/variant selection (AI-suggested or manual)
3. Content → AI-generated copy per section

### B. AI Suggests → User Refines
When a section exists in the wireframe:
- AI auto-selects a "suggested" variant (e.g., Header 84)
- User can browse alternatives via "Replace Component"
- "Suggested" tab shows AI-recommended variants first
- "Shuffle component" for lazy randomization
- Controls (Style/Asset/Element) fine-tune the selected variant

### C. Component Library Scale
- **31 section categories** (vs our planned 14+)
- **~55 Header variants alone** — hundreds of total variants across all categories
- **43 element types** for filtering
- Each variant has a **wireframe thumbnail image** for visual browsing

### D. Section Controls Are Per-Category
Different section categories have different control sets:
- Headers: Style (Normal/Card), Asset (Image/Video), Asset Placement (Left/Right), Element (Form/Button)
- Other sections have their own relevant controls

This maps to our `controlsDef` concept in V1 families.

### E. Global Sections = Smart Shared Components
- Navbar and Footer are auto-marked as "global" (linked across all pages)
- Any section can be made global via "Make a global section"
- Global sections show instance count (e.g., "Footer 11 instances")

### F. Style Guide as Separate Phase
The Style Guide is its own tab with:
- AI-generated color palettes (with shuffling)
- AI-suggested fonts (with shuffling)
- Multiple concepts for pitching
- Live preview integration

This is a separate phase from wireframe/sitemap — applied as a layer.

### G. Component Naming Convention
`section_{category}{number}` (e.g., `section_header84`, `section_pricing38`)
Components are stored as JSON on a CDN, loaded on demand.

### H. Filtering System Depth
Three-dimensional filtering (Category × Layout × Elements) enables precision selection:
- Layout: Style + Text Alignment + Asset Alignment + Columns
- Elements: 43 fine-grained element types

### I. Content Generation is Streaming & Incremental
All AI operations use SSE streaming, and content appears progressively.

### J. Export Targets
"When you're ready, export to Figma, Webflow, or React. Each export includes best practices, a design system, and scalable components tailored to your chosen platform."

---

## Appendix: Relume vs Scytle Feature Comparison

| Feature | Relume | Scytle (Current) | Gap |
|---------|--------|-------------------|-----|
| Section Categories | 31 | 14 planned (2 done: Hero, CTA) | Need ~17 more |
| Variants per Category | 55+ (Header alone) | 5-16 per category | Need more variants |
| Template Selection | Wireframe tab (Replace Component) | At sitemap time | Separate phases |
| AI Pipeline | 5 completion types, multi-phase | 1 sitemap gen + section assignment | Need phased approach |
| Section Controls | Category-specific (Style/Asset/Element) | V1 controlsDef system | Align w/ Relume model |
| Global Sections | Auto-detected + manual | Not implemented | Add this |
| Style Guide | Separate tab w/ shuffle | Not implemented | Build this |
| Component Library Browser | Grid w/ thumbnails + 3D filters | Panel w/ cards | Enhance filtering |
| Content Generation | Separate from structure | Coupled | Decouple these |
| Undo/Redo | Full undo support | Unified store history | Already have this ✅ |
| Export | Figma, Webflow, React | Not yet | Future phase |
