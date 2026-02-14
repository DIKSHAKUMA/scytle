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

// Sitemap node type
interface SitemapNode {
    id: string
    label: string
    slug: string
    context?: 'marketing' | 'application' | 'auth'
    layout?: 'stacked' | 'app-shell' | 'centered'
    sections: SectionData[]
    children?: SitemapNode[]
}

// Section schema
const SectionSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
})

// Sitemap response schema for validation
const SitemapNodeSchema: z.ZodType<SitemapNode> = z.object({
    id: z.string(),
    label: z.string(),
    slug: z.string(),
    context: z.enum(['marketing', 'application', 'auth']).optional(),
    layout: z.enum(['stacked', 'app-shell', 'centered']).optional(),
    sections: z.array(SectionSchema),
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

        // 4. Generate sitemap using AI
        const systemPrompt = `You are an expert product designer and information architect with comprehensive knowledge of every industry.

YOUR APPROACH:
1. First, ANALYZE the product type from the description:
   - What industry is this? (SaaS, e-commerce, marketplace, portfolio, restaurant, healthcare, fintech, etc.)
   - What are the major competitors in this space? (Use your training knowledge)
   - What's the typical end-to-end user journey for this type of product?

2. CLASSIFY the product type to decide which page contexts to generate:
   - **SaaS / Web App** → generate marketing + application + auth pages
   - **Static site / Portfolio / Agency / Restaurant** → marketing pages only
   - **E-commerce** → marketing + application pages (cart, orders, account)
   - **Marketplace** → marketing + application pages (seller dashboard, buyer dashboard)

3. Then, GENERATE a sitemap that reflects industry best practices:
   - Include all pages that competitors typically have
   - Use section names that are SPECIFIC to this industry
   - Think about what users expect when visiting this type of product

PAGE CONTEXT SYSTEM:
Every page MUST include a "context" and "layout" field:

| Context       | Layout      | When to use                                    |
|---------------|-------------|------------------------------------------------|
| "marketing"   | "stacked"   | Public-facing pages: Home, Features, Pricing, About, Blog, Contact |
| "application" | "app-shell" | Logged-in app pages: Dashboard, Settings, Projects, Analytics, Orders |
| "auth"        | "centered"  | Authentication pages: Login, Signup, Forgot Password, Verify Email |

CRITICAL SECTION RULES BY CONTEXT:
- **marketing** pages: Start with "Navbar" section, end with "Footer" section. Use marketing sections: hero, features, testimonials, pricing, faq, cta, contact, team, stats, logos, gallery, blog.
- **application** pages: Do NOT include Navbar or Footer sections (the app shell provides built-in chrome). Use app sections: dashboard widgets, data tables, charts, forms, lists, page headers, empty states. Name sections specifically: "Stats Overview", "Revenue Chart", "Recent Orders Table", "Activity Feed", "User Settings Form".
- **auth** pages: Do NOT include Navbar or Footer sections. Include only ONE section: the auth form (login form, signup form, forgot password form, etc.).

INDUSTRY-SPECIFIC EXAMPLES:

For "project management SaaS":
  Home (marketing/stacked), Features (marketing/stacked), Pricing (marketing/stacked),
  Dashboard (application/app-shell), Projects (application/app-shell),
  Team Members (application/app-shell), Settings (application/app-shell),
  Login (auth/centered), Signup (auth/centered)

For "food delivery app":
  Home (marketing/stacked), Restaurants (marketing/stacked), Blog (marketing/stacked),
  Dashboard (application/app-shell), Orders (application/app-shell), Account (application/app-shell),
  Login (auth/centered), Signup (auth/centered)

For "analytics dashboard SaaS":
  Home (marketing/stacked), Features (marketing/stacked), Pricing (marketing/stacked),
  Dashboard (application/app-shell), Reports (application/app-shell),
  Data Explorer (application/app-shell), Settings (application/app-shell),
  Login (auth/centered), Signup (auth/centered)

For "architecture firm" (marketing only):
  Home (marketing/stacked), Projects (marketing/stacked), Services (marketing/stacked),
  About (marketing/stacked), Team (marketing/stacked), Contact (marketing/stacked)

RULES:
- Generate between ${minPages} and ${maxPages} pages
- Each marketing page should have 4-7 relevant sections (including navbar + footer)
- Each application page should have 3-6 relevant sections (NO navbar/footer)
- Each auth page should have 1-2 sections (just the auth form)
- Each section MUST have an id, name, and description
- Section names should be DESCRIPTIVE and industry-specific
- Section descriptions should explain what UI elements and content the section contains
- Always include Home as the first page with slug "/"
- Include logical child pages where appropriate (e.g., Blog -> Blog Post)
- Use lowercase slugs with hyphens
- For SaaS/app products, always include Login and Signup pages

RESPONSE FORMAT (JSON ONLY, no markdown):
{
  "pages": [
    {
      "id": "home",
      "label": "Home",
      "slug": "/",
      "context": "marketing",
      "layout": "stacked",
      "sections": [
        {
          "id": "home-navbar",
          "name": "Navbar",
          "description": "Main navigation with logo, menu links, and call-to-action button"
        },
        {
          "id": "home-hero",
          "name": "Hero Header Section",
          "description": "Eye-catching introduction with headline, subheadline, and primary CTA"
        },
        {
          "id": "home-footer",
          "name": "Footer",
          "description": "Site footer with links, social media, and copyright"
        }
      ],
      "children": []
    },
    {
      "id": "dashboard",
      "label": "Dashboard",
      "slug": "/dashboard",
      "context": "application",
      "layout": "app-shell",
      "sections": [
        {
          "id": "dashboard-header",
          "name": "Page Header",
          "description": "Page title with date range filter and action buttons"
        },
        {
          "id": "dashboard-stats",
          "name": "Stats Overview",
          "description": "Row of stat cards showing key metrics like revenue, users, and growth"
        },
        {
          "id": "dashboard-chart",
          "name": "Revenue Chart",
          "description": "Line or bar chart showing revenue trends over time"
        },
        {
          "id": "dashboard-table",
          "name": "Recent Activity",
          "description": "Data table showing latest transactions or events"
        }
      ],
      "children": []
    },
    {
      "id": "login",
      "label": "Login",
      "slug": "/login",
      "context": "auth",
      "layout": "centered",
      "sections": [
        {
          "id": "login-form",
          "name": "Login Form",
          "description": "Email and password fields with social login options and forgot password link"
        }
      ],
      "children": []
    }
  ]
}`

        const userMessage = `Generate a comprehensive sitemap for the following product:

PRODUCT DESCRIPTION: ${finalDescription}

REQUIREMENTS:
- Number of pages: ${minPages}-${maxPages}
${language ? `- Language/Region: ${language}` : ''}
${industry ? `- Industry: ${industry}` : ''}
${targetAudience ? `- Target Audience: ${targetAudience}` : ''}
${features?.length ? `- Key Features to highlight: ${features.join(', ')}` : ''}

Think step by step:
1. What type of product/business is this? (SaaS, static site, e-commerce, marketplace, etc.)
2. Based on the type, which page contexts are needed? (marketing only, or marketing + application + auth)
3. Who are the competitors and what pages do they typically have?
4. What's the user journey from discovery to conversion (and ongoing usage for SaaS)?
5. What sections would each page need? (Remember: no navbar/footer on application and auth pages)

IMPORTANT: Every page MUST include "context" and "layout" fields.

Generate the sitemap JSON now.`

        const aiResponse = await generate(userMessage, [], {
            model: 'balanced',  // Use better model for sitemap generation
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

            // Return a default sitemap structure (marketing-only fallback)
            sitemapData = {
                pages: [
                    {
                        id: 'home',
                        label: 'Home',
                        slug: '/',
                        context: 'marketing' as const,
                        layout: 'stacked' as const,
                        sections: [
                            { id: 'home-navbar', name: 'Navbar', description: 'Main navigation with logo and menu links' },
                            { id: 'home-hero', name: 'Hero', description: 'Main hero section with headline and CTA' },
                            { id: 'home-features', name: 'Features', description: 'Key features and benefits overview' },
                            { id: 'home-about', name: 'About', description: 'Brief company introduction' },
                            { id: 'home-cta', name: 'CTA', description: 'Call to action section' },
                            { id: 'home-footer', name: 'Footer', description: 'Site footer with links and contact info' },
                        ],
                        children: [],
                    },
                    {
                        id: 'about',
                        label: 'About',
                        slug: '/about',
                        context: 'marketing' as const,
                        layout: 'stacked' as const,
                        sections: [
                            { id: 'about-navbar', name: 'Navbar', description: 'Main navigation with logo and menu links' },
                            { id: 'about-story', name: 'Our Story', description: 'Company history and mission' },
                            { id: 'about-team', name: 'Team', description: 'Team members showcase' },
                            { id: 'about-values', name: 'Values', description: 'Core company values' },
                            { id: 'about-footer', name: 'Footer', description: 'Site footer with links and contact info' },
                        ],
                        children: [],
                    },
                    {
                        id: 'services',
                        label: 'Services',
                        slug: '/services',
                        context: 'marketing' as const,
                        layout: 'stacked' as const,
                        sections: [
                            { id: 'services-navbar', name: 'Navbar', description: 'Main navigation with logo and menu links' },
                            { id: 'services-overview', name: 'Overview', description: 'Services introduction' },
                            { id: 'services-list', name: 'Service List', description: 'Detailed list of all services' },
                            { id: 'services-process', name: 'Process', description: 'How we work with clients' },
                            { id: 'services-footer', name: 'Footer', description: 'Site footer with links and contact info' },
                        ],
                        children: [],
                    },
                    {
                        id: 'contact',
                        label: 'Contact',
                        slug: '/contact',
                        context: 'marketing' as const,
                        layout: 'stacked' as const,
                        sections: [
                            { id: 'contact-navbar', name: 'Navbar', description: 'Main navigation with logo and menu links' },
                            { id: 'contact-form', name: 'Contact Form', description: 'Main contact form for inquiries' },
                            { id: 'contact-map', name: 'Map', description: 'Location map and directions' },
                            { id: 'contact-info', name: 'Info', description: 'Contact details and hours' },
                            { id: 'contact-footer', name: 'Footer', description: 'Site footer with links and contact info' },
                        ],
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
                sections: page.sections,
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
                        sections: child.sections,
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
