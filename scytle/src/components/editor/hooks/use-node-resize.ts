'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { findNodeById } from '@/types/canvas'
import type { Sizing, TextNode, VectorNetwork, VectorNode } from '@/types/canvas'

// ============================================================
// Constants
// ============================================================

const RESIZE_THRESHOLD = 2 // px of movement before resize activates
const MIN_SIZE = 1 // minimum width/height in canvas units

// ============================================================
// Module-level resize flag (shared with page.tsx for Escape gating)
// ============================================================

let _isResizeActive = false

/** Check whether a node resize is in progress (for external Escape handling) */
export function isResizeActive(): boolean {
    return _isResizeActive
}

// ============================================================
// Types
// ============================================================

export type HandleDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

interface ResizeState {
    phase: 'idle' | 'pending' | 'resizing'
    nodeId: string
    handle: HandleDirection
    /** Starting pointer position in screen coords */
    startPointerX: number
    startPointerY: number
    /** Node's original bounds at drag start */
    startX: number
    startY: number
    startWidth: number
    startHeight: number
    /** Aspect ratio at start (width / height) */
    aspectRatio: number
    /** Pointer ID for capture release */
    pointerId: number
    /** Original vectorNetwork for VectorNodes — used to scale vertices from pristine state */
    startVectorNetwork?: VectorNetwork
}

const INITIAL_STATE: ResizeState = {
    phase: 'idle',
    nodeId: '',
    handle: 'se',
    startPointerX: 0,
    startPointerY: 0,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    aspectRatio: 1,
    pointerId: -1,
}

// ============================================================
// Handle direction helpers
// ============================================================

/** Which axes does a handle affect? */
function handleAxes(handle: HandleDirection): { x: boolean; y: boolean } {
    switch (handle) {
        case 'n':
        case 's':
            return { x: false, y: true }
        case 'e':
        case 'w':
            return { x: true, y: false }
        default:
            return { x: true, y: true } // corners: nw, ne, sw, se
    }
}

/** Does this handle move the origin (top-left corner)? */
function handleMovesOrigin(
    handle: HandleDirection
): { moveX: boolean; moveY: boolean } {
    switch (handle) {
        case 'nw':
            return { moveX: true, moveY: true }
        case 'n':
            return { moveX: false, moveY: true }
        case 'ne':
            return { moveX: false, moveY: true }
        case 'w':
            return { moveX: true, moveY: false }
        case 'sw':
            return { moveX: true, moveY: false }
        default:
            return { moveX: false, moveY: false } // e, s, se
    }
}

/** Map handle direction to CSS cursor */
export function handleToCursor(handle: HandleDirection): string {
    switch (handle) {
        case 'nw':
        case 'se':
            return 'nwse-resize'
        case 'n':
        case 's':
            return 'ns-resize'
        case 'ne':
        case 'sw':
            return 'nesw-resize'
        case 'e':
        case 'w':
            return 'ew-resize'
    }
}

// ============================================================
// useNodeResize hook
// ============================================================

export function useNodeResize(
    viewportRef: React.RefObject<HTMLDivElement | null>
) {
    const [resizeInfo, setResizeInfo] = useState<{
        isResizing: boolean
        handle: HandleDirection | null
    }>({ isResizing: false, handle: null })

    const stateRef = useRef<ResizeState>({ ...INITIAL_STATE })

    // ── Start tracking a potential resize ────────────────────

    const startResize = useCallback(
        (
            handle: HandleDirection,
            nodeId: string,
            pointerX: number,
            pointerY: number,
            pointerId: number
        ) => {
            const store = useEditorStore.getState()
            const node = findNodeById(store.nodes, nodeId)
            if (!node || node.locked) return

            stateRef.current = {
                phase: 'pending',
                nodeId,
                handle,
                startPointerX: pointerX,
                startPointerY: pointerY,
                startX: node.x,
                startY: node.y,
                startWidth: node.width,
                startHeight: node.height,
                aspectRatio: node.width / Math.max(node.height, 1),
                pointerId,
                ...(node.type === 'vector'
                    ? { startVectorNetwork: (node as VectorNode).vectorNetwork }
                    : {}),
            }
        },
        []
    )

    // ── Pointer move (called continuously) ──────────────────

    const onResizePointerMove = useCallback(
        (clientX: number, clientY: number, shiftKey: boolean): boolean => {
            const s = stateRef.current
            if (s.phase === 'idle') return false

            const screenDx = clientX - s.startPointerX
            const screenDy = clientY - s.startPointerY

            // Threshold check — don't consume events until exceeded
            if (s.phase === 'pending') {
                if (Math.abs(screenDx) + Math.abs(screenDy) < RESIZE_THRESHOLD)
                    return false
                s.phase = 'resizing'
                _isResizeActive = true
                useEditorStore.getState().beginBatch()
                setResizeInfo({ isResizing: true, handle: s.handle })

                // Capture original sizing before switching to 'fixed'
                const store = useEditorStore.getState()
                const node = findNodeById(store.nodes, s.nodeId)
                if (node) {
                    startSizingRef.current = { ...node.sizing }
                    const axes = handleAxes(s.handle)
                    const newSizing: Sizing = { ...node.sizing }
                    let changed = false

                    if (axes.x && node.sizing.horizontal !== 'fixed') {
                        newSizing.horizontal = 'fixed'
                        changed = true
                    }
                    if (axes.y && node.sizing.vertical !== 'fixed') {
                        newSizing.vertical = 'fixed'
                        changed = true
                    }
                    if (changed) {
                        store.updateNode(s.nodeId, { sizing: newSizing })
                    }

                    // For TextNodes, sync the autoResize mode with the resize interaction (Figma parity)
                    if (node.type === 'text') {
                        const text = node as TextNode
                        let newAutoResize = text.autoResize
                        const isCorner = axes.x && axes.y

                        if (isCorner) {
                            newAutoResize = 'none' // Corner -> Fixed Size
                        } else if (axes.y) {
                            newAutoResize = 'none' // N/S side handle -> Fixed Size
                        } else if (axes.x && text.autoResize === 'width-and-height') {
                            newAutoResize = 'height' // E/W side handle -> Auto Height (wraps)
                        }

                        if (newAutoResize !== text.autoResize) {
                            store.updateNode(s.nodeId, { autoResize: newAutoResize })
                        }
                    }
                }
            }

            // Convert screen delta to canvas delta
            const zoom = useEditorStore.getState().zoom
            let canvasDx = screenDx / zoom
            let canvasDy = screenDy / zoom

            const axes = handleAxes(s.handle)
            const origin = handleMovesOrigin(s.handle)

            // Constrain to single axis for edge handles
            if (!axes.x) canvasDx = 0
            if (!axes.y) canvasDy = 0

            // Calculate new dimensions
            let newWidth = s.startWidth
            let newHeight = s.startHeight
            let newX = s.startX
            let newY = s.startY

            if (axes.x) {
                if (origin.moveX) {
                    // Left-side handle: x moves right, width shrinks
                    newWidth = s.startWidth - canvasDx
                    newX = s.startX + canvasDx
                } else {
                    // Right-side handle: width grows
                    newWidth = s.startWidth + canvasDx
                }
            }

            if (axes.y) {
                if (origin.moveY) {
                    // Top-side handle: y moves down, height shrinks
                    newHeight = s.startHeight - canvasDy
                    newY = s.startY + canvasDy
                } else {
                    // Bottom-side handle: height grows
                    newHeight = s.startHeight + canvasDy
                }
            }

            // Shift = lock aspect ratio (only for corner handles)
            if (shiftKey && axes.x && axes.y) {
                const ar = s.aspectRatio
                // Use the dominant axis delta to drive the constraint
                if (
                    Math.abs(newWidth - s.startWidth) >=
                    Math.abs(newHeight - s.startHeight)
                ) {
                    // Width is dominant — derive height from width
                    newHeight = newWidth / ar
                    if (origin.moveY) {
                        newY = s.startY + (s.startHeight - newHeight)
                    }
                } else {
                    // Height is dominant — derive width from height
                    newWidth = newHeight * ar
                    if (origin.moveX) {
                        newX = s.startX + (s.startWidth - newWidth)
                    }
                }
            }

            // Handle flip when dragging past the opposite edge, then clamp to MIN_SIZE
            let flipX = false
            let flipY = false

            if (axes.x && newWidth <= 0) {
                flipX = true
                // The new left edge is at newX + newWidth (newWidth is negative)
                newX = newX + newWidth
                newWidth = -newWidth
            }
            if (axes.y && newHeight <= 0) {
                flipY = true
                newY = newY + newHeight
                newHeight = -newHeight
            }

            // Minimum size clamping (after flip resolution)
            if (newWidth < MIN_SIZE) newWidth = MIN_SIZE
            if (newHeight < MIN_SIZE) newHeight = MIN_SIZE

            // Apply
            const store = useEditorStore.getState()
            const updatePayload: Parameters<typeof store.updateNode>[1] = {
                width: newWidth,
                height: newHeight,
                x: newX,
                y: newY,
            }

            // For VectorNodes, scale the path vertices proportionally from their original positions.
            // When flipped, mirror the vertices across the new bounding box edge.
            if (s.startVectorNetwork) {
                const scaleX = newWidth / s.startWidth
                const scaleY = newHeight / s.startHeight
                // Sign used to flip tangent directions when axis is mirrored
                const signX = flipX ? -1 : 1
                const signY = flipY ? -1 : 1

                const scaledVertices = s.startVectorNetwork.vertices.map((v) => ({
                    ...v,
                    // When flipped, mirror: newWidth - v.x*scaleX  (= (startWidth-v.x)*scaleX)
                    x: flipX ? newWidth - v.x * scaleX : v.x * scaleX,
                    y: flipY ? newHeight - v.y * scaleY : v.y * scaleY,
                }))
                const scaledSegments = s.startVectorNetwork.segments.map((seg) => ({
                    ...seg,
                    ...(seg.tangentStart
                        ? { tangentStart: { x: seg.tangentStart.x * scaleX * signX, y: seg.tangentStart.y * scaleY * signY } }
                        : {}),
                    ...(seg.tangentEnd
                        ? { tangentEnd: { x: seg.tangentEnd.x * scaleX * signX, y: seg.tangentEnd.y * scaleY * signY } }
                        : {}),
                }))
                ;(updatePayload as Record<string, unknown>).vectorNetwork = {
                    ...s.startVectorNetwork,
                    vertices: scaledVertices,
                    segments: scaledSegments,
                }
            }

            store.updateNode(s.nodeId, updatePayload)

            return true // consumed
        },
        []
    )

    // ── Pointer up (commit) ─────────────────────────────────

    const onResizePointerUp = useCallback((): boolean => {
        const s = stateRef.current
        if (s.phase === 'idle') return false

        const wasResizing = s.phase === 'resizing'

        // Release pointer capture
        if (s.pointerId >= 0) {
            viewportRef.current?.releasePointerCapture(s.pointerId)
        }

        stateRef.current = { ...INITIAL_STATE }
        _isResizeActive = false
        setResizeInfo({ isResizing: false, handle: null })

        if (wasResizing) {
            useEditorStore.getState().endBatch()
        }

        return true
    }, [viewportRef])

    // ── Cancel resize (Escape key) ──────────────────────────

    // Store the original sizing so we can restore it on cancel
    const startSizingRef = useRef<{ horizontal: string; vertical: string } | null>(null)

    const cancelResize = useCallback(() => {
        const s = stateRef.current
        if (s.phase === 'idle') return

        // Release pointer capture
        if (s.pointerId >= 0) {
            viewportRef.current?.releasePointerCapture(s.pointerId)
        }

        // Restore original dimensions AND sizing mode
        if (s.phase === 'resizing') {
            const restoreUpdates: Record<string, unknown> = {
                x: s.startX,
                y: s.startY,
                width: s.startWidth,
                height: s.startHeight,
            }
            if (startSizingRef.current) {
                restoreUpdates.sizing = { ...startSizingRef.current }
            }
            useEditorStore.getState().updateNode(s.nodeId, restoreUpdates)
            useEditorStore.getState().endBatch()
        }

        stateRef.current = { ...INITIAL_STATE }
        _isResizeActive = false
        setResizeInfo({ isResizing: false, handle: null })
    }, [viewportRef])

    // ── Escape key handler ──────────────────────────────────

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && stateRef.current.phase !== 'idle') {
                e.stopImmediatePropagation()
                cancelResize()
            }
        }
        // Use capture phase to fire before page.tsx's handler
        window.addEventListener('keydown', handleKeyDown, true)
        return () => window.removeEventListener('keydown', handleKeyDown, true)
    }, [cancelResize])

    return {
        resizeInfo,
        startResize,
        onResizePointerMove,
        onResizePointerUp,
        cancelResize,
    }
}
