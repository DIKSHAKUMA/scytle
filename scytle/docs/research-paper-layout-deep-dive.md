# Paper MCP Research: Layout & Visual Property Mapping

> Captured: April 2026. Research to inform `domparser.ts` fixes.

---

## Executive Summary

We created 10 test cases in Paper via MCP, examined computed styles on 24 nodes, and cross-referenced against Scytle's `canvas.ts` node types and right-panel property support.

**Key finding**: Scytle's node types already support ~90% of what Paper handles. The gap is almost entirely in `domparser.ts` — it reads CSS properties but fails to map them correctly to ScytleNode fields.

---

## Test Results: How Paper Converts CSS → Design Nodes

### 1. CSS Grid

**HTML sent:**
```html
<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px">
  <div>Cell 1</div><div>Cell 2</div><div>Cell 3</div>
</div>
```

**Paper computed styles:**
```
display: "grid"
gridTemplateColumns: "1fr 1fr 1fr"
gap: "16px"
```

**Scytle support**: `layout.mode: 'grid'`, `layout.columns`, `layout.gap` — ALL exist in `canvas.ts`

**Parser gap**: `domparser.ts` parses `gridTemplateColumns` but mapping to `layout.columns` array may be incomplete for `fr` units and `repeat()` syntax.

---

### 2. Grid Spans

**Paper computed styles (children):**
```
gridColumnStart: "span 2"
gridRowStart: "span 2"
```

**Scytle support**: `gridColumnSpan`, `gridRowSpan` — exist in `canvas.ts`

**Parser gap**: Parser reads `gridColumn`/`gridRow` shorthand but may not extract span values correctly.

---

### 3. Flexbox (Navbar Pattern)

**Paper computed styles:**
```
display: "flex"
flexDirection: "row"
justifyContent: "space-between"
alignItems: "center"
```

**Scytle support**: Full flex support — `layout.mode: 'flex'`, `layout.direction`, `layout.justifyContent`, `layout.alignItems`

**Parser gap**: Mostly working. Edge case: `flex-wrap` may not map to `layout.wrap`.

---

### 4. Flex Child Properties

**Paper computed styles:**
```
flexGrow: "1" / "2"
flexShrink: "0" / "1"
flexBasis: "0%"
```

**Scytle support**: `layoutGrow`, `flexShrink`, `flexBasis` — all in `canvas.ts`

**Parser gap**: `flex: 1` shorthand expansion may not set all three sub-properties. `flexBasis: "0%"` vs `"auto"` distinction likely lost.

---

### 5. Absolute Positioning

**Paper computed styles:**
```
Container: position: "relative", overflow: "clip"
Child:     position: "absolute", top: "50%", left: "50%", translate: "-50% -50%"
Child:     position: "absolute", bottom: "20px", right: "20px"
Child:     position: "absolute", top: "-10px", right: "-10px"  (negative offsets)
```

**Scytle support**: `positioning: 'absolute'`, `cssPosition: { top, right, bottom, left, translate, transform }` — all in `canvas.ts`

**Parser gap**: Parser reads `position` but may not:
- Set parent to `positioning: 'relative'` equivalent
- Handle `translate` property (separate from `transform`)
- Handle negative offset values
- Set `overflow: 'hidden'` on relative container

---

### 6. Max-Width + Centering

**Paper computed styles:**
```
Parent: justifyContent: "center"
Child:  maxWidth: "600px", width: "100%"
```

**Scytle support**: `maxWidth`, `maxHeight`, `minWidth`, `minHeight` — all in `canvas.ts`

**Parser gap**: Parser reads `max-width` but may not map to `maxWidth` field. Auto-margin centering (`margin: 0 auto`) likely not converted to flex centering.

---

### 7. Gradients

**Paper computed styles:**
```
backgroundImage: "linear-gradient(in oklab 135deg, #6366F1 0%, #EC4899 50%, #F59E0B 100%)"
```

**Scytle support**: `fills` array with `type: 'gradient'`, `gradientType: 'linear'`, angle, and color stops — all in `canvas.ts`

**Parser gap**: Parser reads `background-image` but gradient parsing (angle extraction, stop positions, color space hints like `in oklab`) may be incomplete. Multiple gradient layers not handled.

---

### 8. Blur + Overflow + Alpha Colors

**Paper computed styles:**
```
Container: overflow: "clip"
Blur child: filter: "blur(40px)", backgroundColor: "#6366F166"  (8-digit hex = alpha)
```

**Scytle support**: `layerBlur` (number), `overflow` ('visible'|'hidden'|'scroll'), fill opacity — all in `canvas.ts`

**Parser gap**:
- `filter: blur()` → needs to map to `layerBlur` (number extraction)
- 8-digit hex (`#RRGGBBAA`) → needs to split into color + opacity
- `overflow: clip` → should map to `overflow: 'hidden'`

---

### 9. Per-Side Borders

**Paper computed styles:**
```
borderTopWidth: "3px", borderTopStyle: "solid", borderTopColor: "#3B82F6"
borderRightWidth: "0px"
borderBottomWidth: "3px", borderBottomStyle: "dashed", borderBottomColor: "#EF4444"
borderLeftWidth: "4px", borderLeftStyle: "solid", borderLeftColor: "#10B981"
```

**Scytle support**: `border.sides` with per-side boolean flags (`top`, `right`, `bottom`, `left`) — exists but limited. Only one color/width/style per node, with sides toggled on/off.

**Parser gap**:
- Shorthand `border` parsing works for uniform borders
- Per-side longhands (`border-top-*`) need extraction
- Scytle limitation: can only toggle sides on/off with ONE shared style. Different colors per side not supported in node type.
- **Workaround**: Use the dominant border style, enable only matching sides

---

### 10. Opacity via Alpha Colors

**Paper computed styles:**
```
backgroundColor: "#3B82F626"   (14% opacity)
color: "#3B82F6E6"             (90% opacity)
borderColor: "#10B9814D"       (30% opacity)
boxShadow with: "#6366F140"    (25% opacity)
```

**Scytle support**:
- Fill: `fills[].opacity` (0-1)
- Text: `fills[].opacity` on text node
- Border: `border.opacity` (0-1)
- Shadow: `shadows[].color` as rgba

**Parser gap**: All alpha channels in 8-digit hex / `rgba()` need to be split into base color + opacity value. Parser likely passes hex string through without extracting alpha.

---

### 11. Box Shadows

**Paper computed styles:**
```
boxShadow: "0px 4px 24px -4px #6366F140"
```

**Scytle support**: `shadows` array with `{ type, color, offsetX, offsetY, blur, spread }` — full support

**Parser gap**: Parser reads `box-shadow` but multi-shadow support and spread value extraction may be incomplete. Color alpha (see #10) needs splitting.

---

## Scytle Right-Panel Property Inventory

From examining `/src/components/editor/properties-panel/` (35+ component files) and `/src/types/canvas.ts`:

### Layout (Frame nodes)
| Property | UI Control | Node Field |
|---|---|---|
| Display mode | Dropdown: flex / grid / none | `layout.mode` |
| Direction | Row / Column toggle | `layout.direction` |
| Justify content | 5-option picker | `layout.justifyContent` |
| Align items | 5-option picker | `layout.alignItems` |
| Flex wrap | Toggle | `layout.wrap` |
| Gap | Number input (X/Y) | `layout.gap` |
| Padding | 4-side input | `layout.padding` |
| Grid columns | Template editor | `layout.columns` |
| Grid rows | Template editor | `layout.rows` |

### Flex Child
| Property | Node Field |
|---|---|
| Grow | `layoutGrow` |
| Shrink | `flexShrink` |
| Basis | `flexBasis` |
| Align self | `alignSelf` |
| Order | `order` |

### Grid Child
| Property | Node Field |
|---|---|
| Column span | `gridColumnSpan` |
| Row span | `gridRowSpan` |

### Position
| Property | Node Field |
|---|---|
| Positioning | `positioning` ('auto' / 'absolute') |
| Top/Right/Bottom/Left | `cssPosition.top/right/bottom/left` |
| Translate | `cssPosition.translate` |
| Transform | `cssPosition.transform` |

### Size
| Property | Node Field |
|---|---|
| Width / Height | `width`, `height` (px or 'fill' or 'hug') |
| CSS Width / Height | `cssWidth`, `cssHeight` (any CSS unit) |
| Min width/height | `minWidth`, `minHeight` |
| Max width/height | `maxWidth`, `maxHeight` |

### Visual / Appearance
| Property | Node Field |
|---|---|
| Opacity | `opacity` (0-1) |
| Overflow | `overflow` ('visible' / 'hidden' / 'scroll') |
| Border radius | `borderRadius` (uniform or per-corner) |
| Layer blur | `layerBlur` (px number) |
| Blend mode | `blendMode` |
| Visibility | `visible` |

### Fills
| Type | Node Field |
|---|---|
| Solid color | `fills[].type:'solid'`, `.color`, `.opacity` |
| Linear gradient | `fills[].type:'gradient'`, `.gradientType:'linear'`, `.angle`, `.stops[]` |
| Radial gradient | `.gradientType:'radial'` |
| Angular gradient | `.gradientType:'angular'` |
| Diamond gradient | `.gradientType:'diamond'` |
| Image fill | `fills[].type:'image'`, `.imageUrl`, `.scaleMode` |

### Border / Stroke
| Property | Node Field |
|---|---|
| Color | `border.color` |
| Width | `border.width` |
| Style | `border.style` ('solid' / 'dashed' / 'dotted') |
| Position | `border.position` ('inside' / 'center' / 'outside') |
| Opacity | `border.opacity` |
| Per-side toggle | `border.sides.top/right/bottom/left` (boolean) |

### Shadows / Effects
| Property | Node Field |
|---|---|
| Drop shadow | `shadows[].type:'drop'` |
| Inner shadow | `shadows[].type:'inner'` |
| Color (rgba) | `shadows[].color` |
| Offset X/Y | `shadows[].offsetX/offsetY` |
| Blur | `shadows[].blur` |
| Spread | `shadows[].spread` |

---

## Gap Analysis Summary

| Feature | Paper Stores | Scytle Node Type | Parser Status | Fix Difficulty |
|---|---|---|---|---|
| Grid layout | `display: grid` | `layout.mode: 'grid'` | Partial | Medium |
| Grid spans | `gridColumnStart: span N` | `gridColumnSpan` | Missing | Easy |
| Flex child props | `flexGrow/Shrink/Basis` | All three fields | Partial | Easy |
| Absolute positioning | `position: absolute` + offsets | `positioning` + `cssPosition` | Partial | Medium |
| `translate` | Separate property | `cssPosition.translate` | Missing | Easy |
| Negative offsets | Stored as-is | Supported | Missing | Easy |
| `max-width/height` | Direct property | `maxWidth`/`maxHeight` | Partial | Easy |
| Gradients | `backgroundImage` | `fills[].gradient` | Partial | Hard |
| `filter: blur()` | Direct property | `layerBlur` | Missing | Easy |
| `overflow: clip` | `overflow: "clip"` | `overflow: 'hidden'` | Missing | Easy |
| 8-digit hex alpha | Stored as-is | color + opacity split | Missing | Easy |
| Per-side borders | Individual longhands | `border.sides` flags | Missing | Medium |
| Alpha color splitting | In all color props | Separate opacity fields | Missing | Easy |
| Box shadow spread | In shorthand | `shadows[].spread` | Partial | Easy |
| `margin: auto` centering | Flex centering | Flex centering | Missing | Medium |
| `transform` | Direct property | `cssPosition.transform` | Partial | Easy |

---

## Recommended Fix Priority

### Phase 1 — Quick Wins (Easy, high impact)
1. **Alpha color splitting** — Extract alpha from `#RRGGBBAA` and `rgba()` into color + opacity
2. **`overflow: clip/hidden`** — Map to `overflow: 'hidden'`
3. **`filter: blur()`** — Extract px value → `layerBlur` number
4. **Negative offsets** — Allow negative values in `cssPosition`
5. **`translate`** — Parse and map to `cssPosition.translate`
6. **Grid spans** — Extract `span N` from `gridColumn`/`gridRow`
7. **Flex shorthand** — Properly expand `flex: 1` → grow:1, shrink:1, basis:0%

### Phase 2 — Medium Effort
8. **Per-side borders** — Parse longhands, map to `border.sides` flags + dominant style
9. **Max-width/height** — Ensure all four min/max × width/height map correctly
10. **Absolute positioning** — Full pipeline: detect relative parent, set children absolute, map all offsets
11. **Auto-margin centering** — Convert `margin: 0 auto` to parent flex + `justifyContent: 'center'`
12. **Grid `fr` units** — Parse `repeat()` and `fr` into `layout.columns` array

### Phase 3 — Complex
13. **Gradient parsing** — Full CSS gradient syntax (angle, stops, color spaces, radial)
14. **Multi-shadow** — Parse comma-separated `box-shadow` into `shadows[]` array
15. **Transform** — Parse `transform: rotate() scale()` into structured data

---

## Architecture Note

Paper stores CSS properties nearly verbatim on nodes. Scytle uses a structured node model. The parser's job is to **bridge** these — and the node model is already capable. Focus fixes on the extraction and mapping logic in `domparser.ts`, not on extending node types.
