'use client'

/**
 * Team Carousel Family — Horizontal scrolling team member slider.
 *
 * Controls:
 * - itemCount: 4 | 6 | 8
 * - avatarShape: circle | rectangle
 * - showBio: boolean
 * - showSocial: boolean
 */

import { User, ChevronLeft, ChevronRight } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const itemCount = Number(controls?.itemCount ?? 4)
    const avatarShape = (controls?.avatarShape as string) ?? 'circle'
    const showBio = controls?.showBio !== false
    const showSocial = controls?.showSocial !== false
    const isCircle = avatarShape === 'circle'

    const visibleCount = isMobile ? 1 : isTablet ? 2 : 4

    const memberNames = (content?.memberNames as string[]) ?? Array.from({ length: 8 }, () => 'Full name')
    const memberRoles = (content?.memberRoles as string[]) ?? Array.from({ length: 8 }, () => 'Job title')
    const memberBios = (content?.memberBios as string[]) ?? Array.from({ length: 8 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.')

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="max-w-3xl mb-12">
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

                {/* Carousel */}
                <div className="relative">
                    <div className="flex gap-6 overflow-hidden">
                        {Array.from({ length: Math.min(itemCount, visibleCount) }).map((_, i) => (
                            <div key={i} className="flex-shrink-0 text-center" style={{ width: `${100 / visibleCount}%` }}>
                                {isCircle ? (
                                    <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mb-4 mx-auto">
                                        <User className="w-8 h-8 text-gray-300" />
                                    </div>
                                ) : (
                                    <div className="aspect-[3/4] bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center mb-4 mx-4">
                                        <User className="w-12 h-12 text-gray-300" />
                                    </div>
                                )}
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
                                        value={memberBios[i] ?? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                                        onChange={(v) => { const u = [...memberBios]; u[i] = v; onContentChange?.('memberBios', u) }}
                                        as="p"
                                        className="text-sm text-gray-400 mt-2 max-w-[250px] mx-auto"
                                        editable={editable}
                                        multiline
                                    />
                                )}
                                {showSocial && (
                                    <div className="flex gap-2.5 mt-3 justify-center">
                                        {['Li', 'X', 'Dr'].map((label) => (
                                            <div key={label} className="w-4 h-4 rounded bg-gray-200 flex items-center justify-center text-[8px] font-medium text-gray-400">{label}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8">
                        {/* Dots */}
                        <div className="flex gap-2">
                            {Array.from({ length: Math.ceil(itemCount / visibleCount) }).map((_, i) => (
                                <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-gray-800' : 'bg-gray-200'}`} />
                            ))}
                        </div>
                        {/* Arrows */}
                        <div className="flex gap-2">
                            <div className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50">
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50">
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export const TeamCarouselFamily: TemplateFamily = {
    id: 'team-carousel',
    category: 'team',
    name: 'Team Carousel',
    description: 'Horizontal scrolling team member slider with navigation',
    tags: ['team', 'carousel', 'slider', 'scroll'],
    hasImage: true,
    Canvas,
    controlsDef: [
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
        itemCount: '4',
        avatarShape: 'circle',
        showBio: true,
        showSocial: true,
    },
    defaultContent: {
        tagline: 'Our Team',
        heading: 'Meet our team',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        memberNames: Array.from({ length: 8 }, () => 'Full name'),
        memberRoles: Array.from({ length: 8 }, () => 'Job title'),
        memberBios: Array.from({ length: 8 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
    },
}
