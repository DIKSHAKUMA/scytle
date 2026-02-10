'use client'

/**
 * Team Cards Family — Team members with photo + details card.
 *
 * Controls:
 * - columns: 2 | 3
 * - itemCount: 3 | 4 | 6
 * - showSocial: boolean
 */

import { User } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 3)
    const itemCount = Number(controls?.itemCount ?? 3)
    const showSocial = controls?.showSocial !== false

    const gridCols = isMobile ? 1 : isTablet ? 2 : columns

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Team'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Our leadership'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {/* Cards Grid */}
                <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                            {/* Photo area */}
                            <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                                <User className="w-12 h-12 text-gray-300" />
                            </div>
                            {/* Details */}
                            <div className="p-4">
                                <div className="font-semibold text-gray-900 text-sm">Team Member</div>
                                <div className="text-xs text-gray-500 mt-0.5">Job Title</div>
                                <p className="text-xs text-gray-400 mt-2">
                                    Brief description about this person and their role in the team.
                                </p>
                                {showSocial && (
                                    <div className="flex gap-3 mt-3">
                                        {['Li', 'Tw', 'Gh'].map((label) => (
                                            <div
                                                key={label}
                                                className="w-7 h-7 rounded bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] text-gray-400"
                                            >
                                                {label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const TeamCardsFamily: TemplateFamily = {
    id: 'team-cards',
    category: 'team',
    name: 'Team Cards',
    description: 'Team member cards with photo and details',
    tags: ['team', 'cards', 'members', 'social'],
    hasImage: true,
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
            defaultValue: '3',
        },
        {
            key: 'itemCount',
            label: 'Members',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '6', label: '6' },
            ],
            defaultValue: '3',
        },
        {
            key: 'showSocial',
            label: 'Social Links',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '3',
        itemCount: '3',
        showSocial: true,
    },
    defaultContent: {
        tagline: 'Team',
        heading: 'Our leadership',
    },
}
