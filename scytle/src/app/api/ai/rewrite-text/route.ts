import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generate } from '@/lib/ai'

// Request validation schema
const RewriteTextSchema = z.object({
    text: z.string().min(1).max(5000),
    action: z.enum(['rewrite', 'shorten', 'expand', 'improve', 'tone', 'custom']),
    tone: z.enum(['casual', 'professional', 'friendly', 'bold', 'empathetic']).optional(),
    customPrompt: z.string().max(500).optional(),
    sectionId: z.string().optional(),
    fieldKey: z.string().optional(),
})

// Initialize Gemini via shared Vertex AI client (see lib/ai/client.ts)

// AI prompt templates
const ACTION_PROMPTS: Record<string, string> = {
    rewrite: `Rewrite the following text while keeping the same meaning. Make it sound natural and engaging. Only return the rewritten text, no explanations.`,

    shorten: `Make the following text more concise while preserving the key message. Remove unnecessary words. Only return the shortened text, no explanations.`,

    expand: `Expand the following text with more detail and context. Make it more comprehensive while keeping it relevant. Only return the expanded text, no explanations.`,

    improve: `Improve the following text for clarity, impact, and quality. Fix any grammar issues and make it more compelling. Only return the improved text, no explanations.`,
}

const TONE_PROMPTS: Record<string, string> = {
    casual: `Rewrite the following text in a casual, conversational tone. Make it feel friendly and approachable.`,

    professional: `Rewrite the following text in a professional, business-appropriate tone. Keep it clear and authoritative.`,

    friendly: `Rewrite the following text in a warm, friendly tone. Make it welcoming and personable.`,

    bold: `Rewrite the following text in a bold, confident tone. Make it impactful and assertive.`,

    empathetic: `Rewrite the following text in an empathetic, understanding tone. Show care and consideration.`,
}

export async function POST(request: NextRequest) {
    try {
        // Parse and validate request
        const body = await request.json()
        const validation = RewriteTextSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: validation.error.issues },
                { status: 400 }
            )
        }

        const { text, action, tone, customPrompt } = validation.data

        // Build the prompt
        let systemPrompt: string

        if (action === 'custom' && customPrompt) {
            systemPrompt = `Apply the following instruction to the text: "${customPrompt}". Only return the modified text, no explanations.`
        } else if (action === 'tone' && tone) {
            systemPrompt = TONE_PROMPTS[tone]
        } else {
            systemPrompt = ACTION_PROMPTS[action] || ACTION_PROMPTS.improve
        }

        const fullPrompt = `${systemPrompt}

Text to modify:
"${text}"

Modified text:`

        // Check for Vertex AI project config
        if (!process.env.GOOGLE_CLOUD_PROJECT) {
            // Return a mock response for development
            console.warn('⚠️ GOOGLE_CLOUD_PROJECT not set, returning mock response')
            return NextResponse.json({
                text: getMockResponse(text, action, tone),
                action,
                tone,
            })
        }

        // Call Vertex AI via shared client
        const generatedText = await generate(fullPrompt, [], {
            model: 'fast',
            temperature: 0.7,
            maxTokens: 1024,
        })

        // Clean up the response (remove quotes if present)
        const cleanedText = generatedText.trim()
            .replace(/^["']|["']$/g, '')
            .replace(/^Modified text:\s*/i, '')
            .trim()

        console.log('🤖 AI rewrite:', { action, tone, original: text.substring(0, 50), result: cleanedText.substring(0, 50) })

        return NextResponse.json({
            text: cleanedText,
            action,
            tone,
        })

    } catch (error) {
        console.error('❌ AI rewrite error:', error)
        return NextResponse.json(
            { error: 'Failed to rewrite text' },
            { status: 500 }
        )
    }
}

// Mock response for development without API key
function getMockResponse(text: string, action: string, tone?: string): string {
    const words = text.split(' ')

    switch (action) {
        case 'shorten':
            return words.slice(0, Math.ceil(words.length * 0.6)).join(' ')
        case 'expand':
            return `${text} This provides additional context and detail to enhance the message.`
        case 'rewrite':
            return `[Rewritten] ${text}`
        case 'improve':
            return `[Improved] ${text}`
        case 'tone':
            return `[${tone}] ${text}`
        case 'custom':
            return `[Custom] ${text}`
        default:
            return text
    }
}
