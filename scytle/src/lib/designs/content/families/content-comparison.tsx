'use client'

/**
 * Content Comparison Family — Side-by-side comparison columns.
 *
 * Archetype: Multi-column layout for comparing features, plans, or options
 * with optional checkmarks/icons and an optional highlighted column.
 *
 * Covers Relume comparison/multi-column layouts.
 *
 * Controls:
 * - columns: '2' | '3' — number of comparison columns
 * - showCheckmarks: boolean — show check/cross icons per row
 * - highlightColumn: 'none' | 'first' | 'second' | 'third' — highlight one column
 * - showButton: boolean — show CTA button per column
 */

import { Check, X } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'

    const columnCount = Number(controls?.columns ?? 2)
    const showCheckmarks = controls?.showCheckmarks !== false
    const highlightColumn = (controls?.highlightColumn as string) ?? 'none'
    const showButton = controls?.showButton !== false

    const columnTitles = (content?.columnTitles as string[]) || ['Option One', 'Option Two', 'Option Three']
    const columnDescriptions = (content?.columnDescriptions as string[]) || [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    ]
    const featureLabels = (content?.features as string[]) || [
        'Feature one',
        'Feature two',
        'Feature three',
        'Feature four',
    ]

    // For checkmarks: 2D array [feature][column] — true/false
    const checkData: boolean[][] = [
        [true, true, true],
        [true, true, false],
        [true, false, false],
        [false, true, true],
    ]

    const columns = Array.from({ length: columnCount })
    const isHighlighted = (idx: number) => {
        if (highlightColumn === 'first' && idx === 0) return true
        if (highlightColumn === 'second' && idx === 1) return true
        if (highlightColumn === 'third' && idx === 2) return true
        return false
    }

    return (
        <section className={`${isMobile ? 'px-4 py-12' : isTablet ? 'px-8 py-16' : 'px-16 py-20'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section heading */}
                <div className="text-center mb-12">
                    <EditableText
                        value={(content?.tagline as string) || 'Compare'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Compare your options'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.description as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                        onChange={(v) => onContentChange?.('description', v)}
                        as="p"
                        className="text-gray-600 mt-4 max-w-2xl mx-auto"
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Comparison columns */}
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : columnCount === 3 ? 'grid-cols-3 gap-4' : 'grid-cols-2 gap-6'}`}>
                    {columns.map((_, colIndex) => {
                        const highlighted = isHighlighted(colIndex)
                        return (
                            <div
                                key={colIndex}
                                className={`border p-6 ${highlighted ? 'border-gray-900 bg-gray-50 shadow-sm' : 'border-gray-200 bg-white'}`}
                            >
                                <EditableText
                                    value={columnTitles[colIndex] || `Option ${colIndex + 1}`}
                                    onChange={(v) => {
                                        const updated = [...columnTitles]
                                        updated[colIndex] = v
                                        onContentChange?.('columnTitles', updated)
                                    }}
                                    as="h3"
                                    className="text-lg font-bold text-gray-900 mb-1"
                                    editable={editable}
                                />
                                <EditableText
                                    value={columnDescriptions[colIndex] || 'Description goes here.'}
                                    onChange={(v) => {
                                        const updated = [...columnDescriptions]
                                        updated[colIndex] = v
                                        onContentChange?.('columnDescriptions', updated)
                                    }}
                                    as="p"
                                    className="text-sm text-gray-500 mb-6"
                                    editable={editable}
                                />

                                {/* Feature rows */}
                                <div className="space-y-3">
                                    {featureLabels.map((label, featureIndex) => (
                                        <div key={featureIndex} className="flex items-center gap-3 py-2 border-t border-gray-100">
                                            {showCheckmarks && (
                                                <span className="flex-shrink-0">
                                                    {checkData[featureIndex]?.[colIndex] ? (
                                                        <Check className="w-4 h-4 text-gray-900" />
                                                    ) : (
                                                        <X className="w-4 h-4 text-gray-300" />
                                                    )}
                                                </span>
                                            )}
                                            <EditableText
                                                value={label}
                                                onChange={(v) => {
                                                    const updated = [...featureLabels]
                                                    updated[featureIndex] = v
                                                    onContentChange?.('features', updated)
                                                }}
                                                as="span"
                                                className="text-sm text-gray-700"
                                                editable={editable}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {showButton && (
                                    <div className="mt-6">
                                        <div className={`w-full text-center py-2.5 px-4 text-sm font-medium ${highlighted ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-700'}`}>
                                            Button
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export const ContentComparisonFamily: TemplateFamily = {
    id: 'content-comparison',
    category: 'content',
    name: 'Comparison',
    description: 'Side-by-side comparison columns with feature checklist',
    tags: ['comparison', 'columns', 'features', 'versus', 'table', 'content'],
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
            ],
            defaultValue: '2',
        },
        {
            key: 'showCheckmarks',
            label: 'Checkmarks',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'highlightColumn',
            label: 'Highlight',
            type: 'toggle-group',
            options: [
                { value: 'none', label: 'None' },
                { value: 'first', label: '1st' },
                { value: 'second', label: '2nd' },
                { value: 'third', label: '3rd' },
            ],
            defaultValue: 'none',
        },
        {
            key: 'showButton',
            label: 'Show Button',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '2',
        showCheckmarks: true,
        highlightColumn: 'none',
        showButton: true,
    },
    defaultContent: {
        tagline: 'Compare',
        heading: 'Compare your options',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        columnTitles: ['Option One', 'Option Two', 'Option Three'],
        columnDescriptions: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        ],
        features: ['Feature one', 'Feature two', 'Feature three', 'Feature four'],
    },
}
