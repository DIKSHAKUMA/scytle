import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Message, MessageRole, ImageAttachment } from '@/types'
import { createJWT } from '@/lib/appwrite'
import { extractBase64Data } from '@/lib/image-utils'
import { useSitemapStore } from './sitemap-store'
import { useProjectStore } from './project-store'

export interface RefineNodeContext {
    projectId: string
    nodeId: string
    nodeHtml: string
    nodeName?: string
    prompt: string
    contextNodes?: Array<{ id: string; name?: string; type?: string; htmlSnippet: string }>
    model?: string
    images?: ImageAttachment[]
}

export interface RefineNodeResult {
    html: string
    summary: string
    nodeId: string
}

interface ChatState {
    // State
    messages: Message[]
    isTyping: boolean
    isStreaming: boolean
    error: string | null
    currentProjectId: string | null
    abortController: AbortController | null

    // Actions
    sendMessage: (content: string, projectId: string, selectedNodeId?: string | null, canvasNodes?: any[], model?: string, images?: ImageAttachment[]) => Promise<void>
    /** Surgical node refinement — calls /api/ai/refine-node, returns parsed result or null on failure */
    refineNode: (ctx: RefineNodeContext) => Promise<RefineNodeResult | null>
    loadHistory: (projectId: string) => Promise<void>
    addMessage: (role: MessageRole, content: string) => void
    updateLastMessage: (content: string) => void
    clearMessages: () => void
    setProjectId: (projectId: string) => void
    clearError: () => void
    stopGeneration: () => void
    /** Internal: persist current messages to DB */
    _persistMessages: (projectId: string) => Promise<void>
}

export const useChatStore = create<ChatState>()(
    immer((set, get) => ({
        // Initial state
        messages: [],
        isTyping: false,
        isStreaming: false,
        error: null,
        currentProjectId: null,
        abortController: null,

        // Send message to AI
        sendMessage: async (
            content: string,
            projectId: string,
            selectedNodeId?: string | null,
            canvasNodes?: any[],
            model?: string,
            images?: ImageAttachment[]
        ) => {
            // Create abort controller for this request
            const abortController = new AbortController()

            // Add user message immediately
            const userMessage: Message = {
                role: 'user',
                content,
                timestamp: new Date().toISOString(),
            }

            set(state => {
                state.messages.push(userMessage)
                state.isTyping = true
                state.isStreaming = true
                state.error = null
                state.abortController = abortController as unknown as AbortController
            })

            try {
                const jwt = await createJWT()
                if (!jwt) {
                    throw new Error('Not authenticated')
                }

                const imagePayload = images?.map(img => extractBase64Data(img.dataUrl))

                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${jwt.jwt}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: content,
                        projectId,
                        selectedNodeId,
                        canvasNodes,
                        model,
                        images: imagePayload,
                    }),
                    signal: abortController.signal,
                })

                if (!response.ok) {
                    throw new Error('Failed to send message')
                }

                // Handle streaming response
                const reader = response.body?.getReader()
                if (!reader) {
                    throw new Error('No response body')
                }

                // Add empty assistant message to stream into
                set(state => {
                    state.messages.push({
                        role: 'assistant',
                        content: '',
                        timestamp: new Date().toISOString(),
                    })
                    state.isTyping = false
                })

                const decoder = new TextDecoder()
                let buffer = ''

                while (true) {
                    const { done, value } = await reader.read()

                    if (done) break

                    buffer += decoder.decode(value, { stream: true })

                    // Process SSE data
                    const lines = buffer.split('\n')
                    buffer = lines.pop() || '' // Keep incomplete line in buffer

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6)
                            if (data === '[DONE]') continue

                            try {
                                const parsed = JSON.parse(data)
                                if (parsed.text) {
                                    set(state => {
                                        const lastMessage = state.messages[state.messages.length - 1]
                                        if (lastMessage.role === 'assistant') {
                                            lastMessage.content += parsed.text
                                        }
                                    })
                                }
                                if (parsed.error) {
                                    set(state => {
                                        state.error = parsed.error
                                    })
                                }
                            } catch {
                                // Ignore parse errors for incomplete JSON
                            }
                        }
                    }
                }

                set(state => {
                    state.isStreaming = false
                    state.abortController = null
                })

                // Save full conversation to DB (async, fire-and-forget)
                get()._persistMessages(projectId)
            } catch (error) {
                // Ignore abort errors
                if (error instanceof Error && error.name === 'AbortError') {
                    set(state => {
                        state.isTyping = false
                        state.isStreaming = false
                        state.abortController = null
                    })
                    return
                }

                set(state => {
                    state.error = error instanceof Error ? error.message : 'Failed to send message'
                    state.isTyping = false
                    state.isStreaming = false
                    state.abortController = null
                })
            }
        },

        // Surgical node refinement — calls the clean /api/ai/refine-node endpoint
        refineNode: async (ctx: RefineNodeContext): Promise<RefineNodeResult | null> => {
            const { projectId, nodeId, nodeHtml, nodeName, prompt, contextNodes, model, images } = ctx

            // Show the user's message immediately
            set(state => {
                state.messages.push({
                    role: 'user',
                    content: prompt,
                    timestamp: new Date().toISOString(),
                })
                state.isTyping = true
                state.error = null
            })

            try {
                const jwt = await createJWT()
                if (!jwt) throw new Error('Not authenticated')

                const imagePayload = images?.map(img => extractBase64Data(img.dataUrl))

                const response = await fetch('/api/ai/refine-node', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${jwt.jwt}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ projectId, nodeId, nodeHtml, nodeName, prompt, contextNodes, model, images: imagePayload }),
                })

                const data = await response.json()

                if (!response.ok || !data.html) {
                    const errorMsg = data.error || 'Refinement failed. Please try again.'
                    set(state => {
                        state.messages.push({
                            role: 'assistant',
                            content: `❌ ${errorMsg}`,
                            timestamp: new Date().toISOString(),
                        })
                        state.isTyping = false
                        state.error = errorMsg
                    })
                    return null
                }

                const summary = data.summary || 'Changes applied.'
                set(state => {
                    state.messages.push({
                        role: 'assistant',
                        content: `✅ ${summary}`,
                        timestamp: new Date().toISOString(),
                    })
                    state.isTyping = false
                })

                // Persist conversation to DB
                get()._persistMessages(projectId)

                return { html: data.html, summary, nodeId: data.nodeId ?? nodeId }
            } catch (error) {
                const msg = error instanceof Error ? error.message : 'Refinement failed'
                set(state => {
                    state.messages.push({
                        role: 'assistant',
                        content: `❌ ${msg}`,
                        timestamp: new Date().toISOString(),
                    })
                    state.isTyping = false
                    state.error = msg
                })
                return null
            }
        },

        // Load conversation history
        loadHistory: async (projectId: string) => {
            const current = get()
            // If we already have messages for this project, skip re-fetching
            if (current.currentProjectId === projectId && current.messages.length > 0) {
                return
            }

            const isSwitchingProject = current.currentProjectId !== projectId

            set(state => {
                state.currentProjectId = projectId
                // Only clear messages when switching to a different project
                if (isSwitchingProject) {
                    state.messages = []
                }
                state.error = null
            })

            try {
                const jwt = await createJWT()
                if (!jwt) {
                    throw new Error('Not authenticated')
                }

                const response = await fetch(`/api/projects/${projectId}/chat`, {
                    headers: {
                        'Authorization': `Bearer ${jwt.jwt}`,
                    },
                })

                if (!response.ok) {
                    // No history yet is fine
                    if (response.status === 404) return
                    throw new Error('Failed to load chat history')
                }

                const data = await response.json()

                set(state => {
                    state.messages = data.messages || []
                })
            } catch (error) {
                set(state => {
                    state.error = error instanceof Error ? error.message : 'Failed to load history'
                })
            }
        },

        // Add a message locally
        addMessage: (role: MessageRole, content: string) => {
            set(state => {
                state.messages.push({
                    role,
                    content,
                    timestamp: new Date().toISOString(),
                })
            })
        },

        // Update last message (for streaming)
        updateLastMessage: (content: string) => {
            set(state => {
                const lastMessage = state.messages[state.messages.length - 1]
                if (lastMessage) {
                    lastMessage.content = content
                }
            })
        },

        // Clear all messages
        clearMessages: () => {
            set(state => {
                state.messages = []
                state.error = null
            })
        },

        // Set current project ID
        setProjectId: (projectId: string) => {
            set(state => {
                state.currentProjectId = projectId
            })
        },

        // Clear error
        clearError: () => {
            set(state => {
                state.error = null
            })
        },

        // Stop current generation
        stopGeneration: () => {
            const { abortController } = get()
            if (abortController) {
                abortController.abort()
            }
            set(state => {
                state.isTyping = false
                state.isStreaming = false
                state.abortController = null
            })
        },

        // Persist current messages to DB
        _persistMessages: async (projectId: string) => {
            try {
                const jwt = await createJWT()
                if (!jwt) return

                const { messages } = get()
                await fetch(`/api/projects/${projectId}/chat`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${jwt.jwt}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ messages }),
                })
            } catch (error) {
                console.error('📦 Error persisting messages:', error)
            }
        },
    }))
)
