'use client'

import { useMemo } from 'react'
import type { WireframeSection, ViewportDevice } from '@/types'
import { getFamilyById, getPresetById, getDesignById } from '@/lib/designs'
import { getTemplateById } from '@/lib/designs/v2/layouts'

interface PlaceholderRendererProps {
    section: WireframeSection
    viewport: ViewportDevice
    className?: string
    /** Content change handler — passed through to family Canvas */
    onContentChange?: (key: string, value: unknown) => void
    /** Whether inline editing is enabled */
    editable?: boolean
}

/**
 * PlaceholderRenderer
 * 
 * Renders section content using three strategies:
 * 0. V2 Layout pipeline (new) — renders via LayoutTemplate.component
 * 1. Preset → Family pipeline (V1) — three-layer merge
 * 2. Design registry fallback (backward compat via getDesignById)
 */
export function PlaceholderRenderer({ section, viewport, className, onContentChange, editable }: PlaceholderRendererProps) {
    // Strategy 0: V2 Layout Template — check first
    const v2Template = useMemo(() => {
        if (!section.componentId) return null
        return getTemplateById(section.componentId) ?? null
    }, [section.componentId])

    if (v2Template) {
        const V2Component = v2Template.component
        return (
            <div className={className}>
                <V2Component
                    sectionId={section.id}
                    blocks={section.blocks}
                    className=""
                />
            </div>
        )
    }

    // Strategy 1: Resolve via preset → family pipeline with three-layer merge
    const resolved = useMemo(() => {
        if (!section.componentId) return null

        // Try as preset first
        const preset = getPresetById(section.componentId)
        if (preset) {
            const family = getFamilyById(preset.familyId)
            if (family) {
                return {
                    family,
                    presetControls: preset.controls,
                    presetContent: preset.content,
                }
            }
        }

        // Try as family directly (backward compat)
        const family = getFamilyById(section.componentId)
        if (family) {
            return {
                family,
                presetControls: {},
                presetContent: undefined,
            }
        }

        return null
    }, [section.componentId])

    if (resolved) {
        const { family, presetControls, presetContent } = resolved

        // THREE-LAYER MERGE (lowest → highest priority):
        const effectiveControls = {
            ...family.defaultControls,     // 1. Family defaults
            ...presetControls,             // 2. Preset overrides
            ...(section.controls ?? {}),   // 3. User overrides
        }
        const effectiveContent = {
            ...family.defaultContent,
            ...(presetContent ?? {}),
            ...((section.content ?? {}) as Record<string, unknown>),
        }

        const FamilyCanvas = family.Canvas

        return (
            <div className={className}>
                <FamilyCanvas
                    content={effectiveContent}
                    controls={effectiveControls}
                    viewport={viewport}
                    onContentChange={onContentChange}
                    editable={editable}
                />
            </div>
        )
    }

    // Strategy 2: Try backward-compat getDesignById (covers old DesignDefinition)
    const design = section.componentId ? getDesignById(section.componentId) : undefined
    if (design?.Canvas) {
        const effectiveControls = {
            ...(design.defaultControls ?? {}),
            ...(section.controls ?? {}),
        }
        const DesignCanvas = design.Canvas
        return (
            <div className={className}>
                <DesignCanvas
                    content={(section.content ?? {}) as Record<string, unknown>}
                    controls={effectiveControls}
                    viewport={viewport}
                    onContentChange={onContentChange}
                    editable={editable}
                />
            </div>
        )
    }

    // Fallback: No matching design found
    return (
        <div className={className}>
            <div className="flex items-center justify-center h-32 bg-gray-50 border border-dashed border-gray-300 rounded text-sm text-gray-400">
                {section.type || 'Unknown section'}
            </div>
        </div>
    )
}
