import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT, createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { Query, ID } from 'node-appwrite'

interface RouteParams {
    params: Promise<{ id: string; threadId: string }>
}

/**
 * Trim tool-invocation results to avoid storing large payloads.
 * The full tool results (HTML, node trees, images) have already been applied
 * to the canvas — we only need a small summary for chat history.
 */
function trimLargeContent(content: string): string {
    try {
        const parsed = JSON.parse(content)
        if (!parsed.parts || !Array.isArray(parsed.parts)) return content

        const trimmedParts = parsed.parts.map((part: Record<string, unknown>) => {
            if (part.type === 'tool-invocation' && part.result != null) {
                const result = part.result as Record<string, unknown>
                const summary: Record<string, unknown> = {}
                for (const [k, v] of Object.entries(result)) {
                    if (typeof v === 'boolean' || typeof v === 'number') {
                        summary[k] = v
                    } else if (typeof v === 'string' && v.length <= 200) {
                        summary[k] = v
                    } else if (typeof v === 'string') {
                        summary[k] = v.slice(0, 100) + '...'
                    }
                }
                return { ...part, result: summary }
            }
            return part
        })

        return JSON.stringify({ ...parsed, parts: trimmedParts })
    } catch {
        return content
    }
}

/**
 * GET /api/projects/[id]/threads/[threadId]/messages
 * Load all messages for a thread
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

        // Fetch all messages for this thread, paginated
        const allMessages: Array<{
            id: string
            parent_id: string | null
            format: string
            content: Record<string, unknown>
        }> = []
        let headId: string | null = null
        let offset = 0
        let hasMore = true

        while (hasMore) {
            const result = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.AI_MESSAGES,
                [
                    Query.equal('threadId', threadId),
                    Query.orderAsc('createdAt'),
                    Query.limit(100),
                    Query.offset(offset),
                ]
            )

            for (const doc of result.documents) {
                allMessages.push({
                    id: (doc.messageId || doc.$id) as string,
                    parent_id: doc.parentId || null,
                    format: doc.format as string,
                    content: JSON.parse(doc.content as string),
                })
            }

            offset += result.documents.length
            hasMore = result.documents.length === 100
        }

        // Head = tail of the parent chain (the message that no other message points to as parent)
        if (allMessages.length > 0) {
            const childParentIds = new Set(allMessages.map((m) => m.parent_id).filter(Boolean))
            const tails = allMessages.filter((m) => !childParentIds.has(m.id))
            // If multiple tails (branches), pick the last one
            headId = tails.length > 0 ? tails[tails.length - 1]!.id : allMessages[allMessages.length - 1]!.id
        }

        return NextResponse.json({ headId, messages: allMessages })
    } catch (error) {
        console.error('Message list error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/projects/[id]/threads/[threadId]/messages
 * Upsert a single message or batch of messages
 *
 * Body for single: { id, parentId, format, content, isHead? }
 * Body for batch:  { batch: true, messages: [...], headId? }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

        const body = await request.json()

        if (body.batch) {
            // Batch upsert
            const messages = body.messages as Array<{
                id: string
                parent_id: string | null
                format: string
                content: Record<string, unknown>
            }>
            const headId = body.headId as string | undefined

            for (const msg of messages) {
                const contentStr = trimLargeContent(JSON.stringify(msg.content))
                const isHead = headId ? (msg.id === headId ? 'true' : null) : null

                await upsertMessage(databases, msg.id, {
                    threadId,
                    projectId,
                    parentId: msg.parent_id || null,
                    format: msg.format,
                    content: contentStr,
                    isHead,
                    createdAt: new Date().toISOString(),
                })
            }

            return NextResponse.json({ success: true, count: messages.length })
        }

        // Single message upsert
        const { id: msgId, parentId, format, content, isHead } = body

        if (!msgId || !format) {
            return NextResponse.json({ error: 'id and format are required' }, { status: 400 })
        }

        const contentStr = trimLargeContent(
            typeof content === 'string' ? content : JSON.stringify(content)
        )

        await upsertMessage(databases, msgId, {
            threadId,
            projectId,
            parentId: parentId || null,
            format,
            content: contentStr,
            isHead: isHead ? 'true' : null,
            createdAt: new Date().toISOString(),
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Message upsert error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

async function upsertMessage(
    databases: any,
    msgId: string,
    data: Record<string, unknown>
) {
    // Check if message already exists by messageId field
    const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.AI_MESSAGES,
        [Query.equal('messageId', msgId), Query.limit(1)]
    )

    if (existing.documents.length > 0) {
        // Update existing
        const { createdAt, ...updateData } = data
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.AI_MESSAGES,
            existing.documents[0].$id,
            updateData
        )
    } else {
        // Create new with auto-generated ID
        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.AI_MESSAGES,
            ID.unique(),
            { messageId: msgId, ...data }
        )
    }
}
