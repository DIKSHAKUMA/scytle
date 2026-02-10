import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT, createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { generate, RateLimitError } from '@/lib/ai'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

2. Then, GENERATE a sitemap that reflects industry best practices:
   - Include all pages that competitors typically have
   - Use section names that are SPECIFIC to this industry
   - Think about what users expect when visiting this type of website

INDUSTRY-SPECIFIC EXAMPLES:

For "food delivery app":
- Pages: Home, Restaurants, Restaurant Page, Cart, Checkout, Order Tracking, Blog, Contact
- Sections should reference: location search, cuisine filters, restaurant cards with ratings/delivery time, menu categories, order summary

For "SaaS CRM":
- Pages: Home, Features, Pricing, Integrations, About, Blog, Contact, Login, Demo
- Sections should reference: feature comparison, pricing tiers, integration logos, customer testimonials, ROI calculator

For "architecture firm":
- Pages: Home, Projects, Project Detail, Services, About, Team, Contact, Blog
- Sections should reference: project gallery, before/after, design philosophy, awards, process timeline

RULES:
- Generate between ${minPages} and ${maxPages} pages
- Each page should have 4-7 relevant sections
- Each section MUST have an id, name, and description
- Section names should be DESCRIPTIVE and industry-specific
- Section descriptions should explain what UI elements and content the section contains
- Always start with "Navbar" section and end with "Footer" section on each page
- Always include Home as the first page with slug "/"
- Include logical child pages where appropriate (e.g., Blog -> Blog Post)
- Use lowercase slugs with hyphens

RESPONSE FORMAT (JSON ONLY, no markdown):
{
  "pages": [
    {
      "id": "home",
      "label": "Home",
      "slug": "/",
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
1. What type of product/business is this?
2. Who are the competitors and what pages do they typically have?
3. What's the user journey from discovery to conversion?
4. What sections would each page need?

Generate the sitemap JSON now.`

        const aiResponse = await generate(userMessage, [], {
            model: 'fast',  // Use fast model (gemini-2.0-flash) to avoid quota issues; auto-fallback if needed
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
        } catch (parseError) {
            console.error('🤖 Failed to parse AI response:', parseError)
            console.error('🤖 Raw response:', aiResponse)

            // Return a default sitemap structure with Relume-style sections
            sitemapData = {
                pages: [
                    {
                        id: 'home',
                        label: 'Home',
                        slug: '/',
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
        if (error instanceof RateLimitError) {
            return NextResponse.json(
                { error: error.message, code: 'rate_limit' },
                { status: 429 }
            )
        }
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
