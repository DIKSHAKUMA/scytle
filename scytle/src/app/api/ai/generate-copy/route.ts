import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT } from '@/lib/appwrite-server'
import { generate } from '@/lib/ai'
import { z } from 'zod'
import {
    SECTION_COPY_PROMPT,
    buildSectionCopyPrompt,
} from '@/lib/ai/prompts/wireframe-generation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Request schema for copy generation
 */
const GenerateCopySchema = z.object({
    sectionId: z.string(),
    sectionType: z.string(),
    sectionName: z.string(),
    pageName: z.string().optional(),
    productName: z.string().optional(),
    productDescription: z.string().optional(),
})

/**
 * POST /api/ai/generate-copy
 * Generate copy for a wireframe section using AI
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
        const validation = GenerateCopySchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 }
            )
        }

        const {
            sectionId,
            sectionType,
            sectionName,
            pageName,
            productName,
            productDescription,
        } = validation.data

        console.log('🤖 Generating copy for section:', sectionName)

        // 3. Build prompt with context
        const userPrompt = buildSectionCopyPrompt(
            sectionType,
            sectionName,
            {
                pageName,
                productName,
                productDescription,
            }
        )

        // 4. Generate content using AI
        const response = await generate(userPrompt, [], {
            systemPrompt: SECTION_COPY_PROMPT,
            model: 'gemini-flash',
            temperature: 0.8,
        })

        // 5. Parse AI response
        let content
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

            content = JSON.parse(cleanResponse)

            // Ensure we have the expected structure
            content = {
                heading: content.heading || '',
                subheading: content.subheading || '',
                body: content.body || '',
                cta: content.cta || '',
                items: content.items || [],
            }

            console.log('✅ Generated copy for section:', sectionId)
        } catch (parseError) {
            console.error('❌ Failed to parse AI response:', parseError)

            // Return fallback content
            content = getDefaultContent(sectionType, sectionName)
        }

        return NextResponse.json({
            success: true,
            sectionId,
            content,
        })
    } catch (error) {
        console.error('❌ Copy generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate copy' },
            { status: 500 }
        )
    }
}

/**
 * Generate default content as fallback
 */
function getDefaultContent(sectionType: string, sectionName: string) {
    const defaults: Record<string, {
        heading: string
        subheading: string
        body: string
        cta: string
        items?: Array<{ heading: string; body: string }>
    }> = {
        hero: {
            heading: 'Transform Your Workflow Today',
            subheading: 'The all-in-one platform that helps teams work smarter, not harder.',
            body: 'Join thousands of companies who have already revolutionized their processes. Start your journey to better productivity.',
            cta: 'Get Started Free',
        },
        features: {
            heading: 'Everything You Need',
            subheading: 'Powerful features designed to help you succeed.',
            body: '',
            cta: 'Learn More',
            items: [
                { heading: 'Fast & Reliable', body: 'Lightning-fast performance you can depend on.' },
                { heading: 'Easy to Use', body: 'Intuitive interface that anyone can master.' },
                { heading: 'Secure', body: 'Enterprise-grade security for your peace of mind.' },
            ],
        },
        testimonials: {
            heading: 'What Our Customers Say',
            subheading: 'Trusted by thousands of happy users worldwide.',
            body: '',
            cta: '',
            items: [
                { heading: 'Sarah Johnson', body: 'This product completely changed how we work. Highly recommended!' },
                { heading: 'Mike Chen', body: 'The best investment we made this year. 10/10 would recommend.' },
            ],
        },
        cta: {
            heading: 'Ready to Get Started?',
            subheading: 'Join thousands of satisfied customers today.',
            body: 'Start your free trial now. No credit card required.',
            cta: 'Start Free Trial',
        },
        pricing: {
            heading: 'Simple, Transparent Pricing',
            subheading: 'Choose the plan that works for you.',
            body: 'All plans include a 14-day free trial.',
            cta: 'Get Started',
        },
        faq: {
            heading: 'Frequently Asked Questions',
            subheading: 'Find answers to common questions.',
            body: '',
            cta: 'Contact Support',
            items: [
                { heading: 'How do I get started?', body: 'Simply sign up for a free account and follow our quick setup guide.' },
                { heading: 'Is there a free trial?', body: 'Yes! All plans come with a 14-day free trial, no credit card required.' },
            ],
        },
        contact: {
            heading: 'Get in Touch',
            subheading: 'We\'d love to hear from you.',
            body: 'Have questions? Our team is here to help. Reach out anytime.',
            cta: 'Send Message',
        },
        navbar: {
            heading: 'Your Brand',
            subheading: '',
            body: '',
            cta: 'Sign Up',
        },
        footer: {
            heading: 'Your Brand',
            subheading: '© 2025 All rights reserved.',
            body: '',
            cta: '',
        },
    }

    return defaults[sectionType] || {
        heading: sectionName,
        subheading: 'Add a description here.',
        body: 'Add your content here.',
        cta: 'Learn More',
    }
}
