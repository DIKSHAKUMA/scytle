'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { ScytleNode } from '@/types/canvas'
import { MIN_ZOOM, MAX_ZOOM } from '@/types/canvas'
import { NodeRenderer } from '@/components/editor/node-renderer'


interface ReadOnlyCanvasProps {
    nodes: ScytleNode[]
    canvasColor?: string
}

/**
 * Compute the zoom/pan that fits all nodes centered in a given viewport.
 */
function computeZoomToFit(
    nodes: ScytleNode[],
    viewportW: number,
    viewportH: number,
    padding = 60,
) {
    if (nodes.length === 0) return { zoom: 1, panX: 0, panY: 0 }

    const minX = Math.min(...nodes.map(n => n.x))
    const maxX = Math.max(...nodes.map(n => n.x + n.width))
    const minY = Math.min(...nodes.map(n => n.y))
    const maxY = Math.max(...nodes.map(n => n.y + n.height))
    const contentW = maxX - minX
    const contentH = maxY - minY

    if (contentW === 0 || contentH === 0) return { zoom: 1, panX: 0, panY: 0 }

    const zoomX = (viewportW - padding * 2) / contentW
    const zoomY = (viewportH - padding * 2) / contentH
    const zoom = Math.max(MIN_ZOOM, Math.min(zoomX, zoomY, 1))
    const panX = (viewportW / 2) - ((minX + contentW / 2) * zoom)
    const panY = (viewportH / 2) - ((minY + contentH / 2) * zoom)

    return { zoom, panX, panY }
}

/**
 * Read-only canvas viewer — renders ScytleNode tree with pan/zoom
 * but no selection, dragging, resizing, or editing.
 * Uses refs for zoom/pan state to match the editor's snappy feel.
 */
export function ReadOnlyCanvas({ nodes, canvasColor = '#F5F5F5' }: ReadOnlyCanvasProps) {
    const viewportRef = useRef<HTMLDivElement>(null)
    const transformRef = useRef<HTMLDivElement>(null)

    // Use refs for zoom/pan — direct DOM updates, no React re-render per frame
    const zoomRef = useRef(1)
    const panXRef = useRef(0)
    const panYRef = useRef(0)

    // Panning state
    const isPanningRef = useRef(false)
    const lastPointerRef = useRef({ x: 0, y: 0 })

    // Track whether initial fit has been applied
    const [ready, setReady] = useState(false)

    // Apply current zoom/pan to the DOM directly
    const applyTransform = useCallback(() => {
        const el = transformRef.current
        if (!el) return
        el.style.setProperty('--z', String(zoomRef.current))
        el.style.setProperty('--px', String(panXRef.current))
        el.style.setProperty('--py', String(panYRef.current))
    }, [])

    // zoomTo — identical to editor store's zoomTo logic
    const zoomTo = useCallback((newZoom: number, focalScreenX: number, focalScreenY: number) => {
        const oldZoom = zoomRef.current
        const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom))

        const canvasX = (focalScreenX - panXRef.current) / oldZoom
        const canvasY = (focalScreenY - panYRef.current) / oldZoom

        panXRef.current = focalScreenX - canvasX * clamped
        panYRef.current = focalScreenY - canvasY * clamped
        zoomRef.current = clamped

        applyTransform()
    }, [applyTransform])

    // Initial zoom-to-fit — computed before making visible
    useEffect(() => {
        if (nodes.length === 0) {
            setReady(true)
            return
        }

        // Use actual viewport dimensions
        const viewport = viewportRef.current
        const viewportW = viewport?.clientWidth ?? window.innerWidth
        const viewportH = viewport?.clientHeight ?? (window.innerHeight - 56)

        const { zoom, panX, panY } = computeZoomToFit(nodes, viewportW, viewportH)
        zoomRef.current = zoom
        panXRef.current = panX
        panYRef.current = panY
        applyTransform()
        setReady(true)
    }, [nodes, applyTransform])

    // Wheel: ctrl/cmd+scroll = zoom to cursor, regular scroll = pan
    useEffect(() => {
        const viewport = viewportRef.current
        if (!viewport) return

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            const rect = viewport.getBoundingClientRect()

            if (e.ctrlKey || e.metaKey) {
                const focalX = e.clientX - rect.left
                const focalY = e.clientY - rect.top
                const delta = -e.deltaY * 0.01
                const newZoom = zoomRef.current * (1 + delta)
                zoomTo(newZoom, focalX, focalY)
            } else {
                panXRef.current -= e.deltaX
                panYRef.current -= e.deltaY
                applyTransform()
            }
        }

        viewport.addEventListener('wheel', handleWheel, { passive: false })
        return () => viewport.removeEventListener('wheel', handleWheel)
    }, [zoomTo, applyTransform])

    // Mouse drag panning
    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        if (e.button === 0 || e.button === 1) {
            isPanningRef.current = true
            lastPointerRef.current = { x: e.clientX, y: e.clientY }
            ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        }
    }, [])

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (!isPanningRef.current) return
        const dx = e.clientX - lastPointerRef.current.x
        const dy = e.clientY - lastPointerRef.current.y
        lastPointerRef.current = { x: e.clientX, y: e.clientY }
        panXRef.current += dx
        panYRef.current += dy
        applyTransform()
    }, [applyTransform])

    const handlePointerUp = useCallback(() => {
        isPanningRef.current = false
    }, [])

    return (
        <div
            ref={viewportRef}
            className="w-full h-full overflow-hidden select-none"
            style={{
                backgroundColor: canvasColor,
                cursor: isPanningRef.current ? 'grabbing' : 'grab',
                // Hide until initial fit is computed to prevent flash
                visibility: ready ? 'visible' : 'hidden',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            <div
                ref={transformRef}
                className="absolute top-0 left-0"
                style={{ '--z': zoomRef.current, '--px': panXRef.current, '--py': panYRef.current } as unknown as CSSProperties}
            >
                {nodes.map((node) => (
                    <NodeRenderer key={node.id} node={node} isTopLevel />
                ))}
            </div>
        </div>
    )
}
