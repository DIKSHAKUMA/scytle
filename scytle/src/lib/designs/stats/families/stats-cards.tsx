'use client'

/**
 * Stats Cards Family — Stat numbers in card boxes.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - itemCount: 3 | 4 | 6
 * - showIcon: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 3)
    const itemCount = Number(controls?.itemCount ?? 3)
    const showIcon = controls?.showIcon === true

    const gridCols = isMobile ? 2 : isTablet ? Math.min(columns, 3) : columns

    const statLabels = ['Active Users', 'Countries Served', 'Revenue Generated', 'Team Members', 'Projects Done', 'Satisfaction']
    const statValues = ['10,000+', '50+', '$2M+', '120+', '500+', '99%']

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.heading as string) || 'By the numbers'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Key metrics that showcase our impact.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className={`text-gray-500 mt-2 ${isMobile ? 'text-sm' : 'text-base'}`}
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Cards */}
                <div
                    className="grid gap-4"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div
                            key={i}
                            className="border border-gray-200 rounded-lg p-6 text-center"
                        >
                            {showIcon && (
                                <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center text-gray-400 text-xs">
                                    #
                                </div>
                            )}
                            <div className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                                {statValues[i % statValues.length]}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                {statLabels[i % statLabels.length]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const StatsCardsFamily: TemplateFamily = {
    id: 'stats-cards',
    category: 'stats',
    name: 'Stats Cards',
    description: 'Statistics displayed in card boxes',
    tags: ['stats', 'cards', 'numbers', 'metrics'],
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
        },
        {
            key: 'itemCount',
            label: 'Stats',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '6', label: '6' },
            ],
            defaultValue: '3',
        },
        {
            key: 'showIcon',
            label: 'Show Icon',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        columns: '3',
        itemCount: '3',
        showIcon: false,
    },
    defaultContent: {
        heading: 'By the numbers',
        subheading: 'Key metrics that showcase our impact.',
    },
}
