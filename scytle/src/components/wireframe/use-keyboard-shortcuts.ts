'use client'

import { useEffect, useCallback } from 'react'
import { useUnifiedStore } from '@/store'
import { useSelectionStore } from '@/store/selection-store'
import { useStyleGuideStore } from '@/store/style-guide-store'
import { useGeneration } from './use-generation'
import { toast } from 'sonner'

interface UseKeyboardShortcutsOptions {
    enabled?: boolean
}

/**
 * useKeyboardShortcuts Hook
 * 
 * Handles keyboard shortcuts for the wireframe canvas:
 * - Delete/Backspace: Delete selected section
 * - Escape: Deselect all
 * - Cmd/Ctrl + Z: Undo
 * - Cmd/Ctrl + Shift + Z: Redo
 * - Cmd/Ctrl + G: Generate copy for selection
 * - Arrow keys: Navigate between sections
 * - G: Mark section as global
 *
 * IMPORTANT: When the V2 selection system is active (entered / block-selected),
 * most shortcuts are handled by SelectionKeyboardHandler instead. This hook
 * only processes Undo/Redo (which V2 doesn't handle) and defers everything else.
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
    const { enabled = true } = options

    const {
        selectedPageId,
        selectedSectionId,
        selectSection,
        selectPage,
        deselectAll,
        deleteSection,
        duplicateSection,
        toggleGlobalSection,
        syncGlobalSection,
        undo,
        redo,
        canUndo,
        canRedo,
        pages,
        getSectionById,
    } = useUnifiedStore()

    const {
        generateSectionCopy,
        generatePageCopy,
    } = useGeneration()

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Skip if focus is on input elements
        const target = e.target as HTMLElement
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        ) {
            return
        }

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
        const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

        // ── V2 selection guard ──
        // When V2 is in entered or block-selected mode, SelectionKeyboardHandler
        // handles Escape, Enter, Delete, Tab, Cmd+C/X/V/D. We only process
        // Undo/Redo here (which V2 doesn't handle). Otherwise we'd corrupt state
        // by e.g. calling deselectAll() while a block is still selected.
        const v2Mode = useSelectionStore.getState().mode
        const v2Active = v2Mode === 'entered' || v2Mode === 'block-selected'

        // Undo: Cmd/Ctrl + Z
        if (cmdOrCtrl && e.key === 'z' && !e.shiftKey) {
            e.preventDefault()
            if (canUndo()) {
                undo()
                toast.info('Undone')
            }
            return
        }

        // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
        if ((cmdOrCtrl && e.key === 'z' && e.shiftKey) || (cmdOrCtrl && e.key === 'y')) {
            e.preventDefault()
            if (canRedo()) {
                redo()
                toast.info('Redone')
            }
            return
        }

        // ── Defer to V2 SelectionKeyboardHandler when blocks are active ──
        // Undo/Redo (above) still run; everything below is section-level and
        // would conflict with V2's block-level handlers (Escape, Delete, etc.)
        if (v2Active) return

        // ── Style Guide shortcuts (C / T / U / Space) ──
        const sgStore = useStyleGuideStore.getState()

        // C: Shuffle Colors
        if (e.key === 'c' && !cmdOrCtrl && !e.shiftKey) {
            e.preventDefault()
            sgStore.shuffleColors()
            return
        }

        // T: Shuffle Typography
        if (e.key === 't' && !cmdOrCtrl && !e.shiftKey) {
            e.preventDefault()
            sgStore.shuffleTypography()
            return
        }

        // U: Shuffle UI
        if (e.key === 'u' && !cmdOrCtrl && !e.shiftKey) {
            e.preventDefault()
            sgStore.shuffleUI()
            return
        }

        // Space: Shuffle section scheme (requires selected section)
        if (e.key === ' ' && !cmdOrCtrl && selectedSectionId) {
            e.preventDefault()
            sgStore.shuffleSectionScheme(selectedSectionId)
            return
        }

        // Generate: Cmd/Ctrl + G
        if (cmdOrCtrl && e.key === 'g') {
            e.preventDefault()
            if (selectedSectionId) {
                generateSectionCopy(selectedSectionId)
            } else if (selectedPageId) {
                generatePageCopy(selectedPageId)
            }
            return
        }

        // Duplicate: Cmd/Ctrl + D
        if (cmdOrCtrl && e.key === 'd' && selectedSectionId && selectedPageId) {
            e.preventDefault()
            duplicateSection(selectedPageId, selectedSectionId)
            toast.success('Section duplicated')
            return
        }

        // Escape: Deselect
        if (e.key === 'Escape') {
            e.preventDefault()
            deselectAll()
            return
        }

        // Delete: Delete selected section
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedSectionId) {
            e.preventDefault()
            const result = getSectionById(selectedSectionId)
            if (result) {
                const { page, section } = result
                const currentIndex = page.sections.findIndex(s => s.id === selectedSectionId)

                deleteSection(page.id, selectedSectionId)

                // Select adjacent section or page
                if (page.sections.length > 1) {
                    const nextIndex = Math.min(currentIndex, page.sections.length - 2)
                    const remainingSections = page.sections.filter(s => s.id !== selectedSectionId)
                    if (remainingSections[nextIndex]) {
                        selectSection(remainingSections[nextIndex].id)
                    }
                } else {
                    selectPage(page.id)
                }

                toast.success('Section deleted')
            }
            return
        }

        // G: Toggle global section
        if (e.key === 'g' && !cmdOrCtrl && selectedSectionId) {
            e.preventDefault()
            const result = getSectionById(selectedSectionId)
            if (result) {
                toggleGlobalSection(result.page.id, selectedSectionId)
                const isNowGlobal = !result.section.isGlobal
                if (isNowGlobal) {
                    syncGlobalSection(selectedSectionId)
                    toast.success('Section marked as global')
                } else {
                    toast.info('Section unmarked as global')
                }
            }
            return
        }

        // Arrow navigation (when section is selected)
        if (selectedSectionId && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            e.preventDefault()
            const result = getSectionById(selectedSectionId)
            if (result) {
                const { page } = result
                const currentIndex = page.sections.findIndex(s => s.id === selectedSectionId)

                if (e.key === 'ArrowUp' && currentIndex > 0) {
                    selectSection(page.sections[currentIndex - 1].id)
                } else if (e.key === 'ArrowDown' && currentIndex < page.sections.length - 1) {
                    selectSection(page.sections[currentIndex + 1].id)
                }
            }
            return
        }
    }, [
        selectedPageId,
        selectedSectionId,
        selectSection,
        selectPage,
        deselectAll,
        deleteSection,
        duplicateSection,
        toggleGlobalSection,
        syncGlobalSection,
        undo,
        redo,
        canUndo,
        canRedo,
        getSectionById,
        generateSectionCopy,
        generatePageCopy,
    ])

    useEffect(() => {
        if (!enabled) return

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [enabled, handleKeyDown])
}

/**
 * Keyboard Shortcuts Help
 * 
 * Returns a list of available shortcuts for display in UI.
 */
export function getKeyboardShortcuts() {
    const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const cmdSymbol = isMac ? '⌘' : 'Ctrl'

    return [
        { keys: ['↑', '↓'], description: 'Navigate sections' },
        { keys: ['Delete'], description: 'Delete section' },
        { keys: [`${cmdSymbol}+D`], description: 'Duplicate section' },
        { keys: ['Escape'], description: 'Deselect' },
        { keys: ['G'], description: 'Toggle global section' },
        { keys: [`${cmdSymbol}+G`], description: 'Generate copy' },
        { keys: [`${cmdSymbol}+Z`], description: 'Undo' },
        { keys: [`${cmdSymbol}+Shift+Z`], description: 'Redo' },
        { keys: ['C'], description: 'Shuffle colors' },
        { keys: ['T'], description: 'Shuffle typography' },
        { keys: ['U'], description: 'Shuffle UI' },
        { keys: ['Space'], description: 'Shuffle section scheme' },
    ]
}
