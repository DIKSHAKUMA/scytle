import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT, createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { Query, ID } from 'node-appwrite'

interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * GET /api/projects/[id]/threads
 * List all chat threads for a project
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params

        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { databases } = createAdminClient()

        let project
        try {
            project = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROJECTS, projectId)
        } catch {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        if (project.userId !== user.$id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.AI_THREADS,
            [
                Query.equal('projectId', projectId),
                Query.orderDesc('createdAt'),
                Query.limit(100),
            ]
        )

        const threads = result.documents.map((doc) => ({
            remoteId: doc.threadId as string,
            status: doc.status as 'regular' | 'archived',
            title: (doc.title as string) || undefined,
        }))

        return NextResponse.json({ threads })
    } catch (error) {
        console.error('Thread list error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/projects/[id]/threads
 * Create or update a thread
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params

        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { databases } = createAdminClient()

        let project
        try {
            project = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROJECTS, projectId)
        } catch {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        if (project.userId !== user.$id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const body = await request.json()
        const { threadId, status, title } = body

        if (!threadId) {
            return NextResponse.json({ error: 'threadId is required' }, { status: 400 })
        }

        const now = new Date().toISOString()

        // Check if thread already exists
        const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.AI_THREADS,
            [Query.equal('threadId', threadId), Query.limit(1)]
        )

        if (existing.documents.length > 0) {
            // Update existing
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.AI_THREADS,
                existing.documents[0].$id,
                {
                    status: status || 'regular',
                    title: title || undefined,
                    updatedAt: now,
                }
            )
        } else {
            // Create new with auto-generated ID
            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.AI_THREADS,
                ID.unique(),
                {
                    threadId,
                    projectId,
                    status: status || 'regular',
                    title: title || null,
                    createdAt: now,
                    updatedAt: now,
                }
            )
        }

        return NextResponse.json({
            remoteId: threadId,
            status: status || 'regular',
            title: title || undefined,
        })
    } catch (error) {
        console.error('Thread create error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
