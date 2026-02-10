'use client'

/**
 * Pricing Comparison Family — Feature comparison table.
 *
 * Controls:
 * - plans: 2 | 3
 * - featureCount: 4 | 6 | 8
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const plans = Number(controls?.plans ?? 3)
    const featureCount = Number(controls?.featureCount ?? 6)

    const planNames = ['Basic', 'Pro', 'Enterprise'].slice(0, plans)
    const planPrices = ['$9', '$29', '$99'].slice(0, plans)

    const features = Array.from({ length: featureCount }, (_, i) => ({
        name: `Feature ${i + 1}`,
        availability: planNames.map((_, p) => i < 3 + p * 2), // Progressive feature access
    }))

    if (isMobile) {
        // Simplified card layout for mobile
        return (
            <section className="py-12 px-4">
                <div className="text-center mb-8">
                    <EditableText
                        value={(content?.heading as string) || 'Compare plans'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className="font-bold text-gray-900 text-xl mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'See which plan is right for you.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-500 text-sm"
                        editable={editable}
                        multiline
                    />
                </div>
                <div className="space-y-4">
                    {planNames.map((plan, p) => (
                        <div key={p} className="border border-gray-200 rounded-lg p-4">
                            <div className="font-semibold text-gray-900 text-sm">{plan}</div>
                            <div className="font-bold text-gray-900 text-xl mt-1">{planPrices[p]}/mo</div>
                            <div className="mt-3 space-y-2">
                                {features.filter((_, i) => i < 3 + p * 2).map((f, i) => (
                                    <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                        <div className="w-3 h-3 bg-gray-300 rounded-full" />
                                        {f.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    return (
        <section className={`${isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-5xl mx-auto">
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
                        value={(content?.heading as string) || 'Compare plans'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className="font-bold text-gray-900 text-3xl mb-3"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'See which plan is right for you.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-500"
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Comparison Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="grid border-b border-gray-200 bg-gray-50"
                        style={{ gridTemplateColumns: `2fr ${planNames.map(() => '1fr').join(' ')}` }}
                    >
                        <div className="p-4 text-sm font-medium text-gray-500">Features</div>
                        {planNames.map((name, p) => (
                            <div key={p} className="p-4 text-center">
                                <div className="font-semibold text-gray-900 text-sm">{name}</div>
                                <div className="font-bold text-gray-900 text-lg">{planPrices[p]}<span className="text-xs text-gray-500">/mo</span></div>
                            </div>
                        ))}
                    </div>

                    {/* Feature Rows */}
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className={`grid ${i < featureCount - 1 ? 'border-b border-gray-100' : ''}`}
                            style={{ gridTemplateColumns: `2fr ${planNames.map(() => '1fr').join(' ')}` }}
                        >
                            <div className="p-4 text-sm text-gray-700">{feature.name}</div>
                            {feature.availability.map((available, p) => (
                                <div key={p} className="p-4 flex items-center justify-center">
                                    <div className={`w-4 h-4 rounded-full ${available ? 'bg-gray-800' : 'bg-gray-200'}`} />
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* CTA Row */}
                    <div className="grid border-t border-gray-200 bg-gray-50"
                        style={{ gridTemplateColumns: `2fr ${planNames.map(() => '1fr').join(' ')}` }}
                    >
                        <div className="p-4" />
                        {planNames.map((_, p) => (
                            <div key={p} className="p-4 flex justify-center">
                                <div className="border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium">
                                    Choose
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export const PricingComparisonFamily: TemplateFamily = {
    id: 'pricing-comparison',
    category: 'pricing',
    name: 'Pricing Comparison',
    description: 'Feature comparison table across plans',
    tags: ['comparison', 'table', 'features', 'pricing'],
    Canvas,
    controlsDef: [
        {
            key: 'plans',
            label: 'Plans',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
            ],
            defaultValue: '3',
        },
        {
            key: 'featureCount',
            label: 'Features',
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
        plans: '3',
        featureCount: '6',
    },
    defaultContent: {
        tagline: 'Pricing',
        heading: 'Compare plans',
        subheading: 'See which plan is right for you.',
    },
}
