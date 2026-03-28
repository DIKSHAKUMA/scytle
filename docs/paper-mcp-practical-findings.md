# Paper MCP Practical Research — Findings

> **Date**: 2026-03-28
> **Session**: Live research using Paper Desktop MCP tools
> **Artboard created**: "Landing Page — Scytle Research" (node `2-0`, 1440×3200px)

---

## Table of Contents

1. [Full MCP Tool Inventory](#1-full-mcp-tool-inventory)
2. [Paper Node Tree Structure](#2-paper-node-tree-structure)
3. [Paper Style System](#3-paper-style-system)
4. [Generated HTML — All 6 Sections](#4-generated-html--all-6-sections)
5. [JSX Output (get_jsx)](#5-jsx-output-get_jsx)
6. [Computed Styles — 7 Nodes](#6-computed-styles--7-nodes)
7. [Step 4 — Editing Tool Tests](#7-step-4--editing-tool-tests)
8. [Key Insights for Scytle](#8-key-insights-for-scytle)

---

## 1. Full MCP Tool Inventory

Paper exposes **21 MCP tools** via a local server at `http://127.0.0.1:29979/mcp`.

### 1.1 Read Tools (11)

| Tool | Parameters | Returns |
|------|-----------|---------|
| `get_basic_info` | none | File name, page name, node count, artboard list with dimensions, font families used |
| `get_selection` | none | IDs, names, component types, size, artboard of currently selected nodes |
| `get_node_info` | `nodeId: string` | ID, name, component type, size, visibility, lock state, parent, children IDs, text content (for text nodes) |
| `get_children` | `nodeId: string` | Array of child nodes: ID, name, component type, child count |
| `get_tree_summary` | `nodeId: string`, `depth?: number` (max 10, default 3) | Indented tree: component type, name, ID, dimensions for all descendants |
| `get_screenshot` | `nodeId: string`, `scale?: number` (1 or 2), `transparent?: boolean` | Base64-encoded JPEG (or PNG if transparent). Auto-capped to API size limits |
| `get_jsx` | `nodeId: string`, `format?: "tailwind" \| "inline-styles"` | Full React JSX tree with styles as camelCase objects (inline-styles) or Tailwind classes |
| `get_computed_styles` | `nodeIds: string[]` | Map of nodeId → CSSProperties object (batch supported) |
| `get_fill_image` | `nodeId: string` | Base64-encoded JPEG of image fill content + original URL |
| `get_font_family_info` | `familyNames: string[]` | Availability, weights, styles for each font (checks local machine + Google Fonts) |
| `get_guide` | `topic: "figma-import"` | Step-by-step workflow guide text |

### 1.2 Write Tools (7)

| Tool | Parameters | Returns |
|------|-----------|---------|
| `create_artboard` | `name: string`, `styles: CSSProperties (width+height required)` | Node ID, name, component type of new artboard |
| `write_html` | `html: string`, `targetNodeId: string`, `mode: "insert-children" \| "replace"` | IDs, names, component types of created top-level nodes |
| `set_text_content` | `updates: [{nodeId, textContent}]` | `{ updates: [{nodeId, textContent}] }` — batch |
| `rename_nodes` | `updates: [{nodeId, name}]` | Confirmation batch |
| `duplicate_nodes` | `nodes: [{id, parentId?}]` | `{ duplicatedNodes: [{sourceId, newId, name, component, descendantIdMap}] }` |
| `update_styles` | `updates: [{nodeIds: string[], styles: CSSProperties}]` | `{ updates: [{nodeId}] }` — batch |
| `delete_nodes` | `nodeIds: string[]` | Confirmation |

### 1.3 Workflow Tools (2)

| Tool | Parameters | Returns |
|------|-----------|---------|
| `finish_working_on_nodes` | `nodeIds?: string[]` | Releases "working" indicator. Pass no args to release all |
| *(formerly start_working)* | — | The working indicator is set automatically during writes |

### 1.4 Notable Observations

- **`get_jsx` with `format: "inline-styles"`** is the most information-rich export — returns complete React component tree with every CSS property as camelCase values. No semantic information is lost.
- **`get_computed_styles`** supports batching — pass up to N nodeIds and get back a map, saving round trips.
- **`duplicate_nodes`** returns a `descendantIdMap` — maps every source child ID to its cloned equivalent, enabling immediate targeted updates without re-traversal.
- **`create_artboard`** auto-places the artboard in a blank area, no `find_placement` needed (that tool is documented but not exposed in the current schema).
- SVG elements in HTML are preserved as first-class nodes — `get_jsx` returns them as JSX `<svg>` elements with all attributes intact.

---

## 2. Paper Node Tree Structure

### 2.1 Component Types Observed

| Component Type | Description |
|---------------|-------------|
| `Frame` | Container node (maps to `<div>` with flex layout or block). Used for artboards and all structural containers |
| `Text` | Leaf text node. Has `textContent` property. Only this type can be targeted by `set_text_content` |
| `Rectangle` | Simple rect shape node (solid fill, no children) |
| `SVG` | Top-level SVG container |
| `SVGVisualElement` | Individual SVG path/circle/rect inside an SVG node |

### 2.2 Artboard Hierarchy

```
Frame "Landing Page — Scytle Research" (2-0)  [1440×3200px, position: absolute, left:1450px top:256px]
  ├── Frame "Navbar" (3-0)                    [1440×72px]
  │     ├── Frame (logo group, 2 children)
  │     ├── Frame (nav links, 4 Text children)
  │     └── Frame (CTA group, 2–3 children)
  │
  ├── Frame "Hero" (G-0)                      [1440px wide, flex column, center aligned]
  │     ├── Frame (beta badge pill)
  │     ├── Text (h1 headline, K-0)
  │     ├── Text (subtitle)
  │     ├── Frame (CTA buttons row, 2 children)
  │     └── Frame (trust bar, 6 children)
  │
  ├── Frame "Features" (12-0)                 [1440px, bg:#1A1A16]
  │     ├── Frame (header group, 13-0, 2 children)
  │     └── Frame (cards row, 18-0, 4 children)
  │           ├── Frame "Feature Card 1" (19-0)
  │           ├── Frame (card 2)
  │           ├── Frame (card 3)
  │           └── Frame (card 4)
  │
  ├── Frame "Testimonials" (2H-0)             [1440px, bg:#FAFAF7]
  │     ├── Frame (divider row, 2 children)
  │     └── Frame (testimonials row, 3 children)
  │
  ├── Frame "CTA Banner" (3A-0)               [1440px, bg:#B07840 after edit]
  │     ├── Text (headline)
  │     ├── Text (subtitle)
  │     └── Frame (buttons row)
  │
  └── Frame "Footer" (3I-0)                   [1440px, bg:#1A1A16]
        ├── Frame (main footer row, 2 children)
        └── Frame (copyright bar, 2 children)
```

### 2.3 Key Structural Rules

1. **Every layout container is a `Frame`** — there is no distinction between "section", "div", "article" etc. at the node level. Semantic meaning lives only in the `name` field and the CSS properties.
2. **Text is always a leaf `Text` node** — never nested inside another Text node.
3. **SVGs become nested hierarchies** — top-level `SVG` frame with `SVGVisualElement` children for each path/circle/shape.
4. **No implicit sizing** — every Frame has explicit width, height, padding, or flex values. Paper does not infer dimensions.
5. **Artboard itself is a Frame** with `position: absolute` for canvas placement. Its children use normal flow.

---

## 3. Paper Style System

### 3.1 How HTML Maps to Computed Styles

When HTML is written via `write_html`, Paper parses it into its node tree and stores styles as individual CSS properties. `get_computed_styles` returns these as a camelCase CSSProperties object.

**Key observations:**
- Shorthand CSS is **expanded** to longhand. `padding: 100px 80px` becomes `paddingTop/Right/Bottom/Left` or `paddingBlock/paddingInline`.
- `border` shorthand expands to `borderBottomColor`, `borderBottomStyle`, `borderBottomWidth` etc.
- `flex: 1` expands to `flexGrow: "1"`, `flexShrink: "1"`, `flexBasis: "0%"`.
- All values are stored as **strings** (even numbers): `fontSize: "80px"`, `fontWeight: 900` (numeric exception observed).
- `box-sizing: border-box` is added universally by Paper's runtime.
- Font smoothing is added at the root: `MozOsxFontSmoothing: "grayscale"`, `WebkitFontSmoothing: "antialiased"`.
- `whiteSpace: "pre"` is applied to text nodes that contain explicit newlines.
- `fontSynthesis: "none"` is added at the root.

### 3.2 JSX Export Format

`get_jsx` with `format: "inline-styles"` returns a single nested JSX expression. Every node becomes a `<div>` (or `<svg>`, `<svg>` elements for vectors) with a `style` prop containing all CSS as a React camelCase object.

Structure of each node in JSX:
```jsx
<div style={{
  // Layout
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  // Sizing
  width: '1440px',
  paddingBlock: '100px',
  paddingInline: '80px',
  // Visual
  backgroundColor: '#FAFAF7',
  // Typography (on text containers)
  fontFamily: '"Playfair Display", system-ui, sans-serif',
  fontSize: '80px',
  fontWeight: 900,
  // Box model
  boxSizing: 'border-box',
}}>
  {/* children */}
</div>
```

**No class names are used** in the inline-styles export — pure inline CSS only. The Tailwind format option emits Tailwind classes where possible with inline fallback for unsupported properties.

### 3.3 Color Representation

Colors are always stored as **lowercase hex** (`#fafaf7`, `#1a1a16`). No RGB, HSL, or named colors observed in computed output even when entered differently.

### 3.4 Typography Storage

| Property | Storage format | Example |
|---------|---------------|---------|
| `fontFamily` | Full CSS font-family string | `'"Playfair Display", system-ui, sans-serif'` |
| `fontSize` | String with px unit | `"80px"` |
| `fontWeight` | Number (not string) | `900` |
| `lineHeight` | String with px unit | `"88px"` |
| `letterSpacing` | String with em unit | `"-0.03em"` |
| `textTransform` | String keyword | `"uppercase"` |
| `whiteSpace` | `"pre"` for multi-line text | `"pre"` |

### 3.5 Opacity

Stored as `opacity: "0.3"` (string) on the node. This is **element-level opacity** — it cascades to children, which is how Paper handles brand-name opacity in the trust bar.

---

## 4. Generated HTML — All 6 Sections

The complete landing page was generated incrementally using `write_html` with `mode: "insert-children"` targeting artboard `2-0`. Design system used:

**Design Brief:**
- Palette: `#FAFAF7` (off-white), `#1A1A16` (near-black), `#6B6B5E` (warm gray), `#C4915A` (amber accent), `#E8E6DF` (border/surface), `#F2F0E9` (card warm), `#22221E` (dark card), `#2A2A26` (footer divider)
- Type: Playfair Display 700/800/900 (display) + Inter 300/400/500/600 (body)
- Rhythm: 100px section padding, 80px horizontal gutter, 40px group gap, 20px element gap
- Direction: "Warm editorial print — restraint, contrast, authority"

### Section 1: Navbar

```html
<nav layer-name="Navbar" style="width:1440px; height:72px; display:flex; align-items:center; justify-content:space-between; padding:0 80px; background-color:#FAFAF7; border-bottom:1px solid #E8E6DF; flex-shrink:0;">
  <!-- Logo: amber 28×28 square + Playfair "Meridian" 700 20px -->
  <div style="display:flex; align-items:center; gap:6px;">
    <div style="width:28px; height:28px; background-color:#C4915A; border-radius:4px; flex-shrink:0;"></div>
    <div style="font-family:'Playfair Display', system-ui, sans-serif; font-size:20px; font-weight:700; color:#1A1A16; letter-spacing:-0.02em; line-height:24px; flex-shrink:0; display:inline-block;">Meridian</div>
  </div>
  <!-- Nav links: Inter 400 14px #6B6B5E, gap:40px -->
  <div style="display:flex; align-items:center; gap:40px;">
    <div style="font-family:'Inter',system-ui,sans-serif; font-size:14px; color:#6B6B5E; letter-spacing:0.01em; line-height:18px; display:inline-block; flex-shrink:0;">Product</div>
    <div style="font-family:'Inter',system-ui,sans-serif; font-size:14px; color:#6B6B5E; letter-spacing:0.01em; line-height:18px; display:inline-block; flex-shrink:0;">Pricing</div>
    <div style="font-family:'Inter',system-ui,sans-serif; font-size:14px; color:#6B6B5E; letter-spacing:0.01em; line-height:18px; display:inline-block; flex-shrink:0;">About</div>
    <div style="font-family:'Inter',system-ui,sans-serif; font-size:14px; color:#6B6B5E; letter-spacing:0.01em; line-height:18px; display:inline-block; flex-shrink:0;">Blog</div>
  </div>
  <!-- CTA: "Sign in" text + "Get started" dark button -->
  <div style="display:flex; align-items:center; gap:16px;">
    <div style="font-family:'Inter',system-ui,sans-serif; font-size:14px; color:#1A1A16; line-height:18px; display:inline-block; flex-shrink:0;">Sign in</div>
    <div style="background-color:#1A1A16; border-radius:6px; padding:10px 22px;">
      <div style="font-size:16px; line-height:20px; color:#FAFAF7;">Get started</div>
    </div>
  </div>
</nav>
```

### Section 2: Hero

```html
<section layer-name="Hero" style="width:1440px; padding:120px 80px 100px; display:flex; flex-direction:column; align-items:center; text-align:center; background-color:#FAFAF7; flex-shrink:0;">
  <!-- Beta badge pill -->
  <div style="display:flex; align-items:center; gap:8px; border:1px solid #C4915A; border-radius:20px; padding:6px 14px; margin-bottom:40px;">
    <div style="width:6px; height:6px; background-color:#C4915A; border-radius:50%; flex-shrink:0;"></div>
    <div style="font-family:'Inter',system-ui,sans-serif; font-size:12px; font-weight:500; color:#C4915A; letter-spacing:0.08em; text-transform:uppercase; line-height:16px; display:inline-block; flex-shrink:0; text-align:center;">Now in public beta</div>
  </div>
  <!-- H1: Playfair Display 900 80px -->
  <div style="font-family:'Playfair Display',system-ui,sans-serif; font-size:80px; font-weight:900; color:#1A1A16; letter-spacing:-0.03em; line-height:88px; max-width:900px; text-align:center; margin-bottom:28px;">
    Design tools built<br>for the age of AI.<br>Ship faster.
  </div>
  <!-- Subtitle: Inter 300 20px -->
  <div style="font-family:'Inter',system-ui,sans-serif; font-size:20px; font-weight:300; color:#6B6B5E; line-height:32px; max-width:560px; text-align:center; margin-bottom:48px;">
    A canvas that speaks your language. Create, iterate, and ship with AI that understands context — not just commands.
  </div>
  <!-- CTA buttons -->
  <div style="display:flex; align-items:center; gap:16px;">
    <div style="background-color:#1A1A16; border-radius:8px; padding:16px 36px;">
      <div style="font-size:16px; line-height:20px; color:#FAFAF7; text-align:center;">Start designing free</div>
    </div>
    <div style="display:flex; align-items:center; gap:10px; padding:16px 24px;">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
        <circle cx="8" cy="8" r="7" stroke="#1A1A16" stroke-width="1.5"/>
        <path d="M6.5 5L10.5 8L6.5 11" stroke="#1A1A16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div style="font-family:'Inter',system-ui,sans-serif; font-size:16px; color:#1A1A16; line-height:20px; text-align:center; display:inline-block; flex-shrink:0;">Watch demo</div>
    </div>
  </div>
  <!-- Trust bar -->
  <div style="display:flex; align-items:center; gap:32px; margin-top:80px;">
    <div style="font-family:'Inter',system-ui,sans-serif; font-size:13px; color:#6B6B5E; line-height:16px; text-align:center; display:inline-block; flex-shrink:0;">Trusted by teams at</div>
    <div style="font-family:'Playfair Display',system-ui,sans-serif; font-size:18px; font-weight:700; color:#1A1A16; line-height:22px; opacity:0.3; text-align:center; display:inline-block; flex-shrink:0;">Acme</div>
    <div style="font-family:'Playfair Display',system-ui,sans-serif; font-size:18px; font-weight:700; color:#1A1A16; line-height:22px; opacity:0.3; text-align:center; display:inline-block; flex-shrink:0;">Vertex</div>
    <div style="font-family:'Playfair Display',system-ui,sans-serif; font-size:18px; font-weight:700; color:#1A1A16; line-height:22px; opacity:0.3; text-align:center; display:inline-block; flex-shrink:0;">Prism</div>
    <div style="font-family:'Playfair Display',system-ui,sans-serif; font-size:18px; font-weight:700; color:#1A1A16; line-height:22px; opacity:0.3; text-align:center; display:inline-block; flex-shrink:0;">Solace</div>
    <div style="font-family:'Playfair Display',system-ui,sans-serif; font-size:18px; font-weight:700; color:#1A1A16; line-height:22px; opacity:0.3; text-align:center; display:inline-block; flex-shrink:0;">Lumen</div>
  </div>
</section>
```

### Section 3: Features

```html
<section layer-name="Features" style="width:1440px; padding:100px 80px; background-color:#1A1A16; flex-shrink:0;">
  <!-- Header: label + large heading (left) + description paragraph (right) -->
  <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:72px;">
    <div>
      <div style="font-family:'Inter',system-ui,sans-serif; font-size:12px; font-weight:500; color:#C4915A; letter-spacing:0.1em; text-transform:uppercase; line-height:16px; margin-bottom:16px;">What we offer</div>
      <div style="font-family:'Playfair Display',system-ui,sans-serif; font-size:56px; font-weight:800; color:#FAFAF7; letter-spacing:-0.02em; line-height:64px; max-width:520px;">Every tool a designer needs</div>
    </div>
    <div style="font-family:'Inter',system-ui,sans-serif; font-size:16px; font-weight:300; color:#6B6B5E; line-height:26px; max-width:360px; flex-shrink:0;">Streamlined, purposeful, and built around how designers actually work — not how developers think they should.</div>
  </div>
  <!-- 4 cards: gap:2px, each flex:1, dark bg #22221E -->
  <div style="display:flex; gap:2px;">
    <!-- Card 1: AI generation (amber icon border) -->
    <div style="flex:1; background-color:#22221E; border-radius:4px 0 0 4px; display:flex; flex-direction:column; padding:48px 40px; gap:20px;">
      <div style="width:44px; height:44px; border:1px solid #C4915A; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><rect x="2" y="2" width="16" height="16" rx="2" stroke="#C4915A" stroke-width="1.5"/><path d="M7 10H13M10 7V13" stroke="#C4915A" stroke-width="1.5" stroke-linecap="round"/></svg>
      </div>
      <div style="font-family:'Playfair Display',system-ui,sans-serif; font-size:24px; font-weight:700; color:#FAFAF7; letter-spacing:-0.01em; line-height:32px;">AI generation</div>
      <div style="font-family:'Inter',system-ui,sans-serif; font-size:15px; font-weight:300; color:#6B6B5E; line-height:24px;">Describe what you want. Watch it appear — styled, structured, and ready to edit.</div>
      <div style="display:flex; align-items:center; gap:8px; margin-top:auto;">
        <div style="font-family:'Inter',system-ui,sans-serif; font-size:13px; font-weight:500; color:#C4915A; line-height:16px; display:inline-block; flex-shrink:0;">Learn more</div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M2 6H10M7 3L10 6L7 9" stroke="#C4915A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>
    <!-- Cards 2–4: same structure with different icons/titles/descriptions, neutral border color -->
    <!-- ... (Component system, Export to code, Real collaboration) -->
  </div>
</section>
```

### Section 4: Testimonials

```html
<section layer-name="Testimonials" style="width:1440px; padding:100px 80px; background-color:#FAFAF7; flex-shrink:0;">
  <!-- Divider header -->
  <div style="display:flex; align-items:center; gap:6px; margin-bottom:64px;">
    <div style="font-family:'Inter',system-ui,sans-serif; font-size:12px; font-weight:500; color:#6B6B5E; letter-spacing:0.1em; text-transform:uppercase; line-height:16px; flex-shrink:0;">What people say</div>
    <div style="flex:1; height:1px; background-color:#E8E6DF; margin-left:16px;"></div>
  </div>
  <!-- 3 testimonial cards: gap:40px, staggered (middle card offset +40px) -->
  <div style="display:flex; gap:40px; align-items:flex-start;">
    <!-- Card 1 (#F2F0E9, Sarah Nakamura) -->
    <div style="flex:1; background-color:#F2F0E9; border-radius:8px; padding:48px; display:flex; flex-direction:column; gap:28px;">
      <div style="font-family:'Playfair Display',system-ui,sans-serif; font-size:22px; font-style:italic; color:#1A1A16; line-height:36px;">"Meridian changed how our team works..."</div>
      <div style="display:flex; align-items:center; gap:16px;">
        <div style="width:44px; height:44px; background-color:#C4915A; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          <div style="font-family:'Inter',sans-serif; font-size:16px; font-weight:600; color:#FAFAF7; display:inline-block; flex-shrink:0;">S</div>
        </div>
        <div>
          <div style="font-family:'Inter',sans-serif; font-size:14px; font-weight:600; color:#1A1A16; line-height:18px;">Sarah Nakamura</div>
          <div style="font-family:'Inter',sans-serif; font-size:13px; color:#6B6B5E; line-height:16px;">Design Lead, Acme Corp</div>
        </div>
      </div>
    </div>
    <!-- Card 2 (#1A1A16 dark, margin-top:40px, Marcus Webb) -->
    <!-- Card 3 (#F2F0E9, Anika Patel) -->
  </div>
</section>
```

### Section 5: CTA Banner

```html
<section layer-name="CTA Banner" style="width:1440px; padding:100px 80px; background-color:#C4915A; display:flex; flex-direction:column; align-items:center; text-align:center; flex-shrink:0;">
  <div style="font-family:'Playfair Display',system-ui,sans-serif; font-size:64px; font-weight:900; color:#1A1A16; letter-spacing:-0.03em; line-height:72px; max-width:700px; text-align:center; margin-bottom:24px;">Ready to design differently?</div>
  <div style="font-family:'Inter',system-ui,sans-serif; font-size:18px; font-weight:300; color:#1A1A16; line-height:28px; max-width:480px; opacity:0.7; text-align:center; margin-bottom:48px;">Join thousands of designers building better products, faster. Free forever — no credit card required.</div>
  <div style="display:flex; align-items:center; gap:17px;">
    <div style="background-color:#1A1A16; border-radius:8px; padding:16px 40px;"><div style="font-size:16px; line-height:20px; text-align:center;">Start for free</div></div>
    <div style="border:1.5px solid #1A1A16; border-radius:8px; padding:16px 32px;"><div style="font-size:16px; line-height:20px; text-align:center;">Talk to sales</div></div>
  </div>
</section>
```

### Section 6: Footer

```html
<footer layer-name="Footer" style="width:1440px; padding:64px 80px 48px; background-color:#1A1A16; display:flex; flex-direction:column; gap:56px; flex-shrink:0;">
  <!-- Main row: logo+tagline (left) + link columns (right) -->
  <div style="display:flex; justify-content:space-between;">
    <div style="display:flex; flex-direction:column; gap:20px; max-width:280px;">
      <div style="display:flex; align-items:center; gap:6px;">
        <div style="width:24px; height:24px; background-color:#C4915A; border-radius:3px; flex-shrink:0;"></div>
        <div style="font-family:'Playfair Display',system-ui,sans-serif; font-size:18px; font-weight:700; color:#FAFAF7; letter-spacing:-0.02em; line-height:22px; display:inline-block; flex-shrink:0;">Meridian</div>
      </div>
      <div style="font-family:'Inter',system-ui,sans-serif; font-size:14px; font-weight:300; color:#6B6B5E; line-height:22px;">Design tools built for the age of AI. Craft beautiful interfaces with less friction.</div>
    </div>
    <!-- Product / Company / Legal columns -->
    <div style="display:flex; gap:80px;">...</div>
  </div>
  <!-- Copyright bar -->
  <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #2A2A26; padding-top:28px;">
    <div style="font-family:'Inter',system-ui,sans-serif; font-size:13px; font-weight:300; color:#6B6B5E; line-height:16px; flex-shrink:0;">© 2026 Meridian Design Inc. All rights reserved.</div>
    <div style="font-family:'Inter',system-ui,sans-serif; font-size:13px; font-weight:300; color:#6B6B5E; line-height:16px; flex-shrink:0;">Made with care in San Francisco</div>
  </div>
</footer>
```

---

## 5. JSX Output (get_jsx)

Called with `format: "inline-styles"` on artboard `2-0`. The full output is ~300+ lines of nested JSX. Key structural observations:

### 5.1 Root Element

```jsx
<div style={{
  backgroundColor: '#FAFAF7',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  fontSize: '12px',
  fontSynthesis: 'none',
  lineHeight: '16px',
  MozOsxFontSmoothing: 'grayscale',
  overflow: 'clip',
  WebkitFontSmoothing: 'antialiased'
}}>
```

Notable root-level additions Paper injects:
- `fontSynthesis: 'none'` — prevents browser from synthesizing bold/italic
- `MozOsxFontSmoothing: 'grayscale'` + `WebkitFontSmoothing: 'antialiased'` — crisp font rendering
- `overflow: 'clip'` — prevents content overflow from creating scrollbars
- `fontSize: '12px'` + `lineHeight: '16px'` — base type scale

### 5.2 Text Node Pattern

```jsx
<div style={{
  boxSizing: 'border-box',
  color: '#1A1A16',
  fontFamily: '"Playfair Display", system-ui, sans-serif',
  fontSize: '80px',
  fontWeight: 900,
  letterSpacing: '-0.03em',
  lineHeight: '88px',
  maxWidth: '900px',
  marginBottom: '28px',
  textAlign: 'center',
  display: 'block',
  whiteSpace: 'pre'   // <-- Paper adds this for multi-line text
}}>
  Design tools built{'\n'}for the age of AI.{'\n'}Ship faster.
</div>
```

`whiteSpace: 'pre'` is automatically added to text nodes containing `\n` characters, preserving manual line breaks.

### 5.3 Button Text Color Issue

Buttons have `color: '#000000'` in the JSX output despite being on a dark background (`#1A1A16`). This happens because Paper does not perform CSS inheritance — the button text nodes do not inherit the parent container's text color. This is **exactly the same bug** that exists in Scytle's parser: `resolveCurrentColor()` also fails to properly cascade text colors in certain contexts.

### 5.4 SVG Preservation

SVG elements are preserved with full fidelity:
```jsx
<svg width="16" height="16" viewBox="0 0 16 16" fill="none"
     xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: '0' }}>
  <circle cx="8" cy="8" r="7" stroke="#1A1A16" strokeWidth="1.5" />
  <path d="M6.5 5L10.5 8L6.5 11" stroke="#1A1A16" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
</svg>
```

This is **dramatically better** than Scytle's `buildSvgNode()` / `parseSvgToNetwork()` which loses SVG data in VectorNetwork conversion. Paper keeps inline SVGs as native browser SVGs, no conversion needed.

---

## 6. Computed Styles — 7 Nodes

All 7 nodes queried simultaneously via `get_computed_styles` batch call.

### Node: `2-0` — Artboard (root Frame)
```json
{
  "display": "flex",
  "overflow": "clip",
  "width": "1440px",
  "height": "3200px",
  "flexDirection": "column",
  "left": "1450px",
  "top": "256px",
  "position": "absolute",
  "backgroundColor": "#FAFAF7"
}
```
**Key**: Artboard is `position: absolute` in the canvas coordinate space. Children are in normal flex flow.

### Node: `3-0` — Navbar Frame
```json
{
  "width": "1440px",
  "height": "72px",
  "display": "flex",
  "alignItems": "center",
  "justifyContent": "space-between",
  "flexShrink": "0",
  "paddingInline": "80px",
  "backgroundColor": "#FAFAF7",
  "borderBottomWidth": "1px",
  "borderBottomStyle": "solid",
  "borderBottomColor": "#E8E6DF"
}
```
**Key**: `border` shorthand → 3 separate border properties. `padding` shorthand → `paddingInline` (logical property).

### Node: `G-0` — Hero Frame
```json
{
  "width": "1440px",
  "display": "flex",
  "flexDirection": "column",
  "alignItems": "center",
  "flexShrink": "0",
  "paddingTop": "120px",
  "paddingRight": "80px",
  "paddingBottom": "100px",
  "paddingLeft": "80px",
  "backgroundColor": "#FAFAF7"
}
```
**Key**: Asymmetric padding expands to 4 individual longhand properties. `text-align: center` is NOT stored at the container level — it's on the Text nodes directly.

### Node: `K-0` — Hero H1 Text
```json
{
  "fontSize": "80px",
  "letterSpacing": "-0.03em",
  "lineHeight": "88px",
  "maxWidth": "900px",
  "marginBottom": "28px",
  "textAlign": "center",
  "display": "block",
  "color": "#1A1A16",
  "fontFamily": "\"Playfair Display\", system-ui, sans-serif",
  "fontWeight": 900,
  "whiteSpace": "pre"
}
```
**Key**: `fontWeight` is a **number** (900), while other properties are strings. `whiteSpace: "pre"` for multi-line. No background here — background comes from the parent Frame.

### Node: `19-0` — Feature Card 1 Frame
```json
{
  "flexGrow": "1",
  "flexShrink": "1",
  "flexBasis": "0%",
  "display": "flex",
  "flexDirection": "column",
  "borderTopLeftRadius": "4px",
  "borderBottomLeftRadius": "4px",
  "paddingBlock": "48px",
  "paddingInline": "40px",
  "gap": "20px",
  "backgroundColor": "#22221E"
}
```
**Key**: `flex: 1` → 3 properties. Only first card has left radius (first in row). `border-radius` applied per-corner only where needed.

### Node: `3A-0` — CTA Banner Frame (after Step 4 edit)
```json
{
  "width": "1440px",
  "flexShrink": "0",
  "display": "flex",
  "flexDirection": "column",
  "alignItems": "center",
  "paddingBlock": "100px",
  "paddingInline": "80px",
  "backgroundColor": "#B07840"
}
```
**Key**: `backgroundColor` changed from `#C4915A` → `#B07840` by Step 4 `update_styles` call. Change was instant and confirmed.

### Node: `3I-0` — Footer Frame
```json
{
  "width": "1440px",
  "flexShrink": "0",
  "display": "flex",
  "flexDirection": "column",
  "paddingTop": "64px",
  "paddingRight": "80px",
  "paddingBottom": "48px",
  "paddingLeft": "80px",
  "gap": "56px",
  "backgroundColor": "#1A1A16"
}
```

---

## 7. Step 4 — Editing Tool Tests

All three editing operations were run in parallel and confirmed successful.

### 7.1 `update_styles`

**Call:**
```json
{
  "updates": [
    { "nodeIds": ["3A-0"], "styles": { "backgroundColor": "#B07840", "paddingBlock": "80px" } }
  ]
}
```
**Response:**
```json
{ "updates": [{ "nodeId": "3A-0" }] }
```
**Observation:** Partial style updates are merged, not replaced. The full style object for `3A-0` persists with all existing properties; only `backgroundColor` and `paddingBlock` changed. Response is a simple confirmation array with affected node IDs.

### 7.2 `set_text_content`

**Call:**
```json
{
  "updates": [
    { "nodeId": "K-0", "textContent": "Design tools built\nfor the age of AI.\nShip faster." }
  ]
}
```
**Response:**
```json
{ "updates": [{ "nodeId": "K-0", "textContent": "Design tools built\nfor the age of AI.\nShip faster." }] }
```
**Observation:** `\n` characters are honored. Paper adds `whiteSpace: "pre"` to the node automatically when it detects newlines. The node's ID (`K-0`) was obtained from the earlier `get_computed_styles` or `get_tree_summary` call — you must know the exact Text node ID to use this tool.

### 7.3 `duplicate_nodes`

**Call:**
```json
{
  "nodes": [{ "id": "19-0", "parentId": "18-0" }]
}
```
**Response:**
```json
{
  "duplicatedNodes": [{
    "sourceId": "19-0",
    "newId": "4A-0",
    "name": "Feature Card 1",
    "component": "Frame",
    "descendantIdMap": {
      "1A-0": "4H-0",
      "1F-0": "4G-0",
      "1G-0": "4F-0",
      "1H-0": "4B-0",
      "1I-0": "4E-0",
      "1J-0": "4C-0",
      "1K-0": "4D-0",
      "1B-0": "4I-0",
      "1C-0": "4L-0",
      "1D-0": "4K-0",
      "1E-0": "4J-0"
    }
  }]
}
```
**Observation:** The `descendantIdMap` is the key feature — it maps every child node of the source to its cloned equivalent. With this map, you can immediately call `set_text_content` or `update_styles` on any child of the new clone without needing to re-query the tree. This is a thoughtful API design for batch-building repeated components.

---

## 8. Key Insights for Scytle

### 8.1 Why Paper Works Better

Paper's entire advantage is the **zero-translation architecture**:

```
LLM writes HTML/CSS → write_html() → Browser DOM renders it → DONE
No parsing. No conversion. No loss.
```

Scytle's pipeline:
```
LLM writes HTML/CSS → DOMParser → walkElement() → parseClasses() → resolveColor() → buildNode() → ScytleNode → Canvas → DONE (with bugs at every arrow)
```

Every `→` in Scytle's pipeline is a potential data loss point. Paper has one `→`.

### 8.2 Direct Parallels to Scytle's 10 Parser Bugs

| Scytle Bug | Paper's Solution | Practical Fix for Scytle |
|-----------|-----------------|--------------------------|
| **Bug 1: Icons not showing** | SVGs are native browser elements — no VectorNetwork conversion. `<path>`, `<g>`, `<mask>`, `<use>`, `<defs>` all work. | Render SVGs as `<img>` data URIs using the browser's own SVG renderer, or embed as raw HTML in canvas |
| **Bug 2: Background colors missing** | CSS is stored directly — `bg-blue-500/50` opacity modifier is a native CSS `opacity` property | Use browser's `window.getComputedStyle()` to resolve colors instead of regex parsing Tailwind class names |
| **Bug 3: Text color not matching** | No heuristic guessing. CSS cascade works. `color` on parent node inherits to children automatically | Key: Paper stores `color` per-node explicitly. No "dark background detection" needed |
| **Bug 4: Spacing issues** | `mx-auto`, negative margins, `space-x-*` — all resolved by browser's CSS engine | Use `window.getComputedStyle()` after injecting HTML into a hidden iframe to read actual pixel values |
| **Bug 5: Width/Height wrong** | Browser layout computes these. No `CHAR_WIDTH_RATIO = 0.55` guessing | Same: measure from a real browser render pass |
| **Bug 6: Flex issues** | Browser handles all flex permutations | Same |
| **Bug 7: Border/radius issues** | `border-radius` stored per-corner as computed | Parse after browser layout; `getBoundingClientRect()` + `getComputedStyle()` gives exact values |
| **Bug 8: Shadow issues** | Arbitrary `shadow-[...]` → stored as `boxShadow` string directly | Store as raw CSS string, no parsing needed |
| **Bug 9: Font issues** | Full Google Fonts support. Verified via `get_font_family_info` before using | Use browser's native font resolution |
| **Bug 10: No CSS inheritance** | Paper stores properties explicitly per node (verified in computed styles) — cascade is handled during HTML parse, not during rendering | Pre-compute inherited values using browser before building ScytleNode tree |

### 8.3 The Core Architectural Options for Scytle

**Option A: Hidden iframe approach (minimal rewrite)**
Inject the AI-generated HTML into a hidden `<iframe>` or `<div>`, call `window.getComputedStyle()` on every element after layout, then walk the computed styles to build ScytleNodes. This preserves the current ScytleNode canvas architecture while eliminating all guessing.

- Pros: Preserves existing canvas engine, editors, tools
- Cons: Requires async layout pass, iframe security, still need to walk DOM

**Option B: Paper-style native rendering (full rewrite)**
Replace the custom canvas with a real HTML DOM renderer. The AI generates HTML → it IS the design.

- Pros: Zero translation, perfect AI output, all CSS features work for free
- Cons: Major rewrite of canvas, editor tools need reimplementation

**Option C: Hybrid approach (pragmatic)**
For AI generation: use Option A (iframe + getComputedStyle) to fix parser bugs.
For manual editing: keep ScytleNode system.
For export: reverse-convert from ScytleNodes to HTML (already exists).

### 8.4 Immediate Actionable Fixes

**Fix 1: SVG rendering** (Bug 1)
Replace `buildSvgNode()` / `parseSvgToNetwork()` with:
```typescript
// Instead of converting SVG to VectorNetwork, store raw SVG
buildSvgAsImageNode(element, svgString) // data URI approach
// OR: preserve SVG as an HTML embed node in ScytleNode
```

**Fix 2: Color resolution** (Bugs 2, 3)
Replace `resolveColor()` and `classifyTextColor()` with:
```typescript
// Inject HTML into offscreen element, read getComputedStyle
const computedColor = window.getComputedStyle(element).color;
```

**Fix 3: Dimensions** (Bug 5)
Replace `estimateTextHeight()` / `estimateContainerHeight()` with:
```typescript
// After browser layout pass
const rect = element.getBoundingClientRect();
node.width = rect.width;
node.height = rect.height;
```

**Fix 4: Font support** (Bug 9)
Add Google Fonts loading before the layout pass using the same font family detection that Paper uses. Any font in the AI HTML can be loaded via `@import url('https://fonts.googleapis.com/...')`.

### 8.5 What Paper Does NOT Do That Scytle Could Offer

1. **Manual editing tools** — Paper has `update_styles`, `set_text_content` but no pen tool, gradient editor, or advanced fills. Scytle's panel-based editing is a differentiator if the canvas quality improves.
2. **Theme system** — Paper's `relinkNodes()` equivalent is planned ("Themes and tokens — real CSS") but not shipped. Scytle's semantic theme relink (warm/cool neutrals, accent mapping) is ahead of Paper here.
3. **Streaming generation** — Scytle's SSE streaming from Gemini is more interactive than Paper's batch `write_html` calls.
4. **Proprietary node types** — Paper has only Frame/Text/Rectangle/SVG. Scytle's richer node type system (gradients, vectors, images with fills) enables more sophisticated manual editing.

---

## Appendix: Paper MCP Connection Details

```
Endpoint:  http://127.0.0.1:29979/mcp
Protocol:  Standard JSON-RPC (MCP)
Auth:      None (localhost only)
Requirement: Paper Desktop app must be running with a file open
```

The MCP server auto-starts when Paper Desktop opens. Any MCP-compatible agent (Claude Code, Cursor, Claude Desktop, OpenCode) can connect without configuration beyond pointing to this endpoint.
