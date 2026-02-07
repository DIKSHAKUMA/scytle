import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT, createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { generate } from '@/lib/ai'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Request schema for wireframe generation
 */
const GenerateWireframeSchema = z.object({
    pageId: z.string(),
    pageName: z.string(),
    pageDescription: z.string().optional(),
    projectId: z.string().optional(),
})

/**
 * Generated section schema
 */
const GeneratedSectionSchema = z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    description: z.string().optional(),
    componentId: z.string(),
    content: z.object({
        heading: z.string().optional(),
        subheading: z.string().optional(),
        body: z.string().optional(),
        cta: z.string().optional(),
        items: z.array(z.object({
            heading: z.string().optional(),
            body: z.string().optional(),
            icon: z.string().optional(),
        })).optional(),
    }),
    controls: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
})

/**
 * System prompt for wireframe section generation
 */
const WIREFRAME_GENERATION_PROMPT = `You are an expert UI/UX designer and product strategist. Your task is to generate wireframe sections for a web page.

Given a page name and optional description, generate appropriate sections that would make sense for this type of page. Consider:
1. The page's purpose and typical user flow
2. Industry best practices for this type of page
3. Essential content sections that users expect
4. A logical order that guides users through the content

For each section, generate:
- A unique id (kebab-case)
- A type (hero, features, testimonials, pricing, faq, cta, contact, team, stats, logos, gallery, blog, footer, navbar)
- A descriptive name
- A brief description
- A componentId (format: {type}-{number}, e.g., "hero-1", "features-3")
- Content with placeholder text that's relevant to the page
- Default controls appropriate for the section type

Return a JSON array of sections in order. Be creative but practical.
Start with a navbar and end with a footer for most pages.`

/**
 * POST /api/wireframe/generate
 * Generate wireframe sections for a page using AI
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
        const validation = GenerateWireframeSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 }
            )
        }

        const { pageId, pageName, pageDescription } = validation.data

        console.log('🤖 Generating wireframe for page:', pageName)

        // 3. Generate sections using AI
        const userPrompt = `Generate wireframe sections for the following page:

Page Name: ${pageName}
${pageDescription ? `Description: ${pageDescription}` : ''}

Generate 5-8 appropriate sections for this page. Return ONLY valid JSON array, no markdown.`

        const response = await generate(userPrompt, [], {
            systemPrompt: WIREFRAME_GENERATION_PROMPT,
            model: 'fast',
            temperature: 0.7,
        })

        // 4. Parse AI response
        let sections
        try {
            // Clean up response (remove markdown code blocks if present)
            let cleanResponse = response.trim()
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.slice(7)
            }
            if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.slice(3)
            }
            if (cleanResponse.endsWith('```')) {
                cleanResponse = cleanResponse.slice(0, -3)
            }
            cleanResponse = cleanResponse.trim()

            sections = JSON.parse(cleanResponse)

            // Validate each section
            if (!Array.isArray(sections)) {
                throw new Error('Response is not an array')
            }

            // Ensure each section has required fields
            sections = sections.map((section: Record<string, unknown>, index: number) => ({
                id: section.id || `section-${index + 1}`,
                type: section.type || 'generic',
                name: section.name || `Section ${index + 1}`,
                description: section.description || '',
                componentId: section.componentId || `${section.type || 'generic'}-1`,
                isGlobal: section.type === 'navbar' || section.type === 'footer',
                order: index,
                content: {
                    heading: (section.content as Record<string, unknown>)?.heading || '',
                    subheading: (section.content as Record<string, unknown>)?.subheading || '',
                    body: (section.content as Record<string, unknown>)?.body || '',
                    cta: (section.content as Record<string, unknown>)?.cta || '',
                    items: (section.content as Record<string, unknown>)?.items || [],
                },
                controls: section.controls || {},
            }))

            console.log('✅ Generated', sections.length, 'sections')
        } catch (parseError) {
            console.error('❌ Failed to parse AI response:', parseError)
            console.error('Raw response:', response)

            // Return default sections as fallback
            sections = getDefaultSections(pageName)
        }

        return NextResponse.json({
            success: true,
            pageId,
            sections,
        })
    } catch (error) {
        console.error('❌ Wireframe generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate wireframe' },
            { status: 500 }
        )
    }
}

/**
 * Generate default sections as fallback
 */
function getDefaultSections(pageName: string) {
    const lowerName = pageName.toLowerCase()

    // Home page
    if (lowerName === 'home' || lowerName === 'landing') {
        return [
            createSection('navbar', 'Navbar', 0),
            createSection('hero', 'Hero', 1),
            createSection('features', 'Features', 2),
            createSection('testimonials', 'Testimonials', 3),
            createSection('cta', 'Call to Action', 4),
            createSection('footer', 'Footer', 5),
        ]
    }

    // About page
    if (lowerName.includes('about')) {
        return [
            createSection('navbar', 'Navbar', 0),
            createSection('hero', 'About Hero', 1),
            createSection('stats', 'Company Stats', 2),
            createSection('team', 'Our Team', 3),
            createSection('footer', 'Footer', 4),
        ]
    }

    // Pricing page
    if (lowerName.includes('pricing')) {
        return [
            createSection('navbar', 'Navbar', 0),
            createSection('hero', 'Pricing Hero', 1),
            createSection('pricing', 'Pricing Plans', 2),
            createSection('faq', 'FAQ', 3),
            createSection('cta', 'Call to Action', 4),
            createSection('footer', 'Footer', 5),
        ]
    }

    // Contact page
    if (lowerName.includes('contact')) {
        return [
            createSection('navbar', 'Navbar', 0),
            createSection('hero', 'Contact Hero', 1),
            createSection('contact', 'Contact Form', 2),
            createSection('footer', 'Footer', 3),
        ]
    }

    // Blog page
    if (lowerName.includes('blog')) {
        return [
            createSection('navbar', 'Navbar', 0),
            createSection('hero', 'Blog Hero', 1),
            createSection('blog', 'Blog Posts', 2),
            createSection('footer', 'Footer', 3),
        ]
    }

    // Default page
    return [
        createSection('navbar', 'Navbar', 0),
        createSection('hero', 'Hero', 1),
        createSection('features', 'Content', 2),
        createSection('cta', 'Call to Action', 3),
        createSection('footer', 'Footer', 4),
    ]
}

/**
 * Create a section with defaults
 */
function createSection(type: string, name: string, order: number) {
    return {
        id: `${type}-${Date.now()}-${order}`,
        type,
        name,
        description: `${name} section`,
        componentId: `${type}-1`,
        isGlobal: type === 'navbar' || type === 'footer',
        order,
        content: {
            heading: `${name} Heading`,
            subheading: 'Supporting text for this section',
            body: '',
            cta: type === 'cta' || type === 'hero' ? 'Get Started' : '',
            items: [],
        },
        controls: getDefaultControls(type),
    }
}

/**
 * Get default controls for a section type
 */
function getDefaultControls(type: string): Record<string, string | number | boolean> {
    switch (type) {
        case 'hero':
            return { textAlign: 'center', assetType: 'image' }
        case 'features':
            return { columns: 3, showIcons: true }
        case 'testimonials':
            return { slider: false, contentType: 'type1' }
        case 'faq':
            return { style: 'accordion', columns: 1 }
        case 'gallery':
            return { layout: 'grid', columns: 3 }
        case 'pricing':
            return { tiers: 3, highlight: true }
        case 'team':
            return { columns: 3, showSocial: true }
        case 'stats':
            return { columns: 4, showIcons: false }
        case 'contact':
            return { layout: 'side-by-side', showMap: false }
        case 'blog':
            return { columns: 3, showExcerpt: true }
        case 'footer':
            return { columns: 4, showNewsletter: true }
        case 'navbar':
            return { layout: 'left', sticky: true }
        default:
            return {}
    }
}
