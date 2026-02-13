'use client'

/**
 * Navbar Fullscreen Family — Hamburger triggers full-screen/sidebar overlay.
 *
 * Controls:
 * - menuStyle: grid | sidebar
 * - showSocial: boolean
 * - showContact: boolean
 */

import { Menu, X } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { EditableIcon } from '@/components/wireframe/editable-icon'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const menuStyle = (controls?.menuStyle as string) ?? 'grid'
    const showSocial = controls?.showSocial !== false
    const showContact = controls?.showContact === true

    const socialIcons = (content?.socialIcons as string[]) ?? ['Globe', 'Heart', 'Camera', 'Star', 'Play']
    const menuLinks = (content?.menuLinks as string[]) ?? ['About', 'Services', 'Work', 'Careers', 'Blog', 'Contact']

    if (isMobile) {
        return (
            <div className="bg-gray-900 text-white min-h-[280px] flex flex-col">
                {/* Top bar */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-gray-700">
                    <div className="font-bold text-sm">
                        <EditableText
                            value={(content?.logo as string) || 'Logo'}
                            onChange={(v) => onContentChange?.('logo', v)}
                            as="span"
                            editable={editable}
                        />
                    </div>
                    <X className="w-5 h-5 text-gray-400" />
                </div>
                {/* Links */}
                <div className="flex-1 flex flex-col justify-center px-6 py-6 space-y-4">
                    {menuLinks.slice(0, 5).map((link, i) => (
                        <span key={i} className="text-xl font-semibold text-white/90">
                            <EditableText
                                value={link}
                                onChange={(v) => {
                                    const updated = [...menuLinks]
                                    updated[i] = v
                                    onContentChange?.('menuLinks', updated)
                                }}
                                as="span"
                                editable={editable}
                            />
                        </span>
                    ))}
                </div>
                {showSocial && (
                    <div className="px-6 pb-4 flex gap-3">
                        {socialIcons.map((icon, i) => (
                            <EditableIcon
                                key={i}
                                iconName={icon}
                                onChange={(name) => {
                                    const updated = [...socialIcons]
                                    updated[i] = name
                                    onContentChange?.('socialIcons', updated)
                                }}
                                editable={editable}
                                size="sm"
                                className="bg-gray-700"
                                iconClassName="text-gray-300"
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    if (menuStyle === 'sidebar') {
        return (
            <div className="flex min-h-[320px]">
                {/* Left content area (dimmed) */}
                <div className="flex-1 bg-gray-100 relative">
                    <div className="absolute inset-0 bg-black/30" />
                </div>
                {/* Right sidebar overlay */}
                <div className="w-[45%] bg-gray-900 text-white flex flex-col">
                    {/* Top bar */}
                    <div className="px-8 py-4 flex items-center justify-between border-b border-gray-700">
                        <div className="font-bold text-sm">
                            <EditableText
                                value={(content?.logo as string) || 'Logo'}
                                onChange={(v) => onContentChange?.('logo', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white text-gray-900 px-4 py-1.5 text-sm font-medium">
                                <EditableText
                                    value={(content?.ctaText as string) || 'Get Started'}
                                    onChange={(v) => onContentChange?.('ctaText', v)}
                                    as="span"
                                    editable={editable}
                                />
                            </div>
                            <X className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    {/* Menu links */}
                    <div className="flex-1 flex flex-col justify-center px-8 space-y-5">
                        {menuLinks.map((link, i) => (
                            <span key={i} className="text-2xl font-semibold text-white/90 hover:text-white">
                                <EditableText
                                    value={link}
                                    onChange={(v) => {
                                        const updated = [...menuLinks]
                                        updated[i] = v
                                        onContentChange?.('menuLinks', updated)
                                    }}
                                    as="span"
                                    editable={editable}
                                />
                            </span>
                        ))}
                    </div>
                    {/* Bottom */}
                    <div className="px-8 pb-6 space-y-4">
                        {showContact && (
                            <div className="space-y-1.5">
                                <div className="text-xs text-gray-400 uppercase tracking-wide">
                                    <EditableText
                                        value={(content?.contactLabel as string) || 'Contact'}
                                        onChange={(v) => onContentChange?.('contactLabel', v)}
                                        as="span"
                                        editable={editable}
                                    />
                                </div>
                                <div className="text-sm text-gray-300">
                                    <EditableText
                                        value={(content?.contactEmail as string) || 'hello@company.com'}
                                        onChange={(v) => onContentChange?.('contactEmail', v)}
                                        as="span"
                                        editable={editable}
                                    />
                                </div>
                                <div className="text-sm text-gray-300">
                                    <EditableText
                                        value={(content?.contactPhone as string) || '(555) 000-0000'}
                                        onChange={(v) => onContentChange?.('contactPhone', v)}
                                        as="span"
                                        editable={editable}
                                    />
                                </div>
                            </div>
                        )}
                        {showSocial && (
                            <div className="flex gap-3 pt-2">
                                {socialIcons.map((icon, i) => (
                                    <EditableIcon
                                        key={i}
                                        iconName={icon}
                                        onChange={(name) => {
                                            const updated = [...socialIcons]
                                            updated[i] = name
                                            onContentChange?.('socialIcons', updated)
                                        }}
                                        editable={editable}
                                        size="sm"
                                        className="bg-gray-700"
                                        iconClassName="text-gray-300"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // Grid style — full screen overlay
    return (
        <div className="bg-gray-900 text-white min-h-[360px] flex flex-col">
            {/* Top bar */}
            <div className="px-8 py-4 flex items-center justify-between border-b border-gray-700">
                <div className="font-bold text-sm">
                    <EditableText
                        value={(content?.logo as string) || 'Logo'}
                        onChange={(v) => onContentChange?.('logo', v)}
                        as="span"
                        editable={editable}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white text-gray-900 px-4 py-1.5 text-sm font-medium">
                        <EditableText
                            value={(content?.ctaText as string) || 'Get Started'}
                            onChange={(v) => onContentChange?.('ctaText', v)}
                            as="span"
                            editable={editable}
                        />
                    </div>
                    <X className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            {/* Grid menu links */}
            <div className="flex-1 flex items-center justify-center px-16 py-8">
                <div className="grid grid-cols-2 gap-x-24 gap-y-6 w-full max-w-2xl">
                    {menuLinks.map((link, i) => (
                        <span key={i} className="text-3xl font-semibold text-white/90">
                            <EditableText
                                value={link}
                                onChange={(v) => {
                                    const updated = [...menuLinks]
                                    updated[i] = v
                                    onContentChange?.('menuLinks', updated)
                                }}
                                as="span"
                                editable={editable}
                            />
                        </span>
                    ))}
                </div>
            </div>

            {/* Bottom */}
            <div className="px-8 pb-6 flex items-end justify-between">
                {showContact && (
                    <div className="space-y-1">
                        <div className="text-xs text-gray-400 uppercase tracking-wide">
                            <EditableText
                                value={(content?.contactLabel as string) || 'Contact'}
                                onChange={(v) => onContentChange?.('contactLabel', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                        <div className="text-sm text-gray-300">
                            <EditableText
                                value={(content?.contactEmail as string) || 'hello@company.com'}
                                onChange={(v) => onContentChange?.('contactEmail', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                    </div>
                )}
                {showSocial && (
                    <div className="flex gap-3">
                        {socialIcons.map((icon, i) => (
                            <EditableIcon
                                key={i}
                                iconName={icon}
                                onChange={(name) => {
                                    const updated = [...socialIcons]
                                    updated[i] = name
                                    onContentChange?.('socialIcons', updated)
                                }}
                                editable={editable}
                                size="sm"
                                className="bg-gray-700"
                                iconClassName="text-gray-300"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export const NavbarFullscreenFamily: TemplateFamily = {
    id: 'navbar-fullscreen',
    category: 'navbar',
    name: 'Fullscreen Menu',
    description: 'Full-screen or sidebar overlay with large navigation links',
    tags: ['fullscreen', 'overlay', 'sidebar', 'hamburger', 'navigation', 'header'],
    Canvas,
    controlsDef: [
        {
            key: 'menuStyle',
            label: 'Menu Style',
            type: 'toggle-group',
            options: [
                { value: 'grid', label: 'Grid' },
                { value: 'sidebar', label: 'Sidebar' },
            ],
            defaultValue: 'grid',
        },
        {
            key: 'showSocial',
            label: 'Show Social Icons',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showContact',
            label: 'Show Contact Info',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        menuStyle: 'grid',
        showSocial: true,
        showContact: false,
    },
    defaultContent: {
        logo: 'Logo',
        ctaText: 'Get Started',
        socialIcons: ['Globe', 'Heart', 'Camera', 'Star', 'Play'],
        menuLinks: ['About', 'Services', 'Work', 'Careers', 'Blog', 'Contact'],
        contactLabel: 'Contact',
        contactEmail: 'hello@company.com',
        contactPhone: '(555) 000-0000',
    },
}
