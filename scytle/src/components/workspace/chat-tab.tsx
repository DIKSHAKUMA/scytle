'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Bot, Send, Square, Sparkles, MousePointer2, ChevronDown, Zap } from 'lucide-react'
import { useChatStore } from '@/store/chat-store'
import { useProjectStore } from '@/store/project-store'
import { useEditorStore } from '@/store/editor-store'
import { findNodeById, findParentOfNode } from '@/types/canvas'
import { parseHtmlToNodes } from '@/lib/parser'
import { ModelSelector } from '@/components/model-selector'
import { getDefaultModel } from '@/lib/ai/models'
import type { ScytleNode } from '@/types/canvas'

/**
 * Build the selection path for the currently selected node, e.g.:
 * "Home Page → Hero Section → CTA Button"
 */
function getSelectionPath(nodes: readonly ScytleNode[], selectedIds: string[]): string | null {
    if (selectedIds.length === 0) return null

    const nodeId = selectedIds[0]
    const node = findNodeById(nodes as ScytleNode[], nodeId)
    if (!node) return null

    const pathParts: string[] = [node.name]
    let currentId = nodeId

    // Walk up the parent chain
    while (true) {
        const result = findParentOfNode(nodes as ScytleNode[], currentId)
        if (!result || !result.parent) break
        pathParts.unshift(result.parent.name)
        currentId = result.parent.id
    }

    return pathParts.join(' → ')
}

export function ChatTab() {
    const projectId = useProjectStore((s) => s.currentProject?.projectId)

    const messages = useChatStore((s) => s.messages)
    const isTyping = useChatStore((s) => s.isTyping)
    const isStreaming = useChatStore((s) => s.isStreaming)
    const error = useChatStore((s) => s.error)
    const sendMessage = useChatStore((s) => s.sendMessage)
    const loadHistory = useChatStore((s) => s.loadHistory)
    const stopGeneration = useChatStore((s) => s.stopGeneration)
    const clearError = useChatStore((s) => s.clearError)

    const selectedIds = useEditorStore((s) => s.selectedIds)
    const nodes = useEditorStore((s) => s.nodes)

    const [input, setInput] = useState('')
    const [selectedModel, setSelectedModel] = useState(getDefaultModel().key)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const historyLoaded = useRef(false)

    // Build selection context
    const selectionPath = getSelectionPath(nodes, selectedIds)

    // Load chat history on mount
    useEffect(() => {
        if (projectId && !historyLoaded.current) {
            historyLoaded.current = true
            loadHistory(projectId)
        }
    }, [projectId, loadHistory])

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    // Send message handler
    const handleSend = useCallback(() => {
        if (!input.trim() || !projectId || isStreaming) return

        let messageContent = input.trim()
        
        // Map nodes into a simplified structure to send as context
        const simplifiedNodes = nodes.map(n => ({
            id: n.id,
            type: (n as any).type,
            parentId: (n as any).parentId,
            html: (n as any).data?.html || ''
        }))

        // Send with strict selection and canvas context
        sendMessage(
            messageContent, 
            projectId,
            selectedIds.length > 0 ? selectedIds[0] : null,
            simplifiedNodes,
            selectedModel
        )
        setInput('')
        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
    }, [input, projectId, isStreaming, selectedIds, nodes, sendMessage, selectedModel])

    // --- Execute JSON Design Actions from AI response ---
    // The AI might return a block like: ```json\n { "action": "replaceNode", "targetNodeId": "id", "html": "..." } \n```
    useEffect(() => {
        if (messages.length === 0) return

        const lastMessage = messages[messages.length - 1]
        // We only parse the action if the stream has finished to ensure the JSON is complete
        if (lastMessage.role === 'assistant' && !isStreaming) {
            const jsonMatch = lastMessage.content.match(/```json\n([\s\S]*?)\n```/)
            if (jsonMatch) {
                try {
                    const actionData = JSON.parse(jsonMatch[1])
                    const store = useEditorStore.getState()

                    if (actionData.html) {
                        // Convert HTML string → ScytleNode tree via parser
                        const parsed = parseHtmlToNodes(actionData.html, 'AI Section')
                        // Use the first child if the wrapper frame only has one child
                        const newNode: ScytleNode = parsed.children.length === 1
                            ? parsed.children[0]
                            : parsed

                        if (actionData.action === 'replaceNode' && actionData.targetNodeId) {
                            console.log('🤖 AI executing replaceNode on:', actionData.targetNodeId)
                            // Preserve position from old node
                            const oldNode = findNodeById(store.nodes, actionData.targetNodeId)
                            if (oldNode) {
                                newNode.x = oldNode.x
                                newNode.y = oldNode.y
                                newNode.id = oldNode.id
                            }
                            store.replaceNode(actionData.targetNodeId, newNode)
                        } else if (actionData.action === 'addNode' && actionData.targetNodeId) {
                            console.log('🤖 AI executing addNode inside:', actionData.targetNodeId)
                            store.addNode(newNode, actionData.targetNodeId)
                        }
                    } else if (actionData.action === 'deleteNode' && actionData.targetNodeId) {
                        console.log('🤖 AI executing deleteNode:', actionData.targetNodeId)
                        store.deleteNode(actionData.targetNodeId)
                    }
                } catch (e) {
                    console.error("Failed to parse design action from AI:", e)
                }
            }
        }
    }, [messages, isStreaming])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Auto-resize textarea
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
        const el = e.target
        el.style.height = 'auto'
        el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }

    // Strip JSON code blocks from AI messages for cleaner display
    const renderMessageContent = (content: string) => {
        return content.replace(/```json\n[\s\S]*?\n```/g, '').trim()
    }

    // Context-aware suggestions
    const suggestions = selectionPath
        ? [
            'Redesign this section',
            'Make it dark mode',
            'Improve the layout',
        ]
        : [
            'Add a hero section',
            'Add a testimonials section',
            'Generate a landing page',
        ]

    return (
        <div className="flex flex-col h-full">
            {/* ── Messages area ── */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                {messages.length === 0 && !isTyping && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-accent" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                            Ask AI to modify your design, add sections, or change styles.
                        </p>
                        {/* Quick action suggestions */}
                        <div className="flex flex-col gap-1.5 w-full mt-2">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => {
                                        setInput(suggestion)
                                        textareaRef.current?.focus()
                                    }}
                                    className="text-[11px] text-left px-3 py-2 rounded-md bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors border border-border/30"
                                >
                                    <Zap className="w-3 h-3 inline-block mr-1.5 -mt-0.5 text-accent/60" />
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => {
                    const displayContent = msg.role === 'assistant'
                        ? renderMessageContent(msg.content)
                        : msg.content

                    if (!displayContent) return null

                    return (
                        <div key={i} className="flex gap-2">
                            {msg.role === 'assistant' ? (
                                <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                                    <Bot className="w-3 h-3 text-accent" />
                                </div>
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-[9px] font-semibold text-primary">U</span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
                                    {displayContent}
                                    {/* Streaming cursor */}
                                    {msg.role === 'assistant' && isStreaming && i === messages.length - 1 && (
                                        <span className="inline-block w-1.5 h-3.5 bg-accent/60 ml-0.5 animate-pulse rounded-sm" />
                                    )}
                                </p>
                            </div>
                        </div>
                    )
                })}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="flex gap-2">
                        <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="w-3 h-3 text-accent" />
                        </div>
                        <div className="flex gap-1 items-center pt-1">
                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}

                {/* Error display */}
                {error && (
                    <div className="mx-1 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                        <p className="text-[11px] text-destructive">{error}</p>
                        <button
                            onClick={clearError}
                            className="text-[10px] text-destructive/70 underline mt-1"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* ── Selection context bar ── */}
            {selectionPath && (
                <div className="px-3 py-1.5 border-t border-border/30 bg-accent/5 shrink-0">
                    <div className="flex items-center gap-1.5 text-[10px] text-accent">
                        <MousePointer2 className="w-3 h-3" />
                        <span className="truncate font-medium">{selectionPath}</span>
                    </div>
                </div>
            )}

            {/* ── Input area ── */}
            <div className="p-2 border-t border-border/40 shrink-0 space-y-1.5">
                <div className="flex flex-col rounded-lg bg-muted/40 border border-border/40 focus-within:border-accent/40 transition-colors">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        placeholder={selectionPath ? `Edit "${selectionPath.split(' → ').pop()}"…` : 'Ask AI anything…'}
                        className="w-full bg-transparent text-xs placeholder:text-muted-foreground/50 outline-none resize-none px-3 pt-2.5 pb-1 min-h-[32px] max-h-[120px]"
                        rows={1}
                        disabled={!projectId}
                    />
                    <div className="flex items-center justify-between px-2 pb-1.5">
                        <ModelSelector
                            value={selectedModel}
                            onChange={setSelectedModel}
                            compact
                        />
                        {isStreaming ? (
                            <button
                                onClick={stopGeneration}
                                className="w-6 h-6 rounded-md flex items-center justify-center text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="Stop generating"
                            >
                                <Square className="w-3 h-3" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || !projectId}
                                className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-accent hover:bg-accent/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
