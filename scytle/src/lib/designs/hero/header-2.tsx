'use client'

/**
 * Header 2 - Centered Hero
 * Headline & CTA centered
 */

import type { DesignDefinition, CanvasProps } from '../types'

// ===== THUMBNAIL (sidebar preview) =====
function Thumbnail() {
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

// ===== CANVAS (full wireframe) =====
function Canvas({ content, viewport }: CanvasProps) {
    const isMobile = viewport === 'mobile'

    return (
        <section className={`py-16 ${isMobile ? 'px-4' : 'px-16'}`}>
            <div className="max-w-3xl mx-auto text-center space-y-6">
                <p className="text-sm text-gray-400 uppercase tracking-wide">
                    {(content?.tagline as string) || 'Tagline'}
                </p>
                <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-5xl'}`}>
                    {(content?.heading as string) || 'Medium length hero headline goes here'}
                </h1>
                <p className="text-gray-500 text-lg">
                    {(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                </p>
                <div className="flex gap-3 justify-center pt-2">
                    <div className="bg-gray-800 text-white px-6 py-3 text-sm font-medium">
                        {(content?.primaryCta as string) || 'Button'}
                    </div>
                    <div className="border border-gray-300 text-gray-700 px-6 py-3 text-sm font-medium">
                        {(content?.secondaryCta as string) || 'Button'}
                    </div>
                </div>
            </div>
        </section>
    )
}

// ===== EXPORT =====
export const Header2: DesignDefinition = {
    id: 'hero-centered',
    category: 'hero',
    name: 'Header 2',
    description: 'Headline & CTA centered',
    tags: ['minimal', 'centered', 'clean'],
    layout: 'centered',
    hasImage: false,
    Thumbnail,
    Canvas,
}
