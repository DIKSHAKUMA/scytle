'use client'

/**
 * Chart Pie Family — Pie / donut chart wireframe placeholder.
 *
 * Renders a stylized pie or donut chart wireframe with configurable
 * segments, donut mode, and center label.
 *
 * Controls:
 *  - style: pie | donut
 *  - segmentCount: '3' | '4' | '5'
 *  - showHeader: boolean
 *  - showLegend: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function PieChart({ segments, donut }: { segments: number; donut: boolean }) {
    const colors = ['#9CA3AF', '#D1D5DB', '#E5E7EB', '#6B7280', '#F3F4F6']
    const sliceAngles = [120, 90, 60, 50, 40].slice(0, segments)
    const total = sliceAngles.reduce((a, b) => a + b, 0)
    const normalised = sliceAngles.map((a) => (a / total) * 360)

    let cumulativeAngle = 0
    const cx = 80
    const cy = 80
    const r = 70

    function describeArc(startAngle: number, endAngle: number) {
        const start = polarToCartesian(cx, cy, r, endAngle)
        const end = polarToCartesian(cx, cy, r, startAngle)
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
        return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`
    }

    function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
        const rad = ((angleDeg - 90) * Math.PI) / 180
        return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
    }

    return (
        <svg viewBox="0 0 160 160" className="w-40 h-40 mx-auto">
            {normalised.map((angle, i) => {
                const startAngle = cumulativeAngle
                cumulativeAngle += angle
                return (
                    <path
                        key={i}
                        d={describeArc(startAngle, cumulativeAngle)}
                        fill={colors[i]}
                        stroke="white"
                        strokeWidth={1}
                    />
                )
            })}
            {donut && <circle cx={cx} cy={cy} r={35} fill="white" />}
            {donut && (
                <text x={cx} y={cy + 4} textAnchor="middle" className="text-xs font-semibold fill-gray-800">
                    72%
                </text>
            )}
        </svg>
    )
}

function Canvas({ content, controls, onContentChange, editable }: CanvasProps) {
    const style = (controls?.style as string) ?? 'donut'
    const segmentCount = Number(controls?.segmentCount ?? 4)
    const showHeader = controls?.showHeader !== false
    const showLegend = controls?.showLegend !== false

    const labels = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E'].slice(0, segmentCount)
    const colors = ['#9CA3AF', '#D1D5DB', '#E5E7EB', '#6B7280', '#F3F4F6']

    return (
        <section className="py-6 px-6">
            {showHeader && (
                <div className="mb-6">
                    <EditableText
                        value={(content?.heading as string) || 'Traffic Sources'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h3"
                        className="text-lg font-semibold text-gray-900"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subtitle as string) || 'Distribution by channel'}
                        onChange={(v) => onContentChange?.('subtitle', v)}
                        as="p"
                        className="text-sm text-gray-500 mt-0.5"
                        editable={editable}
                    />
                </div>
            )}

            <PieChart segments={segmentCount} donut={style === 'donut'} />

            {showLegend && (
                <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    {labels.map((label, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: colors[i] }} />
                            <span className="text-xs text-gray-500">{label}</span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export const ChartPieFamily: TemplateFamily = {
    id: 'chart-pie',
    category: 'chart',
    name: 'Pie / Donut Chart',
    description: 'Pie or donut chart wireframe with configurable segments',
    tags: ['chart', 'pie', 'donut', 'distribution', 'analytics'],
    Canvas,
    controlsDef: [
        {
            key: 'style',
            label: 'Style',
            type: 'toggle-group',
            options: [
                { value: 'pie', label: 'Pie' },
                { value: 'donut', label: 'Donut' },
            ],
            defaultValue: 'donut',
        },
        {
            key: 'segmentCount',
            label: 'Segments',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
            ],
            defaultValue: '4',
        },
        { key: 'showHeader', label: 'Header', type: 'switch', defaultValue: true },
        { key: 'showLegend', label: 'Legend', type: 'switch', defaultValue: true },
    ],
    defaultControls: {
        style: 'donut',
        segmentCount: '4',
        showHeader: true,
        showLegend: true,
    },
    defaultContent: {
        heading: 'Traffic Sources',
        subtitle: 'Distribution by channel',
    },
}
