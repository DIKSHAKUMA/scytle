# Parser Rewrite: Iframe Measure → DOMParser Preserve

## Context

Scytle's HTML→canvas parser uses a hidden iframe to render HTML, then measures everything with `getBoundingClientRect()` + `getComputedStyle()`. This causes:

- **Absolute position collapse**: `left:60px; right:60px` loses CSS intent → width collapses to content
- **Sizing contradictions**: `sizing: fill` but `width: 50px` (heuristic guesses wrong)
- **Font race conditions**: Navbar renders as 1px empty frame
- **5-13 second parse time** per section (Tailwind CDN + fonts + images)

Paper.design uses DOMParser + `element.style` iteration — preserves CSS intent, no rendering, <100ms. Our test page at `/test-parser` proved the DOMParser approach produces identical visual output with preserved CSS properties.

**User confirmed**: Canvas engine already handles flex + grid + absolute layout resolution. Support both Tailwind classes and inline styles.

---

## Architecture: Before vs After

```
BEFORE (iframe measure):
  AI HTML (Tailwind) → hidden iframe + Tailwind CDN → wait 5-13s
  → getBoundingClientRect() → getComputedStyle() → pixel values → ScytleNode

AFTER (DOMParser preserve):
  AI HTML (Tailwind OR inline) → Tailwind-to-inline conversion (if needed)
  → DOMParser() → element.style iteration → preserve CSS properties → ScytleNode
  → Canvas engine resolves layout at render time (<100ms total)
```

---

## Files to Change (8 files)

| # | File | Action | Why |
|---|------|--------|-----|
| 1 | `src/lib/parser/domparser.ts` | **CREATE** | New DOMParser-based parser (~400 lines vs 2200) |
| 2 | `src/lib/parser/tailwind-to-inline.ts` | **CREATE** | Convert Tailwind classes → inline styles using TW v4 API |
| 3 | `src/lib/parser/index.ts` | **MODIFY** | Switch default export from iframe to DOMParser |
| 4 | `src/lib/ai/autofix.ts` | **MODIFY** | Update to work with new pipeline (keep fence stripping, update class handling) |
| 5 | `src/components/chat/chat-panel.tsx` | **MODIFY** | Replace `parseHtmlToNodesViaIframe` call with new `parseHtml` |
| 6 | `src/lib/parser/iframe-parser.ts` | **KEEP** | Don't delete — keep as fallback, just stop importing it by default |
| 7 | `src/lib/parser/iframe-renderer.ts` | **KEEP** | Don't delete — keep as fallback |
| 8 | `src/lib/ai/prompts/system.ts` | **MODIFY** | Update parser constraints section (margins now fully work, etc.) |

---

## Step 1: Create Tailwind-to-Inline Converter (`src/lib/parser/tailwind-to-inline.ts`)

**Why**: AI outputs Tailwind classes. DOMParser only reads `element.style`. We need a bridge.

**Approach**: Use `tailwindcss@4.1.18` (already installed) programmatic API:

```ts
import { __unstable__loadDesignSystem } from 'tailwindcss'

// 1. Load TW design system once (cached)
// 2. For each element with class="...":
//    - Extract classes
//    - candidatesToCss(classes) → CSS rule strings
//    - Parse CSS declarations → build style="" attribute
//    - Remove class attr, set style attr
// 3. Return HTML with only inline styles
```

**Key details**:
- Cache the design system instance (expensive to load, reuse across parses)
- Handle arbitrary values: `bg-[#FF4D00]` → `background-color: #FF4D00`
- Handle compound classes: `px-6` → `padding-left: 1.5rem; padding-right: 1.5rem`
- Preserve existing inline styles (merge, don't overwrite)
- **Runs in browser** (not server) — same as current iframe approach

**Fallback**: If `candidatesToCss` doesn't handle a class, the iframe approach already has Tailwind CDN loaded. But we expect >95% coverage since we control the AI output.

---

## Step 2: Create DOMParser Parser (`src/lib/parser/domparser.ts`)

**Why**: Core replacement for iframe-parser.ts. ~400 lines instead of ~2200.

**Pipeline** (modeled after Paper.design's `dj` function):

```
1. Fix self-closing tags: <div /> → <div></div>
2. Tailwind-to-inline conversion (Step 1)
3. new DOMParser().parseFromString(html, 'text/html')
4. document.createTreeWalker(body, NodeFilter.SHOW_ELEMENT)
5. For each element:
   a. Read element.style[i] for ALL inline properties
   b. Determine node type (Frame/Text/Image/Vector)
   c. Map CSS properties → ScytleNode properties
   d. Preserve position/sizing as CSS intent (not pixels)
6. Theme linking (reuse existing buildLinkMaps + relinkNodes)
7. Return FrameNode tree
```

**Same function signature as current parser**:
```ts
export async function parseHtmlViaDOMParser(
  html: string,
  pageName: string,
  options?: ParseHtmlOptions
): Promise<FrameNode>
```

**Property mapping** (CSS → ScytleNode):

| CSS Property | ScytleNode Property | Notes |
|---|---|---|
| `display: flex` | `layout.mode = 'flex'` | |
| `flex-direction: column` | `layout.direction = 'column'` | |
| `gap: 24px` | `layout.gap = 24` | Parse px value |
| `justify-content` | `layout.justify` | Direct map |
| `align-items` | `layout.align` | Direct map |
| `display: grid` | `layout.mode = 'grid'` | |
| `grid-template-columns` | `layout.columns` | Parse fr/px values |
| `width: 100%` | `sizing.horizontal = 'fill'` | CSS intent → sizing |
| `width: 300px` | `width = 300, sizing.horizontal = 'fixed'` | |
| `flex: 1` | `sizing.horizontal = 'fill'` | flexGrow=1 → fill |
| `height: auto` / none | `sizing.vertical = 'hug'` | |
| `position: absolute` | `position = 'absolute'` | Preserve top/left/right/bottom as CSS strings |
| `padding: 40px` | `padding = { t:40, r:40, b:40, l:40 }` | Parse shorthand |
| `background-color` | `fills = [SolidFill]` | Parse color |
| `background: linear-gradient(...)` | `fills = [GradientFill]` | Parse gradient |
| `border-radius` | `borderRadius = [n,n,n,n]` | Parse shorthand |
| `border: 1px solid #e0e0e0` | `strokes = [...]` | Parse border |
| `box-shadow` | `shadows = [...]` | Parse shadow string |
| `font-family` | `fontFamily` | Preserve as string |
| `font-size` | `fontSize` | Parse to number |
| `font-weight` | `fontWeight` | Parse to number |
| `color` | `fills = [SolidFill]` (on TextNode) | |
| `object-fit` | `imageFit` (on ImageNode) | cover/contain/fill |

**Node type detection** (same as Paper):
- `<img>` → ImageNode
- Text-only elements (h1-h6, p, span, a, button with no children) → TextNode
- `<svg>` → VectorNode (reuse existing svg-path-parser.ts)
- Everything else → FrameNode

**Special handling** (from Paper research):
- Empty div with only background → optimize to simpler node
- Fixed-width flex children → auto-add `flexShrink: 0`
- `position: sticky/static` → strip position props
- Adjacent inline text nodes → merge into single TextNode
- `<hr>` → divider node (1px height frame with fill)

---

## Step 3: Update Parser Index (`src/lib/parser/index.ts`)

**Change**: Export new parser as default, keep iframe as named export.

```ts
// New default
export { parseHtmlViaDOMParser as parseHtml } from './domparser'
export { parseHtmlViaDOMParser } from './domparser'

// Legacy fallback
export { parseHtmlToNodesViaIframe } from './iframe-parser'

// Keep existing exports
export { resolveColor, buildReverseColorMap, TAILWIND_COLORS } from './color-map'
export { PAGE_WIDTH, estimateTextHeight, ... } from './size-utils'
```

---

## Step 4: Update `chat-panel.tsx`

**Change**: Replace iframe parser call with new DOMParser call.

In `applyToolResult()` for both `generateSection` and `editNode`:

```ts
// BEFORE
const parsed = await parseHtmlToNodesViaIframe(html, sectionType, { rootWidth, variableTable, themeMode, fonts })

// AFTER
const { parseHtml } = await import('@/lib/parser')
const parsed = await parseHtml(html, sectionType, { rootWidth, variableTable, themeMode, fonts })
```

Same options interface, same return type (FrameNode). Drop-in replacement.

---

## Step 5: Update `autofix.ts`

**Changes**:
- Keep markdown fence stripping (still needed)
- Keep SVG xmlns and img alt fixes (still needed)
- **Remove** margin stripping from inline styles (margins now fully supported in DOMParser approach)
- **Remove** max-width stripping from inline styles
- **Keep** Tailwind class cleaning for unsupported features (transforms, animations, hover states, responsive prefixes — these still don't work on canvas)

---

## Step 6: Update System Prompt (`src/lib/ai/prompts/system.ts`)

**Changes to parser capabilities section**:
- Add margins to FULLY SUPPORTED (currently stripped by autofix)
- Note that both Tailwind classes AND inline styles work
- Keep existing banned features (transforms, animations, etc.)

---

## Implementation Order

1. **Step 1** — `tailwind-to-inline.ts` (standalone utility, testable independently)
2. **Step 2** — `domparser.ts` (core parser, depends on Step 1)
3. **Step 3** — Update `index.ts` exports
4. **Step 4** — Wire up in `chat-panel.tsx`
5. **Step 5** — Update `autofix.ts`
6. **Step 6** — Update system prompt

---

## Verification

1. **Build check**: `npx next build` — no import errors
2. **Test page**: Go to `/test-parser` — DOMParser approach should still work identically
3. **Integration test**: In the chat, ask "design me a landing page" and verify:
   - Parse time drops from 5-13s to <1s per section
   - Sections render correctly on canvas (flex, grid, absolute all work)
   - Theme colors link properly (hex values → theme variables)
   - Images load and display correctly
   - Text has correct fonts, sizes, weights
4. **Edge cases**:
   - Tailwind arbitrary values: `bg-[#FF4D00]`, `w-[300px]`, `text-[18px]`
   - Mixed Tailwind + inline styles on same element
   - SVG icons (simple ≤8 paths → VectorNode, complex → data URI)
   - Absolute positioned elements with `left`/`right` constraints
   - CSS grid with `col-span-2`
5. **Fallback**: If anything breaks, iframe parser is still importable via `parseHtmlToNodesViaIframe`

---

## What We're NOT Changing

- **Canvas engine** — already handles flex/grid/absolute
- **Theme linking** — reuse existing `buildLinkMaps` + `relinkNodes`
- **SVG parser** — reuse existing `svg-path-parser.ts`
- **Color map** — reuse existing `color-map.ts`
- **Size utils** — reuse existing `size-utils.ts`
- **AI tools** — same `generateSection`/`editNode` return format
- **Chat API** — no server changes needed
- **Node types** — same `ScytleNode` discriminated union

---

## Risk & Mitigation

| Risk | Mitigation |
|---|---|
| Tailwind-to-inline misses some classes | AI output is controlled — we test with our curated font/color list. Iframe fallback available. |
| Canvas engine doesn't resolve some layout | User confirmed it handles flex+grid+absolute. Test thoroughly. |
| Theme linking breaks | Same hex-matching logic, same `buildLinkMaps` function — no change. |
| Regression in specific test cases | Keep iframe parser importable. Can A/B test both parsers during rollout. |
