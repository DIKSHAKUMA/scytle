# Phase C4 — Workspace Layout

> **Status**: 🔲 Not started
> **Priority**: HIGH — this is the shell that holds everything
> **Dependencies**: Phase A (canvas engine)
> **Demo**: `src/app/demo/flow/workspace/page.tsx` (950 LOC)
> **Target**: `src/app/project/[id]/page.tsx` (rewrite from current 4-tab system)

## Purpose

Build the workspace layout — the main screen users spend 90% of their time in. It replaces the old tab-based view with a Figma-style layout: left panel (Files + Chat), center canvas, right panel (Design + Theme), and a top toolbar.

## Layout Spec (from Demo)

```
┌──────────────────────────────────────────────────────────────┐
│ ← │ FreelanceHub 🏷Web App │  [V][H][F][T] │ [↶][↷] │ Share │ Export │
├────────┬───────────────────────────────────────────┬─────────┤
│        │                                           │         │
│  Left  │              CANVAS                       │  Right  │
│  Panel │         (infinite canvas)                 │  Panel  │
│  w-72  │                                           │  w-64   │
│        │     ┌──────────┐  ┌──────────┐           │         │
│ Files  │     │ Sitemap  │  │ Design   │           │ Design  │
│  Chat  │     │  nodes   │  │  frames  │           │  Theme  │
│        │     └──────────┘  └──────────┘           │         │
│        │                                           │         │
│        │                        🔍 65% 🔍          │         │
├────────┴───────────────────────────────────────────┴─────────┘
```

## Top Bar (h-12)

```
┌────────────────────────────────────────────────────────────┐
│ ← │ ProjectName  [badge] │  V  H  F  T  │  ↶  ↷  │ Share Export │
└────────────────────────────────────────────────────────────┘
```

| Section | Content |
|---------|---------|
| Left | Back arrow → `/dashboard`, Project name (font-display font-bold), Product type badge (`bg-muted rounded-full text-xs`) |
| Center | Tool buttons: Select(V), Hand(H), Frame(F), Text(T) — each `w-8 h-8 rounded-lg`, active = `bg-foreground text-background`. Divider. Undo/Redo buttons. |
| Right | Share button (outline), Export button (dark, `bg-foreground text-background rounded-xl`) |

**Keyboard shortcuts**: V, H, F, T for tools. Wire to `editorStore.setActiveTool()`.

## Left Panel (w-72, bg-card)

### Tab Bar

Two horizontal text tabs: **Files** | **Chat** + Search icon on right.

```typescript
type LeftTab = 'files' | 'chat'
```

Active tab has `text-foreground` with a bottom underline indicator (`h-0.5 bg-foreground rounded-full`). Inactive = `text-muted-foreground/60 hover:text-foreground`.

### Files Tab

Two collapsible sections:

#### Pages Section
- Header: "Pages" label + chevron toggle + page count
- List of pages from sitemap (or manually created)
- Each row: page name + status emoji
  - `✨` = designed (AI generated), green accent color
  - `📝` = planned (not yet generated)
- Active page highlighted with `bg-accent/5 text-accent` + left `w-0.5 bg-accent` indicator
- Clicking a page: selects it, scrolls canvas to its frame, sets it as context for chat

#### Layers Section
- Header: "Layers" label + chevron toggle
- Shows ONLY the layer tree for the currently active page (not all pages)
- Recursive tree identical to Phase A layers panel
- Node type icons: frame=blue Square, text=purple Type, image=green Image
- Expand/collapse on frames, visibility toggle on hover, selection highlight
- Depth-based indentation: `paddingLeft: 8 + depth * 16`

#### Bottom Button
- "Generate All Pages" — accent-colored `bg-accent text-white rounded-xl`
- Triggers AI generation for all planned (undesigned) pages sequentially

### Chat Tab

```
┌─────────────────────┐
│  [system badge]     │
│         [user msg]──│  ← right-aligned dark bubble
│  🤖 [AI msg]        │  ← left-aligned with avatar
│         [user msg]──│
│  🤖 [AI msg]        │
│                     │
│ Context: Dashboard ▼│  ← page context indicator
├─────────────────────┤
│ [textarea] [📎][➤]  │  ← input area
└─────────────────────┘
```

| Element | Style |
|---------|-------|
| System message | Centered, `bg-muted/50 text-muted-foreground text-xs rounded-full px-3 py-1` |
| User message | Right-aligned, `bg-foreground text-background rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]` |
| AI message | Left-aligned with gradient avatar (w-6 h-6), `bg-muted/30 border border-border/40 rounded-2xl rounded-bl-md px-4 py-2.5`, shows timestamp |
| Context indicator | `bg-accent/10 text-accent rounded-full` pill showing which page the AI targets. Clicking opens a dropdown to change target page. |
| Input area | `bg-muted/30 rounded-xl border border-border/40`, textarea + attach button + round send button (`bg-accent text-white`) |

**Chat data source**: `useChatStore` (existing, rewired).

## Canvas (center, flex-1)

- Background: `#e8e5e0` (warm neutral)
- Dot grid: 30px spacing, `#ccc` dots, 1px radius
- Contains: sitemap nodes (small cards) + design frames (large rendered pages)
- Uses Phase A canvas engine: `<EditorCanvas />`
- Canvas background set via `editorStore.setCanvasColor('#e8e5e0')`

### Zoom Controls (floating overlay, bottom center)

```
┌──────────────────────┐
│  [−]  65%   [+]      │  ← rounded-2xl bg-card/90 backdrop-blur border shadow
└──────────────────────┘
```

- ZoomOut: `editorStore.zoomOut()`
- Percentage display: click to reset to 100%
- ZoomIn: `editorStore.zoomIn()`

## Right Panel (w-64, bg-card)

### Tab Bar

Two horizontal text tabs: **Design** | **Theme**

```typescript
type RightTab = 'design' | 'theme'
```

Same styling as left panel tabs — active has bottom underline indicator.

### Design Tab (Properties)

Context-sensitive properties for the selected node. Sections:

| Section | Fields |
|---------|--------|
| **Name** | Read-only display of node name |
| **Position** | X, Y — `h-7 bg-muted/40 border rounded-lg` inputs |
| **Size** | W, H — same style |
| **Fill** | Color swatch + hex code |
| **Border** | Color swatch + hex + width |
| **Radius** | Single number input |
| **Layout** | Three-button toggle (None/Flex/Grid), Direction + Gap sub-fields |
| **Opacity** | Slider (track + thumb) + percentage |
| **Variables** | Expandable section (Figma-style) |
| **Styles** | Expandable section with + button |
| **Export** | Expandable section with + button |

All input fields: `h-7 bg-muted/40 border border-border/40 rounded-lg px-2 text-[10px]`
Labels: `text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider`

**This reuses Phase A Properties Panel** — the right panel just wraps it with the tab switcher.

### Theme Tab

Global style controls that apply to ALL design frames on canvas.

#### Presets (3-column grid)
- 6 theme presets: Default, Ocean, Forest, Sunset, Rose, Dark
- Each preset: 3 color circles (primary, bg, text) + name label
- Active preset: `border-accent bg-accent/5`
- "Shuffle" link to randomize (`text-accent hover:underline`)

#### Colors (6 editable tokens)
- Primary, Background, Text, Accent, Muted, Border
- Each row: color swatch (w-5 h-5) + label + hex code
- Clickable → opens color picker
- `hover:bg-muted/30 rounded-lg transition-colors cursor-pointer`

#### Typography
- Heading font dropdown (Inter, etc.)
- Body font dropdown
- Scale slider (0.5x – 2.0x) with `1.0x` default

#### Style
- **Radius** slider: 0–32px
- **Buttons** toggle: Solid | Outline | Ghost | Pill (4-button row)
- **Cards** toggle: Bordered | Shadow | Flat (3-button row)
- Active option: `bg-foreground text-background`, inactive: `bg-muted/40`

#### Apply Button
- "Apply to All Pages" — `bg-accent text-white rounded-xl w-full`
- Triggers theme application across all design frame nodes on canvas

## State Management

```typescript
// New state (in workspace component or new store)
const [leftTab, setLeftTab] = useState<'files' | 'chat'>('files')
const [rightTab, setRightTab] = useState<'design' | 'theme'>('design')
const [showRightPanel, setShowRightPanel] = useState(true)
const [contextPage, setContextPage] = useState<string | null>(null)
const [activePage, setActivePage] = useState<string | null>(null)
```

## File Structure

```
src/app/project/[id]/
  page.tsx                    ← REWRITE: workspace shell layout
  
src/components/workspace/
  index.ts                    ← barrel exports
  top-bar.tsx                 ← header with tools + project info
  left-panel.tsx              ← files + chat tabs
  right-panel.tsx             ← design + theme tabs  
  files-tab.tsx               ← pages list + layers tree
  chat-tab.tsx                ← messages + input (rewired from existing)
  design-tab.tsx              ← wraps Phase A properties panel
  theme-tab.tsx               ← theme presets + color/font/style editors
  zoom-controls.tsx           ← floating zoom overlay
  page-list.tsx               ← page entries with status
```

## What Gets Reused from Phase A

| Phase A Component | Used In |
|-------------------|---------|
| `EditorCanvas` | Center canvas area |
| `LayersPanel` (logic) | Files tab → Layers section |
| `PropertiesPanel` (logic) | Design tab |
| `Toolbar` (logic) | Top bar center section |
| All editor hooks | Canvas interaction |
| `useEditorStore` | Everything |

## Responsive Behavior

- **Left panel**: Collapsible (toggle button in top bar)
- **Right panel**: Collapsible (toggle button or keyboard shortcut)
- **Minimum canvas width**: Always at least 400px
- **Mobile**: Not supported — show "Use desktop" message
