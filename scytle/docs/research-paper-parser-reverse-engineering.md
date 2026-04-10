# Paper.design Parser — Reverse Engineering Deep Dive

> **Date**: April 2026
> **Method**: Electron app bundle extraction + web bundle analysis + live MCP testing
> **Goal**: Understand how Paper converts HTML to canvas nodes — compare with Scytle's iframe approach

---

## 1. App Architecture

Paper is an **Electron shell** wrapping a remote web app at `https://app.paper.design`.

| Component | Location | Size | Role |
|-----------|----------|------|------|
| Electron main | `/Applications/Paper.app` (v0.1.10) | 1.4 MB | Window management, auth, MCP server |
| Asar archive | `Contents/Resources/app.asar` | 46 MB | Electron source (thin shell) |
| Main JS bundle | `index-DDAem0ni.js` | 2.76 MB | Canvas engine, editor, React UI, **HTML parser** |
| MCP handlers | `MCPHandlers-BgIxTkgS.js` | 120 KB | Tool definitions, `writeHTML` handler |
| Tailwind worker | `index-muCcQtDq.js` | 272 KB | Web Worker for Tailwind CSS (export only) |

**Key insight**: The Electron app is a thin shell. The MCP server runs on `http://127.0.0.1:29979/mcp` (Hono + Streamable HTTP Transport) and bridges to the renderer via `webContents.executeJavaScript` calling `window.mcpHandlers.*`.

---

## 2. The Parser Pipeline

The core parser is the minified function **`dj`** in the main bundle (byte offset ~1,759,811), exported as `e` and imported as `mn` in the MCP handlers chunk:

```js
import { e as mn, h as Ee, i as Ae } from "./index-DDAem0ni.js"
// mn = HTML parser (dj)
// Ee = node creator (qC)
// Ae = sort key generator (xi)
```

### 2.1 Pipeline Steps

```
AI HTML string
    │
    ▼
┌─────────────────────────────────┐
│ Step 1: Self-closing tag fix    │  Function: JUe
│ <div /> → <div></div>           │  Void elements left as-is
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Step 2: DOM parsing             │  new DOMParser().parseFromString()
│ Standard browser DOMParser      │  NO iframe, NO rendering
│ Returns document object         │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Step 3: Tree walking            │  document.createTreeWalker()
│ NodeFilter.SHOW_ALL             │  Comments rejected
│ Visits every node               │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Step 4: Style extraction (XQ)   │  Reads element.style[i]
│ INLINE STYLES ONLY              │  NOT getComputedStyle()
│ Property-by-property iteration  │  Normalizes special cases
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Step 5: Node type assignment    │  Frame / Text / Rectangle
│ Based on tag + children         │  layer-name attribute support
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Step 6: CSS meta parsing (j2e)  │  Second pass
│ cssParser.parse()               │  Fills, fonts, shadows, etc.
│ Maps to Paper's internal system │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│ Step 7: Node creation (qC/Ee)   │  treeUtils.addNode()
│ Insert into Paper document      │  Sort keys for ordering
└─────────────────────────────────┘
```

### 2.2 Style Extraction — The `XQ` Function

This is the **critical difference** from Scytle. Paper reads `element.style` (inline styles only), not `getComputedStyle()`. It iterates properties one by one:

```
element.style[0] → "display"
element.style[1] → "flex-direction"
element.style[2] → "gap"
...
```

**Special normalizations:**
- `flow-root` + `-webkit-line-clamp` → `-webkit-box`
- `sticky`/`static` positions → strip top/left/right/bottom
- `block` on `<button>` → add `alignContent: center`
- `list-item` → strip display
- Inline elements → `display: inline-block`

### 2.3 Node Type Assignment

| Condition | Node Type |
|-----------|-----------|
| HTMLElement with children | `"Frame"` |
| HTMLElement with `layer-name` attribute | `"Frame"` (named) |
| Text nodes | `"Text"` |
| Everything else | `"Rectangle"` |
| `<input>` | Frame labeled "Input" |
| `<select>` | Frame labeled "Select" |
| `<textarea>` | Frame labeled "Text Area" |
| `<button>` | Frame labeled "Button" |

### 2.4 Absolute Positioning

Elements with `position: absolute` are **reparented** to their closest positioned ancestor via the `k2e` function. The `top`/`left`/`right`/`bottom` values are **preserved as CSS properties**, not converted to pixel coordinates.

### 2.5 SVG Handling

SVG elements and `<img>` tags pointing to localhost SVGs are parsed via a dedicated SVG parser (`sJ` / `rJ`) into `SVGVisualElement` nodes.

### 2.6 Image Handling

`<img>` tags trigger `imageState.uploadUrl()` which uploads the image, then applies it as a fill:

| `object-fit` value | Paper mapping |
|--------------------|---------------|
| `fill` | sizeX/sizeY 100% |
| `none` | sizeX auto |
| `scale-down` | sizeX contain |

### 2.7 Text Merging

Adjacent inline text nodes under the same parent are collapsed. If all children of a container are inline text, they merge into a single Text node with `white-space: pre`.

### 2.8 Custom Elements

`<x-paper-clone node-id="..." style="...">` — Clones an existing Paper node with optional style overrides (function `eze`). This allows the AI to reference existing design elements.

---

## 3. MCP Tool Architecture

The `MCPHandlers` class implements 18 tools. The key `writeHTML` method:

1. Validates target node exists and mode is valid
2. Calls `mn(html, {editorState})` — the parser
3. In `insert-children` mode: calls `Ee(parsedNodes, {editorState, parentId})`
4. In `replace` mode: deletes target, creates nodes at the same position with same sort keys

### Key MCP Tools

| Tool | Purpose |
|------|---------|
| `create_artboard` | Create new artboard from HTML |
| `write_html` | Insert/replace HTML in existing node |
| `read_artboard` | Get node tree of an artboard |
| `get_artboards` | List all artboards |
| `delete_artboard` | Remove artboard |

---

## 4. What Paper Does NOT Do

These are deliberate architectural decisions:

1. **No iframe rendering** — DOMParser only, no layout engine
2. **No Tailwind at parse time** — Tailwind worker is for *export* (JSX generation), not input
3. **No `getBoundingClientRect()`** — No pixel measurement at all
4. **No `getComputedStyle()`** — Only inline `style=""` attributes
5. **No font loading** — Font names preserved as strings, rendered by canvas engine
6. **No image dimension measurement** — Aspect ratios from CSS, not natural dimensions
7. **No layout computation** — Canvas engine resolves flex/grid at render time

---

## 5. Tailwind Worker (Export Only)

The `index-muCcQtDq.js` web worker processes Tailwind CSS, but only when **exporting** designs as JSX/code. The AI's input HTML must use **inline styles**, not Tailwind classes.

This means Paper's AI prompt instructs the model to write:
```html
<div style="display: flex; gap: 24px; padding: 40px;">
```
Not:
```html
<div class="flex gap-6 p-10">
```

---

## 6. Layout Support

| Layout Feature | Supported? | Notes |
|----------------|-----------|-------|
| Flexbox | Yes | Full support — direction, gap, align, justify, wrap, grow/shrink |
| CSS Grid | Partially | Grid template columns/rows work, but docs say "not supported" |
| Absolute positioning | Yes | Reparented to closest positioned ancestor |
| Margins | Preserved | Stored as CSS properties on nodes |
| Display: inline | Converted | Auto-converted to `inline-block` |
| Float | No | Unsupported |

---

## 7. File References

| File | Path | Description |
|------|------|-------------|
| Electron source | `/tmp/paper-extracted/` | Extracted asar archive |
| Main entry | `/tmp/paper-extracted/src/main.ts` | Electron main process |
| MCP bridge | `/tmp/paper-extracted/src/mcp/bridge.ts` | MCP ↔ renderer bridge |
| MCP server | `/tmp/paper-extracted/src/mcp/server.ts` | Hono HTTP server |
| Main bundle | `/tmp/paper-research/paper-bundle.js` | Parser function `dj` at ~1,759,811 |
| MCP handlers | `/tmp/paper-research/paper-mcp-handlers.js` | Tool class at ~99,597 |
| TW worker | `/tmp/paper-research/paper-tw-worker.js` | Export-only Tailwind processing |
