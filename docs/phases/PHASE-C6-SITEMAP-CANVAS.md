# Phase C6 — Sitemap on Canvas

> **Status**: 🔲 Not started
> **Priority**: Medium — ties the sitemap planning step to AI generation
> **Dependencies**: C2 (AI generation), C4 (workspace layout)
> **Demo**: `src/app/demo/flow/workspace/page.tsx` → sitemap node rendering on canvas
> **Existing code**: `src/store/sitemap-store.ts` (1042 LOC), `src/app/api/ai/generate-sitemap/`

## Purpose

Show the AI-generated sitemap as simple card nodes on the infinite canvas. Each card represents a page. Clicking a card triggers AI page generation. The sitemap acts as a **planning overview** — users see all pages at a glance and generate them one by one (or all at once).

## What Changed from Old System

| Old (ReactFlow) | New (Canvas Cards) |
|-----------------|-------------------|
| Dedicated "Sitemap" tab with ReactFlow | Cards rendered directly on the infinite canvas |
| Complex node graph with drag/connect | Simple positioned cards with SVG connection lines |
| Separate data model (unified-store) | Lightweight page list stored with the project |
| Could only see sitemap OR wireframe | Sitemap cards visible alongside design frames |

## Sitemap Node Design (from Demo)

### Node Card

```
┌─────────────────┐
│  🏠              │  ← emoji icon (type-based)
│  Home            │  ← page name
│  ✨ Designed     │  ← status badge
└─────────────────┘
    120px wide
```

### Styling by Status

| Status | Style |
|--------|-------|
| **designed** | `bg-white border-2 border-accent/30 shadow-sm` — solid, green-tinted |
| **planned** | `bg-white/80 border border-dashed border-border` — dashed, muted |
| **generating** | `bg-white border-2 border-accent` — solid with pulse animation |
| **selected** | Additional `ring-2 ring-accent ring-offset-2` |

### Connection Lines

SVG dashed lines connecting parent nodes to child nodes:

```typescript
// For each parent-child relationship:
<line
    x1={parentNode.x + 60}   // center of parent (120px/2)
    y1={parentNode.y + 60}    // bottom of parent
    x2={childNode.x + 60}     // center of child
    y2={childNode.y}           // top of child
    stroke="#d1d5db"
    strokeWidth={1.5}
    strokeDasharray="6 4"
/>
```

## Data Model

```typescript
interface SitemapPage {
    id: string
    name: string
    path: string                   // URL path: "/", "/about", "/pricing"
    description: string            // AI-generated description of the page
    status: 'planned' | 'generating' | 'designed'
    parentId: string | null        // For tree hierarchy
    canvasX: number                // Position on canvas
    canvasY: number
    designFrameId: string | null   // ID of the ScytleNode frame (once generated)
    generatedHtml?: string         // Last AI output (for iteration)
    icon?: string                  // Emoji icon
}
```

### Where Stored

Option A: In the project document in Appwrite (simple, limited size)
Option B: In a separate `SITEMAPS` collection (scalable)
Option C: In `editorStore` as special "sitemap" metadata alongside nodes

**Recommendation**: Option A for MVP — project document gets a `sitemap: SitemapPage[]` field.

## Layout Algorithm

Sitemap nodes need automatic positioning:

```typescript
function layoutSitemapNodes(pages: SitemapPage[]): SitemapPage[] {
    const ROOT_X = 200
    const ROOT_Y = 100
    const H_GAP = 160      // horizontal gap between siblings
    const V_GAP = 100      // vertical gap between levels

    // BFS layout: root at top, children spread horizontally below
    // Each level is a row, siblings are spaced evenly

    const root = pages.find(p => p.parentId === null)
    if (!root) return pages

    root.canvasX = ROOT_X
    root.canvasY = ROOT_Y

    // ... tree layout algorithm (similar to existing ELK-based layout)
}
```

## Interaction

### Click a Sitemap Node → Select + Show Info
- Highlights the node with selection ring
- Right panel Design tab shows page info
- Files tab Pages section highlights the corresponding page

### Double-Click a Sitemap Node → Generate Page
- If status === 'planned': Triggers AI generation
  1. Status changes to 'generating' (pulse animation)
  2. Calls C2 API to generate HTML
  3. Parser converts to ScytleNode tree
  4. Creates a large FrameNode (1440×auto) positioned to the right of the sitemap
  5. Status changes to 'designed'
  6. Canvas pans to show the new design frame

- If status === 'designed': Pan + zoom to the design frame

### Drag a Sitemap Node → Reposition
- Simple drag to reorder on canvas
- Connection lines update in real-time

### Right-Click Context Menu
- "Generate Page" (if planned)
- "Regenerate" (if designed)
- "Rename"
- "Delete Page"
- "Add Child Page"

## Design Frame Placement

When a page is generated, where does the frame go on canvas?

```
                    SITEMAP AREA        DESIGN FRAMES AREA
                    ←─── 400px ───→     ←──── 1440px+ ────→

                    ┌──────┐
                    │ Home │ ──────────→ ┌─────────────────────┐
                    └──┬───┘             │ Home — 1440 × 2400  │
                       │                 │    (full page)       │
                    ┌──┴──────┐          └─────────────────────┘
            ┌───────┤         ├──────┐
            │       │         │      │
         ┌──┴──┐ ┌──┴──┐ ┌───┴──┐   │
         │About│ │Price│ │ Blog │   ├→ ┌─────────────────────┐
         └─────┘ └─────┘ └──────┘   │  │ Dashboard — 1440×900│
                                     │  └─────────────────────┘
                    ┌────────┐       │
                    │Dashbrd │ ──────┘
                    └────────┘
```

- Sitemap nodes: left cluster, starting at x=100
- Design frames: positioned to the right, stacked vertically with 100px gap
- Each design frame labeled: `"{PageName} — 1440 × {height}"` above the frame

## "Generate All Pages" Button

Located at the bottom of the Files tab Pages section:

```typescript
async function generateAllPages() {
    const plannedPages = pages.filter(p => p.status === 'planned')
    
    for (const page of plannedPages) {
        page.status = 'generating'
        const html = await generatePageHtml(page)
        const nodes = parseHtmlToNodes(html)
        createDesignFrame(page, nodes)
        page.status = 'designed'
    }
}
```

Sequential generation — one page at a time with progress visible in the Pages list.

## File Structure

```
src/lib/sitemap/
  types.ts                  ← SitemapPage type
  layout.ts                 ← Auto-layout algorithm for sitemap nodes
  
src/components/workspace/
  sitemap-node.tsx          ← Individual sitemap card component
  sitemap-connections.tsx   ← SVG connection lines
  
src/store/
  sitemap-store.ts          ← UPDATE: simplify for new model (or create new)
```

## Migration from Old Sitemap

The existing sitemap system (`sitemap-store.ts`, ReactFlow-based) is complex. For the new system:
- **Keep**: The AI sitemap generation prompt and API route
- **Replace**: ReactFlow rendering with simple positioned cards
- **Replace**: unified-store page model with lightweight SitemapPage
- **Keep**: ELK-based layout algorithm (adapt for simpler cards)
