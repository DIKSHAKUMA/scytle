import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT, createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { generate } from '@/lib/ai'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Infer page context from name/slug (server-side copy of store helper) */
function inferPageContext(name: string, slug: string): 'marketing' | 'application' | 'auth' {
    const s = `${name} ${slug}`.toLowerCase()
    const appPatterns = ['/dashboard', '/app/', '/admin', '/settings', '/analytics', '/projects', '/orders', '/account', '/billing', '/reports', '/users', '/team-manage', '/inbox', '/notifications']
    if (appPatterns.some(p => s.includes(p))) return 'application'
    const authPatterns = ['/login', '/signup', '/register', '/forgot', '/reset', '/verify', '/onboard', 'sign in', 'sign up', 'log in']
    if (authPatterns.some(p => s.includes(p))) return 'auth'
    return 'marketing'
}

/** Map context to layout */
function inferPageLayout(context: 'marketing' | 'application' | 'auth'): 'stacked' | 'app-shell' | 'centered' {
    if (context === 'application') return 'app-shell'
    if (context === 'auth') return 'centered'
    return 'stacked'
}

/** Recursively backfill context/layout on sitemap nodes if AI omitted them */
function backfillContext(nodes: SitemapNode[]): SitemapNode[] {
    return nodes.map(node => {
        const context = node.context || inferPageContext(node.label, node.slug)
        const layout = node.layout || inferPageLayout(context)
        return {
            ...node,
            context,
            layout,
            sections: node.sections || [],
            children: node.children ? backfillContext(node.children) : undefined,
        }
    })
}

// Input validation schema
const GenerateSitemapSchema = z.object({
    projectId: z.string().optional(),
    projectDescription: z.string().optional(),
    // New format from left sidebar
    description: z.string().optional(),
    pageCount: z.string().optional(),
    language: z.string().optional(),
    // Legacy fields
    industry: z.string().optional(),
    targetAudience: z.string().optional(),
    features: z.array(z.string()).optional(),
}).refine(data => data.projectDescription || data.description, {
    message: 'Either projectDescription or description is required',
})

// Section type with name and description (Relume-style)
interface SectionData {
    id: string
    name: string
    description: string
}

// Sitemap node type — sections are now OPTIONAL (templates fill them client-side)
interface SitemapNode {
    id: string
    label: string
    slug: string
    context?: 'marketing' | 'application' | 'auth'
    layout?: 'stacked' | 'app-shell' | 'centered'
    sections?: SectionData[]
    children?: SitemapNode[]
}

// Section schema (optional — AI no longer generates sections)
const SectionSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
})

// Sitemap response schema for validation — sections now optional
const SitemapNodeSchema: z.ZodType<SitemapNode> = z.object({
    id: z.string(),
    label: z.string(),
    slug: z.string(),
    context: z.enum(['marketing', 'application', 'auth']).optional(),
    layout: z.enum(['stacked', 'app-shell', 'centered']).optional(),
    sections: z.array(SectionSchema).optional(),
    children: z.lazy(() => z.array(SitemapNodeSchema)).optional(),
})

const SitemapResponseSchema = z.object({
    pages: z.array(SitemapNodeSchema),
})

/**
 * POST /api/ai/generate-sitemap
 * Generate a sitemap structure based on project description
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user
        const authHeader = request.headers.get('Authorization')
        const user = await getUserFromJWT(authHeader)

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // 2. Validate input
        const body = await request.json()
        const validation = GenerateSitemapSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 }
            )
        }

        const {
            projectId,
            projectDescription,
            description,
            pageCount,
            language,
            industry,
            targetAudience,
            features
        } = validation.data

        // Use description from new format if projectDescription not provided
        const finalDescription = projectDescription || description || ''

        // Parse page count range
        let minPages = 4
        let maxPages = 8
        if (pageCount) {
            const match = pageCount.match(/(\d+)-(\d+)/)
            if (match) {
                minPages = parseInt(match[1], 10)
                maxPages = parseInt(match[2], 10)
            } else if (pageCount === '20+') {
                minPages = 15
                maxPages = 20
            }
        }

        // 3. Verify user owns the project (if projectId provided)
        const { databases } = createAdminClient()
        let projectName = 'My Project'

        if (projectId) {
            let project
            try {
                project = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.PROJECTS,
                    projectId
                )
                projectName = project.name || 'My Project'
            } catch {
                return NextResponse.json(
                    { error: 'Project not found' },
                    { status: 404 }
                )
            }

            if (project.userId !== user.$id) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                )
            }
        }

        // 4. Generate sitemap using AI — lightweight prompt, fast model, NO sections
        const systemPrompt = `You are an expert information architect. Generate a sitemap (page structure only) for a web product.

CLASSIFY the product:
A) Marketing-Only (portfolio, agency, restaurant, blog, landing page) → all marketing pages
B) SaaS/App (dashboard, CRM, analytics, HR platform) → marketing + app screens + auth
C) E-commerce (store, marketplace) → marketing + shop pages + auth
D) Marketplace (two-sided) → marketing + buyer/seller dashboards + auth

PAGE BUDGET: ${minPages}-${maxPages} pages. For SaaS: max 3 marketing, 2 auth, rest application.

CONTEXT & LAYOUT:
| Context       | Layout      | Use for                                   |
|---------------|-------------|-------------------------------------------|
| "marketing"   | "stacked"   | Public: Home, Features, Pricing, About    |
| "application" | "app-shell" | Logged-in: Dashboard, Settings, Projects  |
| "auth"        | "centered"  | Auth: Login, Signup, Forgot Password      |

Return JSON only (no markdown):
{
  "pages": [
    {"id": "home", "label": "Home", "slug": "/", "context": "marketing", "layout": "stacked", "children": []},
    {"id": "dashboard", "label": "Dashboard", "slug": "/app/dashboard", "context": "application", "layout": "app-shell", "children": [
      {"id": "project-detail", "label": "Project Detail", "slug": "/app/projects/:id", "context": "application", "layout": "app-shell"}
    ]},
    {"id": "login", "label": "Login", "slug": "/login", "context": "auth", "layout": "centered"}
  ]
}`

        const userMessage = `Generate a sitemap for: ${finalDescription}

Page budget: ${minPages}-${maxPages} pages.
${language ? `Language: ${language}` : ''}
${industry ? `Industry: ${industry}` : ''}
${targetAudience ? `Target audience: ${targetAudience}` : ''}
${features?.length ? `Key features: ${features.join(', ')}` : ''}

Every page MUST have "context" and "layout" fields. Use children[] for sub-pages. Return JSON only.`

        const aiResponse = await generate(userMessage, [], {
            model: 'gemini-flash',
            systemPrompt,
            temperature: 0.7,
        })

        // 5. Parse and validate AI response
        let sitemapData
        try {
            // Extract JSON from response (in case AI includes extra text)
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                throw new Error('No valid JSON found in response')
            }
            sitemapData = JSON.parse(jsonMatch[0])

            // Validate structure
            SitemapResponseSchema.parse(sitemapData)

            // Backfill context/layout if AI omitted them
            sitemapData.pages = backfillContext(sitemapData.pages)
        } catch (parseError) {
            console.error('🤖 Failed to parse AI response:', parseError)
            console.error('🤖 Raw response:', aiResponse)

            // Return a default sitemap structure (marketing-only fallback, no sections — templates fill them)
            sitemapData = {
                pages: [
                    {
                        id: 'home',
                        label: 'Home',
                        slug: '/',
                        context: 'marketing' as const,
                        layout: 'stacked' as const,
                        children: [],
                    },
                    {
                        id: 'about',
                        label: 'About',
                        slug: '/about',
                        context: 'marketing' as const,
                        layout: 'stacked' as const,
                        children: [],
                    },
                    {
                        id: 'services',
                        label: 'Services',
                        slug: '/services',
                        context: 'marketing' as const,
                        layout: 'stacked' as const,
                        children: [],
                    },
                    {
                        id: 'contact',
                        label: 'Contact',
                        slug: '/contact',
                        context: 'marketing' as const,
                        layout: 'stacked' as const,
                        children: [],
                    },
                ],
            }
        }

        // 6. Save sitemap to project in database (if projectId provided)
        if (projectId) {
            try {
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.PROJECTS,
                    projectId,
                    {
                        sitemapData: JSON.stringify(sitemapData.pages),
                        updatedAt: new Date().toISOString(),
                    }
                )
                console.log('📦 Sitemap saved to project')
            } catch (saveError) {
                console.error('📦 Failed to save sitemap to project:', saveError)
                // Continue even if save fails - user can still use the generated sitemap
            }
        }

        // 7. Return the sitemap structure with project name
        return NextResponse.json({
            success: true,
            sitemap: {
                pages: sitemapData.pages,
                projectName,
            },
        })
    } catch (error) {
        console.error('🤖 Generate sitemap error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * Convert page structure to ReactFlow nodes and edges
 */
function convertToReactFlowFormat(
    pages: SitemapNode[],
    projectName: string
) {
    const nodes: { id: string; type: string; position: { x: number; y: number }; data: Record<string, unknown> }[] = []
    const edges: { id: string; source: string; target: string; type: string; sourceHandle: string | null; targetHandle: string | null }[] = []

    // Add project root node
    const projectNode = {
        id: 'project',
        type: 'project',
        position: { x: 400, y: 50 },
        data: {
            label: projectName,
            pageCount: pages.length,
        },
    }
    nodes.push(projectNode)

    // Calculate positions for pages (horizontal layout)
    const pageSpacing = 280
    const startX = 400 - ((pages.length - 1) * pageSpacing) / 2

    pages.forEach((page, index) => {
        const pageNode = {
            id: page.id,
            type: 'page',
            position: {
                x: startX + index * pageSpacing,
                y: 200,
            },
            data: {
                label: page.label,
                slug: page.slug,
                sections: page.sections || [],
            },
        }
        nodes.push(pageNode)

        // Add edge from project to page
        edges.push({
            id: `e-project-${page.id}`,
            source: 'project',
            target: page.id,
            type: 'smoothstep',
            sourceHandle: null,
            targetHandle: null,
        })

        // Handle children pages (if any)
        if (page.children && page.children.length > 0) {
            const childSpacing = 250
            const childStartX = pageNode.position.x - ((page.children.length - 1) * childSpacing) / 2

            page.children.forEach((child, childIndex) => {
                const childNode = {
                    id: child.id,
                    type: 'page',
                    position: {
                        x: childStartX + childIndex * childSpacing,
                        y: 400,
                    },
                    data: {
                        label: child.label,
                        slug: child.slug,
                        sections: child.sections || [],
                    },
                }
                nodes.push(childNode)

                edges.push({
                    id: `e-${page.id}-${child.id}`,
                    source: page.id,
                    target: child.id,
                    type: 'smoothstep',
                    sourceHandle: null,
                    targetHandle: null,
                })
            })
        }
    })

    return { nodes, edges }
}
