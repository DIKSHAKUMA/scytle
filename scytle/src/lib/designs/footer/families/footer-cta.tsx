'use client'

/**
 * Footer CTA Family — Newsletter CTA section above link columns.
 *
 * Controls:
 * - columns: 3 | 4
 * - showSocial: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 4)
    const showSocial = controls?.showSocial !== false

    const colNames = ['Product', 'Company', 'Resources', 'Legal'].slice(0, columns)
    const linkItems = ['Link One', 'Link Two', 'Link Three']
    const gridCols = isMobile ? 'grid-cols-2' : columns === 3 ? 'grid-cols-3' : 'grid-cols-4'

    return (
        <footer className={`bg-white border-t border-gray-200 ${isMobile ? 'px-4' : isTablet ? 'px-8' : 'px-16'}`}>
            {/* CTA Section */}
            <div className={`${isMobile ? 'py-8' : 'py-12'} border-b border-gray-200`}>
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-4">
                    <EditableText
                        value={(content?.ctaHeading as string) || 'Stay up to date'}
                        onChange={(v) => onContentChange?.('ctaHeading', v)}
                        as="h3"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.ctaSubheading as string) || 'Subscribe to our newsletter for the latest updates and news.'}
                        onChange={(v) => onContentChange?.('ctaSubheading', v)}
                        as="p"
                        className="text-gray-500 text-sm max-w-md"
                        multiline
                        editable={editable}
                    />
                    <div className="flex gap-2 w-full max-w-sm">
                        <div className="flex-1 h-10 bg-gray-100 border border-gray-200 px-3 flex items-center text-sm text-gray-400">
                            Enter your email
                        </div>
                        <div className="bg-gray-800 text-white px-5 py-2.5 text-sm font-medium whitespace-nowrap">
                            <EditableText
                                value={(content?.ctaButton as string) || 'Subscribe'}
                                onChange={(v) => onContentChange?.('ctaButton', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Link Columns */}
            <div className={`max-w-7xl mx-auto ${isMobile ? 'py-8' : 'py-12'}`}>
                <div className={`grid ${gridCols} gap-8 mb-8`}>
                    {colNames.map((col) => (
                        <div key={col} className="space-y-3">
                            <div className="text-sm font-semibold text-gray-900">{col}</div>
                            {linkItems.map((item) => (
                                <div key={item} className="text-sm text-gray-500">{item}</div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                        © 2024 <EditableText
                            value={(content?.companyName as string) || 'Company'}
                            onChange={(v) => onContentChange?.('companyName', v)}
                            as="span"
                            editable={editable}
                        />. All rights reserved.
                    </div>
                    {showSocial && (
                        <div className="flex gap-3">
                            {['FB', 'TW', 'IG', 'LI'].map((s) => (
                                <div key={s} className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-[8px] text-gray-500">
                                    {s}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </footer>
    )
}

export const FooterCtaFamily: TemplateFamily = {
    id: 'footer-cta',
    category: 'footer',
    name: 'CTA Footer',
    description: 'Newsletter CTA above link columns',
    tags: ['cta', 'newsletter', 'email', 'footer'],
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '4',
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
        showSocial: true,
    },
    defaultContent: {
        ctaHeading: 'Stay up to date',
        ctaSubheading: 'Subscribe to our newsletter for the latest updates and news.',
        ctaButton: 'Subscribe',
        companyName: 'Company',
    },
}
