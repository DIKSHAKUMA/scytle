'use client'

/**
 * Gallery Presets — Named snapshots of Gallery family control values.
 */

import { ImageIcon } from 'lucide-react'
import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Gallery 1 Thumbnail: 3-column grid */
function Gallery1Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Gallery</div>
            </div>
            <div className="grid grid-cols-3 gap-0.5 flex-1">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="w-2 h-2 text-gray-300" />
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Gallery 2 Thumbnail: 2-column grid, tight spacing */
function Gallery2Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Gallery</div>
            </div>
            <div className="grid grid-cols-2 gap-0.5 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="w-2 h-2 text-gray-300" />
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Gallery 3 Thumbnail: Masonry */
function Gallery3Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Gallery</div>
            </div>
            <div className="flex gap-0.5 flex-1">
                <div className="flex-1 flex flex-col gap-0.5">
                    <div className="flex-[3] bg-gray-100 border border-gray-200 rounded" />
                    <div className="flex-[2] bg-gray-100 border border-gray-200 rounded" />
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                    <div className="flex-[2] bg-gray-100 border border-gray-200 rounded" />
                    <div className="flex-[3] bg-gray-100 border border-gray-200 rounded" />
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                    <div className="flex-[3] bg-gray-100 border border-gray-200 rounded" />
                    <div className="flex-[2] bg-gray-100 border border-gray-200 rounded" />
                </div>
            </div>
        </div>
    )
}

/** Gallery 4 Thumbnail: Carousel */
function Gallery4Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="mb-1 flex items-end justify-between">
                <div className="text-[6px] font-semibold text-gray-800">Gallery</div>
                <div className="flex gap-0.5">
                    <div className="w-2.5 h-2.5 border border-gray-300 rounded-full flex items-center justify-center text-[4px] text-gray-400">‹</div>
                    <div className="w-2.5 h-2.5 border border-gray-300 rounded-full flex items-center justify-center text-[4px] text-gray-400">›</div>
                </div>
            </div>
            <div className="flex gap-0.5 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex-1 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                        <ImageIcon className="w-2 h-2 text-gray-300" />
                    </div>
                ))}
                <div className="w-3 bg-gray-100 border border-gray-200 rounded opacity-40" />
            </div>
            <div className="flex gap-0.5 justify-center mt-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-gray-700' : 'bg-gray-300'}`} />
                ))}
            </div>
        </div>
    )
}

// ===== PRESETS =====

export const Gallery1Preset: DesignPreset = {
    id: 'gallery-1',
    familyId: 'gallery-grid',
    name: 'Gallery 1',
    description: '3-column uniform image grid',
    controls: { columns: '3', itemCount: '6', gap: 'normal' },
    Thumbnail: Gallery1Thumbnail,
}

export const Gallery2Preset: DesignPreset = {
    id: 'gallery-2',
    familyId: 'gallery-grid',
    name: 'Gallery 2',
    description: '2-column grid with tight spacing',
    controls: { columns: '2', itemCount: '4', gap: 'tight' },
    Thumbnail: Gallery2Thumbnail,
}

export const Gallery3Preset: DesignPreset = {
    id: 'gallery-3',
    familyId: 'gallery-masonry',
    name: 'Gallery 3',
    description: '3-column masonry layout',
    controls: { columns: '3', itemCount: '7' },
    Thumbnail: Gallery3Thumbnail,
}

export const Gallery4Preset: DesignPreset = {
    id: 'gallery-4',
    familyId: 'gallery-carousel',
    name: 'Gallery 4',
    description: 'Carousel with arrows and dots',
    controls: { showArrows: true, showDots: true, showCaption: false },
    Thumbnail: Gallery4Thumbnail,
}

export const galleryPresets: DesignPreset[] = [
    Gallery1Preset,
    Gallery2Preset,
    Gallery3Preset,
    Gallery4Preset,
]
