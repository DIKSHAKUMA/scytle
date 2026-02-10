'use client'

/**
 * CTA Presets — Named snapshots of CTA family control values.
 */

import { ImageIcon } from 'lucide-react'
import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** CTA 1 Thumbnail: Banner, centered */
function Cta1Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 border-t border-b border-gray-200 p-2 flex flex-col items-center justify-center text-center space-y-1">
            <div className="text-[7px] font-semibold text-gray-800 leading-tight">
                Call to action heading
            </div>
            <div className="text-[4px] text-gray-500 leading-tight max-w-[80%]">
                Lorem ipsum dolor sit amet
            </div>
            <div className="flex gap-0.5 mt-0.5">
                <div className="bg-gray-800 text-white text-[4px] px-1.5 py-0.5">Get Started</div>
                <div className="border border-gray-300 text-gray-600 text-[4px] px-1.5 py-0.5">Learn More</div>
            </div>
        </div>
    )
}

/** CTA 2 Thumbnail: Accent banner, centered */
function Cta2Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 border-t border-b border-gray-200 p-2 flex flex-col items-center justify-center text-center space-y-1">
            <div className="text-[7px] font-semibold text-gray-800 leading-tight">
                Call to action heading
            </div>
            <div className="text-[4px] text-gray-500 leading-tight max-w-[80%]">
                Lorem ipsum dolor sit amet
            </div>
            <div className="flex gap-0.5 mt-0.5">
                <div className="bg-gray-800 text-white text-[4px] px-1.5 py-0.5">Get Started</div>
            </div>
        </div>
    )
}

/** CTA 3 Thumbnail: Split — text + image */
function Cta3Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 p-2 flex gap-2">
            <div className="flex-1 flex flex-col justify-center space-y-0.5">
                <div className="text-[7px] font-semibold text-gray-800 leading-tight">
                    CTA heading
                </div>
                <div className="text-[4px] text-gray-500 leading-tight">
                    Lorem ipsum dolor sit amet
                </div>
                <div className="flex gap-0.5 mt-0.5">
                    <div className="bg-gray-800 text-white text-[4px] px-1 py-0.5">Button</div>
                    <div className="border border-gray-300 text-gray-600 text-[4px] px-1 py-0.5">Button</div>
                </div>
            </div>
            <div className="flex-1 bg-gray-200 flex items-center justify-center">
                <ImageIcon className="w-3 h-3 text-gray-400" />
            </div>
        </div>
    )
}

/** CTA 4 Thumbnail: Minimal centered text */
function Cta4Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center text-center space-y-1">
            <div className="text-[7px] font-semibold text-gray-800 leading-tight">
                Simple call to action
            </div>
            <div className="text-[4px] text-gray-500 leading-tight max-w-[80%]">
                Lorem ipsum dolor sit amet
            </div>
            <div className="bg-gray-800 text-white text-[4px] px-1.5 py-0.5 mt-0.5">
                Get Started
            </div>
        </div>
    )
}

/** CTA 5 Thumbnail: Light banner, left-aligned */
function Cta5Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 p-2 flex flex-col justify-center space-y-0.5">
            <div className="text-[7px] font-semibold text-gray-800 leading-tight">
                Call to action heading
            </div>
            <div className="text-[4px] text-gray-500 leading-tight">
                Lorem ipsum dolor sit amet
            </div>
            <div className="flex gap-0.5 mt-0.5">
                <div className="bg-gray-800 text-white text-[4px] px-1.5 py-0.5">Get Started</div>
                <div className="border border-gray-300 text-gray-600 text-[4px] px-1.5 py-0.5">Learn More</div>
            </div>
        </div>
    )
}

// ===== PRESETS =====

/** CTA 1 — Centered banner */
export const Cta1Preset: DesignPreset = {
    id: 'cta-banner-centered',
    familyId: 'cta-banner',
    name: 'CTA 1',
    description: 'Centered banner CTA',
    controls: {
        textAlign: 'center',
        buttonCount: '2',
    },
    Thumbnail: Cta1Thumbnail,
}

/** CTA 2 — Single button banner */
export const Cta2Preset: DesignPreset = {
    id: 'cta-banner-accent',
    familyId: 'cta-banner',
    name: 'CTA 2',
    description: 'Single-button centered CTA',
    controls: {
        textAlign: 'center',
        buttonCount: '1',
    },
    Thumbnail: Cta2Thumbnail,
}

/** CTA 3 — Split with image */
export const Cta3Preset: DesignPreset = {
    id: 'cta-split-default',
    familyId: 'cta-split',
    name: 'CTA 3',
    description: 'Text + image side by side',
    controls: {
        assetPlacement: 'right',
        buttonCount: '2',
    },
    Thumbnail: Cta3Thumbnail,
}

/** CTA 4 — Minimal centered */
export const Cta4Preset: DesignPreset = {
    id: 'cta-minimal-centered',
    familyId: 'cta-minimal',
    name: 'CTA 4',
    description: 'Clean minimal CTA',
    controls: {
        textAlign: 'center',
        buttonCount: '1',
    },
    Thumbnail: Cta4Thumbnail,
}

/** CTA 5 — Left-aligned banner */
export const Cta5Preset: DesignPreset = {
    id: 'cta-banner-light',
    familyId: 'cta-banner',
    name: 'CTA 5',
    description: 'Left-aligned banner CTA',
    controls: {
        textAlign: 'left',
        buttonCount: '2',
    },
    Thumbnail: Cta5Thumbnail,
}

/** All CTA presets for registry */
export const ctaPresets: DesignPreset[] = [
    Cta1Preset,
    Cta2Preset,
    Cta3Preset,
    Cta4Preset,
    Cta5Preset,
]
