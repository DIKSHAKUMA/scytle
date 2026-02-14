'use client'

/**
 * Form Preferences Family — Notification / settings preferences form.
 *
 * Figma ref: Form 13 (node 4174:139785)
 * Layout: "Notifications" heading + subtitle.
 * Sections:
 *  1. "Choose where you get notified" — toggle switches (3 items)
 *  2. "By Email" — checkboxes (3 items, first checked)
 *  3. "Choose frequency" — radio buttons (Daily selected, Weekly, Monthly)
 * Save button at bottom-right.
 *
 * Controls:
 *  - showToggles: boolean
 *  - showCheckboxes: boolean
 *  - showRadios: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function ToggleSwitch({ on }: { on: boolean }) {
    return (
        <div className={`w-9 h-5 rounded-full relative shrink-0 ${on ? 'bg-gray-800' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
        </div>
    )
}

function Checkbox({ checked }: { checked: boolean }) {
    return (
        <div className={`w-4 h-4 rounded shrink-0 flex items-center justify-center ${checked ? 'bg-gray-800' : 'border border-gray-300'}`}>
            {checked && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
    )
}

function Radio({ selected }: { selected: boolean }) {
    return (
        <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${selected ? 'border-gray-800' : 'border-gray-300'}`}>
            {selected && <div className="w-2 h-2 rounded-full bg-gray-800" />}
        </div>
    )
}

function Canvas({ content, controls, onContentChange, editable }: CanvasProps) {
    const showToggles = controls?.showToggles !== false
    const showCheckboxes = controls?.showCheckboxes !== false
    const showRadios = controls?.showRadios !== false

    const toggleItems = [
        { label: 'Push notifications', desc: 'Lorem ipsum dolor sit amet', on: true },
        { label: 'Email notifications', desc: 'Lorem ipsum dolor sit amet', on: true },
        { label: 'SMS notifications', desc: 'Lorem ipsum dolor sit amet', on: false },
    ]

    const checkItems = [
        { label: 'Comments', desc: 'Lorem ipsum dolor sit amet', checked: true },
        { label: 'Candidates', desc: 'Lorem ipsum dolor sit amet', checked: false },
        { label: 'Offers', desc: 'Lorem ipsum dolor sit amet', checked: false },
    ]

    const radioItems = [
        { label: 'Daily', selected: true },
        { label: 'Weekly', selected: false },
        { label: 'Monthly', selected: false },
    ]

    return (
        <section className="py-8 px-6 max-w-2xl">
            {/* Heading */}
            <EditableText
                value={(content?.heading as string) || 'Notifications'}
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

            <div className="space-y-10">
                {/* Toggle switches section */}
                {showToggles && (
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Choose where you get notified</h3>
                        <p className="text-sm text-gray-500 mb-5">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.</p>
                        <div className="space-y-4">
                            {toggleItems.map((item, i) => (
                                <div key={i} className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900">{item.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                                    </div>
                                    <ToggleSwitch on={item.on} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Checkboxes section */}
                {showCheckboxes && (
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">By Email</h3>
                        <p className="text-sm text-gray-500 mb-5">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.</p>
                        <div className="space-y-4">
                            {checkItems.map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <Checkbox checked={item.checked} />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900">{item.label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Radio buttons section */}
                {showRadios && (
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">Choose frequency</h3>
                        <p className="text-sm text-gray-500 mb-5">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.</p>
                        <div className="space-y-3">
                            {radioItems.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Radio selected={item.selected} />
                                    <span className="text-sm text-gray-900">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Save button */}
            <div className="flex justify-end mt-10 pt-6 border-t border-gray-100">
                <div className="h-10 px-6 bg-gray-700 rounded flex items-center justify-center text-white text-sm font-medium">
                    Save
                </div>
            </div>
        </section>
    )
}

export const FormPreferencesFamily: TemplateFamily = {
    id: 'form-preferences',
    category: 'app-form',
    name: 'Preferences Form',
    description: 'Notification settings with toggles, checkboxes, and radio groups',
    tags: ['form', 'preferences', 'notifications', 'settings', 'toggles'],
    Canvas,
    hasForm: true,
    controlsDef: [
        { key: 'showToggles', label: 'Toggle Switches', type: 'switch', defaultValue: true },
        { key: 'showCheckboxes', label: 'Checkboxes', type: 'switch', defaultValue: true },
        { key: 'showRadios', label: 'Radio Buttons', type: 'switch', defaultValue: true },
    ],
    defaultControls: {
        showToggles: true,
        showCheckboxes: true,
        showRadios: true,
    },
    defaultContent: {
        heading: 'Notifications',
        subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
    },
}
