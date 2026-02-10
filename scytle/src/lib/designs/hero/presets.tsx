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

/** All hero presets for registry */
export const heroPresets: DesignPreset[] = [
    Header1Preset,
    Header2Preset,
    Header3Preset,
    Header4Preset,
    Header5Preset,
]
