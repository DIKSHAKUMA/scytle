'use client'

/**
 * Footer Big Family — Logo + description + multi-column links + bottom bar.
 *
 * Controls:
 * - columns: 3 | 4 | 5
 * - showNewsletter: boolean
 * - showSocial: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { EditableIcon } from '@/components/wireframe/editable-icon'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 4)
    const showNewsletter = controls?.showNewsletter === true
    const showSocial = controls?.showSocial !== false

    const socialIcons = (content?.socialIcons as string[]) ?? ['Globe', 'Heart', 'Camera', 'Star', 'Play']

    const columnHeaders = (content?.columnHeaders as string[]) ?? ['Product', 'Company', 'Resources', 'Legal', 'Support']
    const colNames = columnHeaders.slice(0, columns)
    const columnLinks = (content?.columnLinks as string[]) ?? ['Link One', 'Link Two', 'Link Three', 'Link Four']
    const legalLinks = (content?.legalLinks as string[]) ?? ['Privacy', 'Terms', 'Cookies']
    const gridCols = isMobile ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : columns === 5 ? 'grid-cols-5' : 'grid-cols-4'

    return (
        <footer className={`bg-white border-t border-gray-200 ${isMobile ? 'px-4 py-10' : isTablet ? 'px-8 py-14' : 'px-16 py-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Top: Logo + Description + Columns */}
                <div className={`${isMobile ? 'space-y-8' : 'flex gap-12'} mb-10`}>
                    {/* Logo & Description */}
                    <div className={`${isMobile ? '' : 'w-1/3'} space-y-3`}>
                        <div className="font-bold text-lg text-gray-900">
                            <EditableText
                                value={(content?.logo as string) || 'Logo'}
                                onChange={(v) => onContentChange?.('logo', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                        <EditableText
                            value={(content?.description as string) || 'A brief description of your company and what you do. Keep it short and sweet.'}
                            onChange={(v) => onContentChange?.('description', v)}
                            as="p"
                            className="text-sm text-gray-500 leading-relaxed"
                            multiline
                            editable={editable}
                        />
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
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Link Columns */}
                    <div className={`flex-1 grid ${gridCols} gap-8`}>
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
                </div>

                {/* Newsletter */}
                {showNewsletter && (
                    <div className="border-t border-gray-200 py-8 mb-4">
                        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center gap-4'}`}>
                            <EditableText
                                value={(content?.subscribeLabel as string) || 'Subscribe to our newsletter'}
                                onChange={(v) => onContentChange?.('subscribeLabel', v)}
                                as="div"
                                className="text-sm font-medium text-gray-900"
                                editable={editable}
                            />
                            <div className="flex gap-2 flex-1 max-w-md">
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
                    </div>
                )}

                {/* Bottom bar */}
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
                                className="text-xs text-gray-500"
                                editable={editable}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export const FooterBigFamily: TemplateFamily = {
    id: 'footer-big',
    category: 'footer',
    name: 'Big Footer',
    description: 'Logo + description + columns + bottom bar',
    tags: ['big', 'enterprise', 'comprehensive', 'footer'],
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
            ],
            defaultValue: '4',
        },
        {
            key: 'showNewsletter',
            label: 'Show Newsletter',
            type: 'switch',
            defaultValue: false,
        },
        {
            key: 'showSocial',
            label: 'Show Social Icons',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '4',
        showNewsletter: false,
        showSocial: true,
    },
    defaultContent: {
        logo: 'Logo',
        description: 'A brief description of your company and what you do. Keep it short and sweet.',
        companyName: 'Company',
        copyrightPrefix: '© 2024',
        copyrightSuffix: '. All rights reserved.',
        columnHeaders: ['Product', 'Company', 'Resources', 'Legal', 'Support'],
        columnLinks: ['Link One', 'Link Two', 'Link Three', 'Link Four'],
        legalLinks: ['Privacy', 'Terms', 'Cookies'],
        subscribeLabel: 'Subscribe to our newsletter',
        emailPlaceholder: 'Enter your email',
        subscribeButton: 'Subscribe',
        socialIcons: ['Globe', 'Heart', 'Camera', 'Star', 'Play'],
    },
}
