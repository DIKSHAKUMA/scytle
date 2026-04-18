'use client'

import { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useProjectStore, useAuthStore } from '@/store'
import { useEditorStore } from '@/store/editor-store'
import { EditorCanvas, useKeyboardShortcuts } from '@/components/editor'
import { TopBar, LeftPanel, RightPanel } from '@/components/workspace'
import { Loader2, Sparkles } from 'lucide-react'
import { canvasSync } from '@/lib/sync'
import { createJWT } from '@/lib/appwrite'
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
    const hasRefImages = searchParams.get('ref') === '1'

    const { setUser } = useAuthStore()
    const { currentProject, fetchProject, isLoading: projectLoading } = useProjectStore()

    const hasNodes = useEditorStore((s) => s.nodes.length > 0)
    const projectReady = useEditorStore((s) => s._projectId === projectId)
    const hasEverHadNodes = useEditorStore((s) => s.hasEverHadNodes)

    const [authChecked, setAuthChecked] = useState(false)
    const [canvasLoaded, setCanvasLoaded] = useState(false)
    const [genError, setGenError] = useState<string | null>(null)

    // Centralized keyboard shortcuts (tools, zoom, clipboard, undo/redo, z-order, etc.)
    useKeyboardShortcuts()

    const hasDoneInitialFit = useRef(false)


    // ── Auto-generation via Chat ──────────────────────────────
    // When a new project lands with a description and empty canvas,
    // store the initial prompt so ChatPanel can pick it up and send it.
    // This replaces the old pipeline (plan-pages → generate-sections).
    const [initialPromptSent, setInitialPromptSent] = useState(false)

    useEffect(() => {
        if (
            projectReady &&
            canvasLoaded &&
            !hasNodes &&
            !hasEverHadNodes &&
            currentProject?.description &&
            authChecked &&
            !projectLoading &&
            !initialPromptSent
        ) {
            // Double-check store directly
            const storeState = useEditorStore.getState()
            if (storeState.hasEverHadNodes || storeState.nodes.length > 0) return

            // Store the initial prompt in sessionStorage for ChatPanel to pick up
            const productType = urlProductType ?? currentProject.productType ?? 'web'
            const prompt = `Design a ${productType === 'app' ? 'mobile app' : 'website'} for: ${currentProject.description}`

            try {
                sessionStorage.setItem(
                    `scytle-initial-prompt-${projectId}`,
                    prompt
                )
            } catch {
                // Ignore storage errors
            }

            setInitialPromptSent(true)
            console.log('💬 Initial prompt stored for chat:', prompt.substring(0, 80))
        }
    }, [projectReady, canvasLoaded, hasNodes, hasEverHadNodes, currentProject, authChecked, projectLoading, initialPromptSent, urlProductType, projectId])

    // ── Auto-zoom to fit on initial project load ──────────────
    useEffect(() => {
        if (canvasLoaded && hasNodes && !hasDoneInitialFit.current) {
            const store = useEditorStore.getState()
            // Small delay to ensure viewportRect is calculated
            setTimeout(() => {
                store.zoomToFit()
                hasDoneInitialFit.current = true
            }, 100)
        }
    }, [canvasLoaded, hasNodes])

    // Connect to real-time sync server once auth is confirmed
    useEffect(() => {
        if (!authChecked) return

        let disconnected = false

        const connectSync = async () => {
            try {
                const jwt = await createJWT()
                if (!jwt || disconnected) return

                // Connect — the server will send an 'init' message with full state
                canvasSync.connect(projectId, jwt.jwt)

                // Listen for init completion to mark canvas as loaded
                // Status only changes to 'connected' AFTER init data (or migration)
                // is fully applied to the store
                const unsub = canvasSync.onStatusChange((status) => {
                    if (status === 'connected' && !disconnected) {
                        setCanvasLoaded(true)
                    }
                })

                // If already connected (fast reconnect), mark loaded
                if (canvasSync.status === 'connected' && !disconnected) {
                    setCanvasLoaded(true)
                }

                // Store cleanup function
                return () => {
                    unsub()
                    canvasSync.disconnect()
                }
            } catch (err) {
                console.error('🔄 Sync: connection error', err)
                setCanvasLoaded(true) // Don't block UI on sync failure
            }
        }

        let cleanup: (() => void) | undefined
        connectSync().then((fn) => { cleanup = fn })

        return () => {
            disconnected = true
            cleanup?.()
        }
    }, [projectId, authChecked])

    // Fallback: also load from localStorage/server for offline resilience
    // This runs first (no auth needed) so the user sees something immediately
    useEffect(() => {
        const store = useEditorStore.getState()
        // Only init from localStorage if we haven't received sync data yet
        if (!store._projectId || store._projectId !== projectId) {
            store.initForProject(projectId)
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
            <TopBar projectName={currentProject?.name ?? 'Project'} projectId={projectId} />

            {/* ── Main workspace area ── */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
                {/* Left panel: Files (pages + layers) / Chat tabs */}
                <LeftPanel />

                {/* Canvas */}
                <div className="flex-1 relative overflow-hidden">
                    <EditorCanvas showToolbar={false} />

                    {/* Empty canvas prompt — directs user to chat */}
                    {!hasNodes && authChecked && !projectLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                            <div className="flex flex-col items-center gap-4 text-center pointer-events-auto">
                                {genError && (
                                    <p className="text-sm text-destructive mb-2">{genError}</p>
                                )}
                                <div className="flex items-center gap-2 px-5 py-2.5 bg-muted/50 border border-border/50 rounded-lg text-sm text-muted-foreground">
                                    <Sparkles className="w-4 h-4" />
                                    Use the Chat panel to generate your design
                                </div>
                                <p className="text-xs text-muted-foreground max-w-xs">
                                    Open the Chat tab on the left and describe what you want to build
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
