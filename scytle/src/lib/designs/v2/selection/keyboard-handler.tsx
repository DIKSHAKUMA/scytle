/**
 * SelectionKeyboardHandler — Global keyboard shortcut handler for selection
 *
 * Mounts once inside the canvas wrapper. Listens for:
 *   Escape     → escape() (go up one selection level)
 *   Enter      → enterSection() (dive into selected section)
 *   Delete/Bksp → fires onDeleteBlock callback when block selected
 *   Tab        → select next block in section
 *   Shift+Tab  → select previous block in section
 *   Cmd+C      → copy block to clipboard
 *   Cmd+X      → cut (copy+flag for delete)
 *   Cmd+V      → paste (fires callback)
 *   Cmd+D      → duplicate (fires callback)
 *
 * Block mutation callbacks (delete, paste, duplicate) are delegated up
 * to the parent via props, because the selection store doesn't own block data.
 */

'use client'

import { useEffect, useCallback } from 'react'
import { useSelectionStore } from '@/store/selection-store'
import type { ClipboardPayload } from '@/store/selection-store'
import type { Block } from '@/lib/designs/v2/blocks/types'

// ============================================
// Props
// ============================================

interface KeyboardHandlerProps {
    /** All blocks in the currently entered section */
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

    const escape = useSelectionStore((s) => s.escape)
    const enterSection = useSelectionStore((s) => s.enterSection)
    const selectBlock = useSelectionStore((s) => s.selectBlock)
    const copyToClipboard = useSelectionStore((s) => s.copyToClipboard)

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const isMeta = e.metaKey || e.ctrlKey
            const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()

            // Don't intercept when user is typing in an input/textarea
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return

            switch (e.key) {
                // ── Escape: go up one selection level ──
                case 'Escape': {
                    e.preventDefault()
                    escape()
                    break
                }

                // ── Enter: dive into selected section ──
                case 'Enter': {
                    if (mode === 'section-selected') {
                        e.preventDefault()
                        enterSection()
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

                // ── Tab / Shift+Tab: cycle through blocks ──
                case 'Tab': {
                    if (
                        (mode === 'entered' || mode === 'block-selected') &&
                        sectionBlocks &&
                        sectionBlocks.length > 0
                    ) {
                        e.preventDefault()
                        const currentIndex = blockId
                            ? sectionBlocks.findIndex((b) => b.id === blockId)
                            : -1

                        let nextIndex: number
                        if (e.shiftKey) {
                            // Previous
                            nextIndex =
                                currentIndex <= 0
                                    ? sectionBlocks.length - 1
                                    : currentIndex - 1
                        } else {
                            // Next
                            nextIndex =
                                currentIndex >= sectionBlocks.length - 1
                                    ? 0
                                    : currentIndex + 1
                        }

                        selectBlock(sectionBlocks[nextIndex].id)
                    }
                    break
                }

                // ── Cmd+C: copy block to clipboard ──
                case 'c': {
                    if (isMeta && mode === 'block-selected' && blockId && sectionBlocks) {
                        e.preventDefault()
                        const block = sectionBlocks.find((b) => b.id === blockId)
                        if (block) {
                            const payload: ClipboardPayload = {
                                scytle: true,
                                version: 2,
                                type: 'block',
                                data: block,
                            }
                            copyToClipboard(payload)

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
                        const block = sectionBlocks.find((b) => b.id === blockId)
                        if (block) {
                            const payload: ClipboardPayload = {
                                scytle: true,
                                version: 2,
                                type: 'block',
                                data: block,
                            }
                            copyToClipboard(payload)
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
            clipboard,
            escape,
            enterSection,
            selectBlock,
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
