import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT, createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { generate } from '@/lib/ai'
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

// Sitemap node type
interface SitemapNode {
    id: string
    label: string
    slug: string
    sections: string[]
    children?: SitemapNode[]
}

// Sitemap response schema for validation
const SitemapNodeSchema: z.ZodType<SitemapNode> = z.object({
    id: z.string(),
    label: z.string(),
    slug: z.string(),
    sections: z.array(z.string()),
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
        const systemPrompt = `You are an expert web designer and information architect. Your task is to generate a comprehensive sitemap structure for a website based on the project description.

INSTRUCTIONS:
1. Analyze the project description and create a logical page hierarchy
2. For each page, suggest relevant sections that would typically be included
3. Use clear, descriptive page names and URL-friendly slugs
4. Create a structure that follows modern web design best practices
5. Include essential pages like Home, About, Contact, and specific pages based on the project type
6. Generate between ${minPages} and ${maxPages} pages

RESPONSE FORMAT (JSON ONLY):
{
  "pages": [
    {
      "id": "home",
      "label": "Home",
      "slug": "/",
      "sections": ["Hero", "Features", "Testimonials", "CTA"],
      "children": []
    },
    {
      "id": "about",
      "label": "About",
      "slug": "/about",
      "sections": ["Our Story", "Team", "Values"],
      "children": []
    }
  ]
}

IMPORTANT:
- Always include a Home page as the first page
- Keep section names concise and descriptive
- Use lowercase slugs with hyphens
- Generate between ${minPages} and ${maxPages} main pages
- Each page should have 3-6 relevant sections
- Only respond with valid JSON, no markdown or explanation`

        const userMessage = `Generate a sitemap for the following project:

PROJECT DESCRIPTION: ${finalDescription}
${language ? `LANGUAGE: ${language}` : ''}
${industry ? `INDUSTRY: ${industry}` : ''}
${targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : ''}
${features?.length ? `KEY FEATURES: ${features.join(', ')}` : ''}

Generate a comprehensive sitemap structure with ${minPages}-${maxPages} pages and appropriate sections.`

        const aiResponse = await generate(userMessage, [], {
            model: 'fast',
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

            // Return a default sitemap structure
            sitemapData = {
                pages: [
                    {
                        id: 'home',
                        label: 'Home',
                        slug: '/',
                        sections: ['Hero', 'Features', 'About', 'CTA'],
                        children: [],
                    },
                    {
                        id: 'about',
                        label: 'About',
                        slug: '/about',
                        sections: ['Our Story', 'Team', 'Values'],
                        children: [],
                    },
                    {
                        id: 'services',
                        label: 'Services',
                        slug: '/services',
                        sections: ['Overview', 'Service List', 'Process'],
                        children: [],
                    },
                    {
                        id: 'contact',
                        label: 'Contact',
                        slug: '/contact',
                        sections: ['Contact Form', 'Map', 'Info'],
                        children: [],
                    },
                ],
            }
        }

        // 6. Convert to ReactFlow nodes and edges format
        const { nodes, edges } = convertToReactFlowFormat(sitemapData.pages, projectName)

        // 7. Return the sitemap structure
        return NextResponse.json({
            success: true,
            sitemap: {
                pages: sitemapData.pages,
                nodes,
                edges,
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
