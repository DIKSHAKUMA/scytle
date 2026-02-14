'use client'

/**
 * Chart Bar Family — Bar chart wireframe placeholder.
 *
 * Renders a stylized bar chart wireframe with configurable orientation,
 * bar count, and header/legend visibility. Used as a dashboard section placeholder.
 *
 * Controls:
 *  - orientation: vertical | horizontal
 *  - barCount: '4' | '6' | '8'
 *  - showHeader: boolean
 *  - showLegend: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, onContentChange, editable }: CanvasProps) {
    const orientation = (controls?.orientation as string) ?? 'vertical'
    const barCount = Number(controls?.barCount ?? 6)
    const showHeader = controls?.showHeader !== false
    const showLegend = controls?.showLegend !== false

    const barHeights = [65, 85, 45, 90, 60, 75, 50, 80].slice(0, barCount)

    return (
        <section className="py-6 px-6">
            {showHeader && (
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <EditableText
                            value={(content?.heading as string) || 'Revenue'}
                            onChange={(v) => onContentChange?.('heading', v)}
                            as="h3"
                            className="text-lg font-semibold text-gray-900"
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.subtitle as string) || 'Monthly revenue breakdown'}
                            onChange={(v) => onContentChange?.('subtitle', v)}
                            as="p"
                            className="text-sm text-gray-500 mt-0.5"
                            editable={editable}
                        />
                    </div>
                    {/* Period selector */}
                    <div className="flex gap-1">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">12 months</span>
                        <span className="text-xs px-2 py-1 text-gray-400">30 days</span>
                        <span className="text-xs px-2 py-1 text-gray-400">7 days</span>
                    </div>
                </div>
            )}

            {/* Chart area */}
            {orientation === 'vertical' ? (
                <div className="flex items-end gap-3 h-40 px-2">
                    {barHeights.map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className="w-full bg-gray-200 rounded-t"
                                style={{ height: `${h}%` }}
                            />
                            <span className="text-[10px] text-gray-400">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i]}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-2 px-2">
                    {barHeights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 w-8 text-right shrink-0">
                                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i]}
                            </span>
                            <div
                                className="h-5 bg-gray-200 rounded-r"
                                style={{ width: `${h}%` }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Legend */}
            {showLegend && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-gray-300 rounded-sm" />
                        <span className="text-xs text-gray-500">Series A</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-gray-500 rounded-sm" />
                        <span className="text-xs text-gray-500">Series B</span>
                    </div>
                </div>
            )}
        </section>
    )
}

export const ChartBarFamily: TemplateFamily = {
    id: 'chart-bar',
    category: 'chart',
    name: 'Bar Chart',
    description: 'Bar chart wireframe with vertical or horizontal orientation',
    tags: ['chart', 'bar', 'graph', 'analytics', 'dashboard'],
    Canvas,
    controlsDef: [
        {
            key: 'orientation',
            label: 'Orientation',
            type: 'toggle-group',
            options: [
                { value: 'vertical', label: 'Vertical' },
                { value: 'horizontal', label: 'Horizontal' },
            ],
            defaultValue: 'vertical',
        },
        {
            key: 'barCount',
            label: 'Bars',
            type: 'toggle-group',
            options: [
                { value: '4', label: '4' },
                { value: '6', label: '6' },
                { value: '8', label: '8' },
            ],
            defaultValue: '6',
        },
        { key: 'showHeader', label: 'Header', type: 'switch', defaultValue: true },
        { key: 'showLegend', label: 'Legend', type: 'switch', defaultValue: true },
    ],
    defaultControls: {
        orientation: 'vertical',
        barCount: '6',
        showHeader: true,
        showLegend: true,
    },
    defaultContent: {
        heading: 'Revenue',
        subtitle: 'Monthly revenue breakdown',
    },
}
