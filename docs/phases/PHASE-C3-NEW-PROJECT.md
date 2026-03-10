# Phase C3 — Enhanced New Project Page# Phase C3 — Enhanced New Project Page
































































































































- Store attachments in Appwrite Storage- Navigate with `router.push()` instead of `window.location.href`- Use `authFetch()` for API calls- Actually handle file uploads for attachments- Actually call the sitemap generation API (if toggle is on)- Actually create a project in AppwriteThe demo is a visual mockup. The real implementation will:## Differences from Demo| `src/store/project-store.ts` | **Update** createProject to accept productType || `src/types/index.ts` | **Add** `productType: 'web' \| 'app'` to Project schema || `src/app/dashboard/new/page.tsx` | **Rewrite** — replace current simple form with new design ||------|--------|| File | Action |## File Changes```}    router.push(`/project/${project.id}`)    // 3. Redirect to workspace    }        await generateSitemap(project.id, input)    if (sitemapOn) {    // 2. If sitemapOn, generate sitemap first    })        productType,        description: input,        name: inferProjectName(input),    const project = await projectStore.createProject({    // 1. Create project in Appwrite    setIsGenerating(true)const handleGenerate = async () => {```typescript### On Generate   - Each chip: `rounded-full border bg-card/50` → clicking fills the textarea   - App: Dashboard App, Social Mobile App, CRM Platform   - Web: SaaS Landing Page, Portfolio Website, E-commerce Store6. **Suggestion Chips** — Filtered by product type5. **Active Options Indicator** — Below input: "Type: **Website** · Sitemap: **On** · 2 attachments"   - `bg-muted/60 text-xs rounded-lg border border-border/40`   - Each attachment: pill with icon + filename + X button to remove4. **Attachments Preview** — Rendered between textarea content and toolbar   - **Generate** button — `bg-foreground text-background rounded-xl`, disabled when empty, shows spinner when generating   - Spacer   - **Sitemap** toggle — when ON: `bg-accent/10 text-accent border border-accent/20` with checkmark icon   - Vertical divider (`w-px h-5 bg-border/60`)   - **Attach** button → dropdown menu with "Reference Image" + "Document" options3. **Bottom Toolbar** (inside textarea border, positioned absolute bottom)   - `focus` on mount   - `Enter` submits (generates), `Shift+Enter` adds newline     - App: "A project management app with Kanban boards, team chat, file sharing, and analytics dashboard..."     - Web: "A SaaS platform for managing freelance projects with time tracking, invoicing, and client portal..."   - Dynamic placeholder based on product type:2. **Textarea** — Large, auto-resizing, max 200px height   - Selecting `Website` sets `sitemapOn = true`, selecting `App` sets `sitemapOn = false`   - Styled as a pill toggle: `bg-muted/60 rounded-xl p-1 border` with active item having `bg-card shadow-sm`1. **Product Type Toggle** — `Website` (Globe icon) | `App` (Smartphone icon)### Key Behaviors```const [isGenerating, setIsGenerating] = useState(false)const [showAttachMenu, setShowAttachMenu] = useState(false)const [attachments, setAttachments] = useState<File[]>([])const [sitemapOn, setSitemapOn] = useState(true)      // Web defaults ON, App defaults OFFconst [productType, setProductType] = useState<'web' | 'app'>('web')const [input, setInput] = useState('')```typescript### State```└──────────────────────────────────────────────────┘│                                                  ││  └─────────────────┘ └─────────────────┘        ││  │ SaaS Landing    │ │ Portfolio        │ ...    │  ← suggestion chips│  ┌─────────────────┐ ┌─────────────────┐        ││                                                  ││  Type: Website · Sitemap: On · 2 attachments     │  ← active options indicator│                                                  ││  └──────────────────────────────────────────┘    ││  │  📎 Attach  │  🗺 Sitemap ✓    Generate ↑│    │  ← bottom toolbar│  │                                          │    ││  │                                          │    ││  │ and client portal...                     │    ││  │ projects with time tracking, invoicing,  │    ││  │ A SaaS platform for managing freelance   │    │  ← textarea (auto-resize)│  ┌──────────────────────────────────────────┐    ││                                                  ││           [ Website ]  [ App ]                   │  ← product type toggle│                                                  ││              to life on canvas.                   ││     Describe your idea and we'll bring it        ││         What do you want to build?               ││              ✨ (gradient icon)                   ││                                                  │├──────────────────────────────────────────────────┤│  ← Back                                 ⚡ Scytle │  ← header bar┌──────────────────────────────────────────────────┐```### Layout## Design Spec (from Demo)Replace the existing project creation page with an enhanced "what do you want to build?" experience. The user describes their idea, picks a product type, optionally enables sitemap generation, and can attach reference files.## Purpose> **Target**: `src/app/dashboard/new/page.tsx` (rewrite)> **Demo**: `src/app/demo/flow/new-project/page.tsx` (250 LOC)> **Dependencies**: None for UI; C2 for actual generation> **Priority**: Medium — entry point for the new flow> **Status**: 🔲 Not started
> **Status**: 🔲 Not started
> **Priority**: Medium — entry point to the new flow
> **Dependencies**: None (UI only, wires to C2+C6 later)
> **Demo reference**: `/demo/flow/new-project/page.tsx` (250 LOC)
> **Target file**: `src/app/dashboard/new/page.tsx` (rewrite existing)

## Purpose

Replace the existing new project page with a richer creation experience. Users describe their idea, choose product type (Web/App), toggle sitemap generation, and optionally attach reference images.

## UI Spec (from demo)

### Layout

```
┌─────────────────────────────────────────────────┐
│  ← Back                              ⚡ Scytle  │  ← Header (h-14)
├─────────────────────────────────────────────────┤
│                                                  │
│              ✨ (accent gradient icon)            │
│        What do you want to build?                │
│    Describe your idea and we'll bring it to life │
│                                                  │
│           [ Website ]  [ App ]                   │  ← Product type toggle
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │ A SaaS platform for managing freelance      │ │  ← Textarea with
│  │ projects with time tracking, invoicing...   │ │     dynamic placeholder
│  │                                             │ │
│  │                                             │ │
│  │  📎 Attach │ 🗺️ Sitemap ✓      Generate ↑ │ │  ← Bottom toolbar
│  └─────────────────────────────────────────────┘ │
│                                                  │
│     Type: Website · Sitemap: On · 2 attachments  │  ← Active options
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │  ← Suggestion chips
│  │SaaS Land.│ │Portfolio │ │E-commerce│        │
│  └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────┘
```

### State

```typescript
const [input, setInput] = useState('')
const [productType, setProductType] = useState<'web' | 'app'>('web')
const [sitemapOn, setSitemapOn] = useState(true)          // Web defaults ON, App defaults OFF
const [attachments, setAttachments] = useState<File[]>([])
const [showAttachMenu, setShowAttachMenu] = useState(false)
const [isGenerating, setIsGenerating] = useState(false)
```

### Components

#### Product Type Toggle
- Two-button pill: `Website` (Globe icon) | `App` (Smartphone icon)
- Contained in `bg-muted/60 rounded-xl p-1 border border-border/40`
- Active option: `bg-card text-foreground shadow-sm`
- Switching to Web → `setSitemapOn(true)`, switching to App → `setSitemapOn(false)`

#### Main Textarea
- `rounded-2xl border border-border bg-card shadow-sm`
- Focus state: `border-accent/40 shadow-accent/5`
- Dynamic placeholder based on `productType`:
  - Web: "A SaaS platform for managing freelance projects with time tracking, invoicing..."
  - App: "A project management app with Kanban boards, team chat, file sharing..."
- Enter to submit, Shift+Enter for newline
- Auto-resize up to `max-h-50`

#### Bottom Toolbar (inside textarea, absolute bottom)
- **Left side**:
  - `📎 Attach` button → dropdown with "Reference Image" + "Document"
  - Vertical divider
  - `🗺️ Sitemap` toggle button — accent colored when ON with checkmark icon
- **Right side**:
  - `Generate ↑` button — `bg-foreground text-background rounded-xl`
  - Disabled when input is empty or generating
  - Shows spinner during generation

#### Attachment Preview
- Shown between textarea content and bottom toolbar
- Each attachment: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60`
- Icon + filename + X button to remove

#### Suggestion Chips
- Filtered by `productType` (3 per type)
- Web: "SaaS Landing Page", "Portfolio Website", "E-commerce Store"
- App: "Dashboard App", "Social Mobile App", "CRM Platform"
- Each chip: `rounded-full border border-border/70 bg-card/50`
- Click → fills the textarea with the label

#### Active Options Indicator
- Below textarea: "Type: **Website** · Sitemap: **On** · 2 attachments"
- Muted text, sitemap colored accent when on

### Submit Flow

1. User clicks Generate or presses Enter
2. `isGenerating = true`, show spinner
3. Create project in Appwrite via `projectStore.createProject()`
4. If `sitemapOn`:
   - Call `/api/ai/generate-sitemap` with prompt + productType
   - Wait for sitemap response
5. Redirect to `/project/[id]` (workspace)
6. Workspace loads with sitemap nodes on canvas (if generated) or empty canvas with chat ready

## File Structure

```
src/app/dashboard/new/
  page.tsx                ← Rewritten new project page ('use client')
```

## What Changes From Demo

The demo is a visual mockup. The real implementation needs:
- Real Appwrite project creation
- Real file uploads for attachments (Appwrite Storage)
- Real AI sitemap generation call
- Real router navigation to `/project/[id]`
- Loading states and error handling
- Auth check (redirect to login if not authenticated)
