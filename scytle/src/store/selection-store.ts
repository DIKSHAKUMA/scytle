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

    /** Currently hovered element (for outline rendering) */
    hoverTarget: HoverTarget | null

    /** Clipboard (in-memory, typed block JSON) */
    clipboard: ClipboardPayload | null

    // ── Actions ──
    selectSection: (sectionId: string) => void
    enterSection: () => void
    selectBlock: (blockId: string) => void
    escape: () => void
    clear: () => void

    setHover: (target: HoverTarget | null) => void

    /** Copy a block to the internal clipboard */
    copyToClipboard: (payload: ClipboardPayload) => void
    clearClipboard: () => void
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
            hoverTarget: null,
            clipboard: null,

            // ── Transitions ──

            selectSection: (sectionId: string) => {
                set((s) => {
                    s.mode = 'section-selected'
                    s.sectionId = sectionId
                    s.blockId = null
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
                    }
                })
            },

            escape: () => {
                set((s) => {
                    switch (s.mode) {
                        case 'block-selected':
                            s.mode = 'entered'
                            s.blockId = null
                            break
                        case 'entered':
                            s.mode = 'section-selected'
                            s.blockId = null
                            break
                        case 'section-selected':
                            s.mode = 'idle'
                            s.sectionId = null
                            s.blockId = null
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
                    s.hoverTarget = null
                })
            },

            setHover: (target: HoverTarget | null) => {
                set((s) => {
                    s.hoverTarget = target
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
        })),
    ),
)
