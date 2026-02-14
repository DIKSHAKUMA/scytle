'use client'

/**
 * Chart Line Family — Line chart wireframe placeholder.
 *
 * Renders a stylized line chart wireframe with configurable line count,
 * grid visibility, and header/legend. Used as a dashboard section placeholder.
 *
 * Controls:
 *  - lineCount: '1' | '2' | '3'
 *  - showGrid: boolean
 *  - showHeader: boolean
 *  - showLegend: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, onContentChange, editable }: CanvasProps) {
    const lineCount = Number(controls?.lineCount ?? 2)
    const showGrid = controls?.showGrid !== false
    const showHeader = controls?.showHeader !== false
    const showLegend = controls?.showLegend !== false

    // SVG paths for multiple lines
    const paths = [
        'M0,120 C40,100 80,80 120,90 C160,100 200,40 240,60 C280,80 320,20 360,30 C400,40 440,50 480,25',
        'M0,80 C40,90 80,110 120,100 C160,90 200,70 240,85 C280,100 320,60 360,70 C400,80 440,60 480,50',
        'M0,140 C40,130 80,120 120,130 C160,140 200,110 240,120 C280,130 320,100 360,110 C400,120 440,90 480,100',
    ].slice(0, lineCount)
    const colors = ['#9CA3AF', '#6B7280', '#D1D5DB']

    return (
        <section className="py-6 px-6">
            {showHeader && (
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <EditableText
                            value={(content?.heading as string) || 'Performance'}
                            onChange={(v) => onContentChange?.('heading', v)}
                            as="h3"
                            className="text-lg font-semibold text-gray-900"
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.subtitle as string) || 'Trend over time'}
                            onChange={(v) => onContentChange?.('subtitle', v)}
                            as="p"
                            className="text-sm text-gray-500 mt-0.5"
                            editable={editable}
                        />
                    </div>
                    <div className="flex gap-1">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">12 months</span>
                        <span className="text-xs px-2 py-1 text-gray-400">30 days</span>
                    </div>
                </div>
            )}

            {/* Chart area */}
            <div className="relative h-40">
                {/* Grid lines */}
                {showGrid && (
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="border-b border-gray-100 w-full" />
                        ))}
                    </div>
                )}

                {/* SVG chart */}
                <svg viewBox="0 0 480 160" className="w-full h-full" preserveAspectRatio="none">
                    {paths.map((d, i) => (
                        <path
                            key={i}
                            d={d}
                            fill="none"
                            stroke={colors[i]}
                            strokeWidth={2}
                        />
                    ))}
                </svg>

                {/* X-axis labels */}
                <div className="flex justify-between mt-1">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => (
                        <span key={m} className="text-[10px] text-gray-400">{m}</span>
                    ))}
                </div>
            </div>

            {/* Legend */}
            {showLegend && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    {['Series A', 'Series B', 'Series C'].slice(0, lineCount).map((label, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: colors[i] }} />
                            <span className="text-xs text-gray-500">{label}</span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export const ChartLineFamily: TemplateFamily = {
    id: 'chart-line',
    category: 'chart',
    name: 'Line Chart',
    description: 'Line chart wireframe with configurable series and grid',
    tags: ['chart', 'line', 'graph', 'trend', 'analytics'],
    Canvas,
    controlsDef: [
        {
            key: 'lineCount',
            label: 'Lines',
            type: 'toggle-group',
            options: [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
            ],
            defaultValue: '2',
        },
        { key: 'showGrid', label: 'Grid Lines', type: 'switch', defaultValue: true },
        { key: 'showHeader', label: 'Header', type: 'switch', defaultValue: true },
        { key: 'showLegend', label: 'Legend', type: 'switch', defaultValue: true },
    ],
    defaultControls: {
        lineCount: '2',
        showGrid: true,
        showHeader: true,
        showLegend: true,
    },
    defaultContent: {
        heading: 'Performance',
        subtitle: 'Trend over time',
    },
}
