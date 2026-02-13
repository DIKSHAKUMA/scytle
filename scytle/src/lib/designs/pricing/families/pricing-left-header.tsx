'use client'

/**
 * Pricing Left Header Family — Left-aligned heading + pricing cards below.
 *
 * Controls:
 * - planCount: 2 | 3 | 4
 * - showToggle: boolean
 * - showDescription: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { EditableIcon } from '@/components/wireframe/editable-icon'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const planCount = (controls?.planCount as number) || 3
    const showToggle = controls?.showToggle !== false
    const showDescription = controls?.showDescription !== false
    const checkIcon = (content?.checkIcon as string) || 'Check'

    const plans = [
        {
            name: 'Basic plan',
            price: '$19',
            desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing',
            features: ['Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here'],
            highlighted: false,
        },
        {
            name: 'Business plan',
            price: '$29',
            desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing',
            features: ['Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here'],
            highlighted: true,
        },
        {
            name: 'Enterprise plan',
            price: '$49',
            desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing',
            features: ['Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here'],
            highlighted: false,
        },
        {
            name: 'Premium plan',
            price: '$99',
            desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing',
            features: ['Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here'],
            highlighted: false,
        },
    ].slice(0, planCount)

    const gridCols = isMobile
        ? 'grid-cols-1'
        : isTablet
            ? 'grid-cols-2'
            : planCount === 2
                ? 'grid-cols-2'
                : planCount === 3
                    ? 'grid-cols-3'
                    : 'grid-cols-4'

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header — left aligned with optional toggle on right */}
                <div className={`${isMobile ? 'space-y-4' : 'flex items-end justify-between'} mb-10`}>
                    <div className={`${isMobile ? '' : 'max-w-lg'}`}>
                        <EditableText
                            value={(content?.tagline as string) || 'Tagline'}
                            onChange={(v) => onContentChange?.('tagline', v)}
                            as="p"
                            className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.heading as string) || 'Pricing plan'}
                            onChange={(v) => onContentChange?.('heading', v)}
                            as="h2"
                            className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                            editable={editable}
                        />
                        {showDescription && (
                            <EditableText
                                value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                                onChange={(v) => onContentChange?.('subheading', v)}
                                as="p"
                                className="text-gray-500 mt-3 leading-relaxed"
                                editable={editable}
                                multiline
                            />
                        )}
                    </div>

                    {showToggle && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-900">Monthly</span>
                            <div className="w-10 h-5 bg-gray-900 rounded-full relative">
                                <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
                            </div>
                            <span className="text-sm text-gray-500">Yearly</span>
                        </div>
                    )}
                </div>

                {/* Plan Cards Grid */}
                <div className={`grid ${gridCols} gap-6`}>
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`rounded-lg p-6 ${plan.highlighted
                                ? 'border-2 border-gray-900 bg-white'
                                : 'border border-gray-200 bg-white'
                                }`}
                        >
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-900 text-base mb-1">{plan.name}</h3>
                                <p className="text-sm text-gray-500">{plan.desc}</p>
                            </div>
                            <div className={`font-bold text-gray-900 mb-4 ${isMobile ? 'text-3xl' : 'text-5xl'}`}>
                                {plan.price}<span className="text-base font-normal text-gray-400">/mo</span>
                            </div>
                            <div className="bg-gray-800 text-white text-center py-2.5 text-sm font-medium mb-6">
                                Get started
                            </div>
                            <div className="space-y-3">
                                {plan.features.map((feature, fi) => (
                                    <div key={fi} className="flex items-center gap-2 text-sm text-gray-600">
                                        <EditableIcon
                                            iconName={checkIcon}
                                            onChange={(name) => onContentChange?.('checkIcon', name)}
                                            editable={editable}
                                            size="sm"
                                            className="w-5 h-5"
                                            iconClassName="w-3 h-3 text-gray-400"
                                        />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const PricingLeftHeaderFamily: TemplateFamily = {
    id: 'pricing-left-header',
    category: 'pricing',
    name: 'Pricing Left Header',
    description: 'Left-aligned heading with pricing cards grid below',
    tags: ['left-aligned', 'header', 'cards', 'pricing', 'toggle'],
    Canvas,
    controlsDef: [
        {
            key: 'planCount',
            label: 'Number of Plans',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
        },
        {
            key: 'showToggle',
            label: 'Show Toggle',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showDescription',
            label: 'Show Description',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        planCount: 3,
        showToggle: true,
        showDescription: true,
    },
    defaultContent: {
        tagline: 'Tagline',
        heading: 'Pricing plan',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        checkIcon: 'Check',
    },
}
