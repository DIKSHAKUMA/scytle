import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT, createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { createStreamResponse, ChatMessage } from '@/lib/ai'
import { ChatMessageSchema } from '@/types'
import { Query, ID } from 'node-appwrite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/chat
 * Send a message to the AI and stream the response
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user
        const authHeader = request.headers.get('Authorization')
        const user = await getUserFromJWT(authHeader)

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // 2. Validate input
        const body = await request.json()
        const validation = ChatMessageSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 }
            )
        }

        const { message, projectId } = validation.data

        // 3. Verify user owns the project
        const { databases } = createAdminClient()

        let project
        try {
            project = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.PROJECTS,
                projectId
            )
        } catch {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        if (project.userId !== user.$id) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        // 4. Load conversation history
        let conversationHistory: ChatMessage[] = []
        let conversationId: string | null = null

        try {
            const conversations = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.AI_CONVERSATIONS,
                [Query.equal('projectId', projectId), Query.limit(1)]
            )

            if (conversations.documents.length > 0) {
                const conv = conversations.documents[0]
                conversationId = conv.$id

                // Parse messages from stored JSON string
                const messagesJson = conv.messages as string
                if (messagesJson) {
                    const storedMessages = JSON.parse(messagesJson) as unknown[]
                    if (Array.isArray(storedMessages)) {
                        conversationHistory = storedMessages.map((msg: unknown) => {
                            const m = msg as { role: string; content: string; timestamp: string }
                            return {
                                role: m.role as 'user' | 'assistant',
                                content: m.content,
                                timestamp: new Date(m.timestamp),
                            }
                        })
                    }
                }
            }
        } catch (error) {
            console.error('📦 Error loading conversation:', error)
            // Continue without history
        }

        // 5. Create streaming response
        // If the client sent canvas context, we inject it as a system prompt
        // to turn the AI into a design agent capable of structured JSON actions.
        let systemPrompt: string | undefined = 'default'
        const hasCanvasContext = validation.data.canvasNodes && validation.data.canvasNodes.length > 0

        if (hasCanvasContext) {
            const { buildDesignChatPrompt } = await import('@/lib/ai/prompts/chat-design')
            systemPrompt = buildDesignChatPrompt({
                canvasNodes: validation.data.canvasNodes || [],
                selectedNodeId: validation.data.selectedNodeId
            })
        }

        const stream = createStreamResponse(message, conversationHistory, {
            model: 'gemini-pro', // Upgrade from 'fast' to 'gemini-pro' for complex reasoning
            systemPrompt: systemPrompt
        })

        // 6. Save user message to conversation (async, don't await)
        saveMessageToConversation(
            databases,
            projectId,
            conversationId,
            { role: 'user', content: message, timestamp: new Date() }
        ).catch(console.error)

        // 7. Return streaming response
        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        })
    } catch (error) {
        console.error('🤖 Chat API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * Save a message to the conversation history
 */
async function saveMessageToConversation(
    databases: ReturnType<typeof createAdminClient>['databases'],
    projectId: string,
    conversationId: string | null,
    message: ChatMessage
) {
    const messageData = {
        role: message.role,
        content: message.content,
        timestamp: message.timestamp.toISOString(),
    }

    try {
        if (conversationId) {
            // Get existing conversation
            const conv = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.AI_CONVERSATIONS,
                conversationId
            )

            // Parse existing messages (stored as JSON string)
            const existingMessages = conv.messages ? JSON.parse(conv.messages as string) : []

            // Add new message
            const messages = [...existingMessages, messageData]

            // Keep only last 50 messages
            const trimmedMessages = messages.slice(-50)

            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.AI_CONVERSATIONS,
                conversationId,
                {
                    messages: JSON.stringify(trimmedMessages),
                    updatedAt: new Date().toISOString()
                }
            )
        } else {
            // Create new conversation
            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.AI_CONVERSATIONS,
                ID.unique(),
                {
                    projectId,
                    messages: JSON.stringify([messageData]),
                    context: JSON.stringify({}),
                    updatedAt: new Date().toISOString(),
                }
            )
        }
    } catch (error) {
        console.error('📦 Error saving message:', error)
    }
}
