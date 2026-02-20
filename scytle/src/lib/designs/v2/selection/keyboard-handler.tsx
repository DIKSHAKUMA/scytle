/**
 * SelectionKeyboardHandler — Figma-like keyboard navigation & shortcuts
 *
 * Mounts once inside the canvas wrapper. Listens for:
 *   Escape       → go up one level (editing → selected → entered → section → idle)
 *   Enter        → drill down: section → enter section; container block → select first child;
 *                   editable block → inline text editing
 *   Shift+Enter  → go to parent container (or up to entered mode if at top-level)
 *   Delete/Bksp  → fires onDeleteBlock callback when block selected
 *   Tab          → select next block (flattened tree walk)
 *   Shift+Tab    → select previous block
 *   Cmd+C        → copy block to clipboard
 *   Cmd+X        → cut (copy+flag for delete)
 *   Cmd+V        → paste (fires callback)
 *   Cmd+D        → duplicate (fires callback)
 *
 * Block mutation callbacks (delete, paste, duplicate) are delegated up
 * to the parent via props, because the selection store doesn't own block data.
 */

'use client'

import { useEffect, useCallback, useMemo } from 'react'
import { useSelectionStore } from '@/store/selection-store'
import type { ClipboardPayload } from '@/store/selection-store'
import type { Block } from '@/lib/designs/v2/blocks/types'
import { CONTAINER_BLOCK_TYPES } from '@/lib/designs/v2/blocks/types'

// ============================================
// Block tree helpers
// ============================================

/** Block types that support inline contentEditable editing */
const EDITABLE_BLOCK_TYPES = new Set(['heading', 'text', 'button'])

/** Flatten a block tree into a depth-first ordered list (pre-order) */
function flattenBlocks(blocks: Block[]): Block[] {
    const result: Block[] = []
    function walk(items: Block[]) {
        for (const b of items) {
            result.push(b)
            if (b.children && b.children.length > 0) walk(b.children)
        }
    }
    walk(blocks)
    return result
}

/** Find a block by ID anywhere in the tree */
function findBlock(blocks: Block[], id: string): Block | null {
    for (const b of blocks) {
        if (b.id === id) return b
        if (b.children) {
            const found = findBlock(b.children, id)
            if (found) return found
        }
    }
    return null
}

/**
 * Find the parent of a block by ID in the tree.
 * Returns null if the block is a top-level item (no parent container).
 */
function findParent(blocks: Block[], childId: string): Block | null {
    for (const b of blocks) {
        if (b.children) {
            for (const c of b.children) {
                if (c.id === childId) return b
            }
            const found = findParent(b.children, childId)
            if (found) return found
        }
    }
    return null
}

// ============================================
// Visual Feedback — brief flash on copy/cut/paste
// ============================================

function flashBlock(blockId: string, color: string, label?: string) {
    const el = document.querySelector(`[data-layer-id="${blockId}"]`) as HTMLElement | null
    if (!el) return

    // Save current outline
    const prevOutline = el.style.outline
    const prevOffset = el.style.outlineOffset

    el.style.outline = `2px solid ${color}`
    el.style.outlineOffset = '2px'
    el.style.transition = 'outline 150ms ease-out'

    // Optional floating label
    let badge: HTMLDivElement | null = null
    if (label) {
        badge = document.createElement('div')
        Object.assign(badge.style, {
            position: 'absolute',
            top: '-24px',
            right: '0',
            fontSize: '10px',
            fontWeight: '600',
            padding: '2px 8px',
            borderRadius: '3px',
            backgroundColor: color,
            color: '#fff',
            whiteSpace: 'nowrap',
            fontFamily: 'system-ui, sans-serif',
            zIndex: '100',
            pointerEvents: 'none',
        })
        badge.textContent = label
        el.appendChild(badge)
    }

    setTimeout(() => {
        el.style.outline = prevOutline
        el.style.outlineOffset = prevOffset
        if (badge) badge.remove()
    }, 500)
}

// ============================================
// Props
// ============================================

interface KeyboardHandlerProps {
    /** All blocks in the currently entered section (tree structure) */
    sectionBlocks?: Block[]
    /** Called when Delete/Backspace is pressed with a block selected */
    onDeleteBlock?: (blockId: string) => void
    /** Called when Cmd+D is pressed — parent should duplicate the block */
    onDuplicateBlock?: (blockId: string) => void
    /** Called when Cmd+V is pressed — parent receives clipboard payload */
    onPasteBlock?: (payload: ClipboardPayload, afterBlockId: string | null) => void
}

// ============================================
// Component (renders nothing, pure effect)
// ============================================

export function SelectionKeyboardHandler({
    sectionBlocks,
    onDeleteBlock,
    onDuplicateBlock,
    onPasteBlock,
}: KeyboardHandlerProps) {
    const mode = useSelectionStore((s) => s.mode)
    const blockId = useSelectionStore((s) => s.blockId)
    const sectionId = useSelectionStore((s) => s.sectionId)
    const clipboard = useSelectionStore((s) => s.clipboard)
    const isEditing = useSelectionStore((s) => s.isEditing)

    const escape = useSelectionStore((s) => s.escape)
    const enterSection = useSelectionStore((s) => s.enterSection)
    const selectBlock = useSelectionStore((s) => s.selectBlock)
    const startEditing = useSelectionStore((s) => s.startEditing)
    const copyToClipboard = useSelectionStore((s) => s.copyToClipboard)

    // Flatten the block tree for Tab cycling (depth-first, all blocks)
    const flatBlocks = useMemo(
        () => (sectionBlocks ? flattenBlocks(sectionBlocks) : []),
        [sectionBlocks],
    )

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const isMeta = e.metaKey || e.ctrlKey
            const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()

            // Don't intercept when user is typing in an input/textarea/contentEditable
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return
            if ((e.target as HTMLElement)?.isContentEditable) return

            // Don't intercept when inline-editing a block (contentEditable handles keys)
            if (isEditing) {
                // Only intercept Escape to exit editing (handled by block's onKeyDown,
                // but also handle it here as a safety net)
                if (e.key === 'Escape') {
                    e.preventDefault()
                    escape()
                }
                return
            }

            switch (e.key) {
                // ── Escape: go up one selection level ──
                case 'Escape': {
                    e.preventDefault()
                    escape()
                    break
                }

                // ── Enter: Figma-style drill-down ──
                // section-selected → enter section
                // block-selected + container → select first child (drill into container)
                // block-selected + editable → start inline editing
                case 'Enter': {
                    if (e.shiftKey) {
                        // ── Shift+Enter: go to parent container ──
                        if (mode === 'block-selected' && blockId && sectionBlocks) {
                            e.preventDefault()
                            const parent = findParent(sectionBlocks, blockId)
                            if (parent) {
                                // Select the parent container
                                selectBlock(parent.id)
                            } else {
                                // At top level — back to entered mode (like Escape from block)
                                escape()
                            }
                        }
                        break
                    }

                    if (mode === 'section-selected') {
                        e.preventDefault()
                        enterSection()
                    } else if (mode === 'block-selected' && blockId) {
                        e.preventDefault()
                        // Check if selected block is a container with children
                        const block = sectionBlocks ? findBlock(sectionBlocks, blockId) : null
                        if (
                            block &&
                            CONTAINER_BLOCK_TYPES.has(block.type) &&
                            block.children &&
                            block.children.length > 0
                        ) {
                            // Drill into container — select its first child
                            selectBlock(block.children[0].id)
                        } else if (block && EDITABLE_BLOCK_TYPES.has(block.type)) {
                            // Start inline editing for editable blocks
                            startEditing()
                        }
                    } else if (mode === 'entered' && sectionBlocks && sectionBlocks.length > 0) {
                        // Entered mode with no block selected → select first block
                        e.preventDefault()
                        selectBlock(sectionBlocks[0].id)
                    }
                    break
                }

                // ── Delete / Backspace: delete selected block ──
                case 'Delete':
                case 'Backspace': {
                    if (mode === 'block-selected' && blockId) {
                        e.preventDefault()
                        onDeleteBlock?.(blockId)
                    }
                    break
                }

                // ── Tab / Shift+Tab: cycle through ALL blocks (flattened tree) ──
                case 'Tab': {
                    if (
                        (mode === 'entered' || mode === 'block-selected') &&
                        flatBlocks.length > 0
                    ) {
                        e.preventDefault()
                        const currentIndex = blockId
                            ? flatBlocks.findIndex((b) => b.id === blockId)
                            : -1

                        let nextIndex: number
                        if (e.shiftKey) {
                            // Previous
                            nextIndex =
                                currentIndex <= 0
                                    ? flatBlocks.length - 1
                                    : currentIndex - 1
                        } else {
                            // Next
                            nextIndex =
                                currentIndex >= flatBlocks.length - 1
                                    ? 0
                                    : currentIndex + 1
                        }

                        selectBlock(flatBlocks[nextIndex].id)
                    }
                    break
                }

                // ── Cmd+C: copy block to clipboard ──
                case 'c': {
                    if (isMeta && mode === 'block-selected' && blockId && sectionBlocks) {
                        e.preventDefault()
                        const block = findBlock(sectionBlocks, blockId)
                        if (block) {
                            const payload: ClipboardPayload = {
                                scytle: true,
                                version: 2,
                                type: 'block',
                                data: block,
                            }
                            copyToClipboard(payload)
                            flashBlock(blockId, '#22c55e', 'Copied')

                            // Also write to system clipboard
                            navigator.clipboard
                                .writeText(JSON.stringify(payload))
                                .catch(() => {
                                    // Silently fail — internal clipboard still works
                                })
                        }
                    }
                    break
                }

                // ── Cmd+X: cut (copy + delete) ──
                case 'x': {
                    if (isMeta && mode === 'block-selected' && blockId && sectionBlocks) {
                        e.preventDefault()
                        const block = findBlock(sectionBlocks, blockId)
                        if (block) {
                            const payload: ClipboardPayload = {
                                scytle: true,
                                version: 2,
                                type: 'block',
                                data: block,
                            }
                            copyToClipboard(payload)
                            flashBlock(blockId, '#ef4444', 'Cut')
                            onDeleteBlock?.(blockId)
                        }
                    }
                    break
                }

                // ── Cmd+V: paste from clipboard ──
                case 'v': {
                    if (
                        isMeta &&
                        (mode === 'entered' || mode === 'block-selected') &&
                        sectionId &&
                        clipboard
                    ) {
                        e.preventDefault()
                        onPasteBlock?.(clipboard, blockId)
                    }
                    break
                }

                // ── Cmd+D: duplicate block ──
                case 'd': {
                    if (isMeta && mode === 'block-selected' && blockId) {
                        e.preventDefault()
                        onDuplicateBlock?.(blockId)
                    }
                    break
                }

                default:
                    break
            }
        },
        [
            mode,
            blockId,
            sectionId,
            sectionBlocks,
            flatBlocks,
            clipboard,
            isEditing,
            escape,
            enterSection,
            selectBlock,
            startEditing,
            copyToClipboard,
            onDeleteBlock,
            onDuplicateBlock,
            onPasteBlock,
        ],
    )

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    // This component renders nothing — it's a pure effect
    return null
}
