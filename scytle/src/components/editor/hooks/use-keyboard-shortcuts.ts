'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/store/editor-store'
import type { CanvasTool } from '@/types/canvas'
import { findNodeById } from '@/types/canvas'
import { isDragActive } from './use-node-drag'
import { isResizeActive } from './use-node-resize'

// ============================================================
// Centralized keyboard shortcut hub
// ============================================================
//
// Shortcut table:
// ┌───────────────────────┬────────────────────────────────┐
// │ Key                   │ Action                         │
// ├───────────────────────┼────────────────────────────────┤
// │ V                     │ Select tool                    │
// │ F                     │ Frame tool                     │
// │ T                     │ Text tool                      │
// │ H                     │ Hand tool                      │
// │ Shift+H               │ Flip horizontal                │
// │ Shift+V               │ Flip vertical                  │
// │ Delete / Backspace    │ Delete selected                │
// │ Escape                │ Deselect / exit frame          │
// │ ]                     │ Bring forward                  │
// │ [                     │ Send backward                  │
// │ ⌘Z                    │ Undo                           │
// │ ⇧⌘Z                   │ Redo                           │
// │ ⌘C                    │ Copy                           │
// │ ⌘V                    │ Paste                          │
// │ ⌘D                    │ Duplicate                      │
// │ ⌘G                    │ Group                          │
// │ ⇧⌘G                   │ Ungroup                        │
// │ ⌘]                    │ Bring to front                 │
// │ ⌘[                    │ Send to back                   │
// │ ⌘= / ⌘+              │ Zoom in                        │
// │ ⌘-                    │ Zoom out                       │
// │ ⌘0                    │ Reset zoom                     │
// └───────────────────────┴────────────────────────────────┘
// ============================================================

export function useKeyboardShortcuts() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement

            // Skip when typing in inputs, textareas, or contenteditable
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) return

            const meta = e.metaKey || e.ctrlKey
            const ctrl = e.ctrlKey
            const shift = e.shiftKey
            const key = e.key.toLowerCase()
            const store = useEditorStore.getState()

            // ⌘/Ctrl hold → bend tool in vector edit mode
            if ((key === 'meta' || key === 'control') && store.vectorEditNodeId && store.vectorEditTool !== 'bend') {
                _prevToolBeforeBend = store.vectorEditTool
                store.setVectorEditTool('bend')
                return
            }

            // ── Modifier commands (Cmd/Ctrl + key) ───────────────

            if (meta) {
                switch (key) {
                    // Undo / Redo
                    case 'z':
                        e.preventDefault()
                        if (shift) {
                            store.redo()
                        } else {
                            store.undo()
                        }
                        return

                    // Copy
                    case 'c':
                        if (store.selectedIds.length > 0) {
                            e.preventDefault()
                            store.copyNodes(store.selectedIds)
                        }
                        return

                    // Cut
                    case 'x':
                        if (store.selectedIds.length > 0) {
                            e.preventDefault()
                            store.cutNodes(store.selectedIds)
                        }
                        return

                    // Paste
                    case 'v':
                        if (store._clipboard.length > 0) {
                            e.preventDefault()
                            store.pasteNodes()
                        }
                        return

                    // Duplicate
                    case 'd':
                        if (store.selectedIds.length > 0) {
                            e.preventDefault()
                            store.duplicateNodes(store.selectedIds)
                        }
                        return

                    // Group / Ungroup
                    case 'g':
                        e.preventDefault()
                        if (shift) {
                            if (store.selectedIds.length === 1) {
                                store.ungroupNodes(store.selectedIds[0])
                            }
                        } else {
                            if (store.selectedIds.length >= 2) {
                                store.groupNodes(store.selectedIds)
                            }
                        }
                        return

                    // Z-order (Cmd+bracket → to front/back)
                    case ']':
                        e.preventDefault()
                        if (store.selectedIds.length === 1) {
                            store.bringToFront(store.selectedIds[0])
                        }
                        return
                    case '[':
                        e.preventDefault()
                        if (store.selectedIds.length === 1) {
                            store.sendToBack(store.selectedIds[0])
                        }
                        return

                    // Zoom
                    case '=':
                    case '+':
                        e.preventDefault()
                        store.zoomIn()
                        return
                    case '-':
                        e.preventDefault()
                        store.zoomOut()
                        return
                    case '0':
                        e.preventDefault()
                        store.resetZoom()
                        return
                }

                // Don't fall through to bare-key handlers when meta is held
                return
            }

            // ── Bare key commands (no modifiers) ─────────────────

            // Z-order (bracket keys)
            if (key === ']' && store.selectedIds.length === 1) {
                e.preventDefault()
                store.bringForward(store.selectedIds[0])
                return
            }
            if (key === '[' && store.selectedIds.length === 1) {
                e.preventDefault()
                store.sendBackward(store.selectedIds[0])
                return
            }

            // Delete
            if (key === 'delete' || key === 'backspace') {
                // In vector edit mode: delete selected vertices
                if (store.vectorEditNodeId && store.selectedVertexIndices.length > 0) {
                    e.preventDefault()
                    store.deleteSelectedVertices(store.vectorEditNodeId)
                    return
                }
                if (store.selectedIds.length > 0) {
                    e.preventDefault()
                    store.deleteSelectedNodes()
                }
                return
            }

            // Escape — deselect or exit frame
            if (key === 'escape') {
                // Don't interfere with drag/resize cancel
                if (isDragActive() || isResizeActive()) return

                e.preventDefault()

                // Vector edit mode: exit back to selection
                if (store.vectorEditNodeId) {
                    store.exitVectorEditMode()
                    return
                }

                // Pen tool: commit current path and switch to select
                if (store.penDrawingState) {
                    store.commitPenPath()
                    store.setActiveTool('select')
                    return
                }

                if (store.editingNodeId) {
                    store.setEditingNodeId(null)
                } else if (store.enteredFrameId) {
                    store.exitFrame()
                } else if (store.selectedIds.length > 0) {
                    store.deselectAll()
                }
                return
            }

            // Enter — enter vector edit mode when a single vector node is selected
            if (key === 'enter' && !store.editingNodeId && !store.vectorEditNodeId) {
                if (store.selectedIds.length === 1) {
                    const node = findNodeById(store.nodes, store.selectedIds[0])
                    if (node && node.type === 'vector') {
                        e.preventDefault()
                        store.enterVectorEditMode(node.id)
                        return
                    }
                }
            }

            // ── Vector edit mode sub-tool shortcuts ───────────────────
            if (store.vectorEditNodeId) {
                // Bare key shortcuts (no modifiers)
                if (!meta && !ctrl && !e.altKey) {
                    const vectorToolMap: Record<string, import('@/store/editor-store').VectorEditTool> = {
                        v: 'move',
                        q: 'lasso',
                        m: 'shape-builder',
                        x: 'cut',
                    }
                    const vtool = vectorToolMap[key]
                    if (vtool) {
                        e.preventDefault()
                        store.setVectorEditTool(vtool)
                        return
                    }
                    // Shift+B → paint, Shift+W → variable-width
                    if (shift) {
                        if (key === 'b') { e.preventDefault(); store.setVectorEditTool('paint'); return }
                        if (key === 'w') { e.preventDefault(); store.setVectorEditTool('variable-width'); return }
                    }
                }
                // Don't fall through to main tool switch while in vector edit
                if (!meta && !ctrl) return
            }

            // Tool shortcuts (bare keys, no modifiers)
            // Shift+H / Shift+V → flip selected node (Figma shortcut)
            if (shift && store.selectedIds.length === 1) {
                const nodeId = store.selectedIds[0]
                if (key === 'h') {
                    e.preventDefault()
                    const node = findNodeById(store.nodes, nodeId)
                    if (node) store.updateNode(nodeId, { flipX: !node.flipX })
                    return
                }
                if (key === 'v') {
                    e.preventDefault()
                    const node = findNodeById(store.nodes, nodeId)
                    if (node) store.updateNode(nodeId, { flipY: !node.flipY })
                    return
                }
            }

            if (shift || e.altKey) return // Don't fire tool switch on Shift+V etc.

            const toolMap: Record<string, CanvasTool> = {
                v: 'select',
                f: 'frame',
                t: 'text',
                h: 'hand',
                p: 'pen',
            }
            const tool = toolMap[key]
            if (tool) {
                e.preventDefault()
                store.setActiveTool(tool)
                return
            }
        }

        // ── ⌘/Ctrl hold → temporarily switch to bend tool in vector edit ──
        let _prevToolBeforeBend: import('@/store/editor-store').VectorEditTool | null = null

        const handleKeyUp = (e: KeyboardEvent) => {
            // Restore previous tool when ⌘/Ctrl released
            if ((e.key === 'Meta' || e.key === 'Control') && _prevToolBeforeBend) {
                const store = useEditorStore.getState()
                if (store.vectorEditNodeId && store.vectorEditTool === 'bend') {
                    store.setVectorEditTool(_prevToolBeforeBend)
                }
                _prevToolBeforeBend = null
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])
}
