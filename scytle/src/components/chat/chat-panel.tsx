'use client'

/**
 * Chat Panel — Uses assistant-ui Thread + custom tool side-effects
 *
 * Architecture:
 *   useChatRuntime wraps useChat internally
 *   → AssistantRuntimeProvider provides runtime to Thread
 *   → Thread handles all UI (messages, composer, reasoning, tools)
 *   → makeAssistantToolUI registers tool side-effects + visual cards
 */

import { useEffect, useMemo, useRef } from 'react'
import {
    AssistantRuntimeProvider,
    makeAssistantToolUI,
    useRemoteThreadListRuntime,
} from '@assistant-ui/react'
import { useAISDKRuntime } from '@assistant-ui/react-ai-sdk'
import { AssistantChatTransport } from '@assistant-ui/react-ai-sdk'
import { useChat } from '@ai-sdk/react'
import { useAuiState } from '@assistant-ui/store'
import { Thread } from '@/components/assistant-ui/thread'
import { ThreadList } from '@/components/assistant-ui/thread-list'
import { Palette, Code2, Pencil, Check, Loader2, Search } from 'lucide-react'
import { useEditorStore } from '@/store/editor-store'
import { useStyleGuideStore } from '@/store'
import { useVariableStore } from '@/store/variable-store'
import { findNodeById } from '@/types/canvas'
import { nodeToHtml } from '@/lib/export'
import { parseHtml } from '@/lib/parser'
import { createProjectThreadAdapter } from '@/lib/chat-persistence'
import { ChatSyncBridge } from '@/components/chat/chat-sync-bridge'
import type { ScytleNode, FrameNode } from '@/types/canvas'
import type { SystemPromptContext } from '@/lib/ai/prompts/system'

// ══════════════════════════════════════════════════════════
// Active page frame tracking
// ══════════════════════════════════════════════════════════

/** ID of the page frame that sections are appended into during generation */
let _activePageFrameId: string | null = null

/** Promise queue to serialize applyToolResult calls — prevents race conditions
 *  when multiple generateSection calls fire within milliseconds of each other. */
let _applyQueue: Promise<void> = Promise.resolve()

/** Enqueue a tool result to be applied in order. */
function enqueueToolResult(toolName: string, result: any): void {
    _applyQueue = _applyQueue.then(() => applyToolResult(toolName, result)).catch(console.error)
}

/** Reset when starting a new conversation / thread */
export function resetActivePageFrame() {
    _activePageFrameId = null
}

function createPageFrame(
    existingNodes: readonly ScytleNode[],
    width: number = 1440,
    name: string = 'Page',
): FrameNode {
    const id = crypto.randomUUID()
    let x = 0
    let y = 0

    // Auto-position: place to the RIGHT of all existing frames, top-aligned.
    // Mirrors Paper.design's create_artboard behavior (horizontal flow, 100px gap).
    if (existingNodes.length > 0) {
        // Find the rightmost edge of all top-level frames
        let maxRight = 0
        let minTop = 0
        for (const node of existingNodes) {
            const right = node.x + node.width
            if (right > maxRight) maxRight = right
            if (node.y < minTop) minTop = node.y
        }
        x = maxRight + 100 // 100px gap (Paper uses 80px)
        y = minTop          // Top-align with existing frames
    }

    return {
        id,
        type: 'frame',
        name,
        visible: true,
        locked: false,
        x,
        y,
        width,
        height: 800,
        sizing: { horizontal: 'fixed', vertical: 'hug' },
        positioning: 'auto',
        opacity: 1,
        rotation: 0,
        overflow: 'hidden',
        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
        fills: [{ type: 'solid', color: '#FFFFFF', opacity: 1, visible: true }],
        shadows: [],
        children: [],
        layout: { mode: 'flex', direction: 'column', gap: 0 },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
    }
}

// ══════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════

/** Check if the concept still has default values (Indigo accent, Raleway/Inter) */
function isDefaultTheme(concept: { colors: { accents: Array<{ hex: string }> }; typography: { headingFont: string; bodyFont: string } }): boolean {
    const mainAccent = concept.colors.accents[0]
    const isDefaultAccent = mainAccent?.hex?.toLowerCase() === '#4f46e5' || mainAccent?.hex?.toLowerCase() === '#6366f1'
    const isDefaultHeading = concept.typography.headingFont.includes('Raleway')
    const isDefaultBody = concept.typography.bodyFont.includes('Inter')
    return isDefaultAccent && isDefaultHeading && isDefaultBody
}

function buildContext(
    nodes: readonly ScytleNode[],
    selectedIds: string[]
): SystemPromptContext {
    // Read full theme from style guide store
    const sgState = useStyleGuideStore.getState()
    const concept = sgState.getActiveConcept()
    const mainAccent = concept.colors.accents.find(a => a.isMain) ?? concept.colors.accents[0]

    // Get full HTML for the selected node (untruncated) so AI can rewrite it
    const selectedId = selectedIds.length > 0 ? selectedIds[0] : null
    let selectedNodeHtml: string | null = null
    if (selectedId) {
        const selectedNode = findNodeById(nodes as ScytleNode[], selectedId)
        if (selectedNode) {
            selectedNodeHtml = nodeToHtml(selectedNode)
        }
    }

    return {
        canvasNodes: nodes.map(n => ({
            id: n.id,
            type: n.type,
            name: n.name,
            parentId: null,
            htmlSnippet: nodeToHtml(n).substring(0, 500),
        })),
        selectedNodeId: selectedId,
        selectedNodeHtml,
        // Full theme context — AI sees everything
        theme: {
            mode: concept.colors.mode,
            bgPrimary: concept.colors.bgPrimary,
            bgSecondary: concept.colors.bgSecondary,
            textPrimary: concept.colors.textPrimary,
            textSecondary: concept.colors.textSecondary,
            textMuted: concept.colors.textMuted ?? concept.colors.textSecondary,
            textOnAccent: concept.colors.textOnAccent,
            accent: mainAccent?.hex,
            accentName: mainAccent?.name,
            border: concept.colors.border,
            headingFont: concept.typography.headingFont,
            bodyFont: concept.typography.bodyFont,
            headingWeight: String(concept.typography.headingWeight),
            bodyWeight: String(concept.typography.bodyWeight),
            buttonStyle: concept.ui.buttonStyle,
            buttonRadius: String(concept.ui.buttonRadius),
            cardStyle: concept.ui.cardStyle,
            cardRadius: String(concept.ui.cardRadius),
        },
        themeModified: !isDefaultTheme(concept),
    }
}

function extractChatFonts(
    html: string,
    sgState: { data: { concepts: Array<{ id: string; fonts?: { heading?: string; body?: string } }>; activeConceptId?: string } },
): string[] {
    const families = new Set<string>()
    const fontClasses = html.match(/font-\[([^\]]+)\]/g)
    if (fontClasses) {
        for (const fc of fontClasses) {
            const family = fc.slice(6, -1).replace(/_/g, ' ').replace(/['"]/g, '')
            if (family) families.add(family)
        }
    }
    const inlineStyles = html.match(/font-family:\s*['"]([^'"]+)['"]/g)
    if (inlineStyles) {
        for (const style of inlineStyles) {
            const match = style.match(/font-family:\s*['"]([^'"]+)['"]/)
            if (match) families.add(match[1])
        }
    }
    // Get fonts from the active concept
    const concept = sgState.data.concepts?.find(c => c.id === sgState.data.activeConceptId)
    if (concept?.fonts?.heading) families.add(concept.fonts.heading)
    if (concept?.fonts?.body) families.add(concept.fonts.body)
    const systemFonts = new Set(['Inter', 'sans-serif', 'serif', 'monospace', 'mono', 'system-ui', 'Arial', 'Helvetica'])
    return Array.from(families).filter(f => !systemFonts.has(f))
}

// ══════════════════════════════════════════════════════════
// Tool side-effect handler
// ══════════════════════════════════════════════════════════

/**
 * Track which tool invocations have already been applied to the canvas/store.
 * Keyed by toolCallId (unique per invocation, provided by assistant-ui).
 * Persisted to localStorage so dedup survives page reloads — prevents
 * historical tool results from re-applying when switching threads.
 */
const APPLIED_KEY = 'scytle:applied-tool-calls'

function loadAppliedSet(): Set<string> {
    try {
        const raw = localStorage.getItem(APPLIED_KEY)
        return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
        return new Set()
    }
}

function persistAppliedSet(set: Set<string>): void {
    try {
        // Keep last 500 entries to prevent unbounded growth
        const arr = Array.from(set)
        const trimmed = arr.length > 500 ? arr.slice(-500) : arr
        localStorage.setItem(APPLIED_KEY, JSON.stringify(trimmed))
    } catch { /* quota exceeded — silently ignore */ }
}

/** Check + mark a tool call as applied. Returns true if already applied. */
function markToolApplied(toolCallId: string): boolean {
    const set = loadAppliedSet()
    if (set.has(toolCallId)) return true
    set.add(toolCallId)
    persistAppliedSet(set)
    return false
}

async function applyToolResult(toolName: string, result: any): Promise<void> {
    if (!result) return

    switch (toolName) {
        case 'updateTheme': {
            const theme = result.theme
            if (!theme) return

            useStyleGuideStore.setState((state) => {
                const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                if (!concept) return state

                concept.colors.mode = theme.mode
                concept.colors.bgPrimary = theme.bgPrimary
                concept.colors.bgSecondary = theme.bgSecondary
                concept.colors.textPrimary = theme.textPrimary
                concept.colors.textSecondary = theme.textSecondary
                concept.colors.textMuted = theme.textMuted
                concept.colors.textOnAccent = theme.textOnAccent
                concept.colors.border = theme.border

                concept.colors.accents = [
                    { id: 'accent-1', name: theme.accentName, hex: theme.accent, isMain: true },
                ]
                if (theme.accent2) {
                    concept.colors.accents.push(
                        { id: 'accent-2', name: theme.accent2Name || 'Secondary', hex: theme.accent2, isMain: false }
                    )
                }

                concept.typography.headingFont = `'${theme.headingFont}', sans-serif`
                concept.typography.bodyFont = `'${theme.bodyFont}', sans-serif`
                concept.typography.headingWeight = Number(theme.headingWeight) as any
                concept.typography.bodyWeight = Number(theme.bodyWeight) as any

                concept.ui.buttonStyle = theme.buttonStyle
                concept.ui.buttonRadius = Number(theme.buttonRadius) as any
                concept.ui.cardStyle = theme.cardStyle
                concept.ui.cardRadius = Number(theme.cardRadius) as any
                concept.ui.imageRadius = Number(theme.imageRadius) as any

                return state
            })

            const store = useStyleGuideStore.getState()
            store.setHeadingFont(store.getActiveConcept().typography.headingFont)

            try {
                const link = document.createElement('link')
                link.rel = 'stylesheet'
                link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(theme.headingFont)}:wght@${theme.headingWeight}&family=${encodeURIComponent(theme.bodyFont)}:wght@${theme.bodyWeight}&display=swap`
                document.head.appendChild(link)
            } catch (e) {
                console.warn('Failed to load Google Fonts:', e)
            }
            break
        }

        case 'generateSection': {
            const { html, sectionType, newPage, pageName, width, parentNodeId } = result
            if (!html) return
            const frameWidth = typeof width === 'number' && width > 0 ? width : 1440
            try {
                const sgState = useStyleGuideStore.getState()
                const fonts = extractChatFonts(html, sgState)
                const parsed = await parseHtml(html, sectionType || 'Section', {
                    rootWidth: frameWidth,
                    fonts,
                    variables: useVariableStore.getState().variables,
                    collections: useVariableStore.getState().collections,
                    activeModeId: useVariableStore.getState().activeModeId ?? undefined,
                })
                const newNode: ScytleNode = parsed.children.length === 1 ? parsed.children[0] : parsed
                const editorStore = useEditorStore.getState()

                // Enforce width and sizing so sections fill the parent frame
                newNode.width = frameWidth
                newNode.sizing = { horizontal: 'fill', vertical: 'hug' }

                // If AI explicitly requests a new page, or no page frame exists yet,
                // create a new page frame. This enables multi-page designs
                // (e.g., Home page + Pricing page as separate frames on canvas).
                const needsNewPage = newPage === true ||
                    !_activePageFrameId ||
                    !findNodeById(editorStore.nodes as ScytleNode[], _activePageFrameId)

                if (needsNewPage) {
                    const pageFrame = createPageFrame(
                        editorStore.nodes as ScytleNode[],
                        frameWidth,
                        pageName || sectionType || 'Page',
                    )
                    editorStore.addNode(pageFrame)
                    _activePageFrameId = pageFrame.id
                }

                // If parentNodeId is a valid existing node (not "root"), use it directly
                let targetParent = _activePageFrameId
                if (parentNodeId && parentNodeId !== 'root') {
                    const parentExists = findNodeById(editorStore.nodes as ScytleNode[], parentNodeId)
                    if (parentExists) {
                        targetParent = parentNodeId
                    }
                }

                editorStore.addNode(newNode, targetParent ?? undefined)
            } catch (e) {
                console.error('Failed to parse section HTML:', e)
            }
            break
        }

        case 'editNode': {
            const { nodeId, html } = result
            if (!html || !nodeId) return
            try {
                const sgState = useStyleGuideStore.getState()
                const editorStore = useEditorStore.getState()
                const existingNode = findNodeById(editorStore.nodes as ScytleNode[], nodeId)
                if (!existingNode) return
                const fonts = extractChatFonts(html, sgState)
                const parsed = await parseHtml(html, existingNode.name, {
                    rootWidth: existingNode.width,
                    fonts,
                    variables: useVariableStore.getState().variables,
                    collections: useVariableStore.getState().collections,
                    activeModeId: useVariableStore.getState().activeModeId ?? undefined,
                })
                const newNode: ScytleNode = parsed.children.length === 1 ? parsed.children[0] : parsed
                newNode.x = existingNode.x
                newNode.y = existingNode.y
                newNode.width = existingNode.width
                newNode.height = existingNode.height
                newNode.id = existingNode.id
                editorStore.replaceNode(nodeId, newNode)
            } catch (e) {
                console.error('Failed to edit node:', e)
            }
            break
        }
    }
}

// ══════════════════════════════════════════════════════════
// Rich Tool UI Cards
// ══════════════════════════════════════════════════════════

function StatusIcon({ status }: { status: { type: string } }) {
    if (status.type === 'running') return <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
    if (status.type === 'complete') return <Check className="w-3.5 h-3.5 text-emerald-500" />
    return null
}

const UpdateThemeToolUI = makeAssistantToolUI({
    toolName: 'updateTheme',
    render: ({ args, result, status, toolCallId }) => {
        // Track if this tool was live (mounted while running) vs loaded from history
        const wasLiveRef = useRef(status.type === 'running')
        if (status.type === 'running') wasLiveRef.current = true

        useEffect(() => {
            if (status.type === 'complete' && result && wasLiveRef.current && !markToolApplied(toolCallId)) {
                enqueueToolResult('updateTheme', result)
            }
        }, [status.type, result, toolCallId])

        const theme = (result as any)?.theme || args
        return (
            <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm">
                <Palette className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground/80">
                        {status.type === 'running' ? 'Setting theme' : 'Theme set'}
                    </span>
                    {(theme as any)?.accentName && (
                        <span className="text-muted-foreground"> — {String((theme as any).accentName)}</span>
                    )}
                    {(theme as any)?.headingFont && (
                        <span className="text-muted-foreground text-xs ml-1">({String((theme as any).headingFont)}/{String((theme as any).bodyFont)})</span>
                    )}
                </div>
                {(theme as any)?.accent && (
                    <div className="flex gap-0.5 shrink-0">
                        {[(theme as any).bgPrimary, (theme as any).accent, (theme as any).textPrimary].filter(Boolean).map((c: string, i: number) => (
                            <div key={i} className="w-4 h-4 rounded-sm border border-border/50" style={{ background: c }} />
                        ))}
                    </div>
                )}
                <StatusIcon status={status} />
            </div>
        )
    },
})

const GenerateSectionToolUI = makeAssistantToolUI({
    toolName: 'generateSection',
    render: ({ args, result, status, toolCallId }) => {
        const wasLiveRef = useRef(status.type === 'running')
        if (status.type === 'running') wasLiveRef.current = true

        useEffect(() => {
            if (status.type === 'complete' && result && wasLiveRef.current && !markToolApplied(toolCallId)) {
                enqueueToolResult('generateSection', result)
            }
        }, [status.type, result, toolCallId])

        return (
            <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm">
                <Code2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground/80">
                        {status.type === 'running' ? 'Generating' : 'Generated'}
                    </span>
                    <span className="text-muted-foreground"> {String(args?.sectionType || 'section')}</span>
                    {(result as any)?.html && (
                        <span className="text-muted-foreground/50 text-xs ml-1">({((result as any).html.length / 1024).toFixed(1)}kb)</span>
                    )}
                </div>
                <StatusIcon status={status} />
            </div>
        )
    },
})

const EditNodeToolUI = makeAssistantToolUI({
    toolName: 'editNode',
    render: ({ args, result, status, toolCallId }) => {
        const wasLiveRef = useRef(status.type === 'running')
        if (status.type === 'running') wasLiveRef.current = true

        useEffect(() => {
            if (status.type === 'complete' && result && wasLiveRef.current && !markToolApplied(toolCallId)) {
                enqueueToolResult('editNode', result)
            }
        }, [status.type, result, toolCallId])

        return (
            <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm">
                <Pencil className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground/80">
                        {status.type === 'running' ? 'Editing node' : 'Node edited'}
                    </span>
                    {args?.reason && (
                        <span className="text-muted-foreground"> — {String(args.reason)}</span>
                    )}
                </div>
                <StatusIcon status={status} />
            </div>
        )
    },
})

const SearchImagesToolUI = makeAssistantToolUI({
    toolName: 'searchImages',
    render: ({ args, result, status }) => {
        return (
            <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-sm">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground/80">
                        {status.type === 'running' ? 'Searching' : 'Found images'}
                    </span>
                    <span className="text-muted-foreground"> &quot;{String(args?.query)}&quot;</span>
                </div>
                {(result as any)?.images?.length > 0 && (
                    <div className="flex gap-1 shrink-0">
                        {(result as any).images.slice(0, 3).map((img: any, i: number) => (
                            <img key={i} src={img.url} alt="" className="w-6 h-6 rounded object-cover border border-border/30" />
                        ))}
                    </div>
                )}
                <StatusIcon status={status} />
            </div>
        )
    },
})

// ══════════════════════════════════════════════════════════
// Per-thread chat runtime hook (called inside RemoteThreadList)
// ══════════════════════════════════════════════════════════

function useChatThreadRuntime(transport: AssistantChatTransport<any>) {
    // assistant-ui provides thread ID via store — useChat keyed by it
    const threadId = useAuiState((s) => s.threadListItem.id)
    const chat = useChat({ id: threadId, transport })
    const runtime = useAISDKRuntime(chat)
    // Wire runtime back to transport so modelContext flows into requests
    transport.setRuntime(runtime)
    return runtime
}

// ══════════════════════════════════════════════════════════
// Main ChatPanel
// ══════════════════════════════════════════════════════════

export function ChatPanel() {
    const selectedIds = useEditorStore((s) => s.selectedIds)
    const nodes = useEditorStore((s) => s.nodes)
    const projectId = useEditorStore((s) => s._projectId) ?? 'default'
    const context = buildContext(nodes, selectedIds)

    const transport = useMemo(
        () => new AssistantChatTransport({
            api: '/api/chat',
            body: { context },
        }),
        [context]
    )

    // Persistence adapter — localStorage scoped per project
    const adapter = useMemo(
        () => createProjectThreadAdapter(projectId),
        [projectId],
    )

    const runtime = useRemoteThreadListRuntime({
        runtimeHook: function ChatRuntimeHook() {
            return useChatThreadRuntime(transport)
        },
        adapter,
    })

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            {/* Cross-browser thread list sync via WebSocket */}
            <ChatSyncBridge />

            {/* Tool side-effects + rich visual cards */}
            <UpdateThemeToolUI />
            <GenerateSectionToolUI />
            <EditNodeToolUI />
            <SearchImagesToolUI />

            {/* Full chat UI — ModelSelector is inside Thread's Composer */}
            <div className="flex flex-col h-full">
                {/* Thread fills the space */}
                <div className="flex-1 min-h-0">
                    <Thread />
                </div>

                {/* Thread pills — horizontal scroll at bottom */}
                <div className="shrink-0 border-t border-border/30 px-2 py-1.5">
                    <ThreadList />
                </div>
            </div>
        </AssistantRuntimeProvider>
    )
}
