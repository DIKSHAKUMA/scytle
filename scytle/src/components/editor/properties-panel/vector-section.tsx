'use client'

import { useCallback } from 'react'
import { useEditorStore } from '@/store/editor-store'
import type { VectorNode, HandleMirroring, StrokeCap, StrokeJoin } from '@/types/canvas'
import { NumberInput, SelectInput, ColorInput } from './inputs'
import { cn } from '@/lib/utils'
import { Plus, Minus } from 'lucide-react'

interface VectorSectionProps {
    node: VectorNode
    onUpdate: (updates: Record<string, unknown>) => void
}

/* ── Mirroring icons (Figma-style) ─────────────────────────── */

function MirrorNoneIcon({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
            <path d="M3 11 L7 3 L11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function MirrorAngleIcon({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
            <path d="M2 10 Q7 2 12 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            <line x1="4" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" />
        </svg>
    )
}

function MirrorSymmetricIcon({ size = 14 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
            <path d="M2 10 Q7 2 12 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            <circle cx="7" cy="4" r="1.5" fill="currentColor" />
        </svg>
    )
}

const MIRRORING_OPTIONS: { value: HandleMirroring; label: string; icon: React.ReactNode }[] = [
    { value: 'NONE', label: 'No mirroring', icon: <MirrorNoneIcon /> },
    { value: 'ANGLE', label: 'Angle mirroring', icon: <MirrorAngleIcon /> },
    { value: 'ANGLE_AND_LENGTH', label: 'Symmetric', icon: <MirrorSymmetricIcon /> },
]

const CAP_OPTIONS: { value: StrokeCap; label: string }[] = [
    { value: 'NONE', label: 'None' },
    { value: 'ROUND', label: 'Round' },
    { value: 'SQUARE', label: 'Square' },
]

const JOIN_OPTIONS: { value: StrokeJoin; label: string }[] = [
    { value: 'MITER', label: 'Miter' },
    { value: 'BEVEL', label: 'Bevel' },
    { value: 'ROUND', label: 'Round' },
]

const ALIGN_OPTIONS: { value: string; label: string }[] = [
    { value: 'CENTER', label: 'Center' },
    { value: 'INSIDE', label: 'Inside' },
    { value: 'OUTSIDE', label: 'Outside' },
]

/**
 * VectorSection — Clean Figma-style properties for VectorNode:
 *  - X/Y position (node-level, always shown)
 *  - Handle mirroring (3 icons)
 *  - Corner radius (per-vertex in edit mode)
 *  - Fill (color + opacity)
 *  - Stroke (color + weight + align + cap + join)
 */
export function VectorSection({ node, onUpdate }: VectorSectionProps) {
    const vectorEditNodeId = useEditorStore((s) => s.vectorEditNodeId)
    const selectedVertexIndices = useEditorStore((s) => s.selectedVertexIndices)
    const updateVertex = useEditorStore((s) => s.updateVertex)

    const inEditMode = vectorEditNodeId === node.id
    const singleVertex = inEditMode && selectedVertexIndices.length === 1
        ? node.vectorNetwork.vertices[selectedVertexIndices[0]]
        : null
    const singleVertexIdx = singleVertex ? selectedVertexIndices[0] : -1

    // Mirroring: per-vertex override when selected, otherwise node-level
    const activeMirroring = singleVertex?.handleMirroring ?? node.handleMirroring
    const setMirroring = useCallback(
        (m: HandleMirroring) => {
            if (singleVertex && vectorEditNodeId) {
                updateVertex(vectorEditNodeId, singleVertexIdx, { handleMirroring: m })
            } else {
                onUpdate({ handleMirroring: m })
            }
        },
        [onUpdate, singleVertex, singleVertexIdx, vectorEditNodeId, updateVertex],
    )

    // Corner radius (per-vertex)
    const activeCornerRadius = singleVertex?.cornerRadius ?? 0
    const handleCornerRadius = useCallback(
        (v: number) => {
            if (vectorEditNodeId && singleVertexIdx >= 0) {
                updateVertex(vectorEditNodeId, singleVertexIdx, { cornerRadius: v })
            }
        },
        [vectorEditNodeId, singleVertexIdx, updateVertex],
    )

    // Fill helpers
    const hasFill = node.fills.length > 0 && node.fills[0]?.visible !== false
    const fillColor = node.fills[0]?.type === 'solid' ? node.fills[0].color : '#000000'
    const fillOpacity = node.fills[0]?.opacity ?? 1

    const toggleFill = useCallback(() => {
        if (hasFill) {
            onUpdate({ fills: [] })
        } else {
            onUpdate({
                fills: [{ type: 'solid', color: '#000000', opacity: 1, visible: true }],
            })
        }
    }, [hasFill, onUpdate])

    const setFillColor = useCallback(
        (color: string) => {
            const fills = [...node.fills]
            if (fills.length === 0) {
                fills.push({ type: 'solid', color, opacity: 1, visible: true })
            } else {
                fills[0] = { ...fills[0], color, type: 'solid' }
            }
            onUpdate({ fills })
        },
        [node.fills, onUpdate],
    )

    const setFillOpacity = useCallback(
        (pct: number) => {
            const fills = [...node.fills]
            if (fills.length > 0) {
                fills[0] = { ...fills[0], opacity: pct / 100 }
            }
            onUpdate({ fills })
        },
        [node.fills, onUpdate],
    )

    // Stroke toggle
    const toggleStroke = useCallback(() => {
        onUpdate({ strokeVisible: !node.strokeVisible })
    }, [node.strokeVisible, onUpdate])

    return (
        <div className="border-b border-border/40">
            {/* ── X/Y Position ── */}
            <div className="px-3 py-2">
                <div className="grid grid-cols-2 gap-2">
                    <NumberInput
                        label="X"
                        value={Math.round(node.x * 100) / 100}
                        step={1}
                        onChange={(v) => onUpdate({ x: v })}
                    />
                    <NumberInput
                        label="Y"
                        value={Math.round(node.y * 100) / 100}
                        step={1}
                        onChange={(v) => onUpdate({ y: v })}
                    />
                </div>
            </div>

            {/* ── Mirroring (3 icons) ── */}
            <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-muted-foreground/70">Mirroring</span>
                </div>
                <div className="flex items-center gap-0.5 bg-muted/30 rounded-md p-0.5">
                    {MIRRORING_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            title={opt.label}
                            className={cn(
                                'flex-1 flex items-center justify-center h-7 rounded-[5px] transition-colors',
                                activeMirroring === opt.value
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground/60 hover:text-muted-foreground',
                            )}
                            onClick={() => setMirroring(opt.value)}
                        >
                            {opt.icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Corner radius (only in edit mode with vertex selected) ── */}
            {inEditMode && singleVertex && (
                <div className="px-3 py-2">
                    <NumberInput
                        label="Corner radius"
                        value={activeCornerRadius}
                        min={0}
                        max={1000}
                        step={1}
                        onChange={handleCornerRadius}
                    />
                </div>
            )}

            {/* ── Fill ── */}
            <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-muted-foreground/70">Fill</span>
                    <button
                        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        onClick={toggleFill}
                        title={hasFill ? 'Remove fill' : 'Add fill'}
                    >
                        {hasFill ? <Minus size={12} /> : <Plus size={12} />}
                    </button>
                </div>
                {hasFill && (
                    <ColorInput
                        value={fillColor}
                        onChange={setFillColor}
                        opacity={Math.round(fillOpacity * 100)}
                        onOpacityChange={setFillOpacity}
                    />
                )}
            </div>

            {/* ── Stroke ── */}
            <div className="px-3 py-2 space-y-2">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] text-muted-foreground/70">Stroke</span>
                    <button
                        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        onClick={toggleStroke}
                        title={node.strokeVisible ? 'Remove stroke' : 'Add stroke'}
                    >
                        {node.strokeVisible ? <Minus size={12} /> : <Plus size={12} />}
                    </button>
                </div>
                {node.strokeVisible && (
                    <>
                        <ColorInput
                            value={node.strokeColor}
                            onChange={(c) => onUpdate({ strokeColor: c })}
                            opacity={Math.round(node.strokeOpacity * 100)}
                            onOpacityChange={(pct) => onUpdate({ strokeOpacity: pct / 100 })}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <NumberInput
                                label="Weight"
                                value={node.strokeWeight}
                                min={0}
                                max={100}
                                step={0.5}
                                onChange={(v) => onUpdate({ strokeWeight: v })}
                            />
                            <SelectInput
                                label="Align"
                                value={node.strokeAlign}
                                options={ALIGN_OPTIONS}
                                onChange={(v) => onUpdate({ strokeAlign: v })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <SelectInput
                                label="Cap"
                                value={node.strokeCap}
                                options={CAP_OPTIONS}
                                onChange={(v) => onUpdate({ strokeCap: v })}
                            />
                            <SelectInput
                                label="Join"
                                value={node.strokeJoin}
                                options={JOIN_OPTIONS}
                                onChange={(v) => onUpdate({ strokeJoin: v })}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
