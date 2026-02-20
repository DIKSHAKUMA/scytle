/**
 * V2 Selection Store — Figma-like selection state machine
 *
 * State machine:
 *   IDLE → click(section) → SECTION_SELECTED
 *   SECTION_SELECTED → dblclick / Enter → ENTERED
 *   SECTION_SELECTED → Escape → IDLE
 *   ENTERED → click(block) → BLOCK_SELECTED
 *   ENTERED → Escape → SECTION_SELECTED
 *   BLOCK_SELECTED → click(otherBlock) → BLOCK_SELECTED
 *   BLOCK_SELECTED → Escape → ENTERED
 *   BLOCK_SELECTED → Delete → delete block → ENTERED
 *   Any → click(canvas bg) → IDLE
 *
 * This store is intentionally separate from useUnifiedStore to keep
 * selection concerns decoupled from data persistence.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Block } from '@/lib/designs/v2/blocks/types'

// Lazy reference — avoids circular dependency at module init time.
// Populated on first use; by then unified-store is guaranteed to be created.
let _getUnifiedSelectSection: ((sectionId: string) => void) | null = null
function syncUnifiedSection(sectionId: string) {
    if (!_getUnifiedSelectSection) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useUnifiedStore } = require('./unified-store')
        _getUnifiedSelectSection = (id: string) =>
            useUnifiedStore.getState().selectSection(id)
    }
    _getUnifiedSelectSection(sectionId)
}

// ============================================
// Types
// ============================================

export type SelectionMode =
    | 'idle'
    | 'section-selected'
    | 'entered'
    | 'block-selected'

export interface HoverTarget {
    type: 'section' | 'block'
    id: string
    /** Bounding rect relative to the canvas scroll container */
    rect?: DOMRect
}

export interface SelectionState {
    // ── State ──
    mode: SelectionMode
    sectionId: string | null
    blockId: string | null

    /** Whether the selected block is in inline-edit mode (text editing) */
    isEditing: boolean

    /** Currently hovered element (for outline rendering) */
    hoverTarget: HoverTarget | null

    /** Clipboard (in-memory, typed block JSON) */
    clipboard: ClipboardPayload | null

    /** Blocks for the currently entered section (registered by V2 layout components) */
    currentBlocks: Block[]

    // ── Actions ──
    selectSection: (sectionId: string) => void
    enterSection: () => void
    selectBlock: (blockId: string) => void
    escape: () => void
    clear: () => void

    /** Enter inline text editing on the currently selected block */
    startEditing: () => void
    /** Exit inline text editing */
    stopEditing: () => void

    setHover: (target: HoverTarget | null) => void

    /** Register the blocks for the currently entered section */
    setCurrentBlocks: (blocks: Block[]) => void

    /** Copy a block to the internal clipboard */
    copyToClipboard: (payload: ClipboardPayload) => void
    clearClipboard: () => void

    /**
     * Auto-enter a section and select a block in one transition.
     * Works from ANY mode: idle, section-selected, entered, block-selected.
     * When sectionId is provided and differs from current, switches section.
     */
    autoEnterAndSelectBlock: (blockId: string, sectionId?: string) => void
}

export interface ClipboardPayload {
    scytle: true
    version: 2
    type: 'block' | 'section'
    data: unknown
}

// ============================================
// Store
// ============================================

export const useSelectionStore = create<SelectionState>()(
    subscribeWithSelector(
        immer((set) => ({
            // ── Initial state ──
            mode: 'idle',
            sectionId: null,
            blockId: null,
            isEditing: false,
            hoverTarget: null,
            clipboard: null,
            currentBlocks: [],

            // ── Transitions ──

            selectSection: (sectionId: string) => {
                set((s) => {
                    s.mode = 'section-selected'
                    s.sectionId = sectionId
                    s.blockId = null
                    s.isEditing = false
                })
            },

            enterSection: () => {
                set((s) => {
                    if (s.mode === 'section-selected' && s.sectionId) {
                        s.mode = 'entered'
                        // sectionId stays, blockId stays null
                        s.blockId = null
                    }
                })
            },

            selectBlock: (blockId: string) => {
                set((s) => {
                    if (s.mode === 'entered' || s.mode === 'block-selected') {
                        s.mode = 'block-selected'
                        s.blockId = blockId
                        s.isEditing = false
                    }
                })
            },

            escape: () => {
                set((s) => {
                    // If editing, stop editing first (stay block-selected)
                    if (s.isEditing) {
                        s.isEditing = false
                        return
                    }
                    switch (s.mode) {
                        case 'block-selected':
                            s.mode = 'entered'
                            s.blockId = null
                            break
                        case 'entered':
                            s.mode = 'section-selected'
                            s.blockId = null
                            s.currentBlocks = []
                            break
                        case 'section-selected':
                            s.mode = 'idle'
                            s.sectionId = null
                            s.blockId = null
                            s.currentBlocks = []
                            break
                        default:
                            break
                    }
                })
            },

            clear: () => {
                set((s) => {
                    s.mode = 'idle'
                    s.sectionId = null
                    s.blockId = null
                    s.isEditing = false
                    s.hoverTarget = null
                    s.currentBlocks = []
                })
            },

            startEditing: () => {
                set((s) => {
                    if (s.mode === 'block-selected' && s.blockId) {
                        s.isEditing = true
                    }
                })
            },

            stopEditing: () => {
                set((s) => {
                    s.isEditing = false
                })
            },

            setHover: (target: HoverTarget | null) => {
                set((s) => {
                    s.hoverTarget = target
                })
            },

            setCurrentBlocks: (blocks: Block[]) => {
                set((s) => {
                    s.currentBlocks = blocks as Block[]
                })
            },

            copyToClipboard: (payload: ClipboardPayload) => {
                set((s) => {
                    s.clipboard = payload as ClipboardPayload
                })
            },

            clearClipboard: () => {
                set((s) => {
                    s.clipboard = null
                })
            },

            autoEnterAndSelectBlock: (blockId: string, sectionId?: string) => {
                set((s) => {
                    if (sectionId) s.sectionId = sectionId
                    if (s.sectionId) {
                        s.mode = 'block-selected'
                        s.blockId = blockId
                        s.isEditing = false
                    }
                })
                // Keep the unified store's section selection in sync
                const resolvedSectionId = sectionId ?? useSelectionStore.getState().sectionId
                if (resolvedSectionId) {
                    try { syncUnifiedSection(resolvedSectionId) } catch { /* noop */ }
                }
            },
        })),
    ),
)
