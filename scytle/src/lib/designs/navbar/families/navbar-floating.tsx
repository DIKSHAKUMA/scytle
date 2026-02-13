'use client'

/**
 * Navbar Floating Family — "Pill" navbar, bordered, inset from edges.
 *
 * Controls:
 * - showSearch: boolean
 * - buttonCount: 1 | 2
 * - showDropdown: boolean
 */

import { Search, Menu, ChevronDown } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const showSearch = controls?.showSearch === true
    const buttonCount = Number(controls?.buttonCount ?? 2)
    const showDropdown = controls?.showDropdown !== false

    const navLinks = (content?.navLinks as string[]) ?? ['Link One', 'Link Two', 'Link Three', 'Link Four', 'Link Five']

    if (isMobile) {
        return (
            <div className="px-4 pt-4">
                <nav className="bg-white border border-gray-200 rounded-full px-4 py-2.5 flex items-center justify-between shadow-sm">
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
            </div>
        )
    }

    return (
        <div className="px-8 pt-4">
            <nav className="max-w-6xl mx-auto bg-white border border-gray-200 rounded-full px-6 py-2.5 flex items-center justify-between shadow-sm">
                {/* Logo */}
                <div className="font-bold text-sm text-gray-900 mr-6">
                    <EditableText
                        value={(content?.logo as string) || 'Logo'}
                        onChange={(v) => onContentChange?.('logo', v)}
                        as="span"
                        editable={editable}
                    />
                </div>

                {/* Links */}
                <div className="flex items-center gap-5 flex-1">
                    {navLinks.map((link, i) => (
                        <span key={i} className="text-sm text-gray-600 whitespace-nowrap flex items-center gap-1">
                            <EditableText
                                value={link}
                                onChange={(v) => {
                                    const updated = [...navLinks]
                                    updated[i] = v
                                    onContentChange?.('navLinks', updated)
                                }}
                                as="span"
                                editable={editable}
                            />
                            {i === 2 && showDropdown && <ChevronDown className="w-3 h-3" />}
                        </span>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3 ml-6">
                    {showSearch && <Search className="w-4 h-4 text-gray-500" />}
                    {buttonCount >= 1 && (
                        <div className="border border-gray-300 text-gray-700 px-4 py-1.5 text-sm font-medium whitespace-nowrap rounded-full">
                            <EditableText
                                value={(content?.secondaryCtaText as string) || 'Log In'}
                                onChange={(v) => onContentChange?.('secondaryCtaText', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                    )}
                    {buttonCount >= 2 && (
                        <div className="bg-gray-800 text-white px-4 py-1.5 text-sm font-medium whitespace-nowrap rounded-full">
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
        </div>
    )
}

export const NavbarFloatingFamily: TemplateFamily = {
    id: 'navbar-floating',
    category: 'navbar',
    name: 'Floating Navbar',
    description: 'Pill-shaped navbar with border, inset from edges',
    tags: ['floating', 'pill', 'modern', 'rounded', 'navigation', 'header'],
    Canvas,
    controlsDef: [
        {
            key: 'buttonCount',
            label: 'Buttons',
            type: 'toggle-group',
            options: [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
            ],
            defaultValue: '2',
        },
        {
            key: 'showDropdown',
            label: 'Show Dropdown Arrow',
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
        buttonCount: '2',
        showDropdown: true,
        showSearch: false,
    },
    defaultContent: {
        logo: 'Logo',
        ctaText: 'Sign Up',
        secondaryCtaText: 'Log In',
        navLinks: ['Link One', 'Link Two', 'Link Three', 'Link Four', 'Link Five'],
    },
}
