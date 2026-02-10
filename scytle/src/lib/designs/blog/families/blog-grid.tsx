'use client'

/**
 * Blog Grid Family — Blog post cards in a grid.
 *
 * Controls:
 * - columns: 2 | 3
 * - itemCount: 3 | 4 | 6
 * - showImage: boolean
 * - showExcerpt: boolean
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 3)
    const itemCount = Number(controls?.itemCount ?? 3)
    const showImage = controls?.showImage !== false
    const showExcerpt = controls?.showExcerpt !== false

    const gridCols = isMobile ? 1 : isTablet ? 2 : columns

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Blog'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Latest articles'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {/* Grid */}
                <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                            {showImage && (
                                <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-gray-300" />
                                </div>
                            )}
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">
                                        Category
                                    </span>
                                    <span className="text-[10px] text-gray-400">5 min read</span>
                                </div>
                                <h3 className="font-semibold text-gray-900 text-sm">
                                    Blog post title goes here
                                </h3>
                                {showExcerpt && (
                                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">
                                        Short excerpt from the blog post that gives readers a preview of the content.
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-3">
                                    <div className="w-6 h-6 rounded-full bg-gray-200" />
                                    <span className="text-[10px] text-gray-500">Author Name</span>
                                    <span className="text-[10px] text-gray-400 ml-auto">Jan 1, 2025</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const BlogGridFamily: TemplateFamily = {
    id: 'blog-grid',
    category: 'blog',
    name: 'Blog Grid',
    description: 'Blog post cards in a grid layout',
    tags: ['blog', 'grid', 'articles', 'posts'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
            ],
            defaultValue: '3',
        },
        {
            key: 'itemCount',
            label: 'Posts',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '6', label: '6' },
            ],
            defaultValue: '3',
        },
        {
            key: 'showImage',
            label: 'Show Image',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showExcerpt',
            label: 'Show Excerpt',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '3',
        itemCount: '3',
        showImage: true,
        showExcerpt: true,
    },
    defaultContent: {
        tagline: 'Blog',
        heading: 'Latest articles',
    },
}
