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
            wireframeData: doc.wireframeData || null,
            canvasData: doc.canvasData || null,
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

        // Extract wireframeData and canvasData separately - they may not exist in Appwrite yet
        const { wireframeData, canvasData, ...updateData } = validation.data

        // Build the update payload with only fields that exist in Appwrite
        const updatePayload: Record<string, unknown> = {
            ...updateData,
            updatedAt: new Date().toISOString(),
        }

        // Only include wireframeData if the attribute exists in Appwrite
        // To enable: Add 'wireframeData' string attribute to projects collection in Appwrite console
        if (wireframeData !== undefined) {
            try {
                // Try to include wireframeData - will work if attribute exists
                updatePayload.wireframeData = wireframeData
            } catch {
                console.warn('⚠️ wireframeData attribute not configured in Appwrite - skipping')
            }
        }

        // Only include canvasData if the attribute exists in Appwrite
        // To enable: Add 'canvasData' string attribute (size: 1000000) to projects collection in Appwrite console
        if (canvasData !== undefined) {
            updatePayload.canvasData = canvasData
        }

        // Update project
        let doc
        try {
            doc = await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.PROJECTS,
                id,
                updatePayload
            )
        } catch (error: unknown) {
            // If wireframeData or canvasData causes the error, retry without them
            if (error instanceof Error && (error.message?.includes('wireframeData') || error.message?.includes('canvasData'))) {
                console.warn('⚠️ wireframeData/canvasData attribute not in Appwrite schema - saving without it')
                delete updatePayload.wireframeData
                delete updatePayload.canvasData
                doc = await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.PROJECTS,
                    id,
                    updatePayload
                )
            } else {
                throw error
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
            wireframeData: doc.wireframeData || null,
        }

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

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('❌ Failed to delete project:', error)
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        )
    }
}
