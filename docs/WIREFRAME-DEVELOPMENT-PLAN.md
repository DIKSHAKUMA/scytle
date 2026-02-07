# Wireframe Development Plan

> Complete roadmap for building the Scytle wireframe editor with inline editing, design library, and AI content generation.

## Overview

This plan addresses 6 major features organized into 5 phases based on dependencies:

| Phase | Focus | Duration | Status |
|-------|-------|----------|--------|
| 1 | Foundation & Sync | 1-2 weeks | ⏳ Not Started |
| 2 | Responsive Canvas | 3-5 days | ⏳ Not Started |
| 3 | Inline Editing | 2-3 weeks | ⏳ Not Started |
| 4 | Design Library Expansion | 2-3 weeks | ⏳ Not Started |
| 5 | AI Content Generation | 1-2 weeks | ⏳ Not Started |

---

## Phase 1: Foundation & Sync (Critical Path)

### Problem Statement
Currently, sitemap and wireframe operate as separate systems. Changes in one don't reflect in the other, causing data inconsistency.

### Goals
- [ ] Bidirectional sync between sitemap and wireframe
- [ ] Functional sidebar buttons
- [ ] Proper sitemap connector layout
- [ ] Clean up visual bugs

### Tasks

#### 1.1 Sitemap-Wireframe Sync Architecture

**Option A: Unified Store (Recommended)**
```
┌─────────────────────────────────────────────────┐
│                 PROJECT STORE                    │
│  ┌─────────────┐    ┌─────────────────────────┐ │
│  │   Pages[]   │───▶│  Each page has:          │ │
│  │             │    │  - sitemap position (x,y)│ │
│  │             │    │  - sections[]            │ │
│  │             │    │  - metadata              │ │
│  └─────────────┘    └─────────────────────────┘ │
└─────────────────────────────────────────────────┘
         │                      │
         ▼                      ▼
   Sitemap View            Wireframe View
   (reads positions)       (reads sections)
```

**Implementation:**
```typescript
// store/project-store.ts - Unified data model
interface ProjectPage {
  id: string
  name: string
  slug: string
  
  // Sitemap data
  position: { x: number; y: number }
  parentId: string | null
  
  // Wireframe data
  sections: WireframeSection[]
}

interface ProjectStore {
  pages: ProjectPage[]
  
  // Sitemap actions
  updatePagePosition: (pageId: string, pos: { x: number; y: number }) => void
  addPage: (page: Partial<ProjectPage>) => void
  
  // Wireframe actions
  addSection: (pageId: string, section: WireframeSection) => void
  updateSection: (pageId: string, sectionId: string, updates: Partial<WireframeSection>) => void
  reorderSections: (pageId: string, sectionIds: string[]) => void
  
  // Shared actions
  deletePage: (pageId: string) => void
  renamePage: (pageId: string, name: string) => void
}
```

**Files to modify:**
- `store/sitemap-store.ts` → Merge into project-store
- `store/wireframe-store.ts` → Merge into project-store
- `components/sitemap/sitemap-view.tsx` → Use project-store
- `components/wireframe/wireframe-view.tsx` → Use project-store

#### 1.2 Fix Sidebar Button Functionality

**Current Issues:**
- Some toolbar buttons are non-functional
- Panel toggles not working consistently

**Tasks:**
- [ ] Audit all sidebar buttons in `wireframe-sidebar.tsx`
- [ ] Connect each button to proper action
- [ ] Add visual feedback (loading, active states)
- [ ] Fix panel open/close animations

#### 1.3 Sitemap Connector Layout

**Current Issues:**
- Edges not routing properly
- Overlapping connectors
- Poor visual hierarchy

**Tasks:**
- [ ] Implement proper edge routing algorithm
- [ ] Add edge labels for relationships
- [ ] Style connectors (thickness, color, arrows)
- [ ] Handle edge selection and deletion

#### 1.4 Visual Bug Fixes

- [ ] Sidebar overflow issues (if any remaining)
- [ ] Tooltip positioning
- [ ] Focus states for accessibility
- [ ] Dark mode consistency

### Deliverables
- Unified project store with sync
- All sidebar buttons functional
- Clean sitemap connector layout
- Zero visual bugs in core flows

---

## Phase 2: Responsive Canvas (3-5 days)

### Problem Statement
The wireframe canvas has fixed width. When the browser resizes, the frame doesn't adapt.

### Goals
- [ ] Desktop frame scales with viewport
- [ ] Mobile preview at fixed width
- [ ] Zoom controls work properly
- [ ] Canvas panning works at all zoom levels

### Tasks

#### 2.1 Responsive Frame Container

**Approach:** CSS-based scaling with transform

```typescript
// components/wireframe/page-frame.tsx
function PageFrame({ page, viewport }: PageFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  
  // Calculate scale based on container width
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const observer = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      const targetWidth = viewport === 'mobile' ? 375 : 1440
      const padding = 80 // Side padding
      
      const newScale = Math.min(1, (width - padding) / targetWidth)
      setScale(newScale)
    })
    
    observer.observe(container)
    return () => observer.disconnect()
  }, [viewport])
  
  return (
    <div ref={containerRef} className="w-full h-full overflow-auto">
      <div 
        className="origin-top"
        style={{ 
          width: viewport === 'mobile' ? 375 : 1440,
          transform: `scale(${scale})`,
        }}
      >
        {/* Frame content */}
      </div>
    </div>
  )
}
```

#### 2.2 Viewport Switcher Improvements

- [ ] Desktop, Tablet, Mobile presets
- [ ] Custom width input
- [ ] Remember last viewport per page
- [ ] Smooth transition between viewports

#### 2.3 Zoom & Pan Controls

- [ ] Zoom slider (25% - 200%)
- [ ] Fit to screen button
- [ ] 100% button
- [ ] Mouse wheel zoom (with Cmd/Ctrl)
- [ ] Pan with scroll or drag

### Deliverables
- Responsive desktop frame
- Working viewport switcher
- Smooth zoom and pan

---

## Phase 3: Inline Editing (Core Feature)

### Problem Statement
Users cannot edit content directly in the wireframe. They must use separate panels or regenerate entire sections.

### Goals
- [ ] Click-to-edit text fields
- [ ] Drag to reorder cards/items
- [ ] Alignment controls (left/center/right)
- [ ] Add/remove items in lists
- [ ] Image placeholder swapping

### Tasks

#### 3.1 ContentEditable Text System

**Architecture:**
```
┌─────────────────────────────────────────────────┐
│              EditableText Component              │
├─────────────────────────────────────────────────┤
│ Props:                                           │
│   - value: string                                │
│   - onChange: (newValue: string) => void         │
│   - placeholder: string                          │
│   - as: 'h1' | 'h2' | 'p' | 'span'              │
│   - className: string                            │
├─────────────────────────────────────────────────┤
│ Features:                                        │
│   - Single click to select                       │
│   - Double click to edit                         │
│   - Blur to save                                 │
│   - Escape to cancel                             │
│   - Rich text formatting (optional)              │
└─────────────────────────────────────────────────┘
```

**Implementation:**
```typescript
// components/wireframe/editable/editable-text.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  editable?: boolean
}

export function EditableText({
  value,
  onChange,
  placeholder = 'Click to edit',
  as: Component = 'p',
  className,
  editable = true,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const inputRef = useRef<HTMLElement>(null)

  // Sync with external value
  useEffect(() => {
    if (!isEditing) setLocalValue(value)
  }, [value, isEditing])

  const handleDoubleClick = () => {
    if (!editable) return
    setIsEditing(true)
    // Focus and select all after render
    setTimeout(() => {
      inputRef.current?.focus()
      document.execCommand('selectAll', false)
    }, 0)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (localValue !== value) {
      onChange(localValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      inputRef.current?.blur()
    }
    if (e.key === 'Escape') {
      setLocalValue(value)
      setIsEditing(false)
    }
  }

  return (
    <Component
      ref={inputRef as any}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onInput={(e) => setLocalValue(e.currentTarget.textContent || '')}
      className={cn(
        className,
        editable && 'cursor-pointer hover:outline hover:outline-2 hover:outline-blue-200',
        isEditing && 'outline outline-2 outline-blue-500 cursor-text',
        !localValue && 'text-gray-400'
      )}
    >
      {localValue || placeholder}
    </Component>
  )
}
```

#### 3.2 Update Canvas Components to Use EditableText

Each design's Canvas component needs to support editing:

```typescript
// lib/designs/hero/header-1.tsx (updated)
function Canvas({ content, controls, viewport, onContentChange }: CanvasProps) {
  return (
    <section className="...">
      <EditableText
        value={content.heading as string || 'Medium length hero headline'}
        onChange={(v) => onContentChange?.('heading', v)}
        as="h1"
        className="text-5xl font-bold"
      />
      <EditableText
        value={content.subheading as string || 'Lorem ipsum...'}
        onChange={(v) => onContentChange?.('subheading', v)}
        as="p"
        className="text-gray-500"
      />
    </section>
  )
}
```

#### 3.3 Drag & Drop Reordering

**For section reordering:**
- Use `@dnd-kit/core` for drag and drop
- Visual drag handles on hover
- Drop indicators between sections
- Animate reorder

**For card/item reordering within sections:**
- Each repeatable item has drag handle
- Reorder within container
- Add/remove items

#### 3.4 Alignment & Layout Controls

**Floating toolbar on selection:**
```
┌─────────────────────────────────────────┐
│  [≡] [≡] [≡]  │  [B] [I] [U]  │  [🔗]  │
│  Left Center Right  Bold Italic    Link │
└─────────────────────────────────────────┘
```

**Implementation:**
- Show toolbar when text is selected
- Position above/below selection
- Apply formatting to content

#### 3.5 Image Placeholder Interaction

- [ ] Click placeholder to open media picker
- [ ] Drag image from desktop to replace
- [ ] Generate AI image (Phase 5)
- [ ] Remove/reset to placeholder

### Deliverables
- EditableText component
- All Canvas components support editing
- Drag to reorder sections
- Alignment floating toolbar
- Image placeholder interaction

---

## Phase 4: Design Library Expansion

### Problem Statement
Currently only Hero sections are available. Users need a complete library of section types, including animated/interactive variants.

### Goals
- [ ] 10+ section categories
- [ ] 3-5 variants per category
- [ ] Static and animated versions
- [ ] Consistent design language

### Tasks

#### 4.1 Section Categories to Build

| Category | Variants | Animations |
|----------|----------|------------|
| Hero | Split, Centered, Video BG, Parallax | Scroll parallax, text reveal |
| Features | Grid, List, Tabs, Accordion | Stagger reveal, hover effects |
| Testimonials | Carousel, Grid, Single Quote | Auto-rotate, fade transitions |
| CTA | Banner, Split, Minimal | Pulse button, gradient shift |
| Pricing | 3-tier, Toggle, Comparison | Flip cards, highlight |
| FAQ | Accordion, Search, Categories | Expand/collapse |
| Team | Grid, Carousel, Detailed | Hover reveal |
| Contact | Form, Split, Map | Field focus effects |
| Footer | Multi-column, Minimal, CTA | - |
| Navbar | Standard, Centered, Mega Menu | Scroll effects |
| Stats | Counter, Progress, Comparison | Count up animation |
| Gallery | Grid, Masonry, Lightbox | Lazy load, zoom |
| Blog | Card Grid, List, Featured | - |
| Logos | Scroll, Grid, Ticker | Infinite scroll |

#### 4.2 Animation System

**Approach:** CSS animations + Intersection Observer for scroll triggers

```typescript
// lib/designs/types.ts (extended)
interface DesignDefinition {
  // ... existing fields
  
  // Animation support
  animations?: {
    entrance?: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale'
    scroll?: 'parallax' | 'reveal' | 'sticky'
    hover?: 'lift' | 'glow' | 'expand'
  }
}

// hooks/use-scroll-animation.ts
export function useScrollAnimation(ref: RefObject<HTMLElement>, animation: string) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(`animate-${animation}`)
        }
      },
      { threshold: 0.1 }
    )
    
    observer.observe(el)
    return () => observer.disconnect()
  }, [animation])
}
```

#### 4.3 Design File Template

Each new design follows this pattern:

```typescript
// lib/designs/[category]/[variant].tsx
'use client'

import type { DesignDefinition, CanvasProps } from '../types'
import { EditableText } from '@/components/wireframe/editable'
import { useScrollAnimation } from '@/hooks/use-scroll-animation'

function Thumbnail() {
  return (
    <div className="w-full h-full bg-white p-2">
      {/* Scaled preview */}
    </div>
  )
}

function Canvas({ content, onContentChange, viewport }: CanvasProps) {
  const sectionRef = useRef<HTMLElement>(null)
  useScrollAnimation(sectionRef, 'fade-up')
  
  return (
    <section ref={sectionRef} className="...">
      <EditableText
        value={content.heading as string}
        onChange={(v) => onContentChange?.('heading', v)}
        as="h2"
      />
      {/* Section content */}
    </section>
  )
}

export const FeatureGrid: DesignDefinition = {
  id: 'features-grid',
  category: 'features',
  name: 'Feature Grid',
  description: '3-column feature grid with icons',
  tags: ['grid', 'icons', 'minimal'],
  animations: {
    entrance: 'fade-up',
  },
  Thumbnail,
  Canvas,
}
```

#### 4.4 Animated Variants

**Parallax Hero:**
- Background image with parallax scroll
- Text layers move at different speeds
- Smooth performance with transform3d

**Scroll Reveal Sections:**
- Elements fade in as they enter viewport
- Staggered timing for lists
- Once-only or repeat options

**Interactive Elements:**
- Hover effects on cards
- Click to expand accordions
- Carousel auto-play with pause on hover

### Deliverables
- 50+ section designs across all categories
- Animation system with scroll triggers
- Parallax and reveal effects
- Interactive components (carousels, accordions)

---

## Phase 5: AI Content Generation

### Problem Statement
Users must manually write all content. They want AI to generate contextual content when adding sections and ability to rewrite existing content.

### Goals
- [ ] Auto-generate content when section is dropped
- [ ] Double-click to trigger AI rewrite
- [ ] "Ask AI" modal for custom prompts
- [ ] Maintain project context for coherent copy

### Tasks

#### 5.1 Auto-Generate on Section Add

**Flow:**
1. User drops section onto canvas
2. System detects section type and position
3. AI generates appropriate content
4. Content populates section fields
5. User can edit or regenerate

**Implementation:**
```typescript
// When section is added
async function generateSectionContent(
  section: WireframeSection,
  projectContext: ProjectContext
): Promise<Record<string, string>> {
  const prompt = buildContentPrompt(section, projectContext)
  
  const response = await fetch('/api/ai/generate-section-content', {
    method: 'POST',
    body: JSON.stringify({ prompt, sectionType: section.type }),
  })
  
  return response.json()
}

// In addSection action
addSection: async (pageId, section, insertIndex) => {
  // Add section immediately with placeholder content
  set(state => {
    // ... add section
  })
  
  // Generate content in background
  const content = await generateSectionContent(section, projectContext)
  
  // Update section with generated content
  set(state => {
    const page = state.pages.find(p => p.id === pageId)
    const sec = page?.sections.find(s => s.id === section.id)
    if (sec) sec.content = content
  })
}
```

#### 5.2 Double-Click AI Rewrite

**Flow:**
1. User double-clicks on text while holding Alt/Option
2. AI rewrite dialog appears
3. Shows current text and suggestions
4. User selects or customizes
5. Text updates

**UI:**
```
┌─────────────────────────────────────────────────────┐
│  ✨ AI Rewrite                                  [×] │
├─────────────────────────────────────────────────────┤
│  Current: "Get started today"                       │
│                                                     │
│  Suggestions:                                       │
│  ○ "Start your free trial now"                      │
│  ○ "Begin your journey today"                       │
│  ○ "Join thousands of users"                        │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ Or describe what you want...                  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│                            [Cancel]  [Apply]        │
└─────────────────────────────────────────────────────┘
```

#### 5.3 Project Context System

Maintain context for coherent content:

```typescript
interface ProjectContext {
  // From project setup
  projectName: string
  industry: string
  targetAudience: string
  tone: 'professional' | 'casual' | 'playful' | 'technical'
  
  // From existing content
  brandVoice: string[] // Extracted from existing copy
  keywords: string[]
  existingPages: { name: string; purpose: string }[]
  
  // Current context
  currentPage: string
  pagePosition: number // 0 = homepage, 1+ = subpages
  sectionPosition: number // Where on page
  previousSection?: string // What came before
  nextSection?: string // What comes after
}
```

#### 5.4 Content Generation Prompts

```typescript
const SECTION_PROMPTS: Record<string, string> = {
  hero: `Generate hero section content for a {industry} company targeting {audience}.
    Tone: {tone}
    Include: headline (8-12 words), subheadline (15-25 words), primary CTA, secondary CTA
    Context: This is the {pagePosition === 0 ? 'homepage' : 'page'} hero.`,
    
  features: `Generate feature section content showcasing key benefits.
    Industry: {industry}
    Include: section title, subtitle, 3-4 features with titles and descriptions
    Each feature: title (3-5 words), description (15-20 words)`,
    
  testimonials: `Generate realistic testimonials for a {industry} company.
    Include: 3 testimonials with quote, name, title, company
    Make them specific and believable.`,
    
  // ... more prompts
}
```

#### 5.5 Loading & Error States

- [ ] Skeleton loaders while generating
- [ ] Error handling with retry
- [ ] Rate limiting protection
- [ ] Offline fallback with placeholder text

### Deliverables
- Auto-content on section drop
- AI rewrite dialog
- Project context system
- Comprehensive prompts for all section types

---

## Implementation Timeline

```
Week 1-2: Phase 1 (Foundation & Sync)
├── Day 1-3: Unified store architecture
├── Day 4-5: Migrate sitemap view
├── Day 6-7: Migrate wireframe view
├── Day 8-10: Fix buttons & connectors
└── Day 11-14: Bug fixes & testing

Week 3: Phase 2 (Responsive Canvas)
├── Day 1-2: Responsive frame container
├── Day 3-4: Viewport switcher
└── Day 5: Zoom & pan controls

Week 4-6: Phase 3 (Inline Editing)
├── Day 1-3: EditableText component
├── Day 4-7: Update all Canvas components
├── Day 8-10: Drag & drop reordering
├── Day 11-14: Alignment toolbar
└── Day 15-21: Testing & refinement

Week 7-9: Phase 4 (Design Library)
├── Day 1-7: Build 5 categories (25 designs)
├── Day 8-14: Build 5 more categories
└── Day 15-21: Animation system

Week 10-11: Phase 5 (AI Content)
├── Day 1-3: Auto-generate on drop
├── Day 4-7: AI rewrite dialog
└── Day 8-11: Context system & testing
```

---

## Technical Dependencies

### NPM Packages to Add

```bash
# Drag and drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Animations
npm install framer-motion

# Rich text (optional, for Phase 3)
npm install @tiptap/react @tiptap/starter-kit
```

### API Endpoints Needed

| Endpoint | Purpose | Phase |
|----------|---------|-------|
| `/api/ai/generate-section-content` | Auto-generate on drop | 5 |
| `/api/ai/rewrite-text` | AI rewrite dialog | 5 |
| `/api/ai/suggest-variations` | Multiple options | 5 |
| `/api/projects/[id]/sync` | Save project state | 1 |

---

## Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| 1 | Sync consistency | 100% (no data loss) |
| 2 | Frame responsiveness | Smooth 60fps scaling |
| 3 | Edit latency | < 50ms response |
| 4 | Design coverage | 50+ sections |
| 5 | AI generation time | < 3 seconds |

---

## Next Steps

1. **Start Phase 1**: Create unified project store
2. **Audit current code**: Identify all sync points
3. **Design unified data model**: Get team alignment
4. **Begin implementation**: Store → Views → Actions
