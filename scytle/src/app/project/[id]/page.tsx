'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useProjectStore, useAuthStore } from '@/store'
import { useEditorStore } from '@/store/editor-store'
import { EditorCanvas, useKeyboardShortcuts } from '@/components/editor'
import { TopBar, LeftPanel, RightPanel, ZoomControls } from '@/components/workspace'
import { Loader2 } from 'lucide-react'

export default function ProjectEditorPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.id as string

    const { setUser } = useAuthStore()
    const { currentProject, fetchProject, isLoading: projectLoading } = useProjectStore()

    const hasNodes = useEditorStore((s) => s.nodes.length > 0)
    const projectReady = useEditorStore((s) => s._projectId === projectId)

    const [authChecked, setAuthChecked] = useState(false)

    // Centralized keyboard shortcuts (tools, zoom, clipboard, undo/redo, z-order, etc.)
    useKeyboardShortcuts()

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
                </div>

                {/* Right panel: Design (properties) / Theme tabs */}
                <RightPanel />
            </div>
        </div>
    )
}
