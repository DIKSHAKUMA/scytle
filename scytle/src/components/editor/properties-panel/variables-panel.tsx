'use client'

/**
 * Variables Panel — Figma-style draggable overlay for browsing and editing
 * design tokens. Rendered via portal so it floats above everything.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────┐
 *   │  ⋮⋮  Local variables                    ⊡  ✕    │  ← draggable header
 *   ├────────┬─────────────────────────────────────────┤
 *   │ Colors │  Name            Light      Dark        │
 *   │ Type…  │  ─────────────────────────────────────  │
 *   │ Space… │  Backgrounds                            │
 *   │ Effec… │   bg/primary     ■ #fff     ■ #0a0a0a  │
 *   │        │   bg/secondary   ■ #f5f5    ■ #1414    │
 *   │        │  Text                                   │
 *   │        │   text/primary   ■ #111     ■ #fafa    │
 *   │        │  ...                                    │
 *   └────────┴─────────────────────────────────────────┘
 */

import {
    useState,
    useRef,
    useCallback,
    useEffect,
    useLayoutEffect,
    type PointerEvent as ReactPointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useStyleGuideStore } from '@/store'
import { useEditorStore } from '@/store/editor-store'
import {
    STANDARD_COLLECTIONS,
    getVariableDisplayName,
    getVariableValueType,
    type VariableKey,
    type VariableCollection,
    type VariableTable,
    type ThemeMode,
    type VariableValueType,
} from '@/lib/theme/variable-table'

// ════════════════════════════════════════════════════════════
// Constants
// ════════════════════════════════════════════════════════════

const DEFAULT_W = 640
const DEFAULT_H = 480
const MIN_W = 480
const MIN_H = 320
const SIDEBAR_W = 140

// ════════════════════════════════════════════════════════════
// Icons — crisp inline SVGs matching Figma's variable modal
// ════════════════════════════════════════════════════════════

function DragDotsIcon() {
    return (
        <svg width="6" height="14" viewBox="0 0 6 14" fill="currentColor" className="text-muted-foreground/30">
            <circle cx="1.5" cy="2" r="1" />
            <circle cx="4.5" cy="2" r="1" />
            <circle cx="1.5" cy="5.5" r="1" />
            <circle cx="4.5" cy="5.5" r="1" />
            <circle cx="1.5" cy="9" r="1" />
            <circle cx="4.5" cy="9" r="1" />
            <circle cx="1.5" cy="12.5" r="1" />
            <circle cx="4.5" cy="12.5" r="1" />
        </svg>
    )
}

function MaximizeIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="1.5" y="1.5" width="9" height="9" rx="1" />
        </svg>
    )
}

function RestoreIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="3" y="1.5" width="7.5" height="7.5" rx="1" />
            <path d="M1.5 4.5V9.5A1 1 0 002.5 10.5H7.5" />
        </svg>
    )
}

function CloseIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5" />
        </svg>
    )
}

function ColorSwatchIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="#3B82F6" />
            <rect x="8" y="1" width="5" height="5" rx="1" fill="#10B981" />
            <rect x="1" y="8" width="5" height="5" rx="1" fill="#F59E0B" />
            <rect x="8" y="8" width="5" height="5" rx="1" fill="#EF4444" />
        </svg>
    )
}

function TypographyIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M3 3H11M7 3V11M5 11H9" strokeLinecap="round" />
        </svg>
    )
}

function SpacingIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M2 2V12M12 2V12M5 7H9" strokeLinecap="round" />
            <path d="M5 5.5L5 8.5M9 5.5L9 8.5" strokeLinecap="round" />
        </svg>
    )
}

function EffectsIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="7" cy="7" r="2" fill="currentColor" opacity="0.3" />
        </svg>
    )
}

const COLLECTION_ICONS: Record<string, React.ReactNode> = {
    colors: <ColorSwatchIcon />,
    typography: <TypographyIcon />,
    spacing: <SpacingIcon />,
    effects: <EffectsIcon />,
}

// ════════════════════════════════════════════════════════════
// Color Swatch — inline mini swatch for color variables
// ════════════════════════════════════════════════════════════

function ColorSwatch({ color, onChange }: { color: string; onChange?: (c: string) => void }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const hex = color.startsWith('#') ? color : `#${color}`

    return (
        <div className="flex items-center gap-1.5 min-w-0">
            <button
                className="w-5 h-5 rounded border border-border/50 shrink-0 cursor-pointer
                    shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] hover:border-border transition-colors"
                style={{ backgroundColor: hex }}
                onClick={() => inputRef.current?.click()}
                title={hex}
            />
            <input
                ref={inputRef}
                type="color"
                value={hex}
                className="sr-only"
                onChange={(e) => onChange?.(e.target.value)}
            />
            <span className="text-[11px] font-mono text-foreground/70 uppercase truncate select-text">
                {hex}
            </span>
        </div>
    )
}

// ════════════════════════════════════════════════════════════
// Value Cell — renders the appropriate editor for a variable
// ════════════════════════════════════════════════════════════

function ValueCell({
    variableKey,
    valueType,
    value,
    mode,
    onUpdate,
}: {
    variableKey: VariableKey
    valueType: VariableValueType
    value: string
    mode: ThemeMode
    onUpdate: (key: string, mode: ThemeMode, value: string) => void
}) {
    if (valueType === 'color') {
        return (
            <ColorSwatch
                color={value}
                onChange={(c) => onUpdate(variableKey, mode, c)}
            />
        )
    }

    if (valueType === 'font') {
        return (
            <span
                className="text-[11px] text-foreground/70 truncate"
                style={{ fontFamily: `"${value}", sans-serif` }}
                title={value}
            >
                {value}
            </span>
        )
    }

    if (valueType === 'shadow') {
        return (
            <span className="text-[11px] text-foreground/50 truncate" title={value}>
                {value.length > 24 ? value.slice(0, 24) + '...' : value}
            </span>
        )
    }

    // number
    return (
        <span className="text-[11px] font-mono text-foreground/70 tabular-nums">
            {value}
        </span>
    )
}

// ════════════════════════════════════════════════════════════
// Variable Row
// ════════════════════════════════════════════════════════════

function VariableRow({
    variableKey,
    table,
    onUpdate,
}: {
    variableKey: VariableKey
    table: VariableTable
    onUpdate: (key: string, mode: ThemeMode, value: string) => void
}) {
    const entry = table[variableKey]
    if (!entry) return null

    const displayName = getVariableDisplayName(variableKey)
    const valueType = getVariableValueType(variableKey)

    return (
        <div className="flex items-center h-8 px-3 hover:bg-muted/30 transition-colors border-b border-border/20 last:border-b-0">
            {/* Variable name */}
            <div className="w-[35%] min-w-0 pr-2">
                <span className="text-[11px] text-foreground/80 truncate block" title={variableKey}>
                    {displayName}
                </span>
            </div>

            {/* Light value */}
            <div className="w-[32.5%] min-w-0 pr-2">
                <ValueCell
                    variableKey={variableKey}
                    valueType={valueType}
                    value={entry.light}
                    mode="light"
                    onUpdate={onUpdate}
                />
            </div>

            {/* Dark value */}
            <div className="w-[32.5%] min-w-0">
                <ValueCell
                    variableKey={variableKey}
                    valueType={valueType}
                    value={entry.dark}
                    mode="dark"
                    onUpdate={onUpdate}
                />
            </div>
        </div>
    )
}

// ════════════════════════════════════════════════════════════
// Collection Content — variable table for a selected collection
// ════════════════════════════════════════════════════════════

function CollectionContent({
    collection,
    table,
    onUpdate,
}: {
    collection: VariableCollection
    table: VariableTable
    onUpdate: (key: string, mode: ThemeMode, value: string) => void
}) {
    return (
        <div className="flex-1 overflow-y-auto">
            {/* Column headers */}
            <div className="flex items-center h-7 px-3 bg-muted/20 border-b border-border/30 sticky top-0 z-10">
                <div className="w-[35%] min-w-0">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Name</span>
                </div>
                <div className="w-[32.5%] min-w-0">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" />
                            <path d="M5 2.5V5H7" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
                        </svg>
                        Light
                    </span>
                </div>
                <div className="w-[32.5%] min-w-0">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M5 1C5 1 2 3 2 5.5C2 7.433 3.567 9 5 9C6.433 9 8 7.433 8 5.5C8 3 5 1 5 1Z" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.3" />
                        </svg>
                        Dark
                    </span>
                </div>
            </div>

            {/* Groups + Rows */}
            {collection.groups.map((group) => (
                <div key={group.id}>
                    {/* Group header */}
                    {collection.groups.length > 1 && (
                        <div className="flex items-center h-6 px-3 bg-muted/10">
                            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                                {group.name}
                            </span>
                        </div>
                    )}
                    {/* Variable rows */}
                    {group.variableKeys.map((key) => (
                        <VariableRow
                            key={key}
                            variableKey={key}
                            table={table}
                            onUpdate={onUpdate}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

// ════════════════════════════════════════════════════════════
// Sidebar — collection list
// ════════════════════════════════════════════════════════════

function CollectionSidebar({
    collections,
    activeId,
    onSelect,
}: {
    collections: VariableCollection[]
    activeId: string
    onSelect: (id: string) => void
}) {
    return (
        <div className="flex flex-col border-r border-border/30 bg-muted/10" style={{ width: SIDEBAR_W }}>
            <div className="px-2 pt-2 pb-1">
                <span className="text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-widest px-1">
                    Collections
                </span>
            </div>
            {collections.map((c) => {
                const icon = COLLECTION_ICONS[c.id]
                const varCount = c.groups.reduce((n, g) => n + g.variableKeys.length, 0)
                const isActive = c.id === activeId

                return (
                    <button
                        key={c.id}
                        onClick={() => onSelect(c.id)}
                        className={cn(
                            'flex items-center gap-2 px-2.5 py-1.5 mx-1 rounded-md text-[11px] transition-colors',
                            isActive
                                ? 'bg-primary/10 text-foreground font-medium'
                                : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground',
                        )}
                    >
                        <span className={cn('shrink-0', isActive ? 'text-primary' : 'text-muted-foreground/50')}>
                            {icon}
                        </span>
                        <span className="flex-1 text-left truncate">{c.name}</span>
                        <span className={cn(
                            'text-[9px] tabular-nums shrink-0',
                            isActive ? 'text-primary/60' : 'text-muted-foreground/30',
                        )}>
                            {varCount}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}

// ════════════════════════════════════════════════════════════
// VariablesPanel — draggable overlay, portal to body
// ════════════════════════════════════════════════════════════

export function VariablesPanel() {
    const table = useStyleGuideStore(s => s.variableTable)
    const themeMode = useStyleGuideStore(s => s.themeMode)
    const updateVariableValue = useStyleGuideStore(s => s.updateVariableValue)
    const close = useEditorStore(s => s.closeVariablesPanel)

    const [activeCollectionId, setActiveCollectionId] = useState(STANDARD_COLLECTIONS[0].id)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const activeCollection = STANDARD_COLLECTIONS.find(c => c.id === activeCollectionId) ?? STANDARD_COLLECTIONS[0]

    const handleUpdate = useCallback((key: string, mode: ThemeMode, value: string) => {
        updateVariableValue(key, mode, value)
    }, [updateVariableValue])

    // ── Refs for dragging & resizing ──
    const overlayRef = useRef<HTMLDivElement>(null)
    const posRef = useRef({ left: 0, top: 0 })
    const sizeRef = useRef({ w: DEFAULT_W, h: DEFAULT_H })
    const dragOffsetRef = useRef({ x: 0, y: 0 })
    const isDraggingHeader = useRef(false)
    const dragStart = useRef({ pointerX: 0, pointerY: 0, offsetX: 0, offsetY: 0 })

    // ── Resize state ──
    const isResizing = useRef(false)
    const resizeStart = useRef({ pointerX: 0, pointerY: 0, w: 0, h: 0, left: 0, top: 0 })
    const resizeDir = useRef<string>('')

    // ── Center on mount ──
    useLayoutEffect(() => {
        if (!overlayRef.current) return
        const vw = window.innerWidth
        const vh = window.innerHeight
        const left = Math.round((vw - DEFAULT_W) / 2)
        const top = Math.round((vh - DEFAULT_H) / 2)
        posRef.current = { left, top }
        dragOffsetRef.current = { x: 0, y: 0 }
        overlayRef.current.style.left = `${left}px`
        overlayRef.current.style.top = `${top}px`
        overlayRef.current.style.width = `${DEFAULT_W}px`
        overlayRef.current.style.height = `${DEFAULT_H}px`
    }, [])

    // ── Close on Escape ──
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [close])

    // ── Drag handlers ──
    const handleHeaderPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button')) return
        if (isFullscreen) return
        e.preventDefault()
        e.stopPropagation()
        isDraggingHeader.current = true
        dragStart.current = {
            pointerX: e.clientX,
            pointerY: e.clientY,
            offsetX: dragOffsetRef.current.x,
            offsetY: dragOffsetRef.current.y,
        }
        ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
    }, [isFullscreen])

    const handleHeaderPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
        if (!isDraggingHeader.current) return
        if (e.buttons === 0) { isDraggingHeader.current = false; return }
        const newX = dragStart.current.offsetX + (e.clientX - dragStart.current.pointerX)
        const newY = dragStart.current.offsetY + (e.clientY - dragStart.current.pointerY)
        dragOffsetRef.current = { x: newX, y: newY }
        if (overlayRef.current) {
            overlayRef.current.style.left = `${posRef.current.left + newX}px`
            overlayRef.current.style.top = `${posRef.current.top + newY}px`
        }
    }, [])

    const handleHeaderPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
        if (!isDraggingHeader.current) return
        isDraggingHeader.current = false
        const el = e.currentTarget as HTMLDivElement
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
    }, [])

    // ── Resize handlers (edge/corner) ──
    const handleResizePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, dir: string) => {
        if (isFullscreen) return
        e.preventDefault()
        e.stopPropagation()
        isResizing.current = true
        resizeDir.current = dir
        const el = overlayRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        resizeStart.current = {
            pointerX: e.clientX,
            pointerY: e.clientY,
            w: rect.width,
            h: rect.height,
            left: rect.left,
            top: rect.top,
        }
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }, [isFullscreen])

    const handleResizePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!isResizing.current || !overlayRef.current) return
        const dx = e.clientX - resizeStart.current.pointerX
        const dy = e.clientY - resizeStart.current.pointerY
        const dir = resizeDir.current
        let newW = resizeStart.current.w
        let newH = resizeStart.current.h
        let newLeft = resizeStart.current.left
        let newTop = resizeStart.current.top

        if (dir.includes('e')) newW = Math.max(MIN_W, resizeStart.current.w + dx)
        if (dir.includes('w')) {
            newW = Math.max(MIN_W, resizeStart.current.w - dx)
            newLeft = resizeStart.current.left + (resizeStart.current.w - newW)
        }
        if (dir.includes('s')) newH = Math.max(MIN_H, resizeStart.current.h + dy)
        if (dir.includes('n')) {
            newH = Math.max(MIN_H, resizeStart.current.h - dy)
            newTop = resizeStart.current.top + (resizeStart.current.h - newH)
        }

        overlayRef.current.style.width = `${newW}px`
        overlayRef.current.style.height = `${newH}px`
        overlayRef.current.style.left = `${newLeft}px`
        overlayRef.current.style.top = `${newTop}px`
        sizeRef.current = { w: newW, h: newH }
        posRef.current = { left: newLeft, top: newTop }
        dragOffsetRef.current = { x: 0, y: 0 }
    }, [])

    const handleResizePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        isResizing.current = false
        ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    }, [])

    // ── Fullscreen toggle ──
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => {
            const el = overlayRef.current
            if (!el) return !prev
            if (!prev) {
                // Enter fullscreen — save position & fill viewport with padding
                el.style.left = '40px'
                el.style.top = '40px'
                el.style.width = `${window.innerWidth - 80}px`
                el.style.height = `${window.innerHeight - 80}px`
            } else {
                // Restore position
                el.style.left = `${posRef.current.left + dragOffsetRef.current.x}px`
                el.style.top = `${posRef.current.top + dragOffsetRef.current.y}px`
                el.style.width = `${sizeRef.current.w}px`
                el.style.height = `${sizeRef.current.h}px`
            }
            return !prev
        })
    }, [])

    // Resize handle component
    const ResizeHandle = useCallback(({ dir, className }: { dir: string; className: string }) => (
        <div
            className={cn('absolute z-10', className)}
            onPointerDown={(e) => handleResizePointerDown(e, dir)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
        />
    ), [handleResizePointerDown, handleResizePointerMove, handleResizePointerUp])

    const totalVars = STANDARD_COLLECTIONS.reduce(
        (n, c) => n + c.groups.reduce((m, g) => m + g.variableKeys.length, 0),
        0,
    )

    const overlay = (
        <div
            ref={overlayRef}
            className={cn(
                'fixed z-[9998] rounded-lg shadow-2xl',
                'bg-popover border border-border/60',
                'flex flex-col overflow-hidden',
                'select-none',
            )}
            style={{ left: 0, top: 0, width: DEFAULT_W, height: DEFAULT_H }}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* ── Header — draggable ── */}
            <div
                className="flex items-center gap-1.5 px-2 h-9 bg-muted/30 border-b border-border/40 cursor-move shrink-0"
                onPointerDown={handleHeaderPointerDown}
                onPointerMove={handleHeaderPointerMove}
                onPointerUp={handleHeaderPointerUp}
            >
                <span className="pl-0.5"><DragDotsIcon /></span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-primary/60 shrink-0">
                    <path d="M3 4H11M3 7H11M3 10H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span className="text-[12px] font-semibold text-foreground/90 flex-1">Local variables</span>
                <span className="text-[10px] text-muted-foreground/40 tabular-nums mr-1">
                    {totalVars} vars · {themeMode}
                </span>
                {/* Fullscreen toggle */}
                <button
                    className="w-6 h-6 flex items-center justify-center rounded-sm
                        text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Restore size' : 'Maximize'}
                >
                    {isFullscreen ? <RestoreIcon size={11} /> : <MaximizeIcon size={11} />}
                </button>
                {/* Close */}
                <button
                    className="w-6 h-6 flex items-center justify-center rounded-sm
                        text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors"
                    onClick={close}
                    title="Close"
                >
                    <CloseIcon size={11} />
                </button>
            </div>

            {/* ── Body: sidebar + table ── */}
            <div className="flex flex-1 overflow-hidden">
                <CollectionSidebar
                    collections={STANDARD_COLLECTIONS}
                    activeId={activeCollectionId}
                    onSelect={setActiveCollectionId}
                />
                <CollectionContent
                    collection={activeCollection}
                    table={table}
                    onUpdate={handleUpdate}
                />
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between px-3 h-6 bg-muted/20 border-t border-border/30 shrink-0">
                <span className="text-[9px] text-muted-foreground/40">
                    {activeCollection.name} · {activeCollection.groups.reduce((n, g) => n + g.variableKeys.length, 0)} variables
                </span>
                <span className="text-[9px] text-muted-foreground/30">
                    {STANDARD_COLLECTIONS.length} collections
                </span>
            </div>

            {/* ── Resize handles ── */}
            {!isFullscreen && (
                <>
                    <ResizeHandle dir="e" className="top-0 right-0 w-1.5 h-full cursor-e-resize" />
                    <ResizeHandle dir="w" className="top-0 left-0 w-1.5 h-full cursor-w-resize" />
                    <ResizeHandle dir="s" className="bottom-0 left-0 w-full h-1.5 cursor-s-resize" />
                    <ResizeHandle dir="n" className="top-0 left-0 w-full h-1.5 cursor-n-resize" />
                    <ResizeHandle dir="se" className="bottom-0 right-0 w-3 h-3 cursor-se-resize" />
                    <ResizeHandle dir="sw" className="bottom-0 left-0 w-3 h-3 cursor-sw-resize" />
                    <ResizeHandle dir="ne" className="top-0 right-0 w-3 h-3 cursor-ne-resize" />
                    <ResizeHandle dir="nw" className="top-0 left-0 w-3 h-3 cursor-nw-resize" />
                </>
            )}
        </div>
    )

    return createPortal(overlay, document.body)
}
