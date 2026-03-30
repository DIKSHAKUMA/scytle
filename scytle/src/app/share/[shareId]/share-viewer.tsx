'use client'

import { useMemo } from 'react'
import { ReadOnlyCanvas } from '@/components/share/read-only-canvas'
import { Zap } from 'lucide-react'
import type { ScytleNode } from '@/types/canvas'

interface EditorPageData {
    id: string
    name: string
    nodes: ScytleNode[]
    canvasColor: string
    zoom: number
    panX: number
    panY: number
}

interface CanvasData {
    pages: EditorPageData[]
    activePageId: string
}

interface ShareViewerProps {
    projectName: string
    canvasData: CanvasData | null
}

export function ShareViewer({ projectName, canvasData }: ShareViewerProps) {
    // Extract nodes from canvas data — show active page or first page
    const { nodes, canvasColor } = useMemo(() => {
        if (!canvasData?.pages?.length) {
            return { nodes: [] as ScytleNode[], canvasColor: '#F5F5F5' }
        }

        const activePage = canvasData.pages.find(p => p.id === canvasData.activePageId)
            ?? canvasData.pages[0]

        return {
            nodes: activePage.nodes,
            canvasColor: activePage.canvasColor || '#F5F5F5',
        }
    }, [canvasData])

    if (nodes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
                <p className="text-muted-foreground">This design has no content yet.</p>
                <a href="/" className="text-sm text-primary hover:underline">
                    Go to Scytle.ai
                </a>
            </div>
        )
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            {/* Minimal header */}
            <header className="flex items-center justify-between h-14 px-4 bg-card border-b border-border/60 shrink-0 select-none">
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shrink-0">
                        <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="font-display font-semibold text-sm truncate max-w-[300px]">
                        {projectName}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">View only</span>
                </div>
                <a
                    href="/"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                    Try Scytle.ai
                </a>
            </header>

            {/* Canvas */}
            <div className="flex-1 relative overflow-hidden">
                <ReadOnlyCanvas nodes={nodes} canvasColor={canvasColor} />
            </div>
        </div>
    )
}
