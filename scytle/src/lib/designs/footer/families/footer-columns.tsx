'use client'

/**
 * Footer Columns Family — Multi-column footer with link groups.
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
        <footer className={`bg-white border-t border-gray-200 ${isMobile ? 'px-4 py-8' : isTablet ? 'px-8 py-12' : 'px-16 py-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Link columns */}
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

                {/* Newsletter */}
                {showNewsletter && (
                    <div className="border-t border-gray-200 pt-8 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-gray-900">Subscribe</div>
                            <div className="flex-1 max-w-xs h-9 bg-gray-100 border border-gray-200 px-3 flex items-center text-sm text-gray-400">
                                Enter your email
                            </div>
                            <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium">Subscribe</div>
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

export const FooterColumnsFamily: TemplateFamily = {
    id: 'footer-columns',
    category: 'footer',
    name: 'Column Footer',
    description: 'Multi-column footer with link groups',
    tags: ['columns', 'links', 'classic', 'footer'],
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
        companyName: 'Company',
    },
}
