'use client'

/**
 * Testimonials Presets — Named snapshots of Testimonials family control values.
 */

import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Testimonials 1 Thumbnail: 3 cards */
function Testimonials1Thumbnail() {
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

/** Testimonials 2 Thumbnail: 2 cards */
function Testimonials2Thumbnail() {
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

/** Testimonials 3 Thumbnail: Slider */
function Testimonials3Thumbnail() {
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
            <div className="flex gap-1 mt-1.5">
                <div className="w-1 h-1 bg-gray-800 rounded-full" />
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
            </div>
        </div>
    )
}

/** Testimonials 4 Thumbnail: Simple centered */
function Testimonials4Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 p-2 flex flex-col items-center justify-center text-center">
            <div className="text-[5px] text-gray-600 leading-tight mb-1.5 max-w-[85%]">&ldquo;Lorem ipsum dolor sit amet, consectetur.&rdquo;</div>
            <div className="w-4 h-4 bg-gray-200 rounded-full mb-0.5" />
            <div className="text-[4px] font-medium text-gray-700">Person Name</div>
            <div className="text-[3px] text-gray-400">Title, Company</div>
        </div>
    )
}

/** Testimonials 5 Thumbnail: Simple with logo */
function Testimonials5Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 p-2 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-3 bg-gray-200 border border-gray-200 rounded mb-1.5" />
            <div className="text-[5px] text-gray-600 leading-tight mb-1.5 max-w-[85%]">&ldquo;Lorem ipsum dolor sit amet.&rdquo;</div>
            <div className="text-[4px] font-medium text-gray-700">Person Name</div>
            <div className="text-[3px] text-gray-400">Title, Company</div>
        </div>
    )
}

// ===== PRESETS =====

/** Testimonials 1 — 3 cards with ratings */
export const Testimonials1Preset: DesignPreset = {
    id: 'testimonials-cards-3',
    familyId: 'testimonials-cards',
    name: 'Testimonials 1',
    description: '3 quote cards with ratings',
    controls: {
        columns: '3',
        itemCount: '3',
        showAvatar: true,
        showRating: true,
    },
    Thumbnail: Testimonials1Thumbnail,
}

/** Testimonials 2 — 2 cards, no rating */
export const Testimonials2Preset: DesignPreset = {
    id: 'testimonials-cards-2',
    familyId: 'testimonials-cards',
    name: 'Testimonials 2',
    description: '2 quote cards side by side',
    controls: {
        columns: '2',
        itemCount: '2',
        showAvatar: true,
        showRating: false,
    },
    Thumbnail: Testimonials2Thumbnail,
}

/** Testimonials 3 — Slider with arrows */
export const Testimonials3Preset: DesignPreset = {
    id: 'testimonials-slider-default',
    familyId: 'testimonials-slider',
    name: 'Testimonials 3',
    description: 'Single quote with navigation',
    controls: {
        showAvatar: true,
        showRating: true,
        showArrows: true,
    },
    Thumbnail: Testimonials3Thumbnail,
}

/** Testimonials 4 — Simple centered */
export const Testimonials4Preset: DesignPreset = {
    id: 'testimonials-simple-default',
    familyId: 'testimonials-simple',
    name: 'Testimonials 4',
    description: 'Simple centered testimonial',
    controls: {
        showAvatar: true,
        showLogo: false,
    },
    Thumbnail: Testimonials4Thumbnail,
}

/** Testimonials 5 — Simple with company logo */
export const Testimonials5Preset: DesignPreset = {
    id: 'testimonials-simple-logo',
    familyId: 'testimonials-simple',
    name: 'Testimonials 5',
    description: 'Centered quote with company logo',
    controls: {
        showAvatar: false,
        showLogo: true,
    },
    Thumbnail: Testimonials5Thumbnail,
}

/** All Testimonials presets for registry */
export const testimonialsPresets: DesignPreset[] = [
    Testimonials1Preset,
    Testimonials2Preset,
    Testimonials3Preset,
    Testimonials4Preset,
    Testimonials5Preset,
]
