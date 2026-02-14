'use client'

/**
 * Chart Area Family — Area chart wireframe placeholder.
 *
 * Renders a stylized filled area chart wireframe. Useful for showing
 * cumulative / stacked data trends in wireframe dashboards.
 *
 * Controls:
 *  - areaCount: '1' | '2'
 *  - showGrid: boolean
 *  - showHeader: boolean
 *  - showLegend: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, onContentChange, editable }: CanvasProps) {
    const areaCount = Number(controls?.areaCount ?? 1)
    const showGrid = controls?.showGrid !== false
    const showHeader = controls?.showHeader !== false
    const showLegend = controls?.showLegend !== false

    const paths = [
        { line: 'M0,120 C60,100 120,70 180,80 C240,90 300,40 360,50 C420,60 460,30 480,25', fill: 'M0,120 C60,100 120,70 180,80 C240,90 300,40 360,50 C420,60 460,30 480,25 L480,160 L0,160 Z' },
        { line: 'M0,140 C60,130 120,120 180,125 C240,130 300,100 360,110 C420,120 460,90 480,85', fill: 'M0,140 C60,130 120,120 180,125 C240,130 300,100 360,110 C420,120 460,90 480,85 L480,160 L0,160 Z' },
    ].slice(0, areaCount)
    const fillColors = ['rgba(156,163,175,0.2)', 'rgba(209,213,219,0.3)']
    const strokeColors = ['#9CA3AF', '#D1D5DB']

    return (
        <section className="py-6 px-6">
            {showHeader && (
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <EditableText
                            value={(content?.heading as string) || 'Growth'}
                            onChange={(v) => onContentChange?.('heading', v)}
                            as="h3"
                            className="text-lg font-semibold text-gray-900"
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.subtitle as string) || 'Cumulative growth over time'}
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

            <div className="relative h-40">
                {showGrid && (
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="border-b border-gray-100 w-full" />
                        ))}
                    </div>
                )}

                <svg viewBox="0 0 480 160" className="w-full h-full" preserveAspectRatio="none">
                    {paths.map((p, i) => (
                        <g key={i}>
                            <path d={p.fill} fill={fillColors[i]} />
                            <path d={p.line} fill="none" stroke={strokeColors[i]} strokeWidth={2} />
                        </g>
                    ))}
                </svg>

                <div className="flex justify-between mt-1">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => (
                        <span key={m} className="text-[10px] text-gray-400">{m}</span>
                    ))}
                </div>
            </div>

            {showLegend && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    {['Series A', 'Series B'].slice(0, areaCount).map((label, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: strokeColors[i] }} />
                            <span className="text-xs text-gray-500">{label}</span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export const ChartAreaFamily: TemplateFamily = {
    id: 'chart-area',
    category: 'chart',
    name: 'Area Chart',
    description: 'Filled area chart wireframe for cumulative data trends',
    tags: ['chart', 'area', 'graph', 'trend', 'analytics', 'stacked'],
    Canvas,
    controlsDef: [
        {
            key: 'areaCount',
            label: 'Areas',
            type: 'toggle-group',
            options: [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
            ],
            defaultValue: '1',
        },
        { key: 'showGrid', label: 'Grid Lines', type: 'switch', defaultValue: true },
        { key: 'showHeader', label: 'Header', type: 'switch', defaultValue: true },
        { key: 'showLegend', label: 'Legend', type: 'switch', defaultValue: true },
    ],
    defaultControls: {
        areaCount: '1',
        showGrid: true,
        showHeader: true,
        showLegend: true,
    },
    defaultContent: {
        heading: 'Growth',
        subtitle: 'Cumulative growth over time',
    },
}
