'use client'

import { useCallback } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { findNodeById } from '@/types/canvas'
import type { VectorNode, HandleMirroring, StrokeCap, StrokeJoin } from '@/types/canvas'
import { NumberInput, SelectInput } from './inputs'
import { cn } from '@/lib/utils'

interface VectorSectionProps {
    node: VectorNode
    onUpdate: (updates: Record<string, unknown>) => void
}

/* ── Mirroring icons ───────────────────────────────────────── */

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
    { value: 'LINE_ARROW', label: 'Arrow' },
    { value: 'TRIANGLE_ARROW', label: 'Triangle' },
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
 * VectorSection — properties specific to VectorNode:
 *  - Vertex Position X/Y (live when single vertex selected, — when none/multi)
 *  - Handle mirroring toggle (per-vertex when selected, node-level fallback)
 *  - Corner radius (per-vertex)
 *  - Stroke weight, cap, join, align
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

    // Vertex position
    const handleVertexX = useCallback(
        (v: number) => {
            if (vectorEditNodeId && singleVertexIdx >= 0) {
                updateVertex(vectorEditNodeId, singleVertexIdx, { x: v })
            }
        },
        [vectorEditNodeId, singleVertexIdx, updateVertex],
    )
    const handleVertexY = useCallback(
        (v: number) => {
            if (vectorEditNodeId && singleVertexIdx >= 0) {
                updateVertex(vectorEditNodeId, singleVertexIdx, { y: v })
            }
        },
        [vectorEditNodeId, singleVertexIdx, updateVertex],
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

    return (
        <div className="border-b border-border/40">
            {/* Vertex position (only in vector edit mode) */}
            {inEditMode && (
                <div className="px-3 py-2">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-muted-foreground/70">Position</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <NumberInput
                            label="X"
                            value={singleVertex ? Math.round(singleVertex.x * 100) / 100 : 0}
                            disabled={!singleVertex}
                            step={1}
                            onChange={handleVertexX}
                        />
                        <NumberInput
                            label="Y"
                            value={singleVertex ? Math.round(singleVertex.y * 100) / 100 : 0}
                            disabled={!singleVertex}
                            step={1}
                            onChange={handleVertexY}
                        />
                    </div>
                </div>
            )}

            {/* Mirroring */}
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

            {/* Corner radius (per-vertex, only in edit mode with selection) */}
            {inEditMode && (
                <div className="px-3 py-2">
                    <NumberInput
                        label="Corner radius"
                        value={singleVertex ? activeCornerRadius : 0}
                        disabled={!singleVertex}
                        min={0}
                        max={1000}
                        step={1}
                        onChange={handleCornerRadius}
                    />
                </div>
            )}

            {/* Stroke properties */}
            <div className="px-3 py-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                    <NumberInput
                        label="Weight"
                        value={node.strokeWeight}
                        min={0}
                        max={100}
                        step={1}
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
            </div>
        </div>
    )
}
