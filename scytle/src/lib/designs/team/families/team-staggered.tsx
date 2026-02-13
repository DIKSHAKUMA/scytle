'use client'

/**
 * Team Staggered Family — Organic masonry/honeycomb layout.
 *
 * Controls:
 * - itemCount: 5 | 7 | 9
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
    const itemCount = Number(controls?.itemCount ?? 7)
    const showBio = controls?.showBio !== false
    const showSocial = controls?.showSocial !== false
    const showCta = controls?.showCta !== false

    const memberNames = (content?.memberNames as string[]) ?? Array.from({ length: 9 }, () => 'Full name')
    const memberRoles = (content?.memberRoles as string[]) ?? Array.from({ length: 9 }, () => 'Job title')
    const memberBios = (content?.memberBios as string[]) ?? Array.from({ length: 9 }, () => 'Lorem ipsum dolor sit amet.')

    // Create staggered rows: e.g. 2-3-2 or 3-4-3 pattern
    const rows: number[][] = []
    let remaining = itemCount
    let idx = 0
    let rowPattern = isMobile ? [2, 2, 2, 2] : isTablet ? [2, 3, 2, 3] : [2, 3, 2, 3]
    let patternIdx = 0
    while (remaining > 0) {
        const count = Math.min(remaining, rowPattern[patternIdx % rowPattern.length])
        const indices = Array.from({ length: count }, (_, j) => idx + j)
        rows.push(indices)
        idx += count
        remaining -= count
        patternIdx++
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-14">
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

                {/* Staggered Layout */}
                <div className="space-y-8">
                    {rows.map((row, rIdx) => (
                        <div key={rIdx} className="flex justify-center gap-8">
                            {row.map((memberIdx) => (
                                <div key={memberIdx} className="text-center" style={{ width: isMobile ? '120px' : '160px' }}>
                                    <div className={`${isMobile ? 'w-20 h-20' : 'w-28 h-28'} rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto mb-3`}>
                                        <User className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} text-gray-300`} />
                                    </div>
                                    <EditableText
                                        value={memberNames[memberIdx] ?? 'Full name'}
                                        onChange={(v) => { const u = [...memberNames]; u[memberIdx] = v; onContentChange?.('memberNames', u) }}
                                        as="h3"
                                        className="font-semibold text-gray-900 text-sm"
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={memberRoles[memberIdx] ?? 'Job title'}
                                        onChange={(v) => { const u = [...memberRoles]; u[memberIdx] = v; onContentChange?.('memberRoles', u) }}
                                        as="p"
                                        className="text-xs text-gray-500 mt-0.5"
                                        editable={editable}
                                    />
                                    {showBio && (
                                        <EditableText
                                            value={memberBios[memberIdx] ?? 'Lorem ipsum dolor sit amet.'}
                                            onChange={(v) => { const u = [...memberBios]; u[memberIdx] = v; onContentChange?.('memberBios', u) }}
                                            as="p"
                                            className="text-xs text-gray-400 mt-1"
                                            editable={editable}
                                        />
                                    )}
                                    {showSocial && (
                                        <div className="flex gap-2 mt-2 justify-center">
                                            {['Li', 'X', 'Dr'].map((label) => (
                                                <div key={label} className="w-3.5 h-3.5 rounded bg-gray-200 flex items-center justify-center text-[7px] font-medium text-gray-400">{label}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* CTA */}
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

export const TeamStaggeredFamily: TemplateFamily = {
    id: 'team-staggered',
    category: 'team',
    name: 'Team Staggered',
    description: 'Organic honeycomb/staggered layout for team members',
    tags: ['team', 'staggered', 'honeycomb', 'organic', 'masonry'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'itemCount',
            label: 'Members',
            type: 'toggle-group',
            options: [
                { value: '5', label: '5' },
                { value: '7', label: '7' },
                { value: '9', label: '9' },
            ],
            defaultValue: '7',
        },
        {
            key: 'showBio',
            label: 'Show Bio',
            type: 'switch',
            defaultValue: false,
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
        itemCount: '7',
        showBio: false,
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
        memberNames: Array.from({ length: 9 }, () => 'Full name'),
        memberRoles: Array.from({ length: 9 }, () => 'Job title'),
        memberBios: Array.from({ length: 9 }, () => 'Lorem ipsum dolor sit amet.'),
    },
}
