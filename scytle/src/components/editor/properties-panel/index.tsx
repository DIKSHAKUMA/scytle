'use client'

/**
 * Properties Panel — Right sidebar inspector.
 * Figma-style: shows page settings when deselected,
 * node properties when selected.
 */

import { useCallback, useMemo } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { findNodeById, findParentOfNode } from '@/types/canvas'
import type { ScytleNode, FrameNode, TextNode, ImageNode, VectorNode } from '@/types/canvas'
import { PositionSection, MarginSection } from './position-section'
import { MultiSelectAlignSection } from './multi-select-align'
import { SizeSection } from './size-section'
import { LayoutSection } from './layout-section'
import { FillSection } from './fill-section'
import { AppearanceSection, StrokeSection } from './border-section'
import { TypographySection } from './typography-section'
import { EffectsSection } from './effects-section'
import { VectorSection } from './vector-section'
import { ColorInput, SectionHeader } from './inputs'
import { Frame, Type, ImageIcon, FileText, Pen } from 'lucide-react'
import { cn } from '@/lib/utils'

// Type icons for the header
const TYPE_ICONS: Record<ScytleNode['type'], React.ReactNode> = {
    frame: <Frame size={14} />,
    text: <Type size={14} />,
    image: <ImageIcon size={14} />,
    vector: <Pen size={14} />,
}

const TYPE_LABELS: Record<ScytleNode['type'], string> = {
    frame: 'Frame',
    text: 'Text',
    image: 'Image',
    vector: 'Vector',
}

/* ── Page Settings (deselected state) ──────────────────────── */

function PageSettings() {
    const canvasColor = useEditorStore((s) => s.canvasColor)
    const setCanvasColor = useEditorStore((s) => s.setCanvasColor)

    return (
        <div
            className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
        >
            <SectionHeader title="Design" />
            <div className="border-b border-border/40">
                <div className="flex items-center gap-2 px-3 h-9">
                    <FileText size={12} className="text-muted-foreground/60 shrink-0" />
                    <span className="text-[11px] font-medium text-foreground">Page</span>
                </div>
                <div className="px-3 pb-3">
                    <ColorInput
                        value={canvasColor}
                        onChange={setCanvasColor}
                        opacity={100}
                    />
                </div>
            </div>
        </div>
    )
}

/* ── Main Panel ───────────────────────────────────────────── */

export function PropertiesPanel() {
    const nodes = useEditorStore((s) => s.nodes)
    const selectedIds = useEditorStore((s) => s.selectedIds)
    const updateNode = useEditorStore((s) => s.updateNode)
    // Must call ALL hooks before any early returns (React rules of hooks)
    const vectorEditNodeId = useEditorStore((s) => s.vectorEditNodeId)

    // Get selected node
    const node: ScytleNode | null = useMemo(() => {
        if (selectedIds.length !== 1) return null
        return findNodeById(nodes, selectedIds[0])
    }, [nodes, selectedIds])

    // Detect if node is in an auto-layout parent
    const isAutoLayout = useMemo(() => {
        if (!node) return false
        if (node.positioning === 'absolute') return false
        const result = findParentOfNode(nodes, node.id)
        if (!result || !result.parent) return false
        return result.parent.layout.mode !== 'none'
    }, [nodes, node])

    // Stable update callback
    const onUpdate = useCallback(
        (updates: Record<string, unknown>) => {
            if (!node) return
            updateNode(node.id, updates)
        },
        [node, updateNode]
    )

    // ── Empty state → Page settings ──────────────────────────

    if (selectedIds.length === 0) {
        return <PageSettings />
    }

    if (selectedIds.length > 1) {
        return (
            <div className="h-full">
                <SectionHeader title="Design" />
                <MultiSelectAlignSection />
                <div className="flex items-center justify-center pt-4">
                    <p className="text-[11px] text-muted-foreground/50 select-none">
                        {selectedIds.length} elements selected
                    </p>
                </div>
            </div>
        )
    }

    if (!node) {
        return (
            <div className="h-full">
                <SectionHeader title="Design" />
                <div className="flex items-center justify-center pt-12">
                    <p className="text-[11px] text-muted-foreground/50 select-none">
                        Node not found
                    </p>
                </div>
            </div>
        )
    }

    // ── Panel content ────────────────────────────────────────

    const isFrame = node.type === 'frame'
    const isText = node.type === 'text'
    const isVector = node.type === 'vector'

    // Figma: vector nodes show "Vector" in edit mode, "Vector path" in select mode
    const vectorLabel = isVector
        ? (vectorEditNodeId === node.id ? 'Vector' : 'Vector path')
        : TYPE_LABELS[node.type]

    return (
        <div
            data-properties-panel
            className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
        >
            {/* Design tab header */}
            <SectionHeader title="Design" />

            {/* Node type + name */}
            <div className="border-b border-border/40">
                <div className="flex items-center gap-2 px-3 h-9">
                    <span className="text-muted-foreground/60 shrink-0">{TYPE_ICONS[node.type]}</span>
                    <input
                        type="text"
                        value={node.name}
                        className={cn(
                            'flex-1 text-[11px] font-medium bg-transparent border-none outline-none',
                            'hover:bg-muted/40 focus:bg-muted/50 px-1.5 -mx-1.5 rounded-sm transition-colors'
                        )}
                        onChange={(e) => onUpdate({ name: e.target.value })}
                    />
                    <span className="text-[10px] text-muted-foreground/40">
                        {vectorLabel}
                    </span>
                </div>
            </div>

            {/* Property sections — Figma order */}

            <PositionSection node={node} onUpdate={onUpdate} isAutoLayout={isAutoLayout} />
            <MarginSection node={node} onUpdate={onUpdate} />

            {isFrame && <LayoutSection node={node as FrameNode} onUpdate={onUpdate} />}

            <SizeSection node={node} onUpdate={onUpdate} />

            {isText && <TypographySection node={node as TextNode} onUpdate={onUpdate} />}
            {isVector && <VectorSection node={node as VectorNode} onUpdate={onUpdate} />}

            {/* Appearance → Fill → Stroke → Effects (Figma order) */}
            {/* VectorSection handles fill + stroke for vectors — skip generic sections */}
            <AppearanceSection node={node} onUpdate={onUpdate} />
            {!isVector && <FillSection node={node} onUpdate={onUpdate} />}
            {!isVector && <StrokeSection node={node} onUpdate={onUpdate} />}
            <EffectsSection node={node} onUpdate={onUpdate} />

            {/* Bottom spacer to prevent scroll cutoff */}
            <div className="h-8 shrink-0" />
        </div>
    )
}
