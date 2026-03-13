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

        console.log(`🤖 Generating HTML for "${data.pageName}" [model: ${data.model || 'claude-sonnet'}, type: ${data.productType || 'web'}]`)

        // 4. Stream SSE response
        const stream = createStreamResponse(userMessage, [], {
            model: (data.model || 'claude-sonnet') as import('@/lib/ai/config').AIModel,
            systemPrompt,
            temperature: 0.7,
            maxTokens: 16384,
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
