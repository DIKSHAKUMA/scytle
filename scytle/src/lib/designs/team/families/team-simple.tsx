'use client'

/**
 * Team Compact Family — Small inline avatar beside member text in a grid.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - itemCount: 4 | 6 | 8
 * - showBio: boolean
 * - showSocial: boolean
 * - showCta: boolean
 */

import { User } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 2)
    const itemCount = Number(controls?.itemCount ?? 4)
    const showBio = controls?.showBio !== false
    const showSocial = controls?.showSocial !== false
    const showCta = controls?.showCta !== false

    const gridCols = isMobile ? 1 : isTablet ? 2 : columns

    const memberNames = (content?.memberNames as string[]) ?? Array.from({ length: 8 }, () => 'Full name')
    const memberRoles = (content?.memberRoles as string[]) ?? Array.from({ length: 8 }, () => 'Job title')
    const memberBios = (content?.memberBios as string[]) ?? Array.from({ length: 8 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.')

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <EditableText
                        value={(content?.tagline as string) || 'Our Team'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-3"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Meet our team'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className={`text-gray-500 mt-4 ${isMobile ? 'text-sm' : 'text-lg'}`}
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Grid */}
                <div
                    className="grid gap-x-8 gap-y-10"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                            {/* Small avatar */}
                            <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-300" />
                            </div>
                            <div className="flex-1">
                                <EditableText
                                    value={memberNames[i] ?? 'Full name'}
                                    onChange={(v) => { const u = [...memberNames]; u[i] = v; onContentChange?.('memberNames', u) }}
                                    as="h3"
                                    className="font-semibold text-gray-900 text-base"
                                    editable={editable}
                                />
                                <EditableText
                                    value={memberRoles[i] ?? 'Job title'}
                                    onChange={(v) => { const u = [...memberRoles]; u[i] = v; onContentChange?.('memberRoles', u) }}
                                    as="p"
                                    className="text-sm text-gray-500 mt-0.5"
                                    editable={editable}
                                />
                                {showBio && (
                                    <EditableText
                                        value={memberBios[i] ?? 'Lorem ipsum dolor sit amet.'}
                                        onChange={(v) => { const u = [...memberBios]; u[i] = v; onContentChange?.('memberBios', u) }}
                                        as="p"
                                        className="text-sm text-gray-400 mt-1.5"
                                        editable={editable}
                                        multiline
                                    />
                                )}
                                {showSocial && (
                                    <div className="flex gap-2.5 mt-2">
                                        {['Li', 'X', 'Dr'].map((label) => (
                                            <div key={label} className="w-4 h-4 rounded bg-gray-200 flex items-center justify-center text-[8px] font-medium text-gray-400">{label}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Footer */}
                {showCta && (
                    <div className="mt-14 pt-10 border-t border-gray-200 text-center">
                        <EditableText
                            value={(content?.ctaHeading as string) || "We're hiring!"}
                            onChange={(v) => onContentChange?.('ctaHeading', v)}
                            as="h3"
                            className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.ctaDescription as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                            onChange={(v) => onContentChange?.('ctaDescription', v)}
                            as="p"
                            className="text-gray-500 mt-2 text-sm"
                            editable={editable}
                        />
                        <div className="mt-4">
                            <div className="inline-flex border border-gray-800 text-gray-800 px-5 py-2.5 text-sm font-medium">
                                <EditableText
                                    value={(content?.ctaButton as string) || 'Open positions'}
                                    onChange={(v) => onContentChange?.('ctaButton', v)}
                                    as="span"
                                    editable={editable}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export const TeamCompactFamily: TemplateFamily = {
    id: 'team-compact',
    category: 'team',
    name: 'Team Compact',
    description: 'Compact team layout with small inline avatars',
    tags: ['team', 'compact', 'inline', 'small'],
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
            defaultValue: '2',
        },
        {
            key: 'itemCount',
            label: 'Members',
            type: 'toggle-group',
            options: [
                { value: '4', label: '4' },
                { value: '6', label: '6' },
                { value: '8', label: '8' },
            ],
            defaultValue: '4',
        },
        {
            key: 'showBio',
            label: 'Show Bio',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showSocial',
            label: 'Social Links',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showCta',
            label: 'CTA Footer',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '2',
        itemCount: '4',
        showBio: true,
        showSocial: true,
        showCta: true,
    },
    defaultContent: {
        tagline: 'Our Team',
        heading: 'Meet our team',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        ctaHeading: "We're hiring!",
        ctaDescription: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        ctaButton: 'Open positions',
        memberNames: Array.from({ length: 8 }, () => 'Full name'),
        memberRoles: Array.from({ length: 8 }, () => 'Job title'),
        memberBios: Array.from({ length: 8 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
    },
}
