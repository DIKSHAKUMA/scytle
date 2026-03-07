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

export function PositionSection({ node, onUpdate, isAutoLayout }: PositionSectionProps) {
    /** Get parent frame info for alignment calculations */
    const getParentFrame = useCallback((): FrameNode | null => {
        const state = useEditorStore.getState()
        const result = findParentOfNode(state.nodes, node.id)
        return result?.parent ?? null
    }, [node.id])

    const handleAlignLeft = useCallback(() => {
        const parent = getParentFrame()
        if (!parent) return
        onUpdate({ x: parent.padding.left })
    }, [getParentFrame, onUpdate])

    const handleAlignCenterH = useCallback(() => {
        const parent = getParentFrame()
        if (!parent) return
        const contentWidth = parent.width - parent.padding.left - parent.padding.right
        onUpdate({ x: parent.padding.left + (contentWidth - node.width) / 2 })
    }, [getParentFrame, onUpdate, node.width])

    const handleAlignRight = useCallback(() => {
        const parent = getParentFrame()
        if (!parent) return
        onUpdate({ x: parent.width - parent.padding.right - node.width })
    }, [getParentFrame, onUpdate, node.width])

    const handleAlignTop = useCallback(() => {
        const parent = getParentFrame()
        if (!parent) return
        onUpdate({ y: parent.padding.top })
    }, [getParentFrame, onUpdate])

    const handleAlignCenterV = useCallback(() => {
        const parent = getParentFrame()
        if (!parent) return
        const contentHeight = parent.height - parent.padding.top - parent.padding.bottom
        onUpdate({ y: parent.padding.top + (contentHeight - node.height) / 2 })
    }, [getParentFrame, onUpdate, node.height])

    const handleAlignBottom = useCallback(() => {
        const parent = getParentFrame()
        if (!parent) return
        onUpdate({ y: parent.height - parent.padding.bottom - node.height })
    }, [getParentFrame, onUpdate, node.height])

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
