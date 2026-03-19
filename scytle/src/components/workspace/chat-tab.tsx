'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Bot, Send, Square, Sparkles, MousePointer2 } from 'lucide-react'
import { useChatStore } from '@/store/chat-store'
import { useProjectStore } from '@/store/project-store'
import { useEditorStore } from '@/store/editor-store'
import { findNodeById, findParentOfNode } from '@/types/canvas'
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
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
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
            simplifiedNodes
        )
        setInput('')
    }, [input, projectId, isStreaming, selectedIds, nodes, sendMessage])

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
                    if (actionData.action === 'replaceNode' && actionData.targetNodeId && actionData.html) {
                        console.log('🤖 AI executing replaceNode on:', actionData.targetNodeId)
                        useEditorStore.getState().replaceNode(actionData.targetNodeId, actionData.html)
                    } else if (actionData.action === 'addNode' && actionData.targetNodeId && actionData.html) {
                        console.log('🤖 AI executing addNode inside:', actionData.targetNodeId)
                        // This calls a new helper we'll add to editor store or handle directly. 
                        // For now we'll rely on the user selecting a frame to replace.
                        if(actionData.action === 'replaceNode') useEditorStore.getState().replaceNode(actionData.targetNodeId, actionData.html)
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
                            Ask AI to modify your design, add pages, or change styles.
                        </p>
                        {/* Quick action suggestions */}
                        <div className="flex flex-col gap-1.5 w-full mt-2">
                            {[
                                'Add a testimonials section',
                                'Make it dark mode',
                                'Regenerate this page',
                            ].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => {
                                        setInput(suggestion)
                                        inputRef.current?.focus()
                                    }}
                                    className="text-[11px] text-left px-3 py-2 rounded-md bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors border border-border/30"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
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
                                {msg.content}
                                {/* Streaming cursor */}
                                {msg.role === 'assistant' && isStreaming && i === messages.length - 1 && (
                                    <span className="inline-block w-1.5 h-3.5 bg-accent/60 ml-0.5 animate-pulse rounded-sm" />
                                )}
                            </p>
                        </div>
                    </div>
                ))}

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
                        <span className="truncate">{selectionPath}</span>
                    </div>
                </div>
            )}

            {/* ── Input ── */}
            <div className="p-3 border-t border-border/40 shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/40 focus-within:border-accent/40 transition-colors">
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={selectionPath ? `Edit "${selectedIds.length > 0 ? selectionPath.split(' → ').pop() : ''}"…` : 'Ask AI anything…'}
                        className="flex-1 bg-transparent text-xs placeholder:text-muted-foreground/50 outline-none"
                        disabled={!projectId}
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
    )
}
