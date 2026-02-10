'use client'

/**
 * Navbar Standard Family — Logo left, links center, CTA right.
 *
 * Controls:
 * - logoPosition: left | center
 * - showCta: boolean
 * - showSearch: boolean
 */

import { Search, Menu } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const logoPosition = (controls?.logoPosition as string) ?? 'left'
    const showCta = controls?.showCta !== false
    const showSearch = controls?.showSearch === true

    const links = ['Link One', 'Link Two', 'Link Three', 'Link Four', 'Link Five']

    if (isMobile) {
        return (
            <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="font-bold text-sm text-gray-900">
                    <EditableText
                        value={(content?.logo as string) || 'Logo'}
                        onChange={(v) => onContentChange?.('logo', v)}
                        as="span"
                        editable={editable}
                    />
                </div>
                <Menu className="w-5 h-5 text-gray-600" />
            </nav>
        )
    }

    return (
        <nav className="bg-white border-b border-gray-200 px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                {logoPosition === 'left' && (
                    <div className="font-bold text-sm text-gray-900 mr-8">
                        <EditableText
                            value={(content?.logo as string) || 'Logo'}
                            onChange={(v) => onContentChange?.('logo', v)}
                            as="span"
                            editable={editable}
                        />
                    </div>
                )}

                {/* Links */}
                <div className={`flex items-center gap-6 ${logoPosition === 'center' ? '' : 'flex-1'}`}>
                    {logoPosition === 'center' && (
                        <div className="font-bold text-sm text-gray-900 mr-8">
                            <EditableText
                                value={(content?.logo as string) || 'Logo'}
                                onChange={(v) => onContentChange?.('logo', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                    )}
                    {links.map((link) => (
                        <span key={link} className="text-sm text-gray-600 whitespace-nowrap">
                            {link}
                        </span>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4 ml-8">
                    {showSearch && <Search className="w-4 h-4 text-gray-500" />}
                    {showCta && (
                        <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium whitespace-nowrap">
                            <EditableText
                                value={(content?.ctaText as string) || 'Sign Up'}
                                onChange={(v) => onContentChange?.('ctaText', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export const NavbarStandardFamily: TemplateFamily = {
    id: 'navbar-standard',
    category: 'navbar',
    name: 'Standard Navbar',
    description: 'Logo left, links center, CTA right',
    tags: ['standard', 'classic', 'navigation', 'header'],
    Canvas,
    controlsDef: [
        {
            key: 'logoPosition',
            label: 'Logo Position',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
            ],
            defaultValue: 'left',
        },
        {
            key: 'showCta',
            label: 'Show CTA Button',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showSearch',
            label: 'Show Search',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        logoPosition: 'left',
        showCta: true,
        showSearch: false,
    },
    defaultContent: {
        logo: 'Logo',
        ctaText: 'Sign Up',
    },
}
