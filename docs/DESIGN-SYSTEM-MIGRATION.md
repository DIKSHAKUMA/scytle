# Scytle Design System Migration Plan

## Current State (3-File Sync Problem)

Currently, adding a new section design requires updating **3 separate files**:

| File | Purpose | What to Add |
|------|---------|-------------|
| `wireframe-thumbnail.tsx` | Visual JSX for thumbnails | New `case` in switch statement |
| `add-section-sidebar.tsx` | Add Section picker | Entry in `SECTION_CATEGORIES` |
| `component-data.ts` | Replace Component library | Entry in `COMPONENT_VARIANTS` |

This is error-prone and causes duplication.

---

## Phase 1: Current (Manual Sync) ✅ DONE

- Added sync requirement comments to all 3 files
- Removed all variants except Hero to prevent duplication
- Empty placeholders for other categories

---

## Phase 2: Single Source of Truth (Recommended)

### Goal
One file defines everything about a design - metadata, thumbnail, and canvas layout.

### New Folder Structure

```
scytle/src/lib/designs/
├── types.ts              # TypeScript interfaces
├── registry.ts           # Central registry (THE source of truth)
├── index.ts              # Auto-exports
│
├── hero/
│   ├── index.ts          # Exports all hero designs
│   ├── header-1.tsx      # Individual design file
│   ├── header-2.tsx
│   └── header-3.tsx
│
├── features/
│   ├── index.ts
│   ├── feature-1.tsx
│   └── feature-2.tsx
│
├── testimonials/
│   ├── index.ts
│   ├── testimonial-1.tsx
│   └── testimonial-2.tsx
│
└── ... (other categories)
```

### Design Definition Interface

```typescript
// lib/designs/types.ts

export interface DesignDefinition {
    // Identity
    id: string                      // Unique: 'hero-split'
    category: string                // Category key: 'hero'
    name: string                    // Display: 'Header 1'
    description: string             // 'Text left, image right'
    tags: string[]                  // ['split', 'image', 'classic']
    
    // Rendering
    ThumbnailComponent: React.FC    // Sidebar thumbnail (scaled preview)
    CanvasComponent: React.FC<CanvasProps>  // Full canvas layout
    
    // Optional metadata for filtering
    layout?: 'split' | 'centered' | 'grid' | 'list' | 'carousel'
    hasImage?: boolean
    hasVideo?: boolean
    hasForm?: boolean
}

export interface CanvasProps {
    content: Record<string, unknown>
    controls: Record<string, unknown>
    viewport: 'desktop' | 'mobile'
}

export interface DesignCategory {
    id: string
    name: string
    icon?: React.FC
    designs: DesignDefinition[]
}
```

### Individual Design File Example

```typescript
// lib/designs/hero/header-1.tsx
import type { DesignDefinition, CanvasProps } from '../types'
import { ImageIcon } from 'lucide-react'

// ===== THUMBNAIL (used in sidebars) =====
function Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex gap-2">
            <div className="flex-1 flex flex-col justify-center space-y-1">
                <div className="text-[6px] text-gray-400 uppercase">Tagline</div>
                <div className="text-[8px] font-semibold text-gray-800 leading-tight">
                    Medium length hero headline goes here
                </div>
                <div className="text-[5px] text-gray-500 leading-tight">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </div>
                <div className="flex gap-1 mt-1">
                    <div className="bg-gray-800 text-white text-[5px] px-1.5 py-0.5">Button</div>
                    <div className="border border-gray-300 text-gray-600 text-[5px] px-1.5 py-0.5">Button</div>
                </div>
            </div>
            <div className="flex-1 aspect-[4/3] bg-gray-200 flex items-center justify-center">
                <ImageIcon className="w-3 h-3 text-gray-400" />
            </div>
        </div>
    )
}

// ===== CANVAS (full-size wireframe on canvas) =====
function Canvas({ content, controls, viewport }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    
    return (
        <section className={cn(
            'py-16 lg:py-24',
            isMobile ? 'px-4' : 'px-16'
        )}>
            <div className={cn(
                'container mx-auto',
                isMobile ? 'flex-col' : 'flex items-center gap-12'
            )}>
                {/* Text Content */}
                <div className="flex-1 space-y-6">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">
                        {content.tagline || 'Tagline'}
                    </p>
                    <h1 className="text-4xl lg:text-5xl font-bold">
                        {content.heading || 'Medium length hero headline goes here'}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {content.subheading || 'Lorem ipsum dolor sit amet...'}
                    </p>
                    <div className="flex gap-4">
                        <Button>{content.primaryCta || 'Button'}</Button>
                        <Button variant="outline">{content.secondaryCta || 'Button'}</Button>
                    </div>
                </div>
                
                {/* Image */}
                <div className="flex-1">
                    <ImagePlaceholder aspectRatio="4/3" />
                </div>
            </div>
        </section>
    )
}

// ===== EXPORT DESIGN DEFINITION =====
export const Header1: DesignDefinition = {
    id: 'hero-split',
    category: 'hero',
    name: 'Header 1',
    description: 'Text left, image right',
    tags: ['split', 'image', 'classic'],
    layout: 'split',
    hasImage: true,
    ThumbnailComponent: Thumbnail,
    CanvasComponent: Canvas,
}
```

### Central Registry

```typescript
// lib/designs/registry.ts
import { Header1, Header2, Header3 } from './hero'
import { Feature1, Feature2, Feature3 } from './features'
// ... other imports

export const DESIGN_REGISTRY: Record<string, DesignDefinition[]> = {
    hero: [Header1, Header2, Header3],
    features: [Feature1, Feature2, Feature3],
    testimonials: [],  // Add when designs ready
    cta: [],
    pricing: [],
    faq: [],
    contact: [],
    team: [],
    blog: [],
    gallery: [],
    stats: [],
    logos: [],
    navbar: [],
    footer: [],
    about: [],
}

export const DESIGN_CATEGORIES: DesignCategory[] = [
    { id: 'hero', name: 'Hero Header', designs: DESIGN_REGISTRY.hero },
    { id: 'features', name: 'Features', designs: DESIGN_REGISTRY.features },
    // ... etc
]

// ===== HELPER FUNCTIONS =====

export function getDesignById(id: string): DesignDefinition | undefined {
    for (const designs of Object.values(DESIGN_REGISTRY)) {
        const found = designs.find(d => d.id === id)
        if (found) return found
    }
    return undefined
}

export function getDesignsForCategory(category: string): DesignDefinition[] {
    return DESIGN_REGISTRY[category] || []
}

export function searchDesigns(query: string, category?: string): DesignDefinition[] {
    const searchTerm = query.toLowerCase()
    let designs = category 
        ? DESIGN_REGISTRY[category] || []
        : Object.values(DESIGN_REGISTRY).flat()
    
    return designs.filter(d =>
        d.name.toLowerCase().includes(searchTerm) ||
        d.description.toLowerCase().includes(searchTerm) ||
        d.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
}

export function getRandomDesign(category: string): DesignDefinition | undefined {
    const designs = DESIGN_REGISTRY[category]
    if (!designs || designs.length === 0) return undefined
    return designs[Math.floor(Math.random() * designs.length)]
}
```

### Updated Components (Use Registry)

```typescript
// components/wireframe/wireframe-thumbnail.tsx (SIMPLIFIED)
import { getDesignById } from '@/lib/designs'

export function WireframeThumbnail({ type, variant, className, ghost }: Props) {
    const designId = variant ? `${type}-${variant}` : type
    const design = getDesignById(designId)
    
    if (!design) {
        return <DefaultThumbnail type={type} variant={variant} />
    }
    
    const { ThumbnailComponent } = design
    
    return (
        <div className={cn('w-full h-full', ghost && 'opacity-50', className)}>
            <ThumbnailComponent />
        </div>
    )
}
```

```typescript
// components/wireframe/add-section-sidebar.tsx (SIMPLIFIED)
import { DESIGN_CATEGORIES, getDesignsForCategory } from '@/lib/designs'

// No more SECTION_CATEGORIES constant - use registry directly
const categories = DESIGN_CATEGORIES.filter(c => c.designs.length > 0)
```

```typescript
// components/wireframe/panels/component-library-panel.tsx (SIMPLIFIED)
import { getDesignsForCategory } from '@/lib/designs'

// No more COMPONENT_VARIANTS - use registry directly
const designs = getDesignsForCategory(section.type)
```

### Migration Steps

1. **Create folder structure**
   ```bash
   mkdir -p scytle/src/lib/designs/{hero,features,testimonials,cta,pricing,faq,contact,team,blog,gallery,stats,logos,navbar,footer,about}
   ```

2. **Create types.ts** with interfaces

3. **Migrate Hero designs first**
   - Move thumbnail JSX from wireframe-thumbnail.tsx to individual files
   - Add canvas layouts (can copy from wireframe-layouts.tsx if exists)
   - Create registry.ts

4. **Update consuming components**
   - wireframe-thumbnail.tsx → use getDesignById()
   - add-section-sidebar.tsx → use DESIGN_CATEGORIES
   - component-data.ts → DELETE (replaced by registry)
   - component-library-panel.tsx → use getDesignsForCategory()

5. **Test thoroughly**

6. **Migrate remaining categories one by one**

---

## Phase 3: Design Admin (Future Enhancement)

### Goal
Non-developers can upload new designs through a web interface.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  DESIGN ADMIN PANEL (/admin/designs)                                │
├─────────────────────────────────────────────────────────────────────┤
│  1. Upload Figma frame URL or SVG/PNG                               │
│  2. Enter metadata:                                                  │
│     - Name (e.g., "Header 5")                                       │
│     - Category (dropdown: Hero, Features, etc.)                     │
│     - Description                                                    │
│     - Tags                                                           │
│     - Layout type, hasImage, etc.                                   │
│  3. Paste/edit thumbnail HTML (with live preview)                   │
│  4. Paste/edit canvas HTML (with live preview)                      │
│  5. Preview in sandbox environment                                   │
│  6. Publish to design library                                        │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  DATABASE (Appwrite)                                                 │
├─────────────────────────────────────────────────────────────────────┤
│  designs collection:                                                 │
│  ├─ id: string (auto-generated)                                     │
│  ├─ designId: string (e.g., 'hero-split')                          │
│  ├─ category: string                                                 │
│  ├─ name: string                                                     │
│  ├─ description: string                                              │
│  ├─ tags: string[] (stored as JSON)                                 │
│  ├─ thumbnailHtml: string (HTML/JSX template)                       │
│  ├─ canvasHtml: string (HTML/JSX template)                          │
│  ├─ metadata: object (layout, hasImage, etc.)                       │
│  ├─ isPublished: boolean                                             │
│  ├─ createdBy: string (userId)                                       │
│  ├─ createdAt: datetime                                              │
│  └─ updatedAt: datetime                                              │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  RUNTIME RENDERER                                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Option A: Server-side render HTML strings                          │
│  - Use dangerouslySetInnerHTML with sanitization                    │
│  - Simple but limited interactivity                                  │
│                                                                      │
│  Option B: Dynamic component loading                                 │
│  - Store as JSX-like DSL, compile at runtime                        │
│  - More complex but full React features                             │
│                                                                      │
│  Option C: Static generation (recommended)                          │
│  - Admin publishes → triggers build                                  │
│  - Generates static React components                                 │
│  - Best performance, full features                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Database Schema (Appwrite)

```typescript
// Collection: designs
{
    $id: string,
    designId: 'hero-header-5',
    category: 'hero',
    name: 'Header 5',
    description: 'Full-width video background with overlay text',
    tags: ['video', 'fullscreen', 'immersive'],
    
    // HTML templates (Tailwind classes)
    thumbnailHtml: `
        <div class="w-full h-full bg-gray-800 p-2 flex items-center justify-center">
            <div class="text-center space-y-1">
                <div class="text-[8px] font-bold text-white">Hero with Video</div>
                <div class="text-[5px] text-gray-300">Full-screen background</div>
            </div>
        </div>
    `,
    
    canvasHtml: `
        <section class="relative h-[600px] bg-gray-900 flex items-center justify-center">
            <div class="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />
            <div class="relative z-10 text-center text-white max-w-3xl px-6">
                <h1 class="text-5xl font-bold mb-4">{{heading}}</h1>
                <p class="text-xl text-gray-200 mb-8">{{subheading}}</p>
                <button class="bg-white text-black px-8 py-3 font-medium">{{cta}}</button>
            </div>
        </section>
    `,
    
    // Placeholders for dynamic content
    placeholders: {
        heading: { type: 'text', default: 'Bold headline here' },
        subheading: { type: 'text', default: 'Supporting text goes here' },
        cta: { type: 'text', default: 'Get Started' }
    },
    
    metadata: {
        layout: 'fullscreen',
        hasVideo: true,
        hasImage: false
    },
    
    isPublished: true,
    createdBy: 'user_123',
    createdAt: '2026-02-06T10:00:00Z',
    updatedAt: '2026-02-06T10:00:00Z'
}
```

### Admin Panel Features

1. **Design Editor**
   - Split view: Code left, Preview right
   - Tailwind-aware autocomplete
   - Live preview updates
   - Responsive preview (Desktop/Mobile toggle)

2. **Template Variables**
   - Define `{{variableName}}` placeholders
   - Set default values
   - Used in canvas for editable content

3. **Import from Figma** (Advanced)
   - Paste Figma frame URL
   - Extract layers and convert to HTML
   - Uses Figma API + html-figma or similar

4. **Version History**
   - Track changes to each design
   - Rollback capability

5. **Publish Workflow**
   - Draft → Review → Published
   - Preview in sandbox before publish

### When to Implement Phase 3

- When you have 50+ designs and manual file creation becomes slow
- When non-developers (designers) need to contribute
- When you want to A/B test different layouts
- When you need user-submitted templates

---

## How Design Team Adds New Designs

### Current (Phase 1)
Developer updates 3 files manually.

### After Phase 2
1. Create new file in `lib/designs/{category}/`
2. Export `DesignDefinition` with Thumbnail + Canvas
3. Import in category's `index.ts`
4. Automatically available everywhere

### After Phase 3
1. Open Design Admin panel
2. Fill in metadata form
3. Paste/edit HTML templates
4. Preview and test
5. Click Publish
6. Available immediately (or after build)

---

## Recommended Timeline

| Phase | Effort | Priority |
|-------|--------|----------|
| Phase 1 (Done) | ✅ Complete | P0 |
| Phase 2 (Single Registry) | 2-3 days | P1 - Do next |
| Phase 3 (Admin Panel) | 5-7 days | P3 - Future |

**Start Phase 2 when:** You're ready to add more section designs beyond Hero.

**Start Phase 3 when:** You have 50+ designs OR need non-developer contributions.
