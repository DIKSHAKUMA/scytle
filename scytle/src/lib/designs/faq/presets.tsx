'use client'

/**
 * FAQ Presets — Named snapshots of FAQ family control values.
 */

import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** FAQ 1 Thumbnail: Centered accordion */
function Faq1Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">FAQ</div>
                <div className="text-[3.5px] text-gray-400">Everything you need to know</div>
            </div>
            <div className="space-y-0.5 flex-1 max-w-[85%] mx-auto w-full">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border-b border-gray-200 py-0.5 flex justify-between items-center">
                        <div className="text-[4px] text-gray-700">Question {i + 1}?</div>
                        <div className="text-[5px] text-gray-400">+</div>
                    </div>
                ))}
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-1 mt-1.5 text-center">
                <div className="text-[4px] font-medium text-gray-700">Still have questions?</div>
                <div className="bg-gray-800 text-white text-[3px] px-1.5 py-0.5 mx-auto mt-0.5 inline-block">Contact Us</div>
            </div>
        </div>
    )
}

/** FAQ 2 Thumbnail: Left-aligned accordion */
function Faq2Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">FAQ</div>
                <div className="text-[3.5px] text-gray-400">Everything you need to know</div>
            </div>
            <div className="space-y-0.5 flex-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border-b border-gray-200 py-0.5 flex justify-between items-center">
                        <div className="text-[4px] text-gray-700">Question {i + 1}?</div>
                        <div className="text-[5px] text-gray-400">+</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** FAQ 3 Thumbnail: Two-column */
function Faq3Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">FAQ</div>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 flex-1">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                        <div className="text-[4px] font-medium text-gray-700 mb-0.5">Question {i + 1}?</div>
                        <div className="text-[3px] text-gray-400 leading-tight">Lorem ipsum dolor sit amet.</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** FAQ 4 Thumbnail: Accordion with categories */
function Faq4Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[7px] font-semibold text-gray-800">FAQ</div>
            </div>
            <div className="flex gap-0.5 mb-1.5 justify-center">
                <div className="bg-gray-800 text-white text-[3px] px-1 py-0.5 rounded-full">General</div>
                <div className="bg-gray-100 text-gray-600 text-[3px] px-1 py-0.5 rounded-full">Billing</div>
                <div className="bg-gray-100 text-gray-600 text-[3px] px-1 py-0.5 rounded-full">Support</div>
            </div>
            <div className="space-y-0.5 flex-1 max-w-[85%] mx-auto w-full">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border-b border-gray-200 py-0.5 flex justify-between items-center">
                        <div className="text-[4px] text-gray-700">Question {i + 1}?</div>
                        <div className="text-[5px] text-gray-400">+</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ===== PRESETS =====

/** FAQ 1 — Centered accordion */
export const Faq1Preset: DesignPreset = {
    id: 'faq-accordion-centered',
    familyId: 'faq-accordion',
    name: 'FAQ 1',
    description: 'Centered accordion with contact CTA',
    controls: {
        textAlign: 'center',
        itemCount: '5',
        showCategories: false,
    },
    Thumbnail: Faq1Thumbnail,
}

/** FAQ 2 — Left-aligned accordion */
export const Faq2Preset: DesignPreset = {
    id: 'faq-accordion-left',
    familyId: 'faq-accordion',
    name: 'FAQ 2',
    description: 'Left-aligned expandable FAQ',
    controls: {
        textAlign: 'left',
        itemCount: '5',
        showCategories: false,
    },
    Thumbnail: Faq2Thumbnail,
}

/** FAQ 3 — Two-column Q&A */
export const Faq3Preset: DesignPreset = {
    id: 'faq-twocol-default',
    familyId: 'faq-two-column',
    name: 'FAQ 3',
    description: 'Two-column Q&A grid',
    controls: {
        itemCount: '6',
        showHeader: true,
    },
    Thumbnail: Faq3Thumbnail,
}

/** FAQ 4 — Accordion with category tabs */
export const Faq4Preset: DesignPreset = {
    id: 'faq-accordion-categories',
    familyId: 'faq-accordion',
    name: 'FAQ 4',
    description: 'Accordion with category tabs',
    controls: {
        textAlign: 'center',
        itemCount: '4',
        showCategories: true,
    },
    Thumbnail: Faq4Thumbnail,
}

/** All FAQ presets for registry */
export const faqPresets: DesignPreset[] = [
    Faq1Preset,
    Faq2Preset,
    Faq3Preset,
    Faq4Preset,
]
