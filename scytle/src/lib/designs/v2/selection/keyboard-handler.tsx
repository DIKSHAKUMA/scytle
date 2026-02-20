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
    const isEditing = useSelectionStore((s) => s.isEditing)

    const escape = useSelectionStore((s) => s.escape)
    const enterSection = useSelectionStore((s) => s.enterSection)
    const selectBlock = useSelectionStore((s) => s.selectBlock)
    const startEditing = useSelectionStore((s) => s.startEditing)
    const copyToClipboard = useSelectionStore((s) => s.copyToClipboard)

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

                // ── Enter: dive into selected section, or start editing selected block ──
                case 'Enter': {
                    if (mode === 'section-selected') {
                        e.preventDefault()
                        enterSection()
                    } else if (mode === 'block-selected' && blockId) {
                        // Enter on a selected block → start inline editing (if editable)
                        e.preventDefault()
                        startEditing()
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
                        const block = sectionBlocks.find((b) => b.id === blockId)
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
