'use client'

/**
 * Team Alternating Family — Image + text side-by-side, alternating left/right.
 *
 * Controls:
 * - itemCount: 2 | 3 | 4
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
    const itemCount = Number(controls?.itemCount ?? 3)
    const showBio = controls?.showBio !== false
    const showSocial = controls?.showSocial !== false
    const showCta = controls?.showCta !== false

    const memberNames = (content?.memberNames as string[]) ?? Array.from({ length: 4 }, () => 'Full name')
    const memberRoles = (content?.memberRoles as string[]) ?? Array.from({ length: 4 }, () => 'Job title')
    const memberBios = (content?.memberBios as string[]) ?? Array.from({ length: 4 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.')

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="max-w-3xl mb-14">
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

                {/* Alternating rows */}
                <div className="space-y-12">
                    {Array.from({ length: itemCount }).map((_, i) => {
                        const isReversed = i % 2 === 1
                        return (
                            <div
                                key={i}
                                className={`${isMobile ? 'flex flex-col gap-6' : `grid grid-cols-2 gap-10 items-center`}`}
                            >
                                <div className={`aspect-[4/3] bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center ${!isMobile && isReversed ? 'order-2' : ''}`}>
                                    <User className="w-16 h-16 text-gray-300" />
                                </div>
                                <div className={!isMobile && isReversed ? 'order-1' : ''}>
                                    <EditableText
                                        value={memberNames[i] ?? 'Full name'}
                                        onChange={(v) => { const u = [...memberNames]; u[i] = v; onContentChange?.('memberNames', u) }}
                                        as="h3"
                                        className="font-semibold text-gray-900 text-xl"
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={memberRoles[i] ?? 'Job title'}
                                        onChange={(v) => { const u = [...memberRoles]; u[i] = v; onContentChange?.('memberRoles', u) }}
                                        as="p"
                                        className="text-sm text-gray-500 mt-1"
                                        editable={editable}
                                    />
                                    {showBio && (
                                        <EditableText
                                            value={memberBios[i] ?? 'Lorem ipsum dolor sit amet.'}
                                            onChange={(v) => { const u = [...memberBios]; u[i] = v; onContentChange?.('memberBios', u) }}
                                            as="p"
                                            className="text-gray-400 mt-3 text-sm leading-relaxed"
                                            editable={editable}
                                            multiline
                                        />
                                    )}
                                    {showSocial && (
                                        <div className="flex gap-2.5 mt-4">
                                            {['Li', 'X', 'Dr'].map((label) => (
                                                <div key={label} className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-[8px] font-medium text-gray-400">{label}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* CTA Footer */}
                {showCta && (
                    <div className="mt-16 pt-10 border-t border-gray-200">
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

export const TeamAlternatingFamily: TemplateFamily = {
    id: 'team-alternating',
    category: 'team',
    name: 'Team Alternating',
    description: 'Full-width alternating image and text rows',
    tags: ['team', 'alternating', 'zigzag', 'featured'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'itemCount',
            label: 'Members',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
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
        itemCount: '3',
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
        memberNames: Array.from({ length: 4 }, () => 'Full name'),
        memberRoles: Array.from({ length: 4 }, () => 'Job title'),
        memberBios: Array.from({ length: 4 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'),
    },
}
