'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { findNodeById } from '@/types/canvas'
import type { Sizing } from '@/types/canvas'

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

                // Switch sizing modes to 'fixed' when user starts resizing
                const store = useEditorStore.getState()
                const node = findNodeById(store.nodes, s.nodeId)
                if (node) {
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

            // Minimum size clamping
            if (newWidth < MIN_SIZE) {
                if (origin.moveX) newX = s.startX + s.startWidth - MIN_SIZE
                newWidth = MIN_SIZE
            }
            if (newHeight < MIN_SIZE) {
                if (origin.moveY) newY = s.startY + s.startHeight - MIN_SIZE
                newHeight = MIN_SIZE
            }

            // Apply
            useEditorStore.getState().updateNode(s.nodeId, {
                width: newWidth,
                height: newHeight,
                x: newX,
                y: newY,
            })

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

    const cancelResize = useCallback(() => {
        const s = stateRef.current
        if (s.phase === 'idle') return

        // Release pointer capture
        if (s.pointerId >= 0) {
            viewportRef.current?.releasePointerCapture(s.pointerId)
        }

        // Restore original dimensions
        if (s.phase === 'resizing') {
            useEditorStore.getState().updateNode(s.nodeId, {
                x: s.startX,
                y: s.startY,
                width: s.startWidth,
                height: s.startHeight,
            })
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
