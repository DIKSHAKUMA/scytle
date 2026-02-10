'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Plus, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUnifiedStore } from '@/store'
import { PageViewports } from './viewport-frame'
import { WireframeSidebar } from './wireframe-sidebar'
import { AddSectionSidebar } from './add-section-sidebar'
import { useKeyboardShortcuts } from './use-keyboard-shortcuts'

/* ------------------------------------------------------------------ */
/*  DraggablePageBlock                                                 */
/*  Wraps each PageViewports so users can freely drag pages on canvas  */
/* ------------------------------------------------------------------ */
interface DraggablePageBlockProps {
    pageId: string
    children: ReactNode
}

function DraggablePageBlock({ pageId, children }: DraggablePageBlockProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        // Only allow drag from the page header area (first 32px)
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        // Allow drag when clicking on the page background (outside sections)
        // Target must be the container itself or the page header row
        const target = e.target as HTMLElement
        const isHeader = target.closest('[data-page-header]')
        if (!isHeader) return

        e.stopPropagation()
        e.preventDefault()
        dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
        ref.current?.setPointerCapture(e.pointerId)
    }, [offset])

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!dragStart.current) return
        const dx = e.clientX - dragStart.current.mx
        const dy = e.clientY - dragStart.current.my
        setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy })
    }, [])

    const onPointerUp = useCallback(() => {
        dragStart.current = null
    }, [])

    return (
        <div
            ref={ref}
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
            className="relative"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
        >
            {children}
        </div>
    )
}

interface WireframeViewProps {
    projectId?: string
    className?: string
}

/**
 * WireframeView Component
 * 
 * Design inspiration:
 * - Figma: Infinite canvas with pan/zoom
 * - Figma Sites: Side-by-side Desktop + Mobile viewports
 * - Relume: Vertical page flow with sections
 * 
 * This is the main canvas for the wireframe editor.
 * Uses CSS transforms for zoom/pan (matching sitemap-view patterns).
 */
export function WireframeView({ projectId, className }: WireframeViewProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLDivElement>(null)

    // Pan state
    const [isPanning, setIsPanning] = useState(false)
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
    const panStartRef = useRef({ x: 0, y: 0 })
    const panOffsetStartRef = useRef({ x: 0, y: 0 })

    // Store state - unified store for both sitemap and wireframe
    const {
        pages,
        zoomLevel,
        selectedPageId,
        activePanelView,
        isAddSidebarOpen,
        addSidebarPageId,
        addSidebarInsertIndex,
        isDirty,
        setZoomLevel,
        deselectAll,
        setActivePanelView,
        selectPage,
        openAddSidebar,
        closeAddSidebar,
    } = useUnifiedStore()

    // Open add section sidebar (toggle behavior)
    const handleOpenAddSidebar = useCallback(() => {
        // If sidebar is already open, close it
        if (isAddSidebarOpen) {
            closeAddSidebar()
            return
        }

        // Use selected page or first page
        const targetPageId = selectedPageId || pages[0]?.id || ''
        if (targetPageId) {
            const page = pages.find(p => p.id === targetPageId)
            openAddSidebar(targetPageId, page?.sections.length || 0)
        }
    }, [isAddSidebarOpen, selectedPageId, pages, openAddSidebar, closeAddSidebar])

    // Open page panel (toggle behavior)
    const handleOpenPagePanel = useCallback(() => {
        // If page panel is already showing, close it
        if (activePanelView === 'page') {
            deselectAll()
            return
        }

        // Close add sidebar if open
        if (isAddSidebarOpen) {
            closeAddSidebar()
        }

        // Select first page if none selected, then open page panel
        const targetPageId = selectedPageId || pages[0]?.id || ''
        if (targetPageId) {
            selectPage(targetPageId)
            setActivePanelView('page')
        }
    }, [activePanelView, isAddSidebarOpen, selectedPageId, pages, selectPage, setActivePanelView, deselectAll, closeAddSidebar])

    // Keyboard shortcuts (Delete, Undo, Redo, Generate, etc.)
    useKeyboardShortcuts({ enabled: true })

    // Data is now loaded via unified store from project page - no separate load needed

    // Calculate scale from zoom level (percentage)
    const scale = zoomLevel / 100

    // Keyboard handlers for panning (Figma-style: hold Space to pan)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't intercept when typing in inputs
            const target = e.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return
            }

            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault()
                setIsPanning(true)
            }

            // Escape to deselect
            if (e.code === 'Escape') {
                deselectAll()
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsPanning(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [deselectAll])

    // Mouse handlers for panning
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (isPanning || e.button === 1) { // Middle mouse button or Space held
            e.preventDefault()
            panStartRef.current = { x: e.clientX, y: e.clientY }
            panOffsetStartRef.current = { ...panOffset }
            setIsPanning(true)
        }
    }, [isPanning, panOffset])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - panStartRef.current.x
            const dy = e.clientY - panStartRef.current.y
            setPanOffset({
                x: panOffsetStartRef.current.x + dx,
                y: panOffsetStartRef.current.y + dy,
            })
        }
    }, [isPanning])

    const handleMouseUp = useCallback(() => {
        // Only stop panning if Space is not held
        // The keyUp handler will stop it if Space was being used
        if (!containerRef.current?.dataset.spaceHeld) {
            setIsPanning(false)
        }
    }, [])

    // Native wheel event listener for proper preventDefault (React synthetic events are passive)
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleWheel = (e: WheelEvent) => {
            // Check if the event originated from within any sidebar
            // If so, don't handle it - let the sidebar scroll naturally
            const target = e.target as HTMLElement
            const sidebar = target.closest('[data-wireframe-sidebar]') || target.closest('[data-add-section-sidebar]')
            if (sidebar) {
                // Don't prevent default or handle - let sidebar scroll naturally
                return
            }

            // Always prevent default to stop browser back/forward gestures
            e.preventDefault()
            e.stopPropagation()

            // Zoom with Ctrl/Cmd + scroll - smoother like ReactFlow
            if (e.ctrlKey || e.metaKey) {
                // Use smaller increments for smoother zoom
                const zoomFactor = 1 - e.deltaY * 0.002  // Much smaller multiplier
                const newZoom = Math.min(200, Math.max(25, zoomLevel * zoomFactor))
                setZoomLevel(Math.round(newZoom))
            } else {
                // Pan with regular scroll
                setPanOffset(prev => ({
                    x: prev.x - e.deltaX,
                    y: prev.y - e.deltaY,
                }))
            }
        }

        // Add with passive: false to allow preventDefault
        container.addEventListener('wheel', handleWheel, { passive: false })

        return () => {
            container.removeEventListener('wheel', handleWheel)
        }
    }, [zoomLevel, setZoomLevel])

    // Pinch zoom support - smoother behavior matching ReactFlow
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let lastDistance = 0
        let initialZoom = zoomLevel

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                const touch1 = e.touches[0]
                const touch2 = e.touches[1]
                lastDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                )
                initialZoom = useUnifiedStore.getState().zoomLevel
            }
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                e.preventDefault()
                const touch1 = e.touches[0]
                const touch2 = e.touches[1]
                const currentDistance = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                )

                // Calculate scale ratio like ReactFlow - smoother exponential scaling
                const scaleRatio = currentDistance / lastDistance
                const currentZoom = useUnifiedStore.getState().zoomLevel

                // Apply smoother damping factor (0.15) for gradual zoom
                const targetZoom = currentZoom * (1 + (scaleRatio - 1) * 0.15)
                const newZoom = Math.min(200, Math.max(10, targetZoom))

                setZoomLevel(Math.round(newZoom))
                lastDistance = currentDistance
            }
        }

        container.addEventListener('touchstart', handleTouchStart, { passive: false })
        container.addEventListener('touchmove', handleTouchMove, { passive: false })

        return () => {
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('touchmove', handleTouchMove)
        }
    }, [zoomLevel, setZoomLevel])

    // Click on canvas to deselect
    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        // Only deselect if clicking directly on canvas (not on a page/section)
        if (e.target === canvasRef.current || e.target === containerRef.current) {
            deselectAll()
        }
    }, [deselectAll])

    // Cursor based on state
    const cursorClass = isPanning ? 'cursor-grabbing' : 'cursor-default'

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative w-full h-full overflow-hidden bg-muted/30',
                cursorClass,
                className
            )}
            style={{
                touchAction: 'none',
                overscrollBehavior: 'none', // Prevent browser back/forward gestures
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
        >
            {/* Dot grid background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: `${panOffset.x % 24}px ${panOffset.y % 24}px`,
                }}
            />

            {/* Canvas with transform */}
            <div
                ref={canvasRef}
                className="absolute inset-0"
                style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
                    transformOrigin: 'center top',
                    paddingTop: '48px',
                    paddingLeft: '48px',
                }}
            >
                {/* Pages container - horizontal row layout */}
                <div className="flex flex-row flex-wrap items-start gap-12 pb-24">
                    {pages.map((page) => (
                        <DraggablePageBlock key={page.id} pageId={page.id}>
                            <PageViewports
                                page={page}
                                scale={1}
                            />
                        </DraggablePageBlock>
                    ))}

                    {/* Empty state */}
                    {pages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <svg
                                    className="w-8 h-8 text-muted-foreground"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                No wireframes yet
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-sm">
                                Generate a sitemap first, then switch to wireframe view to see your pages.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Left Toolbar - Relume style with Page and Add buttons */}
            <div className="absolute left-3 top-3 z-30 flex flex-col gap-1 bg-white border border-gray-200 shadow-sm">
                {/* Page Panel Button */}
                <button
                    onClick={handleOpenPagePanel}
                    className={cn(
                        'w-10 h-10 flex items-center justify-center transition-colors',
                        activePanelView === 'page' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    title="Page"
                >
                    <LayoutGrid className="h-5 w-5" />
                </button>

                {/* Add Section Button */}
                <button
                    onClick={handleOpenAddSidebar}
                    className={cn(
                        'w-10 h-10 flex items-center justify-center transition-colors',
                        isAddSidebarOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    title="Add section"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </div>

            {/* Zoom indicator (bottom-left, synced with bottom bar) */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <div className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
                    {zoomLevel}%
                </div>
                {projectId && (
                    <div className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground flex items-center gap-1.5">
                        {isDirty ? (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                Saved
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Left Sidebar - Context-sensitive panels */}
            <WireframeSidebar />

            {/* Add Section Sidebar - Relume style */}
            {isAddSidebarOpen && addSidebarPageId && (
                <AddSectionSidebar
                    isOpen={isAddSidebarOpen}
                    onCloseAction={closeAddSidebar}
                    pageId={addSidebarPageId}
                    insertIndex={addSidebarInsertIndex}
                />
            )}
        </div>
    )
}
