/**
 * LayerWrapper — Wraps every block for selection, hover, and Figma-style drag
 *
 * Architecture:
 *   When inside a SortableContext (detected via SortableItemsContext):
 *     → Renders SortableLayerDiv with useSortable() on the SAME div
 *     → Drag listeners + click/hover are on ONE element (no wrapper div)
 *     → CSS.Translate (not CSS.Transform) prevents scale distortion
 *
 *   When NOT in a SortableContext:
 *     → Renders PlainLayerDiv with just click/hover selection
 *
 * This eliminates the old SortableBlockItem wrapper, fixing:
 *   - Double layoutClassName application
 *   - Broken hover targets
 *   - Intercepted click events
 *   - Scale distortion during drag
 */

'use client'

import { useCallback, useRef, useContext } from 'react'
import { cn } from '@/lib/utils'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useSelectionStore } from '@/store/selection-store'
import { SectionIdContext, SortableItemsContext } from './contexts'
import type { Block } from '@/lib/designs/v2/blocks/types'
import { BLOCK_TYPE_LABELS } from '@/lib/designs/v2/blocks/types'

/** Block types that support inline text editing */
const EDITABLE_BLOCK_TYPES = new Set(['heading', 'text', 'button'])

// ============================================
// Props
// ============================================

interface LayerWrapperProps {
    block: Block
    children: React.ReactNode
    className?: string
}

// ============================================
// Public component — routes to Plain or Sortable variant
// ============================================

export function LayerWrapper({ block, children, className }: LayerWrapperProps) {
    const sortableIds = useContext(SortableItemsContext)
    const isSortable = sortableIds instanceof Set && sortableIds.has(block.id)

    if (isSortable) {
        return (
            <SortableLayerDiv block={block} className={className}>
                {children}
            </SortableLayerDiv>
        )
    }
    return (
        <PlainLayerDiv block={block} className={className}>
            {children}
        </PlainLayerDiv>
    )
}

// ============================================
// Shared hook — selection, hover, click
// ============================================

function useLayerInteraction(block: Block) {
    const ref = useRef<HTMLDivElement>(null)
    const parentSectionId = useContext(SectionIdContext)

    const selectedBlockId = useSelectionStore((s) => s.blockId)
    const isEditing = useSelectionStore((s) => s.isEditing)
    const hoverId = useSelectionStore((s) =>
        s.hoverTarget?.type === 'block' ? s.hoverTarget.id : null,
    )
    const autoEnterAndSelectBlock = useSelectionStore((s) => s.autoEnterAndSelectBlock)
    const startEditing = useSelectionStore((s) => s.startEditing)
    const setHover = useSelectionStore((s) => s.setHover)

    const isSelected = selectedBlockId === block.id
    const isHovered = hoverId === block.id && !isSelected
    const isEditable = EDITABLE_BLOCK_TYPES.has(block.type)
    const isBlockEditing = isSelected && isEditing

    // Click: select block from ANY mode. If already selected + editable → edit.
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (!parentSectionId) return
            e.stopPropagation()
            if (isBlockEditing && isSelected) return
            if (isSelected && isEditable && !isBlockEditing) {
                startEditing()
                return
            }
            autoEnterAndSelectBlock(block.id, parentSectionId)
        },
        [parentSectionId, isSelected, isEditable, isBlockEditing,
            autoEnterAndSelectBlock, startEditing, block.id],
    )

    // Double-click: jump to editing
    const handleDoubleClick = useCallback(
        (e: React.MouseEvent) => {
            if (!parentSectionId || !isEditable) return
            e.stopPropagation()
            if (!isSelected) {
                autoEnterAndSelectBlock(block.id, parentSectionId)
            }
            startEditing()
        },
        [parentSectionId, isEditable, isSelected,
            autoEnterAndSelectBlock, startEditing, block.id],
    )

    // Hover — always active (Figma-style)
    const handleMouseEnter = useCallback(() => {
        const rect = ref.current?.getBoundingClientRect()
        setHover({ type: 'block', id: block.id, rect: rect ?? undefined })
    }, [setHover, block.id])

    const handleMouseLeave = useCallback(() => {
        setHover(null)
    }, [setHover])

    const label = BLOCK_TYPE_LABELS[block.type] ?? block.type

    return {
        ref,
        isSelected,
        isHovered,
        isBlockEditing,
        label,
        handleClick,
        handleDoubleClick,
        handleMouseEnter,
        handleMouseLeave,
    }
}

// ============================================
// PlainLayerDiv — no drag, just selection/hover
// ============================================

function PlainLayerDiv({ block, children, className }: LayerWrapperProps) {
    const {
        ref,
        isSelected,
        isHovered,
        isBlockEditing,
        label,
        handleClick,
        handleDoubleClick,
        handleMouseEnter,
        handleMouseLeave,
    } = useLayerInteraction(block)

    return (
        <div
            ref={ref}
            className={cn(
                'relative transition-[outline,box-shadow] duration-100',
                !isBlockEditing && 'cursor-pointer select-none',
                isBlockEditing && 'cursor-text select-text',
                className,
            )}
            style={getOutlineStyle(isSelected, isHovered)}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label={label}
            data-layer-editing={isBlockEditing || undefined}
        >
            {isSelected && <LabelBadge label={label} />}
            {children}
        </div>
    )
}

// ============================================
// SortableLayerDiv — Figma-style: useSortable on the SAME div
// ============================================

function SortableLayerDiv({ block, children, className }: LayerWrapperProps) {
    const {
        ref: localRef,
        isSelected,
        isHovered,
        isBlockEditing,
        label,
        handleClick,
        handleDoubleClick,
        handleMouseEnter,
        handleMouseLeave,
    } = useLayerInteraction(block)

    // Drag is only enabled when the section is entered / a block is selected.
    // useSortable is always called (DOM stability), but disabled prevents
    // the sensor from activating — no listeners, no transform.
    const mode = useSelectionStore((s) => s.mode)
    const sortingDisabled = mode !== 'entered' && mode !== 'block-selected'

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id, disabled: sortingDisabled })

    // Merge refs — @dnd-kit needs setNodeRef, we need localRef for hover rects
    const mergedRef = useCallback(
        (el: HTMLDivElement | null) => {
            setNodeRef(el)
            localRef.current = el
        },
        [setNodeRef, localRef],
    )

    return (
        <div
            ref={mergedRef}
            className={cn(
                'relative',
                !isBlockEditing && !isDragging && 'cursor-pointer select-none',
                isBlockEditing && 'cursor-text select-text',
                isDragging && 'z-50 shadow-lg ring-2 ring-blue-400 rounded cursor-grabbing opacity-90',
                className,
            )}
            style={{
                // Translate only — no scaleX/scaleY distortion
                transform: CSS.Translate.toString(transform),
                // During sort animation: @dnd-kit's transition; at rest: outline transition
                transition: transition ?? 'outline 100ms ease-out, box-shadow 100ms ease-out',
                ...(!isDragging ? getOutlineStyle(isSelected, isHovered) : {}),
            }}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            // Sortable attributes (role, tabIndex, aria-*)
            {...attributes}
            // When editing, override tabIndex to prevent focus competition
            // and remove button role so contentEditable children work correctly
            {...(isBlockEditing ? { tabIndex: -1, role: undefined } : {})}
            // Drag listeners — disabled during text editing or when sorting is off
            {...(isBlockEditing || sortingDisabled ? {} : listeners)}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label={label}
            data-layer-editing={isBlockEditing || undefined}
        >
            {isSelected && !isDragging && <LabelBadge label={label} />}
            {children}
        </div>
    )
}

// ============================================
// Label badge
// ============================================

function LabelBadge({ label }: { label: string }) {
    return (
        <div
            className="absolute -top-5 left-0 z-50 pointer-events-none"
            style={{
                fontSize: '10px',
                fontWeight: 600,
                lineHeight: '1',
                padding: '2px 6px',
                borderRadius: '3px 3px 0 0',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                whiteSpace: 'nowrap',
                fontFamily: 'system-ui, sans-serif',
            }}
        >
            {label}
        </div>
    )
}

// ============================================
// Outline style computation
// ============================================

function getOutlineStyle(
    isSelected: boolean,
    isHovered: boolean,
): React.CSSProperties {
    if (isSelected) {
        return {
            outline: '2px solid #2563eb',
            outlineOffset: '1px',
        }
    }

    if (isHovered) {
        return {
            outline: '1px dashed #93c5fd',
            outlineOffset: '1px',
        }
    }

    return {}
}
