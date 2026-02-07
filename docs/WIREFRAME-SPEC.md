# Scytle Wireframe Canvas - Detailed Specification

## Overview

The Wireframe view is a **full-page visual editor** that renders each sitemap page as an interactive, editable wireframe. Users can edit content inline, swap components from a library, and customize section properties.

**Key Principle:** Wireframes are **low-fidelity visual representations** - grayscale boxes with placeholder content that can be edited and swapped.

**Responsive Preview:** Like Figma Sites, show **Desktop + Mobile viewports side by side** so users see responsive layouts simultaneously.

---

## UI Design References & Inspiration

### Primary Inspiration Sources

| Tool | What to Learn |
|------|---------------|
| **Figma Sites** | Dual viewport layout, breakpoint labels, page frame headers |
| **Relume** | Section blocks, component library, AI content generation |
| **Webflow Designer** | Canvas interactions, panel sliding, selection states |
| **Framer** | Smooth animations, component swapping, properties panel |
| **Notion** | Inline editing, slash commands, block-based editing |
| **Linear** | Clean sidebar panels, minimal UI, keyboard shortcuts |
| **Shadcn/ui** | Component library patterns, consistent styling |

### Color Palette for Wireframes

| Element | Color | Tailwind Class | Usage |
|---------|-------|----------------|-------|
| **Canvas Background** | `#F8F9FA` | `bg-gray-50` | Main canvas area |
| **Section Block** | `#FFFFFF` | `bg-white` | Section container background |
| **Section Border** | `#E5E7EB` | `border-gray-200` | Default section border |
| **Selected Border** | `#8B5CF6` | `border-violet-500` | Selected section/element |
| **Hover Border** | `#A78BFA` | `border-violet-400` | Hover state |
| **Placeholder Content** | `#D1D5DB` | `bg-gray-300` | Gray boxes, lines for wireframe |
| **Text Placeholder** | `#9CA3AF` | `text-gray-400` | Placeholder text color |
| **Global Section Badge** | `#10B981` | `bg-emerald-500` | Global section indicator |

### Typography for Wireframes

| Element | Font | Size | Weight | Tailwind |
|---------|------|------|--------|----------|
| **Section Heading** | Inter | 24-32px | 600 | `text-2xl font-semibold` |
| **Subheading** | Inter | 18-20px | 500 | `text-lg font-medium` |
| **Body Text** | Inter | 14-16px | 400 | `text-sm` or `text-base` |
| **Button Label** | Inter | 14px | 500 | `text-sm font-medium` |
| **Viewport Label** | Inter | 12px | 500 | `text-xs font-medium uppercase` |
| **Panel Label** | Inter | 13px | 500 | `text-sm font-medium text-muted-foreground` |

### Spacing System

| Use Case | Spacing | Tailwind |
|----------|---------|----------|
| Section gap | 12px | `gap-3` |
| Panel padding | 16px | `p-4` |
| Form field gap | 12px | `space-y-3` |
| Button icon gap | 8px | `gap-2` |
| Card padding | 12-16px | `p-3` or `p-4` |

---

## 1. View Structure

### 1.1 Reusing Existing Canvas Infrastructure

**Important:** The wireframe view **reuses the same canvas infrastructure** already built for the sitemap view. We are NOT building a new layout from scratch.

**What Already Exists (from Sitemap):**
- Left sidebar that hides when empty, shows on selection
- Main canvas area with zoom/pan controls
- Bottom bar with zoom percentage, device toggles
- Canvas background, scrolling, keyboard shortcuts

**What Changes for Wireframe:**
- Canvas content: Page frames with sections (instead of sitemap nodes)
- Left sidebar content: Page/Section panels (instead of sitemap node panel)
- Selection behavior: Click section to edit (instead of node)

### 1.2 Layout (Same as Sitemap)

**Left Sidebar (280-320px):**
- **Hidden by default** (same as sitemap)
- Shows when page or section is selected
- Slides in with 200ms ease transition
- Contains: Page Panel OR Section Panel (context-sensitive)

**Center Canvas (Flexible):**
- Same canvas component as sitemap
- Renders page frames instead of sitemap nodes
- Dual viewport frames (Desktop + Mobile) side by side

**Bottom Bar (Already Built):**
- Reuse existing zoom controls
- Add device visibility toggles (Desktop/Mobile/Tablet)

### 1.3 Dual Viewport Display

**Design Reference:** Figma Sites breakpoint preview mode

Each page shows **two device frames side by side** on the canvas:

**Desktop Frame:**
- Width: 1280px (scaled to fit canvas)
- Background: white (`bg-white`)
- Shadow: `shadow-sm` for depth
- Border: 1px gray-200

**Mobile Frame:**
- Width: 375px (iPhone SE/standard)
- Positioned to the right of Desktop
- Same shadow and border styling
- Gap between frames: 32-48px

**Frame Header (above each viewport):**
- Left side:
  - Collapse/expand chevron (ChevronDown when open)
  - Page name (editable inline on double-click)
- Right side:
  - Options menu button (MoreHorizontal icon)
  - Menu items: Duplicate Page, Delete Page, Page Settings

**Viewport Labels:**
- Positioned above each frame, left-aligned
- Format: "Desktop · Primary · 1280 +" and "Mobile · 1 - 1279"
- Style: `text-xs font-medium text-muted-foreground uppercase tracking-wide`

### 1.4 Viewport Specifications

| Viewport | Width | Scale Factor | Visibility Toggle |
|----------|-------|--------------|-------------------|
| **Desktop** | 1280px | Auto-fit or 100% | Always visible (primary) |
| **Mobile** | 375px | Auto-fit or 100% | Toggle via bottom bar |
| **Tablet** | 768px | Auto-fit or 100% | Future enhancement |

---

## 2. Empty State

### 2.1 When Displayed
- Wireframe view opened with **no sitemap data** yet
- Page exists in sitemap but has **no sections**

### 2.2 UI Design

**Design Reference:** Notion empty page, Figma empty frame, Linear empty state

**Container:**
- Centered within the page frame
- Max-width: 320px
- Padding: 48px vertical

**Visual:**
- No dashed border (keep it clean)
- Optional: Subtle illustration or icon (Lucide `Layers` or `LayoutTemplate`)
- Icon size: 48px, color: `text-muted-foreground`

**Message:**
- Text: "Add sections to build your page"
- Style: `text-sm text-muted-foreground text-center`
- Margin below icon: 16px

**Buttons (horizontal, side by side):**

**Primary CTA - "+ Section":**
- Use Shadcn `Button` with `variant="outline"`
- Icon: Plus (Lucide)
- Text: "Section"
- Opens section picker panel

**Secondary CTA - "✨ Generate page":**
- Use Shadcn `Button` with `variant="default"` (primary purple)
- Icon: Sparkles (Lucide)
- Text: "Generate page"
- AI generates all sections for this page type

**Button Container:**
- `flex gap-2` or `gap-3`
- Center aligned

---

## 3. Generation Loading State

### 3.1 Trigger
- User clicks "✨ Generate page" on empty page
- User clicks "Generate page" in Page Panel
- Switching to Wireframe when sitemap exists but wireframes don't

### 3.2 UI Design

**Design Reference:** v0.dev generation animation, Midjourney progress, Claude thinking indicator

**Canvas Behavior:**
1. Canvas auto-zooms to fit all pages in view
2. Each page frame shows skeleton placeholder
3. Floating progress indicator appears at bottom

**Skeleton Loading (per page):**
- Use Shadcn `Skeleton` component
- Animate with `animate-pulse` (Tailwind)
- Show placeholder shapes for:
  - Navbar: Full-width rectangle, h-14
  - Hero: Large rectangle, h-64
  - Content sections: Multiple rectangles, varying heights
  - Footer: Full-width rectangle, h-32

**Progress Indicator (floating at bottom-center):**
- Position: `fixed bottom-8 left-1/2 -translate-x-1/2`
- Style: `bg-background shadow-lg rounded-full px-4 py-2 flex items-center gap-3`
- Content:
  - Sparkles icon (animated pulse)
  - Text: "Generating wireframes..."
  - Stop button: Square icon, `text-muted-foreground hover:text-destructive`

**Progressive Population:**
- Sections appear one by one as AI generates
- Use `animate-in fade-in slide-in-from-bottom-2` (Tailwind animation)
- Duration: 200-300ms per section

---

## 4. Page Panel (Left Sidebar)

### 4.1 Trigger
- Click on page frame header (name area)
- Click on page background (not a section)
- Select page from right sidebar

### 4.2 UI Design

**Design Reference:** Figma design panel, Framer properties panel, Notion page settings

**Panel Container:**
- Width: 280-320px
- Height: 100% of sidebar
- Background: `bg-background`
- Right border: 1px `border-border`
- Padding: 16px

**Panel Header:**
- Title: "Page"
- Font: `text-base font-semibold`
- Close button: X icon, positioned absolute right
- Margin bottom: 16px

**Form Fields:**

**Name Field:**
- Label: "Name" with red asterisk (required)
- Label style: `text-sm font-medium text-foreground`
- Required indicator: `text-destructive`
- Input: Shadcn `Input` component
- Placeholder: "Enter page name"
- Auto-save on blur with 500ms debounce

**Description Field:**
- Label: "Description"
- Input: Shadcn `Textarea`
- Rows: 3-4 (auto-resize with CSS)
- Placeholder: "Add a unique description to regenerate the page with a new layout and copy..."
- Character limit: 500 (optional counter)

**Prompt Enhancement Button:**
- Text: "+ Prompt"
- Position: Below textarea, right-aligned
- Style: `text-sm text-primary hover:underline cursor-pointer`
- Action: Expands to show AI prompt input inline

**Divider:**
- Use Shadcn `Separator` or `<hr>`
- Margin: `my-4`

**Action Buttons (stacked vertically):**
- Full width buttons with icon left
- Gap between buttons: 8px
- Style: Shadcn `Button` with `variant="ghost"`, `justify="start"`, `className="w-full"`

| Button | Icon | Action |
|--------|------|--------|
| Save as Page Template | Bookmark | Save current layout for reuse |
| Shuffle components | Shuffle | Random component variants |
| Generate copy | Wand2 | AI rewrites all text |

**Divider:** `my-4`

**Primary Action Button:**
- Text: "Generate page"
- Icon: Sparkles
- Style: Shadcn `Button` with `variant="default"` (primary), full width
- Below button: Warning text

**Warning Text:**
- Icon: AlertTriangle (amber)
- Text: "This will override all page sections and copy"
- Style: `text-xs text-muted-foreground flex items-center gap-1.5`
- Margin top: 8px

---

## 5. Section Panel (Left Sidebar)

### 5.1 Trigger
- Click on any section within the wireframe

### 5.2 UI Design

**Design Reference:** Relume section panel, Webflow element settings, Framer layer properties

**Panel Header:**
- Title: "Section"
- Same styling as Page panel header
- Close button

**Global Section Toggle:**
- Full width button at top of panel
- Icon: Sparkles or Globe
- Text: "Make a global section"
- Style: Shadcn `Button` with `variant="outline"`, full width
- When active: Shows "Global section" with green checkmark
- Tooltip: "Global sections sync across all pages"

**Form Fields:**

**Name Field:** Same as Page panel

**Description Field:** Same as Page panel

**Component Selector:**
- Clickable card that opens component library
- Layout: Flex row, items center, full width
- Left: Layers icon (Lucide `Layers`)
- Center: Component name (e.g., "Header 145")
- Right: ChevronRight icon
- Style: `bg-muted rounded-lg p-3 cursor-pointer hover:bg-muted/80 transition-colors`
- On click: Slide to Component Library panel

### 5.3 Section-Specific Controls

**Design Reference:** Framer component properties, Webflow style controls

Controls render dynamically based on section type. Use a config object to define controls per section type.

**Control Container:**
- Margin top: 16px
- Label + Control on same row or stacked
- Gap between control rows: 12px

**Control Types & Shadcn Components:**

| Control Type | Component | Props |
|--------------|-----------|-------|
| Segmented (2-4 options) | `ToggleGroup` | `type="single"`, `variant="outline"` |
| Toggle (on/off) | `Switch` | Default styling |
| Select (5+ options) | `Select` | With `SelectTrigger`, `SelectContent` |
| Number input | `Input` | `type="number"` with min/max |

**Section Control Configurations:**

**Hero Section:**
| Label | Control | Options |
|-------|---------|---------|
| Text Alignment | ToggleGroup | AlignLeft, AlignCenter, AlignRight icons |
| Asset Type | ToggleGroup | "Image", "Video" |

**Testimonial Section:**
| Label | Control | Options |
|-------|---------|---------|
| Slider | ToggleGroup | "Yes", "No" |
| Content Type | ToggleGroup | "Type 1", "Type 2" |

**Features Section:**
| Label | Control | Options |
|-------|---------|---------|
| Columns | ToggleGroup | "2", "3", "4" |
| Show Icons | Switch | On/Off |

**FAQ Section:**
| Label | Control | Options |
|-------|---------|---------|
| Style | ToggleGroup | "Accordion", "List" |
| Columns | ToggleGroup | "1", "2" |

**Gallery Section:**
| Label | Control | Options |
|-------|---------|---------|
| Layout | ToggleGroup | "Grid", "Masonry", "Carousel" |
| Columns | ToggleGroup | "2", "3", "4" |

**Pricing Section:**
| Label | Control | Options |
|-------|---------|---------|
| Tiers | ToggleGroup | "2", "3", "4" |
| Highlight | Switch | On/Off |

**Generate Copy Button:**
- Positioned at bottom of controls
- Style: Shadcn `Button` with `variant="ghost"`, full width
- Icon: Wand2
- Text: "Generate copy"

---

## 6. Section Block Component

### 6.1 Container Styling

**Design Reference:** Notion blocks, Webflow sections, Craft blocks

**Default State:**
- Background: white (`bg-white`)
- Border: 1px solid gray-200 (`border border-gray-200`)
- Border radius: 8px (`rounded-lg`)
- Padding: 16-24px (`p-4` or `p-6`)
- Margin bottom: 12px between sections (`mb-3`)
- Cursor: pointer

**Hover State:**
- Border color: violet-300 (`hover:border-violet-300`)
- Transition: 150ms ease (`transition-colors`)
- Shows:
  - Drag handle (left side)
  - Expand icon (top-right)
  - "+ Add section" button (below)

**Selected State:**
- Border: 2px solid violet-500 (`border-2 border-violet-500`)
- Ring: violet-200 (`ring-2 ring-violet-200`)
- Drag handle always visible
- Expand icon always visible

### 6.2 Wireframe Placeholders

**Design Reference:** Balsamiq, Whimsical wireframes, Excalidraw

Use grayscale placeholder shapes to represent content:

**Heading Placeholder:**
- Rectangle: `h-8 w-3/4 bg-gray-300 rounded`
- Represents H1/H2 text
- Animate pulse on generation

**Subheading Placeholder:**
- Rectangle: `h-6 w-1/2 bg-gray-200 rounded`
- Below heading with `mt-2`

**Body Text Lines:**
- Multiple rectangles: `h-4 bg-gray-200 rounded`
- Varying widths: w-full, w-5/6, w-4/5
- Stack with `space-y-2`

**Button Placeholder:**
- Rounded rectangle: `h-10 w-32 bg-gray-400 rounded-md`
- Or actual button with gray styling
- Can show two side by side for primary/secondary

**Image Placeholder:**
- Rectangle with icon centered
- Size: Varies (hero: h-64, card: h-40)
- Background: `bg-gray-100`
- Border: `border border-gray-200`
- Icon: Image (Lucide) in gray-400, size 32-48px
- Aspect ratio: 16:9 or 4:3

**Avatar Placeholder:**
- Circle: `w-12 h-12 bg-gray-300 rounded-full`
- For testimonials, team members

**Icon Placeholder:**
- Circle or square: `w-10 h-10 bg-gray-200 rounded-lg`
- Or use actual Lucide icon in gray-400

### 6.3 Drag Handle

**Design Reference:** Notion drag handle, Linear issue drag

**Position:** 
- Absolute positioned
- Left side of section: `-left-6` or `-left-8`
- Vertically centered

**Icon:** GripVertical (Lucide) - 6-dot pattern

**Visibility:**
- `opacity-0` by default
- `opacity-100` on section hover
- Always visible when selected
- Transition: 150ms ease

**States:**
- Default cursor: `cursor-grab`
- While dragging: `cursor-grabbing`
- Color: `text-gray-400 hover:text-gray-600`

### 6.4 Expand Icon

**Position:** Absolute, top-right corner (`top-2 right-2`)

**Icon:** Maximize2 or Expand (Lucide)

**Size:** `w-5 h-5`

**Action:** Opens section in full-screen edit mode (future)

**Styling:** `text-gray-400 hover:text-gray-600`

**Visibility:** Same as drag handle

### 6.5 Add Section Button

**Design Reference:** Notion add block, Linear add issue

**Position Options:**
1. Centered below each section on hover
2. Always visible between sections (subtle)
3. Floating center of canvas when zoomed out

**Recommended: Option 1 (on hover)**

**Styling:**
- Pill shape: `rounded-full px-4 py-2`
- Background: `bg-violet-600 hover:bg-violet-700`
- Text: `text-white text-sm font-medium`
- Icon: Plus (Lucide) before text
- Shadow: `shadow-md`

**Animation:**
- Fade in: `animate-in fade-in`
- Slide up: `slide-in-from-bottom-2`
- Duration: 200ms

---

## 7. Inline Content Editing

### 7.1 Trigger
- Single click: Select text element
- Double click: Enter edit mode

### 7.2 UI Design

**Design Reference:** Notion inline editing, Medium editor, Craft

**Selection State (single click):**
- Blue/violet ring around element: `ring-2 ring-violet-400`
- "Ask AI" button appears floating above
- Element is "focused" but not editable yet

**Ask AI Button:**
- Position: Absolute, centered above selected element
- Offset: `bottom-full mb-2 left-1/2 -translate-x-1/2`
- Style: 
  - Background: `bg-white`
  - Shadow: `shadow-lg`
  - Border radius: `rounded-full`
  - Padding: `px-3 py-1.5`
- Content:
  - Sparkles icon (violet-500)
  - Text: "Ask AI"
  - Gap: `gap-1.5`
- Animation: `animate-in fade-in slide-in-from-bottom-2`

**Edit Mode (double click):**
- Text becomes editable (`contenteditable="true"` or focused Input)
- Cursor appears in text
- Ring changes to solid: `ring-2 ring-violet-500`
- Ask AI button stays visible

**Exit Edit Mode:**
- Click outside: Save and deselect
- Escape key: Cancel changes, deselect
- Tab: Save and move to next editable

### 7.3 Editable Elements by Type

| Element | Edit Mode | AI Assist |
|---------|-----------|-----------|
| Headings (H1-H3) | Inline contenteditable | ✅ Full menu |
| Paragraphs | Inline contenteditable | ✅ Full menu |
| Button text | Inline input | ✅ Rewrite only |
| List items | Inline contenteditable | ✅ Full menu |
| Image alt text | Popover with input | ❌ No AI |
| Link URLs | Popover with input | ❌ No AI |

---

## 8. AI Text Actions Menu

### 8.1 Trigger
- Click "Ask AI" button when text is selected

### 8.2 UI Design

**Design Reference:** Notion AI, Grammarly suggestions, ChatGPT input

**Component:** Shadcn `DropdownMenu` or `Popover`

**Position:** Below or above the Ask AI button (auto-flip)

**Width:** 280-320px

**Structure:**

**Custom Prompt Input (at top):**
- Container: `flex items-center gap-2 p-2 border-b`
- Input: Shadcn `Input` with placeholder "Ask AI to write..."
- Submit: Button with ArrowUp icon
- Style: Input fills space, button on right

**Divider**

**Quick Actions (menu items):**

| Action | Icon | Keyboard Shortcut |
|--------|------|-------------------|
| Rewrite | RefreshCw | ⌘R |
| Make shorter | Minus | ⌘S |
| Make longer | Plus | ⌘L |
| Make N lines | AlignJustify | - |
| Fix spelling & grammar | Check | ⌘G |
| Improve writing | Pencil | ⌘I |
| Simplify language | Zap | - |
| Change tone | Volume2 | ⌘T |

**Submenu Trigger:**
- Items with submenu show ChevronRight icon on right
- Submenu opens to the right on hover/click

**"Make N lines" Submenu:**
- Options: 1, 2, 3, 4, 5 lines
- Each shows line count

**"Change tone" Submenu:**
- Professional
- Casual
- Friendly
- Formal
- Bold
- Playful

**Menu Item Styling:**
- Use Shadcn `DropdownMenuItem`
- Icon + text + optional keyboard shortcut
- Hover: `bg-muted`

**Loading State:**
- Replace menu content with:
  - Spinner icon (animated)
  - Text: "Rewriting..."
- Or show skeleton pulse in the text area

---

## 9. Component Library Panel

### 9.1 Trigger
- Click component selector in Section Panel

### 9.2 Compact View (Default)

**Design Reference:** Shadcn component picker, Figma assets panel, Relume library

**Panel Transition:**
- Slides in from right (replacing Section panel content)
- Or slides over as overlay

**Header:**
- Back button: ChevronLeft icon + "Back" or just arrow
- Title: "Replace Component"
- Close: X icon (optional, back is enough)

**Search Bar:**
- Shadcn `Input` with Search icon prefix
- Placeholder: "Search components..."
- Filter toggle: Button with SlidersHorizontal icon on right

**Tabs:**
- Shadcn `Tabs` component
- Two tabs: "Suggested" | "Saved"
- Suggested: AI-recommended based on section type
- Saved: User's bookmarked components (localStorage)

**Component List (ScrollArea):**
- Vertical list with 8px gap
- Each item = Component Card

**Component Card:**
- Layout: Flex row, items center
- Height: 48-56px
- Left: Thumbnail (small preview, 40x40 or 48x32)
- Center: Component name (e.g., "Testimonial 7")
- Right: Checkmark if selected (green), Bookmark icon (toggle)
- Background: `hover:bg-muted rounded-md`

**Shuffle Button (bottom):**
- Sticky at bottom of panel
- Full width, `variant="ghost"`
- Icon: Shuffle
- Text: "Shuffle component"
- Action: Random component from same category

### 9.3 Expanded View (Filtered)

**Trigger:** Click filter toggle button

**Layout:** Panel expands to 400-480px or opens as modal/sheet

**Filter Bar:**
- Horizontal row of filter dropdowns
- Use Shadcn `Select` for each

| Filter | Options |
|--------|---------|
| Category | All, Hero, Features, Testimonials, FAQ, Pricing, etc. |
| Layout | Centered, Left-aligned, Split, Grid, Carousel |
| Elements | With Image, With Video, With Icons, With Form |
| Toggle | "Show uncommon" Switch |

**Clear Filters:** Text button to reset all

**Component Grid:**
- 2-3 columns of cards
- Each card:
  - Thumbnail: aspect-video, rounded-md
  - Name below thumbnail
  - Selected indicator: violet ring
  - Bookmark icon: absolute top-right

**Card Hover:**
- Scale: `hover:scale-[1.02]`
- Shadow: `hover:shadow-md`
- Transition: 150ms ease

**Pagination/Scroll:**
- Infinite scroll preferred
- Or "Load more" button at bottom

---

## 10. Bottom Bar (Extend Existing)

**Note:** The bottom bar already exists from the sitemap canvas. We only add device visibility toggles for wireframe view.

**Already Built:**
- Zoom controls (percentage dropdown, +/- buttons)
- Fit to view button
- Bottom bar container styling

**Add for Wireframe:**
- Device toggles: Icon buttons in a group
  - Desktop: Monitor icon (Lucide `Monitor`)
  - Mobile: Smartphone icon (Lucide `Smartphone`)
  - Active state: `bg-muted` or highlighted
  - Click: Toggle viewport visibility (show/hide Desktop or Mobile frame)

---

## 11. Keyboard Shortcuts

**Design Reference:** Figma, Linear, Notion keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Delete` / `Backspace` | Delete selected section |
| `Cmd/Ctrl + D` | Duplicate section |
| `Cmd/Ctrl + C` | Copy section |
| `Cmd/Ctrl + V` | Paste section |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Escape` | Deselect / Close panel / Exit edit |
| `↑` / `↓` | Navigate between sections |
| `Enter` | Edit selected text element |
| `Space` (hold) | Pan canvas (hand tool) |
| `Cmd/Ctrl + +` | Zoom in |
| `Cmd/Ctrl + -` | Zoom out |
| `Cmd/Ctrl + 0` | Zoom to 100% |
| `Cmd/Ctrl + 1` | Zoom to fit all |
| `Cmd/Ctrl + 2` | Zoom to selection |
| `/` | Open section picker (when empty) |

**Shortcuts Hint:**
- Show in bottom bar tooltip or help menu
- Use `Kbd` component for key display

---

## 13. Data Models

### 13.1 Wireframe Store (Zustand)

```typescript
interface WireframeStore {
  // State
  pages: WireframePage[]
  selectedPageId: string | null
  selectedSectionId: string | null
  
  // View State
  viewportMode: 'dual' | 'desktop' | 'mobile'
  zoomLevel: number
  panPosition: { x: number; y: number }
  
  // Generation State
  isGenerating: boolean
  generationProgress: number
  generatingPageIds: string[]
  
  // Panel State
  activePanelView: 'page' | 'section' | 'library' | null
  libraryExpanded: boolean
  libraryFilters: LibraryFilters
  
  // History (for undo/redo)
  history: HistoryEntry[]
  historyIndex: number
  
  // Actions
  loadFromSitemap: (sitemapPages: SitemapPage[]) => void
  selectPage: (pageId: string) => void
  selectSection: (sectionId: string) => void
  deselectAll: () => void
  
  // Section Actions
  updateSection: (sectionId: string, updates: Partial<WireframeSection>) => void
  updateSectionContent: (sectionId: string, content: Partial<SectionContent>) => void
  reorderSections: (pageId: string, fromIndex: number, toIndex: number) => void
  addSection: (pageId: string, sectionType: string, afterSectionId?: string) => void
  deleteSection: (sectionId: string) => void
  setComponent: (sectionId: string, componentId: string) => void
  toggleGlobalSection: (sectionId: string) => void
  
  // Generation
  generatePage: (pageId: string) => Promise<void>
  generateAllPages: () => Promise<void>
  shuffleComponents: (pageId: string) => void
  generateCopy: (scope: 'page' | 'section', id: string) => Promise<void>
  
  // View
  setZoom: (level: number) => void
  setViewportMode: (mode: 'dual' | 'desktop' | 'mobile') => void
  
  // History
  undo: () => void
  redo: () => void
  
  // Persistence
  saveWireframe: () => Promise<void>
}
```

### 13.2 Wireframe Page

```typescript
interface WireframePage {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string | null
  order: number
  sections: WireframeSection[]
  createdAt: string
  updatedAt: string
}
```

### 13.3 Wireframe Section

```typescript
interface WireframeSection {
  id: string
  type: string // 'hero', 'testimonial', 'features', 'faq', etc.
  name: string
  description?: string
  componentId: string // e.g., 'header-145', 'testimonial-7'
  isGlobal: boolean
  order: number
  content: SectionContent
  controls: SectionControls
}

type SectionControls = Record<string, string | number | boolean>
```

### 13.4 Section Content

```typescript
interface SectionContent {
  heading?: string
  subheading?: string
  body?: string
  
  buttonPrimary?: {
    text: string
    href?: string
  }
  buttonSecondary?: {
    text: string
    href?: string
  }
  
  image?: {
    src: string
    alt: string
  }
  video?: {
    src: string
    poster?: string
  }
  
  items?: ContentItem[]
  testimonials?: Testimonial[]
  faqs?: FAQ[]
  pricingTiers?: PricingTier[]
}

interface ContentItem {
  id: string
  heading?: string
  body?: string
  icon?: string
  image?: {
    src: string
    alt: string
  }
}
```

---

## 14. Component Library Structure

### 14.1 Categories

| Category | Priority | Variants (MVP) | Description |
|----------|----------|----------------|-------------|
| **Navbar** | P1 | 10-15 | Navigation headers |
| **Hero** | P1 | 15-20 | Page hero sections |
| **Features** | P1 | 10-15 | Feature grids/lists |
| **Testimonials** | P1 | 8-12 | Social proof |
| **CTA** | P1 | 8-10 | Call-to-action blocks |
| **FAQ** | P1 | 5-8 | Accordion/list FAQ |
| **Footer** | P1 | 8-12 | Page footers |
| **Team** | P2 | 5-8 | Team member grids |
| **Pricing** | P2 | 5-8 | Pricing tables |
| **Contact** | P2 | 5-8 | Contact forms |
| **Gallery** | P2 | 5-8 | Image galleries |
| **Blog** | P2 | 5-8 | Blog layouts |
| **Logos** | P3 | 5-8 | Logo clouds |
| **Stats** | P3 | 5-8 | Statistics displays |
| **Portfolio** | P3 | 5-8 | Portfolio grids |

### 14.2 Component Metadata

```typescript
interface ComponentVariant {
  id: string               // 'header-145'
  name: string             // 'Header 145'
  category: string         // 'hero'
  thumbnail: string        // '/components/hero/header-145.png'
  
  // For filtering
  layout: 'centered' | 'left' | 'right' | 'split' | 'grid' | 'carousel'
  elements: ('image' | 'video' | 'icon' | 'button' | 'form')[]
  
  // For defaults
  defaultControls: SectionControls
  contentSchema: ContentSchema
  
  // For search/ranking
  tags: string[]
  popularity: number
  isUncommon: boolean
}
```

---

## 15. Implementation Phases

### Phase 1: Wireframe View & Frames (3-4 days)

**Goal:** Render page frames on existing canvas when Wireframe tab is active

**Reusing from Sitemap:**
- Canvas container with zoom/pan (already built)
- Left sidebar show/hide behavior (already built)
- Bottom bar with zoom controls (already built)

**Files to Create:**
- `store/wireframe-store.ts` - Wireframe-specific state
- `components/wireframe/page-frame.tsx` - Page artboard with header
- `components/wireframe/viewport-frame.tsx` - Device frame wrapper

**Files to Modify:**
- `components/canvas/canvas-view.tsx` - Add wireframe view condition
- `store/sitemap-store.ts` - Add wireframe data transformation

**Tasks:**
- [ ] Create wireframe-store with Zustand + immer
- [ ] Transform sitemap pages → wireframe format (add componentId, content, controls)
- [ ] Build page-frame.tsx (white artboard with header)
- [ ] Build viewport-frame.tsx (Desktop 1280px + Mobile 375px side by side)
- [ ] Add viewport labels above each frame
- [ ] Render sections as simple blocks inside frames (no placeholders yet)
- [ ] Wire up to existing canvas zoom/pan
- [ ] Add device toggle to existing bottom bar

---

### Phase 2: Section Blocks (4-5 days)

**Goal:** Render interactive section blocks with selection

**Files:**
- `components/wireframe/section-block.tsx`
- `components/wireframe/placeholders/` (multiple files)
- `lib/wireframe/placeholder-renderer.tsx`

**Tasks:**
- [ ] Create section-block component with all states
- [ ] Build placeholder components per section type
- [ ] Add drag handle (visible on hover)
- [ ] Add expand icon (top-right)
- [ ] Add "+ Section" button (below, on hover)
- [ ] Implement selection behavior (click)
- [ ] Keyboard navigation (↑/↓)
- [ ] Responsive placeholders for mobile viewport

---

### Phase 3: Left Sidebar Panels (5-6 days)

**Goal:** Context-sensitive editing sidebar (reuses existing sidebar behavior)

**Reusing from Sitemap:**
- Sidebar show/hide logic (hidden when nothing selected)
- Sidebar slide animation
- Panel container structure

**Files to Create:**
- `components/wireframe/panels/page-panel.tsx`
- `components/wireframe/panels/section-panel.tsx`
- `components/wireframe/panels/section-controls.tsx`
- `lib/wireframe/section-controls-config.ts`

**Tasks:**
- [ ] Create page-panel with form fields (name, description, actions)
- [ ] Create section-panel with form fields
- [ ] Build component selector row (opens library)
- [ ] Implement dynamic section controls per type
- [ ] Define control configs per section type
- [ ] Connect controls to wireframe store
- [ ] Add "Prompt +" AI enhancement
- [ ] Reuse existing sidebar container, just swap content
- [ ] Style action buttons

---

### Phase 4: Component Library (6-7 days)

**Goal:** Browse and swap section components

**Files:**
- `components/wireframe/panels/component-library.tsx`
- `components/wireframe/component-card.tsx`
- `lib/wireframe/component-library.ts`
- `types/wireframe.ts`

**Tasks:**
- [ ] Define component metadata structure
- [ ] Create P1 components (5-10 per category)
- [ ] Generate placeholder thumbnails
- [ ] Build compact library view
- [ ] Add search functionality
- [ ] Add Suggested/Saved tabs
- [ ] Build expanded view with filters
- [ ] Implement component selection
- [ ] Shuffle functionality
- [ ] Bookmark/save (localStorage)

---

### Phase 5: Inline Editing (5-6 days)

**Goal:** Edit text content with AI assistance

**Files:**
- `components/wireframe/editable-text.tsx`
- `components/wireframe/ai-text-menu.tsx`
- `app/api/ai/rewrite-text/route.ts`
- `lib/ai/prompts/text-rewrite.ts`

**Tasks:**
- [ ] Create editable-text component
- [ ] Implement click-to-select, double-click-to-edit
- [ ] Build "Ask AI" floating button
- [ ] Create AI text menu dropdown
- [ ] Add custom prompt input
- [ ] Implement quick actions (Rewrite, Shorten, etc.)
- [ ] Add tone submenu
- [ ] Create API endpoint for AI rewriting
- [ ] Build Gemini prompts per action
- [ ] Loading states during generation

---

### Phase 6: Drag & Drop (4-5 days)

**Goal:** Reorder sections and add new ones

**Files:**
- `components/wireframe/add-section-button.tsx`
- `components/wireframe/section-picker.tsx`

**Tasks:**
- [ ] Integrate @dnd-kit for drag
- [ ] Implement section reordering
- [ ] Visual feedback (ghost, drop indicator)
- [ ] Sync order between viewports
- [ ] Build add-section-button
- [ ] Build section-picker popup
- [ ] Category buttons in picker
- [ ] Search in picker
- [ ] "Suggest section" AI button
- [ ] Delete section (keyboard + button)

---

### Phase 7: Generation & Polish (5-6 days)

**Goal:** AI generation, shuffle, global sections, polish

**Files:**
- `app/api/wireframe/generate/route.ts`
- `lib/ai/prompts/wireframe-generation.ts`

**Tasks:**
- [ ] Build wireframe generation API
- [ ] Skeleton loading animation
- [ ] Progress indicator with stop
- [ ] Page-level "Generate copy"
- [ ] Section-level "Generate copy"
- [ ] "Shuffle components" randomization
- [ ] Global section toggle
- [ ] Global section sync across pages
- [ ] Empty state polish
- [ ] Loading states everywhere
- [ ] Error handling (toasts)
- [ ] Undo/Redo implementation
- [ ] Keyboard shortcuts

---

### Phase 8: Persistence (3-4 days)

**Goal:** Save and load wireframe data

**Tasks:**
- [ ] Add wireframeData to Appwrite schema
- [ ] Update project types
- [ ] Implement save on changes (immediate)
- [ ] Load wireframe on project open
- [ ] Handle sitemap → wireframe transform
- [ ] Sync sitemap changes to wireframe
- [ ] Handle section add/remove from sitemap

---

## 16. Summary

| Phase | Focus | Days |
|-------|-------|------|
| 1 | Wireframe View & Frames | 3-4 |
| 2 | Section Blocks | 4-5 |
| 3 | Left Sidebar Panels | 5-6 |
| 4 | Component Library | 6-7 |
| 5 | Inline Editing | 5-6 |
| 6 | Drag & Drop | 4-5 |
| 7 | Generation & Polish | 5-6 |
| 8 | Persistence | 3-4 |
| **Total** | | **35-43 days** |

---

## 17. API Endpoints

| Endpoint | Method | Phase | Purpose |
|----------|--------|-------|---------|
| `/api/wireframe/generate` | POST | 7 | Generate wireframe for page |
| `/api/ai/rewrite-text` | POST | 5 | AI text transformations |
| `/api/ai/suggest-section` | POST | 6 | AI section suggestion |
| `/api/projects/[id]` | PATCH | 8 | Save wireframe data |

---

## 18. Key Takeaways

**Reusing Existing Infrastructure:**
- Canvas zoom/pan (already built for sitemap)
- Left sidebar show/hide behavior (already built)
- Bottom bar with zoom controls (already built)
- Selection and keyboard shortcuts patterns

**New for Wireframe:**
- Page frames with Desktop + Mobile viewports
- Section blocks with placeholders
- Inline content editing with AI
- Component library for swapping layouts
- Section-specific controls

**UI Libraries to Use:**
- **Shadcn/ui** - All form inputs, buttons, dialogs, menus
- **Lucide React** - All icons
- **@dnd-kit** - Drag and drop (already installed)
- **Tailwind CSS** - All styling

**Design System:**
- Colors: Gray scale for wireframes, violet for selection/accent
- Typography: Inter font, consistent sizing
- Spacing: 4px base unit (Tailwind default)
- Border radius: 8px for cards, 4px for inputs
- Shadows: sm for cards, lg for floating elements
