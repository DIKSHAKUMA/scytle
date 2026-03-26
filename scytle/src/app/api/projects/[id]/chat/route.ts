import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT, createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { Query } from 'node-appwrite'

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
