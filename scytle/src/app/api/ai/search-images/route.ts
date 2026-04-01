import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserFromJWT } from '@/lib/appwrite-server'
import { batchSearchImages, type ImageQuery } from '@/lib/ai/unsplash'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SearchImagesSchema = z.object({
    queries: z.array(z.object({
        key: z.string(),
        query: z.string(),
        count: z.number().min(1).max(5).optional(),
        orientation: z.enum(['landscape', 'portrait', 'squarish']).optional(),
    })).min(1).max(20),
    color: z.string().optional(),
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
        const validation = SearchImagesSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 },
            )
        }

        const data = validation.data

        // 3. Batch search
        const queries: ImageQuery[] = data.queries.map(q => ({
            key: q.key,
            query: q.query,
            count: q.count,
            orientation: q.orientation,
        }))

        const images = await batchSearchImages(queries)

        return NextResponse.json({ images })
    } catch (error) {
        console.error('❌ Search images error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        )
    }
}
