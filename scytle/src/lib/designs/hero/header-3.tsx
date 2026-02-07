'use client'

/**
 * Header 3 - Hero with Image
 * Full hero with background image placeholder
 */

import type { DesignDefinition, CanvasProps } from '../types'

// ===== THUMBNAIL (sidebar preview) =====
function Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="flex-1 bg-gray-200 flex items-center justify-center mb-1.5 relative">
                {/* Image placeholder overlay */}
                <div className="absolute inset-0 bg-gray-300/50" />
                {/* Content overlay */}
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
            {/* Image placeholder icon */}
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

// ===== CANVAS (full wireframe) =====
function Canvas({ content, viewport }: CanvasProps) {
    const isMobile = viewport === 'mobile'

    return (
        <section className="relative">
            {/* Text Content Section */}
            <div className={`py-16 ${isMobile ? 'px-4' : 'px-16'}`}>
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
            </div>

            {/* Image Placeholder Section */}
            <div className={`${isMobile ? 'px-4 pb-8' : 'px-16 pb-16'}`}>
                <div className="max-w-5xl mx-auto">
                    <div className="aspect-video bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <svg className="w-16 h-16 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="M21 15l-5-5L5 21" />
                            </svg>
                            <p className="text-sm">Image placeholder</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

// ===== EXPORT =====
export const Header3: DesignDefinition = {
    id: 'hero-with-image',
    category: 'hero',
    name: 'Header 3',
    description: 'Full hero with background image',
    tags: ['visual', 'image', 'full-width'],
    layout: 'with-image',
    hasImage: true,
    Thumbnail,
    Canvas,
}
