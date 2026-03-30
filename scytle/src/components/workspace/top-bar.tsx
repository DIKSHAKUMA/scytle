'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useEditorStore } from '@/store/editor-store'
import type { CanvasTool } from '@/types/canvas'
import {
    ArrowLeft,
    MousePointer2,
    Hand,
    Square,
    Type,
    Undo2,
    Redo2,
    Share2,
    Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShareDialog } from '@/components/share/share-dialog'

// ────────────────────────────────────────────────────────────
// Tool definitions (same order as Figma: Move, Hand, Frame, Text)
// ────────────────────────────────────────────────────────────

const TOOLS: {
    tool: CanvasTool
    icon: React.ComponentType<{ className?: string }>
    label: string
    shortcut: string
}[] = [
        { tool: 'select', icon: MousePointer2, label: 'Move', shortcut: 'V' },
        { tool: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
        { tool: 'frame', icon: Square, label: 'Frame', shortcut: 'F' },
        { tool: 'text', icon: Type, label: 'Text', shortcut: 'T' },
    ]

// ────────────────────────────────────────────────────────────
// Top Bar
// ────────────────────────────────────────────────────────────

interface TopBarProps {
    projectName: string
    projectId: string
}

export function TopBar({ projectName, projectId }: TopBarProps) {
    const activeTool = useEditorStore((s) => s.activeTool)
    const setActiveTool = useEditorStore((s) => s.setActiveTool)
    const canUndo = useEditorStore((s) => s._past.length > 0)
    const canRedo = useEditorStore((s) => s._future.length > 0)
    const [shareOpen, setShareOpen] = useState(false)

    return (
        <header className="flex items-center h-12 px-3 bg-card border-b border-border/60 shrink-0 select-none">
            {/* ── Left: Back + Project identity ── */}
            <Link
                href="/dashboard"
                className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors mr-2"
                title="Back to Dashboard"
            >
                <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2 mr-4">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center shrink-0">
                    <Zap className="w-3 h-3 text-white" />
                </div>
                <span className="font-display font-semibold text-sm truncate max-w-[180px]">
                    {projectName}
                </span>
            </div>

            {/* ── Center: Tool buttons + Undo/Redo ── */}
            <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-0.5">
                    {TOOLS.map(({ tool, icon: Icon, label, shortcut }) => (
                        <button
                            key={tool}
                            title={`${label} (${shortcut})`}
                            onClick={() => setActiveTool(tool)}
                            className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150',
                                activeTool === tool
                                    ? 'bg-foreground text-background shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                            )}
                        >
                            <Icon className="w-4 h-4" />
                        </button>
                    ))}

                    <div className="w-px h-5 bg-border/60 mx-2" />

                    <button
                        title="Undo (⌘Z)"
                        onClick={() => useEditorStore.getState().undo()}
                        disabled={!canUndo}
                        className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                            canUndo
                                ? 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                : 'text-muted-foreground/30 cursor-default'
                        )}
                    >
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                        title="Redo (⇧⌘Z)"
                        onClick={() => useEditorStore.getState().redo()}
                        disabled={!canRedo}
                        className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                            canRedo
                                ? 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                : 'text-muted-foreground/30 cursor-default'
                        )}
                    >
                        <Redo2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Right: Share ── */}
            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => setShareOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                </button>
            </div>

            {/* Share Dialog */}
            <ShareDialog
                open={shareOpen}
                onOpenChange={setShareOpen}
                projectId={projectId}
            />
        </header>
    )
}
