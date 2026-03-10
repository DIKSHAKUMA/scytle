'use client'

import { Minus, Plus } from 'lucide-react'
import { useEditorStore } from '@/store/editor-store'
import { cn } from '@/lib/utils'

export function ZoomControls() {
    const zoom = useEditorStore((s) => s.zoom)
    const zoomIn = useEditorStore((s) => s.zoomIn)
    const zoomOut = useEditorStore((s) => s.zoomOut)
    const resetZoom = useEditorStore((s) => s.resetZoom)
    const pct = Math.round(zoom * 100)

    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-0.5 p-1 rounded-xl bg-card/90 backdrop-blur-sm border border-border/40 shadow-sm select-none z-10">
            <button
                onClick={zoomOut}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                title="Zoom out (⌘−)"
            >
                <Minus className="w-3.5 h-3.5" />
            </button>

            <button
                onClick={resetZoom}
                className="min-w-[42px] h-7 px-1.5 rounded-lg flex items-center justify-center text-xs tabular-nums text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                title="Reset zoom (⌘0)"
            >
                {pct}%
            </button>

            <button
                onClick={zoomIn}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                title="Zoom in (⌘+)"
            >
                <Plus className="w-3.5 h-3.5" />
            </button>
        </div>
    )
}
