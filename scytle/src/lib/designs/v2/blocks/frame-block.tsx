/**
 * FrameBlock — Auto-layout container block (like a Figma Frame)
 *
 * Renders children recursively via RenderBlock. Every structural
 * wrapper <div> in a layout is a FrameBlock, making it hoverable,
 * selectable, and draggable on the canvas.
 *
 * Props drive flex layout: direction, gap, padding, alignment, sizing.
 * An optional `className` on props adds Tailwind classes for responsive
 * overrides or CSS grid layouts.
 *
 * Chrome (slider arrows, dots) is rendered when content._chrome is set.
 *
 * Drag architecture (Figma-style):
 *   - SortableChildren provides a SortableItemsContext with the IDs of
 *     direct children. LayerWrapper reads this context and calls
 *     useSortable() on the SAME div that handles click/hover.
 *   - No separate SortableBlockItem wrapper — one div, no layout breakage.
 *   - Block materialization happens on drag start (not drag end).
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
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable'

import type { Block, FrameBlockProps, FrameBlockContent } from './types'
import { renderChrome } from './section-chrome'
import { PageIdContext, SectionIdContext, SortableItemsContext } from '../selection/contexts'
import { useSelectionStore } from '@/store/selection-store'
import { useUnifiedStore } from '@/store'

// ============================================
// Types
// ============================================

interface FrameBlockComponentProps {
    block: Block
    renderChild: (child: Block) => React.ReactNode
}

// ============================================
// Style builder — converts FrameBlockProps → inline styles
// ============================================

function buildFrameStyles(props: FrameBlockProps): React.CSSProperties {
    const styles: React.CSSProperties = {}

    if (props.direction) {
        styles.display = 'flex'
        styles.flexDirection = props.direction === 'horizontal' ? 'row' : 'column'
    }

    if (props.gap !== undefined) {
        styles.gap = `${props.gap}px`
    }

    if (props.padding) {
        const { top = 0, right = 0, bottom = 0, left = 0 } = props.padding
        styles.padding = `${top}px ${right}px ${bottom}px ${left}px`
    }

    if (props.alignment) {
        const mainMap: Record<string, string> = {
            start: 'flex-start',
            center: 'center',
            end: 'flex-end',
            'space-between': 'space-between',
        }
        const crossMap: Record<string, string> = {
            start: 'flex-start',
            center: 'center',
            end: 'flex-end',
            stretch: 'stretch',
        }
        if (props.alignment.main) {
            styles.justifyContent = mainMap[props.alignment.main] ?? 'flex-start'
        }
        if (props.alignment.cross) {
            styles.alignItems = crossMap[props.alignment.cross] ?? 'stretch'
        }
    }

    if (props.sizing) {
        const { width, height } = props.sizing
        if (width === 'fill') styles.width = '100%'
        else if (width === 'hug') styles.width = 'fit-content'
        else if (typeof width === 'number') styles.width = `${width}px`

        if (height === 'fill') styles.height = '100%'
        else if (height === 'hug') styles.height = 'fit-content'
        else if (typeof height === 'number') styles.height = `${height}px`
    }

    if (props.maxWidth) {
        styles.maxWidth = `${props.maxWidth}px`
    }

    if (props.wrap) {
        styles.flexWrap = 'wrap'
    }

    return styles
}

// ============================================
// SortableChildren — DndContext + SortableContext + SortableItemsContext
//
// Children are rendered directly (no wrapper div). LayerWrapper reads
// SortableItemsContext to decide whether to call useSortable() on
// its own div. This gives us Figma-style drag on the same element
// that handles hover/click — no extra DOM layer.
// ============================================

function SortableChildren({
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

    const props = block.props as FrameBlockProps
    const isHorizontal = props.direction === 'horizontal'
    const childIds = useMemo(() => childBlocks.map((c) => c.id), [childBlocks])
    const sortableIdSet = useMemo(() => new Set(childIds), [childIds])

    // Distance-based activation: 8 px of movement before drag starts.
    // Normal clicks, wheel-zoom, and trackpad gestures pass through.
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    )

    /** Materialize blocks in the store BEFORE any sorting (on drag start, not end) */
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
                strategy={isHorizontal ? horizontalListSortingStrategy : verticalListSortingStrategy}
            >
                <SortableItemsContext.Provider value={sortableIdSet}>
                    {childBlocks.map(child => renderChild(child))}
                </SortableItemsContext.Provider>
            </SortableContext>
        </DndContext>
    )
}

// ============================================
// Component
// ============================================

export function FrameBlock({ block, renderChild }: FrameBlockComponentProps) {
    const props = block.props as FrameBlockProps
    const content = block.content as FrameBlockContent
    const children = block.children ?? []

    const mode = useSelectionStore((s) => s.mode)
    const isSortable = (mode === 'entered' || mode === 'block-selected') && children.length > 1

    const chrome = content._chrome ? renderChrome(content._chrome) : null

    return (
        <div
            className={props.className ?? ''}
            style={buildFrameStyles(props)}
        >
            {/* Absolute chrome (slider arrows overlaid on the frame) */}
            {chrome?.overlay}

            {/* Render child blocks — sortable when section is entered */}
            {isSortable ? (
                <SortableChildren block={block} childBlocks={children} renderChild={renderChild} />
            ) : (
                children.map(child => renderChild(child))
            )}

            {/* After-children chrome (dots, controls-below) */}
            {chrome?.after}
        </div>
    )
}
