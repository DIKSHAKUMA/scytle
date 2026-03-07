import { memo, type CSSProperties } from 'react'
import type { FrameNode } from '@/types/canvas'
import { computeBaseStyles, computeFrameLayoutStyles } from './render-utils'
import { NodeRenderer } from './node-renderer'

// ============================================================
// Props
// ============================================================

interface FrameRendererProps {
    node: FrameNode
    isTopLevel?: boolean
    parentDirection?: 'row' | 'column'
    parentLayoutMode?: 'flex' | 'grid' | 'none'
}

// ============================================================
// FrameRenderer — container div with flex/grid/freeform layout
// ============================================================

export const FrameRenderer = memo(function FrameRenderer({
    node,
    isTopLevel = false,
    parentDirection,
    parentLayoutMode,
}: FrameRendererProps) {
    // Merge base styles (position, sizing, visuals) with frame layout styles
    const style: CSSProperties = {
        ...computeBaseStyles(node, isTopLevel, parentDirection, parentLayoutMode),
        ...computeFrameLayoutStyles(node),
    }

    // Freeform (mode: 'none') frames need a positioning context for absolute children
    // but only if they aren't already absolutely positioned themselves
    if (node.layout.mode === 'none' && style.position !== 'absolute') {
        style.position = 'relative'
    }

    // Determine child flex direction for passing to children
    const childDirection =
        node.layout.mode === 'flex'
            ? (node.layout.direction ?? 'column')
            : undefined

    return (
        <div data-node-id={node.id} style={style}>
            {node.children.map((child) => (
                <NodeRenderer
                    key={child.id}
                    node={child}
                    parentDirection={childDirection}
                    parentLayoutMode={node.layout.mode}
                />
            ))}
        </div>
    )
})
