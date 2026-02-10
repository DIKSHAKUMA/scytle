'use client'

/**
 * Content Presets — Named snapshots of Content family control values.
 */

import { ImageIcon } from 'lucide-react'
import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Content 1 Thumbnail: Centered text */
function Content1Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center">
            <div className="text-center space-y-1 max-w-[80%]">
                <div className="text-[7px] font-semibold text-gray-800">Content heading</div>
                <div className="text-[4px] text-gray-400 leading-tight">
                    Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor.
                </div>
                <div className="w-8 h-1.5 bg-gray-200 rounded mx-auto mt-1" />
            </div>
        </div>
    )
}

/** Content 2 Thumbnail: Left-aligned text */
function Content2Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col justify-center">
            <div className="space-y-1 max-w-[70%]">
                <div className="text-[7px] font-semibold text-gray-800">Content heading</div>
                <div className="text-[4px] text-gray-400 leading-tight">
                    Lorem ipsum dolor sit amet consectetur adipiscing elit.
                </div>
            </div>
        </div>
    )
}

/** Content 3 Thumbnail: Split — text + image */
function Content3Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex gap-1.5 items-center">
            <div className="flex-1 space-y-0.5">
                <div className="text-[6px] font-semibold text-gray-800">Heading</div>
                <div className="text-[3px] text-gray-400 leading-tight">Lorem ipsum dolor sit amet.</div>
                <div className="w-6 h-1 bg-gray-200 rounded mt-0.5" />
            </div>
            <div className="flex-1 aspect-[4/3] bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                <ImageIcon className="w-3 h-3 text-gray-300" />
            </div>
        </div>
    )
}

/** Content 4 Thumbnail: Split reversed */
function Content4Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex gap-1.5 items-center">
            <div className="flex-1 aspect-[4/3] bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                <ImageIcon className="w-3 h-3 text-gray-300" />
            </div>
            <div className="flex-1 space-y-0.5">
                <div className="text-[6px] font-semibold text-gray-800">Heading</div>
                <div className="text-[3px] text-gray-400 leading-tight">Lorem ipsum dolor sit amet.</div>
            </div>
        </div>
    )
}

/** Content 5 Thumbnail: Card grid */
function Content5Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Content cards</div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded overflow-hidden">
                        <div className="aspect-[3/2] bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-2 h-2 text-gray-300" />
                        </div>
                        <div className="p-0.5">
                            <div className="text-[3px] font-medium text-gray-700">Card title</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ===== PRESETS =====

export const Content1Preset: DesignPreset = {
    id: 'content-1',
    familyId: 'content-text',
    name: 'Content 1',
    description: 'Centered text with button',
    controls: { textAlign: 'center', maxWidth: 'medium', showButton: true },
    Thumbnail: Content1Thumbnail,
}

export const Content2Preset: DesignPreset = {
    id: 'content-2',
    familyId: 'content-text',
    name: 'Content 2',
    description: 'Left-aligned text, narrow width',
    controls: { textAlign: 'left', maxWidth: 'narrow', showButton: false },
    Thumbnail: Content2Thumbnail,
}

export const Content3Preset: DesignPreset = {
    id: 'content-3',
    familyId: 'content-split',
    name: 'Content 3',
    description: 'Text left, image right',
    controls: { imagePlacement: 'right', showButton: true, showList: false },
    Thumbnail: Content3Thumbnail,
}

export const Content4Preset: DesignPreset = {
    id: 'content-4',
    familyId: 'content-split',
    name: 'Content 4',
    description: 'Image left, text right with list',
    controls: { imagePlacement: 'left', showButton: false, showList: true },
    Thumbnail: Content4Thumbnail,
}

export const Content5Preset: DesignPreset = {
    id: 'content-5',
    familyId: 'content-cards',
    name: 'Content 5',
    description: 'Three-column card grid with images',
    controls: { columns: '3', itemCount: '3', showImage: true },
    Thumbnail: Content5Thumbnail,
}

export const contentPresets: DesignPreset[] = [
    Content1Preset,
    Content2Preset,
    Content3Preset,
    Content4Preset,
    Content5Preset,
]
