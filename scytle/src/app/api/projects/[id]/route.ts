import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, getUserFromJWT, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { UpdateProjectSchema } from '@/types'

interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * GET /api/projects/[id] - Get a single project
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        // Validate JWT
        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { databases } = createAdminClient()

        // Fetch project
        const doc = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.PROJECTS,
            id
        )

        // Verify ownership
        if (doc.userId !== user.$id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Parse sitemapData if it exists
        let sitemapData = null
        if (doc.sitemapData) {
            try {
                sitemapData = JSON.parse(doc.sitemapData)
            } catch {
                console.error('Failed to parse sitemapData')
            }
        }

        const project = {
            projectId: doc.$id,
            userId: doc.userId,
            name: doc.name,
            description: doc.description || '',
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            sitemapData,
        }

        return NextResponse.json({ project })
    } catch (error) {
        console.error('❌ Failed to fetch project:', error)
        return NextResponse.json(
            { error: 'Failed to fetch project' },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/projects/[id] - Update a project
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        // Validate JWT
        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Parse and validate body
        const body = await request.json()
        const validation = UpdateProjectSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const { databases } = createAdminClient()

        // First check ownership
        const existing = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.PROJECTS,
            id
        )

        if (existing.userId !== user.$id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Update project
        const doc = await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.PROJECTS,
            id,
            {
                ...validation.data,
                updatedAt: new Date().toISOString(),
            }
        )

        const project = {
            projectId: doc.$id,
            userId: doc.userId,
            name: doc.name,
            description: doc.description || '',
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }

        console.log('✅ Project updated:', project.projectId)

        return NextResponse.json({ project })
    } catch (error) {
        console.error('❌ Failed to update project:', error)
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/projects/[id] - Delete a project
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params

        // Validate JWT
        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { databases } = createAdminClient()

        // First check ownership
        const existing = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.PROJECTS,
            id
        )

        if (existing.userId !== user.$id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Delete project
        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PROJECTS, id)

        console.log('✅ Project deleted:', id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('❌ Failed to delete project:', error)
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        )
    }
}
