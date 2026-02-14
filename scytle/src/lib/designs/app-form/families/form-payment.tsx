'use client'

/**
 * Form Payment Family — Payment / billing form.
 *
 * Figma ref: Form 9 (node 4174:139387)
 * Layout: "Payment method" heading + subtitle, Name on invoice, Card number
 * (with card icon + help), Expiry/CVV side-by-side, Email (with icon + help),
 * Country dropdown, Street address, City/State/ZIP (3-col),
 * "Choose your plan" section with radio options, Save button.
 *
 * Controls:
 *  - showPlan: boolean
 *  - showAddress: boolean
 *  - planCount: '2' | '3' | '4'
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function InputField({ label, placeholder, icon, helpIcon }: { label: string; placeholder?: string; icon?: boolean; helpIcon?: boolean }) {
    return (
        <div className="space-y-2">
            <span className="text-sm text-gray-500">{label}</span>
            <div className="flex items-center gap-2 border-b border-gray-300 h-10">
                {icon && (
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={1.5} />
                        <path strokeLinecap="round" strokeWidth={1.5} d="M2 10h20" />
                    </svg>
                )}
                {placeholder && <span className="text-sm text-gray-300 flex-1">{placeholder}</span>}
                {!placeholder && <span className="flex-1" />}
                {helpIcon && (
                    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-4m0-4h.01" />
                    </svg>
                )}
            </div>
        </div>
    )
}

function Canvas({ content, controls, onContentChange, editable }: CanvasProps) {
    const showPlan = controls?.showPlan !== false
    const showAddress = controls?.showAddress !== false
    const planCount = Number(controls?.planCount ?? 3)

    const plans = [
        { name: 'Basic plan', price: '$10/mo', desc: 'Lorem ipsum dolor sit amet' },
        { name: 'Business plan', price: '$20/mo', desc: 'Lorem ipsum dolor sit amet' },
        { name: 'Enterprise plan', price: '$40/mo', desc: 'Lorem ipsum dolor sit amet' },
        { name: 'Custom plan', price: 'Contact us', desc: 'Lorem ipsum dolor sit amet' },
    ].slice(0, planCount)

    return (
        <section className="py-8 px-6 max-w-2xl">
            {/* Heading */}
            <EditableText
                value={(content?.heading as string) || 'Payment method'}
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

            <div className="space-y-6">
                {/* Name on invoice */}
                <InputField label="Name on invoice" />

                {/* Card number */}
                <InputField label="Card number" icon helpIcon />

                {/* Expiry / CVV — side by side per Figma */}
                <div className="grid grid-cols-2 gap-4">
                    <InputField label="Expiry" />
                    <div className="space-y-2">
                        <span className="text-sm text-gray-500">CVV</span>
                        <div className="flex items-center gap-2 border-b border-gray-300 h-10">
                            <span className="flex-1" />
                            <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-4m0-4h.01" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Email */}
                <InputField label="Email address" placeholder="email@example.com" icon helpIcon />

                {/* Address section */}
                {showAddress && (
                    <>
                        {/* Country dropdown */}
                        <div className="space-y-2">
                            <span className="text-sm text-gray-500">Country</span>
                            <div className="flex items-center justify-between border-b border-gray-300 h-10">
                                <span className="text-sm text-gray-700">United States</span>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Street address */}
                        <InputField label="Street address" />

                        {/* City / State / ZIP — 3-col per Figma */}
                        <div className="grid grid-cols-3 gap-4">
                            <InputField label="City" />
                            <InputField label="State / Province" />
                            <InputField label="ZIP / Postal code" />
                        </div>
                    </>
                )}

                {/* Choose your plan */}
                {showPlan && (
                    <div className="pt-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Choose your plan</h3>
                        <p className="text-sm text-gray-500 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.</p>
                        <div className="space-y-3">
                            {plans.map((plan, i) => (
                                <div key={i} className="flex items-start gap-3 py-3">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{plan.desc}</div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 shrink-0">{plan.price}</span>
                                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 ${i === 0 ? 'border-gray-800 bg-gray-800' : 'border-gray-300'}`}>
                                        {i === 0 && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[1px]" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Save button — right-aligned */}
            <div className="flex justify-end mt-10 pt-6 border-t border-gray-100">
                <div className="h-10 px-6 bg-gray-700 rounded flex items-center justify-center text-white text-sm font-medium">
                    Save
                </div>
            </div>
        </section>
    )
}

export const FormPaymentFamily: TemplateFamily = {
    id: 'form-payment',
    category: 'app-form',
    name: 'Payment Form',
    description: 'Payment / billing form with card details, address, and plan selection',
    tags: ['form', 'payment', 'billing', 'card', 'checkout'],
    Canvas,
    hasForm: true,
    controlsDef: [
        { key: 'showAddress', label: 'Address Fields', type: 'switch', defaultValue: true },
        { key: 'showPlan', label: 'Plan Selection', type: 'switch', defaultValue: true },
        {
            key: 'planCount',
            label: 'Plan Options',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
            showWhen: { key: 'showPlan', value: true },
        },
    ],
    defaultControls: {
        showAddress: true,
        showPlan: true,
        planCount: '3',
    },
    defaultContent: {
        heading: 'Payment method',
        subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
    },
}
