# Paper.design MCP Test Results — HTML Parsing Analysis

> **Date**: April 2026
> **Method**: Live MCP calls to Paper.design running on localhost (http://127.0.0.1:29979/mcp)
> **Purpose**: Test how Paper handles specific HTML patterns and compare node output with Scytle

---

## Test Setup

Paper MCP tools used:
- `create_artboard` — Create artboard from HTML string
- `read_artboard` — Get full node tree of an artboard

Each test sends identical HTML to Paper and analyzes the resulting node tree — dimensions, positions, sizing properties, and CSS preservation.

---

## Test 1: Absolute Positioning

### Input HTML

```html
<div style="position: relative; width: 100%; min-height: 600px; background: #1a1a2e;">
  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;
       background: linear-gradient(to bottom, transparent, #1a1a2e);"></div>
  <div style="position: absolute; bottom: 40px; left: 60px; right: 60px;">
    <h1 style="font-family: 'Inter'; font-size: 64px; font-weight: 800;
         color: #ffffff; margin: 0;">Hero Title</h1>
    <p style="font-family: 'Inter'; font-size: 20px; color: #a0a0b0;
         margin-top: 16px;">Subtitle text that should span the full width</p>
  </div>
</div>
```

### Paper Output Node Tree

```
Frame "Test 1 - Absolute Positioning" (21-0) 1440x900   ← artboard
  Frame (22-0) 1440x600                                  ← relative container
    Rectangle (23-0) 1440x600                             ← gradient overlay (optimized!)
    Frame (24-0) 1320x118                                 ← text group
      Text "Hero Title" (25-0) 1320x78
      Text "Subtitle..." (26-0) 1320x24
```

### Key Findings

| Property | Value | Analysis |
|----------|-------|----------|
| Container width | 1440px | `width: 100%` correctly resolves to artboard width |
| Container height | 600px | `min-height: 600px` preserved as `minHeight` |
| Gradient overlay | Rectangle (not Frame) | Paper optimizes empty divs with background to Rectangle |
| Gradient value | `linear-gradient(in oklab 180deg, ...)` | Converted to oklab color space |
| Text group width | 1320px | Correct: 1440 - 60 (left) - 60 (right) = 1320 |
| Text group position | `bottom: 40px; left: 60px; right: 60px` | CSS preserved as-is |
| Min-width safeguard | `minWidth: 1` on text frame | Paper adds this automatically |
| Margin on subtitle | `marginTop: "16px"` | Preserved as CSS, NOT converted to gap |
| Negative top | Supported | Tested in Test 4 |

### Scytle Comparison

**This is the test case that breaks Scytle's parser.** In Scytle:
- The absolutely positioned text group would **collapse to content width** via `getBoundingClientRect()`
- `left: 60px; right: 60px` intent is **lost** — only measured pixel width survives
- The gradient overlay might get wrong dimensions

Paper preserves `left: 60px; right: 60px` as CSS properties, and the canvas engine computes 1320px at render time.

---

## Test 2: Flexbox with Mixed Sizing

### Input HTML

```html
<div style="display: flex; gap: 24px; padding: 40px; background: #ffffff;">
  <div style="flex: 1; padding: 32px; background: #f5f5f5; border-radius: 12px;">
    <h3 style="font-family: 'Inter'; font-size: 24px; font-weight: 700;
         color: #1a1a1a; margin: 0;">Card One</h3>
    <p style="font-family: 'Inter'; font-size: 16px; color: #666666;
         margin-top: 12px;">Description text for the first card with enough content to wrap.</p>
  </div>
  <div style="width: 300px; padding: 32px; background: #f5f5f5; border-radius: 12px;">
    <h3 style="font-family: 'Inter'; font-size: 24px; font-weight: 700;
         color: #1a1a1a; margin: 0;">Fixed Width</h3>
    <p style="font-family: 'Inter'; font-size: 16px; color: #666666;
         margin-top: 12px;">This card has a fixed 300px width.</p>
  </div>
</div>
```

### Paper Output Node Tree

```
Frame "Test 2 - Flexbox Mixed Sizing" (27-0) 1440x900   ← artboard
  Frame (2A-0) 934.77x226                                ← flex container
    Frame (2B-0) 530.77x146                               ← flex: 1 card
      Text "Card One" (2C-0) 466.77x30
      Text "Description..." (2D-0) 466.77x20
    Frame (2E-0) 300x146                                  ← fixed width card
      Text "Fixed Width" (2F-0) 236x30
      Text "This card..." (2G-0) 236x40
```

### Key Findings

| Property | Value | Analysis |
|----------|-------|----------|
| Container width | 934.77px | **Does NOT fill artboard** — wraps to content |
| `display: flex` | Preserved | In computed styles |
| `gap: 24px` | Preserved | Between flex children |
| `flex: 1` | Decomposed to `flexGrow: "1", flexShrink: "1", flexBasis: "0%"` | Correct decomposition |
| Fixed `width: 300px` | Exactly 300px | Also gets `flexShrink: "0"` automatically |
| `border-radius: 12px` | Preserved | On both cards |
| `padding: 32px` | Stored as `paddingBlock: "32px", paddingInline: "32px"` | Logical properties |
| Text widths | 466.77px and 236px | Correct: card width minus 32px padding each side |

### Critical Observation

**The flex container is 934.77px, NOT 1440px.** Paper sizes containers to hug their content unless `width: 100%` is explicitly set. This is different from Scytle where `getComputedStyle` + iframe rendering would make a block-level div fill its parent.

**Implication for AI prompts**: The AI must explicitly set `width: 100%` on containers that should fill the artboard width.

---

## Test 3: CSS Grid Layout

### Input HTML

```html
<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;
     padding: 40px; background: #0a0a0f;">
  <div style="grid-column: span 2; padding: 40px; background: #1a1a2e;
       border-radius: 16px;">
    <h2 style="font-family: 'Inter'; font-size: 36px; font-weight: 700;
         color: #ffffff; margin: 0;">Wide Card</h2>
  </div>
  <div style="padding: 40px; background: #1a1a2e; border-radius: 16px;">
    <h2 style="font-family: 'Inter'; font-size: 24px; font-weight: 600;
         color: #ffffff; margin: 0;">Small</h2>
  </div>
</div>
```

### Paper Output Node Tree

```
Frame "Test 3 - CSS Grid Layout" (28-0) 1440x900        ← artboard
  Frame (2H-0) 545.31x204                                ← grid container
    Frame (2I-0) 303.55x124                               ← span 2 card
      Text "Wide Card" (2J-0) 223.55x44
    Frame (2K-0) 141.77x124                               ← 1-column card
      Text "Small" (2L-0) 61.77x30
```

### Key Findings

| Property | Value | Analysis |
|----------|-------|----------|
| Grid support | **Works** | Despite Paper docs saying "Do NOT use display: grid" |
| `grid-template-columns` | `"1fr 1fr 1fr"` preserved | In computed styles |
| `grid-column: span 2` | `gridColumnStart: "span 2"` preserved | Correct spanning |
| Container width | 545.31px | Wraps to content (same as flex) |
| Wide card : Small card ratio | 303.55 : 141.77 ≈ 2.14:1 | Roughly 2:1 as expected |
| `gap: 20px` | Preserved | Between grid cells |

### Grid Discrepancy

The docs say "Do NOT use display: grid", but it clearly works for parsing. The warning may refer to limitations in interactive editing (drag/resize) rather than the initial parse.

The grid cells distribute width proportionally but within the content-hugged container (545px), not the full artboard width (1440px).

---

## Test 4: Nested Absolute + Borders + Shadows

### Input HTML

```html
<div style="position: relative; padding: 60px; background: #ffffff;">
  <div style="position: relative; border: 1px solid #e0e0e0; border-radius: 16px;
       padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    <div style="position: absolute; top: -16px; left: 32px; background: #ff4d00;
         color: white; padding: 8px 20px; border-radius: 8px;
         font-family: 'Inter'; font-size: 14px; font-weight: 600;">NEW</div>
    <h2 style="font-family: 'Inter'; font-size: 32px; font-weight: 700;
         color: #1a1a1a; margin: 0; margin-top: 16px;">Feature Card</h2>
    <p style="font-family: 'Inter'; font-size: 16px; color: #666;
         margin-top: 12px;">Card with absolute badge, border, shadow, and border-radius.</p>
  </div>
</div>
```

### Paper Output Node Tree

```
Frame "Test 4 - Nested Absolute..." (29-0) 1440x900     ← artboard
  Frame (2M-0) 666.48x290                                ← outer padding wrapper
    Frame (2N-0) 546.48x170                               ← card with border
      Text "Feature Card" (2Q-0) 464.48x40
      Text "Card with absolute..." (2R-0) 464.48x20
      Frame (2O-0) 73.39x34                               ← absolute "NEW" badge
        Text "NEW" (2P-0) 33.39x18
```

### Key Findings

| Property | Value | Analysis |
|----------|-------|----------|
| `border: 1px solid #e0e0e0` | `borderWidth: "1px", borderStyle: "solid", borderColor: "#E0E0E0"` | Fully preserved |
| `border-radius: 16px` | Preserved on card | 8px on badge |
| `box-shadow` | `"#00000014 0px 4px 24px"` | rgba(0,0,0,0.08) → hex+alpha |
| Absolute badge position | `position: "absolute", top: "-16px", left: "32px"` | **Negative values preserved!** |
| Badge overflows card | Yes | `top: -16px` places badge above card boundary |
| `position: relative` | Preserved on card | Correct positioning context |
| Outer wrapper | `paddingBlock: "60px", paddingInline: "60px"` | Padding preserved |

### Child Ordering

Interesting: Paper reordered the children. In the HTML, the absolute badge `<div>` comes FIRST inside the card. In the output tree, the badge Frame (2O-0) comes AFTER the text nodes. **Paper may reorder absolute children after flow children in the tree.**

---

## Summary: Paper's Parsing Behaviors

### Container Sizing Rules

| CSS | Paper Behavior |
|-----|----------------|
| No explicit width | Hug content (does NOT fill parent) |
| `width: 100%` | Fill parent width |
| `width: Npx` | Fixed at N pixels |
| `flex: 1` | `flexGrow: 1, flexBasis: 0%` (fill available space in flex) |

**Critical**: Containers without `width: 100%` wrap to content. The AI MUST set explicit widths for full-width sections.

### Absolute Position Rules

| CSS | Paper Behavior |
|-----|----------------|
| `position: absolute` | Reparented to positioned ancestor, CSS properties preserved |
| `top/left/right/bottom` | Stored as CSS strings (e.g., `"40px"`, `"-16px"`) |
| Negative values | Fully supported |
| Coordinate computation | Deferred to canvas engine at render time |

### Optimization Rules

| Pattern | Paper Optimization |
|---------|--------------------|
| Empty div with background | Converted to Rectangle node |
| Fixed-width flex child | Auto-adds `flexShrink: 0` |
| Text frame | Auto-adds `minWidth: 1` |
| Padding | Stored as logical properties (`paddingBlock`/`paddingInline`) |
| Box shadow rgba | Converted to hex with alpha channel |
| Gradients | Converted to oklab color space |

### What This Means for Scytle

If Scytle adopts Paper's approach:
1. AI must output `style=""` attributes (or we run Tailwind → inline conversion before parsing)
2. Parser becomes ~500 lines instead of ~2200 lines
3. All absolute positioning bugs disappear
4. All sizing inference bugs disappear
5. All font race condition bugs disappear
6. Parsing goes from 5-13s to <100ms
7. Canvas engine must handle layout resolution (flex/grid computation)
