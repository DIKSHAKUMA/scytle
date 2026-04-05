import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT, createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { Query, ID } from 'node-appwrite'

interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * GET /api/projects/[id]/chat
 * Load all chat threads + messages for a project
 *
 * Returns: { threads: StoredThread[], messages: Record<threadId, StoredMessageRepo> }
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

        try {
            const conversations = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.AI_CONVERSATIONS,
                [Query.equal('projectId', projectId), Query.limit(1)]
            )

            if (conversations.documents.length === 0) {
                return NextResponse.json({ threads: [], messages: {} })
            }

            const conv = conversations.documents[0]
            const data = conv.messages as string

            if (!data) {
                return NextResponse.json({ threads: [], messages: {} })
            }

            const parsed = JSON.parse(data)

            // Support both old format (flat messages array) and new format (threads + messages)
            if (Array.isArray(parsed)) {
                // Old format — return empty (can't convert old format meaningfully)
                return NextResponse.json({ threads: [], messages: {} })
            }

            return NextResponse.json({
                threads: parsed.threads ?? [],
                messages: parsed.messages ?? {},
            })
        } catch (error) {
            console.error('📦 Error loading conversation history:', error)
            return NextResponse.json({ threads: [], messages: {} })
        }

    } catch (error) {
        console.error('❌ Chat history error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/projects/[id]/chat
 * Save all chat threads + messages for a project
 *
 * Body: { threads: StoredThread[], messages: Record<threadId, StoredMessageRepo> }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params

        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
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

        const payload = JSON.stringify({
            threads: body.threads ?? [],
            messages: body.messages ?? {},
        })

        try {
            const conversations = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.AI_CONVERSATIONS,
                [Query.equal('projectId', projectId), Query.limit(1)]
            )

            if (conversations.documents.length > 0) {
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.AI_CONVERSATIONS,
                    conversations.documents[0].$id,
                    {
                        messages: payload,
                        updatedAt: new Date().toISOString(),
                    }
                )
            } else {
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.AI_CONVERSATIONS,
                    ID.unique(),
                    {
                        projectId,
                        messages: payload,
                        context: JSON.stringify({}),
                        updatedAt: new Date().toISOString(),
                    }
                )
            }
        } catch (error) {
            console.error('📦 Error saving messages:', error)
            return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('❌ Chat save error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
