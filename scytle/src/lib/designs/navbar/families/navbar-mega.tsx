'use client'

/**
 * Navbar Mega Menu Family — Navigation with dropdown mega menus.
 *
 * Controls:
 * - logoPosition: left | center
 * - showCta: boolean
 * - megaColumns: 2 | 3 | 4
 */

import { ChevronDown, Menu } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const logoPosition = (controls?.logoPosition as string) ?? 'left'
    const showCta = controls?.showCta !== false
    const megaColumns = Number(controls?.megaColumns ?? 3)

    const navLinks = (content?.navLinks as string[]) ?? ['Products', 'Solutions', 'Resources', 'Pricing']
    const hasMegaFlags = [true, true, false, false]
    const megaCategories = (content?.megaCategories as string[]) ?? ['Category 1', 'Category 2', 'Category 3', 'Category 4']
    const megaItems = (content?.megaItems as string[]) ?? ['Item One', 'Item Two', 'Item Three']
    const megaDescription = (content?.megaDescription as string) ?? 'Short description'

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

    const gridCols = megaColumns === 2 ? 'grid-cols-2' : megaColumns === 4 ? 'grid-cols-4' : 'grid-cols-3'

    return (
        <div>
            {/* Main Nav Bar */}
            <nav className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
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
                                {hasMegaFlags[i] && <ChevronDown className="w-3 h-3" />}
                            </span>
                        ))}
                    </div>

                    {showCta && (
                        <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium whitespace-nowrap ml-8">
                            <EditableText
                                value={(content?.ctaText as string) || 'Get Started'}
                                onChange={(v) => onContentChange?.('ctaText', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                    )}
                </div>
            </nav>

            {/* Mega Menu Preview (always-open for wireframe) */}
            <div className="bg-white border-b border-gray-200 px-6 py-6">
                <div className={`max-w-7xl mx-auto grid ${gridCols} gap-6`}>
                    {Array.from({ length: megaColumns }, (_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="text-xs font-semibold text-gray-400 uppercase">
                                <EditableText
                                    value={megaCategories[i] ?? `Category ${i + 1}`}
                                    onChange={(v) => {
                                        const updated = [...megaCategories]
                                        updated[i] = v
                                        onContentChange?.('megaCategories', updated)
                                    }}
                                    as="span"
                                    editable={editable}
                                />
                            </div>
                            {megaItems.map((item, j) => (
                                <div key={j} className="space-y-0.5">
                                    <div className="text-sm font-medium text-gray-800">
                                        <EditableText
                                            value={item}
                                            onChange={(v) => {
                                                const updated = [...megaItems]
                                                updated[j] = v
                                                onContentChange?.('megaItems', updated)
                                            }}
                                            as="span"
                                            editable={editable}
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        <EditableText
                                            value={megaDescription}
                                            onChange={(v) => onContentChange?.('megaDescription', v)}
                                            as="span"
                                            editable={editable}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export const NavbarMegaFamily: TemplateFamily = {
    id: 'navbar-mega',
    category: 'navbar',
    name: 'Mega Menu Navbar',
    description: 'Navigation with dropdown mega menus',
    tags: ['mega', 'dropdown', 'enterprise', 'navigation', 'header'],
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
            key: 'megaColumns',
            label: 'Mega Menu Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
        },
    ],
    defaultControls: {
        logoPosition: 'left',
        showCta: true,
        megaColumns: '3',
    },
    defaultContent: {
        logo: 'Logo',
        ctaText: 'Get Started',
        navLinks: ['Products', 'Solutions', 'Resources', 'Pricing'],
        megaCategories: ['Category 1', 'Category 2', 'Category 3', 'Category 4'],
        megaItems: ['Item One', 'Item Two', 'Item Three'],
        megaDescription: 'Short description',
    },
}
