# SCYTLE.AI — MVP LAUNCH PLAN
# ═══════════════════════════════════════════════════════════════
# Version: 0.1 (Rough Ideation — March 24, 2026)
# Authors: Dilip + Cofounder
#
# ⚠️  THIS IS A ROUGH IDEA FILE
# This document captures our initial thinking about what to build,
# approximate priorities, and early technical direction.
# Before implementing each feature, we need to:
#   1. Verify the technical approach with a spike/prototype
#   2. Define exact scope (what's in MVP vs V2)
#   3. Write acceptance criteria for each task
#   4. Revisit estimates based on actual code exploration
#
# The plan WILL change as we dig deeper. Treat this as a living
# document, not a contract.
# ═══════════════════════════════════════════════════════════════


## TABLE OF CONTENTS

1. [Where We Are Now](#1-where-we-are-now)
2. [What We're Building](#2-what-were-building)
3. [Priority Framework](#3-priority-framework)
4. [Feature Breakdown](#4-feature-breakdown)
   - F1. Chat Tab (AI Iteration)
   - F2. Theme System
   - F3. MCP Server
   - F4. Figma Export (Plugin)
   - F5. Browser Extension (Browse & Capture)
   - F6. Video-to-Flow
5. [2-Week Sprint Plan](#5-2-week-sprint-plan)
6. [Task Assignment](#6-task-assignment)
7. [Open Questions](#7-open-questions)
8. [Risk Register](#8-risk-register)
9. [Post-MVP Roadmap](#9-post-mvp-roadmap)


---


## 1. WHERE WE ARE NOW

### What's Working (Ship-Ready)
- ✅ Multi-page AI generation from text prompt (Gemini 3.1 Pro)
- ✅ HTML parser → ScytleNode tree (html-to-nodes + class-parser)
- ✅ Infinite canvas with pan/zoom/select/drag/resize
- ✅ Figma-parity fill system (solid/gradient/image, blend modes, DnD)
- ✅ Pen tool / vector editing
- ✅ Image crop mode
- ✅ Typography sub-components (font-family-picker, font-style-picker, etc.)
- ✅ HTML export pipeline (nodes-to-html, class-builder)
- ✅ Auth (Appwrite) + project CRUD
- ✅ Parser unit tests (vitest)

### What's Partially Built
- ⚠️ **Chat Tab** (~60% done) — Streaming chat UI works, AI design actions (replaceNode, addNode, deleteNode) work, BUT: no undo for AI actions, no toast/feedback after action execution, no design tokens passed to AI context, chat prompt truncates HTML to 150 chars
- ⚠️ **Theme System** (~10% done) — style-guide-store.ts exists (621 LOC, full concept/palette/font management), BUT: theme-tab.tsx is a non-functional UI stub with hardcoded presets, "Apply Theme" button is disabled, store is completely disconnected from UI
- ⚠️ **Export Pipeline** — HTML+Tailwind export works for basic cases, BUT: multi-fill backgrounds, gradients, blend modes, flex/grid child props, advanced typography, margins, rotation are all lost in export (render-utils.ts handles them for canvas but class-builder.ts doesn't export them)

### What Doesn't Exist Yet
- ❌ MCP Server
- ❌ Figma Plugin
- ❌ Browser Extension
- ❌ Video-to-Flow
- ❌ React component export (only raw HTML)


---


## 2. WHAT WE'RE BUILDING

Six features, in priority order:

| # | Feature | What It Does | Why It Matters |
|---|---------|-------------|----------------|
| F1 | **Chat Tab** | Iterate on designs via AI conversation | Without this, product is a one-shot generator. Users need to refine. |
| F2 | **Theme System** | Apply cohesive color/font/radius themes | Generated pages look random without unified design tokens. |
| F3 | **MCP Server** | Any AI agent reads our designs | **THE COMPETITIVE MOAT**. No other design tool does this. |
| F4 | **Figma Export** | One-click export canvas → Figma | Removes adoption friction. Users stay in their Figma workflow. |
| F5 | **Browser Extension** | Capture any website section → canvas | "I want THAT layout" moment. Viral potential. |
| F6 | **Video-to-Flow** | Upload screen recording → multi-page design | Wow factor. Can launch as "beta" / "coming soon". |


---


## 3. PRIORITY FRAMEWORK

### Why This Order?

```
F1 (Chat) + F2 (Theme)    →  Makes the product USABLE
F3 (MCP)                  →  Makes the product UNIQUE
F4 (Figma Export)          →  Makes the product ADOPTABLE
F5 (Browser Extension)     →  Makes the product VIRAL
F6 (Video-to-Flow)         →  Makes the product WOW
```

**F1 + F2 come first** because right now the product generates pages and... that's it.
You can't iterate, you can't unify the look. Without these, nobody uses it twice.

**F3 (MCP) is the headline feature**. When we launch, the story is:
"Design with AI, then ANY coding agent builds it pixel-perfect."
Figma has MCP but only for reading Figma files. We have MCP that serves
AI-generated, user-refined designs — that's a new category.

**F4 (Figma Export)** removes the biggest objection: "But my team uses Figma."
Now they can use Scytle for generation → export to Figma for collaboration.

**F5 + F6 are growth features**. Browser extension is the "aha" moment for users
browsing competitors. Video-to-Flow is the demo that goes viral on Twitter/X.


---


## 4. FEATURE BREAKDOWN

### ─────────────────────────────────────────────────
### F1. CHAT TAB (AI Iteration)
### ─────────────────────────────────────────────────

**Current State**: ~60% done. Chat UI streams, AI actions work.
**Goal**: User can select any node and say "make this better" and see changes.

#### What's Already Working
- chat-store.ts (348 LOC): Streaming, abort, message history, model selection
- chat-tab.tsx (328 LOC): UI with messages, auto-resize input, model selector,
  selection context bar, AI design action parsing (replaceNode/addNode/deleteNode)
- api/chat/route.ts (204 LOC): JWT auth, conversation history from DB,
  streaming via createStreamResponse(), message persistence
- chat-design.ts (60 LOC): System prompt with canvas state injection

#### What Needs to Be Built

**P0 — Must Have for Launch:**
- [ ] **Undo/redo for AI actions**: When AI replaces/adds/deletes nodes, it should
      call `_snap()` before mutating so users can Ctrl+Z. Currently AI actions
      bypass the undo system entirely.
      Files: chat-tab.tsx (where actions are applied)
- [ ] **Action feedback**: Show a toast ("Applied: replaced Hero section") after
      executing an AI design action. Currently changes happen silently.
      Files: chat-tab.tsx
- [ ] **Pass design tokens to AI context**: The AI doesn't know the user's
      color palette or fonts. It generates with random colors that don't match.
      Need to inject style-guide tokens (or at least the active theme colors/fonts)
      into the chat-design.ts system prompt.
      Files: chat-design.ts, chat-tab.tsx (pass tokens from store)
- [ ] **Improve HTML truncation**: Currently truncates node HTML to 150 chars,
      which loses structure. Should smart-truncate: keep tag structure, remove
      content, show depth. Or use a JSON summary instead of HTML.
      Files: chat-design.ts (buildDesignChatPrompt)

**P1 — Should Have:**
- [ ] **Multi-node selection context**: Currently only passes single selected node.
      Should handle multi-select ("make all these cards the same height").
- [ ] **Whole-page operations**: "Redesign this entire page" should work.
      Need to handle large node trees without exceeding token limits.
- [ ] **Verify conversation persistence endpoint**: chat-store calls
      `/api/projects/{projectId}/chat` GET — need to confirm this endpoint exists.

**P2 — Nice to Have (Post-MVP):**
- [ ] Conversation branching (fork from any message)
- [ ] Message reactions / thumbs up/down
- [ ] "Show me 3 options" → side-by-side comparison
- [ ] Voice input

**Estimate**: 3-4 days (P0 only)


### ─────────────────────────────────────────────────
### F2. THEME SYSTEM
### ─────────────────────────────────────────────────

**Current State**: Store built (621 LOC), UI is a dead stub (162 LOC).
**Goal**: User picks a theme → all pages update colors/fonts/radii instantly.

#### What's Already Working
- style-guide-store.ts (621 LOC): Full Zustand store with concepts, palettes,
  font pairs, typography tokens, UI tokens, section scheme overrides,
  computed CSS custom properties, localStorage persistence
- Token system (src/lib/designs/v2/tokens/): AccentColor, ColorTokens,
  TypographyTokens, UITokens, palettes, font-pairs, defaults, provider

#### What Needs to Be Built

**P0 — Must Have for Launch:**
- [ ] **Wire theme-tab.tsx to style-guide-store**: Replace hardcoded presets
      with actual palette data. Enable the "Apply Theme" button.
      Call store actions (setColorPalette, setFontPair, shufflePalette, etc.)
      when user interacts. Show current active theme state.
      Files: theme-tab.tsx, style-guide-store.ts
- [ ] **Build "Apply Theme to Canvas" action**: When theme changes, walk all
      ScytleNodes in editor-store and update:
      - Background colors → map to new palette
      - Text colors → map to new palette
      - Font families → swap to new font pair
      - Border radii → apply new radius preset
      This is the hardest part. Need a `applyThemeToNodes(nodes, theme)` function.
      Files: new file src/lib/theme/apply-theme.ts, editor-store.ts
- [ ] **Color palette picker**: Replace static swatches with interactive pickers.
      Can reuse existing ColorPicker component from fill system.
      Files: theme-tab.tsx, color-picker/ (reuse)
- [ ] **Font pair selector**: Dropdown/popover showing available font pairs
      with live preview. Can reuse font-family-picker.tsx pattern.
      Files: theme-tab.tsx, font-family-picker.tsx (reference)
- [ ] **Real-time preview**: Theme changes should reflect on canvas immediately
      (not require page reload). Either inject CSS variables into canvas wrapper
      OR re-render nodes with new properties.

**P1 — Should Have:**
- [ ] Custom theme creation (not just presets)
- [ ] Theme persistence to Appwrite (currently localStorage only)
- [ ] Per-page theme overrides
- [ ] WCAG contrast ratio indicators

**P2 — Nice to Have (Post-MVP):**
- [ ] Theme export as CSS variables / Tailwind config
- [ ] Theme import from Figma / CSS file
- [ ] AI-generated themes from prompt ("corporate tech vibe")
- [ ] Multiple concept variations with A/B toggle

**⚠️ HARD PROBLEM: "Apply Theme to Canvas"**
The fundamental challenge: how do you take a page generated with random colors
and remap it to a new palette? Options to investigate:

  Option A — "Color Role Detection": AI analyzes each node's color and assigns
  a semantic role (primary, secondary, background, text, accent). Then swap
  each role to the new palette's equivalent. Needs AI call per page.

  Option B — "Positional Heuristic": Background of outermost frames → bg color.
  Text → text color. Buttons/CTAs → accent. Simple rules, no AI needed, but brittle.

  Option C — "Generation-Time Tagging": When AI generates HTML, require it to use
  CSS variables (--primary, --accent, etc.) instead of hardcoded colors.
  Then theme swap is just updating the variables. Cleanest, but requires
  changing the generation prompt and parser.

  **Recommendation**: Start with Option C for new generations (update prompt to use
  CSS vars). For existing/imported content, fall back to Option A.

**Estimate**: 4-5 days (P0 only)


### ─────────────────────────────────────────────────
### F3. MCP SERVER (Scytle Design Server)
### ─────────────────────────────────────────────────

**Current State**: Nothing exists.
**Goal**: Any AI coding agent can connect and read Scytle designs to generate
pixel-perfect code.

#### Reference: How Figma's MCP Works
Figma exposes 13 tools via HTTP transport. Key ones:
- `get_design_context`: Returns structured design data optimized for code gen
- `get_variable_defs`: Returns design tokens (colors, spacing, typography)
- `get_screenshot`: Captures visual reference as image
- `get_metadata`: Sparse XML/JSON of node tree structure

Figma's insight: "Reducing context helps accuracy." They filter and simplify
raw data before sending to AI agents.

Open-source reference: Framelink/Figma-Context-MCP (MIT, 14k stars)
Also: Penpot MCP (MPL-2.0) — uses WebSocket bridge to plugin

#### What Needs to Be Built

**P0 — Must Have for Launch:**
- [ ] **MCP Server package**: New directory `scytle-mcp/` (or monorepo package).
      TypeScript, `@modelcontextprotocol/sdk`, HTTP transport.
      Runs locally at `http://localhost:3847/mcp`.
      Config for Claude Code:
      ```json
      { "mcpServers": { "scytle": { "url": "http://localhost:3847/mcp" } } }
      ```
      Files: new package

- [ ] **Tool: `get_page_list`**: Returns all pages in the current project
      with names, IDs, node counts. Lightweight overview.
      Source: reads from editor-store or API endpoint.

- [ ] **Tool: `get_design_context`**: The core tool. Given a page ID or node ID,
      returns the design as structured data optimized for code generation.
      Output format: React + Tailwind by default (configurable to HTML, Vue, etc.)
      This reuses the existing export pipeline (nodes-to-html + class-builder)
      but extended to handle the gaps identified above.

      ⚠️ IMPORTANT: class-builder.ts currently drops:
      - Multi-fill backgrounds (only uses first fill)
      - Gradient fills (becomes broken arbitrary class)
      - Blend modes (ignored)
      - Flex/grid child props (layoutGrow, flexShrink, etc.)
      - Full typography (fontFamily, fontWeight, fontStyle, lineHeight, letterSpacing)
      - Margin, rotation, min/max constraints

      For MVP, consider outputting hybrid: Tailwind classes + inline style
      fallbacks for things Tailwind can't express. This gives agents the
      most accurate representation.

- [ ] **Tool: `get_styles`**: Returns the project's design tokens:
      color palette, font pairs, radius presets, spacing scale.
      Source: style-guide-store data.
      Output: JSON object with semantic names + values.

- [ ] **Tool: `get_screenshot`**: Renders a page or frame as a PNG.
      Could use Playwright/Puppeteer to render the canvas, or use the
      existing HTML export + headless browser.
      Or simpler: expose a server-side render endpoint that returns an image.

- [ ] **Auth**: API key per project. User generates key in project settings.
      MCP server validates key on each request.

**P1 — Should Have:**
- [ ] `get_component_tree`: Sparse metadata (like Figma's XML output) — just
      node IDs, types, names, positions, sizes. For when agents need structure
      without full code output.
- [ ] Framework output options: React+Tailwind (default), Vue, HTML+CSS,
      React Native, Flutter
- [ ] Remote server deployment (not just localhost) for cloud agent access

**P2 — Nice to Have (Post-MVP):**
- [ ] `update_design`: Write-back tool — agent can update node properties
      (bidirectional MCP, like Penpot's approach)
- [ ] `generate_component`: Agent describes a component, MCP generates and
      adds it to the canvas
- [ ] Live sync: WebSocket transport for real-time design updates

**⚠️ KEY DECISION: How does the MCP server access project data?**

  Option A — "API Proxy": MCP server calls Scytle's Next.js API endpoints
  (`/api/projects/{id}`, etc.). Requires the app to be running.
  Pro: Single source of truth. Con: Requires app running, network overhead.

  Option B — "Direct DB": MCP server reads Appwrite DB directly.
  Pro: Works without app running. Con: Duplicates data access logic.

  Option C — "Local State": MCP server runs alongside the app and reads
  editor-store state via shared memory / IPC / localStorage.
  Pro: Real-time, no network. Con: Only works locally.

  **Recommendation for MVP**: Option A (API Proxy). MCP server is a thin
  layer that calls our API. This means the app must be running, which is
  fine for local dev use. For hosted deployment later, the MCP server
  just points to the production API.

**Estimate**: 4-5 days (P0 only)


### ─────────────────────────────────────────────────
### F4. FIGMA EXPORT (Plugin)
### ─────────────────────────────────────────────────

**Current State**: Nothing exists.
**Goal**: User clicks "Export to Figma" → opens in Figma with editable nodes.

#### How It Works (Researched)
- Figma REST API CANNOT create nodes (read-only for design data)
- `.fig` binary format is proprietary and fragile (not viable)
- **Only viable path**: Figma Plugin API
  - Plugin runs inside Figma editor
  - Has `figma.createFrame()`, `figma.createText()`, `figma.createImage()`, etc.
  - Plugin UI (iframe) can `fetch()` from external APIs
  - Main thread creates nodes via `postMessage` relay

#### Architecture
```
Scytle App                     Figma
─────────                      ─────
"Export to Figma" button       "Import from Scytle" plugin
        │                              │
        ▼                              ▼
  POST /api/export/figma        Plugin UI (iframe)
  → serialize ScytleNodes       → fetch() Scytle API
  → return Figma-compatible     → receives node JSON
    JSON payload                → postMessage to main thread
                                       │
                                       ▼
                                Plugin Main (sandbox)
                                → figma.createFrame()
                                → figma.createText()
                                → figma.createImage()
                                → sets fills, effects, layout
                                       │
                                       ▼
                                Editable Figma Design ✓
```

#### ScytleNode → Figma Mapping (Our types align closely!)
| ScytleNode | Figma API | Notes |
|------------|-----------|-------|
| FrameNode | `figma.createFrame()` | Set layoutMode, padding, gap |
| TextNode | `figma.createText()` | Must call `loadFontAsync()` first |
| ImageNode | `figma.createImage(bytes)` → ImagePaint fill | Fetch image, get hash |
| VectorNode | `figma.createVector()` | Our vectorNetwork schema matches Figma's! |
| Solid fill | `{ type: 'SOLID', color: {r,g,b}, opacity }` | Direct map |
| Gradient fill | `{ type: 'GRADIENT_LINEAR', gradientStops, gradientTransform }` | Need transform matrix |
| Image fill | `{ type: 'IMAGE', imageHash, scaleMode }` | Need to upload image first |
| Shadow | `{ type: 'DROP_SHADOW', color, offset, radius, spread }` | Direct map |
| Border | Box-stroke properties | borderWeight, borderColor, etc. |
| Auto Layout | layoutMode + all AL props | Our flex maps to Figma AL |

#### What Needs to Be Built

**P0 — Must Have for Launch:**
- [ ] **Export API endpoint**: `POST /api/export/figma-json`
      Receives project/page ID, serializes ScytleNode tree to Figma-compatible
      JSON. This is NOT the same as the Figma REST API format — it's our own
      intermediate format that the plugin understands.
      Files: new src/app/api/export/figma-json/route.ts

- [ ] **Figma plugin scaffold**: manifest.json, code.ts, ui.html
      networkAccess for scytle.ai + localhost:3000
      Files: new scytle-figma-plugin/ directory

- [ ] **Plugin UI**: Simple UI showing project list or paste-a-link input.
      Fetches design JSON from Scytle API. Progress bar during import.

- [ ] **Plugin mapper**: ScytleNode → Figma nodes. Handle:
      - Frame → createFrame() with auto-layout props
      - Text → createText() with font loading
      - Image → fetch image bytes → createImage() → ImagePaint fill
      - Recursive children → appendChild()
      - Fills, borders, shadows, corner radii
      - Positioning (x, y, width, height)
      Files: new mapper.ts in plugin

**P1 — Should Have:**
- [ ] Vector export (our VectorNetwork → Figma VectorNetwork — schemas match!)
- [ ] Component detection (repeated structures → Figma Components)
- [ ] Style extraction (shared colors/fonts → Figma local styles)
- [ ] Gradient fill transform matrix computation

**P2 — Nice to Have (Post-MVP):**
- [ ] Bidirectional sync (Figma → Scytle import)
- [ ] Figma Community plugin listing
- [ ] Design diff (compare Scytle vs Figma version)

**⚠️ FONT HANDLING COMPLEXITY**
`figma.loadFontAsync({ family, style })` is required before setting characters.
Our TextNode has fontFamily + fontWeight + fontStyle, but Figma requires the
exact style name string ("Bold Italic", "SemiBold", etc.).
Need a mapping: our (fontWeight: 700, fontStyle: 'italic') → Figma "Bold Italic".
Google Fonts metadata already has this in font-manifest.ts.

**Estimate**: 3-4 days (P0 only, assuming mapper covers basic node types)


### ─────────────────────────────────────────────────
### F5. BROWSER EXTENSION (Browse & Capture)
### ─────────────────────────────────────────────────

**Current State**: Nothing exists.
**Goal**: User browses any site → clicks extension → selects a section →
it appears on their Scytle canvas, restyled to their theme.

#### Architecture
```
[Chrome Browser — any website]
        │
  User clicks Scytle extension icon
        │
        ▼
[Service Worker (background.js)]
  → chrome.scripting.executeScript() injects picker
        │
        ▼
[Content Script (picker.js)]
  → Overlay element picker (hover highlight, click select)
  → Smart section detection (walk up to <section>/<article>/meaningful div)
  → Arrow keys to expand/contract selection
  → On select: extract outerHTML + className + targeted computed styles
        │
        ▼
[Service Worker]
  → POST to /api/capture or externally_connectable messaging
        │
        ▼
[Scytle Next.js App]
  → Run captured HTML through html-to-nodes parser (ALREADY BUILT!)
  → Create ScytleNodes on canvas
  → Optionally: AI re-styles to match user's active theme
```

#### What We Extract (Not Everything — Just What We Need)
Since our parser handles HTML+Tailwind, we extract:
- `element.outerHTML` (structure + classes)
- `element.className` (for Tailwind class preservation)
- Targeted computed styles (ONLY what parser needs):
  - Layout: display, position, width, height, padding, margin, gap, flex-*, grid-*
  - Visual: background-color, background-image, color, border-*, border-radius,
    box-shadow, opacity
  - Typography: font-family, font-size, font-weight, line-height, letter-spacing,
    text-align
  - Other: overflow, z-index, transform
- Optional: screenshot of selection via captureVisibleTab

#### Chrome Extension Manifest (MV3)
```json
{
  "manifest_version": 3,
  "name": "Scytle Capture",
  "permissions": ["activeTab", "scripting", "storage"],
  "host_permissions": ["<all_urls>"],
  "action": { "default_title": "Capture Section" },
  "background": { "service_worker": "background.js" },
  "externally_connectable": {
    "matches": ["http://localhost:3000/*", "https://*.scytle.ai/*"]
  }
}
```

#### What Needs to Be Built

**P0 — Must Have for Launch:**
- [ ] **Extension scaffold**: MV3 manifest, icons, background.js service worker
      Files: new scytle-extension/ directory
- [ ] **Element picker**: Content script with:
      - Hover overlay (border + semi-transparent bg, z-index max)
      - Smart container detection (prefer <section>/<article>/<main>)
      - Arrow up/down to expand/contract selection
      - Click to select (capture phase, preventDefault)
      - Tooltip showing element tag + dimensions
- [ ] **HTML extraction**: On select, gather outerHTML + targeted computed styles.
      Use strategy: read ALL styles first into array, then batch write
      (to avoid style recalculation cascade — this is a known gotcha).
- [ ] **Send to Scytle**: POST captured HTML to `/api/capture` endpoint.
      New API route that runs html-to-nodes parser and saves result to project.
      OR use externally_connectable for direct browser-to-app messaging.
      Files: new src/app/api/capture/route.ts
- [ ] **"Open in Scytle" flow**: After capture, either:
      - Auto-open Scytle tab with the captured section on canvas
      - Copy to clipboard for paste into Scytle
      - Show "View in Scytle" button in extension popup

**P1 — Should Have:**
- [ ] AI re-styling: After importing section, AI adjusts colors/fonts
      to match user's active theme tokens
- [ ] Multiple section capture (select several sections before importing)
- [ ] Screenshot capture alongside HTML (for visual reference)
- [ ] Section detection refinement (ignore nav bars, cookie banners, ads)

**P2 — Nice to Have (Post-MVP):**
- [ ] Right-click context menu: "Capture this to Scytle"
- [ ] "Capture full page" mode (entire scrollable page)
- [ ] Side-by-side comparison (original vs Scytle version)
- [ ] Firefox / Safari extension ports

**⚠️ GOTCHAS TO WATCH FOR:**
1. Cross-origin stylesheets throw SecurityError — need try/catch fallback
2. Iframes need `allFrames: true` in executeScript
3. Shadow DOM (closed roots are inaccessible)
4. MV3 service workers die after ~30s — store captured data in chrome.storage.local
5. Extension ID changes on reload during dev — use consistent `key` in manifest

**Estimate**: 3-4 days (P0 only)


### ─────────────────────────────────────────────────
### F6. VIDEO-TO-FLOW
### ─────────────────────────────────────────────────

**Current State**: Nothing exists.
**Goal**: User uploads a screen recording → AI analyzes → generates
multi-page design matching the recorded flow.

#### Technical Feasibility (Researched)

**Gemini 2.5 Flash has native video input:**
- Upload MP4/WebM/MOV directly via Files API (up to 20GB)
- 1 frame/second default sampling
- 258 tokens/frame (standard) or 66 tokens/frame (low-res)
- 30s video = ~9,450 tokens input ≈ $0.003 cost (essentially free)
- Can reference specific timestamps (MM:SS)

**Claude does NOT support video** — would need frame extraction workaround.

**What AI Can Detect from Video:**
| Interaction | Confidence | Notes |
|------------|-----------|-------|
| Page transitions | HIGH | Clear visual changes |
| Button clicks | MEDIUM-HIGH | Visual state changes visible |
| Scroll behavior | HIGH | Content shifting detected |
| Modal/overlay opens | HIGH | Large visual change |
| Form interactions | HIGH | Focus states, dropdowns visible |
| Hover states | MEDIUM | May miss at 1 FPS sampling |
| Exact animation easing | LOW | Can detect animation exists, not exact CSS curve |
| Business logic | IMPOSSIBLE | Can't infer JS from video |

**What AI Cannot Reliably Detect:**
- Exact CSS easing functions
- Sub-second animation durations (1 FPS limitation)
- Subtle CSS transitions (box-shadow changes, etc.)
- JavaScript event handlers / business logic
- Responsive breakpoint behavior (unless shown in video)

#### Architecture
```
[User uploads MP4/WebM — max 60s for MVP]
        │
        ▼
[Upload to Gemini Files API]
        │
        ├──► [Gemini 2.5 Flash: Full video analysis]
        │         Output: {
        │           pages: [{ name, description, layout, components[] }],
        │           flow: [{ from, to, trigger, transition }],
        │           palette: { primary, secondary, bg, text, accent },
        │           typography: { headingFont, bodyFont, sizes[] }
        │         }
        │
        ├──► [FFmpeg: Scene detection + key frame extraction]
        │         → 1 representative frame per detected page/view
        │
        ▼
[Merge: video analysis + key frames]
        │
        ▼
[For each detected page:]
  → Send key frame as image + page description to generate-html
  → Existing pipeline: HTML generation → parser → ScytleNodes
        │
        ▼
[Multi-page project on canvas with detected flow structure]
```

#### What Needs to Be Built

**P0 — Must Have for Launch (Simplified MVP):**
- [ ] **Video upload UI**: In new project creation flow, alongside text prompt,
      add "Upload a video" option. Accept MP4/WebM, max 60 seconds.
      Show upload progress + "Analyzing..." state.
      Files: modify src/app/dashboard/new/page.tsx
- [ ] **Video analysis API**: `POST /api/ai/analyze-video`
      - Upload video to Gemini Files API
      - Send to Gemini 2.5 Flash with structured analysis prompt
      - Extract: page list, component inventory, color palette, layout patterns
      - Return as enhanced planner output (same shape as plan-pages response)
      Files: new src/app/api/ai/analyze-video/route.ts
- [ ] **Frame extraction**: Use FFmpeg (server-side via child_process, or
      client-side via ffmpeg.wasm) to extract key frames.
      Scene detection threshold: 0.3 for UI recordings.
      Files: new src/lib/video/extract-frames.ts
- [ ] **Image-assisted generation**: Extend generate-html to accept an
      image (key frame) as additional context. "Generate HTML that matches
      this screenshot's layout."
      Files: modify src/app/api/ai/generate-html/route.ts,
             modify page-generation.ts prompt

**P1 — Should Have:**
- [ ] Animation detection: Detect transition types (fade, slide, scale) and
      apply sensible CSS animation presets
- [ ] Higher FPS sampling option (2-5 FPS) for hover/micro-interaction detection
- [ ] Side-by-side: show original video frame vs generated design

**P2 — Nice to Have (Post-MVP):**
- [ ] Interaction state generation (hover states, active states, focus states)
- [ ] User flow diagram on canvas (connecting generated pages with arrows)
- [ ] Multiple video support (stitch recordings together)
- [ ] Audio narration analysis (voice commands during recording)

**⚠️ FFmpeg DEPENDENCY**
Server-side FFmpeg is needed for frame extraction. Options:
  A) System FFmpeg binary via child_process (requires FFmpeg installed on server)
  B) ffmpeg.wasm (runs in browser/Node, no system dependency, ~25MB WASM binary)
  C) Cloud function (Google Cloud Run with FFmpeg pre-installed)

For MVP: Option A (system binary). For production: Option C (serverless).

**⚠️ VIDEO SIZE LIMITS**
Gemini Files API: max 20GB (paid), 2GB (free tier).
But large videos = more tokens = slower + more expensive.
MVP constraint: 60 seconds max. Show clear error for longer videos.

**Estimate**: 4-5 days (P0 only)


---


## 5. 2-WEEK SPRINT PLAN

### WEEK 1 (Days 1–7): Core Product + Moat

| Day | Person 1 (Canvas/UI) | Person 2 (API/Infrastructure) |
|-----|---------------------|------------------------------|
| **1** | F1: Chat undo/redo + action feedback | F3: MCP server scaffold + auth |
| **2** | F1: Design token context in AI + truncation fix | F3: `get_page_list` + `get_design_context` tools |
| **3** | F2: Wire theme-tab → style-guide-store | F3: `get_styles` + `get_screenshot` tools |
| **4** | F2: "Apply Theme to Canvas" function (Option C — CSS vars in generation) | F3: Test MCP with Claude Code end-to-end |
| **5** | F2: Color palette picker + font pair selector | F4: Export API endpoint + Figma plugin scaffold |
| **6** | F2: Real-time preview + polish | F4: Plugin mapper (Frame + Text + basic fills) |
| **7** | Integration testing + bug fixes | F4: Plugin mapper (Images + shadows + layout) |

### WEEK 2 (Days 8–14): Growth Features + Launch

| Day | Person 1 (Canvas/UI) | Person 2 (API/Infrastructure) |
|-----|---------------------|------------------------------|
| **8** | F5: Extension scaffold + element picker | F6: Video upload UI + Gemini analysis API |
| **9** | F5: HTML extraction + smart section detection | F6: Frame extraction (FFmpeg) + image-assisted gen |
| **10** | F5: Send to Scytle + parser pipeline | F6: Integration test (video → pages on canvas) |
| **11** | F5: Polish extension UX + popup | F4: Figma plugin testing + fixes |
| **12** | End-to-end testing all features | MCP server docs + README |
| **13** | Bug fixes + polish | Landing page updates + demo |
| **14** | Final testing + launch prep | Chrome Web Store + Figma Community listing prep |


---


## 6. TASK ASSIGNMENT

### Why This Split Works

**Person 1 stays in the UI/canvas layer:**
- Editor-store, properties panel, React components
- Browser extension (DOM manipulation, content scripts)
- Theme UI, chat UI
- Files touched: `src/components/`, `src/store/editor-store.ts`,
  `scytle-extension/`

**Person 2 stays in the API/infrastructure layer:**
- MCP protocol, Figma plugin API, server-side AI
- Video processing, FFmpeg, Gemini API
- Export serialization, API routes
- Files touched: `src/app/api/`, `src/lib/export/`, `scytle-mcp/`,
  `scytle-figma-plugin/`

**Minimal merge conflicts** — they touch completely different file areas.

### Dependencies Between Tracks

```
F1 (Chat) ──────────────► standalone (no dependency)
F2 (Theme) ─────────────► F3 (MCP) needs theme tokens from F2
F3 (MCP) ──────────────► needs export pipeline (exists but needs gaps fixed)
F4 (Figma) ─────────────► needs export API (F3 work overlaps)
F5 (Extension) ─────────► needs /api/capture endpoint (Person 2 builds it Day 10)
F6 (Video) ─────────────► needs generate-html to accept image context
```


---


## 7. OPEN QUESTIONS

These need to be answered before or during implementation:

### Architecture Questions
1. **Theme application strategy**: Option A (AI color role detection), B (positional heuristic),
   or C (CSS vars at generation time)? → Recommend starting with C, figure out specifics.
2. **MCP server data access**: API proxy, direct DB, or local state? → Leaning API proxy.
3. **MCP server deployment**: Local-only for MVP, or also hosted? Need to decide before launch.
4. **FFmpeg dependency**: System binary, WASM, or cloud function? → System binary for MVP.

### Product Questions
5. **Browser extension distribution**: Chrome Web Store from day 1, or sideload during beta?
6. **Figma plugin distribution**: Figma Community listing, or private link during beta?
7. **Video-to-Flow**: Launch as "beta" label, or full feature? → Recommend beta label.
8. **MCP pricing**: Free during beta? Per-project API keys? Usage-based later?

### Technical Questions
9. **Export pipeline gaps**: How much of the render-utils → class-builder gap do we close
   for MVP vs accept lossy export? → Recommend hybrid (Tailwind + inline fallbacks).
10. **Conversation persistence**: Does GET `/api/projects/{projectId}/chat` exist?
    Need to verify or build it.
11. **Figma font mapping**: How do we map our (fontWeight, fontStyle) → Figma style name
    strings? Use font-manifest.ts data or build a lookup table?
12. **Image hosting for Figma**: Figma plugin needs image bytes. Where do we host
    user-uploaded images? Appwrite storage? Cloudflare R2?


---


## 8. RISK REGISTER

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| Theme application is harder than expected (color remapping) | HIGH — F2 delayed | MEDIUM | Start with CSS var approach for new generations; skip legacy remapping for MVP |
| Export pipeline gaps block MCP accuracy | MEDIUM — F3 outputs lossy code | HIGH | Accept hybrid output (Tailwind + inline styles) for MVP; improve incrementally |
| Figma font loading is flaky / slow | MEDIUM — F4 UX suffers | MEDIUM | Default to system fonts; load Google Fonts best-effort |
| FFmpeg not available in production deployment | HIGH — F6 broken | LOW | Use ffmpeg.wasm as fallback; or extract frames client-side before upload |
| MCP SDK has breaking changes / limited docs | MEDIUM — F3 delayed | LOW | Framelink (14k stars) is a solid reference; MCP protocol is stable |
| Chrome Web Store review takes > 1 week | LOW — F5 delayed | MEDIUM | Sideload for beta users; submit early |
| 2-week timeline is too aggressive | HIGH — incomplete launch | HIGH | Prioritize F1+F2+F3 (7 days); F4+F5 as "day 1 add-ons"; F6 as "coming soon" |
| Gemini video API rate limits during demo | MEDIUM — F6 fails in demo | LOW | Pre-generate demo project; have fallback recording |


---


## 9. POST-MVP ROADMAP

After the 2-week launch, in rough priority order:

### Month 1 After Launch
- [ ] Bidirectional Figma sync (import FROM Figma)
- [ ] MCP write-back tools (agents can update designs, not just read)
- [ ] Chat: "Show me 3 options" with side-by-side comparison
- [ ] Theme: AI-generated themes from text description
- [ ] Extension: "Capture full page" mode
- [ ] Video: hover state + animation detection (higher FPS)

### Month 2-3
- [ ] Hosted MCP server (no local setup needed)
- [ ] React Native / Flutter export via MCP
- [ ] Collaborative editing (multiplayer canvas)
- [ ] Version history with visual diff
- [ ] Component library system (save + reuse across projects)
- [ ] AI-powered responsive design (auto-generate mobile/tablet variants)

### Future
- [ ] Figma → Scytle import (reverse pipeline)
- [ ] Code → Canvas (paste React code, see it on canvas)
- [ ] Live preview (edit on canvas, see live website in split pane)
- [ ] Plugin marketplace (third-party MCP tools, export targets)
- [ ] Team workspaces with role-based access


---


## APPENDIX: KEY CODE REFERENCES

### Files Person 1 Will Touch Most
```
src/components/workspace/chat-tab.tsx      (328 LOC — chat UI)
src/components/workspace/theme-tab.tsx     (162 LOC — stub, needs rewrite)
src/store/editor-store.ts                  (1878 LOC — undo, theme apply)
src/store/style-guide-store.ts             (621 LOC — theme state)
src/lib/ai/prompts/chat-design.ts          (60 LOC — AI context)
scytle-extension/                          (NEW — browser extension)
```

### Files Person 2 Will Touch Most
```
src/lib/export/nodes-to-html.ts            (199 LOC — extend for MCP)
src/lib/export/class-builder.ts            (289 LOC — fix gaps)
src/types/canvas.ts                        (806 LOC — reference only)
src/app/api/export/                        (NEW — Figma JSON endpoint)
src/app/api/ai/analyze-video/              (NEW — video analysis)
scytle-mcp/                                (NEW — MCP server package)
scytle-figma-plugin/                       (NEW — Figma plugin)
```

### LOC Reference (Current)
```
editor-store.ts          1878 LOC
unified-store.ts         2633 LOC  (wireframe/sitemap — not MVP-critical)
html-to-nodes.ts         1282 LOC
class-parser.ts           860 LOC
canvas.tsx                853 LOC
types/canvas.ts           806 LOC
style-guide-store.ts      621 LOC
render-utils.ts           470 LOC
typography-section.tsx     367 LOC
chat-store.ts             348 LOC
chat-tab.tsx              328 LOC
class-builder.ts          289 LOC
generate-page.ts          267 LOC
chat/route.ts             204 LOC
nodes-to-html.ts          199 LOC
google-fonts.ts           176 LOC
theme-tab.tsx             162 LOC
font-manifest.ts          145 LOC
```
