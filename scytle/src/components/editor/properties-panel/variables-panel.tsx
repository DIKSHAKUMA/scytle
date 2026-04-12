'use client'

/**
 * Variables Panel — Figma-clone table/spreadsheet UI for managing design variables.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────┐
 *   │  ⋮⋮  Local variables                      ⊡  ✕    │  ← draggable header
 *   ├─────────────────────────────────────────────────────┤
 *   │  Collections: [Dropdown ▾]   [+ New Collection]     │
 *   ├──────────────┬──────────┬──────────┬────────────────┤
 *   │ Variable     │ Light    │ Dark     │  [+ Mode]      │
 *   ├──────────────┼──────────┼──────────┼────────────────┤
 *   │ ▾ bg/        │          │          │                │
 *   │   primary    │ [■ #fff] │ [■ #000] │                │
 *   │   secondary  │ [■ #f5f] │ [■ #1a1] │                │
 *   │ ▾ text/      │          │          │                │
 *   │   primary    │ [■ #000] │ [■ #fff] │                │
 *   │ [+ Add variable]                                    │
 *   └─────────────────────────────────────────────────────┘
 *
 * Data source: useVariableStore (new Figma-clone variable system)
 */

import {
    useState,
    useRef,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    type PointerEvent as ReactPointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/store/editor-store'
import { useVariableStore } from '@/store/variable-store'
import type {
    Variable,
    VariableCollection,
    VariableResolvedDataType,
    VariableValue,
    ColorValue,
} from '@/lib/variables/types'
import { isVariableAlias, isColorValue } from '@/lib/variables/types'
import { resolveVariable, colorValueToHex, hexToColorValue } from '@/lib/variables/resolve'

// ════════════════════════════════════════════════════════════
// Constants
// ════════════════════════════════════════════════════════════

const DEFAULT_W = 700
const DEFAULT_H = 500
const MIN_W = 520
const MIN_H = 340
const NAME_COL_W = '35%'

// ════════════════════════════════════════════════════════════
// Icons — crisp inline SVGs
// ════════════════════════════════════════════════════════════

function DragDotsIcon() {
    return (
        <svg width="6" height="14" viewBox="0 0 6 14" fill="currentColor" className="text-muted-foreground/30">
            <circle cx="1.5" cy="2" r="1" /><circle cx="4.5" cy="2" r="1" />
            <circle cx="1.5" cy="5.5" r="1" /><circle cx="4.5" cy="5.5" r="1" />
            <circle cx="1.5" cy="9" r="1" /><circle cx="4.5" cy="9" r="1" />
            <circle cx="1.5" cy="12.5" r="1" /><circle cx="4.5" cy="12.5" r="1" />
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

function PlusIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 2v8M2 6h8" />
        </svg>
    )
}

function ChevronIcon({ open, size = 10 }: { open: boolean; size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" className={cn('transition-transform', open ? 'rotate-90' : '')}
        >
            <path d="M3.5 2L6.5 5L3.5 8" />
        </svg>
    )
}

function TrashIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <path d="M2 3h8M4.5 1.5h3M3 3v7a1 1 0 001 1h4a1 1 0 001-1V3" />
        </svg>
    )
}

// ════════════════════════════════════════════════════════════
// Group Variables by "/" prefix
// ════════════════════════════════════════════════════════════

interface VariableGroup {
    prefix: string
    variables: Variable[]
}

function groupVariables(vars: Variable[]): VariableGroup[] {
    const map = new Map<string, Variable[]>()
    const order: string[] = []

    for (const v of vars) {
        const slashIdx = v.name.indexOf('/')
        const prefix = slashIdx > 0 ? v.name.slice(0, slashIdx) : ''
        if (!map.has(prefix)) {
            map.set(prefix, [])
            order.push(prefix)
        }
        map.get(prefix)!.push(v)
    }

    return order.map(prefix => ({ prefix, variables: map.get(prefix)! }))
}

function getDisplayName(name: string): string {
    const slashIdx = name.indexOf('/')
    return slashIdx > 0 ? name.slice(slashIdx + 1) : name
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
                value={hex.slice(0, 7)}
                className="sr-only"
                onChange={(e) => onChange?.(e.target.value)}
            />
            <span className="text-[11px] font-mono text-foreground/70 uppercase truncate select-text">
                {hex.slice(0, 7)}
            </span>
        </div>
    )
}

// ════════════════════════════════════════════════════════════
// Alias Pill — shows alias target variable name
// ════════════════════════════════════════════════════════════

function AliasPill({ targetId }: { targetId: string }) {
    const variables = useVariableStore(s => s.variables)
    const target = variables.get(targetId)
    return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium truncate max-w-full">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor" opacity="0.6">
                <path d="M1 4h6M5 2l2 2-2 2" />
            </svg>
            {target ? getDisplayName(target.name) : targetId}
        </span>
    )
}

// ════════════════════════════════════════════════════════════
// Value Cell — renders appropriate editor per variable type
// ════════════════════════════════════════════════════════════

function ValueCell({
    variable,
    modeId,
}: {
    variable: Variable
    modeId: string
}) {
    const collections = useVariableStore(s => s.collections)
    const variables = useVariableStore(s => s.variables)
    const setValueForMode = useVariableStore(s => s.setValueForMode)

    const rawValue = variable.valuesByMode[modeId]

    // Check if it's an alias
    if (rawValue && isVariableAlias(rawValue)) {
        return <AliasPill targetId={rawValue.id} />
    }

    // Resolve to display value
    const resolved = resolveVariable(variable.id, modeId, variables, collections)

    if (variable.resolvedType === 'COLOR') {
        const hex = resolved && isColorValue(resolved) ? colorValueToHex(resolved) : (typeof resolved === 'string' ? resolved : '#000000')
        return (
            <ColorSwatch
                color={hex}
                onChange={(c) => {
                    setValueForMode(variable.id, modeId, hexToColorValue(c))
                }}
            />
        )
    }

    if (variable.resolvedType === 'FLOAT') {
        const numVal = typeof resolved === 'number' ? resolved : 0
        return (
            <input
                type="number"
                value={numVal}
                onChange={(e) => {
                    const val = parseFloat(e.target.value)
                    if (!isNaN(val)) setValueForMode(variable.id, modeId, val)
                }}
                className="w-16 h-6 px-1.5 text-[11px] font-mono bg-transparent border border-border/30 rounded
                    text-foreground/70 tabular-nums focus:border-primary/50 focus:outline-none"
            />
        )
    }

    if (variable.resolvedType === 'STRING') {
        const strVal = typeof resolved === 'string' ? resolved : ''
        return (
            <input
                type="text"
                value={strVal}
                onChange={(e) => setValueForMode(variable.id, modeId, e.target.value)}
                className="w-full h-6 px-1.5 text-[11px] bg-transparent border border-border/30 rounded
                    text-foreground/70 truncate focus:border-primary/50 focus:outline-none"
            />
        )
    }

    if (variable.resolvedType === 'BOOLEAN') {
        const boolVal = typeof resolved === 'boolean' ? resolved : false
        return (
            <button
                onClick={() => setValueForMode(variable.id, modeId, !boolVal)}
                className={cn(
                    'w-8 h-5 rounded-full relative transition-colors',
                    boolVal ? 'bg-primary' : 'bg-muted-foreground/20',
                )}
            >
                <div className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform',
                    boolVal ? 'left-3.5' : 'left-0.5',
                )} />
            </button>
        )
    }

    return <span className="text-[11px] text-muted-foreground/50">—</span>
}

// ════════════════════════════════════════════════════════════
// Variable Row — single variable across all modes
// ════════════════════════════════════════════════════════════

function VariableRow({
    variable,
    modes,
    onDelete,
}: {
    variable: Variable
    modes: { modeId: string; name: string }[]
    onDelete: (id: string) => void
}) {
    const displayName = getDisplayName(variable.name)
    const modeWidth = modes.length > 0 ? `${(65 / modes.length).toFixed(1)}%` : '65%'

    return (
        <div className="flex items-center h-8 px-3 hover:bg-muted/30 transition-colors border-b border-border/10 group">
            {/* Variable name */}
            <div className="min-w-0 pr-2 flex items-center gap-1" style={{ width: NAME_COL_W }}>
                <span className="text-[11px] text-foreground/80 truncate" title={variable.name}>
                    {displayName}
                </span>
                <span className="text-[9px] text-muted-foreground/30 shrink-0 uppercase">
                    {variable.resolvedType === 'COLOR' ? '' :
                     variable.resolvedType === 'FLOAT' ? '#' :
                     variable.resolvedType === 'STRING' ? 'Aa' :
                     variable.resolvedType === 'BOOLEAN' ? '⊘' : ''}
                </span>
            </div>

            {/* Value cells per mode */}
            {modes.map((mode) => (
                <div key={mode.modeId} className="min-w-0 pr-2" style={{ width: modeWidth }}>
                    <ValueCell variable={variable} modeId={mode.modeId} />
                </div>
            ))}

            {/* Delete button (shows on hover) */}
            <button
                onClick={() => onDelete(variable.id)}
                className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center
                    text-muted-foreground/30 hover:text-destructive transition-all shrink-0"
                title="Delete variable"
            >
                <TrashIcon size={10} />
            </button>
        </div>
    )
}

// ════════════════════════════════════════════════════════════
// Variable Group — collapsible group of variables
// ════════════════════════════════════════════════════════════

function VariableGroupSection({
    group,
    modes,
    onDelete,
}: {
    group: VariableGroup
    modes: { modeId: string; name: string }[]
    onDelete: (id: string) => void
}) {
    const [open, setOpen] = useState(true)

    if (!group.prefix) {
        // Ungrouped variables — render directly
        return (
            <>
                {group.variables.map(v => (
                    <VariableRow key={v.id} variable={v} modes={modes} onDelete={onDelete} />
                ))}
            </>
        )
    }

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 h-6 px-3 w-full hover:bg-muted/20 transition-colors"
            >
                <ChevronIcon open={open} size={8} />
                <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                    {group.prefix}
                </span>
                <span className="text-[9px] text-muted-foreground/30 ml-1">
                    {group.variables.length}
                </span>
            </button>
            {open && group.variables.map(v => (
                <VariableRow key={v.id} variable={v} modes={modes} onDelete={onDelete} />
            ))}
        </div>
    )
}

// ════════════════════════════════════════════════════════════
// Mode Header — editable mode name column
// ════════════════════════════════════════════════════════════

function ModeHeader({
    mode,
    collectionId,
    width,
}: {
    mode: { modeId: string; name: string }
    collectionId: string
    width: string
}) {
    const renameMode = useVariableStore(s => s.renameMode)
    const deleteMode = useVariableStore(s => s.deleteMode)
    const [editing, setEditing] = useState(false)
    const [name, setName] = useState(mode.name)

    const handleFinish = () => {
        setEditing(false)
        if (name.trim() && name !== mode.name) {
            renameMode(collectionId, mode.modeId, name.trim())
        } else {
            setName(mode.name)
        }
    }

    return (
        <div className="min-w-0 pr-2 group/mode" style={{ width }}>
            {editing ? (
                <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleFinish}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleFinish(); if (e.key === 'Escape') { setName(mode.name); setEditing(false) } }}
                    className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider
                        bg-transparent border-b border-primary/50 outline-none w-full"
                />
            ) : (
                <div className="flex items-center gap-1">
                    <span
                        className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground"
                        onDoubleClick={() => setEditing(true)}
                    >
                        {mode.name}
                    </span>
                    <button
                        onClick={() => deleteMode(collectionId, mode.modeId)}
                        className="opacity-0 group-hover/mode:opacity-100 text-muted-foreground/30 hover:text-destructive transition-all"
                        title="Delete mode"
                    >
                        <CloseIcon size={8} />
                    </button>
                </div>
            )}
        </div>
    )
}

// ════════════════════════════════════════════════════════════
// Add Variable Row
// ════════════════════════════════════════════════════════════

function AddVariableRow({ collectionId }: { collectionId: string }) {
    const createVariable = useVariableStore(s => s.createVariable)
    const [adding, setAdding] = useState(false)
    const [name, setName] = useState('')
    const [type, setType] = useState<VariableResolvedDataType>('COLOR')

    const handleAdd = () => {
        if (name.trim()) {
            createVariable(name.trim(), collectionId, type)
            setName('')
            setAdding(false)
        }
    }

    if (!adding) {
        return (
            <button
                onClick={() => setAdding(true)}
                className="flex items-center gap-1.5 h-7 px-3 w-full text-muted-foreground/50
                    hover:text-foreground hover:bg-muted/20 transition-colors"
            >
                <PlusIcon size={10} />
                <span className="text-[10px]">Add variable</span>
            </button>
        )
    }

    return (
        <div className="flex items-center gap-2 h-8 px-3 bg-muted/20">
            <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
                placeholder="Variable name (e.g. bg/primary)"
                className="flex-1 h-6 px-1.5 text-[11px] bg-background border border-border/40 rounded
                    focus:border-primary/50 focus:outline-none placeholder:text-muted-foreground/30"
            />
            <select
                value={type}
                onChange={(e) => setType(e.target.value as VariableResolvedDataType)}
                className="h-6 px-1 text-[10px] bg-background border border-border/40 rounded
                    text-foreground/70 focus:outline-none"
            >
                <option value="COLOR">Color</option>
                <option value="FLOAT">Number</option>
                <option value="STRING">String</option>
                <option value="BOOLEAN">Boolean</option>
            </select>
            <button onClick={handleAdd} className="text-[10px] text-primary hover:underline">Add</button>
            <button onClick={() => setAdding(false)} className="text-[10px] text-muted-foreground/50 hover:text-foreground">Cancel</button>
        </div>
    )
}

// ════════════════════════════════════════════════════════════
// Collection Content — the main table
// ════════════════════════════════════════════════════════════

function CollectionContent({ collection }: { collection: VariableCollection }) {
    const variables = useVariableStore(s => s.variables)
    const deleteVariable = useVariableStore(s => s.deleteVariable)
    const addMode = useVariableStore(s => s.addMode)

    // Get variables for this collection
    const collectionVars = useMemo(() => {
        return collection.variableIds
            .map(id => variables.get(id))
            .filter((v): v is Variable => v != null)
    }, [collection.variableIds, variables])

    // Group by "/" prefix
    const groups = useMemo(() => groupVariables(collectionVars), [collectionVars])

    const modes = collection.modes
    const modeWidth = modes.length > 0 ? `${(65 / modes.length).toFixed(1)}%` : '65%'

    const handleAddMode = () => {
        const name = `Mode ${modes.length + 1}`
        addMode(collection.id, name)
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {/* Column headers */}
            <div className="flex items-center h-7 px-3 bg-muted/20 border-b border-border/30 sticky top-0 z-10">
                <div className="min-w-0" style={{ width: NAME_COL_W }}>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Variable
                    </span>
                </div>
                {modes.map(mode => (
                    <ModeHeader
                        key={mode.modeId}
                        mode={mode}
                        collectionId={collection.id}
                        width={modeWidth}
                    />
                ))}
                {/* Add mode button */}
                <button
                    onClick={handleAddMode}
                    className="w-5 h-5 flex items-center justify-center rounded
                        text-muted-foreground/30 hover:text-foreground hover:bg-muted/40 transition-colors shrink-0"
                    title="Add mode"
                >
                    <PlusIcon size={9} />
                </button>
            </div>

            {/* Groups + Rows */}
            {groups.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-[11px] text-muted-foreground/40">
                    No variables yet
                </div>
            ) : (
                groups.map((group, i) => (
                    <VariableGroupSection
                        key={group.prefix || `ungrouped-${i}`}
                        group={group}
                        modes={modes}
                        onDelete={deleteVariable}
                    />
                ))
            )}

            {/* Add variable */}
            <AddVariableRow collectionId={collection.id} />
        </div>
    )
}

// ════════════════════════════════════════════════════════════
// Collection Selector — dropdown at top
// ════════════════════════════════════════════════════════════

function CollectionSelector() {
    const collections = useVariableStore(s => s.collections)
    const activeCollectionId = useVariableStore(s => s.activeCollectionId)
    const setActiveCollectionId = useVariableStore(s => s.setActiveCollectionId)
    const createCollection = useVariableStore(s => s.createCollection)
    const deleteCollection = useVariableStore(s => s.deleteCollection)

    const collectionList = useMemo(() => Array.from(collections.values()), [collections])

    const handleCreate = () => {
        const name = `Collection ${collectionList.length + 1}`
        const col = createCollection(name)
        setActiveCollectionId(col.id)
    }

    return (
        <div className="flex items-center gap-2 px-3 h-8 border-b border-border/30 bg-muted/10 shrink-0">
            <span className="text-[10px] text-muted-foreground/50 shrink-0">Collection:</span>
            <select
                value={activeCollectionId ?? ''}
                onChange={(e) => setActiveCollectionId(e.target.value || null)}
                className="flex-1 h-6 px-1.5 text-[11px] bg-background border border-border/30 rounded
                    text-foreground/80 focus:outline-none focus:border-primary/50 min-w-0"
            >
                {collectionList.length === 0 && <option value="">No collections</option>}
                {collectionList.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.variableIds.length})</option>
                ))}
            </select>
            <button
                onClick={handleCreate}
                className="flex items-center gap-1 px-1.5 h-6 rounded text-[10px]
                    text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-colors shrink-0"
                title="New collection"
            >
                <PlusIcon size={9} />
                <span className="hidden sm:inline">New</span>
            </button>
            {activeCollectionId && (
                <button
                    onClick={() => {
                        deleteCollection(activeCollectionId)
                        const remaining = Array.from(collections.values()).filter(c => c.id !== activeCollectionId)
                        setActiveCollectionId(remaining[0]?.id ?? null)
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded
                        text-muted-foreground/30 hover:text-destructive transition-colors shrink-0"
                    title="Delete collection"
                >
                    <TrashIcon size={10} />
                </button>
            )}
        </div>
    )
}

// ════════════════════════════════════════════════════════════
// VariablesPanel — main component (draggable, resizable, portal)
// ════════════════════════════════════════════════════════════

export function VariablesPanel() {
    const close = useEditorStore(s => s.closeVariablesPanel)

    const collections = useVariableStore(s => s.collections)
    const variables = useVariableStore(s => s.variables)
    const activeCollectionId = useVariableStore(s => s.activeCollectionId)
    const setActiveCollectionId = useVariableStore(s => s.setActiveCollectionId)

    const [isFullscreen, setIsFullscreen] = useState(false)

    // Auto-select first collection if none selected
    useEffect(() => {
        if (!activeCollectionId && collections.size > 0) {
            const first = collections.values().next().value
            if (first) setActiveCollectionId(first.id)
        }
    }, [activeCollectionId, collections, setActiveCollectionId])

    const activeCollection = activeCollectionId ? collections.get(activeCollectionId) : undefined

    const totalVars = variables.size

    // ── Refs for dragging & resizing ──
    const overlayRef = useRef<HTMLDivElement>(null)
    const posRef = useRef({ left: 0, top: 0 })
    const sizeRef = useRef({ w: DEFAULT_W, h: DEFAULT_H })
    const dragOffsetRef = useRef({ x: 0, y: 0 })
    const isDraggingHeader = useRef(false)
    const dragStart = useRef({ pointerX: 0, pointerY: 0, offsetX: 0, offsetY: 0 })
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
        e.preventDefault(); e.stopPropagation()
        isDraggingHeader.current = true
        dragStart.current = { pointerX: e.clientX, pointerY: e.clientY, offsetX: dragOffsetRef.current.x, offsetY: dragOffsetRef.current.y }
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

    // ── Resize handlers ──
    const handleResizePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, dir: string) => {
        if (isFullscreen) return
        e.preventDefault(); e.stopPropagation()
        isResizing.current = true
        resizeDir.current = dir
        const el = overlayRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        resizeStart.current = { pointerX: e.clientX, pointerY: e.clientY, w: rect.width, h: rect.height, left: rect.left, top: rect.top }
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }, [isFullscreen])

    const handleResizePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (!isResizing.current || !overlayRef.current) return
        const dx = e.clientX - resizeStart.current.pointerX
        const dy = e.clientY - resizeStart.current.pointerY
        const dir = resizeDir.current
        let newW = resizeStart.current.w, newH = resizeStart.current.h
        let newLeft = resizeStart.current.left, newTop = resizeStart.current.top
        if (dir.includes('e')) newW = Math.max(MIN_W, resizeStart.current.w + dx)
        if (dir.includes('w')) { newW = Math.max(MIN_W, resizeStart.current.w - dx); newLeft = resizeStart.current.left + (resizeStart.current.w - newW) }
        if (dir.includes('s')) newH = Math.max(MIN_H, resizeStart.current.h + dy)
        if (dir.includes('n')) { newH = Math.max(MIN_H, resizeStart.current.h - dy); newTop = resizeStart.current.top + (resizeStart.current.h - newH) }
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

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => {
            const el = overlayRef.current
            if (!el) return !prev
            if (!prev) {
                el.style.left = '40px'; el.style.top = '40px'
                el.style.width = `${window.innerWidth - 80}px`; el.style.height = `${window.innerHeight - 80}px`
            } else {
                el.style.left = `${posRef.current.left + dragOffsetRef.current.x}px`
                el.style.top = `${posRef.current.top + dragOffsetRef.current.y}px`
                el.style.width = `${sizeRef.current.w}px`; el.style.height = `${sizeRef.current.h}px`
            }
            return !prev
        })
    }, [])

    const ResizeHandle = useCallback(({ dir, className }: { dir: string; className: string }) => (
        <div className={cn('absolute z-10', className)}
            onPointerDown={(e) => handleResizePointerDown(e, dir)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
        />
    ), [handleResizePointerDown, handleResizePointerMove, handleResizePointerUp])

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
                    {totalVars} vars · {collections.size} collections
                </span>
                <button
                    className="w-6 h-6 flex items-center justify-center rounded-sm
                        text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Restore size' : 'Maximize'}
                >
                    {isFullscreen ? <RestoreIcon size={11} /> : <MaximizeIcon size={11} />}
                </button>
                <button
                    className="w-6 h-6 flex items-center justify-center rounded-sm
                        text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors"
                    onClick={close} title="Close"
                >
                    <CloseIcon size={11} />
                </button>
            </div>

            {/* ── Collection selector ── */}
            <CollectionSelector />

            {/* ── Body: variable table ── */}
            <div className="flex flex-1 overflow-hidden">
                {activeCollection ? (
                    <CollectionContent collection={activeCollection} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-[12px] text-muted-foreground/40">
                        <div className="text-center">
                            <p>No collections</p>
                            <p className="text-[10px] mt-1">Create a collection to get started</p>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between px-3 h-6 bg-muted/20 border-t border-border/30 shrink-0">
                <span className="text-[9px] text-muted-foreground/40">
                    {activeCollection ? `${activeCollection.name} · ${activeCollection.variableIds.length} variables · ${activeCollection.modes.length} modes` : 'No collection selected'}
                </span>
                <span className="text-[9px] text-muted-foreground/30">
                    {collections.size} collections
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
