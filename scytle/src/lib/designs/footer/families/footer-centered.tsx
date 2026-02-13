'use client'

/**
 * Footer Centered Family — Everything centered: logo, links, copyright.
 *
 * Controls:
 * - showSocial: boolean
 * - showLogo: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { EditableIcon } from '@/components/wireframe/editable-icon'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const showSocial = controls?.showSocial !== false
    const showLogo = controls?.showLogo !== false

    const socialIcons = (content?.socialIcons as string[]) ?? ['Globe', 'Heart', 'Camera', 'Star', 'Play']

    const navLinks = (content?.navLinks as string[]) ?? ['Link One', 'Link Two', 'Link Three', 'Link Four', 'Link Five']

    return (
        <footer className={`bg-white border-t border-gray-200 ${isMobile ? 'px-4 py-10' : 'px-16 py-14'}`}>
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
                {/* Logo */}
                {showLogo && (
                    <div className="font-bold text-lg text-gray-900">
                        <EditableText
                            value={(content?.logo as string) || 'Logo'}
                            onChange={(v) => onContentChange?.('logo', v)}
                            as="span"
                            editable={editable}
                        />
                    </div>
                )}

                {/* Centered Links */}
                <div className={`flex ${isMobile ? 'flex-wrap justify-center' : 'items-center'} gap-5`}>
                    {navLinks.map((link, i) => (
                        <EditableText
                            key={i}
                            value={link}
                            onChange={(v) => {
                                const updated = [...navLinks]
                                updated[i] = v
                                onContentChange?.('navLinks', updated)
                            }}
                            as="span"
                            className="text-sm text-gray-600 whitespace-nowrap"
                            editable={editable}
                        />
                    ))}
                </div>

                {/* Social Icons */}
                {showSocial && (
                    <div className="flex gap-3">
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

                {/* Divider + Copyright */}
                <div className="w-full border-t border-gray-200 pt-6">
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
            </div>
        </footer>
    )
}

export const FooterCenteredFamily: TemplateFamily = {
    id: 'footer-centered',
    category: 'footer',
    name: 'Centered Footer',
    description: 'Everything centered — logo, links, social, copyright',
    tags: ['centered', 'minimal', 'clean', 'footer'],
    Canvas,
    controlsDef: [
        {
            key: 'showLogo',
            label: 'Show Logo',
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
        showLogo: true,
        showSocial: true,
    },
    defaultContent: {
        logo: 'Logo',
        companyName: 'Company',
        copyrightPrefix: '© 2024',
        copyrightSuffix: '. All rights reserved.',
        navLinks: ['Link One', 'Link Two', 'Link Three', 'Link Four', 'Link Five'],
        socialIcons: ['Globe', 'Heart', 'Camera', 'Star', 'Play'],
    },
}
