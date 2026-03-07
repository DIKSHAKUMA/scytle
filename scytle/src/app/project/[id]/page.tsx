'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProjectStore, useAuthStore } from '@/store'
import { useEditorStore } from '@/store/editor-store'
import { EditorCanvas, LayersPanel, PropertiesPanel } from '@/components/editor'
import { isDragActive } from '@/components/editor/hooks/use-node-drag'
import { isResizeActive } from '@/components/editor/hooks/use-node-resize'
import {
    ArrowLeft,
    Loader2,
    ZoomIn,
    ZoomOut,
} from 'lucide-react'

export default function ProjectEditorPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.id as string

    const { setUser } = useAuthStore()
    const { currentProject, fetchProject, isLoading: projectLoading } = useProjectStore()

    const zoom = useEditorStore((s) => s.zoom)
    const hasNodes = useEditorStore((s) => s.nodes.length > 0)

    const [authChecked, setAuthChecked] = useState(false)

    // Reset project store loading state on mount (prevents stuck spinner after HMR)
    useEffect(() => {
        useProjectStore.setState({ isLoading: false })
    }, [])

    // Keyboard shortcuts for zoom
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA' ||
                (document.activeElement as HTMLElement)?.isContentEditable
            ) return

            const state = useEditorStore.getState()

            // Tool shortcuts
            if (e.key === 'v' || e.key === 'V') state.setActiveTool('select')
            else if (e.key === 'h' || e.key === 'H') state.setActiveTool('hand')
            else if (e.key === 'f' || e.key === 'F') state.setActiveTool('frame')
            else if (e.key === 't' || e.key === 'T') state.setActiveTool('text')

            // Zoom shortcuts
            if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
                e.preventDefault()
                state.zoomIn()
            }
            if ((e.metaKey || e.ctrlKey) && e.key === '-') {
                e.preventDefault()
                state.zoomOut()
            }
            if ((e.metaKey || e.ctrlKey) && e.key === '0') {
                e.preventDefault()
                state.resetZoom()
            }

            // Escape → deselect (skip if drag or resize hook is handling it)
            if (e.key === 'Escape') {
                if (isDragActive() || isResizeActive()) return
                if (state.enteredFrameId) {
                    state.exitFrame()
                } else {
                    state.deselectAll()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
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

    // Loading state — skip if store rehydrated data (prevents blank canvas on HMR)
    if ((!authChecked || projectLoading) && !hasNodes) {
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
            {/* Top bar */}
            <header className="h-12 border-b border-border bg-background flex items-center px-4 gap-3 shrink-0 z-10">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back</span>
                </Link>

                <div className="w-px h-5 bg-border" />

                <span className="text-sm font-medium truncate max-w-[200px]">
                    {currentProject?.name ?? 'Project'}
                </span>

                {/* Zoom controls — right side */}
                <div className="ml-auto flex items-center gap-1">
                    <button
                        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        onClick={() => useEditorStore.getState().zoomOut()}
                    >
                        <ZoomOut className="w-3.5 h-3.5" />
                    </button>

                    <button
                        className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors min-w-[48px] text-center tabular-nums"
                        onClick={() => useEditorStore.getState().resetZoom()}
                        title="Reset zoom to 100%"
                    >
                        {Math.round(zoom * 100)}%
                    </button>

                    <button
                        className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        onClick={() => useEditorStore.getState().zoomIn()}
                    >
                        <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                </div>
            </header>

            {/* Main area: layers panel + canvas */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left sidebar — Layers panel */}
                <div className="w-60 shrink-0 overflow-hidden">
                    <LayersPanel />
                </div>

                {/* Canvas fills remaining space */}
                <div className="flex-1 overflow-hidden">
                    <EditorCanvas />
                </div>

                {/* Right sidebar — Properties panel */}
                <div className="w-64 shrink-0 border-l border-border bg-background overflow-hidden">
                    <PropertiesPanel />
                </div>
            </div>
        </div>
    )
}
