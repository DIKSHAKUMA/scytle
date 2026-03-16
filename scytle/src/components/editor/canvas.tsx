'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { MIN_ZOOM, MAX_ZOOM, findNodeById, findParentOfNode, createFrame, createText, findContainingFrame, getNodeCanvasPosition } from '@/types/canvas'
import type { ScytleNode } from '@/types/canvas'
import { NodeRenderer } from './node-renderer'
import { SelectionOverlay, HoverOverlay, DragInsertIndicator, PaddingOverlay, CanvasPaddingZones, CanvasGapZones } from './selection-overlay'
import { MeasurementOverlay } from './measurement-overlay'
import { GradientHandleOverlay } from './gradient-handle-overlay'
import { ImageCropOverlay } from './image-crop-overlay'
import { SnapGuideOverlay } from './snap-guide-overlay'
import { Toolbar } from './toolbar'
import { useNodeDrag } from './hooks/use-node-drag'
import { useNodeResize, handleToCursor } from './hooks/use-node-resize'
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts'
import { usePenTool } from './hooks/use-pen-tool'
import { PenOverlay } from './pen-overlay'
import { VectorEditToolbar } from './vector-edit-toolbar'
import { AnchorPointOverlay } from './anchor-point-overlay'
import type { HandleDirection } from './hooks/use-node-resize'

// ============================================================
// Canvas Component
// ============================================================

export function EditorCanvas({ showToolbar = true }: { showToolbar?: boolean } = {}) {
    const viewportRef = useRef<HTMLDivElement>(null)
    const transformRef = useRef<HTMLDivElement>(null)

    // Store subscriptions (granular selectors for performance)
    const zoom = useEditorStore((s) => s.zoom)
    const panX = useEditorStore((s) => s.panX)
    const panY = useEditorStore((s) => s.panY)
    const nodes = useEditorStore((s) => s.nodes)
    const activeTool = useEditorStore((s) => s.activeTool)
    const canvasColor = useEditorStore((s) => s.canvasColor)

    // Local state for interactions
    const [spaceHeld, setSpaceHeld] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const panSourceRef = useRef<'space' | 'middle' | null>(null)
    const lastPointerRef = useRef({ x: 0, y: 0 })

    const isHandMode = activeTool === 'hand' || spaceHeld

    // ── Draw state for frame creation tool ─────────────────────
    const [drawState, setDrawState] = useState<{
        startCanvasX: number
        startCanvasY: number
        currentCanvasX: number
        currentCanvasY: number
    } | null>(null)

    // ── Marquee (rubber-band) selection state ────────────────
    const [marquee, setMarquee] = useState<{
        /** Canvas-space start X */
        startX: number
        /** Canvas-space start Y */
        startY: number
        /** Canvas-space current X */
        currentX: number
        /** Canvas-space current Y */
        currentY: number
        /** Whether the marquee has exceeded threshold and is active */
        active: boolean
        /** Whether shift was held at marquee start (merge with existing selection) */
        shiftHeld: boolean
    } | null>(null)
    const MARQUEE_THRESHOLD = 3 // px before marquee activates

    /** Convert screen coordinates (clientX/Y) to canvas coordinates */
    const screenToCanvas = useCallback((clientX: number, clientY: number) => {
        const rect = viewportRef.current?.getBoundingClientRect()
        if (!rect) return { x: 0, y: 0 }
        const { panX, panY, zoom } = useEditorStore.getState()
        return {
            x: (clientX - rect.left - panX) / zoom,
            y: (clientY - rect.top - panY) / zoom,
        }
    }, [])

    /** Find all top-level node IDs whose bounding boxes overlap a canvas-space rect */
    const getNodesInRect = useCallback((
        x1: number, y1: number, x2: number, y2: number
    ): string[] => {
        const left = Math.min(x1, x2)
        const top = Math.min(y1, y2)
        const right = Math.max(x1, x2)
        const bottom = Math.max(y1, y2)

        const state = useEditorStore.getState()
        const enteredId = state.enteredFrameId
        const targetNodes: ScytleNode[] = enteredId
            ? (findNodeById(state.nodes, enteredId) as import('@/types/canvas').FrameNode | null)?.children ?? []
            : state.nodes

        const ids: string[] = []
        for (const node of targetNodes) {
            // Canvas-space position (for children of entered frame, position is relative to parent)
            let nodeX = node.x
            let nodeY = node.y
            if (enteredId) {
                const parentPos = getNodeCanvasPosition(state.nodes, enteredId)
                if (parentPos) {
                    nodeX += parentPos.x
                    nodeY += parentPos.y
                }
            }

            const nodeRight = nodeX + node.width
            const nodeBottom = nodeY + node.height

            // Check overlap (rectangle intersection)
            if (nodeRight > left && nodeX < right && nodeBottom > top && nodeY < bottom) {
                ids.push(node.id)
            }
        }
        return ids
    }, [])

    // Node drag hook
    const {
        dragInfo,
        startPotentialDrag,
        onDragPointerMove,
        onDragPointerUp,
    } = useNodeDrag(viewportRef)

    // Node resize hook
    const {
        resizeInfo,
        startResize,
        onResizePointerMove,
        onResizePointerUp,
    } = useNodeResize(viewportRef)

    // Global keyboard shortcuts (Delete, Undo/Redo, Copy/Paste, etc.)
    useKeyboardShortcuts()

    // Pen tool drawing hook
    const { handlePenPointerDown, handlePenPointerMove } = usePenTool(screenToCanvas)

    // ----------------------------------------------------------
    // Wheel handler: scroll = pan, Cmd/Ctrl+scroll = zoom
    // Attached via addEventListener for { passive: false }
    // ----------------------------------------------------------
    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault()

        const state = useEditorStore.getState()
        const rect = viewportRef.current?.getBoundingClientRect()
        if (!rect) return

        if (e.ctrlKey || e.metaKey) {
            // Zoom to cursor position
            const focalX = e.clientX - rect.left
            const focalY = e.clientY - rect.top
            const delta = -e.deltaY * 0.01
            const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, state.zoom * (1 + delta)))
            state.zoomTo(newZoom, focalX, focalY)
        } else {
            // Pan
            state.setPan(state.panX - e.deltaX, state.panY - e.deltaY)
        }
    }, [])

    useEffect(() => {
        const viewport = viewportRef.current
        if (!viewport) return
        viewport.addEventListener('wheel', handleWheel, { passive: false })
        return () => viewport.removeEventListener('wheel', handleWheel)
    }, [handleWheel])

    // ----------------------------------------------------------
    // Viewport size tracking (for zoomIn/zoomOut centering)
    // ----------------------------------------------------------
    useEffect(() => {
        const viewport = viewportRef.current
        if (!viewport) return

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0]
            if (entry) {
                useEditorStore.getState().setViewportRect({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                })
            }
        })

        observer.observe(viewport)
        return () => observer.disconnect()
    }, [])

    // ----------------------------------------------------------
    // Space key: temporary hand tool
    // ----------------------------------------------------------
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.code === 'Space' &&
                !e.repeat &&
                document.activeElement?.tagName !== 'INPUT' &&
                document.activeElement?.tagName !== 'TEXTAREA' &&
                !(document.activeElement as HTMLElement)?.isContentEditable
            ) {
                e.preventDefault()
                setSpaceHeld(true)
            }
        }
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setSpaceHeld(false)
                // Only stop pan-dragging if space was the cause (not middle-click)
                if (panSourceRef.current === 'space') {
                    setIsDragging(false)
                    panSourceRef.current = null
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    // ----------------------------------------------------------
    // Helper: walk up from a DOM target to find data-node-id
    // ----------------------------------------------------------
    const findNodeIdFromTarget = useCallback((target: HTMLElement): string | null => {
        let el: HTMLElement | null = target
        while (el && el !== viewportRef.current) {
            const nodeId = el.getAttribute('data-node-id')
            if (nodeId) return nodeId
            el = el.parentElement
        }
        return null
    }, [])

    /** Resolve which node ID to select given entry context.
     *  Implements Figma-like click-through:
     *  - First click selects top-level parent
     *  - Second click on same spot selects the direct child
     *  - Once at a child level, clicking siblings selects them directly
     */
    const resolveClickTarget = useCallback(
        (targetEl: HTMLElement): string | null => {
            const state = useEditorStore.getState()

            // Collect all node IDs from target up to viewport (deepest first)
            const nodeIds: string[] = []
            let el: HTMLElement | null = targetEl
            while (el && el !== viewportRef.current) {
                const nodeId = el.getAttribute('data-node-id')
                if (nodeId) nodeIds.push(nodeId)
                el = el.parentElement
            }

            if (nodeIds.length === 0) return null

            // If drilled into a frame, select nearest child of that frame
            if (state.enteredFrameId) {
                const enteredFrame = findNodeById(state.nodes, state.enteredFrameId)
                if (enteredFrame && enteredFrame.type === 'frame') {
                    const directChildIds = new Set(
                        enteredFrame.children.map((c) => c.id)
                    )
                    for (const id of nodeIds) {
                        if (directChildIds.has(id)) return id
                    }
                    return nodeIds[0]
                }
            }

            // Find the top-level node in the click path
            const topLevelIds = new Set(state.nodes.map((n) => n.id))
            let topLevelId: string | null = null
            for (let i = nodeIds.length - 1; i >= 0; i--) {
                if (topLevelIds.has(nodeIds[i])) {
                    topLevelId = nodeIds[i]
                    break
                }
            }

            if (!topLevelId) return nodeIds[0]

            if (state.selectedIds.length === 1) {
                const selectedId = state.selectedIds[0]

                // ── Sibling selection ─────────────────────────────────
                // If a child node is currently selected, clicking another
                // child of the SAME parent selects it directly (no need
                // to first go back to parent).
                if (selectedId !== topLevelId || !topLevelIds.has(selectedId)) {
                    const selectedParent = findParentOfNode(state.nodes, selectedId)
                    if (selectedParent?.parent) {
                        const siblingIds = new Set(
                            selectedParent.parent.children.map((c) => c.id)
                        )
                        for (const id of nodeIds) {
                            if (siblingIds.has(id)) return id
                        }
                    }
                }

                // ── Click-through ────────────────────────────────────
                // Top-level node already selected → drill into direct child
                if (selectedId === topLevelId && nodeIds.length > 1) {
                    const selectedNode = findNodeById(state.nodes, topLevelId)
                    if (selectedNode && selectedNode.type === 'frame') {
                        const childIds = new Set(
                            selectedNode.children.map((c) => c.id)
                        )
                        for (const id of nodeIds) {
                            if (childIds.has(id)) return id
                        }
                    }
                }
            }

            return topLevelId
        },
        []
    )

    // ----------------------------------------------------------
    // Pointer handlers: hand-drag to pan + node selection + drag
    // ----------------------------------------------------------
    const handlePointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            // ── Commit any active text editing ────────────────────
            const editorState = useEditorStore.getState()
            if (editorState.editingNodeId) {
                const editingEl = viewportRef.current?.querySelector(
                    `[data-node-id="${editorState.editingNodeId}"]`
                ) as HTMLElement
                if (editingEl) editingEl.blur()
            }

            // ── Middle mouse / hand tool → pan ────────────────────
            if (e.button === 1 || isHandMode) {
                setIsDragging(true)
                panSourceRef.current = e.button === 1 ? 'middle' : 'space'
                lastPointerRef.current = { x: e.clientX, y: e.clientY }
                    ; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
                e.preventDefault()
                return
            }

            // Only handle left click from here
            if (e.button !== 0) return

            // ── Frame tool → start drawing ────────────────────────
            if (activeTool === 'frame') {
                const pos = screenToCanvas(e.clientX, e.clientY)
                setDrawState({
                    startCanvasX: pos.x,
                    startCanvasY: pos.y,
                    currentCanvasX: pos.x,
                    currentCanvasY: pos.y,
                })
                viewportRef.current?.setPointerCapture(e.pointerId)
                e.preventDefault()
                return
            }

            // ── Text tool → click to create + edit ────────────────
            if (activeTool === 'text') {
                const pos = screenToCanvas(e.clientX, e.clientY)
                const store = useEditorStore.getState()

                // Auto-detect parent frame
                let parentId: string | undefined
                let adjustedX = pos.x
                let adjustedY = pos.y

                const container = findContainingFrame(store.nodes, pos.x, pos.y)
                if (container) {
                    parentId = container.frameId
                    adjustedX = pos.x - container.frameAbsX
                    adjustedY = pos.y - container.frameAbsY
                } else if (store.enteredFrameId) {
                    parentId = store.enteredFrameId
                    const parentPos = getNodeCanvasPosition(store.nodes, parentId)
                    if (parentPos) {
                        adjustedX = pos.x - parentPos.x
                        adjustedY = pos.y - parentPos.y
                    }
                }

                const textNode = createText({
                    x: adjustedX,
                    y: adjustedY,
                    characters: 'Type something',
                })
                store.addNode(textNode, parentId)
                store.selectNode(textNode.id)
                store.setEditingNodeId(textNode.id)
                store.setActiveTool('select')
                e.preventDefault()
                return
            }

            // ── Pen tool → place vertices ──────────────────────────
            if (activeTool === 'pen') {
                handlePenPointerDown(e)
                return
            }

            // ── Select tool ───────────────────────────────────────
            if (activeTool === 'select') {
                const target = e.target as HTMLElement

                // Check if clicking a resize handle
                const handleDir = target.dataset.handle as HandleDirection | undefined
                const handleNodeId = target.dataset.nodeHandle
                if (handleDir && handleNodeId) {
                    startResize(handleDir, handleNodeId, e.clientX, e.clientY, e.pointerId)
                    viewportRef.current?.setPointerCapture(e.pointerId)
                    e.preventDefault()
                    return
                }

                const nodeId = resolveClickTarget(target)

                if (nodeId) {
                    const currentState = useEditorStore.getState()
                    if (e.shiftKey) {
                        // Shift-click: toggle in selection
                        currentState.selectNode(nodeId, true)
                        // Only start drag if the node is still selected after toggle
                        const updatedState = useEditorStore.getState()
                        if (updatedState.selectedIds.includes(nodeId)) {
                            startPotentialDrag(nodeId, e.clientX, e.clientY, e.pointerId, true)
                            viewportRef.current?.setPointerCapture(e.pointerId)
                        }
                    } else {
                        if (!currentState.selectedIds.includes(nodeId)) {
                            // Click on unselected node: replace selection
                            currentState.selectNode(nodeId, false)
                        }
                        // If nodeId already in selection without shift: keep multi-selection for drag
                        startPotentialDrag(nodeId, e.clientX, e.clientY, e.pointerId, false)
                        // Set pointer capture for smooth out-of-bounds tracking
                        viewportRef.current?.setPointerCapture(e.pointerId)
                    }
                } else {
                    // Clicked on empty canvas → start marquee selection
                    if (!e.shiftKey) {
                        useEditorStore.getState().deselectAll()
                    }
                    const pos = screenToCanvas(e.clientX, e.clientY)
                    setMarquee({
                        startX: pos.x,
                        startY: pos.y,
                        currentX: pos.x,
                        currentY: pos.y,
                        active: false,
                        shiftHeld: e.shiftKey,
                    })
                    viewportRef.current?.setPointerCapture(e.pointerId)
                    e.preventDefault()
                }
            }
        },
        [isHandMode, activeTool, resolveClickTarget, startPotentialDrag, startResize, screenToCanvas]
    )

    // ----------------------------------------------------------
    // Double-click: drill into frames
    // ----------------------------------------------------------
    const handleDoubleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (activeTool !== 'select') return

            const state = useEditorStore.getState()

            // Drill into the currently selected node (Figma behaviour:
            // double-click enters the selected frame/group).
            if (state.selectedIds.length === 1) {
                const selectedId = state.selectedIds[0]
                const node = findNodeById(state.nodes, selectedId)

                // Double-click node with image fill → enter crop mode
                if (node) {
                    const imgFillIdx = node.fills.findIndex(
                        (f) => f.type === 'image' && f.src
                    )
                    if (imgFillIdx >= 0) {
                        const fill = node.fills[imgFillIdx]
                        if (fill.type === 'image' && fill.fit !== 'crop') {
                            const newFills = node.fills.map((f, i) =>
                                i === imgFillIdx ? { ...f, fit: 'crop' as const } : f
                            )
                            state.updateNode(selectedId, { fills: newFills })
                        }
                        state.setImageCropEditingFillIdx(imgFillIdx)
                        return
                    }
                }

                // Double-click text → start inline editing
                if (node && node.type === 'text') {
                    state.setEditingNodeId(selectedId)
                    return
                }

                // Double-click frame → drill in
                if (node && node.type === 'frame' && node.children.length > 0) {
                    state.enterFrame(selectedId)
                    return
                }
            }

            // Fallback: try resolving from DOM target
            const target = e.target as HTMLElement
            const nodeId = resolveClickTarget(target)
            if (!nodeId) return

            const node = findNodeById(state.nodes, nodeId)

            // Fallback: image fill → crop mode
            if (node) {
                const imgFillIdx = node.fills.findIndex(
                    (f) => f.type === 'image' && f.src
                )
                if (imgFillIdx >= 0) {
                    state.selectNode(nodeId)
                    const fill = node.fills[imgFillIdx]
                    if (fill.type === 'image' && fill.fit !== 'crop') {
                        const newFills = node.fills.map((f, i) =>
                            i === imgFillIdx ? { ...f, fit: 'crop' as const } : f
                        )
                        state.updateNode(nodeId, { fills: newFills })
                    }
                    state.setImageCropEditingFillIdx(imgFillIdx)
                    return
                }
            }

            if (node && node.type === 'text') {
                state.selectNode(nodeId)
                state.setEditingNodeId(nodeId)
            } else if (node && node.type === 'frame' && node.children.length > 0) {
                state.enterFrame(nodeId)
            }
        },
        [activeTool, resolveClickTarget, handlePenPointerDown]
    )

    // ----------------------------------------------------------
    // Hover tracking: pointermove event delegation
    // ----------------------------------------------------------
    const handlePointerMove = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            // Frame drawing takes priority
            if (drawState) {
                const pos = screenToCanvas(e.clientX, e.clientY)
                setDrawState(prev => prev ? {
                    ...prev,
                    currentCanvasX: pos.x,
                    currentCanvasY: pos.y,
                } : null)
                return
            }

            // Marquee selection tracking
            if (marquee) {
                const pos = screenToCanvas(e.clientX, e.clientY)
                const dx = pos.x - marquee.startX
                const dy = pos.y - marquee.startY
                const isActive = marquee.active || (Math.abs(dx) + Math.abs(dy)) > MARQUEE_THRESHOLD
                setMarquee(prev => prev ? {
                    ...prev,
                    currentX: pos.x,
                    currentY: pos.y,
                    active: isActive,
                } : null)
                return
            }

            // Resize takes highest priority
            if (onResizePointerMove(e.clientX, e.clientY, e.shiftKey)) return

            // Node drag takes priority
            if (onDragPointerMove(e.clientX, e.clientY, e.altKey)) return

            // Pan dragging (hand tool / middle mouse)
            if (isDragging) {
                const dx = e.clientX - lastPointerRef.current.x
                const dy = e.clientY - lastPointerRef.current.y
                const state = useEditorStore.getState()
                state.setPan(state.panX + dx, state.panY + dy)
                lastPointerRef.current = { x: e.clientX, y: e.clientY }
                return
            }

            // Pen tool cursor tracking
            if (activeTool === 'pen') {
                handlePenPointerMove(e.clientX, e.clientY)
                return
            }

            // Hover tracking — context-aware so hover matches what
            // would be selected on click (Figma behaviour)
            if (activeTool === 'select') {
                const target = e.target as HTMLElement
                const nodeId = resolveClickTarget(target)
                const state = useEditorStore.getState()
                if (nodeId !== state.hoveredId) {
                    state.setHoveredId(nodeId)
                }
            }
        },
        [isDragging, activeTool, drawState, marquee, resolveClickTarget, onDragPointerMove, onResizePointerMove, screenToCanvas, handlePenPointerMove]
    )

    const handlePointerUp = useCallback(() => {
        // Marquee selection complete → select all nodes within the rect
        if (marquee) {
            if (marquee.active) {
                const ids = getNodesInRect(
                    marquee.startX, marquee.startY,
                    marquee.currentX, marquee.currentY
                )
                if (ids.length > 0) {
                    // Shift-marquee: merge with existing selection (union)
                    if (marquee.shiftHeld) {
                        const existing = useEditorStore.getState().selectedIds
                        const merged = [...new Set([...existing, ...ids])]
                        useEditorStore.getState().setSelectedIds(merged)
                    } else {
                        useEditorStore.getState().setSelectedIds(ids)
                    }
                }
            }
            setMarquee(null)
            return
        }

        // Frame drawing complete → create the frame
        if (drawState) {
            const x = Math.min(drawState.startCanvasX, drawState.currentCanvasX)
            const y = Math.min(drawState.startCanvasY, drawState.currentCanvasY)
            const w = Math.abs(drawState.currentCanvasX - drawState.startCanvasX)
            const h = Math.abs(drawState.currentCanvasY - drawState.startCanvasY)

            const MIN_DRAW = 3
            const frameX = w > MIN_DRAW ? x : drawState.startCanvasX - 50
            const frameY = h > MIN_DRAW ? y : drawState.startCanvasY - 50
            const frameW = w > MIN_DRAW ? w : 100
            const frameH = h > MIN_DRAW ? h : 100

            const store = useEditorStore.getState()

            // Auto-detect parent frame: if drawing starts inside an existing frame, nest into it
            // Only auto-nest if the ENTIRE drawn rectangle fits inside the target frame.
            let parentId: string | undefined
            let adjustedX = frameX
            let adjustedY = frameY

            const container = findContainingFrame(store.nodes, drawState.startCanvasX, drawState.startCanvasY)
            if (container) {
                const potentialParent = findNodeById(store.nodes, container.frameId)
                // Check entire drawn rect fits inside the parent frame
                const fitsInside = potentialParent &&
                    frameX >= container.frameAbsX &&
                    frameY >= container.frameAbsY &&
                    frameX + frameW <= container.frameAbsX + potentialParent.width &&
                    frameY + frameH <= container.frameAbsY + potentialParent.height

                if (fitsInside) {
                    parentId = container.frameId
                    adjustedX = frameX - container.frameAbsX
                    adjustedY = frameY - container.frameAbsY
                }
            } else if (store.enteredFrameId) {
                // Fallback: if drilled into a frame, nest under it
                parentId = store.enteredFrameId
                const parentPos = getNodeCanvasPosition(store.nodes, parentId)
                if (parentPos) {
                    adjustedX = frameX - parentPos.x
                    adjustedY = frameY - parentPos.y
                }
            }

            const frame = createFrame({
                x: adjustedX,
                y: adjustedY,
                width: frameW,
                height: frameH,
                fills: [{ type: 'solid', color: '#FFFFFF' }],
                layout: { mode: 'none' },
            })

            store.addNode(frame, parentId)
            store.selectNode(frame.id)
            store.setActiveTool('select')

            setDrawState(null)
            return
        }

        // Resize takes priority
        if (onResizePointerUp()) return

        // Node drag takes priority
        if (onDragPointerUp()) return

        if (isDragging) {
            setIsDragging(false)
            panSourceRef.current = null
        }
    }, [isDragging, drawState, marquee, getNodesInRect, onDragPointerUp, onResizePointerUp])

    const handlePointerLeave = useCallback(() => {
        useEditorStore.getState().setHoveredId(null)
    }, [])

    // ----------------------------------------------------------
    // Cursor
    // ----------------------------------------------------------
    const cursor = resizeInfo.isResizing
        ? handleToCursor(resizeInfo.handle!)
        : isHandMode
            ? isDragging
                ? 'grabbing'
                : 'grab'
            : drawState
                ? 'crosshair'
                : dragInfo.isDragging
                    ? 'grabbing'
                    : (activeTool === 'frame' || activeTool === 'text' || activeTool === 'pen')
                        ? 'crosshair'
                        : 'default'
    // ----------------------------------------------------------
    // Render
    // ----------------------------------------------------------
    return (
        <div
            ref={viewportRef}
            className="relative w-full h-full overflow-hidden select-none"
            style={{
                cursor,
                backgroundColor: canvasColor,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            onDoubleClick={handleDoubleClick}
        >
            {/* Transform container — CSS custom properties drive coordinate-space rendering */}
            <div
                ref={transformRef}
                className="absolute top-0 left-0"
                style={{ '--z': zoom, '--px': panX, '--py': panY } as unknown as CSSProperties}
            >
                {nodes.map((node) => (
                    <NodeRenderer key={node.id} node={node} isTopLevel />
                ))}

                {/* Frame draw preview (canvas coordinates scaled via CSS vars) */}
                {drawState && (
                    <div
                        className="absolute border border-primary/70 bg-primary/5 pointer-events-none"
                        style={{
                            left: `calc(${Math.min(drawState.startCanvasX, drawState.currentCanvasX)}px * var(--z, 1) + var(--px, 0) * 1px)`,
                            top: `calc(${Math.min(drawState.startCanvasY, drawState.currentCanvasY)}px * var(--z, 1) + var(--py, 0) * 1px)`,
                            width: `calc(${Math.abs(drawState.currentCanvasX - drawState.startCanvasX)}px * var(--z, 1))`,
                            height: `calc(${Math.abs(drawState.currentCanvasY - drawState.startCanvasY)}px * var(--z, 1))`,
                            borderWidth: `calc(2px * var(--z, 1))`,
                            borderRadius: `calc(1px * var(--z, 1))`,
                        }}
                    />
                )}
            </div>

            {/* Selection & hover overlays (screen coordinates, above content) */}
            <HoverOverlay viewportRef={viewportRef} />
            <PaddingOverlay viewportRef={viewportRef} />
            <CanvasPaddingZones viewportRef={viewportRef} />
            <CanvasGapZones viewportRef={viewportRef} />
            <SelectionOverlay viewportRef={viewportRef} />

            {/* Gradient handles (shown when gradient fill picker is open) */}
            <GradientHandleOverlay viewportRef={viewportRef} />

            {/* Image crop handles (shown when an image fill has fit=crop) */}
            <ImageCropOverlay viewportRef={viewportRef} />

            {/* Pen tool drawing overlay (shown while placing vertices) */}
            <PenOverlay />

            {/* Vector edit anchor points + bezier handles (shown in vector edit mode) */}
            <AnchorPointOverlay />

            {/* Snap alignment guides (shown while dragging freeform) */}
            <SnapGuideOverlay dragInfo={dragInfo} />

            {/* Measurement lines (show distances when dragging inside a frame) */}
            <MeasurementOverlay viewportRef={viewportRef} isDragging={dragInfo.isDragging} />

            {/* Drag insertion indicator (reorder mode) */}
            <DragInsertIndicator indicator={dragInfo.indicator} />

            {/* Marquee selection rectangle (screen coordinates) */}
            {marquee && marquee.active && (() => {
                const left = Math.min(marquee.startX, marquee.currentX) * zoom + panX
                const top = Math.min(marquee.startY, marquee.currentY) * zoom + panY
                const width = Math.abs(marquee.currentX - marquee.startX) * zoom
                const height = Math.abs(marquee.currentY - marquee.startY) * zoom
                return (
                    <div
                        className="absolute pointer-events-none border border-blue-500/80 bg-blue-500/10 rounded-[1px]"
                        style={{ left, top, width, height }}
                    />
                )
            })()}

            {/* Floating toolbar — centered at top of canvas */}
            {showToolbar && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
                    <Toolbar />
                </div>
            )}

            {/* Vector edit mode toolbar — bottom center, above main toolbar */}
            <VectorEditToolbar />


        </div>
    )
}
