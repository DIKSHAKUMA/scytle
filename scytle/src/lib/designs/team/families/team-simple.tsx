'use client'

/**
 * Team Simple Family — Minimal horizontal team row.
 *
 * Controls:
 * - itemCount: 3 | 4 | 5 | 6
 * - showRole: boolean
 */

import { User } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const itemCount = Number(controls?.itemCount ?? 4)
    const showRole = controls?.showRole !== false

    const gridCols = isMobile ? 2 : isTablet ? 3 : itemCount

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-10">
                    <EditableText
                        value={(content?.heading as string) || 'The team'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {/* Row */}
                <div
                    className="grid gap-8"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 text-sm">Name</div>
                                {showRole && (
                                    <div className="text-xs text-gray-500">Role</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const TeamSimpleFamily: TemplateFamily = {
    id: 'team-simple',
    category: 'team',
    name: 'Team Simple',
    description: 'Minimal horizontal team member row',
    tags: ['team', 'simple', 'minimal', 'row'],
    Canvas,
    controlsDef: [
        {
            key: 'itemCount',
            label: 'Members',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
                { value: '6', label: '6' },
            ],
            defaultValue: '4',
        },
        {
            key: 'showRole',
            label: 'Show Role',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        itemCount: '4',
        showRole: true,
    },
    defaultContent: {
        heading: 'The team',
    },
}
