'use client'

import { useEditorStore } from '@/store/editor-store'
import type { CanvasTool } from '@/types/canvas'
import { MousePointer2, Square, Type, Hand, PenTool } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================
// Tool definitions
// ============================================================

const TOOLS: {
    tool: CanvasTool
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
    label: string
    shortcut: string
}[] = [
        { tool: 'select', icon: MousePointer2, label: 'Move', shortcut: 'V' },
        { tool: 'frame', icon: Square, label: 'Frame', shortcut: 'F' },
        { tool: 'pen', icon: PenTool, label: 'Pen', shortcut: 'P' },
        { tool: 'text', icon: Type, label: 'Text', shortcut: 'T' },
        { tool: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
    ]

// ============================================================
// Toolbar — floating tool switcher rendered on the canvas
// ============================================================

export function Toolbar() {
    const activeTool = useEditorStore((s) => s.activeTool)
    const setActiveTool = useEditorStore((s) => s.setActiveTool)

    // ── Render ────────────────────────────────────────────────

    return (
        <div
            className="flex items-center gap-0.5 bg-background/95 backdrop-blur-sm border border-border/60 rounded-lg px-1 py-0.5 shadow-sm"
            onPointerDown={(e) => e.stopPropagation()}
        >
            {TOOLS.map(({ tool, icon: Icon, label, shortcut }) => (
                <button
                    key={tool}
                    className={cn(
                        'relative p-2 rounded-md transition-all duration-150',
                        activeTool === tool
                            ? 'bg-foreground text-background shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                    )}
                    onClick={() => setActiveTool(tool)}
                    title={`${label} (${shortcut})`}
                >
                    <Icon size={16} strokeWidth={activeTool === tool ? 2 : 1.5} />
                </button>
            ))}
        </div>
    )
}
