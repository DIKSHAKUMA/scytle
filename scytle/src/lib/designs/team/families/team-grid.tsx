'use client'

/**
 * Team Grid Family — Team member grid with circular/rectangular avatars.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - itemCount: 3 | 4 | 6 | 8
 * - alignment: center | left
 * - avatarShape: circle | rectangle
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
    const columns = Number(controls?.columns ?? 4)
    const itemCount = Number(controls?.itemCount ?? 4)
    const alignment = (controls?.alignment as string) ?? 'center'
    const avatarShape = (controls?.avatarShape as string) ?? 'circle'
    const showBio = controls?.showBio !== false
    const showSocial = controls?.showSocial !== false
    const showCta = controls?.showCta !== false
    const isCircle = avatarShape === 'circle'
    const isCenter = alignment === 'center'

    const gridCols = isMobile ? 1 : isTablet ? Math.min(columns, 2) : columns

    const memberNames = (content?.memberNames as string[]) ?? Array.from({ length: 8 }, () => 'Full name')
    const memberRoles = (content?.memberRoles as string[]) ?? Array.from({ length: 8 }, () => 'Job title')
    const memberBios = (content?.memberBios as string[]) ?? Array.from({ length: 8 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.')

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className={`mb-12 ${isCenter ? 'text-center max-w-2xl mx-auto' : 'max-w-3xl'}`}>
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
                    className="grid gap-8"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i} className={isCenter ? 'text-center' : 'text-left'}>
                            {/* Avatar */}
                            {isCircle ? (
                                <div className={`w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center mb-4 ${isCenter ? 'mx-auto' : ''}`}>
                                    <User className="w-8 h-8 text-gray-300" />
                                </div>
                            ) : (
                                <div className="aspect-[3/4] bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center mb-4">
                                    <User className="w-12 h-12 text-gray-300" />
                                </div>
                            )}
                            {/* Info */}
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
                                    className="text-sm text-gray-400 mt-2"
                                    editable={editable}
                                    multiline
                                />
                            )}
                            {showSocial && (
                                <div className={`flex gap-2.5 mt-3 ${isCenter ? 'justify-center' : ''}`}>
                                    {['Li', 'X', 'Dr'].map((label) => (
                                        <div key={label} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600">
                                            <div className="w-4 h-4 rounded bg-gray-200 flex items-center justify-center text-[8px] font-medium">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* CTA Footer */}
                {showCta && (
                    <div className={`mt-14 pt-10 border-t border-gray-200 ${isCenter ? 'text-center' : ''}`}>
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

export const TeamGridFamily: TemplateFamily = {
    id: 'team-grid',
    category: 'team',
    name: 'Team Grid',
    description: 'Team members in a grid with circular or rectangular avatars',
    tags: ['team', 'people', 'grid', 'members', 'avatars'],
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
            key: 'alignment',
            label: 'Alignment',
            type: 'toggle-group',
            options: [
                { value: 'center', label: 'Center' },
                { value: 'left', label: 'Left' },
            ],
            defaultValue: 'center',
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
        {
            key: 'showCta',
            label: 'CTA Footer',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '4',
        itemCount: '4',
        alignment: 'center',
        avatarShape: 'circle',
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
        memberNames: ['Full name', 'Full name', 'Full name', 'Full name', 'Full name', 'Full name', 'Full name', 'Full name'],
        memberRoles: ['Job title', 'Job title', 'Job title', 'Job title', 'Job title', 'Job title', 'Job title', 'Job title'],
        memberBios: Array.from({ length: 8 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
    },
}
