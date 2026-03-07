'use client'

import type { ScytleNode, FrameNode } from '@/types/canvas'
import { findParentOfNode } from '@/types/canvas'
import { useEditorStore } from '@/store/editor-store'
import { Section, NumberInput, IconButton } from './inputs'
import {
    AlignHorizontalJustifyStart,
    AlignHorizontalJustifyCenter,
    AlignHorizontalJustifyEnd,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    RotateCw,
    FlipHorizontal,
    FlipVertical,
} from 'lucide-react'
import { useCallback } from 'react'

interface PositionSectionProps {
    node: ScytleNode
    onUpdate: (updates: Record<string, unknown>) => void
    /** Whether this node is in an auto-layout container (position is auto) */
    isAutoLayout: boolean
}

/**
 * Returns alignment bounds: either the parent frame (with padding), or
 * the viewport rectangle for top-level nodes (align to canvas origin).
 */
function getAlignmentBounds(nodeId: string): { x: number; y: number; width: number; height: number } | null {
    const state = useEditorStore.getState()
    const result = findParentOfNode(state.nodes, nodeId)
    if (result?.parent) {
        // Alignment relative to parent (accounting for padding)
        return {
            x: result.parent.padding.left,
            y: result.parent.padding.top,
            width: result.parent.width - result.parent.padding.left - result.parent.padding.right,
            height: result.parent.height - result.parent.padding.top - result.parent.padding.bottom,
        }
    }
    // Top-level: align relative to the viewport (canvas origin 0,0 + visible area)
    const vp = state.viewportRect
    if (!vp) return null
    return {
        x: -state.panX / state.zoom,
        y: -state.panY / state.zoom,
        width: vp.width / state.zoom,
        height: vp.height / state.zoom,
    }
}

/**
 * Checks if a node is a parent frame with children.
 * In Figma, alignment buttons on a selected parent frame affect the
 * frame's children (align them within the frame), not the frame itself.
 */
function isParentFrame(node: ScytleNode): node is FrameNode {
    return node.type === 'frame' && (node as FrameNode).children.length > 0
}

/**
 * Returns the content bounds of a frame (inner area after padding).
 */
function getFrameContentBounds(frame: FrameNode) {
    return {
        x: frame.padding.left,
        y: frame.padding.top,
        width: frame.width - frame.padding.left - frame.padding.right,
        height: frame.height - frame.padding.top - frame.padding.bottom,
    }
}

export function PositionSection({ node, onUpdate, isAutoLayout }: PositionSectionProps) {
    const updateNode = useEditorStore((s) => s.updateNode)

    // ── Alignment handlers ───────────────────────────────────
    // When a parent frame is selected, alignment affects CHILDREN.
    // Otherwise, alignment affects the node itself (like before).

    const handleAlignLeft = useCallback(() => {
        if (isParentFrame(node)) {
            const bounds = getFrameContentBounds(node)
            for (const child of node.children) {
                updateNode(child.id, { x: bounds.x })
            }
        } else {
            const bounds = getAlignmentBounds(node.id)
            if (!bounds) return
            onUpdate({ x: bounds.x })
        }
    }, [node, onUpdate, updateNode])

    const handleAlignCenterH = useCallback(() => {
        if (isParentFrame(node)) {
            const bounds = getFrameContentBounds(node)
            for (const child of node.children) {
                updateNode(child.id, { x: bounds.x + (bounds.width - child.width) / 2 })
            }
        } else {
            const bounds = getAlignmentBounds(node.id)
            if (!bounds) return
            onUpdate({ x: bounds.x + (bounds.width - node.width) / 2 })
        }
    }, [node, onUpdate, updateNode])

    const handleAlignRight = useCallback(() => {
        if (isParentFrame(node)) {
            const bounds = getFrameContentBounds(node)
            for (const child of node.children) {
                updateNode(child.id, { x: bounds.x + bounds.width - child.width })
            }
        } else {
            const bounds = getAlignmentBounds(node.id)
            if (!bounds) return
            onUpdate({ x: bounds.x + bounds.width - node.width })
        }
    }, [node, onUpdate, updateNode])

    const handleAlignTop = useCallback(() => {
        if (isParentFrame(node)) {
            const bounds = getFrameContentBounds(node)
            for (const child of node.children) {
                updateNode(child.id, { y: bounds.y })
            }
        } else {
            const bounds = getAlignmentBounds(node.id)
            if (!bounds) return
            onUpdate({ y: bounds.y })
        }
    }, [node, onUpdate, updateNode])

    const handleAlignCenterV = useCallback(() => {
        if (isParentFrame(node)) {
            const bounds = getFrameContentBounds(node)
            for (const child of node.children) {
                updateNode(child.id, { y: bounds.y + (bounds.height - child.height) / 2 })
            }
        } else {
            const bounds = getAlignmentBounds(node.id)
            if (!bounds) return
            onUpdate({ y: bounds.y + (bounds.height - node.height) / 2 })
        }
    }, [node, onUpdate, updateNode])

    const handleAlignBottom = useCallback(() => {
        if (isParentFrame(node)) {
            const bounds = getFrameContentBounds(node)
            for (const child of node.children) {
                updateNode(child.id, { y: bounds.y + bounds.height - child.height })
            }
        } else {
            const bounds = getAlignmentBounds(node.id)
            if (!bounds) return
            onUpdate({ y: bounds.y + bounds.height - node.height })
        }
    }, [node, onUpdate, updateNode])

    return (
        <Section title="Position">
            {/* Alignment buttons — Figma: 6-button grid */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-px">
                    <IconButton
                        icon={<AlignHorizontalJustifyStart size={14} />}
                        onClick={handleAlignLeft}
                        title="Align left"
                        disabled={isAutoLayout}
                    />
                    <IconButton
                        icon={<AlignHorizontalJustifyCenter size={14} />}
                        onClick={handleAlignCenterH}
                        title="Align center"
                        disabled={isAutoLayout}
                    />
                    <IconButton
                        icon={<AlignHorizontalJustifyEnd size={14} />}
                        onClick={handleAlignRight}
                        title="Align right"
                        disabled={isAutoLayout}
                    />
                </div>
                <div className="flex items-center gap-px">
                    <IconButton
                        icon={<AlignVerticalJustifyStart size={14} />}
                        onClick={handleAlignTop}
                        title="Align top"
                        disabled={isAutoLayout}
                    />
                    <IconButton
                        icon={<AlignVerticalJustifyCenter size={14} />}
                        onClick={handleAlignCenterV}
                        title="Align middle"
                        disabled={isAutoLayout}
                    />
                    <IconButton
                        icon={<AlignVerticalJustifyEnd size={14} />}
                        onClick={handleAlignBottom}
                        title="Align bottom"
                        disabled={isAutoLayout}
                    />
                </div>
            </div>

            {/* X / Y */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                <NumberInput
                    label="X"
                    value={Math.round(node.x)}
                    onChange={(v) => onUpdate({ x: v })}
                    step={1}
                    disabled={isAutoLayout}
                />
                <NumberInput
                    label="Y"
                    value={Math.round(node.y)}
                    onChange={(v) => onUpdate({ y: v })}
                    step={1}
                    disabled={isAutoLayout}
                />
            </div>

            {/* Rotation + Flip */}
            <div className="flex items-center gap-1.5">
                <NumberInput
                    label="R"
                    value={node.rotation}
                    onChange={(v) => onUpdate({ rotation: v })}
                    step={1}
                    suffix="°"
                    className="flex-1"
                />
                <IconButton
                    icon={<RotateCw size={13} />}
                    onClick={() => onUpdate({ rotation: (node.rotation + 90) % 360 })}
                    title="Rotate 90°"
                />
                <IconButton
                    icon={<FlipHorizontal size={13} />}
                    onClick={() => {/* flip horizontal — future */ }}
                    title="Flip horizontal"
                />
                <IconButton
                    icon={<FlipVertical size={13} />}
                    onClick={() => {/* flip vertical — future */ }}
                    title="Flip vertical"
                />
            </div>
        </Section>
    )
}
