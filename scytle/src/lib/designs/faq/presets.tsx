'use client'

/**
 * FAQ Presets — Named snapshots of FAQ family control values.
 * 8 presets covering 14 Relume FAQ variants across 3 families.
 */

import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** FAQ 1 — Centered accordion with CTA */
function Faq1Thumb() {
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

/** FAQ 2 — Left-aligned accordion */
function Faq2Thumb() {
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

/** FAQ 3 — Split layout: title left, accordion right */
function Faq3Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex gap-2">
            <div className="w-[35%] flex-shrink-0">
                <div className="text-[7px] font-semibold text-gray-800">FAQ</div>
                <div className="text-[3.5px] text-gray-400">Find answers</div>
            </div>
            <div className="flex-1 space-y-0.5">
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

/** FAQ 4 — Accordion with card-style items */
function Faq4Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">FAQ</div>
            </div>
            <div className="space-y-0.5 flex-1 max-w-[85%] mx-auto w-full">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded px-1 py-0.5 flex justify-between items-center">
                        <div className="text-[4px] text-gray-700">Question {i + 1}?</div>
                        <div className="text-[5px] text-gray-400">›</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** FAQ 5 — Accordion with categories */
function Faq5Thumb() {
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

/** FAQ 6 — Two-column accordion */
function Faq6Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">FAQ</div>
            </div>
            <div className="grid grid-cols-2 gap-x-2 flex-1">
                {[0, 1].map((c) => (
                    <div key={c} className="space-y-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="border-b border-gray-200 py-0.5 flex justify-between items-center">
                                <div className="text-[4px] text-gray-700">Q{c * 3 + i + 1}?</div>
                                <div className="text-[5px] text-gray-400">+</div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

/** FAQ 7 — Two-column flat */
function Faq7Thumb() {
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

/** FAQ 8 — Flat 3-column grid */
function Faq8Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">FAQ</div>
            </div>
            <div className="grid grid-cols-3 gap-x-1.5 gap-y-1 flex-1">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                        <div className="text-[3.5px] font-medium text-gray-700 mb-0.5">Question {i + 1}?</div>
                        <div className="text-[3px] text-gray-400 leading-tight">Lorem ipsum dolor.</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ===== PRESETS =====

/** FAQ 1 — Centered accordion with CTA */
export const Faq1Preset: DesignPreset = {
    id: 'faq-accordion-centered',
    familyId: 'faq-accordion',
    name: 'FAQ 1',
    description: 'Centered accordion with contact CTA',
    controls: { layout: 'centered', textAlign: 'center', accordionStyle: 'dividers', icon: 'plus', itemCount: '5', showCta: true, showCategories: false },
    Thumbnail: Faq1Thumb,
}

/** FAQ 2 — Left-aligned accordion, no CTA */
export const Faq2Preset: DesignPreset = {
    id: 'faq-accordion-left',
    familyId: 'faq-accordion',
    name: 'FAQ 2',
    description: 'Left-aligned expandable FAQ',
    controls: { layout: 'centered', textAlign: 'left', accordionStyle: 'dividers', icon: 'plus', itemCount: '5', showCta: false, showCategories: false },
    Thumbnail: Faq2Thumb,
}

/** FAQ 3 — Split layout: title left, accordion right */
export const Faq3Preset: DesignPreset = {
    id: 'faq-accordion-split',
    familyId: 'faq-accordion',
    name: 'FAQ 3',
    description: 'Split layout — title left, accordion right',
    controls: { layout: 'split', textAlign: 'left', accordionStyle: 'dividers', icon: 'plus', itemCount: '5', showCta: false, showCategories: false },
    Thumbnail: Faq3Thumb,
}

/** FAQ 4 — Card-style accordion with chevron */
export const Faq4Preset: DesignPreset = {
    id: 'faq-accordion-cards',
    familyId: 'faq-accordion',
    name: 'FAQ 4',
    description: 'Card-style items with chevron icon',
    controls: { layout: 'centered', textAlign: 'center', accordionStyle: 'cards', icon: 'chevron', itemCount: '5', showCta: false, showCategories: false },
    Thumbnail: Faq4Thumb,
}

/** FAQ 5 — Accordion with category tabs */
export const Faq5Preset: DesignPreset = {
    id: 'faq-accordion-categories',
    familyId: 'faq-accordion',
    name: 'FAQ 5',
    description: 'Accordion with category tabs',
    controls: { layout: 'centered', textAlign: 'center', accordionStyle: 'dividers', icon: 'plus', itemCount: '4', showCta: false, showCategories: true },
    Thumbnail: Faq5Thumb,
}

/** FAQ 6 — Two-column accordion */
export const Faq6Preset: DesignPreset = {
    id: 'faq-twocol-accordion',
    familyId: 'faq-two-column',
    name: 'FAQ 6',
    description: 'Two-column accordion layout',
    controls: { mode: 'accordion', itemCount: '6', showHeader: true, showCta: false },
    Thumbnail: Faq6Thumb,
}

/** FAQ 7 — Two-column flat Q&A */
export const Faq7Preset: DesignPreset = {
    id: 'faq-twocol-flat',
    familyId: 'faq-two-column',
    name: 'FAQ 7',
    description: 'Two-column flat Q&A grid',
    controls: { mode: 'flat', itemCount: '6', showHeader: true, showCta: false },
    Thumbnail: Faq7Thumb,
}

/** FAQ 8 — Flat 3-column grid */
export const Faq8Preset: DesignPreset = {
    id: 'faq-flat-3col',
    familyId: 'faq-flat',
    name: 'FAQ 8',
    description: 'Static Q&A in 3-column grid',
    controls: { columns: '3', itemCount: '6', titleAlign: 'center', showIcons: false, showCta: false },
    Thumbnail: Faq8Thumb,
}

/** All FAQ presets for registry */
export const faqPresets: DesignPreset[] = [
    Faq1Preset,
    Faq2Preset,
    Faq3Preset,
    Faq4Preset,
    Faq5Preset,
    Faq6Preset,
    Faq7Preset,
    Faq8Preset,
]
