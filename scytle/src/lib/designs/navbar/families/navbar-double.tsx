'use client'

/**
 * Navbar Double Family — Two-row: utility bar on top, main nav below.
 *
 * Controls:
 * - showSearch: boolean
 * - showAuth: boolean
 * - showUtilityLinks: boolean
 */

import { Search, Menu, Phone, ChevronDown } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const showSearch = controls?.showSearch !== false
    const showAuth = controls?.showAuth !== false
    const showUtilityLinks = controls?.showUtilityLinks !== false

    const navLinks = (content?.navLinks as string[]) ?? ['Link One', 'Link Two', 'Link Three', 'Link Four', 'Link Five']

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
        <div>
            {/* Utility Bar (top row) */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-1.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {showUtilityLinks && (
                            <>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    <EditableText
                                        value={(content?.phone as string) || '(555) 000-0000'}
                                        onChange={(v) => onContentChange?.('phone', v)}
                                        as="span"
                                        editable={editable}
                                    />
                                </span>
                                <span className="text-xs text-gray-500">
                                    <EditableText
                                        value={(content?.email as string) || 'support@company.com'}
                                        onChange={(v) => onContentChange?.('email', v)}
                                        as="span"
                                        editable={editable}
                                    />
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {showSearch && <Search className="w-3.5 h-3.5 text-gray-400" />}
                        {showAuth && (
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">
                                    <EditableText
                                        value={(content?.loginText as string) || 'Log In'}
                                        onChange={(v) => onContentChange?.('loginText', v)}
                                        as="span"
                                        editable={editable}
                                    />
                                </span>
                                <span className="text-xs text-gray-500">
                                    <EditableText
                                        value={(content?.signUpText as string) || 'Sign Up'}
                                        onChange={(v) => onContentChange?.('signUpText', v)}
                                        as="span"
                                        editable={editable}
                                    />
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Nav Bar (bottom row) */}
            <nav className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="font-bold text-sm text-gray-900 mr-8">
                        <EditableText
                            value={(content?.logo as string) || 'Logo'}
                            onChange={(v) => onContentChange?.('logo', v)}
                            as="span"
                            editable={editable}
                        />
                    </div>

                    <div className="flex items-center gap-6 flex-1">
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
                                {i === 4 && <ChevronDown className="w-3 h-3" />}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 ml-8">
                        <div className="border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium whitespace-nowrap">
                            <EditableText
                                value={(content?.secondaryCtaText as string) || 'Contact'}
                                onChange={(v) => onContentChange?.('secondaryCtaText', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                        <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium whitespace-nowrap">
                            <EditableText
                                value={(content?.ctaText as string) || 'Get Started'}
                                onChange={(v) => onContentChange?.('ctaText', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export const NavbarDoubleFamily: TemplateFamily = {
    id: 'navbar-double',
    category: 'navbar',
    name: 'Double Row Navbar',
    description: 'Utility bar on top, main navigation below',
    tags: ['double', 'two-row', 'utility', 'enterprise', 'navigation', 'header'],
    Canvas,
    controlsDef: [
        {
            key: 'showSearch',
            label: 'Show Search',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showAuth',
            label: 'Show Auth Links',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showUtilityLinks',
            label: 'Show Contact Info',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        showSearch: true,
        showAuth: true,
        showUtilityLinks: true,
    },
    defaultContent: {
        logo: 'Logo',
        ctaText: 'Get Started',
        secondaryCtaText: 'Contact',
        navLinks: ['Link One', 'Link Two', 'Link Three', 'Link Four', 'Link Five'],
        phone: '(555) 000-0000',
        email: 'support@company.com',
        loginText: 'Log In',
        signUpText: 'Sign Up',
    },
}
