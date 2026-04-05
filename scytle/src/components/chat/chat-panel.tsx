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

import { useEffect, useRef, useState, useMemo } from 'react'
import {
    AssistantRuntimeProvider,
    makeAssistantToolUI,
} from '@assistant-ui/react'
import { useChatRuntime } from '@assistant-ui/react-ai-sdk'
import { DefaultChatTransport } from 'ai'
import { Thread } from '@/components/assistant-ui/thread'
import { ThreadList } from '@/components/assistant-ui/thread-list'
import { Palette, Code2, Pencil, Check, Loader2, Search } from 'lucide-react'
import { useEditorStore } from '@/store/editor-store'
import { useStyleGuideStore } from '@/store'
import { findNodeById } from '@/types/canvas'
import { nodeToHtml } from '@/lib/export'
import { parseHtmlToNodesViaIframe } from '@/lib/parser'
import { cn } from '@/lib/utils'
import type { ScytleNode } from '@/types/canvas'
import type { SystemPromptContext } from '@/lib/ai/prompts/system'

// ══════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════

function buildContext(
    nodes: readonly ScytleNode[],
    selectedIds: string[]
): SystemPromptContext {
    return {
        canvasNodes: nodes.map(n => ({
            id: n.id,
            type: n.type,
            parentId: null,
            htmlSnippet: nodeToHtml(n).substring(0, 200),
        })),
        selectedNodeId: selectedIds.length > 0 ? selectedIds[0] : null,
    }
}

function extractChatFonts(
    html: string,
    sgState: { variableTable: Record<string, { light: string; dark: string }>; themeMode: 'light' | 'dark' },
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
    const table = sgState.variableTable
    const mode = sgState.themeMode
    if (table['font/heading']?.[mode]) families.add(table['font/heading'][mode])
    if (table['font/body']?.[mode]) families.add(table['font/body'][mode])
    const systemFonts = new Set(['Inter', 'sans-serif', 'serif', 'monospace', 'mono', 'system-ui', 'Arial', 'Helvetica'])
    return Array.from(families).filter(f => !systemFonts.has(f))
}

// ══════════════════════════════════════════════════════════
// Tool side-effect handler
// ══════════════════════════════════════════════════════════

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
            const { html, sectionType } = result
            if (!html) return
            try {
                const sgState = useStyleGuideStore.getState()
                const fonts = extractChatFonts(html, sgState)
                const parsed = await parseHtmlToNodesViaIframe(html, sectionType || 'Section', {
                    rootWidth: 1440,
                    variableTable: sgState.variableTable,
                    themeMode: sgState.themeMode,
                    fonts,
                })
                const newNode: ScytleNode = parsed.children.length === 1 ? parsed.children[0] : parsed
                const editorStore = useEditorStore.getState()
                const existingNodes = editorStore.nodes
                if (existingNodes.length > 0) {
                    const lastNode = existingNodes[existingNodes.length - 1]
                    newNode.x = lastNode.x
                    newNode.y = lastNode.y + lastNode.height
                }
                editorStore.addNode(newNode)
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
                const parsed = await parseHtmlToNodesViaIframe(html, existingNode.name, {
                    rootWidth: existingNode.width,
                    variableTable: sgState.variableTable,
                    themeMode: sgState.themeMode,
                    fonts,
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
    render: ({ args, result, status }) => {
        const appliedRef = useRef(false)
        useEffect(() => {
            if (status.type === 'complete' && result && !appliedRef.current) {
                appliedRef.current = true
                applyToolResult('updateTheme', result)
            }
        }, [status.type, result])

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
    render: ({ args, result, status }) => {
        const appliedRef = useRef(false)
        useEffect(() => {
            if (status.type === 'complete' && result && !appliedRef.current) {
                appliedRef.current = true
                applyToolResult('generateSection', result)
            }
        }, [status.type, result])

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
    render: ({ args, result, status }) => {
        const appliedRef = useRef(false)
        useEffect(() => {
            if (status.type === 'complete' && result && !appliedRef.current) {
                appliedRef.current = true
                applyToolResult('editNode', result)
            }
        }, [status.type, result])

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
// Main ChatPanel
// ══════════════════════════════════════════════════════════

export function ChatPanel() {
    const selectedIds = useEditorStore((s) => s.selectedIds)
    const nodes = useEditorStore((s) => s.nodes)
    const context = buildContext(nodes, selectedIds)

    const transport = useMemo(
        () => new DefaultChatTransport({
            api: '/api/chat',
            body: { context },
        }),
        [context]
    )

    const runtime = useChatRuntime({ transport })

    return (
        <AssistantRuntimeProvider runtime={runtime}>
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

                {/* New thread button at very bottom, below composer */}
                <div className="shrink-0 border-t border-border/30 px-3 py-1.5">
                    <ThreadList />
                </div>
            </div>
        </AssistantRuntimeProvider>
    )
}
