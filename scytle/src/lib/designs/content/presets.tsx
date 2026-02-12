'use client'

/**
 * Content Presets — Named snapshots of Content family control values.
 */

import { ImageIcon, Check, X, Play, Home, ShoppingCart, UtensilsCrossed, Layers, Zap, Shield } from 'lucide-react'
import type { DesignPreset } from '../types'
import { resolveIcon } from '@/components/wireframe/editable-icon'

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

// ===== NEW FAMILY THUMBNAILS =====

/** Content 6 Thumbnail: Feature list — heading left, 2-col sub-items */
function Content6Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex gap-2 items-start">
            <div className="flex-1 space-y-0.5">
                <div className="text-[6px] font-semibold text-gray-800">Heading</div>
                <div className="text-[3px] text-gray-400">Description text</div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-0.5">
                        <div className="w-2 h-2 bg-gray-100 border border-gray-200 rounded" />
                        <div className="text-[3px] font-medium text-gray-700">Item {i + 1}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Content 7 Thumbnail: Feature list — heading top, 3-col */
function Content7Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5">
                <div className="text-[6px] font-semibold text-gray-800">Feature List</div>
            </div>
            <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-0.5">
                        <div className="w-2 h-2 bg-gray-100 border border-gray-200 rounded" />
                        <div className="text-[3px] font-medium text-gray-700">Item</div>
                        <div className="text-[2px] text-gray-400">Lorem ipsum</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Content 8 Thumbnail: Steps — horizontal numbered */
function Content8Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Steps</div>
            </div>
            <div className="flex gap-1 items-start flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center text-center">
                        <div className="w-3 h-3 bg-gray-800 rounded-full flex items-center justify-center mb-0.5">
                            <span className="text-[3px] text-white font-bold">{i + 1}</span>
                        </div>
                        <div className="text-[3px] font-medium text-gray-700">Step</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Content 9 Thumbnail: Steps — vertical */
function Content9Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Process</div>
            </div>
            <div className="space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-[3px] text-white font-bold">{i + 1}</span>
                        </div>
                        <div className="text-[3px] font-medium text-gray-700">Step {i + 1}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Content 10 Thumbnail: Tabs — underline, with image */
function Content10Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Tabbed</div>
            </div>
            <div className="flex gap-2 border-b border-gray-200 mb-1 pb-0.5">
                <div className="text-[3px] font-medium text-gray-800 border-b border-gray-800 pb-0.5">Tab 1</div>
                <div className="text-[3px] text-gray-400">Tab 2</div>
                <div className="text-[3px] text-gray-400">Tab 3</div>
            </div>
            <div className="flex gap-1 flex-1">
                <div className="flex-1 space-y-0.5">
                    <div className="text-[4px] font-medium text-gray-700">Content</div>
                    <div className="text-[3px] text-gray-400">Lorem ipsum dolor</div>
                </div>
                <div className="flex-1 bg-gray-100 rounded flex items-center justify-center">
                    <ImageIcon className="w-2 h-2 text-gray-300" />
                </div>
            </div>
        </div>
    )
}

/** Content 11 Thumbnail: Tabs — pill, no image */
function Content11Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Tabbed</div>
            </div>
            <div className="flex gap-1 justify-center mb-1">
                <div className="text-[3px] font-medium text-white bg-gray-800 px-1 py-0.5 rounded-full">Tab 1</div>
                <div className="text-[3px] text-gray-500 border border-gray-200 px-1 py-0.5 rounded-full">Tab 2</div>
            </div>
            <div className="flex-1 space-y-0.5">
                <div className="text-[4px] font-medium text-gray-700">Tab content here</div>
                <div className="text-[3px] text-gray-400">Lorem ipsum dolor sit amet.</div>
            </div>
        </div>
    )
}

/** Content 12 Thumbnail: Image overlay — bottom-left text, dark */
function Content12Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-200 relative">
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute bottom-1.5 left-1.5 space-y-0.5">
                <div className="text-[5px] font-bold text-white">Overlay heading</div>
                <div className="text-[3px] text-white/70">Lorem ipsum dolor</div>
                <div className="w-6 h-1.5 bg-white rounded mt-0.5" />
            </div>
        </div>
    )
}

/** Content 13 Thumbnail: Image overlay — centered text */
function Content13Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-200 relative">
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-0.5">
                    <div className="text-[5px] font-bold text-white">Centered heading</div>
                    <div className="text-[3px] text-white/70">Description text</div>
                </div>
            </div>
        </div>
    )
}

/** Content 14 Thumbnail: Comparison — 2 columns */
function Content14Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Compare</div>
            </div>
            <div className="grid grid-cols-2 gap-1 flex-1">
                {Array.from({ length: 2 }).map((_, col) => (
                    <div key={col} className="border border-gray-200 p-1 space-y-0.5">
                        <div className="text-[4px] font-medium text-gray-700">Option {col + 1}</div>
                        {Array.from({ length: 3 }).map((_, r) => (
                            <div key={r} className="flex items-center gap-0.5">
                                <Check className={`w-1.5 h-1.5 ${r < 2 - col ? 'text-gray-800' : 'text-gray-200'}`} />
                                <div className="text-[3px] text-gray-500">Feature</div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Content 15 Thumbnail: Comparison — 3 columns, highlight */
function Content15Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="text-center mb-0.5">
                <div className="text-[5px] font-semibold text-gray-800">Compare</div>
            </div>
            <div className="grid grid-cols-3 gap-0.5 flex-1">
                {Array.from({ length: 3 }).map((_, col) => (
                    <div key={col} className={`p-0.5 ${col === 1 ? 'border border-gray-800 bg-gray-50' : 'border border-gray-200'}`}>
                        <div className="text-[3px] font-medium text-gray-700">Opt {col + 1}</div>
                        {Array.from({ length: 2 }).map((_, r) => (
                            <div key={r} className="flex items-center gap-0.5">
                                <Check className="w-1 h-1 text-gray-400" />
                                <div className="text-[2px] text-gray-500">Feat</div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ===== NEW PRESETS =====

export const Content6Preset: DesignPreset = {
    id: 'content-6',
    familyId: 'content-feature-list',
    name: 'Content 6',
    description: 'Feature list — heading left, 2-column sub-items with icons',
    controls: { headingPosition: 'left', subItemColumns: '2', showIcons: true, showButtons: true },
    Thumbnail: Content6Thumbnail,
}

export const Content7Preset: DesignPreset = {
    id: 'content-7',
    familyId: 'content-feature-list',
    name: 'Content 7',
    description: 'Feature list — heading top, 3 sub-items',
    controls: { headingPosition: 'top', subItemColumns: '1', showIcons: true, showButtons: false },
    Thumbnail: Content7Thumbnail,
}

export const Content8Preset: DesignPreset = {
    id: 'content-8',
    familyId: 'content-steps',
    name: 'Content 8',
    description: 'Horizontal numbered steps',
    controls: { layout: 'horizontal', style: 'numbered', showConnectors: true },
    Thumbnail: Content8Thumbnail,
}

export const Content9Preset: DesignPreset = {
    id: 'content-9',
    familyId: 'content-steps',
    name: 'Content 9',
    description: 'Vertical process steps with icons',
    controls: { layout: 'vertical', style: 'icon', showConnectors: true },
    Thumbnail: Content9Thumbnail,
}

export const Content10Preset: DesignPreset = {
    id: 'content-10',
    familyId: 'content-tabs',
    name: 'Content 10',
    description: 'Underline tabs with image',
    controls: { tabCount: '3', tabStyle: 'underline', showImage: true, imagePosition: 'right' },
    Thumbnail: Content10Thumbnail,
}

export const Content11Preset: DesignPreset = {
    id: 'content-11',
    familyId: 'content-tabs',
    name: 'Content 11',
    description: 'Pill tabs, text only',
    controls: { tabCount: '4', tabStyle: 'pill', showImage: false },
    Thumbnail: Content11Thumbnail,
}

export const Content12Preset: DesignPreset = {
    id: 'content-12',
    familyId: 'content-image-overlay',
    name: 'Content 12',
    description: 'Dark overlay, text bottom-left',
    controls: { textPosition: 'bottom-left', overlayDarkness: 'dark', imageHeight: 'large', showButton: true },
    Thumbnail: Content12Thumbnail,
}

export const Content13Preset: DesignPreset = {
    id: 'content-13',
    familyId: 'content-image-overlay',
    name: 'Content 13',
    description: 'Centered text overlay',
    controls: { textPosition: 'center', overlayDarkness: 'medium', imageHeight: 'full', showButton: false },
    Thumbnail: Content13Thumbnail,
}

export const Content14Preset: DesignPreset = {
    id: 'content-14',
    familyId: 'content-comparison',
    name: 'Content 14',
    description: '2-column comparison with checkmarks',
    controls: { columns: '2', showCheckmarks: true, highlightColumn: 'none', showButton: true },
    Thumbnail: Content14Thumbnail,
}

export const Content15Preset: DesignPreset = {
    id: 'content-15',
    familyId: 'content-comparison',
    name: 'Content 15',
    description: '3-column comparison, highlighted middle',
    controls: { columns: '3', showCheckmarks: true, highlightColumn: 'second', showButton: true },
    Thumbnail: Content15Thumbnail,
}

// ===== SPLIT FEATURES THUMBNAILS & PRESETS =====

/** Content 16 Thumbnail: Image left, stacked feature list right */
function Content16Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex gap-1.5 items-center">
            <div className="flex-1 aspect-[4/3] bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                <ImageIcon className="w-3 h-3 text-gray-300" />
            </div>
            <div className="flex-1 space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-0.5">
                        <div className="w-1.5 h-1.5 bg-gray-200 rounded-sm flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="text-[3px] font-medium text-gray-700">Feature {i + 1}</div>
                            <div className="text-[2px] text-gray-400">Lorem ipsum</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Content 17 Thumbnail: Card style, image right */
function Content17Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex gap-1.5 items-center">
            <div className="flex-1 space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-0.5 p-0.5 bg-gray-50 rounded">
                        <div className="w-1.5 h-1.5 bg-gray-200 rounded-sm flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="text-[3px] font-medium text-gray-700">Feature {i + 1}</div>
                            <div className="text-[2px] text-gray-400">Lorem ipsum</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex-1 aspect-[4/3] bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                <ImageIcon className="w-3 h-3 text-gray-300" />
            </div>
        </div>
    )
}

export const Content16Preset: DesignPreset = {
    id: 'content-16',
    familyId: 'content-split-features',
    name: 'Content 16',
    description: 'Image left, stacked feature list right',
    controls: { imagePlacement: 'left', style: 'normal', imageStyle: 'default', showButtons: true },
    Thumbnail: Content16Thumbnail,
}

export const Content17Preset: DesignPreset = {
    id: 'content-17',
    familyId: 'content-split-features',
    name: 'Content 17',
    description: 'Feature cards left, expanded image right',
    controls: { imagePlacement: 'right', style: 'card', imageStyle: 'expand', showButtons: false },
    Thumbnail: Content17Thumbnail,
}

// ===== VIDEO THUMBNAILS & PRESETS =====

/** Content 18 Thumbnail: Stacked video */
function Content18Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Video</div>
                <div className="text-[3px] text-gray-400">Description text here</div>
            </div>
            <div className="flex-1 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                <Play className="w-3 h-3 text-gray-400 fill-gray-400" />
            </div>
        </div>
    )
}

/** Content 19 Thumbnail: Split video */
function Content19Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex gap-1.5 items-center">
            <div className="flex-1 space-y-0.5">
                <div className="text-[6px] font-semibold text-gray-800">Video</div>
                <div className="text-[3px] text-gray-400">Lorem ipsum dolor</div>
                <div className="w-6 h-1 bg-gray-200 rounded mt-0.5" />
            </div>
            <div className="flex-1 aspect-[16/9] bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                <Play className="w-3 h-3 text-gray-400 fill-gray-400" />
            </div>
        </div>
    )
}

export const Content18Preset: DesignPreset = {
    id: 'content-18',
    familyId: 'content-video',
    name: 'Content 18',
    description: 'Stacked video with centered text above',
    controls: { layout: 'stacked', aspectRatio: '16:9', showButton: true },
    Thumbnail: Content18Thumbnail,
}

export const Content19Preset: DesignPreset = {
    id: 'content-19',
    familyId: 'content-video',
    name: 'Content 19',
    description: 'Split — text left, video right',
    controls: { layout: 'split', videoPosition: 'right', aspectRatio: '16:9', showButton: true },
    Thumbnail: Content19Thumbnail,
}

// ===== CENTERED FEATURES THUMBNAILS & PRESETS =====

/** Content 20 Thumbnail: 3-column centered icons */
function Content20Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[3px] text-gray-400 uppercase">Options</div>
                <div className="text-[6px] font-semibold text-gray-800">Features</div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="text-center space-y-0.5">
                        <div className="w-2.5 h-2.5 bg-gray-100 rounded mx-auto flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-sm" />
                        </div>
                        <div className="text-[3px] font-medium text-gray-700">Feature</div>
                        <div className="text-[2px] text-gray-400">Lorem ipsum</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Content 21 Thumbnail: 3-column lined */
function Content21Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[3px] text-gray-400 uppercase">Options</div>
                <div className="text-[6px] font-semibold text-gray-800">Features</div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-0.5 border-t border-gray-200 pt-1">
                        <div className="w-2.5 h-2.5 bg-gray-100 rounded flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-sm" />
                        </div>
                        <div className="text-[3px] font-medium text-gray-700">Feature</div>
                        <div className="text-[2px] text-gray-400">Lorem ipsum</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Content 22 Thumbnail: 4-column centered, image assets */
function Content22Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="text-center mb-0.5">
                <div className="text-[5px] font-semibold text-gray-800">Features</div>
            </div>
            <div className="grid grid-cols-4 gap-0.5 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="text-center space-y-0.5">
                        <div className="aspect-[3/2] bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                            <ImageIcon className="w-1.5 h-1.5 text-gray-300" />
                        </div>
                        <div className="text-[2.5px] font-medium text-gray-700">Feature</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export const Content20Preset: DesignPreset = {
    id: 'content-20',
    familyId: 'content-centered-feature',
    name: 'Content 20',
    description: 'Centered 3-column features with icons',
    controls: { columns: '3', style: 'normal', assetType: 'icon', textAlign: 'left', showButtons: true },
    Thumbnail: Content20Thumbnail,
}

export const Content21Preset: DesignPreset = {
    id: 'content-21',
    familyId: 'content-centered-feature',
    name: 'Content 21',
    description: 'Centered 3-column features, lined style',
    controls: { columns: '3', style: 'lined', assetType: 'icon', textAlign: 'left', showButtons: false },
    Thumbnail: Content21Thumbnail,
}

export const Content22Preset: DesignPreset = {
    id: 'content-22',
    familyId: 'content-centered-feature',
    name: 'Content 22',
    description: 'Centered 4-column features with images',
    controls: { columns: '4', style: 'normal', assetType: 'image', textAlign: 'center', showButtons: true },
    Thumbnail: Content22Thumbnail,
}

export const contentPresets: DesignPreset[] = [
    Content1Preset,
    Content2Preset,
    Content3Preset,
    Content4Preset,
    Content5Preset,
    Content6Preset,
    Content7Preset,
    Content8Preset,
    Content9Preset,
    Content10Preset,
    Content11Preset,
    Content12Preset,
    Content13Preset,
    Content14Preset,
    Content15Preset,
    Content16Preset,
    Content17Preset,
    Content18Preset,
    Content19Preset,
    Content20Preset,
    Content21Preset,
    Content22Preset,
]
