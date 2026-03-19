import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT } from '@/lib/appwrite-server'
import { z } from 'zod'
import { getSectionsForPage } from '@/lib/ai/section-templates'
import { generate } from '@/lib/ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Request schema for wireframe generation
 */
const GenerateWireframeSchema = z.object({
    pageId: z.string(),
    pageName: z.string(),
    pageDescription: z.string().optional(),
    pageContext: z.enum(['marketing', 'application', 'auth']).optional(),
    projectId: z.string().optional(),
    projectDescription: z.string().optional(),
    /** If true, use AI to enrich the section descriptions with realistic content */
    enrichWithAI: z.boolean().optional(),
})

/**
 * POST /api/wireframe/generate
 *
 * Generate wireframe sections for a page.
 * Uses deterministic templates by default (instant), with optional AI enrichment.
 * Client-side `createSection()` resolves componentId and design controls.
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

        const { pageId, pageName, pageContext, projectDescription, enrichWithAI } = validation.data
        const context = pageContext || inferPageContext(pageName)
        const slug = `/${pageName.toLowerCase().replace(/\s+/g, '-')}`

        console.log('🤖 Generating wireframe for page:', pageName, '(context:', context, ')')

        // 3. Get sections from deterministic templates — instant, no AI call
        const templateSections = getSectionsForPage(pageName, slug, context)

        let sections = templateSections.map((s, index) => ({
            id: `${s.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${index}`,
            type: s.type,
            name: s.name,
            description: s.description,
            isGlobal: s.type === 'navbar' || s.type === 'footer',
            order: index,
        }))

        // 4. Optionally enrich with AI for better section descriptions
        if (enrichWithAI && projectDescription) {
            try {
                console.log('🧠 Enriching sections with AI...')
                const enrichPrompt = `You are enriching wireframe section descriptions for a page called "${pageName}" in a project described as: "${projectDescription}".

For each section below, generate a more specific, detailed description with realistic content ideas. Keep descriptions concise (1-2 sentences) but specific to the project.

Current sections:
${sections.map((s, i) => `${i + 1}. ${s.name} (${s.type}): ${s.description}`).join('\n')}

Return ONLY a JSON array of objects with "name" and "description" fields. No markdown, no explanation.
Example: [{"name": "Hero", "description": "Headline: 'Build AI-Powered Apps in Minutes' with a gradient CTA button and product screenshot"}]`

                const aiResult = await generate(enrichPrompt, [], {
                    model: 'fast',
                    maxTokens: 2048,
                    temperature: 0.6,
                })

                // Parse AI enrichment
                const jsonMatch = aiResult.match(/\[[\s\S]*\]/)
                if (jsonMatch) {
                    const enriched = JSON.parse(jsonMatch[0]) as Array<{ name: string; description: string }>
                    sections = sections.map((s, i) => ({
                        ...s,
                        name: enriched[i]?.name || s.name,
                        description: enriched[i]?.description || s.description,
                    }))
                    console.log('✅ AI enrichment applied')
                }
            } catch (error) {
                // AI enrichment is optional — fall back to templates
                console.warn('⚠️ AI enrichment failed, using template descriptions:', error instanceof Error ? error.message : error)
            }
        }

        console.log('✅ Generated', sections.length, 'sections', enrichWithAI ? '(AI-enriched)' : '(deterministic)')

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

/** Infer page context from name (server-side helper) */
function inferPageContext(name: string): 'marketing' | 'application' | 'auth' {
    const s = name.toLowerCase()
    if (/\b(login|signup|sign[- ]?in|sign[- ]?up|register|forgot|reset|verify)\b/.test(s)) return 'auth'
    if (/\b(dashboard|settings|analytics|projects|orders|account|billing|reports|users|members|admin|inbox|tasks)\b/.test(s)) return 'application'
    return 'marketing'
}