'use client'

/**
 * Variable Picker — popover for binding a theme variable to a node property.
 *
 * Opens when the user clicks a ThemeLinkBadge or a variable-bind button.
 * Shows variables scoped to the relevant property type (e.g. fill colors, font sizes).
 *
 * Usage:
 *   <VariablePicker
 *     open={open}
 *     anchorEl={buttonRef.current}
 *     scope="fill.color"
 *     currentRef={node.colorRef}
 *     onBind={(variableKey) => onUpdate({ colorRef: variableKey, detached: false })}
 *     onDetach={() => onUpdate({ colorRef: undefined, detached: true })}
 *     onClose={() => setOpen(false)}
 *   />
 */

import { useRef, useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useStyleGuideStore } from '@/store'
import {
    getScopedVariables,
    getVariableDisplayName,
    getVariableValueType,
    getCollectionForKey,
    type VariableKey,
    type VariableTable,
    type ThemeMode,
} from '@/lib/theme/variable-table'
import { Link2Off } from 'lucide-react'

// ════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════

interface VariablePickerProps {
    /** Whether the picker is visible */
    open: boolean
    /** The DOM element to anchor the popover to */
    anchorEl: HTMLElement | null
    /** Property scope — determines which variables are shown */
    scope: string
    /** Currently bound variable key (if any) */
    currentRef?: string
    /** Called when user selects a variable to bind */
    onBind: (variableKey: string) => void
    /** Called when user detaches the variable */
    onDetach: () => void
    /** Called when the picker should close */
    onClose: () => void
}

// ════════════════════════════════════════════════════════════
// Picker Item — single variable row
// ════════════════════════════════════════════════════════════

function PickerItem({
    variableKey,
    table,
    mode,
    isActive,
    onClick,
}: {
    variableKey: VariableKey
    table: VariableTable
    mode: ThemeMode
    isActive: boolean
    onClick: () => void
}) {
    const entry = table[variableKey]
    if (!entry) return null

    const valueType = getVariableValueType(variableKey)
    const displayName = getVariableDisplayName(variableKey)
    const value = entry[mode]
    const location = getCollectionForKey(variableKey)

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
            {/* Value preview */}
            {valueType === 'color' ? (
                <div
                    className="w-4 h-4 rounded-[3px] border border-border/50 shrink-0
                        shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
                    style={{ backgroundColor: value }}
                />
            ) : (
                <div className="w-4 h-4 rounded-[3px] bg-muted/50 border border-border/30 flex items-center justify-center shrink-0">
                    <span className="text-[7px] text-muted-foreground/60 font-mono">
                        {valueType === 'font' ? 'Aa' : valueType === 'number' ? '#' : '~'}
                    </span>
                </div>
            )}

            {/* Name + collection label */}
            <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium truncate">{displayName}</div>
                {location && (
                    <div className="text-[9px] text-muted-foreground/50 truncate">
                        {location.collection} / {location.group}
                    </div>
                )}
            </div>

            {/* Current value */}
            <span className="text-[10px] font-mono text-muted-foreground/50 shrink-0 max-w-[60px] truncate">
                {valueType === 'color' ? value : value.length > 8 ? value.slice(0, 8) + '...' : value}
            </span>

            {/* Active indicator */}
            {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            )}
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
    currentRef,
    onBind,
    onDetach,
    onClose,
}: VariablePickerProps) {
    const table = useStyleGuideStore(s => s.variableTable)
    const mode = useStyleGuideStore(s => s.themeMode)
    const popoverRef = useRef<HTMLDivElement>(null)
    const [pos, setPos] = useState({ top: 0, left: 0 })

    // Position the popover relative to anchor
    useLayoutEffect(() => {
        if (!open || !anchorEl) return
        const rect = anchorEl.getBoundingClientRect()
        const popoverWidth = 220
        const popoverHeight = 300

        let top = rect.bottom + 4
        let left = rect.left

        // Keep within viewport
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
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open) return null

    const scopedKeys = getScopedVariables(scope)

    return createPortal(
        <div
            ref={popoverRef}
            className="fixed z-[200] w-[220px] max-h-[300px] overflow-y-auto
                bg-popover border border-border/60 rounded-lg shadow-lg
                animate-in fade-in-0 zoom-in-95 duration-100"
            style={{ top: pos.top, left: pos.left }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-2.5 h-7 border-b border-border/30 shrink-0">
                <span className="text-[10px] font-medium text-muted-foreground">Variables</span>
                <span className="text-[9px] text-muted-foreground/40">{mode}</span>
            </div>

            {/* Detach option (when currently bound) */}
            {currentRef && (
                <button
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left
                        hover:bg-destructive/10 text-muted-foreground hover:text-destructive
                        transition-colors border-b border-border/20"
                    onClick={() => {
                        onDetach()
                        onClose()
                    }}
                >
                    <Link2Off size={12} />
                    <span className="text-[11px]">Detach variable</span>
                </button>
            )}

            {/* Variable list */}
            <div className="p-1">
                {scopedKeys.map((key) => (
                    <PickerItem
                        key={key}
                        variableKey={key}
                        table={table}
                        mode={mode}
                        isActive={currentRef === key}
                        onClick={() => {
                            onBind(key)
                            onClose()
                        }}
                    />
                ))}
            </div>

            {scopedKeys.length === 0 && (
                <div className="px-3 py-4 text-center text-[11px] text-muted-foreground/40">
                    No variables for this property type
                </div>
            )}
        </div>,
        document.body,
    )
}
