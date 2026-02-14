'use client'

/**
 * Stat Cards Family — Dashboard KPI stat cards with trend badges.
 *
 * Figma ref: Stat Cards 1–8 (node 4174:138040)
 * - 3-column (Stats 1–4) or 4-column (Stats 5–8)
 * - Each card: icon + label + large number + trend ↑/↓ + optional CTA
 * - Section header: "Recent Activity" + description + button + ellipsis
 *
 * Controls:
 * - columns: 3 | 4
 * - showIcon: boolean
 * - showTrend: boolean
 * - showCTA: boolean
 * - showMenu: boolean
 */

import { useState } from 'react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import {
    DynamicListItem,
    InsertDot,
    insertListItem,
    removeListItem,
} from '@/components/wireframe/dynamic-list'

interface StatItem {
    label: string
    value: string
    trend: string
    trendDirection: 'up' | 'down'
}

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const columns = Number(controls?.columns ?? 3)
    const showIcon = controls?.showIcon !== false
    const showTrend = controls?.showTrend !== false
    const showCTA = controls?.showCTA === true
    const showMenu = controls?.showMenu !== false
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const stats = (content?.stats as StatItem[]) || []
    const gridCols = isMobile ? 2 : columns

    const handleChange = (i: number, field: keyof StatItem, value: string) => {
        const updated = [...stats]
        updated[i] = { ...updated[i], [field]: value }
        onContentChange?.('stats', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('stats', insertListItem(stats, i, {
            label: 'Lorem ipsum', value: '90,000', trend: '100%', trendDirection: 'up',
        }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(stats, i, 1)
        if (result) onContentChange?.('stats', result)
    }

    return (
        <section className={isMobile ? 'p-4' : 'p-6'}>
            {/* Section Header — matches Figma "Recent Activity" header */}
            <div className="flex items-start justify-between mb-5">
                <div className="flex-1 min-w-0">
                    <EditableText
                        value={(content?.heading as string) || 'Recent Activity'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.description as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'}
                        onChange={(v) => onContentChange?.('description', v)}
                        as="p"
                        className="text-sm text-gray-500 mt-1"
                        editable={editable}
                        multiline
                    />
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                    <div className="h-8 px-4 bg-gray-800 text-white text-xs font-medium rounded flex items-center">
                        Button
                    </div>
                    {showMenu && (
                        <div className="w-8 h-8 rounded flex items-center justify-center text-gray-400 text-sm">
                            •••
                        </div>
                    )}
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
            >
                {stats.map((stat, i) => (
                    <div key={i}>
                        {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                        <DynamicListItem
                            index={i}
                            selectedIndex={selectedIndex}
                            onSelect={setSelectedIndex}
                            onDelete={() => removeItem(i)}
                            deletable={stats.length > 1}
                            editable={editable}
                        >
                            <div className="border border-gray-200 rounded-lg p-5 bg-white">
                                {/* Top row: icon + menu */}
                                <div className="flex items-start justify-between mb-3">
                                    {showIcon && (
                                        <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                                            <div className="w-5 h-5 bg-gray-300 rounded" />
                                        </div>
                                    )}
                                    {showMenu && (
                                        <span className="text-gray-400 text-sm ml-auto">•••</span>
                                    )}
                                </div>

                                {/* Label */}
                                <EditableText
                                    value={stat.label}
                                    onChange={(v) => handleChange(i, 'label', v)}
                                    className="text-sm text-gray-500 mb-1"
                                    editable={editable}
                                />

                                {/* Value + Trend */}
                                <div className="flex items-end gap-3">
                                    <EditableText
                                        value={stat.value}
                                        onChange={(v) => handleChange(i, 'value', v)}
                                        as="div"
                                        className="text-2xl font-semibold text-gray-900"
                                        editable={editable}
                                    />
                                    {showTrend && (
                                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${stat.trendDirection === 'up'
                                                ? 'text-emerald-700 bg-emerald-50'
                                                : 'text-red-700 bg-red-50'
                                            }`}>
                                            {stat.trendDirection === 'up' ? '↑' : '↓'} {stat.trend}
                                        </span>
                                    )}
                                </div>

                                {/* Optional CTA */}
                                {showCTA && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <span className="text-sm text-gray-600 font-medium">View report</span>
                                    </div>
                                )}
                            </div>
                        </DynamicListItem>
                        {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                    </div>
                ))}
            </div>
        </section>
    )
}

export const StatCardsFamily: TemplateFamily = {
    id: 'stat-cards',
    category: 'dashboard',
    name: 'Stat Cards',
    description: 'Dashboard KPI cards with trend indicators',
    tags: ['dashboard', 'stats', 'kpi', 'metrics', 'analytics', 'cards'],
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
        },
        {
            key: 'showIcon',
            label: 'Show Icon',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showTrend',
            label: 'Show Trend',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showCTA',
            label: 'Show CTA Link',
            type: 'switch',
            defaultValue: false,
        },
        {
            key: 'showMenu',
            label: 'Show Menu',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '3',
        showIcon: true,
        showTrend: true,
        showCTA: false,
        showMenu: true,
    },
    defaultContent: {
        heading: 'Recent Activity',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        stats: [
            { label: 'Lorem ipsum', value: '90,000', trend: '100%', trendDirection: 'up' },
            { label: 'Lorem ipsum', value: '90,000', trend: '100%', trendDirection: 'down' },
            { label: 'Lorem ipsum', value: '90,000', trend: '100%', trendDirection: 'up' },
        ],
    },
}
