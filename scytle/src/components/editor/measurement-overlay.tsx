'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { findNodeById, findParentOfNode } from '@/types/canvas'
import type { FrameNode } from '@/types/canvas'

// ============================================================
// Types
// ============================================================

interface ScreenRect {
    x: number
    y: number
    width: number
    height: number
}

interface AlignmentLine {
    direction: 'horizontal' | 'vertical'
    /** Position on perpendicular axis (screen coords) */
    position: number
    /** Start on parallel axis */
    start: number
    /** End on parallel axis */
    end: number
}

interface MeasurementLine {
    x1: number
    y1: number
    x2: number
    y2: number
    distance: number
    direction: 'horizontal' | 'vertical'
}

// ============================================================
// Helpers
// ============================================================

function getNodeScreenRect(
    nodeId: string,
    viewportEl: HTMLElement
): ScreenRect | null {
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

// Alignment threshold in screen pixels
const ALIGN_THRESHOLD = 4

/**
 * Calculate alignment guide lines between the dragged node and its siblings/parent.
 * Checks center and edge alignment. Returns snap targets for position snapping.
 */
function calculateAlignmentLines(
    nodeRect: ScreenRect,
    siblingRects: ScreenRect[],
    parentRect: ScreenRect | null,
): { lines: AlignmentLine[]; snapX: number | null; snapY: number | null } {
    const lines: AlignmentLine[] = []
    const seen = new Set<string>()

    let snapX: number | null = null
    let snapY: number | null = null

    const nodeCenterX = nodeRect.x + nodeRect.width / 2
    const nodeCenterY = nodeRect.y + nodeRect.height / 2
    const nodeLeft = nodeRect.x
    const nodeRight = nodeRect.x + nodeRect.width
    const nodeTop = nodeRect.y
    const nodeBottom = nodeRect.y + nodeRect.height

    const addLine = (dir: 'horizontal' | 'vertical', pos: number, s: number, e: number) => {
        const key = `${dir}-${Math.round(pos)}`
        if (seen.has(key)) {
            const existing = lines.find(l => l.direction === dir && Math.abs(l.position - pos) < 1)
            if (existing) {
                existing.start = Math.min(existing.start, s)
                existing.end = Math.max(existing.end, e)
            }
            return
        }
        seen.add(key)
        lines.push({ direction: dir, position: pos, start: s, end: e })
    }

    // Check alignment with parent center
    if (parentRect) {
        const parentCenterX = parentRect.x + parentRect.width / 2
        const parentCenterY = parentRect.y + parentRect.height / 2

        if (Math.abs(nodeCenterX - parentCenterX) < ALIGN_THRESHOLD) {
            addLine('vertical', parentCenterX, parentRect.y, parentRect.y + parentRect.height)
            snapX = parentCenterX - nodeRect.width / 2 // snap node center to parent center
        }
        if (Math.abs(nodeCenterY - parentCenterY) < ALIGN_THRESHOLD) {
            addLine('horizontal', parentCenterY, parentRect.x, parentRect.x + parentRect.width)
            snapY = parentCenterY - nodeRect.height / 2
        }
    }

    for (const sib of siblingRects) {
        const sibCenterX = sib.x + sib.width / 2
        const sibCenterY = sib.y + sib.height / 2
        const sibLeft = sib.x
        const sibRight = sib.x + sib.width
        const sibTop = sib.y
        const sibBottom = sib.y + sib.height

        const vStart = Math.min(nodeTop, sibTop) - 10
        const vEnd = Math.max(nodeBottom, sibBottom) + 10
        const hStart = Math.min(nodeLeft, sibLeft) - 10
        const hEnd = Math.max(nodeRight, sibRight) + 10

        // Center alignment
        if (Math.abs(nodeCenterX - sibCenterX) < ALIGN_THRESHOLD) {
            addLine('vertical', sibCenterX, vStart, vEnd)
            if (snapX === null) snapX = sibCenterX - nodeRect.width / 2
        }
        if (Math.abs(nodeCenterY - sibCenterY) < ALIGN_THRESHOLD) {
            addLine('horizontal', sibCenterY, hStart, hEnd)
            if (snapY === null) snapY = sibCenterY - nodeRect.height / 2
        }

        // Edge alignments - vertical guides
        if (Math.abs(nodeLeft - sibLeft) < ALIGN_THRESHOLD) {
            addLine('vertical', sibLeft, vStart, vEnd)
            if (snapX === null) snapX = sibLeft
        }
        if (Math.abs(nodeRight - sibRight) < ALIGN_THRESHOLD) {
            addLine('vertical', sibRight, vStart, vEnd)
            if (snapX === null) snapX = sibRight - nodeRect.width
        }
        if (Math.abs(nodeLeft - sibRight) < ALIGN_THRESHOLD) {
            addLine('vertical', sibRight, vStart, vEnd)
            if (snapX === null) snapX = sibRight
        }
        if (Math.abs(nodeRight - sibLeft) < ALIGN_THRESHOLD) {
            addLine('vertical', sibLeft, vStart, vEnd)
            if (snapX === null) snapX = sibLeft - nodeRect.width
        }

        // Edge alignments - horizontal guides
        if (Math.abs(nodeTop - sibTop) < ALIGN_THRESHOLD) {
            addLine('horizontal', sibTop, hStart, hEnd)
            if (snapY === null) snapY = sibTop
        }
        if (Math.abs(nodeBottom - sibBottom) < ALIGN_THRESHOLD) {
            addLine('horizontal', sibBottom, hStart, hEnd)
            if (snapY === null) snapY = sibBottom - nodeRect.height
        }
        if (Math.abs(nodeTop - sibBottom) < ALIGN_THRESHOLD) {
            addLine('horizontal', sibBottom, hStart, hEnd)
            if (snapY === null) snapY = sibBottom
        }
        if (Math.abs(nodeBottom - sibTop) < ALIGN_THRESHOLD) {
            addLine('horizontal', sibTop, hStart, hEnd)
            if (snapY === null) snapY = sibTop - nodeRect.height
        }
    }

    return { lines, snapX, snapY }
}

/**
 * Calculate measurement lines from a node to its parent frame edges.
 */
function calculateParentMeasurements(
    nodeRect: ScreenRect,
    parentRect: ScreenRect,
    zoom: number
): MeasurementLine[] {
    const lines: MeasurementLine[] = []
    const MIN_DISTANCE = 1

    const nodeCenter = {
        x: nodeRect.x + nodeRect.width / 2,
        y: nodeRect.y + nodeRect.height / 2,
    }

    const topDist = Math.round((nodeRect.y - parentRect.y) / zoom)
    if (topDist >= MIN_DISTANCE) {
        lines.push({
            x1: nodeCenter.x, y1: parentRect.y,
            x2: nodeCenter.x, y2: nodeRect.y,
            distance: topDist, direction: 'vertical',
        })
    }

    const bottomDist = Math.round(
        (parentRect.y + parentRect.height - (nodeRect.y + nodeRect.height)) / zoom
    )
    if (bottomDist >= MIN_DISTANCE) {
        lines.push({
            x1: nodeCenter.x, y1: nodeRect.y + nodeRect.height,
            x2: nodeCenter.x, y2: parentRect.y + parentRect.height,
            distance: bottomDist, direction: 'vertical',
        })
    }

    const leftDist = Math.round((nodeRect.x - parentRect.x) / zoom)
    if (leftDist >= MIN_DISTANCE) {
        lines.push({
            x1: parentRect.x, y1: nodeCenter.y,
            x2: nodeRect.x, y2: nodeCenter.y,
            distance: leftDist, direction: 'horizontal',
        })
    }

    const rightDist = Math.round(
        (parentRect.x + parentRect.width - (nodeRect.x + nodeRect.width)) / zoom
    )
    if (rightDist >= MIN_DISTANCE) {
        lines.push({
            x1: nodeRect.x + nodeRect.width, y1: nodeCenter.y,
            x2: parentRect.x + parentRect.width, y2: nodeCenter.y,
            distance: rightDist, direction: 'horizontal',
        })
    }

    return lines
}

/**
 * Calculate measurement lines from a node to its sibling nodes.
 * Shows nearest gap distances (horizontal and vertical) between edges.
 */
function calculateSiblingMeasurements(
    nodeRect: ScreenRect,
    siblingRects: ScreenRect[],
    zoom: number
): MeasurementLine[] {
    const lines: MeasurementLine[] = []
    const MIN_DISTANCE = 1

    const nodeCenter = {
        x: nodeRect.x + nodeRect.width / 2,
        y: nodeRect.y + nodeRect.height / 2,
    }

    for (const sib of siblingRects) {
        const sibCenter = {
            x: sib.x + sib.width / 2,
            y: sib.y + sib.height / 2,
        }

        // Horizontal gap (left/right between node and sibling)
        // Only measure if they overlap vertically
        const vOverlap =
            nodeRect.y < sib.y + sib.height && nodeRect.y + nodeRect.height > sib.y

        if (vOverlap) {
            const midY = Math.max(nodeRect.y, sib.y) +
                (Math.min(nodeRect.y + nodeRect.height, sib.y + sib.height) -
                    Math.max(nodeRect.y, sib.y)) / 2

            // Node is to the left of sibling
            if (nodeRect.x + nodeRect.width <= sib.x) {
                const dist = Math.round((sib.x - (nodeRect.x + nodeRect.width)) / zoom)
                if (dist >= MIN_DISTANCE) {
                    lines.push({
                        x1: nodeRect.x + nodeRect.width, y1: midY,
                        x2: sib.x, y2: midY,
                        distance: dist, direction: 'horizontal',
                    })
                }
            }
            // Node is to the right of sibling
            else if (nodeRect.x >= sib.x + sib.width) {
                const dist = Math.round((nodeRect.x - (sib.x + sib.width)) / zoom)
                if (dist >= MIN_DISTANCE) {
                    lines.push({
                        x1: sib.x + sib.width, y1: midY,
                        x2: nodeRect.x, y2: midY,
                        distance: dist, direction: 'horizontal',
                    })
                }
            }
        }

        // Vertical gap (top/bottom between node and sibling)
        // Only measure if they overlap horizontally
        const hOverlap =
            nodeRect.x < sib.x + sib.width && nodeRect.x + nodeRect.width > sib.x

        if (hOverlap) {
            const midX = Math.max(nodeRect.x, sib.x) +
                (Math.min(nodeRect.x + nodeRect.width, sib.x + sib.width) -
                    Math.max(nodeRect.x, sib.x)) / 2

            // Node is above sibling
            if (nodeRect.y + nodeRect.height <= sib.y) {
                const dist = Math.round((sib.y - (nodeRect.y + nodeRect.height)) / zoom)
                if (dist >= MIN_DISTANCE) {
                    lines.push({
                        x1: midX, y1: nodeRect.y + nodeRect.height,
                        x2: midX, y2: sib.y,
                        distance: dist, direction: 'vertical',
                    })
                }
            }
            // Node is below sibling
            else if (nodeRect.y >= sib.y + sib.height) {
                const dist = Math.round((nodeRect.y - (sib.y + sib.height)) / zoom)
                if (dist >= MIN_DISTANCE) {
                    lines.push({
                        x1: midX, y1: sib.y + sib.height,
                        x2: midX, y2: nodeRect.y,
                        distance: dist, direction: 'vertical',
                    })
                }
            }
        }

        // For non-overlapping siblings — measure closest edges
        if (!vOverlap && !hOverlap) {
            // Check horizontal distance
            let hDist: number | null = null
            let hx1 = 0, hx2 = 0
            if (nodeRect.x + nodeRect.width <= sib.x) {
                hDist = Math.round((sib.x - (nodeRect.x + nodeRect.width)) / zoom)
                hx1 = nodeRect.x + nodeRect.width
                hx2 = sib.x
            } else if (nodeRect.x >= sib.x + sib.width) {
                hDist = Math.round((nodeRect.x - (sib.x + sib.width)) / zoom)
                hx1 = sib.x + sib.width
                hx2 = nodeRect.x
            }

            if (hDist !== null && hDist >= MIN_DISTANCE) {
                const y = (nodeCenter.y + sibCenter.y) / 2
                lines.push({
                    x1: hx1, y1: y, x2: hx2, y2: y,
                    distance: hDist, direction: 'horizontal',
                })
            }

            // Check vertical distance
            let vDist: number | null = null
            let vy1 = 0, vy2 = 0
            if (nodeRect.y + nodeRect.height <= sib.y) {
                vDist = Math.round((sib.y - (nodeRect.y + nodeRect.height)) / zoom)
                vy1 = nodeRect.y + nodeRect.height
                vy2 = sib.y
            } else if (nodeRect.y >= sib.y + sib.height) {
                vDist = Math.round((nodeRect.y - (sib.y + sib.height)) / zoom)
                vy1 = sib.y + sib.height
                vy2 = nodeRect.y
            }

            if (vDist !== null && vDist >= MIN_DISTANCE) {
                const x = (nodeCenter.x + sibCenter.x) / 2
                lines.push({
                    x1: x, y1: vy1, x2: x, y2: vy2,
                    distance: vDist, direction: 'vertical',
                })
            }
        }
    }

    return lines
}

// ============================================================
// MeasurementOverlay
// Behavior (matches Figma):
//   - Alt held (no drag): show red measurement lines with numbers
//     to parent edges AND sibling frames
//   - Dragging: show magenta alignment guide lines only (no numbers)
//   - Alt+drag: duplicate + alignment guides only
// ============================================================

export function MeasurementOverlay({
    viewportRef,
    isDragging,
}: {
    viewportRef: React.RefObject<HTMLDivElement | null>
    isDragging: boolean
}) {
    const selectedIds = useEditorStore((s) => s.selectedIds)
    const nodes = useEditorStore((s) => s.nodes)
    const zoom = useEditorStore((s) => s.zoom)
    const panX = useEditorStore((s) => s.panX)
    const panY = useEditorStore((s) => s.panY)

    const [alignmentLines, setAlignmentLines] = useState<AlignmentLine[]>([])
    const [measurementLines, setMeasurementLines] = useState<MeasurementLine[]>([])
    const [altHeld, setAltHeld] = useState(false)
    const rafRef = useRef<number>(0)

    // Track Alt key state
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Alt') setAltHeld(true)
        }
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Alt') setAltHeld(false)
        }
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    // Gather sibling rects and parent rect for the selected node
    const getContext = useCallback(() => {
        const viewport = viewportRef.current
        if (!viewport || selectedIds.length !== 1) return null

        const nodeId = selectedIds[0]
        const nodeRect = getNodeScreenRect(nodeId, viewport)
        if (!nodeRect) return null

        const result = findParentOfNode(nodes, nodeId)
        const siblingRects: ScreenRect[] = []
        let parentRect: ScreenRect | null = null

        if (result?.parent) {
            parentRect = getNodeScreenRect(result.parent.id, viewport)
            const parent = findNodeById(nodes, result.parent.id) as FrameNode | null
            if (parent) {
                for (const child of parent.children) {
                    if (child.id === nodeId) continue
                    const sibRect = getNodeScreenRect(child.id, viewport)
                    if (sibRect) siblingRects.push(sibRect)
                }
            }
        } else {
            // Top-level node — siblings are other top-level nodes
            for (const n of nodes) {
                if (n.id === nodeId) continue
                const sibRect = getNodeScreenRect(n.id, viewport)
                if (sibRect) siblingRects.push(sibRect)
            }
        }

        return { nodeId, nodeRect, siblingRects, parentRect }
    }, [viewportRef, selectedIds, nodes])

    // DRAG MODE: show alignment guides only (no measurements)
    const updateDragOverlay = useCallback(() => {
        const ctx = getContext()
        if (!ctx) {
            setAlignmentLines([])
            setMeasurementLines([])
            return
        }

        const { lines } = calculateAlignmentLines(ctx.nodeRect, ctx.siblingRects, ctx.parentRect)
        setAlignmentLines(lines)
        setMeasurementLines([]) // Never show measurement numbers during drag
    }, [getContext])

    // ALT (no drag) MODE: show measurement lines with numbers
    const updateAltOverlay = useCallback(() => {
        const ctx = getContext()
        if (!ctx) {
            setMeasurementLines([])
            setAlignmentLines([])
            return
        }

        const parentMeasurements = ctx.parentRect
            ? calculateParentMeasurements(ctx.nodeRect, ctx.parentRect, zoom)
            : []
        const siblingMeasurements = calculateSiblingMeasurements(
            ctx.nodeRect, ctx.siblingRects, zoom
        )

        setMeasurementLines([...parentMeasurements, ...siblingMeasurements])
        setAlignmentLines([]) // No alignment guides in static measurement mode
    }, [getContext, zoom])

    // RAF loop for drag alignment
    useEffect(() => {
        let running = true
        const loop = () => {
            if (!running) return
            updateDragOverlay()
            rafRef.current = requestAnimationFrame(loop)
        }
        if (isDragging) {
            loop()
        } else {
            setAlignmentLines([])
        }
        return () => {
            running = false
            cancelAnimationFrame(rafRef.current)
        }
    }, [isDragging, updateDragOverlay])

    // Alt (no drag) measurement mode
    useEffect(() => {
        if (altHeld && !isDragging && selectedIds.length === 1) {
            updateAltOverlay()
        } else if (!isDragging) {
            setMeasurementLines([])
        }
    }, [altHeld, isDragging, selectedIds, updateAltOverlay, panX, panY, zoom])

    if (alignmentLines.length === 0 && measurementLines.length === 0) return null

    return (
        <>
            {/* Alignment guide lines — magenta (drag only) */}
            {alignmentLines.map((line, i) => {
                const isV = line.direction === 'vertical'
                const length = line.end - line.start
                if (length < 2) return null

                return (
                    <div
                        key={`align-${i}`}
                        className="pointer-events-none"
                        style={{
                            position: 'absolute',
                            left: isV ? line.position - 0.5 : line.start,
                            top: isV ? line.start : line.position - 0.5,
                            width: isV ? 1 : length,
                            height: isV ? length : 1,
                            backgroundColor: '#c026d3',
                            opacity: 0.8,
                            zIndex: 1002,
                        }}
                    />
                )
            })}

            {/* Measurement lines — red with distance labels (Alt, no drag) */}
            {measurementLines.map((m, i) => {
                const isH = m.direction === 'horizontal'
                const lineLength = isH
                    ? Math.abs(m.x2 - m.x1)
                    : Math.abs(m.y2 - m.y1)

                if (lineLength < 4) return null

                const midX = (m.x1 + m.x2) / 2
                const midY = (m.y1 + m.y2) / 2

                return (
                    <div key={`meas-${i}`}>
                        {/* Line */}
                        <div
                            className="pointer-events-none"
                            style={{
                                position: 'absolute',
                                left: isH ? Math.min(m.x1, m.x2) : m.x1 - 0.5,
                                top: isH ? m.y1 - 0.5 : Math.min(m.y1, m.y2),
                                width: isH ? lineLength : 1,
                                height: isH ? 1 : lineLength,
                                backgroundColor: '#ef4444',
                                zIndex: 1002,
                            }}
                        />

                        {/* Distance label */}
                        <div
                            className="pointer-events-none"
                            style={{
                                position: 'absolute',
                                left: midX,
                                top: midY,
                                transform: 'translate(-50%, -50%)',
                                backgroundColor: '#ef4444',
                                color: '#ffffff',
                                fontSize: 10,
                                fontWeight: 600,
                                fontFamily: 'Inter, system-ui, sans-serif',
                                padding: '1px 4px',
                                borderRadius: 3,
                                whiteSpace: 'nowrap',
                                lineHeight: '14px',
                                zIndex: 1003,
                            }}
                        >
                            {m.distance}
                        </div>

                        {/* End caps */}
                        {isH ? (
                            <>
                                <div className="pointer-events-none" style={{ position: 'absolute', left: m.x1 - 0.5, top: m.y1 - 3, width: 1, height: 6, backgroundColor: '#ef4444', zIndex: 1002 }} />
                                <div className="pointer-events-none" style={{ position: 'absolute', left: m.x2 - 0.5, top: m.y2 - 3, width: 1, height: 6, backgroundColor: '#ef4444', zIndex: 1002 }} />
                            </>
                        ) : (
                            <>
                                <div className="pointer-events-none" style={{ position: 'absolute', left: m.x1 - 3, top: m.y1 - 0.5, width: 6, height: 1, backgroundColor: '#ef4444', zIndex: 1002 }} />
                                <div className="pointer-events-none" style={{ position: 'absolute', left: m.x2 - 3, top: m.y2 - 0.5, width: 6, height: 1, backgroundColor: '#ef4444', zIndex: 1002 }} />
                            </>
                        )}
                    </div>
                )
            })}
        </>
    )
}

/**
 * Export the alignment calculation for use by the drag hook (snap-to-guide).
 */
export { calculateAlignmentLines, getNodeScreenRect }
export type { ScreenRect, AlignmentLine }
