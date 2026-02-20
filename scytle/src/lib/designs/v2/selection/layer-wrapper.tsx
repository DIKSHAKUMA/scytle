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
                !isBlockEditing && 'cursor-pointer',
                isBlockEditing && 'cursor-text',
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
            {isSelected && !isBlockEditing && <SelectionHandles />}
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

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id })

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
                !isBlockEditing && !isDragging && 'cursor-pointer',
                isBlockEditing && 'cursor-text',
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
            // Drag listeners — disabled during text editing so text selection works
            {...(isBlockEditing ? {} : listeners)}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label={label}
            data-layer-editing={isBlockEditing || undefined}
        >
            {isSelected && !isDragging && <LabelBadge label={label} />}
            {isSelected && !isBlockEditing && !isDragging && <SelectionHandles />}
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
// Selection Handles — 4 corner dots (Figma/Relume style)
// ============================================

const HANDLE_SIZE = 8
const HANDLE_OFFSET = -(HANDLE_SIZE / 2)

const HANDLE_BASE: React.CSSProperties = {
    position: 'absolute',
    width: `${HANDLE_SIZE}px`,
    height: `${HANDLE_SIZE}px`,
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    border: '2px solid #2563eb',
    pointerEvents: 'none',
    zIndex: 50,
}

function SelectionHandles() {
    return (
        <>
            <div style={{ ...HANDLE_BASE, top: HANDLE_OFFSET, left: HANDLE_OFFSET }} />
            <div style={{ ...HANDLE_BASE, top: HANDLE_OFFSET, right: HANDLE_OFFSET }} />
            <div style={{ ...HANDLE_BASE, bottom: HANDLE_OFFSET, left: HANDLE_OFFSET }} />
            <div style={{ ...HANDLE_BASE, bottom: HANDLE_OFFSET, right: HANDLE_OFFSET }} />
        </>
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
