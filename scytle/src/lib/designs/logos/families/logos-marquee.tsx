'use client'

/**
 * Logos Marquee Family — Scrolling logo marquee (visual representation).
 *
 * Controls:
 * - itemCount: 5 | 6 | 8
 * - rows: 1 | 2
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const itemCount = Number(controls?.itemCount ?? 6)
    const rows = Number(controls?.rows ?? 1)

    const visibleCount = isMobile ? 3 : isTablet ? 4 : Math.min(itemCount, 6)

    return (
        <section className={`${isMobile ? 'py-10 px-4' : isTablet ? 'py-12 px-8' : 'py-14 px-16'} overflow-hidden`}>
            <div className="max-w-7xl mx-auto">
                {/* Optional heading */}
                <div className="text-center mb-6">
                    <EditableText
                        value={(content?.heading as string) || 'Backed by the best'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="p"
                        className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}
                        editable={editable}
                    />
                </div>

                {/* Marquee rows */}
                {Array.from({ length: rows }).map((_, row) => (
                    <div key={row} className={`flex gap-8 items-center justify-center ${row > 0 ? 'mt-4' : ''}`}>
                        {/* Fade left indicator */}
                        <div className="w-8 flex-shrink-0 text-gray-300 text-center text-xs">‹</div>

                        {Array.from({ length: visibleCount }).map((_, i) => (
                            <div
                                key={i}
                                className="h-8 w-24 bg-gray-100 border border-gray-200 rounded flex items-center justify-center flex-shrink-0"
                            >
                                <span className="text-[10px] text-gray-400">Logo</span>
                            </div>
                        ))}

                        {/* Fade right indicator */}
                        <div className="w-8 flex-shrink-0 text-gray-300 text-center text-xs">›</div>
                    </div>
                ))}

                {/* Scroll indicator */}
                <div className="text-center mt-4">
                    <span className="text-[10px] text-gray-300">← scrolling →</span>
                </div>
            </div>
        </section>
    )
}

export const LogosMarqueeFamily: TemplateFamily = {
    id: 'logos-marquee',
    category: 'logos',
    name: 'Logos Marquee',
    description: 'Scrolling logo marquee strip',
    tags: ['logos', 'marquee', 'scroll', 'ticker'],
    Canvas,
    controlsDef: [
        {
            key: 'itemCount',
            label: 'Logos',
            type: 'toggle-group',
            options: [
                { value: '5', label: '5' },
                { value: '6', label: '6' },
                { value: '8', label: '8' },
            ],
            defaultValue: '6',
        },
        {
            key: 'rows',
            label: 'Rows',
            type: 'toggle-group',
            options: [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
            ],
            defaultValue: '1',
        },
    ],
    defaultControls: {
        itemCount: '6',
        rows: '1',
    },
    defaultContent: {
        heading: 'Backed by the best',
    },
}
