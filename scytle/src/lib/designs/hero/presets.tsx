'use client'

/**
 * Hero Presets — Named snapshots of hero family control values.
 * 
 * These are what users browse in the sidebar.
 * Each preset references a family and freezes specific control values.
 */

import { ImageIcon } from 'lucide-react'
import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Header 1 Thumbnail: Split layout — text left, image right */
function Header1Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex gap-2">
            <div className="flex-1 flex flex-col justify-center space-y-1">
                <div className="text-[6px] text-gray-400 uppercase">Tagline</div>
                <div className="text-[8px] font-semibold text-gray-800 leading-tight">
                    Medium length hero headline goes here
                </div>
                <div className="text-[5px] text-gray-500 leading-tight">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </div>
                <div className="flex gap-1 mt-1">
                    <div className="bg-gray-800 text-white text-[5px] px-1.5 py-0.5">Button</div>
                    <div className="border border-gray-300 text-gray-600 text-[5px] px-1.5 py-0.5">Button</div>
                </div>
            </div>
            <div className="flex-1 aspect-[4/3] bg-gray-200 flex items-center justify-center">
                <ImageIcon className="w-3 h-3 text-gray-400" />
            </div>
        </div>
    )
}

/** Header 2 Thumbnail: Centered text, no image */
function Header2Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center text-center space-y-1">
            <div className="text-[6px] text-gray-400 uppercase">Tagline</div>
            <div className="text-[8px] font-semibold text-gray-800 leading-tight max-w-[80%]">
                Medium length hero headline goes here
            </div>
            <div className="text-[5px] text-gray-500 leading-tight max-w-[70%]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </div>
            <div className="flex gap-1 mt-1">
                <div className="bg-gray-800 text-white text-[5px] px-1.5 py-0.5">Button</div>
                <div className="border border-gray-300 text-gray-600 text-[5px] px-1.5 py-0.5">Button</div>
            </div>
        </div>
    )
}

/** Header 3 Thumbnail: Centered text + image below */
function Header3Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="flex-1 bg-gray-200 flex items-center justify-center mb-1.5 relative">
                <div className="absolute inset-0 bg-gray-300/50" />
                <div className="relative z-10 text-center px-2 space-y-0.5">
                    <div className="text-[6px] text-gray-600 uppercase">Tagline</div>
                    <div className="text-[7px] font-semibold text-gray-800 leading-tight">
                        Hero headline
                    </div>
                    <div className="flex gap-0.5 justify-center mt-0.5">
                        <div className="bg-gray-800 text-white text-[4px] px-1 py-0.5">Button</div>
                        <div className="border border-gray-500 text-gray-600 text-[4px] px-1 py-0.5">Button</div>
                    </div>
                </div>
            </div>
            <div className="flex-shrink-0 h-1/3 bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                </svg>
            </div>
        </div>
    )
}

/** Header 4 Thumbnail: Image background — light gray bg with label */
function Header4Thumbnail() {
    return (
        <div className="w-full h-full relative bg-gray-100">
            <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1 py-0.5 bg-white/80 rounded text-[3px] text-gray-400">
                <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                BG
            </div>
            <div className="h-full flex flex-col items-center justify-center text-center p-2 space-y-0.5">
                <div className="text-[5px] text-gray-400 uppercase">Tagline</div>
                <div className="text-[7px] font-semibold text-gray-800 leading-tight">
                    Hero headline
                </div>
                <div className="text-[4px] text-gray-500 leading-tight max-w-[80%]">
                    Lorem ipsum dolor sit amet
                </div>
                <div className="flex gap-0.5 mt-0.5">
                    <div className="bg-gray-800 text-white text-[4px] px-1 py-0.5">Button</div>
                    <div className="border border-gray-300 text-gray-600 text-[4px] px-1 py-0.5">Button</div>
                </div>
            </div>
        </div>
    )
}

/** Header 5 Thumbnail: Video background — light gray bg with play label */
function Header5Thumbnail() {
    return (
        <div className="w-full h-full relative bg-gray-100">
            <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1 py-0.5 bg-white/80 rounded text-[3px] text-gray-400">
                <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polygon points="10,8 16,12 10,16" fill="currentColor" /></svg>
                Video
            </div>
            <div className="h-full flex flex-col items-center justify-center text-center p-2 space-y-0.5">
                <div className="text-[5px] text-gray-400 uppercase">Tagline</div>
                <div className="text-[7px] font-semibold text-gray-800 leading-tight">
                    Hero headline
                </div>
                <div className="flex gap-0.5 mt-0.5">
                    <div className="bg-gray-800 text-white text-[4px] px-1 py-0.5">Button</div>
                    <div className="border border-gray-300 text-gray-600 text-[4px] px-1 py-0.5">Button</div>
                </div>
            </div>
        </div>
    )
}

/** Header 16 Thumbnail: Dark bg, left text, mosaic images */
function Header16Thumbnail() {
    return (
        <div className="w-full h-full bg-neutral-950 p-1.5 flex flex-col">
            <div className="space-y-0.5 mb-1">
                <div className="text-[6px] font-medium text-white leading-tight">
                    Long heading is what you see here
                </div>
                <div className="text-[3px] text-white/60">Lorem ipsum dolor sit amet</div>
                <div className="flex gap-0.5 mt-0.5">
                    <div className="bg-[#2b5c8a] text-white text-[3px] px-1 py-0.5">Button</div>
                </div>
            </div>
            <div className="flex gap-0.5 flex-1 overflow-hidden">
                <div className="w-4 h-6 bg-neutral-800 flex-shrink-0" />
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <div className="w-3 h-3 bg-neutral-800" />
                    <div className="w-3 h-4 bg-neutral-800" />
                </div>
                <div className="w-4 h-4 bg-neutral-800 flex-shrink-0" />
                <div className="w-5 h-8 bg-neutral-800 flex-shrink-0" />
                <div className="w-4 h-5 bg-neutral-800 flex-shrink-0" />
            </div>
        </div>
    )
}

// ===== PRESETS =====

/** Header 1 — Split layout: text left, image right */
export const Header1Preset: DesignPreset = {
    id: 'hero-split',
    familyId: 'hero-split',
    name: 'Header 1',
    description: 'Text left, image right',
    controls: {
        textAlign: 'left',
        assetPlacement: 'right',
        buttonCount: '2',
        showTagline: true,
    },
    Thumbnail: Header1Thumbnail,
}

/** Header 2 — Centered text, no image */
export const Header2Preset: DesignPreset = {
    id: 'hero-centered',
    familyId: 'hero-centered',
    name: 'Header 2',
    description: 'Headline & CTA centered',
    controls: {
        textAlign: 'center',
        buttonCount: '2',
        showTagline: true,
        showImage: false,
    },
    Thumbnail: Header2Thumbnail,
}

/** Header 3 — Centered text + image below */
export const Header3Preset: DesignPreset = {
    id: 'hero-with-image',
    familyId: 'hero-centered',
    name: 'Header 3',
    description: 'Full hero with image below',
    controls: {
        textAlign: 'center',
        buttonCount: '2',
        showTagline: true,
        showImage: true,
    },
    Thumbnail: Header3Thumbnail,
}

/** Header 4 — Image background with centered text overlay */
export const Header4Preset: DesignPreset = {
    id: 'hero-image-bg-centered',
    familyId: 'hero-image-bg',
    name: 'Header 4',
    description: 'Image background with centered text',
    controls: {
        textAlign: 'center',
        buttonCount: '2',
        showTagline: true,
    },
    Thumbnail: Header4Thumbnail,
}

/** Header 5 — Video background with centered text overlay */
export const Header5Preset: DesignPreset = {
    id: 'hero-video-centered',
    familyId: 'hero-video',
    name: 'Header 5',
    description: 'Video background with text overlay',
    controls: {
        textAlign: 'center',
        buttonCount: '2',
        showTagline: true,
    },
    Thumbnail: Header5Thumbnail,
}

// ===== NEW PHASE 2 THUMBNAILS =====

/** Header 6 Thumbnail: Split with landscape image */
function Header6Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex gap-2">
            <div className="flex-1 flex flex-col justify-center space-y-1">
                <div className="text-[6px] text-gray-400 uppercase">Tagline</div>
                <div className="text-[8px] font-semibold text-gray-800 leading-tight">Hero headline</div>
                <div className="text-[5px] text-gray-500">Lorem ipsum dolor sit amet.</div>
                <div className="flex gap-1 mt-1">
                    <div className="bg-gray-800 text-white text-[5px] px-1.5 py-0.5">Button</div>
                    <div className="border border-gray-300 text-gray-600 text-[5px] px-1.5 py-0.5">Button</div>
                </div>
            </div>
            <div className="flex-1 aspect-video bg-gray-200 flex items-center justify-center self-center">
                <ImageIcon className="w-3 h-3 text-gray-400" />
            </div>
        </div>
    )
}

/** Header 7 Thumbnail: Minimal two-col with image below */
function Header7Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="flex gap-2 mb-1.5">
                <div className="flex-1">
                    <div className="text-[7px] font-semibold text-gray-800 leading-tight">Hero headline goes here</div>
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-0.5">
                    <div className="text-[4px] text-gray-500 leading-tight">Lorem ipsum dolor sit amet consectetur.</div>
                    <div className="flex gap-0.5">
                        <div className="bg-gray-800 text-white text-[4px] px-1 py-0.5">Button</div>
                        <div className="border border-gray-300 text-gray-600 text-[4px] px-1 py-0.5">Button</div>
                    </div>
                </div>
            </div>
            <div className="flex-1 bg-gray-200 flex items-center justify-center">
                <ImageIcon className="w-3 h-3 text-gray-400" />
            </div>
        </div>
    )
}

/** Header 8 Thumbnail: Minimal text-only, no image */
function Header8Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex items-center gap-2">
            <div className="flex-1">
                <div className="text-[8px] font-semibold text-gray-800 leading-tight">Medium length hero headline goes here</div>
            </div>
            <div className="flex-1 flex flex-col space-y-0.5">
                <div className="text-[5px] text-gray-500 leading-tight">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
                <div className="flex gap-0.5 mt-1">
                    <div className="bg-gray-800 text-white text-[4px] px-1 py-0.5">Button</div>
                    <div className="border border-gray-300 text-gray-600 text-[4px] px-1 py-0.5">Button</div>
                </div>
            </div>
        </div>
    )
}

/** Header 9 Thumbnail: Image BG with dark overlay */
function Header9Thumbnail() {
    return (
        <div className="w-full h-full relative bg-gray-700">
            <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1 py-0.5 bg-white/30 rounded text-[3px] text-gray-200">
                <ImageIcon className="w-2 h-2" /> BG
            </div>
            <div className="h-full flex flex-col items-center justify-center text-center p-2 space-y-0.5">
                <div className="text-[5px] text-gray-300 uppercase">Tagline</div>
                <div className="text-[7px] font-semibold text-white leading-tight">Hero headline</div>
                <div className="flex gap-0.5 mt-0.5">
                    <div className="bg-white text-gray-900 text-[4px] px-1 py-0.5">Button</div>
                    <div className="border border-white text-white text-[4px] px-1 py-0.5">Button</div>
                </div>
            </div>
        </div>
    )
}

/** Header 10 Thumbnail: Image BG with split text layout */
function Header10Thumbnail() {
    return (
        <div className="w-full h-full relative bg-gray-300">
            <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1 py-0.5 bg-white/80 rounded text-[3px] text-gray-400">
                <ImageIcon className="w-2 h-2" /> BG
            </div>
            <div className="h-full flex flex-col justify-end p-2 space-y-1">
                <div className="text-[7px] font-semibold text-gray-800 leading-tight">Hero headline</div>
                <div className="flex justify-between items-end">
                    <div className="text-[4px] text-gray-600 max-w-[50%]">Lorem ipsum dolor sit amet.</div>
                    <div className="flex gap-0.5">
                        <div className="bg-gray-800 text-white text-[4px] px-1 py-0.5">Button</div>
                        <div className="border border-gray-500 text-gray-600 text-[4px] px-1 py-0.5">Button</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/** Header 11 Thumbnail: Form — centered with inline form */
function Header11Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center text-center space-y-1">
            <div className="text-[7px] font-semibold text-gray-800 leading-tight">Hero headline</div>
            <div className="text-[4px] text-gray-500 max-w-[80%]">Lorem ipsum dolor sit amet.</div>
            <div className="flex gap-0.5 mt-0.5">
                <div className="border border-gray-300 text-gray-400 text-[4px] px-3 py-0.5">email@example.com</div>
                <div className="bg-gray-800 text-white text-[4px] px-1.5 py-0.5">Sign up</div>
            </div>
            <div className="text-[3px] text-gray-400">By signing up you agree to our Terms.</div>
        </div>
    )
}

/** Header 12 Thumbnail: Form — split with image */
function Header12Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex gap-2">
            <div className="flex-1 flex flex-col justify-center space-y-1">
                <div className="text-[7px] font-semibold text-gray-800 leading-tight">Hero headline</div>
                <div className="text-[4px] text-gray-500">Lorem ipsum dolor sit amet.</div>
                <div className="flex gap-0.5">
                    <div className="border border-gray-300 text-gray-400 text-[4px] px-2 py-0.5">email</div>
                    <div className="bg-gray-800 text-white text-[4px] px-1 py-0.5">Go</div>
                </div>
            </div>
            <div className="flex-1 bg-gray-200 flex items-center justify-center">
                <ImageIcon className="w-3 h-3 text-gray-400" />
            </div>
        </div>
    )
}

/** Header 13 Thumbnail: Form — centered with stacked form */
function Header13Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center text-center space-y-1">
            <div className="text-[7px] font-semibold text-gray-800 leading-tight">Hero headline</div>
            <div className="text-[4px] text-gray-500 max-w-[80%]">Lorem ipsum dolor sit amet.</div>
            <div className="flex flex-col gap-0.5 w-[60%] mt-0.5">
                <div className="border border-gray-300 text-gray-400 text-[4px] px-2 py-0.5 text-left">email@example.com</div>
                <div className="bg-gray-800 text-white text-[4px] py-0.5 text-center">Sign up</div>
            </div>
        </div>
    )
}

/** Header 14 Thumbnail: Card — left-aligned text */
function Header14Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5">
            <div className="w-full h-full relative bg-gray-300 p-2 flex flex-col justify-end">
                <div className="absolute top-0.5 right-0.5 flex items-center gap-0.5 px-0.5 py-0.5 bg-white/80 rounded text-[3px] text-gray-400">
                    <ImageIcon className="w-1.5 h-1.5" />
                </div>
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative space-y-0.5">
                    <div className="text-[6px] text-gray-200 uppercase">Tagline</div>
                    <div className="text-[7px] font-semibold text-white leading-tight">Hero headline</div>
                    <div className="text-[4px] text-gray-200">Lorem ipsum.</div>
                    <div className="flex gap-0.5 mt-0.5">
                        <div className="bg-white text-gray-900 text-[4px] px-1 py-0.5">Button</div>
                        <div className="border border-white text-white text-[4px] px-1 py-0.5">Button</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/** Header 15 Thumbnail: Card — centered text */
function Header15Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5">
            <div className="w-full h-full relative bg-gray-300 p-2 flex flex-col items-center justify-center text-center">
                <div className="absolute top-0.5 right-0.5 flex items-center gap-0.5 px-0.5 py-0.5 bg-white/80 rounded text-[3px] text-gray-400">
                    <ImageIcon className="w-1.5 h-1.5" />
                </div>
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative space-y-0.5">
                    <div className="text-[6px] text-gray-200 uppercase">Tagline</div>
                    <div className="text-[7px] font-semibold text-white leading-tight">Hero headline</div>
                    <div className="text-[4px] text-gray-200">Lorem ipsum.</div>
                    <div className="flex gap-0.5 mt-0.5 justify-center">
                        <div className="bg-white text-gray-900 text-[4px] px-1 py-0.5">Button</div>
                        <div className="border border-white text-white text-[4px] px-1 py-0.5">Button</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ===== PHASE 2 PRESETS =====

/** Header 6 — Split with landscape image ratio */
export const Header6Preset: DesignPreset = {
    id: 'hero-split-landscape',
    familyId: 'hero-split',
    name: 'Header 6',
    description: 'Split layout with landscape image',
    controls: {
        textAlign: 'left',
        assetPlacement: 'right',
        buttonCount: '2',
        showTagline: true,
        imageAspect: 'landscape',
    },
    Thumbnail: Header6Thumbnail,
}

/** Header 7 — Minimal two-column with image below */
export const Header7Preset: DesignPreset = {
    id: 'hero-minimal-with-image',
    familyId: 'hero-minimal',
    name: 'Header 7',
    description: 'Two-column text with image below',
    controls: {
        showImage: true,
        showTagline: false,
        buttonCount: '2',
        contentAlign: 'top',
    },
    Thumbnail: Header7Thumbnail,
}

/** Header 8 — Minimal text-only, no image */
export const Header8Preset: DesignPreset = {
    id: 'hero-minimal-text-only',
    familyId: 'hero-minimal',
    name: 'Header 8',
    description: 'Two-column text-only layout',
    controls: {
        showImage: false,
        showTagline: false,
        buttonCount: '2',
        contentAlign: 'center',
    },
    Thumbnail: Header8Thumbnail,
}

/** Header 9 — Image BG with dark overlay */
export const Header9Preset: DesignPreset = {
    id: 'hero-image-bg-dark',
    familyId: 'hero-image-bg',
    name: 'Header 9',
    description: 'Image background with dark overlay',
    controls: {
        textAlign: 'center',
        buttonCount: '2',
        showTagline: true,
        textLayout: 'single',
        overlayOpacity: 70,
    },
    Thumbnail: Header9Thumbnail,
}

/** Header 10 — Image BG with split text layout */
export const Header10Preset: DesignPreset = {
    id: 'hero-image-bg-split-text',
    familyId: 'hero-image-bg',
    name: 'Header 10',
    description: 'Image BG with heading left, body right',
    controls: {
        textAlign: 'left',
        buttonCount: '2',
        showTagline: false,
        textLayout: 'split',
        overlayOpacity: 30,
    },
    Thumbnail: Header10Thumbnail,
}

/** Header 11 — Form: centered with inline email form */
export const Header11Preset: DesignPreset = {
    id: 'hero-form-inline',
    familyId: 'hero-form',
    name: 'Header 11',
    description: 'Centered header with inline signup form',
    controls: {
        layout: 'centered',
        formStyle: 'inline',
        showImage: false,
        showDisclaimer: true,
        showTagline: false,
    },
    Thumbnail: Header11Thumbnail,
}

/** Header 12 — Form: split with image + inline form */
export const Header12Preset: DesignPreset = {
    id: 'hero-form-split',
    familyId: 'hero-form',
    name: 'Header 12',
    description: 'Split layout with image and signup form',
    controls: {
        layout: 'split',
        formStyle: 'inline',
        showImage: true,
        showDisclaimer: false,
        showTagline: false,
    },
    Thumbnail: Header12Thumbnail,
}

/** Header 13 — Form: centered with stacked form fields */
export const Header13Preset: DesignPreset = {
    id: 'hero-form-stacked',
    familyId: 'hero-form',
    name: 'Header 13',
    description: 'Centered header with stacked form',
    controls: {
        layout: 'centered',
        formStyle: 'stacked',
        showImage: false,
        showDisclaimer: false,
        showTagline: false,
    },
    Thumbnail: Header13Thumbnail,
}

/** Header 14 — Card: contained card with left-aligned text */
export const Header14Preset: DesignPreset = {
    id: 'hero-card-left',
    familyId: 'hero-card',
    name: 'Header 14',
    description: 'Contained card with left-aligned text',
    controls: {
        textAlign: 'left',
        buttonCount: '2',
        showTagline: true,
        overlayOpacity: 40,
    },
    Thumbnail: Header14Thumbnail,
}

/** Header 15 — Card: contained card with centered text */
export const Header15Preset: DesignPreset = {
    id: 'hero-card-centered',
    familyId: 'hero-card',
    name: 'Header 15',
    description: 'Contained card with centered text',
    controls: {
        textAlign: 'center',
        buttonCount: '2',
        showTagline: true,
        overlayOpacity: 40,
    },
    Thumbnail: Header15Thumbnail,
}

/** Header 16 — Gallery hero: dark bg, left text, mosaic images */
export const Header16Preset: DesignPreset = {
    id: 'hero-gallery',
    familyId: 'hero-gallery',
    name: 'Header 16',
    description: 'Dark hero with mosaic image collage',
    controls: {
        buttonCount: '2',
        showDescription: true,
    },
    Thumbnail: Header16Thumbnail,
}

/** Header 17 Thumbnail: Centered text, symmetric mosaic images */
function Header17Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="text-center space-y-0.5 mb-1">
                <div className="text-[6px] font-medium text-gray-800 leading-tight">
                    Medium length hero heading
                </div>
                <div className="text-[3px] text-gray-400">Lorem ipsum dolor sit amet</div>
                <div className="flex justify-center mt-0.5">
                    <div className="bg-gray-800 text-white text-[3px] px-1 py-0.5">Button</div>
                </div>
            </div>
            <div className="flex gap-0.5 flex-1 items-center justify-center overflow-hidden">
                <div className="w-3 h-5 bg-gray-100 flex-shrink-0" />
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <div className="w-3 h-3 bg-gray-100" />
                    <div className="w-3 h-4 bg-gray-100" />
                </div>
                <div className="w-6 h-8 bg-gray-100 flex-shrink-0" />
                <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <div className="w-3 h-4 bg-gray-100" />
                    <div className="w-3 h-3 bg-gray-100" />
                </div>
                <div className="w-3 h-5 bg-gray-100 flex-shrink-0" />
            </div>
        </div>
    )
}

/** Header 17 — Mosaic hero: centered text, symmetric image collage */
export const Header17Preset: DesignPreset = {
    id: 'hero-mosaic',
    familyId: 'hero-mosaic',
    name: 'Header 17',
    description: 'Centered hero with symmetric image mosaic',
    controls: {
        buttonCount: '1',
        showDescription: true,
    },
    Thumbnail: Header17Thumbnail,
}

/** All hero presets for registry */
export const heroPresets: DesignPreset[] = [
    Header1Preset,
    Header2Preset,
    Header3Preset,
    Header4Preset,
    Header5Preset,
    Header6Preset,
    Header7Preset,
    Header8Preset,
    Header9Preset,
    Header10Preset,
    Header11Preset,
    Header12Preset,
    Header13Preset,
    Header14Preset,
    Header15Preset,
    Header16Preset,
    Header17Preset,
]
