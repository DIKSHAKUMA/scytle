/**
 * Hero Thumbnails — Icon placeholder previews for the sidebar
 *
 * These render inside an aspect-video container in the component library panel.
 * Will be replaced with actual images later.
 */

import { AlignLeft, Columns2, ImageIcon, PlayCircle, Layers } from 'lucide-react'

// ============================================
// Hero 44 Thumbnail — Left-aligned icon
// ============================================

export function Hero44Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <AlignLeft className="w-6 h-6 text-gray-400" />
            <span className="text-[10px] text-gray-400 font-medium">Left Aligned</span>
        </div>
    )
}

// ============================================
// Hero 57 Thumbnail — Split icon
// ============================================

export function Hero57Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <Columns2 className="w-6 h-6 text-gray-400" />
            <span className="text-[10px] text-gray-400 font-medium">Split Text</span>
        </div>
    )
}

// ============================================
// Hero 1 Thumbnail — Split with image
// ============================================

export function Hero1Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <AlignLeft className="w-4 h-4 text-gray-400" />
                <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Split + Image</span>
        </div>
    )
}

// ============================================
// Hero 3 Thumbnail — Split with video
// ============================================

export function Hero3Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center gap-1.5">
                <AlignLeft className="w-4 h-4 text-gray-400" />
                <PlayCircle className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-[10px] text-gray-400 font-medium">Split + Video</span>
        </div>
    )
}

// ============================================
// Hero 5 Thumbnail — Background image
// ============================================

export function Hero5Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center gap-1.5 rounded">
            <Layers className="w-6 h-6 text-gray-400" />
            <span className="text-[10px] text-gray-400 font-medium">BG Image</span>
        </div>
    )
}
