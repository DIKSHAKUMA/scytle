'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/editor-store'
import type { ScytleNode } from '@/types/canvas'
import { findNodeById } from '@/types/canvas'
import type { InsertIndicator } from './hooks/use-node-drag'

// ============================================================
// Types
// ============================================================

interface ScreenRect {
    x: number
    y: number
    width: number
    height: number
}

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

const HANDLE_SIZE = 8
const HANDLE_POSITIONS: HandlePosition[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

// ============================================================
// Helpers
// ============================================================

/**
 * Get a node's bounding rect in screen coordinates by querying
 * the DOM element with `data-node-id`.
 */
function getNodeScreenRect(
    nodeId: string,
    viewportEl: HTMLElement | null
): ScreenRect | null {
    if (!viewportEl) return null

    const el = viewportEl.querySelector(`[data-node-id="${nodeId}"]`)
    if (!el) return null

    const nodeRect = el.getBoundingClientRect()
    const viewportRect = viewportEl.getBoundingClientRect()

    return {
        x: nodeRect.left - viewportRect.left,
        y: nodeRect.top - viewportRect.top,
        width: nodeRect.width,
        height: nodeRect.height,
    }
}

function getHandleStyle(
    pos: HandlePosition,
    rect: ScreenRect
): { left: number; top: number; cursor: string } {
    const halfH = HANDLE_SIZE / 2
    const { x, y, width, height } = rect

    switch (pos) {
        case 'nw': return { left: x - halfH, top: y - halfH, cursor: 'nwse-resize' }
        case 'n': return { left: x + width / 2 - halfH, top: y - halfH, cursor: 'ns-resize' }
        case 'ne': return { left: x + width - halfH, top: y - halfH, cursor: 'nesw-resize' }
        case 'e': return { left: x + width - halfH, top: y + height / 2 - halfH, cursor: 'ew-resize' }
        case 'se': return { left: x + width - halfH, top: y + height - halfH, cursor: 'nwse-resize' }
        case 's': return { left: x + width / 2 - halfH, top: y + height - halfH, cursor: 'ns-resize' }
        case 'sw': return { left: x - halfH, top: y + height - halfH, cursor: 'nesw-resize' }
        case 'w': return { left: x - halfH, top: y + height / 2 - halfH, cursor: 'ew-resize' }
    }
}

// ============================================================
// SelectionOverlay — blue outlines + 8 handles per selected node
// ============================================================

export function SelectionOverlay({
    viewportRef,
}: {
    viewportRef: React.RefObject<HTMLDivElement | null>
}) {
    const selectedIds = useEditorStore((s) => s.selectedIds)
    const zoom = useEditorStore((s) => s.zoom)
    const panX = useEditorStore((s) => s.panX)
    const panY = useEditorStore((s) => s.panY)

    const [rects, setRects] = useState<Map<string, ScreenRect>>(new Map())
    const rafRef = useRef<number>(0)

    // Recalculate rects whenever selection, zoom, or pan changes
    const updateRects = useCallback(() => {
        const viewport = viewportRef.current
        if (!viewport || selectedIds.length === 0) {
            setRects(new Map())
            return
        }

        const newRects = new Map<string, ScreenRect>()
        for (const id of selectedIds) {
            const rect = getNodeScreenRect(id, viewport)
            if (rect) newRects.set(id, rect)
        }
        setRects(newRects)
    }, [selectedIds, viewportRef, zoom, panX, panY])

    // Update on every animation frame for smooth tracking during pan/zoom
    useEffect(() => {
        let running = true
        const loop = () => {
            if (!running) return
            updateRects()
            rafRef.current = requestAnimationFrame(loop)
        }
        // Only run the loop if there are selections
        if (selectedIds.length > 0) {
            loop()
        } else {
            setRects(new Map())
        }
        return () => {
            running = false
            cancelAnimationFrame(rafRef.current)
        }
    }, [selectedIds, updateRects])

    if (rects.size === 0) return null

    return (
        <>
            {Array.from(rects.entries()).map(([id, rect]) => (
                <div key={id}>
                    {/* Blue outline */}
                    <div
                        className="pointer-events-none"
                        style={{
                            position: 'absolute',
                            left: rect.x,
                            top: rect.y,
                            width: rect.width,
                            height: rect.height,
                            border: '1.5px solid #3b82f6',
                            borderRadius: 1,
                            zIndex: 999,
                        }}
                    />

                    {/* 8 resize handles */}
                    {HANDLE_POSITIONS.map((pos) => {
                        const hs = getHandleStyle(pos, rect)
                        return (
                            <div
                                key={pos}
                                data-handle={pos}
                                data-node-handle={id}
                                style={{
                                    position: 'absolute',
                                    left: hs.left,
                                    top: hs.top,
                                    width: HANDLE_SIZE,
                                    height: HANDLE_SIZE,
                                    backgroundColor: '#ffffff',
                                    border: '1.5px solid #3b82f6',
                                    borderRadius: 1,
                                    cursor: hs.cursor,
                                    zIndex: 1000,
                                    // Handles are interactive (for A5 resize)
                                    pointerEvents: 'auto',
                                }}
                            />
                        )
                    })}
                </div>
            ))}
        </>
    )
}

// ============================================================
// HoverOverlay — light blue dashed outline on hovered node
// ============================================================

export function HoverOverlay({
    viewportRef,
}: {
    viewportRef: React.RefObject<HTMLDivElement | null>
}) {
    const hoveredId = useEditorStore((s) => s.hoveredId)
    const selectedIds = useEditorStore((s) => s.selectedIds)
    const zoom = useEditorStore((s) => s.zoom)
    const panX = useEditorStore((s) => s.panX)
    const panY = useEditorStore((s) => s.panY)

    const [rect, setRect] = useState<ScreenRect | null>(null)
    const rafRef = useRef<number>(0)

    // Don't show hover on already-selected nodes
    const effectiveHoveredId =
        hoveredId && !selectedIds.includes(hoveredId) ? hoveredId : null

    const updateRect = useCallback(() => {
        const viewport = viewportRef.current
        if (!viewport || !effectiveHoveredId) {
            setRect(null)
            return
        }
        setRect(getNodeScreenRect(effectiveHoveredId, viewport))
    }, [effectiveHoveredId, viewportRef, zoom, panX, panY])

    useEffect(() => {
        let running = true
        const loop = () => {
            if (!running) return
            updateRect()
            rafRef.current = requestAnimationFrame(loop)
        }
        if (effectiveHoveredId) {
            loop()
        } else {
            setRect(null)
        }
        return () => {
            running = false
            cancelAnimationFrame(rafRef.current)
        }
    }, [effectiveHoveredId, updateRect])

    if (!rect) return null

    return (
        <div
            className="pointer-events-none"
            style={{
                position: 'absolute',
                left: rect.x,
                top: rect.y,
                width: rect.width,
                height: rect.height,
                border: '1px solid #93c5fd',
                borderRadius: 1,
                zIndex: 998,
            }}
        />
    )
}

// ============================================================
// DragInsertIndicator — blue line showing reorder insertion point
// ============================================================

export function DragInsertIndicator({
    indicator,
}: {
    indicator: InsertIndicator | null
}) {
    if (!indicator) return null

    return (
        <div
            className="pointer-events-none"
            style={{
                position: 'absolute',
                left: indicator.x,
                top: indicator.y,
                width: indicator.width,
                height: indicator.height,
                backgroundColor: '#3b82f6',
                borderRadius: 1,
                zIndex: 1001,
            }}
        />
    )
}

// ============================================================
// useNodeInteraction — hook for click/hover on rendered nodes
// ============================================================

/** Resolves which node ID to select based on entered-frame context */
function resolveClickTarget(
    targetEl: HTMLElement,
    nodes: ScytleNode[],
    enteredFrameId: string | null
): string | null {
    // Walk up the DOM to collect all data-node-id attrs from target to root
    const nodeIds: string[] = []
    let el: HTMLElement | null = targetEl
    while (el) {
        const nodeId = el.getAttribute('data-node-id')
        if (nodeId) nodeIds.push(nodeId)
        el = el.parentElement
    }

    if (nodeIds.length === 0) return null

    // If we're drilled into a frame, select the deepest child WITHIN that frame
    if (enteredFrameId) {
        // Find the clicked node that is a direct child of the entered frame
        const enteredFrame = findNodeById(nodes, enteredFrameId)
        if (enteredFrame && enteredFrame.type === 'frame') {
            const directChildIds = new Set(enteredFrame.children.map((c) => c.id))
            // The first nodeId in our list that is a direct child of entered frame
            for (const id of nodeIds) {
                if (directChildIds.has(id)) return id
            }
            // If none found, select deepest node in the list that's inside entered frame
            return nodeIds[0]
        }
    }

    // Not drilled in: select the topmost (deepest in DOM tree = first in our list)
    // that is a top-level node or direct child of a top-level node
    const topLevelIds = new Set(nodes.map((n) => n.id))

    // Walk from deepest up, return the first top-level node we find
    for (let i = nodeIds.length - 1; i >= 0; i--) {
        if (topLevelIds.has(nodeIds[i])) return nodeIds[i]
    }

    // Fallback to the deepest
    return nodeIds[0]
}

export function useNodeInteraction() {
    const handleNodePointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            // Only respond in select tool mode, left click
            const state = useEditorStore.getState()
            if (state.activeTool !== 'select' || e.button !== 0) return

            // Find the target node element
            const targetEl = e.target as HTMLElement
            const nodeId = resolveClickTarget(
                targetEl,
                state.nodes,
                state.enteredFrameId
            )

            if (!nodeId) return

            e.stopPropagation()
            state.selectNode(nodeId, e.shiftKey)
        },
        []
    )

    const handleNodeDoubleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const state = useEditorStore.getState()
            if (state.activeTool !== 'select') return

            // Find clicked node
            const targetEl = e.target as HTMLElement
            let el: HTMLElement | null = targetEl
            let clickedNodeId: string | null = null
            while (el) {
                const nodeId = el.getAttribute('data-node-id')
                if (nodeId) {
                    clickedNodeId = nodeId
                    break
                }
                el = el.parentElement
            }

            if (!clickedNodeId) return

            const node = findNodeById(state.nodes, clickedNodeId)
            if (!node) return

            // If it's a frame, drill into it
            if (node.type === 'frame' && node.children.length > 0) {
                e.stopPropagation()
                state.enterFrame(clickedNodeId)
            }
        },
        []
    )

    const handleNodePointerEnter = useCallback(
        (nodeId: string) => {
            const state = useEditorStore.getState()
            if (state.activeTool !== 'select') return
            state.setHoveredId(nodeId)
        },
        []
    )

    const handleNodePointerLeave = useCallback(() => {
        useEditorStore.getState().setHoveredId(null)
    }, [])

    return {
        handleNodePointerDown,
        handleNodeDoubleClick,
        handleNodePointerEnter,
        handleNodePointerLeave,
    }
}
