'use client'

/**
 * Logos Presets — Named snapshots of Logos family control values.
 */

import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Logos 1 Thumbnail: Simple logo row */
function Logos1Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col justify-center">
            <div className="text-center mb-1.5">
                <div className="text-[4px] text-gray-400">Trusted by industry leaders</div>
            </div>
            <div className="flex gap-1 justify-center">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="w-5 h-2.5 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                        <span className="text-[2.5px] text-gray-400">Logo</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Logos 2 Thumbnail: Logo row with names */
function Logos2Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col justify-center">
            <div className="text-center mb-1.5">
                <div className="text-[4px] text-gray-400">Our partners</div>
            </div>
            <div className="flex gap-2 justify-center">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                        <div className="w-6 h-3 bg-gray-100 border border-gray-200 rounded" />
                        <span className="text-[2.5px] text-gray-400">Name</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Logos 3 Thumbnail: Grid */
function Logos3Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Partners</div>
            </div>
            <div className="grid grid-cols-4 gap-0.5 flex-1">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                        <span className="text-[2.5px] text-gray-400">Logo</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Logos 4 Thumbnail: Marquee */
function Logos4Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col justify-center">
            <div className="text-center mb-1">
                <div className="text-[4px] text-gray-400">Backed by the best</div>
            </div>
            <div className="flex gap-1 items-center justify-center">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-5 h-2.5 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                        <span className="text-[2.5px] text-gray-400">Logo</span>
                    </div>
                ))}
            </div>
            <div className="text-center mt-0.5">
                <span className="text-[2.5px] text-gray-300">← scrolling →</span>
            </div>
        </div>
    )
}

/** Logos 5 Thumbnail: Featured partner */
function Logos5Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col justify-center">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Featured</div>
            </div>
            <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-5 bg-gray-100 border border-gray-200 rounded" />
                <div className="flex gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="w-4 h-2 bg-gray-50 border border-gray-200 rounded" />
                    ))}
                </div>
            </div>
        </div>
    )
}

/** Logos 6 Thumbnail: Split heading + logos */
function Logos6Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex gap-1.5 items-center">
            <div className="flex-1 space-y-0.5">
                <div className="text-[5px] font-semibold text-gray-800">Our Partners</div>
                <div className="text-[3px] text-gray-400">Trusted worldwide</div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-0.5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-3 bg-gray-100 border border-gray-200 rounded" />
                ))}
            </div>
        </div>
    )
}

// ===== PRESETS =====

export const Logos1Preset: DesignPreset = {
    id: 'logos-1',
    familyId: 'logos-row',
    name: 'Logos 1',
    description: 'Simple logo row',
    controls: { showLabel: false },
    Thumbnail: Logos1Thumbnail,
}

export const Logos2Preset: DesignPreset = {
    id: 'logos-2',
    familyId: 'logos-row',
    name: 'Logos 2',
    description: 'Logo row with names',
    controls: { showLabel: true },
    Thumbnail: Logos2Thumbnail,
}

export const Logos3Preset: DesignPreset = {
    id: 'logos-3',
    familyId: 'logos-grid',
    name: 'Logos 3',
    description: '4-column logo grid',
    controls: { columns: '4', showBorder: true },
    Thumbnail: Logos3Thumbnail,
}

export const Logos4Preset: DesignPreset = {
    id: 'logos-4',
    familyId: 'logos-marquee',
    name: 'Logos 4',
    description: 'Scrolling logo marquee',
    controls: { rows: '1' },
    Thumbnail: Logos4Thumbnail,
}

export const Logos5Preset: DesignPreset = {
    id: 'logos-5',
    familyId: 'logos-featured',
    name: 'Logos 5',
    description: 'Featured partner with row',
    controls: { showDescription: true },
    Thumbnail: Logos5Thumbnail,
}

export const Logos6Preset: DesignPreset = {
    id: 'logos-6',
    familyId: 'logos-split',
    name: 'Logos 6',
    description: 'Split heading + logo grid',
    controls: { columns: '2', headingSide: 'left' },
    Thumbnail: Logos6Thumbnail,
}

export const logosPresets: DesignPreset[] = [
    Logos1Preset,
    Logos2Preset,
    Logos3Preset,
    Logos4Preset,
    Logos5Preset,
    Logos6Preset,
]
