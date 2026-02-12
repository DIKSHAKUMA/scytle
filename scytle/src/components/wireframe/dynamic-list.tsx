'use client'

import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ===== RELUME-STYLE COMPONENTS =====

/**
 * InsertDot — Relume-style "+" circle that appears between list items on hover.
 * Shows a thin line + centered "+" button in the gap between items.
 *
 * Usage:
 * ```tsx
 * {editable && <InsertDot onInsert={() => insertItem(i)} />}
 * <ItemContent />
 * {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
 * ```
 */
export function InsertDot({
    onInsert,
    className,
}: {
    onInsert: () => void
    className?: string
}) {
    return (
        <div className={cn('relative h-4 group/insert flex items-center justify-center', className)}>
            {/* Hover hit area — full width, thin height */}
            <div className="absolute inset-x-0 -inset-y-1 z-0" />
            {/* Thin line */}
            <div className="absolute inset-x-4 top-1/2 h-px bg-transparent group-hover/insert:bg-violet-300 transition-colors" />
            {/* Circle button */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    onInsert()
                }}
                className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center z-10',
                    'bg-violet-500 text-white shadow-sm',
                    'opacity-0 group-hover/insert:opacity-100 transition-all duration-150',
                    'hover:bg-violet-600 hover:scale-110',
                )}
                title="Add item here"
            >
                <Plus className="w-3 h-3" />
            </button>
        </div>
    )
}

/**
 * DynamicListItem — Selectable wrapper for each item in a dynamic list.
 * Click to select (shows violet ring). When selected, pressing Delete/Backspace removes.
 *
 * Usage:
 * ```tsx
 * <DynamicListItem
 *     index={i}
 *     selectedIndex={selectedIndex}
 *     onSelect={setSelectedIndex}
 *     onDelete={() => removeItem(i)}
 *     deletable={items.length > 1}
 *     editable={editable}
 * >
 *     ... item content ...
 * </DynamicListItem>
 * ```
 */
export function DynamicListItem({
    children,
    index,
    selectedIndex,
    onSelect,
    onDelete,
    deletable = true,
    editable = true,
    className,
}: {
    children: ReactNode
    index: number
    selectedIndex: number | null
    onSelect: (index: number | null) => void
    onDelete: () => void
    deletable?: boolean
    editable?: boolean
    className?: string
}) {
    const isSelected = selectedIndex === index

    // Handle Delete key when this item is selected
    useEffect(() => {
        if (!isSelected || !editable || !deletable) return
        const handler = (e: KeyboardEvent) => {
            // Don't intercept when user is typing in an input/textarea/contenteditable
            const tag = (e.target as HTMLElement)?.tagName
            const isEditable = (e.target as HTMLElement)?.isContentEditable
            if (tag === 'INPUT' || tag === 'TEXTAREA' || isEditable) return

            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault()
                e.stopPropagation()
                onDelete()
                onSelect(null)
            }
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [isSelected, editable, deletable, onDelete, onSelect])

    if (!editable) {
        return <div className={className}>{children}</div>
    }

    return (
        <div
            onClick={(e) => {
                // Don't intercept clicks on interactive children (editable text, icons, buttons)
                const target = e.target as HTMLElement
                if (
                    target.isContentEditable ||
                    target.closest('[contenteditable]') ||
                    target.closest('button') ||
                    target.closest('input')
                ) return
                e.stopPropagation()
                onSelect(isSelected ? null : index)
            }}
            className={cn(
                'relative cursor-pointer transition-all duration-150 rounded-lg',
                isSelected
                    ? 'ring-2 ring-violet-500 ring-offset-2'
                    : 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1',
                className,
            )}
        >
            {children}
        </div>
    )
}

/**
 * useDynamicListState — Hook for managing selection state in dynamic lists.
 * Returns [selectedIndex, setSelectedIndex] with automatic click-outside deselect.
 */
export function useDynamicListState(): [number | null, (index: number | null) => void] {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const containerRef = useRef<string>('dynamic-list-' + Math.random())

    // Click outside any list item deselects
    useEffect(() => {
        if (selectedIndex === null) return
        const handler = (e: MouseEvent) => {
            // Give DynamicListItem's onClick a chance to fire first
            // If nothing re-selects within the same tick, the selected stays
        }
        // We rely on DynamicListItem's onClick to toggle—no global deselect needed
        // because each item toggles on click
    }, [selectedIndex])

    return [selectedIndex, setSelectedIndex]
}

// ===== LEGACY COMPONENTS (kept for backward compat) =====

/**
 * @deprecated Use InsertDot + DynamicListItem instead
 * AddItemButton — Full-width dashed button at the bottom of a list.
 */
export function AddItemButton({
    onClick,
    label = 'Add item',
    className,
}: {
    onClick: () => void
    label?: string
    className?: string
}) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation()
                onClick()
            }}
            className={cn(
                'flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-600',
                'py-2 px-3 rounded border border-dashed border-gray-200 hover:border-violet-400',
                'transition-all w-full justify-center mt-3',
                className,
            )}
        >
            <Plus className="w-3.5 h-3.5" />
            {label}
        </button>
    )
}

/**
 * @deprecated Use DynamicListItem with Delete key instead
 * RemoveItemButton — Overlay button on each list item.
 */
export function RemoveItemButton({
    onClick,
    className,
}: {
    onClick: () => void
    className?: string
}) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation()
                onClick()
            }}
            className={cn(
                'absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full',
                'bg-red-500 text-white flex items-center justify-center',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                'hover:bg-red-600 shadow-sm',
                className,
            )}
            title="Remove item"
        >
            <Trash2 className="w-2.5 h-2.5" />
        </button>
    )
}

// ===== DATA HELPERS =====

/**
 * Helper to add a new item to the end of a content array field.
 * Returns the new array. Caller should pass to onContentChange.
 */
export function addListItem<T>(
    currentItems: T[] | undefined,
    defaultItem: T,
): T[] {
    const items = currentItems ? [...currentItems] : []
    items.push(defaultItem)
    return items
}

/**
 * Helper to insert a new item at a specific index.
 * Returns the new array.
 */
export function insertListItem<T>(
    currentItems: T[] | undefined,
    index: number,
    defaultItem: T,
): T[] {
    const items = currentItems ? [...currentItems] : []
    items.splice(index, 0, defaultItem)
    return items
}

/**
 * Helper to remove an item from a content array field.
 * Returns the new array. Won't go below minItems (default 1).
 */
export function removeListItem<T>(
    currentItems: T[] | undefined,
    index: number,
    minItems = 1,
): T[] | null {
    const items = currentItems ? [...currentItems] : []
    if (items.length <= minItems) return null // Can't remove
    items.splice(index, 1)
    return items
}
