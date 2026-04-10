# Scytle vs Paper.design — Parser Architecture Comparison

> **Date**: April 2026
> **Purpose**: Side-by-side comparison to identify why Paper's output quality is higher and what Scytle can learn

---

## 1. Fundamental Architecture Difference

```
SCYTLE (Render-then-Measure)              PAPER (Parse-and-Preserve)
═══════════════════════════                ═══════════════════════════

HTML + Tailwind classes                    HTML + inline styles
        │                                         │
        ▼                                         ▼
┌─────────────────┐                       ┌─────────────────┐
│ Hidden iframe    │                       │ DOMParser()     │
│ + Tailwind CDN   │                       │ (no rendering)  │
│ + Google Fonts   │                       │                 │
│ + Image loading  │                       │                 │
└─────────────────┘                       └─────────────────┘
        │                                         │
        ▼                                         ▼
┌─────────────────┐                       ┌─────────────────┐
│ Browser renders  │                       │ Walk DOM tree   │
│ full layout      │                       │ Read el.style   │
│ (5-13 seconds)   │                       │ (near-instant)  │
└─────────────────┘                       └─────────────────┘
        │                                         │
        ▼                                         ▼
┌─────────────────┐                       ┌─────────────────┐
│ getBoundingClient│                       │ Preserve CSS    │
│ Rect() for dims  │                       │ properties as-is│
│ getComputedStyle │                       │ Map to node     │
│ for all props    │                       │ style system    │
└─────────────────┘                       └─────────────────┘
        │                                         │
        ▼                                         ▼
┌─────────────────┐                       ┌─────────────────┐
│ Infer sizing     │                       │ Canvas engine   │
│ (fill/hug/fixed) │                       │ resolves layout │
│ from pixel values│                       │ at render time  │
└─────────────────┘                       └─────────────────┘
```

**Scytle** renders HTML in a real browser, then **measures** the result.
**Paper** parses HTML as a data structure, then **preserves** the CSS intent.

---

## 2. Property-by-Property Comparison

### 2.1 Style Source

| | Scytle | Paper |
|-|--------|-------|
| **Method** | `getComputedStyle(el)` | `el.style[i]` iteration |
| **What it reads** | All resolved CSS (inherited, computed, default) | Only inline `style=""` attributes |
| **Tailwind classes** | Resolved by Tailwind CDN → read via computed style | Not processed — AI must use inline styles |
| **CSS inheritance** | Automatically included | Not available (no cascade) |
| **Default values** | Included (e.g., `display: block`) | Not included unless explicitly set |

**Impact**: Scytle gets full CSS cascade but at the cost of rendering time. Paper gets exact CSS intent but requires inline styles.

### 2.2 Dimensions (Width / Height)

| | Scytle | Paper |
|-|--------|-------|
| **Source** | `getBoundingClientRect().width/height` | `el.style.width` / `el.style.height` as strings |
| **Absolute elements** | Measured (may collapse to content) | CSS values preserved (`left`, `right`, `top`, `bottom`) |
| **Percentage widths** | Resolved to pixels (e.g., 720px) | Preserved as "50%" or "100%" |
| **Auto width** | Resolved to rendered content width | Preserved as "auto" |
| **Flex children** | Measured after flex resolution | `flex-grow`, `flex-basis` preserved |

**Impact**: This is the **root cause of most Scytle parser bugs**. Measuring pixels loses CSS intent:
- `width: 100%` → measured as 1440px → stored as `width: 1440` (fixed, not fill)
- `left: 60px; right: 60px` on absolute → measured as collapsed content width
- `flex: 1` → measured as whatever the flex algorithm computed → stored as fixed pixels

### 2.3 Sizing Inference

| | Scytle | Paper |
|-|--------|-------|
| **Approach** | Complex heuristic: display:none trick + spatial analysis + parent context | Direct from CSS: `width: 100%` → fill, `width: auto` → hug, `width: 300px` → fixed |
| **Lines of code** | ~200 lines (1609-1809) | Minimal — CSS properties map directly |
| **Accuracy** | ~85% — heuristics can produce contradictions | ~99% — CSS intent preserved |
| **Failure modes** | `sizing: 'fill'` but `width: 50px` | None (what you write is what you get) |

**Scytle's display:none trick** (lines 1594-1607): Temporarily sets `display: none` on an element so `getComputedStyle().width` returns the computed value ("auto", "100%", "300px") instead of resolved pixels. Clever but fragile — causes layout thrash and doesn't work for all cases.

### 2.4 Positioning

| | Scytle | Paper |
|-|--------|-------|
| **Detection** | `cs.position` from computed style | `el.style.position` from inline style |
| **Coordinates** | `rect.left - parentRect.left - parentBorderLeft` | `top`/`left`/`right`/`bottom` preserved as CSS |
| **Absolute elements** | Pixel coordinates relative to parent padding box | CSS position properties preserved, reparented to positioned ancestor |
| **Negative values** | Computed from bbox (may be wrong) | Preserved as-is (e.g., `top: -16px`) |

### 2.5 Typography

| | Scytle | Paper |
|-|--------|-------|
| **Font family** | `cs.fontFamily` → extract primary font | `el.style.fontFamily` preserved |
| **Font size** | `parseFloat(cs.fontSize)` in px | `el.style.fontSize` as string |
| **Font loading** | Google Fonts loaded in iframe → 3-5s wait | No loading — name preserved as string |
| **Text measurement** | `getBoundingClientRect()` on rendered text | No measurement — canvas engine renders |
| **Race condition** | fonts.ready resolves early if CSS not parsed | Not applicable |

### 2.6 Colors & Fills

| | Scytle | Paper |
|-|--------|-------|
| **Color format** | Computed → always rgb/rgba → converted to hex | Inline style → whatever format AI wrote |
| **oklch/oklab** | Full conversion (lines 1001-1058) | Converted to oklab internally |
| **Gradients** | Parsed from `cs.backgroundImage` string | Parsed from `el.style.backgroundImage` |
| **Transparency** | `rgbToOpacity()` extracts alpha | Preserved from CSS |

### 2.7 Borders & Shadows

| | Scytle | Paper |
|-|--------|-------|
| **Border** | Picks thickest visible border from 4 sides | All border properties preserved from CSS |
| **Border radius** | All 4 corners extracted | Preserved from CSS |
| **Box shadow** | Complex string parsing (lines 1320-1413) | Preserved as CSS property |
| **Shadow alpha** | Converted to 8-digit hex | Converted to hex+alpha |

### 2.8 Layout (Flex / Grid)

| | Scytle | Paper |
|-|--------|-------|
| **Flex** | Full support — direction, gap, align, justify, wrap | Full support — same properties |
| **Grid** | Supported with column/row span parsing | Supported (despite docs saying otherwise) |
| **Gap** | Extracted from `cs.gap` | Extracted from `el.style.gap` |
| **Flex children** | `flexGrow`/`flexShrink`/`flexBasis` from computed | Same, plus auto `flexShrink: 0` for fixed-width children |

### 2.9 Images & SVGs

| | Scytle | Paper |
|-|--------|-------|
| **Images** | Wait for load → measure natural dimensions → ImageFill | Upload via `imageState.uploadUrl()` → ImageFill |
| **SVGs (simple)** | ≤8 paths → VectorNode conversion | Dedicated SVG parser → SVGVisualElement |
| **SVGs (complex)** | Data URI fallback | Data URI fallback |
| **Image loading** | 5s timeout waiting for images | No waiting — handled asynchronously |

---

## 3. Performance Comparison

| Metric | Scytle | Paper |
|--------|--------|-------|
| **Parse time (simple section)** | 2-5 seconds | <100ms |
| **Parse time (full page, 6 sections)** | 12-30 seconds | <500ms |
| **Bottleneck** | Tailwind CDN load (5s) + fonts (3s) + images (5s) | DOM string parsing |
| **Memory** | Hidden iframe + full DOM | DOMParser object (GC'd) |
| **CPU** | Tailwind JIT compilation in iframe | Minimal |

---

## 4. Quality Gap Analysis

### What Paper Gets Right (That Scytle Doesn't)

| Issue | Scytle Behavior | Paper Behavior | Root Cause |
|-------|----------------|----------------|------------|
| **Absolute width collapse** | Text in absolute div collapses to content width | `left: 60px; right: 60px` preserved → correct width | getBoundingClientRect vs CSS preservation |
| **Sizing contradictions** | `sizing: fill` but `width: 50px` | Not possible — CSS intent = node property | Pixel measurement vs intent preservation |
| **Font race condition** | Navbar renders as 1px empty frame | No font rendering needed | Iframe font loading timing |
| **Percentage widths** | Resolved to fixed pixels, loses responsiveness | Preserved as percentages | Computed style resolves to px |
| **Flex child sizing** | Complex heuristic, sometimes wrong | `flex-grow`/`flex-basis` preserved directly | Over-engineering simple problem |
| **Padding asymmetry** | Some frames show padding only on left | Padding preserved from CSS intent | Measurement from rendered layout |
| **Slow generation** | 5-13s per section | <100ms per section | Iframe render pipeline overhead |

### What Scytle Gets Right (That Paper Doesn't)

| Feature | Scytle | Paper |
|---------|--------|-------|
| **Tailwind class support** | Full — AI writes natural Tailwind | Requires inline styles only |
| **CSS inheritance** | Automatic via computed styles | Not available (no cascade) |
| **Real text wrapping** | Measured from rendered text | Canvas engine must compute |
| **Default styles** | Included (block display, etc.) | Must be explicitly set by AI |
| **Modern color spaces** | oklch/oklab → hex conversion | Similar conversion |

---

## 5. Root Cause Summary

The quality gap comes down to **one fundamental choice**:

> **Scytle measures what the browser renders. Paper preserves what the AI wrote.**

This means:
- **Scytle's approach** is theoretically more accurate (real layout) but introduces measurement errors, timing issues, and lossy conversions
- **Paper's approach** is a direct mapping (CSS → node properties) with no intermediate lossy step

The irony: by trying to be more accurate (real rendering), Scytle introduces MORE bugs than Paper's simpler approach.

---

## 6. Two Paths Forward

### Path A: Switch to Paper's Approach (CSS Preservation)

**Changes required:**
1. AI prompts: Switch from Tailwind classes to inline styles
2. Parser: Replace iframe rendering with DOMParser + style property iteration
3. Canvas engine: Must resolve flex/grid/absolute at render time (Scytle may already do this)
4. Remove: IframeRenderer, Tailwind CDN loading, font waiting, image waiting

**Pros:**
- Eliminates ALL iframe-related bugs at once
- 100x faster parsing (<100ms vs 5-13s)
- Simpler code (~500 lines vs ~2200 lines)
- CSS intent preserved perfectly

**Cons:**
- AI must write inline styles (no Tailwind classes in output)
- No CSS cascade/inheritance (AI must set every property explicitly)
- Bigger upfront rewrite
- Canvas engine must handle layout resolution

### Path B: Fix Iframe Parser Incrementally

**Changes required:**
1. Fix absolute position width measurement
2. Fix sizing inference contradictions
3. Fix padding asymmetry
4. Fix font race conditions (partially done)
5. Optimize render pipeline speed

**Pros:**
- Smaller changes per fix
- Keep Tailwind class support
- CSS inheritance works automatically

**Cons:**
- Each fix is a band-aid — new measurement bugs will keep appearing
- Fundamental architecture causes the bugs, not implementation details
- Still 5-13s parse time
- ~200 lines of sizing heuristics that will always have edge cases

---

## 7. Recommendation

**Path A (CSS preservation) is the better long-term choice.** The iframe measurement approach is fundamentally lossy — every pixel measurement is an approximation that can go wrong. Paper's approach proves that CSS preservation produces higher quality output with simpler code.

The key question is whether Scytle's canvas engine can resolve flex/grid/absolute layouts at render time, or if it relies on the parser to provide pre-computed pixel coordinates. If the canvas engine already has layout capabilities, the switch is straightforward.
