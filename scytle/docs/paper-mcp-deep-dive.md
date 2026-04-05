# Paper.design MCP Deep Dive — AI Generation Pipeline Research

> Researched: 2026-04-03
> Method: Hands-on interaction with Paper MCP tools via Claude Code
> Status: COMPLETE — includes live design generation test

---

## 1. How the AI Gets Its Instructions

Paper's AI generation system works through **MCP server instructions injected into the system prompt** + **tool-level context accumulation**. Unlike Pencil's layered guideline loading, Paper front-loads ALL instructions in one massive system prompt block.

### The System Prompt (Injected via MCP Server Instructions)

Paper's MCP server injects a **single large system prompt** (~300+ lines) that covers:

#### Section 1: Review Checkpoints — MANDATORY
Every 2-3 modifications, AI MUST call `get_screenshot` and evaluate:
- **Spacing**: gaps, rhythm, empty areas
- **Typography**: size, line-height, hierarchy
- **Contrast**: text legibility, element distinction
- **Alignment**: vertical/horizontal lanes
- **Clipping**: content cut off at edges
- **Repetition**: avoiding grid-like sameness

#### Section 2: Design Quality — IMPORTANT (~100 lines)
Detailed design philosophy:
- Minimalist: fewer elements, restraint, clarity
- White space as a feature
- Asymmetry and scale contrast over grid sameness
- Swiss editorial print typography
- Light mode default
- One intense color > five weak ones
- Timeless palettes (not "SaaS purple-navy")
- Default body text: never pure black or pure gray
- Text contrast non-negotiable
- Avoid tiny text (<12px) unless productivity UI
- When prompt is vague → aim to impress

#### Section 3: Placeholder Content Rules
- Use realistic placeholder content
- Use "Paper" as design software name (NOT Figma/Sketch)

#### Section 4: Vertical Lane Alignment
- Fixed-width slots for icons/indicators/actions
- flexShrink: 0 for consistent columns
- Screenshot + trace vertical lines after 3+ rows

#### Section 5: Before Creating New Designs
Generate a design brief FIRST:
- Color palette (5-6 hex values with roles)
- Type choices (font, weight, size scale)
- Spacing rhythm (section, group, element gaps)
- One sentence visual direction

#### Section 6: Workflow Tips (~50 lines)
- **Write small, write often** — one visual group per `write_html` call
- **Never batch entire components** — card with header + 4 rows + footer = 6+ calls
- **Screenshot every 2-3 modifications**
- Real-time canvas updates visible to user
- Human experience matters — element-by-element building > black box

#### Section 7: Step-by-Step Workflow
1. `get_basic_info` → file structure, artboards, dimensions
2. `get_selection` → what user is focused on
3. `get_tree_summary` → hierarchy overview
4. `get_screenshot` → visual understanding (1x default, 2x for fine details)
5. `get_jsx` → code generation from designs
6. `get_computed_styles` → precise CSS values (batch capable)
7. **MANDATORY REVIEWS** every 2-3 modifications

#### Section 8: Writing New Designs Workflow
1. Generate design brief
2. `create_artboard`
3. Add content in small pieces
4. Use `duplicate_nodes` for efficiency
5. **MUST call `finish_working_on_nodes`** when done

#### Section 9: Font Rules
- Prefer document's existing fonts
- MUST use `get_font_family_info` before first typography write
- Units: px for font-size, em for letter-spacing, px for line-height

---

## 2. The Key Architectural Difference: HTML-Based Generation

### Paper writes HTML → converts to design nodes

This is the CRITICAL difference from Pencil:

| Aspect | Pencil | Paper |
|--------|--------|-------|
| **Generation format** | Native .pen JSON via `batch_design` DSL | **HTML + inline CSS** via `write_html` |
| **Layout system** | Flexbox-like JSON properties | **Actual CSS flexbox** |
| **Node creation** | `I("parent", {type:"frame", layout:"vertical"})` | `<div style="display:flex; flex-direction:column">` |
| **Text** | `{type:"text", content:"Hello", fill:"#000"}` | `<p style="color:#000">Hello</p>` |
| **Images** | `G(nodeId, "ai", "prompt")` — AI/stock fill | `<img src="url">` on frame nodes |
| **Component system** | `{type:"ref", ref:"compId"}` instances | `<x-paper-clone node-id="A-01">` cloning |
| **Operations per call** | Max 25 in batch_design | One visual group per write_html |
| **Iteration** | Update/Replace/Move/Delete ops | `write_html` with mode="replace" |

### write_html Tool — The Core Generator

Two modes:
- **`insert-children`**: Parse HTML → add as children of target node
- **`replace`**: Remove target node → insert HTML in its place

Key HTML/CSS rules:
- **Always inline styles** (no classes, no Tailwind)
- **Google Fonts available** by family name
- **All CSS color formats**: hex, rgb, rgba, hsl, hsla, oklch, oklab
- **display: flex** as primary layout
- **Absolute positioning** supported for decorative elements
- **NO display: inline, grid, margins, or HTML tables**
- **border-box sizing** assumed
- **NO emojis as icons** — use SVG or omit
- **`layer-name` attribute** for semantic layer tree names
- `<pre>` / `white-space: pre` for code blocks

### x-paper-clone — Component Cloning
```html
<x-paper-clone node-id="A-01" style="padding:10px;" />
```
Clone existing Paper nodes into new HTML — like Pencil's `ref` instances but HTML-based.

---

## 3. Paper MCP Tools — Complete Reference

### Read Tools
| Tool | Purpose | Returns |
|------|---------|---------|
| `get_basic_info` | File name, page, artboards, fonts | Overview metadata |
| `get_selection` | Currently selected nodes | Node IDs + details |
| `get_node_info(nodeId)` | Size, visibility, lock, parent, children, text | Single node detail |
| `get_children(nodeId)` | Direct children list | IDs, names, component types |
| `get_tree_summary(nodeId, depth)` | Indented tree hierarchy | Compact structure view |
| `get_screenshot(nodeId, scale?)` | Visual render | Base64 image |
| `get_jsx(nodeId, format?)` | Code representation | Tailwind or inline-style JSX |
| `get_computed_styles(nodeIds[])` | CSS properties | Batch CSS values |
| `get_fill_image(nodeId)` | Extract image fill | Base64 JPEG |
| `get_font_family_info(names[])` | Font availability + weights | Font metadata |
| `get_guide(topic)` | Workflow guides | "figma-import" available |

### Write Tools
| Tool | Purpose | Input |
|------|---------|-------|
| `create_artboard(name, styles)` | New top-level frame | Name + CSS styles object |
| `write_html(html, targetNodeId, mode)` | Core generator | HTML string + target + mode |
| `update_styles(updates[])` | Batch style changes | [{nodeIds, styles}] |
| `set_text_content(updates[])` | Change text only | [{nodeId, textContent}] |
| `rename_nodes(updates[])` | Rename layers | [{nodeId, name}] |
| `duplicate_nodes(nodes[])` | Deep clone | [{id, parentId?}] |
| `delete_nodes(nodeIds[])` | Remove nodes | Array of IDs |
| `finish_working_on_nodes(nodeIds?)` | Release working indicator | Optional specific IDs |

---

## 4. Generation Workflow (Step by Step)

### Step 1: Context Gathering
```
get_basic_info()     → file structure, artboard dimensions
get_selection()      → what user is focused on
get_font_family_info(["Inter", ...])  → available fonts
```

### Step 2: Design Brief (AI generates internally)
Before ANY HTML, AI creates:
- Color palette (5-6 hex values with roles)
- Typography scale (font family, weights, sizes)
- Spacing rhythm
- One-sentence visual direction

### Step 3: Create Artboard
```
create_artboard("Landing Page", {
  display: "flex",
  flexDirection: "column",
  width: "1440px",
  height: "900px",
  backgroundColor: "#FAFAF9"
})
```
Returns artboard node ID.

### Step 4: Build Incrementally (ONE visual group per call)
```
// Call 1: Hero section container + heading
write_html({
  html: '<div style="display:flex; padding:80px 64px; ...">...',
  targetNodeId: artboardId,
  mode: "insert-children"
})

// Call 2: Feature card 1
write_html({
  html: '<div style="display:flex; ...">...',
  targetNodeId: featuresContainerId,
  mode: "insert-children"
})

// Call 3: Feature card 2
// ... repeat
```

### Step 5: Screenshot Review (every 2-3 writes)
```
get_screenshot(artboardId)
```
AI evaluates against 6 checkpoints, fixes issues.

### Step 6: Finish
```
finish_working_on_nodes()
```

---

## 5. What the AI "Sees" — Context Breakdown

Paper's AI context at generation time consists of:

1. **System prompt** (~300 lines) — Design philosophy, quality rules, workflow, checkpoints
2. **Basic info** — File name, artboard list, dimensions, existing fonts
3. **Font info** — Available weights/styles for chosen fonts
4. **Selection context** — What user is working on
5. **Tree summaries** — Existing hierarchy
6. **Screenshots** — Visual verification (MANDATORY every 2-3 ops)

**Total system prompt context: ~300 lines (vs Pencil's ~1000-2000 lines loaded incrementally)**

Key difference: Paper's instructions are ALL in the MCP server system prompt. No separate "guideline" loading step like Pencil's `get_guidelines`.

---

## 6. Key Differences: Paper vs Pencil vs Scytle

| Aspect | Scytle | Pencil | Paper |
|--------|--------|--------|-------|
| **Generation format** | HTML+Tailwind → parse to canvas | Native .pen JSON DSL | HTML+inline CSS → parse to design nodes |
| **Layout** | CSS (iframe rendered) | JSON flexbox properties | CSS flexbox (inline styles) |
| **AI instructions** | Single system prompt | Layered: schema + guides + styles | Single MCP system prompt (~300 lines) |
| **Style system** | Hardcoded palettes | 10 parameterized archetypes | AI-generated design brief per task |
| **Component system** | None | `ref` instances + `descendants` | `x-paper-clone` HTML tag |
| **Verification** | None (one-shot) | `get_screenshot` | `get_screenshot` (MANDATORY every 2-3 ops) |
| **Incremental building** | One-shot full page | Max 25 ops per batch | One visual group per `write_html` |
| **Design philosophy** | Prescriptive (section guidance) | Prescriptive (16 design laws per guide) | Opinionated (Swiss editorial, minimalist, timeless) |
| **Color approach** | Hardcoded hex palettes | Variable system `$--color` | AI-generated palette per task (5-6 hex) |
| **Font handling** | Fixed in prompt | Parameterized per style archetype | Runtime font lookup + AI decision |
| **Image handling** | `<img>` tags | `G()` operation (AI/stock fill) | `<img src="">` in HTML |
| **Parser needed** | YES (HTML→ScytleNode) | NO (direct JSON) | YES (HTML→Paper nodes) |
| **Iteration model** | Regenerate from scratch | Multi-turn refinement (U/R/M/D ops) | Multi-turn (write_html replace mode) |

---

## 7. Critical Insight: Paper Also Parses HTML!

Paper uses an HTML→design node parser, just like Scytle. BUT their approach differs:

1. **Inline styles only** — no Tailwind classes, no CSS cascade, no computed styles ambiguity
2. **Constrained CSS subset** — only flexbox, no grid, no inline display, no margins
3. **Single flat render** — HTML is parsed once, no iframe rendering
4. **AI-controlled constraint** — the system prompt tells AI exactly which CSS features work
5. **No external stylesheets** — everything inline = deterministic parsing

This means Paper DOES have parser constraints (they explicitly ban `display: grid`, `margin`, `display: inline`, HTML tables) — but they handle it by telling the AI upfront rather than trying to parse arbitrary HTML.

---

## 8. Implications for Scytle

### What Paper Does Better Than Scytle
1. **Design brief before generation** — AI plans colors/fonts/spacing FIRST
2. **Incremental building** — one group at a time, not one-shot full page
3. **Mandatory visual review** — screenshot checkpoint every 2-3 modifications
4. **Opinionated design quality prompts** — "Swiss editorial print", "one intense color > five weak"
5. **Font runtime validation** — check font availability before writing
6. **Constrained CSS subset** — explicitly tell AI what works/doesn't

### What Scytle Could Adopt Immediately
1. **Design brief step** — Have AI generate palette + typography + spacing before HTML
2. **Screenshot verification loop** — Let AI see output and self-correct
3. **Incremental generation** — Build section by section, not full page one-shot
4. **CSS subset constraints** — Document exactly which CSS features the parser handles
5. **Stronger design philosophy in prompt** — Opinionated aesthetic guidance
6. **Font validation** — Check available fonts before generating

### Paper vs Pencil Lesson for Scytle
Paper proves you CAN use HTML as the intermediate format and still get good results — IF you:
- Constrain the CSS to a deterministic parseable subset (inline styles, flexbox only)
- Give AI strong design opinions (not just layout templates)
- Build incrementally with visual feedback
- Validate fonts at runtime

This is MORE applicable to Scytle's current architecture than Pencil's approach (which requires abandoning HTML entirely).

---

## 9. Observed Generation (Live Test)

### Setup
- Paper desktop app open with file "Nice hill"
- Empty canvas, no existing artboards
- Font check: `get_font_family_info(["system-ui", "Geist", "Inter"])` — system-ui NOT available, Geist and Inter confirmed

### Design Brief (generated before any HTML)
- **Palette**: `#0A0A0F` (bg), `#FFFFFF` (text), `#7C3AED` (accent purple), `#1A1A2E` (card bg), `#6B7280` (muted text), `#2D2D44` (borders)
- **Typography**: Geist, weights 400/500/600/700, scale 14–72px
- **Spacing**: sections 80px, groups 32px, elements 16px
- **Direction**: "Dark, editorial, confident — Swiss precision meets modern SaaS energy"

### Build Sequence (6 `write_html` calls)

| # | Call | Target | Nodes Created | Description |
|---|------|--------|---------------|-------------|
| 1 | `write_html` insert-children | Artboard `2-0` | Nav (`3-0`) | Logo "scytle.ai" + 4 nav links + purple "Get Started" CTA |
| 2 | `write_html` insert-children | Artboard `2-0` | Hero (`B-0`) | Purple pill badge, 72px headline "Design at the speed of thought", subtitle, 2 CTA buttons |
| 3 | `write_html` insert-children | Artboard `2-0` | Stats (`L-0`) | 3-column stats row (10x, 50k+, 4.9★) with border-top separator |
| 4 | `write_html` insert-children | Artboard `2-0` | Features (`V-0`) | Section heading + 3 feature cards with inline SVG icons |
| 5 | `write_html` insert-children | Artboard `2-0` | CTA (`1N-0`) | Full-width purple block with white CTA button |
| 6 | `write_html` insert-children | Artboard `2-0` | Footer (`1S-0`) | Copyright + footer links row |

### Verification Steps
- **Screenshot 1** (after Hero) — checked spacing, typography hierarchy, contrast ✓
- **Screenshot 2** (after Features) — checked card alignment, icon consistency, vertical rhythm ✓
- **`update_styles`** — resized artboard height to `fit-content` (content exceeded initial 900px)
- **`finish_working_on_nodes()`** — released working indicator (MANDATORY)

### Total: ~47 nodes created across 6 sections

### Quality Assessment
- **Typography**: Strong hierarchy — 72px hero headline vs 14px nav links, good weight contrast
- **Color**: Single accent (purple `#7C3AED`) used consistently for CTAs, badges, and hover states
- **Spacing**: Generous section padding (80px), tighter card gaps (24px) — clear visual rhythm
- **Layout**: All flexbox, no grid — inline styles only, no classes
- **Overall**: Professional dark landing page, comparable quality to Pencil's output but built with HTML instead of JSON DSL

### Key Observations vs Pencil Test
1. **More familiar authoring** — writing HTML feels natural, Pencil's `I()/U()/G()` DSL has a learning curve
2. **Inline SVGs work** — Paper parsed SVG icons inside `write_html` without issues
3. **CSS constraints enforced by prompt** — AI never attempted grid/margins/tables because system prompt said not to
4. **Incremental rendering visible** — each `write_html` appeared on canvas immediately (user sees progress)
5. **Font validation step** — catching `system-ui` unavailability before generation prevented broken output
6. **No parser bugs observed** — padding, colors, flexbox all rendered correctly with inline-only CSS
