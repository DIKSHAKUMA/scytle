'use client'

/**
 * Navbar Centered Family — Logo centered above links.
 *
 * Controls:
 * - showCta: boolean
 * - showSearch: boolean
 */

import { Search, Menu } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
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
        <nav className="bg-white border-b border-gray-200">
            {/* Top row: Logo centered */}
            <div className="flex items-center justify-center py-3 border-b border-gray-100">
                <div className="font-bold text-lg text-gray-900">
                    <EditableText
                        value={(content?.logo as string) || 'Logo'}
                        onChange={(v) => onContentChange?.('logo', v)}
                        as="span"
                        editable={editable}
                    />
                </div>
            </div>

            {/* Bottom row: Links centered */}
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-center gap-6">
                {showSearch && <Search className="w-4 h-4 text-gray-500 mr-4" />}
                {links.map((link) => (
                    <span key={link} className="text-sm text-gray-600 whitespace-nowrap">
                        {link}
                    </span>
                ))}
                {showCta && (
                    <div className="bg-gray-800 text-white px-4 py-1.5 text-sm font-medium whitespace-nowrap ml-4">
                        <EditableText
                            value={(content?.ctaText as string) || 'Sign Up'}
                            onChange={(v) => onContentChange?.('ctaText', v)}
                            as="span"
                            editable={editable}
                        />
                    </div>
                )}
            </div>
        </nav>
    )
}

export const NavbarCenteredFamily: TemplateFamily = {
    id: 'navbar-centered',
    category: 'navbar',
    name: 'Centered Navbar',
    description: 'Logo centered above navigation links',
    tags: ['centered', 'stacked', 'navigation', 'header'],
    Canvas,
    controlsDef: [
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
        showCta: true,
        showSearch: false,
    },
    defaultContent: {
        logo: 'Logo',
        ctaText: 'Sign Up',
    },
}
