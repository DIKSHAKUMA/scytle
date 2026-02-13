'use client'

/**
 * Team Split Family — Heading pinned left, members flow on the right.
 *
 * Controls:
 * - memberLayout: stacked | grid
 * - avatarShape: circle | rectangle
 * - itemCount: 3 | 4 | 6
 * - showBio: boolean
 * - showSocial: boolean
 */

import { User } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const memberLayout = (controls?.memberLayout as string) ?? 'stacked'
    const avatarShape = (controls?.avatarShape as string) ?? 'circle'
    const itemCount = Number(controls?.itemCount ?? 3)
    const showBio = controls?.showBio !== false
    const showSocial = controls?.showSocial !== false
    const isCircle = avatarShape === 'circle'
    const isStacked = memberLayout === 'stacked'

    const memberNames = (content?.memberNames as string[]) ?? Array.from({ length: 8 }, () => 'Full name')
    const memberRoles = (content?.memberRoles as string[]) ?? Array.from({ length: 8 }, () => 'Job title')
    const memberBios = (content?.memberBios as string[]) ?? Array.from({ length: 8 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.')

    const rightCols = isStacked ? 1 : (isMobile ? 1 : 2)

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div className={`${isMobile ? 'flex flex-col gap-10' : 'grid grid-cols-2 gap-12'}`}>
                    {/* Left — heading */}
                    <div className="flex flex-col justify-start">
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
                        <div className="mt-6">
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

                    {/* Right — members */}
                    <div
                        className="grid gap-8"
                        style={{ gridTemplateColumns: `repeat(${rightCols}, minmax(0, 1fr))` }}
                    >
                        {Array.from({ length: itemCount }).map((_, i) => (
                            <div key={i} className={isStacked ? 'flex gap-4 items-start' : 'text-center'}>
                                {isCircle ? (
                                    <div className={`${isStacked ? 'w-12 h-12' : 'w-16 h-16 mx-auto'} rounded-full bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center mb-3`}>
                                        <User className={`${isStacked ? 'w-5 h-5' : 'w-6 h-6'} text-gray-300`} />
                                    </div>
                                ) : (
                                    <div className={`${isStacked ? 'w-16 h-20' : 'aspect-[3/4] mx-auto'} bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center flex-shrink-0 mb-3`}>
                                        <User className="w-8 h-8 text-gray-300" />
                                    </div>
                                )}
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
                                        <div className={`flex gap-2.5 mt-2 ${isStacked ? '' : 'justify-center'}`}>
                                            {['Li', 'X', 'Dr'].map((label) => (
                                                <div key={label} className="w-4 h-4 rounded bg-gray-200 flex items-center justify-center text-[8px] font-medium text-gray-400">{label}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export const TeamSplitFamily: TemplateFamily = {
    id: 'team-split',
    category: 'team',
    name: 'Team Split',
    description: 'Heading pinned left with members flowing on the right',
    tags: ['team', 'split', 'sidebar', 'asymmetric'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'memberLayout',
            label: 'Member Layout',
            type: 'toggle-group',
            options: [
                { value: 'stacked', label: 'Stacked' },
                { value: 'grid', label: 'Grid' },
            ],
            defaultValue: 'stacked',
        },
        {
            key: 'avatarShape',
            label: 'Avatar Shape',
            type: 'toggle-group',
            options: [
                { value: 'circle', label: 'Circle' },
                { value: 'rectangle', label: 'Rect' },
            ],
            defaultValue: 'circle',
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
    ],
    defaultControls: {
        memberLayout: 'stacked',
        avatarShape: 'circle',
        itemCount: '3',
        showBio: true,
        showSocial: true,
    },
    defaultContent: {
        tagline: 'Our Team',
        heading: 'Meet our team',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        ctaButton: 'Open positions',
        memberNames: Array.from({ length: 8 }, () => 'Full name'),
        memberRoles: Array.from({ length: 8 }, () => 'Job title'),
        memberBios: Array.from({ length: 8 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
    },
}
