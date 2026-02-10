'use client'

/**
 * Stats Split Family — Stats on one side, text/image on the other.
 *
 * Controls:
 * - statsPlacement: left | right
 * - itemCount: 2 | 3 | 4
 * - showImage: boolean
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const statsPlacement = (controls?.statsPlacement as string) ?? 'left'
    const itemCount = Number(controls?.itemCount ?? 3)
    const showImage = controls?.showImage !== false

    const statLabels = ['Customers', 'Countries', 'Uptime', 'Team size']
    const statValues = ['10K+', '50+', '99.9%', '120+']

    const statsBlock = (
        <div className="space-y-6">
            <div>
                <EditableText
                    value={(content?.heading as string) || 'Trusted by thousands'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                    editable={editable}
                />
                <EditableText
                    value={(content?.subheading as string) || 'Our numbers speak for themselves.'}
                    onChange={(v) => onContentChange?.('subheading', v)}
                    as="p"
                    className={`text-gray-500 mt-2 ${isMobile ? 'text-sm' : 'text-base'}`}
                    editable={editable}
                    multiline
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: itemCount }).map((_, i) => (
                    <div key={i} className="py-2">
                        <div className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                            {statValues[i % statValues.length]}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                            {statLabels[i % statLabels.length]}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    const mediaBlock = showImage ? (
        <div className="aspect-[4/3] bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-300" />
        </div>
    ) : (
        <div className="aspect-[4/3] bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
            <p className="text-sm text-gray-400 text-center px-6">
                Additional context or description about the company and its achievements.
            </p>
        </div>
    )

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div className={`flex ${isMobile ? 'flex-col gap-8' : 'gap-12 items-center'}`}>
                    {statsPlacement === 'left' ? (
                        <>
                            <div className={isMobile ? 'w-full' : 'flex-1'}>{statsBlock}</div>
                            <div className={isMobile ? 'w-full' : 'flex-1'}>{mediaBlock}</div>
                        </>
                    ) : (
                        <>
                            <div className={isMobile ? 'w-full' : 'flex-1'}>{mediaBlock}</div>
                            <div className={isMobile ? 'w-full' : 'flex-1'}>{statsBlock}</div>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

export const StatsSplitFamily: TemplateFamily = {
    id: 'stats-split',
    category: 'stats',
    name: 'Stats Split',
    description: 'Stats alongside image or text',
    tags: ['stats', 'split', 'numbers', 'image'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'statsPlacement',
            label: 'Stats Side',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
            ],
            defaultValue: 'left',
        },
        {
            key: 'itemCount',
            label: 'Stats',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
        },
        {
            key: 'showImage',
            label: 'Show Image',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        statsPlacement: 'left',
        itemCount: '3',
        showImage: true,
    },
    defaultContent: {
        heading: 'Trusted by thousands',
        subheading: 'Our numbers speak for themselves.',
    },
}
