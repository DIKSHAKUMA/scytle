# Phase B — Architecture Pivot

> **Status**: ✅ Decision made — old system deprecated, new canvas-first architecture chosen

## The Old System (DEPRECATED)

The original Scytle had a **tab-based workflow** in `app/project/[id]/page.tsx`:

```
Tab 1: Sitemap    → ReactFlow node graph, AI generates page structure
Tab 2: Wireframe  → Pre-built V2 block templates rendered per page
Tab 3: Design     → Style guide tokens applied as CSS variables
Tab 4: (future)   → Code export
```

### How It Worked

1. **Sitemap Tab**: AI generated a page tree (Home, About, Pricing, etc.) with section assignments per page. Used ReactFlow for visualization. Stored in `unified-store.ts` (2634 LOC).

2. **Wireframe Tab**: Each page's sections mapped to pre-built `TemplateFamily` components from `src/lib/designs/`. There were 15 section categories (hero, cta, navbar, footer, features, testimonials, pricing, faq, contact, content, gallery, team, blog, stats, logos), each with multiple layout variants. The V2 system used a `Block` tree with `RenderBlock` components.

3. **Design Tab**: `style-guide-store.ts` managed `Concepts` (grouped design tokens — colors, typography, UI style). Tokens were converted to CSS custom properties and applied via a `<TokenProvider>` wrapper. The wireframe blocks consumed CSS variables like `--color-primary`, `--font-heading`, etc.

### Why It Was Dropped

| Problem | Detail |
|---------|--------|
| **Websites only** | Pre-built templates only covered marketing websites. No dashboards, no app screens, no custom layouts. |
| **No variety** | Same ~50 layout templates for every project. Every portfolio looks the same. |
| **No refinement** | Users couldn't edit individual elements. The wireframe was a frozen preview, not an editable canvas. |
| **Rigid pipeline** | Linear tab flow — can't iterate between design and structure. |
| **Massive codebase** | 20,000+ LOC of template families, block renderers, preset configurations — all throwaway. |

## The New Architecture

### Core Idea

**AI generates unique HTML+Tailwind for every prompt → Parser converts to ScytleNode tree → Editable on infinite canvas → Export back to HTML+Tailwind**

### Why This Is Better

| Advantage | Detail |
|-----------|--------|
| **Infinite variety** | AI generates unique HTML per prompt — no two designs look alike |
| **Works for anything** | Websites, dashboards, mobile app screens, email templates — any HTML |
| **Full editability** | Every element is a ScytleNode — select, drag, resize, edit text, change colors |
| **Chat-based iteration** | "Make the hero section bigger" → AI modifies the HTML → re-parsed into nodes |
| **Single workspace** | Everything on the canvas — no tab switching, Figma-style workflow |
| **Clean export** | ScytleNode tree → production-ready HTML+Tailwind |

### What Gets Deprecated

| File/Dir | LOC | Reason |
|----------|-----|--------|
| `src/lib/designs/` (all) | ~20,000 | Template system replaced by AI generation |
| `src/lib/designs/v2/blocks/` | ~5,000 | Block components replaced by ScytleNodes |
| `src/lib/designs/v2/layouts/` | ~10,000 | Layout templates replaced by AI HTML |
| `src/lib/designs/v2/tokens/` | ~2,000 | Token system rewired to modify nodes directly |
| `src/store/unified-store.ts` | 2,634 | Old page/section model not needed |
| `src/store/canvas-store.ts` | 303 | Old sitemap view state |
| `src/components/wireframe/` | ~12,000 | All wireframe UI components |

### What Stays

| File/Dir | Reason |
|----------|--------|
| `src/types/canvas.ts` | ScytleNode types — the foundation |
| `src/store/editor-store.ts` | Canvas state — the core |
| `src/store/auth-store.ts` | Auth is auth |
| `src/store/project-store.ts` | Project CRUD |
| `src/store/chat-store.ts` | Chat state (rewired for new system) |
| `src/lib/ai/client.ts` | Vertex AI client (new prompts) |
| `src/lib/appwrite.ts` / `appwrite-server.ts` | Backend SDK |
| `src/components/editor/` | Phase A canvas engine |
| `src/components/ui/` | shadcn primitives |
| All auth/dashboard pages | Login, signup, dashboard |

### What Gets Built (Phase C)

```
C1: HTML+Tailwind → ScytleNode Parser       (the bridge)
C2: AI Page Generation API                   (new prompts + routes)
C3: Enhanced New Project Page                (Web/App toggle, sitemap option)
C4: Workspace Layout Shell                   (left panel, canvas, right panel)
C5: Chat + AI Iteration                      (conversational design refinement)
C6: Sitemap as Canvas Nodes                  (simple cards, not ReactFlow)
C7: Theme System                             (modify nodes, not CSS vars)
C8: ScytleNode → HTML Export                 (reverse of C1)
```

## Competitive Research Summary

### Stitch by Google
- Generates complete HTML+Tailwind from prompts
- Full page generation, not section-by-section
- Chat-based iteration with "make it more modern" type commands
- **Takeaway**: Proves AI-generated HTML+Tailwind is the right output format

### Banani
- Theme system with quick-switch presets (similar to our Theme tab)
- Wireframe mode toggle (shows structure without colors)
- Section reordering via drag
- **Takeaway**: Theme preset swatch grid + "Apply to All" is the right UX

### Replit
- Web app / Mobile app product type selector during project creation
- Full workspace with file tree + canvas
- **Takeaway**: Product type toggle is valuable for AI prompt context

### FlutterFlow
- Theme panel with colors, fonts, radius alongside canvas
- Component tree + properties panel
- Export to Flutter/Dart code
- **Takeaway**: Right panel with Design+Theme tabs is the right layout

## Decision Record

- **Date**: February 2026
- **Decision**: Drop pre-built template system. Adopt AI HTML → Parser → Canvas → Export pipeline.
- **Rationale**: Templates don't scale, can't handle non-website use cases, and remove user agency. AI generation provides infinite variety with full editability.
- **Impact**: ~40,000 LOC of template/wireframe code becomes deprecated (not deleted yet — will clean up after new system is stable).
