/**
 * ButtonGroupBlock — Flex row of ButtonBlock children
 *
 * Container block — renders its `children` array as a horizontal row.
 * Each child is rendered via `renderChild` so individual buttons get
 * LayerWrapper wrapping (selectable, hoverable, draggable).
 *
 * When the section is entered and there are multiple children,
 * buttons are sortable within the group (reorder primary ↔ secondary).
 */

'use client'

import { useCallback, useContext, useMemo } from 'react'
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable'

import { cn } from '@/lib/utils'
import type { Block, ButtonGroupBlockProps, TextAlign } from './types'
import { PageIdContext, SectionIdContext, SortableItemsContext } from '../selection/contexts'
import { useSelectionStore } from '@/store/selection-store'
import { useUnifiedStore } from '@/store'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    renderChild: (child: Block) => React.ReactNode
    className?: string
}

// ============================================
// Alignment
// ============================================

const JUSTIFY_CLASS: Record<TextAlign, string> = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
}

// ============================================
// Component
// ============================================

export function ButtonGroupBlock({ block, renderChild, className }: Props) {
    const props = block.props as unknown as ButtonGroupBlockProps
    const children = block.children ?? []

    const align = props.align ?? 'left'
    const gap = props.gap ?? 12

    // Always wrap multi-child groups in SortableButtonChildren for DOM stability
    // (prevents DOM element switching that breaks double-click detection).
    // Drag activation is controlled by useSortable({ disabled }) in LayerWrapper.
    const hasMultipleChildren = children.length > 1

    return (
        <div
            className={cn('flex flex-wrap items-center', JUSTIFY_CLASS[align], className)}
            style={{ gap: `${gap}px` }}
        >
            {hasMultipleChildren ? (
                <SortableButtonChildren block={block} childBlocks={children} renderChild={renderChild} />
            ) : (
                children.map(child => renderChild(child))
            )}
        </div>
    )
}

// ============================================
// Sortable wrapper for button children
// ============================================

function SortableButtonChildren({
    block,
    childBlocks,
    renderChild,
}: {
    block: Block
    childBlocks: Block[]
    renderChild: (child: Block) => React.ReactNode
}) {
    const pageId = useContext(PageIdContext)
    const sectionId = useContext(SectionIdContext)
    const reorderBlockChildren = useUnifiedStore((s) => s.reorderBlockChildren)
    const updateSectionBlocks = useUnifiedStore((s) => s.updateSectionBlocks)

    const childIds = useMemo(() => childBlocks.map((c) => c.id), [childBlocks])
    const sortableIdSet = useMemo(() => new Set(childIds), [childIds])

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    )

    const handleDragStart = useCallback(() => {
        if (!pageId || !sectionId) return
        const state = useUnifiedStore.getState()
        const page = state.pages.find(p => p.id === pageId)
        const section = page?.sections.find(s => s.id === sectionId)
        if (section && !section.blocks) {
            const currentBlocks = useSelectionStore.getState().currentBlocks
            if (currentBlocks.length > 0) {
                updateSectionBlocks(pageId, sectionId, currentBlocks)
            }
        }
    }, [pageId, sectionId, updateSectionBlocks])

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event
            if (!over || active.id === over.id || !pageId || !sectionId) return

            const oldIndex = childBlocks.findIndex((c) => c.id === active.id)
            const newIndex = childBlocks.findIndex((c) => c.id === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                reorderBlockChildren(pageId, sectionId, block.id, oldIndex, newIndex)
            }
        },
        [childBlocks, pageId, sectionId, block.id, reorderBlockChildren],
    )

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={childIds}
                strategy={horizontalListSortingStrategy}
            >
                <SortableItemsContext.Provider value={sortableIdSet}>
                    {childBlocks.map(child => renderChild(child))}
                </SortableItemsContext.Provider>
            </SortableContext>
        </DndContext>
    )
}
