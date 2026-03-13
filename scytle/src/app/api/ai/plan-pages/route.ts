import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserFromJWT } from '@/lib/appwrite-server'
import { generate } from '@/lib/ai'
import {
    buildPagePlannerPrompt,
    buildPagePlannerMessage,
    type PagePlan,
} from '@/lib/ai/prompts/page-planner'
import type { AIModel } from '@/lib/ai/config'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PlanPagesSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    productType: z.enum(['web', 'app']).optional(),
    model: z.string().optional(),
})

// Validate the AI-generated plan matches expected shape
const PagePlanSchema = z.object({
    projectName: z.string(),
    theme: z.object({
        primary: z.string(),
        secondary: z.string(),
        accent: z.string(),
        bg: z.string(),
        text: z.string(),
        tone: z.string(),
    }),
    pages: z.array(z.object({
        name: z.string(),
        description: z.string(),
        pageType: z.enum(['marketing', 'application', 'auth', 'content']),
        priority: z.number(),
    })).min(1).max(8),
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

        // 2. Validate input
        const body = await request.json()
        const validation = PlanPagesSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 },
            )
        }

        const data = validation.data
        const productType = data.productType ?? 'web'
        const modelKey = (data.model || 'claude-sonnet') as AIModel

        console.log(`📋 Planning pages for "${data.description.slice(0, 50)}..." [model: ${modelKey}, type: ${productType}]`)

        // 3. Generate page plan (non-streaming)
        const systemPrompt = buildPagePlannerPrompt(productType)
        const userMessage = buildPagePlannerMessage(data.description)

        let rawResponse: string
        try {
            rawResponse = await generate(userMessage, [], {
                model: modelKey,
                systemPrompt,
                temperature: 0.7,
                maxTokens: 4096,
            })
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error)
            const errStack = error instanceof Error ? error.stack : ''
            console.error('❌ Page planner generation failed:', errMsg)
            console.error('Stack:', errStack)
            return NextResponse.json(
                { error: `Failed to generate page plan: ${errMsg}` },
                { status: 500 },
            )
        }

        // 4. Parse and validate JSON
        let plan: PagePlan
        try {
            // Strip markdown fences if present
            let json = rawResponse.trim()
            const fenceMatch = json.match(/^```(?:json)?\s*\n([\s\S]*?)```\s*$/)
            if (fenceMatch) json = fenceMatch[1].trim()

            const parsed = JSON.parse(json)
            plan = PagePlanSchema.parse(parsed)
        } catch (error) {
            console.error('❌ Failed to parse page plan JSON:', error)
            console.error('Raw response:', rawResponse.slice(0, 500))
            return NextResponse.json(
                { error: 'AI returned invalid page plan format' },
                { status: 500 },
            )
        }

        console.log(`✅ Page plan created: "${plan.projectName}" with ${plan.pages.length} pages`)

        return NextResponse.json({ plan })
    } catch (error) {
        console.error('❌ Plan pages error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        )
    }
}
