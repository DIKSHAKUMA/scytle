# Sitemap Functionality Spec (Relume-Style)

> **Reference**: Relume.io sitemap editor  
> **Goal**: Implement similar behavior in Scytle with our chat-first layout  
> **Status**: Analysis Complete - Ready for Implementation

---

## Overview

The sitemap is a visual, interactive tree editor where users can:
1. Generate an entire sitemap from a project description (AI-powered)
2. Manually add/edit/delete pages
3. Add sections to pages
4. Generate content for individual pages

---

## Node Types

### 1. Project Node (Root)
- **Visual**: Purple/highlighted bar at top of tree
- **Icon**: 👥 (team/project icon)
- **Content**: Project name + "..." menu button
- **Behavior on Click**: Opens left sidebar with project settings

### 2. Page Node
- **Visual**: White card with subtle border
- **Icon**: 🏠 for Home, default page icon for others
- **Content**: Page name + "..." menu button
- **Behavior on Hover**: Shows inline action buttons below the node
- **Behavior on Click**: Opens left sidebar with page settings

### 3. Section (shown inside page node after generation)
- **Visual**: Text lines inside page card
- **Content**: Section type labels (Hero Section, Features, etc.)

---

## Interactions & Behaviors

### A. Initial State (Empty Project)

**Canvas shows:**
```
┌─────────────────────────────┐
│  👥 Project            ...  │  ← Root node
└─────────────────────────────┘
            │
            ▼
┌─────────────────────────────┐
│  🏠 Home               ...  │  ← Default page
├─────────────────────────────┤
│  + Section                  │  ← Hover actions
│  ✨ Generate content        │
└─────────────────────────────┘
            │
            +                    ← Add sibling page
```

**Key Points:**
- Project starts with one default "Home" page
- Hover on page reveals inline actions (not always visible)
- Plus button below for adding sibling pages

---

### B. Page Node Hover Actions

**When user hovers on a page node, show below the node:**

| Action | Icon | Behavior |
|--------|------|----------|
| + Section | ➕ | Opens section picker/adds section to page |
| Generate content | ✨ | AI generates sections for this specific page |

**Animation:**
- Fade in (150ms) on hover
- Fade out (100ms) on mouse leave
- Slight slide up animation (subtle)

---

### C. Page Node Context Menu (3-dots)

**Triggered by:** Clicking "..." button on page node

**Menu Structure:**
```
┌─────────────────────────────────┐
│ 🔍 Search actions...            │  ← Search/filter
├─────────────────────────────────┤
│ ✨ Ask AI                    ▶  │  ← Submenu
│    ├─ Generate page             │
│    ├─ Edit sitemap prompt       │
│    ├─ Generate new sitemap      │
│    └─ Generate new page         │
├─────────────────────────────────┤
│ Duplicate               ⌘D      │
│ Delete                  ⌫       │
│ Copy                    ⌘C      │
│ Cut                     ⌘X      │
│ Paste                   ⌘V      │
├─────────────────────────────────┤
│ Add page                ⌘↵      │
│ Add section                     │
├─────────────────────────────────┤
│ 🔖 Save as template             │
└─────────────────────────────────┘
```

**Key Behaviors:**
- Menu appears near the clicked element (not centered)
- Search field at top for quick action finding
- Keyboard shortcuts shown inline
- Submenu for AI actions expands on hover

---

### D. Page Node Selection → Left Sidebar

**Triggered by:** Clicking anywhere on page node (not just "...")

**Left Sidebar Content:**
```
┌─────────────────────────────────┐
│ Page                         ✕  │  ← Title + close
├─────────────────────────────────┤
│ Name *                          │
│ ┌─────────────────────────────┐ │
│ │ Home                        │ │  ← Editable input
│ └─────────────────────────────┘ │
│                                 │
│ Description                     │
│ ┌─────────────────────────────┐ │
│ │ Add a unique description to│ │
│ │ regenerate the page with a │ │  ← Textarea
│ │ new layout and copy...     │ │
│ └─────────────────────────────┘ │
│                      Prompt + ← │  ← AI prompt helper
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✨ Generate page            │ │  ← Primary action
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**Behaviors:**
- Sidebar slides in from left (200ms ease-out)
- Page node becomes highlighted (colored border)
- Name is editable inline
- Description is used as AI prompt context
- "Prompt +" opens AI prompt builder/helper
- Generate button triggers AI page generation

---

### E. Project Node Selection → Left Sidebar

**Triggered by:** Clicking on Project (root) node

**Left Sidebar Content:**
```
┌─────────────────────────────────┐
│ Project                      ✕  │
├─────────────────────────────────┤
│ Description *      Try example  │  ← Link to fill sample
│ ┌─────────────────────────────┐ │
│ │ Gretta is a boutique       │ │
│ │ Architectural firm based   │ │
│ │ in Los Angeles that        │ │  ← Textarea (project desc)
│ │ focuses on homes as well   │ │
│ │ as smaller commercial...   │ │
│ └─────────────────────────────┘ │
│                      Prompt + ← │
│                                 │
│ Number of pages                 │
│ ┌─────────────────────────────┐ │
│ │ 2-5                       ▼ │ │  ← Dropdown
│ └─────────────────────────────┘ │
│                                 │
│ Language                        │
│ ┌─────────────────────────────┐ │
│ │ English (US)              ▼ │ │  ← Dropdown
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ✨ Generate sitemap         │ │  ← Primary action
│ └─────────────────────────────┘ │
│ This will override all page     │  ← Warning text
│ sections and copy               │
└─────────────────────────────────┘
```

**Options:**
- **Number of pages**: 2-5, 6-10, 11-15, 16-20, 20+
- **Language**: English (US), Spanish, French, etc.

---

### F. Generate Sitemap Flow

**Trigger:** Click "✨ Generate sitemap" button

**Flow:**
1. Button shows loading state (spinner + "Generating...")
2. Canvas zooms out to accommodate incoming nodes
3. AI generates pages based on:
   - Project description
   - Number of pages setting
   - Language setting
4. Nodes appear with animation (fade in + slide)
5. Lines/connections animate in
6. AI Feedback widget appears at bottom center
7. Zoom adjusts to fit all content

**Generated Output Structure:**
```
Project
├── Home
│   ├── Hero Section
│   ├── About Section
│   ├── Services Section
│   └── CTA Section
├── About
│   ├── Hero Section
│   ├── Team Section
│   └── Values Section
├── Services
│   ├── Service List
│   └── Pricing Section
├── Projects
│   ├── Portfolio Grid
│   └── Case Study
└── Contact
    ├── Contact Form
    └── Map Section
```

**Post-Generation:**
- AI Feedback widget (👍 👎) for rating quality
- All pages are editable
- Sections shown as text inside each page card

---

## State Management

### Selection States
| State | Visual |
|-------|--------|
| Default | White background, subtle border |
| Hover | Slight shadow, action buttons appear |
| Selected | Purple/primary border, sidebar open |
| Generating | Pulsing animation, disabled interactions |

### Canvas States
| State | Behavior |
|-------|----------|
| Empty | Shows Project + Home with helper text |
| Has Pages | Normal tree layout |
| Generating | Loading overlay, zoom adjusting |
| Generated | Full tree, feedback widget |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘ + D | Duplicate selected page |
| ⌫ / Delete | Delete selected page |
| ⌘ + C | Copy selected page |
| ⌘ + X | Cut selected page |
| ⌘ + V | Paste page |
| ⌘ + Enter | Add new page (sibling) |
| Escape | Deselect / Close sidebar |
| ⌘ + Z | Undo |
| ⌘ + Shift + Z | Redo |

---

## Animations & Timing

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Sidebar open | Slide from left | 200ms | ease-out |
| Sidebar close | Slide to left | 150ms | ease-in |
| Context menu | Fade + scale | 100ms | ease-out |
| Hover actions | Fade in | 150ms | ease |
| Node appear | Fade + slide up | 300ms | ease-out |
| Connection lines | Draw animation | 200ms | linear |
| Zoom adjustment | Smooth zoom | 400ms | ease-in-out |

---

## Implementation Checklist

### Phase 1: Core Structure
- [ ] Project node component
- [ ] Page node component with hover actions
- [ ] Left sidebar panel (Page settings)
- [ ] Left sidebar panel (Project settings)
- [ ] Node selection state management

### Phase 2: Context Menu
- [ ] Context menu component with search
- [ ] Ask AI submenu
- [ ] Standard actions (copy, paste, delete, duplicate)
- [ ] Keyboard shortcuts

### Phase 3: AI Generation
- [ ] Generate sitemap API endpoint
- [ ] Generate page API endpoint
- [ ] Loading states
- [ ] AI feedback widget

### Phase 4: Polish
- [ ] All animations
- [ ] Keyboard navigation
- [ ] Undo/redo support
- [ ] Error states

---

## Differences from Current Scytle Implementation

| Aspect | Current Scytle | Relume (Target) |
|--------|----------------|-----------------|
| Layout | Chat (1/3) + Canvas (2/3) | Sidebar + Full Canvas |
| Node editing | Unknown | Left sidebar panel |
| AI generation | Via chat | Direct buttons on nodes |
| Context menu | Unknown | Rich menu with search |
| Hover actions | Unknown | Inline "+ Section", "Generate" |

---

## Questions for Implementation

1. **Keep chat sidebar?** → **DECISION: Full Relume-style** (no chat sidebar for sitemap view)
2. **AI generation**: → **DECISION: Dedicated sitemap generation endpoint** (recommended for better UX)
3. **Sections**: → **DECISION: Hybrid** — AI-generated section names based on page context, from a predefined vocabulary (Hero, Features, CTA, etc.)
4. **Templates**: → **DECISION: Skip for v1** (implement later)

---

## Current Bugs to Fix

### Bug #1: Zoom Display Shows 100000%
**Location**: [src/app/project/[id]/page.tsx](src/app/project/[id]/page.tsx#L351)

**Problem**: 
```tsx
{Math.round(zoomLevel * 100)}%  // zoomLevel is already 100, so 100*100 = 10000
```

**Fix**:
```tsx
{zoomLevel}%  // zoomLevel is already stored as percentage
```

---

## Canvas Discussion: ReactFlow vs Custom

### Current Implementation (ReactFlow)
**Pros:**
- ✅ Already working
- ✅ Built-in node/edge management
- ✅ Zoom, pan, fit-view out of box
- ✅ Handles complex node connections
- ✅ Good performance with many nodes

**Cons:**
- ❌ Harder to customize animations
- ❌ Learning curve for advanced features
- ❌ Default styling doesn't match Figma feel
- ❌ Pan/zoom feels "web-like", not smooth

### Custom Canvas (Figma-style)
**Pros:**
- ✅ Full control over interactions
- ✅ Can achieve exact Figma feel (momentum, inertia)
- ✅ Two-finger scroll natural
- ✅ Perfect pixel control

**Cons:**
- ❌ Significant development time (2-3 weeks)
- ❌ Need to build: hit detection, edge routing, selection
- ❌ Performance optimization from scratch
- ❌ More bugs initially

### **Recommendation: Keep ReactFlow, but customize heavily**

**Why:**
1. ReactFlow can be customized to feel Figma-like
2. Building from scratch is 10x more work for marginal UX gain
3. Focus should be on the Relume-style sidebar/workflow

**Customization plan:**
```typescript
// Figma-style smooth scrolling
<ReactFlow
  panOnScroll={true}           // Two-finger scroll to pan
  panOnScrollSpeed={0.8}       // Adjust speed
  zoomOnScroll={false}         // Disable scroll-zoom (use pinch)
  zoomOnPinch={true}           // Pinch to zoom
  preventScrolling={true}      // Prevent page scroll
  
  // Smooth transitions
  fitViewOptions={{
    duration: 400,
    padding: 0.2,
  }}
  
  // Custom edge styling for smooth curves
  defaultEdgeOptions={{
    type: 'smoothstep',
    animated: false,
    style: { stroke: '#94a3b8', strokeWidth: 2 },
  }}
/>
```

---

## Implementation Plan

### Phase 1: Fix Bugs & Layout Change (2-3 days)
1. [ ] Fix zoom display bug (`zoomLevel * 100` → `zoomLevel`)
2. [ ] Remove chat sidebar from sitemap view
3. [ ] Make canvas full-width
4. [ ] Add left sidebar panel component (collapsible)
5. [ ] Wire sidebar to node selection

### Phase 2: Node Interactions (3-4 days)
1. [ ] Add hover actions to page nodes (+ Section, Generate)
2. [ ] Create context menu component with search
3. [ ] Implement AI submenu
4. [ ] Wire keyboard shortcuts

### Phase 3: Left Sidebar Content (2-3 days)
1. [ ] Project settings panel (description, page count, language)
2. [ ] Page settings panel (name, description)
3. [ ] Generate sitemap button + API endpoint
4. [ ] Generate page button + API endpoint

### Phase 4: AI Generation (3-4 days)
1. [ ] Create `/api/ai/generate-sitemap` endpoint
2. [ ] Create `/api/ai/generate-page` endpoint
3. [ ] Handle loading states
4. [ ] Animate new nodes appearing
5. [ ] Add AI feedback widget

### Phase 5: Polish (2 days)
1. [ ] ReactFlow customization for smoother feel
2. [ ] All animations per spec
3. [ ] Error handling
4. [ ] Testing

**Total: ~12-16 days**

---

## File Changes Required

### New Files to Create
```
src/components/canvas/
├── left-sidebar/
│   ├── index.ts
│   ├── left-sidebar.tsx         # Container
│   ├── project-panel.tsx        # Project settings
│   └── page-panel.tsx           # Page settings
├── context-menu/
│   ├── index.ts
│   ├── node-context-menu.tsx    # Rich context menu
│   └── ai-submenu.tsx           # Ask AI submenu

src/app/api/ai/
├── generate-sitemap/route.ts    # Generate full sitemap
└── generate-page/route.ts       # Generate single page sections
```

### Files to Modify
```
src/app/project/[id]/page.tsx    # Remove chat, add left sidebar
src/components/canvas/sitemap-view.tsx  # ReactFlow customizations
src/components/canvas/nodes/page-node.tsx  # Add hover actions
src/store/sitemap-store.ts       # Add generation state
```

---

**Created**: February 2, 2026  
**Source**: Relume.io analysis  
**Next Step**: Review and prioritize implementation phases
