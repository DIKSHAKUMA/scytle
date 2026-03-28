import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT, createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { Query, ID } from 'node-appwrite'
import { z } from 'zod'

interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * GET /api/projects/[id]/chat
 * Load chat conversation history for a project
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params

        // 1. Authenticate
        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Verify project ownership
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

        // 3. Fetch conversation history
        try {
            const conversations = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.AI_CONVERSATIONS,
                [Query.equal('projectId', projectId), Query.limit(1)]
            )

            if (conversations.documents.length === 0) {
                return NextResponse.json({ messages: [] })
            }

            const conv = conversations.documents[0]
            const messagesJson = conv.messages as string

            if (!messagesJson) {
                return NextResponse.json({ messages: [] })
            }

            const messages = JSON.parse(messagesJson)

            return NextResponse.json({ messages: Array.isArray(messages) ? messages : [] })
        } catch (error) {
            console.error('📦 Error loading conversation history:', error)
            return NextResponse.json({ messages: [] })
        }

    } catch (error) {
        console.error('❌ Chat history error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

const SaveMessagesSchema = z.object({
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
        timestamp: z.string(),
    })),
})

/**
 * POST /api/projects/[id]/chat
 * Save full conversation messages for a project
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params

        // 1. Authenticate
        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Validate input
        const body = await request.json()
        const validation = SaveMessagesSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }

        // 3. Verify project ownership
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

        // 4. Save messages — keep last 50
        const trimmed = validation.data.messages.slice(-50)

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
                        messages: JSON.stringify(trimmed),
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
                        messages: JSON.stringify(trimmed),
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
