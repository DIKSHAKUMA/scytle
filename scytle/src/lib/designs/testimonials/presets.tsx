'use client'

/**
 * Testimonials Presets — Named snapshots of Testimonials family control values.
 * ~15 presets covering 67 Relume variants across 6 families.
 */

import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Testimonials 1 — 3 cards, stars, centered title */
function T1Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">Testimonials</div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded p-1 flex flex-col">
                        <div className="flex gap-0.5 mb-0.5">
                            {Array.from({ length: 5 }).map((_, s) => (
                                <div key={s} className="w-1 h-1 bg-gray-300 rounded-sm" />
                            ))}
                        </div>
                        <div className="text-[3px] text-gray-500 flex-1 leading-tight mb-1">&ldquo;Lorem ipsum dolor sit amet&rdquo;</div>
                        <div className="flex items-center gap-0.5">
                            <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
                            <div className="text-[3px] text-gray-600">Person</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Testimonials 2 — 2 cards, no rating */
function T2Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">Testimonials</div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 flex-1">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded p-1.5 flex flex-col">
                        <div className="text-[3.5px] text-gray-500 flex-1 leading-tight mb-1">&ldquo;Lorem ipsum dolor sit amet consectetur&rdquo;</div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-gray-200 rounded-full" />
                            <div>
                                <div className="text-[3.5px] font-medium text-gray-700">Person</div>
                                <div className="text-[3px] text-gray-400">Title</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Testimonials 3 — Left-aligned title, 3 cards */
function T3Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">Testimonials</div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded p-1 flex flex-col">
                        <div className="flex gap-0.5 mb-0.5">
                            {Array.from({ length: 5 }).map((_, s) => (
                                <div key={s} className="w-1 h-1 bg-gray-300 rounded-sm" />
                            ))}
                        </div>
                        <div className="text-[3px] text-gray-500 flex-1 leading-tight mb-1">&ldquo;Lorem ipsum&rdquo;</div>
                        <div className="flex items-center gap-0.5">
                            <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
                            <div className="text-[3px] text-gray-600">Person</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Testimonials 4 — Cards with CTA */
function T4Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[7px] font-semibold text-gray-800">Testimonials</div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded p-1 flex flex-col">
                        <div className="text-[3px] text-gray-500 flex-1 leading-tight mb-1">&ldquo;Lorem ipsum&rdquo;</div>
                        <div className="flex items-center gap-0.5">
                            <div className="w-2 h-2 bg-gray-200 rounded-full" />
                            <div className="text-[3px] text-gray-600">Person</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-1 text-center">
                <div className="border border-gray-300 text-[3px] text-gray-600 px-2 py-0.5 inline-block">View all</div>
            </div>
        </div>
    )
}

/** Testimonials 5 — Slider with arrows */
function T5Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center text-center">
            <div className="flex gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, s) => (
                    <div key={s} className="w-1.5 h-1.5 bg-gray-300 rounded-sm" />
                ))}
            </div>
            <div className="text-[5px] text-gray-600 leading-tight mb-1.5 max-w-[85%]">&ldquo;Lorem ipsum dolor sit amet, consectetur adipiscing elit.&rdquo;</div>
            <div className="w-4 h-4 bg-gray-200 rounded-full mb-0.5" />
            <div className="text-[4px] font-medium text-gray-700">Person Name</div>
            <div className="text-[3px] text-gray-400">Title, Company</div>
            <div className="flex items-center gap-2 mt-1.5">
                <div className="w-3 h-3 border border-gray-300 rounded-full flex items-center justify-center text-[4px] text-gray-400">←</div>
                <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-gray-800 rounded-full" />
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                </div>
                <div className="w-3 h-3 border border-gray-300 rounded-full flex items-center justify-center text-[4px] text-gray-400">→</div>
            </div>
        </div>
    )
}

/** Testimonials 6 — Slider with logo */
function T6Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-3 bg-gray-200 border border-gray-200 rounded mb-1" />
            <div className="text-[5px] text-gray-600 leading-tight mb-1.5 max-w-[85%]">&ldquo;Lorem ipsum dolor sit amet.&rdquo;</div>
            <div className="w-4 h-4 bg-gray-200 rounded-full mb-0.5" />
            <div className="text-[4px] font-medium text-gray-700">Person Name</div>
            <div className="text-[3px] text-gray-400">Title, Company</div>
            <div className="flex gap-0.5 mt-1.5">
                <div className="w-1 h-1 bg-gray-800 rounded-full" />
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
            </div>
        </div>
    )
}

/** Testimonials 7 — Simple centered */
function T7Thumb() {
    return (
        <div className="w-full h-full bg-gray-50 p-2 flex flex-col items-center justify-center text-center">
            <div className="text-[5px] text-gray-600 leading-tight mb-1.5 max-w-[85%]">&ldquo;Lorem ipsum dolor sit amet, consectetur.&rdquo;</div>
            <div className="w-4 h-4 bg-gray-200 rounded-full mb-0.5" />
            <div className="text-[4px] font-medium text-gray-700">Person Name</div>
            <div className="text-[3px] text-gray-400">Title, Company</div>
        </div>
    )
}

/** Testimonials 8 — Simple with stars */
function T8Thumb() {
    return (
        <div className="w-full h-full bg-gray-50 p-2 flex flex-col items-center justify-center text-center">
            <div className="flex gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, s) => (
                    <div key={s} className="w-1.5 h-1.5 bg-gray-300 rounded-sm" />
                ))}
            </div>
            <div className="text-[5px] text-gray-600 leading-tight mb-1.5 max-w-[85%]">&ldquo;Lorem ipsum dolor sit amet.&rdquo;</div>
            <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded-full" />
                <div className="text-left">
                    <div className="text-[4px] font-medium text-gray-700">Person</div>
                    <div className="text-[3px] text-gray-400">Title</div>
                </div>
            </div>
        </div>
    )
}

/** Testimonials 9 — Simple with logo */
function T9Thumb() {
    return (
        <div className="w-full h-full bg-gray-50 p-2 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-3 bg-gray-200 border border-gray-200 rounded mb-1.5" />
            <div className="text-[5px] text-gray-600 leading-tight mb-1.5 max-w-[85%]">&ldquo;Lorem ipsum dolor sit amet.&rdquo;</div>
            <div className="text-[4px] font-medium text-gray-700">Person Name</div>
            <div className="text-[3px] text-gray-400">Title, Company</div>
        </div>
    )
}

/** Testimonials 10 — Split: image left, quote right */
function T10Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex gap-1.5">
            <div className="flex-1 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                <div className="w-4 h-4 text-gray-300 text-[8px]">▯</div>
            </div>
            <div className="flex-1 flex flex-col justify-center">
                <div className="flex gap-0.5 mb-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                        <div key={s} className="w-1 h-1 bg-gray-300 rounded-sm" />
                    ))}
                </div>
                <div className="text-[4px] text-gray-600 leading-tight mb-1">&ldquo;Lorem ipsum dolor sit amet.&rdquo;</div>
                <div className="flex items-center gap-0.5">
                    <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
                    <div>
                        <div className="text-[3.5px] font-medium text-gray-700">Person</div>
                        <div className="text-[3px] text-gray-400">Title</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/** Testimonials 11 — Split: quote left, image right */
function T11Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex gap-1.5">
            <div className="flex-1 flex flex-col justify-center">
                <div className="w-6 h-2 bg-gray-200 rounded mb-1" />
                <div className="text-[4px] text-gray-600 leading-tight mb-1">&ldquo;Lorem ipsum dolor sit amet consectetur.&rdquo;</div>
                <div className="flex items-center gap-0.5">
                    <div className="w-2.5 h-2.5 bg-gray-200 rounded-full" />
                    <div>
                        <div className="text-[3.5px] font-medium text-gray-700">Person</div>
                        <div className="text-[3px] text-gray-400">Title</div>
                    </div>
                </div>
            </div>
            <div className="flex-1 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                <div className="w-4 h-4 text-gray-300 text-[8px]">▯</div>
            </div>
        </div>
    )
}

/** Testimonials 12 — Image cards, 3 columns */
function T12Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[7px] font-semibold text-gray-800">Testimonials</div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded overflow-hidden flex flex-col">
                        <div className="aspect-[3/2] bg-gray-100" />
                        <div className="p-0.5">
                            <div className="text-[3px] text-gray-500 mb-0.5">&ldquo;Lorem ipsum&rdquo;</div>
                            <div className="flex items-center gap-0.5">
                                <div className="w-2 h-2 bg-gray-200 rounded-full" />
                                <div className="text-[3px] text-gray-600">Person</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Testimonials 13 — Image cards, 2 columns */
function T13Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[7px] font-semibold text-gray-800">Testimonials</div>
            </div>
            <div className="grid grid-cols-2 gap-1 flex-1">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded overflow-hidden flex flex-col">
                        <div className="aspect-[3/2] bg-gray-100" />
                        <div className="p-1">
                            <div className="flex gap-0.5 mb-0.5">
                                {Array.from({ length: 5 }).map((_, s) => (
                                    <div key={s} className="w-1 h-1 bg-gray-300 rounded-sm" />
                                ))}
                            </div>
                            <div className="text-[3px] text-gray-500 mb-0.5">&ldquo;Lorem ipsum dolor&rdquo;</div>
                            <div className="flex items-center gap-0.5">
                                <div className="w-2 h-2 bg-gray-200 rounded-full" />
                                <div className="text-[3px] text-gray-600">Person</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Testimonials 14 — BG cards, 3 columns */
function T14Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[7px] font-semibold text-gray-800">Testimonials</div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-gray-700 rounded p-1 flex flex-col justify-end aspect-[4/5]">
                        <div className="text-[3px] text-white/80 mb-0.5">&ldquo;Lorem ipsum&rdquo;</div>
                        <div className="flex items-center gap-0.5">
                            <div className="w-2 h-2 bg-white/20 rounded-full" />
                            <div className="text-[3px] text-white/70">Person</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Testimonials 15 — BG cards, 2 columns */
function T15Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[7px] font-semibold text-gray-800">Testimonials</div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 flex-1">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="bg-gray-700 rounded p-1.5 flex flex-col justify-end aspect-[4/5]">
                        <div className="flex gap-0.5 mb-0.5">
                            {Array.from({ length: 5 }).map((_, s) => (
                                <div key={s} className="w-1 h-1 bg-white/30 rounded-sm" />
                            ))}
                        </div>
                        <div className="text-[3px] text-white/80 mb-0.5">&ldquo;Lorem ipsum dolor&rdquo;</div>
                        <div className="flex items-center gap-0.5">
                            <div className="w-2 h-2 bg-white/20 rounded-full" />
                            <div className="text-[3px] text-white/70">Person</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ===== PRESETS =====

/** Testimonials 1 — 3 cards with ratings, centered */
export const Testimonials1Preset: DesignPreset = {
    id: 'testimonials-cards-3-centered',
    familyId: 'testimonials-cards',
    name: 'Testimonials 1',
    description: '3 quote cards with ratings, centered title',
    controls: { columns: '3', itemCount: '3', titleAlign: 'center', showAvatar: true, showRating: true, showCta: false },
    Thumbnail: T1Thumb,
}

/** Testimonials 2 — 2 cards, no rating */
export const Testimonials2Preset: DesignPreset = {
    id: 'testimonials-cards-2',
    familyId: 'testimonials-cards',
    name: 'Testimonials 2',
    description: '2 quote cards side by side',
    controls: { columns: '2', itemCount: '2', titleAlign: 'center', showAvatar: true, showRating: false, showCta: false },
    Thumbnail: T2Thumb,
}

/** Testimonials 3 — 3 cards left-aligned title */
export const Testimonials3Preset: DesignPreset = {
    id: 'testimonials-cards-3-left',
    familyId: 'testimonials-cards',
    name: 'Testimonials 3',
    description: '3 cards with left-aligned title',
    controls: { columns: '3', itemCount: '3', titleAlign: 'left', showAvatar: true, showRating: true, showCta: false },
    Thumbnail: T3Thumb,
}

/** Testimonials 4 — Cards with CTA button */
export const Testimonials4Preset: DesignPreset = {
    id: 'testimonials-cards-cta',
    familyId: 'testimonials-cards',
    name: 'Testimonials 4',
    description: 'Card grid with view all CTA',
    controls: { columns: '3', itemCount: '3', titleAlign: 'center', showAvatar: true, showRating: false, showCta: true },
    Thumbnail: T4Thumb,
}

/** Testimonials 5 — Slider with arrows and stars */
export const Testimonials5Preset: DesignPreset = {
    id: 'testimonials-slider-arrows',
    familyId: 'testimonials-slider',
    name: 'Testimonials 5',
    description: 'Single quote with arrows and rating',
    controls: { showAvatar: true, showRating: true, showArrows: true, showLogo: false, avatarLayout: 'stacked' },
    Thumbnail: T5Thumb,
}

/** Testimonials 6 — Slider with logo */
export const Testimonials6Preset: DesignPreset = {
    id: 'testimonials-slider-logo',
    familyId: 'testimonials-slider',
    name: 'Testimonials 6',
    description: 'Single quote with company logo',
    controls: { showAvatar: true, showRating: false, showArrows: false, showLogo: true, avatarLayout: 'stacked' },
    Thumbnail: T6Thumb,
}

/** Testimonials 7 — Simple centered, avatar stacked */
export const Testimonials7Preset: DesignPreset = {
    id: 'testimonials-simple-default',
    familyId: 'testimonials-simple',
    name: 'Testimonials 7',
    description: 'Simple centered quote',
    controls: { showAvatar: true, showLogo: false, showStars: false, avatarLayout: 'stacked' },
    Thumbnail: T7Thumb,
}

/** Testimonials 8 — Simple with stars, inline avatar */
export const Testimonials8Preset: DesignPreset = {
    id: 'testimonials-simple-stars',
    familyId: 'testimonials-simple',
    name: 'Testimonials 8',
    description: 'Simple with stars and inline avatar',
    controls: { showAvatar: true, showLogo: false, showStars: true, avatarLayout: 'inline' },
    Thumbnail: T8Thumb,
}

/** Testimonials 9 — Simple with company logo */
export const Testimonials9Preset: DesignPreset = {
    id: 'testimonials-simple-logo',
    familyId: 'testimonials-simple',
    name: 'Testimonials 9',
    description: 'Centered quote with company logo',
    controls: { showAvatar: false, showLogo: true, showStars: false, avatarLayout: 'stacked' },
    Thumbnail: T9Thumb,
}

/** Testimonials 10 — Split: image left */
export const Testimonials10Preset: DesignPreset = {
    id: 'testimonials-split-left',
    familyId: 'testimonials-split',
    name: 'Testimonials 10',
    description: 'Image left, quote right',
    controls: { imagePlacement: 'left', imageAspect: 'portrait', showStars: true, showLogo: false },
    Thumbnail: T10Thumb,
}

/** Testimonials 11 — Split: image right with logo */
export const Testimonials11Preset: DesignPreset = {
    id: 'testimonials-split-right',
    familyId: 'testimonials-split',
    name: 'Testimonials 11',
    description: 'Image right, quote left with logo',
    controls: { imagePlacement: 'right', imageAspect: 'portrait', showStars: false, showLogo: true },
    Thumbnail: T11Thumb,
}

/** Testimonials 12 — Image cards, 3 columns */
export const Testimonials12Preset: DesignPreset = {
    id: 'testimonials-card-image-3',
    familyId: 'testimonials-card-image',
    name: 'Testimonials 12',
    description: 'Image cards in 3-column grid',
    controls: { columns: '3', itemCount: '3', titleAlign: 'center', showStars: false },
    Thumbnail: T12Thumb,
}

/** Testimonials 13 — Image cards, 2 columns with stars */
export const Testimonials13Preset: DesignPreset = {
    id: 'testimonials-card-image-2',
    familyId: 'testimonials-card-image',
    name: 'Testimonials 13',
    description: 'Image cards in 2-column grid with stars',
    controls: { columns: '2', itemCount: '2', titleAlign: 'center', showStars: true },
    Thumbnail: T13Thumb,
}

/** Testimonials 14 — BG overlay cards, 3 columns */
export const Testimonials14Preset: DesignPreset = {
    id: 'testimonials-card-bg-3',
    familyId: 'testimonials-card-bg',
    name: 'Testimonials 14',
    description: 'BG image cards, 3-column grid',
    controls: { columns: '3', itemCount: '3', titleAlign: 'center', showStars: false },
    Thumbnail: T14Thumb,
}

/** Testimonials 15 — BG overlay cards, 2 columns with stars */
export const Testimonials15Preset: DesignPreset = {
    id: 'testimonials-card-bg-2',
    familyId: 'testimonials-card-bg',
    name: 'Testimonials 15',
    description: 'BG image cards, 2-column with stars',
    controls: { columns: '2', itemCount: '2', titleAlign: 'center', showStars: true },
    Thumbnail: T15Thumb,
}

/** All Testimonials presets for registry */
export const testimonialsPresets: DesignPreset[] = [
    Testimonials1Preset,
    Testimonials2Preset,
    Testimonials3Preset,
    Testimonials4Preset,
    Testimonials5Preset,
    Testimonials6Preset,
    Testimonials7Preset,
    Testimonials8Preset,
    Testimonials9Preset,
    Testimonials10Preset,
    Testimonials11Preset,
    Testimonials12Preset,
    Testimonials13Preset,
    Testimonials14Preset,
    Testimonials15Preset,
]
