'use client'

/**
 * Footer Simple Family — Single-row minimal footer.
 *
 * Controls:
 * - showSocial: boolean
 * - showLegal: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const showSocial = controls?.showSocial !== false
    const showLegal = controls?.showLegal !== false

    return (
        <footer className={`bg-white border-t border-gray-200 ${isMobile ? 'px-4 py-6' : 'px-16 py-6'}`}>
            <div className="max-w-7xl mx-auto">
                <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'}`}>
                    {/* Logo & Copyright */}
                    <div className="flex items-center gap-4">
                        <div className="font-bold text-sm text-gray-900">
                            <EditableText
                                value={(content?.logo as string) || 'Logo'}
                                onChange={(v) => onContentChange?.('logo', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                        <div className="text-xs text-gray-400">
                            © 2024 <EditableText
                                value={(content?.companyName as string) || 'Company'}
                                onChange={(v) => onContentChange?.('companyName', v)}
                                as="span"
                                editable={editable}
                            />. All rights reserved.
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-6">
                        {showLegal && (
                            <div className="flex items-center gap-4">
                                {['Privacy', 'Terms', 'Cookies'].map((link) => (
                                    <span key={link} className="text-xs text-gray-500">{link}</span>
                                ))}
                            </div>
                        )}
                        {showSocial && (
                            <div className="flex gap-2">
                                {['FB', 'TW', 'IG'].map((s) => (
                                    <div key={s} className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-[7px] text-gray-500">
                                        {s}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export const FooterSimpleFamily: TemplateFamily = {
    id: 'footer-simple',
    category: 'footer',
    name: 'Simple Footer',
    description: 'Minimal single-row footer',
    tags: ['simple', 'minimal', 'single-row', 'footer'],
    Canvas,
    controlsDef: [
        {
            key: 'showSocial',
            label: 'Show Social Icons',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showLegal',
            label: 'Show Legal Links',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        showSocial: true,
        showLegal: true,
    },
    defaultContent: {
        logo: 'Logo',
        companyName: 'Company',
    },
}
