import { memo, type CSSProperties } from 'react'
import type { FrameNode } from '@/types/canvas'
import { computeBaseStyles, computeFrameLayoutStyles, type VarCtx } from './render-utils'
import { NodeRenderer } from './node-renderer'
import { useVariableStore } from '@/store/variable-store'

// ============================================================
// Props
// ============================================================

interface FrameRendererProps {
    node: FrameNode
    isTopLevel?: boolean
    parentDirection?: 'row' | 'column'
    parentLayoutMode?: 'flex' | 'grid' | 'none'
    /** Explicit z-index override (reverse canvas stacking) */
    zIndex?: number
}

// ============================================================
// FrameRenderer — container div with flex/grid/freeform layout
// ============================================================

export const FrameRenderer = memo(function FrameRenderer({
    node,
    isTopLevel = false,
    parentDirection,
    parentLayoutMode,
    zIndex,
}: FrameRendererProps) {
    const variables = useVariableStore(s => s.variables)
    const collections = useVariableStore(s => s.collections)
    const activeModeId = useVariableStore(s => s.activeModeId)
    const varCtx: VarCtx = { modeId: activeModeId ?? '', variables, collections }

    // Merge base styles (position, sizing, visuals) with frame layout styles
    const style: CSSProperties = {
        ...computeBaseStyles(node, isTopLevel, parentDirection, parentLayoutMode, varCtx, zIndex),
        ...computeFrameLayoutStyles(node, varCtx),
    }

    // Freeform (mode: 'none') frames need a positioning context for absolute children
    // but only if they aren't already absolutely positioned themselves.
    // Flex/grid frames also need position:relative if they contain absolute children,
    // otherwise those children position relative to a distant ancestor instead of their parent.
    if (style.position !== 'absolute') {
        const hasAbsoluteChild = node.children.some(c => c.positioning === 'absolute')
        if (node.layout.mode === 'none' || hasAbsoluteChild) {
            style.position = 'relative'
        }
    }

    // Determine child flex direction for passing to children
    const childDirection =
        node.layout.mode === 'flex'
            ? (node.layout.direction ?? 'column')
            : undefined

    return (
        <div data-node-id={node.id} style={style}>
            {node.children.map((child, index) => (
                <NodeRenderer
                    key={child.id}
                    node={child}
                    parentDirection={childDirection}
                    parentLayoutMode={node.layout.mode}
                    zIndex={node.layout.reverseZIndex ? node.children.length - index : undefined}
                />
            ))}
        </div>
    )
})
