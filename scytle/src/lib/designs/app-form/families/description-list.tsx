'use client'

/**
 * Description List Family — Read-only account details in label→value grid.
 *
 * Figma ref: Description Lists (node 4174:142227)
 * Layout: "Account" heading + subtitle, grid of label-value pairs with optional
 * "Change" action links. Multiple layout variants:
 *  - stacked: labels above values, full-width rows
 *  - inline: labels left, values right, 2-col grid
 *  - striped: alternating gray/white row backgrounds
 *
 * Controls:
 *  - layout: stacked | inline | striped
 *  - showActions: boolean
 *  - fieldCount: '4' | '6' | '8'
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

const FIELDS = [
    { label: 'Full name', value: 'Name Surname' },
    { label: 'Website', value: 'www.relume.io' },
    { label: 'About', value: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.' },
    { label: 'Email address', value: 'email@example.com' },
    { label: 'Password', value: '••••••••' },
    { label: 'Language', value: 'English' },
    { label: 'Phone', value: '+1 (555) 000-0000' },
    { label: 'Timezone', value: 'Pacific Time (US & Canada)' },
]

function Canvas({ content, controls, onContentChange, editable }: CanvasProps) {
    const layout = (controls?.layout as string) ?? 'inline'
    const showActions = controls?.showActions !== false
    const fieldCount = Number(controls?.fieldCount ?? 6)
    const fields = FIELDS.slice(0, fieldCount)

    return (
        <section className="py-8 px-6 max-w-2xl">
            {/* Heading */}
            <EditableText
                value={(content?.heading as string) || 'Account'}
                onChange={(v) => onContentChange?.('heading', v)}
                as="h2"
                className="text-2xl font-semibold text-gray-900 mb-2"
                editable={editable}
            />
            <EditableText
                value={(content?.subtitle as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'}
                onChange={(v) => onContentChange?.('subtitle', v)}
                as="p"
                className="text-sm text-gray-500 mb-8"
                editable={editable}
            />

            {/* Description list rows */}
            {layout === 'stacked' && (
                <div className="divide-y divide-gray-200">
                    {fields.map((field, i) => (
                        <div key={i} className="py-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <dt className="text-sm font-medium text-gray-500 mb-1">{field.label}</dt>
                                    <dd className="text-sm text-gray-900">{field.value}</dd>
                                </div>
                                {showActions && (
                                    <span className="text-sm text-gray-900 underline shrink-0">Change</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {layout === 'inline' && (
                <div className="divide-y divide-gray-200">
                    {fields.map((field, i) => (
                        <div key={i} className="py-4 grid grid-cols-3 gap-4 items-start">
                            <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                            <dd className="text-sm text-gray-900 col-span-1">{field.value}</dd>
                            {showActions && (
                                <span className="text-sm text-gray-900 underline text-right">Change</span>
                            )}
                            {!showActions && <span />}
                        </div>
                    ))}
                </div>
            )}

            {layout === 'striped' && (
                <div>
                    {fields.map((field, i) => (
                        <div key={i} className={`py-4 px-4 grid grid-cols-3 gap-4 items-start ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
                            <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                            <dd className="text-sm text-gray-900 col-span-1">{field.value}</dd>
                            {showActions && (
                                <span className="text-sm text-gray-900 underline text-right">Change</span>
                            )}
                            {!showActions && <span />}
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export const DescriptionListFamily: TemplateFamily = {
    id: 'description-list',
    category: 'app-form',
    name: 'Description List',
    description: 'Read-only account details in label-value grid with optional edit links',
    tags: ['form', 'description', 'details', 'account', 'profile', 'readonly'],
    Canvas,
    hasForm: false,
    controlsDef: [
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'stacked', label: 'Stacked' },
                { value: 'inline', label: 'Inline' },
                { value: 'striped', label: 'Striped' },
            ],
            defaultValue: 'inline',
        },
        { key: 'showActions', label: 'Change Links', type: 'switch', defaultValue: true },
        {
            key: 'fieldCount',
            label: 'Fields',
            type: 'toggle-group',
            options: [
                { value: '4', label: '4' },
                { value: '6', label: '6' },
                { value: '8', label: '8' },
            ],
            defaultValue: '6',
        },
    ],
    defaultControls: {
        layout: 'inline',
        showActions: true,
        fieldCount: '6',
    },
    defaultContent: {
        heading: 'Account',
        subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
    },
}
