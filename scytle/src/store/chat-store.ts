import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Message, MessageRole } from '@/types'
import { createJWT } from '@/lib/appwrite'
import { useUnifiedStore } from './unified-store'
import { useProjectStore } from './project-store'

interface ChatState {
    // State
    messages: Message[]
    isTyping: boolean
    isStreaming: boolean
    error: string | null
    currentProjectId: string | null
    abortController: AbortController | null

    // Actions
    sendMessage: (content: string, projectId: string) => Promise<void>
    generateSitemap: (projectId: string, description: string) => Promise<void>
    loadHistory: (projectId: string) => Promise<void>
    addMessage: (role: MessageRole, content: string) => void
    updateLastMessage: (content: string) => void
    clearMessages: () => void
    setProjectId: (projectId: string) => void
    clearError: () => void
    stopGeneration: () => void
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
        sendMessage: async (content: string, projectId: string) => {
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

                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${jwt.jwt}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: content, projectId }),
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

        // Generate sitemap using AI
        generateSitemap: async (projectId: string, description: string) => {
            // Add user message
            const userMessage: Message = {
                role: 'user',
                content: `Generate a sitemap for: ${description}`,
                timestamp: new Date().toISOString(),
            }

            set(state => {
                state.messages.push(userMessage)
                state.isTyping = true
                state.error = null
            })

            try {
                const jwt = await createJWT()
                if (!jwt) {
                    throw new Error('Not authenticated')
                }

                const response = await fetch('/api/ai/generate-sitemap', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${jwt.jwt}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        projectId,
                        projectDescription: description
                    }),
                })

                if (!response.ok) {
                    throw new Error('Failed to generate sitemap')
                }

                const data = await response.json()

                if (data.success && data.sitemap) {
                    // Load sitemap into the unified store using pages data
                    // This will apply proper tree layout automatically
                    // Get project name from the sitemap response or project store
                    const projectName = data.sitemap.projectName ||
                        useProjectStore.getState().currentProject?.name ||
                        'My Project'
                    useUnifiedStore.getState().loadFromAI(
                        data.sitemap.pages,
                        projectName
                    )

                    // Add success message
                    const pageNames = data.sitemap.pages.map((p: { label: string }) => p.label).join(', ')
                    set(state => {
                        state.messages.push({
                            role: 'assistant',
                            content: `✅ I've generated your sitemap! It includes these pages: **${pageNames}**.\n\nYou can now:\n- Click on any page to edit its details\n- Drag pages to reorganize them\n- Use the "Add" tool (A) to add new pages\n- Click on a page to see and edit its sections`,
                            timestamp: new Date().toISOString(),
                        })
                        state.isTyping = false
                    })
                } else {
                    throw new Error('Invalid sitemap response')
                }
            } catch (error) {
                set(state => {
                    state.error = error instanceof Error ? error.message : 'Failed to generate sitemap'
                    state.isTyping = false
                    state.messages.push({
                        role: 'assistant',
                        content: '❌ Sorry, I had trouble generating the sitemap. Please try again or describe your project in more detail.',
                        timestamp: new Date().toISOString(),
                    })
                })
            }
        },

        // Load conversation history
        loadHistory: async (projectId: string) => {
            set(state => {
                state.currentProjectId = projectId
                state.messages = []
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
    }))
)
