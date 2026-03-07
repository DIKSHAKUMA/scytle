import { memo } from 'react'
import type { ScytleNode } from '@/types/canvas'
import { FrameRenderer } from './frame-renderer'
import { TextRenderer } from './text-renderer'
import { ImageRenderer } from './image-renderer'

// ============================================================
// Props
// ============================================================

export interface NodeRendererProps {
    node: ScytleNode
    /** True for root-level canvas nodes (positioned absolutely at x,y) */
    isTopLevel?: boolean
    /** Parent flex direction — needed for fill sizing computation */
    parentDirection?: 'row' | 'column'
    /** Parent layout mode — children of 'none' frames are absolutely positioned */
    parentLayoutMode?: 'flex' | 'grid' | 'none'
}

// ============================================================
// NodeRenderer — dispatches to type-specific renderer
// ============================================================

export const NodeRenderer = memo(function NodeRenderer({
    node,
    isTopLevel = false,
    parentDirection,
    parentLayoutMode,
}: NodeRendererProps) {
    if (!node.visible) return null

    switch (node.type) {
        case 'frame':
            return (
                <FrameRenderer
                    node={node}
                    isTopLevel={isTopLevel}
                    parentDirection={parentDirection}
                    parentLayoutMode={parentLayoutMode}
                />
            )
        case 'text':
            return (
                <TextRenderer
                    node={node}
                    isTopLevel={isTopLevel}
                    parentDirection={parentDirection}
                    parentLayoutMode={parentLayoutMode}
                />
            )
        case 'image':
            return (
                <ImageRenderer
                    node={node}
                    isTopLevel={isTopLevel}
                    parentDirection={parentDirection}
                    parentLayoutMode={parentLayoutMode}
                />
            )
        default:
            return null
    }
})
