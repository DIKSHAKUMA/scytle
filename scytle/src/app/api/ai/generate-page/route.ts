import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserFromJWT } from '@/lib/appwrite-server'
import { generate } from '@/lib/ai'

const GeneratePageSchema = z.object({
    pageName: z.string().min(1, 'Page name is required'),
    pageDescription: z.string().optional(),
    projectDescription: z.string().optional(),
    industry: z.string().optional(),
    existingSections: z.array(z.string()).optional(),
    sectionCount: z.number().min(3).max(12).optional().default(5),
})

export async function POST(request: NextRequest) {
    try {
        // 1. Verify authentication
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const user = await getUserFromJWT(authHeader)
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // 2. Validate input
        const body = await request.json()
        const validation = GeneratePageSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 }
            )
        }

        const {
            pageName,
            pageDescription,
            projectDescription,
            industry,
            existingSections,
            sectionCount,
        } = validation.data

        // 3. Generate page sections using AI
        const systemPrompt = `You are an expert web designer. Your task is to generate sections for a web page based on the page name and context.

INSTRUCTIONS:
1. Analyze the page name and description
2. Generate appropriate sections for this type of page
3. Consider the project context and industry
4. Use clear, descriptive section names
5. Include sections that are appropriate for the page type

RESPONSE FORMAT (JSON ONLY):
{
  "sections": [
    {
      "id": "hero",
      "name": "Hero",
      "type": "hero",
      "description": "Main hero section with headline and CTA"
    },
    {
      "id": "features",
      "name": "Features",
      "type": "features",
      "description": "Grid of key features or benefits"
    }
  ],
  "pageTitle": "Page Title Suggestion",
  "metaDescription": "SEO meta description for this page"
}

SECTION TYPES:
- hero: Main banner/hero section
- features: Feature list or grid
- about: About content
- team: Team members
- testimonials: Customer testimonials
- pricing: Pricing tables
- faq: Frequently asked questions
- cta: Call to action
- contact: Contact form
- gallery: Image gallery
- services: Service offerings
- stats: Statistics/numbers
- blog: Blog posts list
- header: Page header (not navigation)
- footer: Page footer

IMPORTANT:
- Generate ${sectionCount} sections
- Order sections logically
- Only respond with valid JSON, no markdown`

        const userMessage = `Generate sections for the following page:

PAGE NAME: ${pageName}
${pageDescription ? `PAGE DESCRIPTION: ${pageDescription}` : ''}
${projectDescription ? `PROJECT CONTEXT: ${projectDescription}` : ''}
${industry ? `INDUSTRY: ${industry}` : ''}
${existingSections?.length ? `EXISTING SECTIONS (for context): ${existingSections.join(', ')}` : ''}

Generate ${sectionCount} appropriate sections for this page.`

        const aiResponse = await generate(userMessage, [], {
            model: 'fast',
            systemPrompt,
            temperature: 0.7,
        })

        // 4. Parse AI response
        let pageData
        try {
            // Extract JSON from response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                throw new Error('No JSON found in response')
            }
            pageData = JSON.parse(jsonMatch[0])
        } catch (parseError) {
            console.error('🤖 Failed to parse AI response:', parseError)
            console.error('🤖 Raw response:', aiResponse)

            // Provide fallback sections based on page type
            pageData = {
                sections: getDefaultSectionsForPage(pageName),
                pageTitle: pageName,
                metaDescription: `${pageName} page`,
            }
        }

        // 5. Return the page structure
        return NextResponse.json({
            success: true,
            page: {
                name: pageName,
                sections: pageData.sections,
                pageTitle: pageData.pageTitle,
                metaDescription: pageData.metaDescription,
            },
        })
    } catch (error) {
        console.error('🤖 Generate page error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Fallback sections based on common page types
function getDefaultSectionsForPage(pageName: string): Array<{
    id: string
    name: string
    type: string
    description: string
}> {
    const normalizedName = pageName.toLowerCase()

    if (normalizedName.includes('home')) {
        return [
            { id: 'hero', name: 'Hero', type: 'hero', description: 'Main hero section' },
            { id: 'features', name: 'Features', type: 'features', description: 'Key features' },
            { id: 'about', name: 'About', type: 'about', description: 'Brief about section' },
            { id: 'testimonials', name: 'Testimonials', type: 'testimonials', description: 'Customer reviews' },
            { id: 'cta', name: 'Call to Action', type: 'cta', description: 'Final CTA' },
        ]
    }

    if (normalizedName.includes('about')) {
        return [
            { id: 'hero', name: 'Page Header', type: 'header', description: 'Page title and intro' },
            { id: 'story', name: 'Our Story', type: 'about', description: 'Company story' },
            { id: 'values', name: 'Our Values', type: 'features', description: 'Company values' },
            { id: 'team', name: 'Our Team', type: 'team', description: 'Team members' },
            { id: 'cta', name: 'Join Us', type: 'cta', description: 'Career or contact CTA' },
        ]
    }

    if (normalizedName.includes('contact')) {
        return [
            { id: 'hero', name: 'Page Header', type: 'header', description: 'Contact page intro' },
            { id: 'form', name: 'Contact Form', type: 'contact', description: 'Main contact form' },
            { id: 'info', name: 'Contact Info', type: 'about', description: 'Address, phone, email' },
            { id: 'map', name: 'Location Map', type: 'gallery', description: 'Map embed' },
        ]
    }

    if (normalizedName.includes('service') || normalizedName.includes('product')) {
        return [
            { id: 'hero', name: 'Page Header', type: 'header', description: 'Services overview' },
            { id: 'services', name: 'Our Services', type: 'services', description: 'Service list' },
            { id: 'process', name: 'Our Process', type: 'features', description: 'How we work' },
            { id: 'pricing', name: 'Pricing', type: 'pricing', description: 'Pricing options' },
            { id: 'cta', name: 'Get Started', type: 'cta', description: 'Contact CTA' },
        ]
    }

    if (normalizedName.includes('pricing')) {
        return [
            { id: 'hero', name: 'Page Header', type: 'header', description: 'Pricing intro' },
            { id: 'pricing', name: 'Pricing Plans', type: 'pricing', description: 'Plan comparison' },
            { id: 'features', name: 'All Features', type: 'features', description: 'Feature comparison' },
            { id: 'faq', name: 'FAQ', type: 'faq', description: 'Pricing FAQs' },
            { id: 'cta', name: 'Start Now', type: 'cta', description: 'Sign up CTA' },
        ]
    }

    if (normalizedName.includes('blog')) {
        return [
            { id: 'hero', name: 'Page Header', type: 'header', description: 'Blog intro' },
            { id: 'posts', name: 'Latest Posts', type: 'blog', description: 'Blog post grid' },
            { id: 'categories', name: 'Categories', type: 'features', description: 'Blog categories' },
            { id: 'newsletter', name: 'Newsletter', type: 'cta', description: 'Newsletter signup' },
        ]
    }

    // Default sections for any page
    return [
        { id: 'hero', name: 'Page Header', type: 'header', description: 'Page title and intro' },
        { id: 'content', name: 'Main Content', type: 'about', description: 'Page content' },
        { id: 'features', name: 'Key Points', type: 'features', description: 'Important information' },
        { id: 'cta', name: 'Next Steps', type: 'cta', description: 'Call to action' },
    ]
}
