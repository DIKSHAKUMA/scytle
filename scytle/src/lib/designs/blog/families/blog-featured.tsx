'use client'

/**
 * Blog Featured Family — Featured post hero + smaller post cards.
 *
 * Controls:
 * - sideCount: 2 | 3
 * - showExcerpt: boolean
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const sideCount = Number(controls?.sideCount ?? 2)
    const showExcerpt = controls?.showExcerpt !== false

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="mb-10">
                    <EditableText
                        value={(content?.tagline as string) || 'Featured'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Featured articles'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {/* Layout */}
                <div className={`${isMobile ? 'space-y-6' : 'flex gap-6'}`}>
                    {/* Featured (large) */}
                    <div className={`${isMobile ? 'w-full' : 'flex-1'}`}>
                        <div className="border border-gray-200 rounded-lg overflow-hidden h-full">
                            <div className="aspect-[16/10] bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-gray-300" />
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">
                                        Featured
                                    </span>
                                    <span className="text-[10px] text-gray-400">Jan 1, 2025</span>
                                </div>
                                <h3 className={`font-bold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>
                                    Featured post title goes here
                                </h3>
                                {showExcerpt && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Extended excerpt from the featured blog post that gives readers a detailed preview of the content.
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="w-7 h-7 rounded-full bg-gray-200" />
                                    <div>
                                        <div className="text-xs font-medium text-gray-900">Author Name</div>
                                        <div className="text-[10px] text-gray-400">8 min read</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side posts */}
                    <div className={`${isMobile ? 'w-full space-y-4' : 'w-80 space-y-4'}`}>
                        {Array.from({ length: sideCount }).map((_, i) => (
                            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-gray-300" />
                                </div>
                                <div className="p-3">
                                    <span className="text-[10px] text-gray-400">Category · 5 min</span>
                                    <h4 className="font-semibold text-gray-900 text-sm mt-1">
                                        Post title goes here
                                    </h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export const BlogFeaturedFamily: TemplateFamily = {
    id: 'blog-featured',
    category: 'blog',
    name: 'Blog Featured',
    description: 'Featured post hero with side post cards',
    tags: ['blog', 'featured', 'hero', 'posts'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'sideCount',
            label: 'Side Posts',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
            ],
            defaultValue: '2',
        },
        {
            key: 'showExcerpt',
            label: 'Show Excerpt',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        sideCount: '2',
        showExcerpt: true,
    },
    defaultContent: {
        tagline: 'Featured',
        heading: 'Featured articles',
    },
}
