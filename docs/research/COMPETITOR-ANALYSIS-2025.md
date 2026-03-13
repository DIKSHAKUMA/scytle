# Competitor Analysis — AI Design Tools (2025)

> **Research Date**: June 2025  
> **Tools Analyzed**: Google Stitch, Banani.co, FlutterFlow Designer  
> **Test Prompt**: SaaS landing page for an AI website builder called "Scytle" — dark theme, purple accents, hero + features + pricing + testimonials + footer  
> **Purpose**: Inform Scytle.ai Phase 2 implementation (C1 Parser → C2 AI Generation → C8 Export)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Google Stitch](#1-google-stitch)
3. [Banani.co](#2-bananico)
4. [FlutterFlow Designer](#3-flutterflow-designer)
5. [Feature Comparison Matrix](#feature-comparison-matrix)
6. [Key Takeaways for Scytle](#key-takeaways-for-scytle)
7. [Implementation Recommendations](#implementation-recommendations)

---

## Executive Summary

All three tools follow a **prompt → generate → iterate** loop, but differ significantly in output format, generation approach, and workspace UX:

| Dimension | Google Stitch | Banani.co | FlutterFlow Designer |
|-----------|---------------|-----------|----------------------|
| **Output Format** | Self-contained HTML + Tailwind CSS | Rendered UI components (proprietary) | Flutter widget tree (proprietary) |
| **Multi-Screen** | Single screen per generation | 3 simultaneous variations | 4 cohesive screens from 1 prompt |
| **Theme System** | Inline styles via Tailwind | Auto-generated named theme with tokens | Editable theme panel |
| **Code Export** | HTML/CSS to clipboard, .zip, Figma, MCP | Figma upload, code view | Share dialog (to be confirmed) |
| **Speed** | ~70 seconds (compose + shade) | ~15-20 seconds (3 variations) | ~5 seconds (4 screens) |
| **Credit System** | 400 daily / 15 redesign | 20 credits | Unlimited (Designer tier) |

---

## 1. Google Stitch

**URL**: `stitch.withgoogle.com`  
**Tech Stack**: Web app, Gemini 3.0 Flash model, HTML/Tailwind output  

### Dashboard & Entry

- Clean splash with two modes: **Web** and **App**
- Prompt input at center: "What would you like to create?"
- Quick-start templates: design system, e-commerce, portfolio, etc.
- Left sidebar: project list with timestamps, search
- Settings: 400 daily credits, 15 daily redesign credits, API key with MCP docs

### Generation Flow

**Stages observed (timed)**:
1. "Preparing the tools…" (instant)
2. "Composing the screen… Estimated time, 30 seconds"
3. "Shading… Estimated time, 40 seconds"
4. Complete — total ~70 seconds

**Input**: Single text prompt with no configuration options (no device/model/variation selectors)  
**Output**: One full-length landing page (1280 × 3242px for our test)

### Generated Output Quality

The test prompt produced a dark-themed landing page with:
- **Navbar**: "Scytle" logo, Features/Testimonials/Pricing/Docs links, Log In, Get Started CTA
- **Hero**: "NOW IN PUBLIC BETA" badge, "Build the Future of the Web **with AI**" headline, purple gradient CTA, social proof section with avatar stack
- **Dashboard mockup**: Embedded preview image showing the product
- **Features section**: Cards with icons
- **Pricing**: 3 tiers
- **Testimonials**: User quotes
- **Footer**: Full link layout

### Workspace & Editing

- **Chat sidebar** (left 1/3): Conversational AI history, suggested follow-ups ("Can you add an FAQ section?")
- **Canvas** (right 2/3): Rendered page preview
- **Floating toolbar** on selected screen: Generate, Modify, Preview, More
- **Bottom toolbar**: +, 3x variations, camera, model selector (Gemini 3.0 Flash), canvas tools (select, pen, paint, shapes, hand, search)
- **"More" menu**: View code (⇧C), Copy to Figma, Export (⌘⇧E), Download (⇧D)

### Code Output (Critical Finding)

Stitch generates **fully self-contained HTML** files:
```html
<html>
  <!-- Google Fonts: Space Grotesk, Noto Sans -->
  <!-- Material Icons CDN -->
  <!-- Tailwind CSS via CDN with container-queries plugin -->
  <body class="bg-stone-50 text-stone-900">
    <!-- Semantic Tailwind utility classes throughout -->
  </body>
</html>
```

Key characteristics:
- Single HTML file, no build step needed
- Tailwind CSS via CDN (`cdn.tailwindcss.com`) with container-queries plugin
- Google Fonts loaded via `<link>`
- Material Icons via CDN
- Semantic color classes: `bg-stone-50`, `text-stone-900`, `border-stone-200`
- Responsive layout with Tailwind breakpoints

### Export Options

Opens dialog with 6 export targets:
1. **AI Studio** (PREVIEW) — send to Google AI Studio
2. **Figma** — direct Figma integration
3. **Jules** — (Google's AI coding agent)
4. **`.zip`** — Download as zip archive
5. **Code to clipboard** — Copy full HTML
6. **MCP** — API/MCP integration (docs at `/docs/mcp/setup`)

### API & Integration

- **API key creation** in Settings
- **MCP documentation** available at `/docs/mcp/setup`
- Daily credit system: 400 generation / 15 redesign

---

## 2. Banani.co

**URL**: `app.banani.co`  
**Tech Stack**: React web app with tRPC-style API, proprietary renderer  

### Dashboard & Entry

- Central prompt: "What should we design?"
- **Quick-start buttons**: From Image, From Figma, Wireframe, Landing page, Mobile app
- **Left sidebar**: Home, Projects (My Projects / Team Projects), MCP section, Team section, Explore (Templates, Customer Showcase)
- Credit display: "20 credits left"
- User profile with team management

### Generation Configuration (Key Differentiator)

Clicking "Auto" dropdown reveals settings:
- **Screen size**: Auto ✓ / Desktop / Mobile
- **Model**: Auto (no model choice exposed)
- **Theme**: "New theme" (auto-generates from prompt context)
- **Variations**: 3 (generates multiple options simultaneously!)

### Generation Flow

**Stages observed**:
1. "Collecting references" (~5s)
2. "Designing layout" (~5-8s)
3. "Adding final touches" (~3-5s)
4. Complete — total ~15-20 seconds for 3 variations

**API calls in console** (tRPC pattern):
- `generation.detectGenType` — classifies prompt intent
- `flow.createFlow` — creates project/flow
- `screens.getActiveStructure` — fetches structure for each screen (called 3×)

### Auto-Generated Theme (Critical Finding)

Banani auto-generates a **named semantic theme** from the prompt:

**"Scytle Night" theme**:
| Token | Value |
|-------|-------|
| Background | `#0B0B10` |
| Border | `#ffffff2d` (white 18% opacity) |
| Primary | `#7C4DFF` (purple — matched "purple accents"!) |
| Secondary | `#1B1330` |
| Card | `#0F0D14` |
| Font | Inter |
| Roundness | Small: 4px, Medium: 6px, Large: 8px, Very Large: 12px |

The theme was contextually extracted from the prompt — dark background per "dark theme", purple primary per "purple accents". This is a standout feature.

### Generated Output Quality

**3 variations produced simultaneously**:

**Screen 1** — "Scytle Landing Page":
- Hero: "Build your dream website with AI in seconds"
- 6 feature cards: AI Generation, Instant Deployment, Smart SEO Analytics, Responsive Design, Integrated CMS, Enterprise Security
- Pricing: Hobby $0, Pro $29 ("Most Popular"), Agency $99
- Testimonials: 3 people with quotes, names, titles
- Footer with Product/Company links

**Screen 2** — "Scytle Dark" variant:
- Hero: "Build stunning websites with AI."
- Dashboard mockup embedded
- Different layout arrangement

**Screen 3** — Alternative:
- Hero: "Build websites at the speed of thought."
- "Your Projects" dashboard preview
- 3 feature cards with different arrangement

### Workspace & Editing

- **Canvas**: Multi-screen view with frame labels
- **Floating toolbar per screen**: Device selector, ✦ Variant dropdown, copy, upload to Figma, From Figma, `<>` code, 👍👎
- **Version history**: Timestamped versions (e.g., "10:34 am (active)")
- **Bottom chat**: Iterative prompt input for modifications
- Auto-naming: Project auto-named "Scytle Landing Page", screens named semantically

### DOM Structure (Component-Based)

Full DOM read of Screen 1 revealed rendered HTML/CSS components:
- Semantic section structure: `.navbar`, hero, features grid, pricing cards, testimonials, footer
- Components are rendered as real DOM elements (not images/canvas)
- Font: Inter throughout
- Purple accent consistently applied via theme tokens

### Export Options

- **Figma upload**: Direct push to Figma
- **From Figma**: Import from Figma designs
- **Code view**: `<>` button for generated code inspection
- **Copy**: Quick copy of screen
- **Feedback**: 👍👎 per screen

---

## 3. FlutterFlow Designer

**URL**: `designer.flutterflow.io`  
**Tech Stack**: Flutter Web (HTML renderer), Dart/Flutter widget output  

### Dashboard & Entry

- Central prompt: "What do you want to design?"
- **Device icons**: Image upload, Mobile, Desktop selectors below prompt
- **Quick-start suggestions**: Professional Invoice Generator, Client CRM for Agencies, Rental Property Management App, stock tracking (Apple), travel booking (Airbnb), Trip itinerary planner, music streaming (Spotify)
- **Left sidebar**: "My Designs" section with project list, timestamps, search
- User info at bottom with role ("Designer")

### Generation Flow

**Speed**: ~5 seconds — dramatically faster than competitors

**Multi-screen intelligence**: From a single landing page prompt, generated **4 cohesive screens**:
1. Landing Page (scrollable, all sections)
2. Features Detail (dedicated features page)
3. Pricing (full pricing page with comparison)
4. Login (auth screen)

This is the only tool that **inferred and created additional necessary screens** beyond what was explicitly requested.

### Generated Output Quality

**Frame 1 — Landing Page**:
- Navbar: "Scytle" | Features | Pricing | green "Get Started" button
- Hero: "Build your dream website in seconds, not weeks."
- Subtext: "Scytle uses advanced generative AI to turn your ideas into stunning, high-performance websites. No code, no stress, just pure creativity."
- CTAs: "Start Building Free" (purple) + "View Demo"
- Dashboard mockup: "Add New Post" with media editor
- Features: "Everything you need to scale" — 3 cards (AI Layout Engine, Lightning Fast, Smart Analytics)
- Pricing: "Simple, transparent plans" — Starter, $19, $49 tiers
- Testimonials: "Loved by creators worldwide"
- Footer

**Frame 2 — Features Detail**:
- Cosmic hero: "The Engine Behind Your Vision"
- "GPT-4o Optimized" badge
- Technical Specifications:
  - Neural Layouts — "Generates responsive flexbox and grid systems" — +45% Speed
  - Semantic Theming — "Automatically extracts brand colors and typography"
  - Clean Export — "Zero-bloat React/Next.js code generation with Tail..." — 0.2s Load
  - Edge Hosting — "Global CDN deployment with automatic image op..." — 99.9% Uptime
- Architectural Depth section
- Autonomous SEO, Dynamic Data Binding, Predictive Prefetching details
- "Build Speed Comparison/seconds" chart

**Frame 3 — Pricing**:
- Navbar: "ScytleFeatures" | Pricing | Login | Get Started
- Badge: "Flexible plans for every stage"
- "Scale your vision with Scytle"
- Monthly / Yearly toggle with "Save 20%"
- Three tiers: Starter $0, Pro $19 (POPULAR), Enterprise $49
- Feature comparison matrix with green checkmarks
- FAQ section at bottom
- Footer

**Frame 4 — Login**:
- "Welcome back to Scytle" / "Log in to manage your AI-powered websites"
- Google & Apple auth buttons
- Email + Password form
- "Sign in to Dashboard" purple CTA
- "Don't have an account? Create Account"
- "New: Scytle v2.0 is here" product announcement
- Privacy Policy / Terms of Service / Help Center links

### Workspace & Editing

- **Left panel tabs**: 
  - **Frames**: Lists all 4 frames with checkboxes
  - **Theme**: Theme editor (not explored in detail)
- **Layers tree**: Shows full Flutter widget tree (76 layers for this project!)
  - `scaffold → column → container → row → row → container → IconValue, text → row → text, text, button → column...`
- **Right panel** — Properties for selected node:
  - **Box Layout**: Vertical Layout (4 alignment icons), Horizontal Layout (4 options)
  - **Spacing**: Vertical Size, Gap (e.g., 80)
  - **Behavior**: Scroll toggle (True/False)
  - **Constraints**: Expandable section
  - **Fill**: Expandable section
- **Bottom**: Context-aware prompt — "Describe changes to Landing Page / Column..." with breadcrumb navigation (Landing Page > Column)
- **Top bar**: Share Feedback, Undo/Redo, Settings, Zoom (14-64%), **Share** button (blue)

### Key Differentiators

1. **Widget tree editing**: Full Flutter widget tree exposed in Layers panel — `scaffold`, `column`, `container`, `row`, `text`, `button` etc. Users can select any node and see/edit its properties
2. **Context-aware editing**: Bottom prompt changes based on selection — "Describe changes to Landing Page / Column..." — understands the node path
3. **Multi-screen inference**: Automatically creates related screens (Features, Pricing, Login) not explicitly requested
4. **Flutter output**: Generates actual Flutter widgets, not HTML — different deployment target than web-first tools
5. **Fastest generation**: ~5 seconds vs 15-20s (Banani) vs 70s (Stitch)

---

## Feature Comparison Matrix

| Feature | Google Stitch | Banani.co | FlutterFlow Designer |
|---------|:------------:|:---------:|:-------------------:|
| **Generation** | | | |
| Speed | ~70s | ~15-20s | ~5s |
| Multi-screen per prompt | ✗ (1 screen) | ✗ (3 variations of 1) | ✓ (4 distinct screens) |
| Variation generation | Via 3x button | 3 simultaneous | ✗ (single best result) |
| Auto theme from prompt | ✗ | ✓ (named + tokens) | ✓ (embedded in output) |
| Suggested follow-ups | ✓ | ✗ | ✗ |
| **Workspace** | | | |
| Chat sidebar | ✓ (conversational history) | Minimal (bottom bar) | ✓ (bottom context-aware) |
| Layer/tree panel | ✗ | ✗ | ✓ (76-layer Flutter tree) |
| Properties panel | ✗ | ✗ | ✓ (Box Layout, Spacing, Fill) |
| Canvas tools | Select, pen, paint, shapes, hand | Zoom, device switcher | Zoom, frame selection |
| Version history | ✗ (visible) | ✓ (timestamped) | ✗ (visible) |
| **Output & Export** | | | |
| HTML/CSS export | ✓ (self-contained) | Via code view | ✗ (Flutter widgets) |
| Figma integration | ✓ (Copy to Figma) | ✓ (bidirectional) | TBD |
| Zip download | ✓ | TBD | TBD |
| Code clipboard | ✓ | ✓ | TBD |
| MCP/API support | ✓ (with docs) | ✓ (left sidebar) | TBD |
| **Input Methods** | | | |
| Text prompt | ✓ | ✓ | ✓ |
| Image upload | ✗ (visible) | ✓ ("From Image") | ✓ (image icon) |
| Figma import | ✗ | ✓ ("From Figma") | ✗ (visible) |
| Wireframe mode | ✗ | ✓ | ✗ |
| Device selection | Web/App modes | Auto/Desktop/Mobile | Mobile/Desktop icons |
| **Business Model** | | | |
| Credit system | 400/day + 15 redesign | Credits (20 observed) | Unlimited (tier-based) |

---

## Key Takeaways for Scytle

### What Works Well (adopt)

1. **Banani's auto-theme generation**: Extracting theme tokens (colors, font, border-radius) from prompt context is powerful. The "Scytle Night" theme with `#7C4DFF` primary matching "purple accents" is impressive. → **Scytle should auto-generate style guide tokens from the prompt.**

2. **FlutterFlow's multi-screen inference**: Creating a Login page and Features Detail page from a landing page prompt shows deep understanding. → **Scytle should generate complementary pages (e.g., login, pricing detail) as part of the sitemap phase.**

3. **Stitch's code output format**: Self-contained HTML with Tailwind CSS via CDN is immediately useful. Zero build step, just open in browser. → **Scytle's export should produce clean, self-contained HTML/Tailwind files.**

4. **Context-aware editing prompts**: FlutterFlow's breadcrumb-based editing ("Describe changes to Landing Page / Column...") is elegant. → **Scytle's chat should understand current selection context.**

5. **Variation generation**: Banani's 3 simultaneous variations let users pick the best direction fast. → **Scytle should offer 2-3 design variations per section.**

### What's Missing (opportunity)

1. **No tool offers sitemap-first workflow**: All go straight from prompt to visual design. Scytle's sitemap → wireframe → design pipeline is differentiated.

2. **Limited structural editing**: Stitch and Banani have no layer tree or property editors. Only FlutterFlow has a widget tree. → **Scytle's block-based canvas with hoverable/selectable containers (V2 architecture) is competitive with FlutterFlow.**

3. **No design system integration**: While Banani generates themes, none integrate with a broader design system or allow users to bring their own tokens. → **Scytle's style guide system is a differentiator.**

4. **No collaborative features visible**: None showed real-time collaboration during testing. → **Potential future differentiator.**

5. **Export limitations**: Stitch exports HTML but not React components. Banani and FlutterFlow have unclear code export. → **Scytle should export clean React/Next.js components, not just HTML.**

### Competitive Positioning

```
Stitch:  Prompt → 1 Screen (HTML) → Chat iterate → Export
Banani:  Prompt → 3 Variations → Pick best → Iterate
FF:      Prompt → 4 Screens (Flutter) → Widget tree edit → Share
Scytle:  Prompt → Sitemap → Wireframe → Design → Code (React/Next.js)
```

Scytle's multi-stage pipeline is unique — it's the only tool that gives users structural control before visual design. This is especially valuable for professional web designers and agencies who need predictable, editable output.

---

## Implementation Recommendations

### Phase C1 — HTML Parser
- Study Stitch's output HTML structure as a reference for what "good" AI-generated HTML looks like
- Self-contained HTML with Tailwind CDN is the gold standard for previews
- Semantic section structure (`<section>`, `<nav>`, `<footer>`) should be enforced

### Phase C2 — AI Generation
- **Auto-theme extraction**: Like Banani, parse prompt for color/font/style hints and generate a `StyleGuide` before generating sections
- **Section-level generation**: Generate each section independently (hero, features, pricing, etc.) rather than the whole page at once — enables per-section variations
- **Variation support**: Generate 2-3 variations per section, similar to Banani's approach but at the section level rather than full-page
- **Multi-page awareness**: Like FlutterFlow, consider generating complementary pages (but via the sitemap phase, not inline)

### Phase C8 — Export
- **HTML export**: Follow Stitch's model — self-contained HTML with Tailwind CDN, Google Fonts, ready to open in browser
- **React export**: Go beyond all competitors — export as React/Next.js components with proper imports
- **Figma export**: All competitors support this — should be on the roadmap
- **MCP/API**: Both Stitch and Banani offer MCP — consider for programmatic access

### UX Patterns to Adopt
- **Banani's "Auto" settings dropdown**: Expose generation config (screen size, model, variations) in a compact dropdown
- **FlutterFlow's context-aware prompts**: Chat input should reflect current selection
- **Stitch's suggested follow-ups**: Proactive AI suggestions after generation
- **Banani's version history**: Timestamped versions for easy rollback
- **FlutterFlow's properties panel**: Node-level property editing in the right panel (Scytle already has this in V2 architecture)

---

*This research was conducted by testing actual generation flows with identical prompts across all three tools. All observations are based on the free/trial tiers available as of June 2025.*
