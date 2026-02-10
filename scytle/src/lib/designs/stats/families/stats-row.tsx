'use client'

/**
 * Stats Row Family — Horizontal row of stat counters.
 *
 * Controls:
 * - itemCount: 3 | 4 | 5
 * - showLabel: boolean
 * - showDividers: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const itemCount = Number(controls?.itemCount ?? 4)
    const showLabel = controls?.showLabel !== false
    const showDividers = controls?.showDividers !== false

    const statLabels = ['Users', 'Countries', 'Revenue', 'Uptime', 'Downloads']
    const statValues = ['10,000+', '50+', '$2M+', '99.9%', '500K+']

    const gridCols = isMobile ? 2 : isTablet ? Math.min(itemCount, 4) : itemCount

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div
                            key={i}
                            className={`text-center py-4 ${showDividers && i < itemCount - 1 && !isMobile ? 'border-r border-gray-200' : ''}`}
                        >
                            <div className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                                {statValues[i % statValues.length]}
                            </div>
                            {showLabel && (
                                <div className="text-sm text-gray-500 mt-1">
                                    {statLabels[i % statLabels.length]}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const StatsRowFamily: TemplateFamily = {
    id: 'stats-row',
    category: 'stats',
    name: 'Stats Row',
    description: 'Horizontal row of key statistics',
    tags: ['stats', 'numbers', 'counters', 'metrics'],
    Canvas,
    controlsDef: [
        {
            key: 'itemCount',
            label: 'Stats',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
            ],
            defaultValue: '4',
        },
        {
            key: 'showLabel',
            label: 'Show Labels',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showDividers',
            label: 'Dividers',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        itemCount: '4',
        showLabel: true,
        showDividers: true,
    },
    defaultContent: {},
}
