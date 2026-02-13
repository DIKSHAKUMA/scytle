'use client'

/**
 * Pricing Presets — Named snapshots of Pricing family control values.
 */

import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Pricing 1 Thumbnail: 3 cards with toggle */
function Pricing1Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[7px] font-semibold text-gray-800">Pricing</div>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                    <div className="text-[3px] text-gray-400">Monthly</div>
                    <div className="w-4 h-2 bg-gray-200 rounded-full" />
                    <div className="text-[3px] text-gray-400">Annual</div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {['$9', '$29', '$99'].map((price, i) => (
                    <div key={i} className={`border rounded p-1 flex flex-col ${i === 1 ? 'border-gray-800 ring-0.5 ring-gray-800' : 'border-gray-200'}`}>
                        <div className="text-[3.5px] font-medium text-gray-600 mb-0.5">{['Basic', 'Pro', 'Enterprise'][i]}</div>
                        <div className="text-[7px] font-bold text-gray-900 mb-0.5">{price}</div>
                        <div className="space-y-0.5 flex-1">
                            {Array.from({ length: 3 }).map((_, f) => (
                                <div key={f} className="flex items-center gap-0.5">
                                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <div className="text-[3px] text-gray-500">Feature</div>
                                </div>
                            ))}
                        </div>
                        <div className={`text-center text-[3.5px] py-0.5 mt-0.5 ${i === 1 ? 'bg-gray-800 text-white' : 'border border-gray-300 text-gray-600'}`}>
                            Choose
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Pricing 2 Thumbnail: 2 cards */
function Pricing2Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[7px] font-semibold text-gray-800">Pricing</div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 flex-1">
                {['$9', '$29'].map((price, i) => (
                    <div key={i} className={`border rounded p-1.5 flex flex-col ${i === 1 ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="text-[4px] font-medium text-gray-600 mb-0.5">{['Basic', 'Pro'][i]}</div>
                        <div className="text-[8px] font-bold text-gray-900 mb-1">{price}</div>
                        <div className="space-y-0.5 flex-1">
                            {Array.from({ length: 3 }).map((_, f) => (
                                <div key={f} className="flex items-center gap-0.5">
                                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <div className="text-[3px] text-gray-500">Feature</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Pricing 3 Thumbnail: 4 cards compact */
function Pricing3Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[7px] font-semibold text-gray-800">Pricing</div>
            </div>
            <div className="grid grid-cols-4 gap-0.5 flex-1">
                {['$9', '$19', '$49', '$99'].map((price, i) => (
                    <div key={i} className={`border rounded p-0.5 flex flex-col ${i === 2 ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="text-[3px] font-medium text-gray-600">{['Free', 'Basic', 'Pro', 'Biz'][i]}</div>
                        <div className="text-[6px] font-bold text-gray-900">{price}</div>
                        <div className="space-y-0.5 mt-0.5">
                            {Array.from({ length: 2 }).map((_, f) => (
                                <div key={f} className="flex items-center gap-0.5">
                                    <div className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                                    <div className="text-[2.5px] text-gray-500">Feature</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Pricing 4 Thumbnail: Comparison table */
function Pricing4Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[7px] font-semibold text-gray-800">Compare plans</div>
            </div>
            <div className="border border-gray-200 rounded overflow-hidden flex-1">
                <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200 px-0.5 py-0.5">
                    <div className="text-[3px] text-gray-400">Features</div>
                    <div className="text-[3px] text-gray-600 text-center">Basic</div>
                    <div className="text-[3px] text-gray-600 text-center">Pro</div>
                    <div className="text-[3px] text-gray-600 text-center">Biz</div>
                </div>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-4 border-b border-gray-50 px-0.5 py-0.5">
                        <div className="text-[3px] text-gray-500">Feature {i + 1}</div>
                        <div className="flex justify-center"><div className={`w-1.5 h-1.5 rounded-full ${i < 2 ? 'bg-gray-800' : 'bg-gray-200'}`} /></div>
                        <div className="flex justify-center"><div className={`w-1.5 h-1.5 rounded-full ${i < 3 ? 'bg-gray-800' : 'bg-gray-200'}`} /></div>
                        <div className="flex justify-center"><div className="w-1.5 h-1.5 rounded-full bg-gray-800" /></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Pricing 5 Thumbnail: Comparison 2-plan */
function Pricing5Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[7px] font-semibold text-gray-800">Compare plans</div>
            </div>
            <div className="border border-gray-200 rounded overflow-hidden flex-1">
                <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 px-0.5 py-0.5">
                    <div className="text-[3px] text-gray-400">Features</div>
                    <div className="text-[3px] text-gray-600 text-center">Free</div>
                    <div className="text-[3px] text-gray-600 text-center">Pro</div>
                </div>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="grid grid-cols-3 border-b border-gray-50 px-0.5 py-0.5">
                        <div className="text-[3px] text-gray-500">Feature {i + 1}</div>
                        <div className="flex justify-center"><div className={`w-1.5 h-1.5 rounded-full ${i < 3 ? 'bg-gray-800' : 'bg-gray-200'}`} /></div>
                        <div className="flex justify-center"><div className="w-1.5 h-1.5 rounded-full bg-gray-800" /></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ===== PRESETS =====

/** Pricing 1 — 3-tier cards with toggle */
export const Pricing1Preset: DesignPreset = {
    id: 'pricing-cards-3tier',
    familyId: 'pricing-cards',
    name: 'Pricing 1',
    description: '3-tier pricing with billing toggle',
    controls: {
        plans: '3',
        highlightPlan: '2',
        showToggle: true,
    },
    Thumbnail: Pricing1Thumbnail,
}

/** Pricing 2 — 2-tier cards */
export const Pricing2Preset: DesignPreset = {
    id: 'pricing-cards-2tier',
    familyId: 'pricing-cards',
    name: 'Pricing 2',
    description: '2-tier pricing cards',
    controls: {
        plans: '2',
        highlightPlan: '2',
        showToggle: false,
    },
    Thumbnail: Pricing2Thumbnail,
}

/** Pricing 3 — 4-tier cards */
export const Pricing3Preset: DesignPreset = {
    id: 'pricing-cards-4tier',
    familyId: 'pricing-cards',
    name: 'Pricing 3',
    description: '4-tier compact pricing',
    controls: {
        plans: '4',
        highlightPlan: '3',
        showToggle: true,
    },
    Thumbnail: Pricing3Thumbnail,
}

/** Pricing 4 — Comparison table 3-plan */
export const Pricing4Preset: DesignPreset = {
    id: 'pricing-comparison-3plan',
    familyId: 'pricing-comparison',
    name: 'Pricing 4',
    description: 'Feature comparison, 3 plans',
    controls: {
        plans: '3',
        featureCount: '6',
    },
    Thumbnail: Pricing4Thumbnail,
}

/** Pricing 5 — Comparison table 2-plan */
export const Pricing5Preset: DesignPreset = {
    id: 'pricing-comparison-2plan',
    familyId: 'pricing-comparison',
    name: 'Pricing 5',
    description: 'Feature comparison, 2 plans',
    controls: {
        plans: '2',
        featureCount: '8',
    },
    Thumbnail: Pricing5Thumbnail,
}

// ===== NEW THUMBNAILS =====

/** Pricing 6 Thumbnail: Split layout */
function Pricing6Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex gap-2">
            {/* Left: heading + features */}
            <div className="w-1/2 space-y-1">
                <div className="text-[3px] text-gray-400 uppercase">Tagline</div>
                <div className="text-[7px] font-semibold text-gray-800">Pricing plan</div>
                <div className="text-[3px] text-gray-500 leading-tight">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
                <div className="space-y-0.5 pt-0.5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-0.5">
                            <div className="w-2 h-2 bg-gray-100 rounded flex-shrink-0 mt-px" />
                            <div>
                                <div className="text-[3px] font-medium text-gray-700">Feature heading</div>
                                <div className="text-[2.5px] text-gray-400">Description text</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Right: card */}
            <div className="w-1/2 border border-gray-200 rounded p-1.5 flex flex-col">
                <div className="flex justify-between mb-0.5">
                    <div className="text-[4px] font-medium text-gray-700">Basic plan</div>
                    <div className="text-[6px] font-bold text-gray-900">$19</div>
                </div>
                <div className="border-t border-gray-100 my-0.5" />
                <div className="space-y-0.5 flex-1">
                    {Array.from({ length: 5 }).map((_, f) => (
                        <div key={f} className="flex items-center gap-0.5">
                            <div className="w-1 h-1 bg-gray-300 rounded-full" />
                            <div className="text-[3px] text-gray-500">Feature</div>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-800 text-white text-center text-[3.5px] py-0.5 mt-0.5">Get started</div>
            </div>
        </div>
    )
}

/** Pricing 7 Thumbnail: Left-header 3 cards */
function Pricing7Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="flex items-end justify-between mb-1">
                <div>
                    <div className="text-[3px] text-gray-400 uppercase">Tagline</div>
                    <div className="text-[7px] font-semibold text-gray-800">Pricing plan</div>
                </div>
                <div className="flex items-center gap-0.5">
                    <div className="text-[3px] text-gray-600">Mo</div>
                    <div className="w-3 h-1.5 bg-gray-800 rounded-full" />
                    <div className="text-[3px] text-gray-400">Yr</div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {['$9', '$29', '$49'].map((price, i) => (
                    <div key={i} className={`border rounded p-1 flex flex-col ${i === 1 ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="text-[3px] font-medium text-gray-600 mb-0.5">{['Basic', 'Pro', 'Biz'][i]}</div>
                        <div className="text-[6px] font-bold text-gray-900 mb-0.5">{price}</div>
                        <div className="bg-gray-800 text-white text-center text-[3px] py-0.5 mb-0.5">Start</div>
                        <div className="space-y-0.5">
                            {Array.from({ length: 3 }).map((_, f) => (
                                <div key={f} className="flex items-center gap-0.5">
                                    <div className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                                    <div className="text-[2.5px] text-gray-500">Feature</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Pricing 8 Thumbnail: Left-header 2 cards no toggle */
function Pricing8Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="mb-1">
                <div className="text-[3px] text-gray-400 uppercase">Tagline</div>
                <div className="text-[7px] font-semibold text-gray-800">Pricing plan</div>
                <div className="text-[3px] text-gray-500">Lorem ipsum dolor sit amet.</div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 flex-1">
                {['$19', '$49'].map((price, i) => (
                    <div key={i} className={`border rounded p-1.5 flex flex-col ${i === 1 ? 'border-gray-800' : 'border-gray-200'}`}>
                        <div className="text-[4px] font-medium text-gray-600 mb-0.5">{['Basic', 'Pro'][i]}</div>
                        <div className="text-[8px] font-bold text-gray-900 mb-0.5">{price}</div>
                        <div className="bg-gray-800 text-white text-center text-[3.5px] py-0.5 mb-1">Start</div>
                        <div className="space-y-0.5 flex-1">
                            {Array.from({ length: 4 }).map((_, f) => (
                                <div key={f} className="flex items-center gap-0.5">
                                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <div className="text-[3px] text-gray-500">Feature</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Pricing 6 — Split layout */
export const Pricing6Preset: DesignPreset = {
    id: 'pricing-split-default',
    familyId: 'pricing-split',
    name: 'Pricing 6',
    description: 'Split layout: features left, card right',
    controls: {
        showFeatures: true,
        showIcon: true,
        showLogos: false,
    },
    Thumbnail: Pricing6Thumbnail,
}

/** Pricing 7 — Left-header 3 cards with toggle */
export const Pricing7Preset: DesignPreset = {
    id: 'pricing-left-header-3tier',
    familyId: 'pricing-left-header',
    name: 'Pricing 7',
    description: 'Left-aligned header, 3 cards, toggle',
    controls: {
        planCount: 3,
        showToggle: true,
        showDescription: false,
    },
    Thumbnail: Pricing7Thumbnail,
}

/** Pricing 8 — Left-header 2 cards */
export const Pricing8Preset: DesignPreset = {
    id: 'pricing-left-header-2tier',
    familyId: 'pricing-left-header',
    name: 'Pricing 8',
    description: 'Left-aligned header, 2 cards, description',
    controls: {
        planCount: 2,
        showToggle: false,
        showDescription: true,
    },
    Thumbnail: Pricing8Thumbnail,
}

/** All Pricing presets for registry */
export const pricingPresets: DesignPreset[] = [
    Pricing1Preset,
    Pricing2Preset,
    Pricing3Preset,
    Pricing4Preset,
    Pricing5Preset,
    Pricing6Preset,
    Pricing7Preset,
    Pricing8Preset,
]
