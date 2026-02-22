'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useProjectStore, useAuthStore, useUnifiedStore } from '@/store'
import { useSitemapStore, CanvasTool, flushPendingSave, setSkipUnifiedSync } from '@/store/sitemap-store'
import { flushPendingSave as flushUnifiedSave } from '@/store/unified-store'
import { SitemapView, LeftSidebar, SectionPickerPanel } from '@/components/canvas'
import { ReactFlowProvider } from '@xyflow/react'
import { WireframeView } from '@/components/wireframe/wireframe-view'
import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    Map,
    Layout,
    Palette,
    Code,
    Hand,
    MousePointer2,
    Plus,
    ZoomIn,
    ZoomOut,
    Undo,
    Redo,
    Loader2,
    Maximize,
    Monitor,
    Tablet,
    Smartphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type CanvasView = 'sitemap' | 'wireframe' | 'design' | 'code'

export default function ProjectEditorPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const projectId = params.id as string

    const { user, setUser } = useAuthStore()
    const { currentProject, fetchProject, isLoading: projectLoading } = useProjectStore()
    const {
        activeTool,
        setActiveTool,
        zoomLevel,
        zoomIn,
        zoomOut,
        resetZoom,
        fitView,
        undo,
        redo,
        historyIndex,
        history,
        selectedNodeId,
        setSelectedNodeId,
        sectionPickerOpen,
        sectionPickerTargetPageId,
        sectionPickerInsertIndex,
        closeSectionPicker,
        addSectionToPage,
    } = useSitemapStore()

    // Wireframe zoom state from unified store
    const wireframeZoomLevel = useUnifiedStore(state => state.zoomLevel)
    const wireframeZoomIn = useUnifiedStore(state => state.zoomIn)
    const wireframeZoomOut = useUnifiedStore(state => state.zoomOut)
    const wireframeResetZoom = useUnifiedStore(state => state.resetZoom)
    const wireframeFitView = useUnifiedStore(state => state.fitView)
    const setCanvasMode = useUnifiedStore(state => state.setCanvasMode)
    const activeViewports = useUnifiedStore(state => state.activeViewports)
    const setSingleViewport = useUnifiedStore(state => state.setSingleViewport)

    const validViews: CanvasView[] = ['sitemap', 'wireframe', 'design', 'code']
    const viewParam = searchParams.get('view') as CanvasView | null
    const [activeView, setActiveViewState] = useState<CanvasView>(
        viewParam && validViews.includes(viewParam) ? viewParam : 'sitemap'
    )

    // Wrap setActiveView to also update the URL
    const setActiveView = (view: CanvasView) => {
        setActiveViewState(view)
        const url = new URL(window.location.href)
        url.searchParams.set('view', view)
        window.history.replaceState({}, '', url.toString())
    }

    // Sync canvasMode when switching between wireframe and design tabs
    useEffect(() => {
        if (activeView === 'design') {
            setCanvasMode('design')
        } else {
            setCanvasMode('wireframe')
        }
    }, [activeView, setCanvasMode])

    const [isDevMode, setIsDevMode] = useState(false)
    const [authChecked, setAuthChecked] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // View-aware zoom: wireframe + design share unified store, sitemap uses its own
    const isWireframeCanvas = activeView === 'wireframe' || activeView === 'design'
    const activeZoomLevel = isWireframeCanvas ? wireframeZoomLevel : zoomLevel
    const activeZoomIn = isWireframeCanvas ? wireframeZoomIn : zoomIn
    const activeZoomOut = isWireframeCanvas ? wireframeZoomOut : zoomOut
    const activeResetZoom = isWireframeCanvas ? wireframeResetZoom : resetZoom
    const activeFitView = isWireframeCanvas ? wireframeFitView : fitView

    // Reset project store loading state on mount (prevents stuck spinner after HMR)
    useEffect(() => {
        useProjectStore.setState({ isLoading: false })
    }, [])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Tool shortcuts (only when not typing)
            if (document.activeElement?.tagName !== 'INPUT' &&
                document.activeElement?.tagName !== 'TEXTAREA') {
                if (e.key === 'v' || e.key === 'V') {
                    setActiveTool('select')
                } else if (e.key === 'h' || e.key === 'H') {
                    setActiveTool('hand')
                } else if (e.key === 'a' || e.key === 'A') {
                    setActiveTool('add')
                }
            }

            // Undo/Redo
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault()
                if (e.shiftKey) {
                    redo()
                } else {
                    undo()
                }
            }

            // Zoom shortcuts
            if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
                e.preventDefault()
                activeZoomIn()
            }
            if ((e.metaKey || e.ctrlKey) && e.key === '-') {
                e.preventDefault()
                activeZoomOut()
            }
            if ((e.metaKey || e.ctrlKey) && e.key === '0') {
                e.preventDefault()
                activeResetZoom()
            }

            // Escape to close panel
            if (e.key === 'Escape') {
                setIsSidebarOpen(false)
                setSelectedNodeId(null)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [setActiveTool, undo, redo, activeZoomIn, activeZoomOut, activeResetZoom, setSelectedNodeId])

    // Flush pending saves before page unload (prevents data loss on refresh)
    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log('🔄 Page unloading, flushing pending saves...')
            flushPendingSave()
            flushUnifiedSave()
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [])

    // Sync wireframe (unified store) section changes back to sitemap store in real-time
    useEffect(() => {
        const unsub = useUnifiedStore.subscribe(
            (state) => state.pages,
            (pages) => {
                // When unified store pages change, update the corresponding sitemap nodes
                const sitemapState = useSitemapStore.getState()
                if (!sitemapState.nodes.length || !pages.length) return

                // Set guard flag so saveToHistory doesn't sync back to unified (avoids loop)
                setSkipUnifiedSync(true)

                pages.forEach((page) => {
                    const node = sitemapState.nodes.find(n => n.id === page.id)
                    if (!node) return

                    // Convert WireframeSection[] to the simpler format sitemap uses
                    const sitemapSections = page.sections.map(s => ({
                        id: s.id,
                        name: s.name,
                        description: s.description,
                    }))

                    // Only update if sections actually changed
                    const currentSections = (node.data as { sections?: Array<{ id?: string; name: string }> }).sections || []
                    const currentIds = currentSections.map((s: string | { id?: string; name: string }) => typeof s === 'string' ? s : s.id).join(',')
                    const newIds = sitemapSections.map(s => s.id).join(',')

                    if (currentIds !== newIds) {
                        useSitemapStore.getState().updateNode(page.id, {
                            sections: sitemapSections,
                        })
                    }
                })

                // Clear guard flag
                setSkipUnifiedSync(false)
            },
            { equalityFn: (a, b) => a === b } // Only fire on reference change (immer produces new refs)
        )
        return () => unsub()
    }, [])

    // Open sidebar when a node is selected, close when deselected
    useEffect(() => {
        if (selectedNodeId) {
            setIsSidebarOpen(true)
        } else {
            setIsSidebarOpen(false)
        }
    }, [selectedNodeId])

    // Check authentication and load project
    useEffect(() => {
        let cancelled = false

        const init = async () => {
            try {
                const { getUser } = await import('@/lib/appwrite')
                const currentUser = await getUser()

                if (cancelled) return

                if (!currentUser) {
                    window.location.href = `/login?redirect=/project/${projectId}`
                    return
                }

                setUser(currentUser)
                setAuthChecked(true)

                // Load project
                const project = await fetchProject(projectId)

                if (cancelled) return

                // Set project ID for both stores' auto-save
                useSitemapStore.getState().setProjectId(projectId)
                useUnifiedStore.getState().setProjectId(projectId)

                // Load saved sitemap if it exists
                // sitemapData is stored as a JSON string in the database
                if (project?.sitemapData) {
                    try {
                        // Parse the JSON string
                        const parsed = typeof project.sitemapData === 'string'
                            ? JSON.parse(project.sitemapData)
                            : project.sitemapData

                        // v2 format: { version: 2, nodes: [...], edges: [...] }
                        // Preserves full tree hierarchy including parent-child edges
                        if (parsed?.version === 2 && parsed.nodes && parsed.edges) {
                            console.log('📦 Loading v2 sitemap format (nodes + edges)')
                            const rawNodes = parsed.nodes.map((n: { id: string; type: string; data: Record<string, unknown> }) => ({
                                id: n.id,
                                type: n.type,
                                position: { x: 0, y: 0 },
                                data: n.data,
                                ...(n.type === 'project' ? { draggable: false } : {}),
                            }))
                            const rawEdges = parsed.edges.map((e: { id: string; source: string; target: string; type?: string }) => ({
                                id: e.id,
                                source: e.source,
                                target: e.target,
                                type: e.type || 'sitemap',
                            }))
                            useSitemapStore.getState().loadRawSitemap(rawNodes, rawEdges)

                            // Also load into unified store (convert nodes to page format)
                            const aiPages = rawNodes
                                .filter((n: { type: string }) => n.type === 'page')
                                .map((n: { id: string; data: { label?: string; name?: string; slug?: string; sections?: Array<{ id?: string; name: string; description?: string }> } }) => ({
                                    id: n.id,
                                    label: n.data.label || n.data.name || 'Untitled',
                                    slug: n.data.slug || '/',
                                    sections: n.data.sections || [],
                                    children: [],
                                }))
                            useUnifiedStore.getState().loadFromAI(aiPages, project.name, { skipSave: true })
                            console.log('📦 Both stores loaded -', 'sitemap nodes:', rawNodes.length, 'edges:', rawEdges.length, 'unified pages:', useUnifiedStore.getState().pages.length)
                        } else {
                            // Legacy format: flat array or {pages, projectName}
                            let sitemapPages: typeof parsed
                            let savedProjectName = project.name

                            if (Array.isArray(parsed)) {
                                sitemapPages = parsed
                            } else if (parsed?.pages && Array.isArray(parsed.pages)) {
                                sitemapPages = parsed.pages
                                savedProjectName = parsed.projectName || project.name
                            } else {
                                sitemapPages = []
                            }

                            if (sitemapPages.length > 0) {
                                const isUnifiedFormat = sitemapPages[0].name && !sitemapPages[0].label

                                if (isUnifiedFormat) {
                                    // Build slim pages for the sitemap store (only needs id/label/slug/stubs)
                                    const aiPages = sitemapPages.map((p: { id: string; name: string; slug: string; sections: Array<{ name: string; description?: string; id?: string }> }) => ({
                                        id: p.id,
                                        label: p.name,
                                        slug: p.slug,
                                        sections: p.sections.map((s: { name: string; description?: string; id?: string }) => ({
                                            id: s.id,
                                            name: s.name,
                                            description: s.description,
                                        })),
                                        children: [],
                                    }))
                                    console.log('📦 Loading legacy unified format (with rich section data)')
                                    useSitemapStore.getState().loadSitemap(aiPages, savedProjectName)
                                    // Use loadFromJSON to preserve full section data (content, controls, componentId)
                                    // instead of loadFromAI which re-creates sections from defaults
                                    useUnifiedStore.getState().loadFromJSON(JSON.stringify({ pages: sitemapPages, projectName: savedProjectName }))
                                } else {
                                    console.log('📦 Loading legacy sitemap format')
                                    useSitemapStore.getState().loadSitemap(sitemapPages, savedProjectName)
                                    useUnifiedStore.getState().loadFromAI(sitemapPages, savedProjectName, { skipSave: true })
                                }
                                console.log('📦 Legacy load complete -', 'sitemap nodes:', useSitemapStore.getState().nodes.length)
                            } else {
                                console.log('📦 Sitemap data is empty, using default')
                            }
                        }
                    } catch (parseError) {
                        console.error('❌ Failed to parse sitemap data:', parseError)
                    }
                } else {
                    console.log('📦 No saved sitemap found, using default')
                }
            } catch (error) {
                if (cancelled) return
                console.error('🔴 Failed to initialize editor:', error)
                router.push('/dashboard')
            }
        }

        init()

        return () => {
            cancelled = true
        }
    }, [projectId, setUser, fetchProject, router])

    const canUndo = historyIndex > 0
    const canRedo = historyIndex < history.length - 1

    if (!authChecked || projectLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!currentProject) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-muted-foreground">Project not found</p>
                <Button onClick={() => router.push('/dashboard')}>
                    Back to Dashboard
                </Button>
            </div>
        )
    }

    return (
        <AppShell hideNav>
            <TooltipProvider delayDuration={300}>
                <div className="flex h-[calc(100vh-56px)] overflow-hidden">
                    {/* Full-width Canvas Area (Relume-style) */}
                    <div className="flex-1 flex flex-col bg-muted/30 h-full overflow-hidden relative">
                        {/* Left Sidebar (overlays canvas when open) */}
                        <LeftSidebar
                            isOpen={isSidebarOpen && activeView === 'sitemap' && !isDevMode && !sectionPickerOpen}
                            onCloseAction={() => {
                                setIsSidebarOpen(false)
                                setSelectedNodeId(null)
                            }}
                        />

                        {/* Section Picker Panel (overlays canvas when open) */}
                        <SectionPickerPanel
                            isOpen={sectionPickerOpen}
                            onClose={closeSectionPicker}
                            onSelectSection={(section) => {
                                if (sectionPickerTargetPageId !== null && sectionPickerInsertIndex !== null) {
                                    addSectionToPage(
                                        sectionPickerTargetPageId,
                                        section,
                                        sectionPickerInsertIndex
                                    )
                                }
                            }}
                            targetPageId={sectionPickerTargetPageId}
                            insertAtIndex={sectionPickerInsertIndex}
                        />

                        {/* Top Bar - View Switcher */}
                        <div className="flex items-center justify-between px-4 py-2 border-b bg-background">
                            <Tabs
                                value={isDevMode ? 'code' : activeView}
                                onValueChange={(v) => {
                                    if (v === 'code') {
                                        setIsDevMode(true)
                                    } else {
                                        setIsDevMode(false)
                                        setActiveView(v as CanvasView)
                                    }
                                }}
                            >
                                <TabsList className="bg-muted/50">
                                    <TabsTrigger value="sitemap" className="gap-1.5">
                                        <Map className="w-4 h-4" />
                                        Sitemap
                                    </TabsTrigger>
                                    <TabsTrigger value="wireframe" className="gap-1.5">
                                        <Layout className="w-4 h-4" />
                                        Wireframe
                                    </TabsTrigger>
                                    <TabsTrigger value="design" className="gap-1.5">
                                        <Palette className="w-4 h-4" />
                                        Design
                                    </TabsTrigger>
                                    <TabsTrigger value="code" className="gap-1.5">
                                        <Code className="w-4 h-4" />
                                        Dev Mode
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {/* Project Actions */}
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                    Preview
                                </Button>
                                <Button size="sm">
                                    Export
                                </Button>
                            </div>
                        </div>

                        {/* Canvas Content - Always mount both views, toggle visibility with CSS
                            to preserve viewport state (zoom/pan) across tab switches like Relume */}
                        <div className="flex-1 relative overflow-hidden">
                            {/* Sitemap View - always mounted, hidden when not active */}
                            <div
                                className="absolute inset-0"
                                style={{ display: activeView === 'sitemap' && !isDevMode ? 'block' : 'none' }}
                            >
                                <SitemapView projectName={currentProject.name} />
                            </div>

                            {/* Wireframe View - always mounted, hidden when not active */}
                            <div
                                className="absolute inset-0"
                                style={{ display: activeView === 'wireframe' && !isDevMode ? 'block' : 'none' }}
                            >
                                <WireframeView projectId={projectId as string} />
                            </div>

                            {/* Design View - shares wireframe canvas, different token rendering via canvasMode */}
                            <div
                                className="absolute inset-0"
                                style={{ display: activeView === 'design' && !isDevMode ? 'block' : 'none' }}
                            >
                                <WireframeView projectId={projectId as string} />
                            </div>

                            {/* Placeholder for code view and dev mode */}
                            {isDevMode && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                            <Code className="w-8 h-8" />
                                        </div>
                                        <h3 className="font-semibold text-lg mb-1">
                                            Dev Mode
                                        </h3>
                                        <p className="text-sm max-w-xs">
                                            Code editor and preview will be available here
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bottom Toolbar - Figma-style */}
                        <div className="flex items-center justify-center px-4 py-2 border-t bg-background gap-1">
                            {/* Tool Selection */}
                            <div className="flex items-center gap-0.5 bg-muted rounded-lg p-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className={cn(
                                                "rounded-md transition-colors",
                                                activeTool === 'hand' && "bg-accent text-accent-foreground"
                                            )}
                                            onClick={() => setActiveTool('hand')}
                                        >
                                            <Hand className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Hand tool <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">H</kbd></p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className={cn(
                                                "rounded-md transition-colors",
                                                activeTool === 'select' && "bg-accent text-accent-foreground"
                                            )}
                                            onClick={() => setActiveTool('select')}
                                        >
                                            <MousePointer2 className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Select tool <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">V</kbd></p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className={cn(
                                                "rounded-md transition-colors",
                                                activeTool === 'add' && "bg-accent text-accent-foreground"
                                            )}
                                            onClick={() => setActiveTool('add')}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Add page <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">A</kbd></p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            {/* Breakpoint Toggle — wireframe/design only */}
                            {isWireframeCanvas && (
                                <>
                                    <div className="w-px h-6 bg-border mx-2" />
                                    <div className="flex items-center gap-0.5 bg-muted rounded-lg p-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className={cn(
                                                        "rounded-md transition-colors",
                                                        activeViewports.includes('desktop') && "bg-accent text-accent-foreground"
                                                    )}
                                                    onClick={() => setSingleViewport('desktop')}
                                                >
                                                    <Monitor className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <p>Desktop <span className="text-muted-foreground ml-1">1280px</span></p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className={cn(
                                                        "rounded-md transition-colors",
                                                        activeViewports.includes('tablet') && "bg-accent text-accent-foreground"
                                                    )}
                                                    onClick={() => setSingleViewport('tablet')}
                                                >
                                                    <Tablet className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <p>Tablet <span className="text-muted-foreground ml-1">800px</span></p>
                                            </TooltipContent>
                                        </Tooltip>

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className={cn(
                                                        "rounded-md transition-colors",
                                                        activeViewports.includes('mobile') && "bg-accent text-accent-foreground"
                                                    )}
                                                    onClick={() => setSingleViewport('mobile')}
                                                >
                                                    <Smartphone className="w-4 h-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <p>Mobile <span className="text-muted-foreground ml-1">375px</span></p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </>
                            )}

                            <div className="w-px h-6 bg-border mx-2" />

                            {/* Zoom Controls */}
                            <div className="flex items-center gap-0.5 bg-muted rounded-lg p-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="rounded-md"
                                            onClick={activeZoomOut}
                                        >
                                            <ZoomOut className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Zoom out <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">⌘-</kbd></p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            className="text-xs text-muted-foreground px-2 min-w-[48px] text-center hover:text-foreground transition-colors"
                                            onClick={activeResetZoom}
                                        >
                                            {activeZoomLevel}%
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Reset to 100% <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">⌘0</kbd></p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="rounded-md"
                                            onClick={activeZoomIn}
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Zoom in <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">⌘+</kbd></p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className="rounded-md"
                                            onClick={activeFitView}
                                        >
                                            <Maximize className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Fit to screen</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="w-px h-6 bg-border mx-2" />

                            {/* Undo/Redo */}
                            <div className="flex items-center gap-0.5 bg-muted rounded-lg p-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className={cn(
                                                "rounded-md transition-colors",
                                                !canUndo && "opacity-50 cursor-not-allowed"
                                            )}
                                            onClick={undo}
                                            disabled={!canUndo}
                                        >
                                            <Undo className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Undo <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">⌘Z</kbd></p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            className={cn(
                                                "rounded-md transition-colors",
                                                !canRedo && "opacity-50 cursor-not-allowed"
                                            )}
                                            onClick={redo}
                                            disabled={!canRedo}
                                        >
                                            <Redo className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p>Redo <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px]">⌘⇧Z</kbd></p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </TooltipProvider>
        </AppShell>
    )
}
