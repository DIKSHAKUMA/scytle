# Scytle — Known Issues & Debug Notes

> Last updated: 2026-04-05
> Status: Documented, pending fixes

---

## Table of Contents

1. [Issue 1: Page Frame Isolation](#issue-1-page-frame-isolation)
2. [Issue 2: Edit vs New Section](#issue-2-edit-vs-new-section)
3. [Issue 3: Unsplash Images Not Rendering](#issue-3-unsplash-images-not-rendering)
4. [Issue 4: Icons Not Rendering](#issue-4-icons-not-rendering)
5. [Issue 5: Parser Bugs (Padding, Radius, Absolute Position)](#issue-5-parser-bugs)
6. [Issue 6: No Skeleton Preview During Generation](#issue-6-no-skeleton-preview)
7. [Priority & Effort Matrix](#priority--effort-matrix)

---

## Issue 1: Page Frame Isolation

**Symptom:** When a user designs a "home page" and then prompts "design a pricing page", the pricing page sections get appended inside the home page frame instead of creating a new, separate page frame.

**Severity:** 🔴 Critical

### Root Cause

The module-level variable `_activePageFrameId` in `chat-panel.tsx` (line 40) **never gets reset** between different design requests.

```typescript
// chat-panel.tsx line 40
let _activePageFrameId: string | null = null
```

**Three compounding problems:**

1. **`resetActivePageFrame()` is defined but never called anywhere:**
   ```typescript
   // chat-panel.tsx lines 43-45
   export function resetActivePageFrame() {
       _activePageFrameId = null
   }
   ```
   Grep confirms: the function is exported but zero files import or call it.

2. **`parentNodeId` from the tool result is completely ignored:**
   ```typescript
   // chat-panel.tsx line 257 — only destructures html and sectionType
   const { html, sectionType } = result
   // ...
   // line 286 — always uses _activePageFrameId, never result.parentNodeId
   editorStore.addNode(newNode, _activePageFrameId)
   ```
   The `generateSection` tool defines a `parentNodeId` parameter (tools.ts line 91), returns it in the result, but the client-side handler ignores it completely.

3. **Thread switching doesn't clear state:**
   The `useRemoteThreadListRuntime` hook (chat-panel.tsx line 483) creates per-thread runtimes, but `_activePageFrameId` is module-level and shared across ALL threads.

### Flow Diagram

```
User: "Design me a home page"
  → AI calls generateSection(nav)
    → _activePageFrameId is null → creates Page frame (id: abc-123)
    → _activePageFrameId = "abc-123"
  → AI calls generateSection(hero)
    → _activePageFrameId = "abc-123" → appends to same frame ✅
  → AI calls generateSection(footer)
    → _activePageFrameId = "abc-123" → appends to same frame ✅

User: "Now design me a pricing page"
  → AI calls generateSection(nav)
    → _activePageFrameId is STILL "abc-123" → appends to HOME page ❌
    → Should create a new Page frame instead
```

### Files Involved

| File | Lines | What |
|------|-------|------|
| `src/components/chat/chat-panel.tsx` | 40-45, 256-286 | `_activePageFrameId`, `resetActivePageFrame()`, `applyToolResult()` |
| `src/lib/ai/tools.ts` | 83-102 | `generateSection` tool with unused `parentNodeId` |
| `src/lib/ai/prompts/system.ts` | 106, 114 | Mentions "generate sections ONE at a time" but no multi-page guidance |

### Fix Direction

- Call `resetActivePageFrame()` when a new thread is created
- Alternatively, detect when the AI is generating for a conceptually new page (via `sectionType` = "nav" after a footer, or a new `parentNodeId` value)
- Consider making the AI explicitly signal "new page" vs "add to existing page"

---

## Issue 2: Edit vs New Section

**Symptom:** When a user selects a navbar section on the canvas and prompts "change the layout of this section", the AI generates a brand new section and appends it to the bottom of the page, instead of editing the selected node in place.

**Severity:** 🔴 Critical

### Root Cause

The system prompt has **no instruction** telling the AI when to use `editNode` vs `generateSection` based on the current selection.

**What's sent to the AI:**
```
# CURRENT CANVAS
[{id: "abc", type: "frame", name: "Navbar", ...}]
Selected: abc-123
```

The AI sees the selected node ID but has **no guidance** on what to do with it.

**What's missing from the system prompt:**
- No instruction: "When a node is selected and the user asks to modify it, use `editNode` with that node ID"
- The `editNode` tool description (tools.ts line 108) says "Replace the HTML of an existing canvas node. Use for refinements and fixes." — too vague, doesn't mention selection

**What the `editNode` tool expects:**
```typescript
// tools.ts lines 109-113
inputSchema: z.object({
    nodeId: z.string().describe('ID of the node to replace'),
    html: z.string().describe('New HTML+Tailwind for this node'),
    reason: z.string().describe('Brief explanation'),
})
```

The tool itself works fine — the AI just doesn't know when to use it.

### Files Involved

| File | Lines | What |
|------|-------|------|
| `src/lib/ai/prompts/system.ts` | 259-288 | Tool usage guide — missing selection-aware instructions |
| `src/lib/ai/tools.ts` | 107-123 | `editNode` tool — works but description is vague |
| `src/components/chat/chat-panel.tsx` | 93-134 | `buildContext()` — sends `selectedNodeId` correctly |

### Fix Direction

- Add explicit instruction in system prompt Section 8 (Tool Usage):
  ```
  IMPORTANT: When a node is Selected (see CURRENT CANVAS below) and the user
  asks to change, modify, redesign, or update it — use editNode with that nodeId.
  Do NOT create a new section with generateSection.
  ```
- Also improve the `editNode` tool description to mention selection-based editing
- Optionally: send the selected node's HTML snippet so the AI has context on what it's editing

---

## Issue 3: Unsplash Images Not Rendering

**Symptom:** Images are not appearing in generated designs. The AI calls `searchImages` but no photos render on the canvas.

**Severity:** 🔴 Critical (but easiest fix)

### Root Cause

The environment variable `UNSPLASH_ACCESS_KEY` is **not set** in `.env.local`.

**Code path:**
```typescript
// unsplash.ts line 38
const apiKey = process.env.UNSPLASH_ACCESS_KEY

// unsplash.ts lines 39-42
if (!apiKey) {
    console.warn('⚠️ UNSPLASH_ACCESS_KEY not set — skipping image search')
    return []
}
```

When the key is missing:
1. `searchImages()` returns `[]` (empty array)
2. The AI tool returns: `"message": "No images found. Use a placeholder or SVG icon instead."`
3. No images appear on the canvas

**Additional problem:** `.env.example` doesn't document this variable at all, making it easy to miss during setup.

### Files Involved

| File | Lines | What |
|------|-------|------|
| `src/lib/ai/unsplash.ts` | 38-42 | API key check, returns empty on missing key |
| `src/lib/ai/tools.ts` | 128-155 | `searchImages` tool, calls unsplashSearch() |
| `.env.local` | — | Missing `UNSPLASH_ACCESS_KEY` |
| `.env.example` | — | Doesn't document the Unsplash variable |

### Fix

1. Add to `.env.local`:
   ```
   UNSPLASH_ACCESS_KEY=<your-access-key>
   ```

2. Add to `.env.example`:
   ```
   # Unsplash API (for AI image search)
   UNSPLASH_ACCESS_KEY=
   ```

### Unsplash API Details

- API: `https://api.unsplash.com/search/photos`
- Auth: `Authorization: Client-ID <access_key>` header
- The system has built-in caching (1-hour TTL, in-memory)
- Deduplication via `batchSearchImages()` for multiple queries
- Returns: `{ url, alt, credit, blurHash }` per image

---

## Issue 4: Icons Not Rendering

**Symptom:** Some SVG icons render correctly on the canvas, others don't appear at all or render incorrectly.

**Severity:** 🟠 Medium

### Root Cause

The parser has a **3-tier SVG handling system** with multiple failure points:

#### Tier 1: VectorNode (simple icons — works well)
- **Condition:** SVG has ≤8 paths/shapes AND no complex features
- Simple shapes (`<path>`, `<circle>`, `<rect>`, `<ellipse>`, `<line>`, `<polygon>`) are counted
- Creates an editable VectorNode with vectorNetwork geometry

#### Tier 2: Data URI Image (complex icons — renders but not editable)
- **Condition:** SVG has >8 paths OR contains complex features
- Complex features that trigger fallback:
  - `<mask>`, `<clipPath>` (clipping/masking)
  - `<linearGradient>`, `<radialGradient>` (gradients)
  - `<use>` (symbol reuse)
  - `<filter>` (effects)
  - `<pattern>`, `<image>` (patterns, nested images)
- Creates a FrameNode with ImageFill (data URI)

#### Tier 3: Dropped (zero paths or parse failure — icons disappear)
- If SVG has no drawable paths after shape conversion → **silently dropped**
- If `parseSvgToNetwork()` throws an error → falls back to data URI
- If data URI creation also fails → **silently dropped**

### Specific Failure Scenarios

| Scenario | Result |
|----------|--------|
| Lucide single path icon (check, arrow) | ✅ VectorNode |
| Lucide multi-path icon (2-3 paths) | ✅ VectorNode |
| Lucide icon with `<circle>` + paths | ✅ VectorNode (shapes converted to paths) |
| Icon with gradient fill | ⚠️ Data URI image (works but not editable) |
| Icon with `<mask>` or `<clipPath>` | ⚠️ Data URI image |
| Complex icon with 9+ paths | ⚠️ Data URI image |
| Emoji used as icon | ❌ Not supported — renders as text or dropped |
| CSS icon font (Material Icons, Font Awesome) | ❌ Not supported — not parsed |
| Malformed SVG path data | ❌ Silently dropped |

### Additional Bug: `hasVisualProperties()` Only Checks Top-Left Radius

```typescript
// iframe-parser.ts line 2096
const hasBorderRadius = parseFloat(cs.borderTopLeftRadius) > 0  // ❌ ONLY TOP-LEFT!
```

This means elements with border-radius on other corners (e.g. `rounded-tr-lg`) get incorrectly flattened to text nodes instead of remaining as frames. This can affect icon containers.

### Color Resolution for Icons

The parser resolves `currentColor` in SVGs (lines 2053-2076):
1. Check SVG root `fill` attribute
2. Check first child shape's `fill` attribute
3. Fallback: inherit from parent's computed text color

If `currentColor` can't be resolved, the icon may render with wrong or missing colors.

### Files Involved

| File | Lines | What |
|------|-------|------|
| `src/lib/parser/iframe-parser.ts` | 598-638 | SVG complexity check and routing |
| `src/lib/parser/iframe-parser.ts` | 770-780 | Data URI fallback |
| `src/lib/parser/iframe-parser.ts` | 2053-2076 | `resolveCurrentColor()` |
| `src/lib/parser/iframe-parser.ts` | 2096 | `hasVisualProperties()` bug — only checks TL radius |
| `src/lib/parser/svg-path-parser.ts` | 60-140 | Shape-to-path conversion |
| `src/lib/parser/svg-path-parser.ts` | 1-55 | Path data parsing |
| `src/components/editor/vector-renderer.tsx` | — | VectorNode rendering |

### Fix Direction

- Fix the `hasVisualProperties()` bug to check all 4 corners
- Improve error logging for dropped SVGs (currently silent)
- Consider increasing the 8-path limit for known icon libraries
- Add system prompt guidance: "Use simple inline SVGs with ≤8 paths. Avoid complex features like masks, gradients, clipPath in icons."

---

## Issue 5: Parser Bugs

**Symptom:** Multiple parsing issues: frames with padding only on left side, flat/wrong border radius, absolute positioned frames with incorrect width.

**Severity:** 🟠 Medium-High

### Bug 5A: Border-Radius Detection Only Checks Top-Left

**Location:** `iframe-parser.ts` line 2096

```typescript
// CURRENT — BUG
const hasBorderRadius = parseFloat(cs.borderTopLeftRadius) > 0
```

**Impact:** When the AI generates HTML with `rounded-tr-lg` or `rounded-b-xl` (radius on non-top-left corners), the parser's `hasVisualProperties()` returns false for that element. This causes it to be **flattened to a TextNode** instead of remaining as a FrameNode, losing its visual container.

**Note:** The actual extraction function `extractBorderRadius()` (line 1251) correctly reads all 4 corners. The bug is only in the detection/decision logic.

**Fix:**
```typescript
// FIXED — check all 4 corners
const hasBorderRadius =
    parseFloat(cs.borderTopLeftRadius) > 0 ||
    parseFloat(cs.borderTopRightRadius) > 0 ||
    parseFloat(cs.borderBottomLeftRadius) > 0 ||
    parseFloat(cs.borderBottomRightRadius) > 0
```

### Bug 5B: Absolute Position Width Inference

**Location:** `iframe-parser.ts` lines 1609-1754

**Problem:** Width inference for `position: absolute` elements is unreliable:

1. For `width: auto` → returns `'hug'` ✅ (correct)
2. For percentage/px → returns `'fixed'` ✅ (correct)
3. **Fallback spatial analysis** (lines 1689-1705) → **UNRELIABLE** because:
   - Uses `getBoundingClientRect()` on out-of-flow elements
   - 2px tolerance is too arbitrary
   - **Missing:** `inset` property handling
   - **Missing:** `left + right` constraint-based width calculation (e.g. `left: 0; right: 0` should imply full width)

**Example failure:**
```html
<!-- AI generates: -->
<div class="absolute inset-0 bg-black/50">...</div>

<!-- Parser should infer: width = parent width, height = parent height -->
<!-- Actually gets: unreliable getBoundingClientRect() measurement -->
```

### Bug 5C: Padding Rendering (Canvas, Not Parser)

**Location:** Parser extracts correctly, issue is in canvas rendering

**Parser extraction is correct** (line 1158):
```typescript
return {
    top: parseFloat(cs.paddingTop) || 0,
    right: parseFloat(cs.paddingRight) || 0,
    bottom: parseFloat(cs.paddingBottom) || 0,
    left: parseFloat(cs.paddingLeft) || 0,
}
```

**The "padding only on left side" issue** is likely a canvas rendering bug where the padding values are read correctly but applied incorrectly during layout. This needs further investigation in the canvas engine (`editor-store.ts` layout calculations or the rendering layer).

**Alternatively:** It could be a Tailwind parsing issue where `px-6` (horizontal padding) gets read as only `paddingLeft` if the iframe doesn't fully compute the shorthand.

### Bug 5D: Max-Width Sizing Semantics

**Location:** `iframe-parser.ts` lines 1679-1705

**Problem:** When an element has `max-width` + `mx-auto`, the parser returns `sizing: 'fill'` with a separate `maxWidth` constraint. Semantically, this should return `'fixed'` when maxWidth dominates the layout.

**Impact:** Low — the canvas currently handles this combination correctly by accident, but the semantic mismatch could cause issues with future layout features.

### Files Involved

| File | Lines | What |
|------|-------|------|
| `src/lib/parser/iframe-parser.ts` | 2096 | `hasVisualProperties()` — only checks TL radius |
| `src/lib/parser/iframe-parser.ts` | 1609-1754 | Absolute position width inference |
| `src/lib/parser/iframe-parser.ts` | 1158-1170 | Padding extraction (correct) |
| `src/lib/parser/iframe-parser.ts` | 1251-1270 | Border-radius extraction (correct) |
| `src/lib/parser/iframe-parser.ts` | 1679-1705 | Max-width sizing semantics |

### Fix Priority

| Sub-issue | Effort | Impact |
|-----------|--------|--------|
| 5A: Border-radius detection | 1 min | Medium — prevents element flattening |
| 5B: Absolute position width | 1-2 hrs | High — affects overlay/modal layouts |
| 5C: Padding rendering | Needs investigation | Medium — investigate canvas engine |
| 5D: Max-width semantics | 15 min | Low — works by accident currently |

---

## Issue 6: No Skeleton Preview

**Symptom:** Users must wait for the entire section to finish generating before seeing anything on the canvas. No progressive/skeleton preview appears during generation.

**Severity:** 🟡 Medium (UX improvement)

### Root Cause

**Architectural limitation:** Tool execution completes entirely server-side before the client applies results.

**Current flow:**
```
1. AI starts generating HTML (server-side in streamText())
2. Tool execute() runs to completion → returns full HTML blob
3. Stream sends complete tool result to client
4. Client receives status.type === 'complete'
5. Client parses HTML via iframe → adds nodes to canvas
6. User finally sees the design
```

**No intermediate step** exists between steps 1 and 5.

### What the Code Does

```typescript
// chat-panel.tsx lines 373-377 — ONLY applies on complete
useEffect(() => {
    if (status.type === 'complete' && result && !markToolApplied('generateSection', result)) {
        applyToolResult('generateSection', result)
    }
}, [status.type, result])
```

During `status.type === 'running'`:
- `args` contains tool arguments (including `sectionType`) — used only for display label
- `args.html` is **NOT available** during running phase (the AI is still generating the HTML server-side)
- No partial/streaming HTML is sent to the client

### What Assistant-UI Supports (But We Don't Use)

Assistant-ui v0.12.22 supports partial tool argument streaming:
```typescript
// process-ui-message-stream.ts — internal to assistant-ui
'tool-input-delta' → partial JSON args stream in
'tool-input-available' → full args finalized
'tool-output-available' → result complete, optionally preliminary: boolean
```

During `'input-streaming'` state, partial `args` (including partial `html`) is theoretically available via `parsePartialJson()`. However:
- Partial HTML is invalid/incomplete and can't be parsed
- The iframe parser needs complete, valid HTML to work

### What Exists But Is Unused

A `Skeleton` component exists at `src/components/ui/skeleton.tsx`:
```typescript
function Skeleton({ className, ...props }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-accent", className)} {...props} />
  )
}
```
This is a standard shadcn/ui skeleton — currently unused in the generation flow.

### Files Involved

| File | Lines | What |
|------|-------|------|
| `src/components/chat/chat-panel.tsx` | 370-395 | `GenerateSectionToolUI` — only applies on complete |
| `src/app/api/chat/route.ts` | 70-94 | `streamText()` configuration, tool execution |
| `src/lib/ai/tools.ts` | 83-102 | `generateSection` tool — returns full HTML blob |
| `src/components/ui/skeleton.tsx` | — | Unused skeleton component |

### Possible Approaches

| Approach | Effort | Quality |
|----------|--------|---------|
| **A. Skeleton placeholder on canvas** — show a placeholder frame with section name + loading animation when tool starts (`status.type === 'running'`), replace with real content on complete | 1-2 hrs | Good UX, simple |
| **B. Progressive HTML parsing** — stream partial HTML, parse what's valid so far, progressively render on canvas | 3-4 hrs | Great UX, complex |
| **C. Two-phase generation** — AI first generates a wireframe/skeleton layout (fast), then fills in details (second pass) | 2-3 hrs | Good UX, requires prompt engineering |
| **D. Optimistic section outline** — use `sectionType` from args during running phase to show a styled placeholder (e.g., "Hero Section" with expected height) | 1 hr | Decent UX, minimal effort |

**Recommended:** Start with **Approach A** (skeleton placeholder), evolve to **B** later.

---

## Priority & Effort Matrix

| Priority | Issue | Effort | Impact | Status |
|----------|-------|--------|--------|--------|
| 🔴 P0 | **#3: Unsplash API** | 1 min | Images render | Pending |
| 🔴 P0 | **#1: Page frame isolation** | 30 min | Multi-page designs work | Pending |
| 🔴 P0 | **#2: Edit vs new section** | 15 min | Selection-based editing works | Pending |
| 🟠 P1 | **#5A: Border-radius detection** | 1 min | Elements not flattened incorrectly | Pending |
| 🟠 P1 | **#5B: Absolute position width** | 1-2 hrs | Overlay/modal layouts correct | Pending |
| 🟠 P1 | **#4: Icon rendering** | 1 hr | More icons visible | Pending |
| 🟠 P1 | **#5C: Padding rendering** | Needs investigation | Correct padding on all sides | Pending |
| 🟡 P2 | **#6: Skeleton preview** | 1-2 hrs (approach A) | Better UX during generation | Pending |
| 🟡 P2 | **#5D: Max-width semantics** | 15 min | Correct sizing semantics | Pending |

### Suggested Fix Order

1. **Issue 3** — Add `UNSPLASH_ACCESS_KEY` to `.env.local` (1 min)
2. **Issue 5A** — Fix `hasVisualProperties()` radius check (1 min)
3. **Issue 2** — Add selection-aware instructions to system prompt (15 min)
4. **Issue 1** — Implement page frame reset logic (30 min)
5. **Issue 5B** — Fix absolute position width inference (1-2 hrs)
6. **Issue 4** — Improve icon rendering + error logging (1 hr)
7. **Issue 6** — Add skeleton preview (1-2 hrs)
8. **Issue 5C** — Investigate and fix padding rendering (TBD)
