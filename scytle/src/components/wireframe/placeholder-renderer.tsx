'use client'

import { useMemo } from 'react'
import type { WireframeSection, ViewportDevice } from '@/types'
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
 * Renders section content using V2 layout templates.
 * Falls back to a placeholder div if no matching template is found.
 */
export function PlaceholderRenderer({ section, viewport, className, onContentChange, editable }: PlaceholderRendererProps) {
    // V2 Layout Template — primary rendering path
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

    // Fallback: No matching design found
    return (
        <div className={className}>
            <div className="flex items-center justify-center h-32 bg-gray-50 border border-dashed border-gray-300 rounded text-sm text-gray-400">
                {section.type || 'Unknown section'}
            </div>
        </div>
    )
}
