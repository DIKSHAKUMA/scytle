'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useProjectStore, useAuthStore } from '@/store'
import { useEditorStore } from '@/store/editor-store'
import { EditorCanvas, useKeyboardShortcuts } from '@/components/editor'
import { TopBar, LeftPanel, RightPanel, ZoomControls } from '@/components/workspace'
import { Loader2, Sparkles } from 'lucide-react'
import { generateProject } from '@/lib/generate-page'
import type { ProductType, AiModel } from '@/types'

export default function ProjectEditorPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <ProjectEditor />
        </Suspense>
    )
}

function ProjectEditor() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const projectId = params.id as string

    // Read productType and model from URL search params (set during project creation)
    const urlProductType = (searchParams.get('type') as ProductType) || undefined
    const urlModel = (searchParams.get('model') as AiModel) || undefined

    const { setUser } = useAuthStore()
    const { currentProject, fetchProject, isLoading: projectLoading } = useProjectStore()

    const hasNodes = useEditorStore((s) => s.nodes.length > 0)
    const projectReady = useEditorStore((s) => s._projectId === projectId)

    const [authChecked, setAuthChecked] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [genError, setGenError] = useState<string | null>(null)
    const [genPhase, setGenPhase] = useState<string>('Planning...')
    const [genProgress, setGenProgress] = useState<{ current: number; total: number } | null>(null)
    const generationTriggered = useRef(false)

    // Centralized keyboard shortcuts (tools, zoom, clipboard, undo/redo, z-order, etc.)
    useKeyboardShortcuts()

    // Multi-page project generation handler
    const handleGenerate = useCallback(async () => {
        if (!currentProject || isGenerating) return
        setIsGenerating(true)
        setGenError(null)
        setGenPhase('Planning your pages...')
        setGenProgress(null)

        try {
            const productType = urlProductType ?? currentProject.productType ?? 'web'
            const model = urlModel ?? currentProject.aiModel

            const { pages } = await generateProject({
                projectDescription: currentProject.description || currentProject.name,
                productType,
                model,
                onPlanReady: (plan) => {
                    setGenPhase(`Generating ${plan.pages.length} pages...`)
                    setGenProgress({ current: 0, total: plan.pages.length })
                },
                onPageStart: (index, pageName, total) => {
                    setGenPhase(`Generating "${pageName}"`)
                    setGenProgress({ current: index, total })
                },
                onPageComplete: (index, pageName, frame) => {
                    const store = useEditorStore.getState()

                    // Place all page frames on the SAME canvas, side-by-side with gaps
                    const PAGE_GAP = 100 // px gap between artboard frames

                    // Calculate x offset: sum of widths of previously placed frames + gaps
                    const existingNodes = store.nodes
                    let xOffset = 0
                    if (existingNodes.length > 0) {
                        const lastNode = existingNodes[existingNodes.length - 1]
                        xOffset = lastNode.x + lastNode.width + PAGE_GAP
                    }

                    // Position the frame at the calculated offset
                    frame.x = xOffset
                    frame.y = 0
                    frame.name = pageName

                    store.addNode(frame)

                    // Auto-zoom to fit all frames on canvas
                    const allNodes = useEditorStore.getState().nodes
                    if (allNodes.length > 0) {
                        const minX = Math.min(...allNodes.map(n => n.x))
                        const maxX = Math.max(...allNodes.map(n => n.x + n.width))
                        const minY = Math.min(...allNodes.map(n => n.y))
                        const maxY = Math.max(...allNodes.map(n => n.y + n.height))
                        const contentW = maxX - minX
                        const contentH = maxY - minY
                        // Get the canvas area dimensions (approximate viewport)
                        const viewportW = window.innerWidth - 520 // subtract left+right panels
                        const viewportH = window.innerHeight - 48 // subtract top bar
                        const padding = 80
                        const zoomX = (viewportW - padding * 2) / contentW
                        const zoomY = (viewportH - padding * 2) / contentH
                        const fitZoom = Math.min(zoomX, zoomY, 1) // don't zoom in past 100%
                        const centerX = (viewportW / 2) - ((minX + contentW / 2) * fitZoom)
                        const centerY = (viewportH / 2) - ((minY + contentH / 2) * fitZoom)
                        useEditorStore.getState().setZoom(Math.max(0.05, fitZoom))
                        useEditorStore.getState().setPan(centerX, centerY)
                    }

                    setGenProgress(prev => prev
                        ? { current: index + 1, total: prev.total }
                        : { current: index + 1, total: index + 1 }
                    )
                    console.log(`✅ Page "${pageName}" added to canvas`)
                },
            })

            console.log(`✅ Project generated: ${pages.length} pages`)
        } catch (error) {
            console.error('❌ Generation failed:', error)
            setGenError(error instanceof Error ? error.message : 'Generation failed')
        } finally {
            setIsGenerating(false)
            setGenPhase('')
            setGenProgress(null)
        }
    }, [currentProject, isGenerating, urlProductType, urlModel])

    // Auto-trigger generation when canvas is empty and project has a description
    useEffect(() => {
        if (
            !generationTriggered.current &&
            projectReady &&
            !hasNodes &&
            currentProject?.description &&
            authChecked &&
            !projectLoading &&
            !isGenerating
        ) {
            generationTriggered.current = true
            handleGenerate()
        }
    }, [projectReady, hasNodes, currentProject, authChecked, projectLoading, isGenerating, handleGenerate])

    // Initialize editor state for this project (per-project persistence)
    useEffect(() => {
        useEditorStore.getState().initForProject(projectId)
    }, [projectId])

    // Auto-save project state on changes (debounced)
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>
        const unsub = useEditorStore.subscribe((state, prev) => {
            if (
                state.nodes !== prev.nodes ||
                state.canvasColor !== prev.canvasColor ||
                state.zoom !== prev.zoom ||
                state.panX !== prev.panX ||
                state.panY !== prev.panY ||
                state.pages !== prev.pages ||
                state.activePageId !== prev.activePageId
            ) {
                clearTimeout(timer)
                timer = setTimeout(() => {
                    useEditorStore.getState().saveProjectState()
                }, 500)
            }
        })
        return () => {
            clearTimeout(timer)
            unsub()
            useEditorStore.getState().saveProjectState()
        }
    }, [projectId])

    // Reset project store loading state on mount (prevents stuck spinner after HMR)
    useEffect(() => {
        useProjectStore.setState({ isLoading: false })
    }, [])

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
                await fetchProject(projectId)
            } catch (error) {
                if (cancelled) return
                console.error('❌ Failed to initialize editor:', error)
                router.push('/dashboard')
            }
        }

        init()
        return () => { cancelled = true }
    }, [projectId, setUser, fetchProject, router])

    // Loading state — wait for auth, project fetch, and editor initialization
    if ((!authChecked || projectLoading || !projectReady) && !hasNodes) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    // Project not found (only after auth + fetch completed)
    if (!currentProject && authChecked && !projectLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
                <p className="text-muted-foreground">Project not found</p>
                <button
                    onClick={() => router.push('/dashboard')}
                    className="text-sm text-primary hover:underline"
                >
                    Back to Dashboard
                </button>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            {/* ── Top bar: back, project name, tools, undo/redo, actions ── */}
            <TopBar projectName={currentProject?.name ?? 'Project'} />

            {/* ── Main workspace area ── */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
                {/* Left panel: Files (pages + layers) / Chat tabs */}
                <LeftPanel />

                {/* Canvas + floating zoom controls */}
                <div className="flex-1 relative overflow-hidden">
                    <EditorCanvas showToolbar={false} />
                    <ZoomControls />

                    {/* Generation progress bar — non-blocking, shows at bottom */}
                    {isGenerating && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
                            <div className="flex items-center gap-3 px-5 py-3 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-lg">
                                <Sparkles className="w-4 h-4 animate-pulse text-primary flex-shrink-0" />
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium text-foreground whitespace-nowrap">{genPhase || 'Generating...'}</p>
                                    {genProgress && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                                    style={{ width: `${(genProgress.current / genProgress.total) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {genProgress.current}/{genProgress.total}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty canvas prompt */}
                    {!hasNodes && !isGenerating && authChecked && !projectLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                            <div className="flex flex-col items-center gap-4 text-center pointer-events-auto">
                                {genError && (
                                    <p className="text-sm text-destructive mb-2">{genError}</p>
                                )}
                                <button
                                    onClick={handleGenerate}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Generate Project with AI
                                </button>
                                <p className="text-xs text-muted-foreground max-w-xs">
                                    AI will plan and generate multiple pages based on your project description
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right panel: Design (properties) / Theme tabs */}
                <RightPanel />
            </div>
        </div>
    )
}
