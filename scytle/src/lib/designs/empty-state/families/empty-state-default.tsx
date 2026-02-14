'use client'

/**
 * Empty State Default Family — Generic empty state placeholder.
 *
 * Shows a centered illustration placeholder, heading, description, and
 * optional CTA button. Used when a page/section has no content yet.
 *
 * Controls:
 *  - showIcon: boolean
 *  - showCTA: boolean
 *  - ctaCount: '1' | '2'
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, onContentChange, editable }: CanvasProps) {
    const showIcon = controls?.showIcon !== false
    const showCTA = controls?.showCTA !== false
    const ctaCount = Number(controls?.ctaCount ?? 1)

    return (
        <section className="flex flex-col items-center justify-center py-16 px-6 min-h-[320px]">
            {/* Icon / illustration placeholder */}
            {showIcon && (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
            )}

            {/* Heading */}
            <EditableText
                value={(content?.heading as string) || 'No data yet'}
                onChange={(v) => onContentChange?.('heading', v)}
                as="h3"
                className="text-lg font-semibold text-gray-900 mb-2 text-center"
                editable={editable}
            />
            <EditableText
                value={(content?.subtitle as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Get started by creating your first item.'}
                onChange={(v) => onContentChange?.('subtitle', v)}
                as="p"
                className="text-sm text-gray-500 text-center max-w-sm mb-6"
                editable={editable}
            />

            {/* CTA buttons */}
            {showCTA && (
                <div className="flex items-center gap-3">
                    <div className="h-10 px-5 bg-gray-700 rounded flex items-center justify-center text-white text-sm font-medium">
                        Get started
                    </div>
                    {ctaCount >= 2 && (
                        <div className="h-10 px-5 border border-gray-300 rounded flex items-center justify-center text-gray-700 text-sm font-medium">
                            Learn more
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}

export const EmptyStateDefaultFamily: TemplateFamily = {
    id: 'empty-state-default',
    category: 'empty-state',
    name: 'Empty State',
    description: 'Generic empty state with icon, message, and optional CTA',
    tags: ['empty', 'placeholder', 'no-data', 'blank', 'zero-state'],
    Canvas,
    controlsDef: [
        { key: 'showIcon', label: 'Icon', type: 'switch', defaultValue: true },
        { key: 'showCTA', label: 'CTA Button', type: 'switch', defaultValue: true },
        {
            key: 'ctaCount',
            label: 'Buttons',
            type: 'toggle-group',
            options: [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
            ],
            defaultValue: '1',
            showWhen: { key: 'showCTA', value: true },
        },
    ],
    defaultControls: {
        showIcon: true,
        showCTA: true,
        ctaCount: '1',
    },
    defaultContent: {
        heading: 'No data yet',
        subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Get started by creating your first item.',
    },
}
