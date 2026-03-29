import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserFromJWT } from '@/lib/appwrite-server'
import { generate } from '@/lib/ai'
import type { AIModel } from '@/lib/ai/config'

const AnalyzeImageSchema = z.object({
    projectId: z.string().min(1),
    images: z.array(z.object({
        mimeType: z.string(),
        data: z.string(),
    })).min(1).max(5),
    userPrompt: z.string().max(2000).optional(),
})

const ANALYZE_PROMPT = `You are a design analysis expert. Analyze the provided reference image(s) and extract a detailed design specification.

Your job is NOT to describe what the image shows abstractly. Your job is to produce a CONCRETE BUILD SPECIFICATION that another AI can use to recreate the design in HTML/Tailwind CSS.

OUTPUT FORMAT — respond with valid JSON only, no markdown fences, no extra text:
{
  "description": "A detailed, actionable description of what to build. Describe EVERY section from top to bottom: the navigation bar (links, logo placement), the hero section (headline text, subtext, CTA buttons, background treatment), each content section (cards, grids, testimonials, features, stats), and the footer. Include actual text content you can read from the image. Describe layout structure (grid columns, flex arrangements), visual effects (gradients, shadows, rounded corners), and content density.",
  "theme": {
    "primary": "#hex (main brand/accent color — buttons, links, active states)",
    "secondary": "#hex (secondary brand color — borders, secondary buttons)",
    "accent": "#hex (highlight/decorative color — badges, success states)",
    "bg": "#hex (main page background color)",
    "text": "#hex (main text color)"
  },
  "sections": [
    "Section 1: detailed description of what this section contains, its layout, and visual treatment",
    "Section 2: ...",
    "..."
  ],
  "style": {
    "tone": "dark/light/mixed — overall theme mood",
    "borderRadius": "none/subtle/rounded/very-rounded — how rounded are elements",
    "spacing": "compact/normal/generous — overall spacing feel",
    "typography": "describe the heading style (bold? thin? uppercase?) and body text style"
  }
}

CRITICAL RULES:
1. Extract EXACT hex color values from the image — do not guess or use generic colors.
2. Describe every visible section in order from top to bottom.
3. Include any text content you can read from the image.
4. Note specific layout patterns: number of grid columns, flex direction, alignment.
5. Note visual effects: gradients (directions and colors), shadows, borders, overlays.
6. For images/photos in the reference, describe their subject so appropriate Unsplash photos can be selected.
7. Output ONLY valid JSON. No markdown, no explanation, just the JSON object.`

/**
 * POST /api/ai/analyze-image
 * Analyze reference image(s) using gemini-pro (vision) and return a structured design spec.
 * This is step 1 of the two-step image-to-design pipeline.
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate
        const authHeader = request.headers.get('Authorization')
        const user = await getUserFromJWT(authHeader)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Validate
        const body = await request.json()
        const validation = AnalyzeImageSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 }
            )
        }

        const { images, userPrompt } = validation.data

        // 3. Build user message
        const userMessage = userPrompt
            ? `Analyze this reference image and create a build specification. The user wants: "${userPrompt}". Extract the design details and output JSON.`
            : `Analyze this reference image and create a build specification. Extract every design detail and output JSON.`

        console.log(`🖼️ Analyzing ${images.length} reference image(s) with gemini-pro`)

        // 4. Call gemini-pro (vision-capable) for analysis
        const aiResponse = await generate(userMessage, [], {
            model: 'gemini-pro' as AIModel,
            systemPrompt: ANALYZE_PROMPT,
            temperature: 0.3,
            maxTokens: 4096,
            images,
        })

        // 5. Parse JSON response
        let analysis
        try {
            analysis = JSON.parse(aiResponse.trim())
        } catch {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                console.error('❌ analyze-image: No JSON in response:', aiResponse.substring(0, 500))
                return NextResponse.json(
                    { error: 'Failed to analyze image. Please try again.' },
                    { status: 502 }
                )
            }
            analysis = JSON.parse(jsonMatch[0])
        }

        if (!analysis.description || !analysis.theme) {
            return NextResponse.json(
                { error: 'Incomplete analysis. Please try again.' },
                { status: 502 }
            )
        }

        console.log(`✅ Image analysis complete: ${analysis.sections?.length || 0} sections, tone: ${analysis.style?.tone || 'unknown'}`)

        return NextResponse.json(analysis)

    } catch (error) {
        console.error('❌ analyze-image error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
