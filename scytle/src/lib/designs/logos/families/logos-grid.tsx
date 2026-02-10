'use client'

/**
 * Logos Grid Family — Logo cards in a grid layout.
 *
 * Controls:
 * - columns: 3 | 4 | 5
 * - itemCount: 6 | 8 | 10 | 12
 * - showBorder: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 4)
    const itemCount = Number(controls?.itemCount ?? 8)
    const showBorder = controls?.showBorder !== false

    const gridCols = isMobile ? 2 : isTablet ? 3 : columns

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Partners'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Our partners'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {/* Grid */}
                <div
                    className="grid gap-4"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div
                            key={i}
                            className={`aspect-[3/2] flex items-center justify-center rounded ${showBorder ? 'border border-gray-200' : ''} bg-gray-50`}
                        >
                            <div className="h-8 w-20 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                                <span className="text-[10px] text-gray-400">Logo</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const LogosGridFamily: TemplateFamily = {
    id: 'logos-grid',
    category: 'logos',
    name: 'Logos Grid',
    description: 'Logo cards in a grid layout',
    tags: ['logos', 'grid', 'partners', 'clients'],
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
            ],
            defaultValue: '4',
        },
        {
            key: 'itemCount',
            label: 'Logos',
            type: 'toggle-group',
            options: [
                { value: '6', label: '6' },
                { value: '8', label: '8' },
                { value: '10', label: '10' },
                { value: '12', label: '12' },
            ],
            defaultValue: '8',
        },
        {
            key: 'showBorder',
            label: 'Card Border',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '4',
        itemCount: '8',
        showBorder: true,
    },
    defaultContent: {
        tagline: 'Partners',
        heading: 'Our partners',
    },
}
