# Relume AI Pipeline — Complete Reverse Engineering

> **Method**: Network-level interception of `apis.relume.io` API calls via injected fetch interceptor.
> **Date**: January 2025
> **Generations analyzed**: 3 sitemaps (fitness app, e-commerce grocery, creative agency) + 1 wireframe
> **Endpoints discovered**: 8 distinct API routes + 1 CDN

---

## Table of Contents

1. [Pipeline Overview](#1-pipeline-overview)
2. [Phase 1: Sitemap Generation](#2-phase-1-sitemap-generation)
3. [Phase 2: Wireframe Generation](#3-phase-2-wireframe-generation)
4. [The 74-Category System](#4-the-74-category-system)
5. [7-Attribute Component Matching](#5-7-attribute-component-matching)
6. [Variant Control System](#6-variant-control-system)
7. [Text Content Generation](#7-text-content-generation)
8. [Cross-Generation Analysis](#8-cross-generation-analysis)
9. [API Reference](#9-api-reference)
10. [Implementation Notes for Scytle](#10-implementation-notes-for-scytle)

---

## 1. Pipeline Overview

Relume's AI pipeline has **two distinct phases** triggered at different times:

```
Phase 1: SITEMAP (triggered on "Generate sitemap" click)
┌──────────────────────────────────────────────────────────────────────┐
│  family-style-2 ──→ layout styles (e.g. ["standard","off_grid"])    │
│  brief-to-homepage-3 ──→ page tree + homepage section CSV           │
│  page-completion-3 ×N ──→ child page section CSVs (parallelized)    │
└──────────────────────────────────────────────────────────────────────┘

Phase 2: WIREFRAME (triggered on "Wireframe" tab click — NOT pre-generated)
┌──────────────────────────────────────────────────────────────────────┐
│  GET /components?filter_blocks_category_ai=X ──→ variant lists      │
│  POST /page_with_components_stream ──→ variant selection (AI)       │
│  GET /scrambled/{slug}.json (CDN) ──→ component structure           │
│  GET /slot_type/{STID} ──→ text field definitions                   │
│  page-content-1 ×4 (batched) ──→ AI-generated text content          │
└──────────────────────────────────────────────────────────────────────┘
```

**All AI completions** go through a single endpoint:
```
POST https://apis.relume.io/llm/v1/infer?member_token=rl-auth-{token}
```

Response format is **Server-Sent Events (SSE)**:
```
data: {"content": "tok"}
data: {"content": "en"}
data: {"finishReason": "stop"}
```

---

## 2. Phase 1: Sitemap Generation

### Step 1: `family-style-2` — Layout Style Classification

**Purpose**: Determines the visual "family" of components to use across the entire project.

**Request**:
```json
{
  "prompt": "family-style-2",
  "promptContext": {
    "projectBrief": "BrightSpark is a creative design agency specializing in brand identity, web design, and digital marketing for startups and growing businesses."
  }
}
```

**Response** (SSE → parsed):
```json
["standard", "off_grid", "background"]
```

**Key insight**: The AI analyzes the project brief to determine appropriate layout styles. This is NOT random — it's domain-aware:

| Project Brief | Layout Styles Returned |
|---------------|----------------------|
| FitTrack (fitness tracking app) | `["standard", "card"]` |
| GreenLeaf (organic grocery e-commerce) | `["standard", "card"]` |
| BrightSpark (creative design agency) | `["standard", "off_grid", "background"]` |

- SaaS/utility/e-commerce products → `standard` + `card` (structured, grid-based)
- Creative/agency/portfolio projects → `standard` + `off_grid` + `background` (expressive, editorial)

### Step 2: `brief-to-homepage-3` — Page Tree + Homepage Sections

**Purpose**: Generates the entire site structure AND homepage section composition in a single call.

**Request**:
```json
{
  "prompt": "brief-to-homepage-3",
  "promptContext": {
    "projectBrief": "BrightSpark is a creative design agency...",
    "pageCount": 5,
    "locale": "en-US",
    "sectionCategoryCsv": "id|section category\n1|Navbar\n2|Hero Header Section\n3|Header Section\n4|Portfolio Item Header Section\n5|Project Item Header Section\n6|Portfolio Item Body Section\n7|Project Item Body Section\n8|Portfolio List Section\n9|Project List Section\n10|Blog Post Header Section\n11|Resource Item Header Section\n12|Case Study Header Section\n13|Press Article Header Section\n14|Update Item Header Section\n15|Event Item Header Section\n16|Blog Post Body Section\n17|Resource Item Body Section\n18|Case Study Body Section\n19|Documentation Body Section\n20|Press Release Body Section\n21|Legal Page Body Section\n22|Update Item Body Section\n23|Event Schedule Section\n24|Event Item Body Section\n25|Course Item Body Section\n26|Featured Blog List Header Section\n27|Featured Resources List Header Section\n28|Featured Case Study List Header Section\n29|Featured Press List Header Section\n30|Featured Updates List Header Section\n31|Featured Events List Header Section\n32|Featured Courses List Header Section\n33|Blog List Section\n34|Resources List Section\n35|Case Study List Section\n36|Press List Section\n37|Updates List Section\n38|Events List Section\n39|Courses List Section\n40|Feature Section\n41|Features List Section\n42|Benefits Section\n43|How It Works Section\n44|Services Section\n45|About Section\n46|Stats Section\n47|Ecommerce Product Section\n48|Timeline Section\n49|Ecommerce Product Header Section\n50|Course Item Header Section\n51|Ecommerce Products List Section\n52|Testimonial Section\n53|Reviews Section\n54|Pricing Section\n55|Pricing Comparison Section\n56|CTA Section\n57|CTA Form Section\n58|Newsletter Section\n59|Early Access Section\n60|Contact Section\n61|Contact Form Section\n62|Application Form Section\n63|Locations Section\n64|Gallery Section\n65|FAQ Section\n66|Team Section\n67|Logo List Section\n68|Award Logos List Section\n69|Customer Logos List Section\n70|Client Logos List Section\n71|Partner Logos List Section\n72|Job Listings Section\n73|Footer\n74|Comparison Section"
  }
}
```

**Response** (TWO parts separated by double newline):

**Part 1 — Page Tree** (always line 1):
```
(1) Home, About Us, Services, Portfolio > Project, Blog > Blog Post
```

Format rules:
- `>` denotes parent-child relationship
- `,` separates sibling pages
- `(1)` prefix indicates this is part 1 of the response
- Page count is a soft guideline (AI may go slightly over)

**Part 2 — Homepage Sections** (CSV rows):
```
Home|2|Hero Header Section|Bold introduction to BrightSpark, its creative focus, and the value offered to startups and growing businesses.
Home|41|Features List Section|Quick overview of core services: brand identity, web design, and digital marketing.
Home|40|Feature Section|Highlight BrightSpark's collaborative approach and client-focused process.
Home|66|Team Section|Showcase the creative team and their expertise.
Home|8|Portfolio List Section|Curated selection of recent projects demonstrating design capabilities.
Home|52|Testimonial Section|Quotes from satisfied clients, emphasizing results and experience.
Home|56|CTA Section|Prompt to contact BrightSpark for a discovery call or project inquiry.
Home|58|Newsletter Section|Invite users to subscribe for design tips, agency updates, and inspiration.
```

CSV format: `PageName|categoryId|SectionCategoryName|Description`

**Key observations**:
- The AI selects from the 74-category CSV constraint — it MUST use valid category IDs
- Section descriptions are generated by the AI and will be passed downstream to wireframe generation
- Navbar (ID 1) and Footer (ID 73) are NOT included — they're added automatically by the client
- The AI sometimes adds a "Feedback:" commentary at the end (observed in GreenLeaf generation)
- The AI sometimes includes a CSV header row (`page|id|section category|description`) — inconsistent

### Step 3: `page-completion-3` — Child Page Sections

**Purpose**: Generates section composition for each non-homepage page. Fires **once per page**, can run in parallel.

**Request**:
```json
{
  "prompt": "page-completion-3",
  "promptContext": {
    "projectBrief": "BrightSpark is a creative design agency...",
    "sitePages": "Home, About Us, Services, Portfolio, Project, Blog, Blog Post",
    "homepageCsv": "Home|2|Hero Header Section|Bold introduction...\nHome|41|Features List Section|Quick overview...\n...",
    "homepageName": "Home",
    "pagesToComplete": ["Services"],
    "locale": "en-US",
    "sectionCategoryCsv": "id|section category\n1|Navbar\n2|Hero Header Section\n..."
  }
}
```

**Key fields**:
- `sitePages`: Flat comma-separated list (no hierarchy)
- `homepageCsv`: The FULL homepage section CSV from Step 2 — provides context for consistent cross-page design
- `pagesToComplete`: Always a single-element array — ONE page per request
- The request includes the same 74-category CSV constraint

**Response** (CSV rows):
```
Services|3|Header Section|Introduce BrightSpark's range of design services.
Services|44|Services Section|Breakdown of core services with descriptions.
Services|40|Feature Section|Deep dive into a standout service or methodology.
Services|65|FAQ Section|Answers to common questions about working with BrightSpark.
Services|56|CTA Section|Encourage prospective clients to reach out.
```

**Domain-specific category selection** (observed across 3 generations):
- Fitness app: IDs 40, 41, 42, 43 (Feature, Features List, Benefits, How It Works)
- E-commerce: IDs 47, 49, 51, 53 (Ecommerce Product/Products List, Reviews)
- Agency: IDs 5, 7, 8, 64, 66 (Project Item Header/Body, Portfolio List, Gallery, Team)
- Blog pages always use: IDs 10, 16, 26 (Blog Post Header, Blog Post Body, Featured Blog List)

---

## 3. Phase 2: Wireframe Generation

Wireframe generation is **NOT** pre-computed. It triggers when the user clicks the "Wireframe" tab. The pipeline involves both server-side AI (variant selection) and client-side AI (text generation).

### Step 4: Component Category Queries

**Purpose**: Fetch the list of available component variants for each section category on the page.

**Endpoint**: `GET /v1/components?filter_blocks_category_ai={CategoryName}`

One request fires per unique section category. For the BrightSpark homepage (10 sections), these were fetched:

| Category Query | Response Size | Purpose |
|---------------|---------------|---------|
| `Hero+Header+Section` | 11,590 bytes | Hero header variants |
| `Features+List+Section` | 20,000 bytes | Features grid variants |
| `Feature+Section` | 20,000 bytes | Single feature variants |
| `Team+Section` | 15,709 bytes | Team display variants |
| `Portfolio+List+Section` | 11,671 bytes | Portfolio grid variants |
| `Testimonial+Section` | 16,857 bytes | Testimonial variants |
| `CTA+Section` | 14,029 bytes | CTA variants |
| `Newsletter+Section` | 14,849 bytes | Newsletter/signup variants |
| `Navbar` | 6,621 bytes | Navbar variants |
| `Footer` | 10,686 bytes | Footer variants |

Each response contains a list of component metadata (slug, name, thumbnail, tags, layout attributes).

### Step 5: `page_with_components_stream` — THE CORE VARIANT SELECTION API

**This is the most critical endpoint.** It's where the AI selects which specific component variant to use for each section.

**Endpoint**: `POST /v1/page_with_components_stream`

**Request**:
```json
{
  "websiteBrief": "BrightSpark is a creative design agency...",
  "pageName": "Home",
  "pageDescription": "",
  "layoutStyle": ["standard", "off_grid", "background"],
  "maxEditDistance": 3,
  "blocksProjectId": "3059625",
  "sections": [
    {
      "id": "Navbar0",
      "name": "Navbar",
      "category": "Navbar",
      "description": "",
      "sectionSlug": "navbar3_component"
    },
    {
      "id": "Hero Header Section1",
      "name": "Hero Header Section",
      "category": "Hero Header Section",
      "description": "Bold introduction to BrightSpark, its creative focus, and the value offered to startups and growing businesses."
    },
    {
      "id": "Features List Section2",
      "name": "Features List Section",
      "category": "Features List Section",
      "description": "Quick overview of core services: brand identity, web design, and digital marketing."
    },
    // ... (all sections in order)
    {
      "id": "Footer9",
      "name": "Footer",
      "category": "Footer",
      "description": "",
      "sectionSlug": "footer9_component"
    }
  ]
}
```

**Critical observations about the request**:
1. Only **Navbar and Footer** have pre-assigned `sectionSlug` — all content sections are sent WITHOUT a slug
2. `layoutStyle` comes from the `family-style-2` response (Step 1)
3. `maxEditDistance: 3` controls tolerance for attribute mismatch (higher = more flexibility in matching)
4. Section `description` comes from the sitemap generation (Steps 2-3)
5. Section `id` format is `{CategoryName}{index}` (e.g., `Hero Header Section1`)

**Response** (SSE stream — one `data:` line per section):
```json
data: {
  "sectionId": "Hero Header Section1",
  "component": {
    "kind": "component",
    "categorySlug": "hero-header-sections-off-grid",
    "category": "hero-header-sections",
    "componentSlug": "section_header110",
    "webflowSlug": "header-110",
    "name": "Header 110",
    "thumbnailUrl": "https://cdn.prod.website-files.com/...",
    "layoutStyle": "off_grid",
    "textBlocksCount": "1",
    "tags": ["3 Columns", "Image/Video Right", "Text Align Left", "Buttons", "Image", "Multiple Images", "Hero Header Section"],
    "reason": "category: Hero Header Section\nEDITED\nCat     |AI        |Actual    \n------------------------------\nlayout  |off_grid  |off_grid  \n------------------------------\ntxt_algn|left      |left      \n------------------------------\ngrid    |2_col     |2_col     \n------------------------------\nhead_pos|left      |left      \n------------------------------\nast_cnt |1         |2         \n------------------------------\nast_pos |right     |right     \n------------------------------\ntxt_cnt |1         |1         \n",
    "variants": [/* see Section 6 */]
  }
}
```

### Complete Variant Assignments (BrightSpark Homepage)

| Section | Assigned Component | Layout Style | Match Quality | Mismatches |
|---------|-------------------|--------------|---------------|------------|
| Hero Header Section | `section_header110` (Header 110) | off_grid | EDITED | ast_cnt: AI=1, actual=2 |
| Features List Section | `section_layout239` (Layout 239) | standard | EDITED | ast_pos: AI=top, actual=bottom |
| Feature Section | `section_layout430` (Layout 430) | off_grid | **EXACT MATCH** | none |
| Team Section | `section_team1` (Team 1) | standard | EDITED | ast_pos: AI=top, actual=bottom |
| Portfolio List Section | `section_portfolio15` (Portfolio 15) | standard | EDITED | layout: off_grid→standard, grid: 2_col→1_col, head_pos: left→top |
| Testimonial Section | `section_testimonial16` (Testimonial 16) | standard | EDITED | head_pos: left→right, ast_pos: right→left |
| CTA Section | `section_cta23` (CTA 23) | standard | **EXACT MATCH** | none |
| Newsletter Section | `section_cta2` (CTA 2) | standard | EDITED | layout: off_grid→standard |

**Observations**:
- Only 2 of 8 sections got EXACT MATCH — most are EDITED (within maxEditDistance tolerance)
- The AI picks a `layoutStyle` from the project's style array for EACH section independently
- Newsletter Section maps to a CTA component (`section_cta2`) — categories can cross-map
- The `reason` field contains the full attribute comparison table (debug info)

### Step 6: Component JSON Fetch (CDN)

**Endpoint**: `GET https://components-public.relume.io/scrambled/{slug}.json`

Each selected component is fetched from the CDN. These contain the full component structure:

| Component | File Size | Purpose |
|-----------|-----------|---------|
| `navbar3_component.json` | 39 KB | Navbar structure |
| `section_header110.json` | 23 KB | Hero header |
| `section_layout239.json` | 37 KB | Features list |
| `section_layout430.json` | 27 KB | Single feature |
| `section_team1.json` | 140 KB | Team grid (largest!) |
| `section_portfolio15.json` | 59 KB | Portfolio list |
| `section_testimonial16.json` | 70 KB | Testimonials |
| `section_cta23.json` | 20 KB | CTA |
| `section_cta2.json` | 28 KB | Newsletter CTA |
| `footer9_component.json` | 60 KB | Footer |

Total: ~503 KB of component JSON for ONE page.

### Step 7: Slot Type Resolution

**Endpoint**: `GET /v1/slot_type/{STID}`

Slot types define the configurable "slots" within components (text fields, image placeholders, repeatable items).

| Slot Type ID | Response Size |
|-------------|---------------|
| ST366 | 179 bytes |
| ST365 | 181 bytes |
| ST367 | 180 bytes |
| ST265 | 20,000 bytes |
| ST232 | 20,000 bytes |
| ST331 | 10,857 bytes |
| ST370 | 20,000 bytes |
| ST371 | 20,000 bytes |

---

## 4. The 74-Category System

The AI is constrained to select from exactly **74 section categories**. This list is sent as a CSV in every sitemap generation request. Only ~31 of these appear in the UI sidebar — the rest are for specialized page types.

```
 ID | Section Category                    | UI Visible | Domain
----|-------------------------------------|------------|--------
  1 | Navbar                              | Yes        | Universal
  2 | Hero Header Section                 | Yes        | Universal
  3 | Header Section                      | Yes        | Universal
  4 | Portfolio Item Header Section       | No         | Agency/Portfolio
  5 | Project Item Header Section         | No         | Agency/Portfolio
  6 | Portfolio Item Body Section         | No         | Agency/Portfolio
  7 | Project Item Body Section           | No         | Agency/Portfolio
  8 | Portfolio List Section              | Yes        | Agency/Portfolio
  9 | Project List Section                | No         | Agency/Portfolio
 10 | Blog Post Header Section            | No         | Blog/Content
 11 | Resource Item Header Section        | No         | Blog/Content
 12 | Case Study Header Section           | No         | Blog/Content
 13 | Press Article Header Section        | No         | Blog/Content
 14 | Update Item Header Section          | No         | Blog/Content
 15 | Event Item Header Section           | No         | Events
 16 | Blog Post Body Section              | No         | Blog/Content
 17 | Resource Item Body Section          | No         | Blog/Content
 18 | Case Study Body Section             | No         | Blog/Content
 19 | Documentation Body Section          | No         | Blog/Content
 20 | Press Release Body Section          | No         | Blog/Content
 21 | Legal Page Body Section             | No         | Legal
 22 | Update Item Body Section            | No         | Blog/Content
 23 | Event Schedule Section              | No         | Events
 24 | Event Item Body Section             | No         | Events
 25 | Course Item Body Section            | No         | Education
 26 | Featured Blog List Header Section   | No         | Blog/Content
 27 | Featured Resources List Header      | No         | Blog/Content
 28 | Featured Case Study List Header     | No         | Blog/Content
 29 | Featured Press List Header          | No         | Blog/Content
 30 | Featured Updates List Header        | No         | Blog/Content
 31 | Featured Events List Header         | No         | Events
 32 | Featured Courses List Header        | No         | Education
 33 | Blog List Section                   | Yes        | Blog/Content
 34 | Resources List Section              | No         | Blog/Content
 35 | Case Study List Section             | No         | Blog/Content
 36 | Press List Section                  | No         | Blog/Content
 37 | Updates List Section                | No         | Blog/Content
 38 | Events List Section                 | No         | Events
 39 | Courses List Section                | No         | Education
 40 | Feature Section                     | Yes        | Universal
 41 | Features List Section               | Yes        | Universal
 42 | Benefits Section                    | Yes        | Universal
 43 | How It Works Section                | Yes        | Universal
 44 | Services Section                    | Yes        | Universal
 45 | About Section                       | Yes        | Universal
 46 | Stats Section                       | Yes        | Universal
 47 | Ecommerce Product Section           | No         | E-commerce
 48 | Timeline Section                    | Yes        | Universal
 49 | Ecommerce Product Header Section    | No         | E-commerce
 50 | Course Item Header Section          | No         | Education
 51 | Ecommerce Products List Section     | No         | E-commerce
 52 | Testimonial Section                 | Yes        | Universal
 53 | Reviews Section                     | No         | E-commerce
 54 | Pricing Section                     | Yes        | Universal
 55 | Pricing Comparison Section          | Yes        | Universal
 56 | CTA Section                         | Yes        | Universal
 57 | CTA Form Section                    | Yes        | Universal
 58 | Newsletter Section                  | Yes        | Universal
 59 | Early Access Section                | Yes        | Universal
 60 | Contact Section                     | Yes        | Universal
 61 | Contact Form Section                | Yes        | Universal
 62 | Application Form Section            | No         | Universal
 63 | Locations Section                   | Yes        | Universal
 64 | Gallery Section                     | Yes        | Universal
 65 | FAQ Section                         | Yes        | Universal
 66 | Team Section                        | Yes        | Universal
 67 | Logo List Section                   | Yes        | Universal
 68 | Award Logos List Section             | No         | Universal
 69 | Customer Logos List Section          | No         | Universal
 70 | Client Logos List Section            | No         | Universal
 71 | Partner Logos List Section           | No         | Universal
 72 | Job Listings Section                | Yes        | Universal
 73 | Footer                              | Yes        | Universal
 74 | Comparison Section                  | Yes        | Universal
```

**Category groups**:
- **Universal** (always available): Navbar, Hero, Header, Feature, CTA, FAQ, Team, Footer, etc.
- **Blog/Content** (for content-heavy sites): Blog Post/Body, Resources, Case Studies, Press
- **E-commerce** (for shops): Product headers/lists, Reviews
- **Agency/Portfolio**: Portfolio/Project items, Gallery
- **Events**: Event headers/bodies, schedules
- **Education**: Course items/lists
- **Legal**: Legal Page Body

---

## 5. 7-Attribute Component Matching

The `page_with_components_stream` API uses a **structured attribute matching system** to select the best component variant for each section. The AI determines ideal attributes, then searches the component library for the closest match.

### The 7 Attributes

| Attribute | Key | Possible Values | Description |
|-----------|-----|----------------|-------------|
| Layout Style | `layout` | `standard`, `off_grid`, `background`, `card` | Visual style from `family-style-2` |
| Text Alignment | `txt_algn` | `left`, `center` | Main text alignment |
| Grid Layout | `grid` | `1_col`, `2_col`, `3_col`, `4_col` | Column structure |
| Heading Position | `head_pos` | `left`, `top`, `right` | Where the heading sits relative to content |
| Asset Count | `ast_cnt` | `1`, `2`, `3`, `5_plus` | Number of images/media |
| Asset Position | `ast_pos` | `left`, `right`, `top`, `bottom` | Where assets are placed |
| Text Block Count | `txt_cnt` | `1`, `2`, `3`, `5_plus` | Number of text blocks |

### Match Quality

The comparison produces one of two results:
- **EXACT MATCH**: All 7 attributes match between AI ideal and actual component
- **EDITED**: Some attributes differ, but within `maxEditDistance` (default: 3)

The `reason` field in the response contains a diagnostic table:
```
category: Hero Header Section
EDITED
Cat     |AI        |Actual    
------------------------------
layout  |off_grid  |off_grid  
txt_algn|left      |left      
grid    |2_col     |2_col     
head_pos|left      |left      
ast_cnt |1         |2          ← MISMATCH
ast_pos |right     |right     
txt_cnt |1         |1         
```

### How `maxEditDistance` Works

`maxEditDistance: 3` means up to 3 attributes can differ between the AI's ideal and the actual component. This provides fallback flexibility when no perfect match exists:
- `maxEditDistance: 0` = EXACT MATCH only
- `maxEditDistance: 1` = 1 attribute can differ
- `maxEditDistance: 3` = up to 3 attributes can differ (default, generous)

---

## 6. Variant Control System

Each assigned component comes with a `variants` array that defines **user-swappable alternatives**. These power the variant controls visible in the wireframe UI.

### Example: Features List Section (`section_layout239`)

```json
{
  "variants": [
    {
      "kind": "Text",
      "items": [
        { "kind": "Left",   "componentSlug": "section_layout249" },
        { "kind": "Center", "componentSlug": "section_layout239" }
      ]
    },
    {
      "kind": "Columns",
      "items": [
        { "kind": "2", "componentSlug": "section_layout632" },
        { "kind": "3", "componentSlug": "section_layout239" },
        { "kind": "4", "componentSlug": "section_layout300" }
      ]
    },
    {
      "kind": "Asset",
      "items": [
        { "kind": "Image", "componentSlug": "section_layout239" },
        { "kind": "Icon",  "componentSlug": "section_layout237" }
      ]
    }
  ]
}
```

### Variant Kinds Observed

| Variant Kind | Options | Sections |
|-------------|---------|----------|
| Text (alignment) | Left, Center | Features List, Team |
| Columns | 2, 3, 4 | Features List, Team |
| Asset | Image, Icon | Features List |
| Asset Placement | Left, Right | Feature, Portfolio List |
| Content | Type 1, Type 2 | Team |
| Asset (media) | Image, Video | Testimonial |
| Slider | Yes, No | Testimonial |
| Style | Normal, Card | Newsletter |
| Asset Style | Default, Expand | CTA, Newsletter |
| Element | Form, Button | CTA, Newsletter |

Each variant option maps to a different component slug, allowing instant swapping without regeneration.

### Full Variant Map (BrightSpark Homepage)

| Section | Component | Variant Controls |
|---------|-----------|-----------------|
| Hero Header | `section_header110` | *(none — hero has no quick variants)* |
| Features List | `section_layout239` | Text: Left/Center · Columns: 2/3/4 · Asset: Image/Icon |
| Feature | `section_layout430` | Asset Placement: Left/Right |
| Team | `section_team1` | Text: Left/Center · Columns: 2/3/4 · Content: Type 1/Type 2 |
| Portfolio List | `section_portfolio15` | Asset Placement: Left/Right |
| Testimonial | `section_testimonial16` | Asset: Image/Video · Slider: Yes/No |
| CTA | `section_cta23` | Asset Style: Default/Expand · Element: Form/Button |
| Newsletter | `section_cta2` | Style: Normal/Card · Asset Style: Default/Expand · Element: Form/Button |

---

## 7. Text Content Generation

### `page-content-1` — AI Text Generation

**Purpose**: Generates contextual text content for every text field in every section component.

**Batching strategy** (4 calls for BrightSpark homepage):
1. **Navbar only** — 8 text fields (links, dropdown items, buttons)
2. **Footer only** — 28 text fields (newsletter, links, social, legal)
3. **Hero only** — 4 text fields (heading, description, 2 buttons)
4. **All remaining sections** — 85+ text fields (Features List, Feature, Team, Portfolio, Testimonial, CTA, Newsletter)

### Input Format (`inputJson`)

```json
{
  "project name": "Cloudify",
  "company description": "BrightSpark is a creative design agency specializing in brand identity, web design, and digital marketing for startups and growing businesses.",
  "all pages": ["Home", "About Us", "Services", "Portfolio", "Project", "Blog", "Blog Post"],
  "page name": "Home",
  "page sections": ["Navbar", "Hero Header Section", "Features List Section", "Feature Section", "Team Section", "Portfolio List Section", "Testimonial Section", "CTA Section", "Newsletter Section", "Footer"],
  "page content": "Section: Hero Header Section\nh1: We build brands that matter\ntext-size-medium: BrightSpark transforms your vision into design...\nbutton: Start\nbutton is-secondary: Learn",
  "sections": [
    {
      "section_id": "section_0",
      "category": "Hero Header Section",
      "outline": "Bold introduction to BrightSpark, its creative focus, and the value offered to startups and growing businesses.",
      "input text fields": [
        {
          "id": 1,
          "css classes": "h1",
          "max length": "8 words",
          "placeholder text": "Medium length hero heading goes here"
        },
        {
          "id": 2,
          "css classes": "text-size-medium",
          "max length": "2 sentences",
          "placeholder text": "placeholder"
        },
        {
          "id": 3,
          "css classes": "button",
          "max length": "1 word",
          "placeholder text": "Button"
        },
        {
          "id": 4,
          "css classes": "button is-secondary",
          "max length": "1 word",
          "placeholder text": "Button"
        }
      ]
    }
  ]
}
```

**Key fields in `inputJson`**:
- `project name` / `company description` — project context
- `all pages` — sitemap structure for cross-page awareness
- `page name` — current page
- `page sections` — ordered list of all sections on page
- `page content` — **ONLY in later batches** — shows previously generated content (progressive context)
- `sections[].outline` — the description from sitemap generation
- `sections[].input text fields[]` — slot definitions from the component JSON:
  - `css classes` — semantic role (h1, h2, h3, text-size-medium, button, tag, etc.)
  - `max length` — constraint (e.g., "8 words", "2 sentences", "1 word")
  - `placeholder text` — default/example text

### Output Format

```json
{
  "sections": [
    {
      "section_id": "section_0",
      "real_text_fields": [
        { "id": 1, "text": "We build brands that matter" },
        { "id": 2, "text": "BrightSpark transforms your vision into design that moves people. From identity to digital presence, we craft the work that makes startups stand out." },
        { "id": 3, "text": "Start" },
        { "id": 4, "text": "Learn" }
      ]
    }
  ]
}
```

### Progressive Context Flow

The batching is intentional — each subsequent batch receives the text generated by previous batches via `page content`:

```
Batch 1: Navbar → generates nav link text
Batch 2: Footer → generates footer text  
Batch 3: Hero   → generates hero text
Batch 4: All remaining sections
         ↑ includes "page content" showing hero text
         So Features List, Feature, etc. can reference the hero's tone/content
```

This ensures **tonal consistency** across the page — later sections know what the hero said.

### Text Field Constraint System

The AI respects constraints from component definitions:

| CSS Class | Semantic Role | Typical Max Length |
|-----------|--------------|-------------------|
| `h1` | Main heading | 8 words |
| `h2` | Section heading | 8 words, 5 words, 15 words |
| `h3` | Sub-heading | 2-8 words |
| `text-size-medium` | Description text | 2 sentences, 10-17 words |
| `text-normal` | Body text | 1 sentence, 14-17 words |
| `text-style-tagline` | Tagline | 1 word |
| `text-size-tiny` | Fine print | 1 sentence, 16 words |
| `button` | Primary button | 1-2 words |
| `button is-secondary` | Secondary button | 1-2 words |
| `button is-link is-icon` | Link button | 1-2 words |
| `tag` | Tag/category | 2 words |
| `text-weight-semibold` | Name/label | 2 words |
| `form_input` | Form placeholder | 3 words |

---

## 8. Cross-Generation Analysis

### 3 Sitemap Generations Compared

| Aspect | FitTrack (Fitness) | GreenLeaf (E-commerce) | BrightSpark (Agency) |
|--------|-------------------|----------------------|---------------------|
| **Layout Styles** | `["standard","card"]` | `["standard","card"]` | `["standard","off_grid","background"]` |
| **Page Tree** | Home, How It Works, Features, Blog>Blog Post, Contact Us | Home, Shop>Product, About Us, Blog>Blog Post, Contact Us | Home, About Us, Services, Portfolio>Project, Blog>Blog Post |
| **Total Pages** | 6 | 7 | 7 |
| **Homepage Sections** | 7 | 8 | 8 |
| **Domain Categories** | 40,41,42,43 (features/benefits) | 47,49,51,53 (ecommerce/reviews) | 5,7,8,64,66 (portfolio/gallery/team) |
| **Special Pages** | How It Works, Features | Shop, Product | Services, Portfolio, Project |

### AI Decision Patterns

1. **Layout style is domain-aware**: Creative/agency projects get expressive styles (`off_grid`, `background`); utility/commerce projects get structured styles (`card`, `standard`).

2. **Category selection is contextual**: The AI doesn't randomly pick categories. A fitness app gets Benefits + How It Works; an e-commerce store gets Product + Reviews; an agency gets Portfolio + Team + Gallery.

3. **Page hierarchy reflects domain**: E-commerce creates Shop>Product; agency creates Portfolio>Project; content sites create Blog>Blog Post. The `>` parent-child relationship matches real-world IA patterns.

4. **Homepage is richer**: Homepage typically has 7-8 sections vs 4-6 for child pages.

5. **Navbar/Footer are deterministic**: Always assigned `navbar3_component` and `footer9_component` on the client side — not AI-selected.

6. **Blog pages are universal**: Every generation includes Blog>Blog Post, using categories 10, 16, 26 (Blog Post Header, Body, Featured Blog List).

---

## 9. API Reference

### AI Completion Endpoint

```
POST https://apis.relume.io/llm/v1/infer?member_token=rl-auth-{token}
Content-Type: application/json

{
  "prompt": "<completion_type>",
  "promptContext": { ... }
}
```

| Completion Type | Phase | Purpose | Fires |
|----------------|-------|---------|-------|
| `family-style-2` | Sitemap | Layout style classification | Once per generation |
| `brief-to-homepage-3` | Sitemap | Page tree + homepage sections | Once per generation |
| `page-completion-3` | Sitemap | Child page sections | Once per child page (parallel) |
| `page-content-1` | Wireframe | Text content for sections | 4 batched calls per page |
| `section-text-count-1` | Wireframe | (observed but not captured in detail) | Unknown |

### REST API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/page_with_components_stream` | POST | Variant selection (AI-powered) |
| `/v1/components?filter_blocks_category_ai={cat}` | GET | List variants for category |
| `/v1/components?filter_component_slug={slug}` | GET | Get component metadata by slug |
| `/v1/slot_type/{STID}` | GET | Get slot type definition |
| `/v1/blocks_categories/consistent` | GET | Full category registry |
| `/v1/ae` | POST | Analytics events |

### CDN

```
GET https://components-public.relume.io/scrambled/{slug}.json
```

Returns full component structure (HTML, CSS, slot definitions, interactions).

---

## 10. Implementation Notes for Scytle

### What We Can Replicate

1. **74-category constraint CSV**: We can mirror this approach — define our section categories and send as constraint to the AI. We should start with the ~31 UI-visible categories and expand.

2. **Two-part homepage response**: Generate page tree AND homepage sections in a single AI call. This is efficient — one round-trip for the entire site IA + homepage layout.

3. **Parallelized child pages**: Fire one AI call per child page and process in parallel. This is already well-suited to our streaming architecture.

4. **7-attribute matching**: We can tag our design components with the same 7 attributes (layout, txt_algn, grid, head_pos, ast_cnt, ast_pos, txt_cnt) and use similarity matching to select variants.

5. **Progressive text generation**: Generate hero text first, then include it as context for remaining sections. This ensures tonal consistency.

6. **Variant controls**: Each component can define swappable alternatives (columns, alignment, asset type), allowing instant variant switching without AI regeneration.

### What's Different for Scytle

1. **We use Vertex AI (Gemini)** instead of whatever model Relume uses. Our prompts need to be adapted for Gemini's strengths.

2. **Our block system is nested trees**, not flat component slugs. The mapping from "selected variant" → "block tree" is different from Relume's component JSON approach.

3. **We don't need Webflow compatibility**. Relume generates Webflow-compatible HTML/CSS classes. We generate React components with Tailwind.

4. **Our section-to-variant mapping could be simpler** since we have fewer variants per category (5 hero presets vs Relume's 100+ header variants).

### Priority Implementation Order

1. **Sitemap generation**: Implement `family-style-2` equivalent (layout classification) and `brief-to-homepage-3` equivalent (page tree + homepage)
2. **Category CSV constraint**: Build the constraint system so AI picks from our registered categories
3. **Section description generation**: Each section gets a brief description that feeds into wireframe content generation
4. **Variant selection**: Map categories to our V2 layout presets using attribute-based matching
5. **Text content generation**: Implement `page-content-1` equivalent with our component text slots

### Prompt Engineering Insights

- The `sectionCategoryCsv` is the KEY constraint mechanism — it tells the AI exactly what's available
- Section descriptions should be 1-2 sentences of context for downstream content generation
- Page tree format `Parent > Child` is elegant and LLM-friendly
- CSV format `PageName|categoryId|SectionCategoryName|Description` is easily parseable
- The AI can handle 7-8+ sections per page in the homepage response
- Child pages are simpler (4-6 sections typical)
- Including `homepageCsv` in child page generation provides cross-page consistency

---

## Appendix A: Full `page-content-1` Input Example (Hero Section)

```json
{
  "project name": "Cloudify",
  "company description": "BrightSpark is a creative design agency specializing in brand identity, web design, and digital marketing for startups and growing businesses.",
  "all pages": ["Home", "About Us", "Services", "Portfolio", "Project", "Blog", "Blog Post"],
  "page name": "Home",
  "page sections": ["Navbar", "Hero Header Section", "Features List Section", "Feature Section", "Team Section", "Portfolio List Section", "Testimonial Section", "CTA Section", "Newsletter Section", "Footer"],
  "sections": [
    {
      "section_id": "section_0",
      "category": "Hero Header Section",
      "outline": "Bold introduction to BrightSpark, its creative focus, and the value offered to startups and growing businesses.",
      "input text fields": [
        {"id": 1, "css classes": "h1", "max length": "8 words", "placeholder text": "Medium length hero heading goes here"},
        {"id": 2, "css classes": "text-size-medium", "max length": "2 sentences", "placeholder text": "placeholder"},
        {"id": 3, "css classes": "button", "max length": "1 word", "placeholder text": "Button"},
        {"id": 4, "css classes": "button is-secondary", "max length": "1 word", "placeholder text": "Button"}
      ]
    }
  ]
}
```

**Response**:
```json
{
  "sections": [
    {
      "section_id": "section_0",
      "real_text_fields": [
        {"id": 1, "text": "We build brands that matter"},
        {"id": 2, "text": "BrightSpark transforms your vision into design that moves people. From identity to digital presence, we craft the work that makes startups stand out."},
        {"id": 3, "text": "Start"},
        {"id": 4, "text": "Learn"}
      ]
    }
  ]
}
```

## Appendix B: Full Variant Selection Output (BrightSpark Homepage)

```json
[
  {
    "sectionId": "Hero Header Section1",
    "slug": "section_header110",
    "name": "Header 110",
    "layoutStyle": "off_grid",
    "matchQuality": "EDITED",
    "attributes": {
      "layout": {"ai": "off_grid", "actual": "off_grid", "match": true},
      "txt_algn": {"ai": "left", "actual": "left", "match": true},
      "grid": {"ai": "2_col", "actual": "2_col", "match": true},
      "head_pos": {"ai": "left", "actual": "left", "match": true},
      "ast_cnt": {"ai": "1", "actual": "2", "match": false},
      "ast_pos": {"ai": "right", "actual": "right", "match": true},
      "txt_cnt": {"ai": "1", "actual": "1", "match": true}
    }
  },
  {
    "sectionId": "Features List Section2",
    "slug": "section_layout239",
    "name": "Layout 239",
    "layoutStyle": "standard",
    "matchQuality": "EDITED",
    "variants": [
      {"kind": "Text", "options": ["Left → section_layout249", "Center → section_layout239"]},
      {"kind": "Columns", "options": ["2 → section_layout632", "3 → section_layout239", "4 → section_layout300"]},
      {"kind": "Asset", "options": ["Image → section_layout239", "Icon → section_layout237"]}
    ]
  },
  {
    "sectionId": "Feature Section3",
    "slug": "section_layout430",
    "name": "Layout 430",
    "layoutStyle": "off_grid",
    "matchQuality": "EXACT MATCH",
    "variants": [
      {"kind": "Asset Placement", "options": ["Left → section_layout430", "Right → section_layout431"]}
    ]
  },
  {
    "sectionId": "Team Section4",
    "slug": "section_team1",
    "name": "Team 1",
    "layoutStyle": "standard",
    "matchQuality": "EDITED",
    "variants": [
      {"kind": "Text", "options": ["Left → section_team3", "Center → section_team1"]},
      {"kind": "Columns", "options": ["2 → section_team11", "3 → section_team5", "4 → section_team1"]},
      {"kind": "Content", "options": ["Type 1 → section_team1", "Type 2 → section_team2"]}
    ]
  },
  {
    "sectionId": "Portfolio List Section5",
    "slug": "section_portfolio15",
    "name": "Portfolio 15",
    "layoutStyle": "standard",
    "matchQuality": "EDITED",
    "variants": [
      {"kind": "Asset Placement", "options": ["Left → section_portfolio16", "Right → section_portfolio15"]}
    ]
  },
  {
    "sectionId": "Testimonial Section6",
    "slug": "section_testimonial16",
    "name": "Testimonial 16",
    "layoutStyle": "standard",
    "matchQuality": "EDITED",
    "variants": [
      {"kind": "Asset", "options": ["Image → section_testimonial15", "Video → section_testimonial16"]},
      {"kind": "Slider", "options": ["Yes → section_testimonial16", "No → section_testimonial14"]}
    ]
  },
  {
    "sectionId": "CTA Section7",
    "slug": "section_cta23",
    "name": "CTA 23",
    "layoutStyle": "standard",
    "matchQuality": "EXACT MATCH",
    "variants": [
      {"kind": "Asset Style", "options": ["Default → section_cta23", "Expand → section_cta63"]},
      {"kind": "Element", "options": ["Form → section_cta24", "Button → section_cta23"]}
    ]
  },
  {
    "sectionId": "Newsletter Section8",
    "slug": "section_cta2",
    "name": "CTA 2",
    "layoutStyle": "standard",
    "matchQuality": "EDITED",
    "variants": [
      {"kind": "Style", "options": ["Normal → section_cta2", "Card → section_cta40"]},
      {"kind": "Asset Style", "options": ["Default → section_cta2", "Expand → section_cta60"]},
      {"kind": "Element", "options": ["Form → section_cta2", "Button → section_cta1"]}
    ]
  }
]
```
