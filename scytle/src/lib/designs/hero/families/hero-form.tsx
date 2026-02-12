'use client'

/**
 * Hero Form Family — Hero with email/signup form.
 * Text content + inline form (email input + submit button) + disclaimer.
 *
 * Covers Relume Headers: 36-39, 42-43, 126-130, 137 (~12 variants)
 *
 * Controls:
 * - layout: centered | split (text positioning)
 * - formStyle: inline | stacked (input + button arrangement)
 * - showDisclaimer: boolean (terms text below form)
 * - showTagline: boolean
 * - showImage: boolean (for split layout)
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const layout = (controls?.layout as string) ?? 'centered'
    const formStyle = (controls?.formStyle as string) ?? 'inline'
    const showDisclaimer = controls?.showDisclaimer !== false
    const showTagline = controls?.showTagline !== false
    const showImage = controls?.showImage === true

    const isSplit = layout === 'split'

    const FormBlock = () => (
        <div className="space-y-3 w-full">
            <div className={`${formStyle === 'stacked' ? 'flex flex-col gap-3' : 'flex gap-3'} ${!isSplit && layout === 'centered' ? 'max-w-md mx-auto' : 'max-w-lg'}`}>
                <div className="flex-1 border border-gray-300 px-4 py-3 text-sm text-gray-400">
                    <EditableText
                        value={(content?.emailPlaceholder as string) || 'Enter your email'}
                        onChange={(v) => onContentChange?.('emailPlaceholder', v)}
                        as="span"
                        editable={editable}
                    />
                </div>
                <div className="bg-gray-800 text-white px-6 py-3 text-sm font-medium shrink-0">
                    <EditableText
                        value={(content?.formCta as string) || 'Sign up'}
                        onChange={(v) => onContentChange?.('formCta', v)}
                        as="span"
                        editable={editable}
                    />
                </div>
            </div>
            {showDisclaimer && (
                <EditableText
                    value={(content?.disclaimer as string) || 'By clicking Sign Up you\'re confirming that you agree with our Terms and Conditions.'}
                    onChange={(v) => onContentChange?.('disclaimer', v)}
                    as="p"
                    className={`text-xs text-gray-400 ${!isSplit && layout === 'centered' ? 'text-center' : ''}`}
                    editable={editable}
                />
            )}
        </div>
    )

    if (isSplit) {
        return (
            <section className={`${isMobile ? 'px-4 py-12' : isTablet ? 'px-8 py-16' : 'px-16 py-20'}`}>
                <div className={`max-w-7xl mx-auto ${isMobile ? 'flex flex-col gap-8' : 'flex items-center gap-16'}`}>
                    {/* Text + Form */}
                    <div className="flex-1 space-y-6">
                        {showTagline && (
                            <EditableText
                                value={(content?.tagline as string) || 'Tagline'}
                                onChange={(v) => onContentChange?.('tagline', v)}
                                as="p"
                                className="text-sm text-gray-400 uppercase tracking-wide"
                                editable={editable}
                            />
                        )}
                        <EditableText
                            value={(content?.heading as string) || 'Medium length hero headline goes here'}
                            onChange={(v) => onContentChange?.('heading', v)}
                            as="h1"
                            className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'} leading-tight`}
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                            onChange={(v) => onContentChange?.('subheading', v)}
                            as="p"
                            className="text-gray-500"
                            editable={editable}
                            multiline
                        />
                        <FormBlock />
                    </div>

                    {/* Image */}
                    {showImage && (
                        <div className={`${isMobile ? 'w-full' : 'flex-1'} aspect-[4/3] bg-gray-100 border border-gray-200 flex items-center justify-center`}>
                            <ImageIcon className="w-12 h-12 text-gray-300" />
                        </div>
                    )}
                </div>
            </section>
        )
    }

    // Centered layout
    return (
        <section className={`${isMobile ? 'px-4 py-12' : isTablet ? 'px-8 py-16' : 'px-16 py-20'}`}>
            <div className="max-w-3xl mx-auto text-center space-y-6">
                {showTagline && (
                    <EditableText
                        value={(content?.tagline as string) || 'Tagline'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide"
                        editable={editable}
                    />
                )}
                <EditableText
                    value={(content?.heading as string) || 'Medium length hero headline goes here'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h1"
                    className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-5xl'} leading-tight`}
                    editable={editable}
                />
                <EditableText
                    value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                    onChange={(v) => onContentChange?.('subheading', v)}
                    as="p"
                    className="text-gray-500 text-lg"
                    editable={editable}
                    multiline
                />
                <FormBlock />
            </div>
        </section>
    )
}

export const HeroFormFamily: TemplateFamily = {
    id: 'hero-form',
    category: 'hero',
    name: 'Form Hero',
    description: 'Hero with email signup form',
    tags: ['form', 'signup', 'email', 'newsletter', 'lead-gen', 'cta'],
    hasForm: true,
    Canvas,
    controlsDef: [
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'centered', label: 'Centered' },
                { value: 'split', label: 'Split' },
            ],
            defaultValue: 'centered',
        },
        {
            key: 'formStyle',
            label: 'Form Style',
            type: 'toggle-group',
            options: [
                { value: 'inline', label: 'Inline' },
                { value: 'stacked', label: 'Stacked' },
            ],
            defaultValue: 'inline',
        },
        {
            key: 'showImage',
            label: 'Show Image',
            type: 'switch',
            defaultValue: false,
            showWhen: { key: 'layout', value: 'split' },
        },
        {
            key: 'showDisclaimer',
            label: 'Show Disclaimer',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showTagline',
            label: 'Show Tagline',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        layout: 'centered',
        formStyle: 'inline',
        showImage: false,
        showDisclaimer: true,
        showTagline: true,
    },
    defaultContent: {
        tagline: 'Tagline',
        heading: 'Medium length hero headline goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        emailPlaceholder: 'Enter your email',
        formCta: 'Sign up',
        disclaimer: 'By clicking Sign Up you\'re confirming that you agree with our Terms and Conditions.',
    },
}
