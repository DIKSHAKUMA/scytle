'use client'

/**
 * Header 1 - Split Layout Hero
 * Text left, image right
 */

import { ImageIcon } from 'lucide-react'
import type { DesignDefinition, CanvasProps } from '../types'

// ===== THUMBNAIL (sidebar preview) =====
function Thumbnail() {
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

// ===== CANVAS (full wireframe) =====
function Canvas({ content, viewport }: CanvasProps) {
    const isMobile = viewport === 'mobile'

    return (
        <section className={`py-12 ${isMobile ? 'px-4' : 'px-16'}`}>
            <div className={`max-w-7xl mx-auto ${isMobile ? 'flex flex-col gap-8' : 'flex items-center gap-12'}`}>
                {/* Text Content */}
                <div className="flex-1 space-y-4">
                    <p className="text-sm text-gray-400 uppercase tracking-wide">
                        {(content?.tagline as string) || 'Tagline'}
                    </p>
                    <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                        {(content?.heading as string) || 'Medium length hero headline goes here'}
                    </h1>
                    <p className="text-gray-500">
                        {(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                    </p>
                    <div className="flex gap-3 pt-2">
                        <div className="bg-gray-800 text-white px-5 py-2.5 text-sm font-medium">
                            {(content?.primaryCta as string) || 'Button'}
                        </div>
                        <div className="border border-gray-300 text-gray-700 px-5 py-2.5 text-sm font-medium">
                            {(content?.secondaryCta as string) || 'Button'}
                        </div>
                    </div>
                </div>

                {/* Image Placeholder */}
                <div className={`${isMobile ? 'w-full' : 'flex-1'} aspect-[4/3] bg-gray-100 border border-gray-200 flex items-center justify-center`}>
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
            </div>
        </section>
    )
}

// ===== EXPORT =====
export const Header1: DesignDefinition = {
    id: 'hero-split',
    category: 'hero',
    name: 'Header 1',
    description: 'Text left, image right',
    tags: ['split', 'image', 'classic'],
    layout: 'split',
    hasImage: true,
    Thumbnail,
    Canvas,
}
