# V2 Layout Rebuild Plan

Rebuild layout categories from scratch. Foundation-first approach: prove the pattern with 1 category (2 variants), validate end-to-end, then scale one category at a time from Figma designs.

## Strategy

> **Build once, prove everything, then scale.** The first V2 attempt (hero + gallery, 54 variants) failed because the pattern was wrong (flat blocks, hardcoded divs, responsive in block props). This time we start with 2 hero variants, validate the full pipeline (blocks → responsive → tokens → selection → drag → registry → add-section → controls), and only scale after confirming foundation is solid.

## Decisions

| Decision | Choice |
|---|---|
| Approach | Clean slate — delete V1 + current V2 layouts, rebuild from scratch |
| Foundation | Hero × 2 variants first, validate everything end-to-end |
| Scale | One category at a time, gated on user approval |
| Responsive | Container queries (`@container`) with desktop-first (`@max-sm:`, `@max-lg:`) |
| Design source | Figma designs — ask for URL before building each category |

## Key Architecture Rules

### 1. Section-Owned Responsive
**Responsive classes belong on the `<section>` wrapper in the layout component**, NOT scattered inside `buildXBlocks()` factory functions as `className`/`layoutClassName` props on nested frame blocks. The block tree is purely structural; the section component owns responsive behavior.

### 2. Nested Frame Block Trees
Every structural `<div>` MUST be a `frame` block with `children: Block[]`. The `buildXBlocks()` factory returns a nested tree. The layout component just walks it via `<RenderBlock>`. NO hardcoded wrapper divs. This makes every container hoverable, selectable, draggable on canvas.

### 3. Token-Driven Styling
All colors, fonts, radius values come from `--sg-*` CSS custom properties. Zero hardcoded Tailwind color/font classes in layout code.

---

## Phase 0 — Archive & Clean

### 0A. Git Tag + Commit
```bash
git tag v1-archive
git add -A && git commit -m "chore: archive before V1/V2 layout cleanup"
```

### 0B. Delete V1 Designs (~191 files, 22 categories)
Delete all category directories under `src/lib/designs/`:
- 15 marketing: hero, cta, navbar, footer, features, testimonials, pricing, faq, contact, content, gallery, team, blog, stats, logos
- 6 SaaS: saas-hero, saas-features, saas-pricing, saas-testimonials, saas-cta, saas-faq
- 1 auth: auth

Delete V1 root files:
- `src/lib/designs/registry.ts` (394 lines)
- `src/lib/designs/types.ts`
- Gut `src/lib/designs/index.ts` to re-export from `./v2/`

### 0C. Delete V2 Hero + Gallery Layouts (12 files)
- `src/lib/designs/v2/layouts/hero/` (6 files)
- `src/lib/designs/v2/layouts/gallery/` (6 files)

### 0D. Update 8 Consumer Files (remove V1 imports)
| File | Action |
|---|---|
| `src/store/unified-store.ts` | Remove `getDesignById`, `getFamilyById`, `getPresetById` imports |
| `src/components/wireframe/placeholder-renderer.tsx` | Remove V1 fallback strategies, keep V2-only resolution |
| `src/components/wireframe/panels/component-library-panel.tsx` | Remove V1 family/preset rendering, clear `V2_READY_CATEGORIES` |
| `src/components/wireframe/add-section-sidebar.tsx` | Remove V1 preset references |
| `src/components/wireframe/section-picker.tsx` | Remove V1 references |
| `src/components/wireframe/panels/section-controls.tsx` | Remove V1 `getDesignById`/`getFamilyById` |
| `src/components/wireframe/panels/section-panel.tsx` | Remove V1 references |
| `src/components/wireframe/wireframe-thumbnail.tsx` | Remove V1 `getDesignById` |

### 0E. Clear Registries
- Empty `LAYOUT_REGISTRY` in `src/lib/designs/v2/layouts/index.ts`
- Clear `V2_READY_CATEGORIES` in `component-library-panel.tsx`
- Empty control defs in `src/lib/designs/v2/layouts/controls.ts`

### 0F. Verify Build
```bash
npm run build   # Must pass clean with zero errors
```

---

## Phase 1 — Foundation: Hero × 2 Variants

Build 2 hero variants that prove the entire architecture end-to-end. These are chosen to cover the two core layout patterns (single-column centered & two-column split):

| ID | Layout | Why this variant |
|---|---|---|
| `hero-1` (center + buttons) | Centered heading + subtext + button group | Simplest layout — validates vertical stack, tokens, responsive stacking |
| `hero-2` (split + image) | 50/50 text-left + image-right | Validates 2-column → stacked responsive, frame nesting, cross-column interaction |

### 1A. File Structure
```
src/lib/designs/v2/layouts/hero/
├── types.ts              — HeroContent, DEFAULT_CONTENT
├── presets.ts            — 2 presets with nested frame block trees
├── hero-section.tsx      — Core renderer: <section @container> + blocks.map → <RenderBlock>
├── hero-layouts.tsx      — Named wrapper components via factory
├── hero-thumbnails.tsx   — Placeholder thumbnails (Figma PNGs added later)
└── index.ts              — Barrel exports + LAYOUT_TEMPLATES + TEMPLATES_MAP
```

### 1B. Wire Into Registry
- Add hero control def to `controls.ts`
- Register 2 templates in `LAYOUT_REGISTRY`
- Add `'hero'` to `V2_READY_CATEGORIES`
- Update `PlaceholderRenderer` to resolve `hero-1`, `hero-2`

### 1C. Foundation Validation Checklist

Every item MUST pass before moving to Phase 2:

**Rendering**
- [ ] `hero-1` renders pixel-perfect at 1280px (desktop)
- [ ] `hero-2` renders pixel-perfect at 1280px (desktop)
- [ ] Both collapse correctly at 768px (tablet) and 375px (mobile)
- [ ] All text/colors/fonts come from `--sg-*` tokens (zero hardcoded values)
- [ ] `@container` queries fire on section wrapper, not media queries

**Block Tree**
- [ ] `buildBlocks()` returns nested frame tree (not flat list)
- [ ] No hardcoded wrapper `<div>` in section component JSX
- [ ] Every container is a `frame` block visible to selection system

**Selection & Interaction**
- [ ] Hover outlines on every block at every nesting level
- [ ] Click selects block, Enter enters frame, Escape exits
- [ ] Drag-drop reorders blocks within a frame
- [ ] Cross-frame drag works (move block between content column and image column)

**Pipeline**
- [ ] Add Section sidebar shows hero category with 2 variants
- [ ] Clicking a variant inserts section with correct `defaultBlocks` tree
- [ ] Control panel switches between `hero-1` ↔ `hero-2`
- [ ] `npm run build` passes clean

### 1D. User Gate

> **STOP HERE.** Review the 2 hero variants in the browser. Test responsive, selection, drag-drop. Confirm "foundation is solid" before proceeding to Phase 2.

---

## Phase 2 — Scale: One Category at a Time

Only after Phase 1 gate passes. Each category follows the same proven pattern. Figma designs drive exact layout specs.

### Workflow Per Category
1. **Ask** for Figma link (desktop + mobile frames)
2. **Extract** design specs using Figma MCP (`get_design_context` / `get_screenshot`)
3. **Build** category directory with standard 6-file structure
4. **Wire** registry + controls + `V2_READY_CATEGORIES`
5. **Download** thumbnails from Figma (desktop-only PNGs)
6. **Verify** `npm run build` passes clean
7. **User reviews** → confirm or iterate → next category

### Categories & Planned Variants

> Variant counts and layouts below are starting points. Final variants per category will be determined from the Figma designs when we get there. Ask for Figma URL before building each.

#### Hero (expand from Phase 1's 2 → 3-5 total)
| ID | Layout | Description |
|---|---|---|
| `hero-1` | Center heading + subtext + buttons | ✅ Built in Phase 1 |
| `hero-2` | 50/50 text-left + image-right | ✅ Built in Phase 1 |
| `hero-3` | Left-aligned heading + buttons | Classic SaaS hero |
| `hero-4` | Center text over background image | Bold visual impact |
| `hero-5` | Left text + right form/signup | Lead generation |

#### Navbar (3 variants)
| ID | Layout | Description |
|---|---|---|
| `navbar-1` | Logo left / nav links center / CTA right | Most common pattern |
| `navbar-2` | Logo left / nav links right / 2 CTAs | SaaS dashboard-style |
| `navbar-3` | Logo center / links split left+right | Brand-focused |

#### Footer (3 variants)
| ID | Layout | Description |
|---|---|---|
| `footer-1` | 4-column links + bottom bar (logo + copyright + socials) | Standard marketing |
| `footer-2` | Single row: logo + links + socials | Minimal/startup |
| `footer-3` | Big CTA section on top + 4-column links below | Conversion-focused |

#### Features (3-4 variants)
| ID | Layout | Description |
|---|---|---|
| `features-1` | Section heading + 3 icon-card columns | Classic feature grid |
| `features-2` | Alternating image-left/text-right rows | Storytelling / zigzag |
| `features-3` | Left heading + 2×2 card grid on right | Dashboard-style |
| `features-4` | Large heading + 4-column icon+text list | Dense feature list |

#### CTA (3 variants)
| ID | Layout | Description |
|---|---|---|
| `cta-1` | Center heading + subtext + 2 buttons | Simple conversion block |
| `cta-2` | Left text + right buttons | Directional flow |
| `cta-3` | Full-width banner with inline email + submit | Newsletter/signup |

#### Testimonials (3 variants)
| ID | Layout | Description |
|---|---|---|
| `testimonials-1` | 3 testimonial cards in a row | Social proof grid |
| `testimonials-2` | Single large quote with avatar + attribution | Featured testimonial |
| `testimonials-3` | Left big quote + right stacked smaller cards | Hierarchical proof |

### Control Definitions (built per category as we go)
- **Hero**: layout (left/center/split) × media (none/image/bg-image) × action (buttons/form)
- **Navbar**: alignment (standard/right/center)
- **Footer**: style (columns/simple/cta)
- **Features**: layout (grid/zigzag/2x2/list)
- **CTA**: layout (centered/split/banner)
- **Testimonials**: layout (3col/single/split)

> Final control axes will be determined from actual Figma designs, not guessed up front.

---

## Phase 3 — Polish & QA

After all categories are built:

### 3A. Responsive QA
Test every variant at:
- **Desktop**: 1280px (full layout)
- **Tablet**: 768px (intermediate collapse)
- **Mobile**: 375px (fully stacked)

### 3B. Interaction QA
- [ ] Hover highlights correct block at each nesting level
- [ ] Click selects block, Enter enters frame, Escape exits
- [ ] Drag-drop reorders blocks within a frame
- [ ] Cross-section drag moves blocks between sections
- [ ] Copy/cut/paste works with visual flash feedback
- [ ] Undo/redo preserves block tree integrity

### 3C. Build Verification
```bash
npm run build   # Must pass clean with zero errors
npm run lint     # No new lint warnings
```

---

## File Structure Per Category (Reference)

```
src/lib/designs/v2/layouts/{category}/
├── types.ts              — Enums, content types, DEFAULT_CONTENT
├── presets.ts            — One config per variant (ALL_PRESETS array)
│                           Each preset's defaultBlocks = nested frame block tree
├── {cat}-section.tsx     — Core renderer: <section @container> + blocks.map(RenderBlock)
│                           Responsive classes HERE, not in block props
│                           NO hardcoded wrapper <div>s
├── {cat}-layouts.tsx     — createComponent() factory → named exports
├── {cat}-thumbnails.tsx  — <img> from /thumbnails/{cat}/ + fallback
└── index.ts              — Barrel exports + LAYOUT_TEMPLATES + TEMPLATES_MAP

public/thumbnails/{category}/
├── {cat}-1.png           — Desktop-only Figma screenshot (scale=2)
├── {cat}-2.png
└── ...
```

---

## What We're Keeping (Untouched)

| System | Files | Notes |
|---|---|---|
| V2 Blocks | 21 files in `src/lib/designs/v2/blocks/` | 18 block types + RenderBlock + types.ts + frame-block.tsx |
| V2 Selection | 6 files in `src/lib/designs/v2/selection/` | LayerWrapper (Sortable/Plain), SectionWrapper, keyboard-handler, contexts |
| V2 Tokens | 5 files in `src/lib/designs/v2/tokens/` | CSS variables, palettes, font-pairs, TokenProvider, SectionTokenProvider |
| Selection Store | `src/store/selection-store.ts` (251 lines) | 4-state machine: idle→section-selected→entered→block-selected |
| Layout Types | `src/lib/designs/v2/layouts/types.ts` | LayoutCategory, LayoutTemplate, LayoutProps interfaces |

---

## Execution Order

```
Phase 0 — Archive, delete V1 + old V2 layouts, clean imports, verify build
    ↓
Phase 1 — Foundation: build hero × 2 variants, wire full pipeline, validate checklist
    ↓
  ⛔ USER GATE — review & confirm foundation is solid
    ↓
Phase 2 — Scale: add remaining hero variants + 5 more categories (one at a time, from Figma)
    ↓
Phase 3 — Polish: responsive QA + interaction QA across all variants
```
