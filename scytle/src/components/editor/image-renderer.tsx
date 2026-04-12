import { memo, type CSSProperties } from 'react'
import { ImageIcon } from 'lucide-react'
import type { ImageNode } from '@/types/canvas'
import { computeBaseStyles, type VarCtx } from './render-utils'
import { useVariableStore } from '@/store/variable-store'

// ============================================================
// Props
// ============================================================

interface ImageRendererProps {
    node: ImageNode
    isTopLevel?: boolean
    parentDirection?: 'row' | 'column'
    parentLayoutMode?: 'flex' | 'grid' | 'none'
}

// ============================================================
// ImageRenderer — real <img> or styled placeholder
// ============================================================

export const ImageRenderer = memo(function ImageRenderer({
    node,
    isTopLevel = false,
    parentDirection,
    parentLayoutMode,
}: ImageRendererProps) {
    const variables = useVariableStore(s => s.variables)
    const collections = useVariableStore(s => s.collections)
    const activeModeId = useVariableStore(s => s.activeModeId)
    const varCtx: VarCtx = { modeId: activeModeId ?? '', variables, collections }
    const baseStyle = computeBaseStyles(node, isTopLevel, parentDirection, parentLayoutMode, varCtx)

    // ── Placeholder ───────────────────────────────────────────
    if (node.isPlaceholder || !node.src) {
        const placeholderStyle: CSSProperties = {
            ...baseStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: baseStyle.backgroundColor || '#f1f5f9',
            overflow: 'hidden',
        }

        return (
            <div data-node-id={node.id} style={placeholderStyle}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        opacity: 0.5,
                    }}
                >
                    <ImageIcon
                        size={32}
                        strokeWidth={1.5}
                        style={{ color: '#94a3b8' }}
                    />
                    {node.placeholderLabel && (
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: '#94a3b8',
                                fontFamily: 'Inter, system-ui, sans-serif',
                            }}
                        >
                            {node.placeholderLabel}
                        </span>
                    )}
                </div>
            </div>
        )
    }

    // ── Real image ────────────────────────────────────────────
    const imgStyle: CSSProperties = {
        ...baseStyle,
        objectFit: node.fit,
        display: 'block',
    }

    return (
        <img
            data-node-id={node.id}
            src={node.src}
            alt={node.alt}
            style={imgStyle}
        />
    )
})
