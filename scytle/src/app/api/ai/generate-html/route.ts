import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserFromJWT } from '@/lib/appwrite-server'
import { createStreamResponse } from '@/lib/ai'
import {
    buildPageGenerationPrompt,
    buildPageGenerationMessage,
} from '@/lib/ai/prompts/page-generation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const GenerateHtmlSchema = z.object({
    pageName: z.string().min(1, 'Page name is required'),
    pageDescription: z.string().optional(),
    projectDescription: z.string().optional(),
    industry: z.string().optional(),
    productType: z.enum(['web', 'app']).optional(),
    style: z.object({
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
        accentColor: z.string().optional(),
        bgColor: z.string().optional(),
        textColor: z.string().optional(),
        tone: z.string().optional(),
    }).optional(),
    // Multi-page context (from planner)
    themeContext: z.object({
        primary: z.string(),
        secondary: z.string(),
        accent: z.string(),
        bg: z.string(),
        text: z.string(),
        tone: z.string().optional(),
        // Extended theme values for ref matching
        fonts: z.object({
            heading: z.string(),
            body: z.string(),
        }).optional(),
        radius: z.object({
            sm: z.number(),
            md: z.number(),
            lg: z.number(),
        }).optional(),
        spacing: z.object({
            sm: z.number(),
            md: z.number(),
            lg: z.number(),
            gap: z.number(),
        }).optional(),
        shadows: z.object({
            sm: z.string(),
            md: z.string(),
        }).optional(),
        fontSizes: z.object({
            h1: z.number(),
            h2: z.number(),
            body: z.number(),
        }).optional(),
    }).optional(),
    siblingPages: z.array(z.object({
        name: z.string(),
        description: z.string(),
    })).optional(),
    model: z.string().optional(),
})

export async function POST(request: NextRequest) {
    try {
        // 1. Auth
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await getUserFromJWT(authHeader)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Validate
        const body = await request.json()
        const validation = GenerateHtmlSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 },
            )
        }

        const data = validation.data

        // 3. Build prompt
        const ctx = {
            pageName: data.pageName,
            pageDescription: data.pageDescription,
            projectDescription: data.projectDescription,
            industry: data.industry,
            productType: data.productType,
            style: data.style,
            themeContext: data.themeContext,
            siblingPages: data.siblingPages,
        }

        const systemPrompt = buildPageGenerationPrompt(ctx)
        const userMessage = buildPageGenerationMessage(ctx)

        console.log(`🤖 Generating HTML for "${data.pageName}" [model: ${data.model || 'gemini-flash'}, type: ${data.productType || 'web'}, thinking: enabled]`)

        // 4. Stream SSE response with thinking mode enabled for better design quality
        const stream = createStreamResponse(userMessage, [], {
            model: (data.model || 'gemini-flash') as import('@/lib/ai/config').AIModel,
            systemPrompt,
            temperature: 0.9, // Higher creativity for design tasks
            maxTokens: 16384,
            thinking: true,
            thinkingBudget: 4096, // More thinking budget for complex designs
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })
    } catch (error) {
        console.error('❌ Generate HTML error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        )
    }
}
