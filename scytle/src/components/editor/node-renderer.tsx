import { memo } from 'react'
import type { ScytleNode } from '@/types/canvas'
import { FrameRenderer } from './frame-renderer'
import { TextRenderer } from './text-renderer'
import { ImageRenderer } from './image-renderer'
import { VectorRenderer } from './vector-renderer'

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
    /** Explicit z-index override (used for reverse canvas stacking) */
    zIndex?: number
}

// ============================================================
// NodeRenderer — dispatches to type-specific renderer
// ============================================================

export const NodeRenderer = memo(function NodeRenderer({
    node,
    isTopLevel = false,
    parentDirection,
    parentLayoutMode,
    zIndex,
}: NodeRendererProps) {
    if (!node.visible) return null

    let element: React.ReactElement | null = null

    switch (node.type) {
        case 'frame':
            element = (
                <FrameRenderer
                    node={node}
                    isTopLevel={isTopLevel}
                    parentDirection={parentDirection}
                    parentLayoutMode={parentLayoutMode}
                    zIndex={zIndex}
                />
            )
            break
        case 'text':
            element = (
                <TextRenderer
                    node={node}
                    isTopLevel={isTopLevel}
                    parentDirection={parentDirection}
                    parentLayoutMode={parentLayoutMode}
                    zIndex={zIndex}
                />
            )
            break
        case 'image':
            element = (
                <ImageRenderer
                    node={node}
                    isTopLevel={isTopLevel}
                    parentDirection={parentDirection}
                    parentLayoutMode={parentLayoutMode}
                    zIndex={zIndex}
                />
            )
            break
        case 'vector':
            element = (
                <VectorRenderer
                    node={node}
                    isTopLevel={isTopLevel}
                    parentDirection={parentDirection}
                    parentLayoutMode={parentLayoutMode}
                    zIndex={zIndex}
                />
            )
            break
        default:
            return null
    }

    return element
})
