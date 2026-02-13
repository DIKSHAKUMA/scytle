'use client'

/**
 * Blog Section Large Family — Blog section with one large featured post + smaller grid.
 * For embedding in pages (Blog 57-60 designs).
 *
 * Controls:
 * - sideCount: 2 | 3 | 4
 * - layout: topFeatured | sideFeatured
 * - showExcerpt: boolean
 * - showAuthor: boolean
 *
 * Editable content arrays: postTitles, postCategories, postExcerpts, postAuthors, postDates
 */

import { ImageIcon, ArrowRight } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

const defaultTitles = ['Featured blog post title heading goes here', 'Blog post title', 'Blog post title', 'Blog post title', 'Blog post title']
const defaultCategories = ['Category', 'Category', 'Category', 'Category', 'Category']
const defaultExcerpts = Array.from({ length: 5 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.')
const defaultAuthors = Array.from({ length: 5 }, () => 'Full name')
const defaultDates = Array.from({ length: 5 }, () => '11 Jan 2022')

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const sideCount = Number(controls?.sideCount ?? 2)
    const layout = (controls?.layout as string) ?? 'topFeatured'
    const showExcerpt = controls?.showExcerpt !== false
    const showAuthor = controls?.showAuthor !== false

    const postTitles = (content?.postTitles as string[]) ?? defaultTitles
    const postCategories = (content?.postCategories as string[]) ?? defaultCategories
    const postExcerpts = (content?.postExcerpts as string[]) ?? defaultExcerpts
    const postAuthors = (content?.postAuthors as string[]) ?? defaultAuthors
    const postDates = (content?.postDates as string[]) ?? defaultDates

    const isTopFeatured = layout === 'topFeatured'

    const renderMeta = (i: number) => (
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
    )

    const renderAuthor = (i: number) =>
        showAuthor ? (
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
        ) : null

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="mb-12">
                    <EditableText
                        value={(content?.tagline as string) || 'Blog'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-3"
                        editable={editable}
                    />
                    <div className="flex items-end justify-between gap-4 flex-wrap">
                        <EditableText
                            value={(content?.heading as string) || 'Short heading goes here'}
                            onChange={(v) => onContentChange?.('heading', v)}
                            as="h2"
                            className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.ctaButton as string) || 'View all'}
                            onChange={(v) => onContentChange?.('ctaButton', v)}
                            as="span"
                            className="inline-block border border-gray-900 text-gray-900 px-5 py-2.5 text-sm font-medium flex-shrink-0"
                            editable={editable}
                        />
                    </div>
                    <EditableText
                        value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-500 mt-4 text-sm max-w-xl"
                        editable={editable}
                    />
                </div>

                {isTopFeatured || isMobile ? (
                    /* Featured on top, grid below */
                    <div className="space-y-8">
                        {/* Large featured */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="aspect-[16/7] bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-gray-300" />
                            </div>
                            <div className="p-6">
                                {renderMeta(0)}
                                <EditableText
                                    value={postTitles[0] ?? 'Featured blog post title'}
                                    onChange={(v) => { const u = [...postTitles]; u[0] = v; onContentChange?.('postTitles', u) }}
                                    as="h3"
                                    className="font-bold text-gray-900 text-xl"
                                    editable={editable}
                                />
                                {showExcerpt && (
                                    <EditableText
                                        value={postExcerpts[0] ?? 'Lorem ipsum dolor sit amet.'}
                                        onChange={(v) => { const u = [...postExcerpts]; u[0] = v; onContentChange?.('postExcerpts', u) }}
                                        as="p"
                                        className="text-sm text-gray-500 mt-2"
                                        editable={editable}
                                        multiline
                                    />
                                )}
                                {renderAuthor(0)}
                            </div>
                        </div>

                        {/* Smaller grid */}
                        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : sideCount <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                            {Array.from({ length: sideCount }).map((_, i) => {
                                const idx = i + 1
                                return (
                                    <div key={idx}>
                                        <div className="aspect-[16/9] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mb-3">
                                            <ImageIcon className="w-6 h-6 text-gray-300" />
                                        </div>
                                        {renderMeta(idx)}
                                        <EditableText
                                            value={postTitles[idx] ?? 'Blog post title'}
                                            onChange={(v) => { const u = [...postTitles]; u[idx] = v; onContentChange?.('postTitles', u) }}
                                            as="h4"
                                            className="font-semibold text-gray-900 text-sm"
                                            editable={editable}
                                        />
                                        <div className="flex items-center gap-1 mt-2 text-xs font-medium text-gray-900">
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
                    </div>
                ) : (
                    /* Side featured: large left, list right */
                    <div className="flex gap-8">
                        <div className="flex-1">
                            <div className="border border-gray-200 rounded-lg overflow-hidden h-full flex flex-col">
                                <div className="aspect-[16/10] bg-gray-100 flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-gray-300" />
                                </div>
                                <div className="p-5 flex-1">
                                    {renderMeta(0)}
                                    <EditableText
                                        value={postTitles[0] ?? 'Featured blog post title'}
                                        onChange={(v) => { const u = [...postTitles]; u[0] = v; onContentChange?.('postTitles', u) }}
                                        as="h3"
                                        className="font-bold text-gray-900 text-lg"
                                        editable={editable}
                                    />
                                    {showExcerpt && (
                                        <EditableText
                                            value={postExcerpts[0] ?? 'Lorem ipsum dolor sit amet.'}
                                            onChange={(v) => { const u = [...postExcerpts]; u[0] = v; onContentChange?.('postExcerpts', u) }}
                                            as="p"
                                            className="text-sm text-gray-500 mt-2"
                                            editable={editable}
                                            multiline
                                        />
                                    )}
                                    {renderAuthor(0)}
                                </div>
                            </div>
                        </div>
                        <div className="w-80 space-y-4">
                            {Array.from({ length: sideCount }).map((_, i) => {
                                const idx = i + 1
                                return (
                                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
                                            <ImageIcon className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <div className="p-3">
                                            {renderMeta(idx)}
                                            <EditableText
                                                value={postTitles[idx] ?? 'Blog post title'}
                                                onChange={(v) => { const u = [...postTitles]; u[idx] = v; onContentChange?.('postTitles', u) }}
                                                as="h4"
                                                className="font-semibold text-gray-900 text-sm"
                                                editable={editable}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export const BlogSectionLargeFamily: TemplateFamily = {
    id: 'blog-section-large',
    category: 'blog',
    name: 'Blog Section Large',
    description: 'Blog section with a large featured post and smaller grid',
    tags: ['blog', 'section', 'featured', 'large', 'embedded'],
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
                { value: '4', label: '4' },
            ],
            defaultValue: '2',
        },
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'topFeatured', label: 'Top' },
                { value: 'sideFeatured', label: 'Side' },
            ],
            defaultValue: 'topFeatured',
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
        sideCount: '2',
        layout: 'topFeatured',
        showExcerpt: true,
        showAuthor: true,
    },
    defaultContent: {
        tagline: 'Blog',
        heading: 'Short heading goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        readMoreLabel: 'Read more',
        ctaButton: 'View all',
    },
}
