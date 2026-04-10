# Paper.design Parser — Complete Reverse Engineering Reference (v2)

> **Date**: April 7, 2026
> **Method**: Bundle analysis + live MCP testing + source extraction
> **Purpose**: Definitive reference for building Scytle's DOMParser — every behavior, edge case, and property mapping

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Complete Parser Pipeline (function `dj`)](#2-complete-parser-pipeline)
3. [Style Extraction (function `XQ`)](#3-style-extraction)
4. [Node Type Detection](#4-node-type-detection)
5. [CSS Property Mapping (function `j2e` / `nze`)](#5-css-property-mapping)
6. [Absolute Position Reparenting](#6-absolute-position-reparenting)
7. [Text Handling & Merging](#7-text-handling--merging)
8. [Image Handling](#8-image-handling)
9. [SVG Handling](#9-svg-handling)
10. [Live MCP Test Results (10 Tests)](#10-live-mcp-test-results)
11. [Property-by-Property Mapping Reference](#11-property-by-property-mapping-reference)
12. [Scytle Parser Inventory (What We Must Replicate)](#12-scytle-parser-inventory)
13. [Implementation Checklist](#13-implementation-checklist)

---

## 1. Architecture Overview

Paper's parser takes an HTML string and outputs a tree of nodes **without rendering**.

```
HTML string → JUe (fix self-closing tags) → DOMParser.parseFromString()
→ TreeWalker → XQ (extract inline styles) → Node type assignment
→ j2e/nze (CSS→node property mapping) → Absolute reparenting
→ Z-index sort → Image uploads → Clean tree output
```

**Key architectural decisions:**
- `DOMParser()` only — NO iframe, NO rendering, NO `getComputedStyle()`
- Reads `element.style[i]` (inline styles) — NOT computed styles
- CSS intent preserved as strings — NOT resolved to pixels
- Layout resolution deferred to canvas engine at render time

### File Locations in Paper Bundle

| Item | File | Byte Offset |
|------|------|-------------|
| `dj` (main parser) | paper-bundle.js | ~1,760,679 |
| `JUe` (self-closing fixer) | paper-bundle.js | ~1,759,812 |
| `XQ` (style extraction) | paper-bundle.js | ~1,717,272 |
| `j2e` (CSS property mapping) | paper-bundle.js | ~1,717,949 |
| `nze` (CSS parser class) | paper-bundle.js | ~1,766,200 |
| `k2e` (abs reparenting) | paper-bundle.js | ~1,720,900 |
| `E2e` (flex-to-text) | paper-bundle.js | ~1,716,391 |
| `h8` (fills parser) | paper-bundle.js | ~1,222,798 |
| `rS` (shadows parser) | paper-bundle.js | ~1,155,273 |
| `sQ` (borders parser) | paper-bundle.js | ~1,261,351 |
| `rQ` (padding parser) | paper-bundle.js | ~1,248,365 |
| `lQ` (border-radius) | paper-bundle.js | ~1,274,095 |
| `dQ` (font resolver) | paper-bundle.js | ~1,293,212 |

---

## 2. Complete Parser Pipeline

### Step 1: Self-Closing Tag Fix (`JUe`)

```js
const VOID_ELEMENTS = new Set([
  "area","base","br","col","embed","hr","img","input",
  "link","meta","param","source","track","wbr"
]);

function fixSelfClosingTags(html) {
  return html.replace(/<([\w-]+)(\s[^>]*)?\s*\/>/gi, (match, tag, attrs = "") =>
    VOID_ELEMENTS.has(tag.toLowerCase()) ? match : `<${tag}${attrs}></${tag}>`
  );
}
```

Converts `<div />` → `<div></div>` but leaves `<img />`, `<br />` etc. as-is.

### Step 2: DOM Parsing

```js
const doc = new DOMParser().parseFromString(fixedHtml, "text/html");
const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ALL,
  node => node.nodeType === Node.COMMENT_NODE
    ? NodeFilter.FILTER_REJECT
    : NodeFilter.FILTER_ACCEPT
);
```

- Parses as `text/html` (not XML)
- Comments are REJECTED (skipped)
- Walks `doc.body` — everything under `<body>` tag

### Step 3: Tree Walking & Node Creation

For each DOM node, the walker creates a Paper node (`h(element, existingNode)`):

1. **Component type detection:**
   - HTMLElement with `childNodes.length > 0` OR has `layer-name` attribute → `"Frame"`
   - Text node → `"Text"`
   - Everything else (empty elements) → `"Rectangle"`

2. **Style extraction:** Calls `XQ(element)` — see Section 3

3. **Label assignment (priority order):**
   - `layer-name` attribute value
   - HTMLInputElement → "Input"
   - HTMLSelectElement → "Select"
   - HTMLTextAreaElement → "Text Area"
   - HTMLButtonElement → "Button"
   - Otherwise → component type name

4. **Absolute reparenting:** If `element.style.position === "absolute"`, calls `d(element, node)` — see Section 6

### Step 4: Special Element Handling

During the walk, elements are dispatched:

| Element Type | Handling |
|---|---|
| `<svg>` or `<img src="*.svg">` | Parsed via dedicated SVG parser (`sJ`/`rJ`) → SVGVisualElement |
| Text nodes | Extracted via `pJ()`, merged or kept separate (see Section 7) |
| `<x-paper-clone node-id="...">` | Clones existing Paper node by ID with style overrides |
| `<img src="...">` | Image upload queued via `imageState.uploadUrl()` |
| Other HTMLElements | Create Frame/Rectangle via `h()`, text children may be collapsed |

### Step 5: Post-Processing

1. **`gJ()`** — Runs CSS parser `j2e`/`nze` on each node (fills, borders, shadows, etc.)
2. **`yJ()`** — Z-index reordering (`N2e`) + edge-pinning lock detection (`L2e`)
3. **Image settlement** — Resolves upload promises, maps `objectFit` to fill sizing
4. **`vJ()`** — Strips `.element` and `.parent` refs, returns clean `{node, children}[]`

---

## 3. Style Extraction (function `XQ`)

The **critical difference** from Scytle. Paper reads `element.style` (inline only), NOT `getComputedStyle()`.

```js
function extractStyles(element) {
  const styles = {};
  if (element instanceof Text) return styles;  // Text nodes get empty styles

  for (let i = 0; i < element.style.length; i++) {
    const rawProp = element.style[i] + "";
    const camelProp = rawProp.startsWith("-") ? vendorPrefix(camelCase(rawProp)) : camelCase(rawProp);
    styles[camelProp] = element.style.getPropertyValue(rawProp);
  }
  // ... normalizations below
}
```

### Normalizations Applied

| Condition | Action |
|---|---|
| `display === "flow-root"` AND `WebkitLineClamp` set | Change to `display: "-webkit-box"` |
| `position` is `sticky`, `static`, or unset | DELETE `top`, `bottom`, `left`, `right` |
| `display === "block"` AND element is `<button>` | ADD `alignContent: "center"` |
| `display === "inline-block"` AND element is `<button>` | ADD `alignContent: "center"` |
| Always | DELETE `boxSizing` |
| `display === "list-item"` | DELETE display |
| `display` is empty AND tag is inline (`SPAN, A, STRONG, EM, B, I, U`) | SET `display: "inline-block"` |
| `display` is empty AND tag is NOT inline | DELETE display |

### Tag Classification Sets

**Block elements (`dJ`):**
ADDRESS, ARTICLE, ASIDE, BLOCKQUOTE, CANVAS, DD, DETAILS, DIALOG, DIV, DL, DT, FIELDSET, FIGCAPTION, FIGURE, FOOTER, FORM, H1-H6, HEADER, HGROUP, HR, LI, MAIN, NAV, NOSCRIPT, OL, P, PRE, SECTION, SUMMARY, TABLE, TFOOT, UL, VIDEO

**Inline elements (`I2e`):**
SPAN, A, STRONG, EM, B, I, U

**Inline elements (extended, `fJ`):**
A, ABBR, ACRONYM, B, BDO, BIG, BR, BUTTON, CITE, CODE, DFN, EM, I, IMG, INPUT, KBD, LABEL, MAP, OBJECT, OUTPUT, Q, SAMP, SELECT, SMALL, SPAN, STRONG, SUB, SUP, TEXTAREA, TIME, TT, U, VAR

**Non-text elements (`$Ue`):**
BUTTON, CANVAS, IFRAME, IMG, INPUT, OBJECT, SELECT, SVG, TEXTAREA, VIDEO

---

## 4. Node Type Detection

| Condition | Node Type | Example |
|---|---|---|
| HTMLElement with children | **Frame** | `<div><p>...</p></div>` |
| HTMLElement with `layer-name` attr | **Frame** (named) | `<div layer-name="Hero">` |
| HTMLElement with NO children | **Rectangle** | `<div style="width:64px;height:64px;background:blue">` |
| Text DOM node | **Text** | Raw text content |
| `<img>` with src | **Rectangle** (with image fill) | `<img src="...">` |
| `<svg>` (simple) | **SVGVisualElement** | SVG with ≤8 paths |
| `<input>` | **Frame** (labeled "Input") | |
| `<select>` | **Frame** (labeled "Select") | |
| `<textarea>` | **Frame** (labeled "Text Area") | |
| `<button>` | **Frame** (labeled "Button") | |

### Empty Div Optimization (Confirmed via Live Tests)

Empty divs that have visual properties (background, dimensions) but NO children become **Rectangle** nodes, not Frames. This is more efficient — Rectangles are simpler leaf nodes.

**Confirmed in tests:**
- 64x64 blue square → Rectangle
- Gradient placeholder (100% x 200px) → Rectangle
- Image elements → Rectangle with backgroundImage fill

---

## 5. CSS Property Mapping (function `j2e` / `nze`)

The CSS parser class `nze` has a `parse(styles, {isTextNode})` method that processes styles differently for text vs frame nodes.

### 5.1 Fills (`h8.fromCss()`)

**Parsing order** (later = on top visually):

1. **`backgroundImage`** — Split by commas (respecting parens), each chunk:
   - `linear-gradient(...)` → parse angle + color stops, convert to OKLab
   - `radial-gradient(...)` → parse center + dimensions + stops
   - `conic-gradient(...)` → parse from-angle + center + stops
   - `url(...)` → image fill with URL, map backgroundSize/Repeat/Position
   - Solid gradient (single color) → solid fill

2. **`backgroundColor`** — If not transparent, becomes solid fill (below gradients)

3. **`color`** (text only) — Becomes text fill. Default: `#000000`

### 5.2 Borders (`sQ.fromCss()`)

Each side parsed independently:
```
Check: borderTopWidth exists AND borderTopStyle !== "none"
  → Parse borderTopColor
  → Default style to "solid"
  → {isVisible: true, width, color, style, type: "color"}
```

If all 4 sides identical → stored as `{all: value}`. Otherwise `{top, right, bottom, left}`.

### 5.3 Shadows (`rS.fromCss()`)

Parses `boxShadow`, `textShadow`, AND `filter: drop-shadow(...)`:

- Split by commas (outside parens)
- For each: detect `inset`, extract color, extract px values
- Creates `{offsetX, offsetY, blur, spread, color, isVisible: true}`
- Inset → `inner` array; others → `outer` array
- Zero-alpha shadows skipped

**Shadow type detection (`KZ`):**
- `filter` contains `drop-shadow` → `Filter` type
- `boxShadow` exists and not inset-only → `BoxShadow` type

### 5.4 Padding (`rQ.fromCss()`)

Reads `paddingTop/Right/Bottom/Left`:
- If vertical pair equal AND horizontal pair equal → `{paddingBlock, paddingInline}`
- Otherwise → individual `paddingTop/Right/Bottom/Left`
- `"0px"` values omitted

### 5.5 Border Radius (`lQ.fromCss()`)

Reads all 4 corners:
- All equal → single `borderRadius` (≥9998 treated as "max"/pill)
- Otherwise → individual corners, `"0px"` omitted

### 5.6 Fonts (`dQ.fromCss()` → `uke()`)

1. Extract `fontFamily`, split comma-separated families
2. For each family:
   - Skip emoji fonts
   - Map generics (sans-serif → "System Sans-Serif", etc.)
   - Check local fonts, Google fonts, system fonts
   - Fuzzy match as fallback (`stringSimilarity`)
3. No match → default "System Sans-Serif Regular 400"
4. Variable fonts: reads `fontWeight`, `fontStretch`, `fontVariationSettings`

### 5.7 Post-Parse Cleanup

Properties deleted from frame styles: `fontSize, lineHeight, textAlign, fontFamily, fontWeight, fontStyle, letterSpacing, textTransform, textDecoration, whiteSpace, wordBreak, textIndent, textOverflow, direction, unicodeBidi`

Properties always deleted: `animation, background (shorthand), border (individual sides), box-shadow, color, cursor, filter (after extraction), font-family/weight/style, outline, text-decoration, transition, transform-origin`

Default values deleted: `display: "block"`, `borderImage: "none"`, etc.

### 5.8 Overflow Normalization

`overflow` → collapsed to `"clip"` (both axes). Paper converts `overflow: hidden` to `overflow: clip`.

### 5.9 Gap Normalization

`columnGap`/`rowGap` → collapsed to single `gap` value if both equal.

### 5.10 Display Normalization (for frames)

`display: "inline"` → normalized to `"block"` (frames are always block-level in canvas)

---

## 6. Absolute Position Reparenting

### Finding Positioned Ancestor (`k2e`)

```js
function findPositionedAncestor(element) {
  let parent = element.parentElement;
  while (parent) {
    if (["relative","absolute","fixed","sticky"].includes(parent.style.position)
        || (parent.style.transform && parent.style.transform !== "none"))
      return parent;
    parent = parent.parentElement;
  }
  return null;
}
```

Walks up DOM, returns first ancestor with position (relative/absolute/fixed/sticky) or transform.

### Reparenting Behavior

When `position: absolute` is detected:
1. Node is **removed** from its DOM parent's children list in the Paper tree
2. Node is **inserted** as a child of the positioned ancestor's tree node
3. `top/left/right/bottom` values stay as-is (CSS strings, not resolved)
4. Only `absolute` and `fixed` positions preserve these values — `static/sticky` positions cause them to be deleted by `XQ`

### Z-Index Reordering (`N2e`)

After reparenting, siblings are reordered by z-index. Effective z-index computed with +1/-1 offset for stacking context creators.

### Edge-Pinning Lock Detection (`L2e`)

If the last sibling is absolutely positioned and ALL inset values (top/right/bottom/left) are within [-3, 3]px → marked as `isLocked = true`.

### Root-Level Style Stripping (`S2e`)

When nodes are at document root level, these are deleted: `position, top/left/right/bottom, margin (all), min/maxWidth/Height, transform, translate, rotate, scale`

### Root Width/Height Normalization (`C2e`)

At root level: `width: "100%"` → `"fit-content"`, `height: "100%"` → `"fit-content"`

---

## 7. Text Handling & Merging

### Text-Like Check (`R8`)

An element is "text-like" if:
- It's a Text node or `<BR>`
- It's an inline element (from `fJ` set) whose children are all text-like
- BUT NOT if it's in the non-text set (`$Ue`: BUTTON, CANVAS, IFRAME, IMG, INPUT, etc.)

### Text Merging Conditions

When an HTMLElement is processed:
1. Parent display is block/inline/inline-block/list-item/flow-root, OR tag is block/inline
2. Has 2+ child nodes
3. ALL children are text-like
4. Extracted text is non-empty

When merged:
- All child nodes removed
- Replaced with single text node
- `whiteSpace` set to `"pre"` to preserve spacing

### Whitespace Handling (`pJ`)

| `white-space` | Behavior |
|---|---|
| `pre` / `pre-wrap` | Return raw text as-is |
| `pre-line` | Collapse spaces within lines, keep newlines |
| Normal (default) | Collapse all whitespace to single spaces, trim edges |

### Flex-to-Text Conversion (`E2e`)

When a flex container's children are ALL text-like:
- `justifyContent` → mapped to `textAlign` (center→center, flex-end→right, etc.)
- `alignItems` → mapped to `alignContent` (center→center, flex-end→end)
- `inline-flex` → `inline-block`; `flex` → delete display
- Delete: justifyContent, alignItems, flexDirection, flexWrap, gap, rowGap, columnGap

### Visual Box Check (`GQ`)

Returns true if element has ANY of: boxShadow, outlineWidth, borderWidth (any side), borderRadius (any corner), backgroundColor, backgroundImage (unless `backgroundClip: text`)

---

## 8. Image Handling

### Upload Flow

When `<img src="...">` is encountered:
1. `imageState.uploadUrl({url, onImageAccepted, onImageRejected})` → queues upload
2. Image re-hosted on Paper's CDN (`app.paper.design/file-assets/...`)
3. After upload, dimensions used to set sizing

### Dimension Logic

- Neither width nor height set → use natural dimensions, set `aspectRatio`
- Only one dimension set → set `aspectRatio` to maintain proportions
- `min/maxWidth/Height` used as fallback size sources
- `aspectRatio` computed as GCD-reduced ratio (e.g., "16 / 9")

### object-fit Mapping

| CSS `object-fit` | Paper Fill Property |
|---|---|
| `fill` | `sizeX: "100%", sizeY: "100%"` |
| `cover` | `sizeX: "cover"` → `backgroundSize: "cover"` |
| `contain` | `sizeX: "contain"` → `backgroundSize: "contain"` + `backgroundRepeat: "no-repeat"` |
| `none` | `sizeX: "auto"` |
| `scale-down` | `sizeX: "contain"` |

### Live Test Confirmation

- `<img>` elements become **Rectangle** nodes (not Frame or Image type)
- Image src is re-hosted on Paper CDN
- Container frames get `overflow: "clip"` and `flexShrink: "0"` automatically
- Alt text becomes node name

---

## 9. SVG Handling

### Two-Tier Strategy

1. **Simple SVGs** (≤8 paths, no mask/clipPath/linearGradient/radialGradient/use/filter/pattern/image):
   - Parsed via dedicated SVG parser → `SVGVisualElement` node
   - Fill resolved via `resolveCurrentColor()`
   - Stroke from SVG attributes (not computed style)

2. **Complex SVGs**:
   - Serialized to data URI
   - `currentColor` references resolved before serialization
   - Result: Rectangle with ImageFill

---

## 10. Live MCP Test Results

### Test 1: Tailwind Classes — COMPLETELY IGNORED

Input: `class="flex gap-6 p-10 bg-white"` on container
Result: `{}` — no styles extracted. Text defaults to 16px/400/black.

**Tailwind-to-inline conversion is MANDATORY.**

### Test 2: Mixed Tailwind + Inline — Only Inline Survives

Input: `class="flex gap-6"` + `style="padding: 40px; background: #ffffff;"`
Result: Padding and background preserved, flex and gap lost (from class only).

**All-or-nothing per property. Must convert ALL Tailwind to inline.**

### Test 3: Gradients + Multiple Shadows — Full Support

- `linear-gradient(135deg, #667eea, #764ba2)` → preserved (colors → OKLab)
- Multiple `box-shadow` → preserved comma-separated
- `rgba()` → hex+alpha (`#0000001A`)

### Test 4: CSS Grid — Works (Despite Docs Saying Don't)

- `grid-template-columns: repeat(3, 1fr)` → preserved verbatim
- `grid-column: span 2` → `gridColumnStart: "span 2"` + `gridColumnEnd: "auto"`
- Gap, border, border-radius all work

### Test 5: Nested Flex — Golden Path

- `flex-shrink: 0` preserved on fixed-size elements
- `flex: 1` → `flexGrow: "1", flexShrink: "1", flexBasis: "0%"`
- Empty styled divs → Rectangle (not Frame)

### Test 6: Overflow + Border Radius

- `overflow: hidden` → `overflow: "clip"`
- Border-radius clipping works on children
- `line-height: 1.5` → `round(up, 150%, 1px)`

### Test 7: Text Truncation — Normalized to Line Clamp

- `white-space: nowrap; text-overflow: ellipsis` → `-webkit-line-clamp: 1`
- `-webkit-line-clamp: 3` → preserved directly
- Both converge to same internal representation

### Test 8: Images — Become Rectangles

- `<img>` → Rectangle with `backgroundImage`, `backgroundSize`, `backgroundPosition`
- `object-fit: cover` → `backgroundSize: "cover"`
- `object-fit: contain` → `backgroundSize: "contain"` + `backgroundRepeat: "no-repeat"`

### Test 9: Absolute Positioning

- `position: relative` → **DROPPED** (only `absolute` stored)
- `transform: translate(-50%, -50%)` → `translate: "-50% -50%"` (modernized)
- Inset pinning (`top:0; left:0; right:0; bottom:0`) → preserved perfectly
- `bottom: 24px; right: 24px` → preserved

### Test 10: Margins — Preserved

- `margin: 0 0 24px 0` → split to individual sides
- `margin-top: 16px` on flex child → preserved
- `margin: 0` → all four sides explicitly "0px"

---

## 11. Property-by-Property Mapping Reference

### Layout Properties → ScytleNode

| CSS Property | Paper Behavior | Scytle Mapping |
|---|---|---|
| `display: flex` | Preserved | `layout.mode = 'flex'` |
| `display: inline-flex` | Preserved | `layout.mode = 'flex'` |
| `display: grid` | Preserved | `layout.mode = 'grid'` |
| `display: block` | Deleted (default) | `layout.mode = 'flex', direction = 'column'` |
| `display: inline` | → `"block"` for frames | Skip or flex-col |
| `display: none` | Skip element | Skip element |
| `flex-direction` | Preserved | `layout.direction` |
| `justify-content` | Preserved | `layout.justify` |
| `align-items` | Preserved | `layout.align` |
| `flex-wrap` | Preserved | `layout.wrap` |
| `gap` | Preserved | `layout.gap` |
| `column-gap` / `row-gap` | Collapsed to `gap` if equal | `layout.columnGap/rowGap` |
| `grid-template-columns` | Preserved verbatim | `layout.columns` |
| `grid-column: span N` | → `gridColumnStart: "span N"` | `gridColumnSpan` |
| `flex-grow` | Preserved | `layoutGrow` |
| `flex-shrink` | Preserved; auto-added `"0"` for fixed-width | `flexShrink` |
| `flex-basis` | Preserved | `flexBasis` |
| `flex: 1` | Decomposed to grow/shrink/basis | grow=1, shrink=1, basis=0% |
| `align-self` | Preserved | `alignSelf` |
| `order` | Preserved | `order` |

### Sizing Properties → ScytleNode

| CSS Property | Paper Behavior | Scytle Mapping |
|---|---|---|
| `width: 100%` | Preserved | `sizing.horizontal = 'fill'` |
| `width: Npx` | Preserved | `width = N, sizing.horizontal = 'fixed'` |
| `width: auto` / not set | Preserved | `sizing.horizontal = 'hug'` |
| `height: Npx` | Preserved | `height = N, sizing.vertical = 'fixed'` |
| `height: auto` / not set | Preserved | `sizing.vertical = 'hug'` |
| `min-width` | Preserved | `minWidth` |
| `max-width` | Preserved | `maxWidth` |
| `min-height` | Preserved | `minHeight` |
| `max-height` | Preserved | `maxHeight` |
| `aspect-ratio` | Preserved | Compute height from width and ratio |

### Spacing Properties → ScytleNode

| CSS Property | Paper Behavior | Scytle Mapping |
|---|---|---|
| `padding` (shorthand) | Split to block/inline or individual | `padding: {top,right,bottom,left}` |
| `padding-top/right/bottom/left` | Preserved | `padding.top/right/bottom/left` |
| `margin` (shorthand) | Split to individual sides | `margin: {top,right,bottom,left}` |
| `margin-top/right/bottom/left` | Preserved | `margin.top/right/bottom/left` |

### Position Properties → ScytleNode

| CSS Property | Paper Behavior | Scytle Mapping |
|---|---|---|
| `position: absolute` | Preserved; reparented | `positioning = 'absolute'` |
| `position: fixed` | Preserved | `positioning = 'absolute'` |
| `position: relative` | DROPPED | `positioning = 'auto'` (but set on ancestor for context) |
| `position: static/sticky` | DROPPED; delete top/left/etc | `positioning = 'auto'` |
| `top/left/right/bottom` | Preserved as CSS strings | Preserve for canvas engine |
| `z-index` | Used for reordering, then dropped | Node order in tree |

### Visual Properties → ScytleNode

| CSS Property | Paper Behavior | Scytle Mapping |
|---|---|---|
| `background-color` | → solid fill | `fills: [SolidFill]` |
| `linear-gradient(...)` | → gradient fill (colors → OKLab) | `fills: [GradientFill]` |
| `radial-gradient(...)` | → gradient fill | `fills: [GradientFill]` |
| `background-image: url(...)` | → image fill | `fills: [ImageFill]` |
| `opacity` | Preserved | `opacity` |
| `overflow: hidden` | → `"clip"` | `overflow: 'hidden'` |
| `border-radius` | Preserved (≥9998 → pill) | `borderRadius` |
| `border` | Split to width/style/color per side | `border: {width, color, style}` |
| `box-shadow` | Parsed to offset/blur/spread/color | `shadows: [Shadow]` |
| `filter: blur(Npx)` | → layer blur | `layerBlur` |
| `filter: drop-shadow(...)` | → outer shadow | `shadows: [Shadow]` |

### Typography Properties → ScytleNode (TextNode)

| CSS Property | Paper Behavior | Scytle Mapping |
|---|---|---|
| `font-family` | Preserved; resolved to known font | `fontFamily` |
| `font-size` | Preserved | `fontSize` |
| `font-weight` | Preserved | `fontWeight` |
| `font-style` | Preserved | `fontStyle` |
| `color` | → text fill | `color` |
| `line-height` | Preserved (relative → computed) | `lineHeight` |
| `letter-spacing` | Preserved | `letterSpacing` |
| `text-align` | Preserved | `textAlign` |
| `text-transform` | Preserved | `textTransform` |
| `text-decoration` | Preserved | `textDecoration` |
| `white-space` | Affects text merging/wrapping | Preserve for wrapping behavior |
| `-webkit-line-clamp` | Preserved | `maxLines` |
| `text-overflow: ellipsis` | Normalized to line-clamp: 1 | `textTruncation = 'ending'` |

### Transform Properties → ScytleNode

| CSS Property | Paper Behavior | Scytle Mapping |
|---|---|---|
| `transform: translate(...)` | Modernized to `translate` property | Preserve translate value |
| `transform: rotate(...)` | Extracted | `rotation` |
| `transform: scale(...)` | Extracted | Scale is unusual in design tools |

---

## 12. Scytle Parser Inventory (What We Must Replicate)

### ScytleNode Types

```typescript
ScytleNode = FrameNode | TextNode | ImageNode | VectorNode
```

**FrameNode**: `children`, `layout` (mode, direction, justify, align, gap, wrap, columns, rows), `padding`, `layoutGrow`, `flexShrink`, `flexBasis`, `order`, `alignSelf`, `gridColumnSpan`, `gridRowSpan`

**TextNode**: `characters`, `fontFamily`, `fontWeight`, `fontStyle`, `fontSize`, `lineHeight`, `letterSpacing`, `textAlign`, `textTransform`, `textDecoration`, `autoResize`, `maxLines`, `textTruncation`, `color`, `htmlTag` + theme refs

**ImageNode**: `src`, `alt`, `fit`, `isPlaceholder`, `placeholderLabel`

**VectorNode**: `vectorNetwork`, `vectorPaths`, `strokeWeight`, `strokeColor`, etc.

**BaseNodeProperties** (shared): `id`, `name`, `x`, `y`, `width`, `height`, `sizing`, `positioning`, `opacity`, `overflow`, `borderRadius`, `fills`, `border`, `shadows`, `layerBlur`, `margin`, `autoMargin`, `minWidth`, `maxWidth`, `minHeight`, `maxHeight`, `constraints` + theme refs

### Current Iframe Parser Property Coverage

All these properties are currently extracted via `getComputedStyle()` and must be replicated via `element.style` in the DOMParser:

**Layout** (25 properties): display, flex-direction, justify-content, align-items, flex-wrap, gap, column-gap, row-gap, grid-template-columns, grid-template-rows, grid-column-start/end, grid-row-start/end, flex-grow, flex-shrink, flex-basis, align-self, position

**Sizing** (8 properties): width, height, min-width, max-width, min-height, max-height, aspect-ratio, box-sizing

**Spacing** (8 properties): padding (4 sides), margin (4 sides)

**Visual** (15+ properties): background-color, background-image, opacity, overflow, border-radius (4 corners), border (width/style/color × 4 sides), box-shadow, filter

**Typography** (12 properties): font-family, font-size, font-weight, font-style, color, line-height, letter-spacing, text-align, text-transform, text-decoration, text-overflow, -webkit-line-clamp, white-space

### Theme Linking (Must Preserve)

- `buildLinkMaps()` — builds reverse lookup: hex → variable key
- `relinkNodes()` — post-parse semantic linking
- Maps: colorMap, fontMap, fontSizeMap, radiusMap, spacingMap, shadowMap
- Theme refs: `colorRef`, `fontFamilyRef`, `fontSizeRef`, `paddingRef`, `borderRadiusRef`, `shadowRef`

### Naming Heuristics (Must Preserve)

`inferNodeName()` priority: aria-label → data-name → semantic tag → class heuristics → heading text → button text → "Frame"

---

## 13. Implementation Checklist

### Must Have (P0)

- [ ] Self-closing tag fix (regex from Paper)
- [ ] DOMParser + TreeWalker setup
- [ ] Inline style extraction (`element.style[i]` iteration)
- [ ] Tailwind-to-inline conversion (TW v4 `candidatesToCss()` API)
- [ ] Node type detection (Frame/Text/Rectangle/Image)
- [ ] Layout mapping (flex, grid, gap, align, justify, wrap)
- [ ] Sizing preservation (width/height as CSS strings → fill/hug/fixed)
- [ ] Padding extraction (shorthand expansion)
- [ ] Border extraction (per-side)
- [ ] Border-radius extraction
- [ ] Shadow parsing (multi-shadow, inset detection)
- [ ] Fill parsing (solid color, gradients, image URLs)
- [ ] Font property extraction
- [ ] Text content extraction with whitespace handling
- [ ] Absolute position reparenting to positioned ancestor
- [ ] Overflow mapping (hidden → clip concept)
- [ ] Theme linking integration (reuse existing buildLinkMaps/relinkNodes)
- [ ] Margin preservation

### Should Have (P1)

- [ ] Text merging (adjacent inline nodes → single text)
- [ ] Empty div → Rectangle optimization
- [ ] Form element handling (input/select/textarea/button labels)
- [ ] Image upload + object-fit mapping
- [ ] SVG parsing (simple → VectorNode, complex → data URI)
- [ ] z-index reordering of absolute children
- [ ] Text truncation normalization (nowrap+ellipsis → line-clamp)
- [ ] Flex-to-text conversion for text-only flex containers
- [ ] `layer-name` attribute support
- [ ] Node naming heuristics

### Nice to Have (P2)

- [ ] Edge-pinning lock detection
- [ ] `x-paper-clone` equivalent
- [ ] Variable font support
- [ ] `backgroundClip: text` handling
- [ ] `translate` property (modernized transform)
- [ ] Conic gradient support

---

## Key Differences from Scytle's Iframe Parser

| Aspect | Iframe Parser | DOMParser |
|---|---|---|
| **Rendering** | Real browser layout | No rendering |
| **Style source** | `getComputedStyle()` | `element.style[i]` |
| **Tailwind** | CDN resolves classes | Must pre-convert to inline |
| **Sizing** | Measured pixels → heuristic inference | CSS intent preserved directly |
| **Position** | `getBoundingClientRect()` deltas | CSS strings (top/left/right/bottom) |
| **Font loading** | Wait for Google Fonts in iframe | Font name preserved as string |
| **Image loading** | Wait for img.onload | Upload asynchronously |
| **Speed** | 5-13 seconds | <100ms |
| **Lines of code** | ~2200 | ~400-600 |
| **Accuracy** | ~85% (heuristic errors) | ~99% (CSS intent preserved) |
| **Layout resolution** | Parser computes | Canvas engine computes |
