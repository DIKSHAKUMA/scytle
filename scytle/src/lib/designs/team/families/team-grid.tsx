'use client'

/**
 * Team Grid Family — Team member cards in a grid.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - itemCount: 3 | 4 | 6 | 8
 * - showRole: boolean
 * - showBio: boolean
 */

import { User } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 4)
    const itemCount = Number(controls?.itemCount ?? 4)
    const showRole = controls?.showRole !== false
    const showBio = controls?.showBio === true

    const gridCols = isMobile ? 2 : isTablet ? Math.min(columns, 3) : columns

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Our Team'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Meet the team'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'The people behind the product.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className={`text-gray-500 mt-3 ${isMobile ? 'text-sm' : 'text-base'}`}
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Grid */}
                <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i} className="text-center">
                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 mx-auto flex items-center justify-center mb-4">
                                <User className="w-10 h-10 text-gray-300" />
                            </div>
                            {/* Info */}
                            <div className="font-semibold text-gray-900 text-sm">Team Member</div>
                            {showRole && (
                                <div className="text-xs text-gray-500 mt-1">Job Title</div>
                            )}
                            {showBio && (
                                <p className="text-xs text-gray-400 mt-2 max-w-[200px] mx-auto">
                                    Short bio about this team member and their role.
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const TeamGridFamily: TemplateFamily = {
    id: 'team-grid',
    category: 'team',
    name: 'Team Grid',
    description: 'Team member cards in a grid layout',
    tags: ['team', 'people', 'grid', 'members'],
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
                { value: '4', label: '4' },
            ],
            defaultValue: '4',
        },
        {
            key: 'itemCount',
            label: 'Members',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '6', label: '6' },
                { value: '8', label: '8' },
            ],
            defaultValue: '4',
        },
        {
            key: 'showRole',
            label: 'Show Role',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showBio',
            label: 'Show Bio',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        columns: '4',
        itemCount: '4',
        showRole: true,
        showBio: false,
    },
    defaultContent: {
        tagline: 'Our Team',
        heading: 'Meet the team',
        subheading: 'The people behind the product.',
    },
}
