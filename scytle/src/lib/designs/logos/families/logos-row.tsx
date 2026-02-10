'use client'

/**
 * Logos Row Family — Simple horizontal row of logos.
 *
 * Controls:
 * - itemCount: 4 | 5 | 6 | 8
 * - showLabel: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const itemCount = Number(controls?.itemCount ?? 6)
    const showLabel = controls?.showLabel === true

    const gridCols = isMobile ? 3 : isTablet ? Math.min(itemCount, 5) : itemCount

    return (
        <section className={`${isMobile ? 'py-10 px-4' : isTablet ? 'py-12 px-8' : 'py-14 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Optional heading */}
                <div className="text-center mb-6">
                    <EditableText
                        value={(content?.heading as string) || 'Trusted by industry leaders'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="p"
                        className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}
                        editable={editable}
                    />
                </div>

                {/* Logos */}
                <div
                    className="grid items-center gap-6"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className="h-8 w-20 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                                <span className="text-[10px] text-gray-400">Logo</span>
                            </div>
                            {showLabel && (
                                <span className="text-[9px] text-gray-400">Company {i + 1}</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const LogosRowFamily: TemplateFamily = {
    id: 'logos-row',
    category: 'logos',
    name: 'Logos Row',
    description: 'Simple horizontal row of partner/client logos',
    tags: ['logos', 'partners', 'clients', 'trust'],
    Canvas,
    controlsDef: [
        {
            key: 'itemCount',
            label: 'Logos',
            type: 'toggle-group',
            options: [
                { value: '4', label: '4' },
                { value: '5', label: '5' },
                { value: '6', label: '6' },
                { value: '8', label: '8' },
            ],
            defaultValue: '6',
        },
        {
            key: 'showLabel',
            label: 'Show Names',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        itemCount: '6',
        showLabel: false,
    },
    defaultContent: {
        heading: 'Trusted by industry leaders',
    },
}
