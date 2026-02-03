# Scytle - AI Product Studio

## Overview

**Scytle** is an AI-powered product development platform that takes users from initial idea through research, design, and deployment. The interface splits between a persistent **chat sidebar** (AI guidance) and a **canvas workspace** (visual editing).

**Tech Stack**:
- **Framework**: Next.js 15 (App Router), React 19, TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 with CSS variables for theming
- **State**: Zustand with immer middleware
- **Backend**: Appwrite (auth, database, storage)
- **AI**: Google Gemini 2.0 Flash via `@google/generative-ai`
- **Canvas**: ReactFlow (`@xyflow/react`) for sitemap visualization
- **Validation**: Zod schemas for all data structures
- **UI**: Radix UI primitives (shadcn/ui pattern)


---

## Project Structure

```
scytle/
├── src/
│   ├── app/
│   │   ├── api/                         # JWT-authenticated API routes
│   │   │   ├── chat/route.ts            # AI streaming responses
│   │   │   ├── projects/route.ts        # Project CRUD
│   │   │   └── ai/generate-*/           # AI generation endpoints
│   │   ├── dashboard/                   # Project list & management
│   │   ├── project/[id]/page.tsx        # Main workspace (chat + canvas)
│   │   ├── login|signup/                # Appwrite auth pages
│   │   └── page.tsx                     # Landing page
│   ├── components/
│   │   ├── chat/                        # Chat sidebar (1/3 width)
│   │   ├── canvas/                      # Canvas workspace (2/3 width)
│   │   │   ├── sitemap-view.tsx         # ReactFlow sitemap editor
│   │   │   ├── nodes/                   # Custom ReactFlow nodes
│   │   │   └── left-sidebar/            # Canvas left panel
│   │   └── ui/                          # Radix UI components (shadcn)
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts                # Gemini API wrapper
│   │   │   └── config.ts                # Prompts & model config
│   │   ├── appwrite.ts                  # Client SDK (auth)
│   │   ├── appwrite-server.ts           # Server SDK (admin operations)
│   │   └── utils.ts                     # cn(), formatDate(), etc.
│   ├── store/
│   │   ├── auth-store.ts                # User session
│   │   ├── project-store.ts             # Current project state
│   │   ├── chat-store.ts                # Conversation history
│   │   └── sitemap-store.ts             # Canvas state (zoom, nodes, edges)
│   └── types/
│       └── index.ts                     # Zod schemas + TypeScript types
└── docs/
    ├── SCYTLE-BUILD-PHASES.md           # 8-phase implementation plan
    └── SCYTLE-UX-FLOW.md                # Complete UX scenarios
```

---

## Critical Patterns

### 1. Authentication Flow

**Client-Side (Appwrite SDK)**:
```typescript
// lib/appwrite.ts - Client SDK for authentication
import { Client, Account, Databases } from 'appwrite'

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

export const account = new Account(client)
export const databases = new Databases(client)

// Usage in components
const jwt = await account.createJWT()
```

**Server-Side (Admin SDK)**:
```typescript
// lib/appwrite-server.ts - Server SDK for database operations
import { Client, Users, Databases } from 'node-appwrite'

export function createAdminClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
        .setKey(process.env.APPWRITE_API_KEY!)
    
    return { 
        users: new Users(client),
        databases: new Databases(client)
    }
}

// Validate JWT in API routes
export async function getUserFromJWT(authHeader: string | null) {
    // Extract and verify JWT, return user or null
}
```

**API Route Pattern** (see [src/app/api/chat/route.ts](scytle/src/app/api/chat/route.ts)):
```typescript
export async function POST(request: NextRequest) {
    // 1. Authenticate
    const user = await getUserFromJWT(request.headers.get('Authorization'))
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    // 2. Validate with Zod
    const validation = ChatMessageSchema.safeParse(await request.json())
    if (!validation.success) return NextResponse.json({ error: ... }, { status: 400 })
    
    // 3. Verify ownership
    const project = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROJECTS, projectId)
    if (project.userId !== user.$id) return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    
    // 4. Process request
}
```

### 2. State Management (Zustand + Immer)

All stores use **Zustand with immer** for immutable updates:

```typescript
// store/project-store.ts
export const useProjectStore = create<ProjectState>()(
    immer((set, get) => ({
        projects: [],
        currentProject: null,
        
        fetchProject: async (id: string) => {
            set(state => {
                state.isLoading = true  // Direct mutation with immer
                state.error = null
            })
            
            const response = await authFetch(`/api/projects/${id}`)
            const data = await response.json()
            
            set(state => {
                state.currentProject = data.project
                state.isLoading = false
            })
        }
    }))
)
```

**Helper for authenticated fetches**:
```typescript
async function authFetch(url: string, options: RequestInit = {}) {
    const jwt = await createJWT()
    if (!jwt) throw new Error('Not authenticated')
    
    return fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${jwt.jwt}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    })
}
```

### 3. Type Safety with Zod

**All data structures defined in [src/types/index.ts](scytle/src/types/index.ts)**:
```typescript
import { z } from 'zod'

// Define schema
export const ProjectSchema = z.object({
    projectId: z.string(),
    userId: z.string(),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    status: z.enum(['draft', 'in-progress', 'completed']).default('draft'),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
})

// Infer TypeScript type
export type Project = z.infer<typeof ProjectSchema>

// Input schemas for API validation
export const CreateProjectSchema = ProjectSchema.pick({
    name: true,
    description: true
})
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>
```

**Usage in API routes**: Always validate with `.safeParse()` and return structured errors.

### 4. AI Integration (Gemini)

**Configuration** ([src/lib/ai/config.ts](scytle/src/lib/ai/config.ts)):
```typescript
export const AI_CONFIG = {
    models: {
        fast: 'gemini-2.0-flash',      // Default for chat
        balanced: 'gemini-2.5-flash',
        powerful: 'gemini-2.5-pro'     // For complex reasoning
    },
    generation: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192
    },
    context: {
        maxHistoryMessages: 20,        // Limit conversation history
        maxContextTokens: 32000
    }
}

export const SYSTEM_PROMPTS = {
    default: "You are Scytle, an AI product consultant...",
    think: "You are in THINK mode. Ask 2-3 clarifying questions...",
    research: "You are in RESEARCH mode. Analyze competitors...",
    // ... phase-specific prompts
}
```

**Streaming responses** ([src/lib/ai/client.ts](scytle/src/lib/ai/client.ts)):
```typescript
export async function* generateStream(
    message: string,
    history: ChatMessage[] = [],
    options: GenerateOptions = {}
): AsyncGenerator<StreamChunk> {
    const model = getModel(options.model)
    const prompt = buildPrompt(message, history, options.systemPrompt)
    
    const result = await model.generateContentStream(prompt)
    
    for await (const chunk of result.stream) {
        const text = chunk.text()
        yield { text, done: false }
    }
    
    yield { text: '', done: true }
}
```

---

### 5. Sitemap Generation System (Core Feature)

**Philosophy**: Leverage Gemini's training knowledge of industry patterns, competitor flows, and best practices. No database storage for patterns, no web scraping - the AI model already knows.

#### User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. USER INPUT                                                           │
│    "I want to build a food delivery app"                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. AI ANALYSIS (using training knowledge)                               │
│    - Identifies industry: food-delivery marketplace                     │
│    - Knows competitors: Uber Eats, DoorDash, Grubhub, Deliveroo        │
│    - Understands typical flow: Browse → Order → Track → Review         │
│    - Knows common pages & sections for this industry                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. CLARIFYING QUESTIONS (minimal, in chat)                              │
│    Only ask what's NEEDED to generate accurate sitemap:                 │
│    - "Is this for customers, restaurants, or both?"                     │
│    - "MVP or full platform?"                                            │
│    DO NOT ask about features - AI infers from industry patterns         │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ 4. USER CLICKS "Generate Sitemap"                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ 5. AI GENERATES COMPLETE SITEMAP                                        │
│    - Hierarchical pages (parent-child relationships)                    │
│    - Each page has detailed sections (Relume-style)                     │
│    - Sections have name + description with specific UI elements         │
│    - Global sections (Navbar, Footer) on all pages                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ 6. REACTFLOW RENDERS SITEMAP                                            │
│    - Project node at root                                               │
│    - Page nodes showing sections with descriptions                      │
│    - Edges showing hierarchy                                            │
│    - Full editing capabilities (add/remove/edit/reorder)                │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Output Format (Relume-Style)

The AI generates JSON that maps directly to ReactFlow nodes:

```typescript
interface SitemapOutput {
    projectName: string
    pages: PageOutput[]
}

interface PageOutput {
    id: string                    // Unique ID for ReactFlow
    name: string                  // "Home", "Restaurant Page"
    slug: string                  // "/", "/restaurant/[id]"
    parentId: string | null       // For hierarchy
    order: number                 // Sort order among siblings
    sections: SectionOutput[]
}

interface SectionOutput {
    id: string
    type: string                  // Dynamic, AI-generated type
    name: string                  // "Hero Header Section"
    description: string           // "Engaging hero with search bar, location input..."
}
```

**Example AI Output**:
```json
{
  "projectName": "Food Delivery App",
  "pages": [
    {
      "id": "home",
      "name": "Home",
      "slug": "/",
      "parentId": null,
      "order": 0,
      "sections": [
        {
          "id": "home-navbar",
          "type": "navbar",
          "name": "Navbar",
          "description": "Logo, location selector, search, cart icon, and login/signup"
        },
        {
          "id": "home-hero",
          "type": "hero-search",
          "name": "Hero Header Section",
          "description": "Engaging hero section highlighting fast, convenient food delivery with a search bar for restaurants and cuisines"
        },
        {
          "id": "home-features",
          "type": "features-list",
          "name": "Features List Section",
          "description": "List of key features such as real-time tracking, secure payments, and wide restaurant selection"
        },
        {
          "id": "home-footer",
          "type": "footer",
          "name": "Footer",
          "description": "Links to about, careers, partner with us, and social media"
        }
      ]
    },
    {
      "id": "restaurants",
      "name": "Restaurants",
      "slug": "/restaurants",
      "parentId": "home",
      "order": 0,
      "sections": [
        {"id": "restaurants-navbar", "type": "navbar", "name": "Navbar", "description": "..."},
        {"id": "restaurants-header", "type": "header-section", "name": "Header Section", "description": "Introductory header inviting users to discover partner restaurants available for delivery"},
        {"id": "restaurants-list", "type": "ecommerce-products-list", "name": "Ecommerce Products List Section", "description": "Grid of restaurant cards with images, cuisine type, rating, delivery time, and minimum order"},
        {"id": "restaurants-faq", "type": "faq", "name": "FAQ Section", "description": "Frequently asked questions about ordering, delivery, and restaurant selection"},
        {"id": "restaurants-footer", "type": "footer", "name": "Footer", "description": "..."}
      ]
    },
    {
      "id": "restaurant-page",
      "name": "Restaurant Page",
      "slug": "/restaurant/[id]",
      "parentId": "restaurants",
      "order": 0,
      "sections": [
        {"id": "rp-navbar", "type": "navbar", "name": "Navbar", "description": "..."},
        {"id": "rp-header", "type": "ecommerce-product-header", "name": "Ecommerce Product Header Section", "description": "Restaurant hero with name, cuisine type, rating, delivery time, and prominent order CTA"},
        {"id": "rp-menu", "type": "ecommerce-product-section", "name": "Ecommerce Product Section", "description": "Menu categories with items showing images, prices, and add-to-cart buttons"},
        {"id": "rp-reviews", "type": "reviews-section", "name": "Reviews Section", "description": "Customer reviews with ratings, photos, and helpful votes"},
        {"id": "rp-gallery", "type": "gallery", "name": "Gallery Section", "description": "Photo gallery showcasing the restaurant interior and signature dishes"},
        {"id": "rp-footer", "type": "footer", "name": "Footer", "description": "..."}
      ]
    },
    {
      "id": "blog",
      "name": "Blog",
      "slug": "/blog",
      "parentId": "home",
      "order": 1,
      "sections": [...]
    },
    {
      "id": "blog-post",
      "name": "Blog Post",
      "slug": "/blog/[slug]",
      "parentId": "blog",
      "order": 0,
      "sections": [...]
    },
    {
      "id": "contact",
      "name": "Contact Us",
      "slug": "/contact",
      "parentId": "home",
      "order": 2,
      "sections": [...]
    }
  ]
}
```

#### Sitemap Generation Prompt

```typescript
// lib/ai/prompts/sitemap.ts

export const SITEMAP_GENERATION_PROMPT = `
You are an expert product designer with comprehensive knowledge of every industry.

USER'S PRODUCT: {{productDescription}}
CONTEXT: {{userContext}}

YOUR TASK:
Using your knowledge of this industry's best practices and competitor patterns:

1. **Analyze the Industry**
   - What type of product is this? (SaaS, marketplace, e-commerce, etc.)
   - Who are the major players? (Use this knowledge, don't list them)
   - What's the typical end-to-end user journey?

2. **Generate Complete Sitemap**
   - Create all essential pages with proper hierarchy
   - Include child pages where needed (e.g., Blog → Blog Post)
   - Every page must have Navbar and Footer sections

3. **Detail Each Section (Relume-style)**
   - Section name: Clear, descriptive title
   - Section description: Specific UI elements and purpose
   - Be specific: "Search bar with location input and cuisine filter" NOT "search functionality"

RULES:
- Generate 5-12 pages depending on complexity
- Each page should have 4-8 sections
- Navbar and Footer on EVERY page
- Parent-child relationships for related pages
- Descriptions should mention specific UI elements
- Think like industry leaders - what patterns do they all use?

OUTPUT FORMAT (JSON only, no markdown):
{
  "projectName": "string",
  "pages": [
    {
      "id": "unique-kebab-case",
      "name": "Display Name",
      "slug": "/url-path",
      "parentId": "parent-id or null",
      "order": 0,
      "sections": [
        {
          "id": "unique-section-id",
          "type": "kebab-case-type",
          "name": "Section Display Name",
          "description": "Detailed description with specific UI elements"
        }
      ]
    }
  ]
}
`

export const CLARIFYING_QUESTIONS_PROMPT = `
User wants to build: "{{productDescription}}"

Determine if you need clarification to generate an accurate sitemap.

Ask 1-3 SHORT questions ONLY about:
- Target audience (if unclear): customers, businesses, or both?
- Scope (if unclear): MVP, full platform, or enterprise?
- Any industry-specific context needed?

DO NOT ask about features - you will infer those from industry patterns.

If the description is already clear, respond with ready: true.

OUTPUT (JSON only):
{
  "ready": boolean,
  "summary": "Brief summary if ready",
  "questions": ["Question 1?", "Question 2?"]
}
`
```

#### Converting to ReactFlow Nodes

```typescript
// lib/sitemap/converter.ts

interface ReactFlowNode {
    id: string
    type: 'project' | 'page'
    position: { x: number, y: number }
    data: {
        label: string
        slug?: string
        sections?: SectionOutput[]
    }
}

interface ReactFlowEdge {
    id: string
    source: string
    target: string
    type: 'sitemap'
}

function convertSitemapToReactFlow(sitemap: SitemapOutput): {
    nodes: ReactFlowNode[]
    edges: ReactFlowEdge[]
} {
    const nodes: ReactFlowNode[] = []
    const edges: ReactFlowEdge[] = []
    
    // 1. Add project node at root
    nodes.push({
        id: 'project',
        type: 'project',
        position: { x: 0, y: 0 },
        data: { label: sitemap.projectName }
    })
    
    // 2. Add page nodes
    for (const page of sitemap.pages) {
        nodes.push({
            id: page.id,
            type: 'page',
            position: { x: 0, y: 0 },  // Auto-layout will position
            data: {
                label: page.name,
                slug: page.slug,
                sections: page.sections
            }
        })
        
        // 3. Add edges for hierarchy
        const parentId = page.parentId || 'project'
        edges.push({
            id: `edge-${parentId}-${page.id}`,
            source: parentId,
            target: page.id,
            type: 'sitemap'
        })
    }
    
    // 4. Apply auto-layout (tree structure)
    return applyTreeLayout(nodes, edges)
}
```

#### Page Node Component (Relume-style)

```typescript
// components/canvas/nodes/page-node.tsx

export function PageNode({ data, selected }: NodeProps<PageNodeData>) {
    const { updateNode, deleteNode, addSection, removeSection, reorderSections } = useSitemapStore()
    
    return (
        <div className={cn(
            "bg-white border-2 rounded-lg shadow-sm min-w-[280px] max-w-[320px]",
            selected && "border-blue-500 ring-2 ring-blue-200"
        )}>
            {/* Page Header */}
            <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
                <input
                    value={data.label}
                    onChange={(e) => updateNode(data.id, { label: e.target.value })}
                    className="font-medium text-sm bg-transparent border-none focus:outline-none"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => addChildPage(data.id)}>
                            Add child page
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteNode(data.id)}>
                            Delete page
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            {/* Sections List */}
            <div className="p-2 space-y-1.5 max-h-[400px] overflow-y-auto">
                {data.sections?.map((section, index) => (
                    <div
                        key={section.id}
                        className={cn(
                            "p-2 rounded border text-xs cursor-pointer hover:border-blue-300",
                            section.type === 'navbar' || section.type === 'footer'
                                ? "bg-green-50 border-green-200"  // Global sections highlighted
                                : "bg-gray-50 border-gray-200"
                        )}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={() => handleDragOver(index)}
                        onDragEnd={handleDragEnd}
                    >
                        <div className="font-medium text-gray-900 flex items-center gap-1">
                            {section.type === 'navbar' && <Globe className="h-3 w-3 text-green-600" />}
                            {section.name}
                        </div>
                        <div className="text-gray-500 mt-0.5 line-clamp-2">
                            {section.description}
                        </div>
                    </div>
                ))}
                
                {/* Add Section Button */}
                <button
                    onClick={() => openAddSectionPanel(data.id)}
                    className="w-full p-2 border-2 border-dashed border-gray-300 rounded 
                               text-gray-400 hover:border-blue-400 hover:text-blue-500 
                               flex items-center justify-center gap-1"
                >
                    <Plus className="h-3 w-3" />
                    Add Section
                </button>
            </div>
            
            {/* Connection Handles */}
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
}
```

#### Left Sidebar (Section Categories)

Like Relume's left panel - categories of sections to drag onto pages:

```typescript
// components/canvas/left-sidebar/section-panel.tsx

const SECTION_CATEGORIES = [
    {
        name: "Global Sections",
        sections: [
            { type: "navbar", name: "Navbar", description: "Site navigation" },
            { type: "footer", name: "Footer", description: "Site footer" }
        ]
    },
    {
        name: "Hero Sections",
        sections: [
            { type: "hero-simple", name: "Hero Simple", description: "Headline + CTA" },
            { type: "hero-search", name: "Hero with Search", description: "Search-focused hero" },
            { type: "hero-split", name: "Hero Split", description: "50/50 text and image" }
        ]
    },
    {
        name: "Content Sections",
        sections: [
            { type: "features-grid", name: "Features Grid", description: "Grid of feature cards" },
            { type: "features-list", name: "Features List", description: "Vertical feature list" },
            { type: "benefits", name: "Benefits", description: "Benefits showcase" },
            { type: "stats", name: "Stats", description: "Key statistics" }
        ]
    },
    {
        name: "Social Proof",
        sections: [
            { type: "testimonials", name: "Testimonials", description: "Customer quotes" },
            { type: "logos", name: "Logo Cloud", description: "Partner/client logos" },
            { type: "reviews", name: "Reviews", description: "Star ratings and reviews" }
        ]
    },
    {
        name: "Commerce",
        sections: [
            { type: "product-grid", name: "Product Grid", description: "Product listing" },
            { type: "product-header", name: "Product Header", description: "Product detail hero" },
            { type: "pricing", name: "Pricing", description: "Pricing tiers" }
        ]
    },
    {
        name: "Conversion",
        sections: [
            { type: "cta", name: "CTA", description: "Call to action" },
            { type: "contact-form", name: "Contact Form", description: "Contact form" },
            { type: "newsletter", name: "Newsletter", description: "Email signup" }
        ]
    },
    {
        name: "Blog",
        sections: [
            { type: "blog-list", name: "Blog List", description: "Article grid" },
            { type: "blog-header", name: "Blog Header", description: "Post header" },
            { type: "blog-body", name: "Blog Body", description: "Post content" }
        ]
    },
    {
        name: "Utility",
        sections: [
            { type: "faq", name: "FAQ", description: "Accordion FAQ" },
            { type: "gallery", name: "Gallery", description: "Image gallery" },
            { type: "team", name: "Team", description: "Team members" }
        ]
    }
]

export function SectionPanel() {
    const [search, setSearch] = useState('')
    const { addSectionToPage, selectedNodeId } = useSitemapStore()
    
    const filteredCategories = useMemo(() => {
        if (!search) return SECTION_CATEGORIES
        return SECTION_CATEGORIES.map(cat => ({
            ...cat,
            sections: cat.sections.filter(s => 
                s.name.toLowerCase().includes(search.toLowerCase())
            )
        })).filter(cat => cat.sections.length > 0)
    }, [search])
    
    return (
        <div className="w-64 border-r bg-white h-full flex flex-col">
            <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Add</span>
                    <button onClick={closePanel}>
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <Input
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            <ScrollArea className="flex-1">
                {filteredCategories.map(category => (
                    <div key={category.name} className="p-2">
                        <div className="text-xs font-medium text-gray-500 mb-2">
                            {category.name}
                        </div>
                        {category.sections.map(section => (
                            <button
                                key={section.type}
                                onClick={() => addSectionToPage(selectedNodeId, section)}
                                className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-100 text-left"
                            >
                                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                    <SectionIcon type={section.type} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{section.name}</div>
                                </div>
                                <Plus className="h-4 w-4 ml-auto text-gray-400" />
                            </button>
                        ))}
                    </div>
                ))}
            </ScrollArea>
        </div>
    )
}
```

#### Edit Capabilities

All editing happens directly in the canvas:

| Action | How |
|--------|-----|
| **Add page** | Right-click canvas → "Add page" or use toolbar |
| **Add child page** | Page menu → "Add child page" |
| **Delete page** | Page menu → "Delete" or `Delete` key |
| **Edit page name** | Click page header to edit inline |
| **Add section** | Click "Add Section" in page or drag from sidebar |
| **Remove section** | Hover section → click X |
| **Reorder sections** | Drag and drop within page |
| **Edit section** | Click section to open detail panel |
| **Reparent page** | Drag page to new parent |

---

### 6. Workspace Layout Pattern

**Main Editor Page** ([src/app/project/[id]/page.tsx](scytle/src/app/project/[id]/page.tsx)):
```typescript
export default function ProjectEditorPage() {
    const [activeView, setActiveView] = useState<CanvasView>('sitemap')
    const [isDevMode, setIsDevMode] = useState(false)
    
    return (
        <AppShell>
            {/* Top Bar: View Switcher (Relume-style tabs) */}
            <Tabs value={activeView} onValueChange={setActiveView}>
                <TabsList>
                    <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
                    <TabsTrigger value="wireframe">Wireframe</TabsTrigger>
                    <TabsTrigger value="design">Design</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
            </Tabs>
            
            {/* Main Layout: Chat (1/3) + Canvas (2/3) */}
            <div className="flex h-full">
                <ChatSidebar projectId={projectId} className="w-1/3" />
                <div className="flex-1 relative">
                    {activeView === 'sitemap' && <SitemapView />}
                    {activeView === 'wireframe' && <WireframeView />}
                    {/* ... other views */}
                    
                    {/* Bottom Toolbar: Tools (Figma-style) */}
                    <Toolbar />
                </div>
            </div>
        </AppShell>
    )
}
```

---

## Development Workflow

### Running the Project

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # TypeScript strict build
npm run lint             # ESLint validation
```

### Environment Setup

Required environment variables in `.env.local`:
```bash
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<project-id>
NEXT_PUBLIC_APPWRITE_DATABASE_ID=scytle_db
APPWRITE_API_KEY=<admin-api-key>

# Gemini AI
GEMINI_API_KEY=<gemini-api-key>
```

### Appwrite Collections

Database ID: `scytle_db`

Collections (see [src/lib/appwrite.ts](scytle/src/lib/appwrite.ts)):
- `users` - User profiles
- `projects` - Project metadata
- `pages` - Page hierarchy (sitemap nodes)
- `sections` - Page sections (hero, features, etc.)
- `style_guides` - Design tokens (colors, fonts, spacing)
- `research_data` - Competitor analysis
- `ai_conversations` - Chat history

### Creating New Components

**UI Components** (Radix UI with Tailwind):
```typescript
// components/ui/new-component.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface NewComponentProps 
    extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outline'
}

export const NewComponent = React.forwardRef<
    HTMLDivElement,
    NewComponentProps
>(({ className, variant = 'default', ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "base-classes",
                variant === 'outline' && "outline-classes",
                className
            )}
            {...props}
        />
    )
})
NewComponent.displayName = 'NewComponent'
```

**Feature Components**:
- Place in `components/[feature-name]/`
- Export from `index.ts` for clean imports
- Use absolute imports: `import { Component } from '@/components/feature'`

### Adding API Routes

Follow the authentication pattern in [src/app/api/chat/route.ts](scytle/src/app/api/chat/route.ts):
1. Validate JWT with `getUserFromJWT()`
2. Parse/validate input with Zod schema
3. Verify resource ownership
4. Use `createAdminClient()` for database operations
5. Return structured JSON responses

---

## Conventions

### Code Style

- **TypeScript**: Strict mode, no `any` types
- **Components**: `PascalCase` for files and exports
- **Utilities**: `camelCase` for functions
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DATABASE_ID`, `COLLECTIONS`)
- **CSS**: Tailwind utility classes, CSS variables for theme colors
- **Imports**: Absolute imports with `@/` alias (configured in `tsconfig.json`)

### File Naming

```
components/
  feature-name/
    component-name.tsx    # PascalCase for components
    index.ts              # Re-export
  ui/
    button.tsx            # Single export per file
    
lib/
  utility-name.ts         # kebab-case for utilities
  
app/
  [dynamic]/              # Next.js dynamic routes
    page.tsx
    route.ts              # API routes
```

### Logging Convention

Use emoji prefixes for console logs:
- 🤖 AI operations
- 📦 Project operations
- ✅ Success
- ❌ Error
- ⚠️ Warning
- 🔄 State updates

Example:
```typescript
console.log('🤖 AI generation started')
console.error('❌ Failed to fetch project:', error)
console.warn('⚠️ APPWRITE_API_KEY not set')
```

### Component Patterns

**Client Components** (`'use client'`):
- Any component using hooks (useState, useEffect, etc.)
- Components accessing Zustand stores
- Event handlers (onClick, onChange, etc.)

**Server Components** (default):
- Pages without client-side state
- Data fetching at request time
- SEO-critical pages

**Middleware**: Minimal pass-through (Appwrite uses localStorage, not cookies)

---

## Key Documentation

- **Build Plan**: [docs/SCYTLE-BUILD-PHASES.md](scytle/docs/SCYTLE-BUILD-PHASES.md) - 8-phase implementation roadmap
- **UX Flows**: [docs/SCYTLE-UX-FLOW.md](scytle/docs/SCYTLE-UX-FLOW.md) - Complete user scenarios
- **Type Definitions**: [src/types/index.ts](scytle/src/types/index.ts) - All Zod schemas

---

## Common Tasks

### Adding a New Zustand Store

```typescript
// store/new-feature-store.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface NewFeatureState {
    data: SomeType[]
    isLoading: boolean
    
    fetchData: () => Promise<void>
    updateData: (id: string, updates: Partial<SomeType>) => void
}

export const useNewFeatureStore = create<NewFeatureState>()(
    immer((set, get) => ({
        data: [],
        isLoading: false,
        
        fetchData: async () => {
            set(state => { state.isLoading = true })
            // Fetch logic
            set(state => {
                state.data = fetchedData
                state.isLoading = false
            })
        },
        
        updateData: (id, updates) => {
            set(state => {
                const item = state.data.find(d => d.id === id)
                if (item) Object.assign(item, updates)
            })
        }
    }))
)

// Export from store/index.ts
export { useNewFeatureStore } from './new-feature-store'
```

### Creating a New API Endpoint

```typescript
// app/api/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT, createAdminClient, DATABASE_ID } from '@/lib/appwrite-server'
import { NewInputSchema } from '@/types'

export async function POST(request: NextRequest) {
    // 1. Auth
    const user = await getUserFromJWT(request.headers.get('Authorization'))
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // 2. Validate
    const body = await request.json()
    const validation = NewInputSchema.safeParse(body)
    if (!validation.success) {
        return NextResponse.json(
            { error: 'Invalid input', details: validation.error.issues },
            { status: 400 }
        )
    }
    
    // 3. Process
    const { databases } = createAdminClient()
    const result = await databases.createDocument(
        DATABASE_ID,
        'collection_id',
        'unique()',
        { userId: user.$id, ...validation.data }
    )
    
    return NextResponse.json({ success: true, data: result })
}
```

### Adding AI Prompts

Edit [src/lib/ai/config.ts](scytle/src/lib/ai/config.ts):
```typescript
export const SYSTEM_PROMPTS = {
    // ... existing prompts
    newPhase: `You are in NEW_PHASE mode.
    
    Your task: ...
    
    Output format: ...`,
}

export type SystemPromptKey = keyof typeof SYSTEM_PROMPTS
```

---

## Testing Strategy

Currently in development phase. Future testing approach:
- **Unit**: Jest for utility functions, Zod schema validation
- **Component**: React Testing Library for UI components
- **Integration**: API route testing with mock Appwrite client
- **E2E**: Playwright for critical user flows

---

## Architecture Decisions

### Why Appwrite?
- **Client-side auth**: No server session management needed
- **Real-time subscriptions**: For collaborative features (future)
- **Storage included**: For project assets and exports
- **Built-in user management**: Email/OAuth out of the box

### Why Zustand + Immer?
- **Minimal boilerplate**: Less verbose than Redux
- **Immer integration**: Direct state mutation with immutability
- **TypeScript-first**: Excellent type inference
- **No providers**: Direct hook access, simpler component tree

### Why ReactFlow?
- **Built for diagrams**: Perfect for sitemap visualization
- **Customizable**: Custom nodes, edges, handles
- **Performance**: Optimized for large graphs
- **TypeScript support**: Full type safety

### Why Gemini?
- **Cost-effective**: Lower pricing than GPT-4
- **Fast**: `gemini-2.0-flash` optimized for speed
- **Streaming**: Native support for token streaming
- **Context window**: 32K tokens for conversations

---

## Quick Reference

**Start developing**: `npm run dev` → Open http://localhost:3000  
**Add UI component**: Use pattern from [src/components/ui/button.tsx](scytle/src/components/ui/button.tsx)  
**Create API route**: Follow [src/app/api/chat/route.ts](scytle/src/app/api/chat/route.ts) authentication pattern  
**Add Zustand store**: Use immer middleware like [src/store/project-store.ts](scytle/src/store/project-store.ts)  
**Define types**: Add Zod schema in [src/types/index.ts](scytle/src/types/index.ts), infer TS type with `z.infer<>`

**Project Status**: Phase 1 complete (foundation, auth, canvas). Currently implementing AI chat and sitemap generation features.
- SEO: 90+

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Bundle Size:**
- Initial JS: < 300KB (gzipped)
- Initial CSS: < 50KB (gzipped)
- Total page weight: < 1MB

---

## Deployment

**Production Environment:**
- Hosting: Vercel
- Database: Appwrite Cloud
- CDN: Cloudflare
- Domain: scytle.ai

**Environment Variables:**
```bash
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=xxx
APPWRITE_API_KEY=xxx

# AI
OPENROUTER_API_KEY=xxx
GEMINI_API_KEY=xxx

# Stripe
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=xxx

# Analytics
NEXT_PUBLIC_GA_ID=xxx
SENTRY_DSN=xxx
```

---

## Resources

**Documentation:**
- [UX Flow](./docs/SCYTLE-UX-FLOW.md) - Complete user flow scenarios
- [Build Phases](./docs/SCYTLE-BUILD-PHASES.md) - 8-phase plan with 295 tasks
- [Skills Guide](https://www.anthropic.com/engineering/skills) - How skills work

**External References:**
- [Next.js Docs](https://nextjs.org/docs)
- [Appwrite Docs](https://appwrite.io/docs)
- [ReactFlow Docs](https://reactflow.dev)
- [Shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

**Inspiration:**
- [Relume](https://relume.io) - Sitemap → Wireframe workflow
- [v0.dev](https://v0.dev) - AI UI generation
- [Bolt.new](https://bolt.new) - Full-stack code generation

---

## Agent Behavior Guidelines

### When to Load Skills
**Frontend Task:** Load `frontend_aesthetics` + `scytle_patterns`
**Code Review:** Load `react_best_practices` + `web_design_guidelines`  
**Building Components:** Load `composition_patterns`
**Unfamiliar Task:** Ask user which skills to load

### Communication Style
- **Be concise**: 1-3 sentences for simple answers
- **Be specific**: Reference exact file paths, line numbers
- **Be proactive**: Suggest improvements, not just fixes
- **Be transparent**: Explain trade-offs, not just solutions

### Error Handling
- Always provide actionable error messages
- Include stack trace in development
- Log errors to Sentry in production
- Never expose sensitive data in errors

### Code Generation
- Generate complete, runnable code (no `// TODO` comments)
- Include TypeScript types
- Add JSDoc comments for public APIs
- Follow existing patterns in codebase
- Optimize for readability first, performance second

---

**Last Updated**: February 2, 2026  
**Version**: 3.0 (Multi-project workspace)  
**Maintainer**: Scytle Team

---

# OpenClaw (openclaw/)

> **For full details**, see `openclaw/CLAUDE.md` and `openclaw/AGENTS.md`.

## Overview

**OpenClaw** is a messaging gateway CLI that bridges AI agents to multiple chat platforms (WhatsApp, Telegram, Discord, Slack, Signal, iMessage, etc.).

## Key Commands

```bash
cd openclaw
pnpm install           # Install deps (Node 22+)
pnpm build             # TypeScript build (tsc)
pnpm lint              # Oxlint
pnpm test              # Vitest (70% coverage threshold)
pnpm openclaw ...      # Run CLI in dev mode
```

## Project Structure

```
openclaw/
├── src/                    # Core source (TypeScript ESM)
│   ├── cli/                # CLI wiring
│   ├── commands/           # CLI commands
│   ├── channels/           # Shared channel logic
│   ├── gateway/            # Gateway server
│   ├── plugins/            # Plugin loader
│   ├── telegram/discord/slack/signal/  # Channel implementations
│   └── ...
├── extensions/             # Workspace packages (channel plugins)
│   ├── msteams/matrix/zalo/voice-call/...
├── apps/                   # Native apps (iOS, macOS, Android)
├── docs/                   # Mintlify docs (docs.openclaw.ai)
└── scripts/                # Build, release, utilities
```

## Critical Patterns

### Plugin/Extension Architecture
- Extensions live under `extensions/*` (workspace packages)
- Keep plugin-only deps in extension's `package.json`, not root
- Avoid `workspace:*` in `dependencies` (breaks npm install)
- Put `openclaw` in `devDependencies` or `peerDependencies`

### Multi-Agent Safety
- **Never** create/drop `git stash` entries unless explicitly requested
- **Never** switch branches unless explicitly requested
- When committing, scope to your changes only
- When pushing, `git pull --rebase` first (never discard other agents' work)
- Use `scripts/committer "<msg>" <file...>` instead of manual `git add/commit`

### Messaging Channels
When refactoring shared logic, consider **all** built-in + extension channels:
- Core: `src/telegram`, `src/discord`, `src/slack`, `src/signal`, `src/imessage`, `src/web`
- Extensions: `extensions/msteams`, `extensions/matrix`, `extensions/zalo`, etc.

### Code Style
- TypeScript ESM, strict typing, avoid `any`
- Use Oxlint + Oxfmt (`pnpm lint`, `pnpm format`)
- Keep files under ~700 LOC; extract helpers
- Use `src/cli/progress.ts` for spinners (not hand-rolled)
- Use `src/terminal/palette.ts` for colors (no hardcoded ANSI)

### Testing
- Colocated `*.test.ts` files; e2e in `*.e2e.test.ts`
- Live tests: `CLAWDBOT_LIVE_TEST=1 pnpm test:live`
- Before using simulators, check for real connected devices

### PR Workflow
- **Review mode**: `gh pr view/diff` only, don't switch branches
- **Landing mode**: Create temp branch from `main`, squash/rebase, run full gate before commit
- Always add changelog entry with PR # and thank contributor
- After merging, run `bun scripts/update-clawtributors.ts` for new contributors

### Version Locations
- CLI: `package.json`
- Android: `apps/android/app/build.gradle.kts`
- iOS: `apps/ios/Sources/Info.plist`
- macOS: `apps/macos/Sources/OpenClaw/Resources/Info.plist`

## Anti-Patterns

❌ **DON'T**:
- Edit `node_modules` (ever)
- Update the Carbon dependency
- Patch dependencies without explicit approval
- Set test workers above 16
- Send streaming/partial replies to external messaging (WhatsApp, Telegram)
- Rebuild macOS app over SSH (must be run directly on Mac)

---

## Shared Conventions (Both Projects)

### Commit Messages
```bash
feat: add chat streaming
fix: resolve auth redirect
refactor: extract AI client
docs: update agent instructions
```

### Error Investigation
- Read source code of npm deps and local code before concluding
- Aim for high-confidence root cause, don't guess

### Code Generation
- Generate complete, runnable code (no `// TODO`)
- Include TypeScript types
- Follow existing patterns in codebase
