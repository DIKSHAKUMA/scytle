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
import { EditableIcon } from '@/components/wireframe/editable-icon'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const showSocial = controls?.showSocial !== false
    const showLegal = controls?.showLegal !== false

    const socialIcons = (content?.socialIcons as string[]) ?? ['Globe', 'Heart', 'Camera', 'Star', 'Play']
    const legalLinks = (content?.legalLinks as string[]) ?? ['Privacy', 'Terms', 'Cookies']

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
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-6">
                        {showLegal && (
                            <div className="flex items-center gap-4">
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
                        )}
                        {showSocial && (
                            <div className="flex gap-2">
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
        copyrightPrefix: '© 2024',
        copyrightSuffix: '. All rights reserved.',
        legalLinks: ['Privacy', 'Terms', 'Cookies'],
        socialIcons: ['Globe', 'Heart', 'Camera', 'Star', 'Play'],
    },
}
