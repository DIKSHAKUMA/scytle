# Paper.design MCP Parser Test Results

**Date**: 2026-04-07
**Server**: http://127.0.0.1:29979/mcp (Streamable HTTP + SSE)

---

## Test 1: Tailwind Classes vs Inline Styles

**Input**: `class="flex gap-6 p-10 bg-white"` on container, Tailwind utility classes on all children.

**Computed styles on outer div (3E-0)**:
```json
{ "position": "absolute" }
```
**Computed styles on inner card (3F-0)**: `{}` (empty)

**Computed styles on h3 text (3G-0)**:
```json
{ "fontSize": "16px", "color": "#000000", "fontFamily": "system-ui, sans-serif", "fontWeight": 400 }
```

**FINDING**: **Paper completely ignores Tailwind classes.** Zero CSS properties from `class=` survived:
- No `display: flex`, no `gap`, no `padding`, no `background`
- No `font-weight: bold`, no `text-2xl`, no `text-gray-900`
- Text fell back to 16px/400/black/system-ui defaults
- Outer div got only `position: absolute` (Paper's default for top-level inserted frames)
- Inner div had NO styles at all

**Implication for Scytle**: Tailwind-to-inline conversion is **mandatory**. Any AI-generated HTML with Tailwind classes will produce completely unstyled layouts if not preprocessed.

---

## Test 2: Mixed Tailwind + Inline Styles

**Input**: `class="flex gap-6"` + `style="padding: 40px; background: #ffffff;"` on outer div.

**Computed styles on outer div (3I-0)**:
```json
{ "paddingBlock": "40px", "paddingInline": "40px", "position": "absolute", "backgroundColor": "#FFFFFF" }
```
**Note**: No `display: flex`, no `gap: 24px` — those were in `class=` only.

**Computed styles on inner card (3J-0)**: `flex: 1`, padding, bg, border-radius all preserved (from inline styles).

**FINDING**: **Inline styles are fully preserved; class-based styles are fully ignored.** Even when both are present on the same element, only `style=` matters. The `class="flex gap-6"` added no flex or gap to the outer div.

**Implication**: We must convert ALL Tailwind classes to inline styles. There is no partial processing — it is all-or-nothing per property.

---

## Test 3: Complex Gradient + Multiple Shadows

**Gradient outer div (3L-0)**:
```json
{ "backgroundImage": "linear-gradient(in oklab 135deg, oklab(62.7% 0.004 -0.164) 0%, oklab(50.1% 0.079 -0.114) 100%)" }
```

**White card with shadows (3M-0)**:
```json
{ "boxShadow": "#0000001A 0px 4px 6px, #00000026 0px 10px 30px" }
```

**FINDINGS**:
- **Gradients**: Fully parsed. Paper converts hex colors to OKLab color space internally (`#667eea` → `oklab(62.7% 0.004 -0.164)`). The angle (135deg) and stops are preserved.
- **Multiple box-shadows**: Both shadows preserved in a single comma-separated `boxShadow` value. `rgba(0,0,0,0.1)` → `#0000001A` (hex+alpha).
- **margin: 0** on h2 was preserved as `marginTop/Right/Bottom/Left: 0px`
- **margin-top: 16px** on p was preserved as `marginTop: 16px`

**Implication**: Our DOMParser can pass gradients and multi-shadow values straight through. Paper handles the color space conversion. No need to pre-process gradient syntax.

---

## Test 4: CSS Grid with Spanning + Gap

**Grid container (2X-0)**:
```json
{
  "display": "grid",
  "gridTemplateColumns": "repeat(3, 1fr)",
  "gap": "24px",
  "width": "100%",
  "paddingBlock": "40px", "paddingInline": "40px",
  "backgroundColor": "#F8F9FA"
}
```

**Span-2 cell (2Y-0)**: `"gridColumnStart": "span 2", "gridColumnEnd": "auto"`
**Full-width cell (34-0)**: `"gridColumnStart": "span 3", "gridColumnEnd": "auto"`
**Normal cell (30-0)**: No grid-column properties (defaults)

**Tree sizes**: Span-2 = 605px wide, Single = 291px wide, Full-width = 920px wide

**FINDINGS**:
- **CSS Grid is FULLY SUPPORTED**. This contradicts Paper's own docs which say "Do NOT use display: grid". Yet the parser handled it perfectly.
- `grid-template-columns: repeat(3, 1fr)` preserved verbatim
- `grid-column: span 2` → split into `gridColumnStart: "span 2"` + `gridColumnEnd: "auto"`
- Gap, padding, background all preserved
- Border `1px solid #e5e7eb` split into `borderWidth`, `borderStyle`, `borderColor`
- Actual rendered widths show correct proportional sizing (605 vs 291 for 2:1 ratio with gaps)

**Implication**: Grid works in Paper's parser even though docs discourage it. However, Paper's own write_html docs say "Do NOT use display: grid" — so this may be fragile/unsupported. We should still prefer flex-based layouts but can use grid as a fallback.

---

## Test 5: Nested Flex with Various Sizing

**Outer column (36-0)**: `display: flex, flexDirection: column, gap: 24px, width: 100%`
**Inner row (37-0)**: `display: flex, gap: 16px, width: 100%`
**Blue square (38-0)**: `width: 64px, height: 64px, flexShrink: "0"`
**Text area (39-0)**: `flexGrow: "1", flexShrink: "1", flexBasis: "0%"`
**Button (3C-0)**: `width: 120px, flexShrink: "0", alignItems: center, justifyContent: center`

**FINDINGS**:
- **flex-shrink: 0** is preserved — fixed-size elements retain their dimensions
- **flex: 1** correctly decomposed into `flexGrow: 1, flexShrink: 1, flexBasis: 0%`
- Nested flex containers work perfectly (column > row > items)
- `align-items: center` and `justify-content: center` preserved
- The empty div (blue square) became a Rectangle component, not a Frame

**Implication**: Flex layout is the golden path. All flex properties work as expected. Empty divs with dimensions become Rectangles (not Frames) — this is an important mapping rule.

---

## Test 6: Overflow Hidden + Border Radius (Card with Image)

**Card container (3U-0)**:
```json
{ "width": "380px", "borderRadius": "16px", "overflow": "clip", "boxShadow": "...", "backgroundColor": "#FFFFFF" }
```

**Gradient "image" area (3V-0)**: `width: 100%, height: 200px` — became a Rectangle
**Content area (3W-0)**: `display: flex, flexDirection: column, gap: 12px, padding: 24px`

**Tree**: Frame(380x326) > Rectangle(380x200) + Frame(380x126) > Text + Text

**FINDINGS**:
- **overflow: hidden** → Paper converts to `overflow: "clip"`. Internally equivalent.
- **border-radius + overflow** combo works correctly — child content (the gradient area) clips to parent's rounded corners
- The gradient div (no text children, has dimensions) became a **Rectangle**, not a Frame
- `line-height: 1.5` → converted to `round(up, 150%, 1px)` — Paper normalizes relative line-heights

**Implication**: `overflow: hidden` should be emitted as-is; Paper maps it to `clip`. The border-radius clipping behavior works natively.

---

## Test 7: Text Truncation + Line Clamp

**Single-line truncation (40-0)**:
```json
{
  "display": "-webkit-box",
  "WebkitBoxOrient": "vertical",
  "WebkitLineClamp": "1",
  "overflow": "hidden",
  "whiteSpaceCollapse": "collapse"
}
```

**Multi-line clamp (41-0)**:
```json
{
  "display": "-webkit-box",
  "WebkitBoxOrient": "vertical",
  "WebkitLineClamp": "3",
  "overflow": "hidden"
}
```

**FINDINGS**:
- **Paper converts `white-space: nowrap; text-overflow: ellipsis`** into `-webkit-line-clamp: 1` with `-webkit-box` display. It normalizes single-line truncation into the same line-clamp system.
- **-webkit-line-clamp: 3** preserved exactly as specified
- `text-overflow: ellipsis` was NOT preserved as a separate property — Paper internally uses line-clamp instead
- Both truncation methods output the same internal representation (webkit-box + line-clamp)

**Implication**: Our DOMParser can use either truncation approach. Paper normalizes `nowrap + text-overflow: ellipsis` to `line-clamp: 1`, so we should emit `-webkit-line-clamp` directly for consistency.

---

## Test 8: Images with Various object-fit

**First image - cover (44-0)**:
```json
{
  "width": "100%", "height": "100%",
  "backgroundImage": "url(https://app.paper.design/file-assets/...)",
  "backgroundSize": "cover",
  "backgroundPosition": "center"
}
```

**Second image - contain (46-0)**:
```json
{
  "width": "100%", "height": "100%",
  "backgroundImage": "url(https://app.paper.design/file-assets/...)",
  "backgroundSize": "contain",
  "backgroundPosition": "center",
  "backgroundRepeat": "no-repeat"
}
```

**Node type**: Both images became **Rectangle** components (not Frame, not a special Image type).
**Image container frames**: Both got `overflow: "clip"` and `flexShrink: "0"`.

**FINDINGS**:
- **`<img>` tags are converted to Rectangles with background-image fills**. Paper downloads the image and re-hosts it on `app.paper.design/file-assets/`.
- **object-fit: cover** → `backgroundSize: "cover"` + `backgroundPosition: "center"`
- **object-fit: contain** → `backgroundSize: "contain"` + `backgroundPosition: "center"` + `backgroundRepeat: "no-repeat"`
- Image containers automatically got `flexShrink: 0` even though only the container div had it — Paper infers shrink-resistance for image wrappers.
- The image's `alt` text from Unsplash filename became the node name: "snow capped mountains sunset"

**Implication**: For our DOMParser, images should be represented as Rectangles with `backgroundImage/Size/Position` fills. The `<img>` element itself is not preserved — it becomes a styled Rectangle.

---

## Test 9: Absolute Position with Inset Pinning

**Relative container (47-0)**: `position: absolute, width: 100%, height: 500px`
> Note: Paper makes the container `position: absolute` too — `position: relative` is dropped.

**Full-inset overlay (48-0)**:
```json
{ "position": "absolute", "top": "0px", "left": "0px", "right": "0px", "bottom": "0px" }
```
Gradient preserved with `transparent` → `oklab(0% 0 -.0001 / 0%)`.

**Center-positioned content (49-0)**:
```json
{ "position": "absolute", "top": "50%", "left": "50%", "translate": "-50% -50%" }
```

**Bottom-right button (4C-0)**: `position: absolute, bottom: 24px, right: 24px`

**Text alignment**: Both text nodes in centered group got `textAlign: "center"`.

**FINDINGS**:
- **`position: relative`** → Paper drops the `relative` and only outputs `absolute` on the parent (since it's inside an artboard, it becomes absolutely positioned within it).
- **`transform: translate(-50%, -50%)`** → converted to `translate: "-50% -50%"` (modern CSS `translate` property, not `transform`)
- **Absolute inset pinning** (`top:0; left:0; right:0; bottom:0`) works perfectly
- **Bottom-right pinning** (`bottom: 24px; right: 24px`) works perfectly
- **`text-align: center`** is preserved and applied to text nodes
- **`transparent`** in gradients → Paper converts to `oklab(0% 0 -.0001 / 0%)`

**Implication**: For centered elements, we should emit `translate: -50% -50%` directly rather than `transform: translate(...)`. Paper modernizes the syntax. `position: relative` is not preserved — only `absolute` matters for positioning.

---

## Test 10: Margin Handling

**h2 title (4G-0)**: `marginTop: "0px", marginRight: "0px", marginBottom: "24px", marginLeft: "0px"`
**Card with margin-top (4I-0)**: `marginTop: "16px"`, plus flex-grow/shrink/basis
**Card without margin (4K-0)**: No margin properties, just flex-grow/shrink/basis
**Text with margin: 0 (4J-0)**: All four margins explicitly set to "0px"

**FINDINGS**:
- **Margins are fully preserved** — all four sides stored individually
- `margin: 0 0 24px 0` → split into `marginTop: "0px", marginRight: "0px", marginBottom: "24px", marginLeft: "0px"`
- `margin-top: 16px` on a flex child preserved as `marginTop: "16px"` — effectively pushes the card down
- `margin: 0` → all four sides explicitly zeroed (not omitted)

**Implication**: Paper DOES support margins despite its own docs saying "Do NOT use margins." However, margins in design tools are unusual — they create spacing outside the node's bounds. Our DOMParser should convert margins to gap/padding where possible, but margins can be passed through as a fallback.

---

## Summary of Key Findings for DOMParser Implementation

### CRITICAL
1. **Tailwind classes are 100% ignored** — Tailwind-to-inline conversion is mandatory
2. **Only `style=` attributes are processed** — `class=` attributes contribute nothing

### Layout
3. **Flex is the primary layout mode** — all flex properties work perfectly
4. **Grid works but is "unsupported"** — Paper parses it but docs discourage it; prefer flex
5. **Margins work** — despite docs saying otherwise; preserved as individual sides
6. **`position: relative` is dropped** — only `absolute` positioning is stored

### Visual
7. **Gradients work** — colors auto-converted to OKLab color space
8. **Multiple box-shadows work** — preserved as comma-separated value
9. **`overflow: hidden` → `overflow: clip`** — automatic mapping
10. **`line-height: 1.5`** → normalized to `round(up, 150%, 1px)`

### Text
11. **Text truncation normalized to `-webkit-line-clamp`** — both `nowrap+ellipsis` and explicit `line-clamp` converge
12. **Font fallback**: `"Inter"` → `"Inter", system-ui, sans-serif` (auto-appended)

### Images
13. **`<img>` → Rectangle with background-image fill** — images re-hosted on Paper CDN
14. **`object-fit: cover` → `backgroundSize: cover`**; `contain` → `backgroundSize: contain` + `no-repeat`

### Transforms
15. **`transform: translate()` → `translate` property** — Paper modernizes the syntax

### Element Type Mapping
16. **Empty divs with dimensions → Rectangle** (not Frame)
17. **Divs with children → Frame**
18. **Text content → Text** nodes
19. **`<img>` → Rectangle** with background-image fill
