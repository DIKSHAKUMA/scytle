'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ReadOnlyCanvas, type ReadOnlyCanvasHandle } from '@/components/share/read-only-canvas'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, Minus, Plus, Zap } from 'lucide-react'
import type { ScytleNode } from '@/types/canvas'

interface EditorPageData {
    id: string
    name: string
    nodes: ScytleNode[]
    canvasColor: string
    zoom: number
    panX: number
    panY: number
}

interface CanvasData {
    pages: EditorPageData[]
    activePageId: string
}

interface SyncPagePayload {
    id: string
    name: string
    canvasColor: string
    zoom: number
    panX: number
    panY: number
}

interface SyncInitState {
    pages: Array<SyncPagePayload & { nodes: ScytleNode[] }>
    activePageId: string
}

type SyncServerMessage =
    | { type: 'init'; state: SyncInitState }
    | { type: 'update'; nodeId: string; changes: Record<string, unknown> }
    | { type: 'add'; node: ScytleNode; pageId: string }
    | { type: 'delete'; nodeId: string; pageId: string }
    | { type: 'reorder'; pageId: string; nodeIds: string[] }
    | { type: 'page:add'; page: SyncPagePayload }
    | { type: 'page:delete'; pageId: string }
    | { type: 'page:rename'; pageId: string; name: string }
    | { type: 'page:update'; pageId: string; changes: Partial<SyncPagePayload> }
    | { type: 'page:reorder'; pageIds: string[] }
    | { type: 'presence'; users: Array<{ userId: string; pageId: string }> }
    | { type: 'error'; message: string }

interface ShareViewerProps {
    projectId: string
    projectName: string
    canvasData: CanvasData | null
    shareRealtimeToken: string | null
}

const DEFAULT_CANVAS_COLOR = '#F5F5F5'
const DEFAULT_SYNC_WS_URL = 'ws://localhost:8787'
const ZOOM_PRESETS = [25, 50, 75, 100, 125, 150, 200] as const

function toSyncWebSocketBaseUrl(rawUrl: string): string {
    const trimmed = rawUrl.trim()
    if (!trimmed) return ''

    if (trimmed.startsWith('https://')) {
        return `wss://${trimmed.slice('https://'.length)}`.replace(/\/$/, '')
    }

    if (trimmed.startsWith('http://')) {
        return `ws://${trimmed.slice('http://'.length)}`.replace(/\/$/, '')
    }

    return trimmed.replace(/\/$/, '')
}

function getNodeChildren(node: ScytleNode): ScytleNode[] | null {
    const candidate = (node as { children?: unknown }).children
    return Array.isArray(candidate) ? (candidate as ScytleNode[]) : null
}

function updateNodeById(
    nodes: ScytleNode[],
    nodeId: string,
    changes: Record<string, unknown>
): [ScytleNode[], boolean] {
    let changed = false
    const nextNodes = nodes.map((node) => {
        if (node.id === nodeId) {
            changed = true
            return { ...node, ...changes } as ScytleNode
        }

        const children = getNodeChildren(node)
        if (children && children.length > 0) {
            const [nextChildren, childChanged] = updateNodeById(children, nodeId, changes)
            if (childChanged) {
                changed = true
                return { ...node, children: nextChildren } as ScytleNode
            }
        }

        return node
    })

    return [changed ? nextNodes : nodes, changed]
}

function deleteNodeById(nodes: ScytleNode[], nodeId: string): [ScytleNode[], boolean] {
    let changed = false
    const nextNodes: ScytleNode[] = []

    for (const node of nodes) {
        if (node.id === nodeId) {
            changed = true
            continue
        }

        const children = getNodeChildren(node)
        if (children && children.length > 0) {
            const [nextChildren, childChanged] = deleteNodeById(children, nodeId)
            if (childChanged) {
                changed = true
                nextNodes.push({ ...node, children: nextChildren } as ScytleNode)
                continue
            }
        }

        nextNodes.push(node)
    }

    return [changed ? nextNodes : nodes, changed]
}

function reorderNodes(nodes: ScytleNode[], nodeIds: string[]): ScytleNode[] {
    const map = new Map(nodes.map((node) => [node.id, node]))
    const reordered: ScytleNode[] = []
    const seen = new Set<string>()

    for (const id of nodeIds) {
        const node = map.get(id)
        if (node) {
            reordered.push(node)
            seen.add(id)
        }
    }

    for (const node of nodes) {
        if (!seen.has(node.id)) {
            reordered.push(node)
        }
    }

    return reordered
}

function applySyncMessage(current: CanvasData | null, message: SyncServerMessage): CanvasData | null {
    if (message.type === 'init') {
        return {
            pages: message.state.pages.map((page) => ({
                ...page,
                nodes: Array.isArray(page.nodes) ? page.nodes : [],
                canvasColor: page.canvasColor || DEFAULT_CANVAS_COLOR,
            })),
            activePageId: message.state.activePageId,
        }
    }

    if (!current) return current

    switch (message.type) {
        case 'update': {
            let pageChanged = false
            let changedPageId: string | null = null
            const pages = current.pages.map((page) => {
                const [nextNodes, changed] = updateNodeById(page.nodes, message.nodeId, message.changes)
                if (!changed) return page
                pageChanged = true
                if (!changedPageId) changedPageId = page.id
                return { ...page, nodes: nextNodes }
            })

            if (!pageChanged) return current
            return {
                ...current,
                pages,
                activePageId: changedPageId ?? current.activePageId,
            }
        }

        case 'add': {
            const pages = current.pages.map((page) => {
                if (page.id !== message.pageId) return page
                return { ...page, nodes: [...page.nodes, message.node] }
            })
            return {
                ...current,
                pages,
                activePageId: current.pages.some((page) => page.id === message.pageId)
                    ? message.pageId
                    : current.activePageId,
            }
        }

        case 'delete': {
            const pages = current.pages.map((page) => {
                if (page.id !== message.pageId) return page
                const [nextNodes] = deleteNodeById(page.nodes, message.nodeId)
                return nextNodes === page.nodes ? page : { ...page, nodes: nextNodes }
            })
            return {
                ...current,
                pages,
                activePageId: current.pages.some((page) => page.id === message.pageId)
                    ? message.pageId
                    : current.activePageId,
            }
        }

        case 'reorder': {
            const pages = current.pages.map((page) => {
                if (page.id !== message.pageId) return page
                return { ...page, nodes: reorderNodes(page.nodes, message.nodeIds) }
            })
            return {
                ...current,
                pages,
                activePageId: current.pages.some((page) => page.id === message.pageId)
                    ? message.pageId
                    : current.activePageId,
            }
        }

        case 'page:add': {
            const newPage: EditorPageData = {
                id: message.page.id,
                name: message.page.name,
                nodes: [],
                canvasColor: message.page.canvasColor || DEFAULT_CANVAS_COLOR,
                zoom: message.page.zoom,
                panX: message.page.panX,
                panY: message.page.panY,
            }

            const nextPages = [...current.pages, newPage]
            return {
                pages: nextPages,
                activePageId: current.activePageId || newPage.id,
            }
        }

        case 'page:delete': {
            const nextPages = current.pages.filter((page) => page.id !== message.pageId)
            const nextActive =
                current.activePageId === message.pageId
                    ? (nextPages[0]?.id ?? '')
                    : current.activePageId

            return {
                pages: nextPages,
                activePageId: nextActive,
            }
        }

        case 'page:rename': {
            const pages = current.pages.map((page) =>
                page.id === message.pageId ? { ...page, name: message.name } : page
            )
            return { ...current, pages }
        }

        case 'page:update': {
            const pages = current.pages.map((page) =>
                page.id === message.pageId
                    ? {
                        ...page,
                        ...message.changes,
                        canvasColor: message.changes.canvasColor || page.canvasColor,
                    }
                    : page
            )
            return { ...current, pages }
        }

        case 'page:reorder': {
            const pageMap = new Map(current.pages.map((page) => [page.id, page]))
            const orderedPages: EditorPageData[] = []
            const seen = new Set<string>()

            for (const id of message.pageIds) {
                const page = pageMap.get(id)
                if (page) {
                    orderedPages.push(page)
                    seen.add(id)
                }
            }

            for (const page of current.pages) {
                if (!seen.has(page.id)) {
                    orderedPages.push(page)
                }
            }

            return { ...current, pages: orderedPages }
        }

        case 'presence':
        case 'error':
            return current
    }
}

export function ShareViewer({ projectId, projectName, canvasData, shareRealtimeToken }: ShareViewerProps) {
    const canvasRef = useRef<ReadOnlyCanvasHandle | null>(null)
    const [liveCanvasData, setLiveCanvasData] = useState<CanvasData | null>(canvasData)
    const [zoom, setZoom] = useState(1)

    useEffect(() => {
        setLiveCanvasData(canvasData)
    }, [canvasData])

    useEffect(() => {
        if (!projectId || !shareRealtimeToken) return

        const baseUrl = toSyncWebSocketBaseUrl(process.env.NEXT_PUBLIC_SYNC_URL || DEFAULT_SYNC_WS_URL)
        if (!baseUrl) return

        let disposed = false
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null
        let reconnectAttempt = 0
        let shouldReconnect = true
        let ws: WebSocket | null = null

        const connect = () => {
            if (disposed || !shouldReconnect) return

            const roomUrl = `${baseUrl}/room/${encodeURIComponent(projectId)}`
            ws = new WebSocket(roomUrl)

            ws.addEventListener('open', () => {
                reconnectAttempt = 0
                ws?.send(JSON.stringify({ type: 'share:join', token: shareRealtimeToken }))
            })

            ws.addEventListener('message', (event) => {
                try {
                    const message = JSON.parse(event.data as string) as SyncServerMessage
                    setLiveCanvasData((current) => applySyncMessage(current, message))
                } catch {
                    // Ignore malformed payloads from the wire.
                }
            })

            ws.addEventListener('close', (event) => {
                if (disposed || !shouldReconnect) return

                // Auth/room mismatches should not be retried indefinitely.
                if (event.code === 4001 || event.code === 4003) {
                    shouldReconnect = false
                    return
                }

                reconnectAttempt += 1
                const delay = Math.min(1000 * 2 ** (reconnectAttempt - 1), 10_000)
                reconnectTimer = setTimeout(connect, delay)
            })

            ws.addEventListener('error', () => {
                ws?.close()
            })
        }

        connect()

        return () => {
            disposed = true
            shouldReconnect = false
            if (reconnectTimer) clearTimeout(reconnectTimer)
            if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
                ws.close(1000, 'Share viewer cleanup')
            }
        }
    }, [projectId, shareRealtimeToken])

    // Extract nodes from canvas data — show active page or first page
    const { nodes, canvasColor } = useMemo(() => {
        if (!liveCanvasData?.pages?.length) {
            return { nodes: [] as ScytleNode[], canvasColor: DEFAULT_CANVAS_COLOR }
        }

        const activePage = liveCanvasData.pages.find(p => p.id === liveCanvasData.activePageId)
            ?? liveCanvasData.pages[0]

        return {
            nodes: activePage.nodes,
            canvasColor: activePage.canvasColor || DEFAULT_CANVAS_COLOR,
        }
    }, [liveCanvasData])

    const zoomPercent = Math.round(zoom * 100)

    if (nodes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
                <p className="text-muted-foreground">This design has no content yet.</p>
                <Link href="/" className="text-sm text-primary hover:underline">
                    Go to Scytle.ai
                </Link>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            {/* Minimal header */}
            <header className="flex items-center justify-between h-14 px-4 bg-card border-b border-border/60 shrink-0 select-none">
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded bg-linear-to-br from-accent to-accent/70 flex items-center justify-center shrink-0">
                        <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-display font-semibold text-sm truncate max-w-75">
                        {projectName}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">View only</span>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 rounded-lg border border-border/70 bg-background/95 px-1 py-1 shadow-xs">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="text-muted-foreground"
                            onClick={() => canvasRef.current?.zoomOut()}
                            aria-label="Zoom out"
                        >
                            <Minus />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="xs"
                                    className="min-w-16 justify-between font-medium"
                                    aria-label="Open zoom presets"
                                >
                                    {zoomPercent}%
                                    <ChevronDown className="size-3 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-28">
                                {ZOOM_PRESETS.map((preset) => (
                                    <DropdownMenuItem
                                        key={preset}
                                        onSelect={() => canvasRef.current?.setZoom(preset / 100)}
                                    >
                                        {preset}%
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem onSelect={() => canvasRef.current?.fitToContent()}>
                                    Fit
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            className="text-muted-foreground"
                            onClick={() => canvasRef.current?.zoomIn()}
                            aria-label="Zoom in"
                        >
                            <Plus />
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="border-l border-border/70 rounded-l-none ml-1 pl-2"
                            onClick={() => canvasRef.current?.fitToContent()}
                        >
                            Fit
                        </Button>
                    </div>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                    >
                        Try Scytle
                    </Link>
                </div>
            </header>

            {/* Canvas */}
            <div className="flex-1 relative overflow-hidden">
                <ReadOnlyCanvas
                    ref={canvasRef}
                    nodes={nodes}
                    canvasColor={canvasColor}
                    onZoomChange={setZoom}
                />
            </div>
        </div>
    )
}
