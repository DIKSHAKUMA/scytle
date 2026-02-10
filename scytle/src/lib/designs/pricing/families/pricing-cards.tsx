'use client'

/**
 * Pricing Cards Family — Side-by-side pricing tier cards.
 *
 * Controls:
 * - plans: 2 | 3 | 4
 * - showToggle: boolean (monthly/annual toggle)
 * - highlightPlan: 1 | 2 | 3 (which plan to highlight, 0=none)
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const plans = Number(controls?.plans ?? 3)
    const showToggle = controls?.showToggle !== false
    const highlightPlan = Number(controls?.highlightPlan ?? 2)

    const gridCols = isMobile ? 1 : isTablet ? Math.min(plans, 2) : plans

    const planData = Array.from({ length: plans }, (_, i) => ({
        name: ['Basic', 'Pro', 'Enterprise', 'Premium'][i] || `Plan ${i + 1}`,
        price: ['$9', '$29', '$99', '$199'][i] || '$XX',
        description: 'Lorem ipsum dolor sit amet',
        features: Array.from({ length: 4 + i }, (_, f) => `Feature ${f + 1}`),
    }))

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Pricing'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Simple, transparent pricing'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'} mb-3`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Choose the plan that fits your needs.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-500"
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Toggle */}
                {showToggle && (
                    <div className="flex items-center justify-center gap-3 mb-10">
                        <span className="text-sm text-gray-500">Monthly</span>
                        <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                            <div className="w-4 h-4 bg-white border border-gray-300 rounded-full absolute top-0.5 left-0.5" />
                        </div>
                        <span className="text-sm text-gray-500">Annual</span>
                    </div>
                )}

                {/* Pricing Cards */}
                <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {planData.map((plan, i) => {
                        const isHighlighted = highlightPlan === i + 1
                        return (
                            <div
                                key={i}
                                className={`border rounded-lg p-6 flex flex-col ${isHighlighted
                                    ? 'border-gray-800 ring-1 ring-gray-800'
                                    : 'border-gray-200'
                                    }`}
                            >
                                <div className="mb-4">
                                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{plan.name}</h3>
                                    <p className="text-gray-500 text-xs">{plan.description}</p>
                                </div>
                                <div className="mb-6">
                                    <span className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                                        {plan.price}
                                    </span>
                                    <span className="text-gray-500 text-sm">/month</span>
                                </div>
                                <div className="space-y-2.5 mb-6 flex-1">
                                    {plan.features.map((feature, f) => (
                                        <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="w-4 h-4 bg-gray-200 rounded-full flex-shrink-0" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                                <div className={`text-center py-2.5 text-sm font-medium ${isHighlighted
                                    ? 'bg-gray-800 text-white'
                                    : 'border border-gray-300 text-gray-700'
                                    }`}>
                                    Get Started
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export const PricingCardsFamily: TemplateFamily = {
    id: 'pricing-cards',
    category: 'pricing',
    name: 'Pricing Cards',
    description: 'Side-by-side pricing tier cards',
    tags: ['cards', 'tiers', 'plans', 'pricing'],
    Canvas,
    controlsDef: [
        {
            key: 'plans',
            label: 'Plans',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
        },
        {
            key: 'highlightPlan',
            label: 'Highlight Plan',
            type: 'toggle-group',
            options: [
                { value: '0', label: 'None' },
                { value: '1', label: '1st' },
                { value: '2', label: '2nd' },
                { value: '3', label: '3rd' },
            ],
            defaultValue: '2',
        },
        {
            key: 'showToggle',
            label: 'Billing Toggle',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        plans: '3',
        highlightPlan: '2',
        showToggle: true,
    },
    defaultContent: {
        tagline: 'Pricing',
        heading: 'Simple, transparent pricing',
        subheading: 'Choose the plan that fits your needs.',
    },
}
