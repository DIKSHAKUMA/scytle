'use client'

/**
 * Blog List Family — Vertical blog post list.
 *
 * Controls:
 * - itemCount: 3 | 4 | 5
 * - showImage: boolean
 * - showDividers: boolean
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const itemCount = Number(controls?.itemCount ?? 4)
    const showImage = controls?.showImage !== false
    const showDividers = controls?.showDividers !== false

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="mb-10">
                    <EditableText
                        value={(content?.heading as string) || 'All posts'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {/* List */}
                <div className="space-y-0">
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i}>
                            <div className={`flex gap-4 ${isMobile ? 'flex-col' : ''} py-5`}>
                                {showImage && (
                                    <div className={`${isMobile ? 'w-full aspect-[16/9]' : 'w-48 h-28'} bg-gray-100 border border-gray-200 flex items-center justify-center rounded flex-shrink-0`}>
                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded">
                                            Category
                                        </span>
                                        <span className="text-[10px] text-gray-400">Jan 1, 2025</span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 text-sm">
                                        Blog post title goes here
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                        Short excerpt from the blog post that gives readers a preview of the content and key takeaways.
                                    </p>
                                    <div className="text-xs text-gray-400 mt-2">
                                        By Author Name · 5 min read
                                    </div>
                                </div>
                            </div>
                            {showDividers && i < itemCount - 1 && (
                                <div className="border-t border-gray-200" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const BlogListFamily: TemplateFamily = {
    id: 'blog-list',
    category: 'blog',
    name: 'Blog List',
    description: 'Vertical list of blog posts',
    tags: ['blog', 'list', 'articles', 'posts'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'itemCount',
            label: 'Posts',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
            ],
            defaultValue: '4',
        },
        {
            key: 'showImage',
            label: 'Show Thumbnail',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showDividers',
            label: 'Dividers',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        itemCount: '4',
        showImage: true,
        showDividers: true,
    },
    defaultContent: {
        heading: 'All posts',
    },
}
