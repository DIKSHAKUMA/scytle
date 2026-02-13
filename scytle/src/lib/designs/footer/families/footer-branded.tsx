'use client'

/**
 * Footer Branded Family — Giant company name as visual branding element.
 *
 * Controls:
 * - showNewsletter: boolean
 * - showColumns: boolean
 * - showSocial: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { EditableIcon } from '@/components/wireframe/editable-icon'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const showNewsletter = controls?.showNewsletter !== false
    const showColumns = controls?.showColumns !== false
    const showSocial = controls?.showSocial !== false

    const socialIcons = (content?.socialIcons as string[]) ?? ['Globe', 'Heart', 'Camera', 'Star', 'Play']

    const columnHeaders = (content?.columnHeaders as string[]) ?? ['Product', 'Company', 'Resources']
    const colNames = columnHeaders
    const columnLinks = (content?.columnLinks as string[]) ?? ['Link One', 'Link Two', 'Link Three', 'Link Four']
    const legalLinks = (content?.legalLinks as string[]) ?? ['Privacy Policy', 'Terms of Service', 'Cookies Settings']

    return (
        <footer className={`bg-white border-t border-gray-200 ${isMobile ? 'px-4 py-10' : isTablet ? 'px-8 py-14' : 'px-16 py-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Top section: Logo + Newsletter + Columns + Social */}
                <div className={`${isMobile ? 'space-y-8' : 'flex gap-12'} mb-10`}>
                    {/* Left: Logo + newsletter */}
                    <div className={`${isMobile ? '' : 'w-1/3'} space-y-4`}>
                        <div className="font-bold text-lg text-gray-900">
                            <EditableText
                                value={(content?.logo as string) || 'Logo'}
                                onChange={(v) => onContentChange?.('logo', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                        {showNewsletter && (
                            <div className="space-y-2">
                                <EditableText
                                    value={(content?.subscribeLabel as string) || 'Subscribe'}
                                    onChange={(v) => onContentChange?.('subscribeLabel', v)}
                                    as="div"
                                    className="text-sm font-medium text-gray-700"
                                    editable={editable}
                                />
                                <EditableText
                                    value={(content?.subscribeDescription as string) || 'Join our newsletter for updates.'}
                                    onChange={(v) => onContentChange?.('subscribeDescription', v)}
                                    as="div"
                                    className="text-xs text-gray-500"
                                    editable={editable}
                                />
                                <div className="flex gap-2">
                                    <div className="flex-1 h-9 bg-gray-100 border border-gray-200 px-3 flex items-center text-sm text-gray-400">
                                        <EditableText
                                            value={(content?.emailPlaceholder as string) || 'Enter your email'}
                                            onChange={(v) => onContentChange?.('emailPlaceholder', v)}
                                            as="span"
                                            editable={editable}
                                        />
                                    </div>
                                    <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium">
                                        <EditableText
                                            value={(content?.subscribeButton as string) || 'Subscribe'}
                                            onChange={(v) => onContentChange?.('subscribeButton', v)}
                                            as="span"
                                            editable={editable}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        {showSocial && (
                            <div className="flex gap-3 pt-1">
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
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Link columns */}
                    {showColumns && (
                        <div className={`flex-1 grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-8`}>
                            {colNames.map((col, colIdx) => (
                                <div key={colIdx} className="space-y-3">
                                    <EditableText
                                        value={col}
                                        onChange={(v) => {
                                            const updated = [...columnHeaders]
                                            updated[colIdx] = v
                                            onContentChange?.('columnHeaders', updated)
                                        }}
                                        as="div"
                                        className="text-sm font-semibold text-gray-900"
                                        editable={editable}
                                    />
                                    {columnLinks.map((item, i) => (
                                        <EditableText
                                            key={i}
                                            value={item}
                                            onChange={(v) => {
                                                const updated = [...columnLinks]
                                                updated[i] = v
                                                onContentChange?.('columnLinks', updated)
                                            }}
                                            as="div"
                                            className="text-sm text-gray-500"
                                            editable={editable}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Giant Brand Name */}
                <div className="border-t border-gray-200 pt-8 pb-6">
                    <div className={`font-bold text-gray-900/10 ${isMobile ? 'text-4xl' : isTablet ? 'text-6xl' : 'text-8xl'} tracking-tight leading-none select-none`}>
                        <EditableText
                            value={(content?.brandText as string) || 'Company name'}
                            onChange={(v) => onContentChange?.('brandText', v)}
                            as="span"
                            editable={editable}
                        />
                    </div>
                </div>

                {/* Copyright bar */}
                <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                        <EditableText
                            value={(content?.copyrightPrefix as string) || '© 2024'}
                            onChange={(v) => onContentChange?.('copyrightPrefix', v)}
                            as="span"
                            editable={editable}
                        />{' '}
                        <EditableText
                            value={(content?.companyName as string) || 'Company'}
                            onChange={(v) => onContentChange?.('companyName', v)}
                            as="span"
                            editable={editable}
                        />{' '}
                        <EditableText
                            value={(content?.copyrightSuffix as string) || '. All rights reserved.'}
                            onChange={(v) => onContentChange?.('copyrightSuffix', v)}
                            as="span"
                            editable={editable}
                        />
                    </div>
                    <div className="flex gap-4">
                        {legalLinks.map((link, i) => (
                            <EditableText
                                key={i}
                                value={link}
                                onChange={(v) => {
                                    const updated = [...legalLinks]
                                    updated[i] = v
                                    onContentChange?.('legalLinks', updated)
                                }}
                                as="span"
                                className="text-xs text-gray-500 underline"
                                editable={editable}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export const FooterBrandedFamily: TemplateFamily = {
    id: 'footer-branded',
    category: 'footer',
    name: 'Branded Footer',
    description: 'Giant company name as visual branding element',
    tags: ['branded', 'typography', 'bold', 'modern', 'footer'],
    Canvas,
    controlsDef: [
        {
            key: 'showNewsletter',
            label: 'Show Newsletter',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showColumns',
            label: 'Show Link Columns',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showSocial',
            label: 'Show Social Icons',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        showNewsletter: true,
        showColumns: true,
        showSocial: true,
    },
    defaultContent: {
        logo: 'Logo',
        brandText: 'Company name',
        companyName: 'Company',
        copyrightPrefix: '© 2024',
        copyrightSuffix: '. All rights reserved.',
        columnHeaders: ['Product', 'Company', 'Resources'],
        columnLinks: ['Link One', 'Link Two', 'Link Three', 'Link Four'],
        legalLinks: ['Privacy Policy', 'Terms of Service', 'Cookies Settings'],
        subscribeLabel: 'Subscribe',
        subscribeDescription: 'Join our newsletter for updates.',
        emailPlaceholder: 'Enter your email',
        subscribeButton: 'Subscribe',
        socialIcons: ['Globe', 'Heart', 'Camera', 'Star', 'Play'],
    },
}
