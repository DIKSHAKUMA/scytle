'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Plus, LayoutGrid, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUnifiedStore } from '@/store'
import { useSelectionStore } from '@/store/selection-store'
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

    // Pan state — offset persisted in store so it survives tab switches
    const [isPanning, setIsPanning] = useState(false)
    const panOffset = useUnifiedStore(state => state.wireframePanOffset)
    const setPanOffset = useUnifiedStore(state => state.setWireframePanOffset)
    const wireframeHasInitialFit = useUnifiedStore(state => state.wireframeHasInitialFit)
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

    // Auto-fit wireframe on first load — deferred until container is visible
    const fitAttemptedRef = useRef(false)
    useEffect(() => {
        if (wireframeHasInitialFit || pages.length === 0 || fitAttemptedRef.current) return

        const tryFit = () => {
            const container = containerRef.current
            if (!container) return false
            const rect = container.getBoundingClientRect()
            // If container isn't visible yet (display:none), rect is 0x0
            if (rect.width === 0 || rect.height === 0) return false

            fitAttemptedRef.current = true

            // Measure actual content: each page has desktop (1440) + mobile (390) viewports + gap (48)
            const pageWidth = 1440 + 390 + 48 // desktop + gap + mobile
            const totalContentWidth = pages.length * pageWidth + (pages.length - 1) * 48 + 96 // pages + gaps + padding
            const maxSections = Math.max(...pages.map(p => p.sections.length), 1)
            const totalContentHeight = 80 + maxSections * 200 + 96

            // Fit both dimensions − pick the smaller zoom so everything shows
            const fitZoomW = (rect.width * 0.85) / totalContentWidth * 100
            const fitZoomH = (rect.height * 0.80) / totalContentHeight * 100
            const fitZoom = Math.max(5, Math.min(fitZoomW, fitZoomH, 100))
            const rounded = Math.round(fitZoom)

            setZoomLevel(rounded)

            // Center the content
            const scaledW = totalContentWidth * (rounded / 100)
            const scaledH = totalContentHeight * (rounded / 100)
            setPanOffset({
                x: Math.max(0, (rect.width - scaledW) / 2),
                y: Math.max(20, (rect.height - scaledH) / 2),
            })

            useUnifiedStore.getState().setWireframeHasInitialFit(true)
            return true
        }

        // Try immediately — if container is visible it works; otherwise poll
        if (!tryFit()) {
            const interval = setInterval(() => {
                if (tryFit()) clearInterval(interval)
            }, 100)
            return () => clearInterval(interval)
        }
    }, [wireframeHasInitialFit, pages, setZoomLevel, setPanOffset])

    // Keyboard handlers for panning (Figma-style: hold Space to pan)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't intercept when typing in inputs
            const target = e.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return
            }

            // Check V2 selection mode — don't hijack keys when blocks are active
            const v2Mode = useSelectionStore.getState().mode

            if (e.code === 'Space' && !e.repeat) {
                // Only enable Space-to-pan when nothing is deeply selected
                if (v2Mode === 'idle' || v2Mode === 'section-selected') {
                    e.preventDefault()
                    setIsPanning(true)
                }
            }

            // Escape to deselect — only when V2 is idle (V2 keyboard handler handles its own escape)
            if (e.code === 'Escape' && v2Mode === 'idle') {
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
            panOffsetStartRef.current = { ...useUnifiedStore.getState().wireframePanOffset }
            setIsPanning(true)
        }
    }, [isPanning])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - panStartRef.current.x
            const dy = e.clientY - panStartRef.current.y
            setPanOffset({
                x: panOffsetStartRef.current.x + dx,
                y: panOffsetStartRef.current.y + dy,
            })
        }
    }, [isPanning, setPanOffset])

    const handleMouseUp = useCallback(() => {
        // Only stop panning if Space is not held
        // The keyUp handler will stop it if Space was being used
        if (!containerRef.current?.dataset.spaceHeld) {
            setIsPanning(false)
        }
    }, [])

    // Native wheel event listener — Relume-style:
    //   • Ctrl/Cmd + scroll (or trackpad pinch) = zoom toward cursor
    //   • Plain two-finger scroll = pan
    // All state is read via getState() so the handler never goes stale.
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleWheel = (e: WheelEvent) => {
            // Let sidebars scroll naturally
            const target = e.target as HTMLElement
            if (target.closest('[data-wireframe-sidebar]') || target.closest('[data-add-section-sidebar]')) return

            e.preventDefault()
            e.stopPropagation()

            const state = useUnifiedStore.getState()
            const currentZoom = state.zoomLevel
            const prev = state.wireframePanOffset

            if (e.ctrlKey || e.metaKey) {
                // ── Zoom toward cursor (trackpad pinch sends ctrlKey + small deltaY) ──
                // Exponential zoom factor — matches Relume's silky feel
                const delta = -e.deltaY
                const zoomSpeed = 0.008 // higher = faster zoom
                const factor = Math.pow(2, delta * zoomSpeed)
                const newZoom = Math.round(Math.min(300, Math.max(5, currentZoom * factor)))

                if (newZoom === currentZoom) return

                const rect = container.getBoundingClientRect()
                const cursorX = e.clientX - rect.left
                const cursorY = e.clientY - rect.top

                const oldScale = currentZoom / 100
                const newScale = newZoom / 100

                // Keep the world-point under the cursor pinned
                const worldX = (cursorX - prev.x) / oldScale
                const worldY = (cursorY - prev.y) / oldScale

                state.setWireframePanOffset({
                    x: cursorX - worldX * newScale,
                    y: cursorY - worldY * newScale,
                })
                state.setZoomLevel(newZoom)
            } else {
                // ── Pan (two-finger scroll / scroll wheel) ──
                state.setWireframePanOffset({
                    x: prev.x - e.deltaX,
                    y: prev.y - e.deltaY,
                })
            }
        }

        container.addEventListener('wheel', handleWheel, { passive: false })
        return () => container.removeEventListener('wheel', handleWheel)
    }, []) // ← empty deps: all reads via getState(), never stale

    // Touch pinch-to-zoom — same exponential curve
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let lastDistance = 0

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                lastDistance = Math.hypot(
                    e.touches[1].clientX - e.touches[0].clientX,
                    e.touches[1].clientY - e.touches[0].clientY
                )
            }
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length !== 2) return
            e.preventDefault()

            const dist = Math.hypot(
                e.touches[1].clientX - e.touches[0].clientX,
                e.touches[1].clientY - e.touches[0].clientY
            )
            const ratio = dist / lastDistance
            const state = useUnifiedStore.getState()
            const newZoom = Math.round(Math.min(300, Math.max(5, state.zoomLevel * ratio)))
            state.setZoomLevel(newZoom)
            lastDistance = dist
        }

        container.addEventListener('touchstart', handleTouchStart, { passive: false })
        container.addEventListener('touchmove', handleTouchMove, { passive: false })
        return () => {
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('touchmove', handleTouchMove)
        }
    }, [])

    // Click on canvas to deselect
    const v2Clear = useSelectionStore((s) => s.clear)
    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        // Only deselect if clicking directly on canvas (not on a page/section)
        if (e.target === canvasRef.current || e.target === containerRef.current) {
            deselectAll()
            v2Clear()
        }
    }, [deselectAll, v2Clear])

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
                className="absolute top-0 left-0"
                style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    paddingTop: '48px',
                    paddingLeft: '48px',
                }}
            >
                {/* Pages container - horizontal row layout (no wrap, like Relume) */}
                <div className="flex flex-row flex-nowrap items-start gap-12 pb-24">
                    {pages.map((page, idx) => (
                        <DraggablePageBlock key={page.id} pageId={page.id}>
                            <div
                                style={{
                                    opacity: 0,
                                    animation: `wireframe-page-in 0.4s ease-out ${idx * 120}ms forwards`,
                                }}
                            >
                                <PageViewports
                                    page={page}
                                    scale={1}
                                />
                            </div>
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

                {/* Style Guide Button */}
                <button
                    onClick={() => {
                        if (activePanelView === 'style-guide') {
                            setActivePanelView(null)
                        } else {
                            if (isAddSidebarOpen) closeAddSidebar()
                            setActivePanelView('style-guide')
                        }
                    }}
                    className={cn(
                        'w-10 h-10 flex items-center justify-center transition-colors',
                        activePanelView === 'style-guide'
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    title="Style Guide"
                >
                    <Palette className="h-5 w-5" />
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
