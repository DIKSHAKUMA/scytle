import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserFromJWT } from '@/lib/appwrite-server'
import { generateSection } from '@/lib/ai/pipeline/generate-section'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SectionSchema = z.object({
    type: z.string(),
    layout: z.string(),
    imageQuery: z.string().nullable(),
    description: z.string(),
})

const GenerateSectionsSchema = z.object({
    pageName: z.string().min(1),
    brandName: z.string().min(1),
    brandDescription: z.string().optional(),
    productType: z.enum(['web', 'app']).optional(),
    model: z.string().optional(),
    theme: z.object({
        primary: z.string(),
        secondary: z.string(),
        accent: z.string(),
        bg: z.string(),
        text: z.string(),
    }),
    fonts: z.object({
        heading: z.string(),
        body: z.string(),
    }).optional(),
    sections: z.array(SectionSchema).min(1).max(12),
    /** Pre-resolved images keyed by imageQuery */
    images: z.record(z.string(), z.array(z.object({
        url: z.string(),
        alt: z.string(),
    }))).optional(),
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
        const validation = GenerateSectionsSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 },
            )
        }

        const data = validation.data
        const sections = data.sections
        const images = data.images || {}

        console.log(`🏗️ Generating ${sections.length} sections for "${data.pageName}" [model: ${data.model || 'gemini-flash'}]`)

        // 3. Fire all sections in parallel
        const sectionPromises = sections.map((section, i) => {
            const sectionImages = section.imageQuery ? (images[section.imageQuery] || []) : []

            return generateSection({
                section,
                context: {
                    pageName: data.pageName,
                    brandName: data.brandName,
                    brandDescription: data.brandDescription,
                    theme: data.theme,
                    fonts: data.fonts,
                    images: sectionImages.length > 0 ? sectionImages : undefined,
                    prevSection: i > 0 ? { type: sections[i - 1].type, description: sections[i - 1].description } : undefined,
                    nextSection: i < sections.length - 1 ? { type: sections[i + 1].type, description: sections[i + 1].description } : undefined,
                    productType: data.productType,
                },
                model: data.model,
            })
        })

        const sectionHtmls = await Promise.all(sectionPromises)

        console.log(`✅ Generated ${sectionHtmls.length} sections for "${data.pageName}"`)

        return NextResponse.json({ sections: sectionHtmls })
    } catch (error) {
        console.error('❌ Generate sections error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        )
    }
}
