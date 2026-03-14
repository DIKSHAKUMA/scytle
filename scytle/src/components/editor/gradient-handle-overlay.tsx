'use client'

import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { findNodeById } from '@/types/canvas'
import type { GradientFill } from '@/types/canvas'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ScreenRect {
    x: number
    y: number
    width: number
    height: number
}

// ─────────────────────────────────────────────────────────────
// Math helpers
// ─────────────────────────────────────────────────────────────

function angleToHandles(
    angleDeg: number,
): [{ x: number; y: number }, { x: number; y: number }] {
    const rad = (angleDeg * Math.PI) / 180
    const dx = Math.sin(rad) * 0.5
    const dy = -Math.cos(rad) * 0.5
    return [
        { x: 0.5 - dx, y: 0.5 - dy }, // start
        { x: 0.5 + dx, y: 0.5 + dy }, // end
    ]
}

function handlesToAngle(
    start: { x: number; y: number },
    end: { x: number; y: number },
): number {
    const dx = end.x - start.x
    const dy = end.y - start.y
    return (((Math.atan2(dx, -dy) * 180) / Math.PI) + 360) % 360
}

// ─────────────────────────────────────────────────────────────
// DOM helper — same pattern as selection-overlay
// ─────────────────────────────────────────────────────────────

function getNodeScreenRect(
    nodeId: string,
    viewportEl: HTMLElement | null,
): ScreenRect | null {
    if (!viewportEl) return null
    const el = viewportEl.querySelector(`[data-node-id="${nodeId}"]`)
    if (!el) return null
    const nodeRect = el.getBoundingClientRect()
    const vRect = viewportEl.getBoundingClientRect()
    return {
        x: nodeRect.left - vRect.left,
        y: nodeRect.top - vRect.top,
        width: nodeRect.width,
        height: nodeRect.height,
    }
}

// ─────────────────────────────────────────────────────────────
// DragHandle — a single draggable gradient control point
// ─────────────────────────────────────────────────────────────

interface DragHandleProps {
    cx: number
    cy: number
    /** Normalized (0–1) position in node space — captured at pointer-down */
    normPos: { x: number; y: number }
    screenRect: ScreenRect
    isStart: boolean
    onPositionChange: (pos: { x: number; y: number }) => void
}

function DragHandle({
    cx,
    cy,
    normPos,
    screenRect,
    isStart,
    onPositionChange,
}: DragHandleProps) {
    const isDragging = useRef(false)
    const startClient = useRef({ x: 0, y: 0 })
    const startNorm = useRef({ x: 0, y: 0 })
    const rectRef = useRef<ScreenRect>(screenRect)

    useEffect(() => {
        rectRef.current = screenRect
    }, [screenRect])

    return (
        <circle
            cx={cx}
            cy={cy}
            r={5}
            fill={isStart ? 'white' : 'rgba(255,255,255,0.85)'}
            stroke="rgba(0,0,0,0.45)"
            strokeWidth={1.5}
            style={{ pointerEvents: 'auto', cursor: 'crosshair' }}
            onPointerDown={(e) => {
                e.stopPropagation()
                e.preventDefault()
                isDragging.current = true
                startClient.current = { x: e.clientX, y: e.clientY }
                startNorm.current = { ...normPos }
                ;(e.currentTarget as SVGCircleElement).setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
                if (!isDragging.current) return
                e.stopPropagation()
                const rect = rectRef.current
                if (rect.width < 1 || rect.height < 1) return
                const newX =
                    startNorm.current.x + (e.clientX - startClient.current.x) / rect.width
                const newY =
                    startNorm.current.y + (e.clientY - startClient.current.y) / rect.height
                onPositionChange({ x: newX, y: newY })
            }}
            onPointerUp={(e) => {
                isDragging.current = false
                ;(e.currentTarget as SVGCircleElement).releasePointerCapture(e.pointerId)
            }}
        />
    )
}

// ─────────────────────────────────────────────────────────────
// GradientHandleOverlay
// ─────────────────────────────────────────────────────────────

interface GradientHandleOverlayProps {
    viewportRef: React.RefObject<HTMLDivElement | null>
}

export function GradientHandleOverlay({ viewportRef }: GradientHandleOverlayProps) {
    const gradientEditingFillIdx = useEditorStore((s) => s.gradientEditingFillIdx)
    const selectedIds = useEditorStore((s) => s.selectedIds)
    const nodes = useEditorStore((s) => s.nodes)
    const updateNode = useEditorStore((s) => s.updateNode)

    const nodeId = selectedIds[0] ?? null
    const node = nodeId ? findNodeById(nodes, nodeId) : null
    const fill =
        node && gradientEditingFillIdx !== null
            ? (node.fills[gradientEditingFillIdx] as GradientFill | undefined)
            : null

    // Only render for linear gradient (undefined gradientType defaults to linear)
    if (!fill || fill.type !== 'gradient') return null
    if (fill.gradientType && fill.gradientType !== 'linear') return null

    const screenRect = getNodeScreenRect(nodeId!, viewportRef.current)
    if (!screenRect || screenRect.width < 4 || screenRect.height < 4) return null

    const angle = fill.angle ?? 90
    const [defaultStart, defaultEnd] = angleToHandles(angle)
    const startNorm = fill.handles?.[0] ?? defaultStart
    const endNorm = fill.handles?.[1] ?? defaultEnd

    const startPx = {
        x: screenRect.x + startNorm.x * screenRect.width,
        y: screenRect.y + startNorm.y * screenRect.height,
    }
    const endPx = {
        x: screenRect.x + endNorm.x * screenRect.width,
        y: screenRect.y + endNorm.y * screenRect.height,
    }

    const handleMove =
        (which: 'start' | 'end') => (newNorm: { x: number; y: number }) => {
            if (!nodeId || !node || gradientEditingFillIdx === null) return
            const cur0 = fill.handles?.[0] ?? defaultStart
            const cur1 = fill.handles?.[1] ?? defaultEnd
            const newStart = which === 'start' ? newNorm : cur0
            const newEnd = which === 'end' ? newNorm : cur1
            const newAngle = handlesToAngle(newStart, newEnd)
            const newFills = node.fills.map((f, i) =>
                i === gradientEditingFillIdx
                    ? { ...f, handles: [newStart, newEnd], angle: newAngle }
                    : f,
            )
            updateNode(nodeId, { fills: newFills })
        }

    return (
        <svg
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: 'none', overflow: 'visible', zIndex: 45 }}
        >
            {/* Connecting line */}
            <line
                x1={startPx.x}
                y1={startPx.y}
                x2={endPx.x}
                y2={endPx.y}
                stroke="rgba(255,255,255,0.65)"
                strokeWidth={1}
            />
            {/* Start handle (filled circle) */}
            <DragHandle
                cx={startPx.x}
                cy={startPx.y}
                normPos={startNorm}
                screenRect={screenRect}
                isStart
                onPositionChange={handleMove('start')}
            />
            {/* End handle (unfilled ring) */}
            <DragHandle
                cx={endPx.x}
                cy={endPx.y}
                normPos={endNorm}
                screenRect={screenRect}
                isStart={false}
                onPositionChange={handleMove('end')}
            />
        </svg>
    )
}
