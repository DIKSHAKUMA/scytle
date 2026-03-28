'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Bot, Send, Square, Sparkles, Zap, Loader2, X } from 'lucide-react'
import { useChatStore } from '@/store/chat-store'
import { useProjectStore } from '@/store/project-store'
import { useEditorStore } from '@/store/editor-store'
import { findNodeById, findParentOfNode } from '@/types/canvas'
import { parseHtmlToNodes } from '@/lib/parser'
import { nodeToHtml } from '@/lib/export'
import { generatePage } from '@/lib/generate-page'
import { ModelSelector } from '@/components/model-selector'
import { getDefaultModel } from '@/lib/ai/models'
import type { ScytleNode } from '@/types/canvas'
import type { Fill } from '@/types/canvas'

// ── Helpers ────────────────────────────────────────────────

/** Detect if a message is asking to create/generate a full page design */
const PAGE_GENERATION_PATTERN = /\b(create|design|generate|build|make)\b.*\b(page|landing|website|site|homepage|portfolio|dashboard|storefront|blog|layout)\b/i

function isPageGenerationRequest(message: string): boolean {
    return PAGE_GENERATION_PATTERN.test(message)
}

/** Recursively collect all image sources from a node tree (ImageNode.src + FrameNode image fills) */
function collectImageSources(node: ScytleNode): string[] {
    const sources: string[] = []
    if (node.type === 'image' && node.src) {
        sources.push(node.src)
    } else if (node.type === 'frame') {
        const imgFill = node.fills.find((f: Fill) => f.type === 'image' && 'src' in f && f.src)
        if (imgFill && imgFill.type === 'image' && imgFill.src) {
            sources.push(imgFill.src)
        }
        for (const child of node.children) {
            sources.push(...collectImageSources(child))
        }
    }
    return sources
}

/** Restore image sources in a new node tree from the original sources list (in-order matching) */
function restoreImageSources(node: ScytleNode, sources: string[], index: { i: number }): void {
    if (index.i >= sources.length) return

    if (node.type === 'image' && node.src) {
        node.src = sources[index.i] || node.src
        index.i++
    } else if (node.type === 'frame') {
        const imgFill = node.fills.find((f: Fill) => f.type === 'image' && 'src' in f)
        if (imgFill && imgFill.type === 'image') {
            imgFill.src = sources[index.i] || imgFill.src
            index.i++
        }
        for (const child of node.children) {
            restoreImageSources(child, sources, index)
        }
    }
}

/** Returns [{ id, name }] from leaf → root so we can render chips root→leaf */
function getSelectionAncestors(
    nodes: readonly ScytleNode[],
    selectedIds: string[]
): Array<{ id: string; name: string }> {
    if (selectedIds.length === 0) return []
    const nodeId = selectedIds[0]
    const node = findNodeById(nodes as ScytleNode[], nodeId)
    if (!node) return []

    const chain: Array<{ id: string; name: string }> = [{ id: node.id, name: node.name }]
    let currentId = nodeId
    while (true) {
        const result = findParentOfNode(nodes as ScytleNode[], currentId)
        if (!result?.parent) break
        chain.unshift({ id: result.parent.id, name: result.parent.name })
        currentId = result.parent.id
    }
    return chain
}

export function ChatTab() {
    // Use URL params for immediate projectId (fast), fall back to project store (slower)
    const params = useParams()
    const storeProjectId = useProjectStore((s) => s.currentProject?.projectId)
    const projectId = storeProjectId || (params?.id as string) || undefined

    const messages = useChatStore((s) => s.messages)
    const isTyping = useChatStore((s) => s.isTyping)
    const isStreaming = useChatStore((s) => s.isStreaming)
    const error = useChatStore((s) => s.error)
    const sendMessage = useChatStore((s) => s.sendMessage)
    const refineNode = useChatStore((s) => s.refineNode)
    const addMessage = useChatStore((s) => s.addMessage)
    const loadHistory = useChatStore((s) => s.loadHistory)
    const stopGeneration = useChatStore((s) => s.stopGeneration)
    const clearError = useChatStore((s) => s.clearError)

    const selectedIds = useEditorStore((s) => s.selectedIds)
    const nodes = useEditorStore((s) => s.nodes)
    const replaceNode = useEditorStore((s) => s.replaceNode)
    const addNode = useEditorStore((s) => s.addNode)
    const deleteNode = useEditorStore((s) => s.deleteNode)

    const [input, setInput] = useState('')
    const [selectedModel, setSelectedModel] = useState(getDefaultModel().key)
    const [isRefining, setIsRefining] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const historyLoaded = useRef(false)

    // Build selection context — list of ancestor chips (root→leaf)
    const ancestors = getSelectionAncestors(nodes, selectedIds)
    const hasSelection = ancestors.length > 0
    // The leaf node (innermost selected)
    const selectedNode = hasSelection ? findNodeById(nodes as ScytleNode[], selectedIds[0]) : null
    const selectedNodeName = selectedNode?.name ?? ''

    const isbusy = isStreaming || isTyping || isRefining
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)

    // Load chat history on mount
    useEffect(() => {
        if (projectId && !historyLoaded.current) {
            historyLoaded.current = true
            setIsLoadingHistory(true)
            loadHistory(projectId).finally(() => setIsLoadingHistory(false))
        }
    }, [projectId, loadHistory])

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping, isRefining])

    // Auto-scroll to bottom when chat tab becomes visible (tab switch)
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' })
                }
            },
            { threshold: 0.1 }
        )
        observer.observe(container)
        return () => observer.disconnect()
    }, [])

    // ── Refine mode: apply the clean JSON result from /api/ai/refine-node ─
    const handleRefine = useCallback(async () => {
        if (!input.trim() || !projectId || isbusy || !selectedNode) return

        const prompt = input.trim()
        setInput('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
        setIsRefining(true)

        // Serialize the selected node to HTML so the AI can see exactly what it looks like
        const selectedNodeHtml = nodeToHtml(selectedNode)

        // Collect sibling/parent context (short excerpts, not full HTML)
        const contextNodes = nodes
            .filter(n => n.id !== selectedNode.id)
            .slice(0, 12)
            .map(n => ({
                id: n.id,
                name: n.name,
                type: n.type,
                htmlSnippet: nodeToHtml(n).substring(0, 300),
            }))

        const result = await refineNode({
            projectId,
            nodeId: selectedNode.id,
            nodeHtml: selectedNodeHtml,
            nodeName: selectedNode.name,
            prompt,
            contextNodes,
            model: selectedModel,
        })

        setIsRefining(false)

        if (result?.html) {
            try {
                const parsed = parseHtmlToNodes(result.html, selectedNode.name)
                const newNode: ScytleNode = parsed.children.length === 1 ? parsed.children[0] : parsed
                // Preserve position, dimensions & id from the original node
                newNode.x = selectedNode.x
                newNode.y = selectedNode.y
                newNode.width = selectedNode.width
                newNode.height = selectedNode.height
                newNode.id = selectedNode.id

                // Restore image sources from original node tree (safety net)
                const originalImages = collectImageSources(selectedNode)
                if (originalImages.length > 0) {
                    restoreImageSources(newNode, originalImages, { i: 0 })
                }

                replaceNode(selectedNode.id, newNode)
                console.log('🤖 refine-node applied to:', selectedNode.id)
            } catch (e) {
                console.error('❌ Failed to parse refined HTML:', e)
            }
        }
    }, [input, projectId, isbusy, selectedNode, nodes, refineNode, selectedModel, replaceNode])

    // ── Conversational mode: streaming chat when no node is selected ──────
    const handleChat = useCallback(async () => {
        if (!input.trim() || !projectId || isbusy) return

        const messageContent = input.trim()
        setInput('')
        if (textareaRef.current) textareaRef.current.style.height = 'auto'

        // Route full-page design requests to the generatePage() pipeline
        // for production-quality output (rich prompts, thinking mode, real images)
        if (isPageGenerationRequest(messageContent) && !hasSelection) {
            addMessage('user', messageContent)
            addMessage('assistant', 'Generating your design... This may take a moment.')
            setIsRefining(true)

            try {
                const projectName = useProjectStore.getState().currentProject?.name
                const projectDesc = useProjectStore.getState().currentProject?.description

                const frame = await generatePage({
                    pageName: messageContent.substring(0, 60),
                    pageDescription: messageContent,
                    projectDescription: projectDesc || projectName || undefined,
                    model: selectedModel,
                })

                // Position the new frame next to existing nodes
                const existingNodes = useEditorStore.getState().nodes
                if (existingNodes.length > 0) {
                    const maxX = Math.max(...existingNodes.map(n => n.x + n.width))
                    frame.x = maxX + 100
                } else {
                    frame.x = 0
                }
                frame.y = 0

                addNode(frame)

                // Update the assistant message with success
                useChatStore.getState().updateLastMessage(
                    `Done! I've created "${frame.name}" on your canvas. You can select it to refine further.`
                )

                // Persist conversation
                useChatStore.getState()._persistMessages(projectId)
            } catch (err) {
                useChatStore.getState().updateLastMessage(
                    `Failed to generate the design: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`
                )
            } finally {
                setIsRefining(false)
            }
            return
        }

        // Default: streaming chat with canvas context
        const simplifiedNodes = nodes.map(n => ({
            id: n.id,
            type: n.type,
            parentId: n.type === 'frame' ? undefined : undefined,
            html: nodeToHtml(n).substring(0, 500),
        }))

        sendMessage(
            messageContent,
            projectId,
            selectedIds.length > 0 ? selectedIds[0] : null,
            simplifiedNodes,
            selectedModel
        )
    }, [input, projectId, isbusy, hasSelection, selectedIds, nodes, sendMessage, addMessage, addNode, selectedModel])

    const handleSend = useCallback(() => {
        if (hasSelection) handleRefine()
        else handleChat()
    }, [hasSelection, handleRefine, handleChat])

    // ── Execute JSON Design Actions from streaming conversational responses ─
    // Only active in conversational mode (no selection). The AI may return a
    // JSON block describing addNode/deleteNode/replaceNode actions.
    // Track executed message count to avoid re-executing on history load.
    const executedUpTo = useRef(0)

    // On history load, mark all existing messages as already-executed
    useEffect(() => {
        if (messages.length > 0 && executedUpTo.current === 0) {
            executedUpTo.current = messages.length
        }
    }, [messages.length])

    useEffect(() => {
        if (messages.length === 0 || isStreaming) return
        // Only execute actions from NEW messages (not loaded history)
        if (messages.length <= executedUpTo.current) return

        const lastMessage = messages[messages.length - 1]
        if (lastMessage.role !== 'assistant') return

        // Mark as executed
        executedUpTo.current = messages.length

        const jsonMatch = lastMessage.content.match(/```json\n([\s\S]*?)\n```/)
        if (!jsonMatch) return

        try {
            const actionData = JSON.parse(jsonMatch[1])

            if (actionData.html) {
                const parsed = parseHtmlToNodes(actionData.html, 'AI Section')
                const newNode: ScytleNode = parsed.children.length === 1
                    ? parsed.children[0]
                    : parsed

                if (actionData.action === 'replaceNode' && actionData.targetNodeId) {
                    const oldNode = findNodeById(nodes as ScytleNode[], actionData.targetNodeId)
                    if (oldNode) {
                        newNode.x = oldNode.x
                        newNode.y = oldNode.y
                        newNode.id = oldNode.id
                    }
                    replaceNode(actionData.targetNodeId, newNode)
                } else if (actionData.action === 'addNode' && actionData.targetNodeId) {
                    addNode(newNode, actionData.targetNodeId)
                }
            } else if (actionData.action === 'deleteNode' && actionData.targetNodeId) {
                deleteNode(actionData.targetNodeId)
            }
        } catch {
            // Parsing failure is non-fatal; user sees the AI text response
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages, isStreaming])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
        const el = e.target
        el.style.height = 'auto'
        el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }

    // Strip JSON code blocks from assistant messages for cleaner display
    const renderMessageContent = (content: string) =>
        content.replace(/```json\n[\s\S]*?\n```/g, '').trim()

    // Context-aware quick suggestions
    const suggestions = hasSelection
        ? ['Make it dark mode', 'Improve spacing & typography', 'Add more visual hierarchy']
        : ['Add a hero section', 'Add a testimonials section', 'Generate a landing page']

    return (
        <div ref={containerRef} className="flex flex-col h-full">
            {/* ── Messages area ── */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {isLoadingHistory && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                        <p className="text-xs text-muted-foreground">Loading chat history...</p>
                    </div>
                )}

                {!isLoadingHistory && messages.length === 0 && !isTyping && !isRefining && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-accent" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                            {hasSelection
                                ? `Selected: ${selectedNodeName}. Describe a change and the AI will apply it.`
                                : 'Select an element on canvas to refine it, or ask anything.'}
                        </p>
                        <div className="flex flex-col gap-1.5 w-full mt-2">
                            {suggestions.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { setInput(s); textareaRef.current?.focus() }}
                                    className="text-[11px] text-left px-3 py-2 rounded-md bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors border border-border/30"
                                >
                                    <Zap className="w-3 h-3 inline-block mr-1.5 -mt-0.5 text-accent/60" />
                                    {s}
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
                                    {msg.role === 'assistant' && isStreaming && i === messages.length - 1 && (
                                        <span className="inline-block w-1.5 h-3.5 bg-accent/60 ml-0.5 animate-pulse rounded-sm" />
                                    )}
                                </p>
                            </div>
                        </div>
                    )
                })}

                {/* Typing / refining indicator */}
                {(isTyping || isRefining) && (
                    <div className="flex gap-2 items-center">
                        <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                            {isRefining
                                ? <Loader2 className="w-3 h-3 text-accent animate-spin" />
                                : <Bot className="w-3 h-3 text-accent" />}
                        </div>
                        {isRefining ? (
                            <span className="text-[11px] text-muted-foreground italic">
                                Applying changes to <span className="text-accent font-medium">{selectedNodeName}</span>…
                            </span>
                        ) : (
                            <div className="flex gap-1 items-center pt-1">
                                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="mx-1 p-2 rounded-md bg-destructive/10 border border-destructive/20">
                        <p className="text-[11px] text-destructive">{error}</p>
                        <button onClick={clearError} className="text-[10px] text-destructive/70 underline mt-1">
                            Dismiss
                        </button>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* ── Input area ── */}
            <div className="p-2 border-t border-border/40 shrink-0 space-y-1.5">
                <div className="flex flex-col rounded-lg bg-muted/40 border border-border/40 focus-within:border-accent/40 transition-colors">

                    {/* Context chips — shown INSIDE the input box when a node is selected */}
                    {hasSelection && (
                        <div className="flex items-center gap-1 px-2 pt-2 flex-wrap">
                            {ancestors.map((a, idx) => (
                                <span
                                    key={a.id}
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                        idx === ancestors.length - 1
                                            ? 'bg-accent/15 text-accent border border-accent/30'
                                            : 'bg-muted/60 text-muted-foreground border border-border/40'
                                    }`}
                                >
                                    {a.name}
                                    {/* Allow dismissing the leaf selection */}
                                    {idx === ancestors.length - 1 && (
                                        <button
                                            onClick={() => useEditorStore.getState().setSelectedIds([])}
                                            className="opacity-50 hover:opacity-100 transition-opacity -mr-0.5"
                                            title="Deselect"
                                        >
                                            <X className="w-2.5 h-2.5" />
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}

                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        placeholder={hasSelection
                            ? `Describe changes to "${selectedNodeName}"…`
                            : 'Ask AI anything…'}
                        className="w-full bg-transparent text-xs placeholder:text-muted-foreground/50 outline-none resize-none px-3 pt-2 pb-1 min-h-[32px] max-h-[120px]"
                        rows={1}
                        disabled={!projectId || isbusy}
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
                                disabled={!input.trim() || !projectId || isbusy}
                                className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/50 hover:text-accent hover:bg-accent/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {isRefining
                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    : <Send className="w-3.5 h-3.5" />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Mode label */}
                <p className="text-[10px] text-muted-foreground/40 text-center">
                    {hasSelection ? '⌬ Refine mode — edits apply to selected node' : '◎ Chat mode — ask anything or select a node'}
                </p>
            </div>
        </div>
    )
}
