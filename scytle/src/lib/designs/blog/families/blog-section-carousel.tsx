'use client'

/**
 * Blog Section Carousel Family — Blog section with horizontally scrolling post cards.
 * For embedding in pages (Blog 65-68 designs).
 *
 * Controls:
 * - itemCount: 4 | 6 | 8
 * - showExcerpt: boolean
 * - showAuthor: boolean
 *
 * Editable content arrays: postTitles, postCategories, postExcerpts, postAuthors, postDates
 */

import { ChevronLeft, ChevronRight, ImageIcon, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

const defaultTitles = Array.from({ length: 8 }, () => 'Blog post title heading will go here')
const defaultCategories = Array.from({ length: 8 }, () => 'Category')
const defaultExcerpts = Array.from({ length: 8 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
const defaultAuthors = Array.from({ length: 8 }, () => 'Full name')
const defaultDates = Array.from({ length: 8 }, () => '11 Jan 2022')

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const itemCount = Number(controls?.itemCount ?? 6)
    const showExcerpt = controls?.showExcerpt !== false
    const showAuthor = controls?.showAuthor !== false

    const postTitles = (content?.postTitles as string[]) ?? defaultTitles
    const postCategories = (content?.postCategories as string[]) ?? defaultCategories
    const postExcerpts = (content?.postExcerpts as string[]) ?? defaultExcerpts
    const postAuthors = (content?.postAuthors as string[]) ?? defaultAuthors
    const postDates = (content?.postDates as string[]) ?? defaultDates

    const visibleCount = isMobile ? 1 : isTablet ? 2 : 3
    const [page, setPage] = useState(0)
    const totalPages = Math.ceil(itemCount / visibleCount)
    const startIdx = page * visibleCount

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header + Nav */}
                <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
                    <div>
                        <EditableText
                            value={(content?.tagline as string) || 'Blog'}
                            onChange={(v) => onContentChange?.('tagline', v)}
                            as="p"
                            className="text-sm text-gray-400 uppercase tracking-wide mb-3"
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.heading as string) || 'Short heading goes here'}
                            onChange={(v) => onContentChange?.('heading', v)}
                            as="h2"
                            className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                            onChange={(v) => onContentChange?.('subheading', v)}
                            as="p"
                            className="text-gray-500 mt-2 text-sm max-w-lg"
                            editable={editable}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                            disabled={page === 0}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30"
                            disabled={page >= totalPages - 1}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Carousel */}
                <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: visibleCount }).map((_, vi) => {
                        const i = startIdx + vi
                        if (i >= itemCount) return <div key={vi} />
                        return (
                            <div key={vi}>
                                <div className="aspect-[16/9] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
                                    <ImageIcon className="w-8 h-8 text-gray-300" />
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <EditableText
                                        value={postCategories[i] ?? 'Category'}
                                        onChange={(v) => { const u = [...postCategories]; u[i] = v; onContentChange?.('postCategories', u) }}
                                        as="span"
                                        className="text-[10px] text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full"
                                        editable={editable}
                                    />
                                    <span className="text-[10px] text-gray-300">•</span>
                                    <EditableText
                                        value={postDates[i] ?? '11 Jan 2022'}
                                        onChange={(v) => { const u = [...postDates]; u[i] = v; onContentChange?.('postDates', u) }}
                                        as="span"
                                        className="text-[10px] text-gray-400"
                                        editable={editable}
                                    />
                                </div>
                                <EditableText
                                    value={postTitles[i] ?? 'Blog post title heading will go here'}
                                    onChange={(v) => { const u = [...postTitles]; u[i] = v; onContentChange?.('postTitles', u) }}
                                    as="h3"
                                    className="font-semibold text-gray-900 text-sm leading-snug"
                                    editable={editable}
                                />
                                {showExcerpt && (
                                    <EditableText
                                        value={postExcerpts[i] ?? 'Lorem ipsum dolor sit amet.'}
                                        onChange={(v) => { const u = [...postExcerpts]; u[i] = v; onContentChange?.('postExcerpts', u) }}
                                        as="p"
                                        className="text-xs text-gray-500 mt-2 line-clamp-2"
                                        editable={editable}
                                        multiline
                                    />
                                )}
                                {showAuthor && (
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0" />
                                        <EditableText
                                            value={postAuthors[i] ?? 'Full name'}
                                            onChange={(v) => { const u = [...postAuthors]; u[i] = v; onContentChange?.('postAuthors', u) }}
                                            as="span"
                                            className="text-[10px] text-gray-500"
                                            editable={editable}
                                        />
                                    </div>
                                )}
                                <div className="flex items-center gap-1 mt-3 text-xs font-medium text-gray-900">
                                    <EditableText
                                        value={(content?.readMoreLabel as string) || 'Read more'}
                                        onChange={(v) => onContentChange?.('readMoreLabel', v)}
                                        as="span"
                                        className="text-xs font-medium text-gray-900"
                                        editable={editable}
                                    />
                                    <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Pagination dots */}
                <div className="flex justify-center gap-1.5 mt-8">
                    {Array.from({ length: totalPages }).map((_, pi) => (
                        <button
                            key={pi}
                            onClick={() => setPage(pi)}
                            className={`w-2 h-2 rounded-full transition-colors ${pi === page ? 'bg-gray-800' : 'bg-gray-200'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

export const BlogSectionCarouselFamily: TemplateFamily = {
    id: 'blog-section-carousel',
    category: 'blog',
    name: 'Blog Section Carousel',
    description: 'Blog section with horizontally scrolling post cards',
    tags: ['blog', 'section', 'carousel', 'slider', 'embedded'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'itemCount',
            label: 'Posts',
            type: 'toggle-group',
            options: [
                { value: '4', label: '4' },
                { value: '6', label: '6' },
                { value: '8', label: '8' },
            ],
            defaultValue: '6',
        },
        {
            key: 'showExcerpt',
            label: 'Show Excerpt',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showAuthor',
            label: 'Show Author',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        itemCount: '6',
        showExcerpt: true,
        showAuthor: true,
    },
    defaultContent: {
        tagline: 'Blog',
        heading: 'Short heading goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        readMoreLabel: 'Read more',
    },
}
