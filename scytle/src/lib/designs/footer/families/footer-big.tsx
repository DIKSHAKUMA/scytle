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

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 4)
    const showNewsletter = controls?.showNewsletter === true
    const showSocial = controls?.showSocial !== false

    const colNames = ['Product', 'Company', 'Resources', 'Legal', 'Support'].slice(0, columns)
    const linkItems = ['Link One', 'Link Two', 'Link Three', 'Link Four']
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
                                {['FB', 'TW', 'IG', 'LI', 'YT'].map((s) => (
                                    <div key={s} className="w-7 h-7 bg-gray-100 rounded flex items-center justify-center text-[8px] text-gray-500">
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Link Columns */}
                    <div className={`flex-1 grid ${gridCols} gap-8`}>
                        {colNames.map((col) => (
                            <div key={col} className="space-y-3">
                                <div className="text-sm font-semibold text-gray-900">{col}</div>
                                {linkItems.map((item) => (
                                    <div key={item} className="text-sm text-gray-500">{item}</div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Newsletter */}
                {showNewsletter && (
                    <div className="border-t border-gray-200 py-8 mb-4">
                        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center gap-4'}`}>
                            <div className="text-sm font-medium text-gray-900">Subscribe to our newsletter</div>
                            <div className="flex gap-2 flex-1 max-w-md">
                                <div className="flex-1 h-9 bg-gray-100 border border-gray-200 px-3 flex items-center text-sm text-gray-400">
                                    Enter your email
                                </div>
                                <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium">Subscribe</div>
                            </div>
                        </div>
                    </div>
                )}

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
                    <div className="flex gap-4">
                        {['Privacy', 'Terms', 'Cookies'].map((link) => (
                            <span key={link} className="text-xs text-gray-500">{link}</span>
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
    },
}
