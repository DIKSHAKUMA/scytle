import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT, createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { Query } from 'node-appwrite'

interface RouteParams {
    params: Promise<{ id: string; threadId: string }>
}

/** Helper: find thread document by threadId field */
async function findThread(databases: any, threadId: string) {
    const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.AI_THREADS,
        [Query.equal('threadId', threadId), Query.limit(1)]
    )
    return result.documents[0] || null
}

/**
 * GET /api/projects/[id]/threads/[threadId]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, threadId } = await params

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

        const doc = await findThread(databases, threadId)
        if (!doc) {
            return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
        }

        return NextResponse.json({
            remoteId: doc.threadId,
            status: doc.status,
            title: doc.title || undefined,
        })
    } catch (error) {
        console.error('Thread get error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * PATCH /api/projects/[id]/threads/[threadId]
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, threadId } = await params

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

        const doc = await findThread(databases, threadId)
        if (!doc) {
            return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
        }

        const body = await request.json()
        const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() }
        if (body.status !== undefined) updates.status = body.status
        if (body.title !== undefined) updates.title = body.title

        await databases.updateDocument(DATABASE_ID, COLLECTIONS.AI_THREADS, doc.$id, updates)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Thread update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/projects/[id]/threads/[threadId]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId, threadId } = await params

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

        // Delete all messages for this thread
        let hasMore = true
        while (hasMore) {
            const msgs = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.AI_MESSAGES,
                [Query.equal('threadId', threadId), Query.limit(100)]
            )
            for (const msg of msgs.documents) {
                await databases.deleteDocument(DATABASE_ID, COLLECTIONS.AI_MESSAGES, msg.$id)
            }
            hasMore = msgs.documents.length === 100
        }

        // Delete the thread document
        const doc = await findThread(databases, threadId)
        if (doc) {
            await databases.deleteDocument(DATABASE_ID, COLLECTIONS.AI_THREADS, doc.$id)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Thread delete error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
