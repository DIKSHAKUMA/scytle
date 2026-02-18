/**
 * BlockContextMenu — Right-click context menu for blocks
 *
 * Shown when right-clicking a selected block. Provides:
 *   Cut, Copy, Paste Below, Duplicate, Move Up/Down, Delete, Lock/Unlock
 *
 * Positioned absolutely relative to the canvas viewport.
 * Uses a portal to render on top of everything.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSelectionStore } from '@/store/selection-store'
import type { ClipboardPayload } from '@/store/selection-store'
import type { Block } from '@/lib/designs/v2/blocks/types'

// ============================================
// Props
// ============================================

interface ContextMenuProps {
    /** All blocks in the currently entered section */
    sectionBlocks?: Block[]
    /** Called on delete */
    onDeleteBlock?: (blockId: string) => void
    /** Called on duplicate */
    onDuplicateBlock?: (blockId: string) => void
    /** Called on paste */
    onPasteBlock?: (payload: ClipboardPayload, afterBlockId: string | null) => void
    /** Called on move */
    onMoveBlock?: (blockId: string, direction: 'up' | 'down') => void
    /** Called on lock/unlock toggle */
    onToggleLock?: (blockId: string) => void
}

// ============================================
// Menu state
// ============================================

interface MenuState {
    visible: boolean
    x: number
    y: number
    blockId: string | null
}

const INITIAL_MENU: MenuState = {
    visible: false,
    x: 0,
    y: 0,
    blockId: null,
}

// ============================================
// Component
// ============================================

export function BlockContextMenu({
    sectionBlocks,
    onDeleteBlock,
    onDuplicateBlock,
    onPasteBlock,
    onMoveBlock,
    onToggleLock,
}: ContextMenuProps) {
    const [menu, setMenu] = useState<MenuState>(INITIAL_MENU)

    const mode = useSelectionStore((s) => s.mode)
    const selectedBlockId = useSelectionStore((s) => s.blockId)
    const clipboard = useSelectionStore((s) => s.clipboard)
    const copyToClipboard = useSelectionStore((s) => s.copyToClipboard)

    const close = useCallback(() => setMenu(INITIAL_MENU), [])

    // ── Listen for right-click on blocks ──
    useEffect(() => {
        function handleContextMenu(e: MouseEvent) {
            if (mode !== 'block-selected' && mode !== 'entered') return

            const target = e.target as HTMLElement
            const layerEl = target.closest('[data-layer-id]')
            if (!layerEl) return

            const blockId = layerEl.getAttribute('data-layer-id')
            if (!blockId) return

            e.preventDefault()
            setMenu({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                blockId,
            })
        }

        window.addEventListener('contextmenu', handleContextMenu)
        return () => window.removeEventListener('contextmenu', handleContextMenu)
    }, [mode])

    // ── Close on any click ──
    useEffect(() => {
        if (!menu.visible) return

        function handleClick() {
            close()
        }

        window.addEventListener('click', handleClick)
        window.addEventListener('contextmenu', handleClick)
        return () => {
            window.removeEventListener('click', handleClick)
            window.removeEventListener('contextmenu', handleClick)
        }
    }, [menu.visible, close])

    // ── Close on Escape ──
    useEffect(() => {
        if (!menu.visible) return

        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                e.preventDefault()
                close()
            }
        }

        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [menu.visible, close])

    if (!menu.visible || !menu.blockId) return null

    const block = sectionBlocks?.find((b) => b.id === menu.blockId)
    const blockIndex = sectionBlocks?.findIndex((b) => b.id === menu.blockId) ?? -1
    const isFirst = blockIndex === 0
    const isLast = blockIndex === (sectionBlocks?.length ?? 0) - 1
    const isLocked = block?.locked ?? false

    // ── Action handlers ──
    const handleCut = () => {
        if (!menu.blockId || !block) return
        const payload: ClipboardPayload = {
            scytle: true,
            version: 2,
            type: 'block',
            data: block,
        }
        copyToClipboard(payload)
        onDeleteBlock?.(menu.blockId)
        close()
    }

    const handleCopy = () => {
        if (!block) return
        const payload: ClipboardPayload = {
            scytle: true,
            version: 2,
            type: 'block',
            data: block,
        }
        copyToClipboard(payload)
        navigator.clipboard.writeText(JSON.stringify(payload)).catch(() => { })
        close()
    }

    const handlePaste = () => {
        if (clipboard) {
            onPasteBlock?.(clipboard, menu.blockId)
        }
        close()
    }

    const handleDuplicate = () => {
        if (menu.blockId) onDuplicateBlock?.(menu.blockId)
        close()
    }

    const handleMoveUp = () => {
        if (menu.blockId) onMoveBlock?.(menu.blockId, 'up')
        close()
    }

    const handleMoveDown = () => {
        if (menu.blockId) onMoveBlock?.(menu.blockId, 'down')
        close()
    }

    const handleDelete = () => {
        if (menu.blockId) onDeleteBlock?.(menu.blockId)
        close()
    }

    const handleToggleLock = () => {
        if (menu.blockId) onToggleLock?.(menu.blockId)
        close()
    }

    return createPortal(
        <div
            className="fixed z-[9999]"
            style={{ left: menu.x, top: menu.y }}
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="min-w-[200px] rounded-lg border py-1 shadow-lg"
                style={{
                    backgroundColor: 'var(--sg-bg-primary, #ffffff)',
                    borderColor: 'var(--sg-border, #e5e7eb)',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '13px',
                }}
            >
                <MenuItem label="Cut" shortcut="⌘X" onClick={handleCut} />
                <MenuItem label="Copy" shortcut="⌘C" onClick={handleCopy} />
                <MenuItem
                    label="Paste Below"
                    shortcut="⌘V"
                    onClick={handlePaste}
                    disabled={!clipboard}
                />
                <MenuDivider />
                <MenuItem label="Duplicate" shortcut="⌘D" onClick={handleDuplicate} />
                <MenuItem
                    label="Move Up"
                    onClick={handleMoveUp}
                    disabled={isFirst}
                />
                <MenuItem
                    label="Move Down"
                    onClick={handleMoveDown}
                    disabled={isLast}
                />
                <MenuDivider />
                <MenuItem
                    label="Delete"
                    shortcut="⌫"
                    onClick={handleDelete}
                    destructive
                />
                <MenuItem
                    label={isLocked ? 'Unlock' : 'Lock'}
                    onClick={handleToggleLock}
                />
            </div>
        </div>,
        document.body,
    )
}

// ============================================
// Sub-components
// ============================================

function MenuItem({
    label,
    shortcut,
    onClick,
    disabled,
    destructive,
}: {
    label: string
    shortcut?: string
    onClick: () => void
    disabled?: boolean
    destructive?: boolean
}) {
    return (
        <button
            className="flex w-full items-center justify-between px-3 py-1.5 text-left transition-colors hover:bg-black/5 disabled:pointer-events-none disabled:opacity-40"
            style={{
                color: destructive ? '#ef4444' : 'var(--sg-text-primary, #111827)',
            }}
            onClick={onClick}
            disabled={disabled}
        >
            <span>{label}</span>
            {shortcut && (
                <span
                    className="ml-6"
                    style={{
                        fontSize: '11px',
                        color: 'var(--sg-text-muted, #9ca3af)',
                    }}
                >
                    {shortcut}
                </span>
            )}
        </button>
    )
}

function MenuDivider() {
    return (
        <div
            className="my-1"
            style={{
                height: '1px',
                backgroundColor: 'var(--sg-border-muted, #f3f4f6)',
            }}
        />
    )
}
