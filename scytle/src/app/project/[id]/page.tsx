'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useProjectStore, useAuthStore } from '@/store'
import { useEditorStore } from '@/store/editor-store'
import { EditorCanvas, useKeyboardShortcuts } from '@/components/editor'
import { TopBar, LeftPanel, RightPanel, ZoomControls } from '@/components/workspace'
import { Loader2, Sparkles } from 'lucide-react'
import { generateProject } from '@/lib/generate-page'
import { createSkeletonFrame } from '@/components/workspace/skeleton-frame'
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
    const hasEverHadNodes = useEditorStore((s) => s.hasEverHadNodes)

    const [authChecked, setAuthChecked] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [genError, setGenError] = useState<string | null>(null)
    const [genPhase, setGenPhase] = useState<string>('Planning...')
    const [genProgress, setGenProgress] = useState<{ current: number; total: number } | null>(null)

    // Centralized keyboard shortcuts (tools, zoom, clipboard, undo/redo, z-order, etc.)
    useKeyboardShortcuts()

    // Helper: auto-zoom to fit all nodes on canvas
    const zoomToFitAll = useCallback(() => {
        const allNodes = useEditorStore.getState().nodes
        if (allNodes.length === 0) return

        const minX = Math.min(...allNodes.map(n => n.x))
        const maxX = Math.max(...allNodes.map(n => n.x + n.width))
        const minY = Math.min(...allNodes.map(n => n.y))
        const maxY = Math.max(...allNodes.map(n => n.y + n.height))
        const contentW = maxX - minX
        const contentH = maxY - minY

        const viewportW = window.innerWidth - 520
        const viewportH = window.innerHeight - 48
        const padding = 80
        const zoomX = (viewportW - padding * 2) / contentW
        const zoomY = (viewportH - padding * 2) / contentH
        const fitZoom = Math.min(zoomX, zoomY, 1)
        const centerX = (viewportW / 2) - ((minX + contentW / 2) * fitZoom)
        const centerY = (viewportH / 2) - ((minY + contentH / 2) * fitZoom)

        useEditorStore.getState().setZoom(Math.max(0.05, fitZoom))
        useEditorStore.getState().setPan(centerX, centerY)
    }, [])

    // Multi-page project generation handler
    const handleGenerate = useCallback(async () => {
        if (!currentProject || isGenerating) return
        setIsGenerating(true)
        setGenError(null)
        setGenPhase('Planning your pages...')
        setGenProgress(null)

        // Track skeleton frame IDs so we can replace them as pages complete
        const skeletonIds: string[] = []

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

                    // Sort pages by priority (matches generate-page.ts order)
                    const sortedPages = [...plan.pages].sort((a, b) => a.priority - b.priority)

                    // Immediately place skeleton frames on the canvas
                    const PAGE_GAP = 100
                    const FRAME_WIDTH = 1440

                    sortedPages.forEach((page, index) => {
                        const skeleton = createSkeletonFrame(page.name)
                        skeleton.x = index * (FRAME_WIDTH + PAGE_GAP)
                        skeleton.y = 0

                        skeletonIds.push(skeleton.id)
                        useEditorStore.getState().addNode(skeleton)
                    })

                    // Auto-zoom to fit all skeleton frames
                    zoomToFitAll()
                },
                onPageStart: (index, pageName) => {
                    setGenPhase(`Generating "${pageName}"`)
                    setGenProgress(prev => prev
                        ? { current: index, total: prev.total }
                        : { current: index, total: index + 1 }
                    )
                },
                onPageComplete: (index, pageName, frame) => {
                    const store = useEditorStore.getState()

                    // Get the skeleton node we're replacing to preserve its position
                    const skeletonId = skeletonIds[index]
                    if (skeletonId) {
                        const skeletonNode = store.nodes.find(n => n.id === skeletonId)
                        if (skeletonNode) {
                            frame.x = skeletonNode.x
                            frame.y = skeletonNode.y
                        }
                    }

                    frame.name = pageName

                    // Replace the skeleton with the real frame
                    if (skeletonId) {
                        store.replaceNode(skeletonId, frame)
                    } else {
                        // Fallback: just add if no skeleton
                        store.addNode(frame)
                    }

                    // Re-zoom to fit
                    zoomToFitAll()

                    setGenProgress(prev => prev
                        ? { current: index + 1, total: prev.total }
                        : { current: index + 1, total: index + 1 }
                    )
                    console.log(`✅ Page "${pageName}" replaced skeleton on canvas`)
                },
            })

            console.log(`✅ Project generated: ${pages.length} pages`)
        } catch (error) {
            console.error('❌ Generation failed:', error)
            setGenError(error instanceof Error ? error.message : 'Generation failed')

            // Clean up any remaining skeleton frames on error
            const store = useEditorStore.getState()
            for (const skelId of skeletonIds) {
                if (store.nodes.some(n => n.id === skelId)) {
                    store.deleteNode(skelId)
                }
            }
        } finally {
            setIsGenerating(false)
            setGenPhase('')
            setGenProgress(null)
        }
    }, [currentProject, isGenerating, urlProductType, urlModel])

    // Auto-trigger generation ONLY on first visit when:
    // - Project is ready and has a description
    // - Canvas is empty AND nodes have NEVER existed for this project
    // This prevents re-triggering after the user deletes all screens
    useEffect(() => {
        if (
            projectReady &&
            !hasNodes &&
            !hasEverHadNodes &&
            currentProject?.description &&
            authChecked &&
            !projectLoading &&
            !isGenerating
        ) {
            handleGenerate()
        }
    }, [projectReady, hasNodes, hasEverHadNodes, currentProject, authChecked, projectLoading, isGenerating, handleGenerate])

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
