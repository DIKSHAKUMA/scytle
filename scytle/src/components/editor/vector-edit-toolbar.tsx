'use client'

import { memo, useState, useCallback } from 'react'
import { useEditorStore } from '@/store/editor-store'
import type { VectorEditTool } from '@/store/editor-store'
import {
    MousePointer2,
    Lasso,
    Combine,
    PaintBucket,
    Spline,
    Scissors,
    WrapText,
    X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolDef {
    id: VectorEditTool
    label: string
    shortcut: string
    icon: React.ReactNode
}

const ICON_SIZE = 16

const TOOLS: ToolDef[] = [
    { id: 'move', label: 'Move', shortcut: 'V', icon: <MousePointer2 size={ICON_SIZE} /> },
    { id: 'lasso', label: 'Lasso', shortcut: 'L', icon: <Lasso size={ICON_SIZE} /> },
    { id: 'shape-builder', label: 'Shape Builder', shortcut: 'J', icon: <Combine size={ICON_SIZE} /> },
    { id: 'paint', label: 'Paint', shortcut: '\u21E7B', icon: <PaintBucket size={ICON_SIZE} /> },
    { id: 'bend', label: 'Bend', shortcut: '\u2318', icon: <Spline size={ICON_SIZE} /> },
    { id: 'cut', label: 'Cut', shortcut: 'C', icon: <Scissors size={ICON_SIZE} /> },
    { id: 'variable-width', label: 'Variable Width', shortcut: 'W', icon: <WrapText size={ICON_SIZE} /> },
]

/**
 * VectorEditToolbar — floating bar shown when in vector edit mode.
 * Positioned at bottom center of canvas, above the main toolbar.
 */
export const VectorEditToolbar = memo(function VectorEditToolbar() {
    const vectorEditNodeId = useEditorStore((s) => s.vectorEditNodeId)
    const vectorEditTool = useEditorStore((s) => s.vectorEditTool)
    const setVectorEditTool = useEditorStore((s) => s.setVectorEditTool)
    const exitVectorEditMode = useEditorStore((s) => s.exitVectorEditMode)

    const [hoveredTool, setHoveredTool] = useState<VectorEditTool | 'close' | null>(null)

    const handleClose = useCallback(() => {
        exitVectorEditMode()
    }, [exitVectorEditMode])

    if (!vectorEditNodeId) return null

    return (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1">
            {/* Tooltip */}
            {hoveredTool && (
                <div className="px-2 py-1 rounded bg-neutral-800 text-white text-xs font-medium flex items-center gap-1.5 whitespace-nowrap shadow-lg">
                    <span>
                        {hoveredTool === 'close'
                            ? 'Done'
                            : TOOLS.find((t) => t.id === hoveredTool)?.label}
                    </span>
                    <span className="text-white/50 text-[10px]">
                        {hoveredTool === 'close'
                            ? 'Esc'
                            : TOOLS.find((t) => t.id === hoveredTool)?.shortcut}
                    </span>
                </div>
            )}

            {/* Toolbar row */}
            <div className="flex items-center bg-neutral-800 rounded-lg shadow-xl p-1 gap-0.5">
                {TOOLS.map((tool) => (
                    <button
                        key={tool.id}
                        className={cn(
                            'relative flex items-center justify-center w-8 h-8 rounded-md transition-colors',
                            vectorEditTool === tool.id
                                ? 'bg-blue-500 text-white'
                                : 'text-neutral-300 hover:text-white hover:bg-neutral-700',
                        )}
                        onClick={() => setVectorEditTool(tool.id)}
                        onMouseEnter={() => setHoveredTool(tool.id)}
                        onMouseLeave={() => setHoveredTool(null)}
                    >
                        {tool.icon}
                    </button>
                ))}

                {/* Close button */}
                <button
                    className="flex items-center justify-center w-8 h-8 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                    onClick={handleClose}
                    onMouseEnter={() => setHoveredTool('close')}
                    onMouseLeave={() => setHoveredTool(null)}
                >
                    <X size={ICON_SIZE} />
                </button>
            </div>
        </div>
    )
})
