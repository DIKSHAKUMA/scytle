import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT } from '@/lib/appwrite-server'
import { generate } from '@/lib/ai'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Request schema for section suggestion
 */
const SuggestSectionSchema = z.object({
    pageId: z.string(),
    pageName: z.string(),
    pageDescription: z.string().optional(),
    existingSections: z.array(z.object({
        type: z.string(),
        name: z.string(),
    })).optional(),
    position: z.enum(['top', 'bottom', 'middle']).optional(),
})

/**
 * System prompt for section suggestions
 */
const SUGGESTION_PROMPT = `You are an expert UI/UX designer. Suggest a single section that would improve a web page.

Consider:
1. The page's purpose and what's already there
2. What's missing that users typically expect
3. Industry best practices
4. The position where the section will be added

Return a JSON object with:
- type: section type (hero, features, testimonials, pricing, faq, cta, contact, team, stats, logos, gallery, blog, footer, navbar)
- name: descriptive name
- description: brief explanation of what this section does
- componentId: format {type}-{number}
- reason: why this section would be a good addition

Return ONLY valid JSON, no markdown.`

/**
 * POST /api/ai/suggest-section
 * Get AI suggestion for a new section to add to a page
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
        const validation = SuggestSectionSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 }
            )
        }

        const { pageName, pageDescription, existingSections, position } = validation.data

        console.log('🤖 Suggesting section for page:', pageName)

        // 3. Build context about existing sections
        const existingContext = existingSections?.length
            ? `\n\nExisting sections on this page:\n${existingSections.map(s => `- ${s.type}: ${s.name}`).join('\n')}`
            : ''

        const positionContext = position
            ? `\n\nThe section will be added at the ${position} of the page.`
            : ''

        // 4. Generate suggestion using AI
        const userPrompt = `Suggest a section to add to the following page:

Page Name: ${pageName}
${pageDescription ? `Description: ${pageDescription}` : ''}${existingContext}${positionContext}

What section would improve this page? Return ONLY valid JSON.`

        const response = await generate(userPrompt, [], {
            systemPrompt: SUGGESTION_PROMPT,
            model: 'fast',
            temperature: 0.7,
        })

        // 5. Parse AI response
        let suggestion
        try {
            // Clean up response
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

            suggestion = JSON.parse(cleanResponse)

            // Ensure required fields
            suggestion = {
                type: suggestion.type || 'generic',
                name: suggestion.name || 'New Section',
                description: suggestion.description || '',
                componentId: suggestion.componentId || `${suggestion.type || 'generic'}-1`,
                reason: suggestion.reason || 'This section would improve the page.',
                isGlobal: suggestion.type === 'navbar' || suggestion.type === 'footer',
            }
        } catch (parseError) {
            console.error('❌ Failed to parse AI response:', parseError)

            // Return a fallback suggestion
            suggestion = {
                type: 'cta',
                name: 'Call to Action',
                description: 'A compelling call to action to convert visitors',
                componentId: 'cta-1',
                reason: 'Every page benefits from a clear call to action.',
                isGlobal: false,
            }
        }

        console.log('✅ Section suggestion:', suggestion.type)

        return NextResponse.json({ suggestion })

    } catch (error) {
        console.error('❌ Section suggestion error:', error)
        return NextResponse.json(
            { error: 'Failed to suggest section' },
            { status: 500 }
        )
    }
}
