'use client'

/**
 * Variable Picker — popover for binding a variable to a node property.
 *
 * Opens when the user clicks a variable-bind button in the properties panel.
 * Shows variables scoped to the relevant property type, grouped by collection.
 *
 * Data source: useVariableStore (new Figma-clone variable system)
 *
 * Usage:
 *   <VariablePicker
 *     open={open}
 *     anchorEl={buttonRef.current}
 *     scope="ALL_FILLS"
 *     resolvedType="COLOR"
 *     currentVariableId={boundVariables?.fills?.[0]?.id}
 *     onBind={(variableId) => { ... }}
 *     onDetach={() => { ... }}
 *     onClose={() => setOpen(false)}
 *   />
 */

import { useRef, useEffect, useLayoutEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useVariableStore } from '@/store/variable-store'
import type {
    Variable,
    VariableScope,
    VariableResolvedDataType,
} from '@/lib/variables/types'
import { isColorValue } from '@/lib/variables/types'
import { resolveVariable, colorValueToHex } from '@/lib/variables/resolve'
import { Link2Off } from 'lucide-react'

// ════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════

interface VariablePickerProps {
    /** Whether the picker is visible */
    open: boolean
    /** The DOM element to anchor the popover to */
    anchorEl: HTMLElement | null
    /** Variable scope — determines which variables are shown */
    scope: VariableScope
    /** The resolved type to filter by */
    resolvedType: VariableResolvedDataType
    /** Currently bound variable ID (if any) */
    currentVariableId?: string
    /** Called when user selects a variable to bind */
    onBind: (variableId: string) => void
    /** Called when user detaches the variable */
    onDetach: () => void
    /** Called when the picker should close */
    onClose: () => void
}

// ════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════

function getDisplayName(name: string): string {
    const slashIdx = name.indexOf('/')
    return slashIdx > 0 ? name.slice(slashIdx + 1) : name
}

function getGroupName(name: string): string {
    const slashIdx = name.indexOf('/')
    return slashIdx > 0 ? name.slice(0, slashIdx) : ''
}

// ════════════════════════════════════════════════════════════
// Picker Item — single variable row
// ════════════════════════════════════════════════════════════

function PickerItem({
    variable,
    isActive,
    onClick,
}: {
    variable: Variable
    isActive: boolean
    onClick: () => void
}) {
    const variables = useVariableStore(s => s.variables)
    const collections = useVariableStore(s => s.collections)
    const activeModeId = useVariableStore(s => s.activeModeId)
    const collection = collections.get(variable.variableCollectionId)
    const modeId = activeModeId ?? collection?.defaultModeId ?? ''

    // Resolve current value for preview
    const resolved = resolveVariable(variable.id, modeId, variables, collections)
    const displayName = getDisplayName(variable.name)

    let preview: React.ReactNode = null
    if (variable.resolvedType === 'COLOR') {
        const hex = resolved && isColorValue(resolved)
            ? colorValueToHex(resolved)
            : (typeof resolved === 'string' ? resolved : '#000')
        preview = (
            <div
                className="w-4 h-4 rounded-[3px] border border-border/50 shrink-0
                    shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
                style={{ backgroundColor: hex }}
            />
        )
    } else if (variable.resolvedType === 'FLOAT') {
        preview = (
            <div className="w-4 h-4 rounded-[3px] bg-muted/50 border border-border/30 flex items-center justify-center shrink-0">
                <span className="text-[7px] text-muted-foreground/60 font-mono">#</span>
            </div>
        )
    } else if (variable.resolvedType === 'STRING') {
        preview = (
            <div className="w-4 h-4 rounded-[3px] bg-muted/50 border border-border/30 flex items-center justify-center shrink-0">
                <span className="text-[7px] text-muted-foreground/60 font-mono">Aa</span>
            </div>
        )
    } else {
        preview = (
            <div className="w-4 h-4 rounded-[3px] bg-muted/50 border border-border/30 flex items-center justify-center shrink-0">
                <span className="text-[7px] text-muted-foreground/60 font-mono">⊘</span>
            </div>
        )
    }

    // Format resolved value for display
    let valueStr = ''
    if (resolved != null) {
        if (isColorValue(resolved)) valueStr = colorValueToHex(resolved).slice(0, 7)
        else if (typeof resolved === 'number') valueStr = String(resolved)
        else if (typeof resolved === 'string') valueStr = resolved.length > 8 ? resolved.slice(0, 8) + '…' : resolved
        else if (typeof resolved === 'boolean') valueStr = resolved ? 'true' : 'false'
    }

    return (
        <button
            className={cn(
                'w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-sm transition-colors',
                isActive
                    ? 'bg-primary/10 text-foreground'
                    : 'hover:bg-muted/40 text-foreground/80',
            )}
            onClick={onClick}
        >
            {preview}
            <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium truncate">{displayName}</div>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0 max-w-[60px] truncate">
                {valueStr}
            </span>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
        </button>
    )
}

// ════════════════════════════════════════════════════════════
// Variable Picker
// ════════════════════════════════════════════════════════════

export function VariablePicker({
    open,
    anchorEl,
    scope,
    resolvedType,
    currentVariableId,
    onBind,
    onDetach,
    onClose,
}: VariablePickerProps) {
    const collections = useVariableStore(s => s.collections)
    const getVariablesForScope = useVariableStore(s => s.getVariablesForScope)
    const popoverRef = useRef<HTMLDivElement>(null)
    const [pos, setPos] = useState({ top: 0, left: 0 })
    const [search, setSearch] = useState('')

    // Get scoped variables
    const scopedVars = useMemo(() => {
        return getVariablesForScope(scope, resolvedType)
    }, [scope, resolvedType, getVariablesForScope])

    // Filter by search
    const filteredVars = useMemo(() => {
        if (!search.trim()) return scopedVars
        const q = search.toLowerCase()
        return scopedVars.filter(v => v.name.toLowerCase().includes(q))
    }, [scopedVars, search])

    // Group by collection
    const grouped = useMemo(() => {
        const map = new Map<string, Variable[]>()
        for (const v of filteredVars) {
            if (!map.has(v.variableCollectionId)) map.set(v.variableCollectionId, [])
            map.get(v.variableCollectionId)!.push(v)
        }
        return map
    }, [filteredVars])

    // Position the popover relative to anchor
    useLayoutEffect(() => {
        if (!open || !anchorEl) return
        const rect = anchorEl.getBoundingClientRect()
        const popoverWidth = 240
        const popoverHeight = 320

        let top = rect.bottom + 4
        let left = rect.left

        if (left + popoverWidth > window.innerWidth - 8) {
            left = window.innerWidth - popoverWidth - 8
        }
        if (top + popoverHeight > window.innerHeight - 8) {
            top = rect.top - popoverHeight - 4
        }

        setPos({ top, left })
    }, [open, anchorEl])

    // Close on outside click
    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node) &&
                anchorEl &&
                !anchorEl.contains(e.target as Node)
            ) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open, anchorEl, onClose])

    // Close on Escape
    useEffect(() => {
        if (!open) return
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, onClose])

    // Reset search when opening
    useEffect(() => {
        if (open) setSearch('')
    }, [open])

    if (!open) return null

    return createPortal(
        <div
            ref={popoverRef}
            className="fixed z-[200] w-[240px] max-h-[320px] overflow-hidden flex flex-col
                bg-popover border border-border/60 rounded-lg shadow-lg
                animate-in fade-in-0 zoom-in-95 duration-100"
            style={{ top: pos.top, left: pos.left }}
        >
            {/* Search */}
            <div className="px-2 py-1.5 border-b border-border/30 shrink-0">
                <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search variables..."
                    className="w-full h-6 px-2 text-[11px] bg-muted/30 border border-border/30 rounded
                        placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50"
                />
            </div>

            {/* Detach option */}
            {currentVariableId && (
                <button
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left
                        hover:bg-destructive/10 text-muted-foreground hover:text-destructive
                        transition-colors border-b border-border/20 shrink-0"
                    onClick={() => { onDetach(); onClose() }}
                >
                    <Link2Off size={12} />
                    <span className="text-[11px]">Detach variable</span>
                </button>
            )}

            {/* Variable list */}
            <div className="overflow-y-auto flex-1 p-1">
                {Array.from(grouped.entries()).map(([collId, vars]) => {
                    const coll = collections.get(collId)
                    return (
                        <div key={collId}>
                            {grouped.size > 1 && (
                                <div className="px-2 py-1 text-[9px] font-semibold text-muted-foreground/40 uppercase tracking-wider">
                                    {coll?.name ?? collId}
                                </div>
                            )}
                            {vars.map(v => (
                                <PickerItem
                                    key={v.id}
                                    variable={v}
                                    isActive={currentVariableId === v.id}
                                    onClick={() => { onBind(v.id); onClose() }}
                                />
                            ))}
                        </div>
                    )
                })}

                {filteredVars.length === 0 && (
                    <div className="px-3 py-4 text-center text-[11px] text-muted-foreground/40">
                        {search ? 'No matching variables' : 'No variables for this property type'}
                    </div>
                )}
            </div>
        </div>,
        document.body,
    )
}
