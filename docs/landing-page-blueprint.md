# Scytle Landing Page — Complete Content Blueprint

> **Status:** MVP phase — no testimonials, no pricing
> **Stack:** Next.js 16, React 19, Tailwind CSS 4, Bricolage Grotesque + Inter
> **Accent:** Warm coral `oklch(0.65 0.18 35)` / `#D4643A`

---

## Page Structure Overview

```
┌──────────────────────────────────────────────┐
│  1. NAVBAR (existing — landing-header.tsx)    │
├──────────────────────────────────────────────┤
│  2. HERO                                     │
│     Headline + Sub + 2 CTAs + App Mockup     │
├──────────────────────────────────────────────┤
│  3. LOGO STRIP                               │
│     Social proof — grayscale logos + stat     │
├──────────────────────────────────────────────┤
│  4. HOW IT WORKS                             │
│     4-step pipeline with connectors          │
├──────────────────────────────────────────────┤
│  5. FEATURES (3 narrative sections)          │
│     5a. AI Research                          │
│     5b. Visual Sitemap & Wireframes          │
│     5c. AI Code Generation                   │
├──────────────────────────────────────────────┤
│  6. FINAL CTA                                │
│     Full-width banner                        │
├──────────────────────────────────────────────┤
│  7. FOOTER                                   │
│     Logo + links + copyright                 │
└──────────────────────────────────────────────┘
```

---

## Section 1 — Navbar

**Component:** `landing-header.tsx` (already built)

- Fixed position, scroll-triggered morph: transparent full-width → floating pill `max-w-3xl rounded-full backdrop-blur`
- Logo shrinks on scroll
- Desktop: centred nav links (Features / How it works) + auth actions
- Mobile: hamburger → slide-down drawer
- Auth states: loading → authenticated (Dashboard + avatar dropdown) → unauthenticated (Log in + Get Started)

**No changes needed — keep as-is.**

---

## Section 2 — Hero

**Layout:** Centred text, product mockup below (Vercel/Linear pattern)

**Background:**
- Clean warm off-white (`--background`)
- Subtle dot-grid pattern: `radial-gradient(oklch(0.75 0.02 80) 1px, transparent 1px)` at 28px spacing
- Radial coral bloom from top-centre: `radial-gradient(ellipse at 50% 0%, oklch(0.65 0.18 35 / 0.12) ...)` — 900×600px

### Content

**Label pill:**
```
· AI-powered product builder
```
- Tiny dot (coral) + text
- `text-xs font-medium tracking-wide text-muted-foreground`
- `rounded-full border border-border/60 bg-background/80 backdrop-blur-sm`

**Headline (H1):**
```
From idea to live —
AI that thinks,
then builds.
```
- `font-display` (Bricolage Grotesque)
- `text-[clamp(2.75rem,7vw,5rem)]` — scales 44px → 80px
- `font-bold leading-[1.05] tracking-tight`
- "then builds." in `text-accent` (coral)

**Subheadline:**
```
Scytle researches your market, plans your product,
and ships production-ready Next.js — so you can
focus on what matters.
```
- `text-lg text-muted-foreground max-w-xl leading-relaxed`

**CTAs:**
| Button         | Style                                                        |
| -------------- | ------------------------------------------------------------ |
| Get Started →  | `bg-accent text-white rounded-full h-12 px-7 shadow-lg shadow-accent/25` + hover lift |
| Watch Demo     | `variant="ghost" rounded-full border border-border/60` + Play icon |

**Product Mockup (below CTAs):**
- Browser chrome window: traffic lights + URL bar `app.scytle.io / my-project`
- Left sidebar: project nav (Research ✓, Sitemap ✓, Design active, Canvas pending) + design tokens preview (colour swatches, typography)
- Main area: 3 pipeline cards — Sitemap complete, AI designing (72%), Code in queue
- Bottom fade gradient → background colour (creates "continues below" illusion)
- Wrapped in `rounded-2xl border shadow-2xl` with coral glow behind

**Animations:**
- Staggered CSS entrance using existing `fade-in` and `slide-up` keyframes from `globals.css`
- Label: `animation: fade-in 0.5s ease-out both`
- H1: `animation: slide-up 0.65s ease-out 0.1s both`
- Sub: `animation: slide-up 0.65s ease-out 0.2s both`
- CTAs: `animation: slide-up 0.65s ease-out 0.3s both`
- Mockup: `animation: slide-up 0.8s ease-out 0.4s both`

---

## Section 3 — Logo Strip

**Purpose:** Instant credibility, right after hero before any feature explanation.

**Layout:** Full-width, centred, light bg (`bg-secondary/30` or `bg-muted/30`)

### Content

**Eyebrow text (optional):**
```
Trusted by builders and teams
```
- `text-xs uppercase tracking-widest text-muted-foreground`

**Logos:**
- 5–7 grayscale/muted logos of well-known tools or companies
- Since we're MVP, use placeholder-style tool logos relevant to our audience:
  - Vercel, Next.js, Tailwind, React, Figma, Stripe, Supabase
- `opacity-40 grayscale hover:opacity-70 hover:grayscale-0 transition-all`
- Horizontal scroll on mobile, flex-wrap on desktop

**Stat line:**
```
2,000+ projects built by indie makers and teams
```
- `text-sm text-muted-foreground`

**Spacing:** `py-12 lg:py-16`

---

## Section 4 — How It Works

**Purpose:** Show Scytle's unique 4-step AI pipeline — the core differentiator.

**Layout:** Section label → heading → 4 horizontal steps with connectors

**Background:** Clean white (`bg-background`)

### Content

**Section label:**
```
HOW IT WORKS
```
- `text-xs font-semibold text-accent uppercase tracking-[0.2em]`

**Heading:**
```
From one sentence to a live product
```
- `font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight`

**Subheading:**
```
Describe what you want to build. Scytle handles the rest.
```
- `text-lg text-muted-foreground max-w-2xl`

### 4 Steps

| # | Icon | Title | Description |
|---|------|-------|-------------|
| 01 | Sparkles (violet) | Research | AI analyses competitors, finds market gaps, and validates your idea with real data. |
| 02 | Layers (blue) | Plan | Generates a visual sitemap with page hierarchy, user flows, and content structure. |
| 03 | Zap (coral/accent) | Design | Creates a full design system — colours, typography, components — tailored to your brand. |
| 04 | Code (emerald) | Ship | Outputs production-ready Next.js with TypeScript and Tailwind. One-click deploy to Vercel. |

**Visual treatment per step:**
- Large step number in `text-accent/15 text-6xl font-display font-bold` (watermark style)
- Icon in a coloured rounded container
- Title: `text-lg font-semibold`
- Description: `text-sm text-muted-foreground`

**Connectors:**
- Desktop (`lg`+): horizontal dashed line or chevrons between steps
- Mobile: vertical stack, no connectors needed

**Layout:**
- Desktop: `grid lg:grid-cols-4 gap-8`
- Each step: text-centre, vertically stacked (number → icon → title → description)

**Spacing:** `py-24 lg:py-32`

---

## Section 5 — Features (3 Narrative Sections)

**Purpose:** Deep-dive into the 3 core capabilities, presented as full-width alternating sections (not small cards).

**Pattern:** Text on one side + product UI visual on the other. Alternating left/right.

### Feature 5a — AI Market Research

**Layout:** Text left, visual right

**Section label:**
```
INTELLIGENT RESEARCH
```

**Heading:**
```
Know your market before you build
```
- `font-display text-3xl lg:text-4xl font-bold`

**Description:**
```
Scytle scans competitors, analyses their features,
and identifies gaps in the market — so you build
something people actually want, not another clone.
```

**Bullet points (3):**
- Competitor feature analysis
- Market gap identification
- User pain point discovery

**Visual (right side):**
- Stylised UI card showing competitor comparison:
  - 3 rows with competitor name + progress bars (Framer 88%, Webflow 72%, Builder.io 61%)
  - A highlighted insight card: "Gap: no AI-first export pipeline"
  - Colour: violet tones

---

### Feature 5b — Visual Sitemap & Wireframes

**Layout:** Visual left, text right (alternating)

**Section label:**
```
VISUAL PLANNING
```

**Heading:**
```
Plan every page before writing a line of code
```

**Description:**
```
AI generates a complete sitemap with page hierarchy
and content structure. Drag, drop, and reorganise
until your product architecture is exactly right.
```

**Bullet points (3):**
- AI-generated page hierarchy
- Drag-and-drop sitemap editor
- Content structure per page

**Visual (left side):**
- Sitemap tree showing:
  - `/Home` (accent highlight)
  - `/dashboard`
  - `/projects` → `/[id]`
  - `/settings`
- Connecting lines between nodes
- Colour: blue tones

---

### Feature 5c — AI Code Generation

**Layout:** Text left, visual right

**Section label:**
```
PRODUCTION CODE
```

**Heading:**
```
Ship real code, not prototypes
```

**Description:**
```
Every project exports as clean Next.js with TypeScript
and Tailwind CSS. Not a wireframe — actual, deployable,
production-ready code.
```

**Bullet points (3):**
- Next.js + TypeScript + Tailwind
- Component-level code generation
- One-click Vercel deploy

**Visual (right side):**
- Code editor mock showing:
  ```
  export function Hero() {
    return (
      <section>
        <h1 className="font-display text-5xl">
          Ship your idea
        </h1>
      </section>
    )
  }
  ```
- File tab: `hero-section.tsx`
- Status: "Next.js · TypeScript · Tailwind"
- Colour: emerald tones

---

### Feature section styling

**Each section:** `py-20 lg:py-28`

**Visual containers:**
- `rounded-2xl border border-border/50 bg-card p-6 shadow-lg`
- Subtle coloured background tint per feature

**Bullet points:**
- Check icon (`text-accent` or feature colour) + text
- `text-sm text-muted-foreground`

**Alternating grid:**
- `grid lg:grid-cols-2 gap-12 lg:gap-16 items-center`
- Even sections: `lg:order-last` on text to flip sides

---

## Section 6 — Final CTA

**Purpose:** Last push to convert. Big, warm, impossible to miss.

**Layout:** Full-width, dark background (`bg-primary text-primary-foreground`)

### Content

**Heading:**
```
Your next product starts here
```
- `font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight`

**Subheading:**
```
Go from idea to a live product — in days, not months.
Start for free, no credit card required.
```
- `text-lg opacity-80`

**CTA button:**
```
Get Started →
```
- `variant="secondary" h-14 px-10 text-base font-semibold rounded-full shadow-xl`

**Spacing:** `py-24 lg:py-32`

---

## Section 7 — Footer

**Layout:** Brand left, link columns right, copyright bar below

### Content

**Brand:**
- Scytle logo (Zap icon in gradient square) + "Scytle" wordmark
- Tagline: `From idea to live — with AI that thinks before it builds.`

**Link columns:**

| Product | Company | Legal |
|---------|---------|-------|
| Features | About | Privacy |
| Pricing | Blog | Terms |
| Changelog | Careers | |

**Copyright bar:**
```
© 2026 Scytle. All rights reserved.
```

**Styling:**
- `border-t border-border/50 bg-secondary/30`
- Footer: `py-16`, copyright: `mt-12 pt-8 border-t border-border/50`

---

## Component Architecture

```
src/
├── app/
│   └── page.tsx              ← orchestrates all sections
├── components/
│   ├── landing-header.tsx    ← navbar (existing, no changes)
│   ├── hero-section.tsx      ← Section 2
│   ├── logo-strip.tsx        ← Section 3
│   ├── how-it-works.tsx      ← Section 4
│   ├── features-section.tsx  ← Section 5 (all 3 features)
│   ├── final-cta.tsx         ← Section 6
│   └── landing-footer.tsx    ← Section 7
```

Each section is its own component, imported and composed in `page.tsx`. All are server components except `landing-header.tsx` (needs `useState` for scroll/mobile state).

---

## Design Tokens Reference

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `oklch(0.65 0.18 35)` / coral | CTAs, highlights, accent text |
| `--background` | `oklch(0.99 0.005 80)` / warm off-white | Page bg |
| `--foreground` | `oklch(0.18 0.02 260)` / deep navy | Body text |
| `--muted-foreground` | `oklch(0.55 0.02 260)` | Secondary text |
| `--secondary` | `oklch(0.97 0.01 80)` / warm cream | Section bg alternates |
| `--border` | `oklch(0.90 0.01 80)` | Borders, dividers |
| `font-display` | Bricolage Grotesque | Headlines |
| `font-sans` | Inter | Body text |

---

## Animation Strategy

No external animation libraries (no framer-motion). All entrance animations use CSS keyframes already defined in `globals.css`:

- `fade-in` — opacity 0→1
- `slide-up` — opacity 0→1, translateY 10px→0
- `slide-down` — opacity 0→1, translateY -10px→0
- `scale-in` — opacity 0→1, scale 0.95→1

Applied via inline `style={{ animation: 'keyframe-name duration ease delay fill-mode' }}` with staggered delays per element.

---

## Build Order

1. **Hero section** → get approval
2. **Logo strip** → get approval
3. **How it works** → get approval
4. **Features (3 narratives)** → get approval
5. **Final CTA** → get approval
6. **Footer** → get approval
7. **Wire everything into `page.tsx`** → final review

Each section built as a standalone component, tested, approved, then wired in.
