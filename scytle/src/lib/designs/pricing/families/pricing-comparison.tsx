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
import { EditableIcon } from '@/components/wireframe/editable-icon'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const plans = Number(controls?.plans ?? 3)
    const featureCount = Number(controls?.featureCount ?? 6)

    const planNames = (content?.planNames as string[]) ?? ['Basic', 'Pro', 'Enterprise']
    const planPrices = (content?.planPrices as string[]) ?? ['$9', '$29', '$99']
    const checkIcon = (content?.checkIcon as string) || 'Check'
    const uncheckIcon = (content?.uncheckIcon as string) || 'Minus'
    const periodLabel = (content?.periodLabel as string) || '/mo'
    const buttonText = (content?.buttonText as string) || 'Choose'
    const featuresLabel = (content?.featuresLabel as string) || 'Features'
    const featureNames = (content?.featureNames as string[]) ?? Array.from({ length: featureCount }, (_, i) => `Feature ${i + 1}`)

    const features = Array.from({ length: featureCount }, (_, i) => ({
        name: featureNames[i] || `Feature ${i + 1}`,
        availability: Array.from({ length: plans }, (_, p) => i < 3 + p * 2),
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
                    {planNames.slice(0, plans).map((plan, p) => (
                        <div key={p} className="border border-gray-200 rounded-lg p-4">
                            <EditableText
                                value={plan}
                                onChange={(v) => {
                                    const updated = [...planNames]
                                    updated[p] = v
                                    onContentChange?.('planNames', updated)
                                }}
                                as="div"
                                className="font-semibold text-gray-900 text-sm"
                                editable={editable}
                            />
                            <div className="font-bold text-gray-900 text-xl mt-1 flex items-baseline gap-0.5">
                                <EditableText
                                    value={planPrices[p] || '$X'}
                                    onChange={(v) => {
                                        const updated = [...planPrices]
                                        updated[p] = v
                                        onContentChange?.('planPrices', updated)
                                    }}
                                    as="span"
                                    className=""
                                    editable={editable}
                                />
                                <EditableText
                                    value={periodLabel}
                                    onChange={(v) => onContentChange?.('periodLabel', v)}
                                    as="span"
                                    className="text-sm font-normal text-gray-500"
                                    editable={editable}
                                />
                            </div>
                            <div className="mt-3 space-y-2">
                                {features.filter((_, i) => i < 3 + p * 2).map((f, i) => (
                                    <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                        <EditableIcon
                                            iconName={checkIcon}
                                            onChange={(name) => onContentChange?.('checkIcon', name)}
                                            editable={editable}
                                            size="sm"
                                            className="w-5 h-5"
                                            iconClassName="w-3 h-3 text-gray-400"
                                        />
                                        <EditableText
                                            value={f.name}
                                            onChange={(v) => {
                                                const updated = [...featureNames]
                                                const idx = features.indexOf(f)
                                                updated[idx] = v
                                                onContentChange?.('featureNames', updated)
                                            }}
                                            as="span"
                                            className=""
                                            editable={editable}
                                        />
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
                        style={{ gridTemplateColumns: `2fr ${planNames.slice(0, plans).map(() => '1fr').join(' ')}` }}
                    >
                        <div className="p-4 text-sm font-medium text-gray-500">
                            <EditableText
                                value={featuresLabel}
                                onChange={(v) => onContentChange?.('featuresLabel', v)}
                                as="span"
                                className=""
                                editable={editable}
                            />
                        </div>
                        {planNames.slice(0, plans).map((name, p) => (
                            <div key={p} className="p-4 text-center">
                                <EditableText
                                    value={name}
                                    onChange={(v) => {
                                        const updated = [...planNames]
                                        updated[p] = v
                                        onContentChange?.('planNames', updated)
                                    }}
                                    as="div"
                                    className="font-semibold text-gray-900 text-sm"
                                    editable={editable}
                                />
                                <div className="font-bold text-gray-900 text-lg flex items-baseline justify-center gap-0.5">
                                    <EditableText
                                        value={planPrices[p] || '$X'}
                                        onChange={(v) => {
                                            const updated = [...planPrices]
                                            updated[p] = v
                                            onContentChange?.('planPrices', updated)
                                        }}
                                        as="span"
                                        className=""
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={periodLabel}
                                        onChange={(v) => onContentChange?.('periodLabel', v)}
                                        as="span"
                                        className="text-xs text-gray-500"
                                        editable={editable}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Feature Rows */}
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className={`grid ${i < featureCount - 1 ? 'border-b border-gray-100' : ''}`}
                            style={{ gridTemplateColumns: `2fr ${planNames.slice(0, plans).map(() => '1fr').join(' ')}` }}
                        >
                            <div className="p-4 text-sm text-gray-700">
                                <EditableText
                                    value={feature.name}
                                    onChange={(v) => {
                                        const updated = [...featureNames]
                                        updated[i] = v
                                        onContentChange?.('featureNames', updated)
                                    }}
                                    as="span"
                                    className=""
                                    editable={editable}
                                />
                            </div>
                            {feature.availability.map((available, p) => (
                                <div key={p} className="p-4 flex items-center justify-center">
                                    <EditableIcon
                                        iconName={available ? checkIcon : uncheckIcon}
                                        onChange={(name) => onContentChange?.(available ? 'checkIcon' : 'uncheckIcon', name)}
                                        editable={editable}
                                        size="sm"
                                        className={`w-5 h-5 ${available ? '' : 'opacity-30'}`}
                                        iconClassName={`w-3 h-3 ${available ? 'text-gray-700' : 'text-gray-400'}`}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* CTA Row */}
                    <div className="grid border-t border-gray-200 bg-gray-50"
                        style={{ gridTemplateColumns: `2fr ${planNames.slice(0, plans).map(() => '1fr').join(' ')}` }}
                    >
                        <div className="p-4" />
                        {planNames.slice(0, plans).map((_, p) => (
                            <div key={p} className="p-4 flex justify-center">
                                <EditableText
                                    value={buttonText}
                                    onChange={(v) => onContentChange?.('buttonText', v)}
                                    as="div"
                                    className="border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium"
                                    editable={editable}
                                />
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
        checkIcon: 'Check',
        uncheckIcon: 'Minus',
        planNames: ['Basic', 'Pro', 'Enterprise'],
        planPrices: ['$9', '$29', '$99'],
        periodLabel: '/mo',
        buttonText: 'Choose',
        featuresLabel: 'Features',
    },
}
