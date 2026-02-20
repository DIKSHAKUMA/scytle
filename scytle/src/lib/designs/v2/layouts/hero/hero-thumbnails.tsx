/**
 * Hero Thumbnails — Icon placeholder previews for the sidebar
 *
 * These render inside an aspect-video container in the component library panel.
 * Will be replaced with actual images later.
 */

import { AlignLeft, Columns2 } from 'lucide-react'

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
            <span className="text-[10px] text-gray-400 font-medium">Split</span>
        </div>
    )
}
