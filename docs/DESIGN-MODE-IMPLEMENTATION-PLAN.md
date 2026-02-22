# Design Mode — Implementation Plan

> **Scope**: 5 hero families (hero-44, hero-57, hero-1, hero-3, hero-5) as the proving ground.  
> **Goal**: Transform gray wireframe sections into fully styled, Design-mode sections with schemes, real images, video placeholders, and per-section controls — matching Relume's feature set.  
> **Reference**: `docs/DESIGN-MODE-RESEARCH.md` (Relume research), `.playwright-mcp/*.png` (screenshots)

---

## Current State Summary

| Layer | What Exists | What's Missing |
|-------|-------------|----------------|
| **Tokens** | `--sg-*` CSS vars, `ColorScheme` (light/dark/accent), `computeSchemeOverrideCSS`, `SectionTokenProvider` | Scheme override only changes colors — doesn't handle bg images, overlays, or section-level design props |
| **Blocks** | 18 block types, `ImageBlockProps` has ratio/shape/position/fillMode/overlay/width, `VideoBlockProps` has ratio/showPlayButton | No actual image rendering (ImageBlock shows placeholder icon), no image upload, no video embed |
| **Hero Layouts** | Hero44 (minimal), Hero57 (split-text), Hero1 (split-image), Hero3 (split-video), Hero5 (bg-image) | Hero5 has hardcoded bg placeholder — no real image/overlay support. All sections use `var(--sg-bg-primary)` only. |
| **Controls** | Single `layout` axis for hero, `LayoutControlDef`, `CONTROL_REGISTRY` | No scheme selector control, no image controls, no asset/background toggle in controls |
| **Section Model** | `WireframeSection` with `blocks`, `controls`, `content`, `componentId` | No `designProps` field. No image/video URLs. No section-level overlay or background config. |
| **UI Panels** | SectionPanel, ComponentLibrary, PagePanel, StyleGuidePanel, `SectionSchemeOverlay` (3-chip hover) | No Image sub-panel, no expanded Scheme picker, no design-specific section panel tabs |
| **Rendering** | `PlaceholderRenderer → V2Component → RenderBlock → LayerWrapper` | No mode toggle (wireframe vs design). Blocks always render wireframe style. |
| **Store** | `useStyleGuideStore` (schemes, concepts), `useUnifiedStore` (sections, blocks), `useSelectionStore` | No design-mode toggle state. No image upload actions. |

---

## Phase Overview

| Phase | Name | Focus | Files Touched |
|-------|------|-------|---------------|
| **1** | Design Mode Toggle + Scheme Application | Wire up mode switch; sections render with scheme bg/text | ~8 files |
| **2** | Section Design Props + Data Model | Extend `WireframeSection` with `designProps` field | ~5 files |
| **3** | Image Rendering | ImageBlock renders real images + upload; Hero5 gets bg image | ~8 files |
| **4** | Image Controls Panel | Design-only sub-panel: ratio, position, fill, overlay, shape | ~4 files |
| **5** | Video Rendering + Asset Toggle | VideoBlock embed; hero-3 video support; Image↔Video toggle | ~6 files |
| **6** | Scheme Picker Panel | Full scheme selector with swatches, edit, and add | ~4 files |
| **7** | Enhanced Section Controls | Per-template control axes (Style, Asset, Placement, Element) | ~5 files |
| **8** | Responsive Preview Polish | Desktop/Tablet/Mobile breakpoint toggle on bottom bar | ~4 files |

**Estimated total**: ~35 file touches (many overlapping), ~2500–3500 LOC new code.

---

## Phase 1 — Design Mode Toggle + Scheme Application

**Goal**: Add a wireframe↔design mode switch. In Design mode, sections render with their assigned scheme colors (bg, text, borders, accents). In Wireframe mode, everything stays grayscale as before.

### 1A. Canvas Mode State

**File**: `src/store/unified-store.ts`

Add a new state field and action:

```typescript
// New state field
canvasMode: 'wireframe' | 'design'

// New action
setCanvasMode: (mode: 'wireframe' | 'design') => void
```

- Default: `'wireframe'`
- Persisted alongside other project state
- When switching to `design`, all sections get their scheme tokens applied
- When switching to `wireframe`, scheme overrides are ignored (all sections use neutral gray)

**Why unified-store**: The canvas mode affects rendering across all pages/sections — it's a global workspace concern, not a selection or style-guide concern.

### 1B. Mode Toggle UI

**File**: `src/components/wireframe/app-topbar.tsx`

Add a segmented toggle in the app top bar (next to viewport selector):

```
[Wireframe] [Design]
```

- Two-button toggle group using `@/components/ui/toggle-group`
- Icons: `Pencil` (wireframe) + `Palette` (design)
- Reads/writes `canvasMode` from `useUnifiedStore`
- Active state: filled violet background

### 1C. Conditional Scheme Application in SectionTokenProvider

**File**: `src/lib/designs/v2/tokens/provider.tsx`

Current `SectionTokenProvider` always applies scheme overrides when they exist. Change it to be mode-aware:

```typescript
export function SectionTokenProvider({ sectionId, children, className }) {
    const canvasMode = useUnifiedStore(s => s.canvasMode)
    const scheme = useStyleGuideStore(s => s.data.sectionSchemeOverrides[sectionId])
    const concept = useStyleGuideStore(s => s.getActiveConcept())
    
    // In wireframe mode, never apply scheme overrides
    if (canvasMode === 'wireframe' || !scheme) {
        return <>{children}</>
    }
    
    const schemeCSS = computeSchemeOverrideCSS(scheme, concept)
    return (
        <div style={schemeCSS} data-sg-scheme-override={sectionId} className={className}>
            {children}
        </div>
    )
}
```

### 1D. Wireframe-Mode Neutral Override on TokenProvider

**File**: `src/lib/designs/v2/tokens/provider.tsx`

When `canvasMode === 'wireframe'`, the `TokenProvider` should force a neutral gray palette regardless of the active concept — making everything look like a wireframe:

```typescript
// In TokenProvider
const canvasMode = useUnifiedStore(s => s.canvasMode)
const computedCSS = useStyleGuideStore(s => s.computedCSS)

const effectiveCSS = canvasMode === 'wireframe' 
    ? WIREFRAME_NEUTRAL_CSS   // #fff bg, #111 text, #e5e7eb borders, no accent styling
    : computedCSS
```

**New constant**: `WIREFRAME_NEUTRAL_CSS` in `src/lib/designs/v2/tokens/defaults.ts` — a hardcoded grayscale token map that forces wireframe rendering.

### 1E. URL Hash for Mode

**File**: `src/components/wireframe/viewport-frame.tsx` or wherever the wireframe route is managed

Sync canvas mode to URL hash like Relume:
- `#mode=wireframe` (default)
- `#mode=design`
- `#mode=style-guide`

Read hash on mount → set initial `canvasMode`. Update hash when mode changes. This makes bookmarking and sharing work.

### Deliverables
- [ ] `canvasMode` state + `setCanvasMode` action in unified-store
- [ ] Toggle UI in app-topbar
- [ ] `SectionTokenProvider` becomes mode-aware
- [ ] `TokenProvider` applies wireframe-neutral CSS in wireframe mode
- [ ] `WIREFRAME_NEUTRAL_CSS` constant
- [ ] URL hash sync

### Hero Family Testing
| Hero | Expected Wireframe | Expected Design (light scheme) | Expected Design (dark scheme) |
|------|-------------------|-------------------------------|-------------------------------|
| hero-44 | White bg, black text, gray border buttons | White bg, styled text, accent buttons | #0c0a05 bg, white text, accent buttons |
| hero-57 | Same as above | Same + font styling | Same + font styling |
| hero-1 | Gray image placeholder, black text | Styled text, gray placeholder still | Dark bg, white text, gray placeholder |
| hero-3 | Gray video placeholder, black text | Styled text, gray video placeholder | Dark bg, white text, gray video placeholder |
| hero-5 | Gray bg placeholder + dark overlay + white text | Same (needs Phase 3 for real bg image) | Same |

---

## Phase 2 — Section Design Props + Data Model

**Goal**: Extend `WireframeSection` to carry design-time configuration: which image is uploaded, overlay settings, background type, etc. These props are purely for Design mode rendering.

### 2A. DesignProps Type Definition

**File**: `src/lib/designs/v2/tokens/index.ts` (add at bottom)

```typescript
// ============================================
// Section Design Props (Design Mode)
// ============================================

/** How images are used in this section template */
export type ImageRole = 'inline' | 'background' | 'none'

/** Background type for sections that support it */
export type BackgroundType = 'none' | 'image' | 'video'

/** Asset type for sections with media slots */
export type AssetType = 'image' | 'video'

/** 9-point position grid */
export type ImagePosition =
    | 'top-left' | 'top-center' | 'top-right'
    | 'center-left' | 'center' | 'center-right'
    | 'bottom-left' | 'bottom-center' | 'bottom-right'

/** Image shape */
export type ImageShape = 'rectangle' | 'rounded'

/**
 * Per-section design configuration.
 * Only populated when user uploads images or tweaks design controls.
 * null/undefined = use section template defaults.
 */
export interface SectionDesignProps {
    /** Background type (for CTA-type sections that support bg images) */
    backgroundType?: BackgroundType
    /** Asset type (for split-layout sections: image vs video) */
    assetType?: AssetType

    /** Section background image */
    backgroundImage?: {
        /** Image URL (Appwrite storage or external) */
        url: string
        /** Object position */
        position: ImagePosition
        /** Dark overlay toggle */
        overlay: boolean
        /** Overlay opacity (0–1) */
        overlayOpacity?: number
    }

    /** Inline image configuration (for split-image layouts) */
    inlineImage?: {
        /** Image URL */
        url: string
        /** Aspect ratio */
        ratio: 'auto' | '16:9' | '3:2' | '4:3' | '1:1' | '3:4'
        /** Object position */
        position: ImagePosition
        /** Object fit */
        fillMode: 'cover' | 'contain'
        /** Width constraint */
        width?: 'full' | '3/4' | '2/3' | '1/2' | '1/3'
        /** Shape */
        shape: ImageShape
        /** Overlay */
        overlay: boolean
        /** Foreground tint */
        foreground: 'color' | 'none'
    }

    /** Video configuration */
    video?: {
        /** Video URL (YouTube, Vimeo, or direct mp4) */
        url: string
        /** Poster/thumbnail image URL */
        posterUrl?: string
        /** Autoplay */
        autoplay?: boolean
        /** Loop */
        loop?: boolean
        /** Muted (required for autoplay) */
        muted?: boolean
    }
}
```

### 2B. Extend WireframeSection

**File**: `src/types/index.ts`

Add `designProps` to `WireframeSection`:

```typescript
export interface WireframeSection {
    // ... existing fields ...
    /** V2 Block data */
    blocks?: Block[]
    /** Design-mode visual properties (images, overlays, bg) */
    designProps?: SectionDesignProps
}
```

Also update `WireframeSectionSchema`:
```typescript
// Add after blocks field
designProps: z.record(z.string(), z.unknown()).optional(),
```

### 2C. Design Props Store Actions

**File**: `src/store/unified-store.ts`

Add actions to update design props:

```typescript
// New actions
updateSectionDesignProps: (
    pageId: string, 
    sectionId: string, 
    props: Partial<SectionDesignProps>
) => void

setSectionBackgroundImage: (
    pageId: string, 
    sectionId: string, 
    url: string
) => void

setSectionInlineImage: (
    pageId: string, 
    sectionId: string, 
    url: string
) => void

clearSectionImage: (
    pageId: string, 
    sectionId: string, 
    imageType: 'background' | 'inline'
) => void
```

Implementation pattern (immer):
```typescript
updateSectionDesignProps: (pageId, sectionId, props) => set((state) => {
    const page = state.pages.find(p => p.id === pageId)
    if (!page) return
    const section = page.sections.find(s => s.id === sectionId)
    if (!section) return
    section.designProps = { ...section.designProps, ...props }
    state.isDirty = true
})
```

### 2D. Template Image Role Metadata

**File**: `src/lib/designs/v2/layouts/hero/types.ts`

Extend `HeroPresetConfig` to declare what image role each hero supports:

```typescript
export interface HeroPresetConfig {
    // ... existing fields ...
    /** What kind of image this layout uses */
    imageRole: ImageRole
    /** Whether this layout supports video variant */
    supportsVideo: boolean
}
```

Update configs in `presets.ts`:
| Preset | imageRole | supportsVideo |
|--------|-----------|---------------|
| hero-44 | `'none'` | `false` |
| hero-57 | `'none'` | `false` |
| hero-1 | `'inline'` | `false` |
| hero-3 | `'none'` | `true` (video is default) |
| hero-5 | `'background'` | `false` |

### Deliverables
- [ ] `SectionDesignProps` type + related types in tokens/index.ts
- [ ] `designProps` field on `WireframeSection` + Zod schema update
- [ ] `updateSectionDesignProps`, `setSectionBackgroundImage`, `setSectionInlineImage`, `clearSectionImage` in unified-store
- [ ] `imageRole` + `supportsVideo` on `HeroPresetConfig` + update all 5 configs

---

## Phase 3 — Image Rendering

**Goal**: When an image URL is available (from `designProps` or block `content.src`), render it instead of the gray placeholder. Hero-1 gets inline image support. Hero-5 gets background image support. In wireframe mode or without an image, keep the placeholder.

### 3A. Upgrade ImageBlock Component

**File**: `src/lib/designs/v2/blocks/image-block.tsx` (or wherever ImageBlock is defined)

Current ImageBlock renders a gray placeholder with an icon. Upgrade it to conditionally render a real `<img>`:

```tsx
function ImageBlock({ block, renderChild }) {
    const canvasMode = useUnifiedStore(s => s.canvasMode)
    const { src, alt } = block.content as ImageBlockContent
    const { ratio, fillMode, position, shape, overlay } = block.props as ImageBlockProps
    
    const showRealImage = canvasMode === 'design' && src
    
    // Map ratio string to CSS aspect-ratio value
    const aspectRatio = ratioToCSS(ratio) // e.g. '1:1' → '1/1'
    
    // Map position to object-position
    const objectPosition = positionToCSS(position) // e.g. 'center' or 'top left'
    
    if (showRealImage) {
        return (
            <div className="relative overflow-hidden" style={{ 
                aspectRatio,
                borderRadius: shape === 'rounded' ? 'var(--sg-radius-image, 12px)' : '0'
            }}>
                <img 
                    src={src}
                    alt={alt || ''}
                    className="w-full h-full"
                    style={{ objectFit: fillMode, objectPosition }}
                />
                {overlay?.enabled && (
                    <div className="absolute inset-0" style={{
                        backgroundColor: overlay.color || 'rgba(0,0,0,0.4)',
                        opacity: overlay.opacity ?? 0.4
                    }} />
                )}
            </div>
        )
    }
    
    // Wireframe placeholder (existing behavior)
    return (
        <div className="flex items-center justify-center" style={{
            aspectRatio,
            backgroundColor: 'var(--sg-bg-secondary)',
            borderRadius: shape === 'rounded' ? 'var(--sg-radius-image, 12px)' : '0'
        }}>
            <ImageIcon style={{ color: 'var(--sg-text-muted)' }} className="opacity-30" size={48} />
        </div>
    )
}
```

### 3B. Background Image for Hero5

**File**: `src/lib/designs/v2/layouts/hero/hero-section.tsx` — `Hero5` component

Currently Hero5 has a hardcoded gray placeholder + rgba(0,0,0,0.4) overlay. Upgrade to read `designProps.backgroundImage`:

```tsx
export function Hero5({ sectionId, blocks, className }: LayoutProps) {
    const canvasMode = useUnifiedStore(s => s.canvasMode)
    
    // Read design props from the section in unified store
    const designProps = useUnifiedStore(s => {
        const page = s.pages.find(p => p.sections.some(sec => sec.id === sectionId))
        const section = page?.sections.find(sec => sec.id === sectionId)
        return section?.designProps
    })
    
    const bgImage = designProps?.backgroundImage
    const showRealBg = canvasMode === 'design' && bgImage?.url
    
    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <section className={className} style={{
                    containerType: 'inline-size',
                    position: 'relative',
                    minHeight: '600px',
                    color: 'white',
                }}>
                    {/* Background layer */}
                    <div className="absolute inset-0" style={{ zIndex: 0 }}>
                        {showRealBg ? (
                            <img 
                                src={bgImage.url}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{
                                    objectPosition: positionToCSS(bgImage.position)
                                }}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center"
                                 style={{ backgroundColor: 'var(--sg-bg-secondary)' }}>
                                <ImageIcon className="opacity-20" style={{ color: 'var(--sg-text-muted)' }} size={64} />
                            </div>
                        )}
                        {/* Overlay */}
                        {(bgImage?.overlay !== false) && (
                            <div className="absolute inset-0" style={{
                                backgroundColor: `rgba(0, 0, 0, ${bgImage?.overlayOpacity ?? 0.4})`
                            }} />
                        )}
                    </div>
                    
                    {/* Content */}
                    <div className="relative mx-auto flex items-center py-28 px-16 @max-sm:py-16 @max-sm:px-5"
                         style={{ maxWidth: '1280px', zIndex: 1, minHeight: '600px' }}>
                        {blocks?.map(block => <RenderBlock key={block.id} block={block} />)}
                    </div>
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}
```

### 3C. Image URL from DesignProps → Block Content Bridge

When the user uploads an image via the section panel, the URL needs to flow into the right place:

| Layout | Image Storage | Rendering Source |
|--------|--------------|-----------------|
| hero-1 (split-image) | `designProps.inlineImage.url` → also set as `imageBlock.content.src` | ImageBlock reads `block.content.src` |
| hero-5 (bg-image) | `designProps.backgroundImage.url` | Hero5 component reads `designProps` directly |

**Bridge logic** in `src/store/unified-store.ts`:

```typescript
setSectionInlineImage: (pageId, sectionId, url) => set((state) => {
    const section = findSection(state, pageId, sectionId)
    if (!section) return
    
    // Update designProps
    section.designProps = {
        ...section.designProps,
        inlineImage: {
            url,
            ratio: section.designProps?.inlineImage?.ratio ?? '1:1',
            position: section.designProps?.inlineImage?.position ?? 'center',
            fillMode: section.designProps?.inlineImage?.fillMode ?? 'cover',
            shape: section.designProps?.inlineImage?.shape ?? 'rectangle',
            overlay: false,
            foreground: 'none',
        }
    }
    
    // Also push URL into the image block's content
    const imageBlock = findBlockByType(section.blocks, 'image')
    if (imageBlock) {
        imageBlock.content.src = url
    }
    
    state.isDirty = true
})
```

### 3D. Utility Helpers

**New file**: `src/lib/designs/v2/utils/image-helpers.ts`

```typescript
/** Convert ratio string to CSS aspect-ratio value */
export function ratioToCSS(ratio: string): string | undefined {
    const map: Record<string, string> = {
        'auto': undefined,
        '16:9': '16/9',
        '3:2': '3/2',
        '4:3': '4/3',
        '1:1': '1/1',
        '3:4': '3/4',
        '2:3': '2/3',
    }
    return map[ratio]
}

/** Convert 9-point position to CSS object-position */
export function positionToCSS(position?: string): string {
    const map: Record<string, string> = {
        'top-left': 'left top',
        'top-center': 'center top',
        'top-right': 'right top',
        'center-left': 'left center',
        'center': 'center center',
        'center-right': 'right center',
        'bottom-left': 'left bottom',
        'bottom-center': 'center bottom',
        'bottom-right': 'right bottom',
    }
    return map[position ?? 'center'] ?? 'center center'
}
```

### Deliverables
- [ ] Upgraded ImageBlock with conditional real image rendering
- [ ] Hero5 reads `designProps.backgroundImage` for real bg image
- [ ] `setSectionInlineImage` bridge (designProps → block content sync)
- [ ] Image utility helpers (ratioToCSS, positionToCSS)
- [ ] Test: hero-1 with image URL shows real image in design mode
- [ ] Test: hero-5 with bg image URL shows full-bleed bg in design mode

---

## Phase 4 — Image Controls Panel

**Goal**: When a user selects a section with an image (hero-1 or hero-5), an "Image" sub-panel appears in the section panel with controls matching Relume's Image panel: upload, ratio, position, fill mode, width, shape, overlay, foreground.

### 4A. Image Controls Sub-Panel Component

**New file**: `src/components/wireframe/panels/image-controls-panel.tsx`

Structure (matching Relume's layout from research):

```
← Image                                    ✕
┌─────────────────────────────────────────┐
│  [IMAGE PREVIEW THUMBNAIL]              │
│  [Upload] [📷]                          │
├─────────────────────────────────────────┤
│  Ratio     [Auto][16:9][3:2][4:3][1:1][3:4] │
│  Position  [⬆⬅][⬆][⬆➡]               │
│            [⬅ ][●][ ➡]                │
│            [⬇⬅][⬇][⬇➡]               │
│  Fill Mode [Cover][Contain]              │
│  Width     [Dropdown]                    │
│  Shape     [Rectangle][Rounded]          │
│  Overlay   [Yes][No]                     │
│  Foreground[Color][None]                 │
└─────────────────────────────────────────┘
```

Key behaviors:
- **Controls adapt** based on `imageRole` from preset config:
  - `'inline'` → all controls active
  - `'background'` → only Position + Overlay active; rest disabled
- Each control change calls `updateSectionDesignProps()` which updates store → triggers re-render
- **Upload** button opens file picker → uploads to Appwrite Storage → returns URL → calls `setSectionInlineImage` or `setSectionBackgroundImage`

### 4B. Wire into Section Panel

**File**: `src/components/wireframe/panels/section-panel.tsx`

Add an "Image" expandable row (only visible in design mode + section has image role):

```tsx
// In section panel, after layout controls
{canvasMode === 'design' && presetConfig?.imageRole !== 'none' && (
    <button 
        onClick={() => setActivePanelView('image-controls')}
        className="flex items-center justify-between w-full px-3 py-2 ..."
    >
        <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span>Image</span>
        </div>
        <div className="flex items-center gap-2">
            {/* Mini preview thumbnail */}
            {imageUrl && <img src={imageUrl} className="w-6 h-6 rounded object-cover" />}
            <ChevronRight className="w-4 h-4" />
        </div>
    </button>
)}
```

### 4C. Panel View Extension

**File**: `src/store/unified-store.ts`

Extend `activePanelView` union type:

```typescript
// Current
activePanelView: 'page' | 'section' | 'library' | 'style-guide'

// New
activePanelView: 'page' | 'section' | 'library' | 'style-guide' | 'image-controls' | 'scheme-picker'
```

**File**: `src/components/wireframe/wireframe-sidebar.tsx`

Add the new panel case:

```tsx
{activePanelView === 'image-controls' && selectedSection && selectedPage && (
    <ImageControlsPanel 
        pageId={selectedPage.id}
        sectionId={selectedSection.id}
    />
)}
```

### 4D. Image Upload to Appwrite Storage

**New file**: `src/lib/appwrite-storage.ts`

```typescript
import { Client, Storage, ID } from 'appwrite'

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID!

export async function uploadSectionImage(file: File): Promise<string> {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    
    const storage = new Storage(client)
    const result = await storage.createFile(BUCKET_ID, ID.unique(), file)
    
    // Return the file view URL
    return storage.getFileView(BUCKET_ID, result.$id).toString()
}
```

> **Note**: Could also use a simple Base64 data URL for MVP (no Appwrite Storage setup needed). Upgrade to Appwrite Storage later.

**MVP alternative**: Store as data URL in `designProps` → works offline, simpler, but bloats localStorage. Good for Phase 4, switch to Appwrite in a later polish phase.

### 4E. 9-Point Position Grid Component

**New file**: `src/components/wireframe/panels/position-grid.tsx`

A 3×3 grid of clickable dots representing image position:

```tsx
const POSITIONS: ImagePosition[][] = [
    ['top-left', 'top-center', 'top-right'],
    ['center-left', 'center', 'center-right'],
    ['bottom-left', 'bottom-center', 'bottom-right'],
]

export function PositionGrid({ value, onChange, disabled }) {
    return (
        <div className="grid grid-cols-3 gap-1 w-16 h-16 p-1 border rounded">
            {POSITIONS.flat().map(pos => (
                <button
                    key={pos}
                    onClick={() => onChange(pos)}
                    disabled={disabled}
                    className={cn(
                        'w-4 h-4 rounded-full border transition-all',
                        value === pos 
                            ? 'bg-violet-500 border-violet-500' 
                            : 'bg-gray-200 border-gray-300 hover:bg-gray-300',
                        disabled && 'opacity-30 cursor-not-allowed'
                    )}
                />
            ))}
        </div>
    )
}
```

### Deliverables
- [ ] `ImageControlsPanel` component with all 7 controls
- [ ] `PositionGrid` reusable 3×3 position selector
- [ ] Wire image panel into section panel + wireframe sidebar
- [ ] `activePanelView` extended with `'image-controls'`
- [ ] Image upload function (Base64 MVP or Appwrite Storage)
- [ ] Controls adapt based on `imageRole` (inline vs background)
- [ ] Test: Select hero-1 → open Image panel → upload → see inline image
- [ ] Test: Select hero-5 → open Image panel → upload → see bg image
- [ ] Test: hero-44 (no image) → Image row hidden

---

## Phase 5 — Video Rendering + Asset Toggle

**Goal**: VideoBlock renders actual `<video>` or embed. Hero-3 supports real video URLs. Section panel gets an Image↔Video asset toggle for hero layouts that support it.

### 5A. Upgrade VideoBlock Component

**File**: `src/lib/designs/v2/blocks/video-block.tsx`

Current VideoBlock shows a gray placeholder with a play button icon. Upgrade:

```tsx
function VideoBlock({ block }) {
    const canvasMode = useUnifiedStore(s => s.canvasMode)
    const { src, alt, caption } = block.content as VideoBlockContent
    const { ratio, showPlayButton } = block.props as VideoBlockProps
    
    const showRealVideo = canvasMode === 'design' && src
    const aspectRatio = ratioToCSS(ratio)
    
    if (showRealVideo) {
        // Detect YouTube/Vimeo vs direct mp4
        const embedUrl = getEmbedUrl(src)
        
        if (embedUrl) {
            return (
                <div style={{ aspectRatio }} className="relative overflow-hidden rounded-lg">
                    <iframe 
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; encrypted-media"
                        allowFullScreen
                    />
                </div>
            )
        }
        
        return (
            <div style={{ aspectRatio }} className="relative overflow-hidden rounded-lg">
                <video 
                    src={src}
                    className="w-full h-full object-cover"
                    controls
                    poster={alt}
                />
            </div>
        )
    }
    
    // Wireframe placeholder
    return (
        <div style={{ aspectRatio }} className="flex items-center justify-center relative"
             style={{ backgroundColor: 'var(--sg-bg-secondary)' }}>
            <PlayCircle className="opacity-30" style={{ color: 'var(--sg-text-muted)' }} size={64} />
        </div>
    )
}
```

### 5B. Asset Type Toggle in Section Panel

**File**: `src/components/wireframe/panels/section-panel.tsx`

For hero layouts with `imageRole === 'inline'` or `supportsVideo === true`, show an Asset toggle:

```
Asset   [🖼️ Image | 📹 Video]
```

Toggling this:
1. Updates `designProps.assetType` to `'image'` or `'video'`
2. Swaps the media block in the section's block tree (replace `image` block with `video` block or vice versa)
3. Resets content for the new block type

### 5C. Block Swap Helper

**File**: `src/store/unified-store.ts`

```typescript
swapMediaBlock: (pageId, sectionId, fromType: 'image' | 'video', toType: 'image' | 'video') => void
```

Logic:
1. Walk the section's block tree
2. Find the first block of `fromType`
3. Create a new block of `toType` with same position, ID-slot, and default content
4. Replace in-place
5. Update `designProps.assetType`

### 5D. Video Embed URL Parser

**File**: `src/lib/designs/v2/utils/video-helpers.ts`

```typescript
/** Convert YouTube/Vimeo URL to embed URL */
export function getEmbedUrl(url: string): string | null {
    // YouTube patterns
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
    
    // Vimeo patterns
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    
    return null // Direct video file
}
```

### Deliverables
- [ ] VideoBlock renders `<video>` or `<iframe>` embed in design mode
- [ ] Asset toggle (Image ↔ Video) in section panel for applicable heroes
- [ ] `swapMediaBlock` action in unified store
- [ ] Video embed URL parser (YouTube, Vimeo, direct)
- [ ] Test: hero-3 → paste YouTube URL → see embed in design mode
- [ ] Test: hero-1 → toggle to Video → image swapped with video block

---

## Phase 6 — Scheme Picker Panel

**Goal**: Replace the minimal 3-chip `SectionSchemeOverlay` with a full scheme picker sub-panel matching Relume's design: list of named schemes with color swatches, checkmark on active, edit/delete options.

### 6A. Scheme Picker Panel Component

**New file**: `src/components/wireframe/panels/scheme-picker-panel.tsx`

```
← Scheme                                   ✕
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │ Scheme 1     [█████████] ✅         │ │
│ │ Light backgrounds, dark text        │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Scheme 2     [█████████]            │ │
│ │ Dark backgrounds, light text        │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Scheme 3     [█████████]            │ │
│ │ Accent background                   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [+ Add Scheme]                          │
└─────────────────────────────────────────┘
```

Each scheme row:
- Color swatch strip (5 semantic colors: bg, text, foreground, border, accent)
- Checkmark if currently applied to this section
- Click → apply scheme to section via `setSectionScheme(sectionId, scheme)`
- "..." menu → Edit (opens scheme editor in style guide) | Delete

### 6B. Scheme Row in Section Panel

**File**: `src/components/wireframe/panels/section-panel.tsx`

In design mode, show a "Scheme" row:
```
Scheme   [Light ████ ▼]
```

- Shows current scheme name + mini swatch
- Click → opens scheme picker panel (`setActivePanelView('scheme-picker')`)
- If no scheme override → shows "Inherit (Light)" dimmed

### 6C. Enhanced Scheme Data Model

Currently `sectionSchemeOverrides` maps `sectionId → 'light' | 'dark' | 'accent'`. This works for 3 schemes. For extensibility (Relume supports custom schemes), we can keep this simple for now since the style guide already has concepts:

- **Phase 6 MVP**: Keep the 3 built-in schemes (light/dark/accent). The picker just makes selection more visual.
- **Future**: Named scheme presets stored in style guide data with custom color role assignments.

### 6D. Wire into Wireframe Sidebar

**File**: `src/components/wireframe/wireframe-sidebar.tsx`

```tsx
{activePanelView === 'scheme-picker' && selectedSection && (
    <SchemePickerPanel sectionId={selectedSection.id} />
)}
```

### Deliverables
- [ ] `SchemePickerPanel` component with scheme list + color swatches
- [ ] "Scheme" row in section panel (design mode only)
- [ ] Clicks apply scheme override instantly
- [ ] Checkmark shows on currently active scheme
- [ ] "Inherit" option to clear override
- [ ] Wire into sidebar panel routing

---

## Phase 7 — Enhanced Section Controls

**Goal**: Each hero layout exposes the right control toggles (Style, Asset, Asset Placement, Element) matching what Relume shows for that template category. This uses the existing multi-axis control system.

### 7A. Expand Hero Control Axes

**File**: `src/lib/designs/v2/layouts/controls.ts`

Extend `HERO_CONTROL_DEF` with additional axes:

```typescript
const HERO_CONTROL_DEF: LayoutControlDef = {
    category: 'hero',
    axes: [
        {
            key: 'layout',
            label: 'Layout',
            options: [
                { value: 'minimal', label: 'Minimal', icon: 'AlignLeft' },
                { value: 'split-text', label: 'Split Text', icon: 'Columns2' },
                { value: 'split-image', label: 'Split + Image', icon: 'Image' },
                { value: 'split-video', label: 'Split + Video', icon: 'PlayCircle' },
                { value: 'bg-image', label: 'BG Image', icon: 'Layers' },
            ],
        },
        // NEW — only visible in design mode
        {
            key: 'asset',
            label: 'Asset',
            options: [
                { value: 'image', label: 'Image', icon: 'Image' },
                { value: 'video', label: 'Video', icon: 'PlayCircle' },
            ],
            /** Condition: only show if current layout has media */
            condition: (values) => ['split-image', 'split-video'].includes(values.layout),
        },
        {
            key: 'assetPlacement',
            label: 'Asset Placement',
            options: [
                { value: 'right', label: 'Right', icon: 'PanelRight' },
                { value: 'left', label: 'Left', icon: 'PanelLeft' },
            ],
            condition: (values) => ['split-image', 'split-video'].includes(values.layout),
        },
    ],
    // resolve + extract updated to handle multi-axis combinations
}
```

> **Note**: `condition` is a new optional field on `LayoutControlAxis` — axes can be conditionally shown based on other axis values.

### 7B. Extend LayoutControlAxis with Conditions

**File**: `src/lib/designs/v2/layouts/controls.ts`

```typescript
export interface LayoutControlAxis {
    key: string
    label: string
    options: LayoutControlOption[]
    /** Only show this axis when condition is met */
    condition?: (values: Record<string, string>) => boolean
    /** 'wireframe' = show in both modes, 'design' = design-only */
    modeVisibility?: 'wireframe' | 'design' | 'both'
}
```

### 7C. Update Section Controls Component

**File**: `src/components/wireframe/panels/section-controls.tsx`

Make the controls component mode-aware:
- Filter axes based on `condition()` and `modeVisibility`
- In wireframe mode, only show `layout` axis (existing behavior)
- In design mode, show all applicable axes

### 7D. Asset Placement (Left/Right Flip)

When user toggles asset placement from Right to Left, the block tree needs to be reordered. The `columnsFrame` children order determines visual layout:

```typescript
// Right (default): [leftColumn (text), imageBlock]
// Left: [imageBlock, leftColumn (text)]
```

Add a store action:
```typescript
flipSectionAssetPlacement: (pageId, sectionId) => void
```

This swaps the order of children in the top-level `frame` block.

### Deliverables
- [ ] Extended `HERO_CONTROL_DEF` with `asset` and `assetPlacement` axes
- [ ] `condition` and `modeVisibility` on `LayoutControlAxis`
- [ ] Section controls component filters by mode + conditions
- [ ] `flipSectionAssetPlacement` action in unified store
- [ ] Test: hero-1 in design mode → shows Layout + Asset + Placement controls
- [ ] Test: hero-44 in design mode → only shows Layout control (no media)
- [ ] Test: Flip placement → image moves from right to left

---

## Phase 8 — Responsive Preview Polish

**Goal**: A clean breakpoint toggle that re-renders the artboard at different widths — Desktop (1280px), Tablet (768px), Mobile (375px). The existing `viewport` system already supports this; this phase polishes the UI and makes breakpoint switching work like Relume.

### 8A. Bottom Bar Breakpoint Toggle

**File**: `src/components/wireframe/app-topbar.tsx` or new `bottom-bar.tsx`

Add a centered breakpoint toggle in the bottom bar (Relume uses bottom, Scytle currently has viewport selector in topbar):

```
       [🖥️ Desktop] [📱 Tablet] [📱 Mobile]        72% ▾
```

- Three icon buttons with labels
- Active breakpoint highlighted
- Reads/writes `viewport` from `useUnifiedStore`
- Also updates URL hash: `&breakpoint=desktop|tablet|mobile`

### 8B. Artboard Width Transition

**File**: `src/components/wireframe/page-frame.tsx`

When viewport changes, the artboard width should animate smoothly:

```tsx
<div style={{
    width: `${frameWidth}px`,
    transition: 'width 300ms ease-out',
}}>
```

Already partially implemented — need to verify animation works on viewport switch.

### 8C. Container Query Verification

All hero section components use `containerType: 'inline-size'` with `@max-sm:` Tailwind variants. Verify these trigger correctly at each breakpoint width:

| Breakpoint | Width | `@max-sm:` triggers? |
|-----------|-------|---------------------|
| Desktop | 1280px | No → desktop layout |
| Tablet | 768px | Depends on container query | 
| Mobile | 375px | Yes → mobile stack layout |

Test each hero layout at all 3 widths. The `@max-sm:` container query breakpoint should be ~640px (Tailwind's `sm` default). At 768px (tablet), layouts should start collapsing for some sections.

May need to add `@max-md:` (768px) variants for tablet-specific layouts that aren't covered by `@max-sm:`.

### 8D. Zoom Level Sync

When switching to tablet/mobile, auto-zoom the canvas so the narrower artboard fills the viewport comfortably:

```typescript
// On viewport change
const viewportWidth = VIEWPORT_CONFIGS[viewport].width
const canvasWidth = canvasContainerRef.current?.clientWidth ?? 1200
const optimalZoom = Math.min((canvasWidth - 100) / viewportWidth * 100, 100)
setZoomLevel(optimalZoom)
```

### Deliverables
- [ ] Bottom bar breakpoint toggle (Desktop/Tablet/Mobile)
- [ ] Smooth artboard width transition
- [ ] Container query verification for all 5 heroes at 3 breakpoints
- [ ] Add `@max-md:` variants where needed for tablet
- [ ] Auto-zoom on viewport change
- [ ] URL hash breakpoint parameter sync

---

## Cross-Cutting Concerns

### Persistence

All `designProps` data is persisted as part of `WireframeSection` which is already saved via `wireframeData` in the `PROJECTS` collection. No new Appwrite collections needed.

Image files:
- **MVP**: Base64 data URLs in `designProps` (simple, works offline, limited by localStorage size ~5MB)
- **Production**: Appwrite Storage bucket → URL reference in `designProps` (scalable, deduplicable)

### Undo/Redo

The unified store's undo/redo history already tracks page/section changes. `designProps` changes are included automatically since they're part of the section object. No special handling needed.

### Autosave

Already wired — `isDirty` flag triggers debounced save. `designProps` changes set `isDirty = true`.

### Performance

- Image rendering uses standard `<img>` tags with `loading="lazy"` for offscreen sections
- Video embeds use `<iframe>` only in design mode (no embeds in wireframe mode)
- Scheme CSS computation memoized in `SectionTokenProvider` via `useMemo`
- Background images in Hero5 use `object-cover` for efficient rendering

---

## Implementation Order + Dependencies

```
Phase 1 (Mode Toggle)
  ↓
Phase 2 (Data Model)  ← Phase 1 needed for mode-aware rendering
  ↓
Phase 3 (Image Render) ← Phase 2 needed for designProps
  ↓
Phase 4 (Image Panel)  ← Phase 3 needed so uploads have visible effect
  
Phase 5 (Video)        ← Phase 2 + Phase 3 patterns
Phase 6 (Scheme Picker)← Phase 1 (design mode)
Phase 7 (Controls)     ← Phase 1 + Phase 2

Phase 8 (Responsive)   ← Independent, can be done anytime
```

**Recommended build order**: 1 → 2 → 3 → 6 → 4 → 5 → 7 → 8

(Phase 6 moved up because scheme application gives the biggest visual impact with the least code — it builds on the existing `SectionSchemeOverlay` and `setSectionScheme` already in the store.)

---

## Per-Hero Verification Matrix

After all phases, each hero should work like this:

| Feature | hero-44 (minimal) | hero-57 (split-text) | hero-1 (split-image) | hero-3 (split-video) | hero-5 (bg-image) |
|---------|-------------------|---------------------|---------------------|---------------------|-------------------|
| **Wireframe mode** | Gray/white, no styling | Same | Gray image placeholder | Gray video placeholder | Gray bg + overlay |
| **Design + light scheme** | White bg, styled fonts, accent buttons | Same | Styled + real image | Styled + real video | Real bg image + overlay |
| **Design + dark scheme** | Dark bg, white text, accent buttons | Same | Dark + real image | Dark + real video | Real bg + overlay (always dark) |
| **Design + accent scheme** | Accent bg, white text | Same | Accent + real image | Accent + real video | N/A (bg-image overrides scheme) |
| **Image upload** | N/A | N/A | ✅ inline image | N/A | ✅ background image |
| **Image controls panel** | Hidden | Hidden | Full controls | Hidden | Position + Overlay only |
| **Video** | N/A | N/A | Toggle to video | ✅ default | N/A |
| **Asset toggle** | Hidden | Hidden | Image ↔ Video | Video ↔ Image | Hidden |
| **Asset placement** | N/A | N/A | Left ↔ Right | Left ↔ Right | N/A |
| **Responsive desktop** | Single column | Two columns | Text + Image columns | Text + Video columns | Full bg + content |
| **Responsive mobile** | Stack | Stack | Stack (image below) | Stack (video below) | Full bg + content |

---

## File Inventory (New + Modified)

### New Files (~10)
| File | Phase | Purpose |
|------|-------|---------|
| `src/lib/designs/v2/utils/image-helpers.ts` | 3 | ratioToCSS, positionToCSS |
| `src/lib/designs/v2/utils/video-helpers.ts` | 5 | getEmbedUrl |
| `src/components/wireframe/panels/image-controls-panel.tsx` | 4 | Image sub-panel |
| `src/components/wireframe/panels/position-grid.tsx` | 4 | 9-point position grid |
| `src/components/wireframe/panels/scheme-picker-panel.tsx` | 6 | Scheme picker |
| `src/lib/appwrite-storage.ts` | 4 | Image upload (or inline in panel) |

### Modified Files (~15)
| File | Phases | Changes |
|------|--------|---------|
| `src/store/unified-store.ts` | 1,2,3,5,7 | canvasMode, designProps actions, swapMediaBlock, flipPlacement |
| `src/lib/designs/v2/tokens/index.ts` | 2 | SectionDesignProps type + related types |
| `src/lib/designs/v2/tokens/provider.tsx` | 1 | Mode-aware TokenProvider + SectionTokenProvider |
| `src/lib/designs/v2/tokens/defaults.ts` | 1 | WIREFRAME_NEUTRAL_CSS constant |
| `src/types/index.ts` | 2 | designProps on WireframeSection + schema |
| `src/lib/designs/v2/layouts/hero/types.ts` | 2 | imageRole, supportsVideo on HeroPresetConfig |
| `src/lib/designs/v2/layouts/hero/presets.ts` | 2 | Update 5 preset configs with imageRole |
| `src/lib/designs/v2/layouts/hero/hero-section.tsx` | 3 | Hero5 reads designProps for bg image |
| `src/lib/designs/v2/blocks/index.tsx` | 3,5 | ImageBlock + VideoBlock upgraded |
| `src/lib/designs/v2/layouts/controls.ts` | 7 | Extended axes, condition, modeVisibility |
| `src/components/wireframe/panels/section-panel.tsx` | 4,5,6 | Image row, Asset toggle, Scheme row |
| `src/components/wireframe/panels/section-controls.tsx` | 7 | Mode-aware control filtering |
| `src/components/wireframe/wireframe-sidebar.tsx` | 4,6 | New panel view routing |
| `src/components/wireframe/app-topbar.tsx` | 1,8 | Mode toggle + breakpoint buttons |
| `src/components/wireframe/page-frame.tsx` | 8 | Smooth width transition |

---

## Success Criteria

1. **Mode toggle works**: Wireframe shows grayscale; Design shows full styling
2. **Schemes apply visually**: Light → white bg; Dark → dark bg + light text; Accent → accent bg + white text
3. **Images render in design mode**: Real images in hero-1 and hero-5
4. **Image controls work**: Upload, change ratio/position/overlay → live preview updates
5. **Video embeds work**: YouTube/Vimeo URLs render in hero-3
6. **Controls adapt by template**: hero-44 shows minimal controls; hero-1 shows full set
7. **Responsive works**: All 5 heroes look correct at Desktop/Tablet/Mobile widths
8. **Build passes**: `npm run build` clean with zero TypeScript errors
9. **Undo/redo works**: Design prop changes are undoable
10. **Persistence works**: Reload page → design props restored from storage
