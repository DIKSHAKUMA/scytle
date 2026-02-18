/**
 * Gallery Thumbnails — PNG image thumbnails from Figma designs
 *
 * Uses actual PNG screenshots of the Figma gallery designs.
 * Images are stored in public/thumbnails/gallery/ and generated
 * by running: FIGMA_TOKEN=xxx npx tsx scripts/download-gallery-thumbnails.ts
 *
 * Falls back to a minimal coded placeholder if the PNG is missing.
 */

'use client'

import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import type { GalleryPresetConfig } from './types'

// ============================================
// Fallback placeholder (shown when PNG is missing)
// ============================================

function FallbackThumbnail({ variant }: { variant: number }) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2 bg-[#1a1a1a]">
            <ImageIcon className="w-5 h-5 text-white/30" />
            <span className="text-[9px] text-white/40 font-medium">Gallery {variant}</span>
        </div>
    )
}

// ============================================
// Image thumbnail with fallback
// ============================================

export function GalleryThumbnail({ variant }: { variant: number }) {
    const [hasError, setHasError] = useState(false)
    const src = `/thumbnails/gallery/gallery-${variant}.png`

    if (hasError) {
        return <FallbackThumbnail variant={variant} />
    }

    return (
        <div className="w-full h-full relative overflow-hidden bg-[#1a1a1a]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt={`Gallery ${variant}`}
                className="w-full h-full object-cover object-top"
                onError={() => setHasError(true)}
                loading="lazy"
            />
        </div>
    )
}

/**
 * Create a thumbnail component bound to a specific preset config.
 * Returns a React.FC with no props (ready for the component library).
 */
export function createGalleryThumbnail(preset: GalleryPresetConfig): React.FC {
    function Thumbnail() {
        return <GalleryThumbnail variant={preset.relumeGallery} />
    }
    Thumbnail.displayName = `${preset.name}Thumbnail`
    return Thumbnail
}
