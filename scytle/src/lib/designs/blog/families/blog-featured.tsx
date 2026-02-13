'use client'

/**
 * Blog Featured Family — Large featured post hero + smaller side post cards.
 *
 * Controls:
 * - sideCount: 2 | 3
 * - showExcerpt: boolean
 * - layout: side | stacked
 *
 * Editable content: featured post + side posts
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

const defaultTitles = ['Featured blog post title heading goes here', 'Blog post title', 'Blog post title', 'Blog post title']
const defaultCategories = ['Featured', 'Category', 'Category', 'Category']
const defaultExcerpts = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    'Short excerpt from the blog post.',
    'Short excerpt from the blog post.',
    'Short excerpt from the blog post.',
]
const defaultAuthors = ['Full name', 'Full name', 'Full name', 'Full name']
const defaultDates = ['11 Jan 2022', '11 Jan 2022', '11 Jan 2022', '11 Jan 2022']

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const sideCount = Number(controls?.sideCount ?? 2)
    const showExcerpt = controls?.showExcerpt !== false
    const layout = (controls?.layout as string) ?? 'side'

    const postTitles = (content?.postTitles as string[]) ?? defaultTitles
    const postCategories = (content?.postCategories as string[]) ?? defaultCategories
    const postExcerpts = (content?.postExcerpts as string[]) ?? defaultExcerpts
    const postAuthors = (content?.postAuthors as string[]) ?? defaultAuthors
    const postDates = (content?.postDates as string[]) ?? defaultDates

    const isStacked = layout === 'stacked'

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
                            className={`font-bold text-gray-900 max-w-xl ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                            onChange={(v) => onContentChange?.('subheading', v)}
                            as="p"
                            className="text-gray-500 max-w-sm text-sm"
                            editable={editable}
                        />
                    </div>
                </div>

                {/* Layout */}
                {isStacked || isMobile ? (
                    /* Stacked: featured on top, grid of side posts below */
                    <div className="space-y-8">
                        {/* Featured */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="aspect-[16/8] bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-gray-300" />
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <EditableText
                                        value={postCategories[0] ?? 'Featured'}
                                        onChange={(v) => { const u = [...postCategories]; u[0] = v; onContentChange?.('postCategories', u) }}
                                        as="span"
                                        className="text-[10px] text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full"
                                        editable={editable}
                                    />
                                    <span className="text-[10px] text-gray-300">•</span>
                                    <EditableText
                                        value={postDates[0] ?? '11 Jan 2022'}
                                        onChange={(v) => { const u = [...postDates]; u[0] = v; onContentChange?.('postDates', u) }}
                                        as="span"
                                        className="text-[10px] text-gray-400"
                                        editable={editable}
                                    />
                                </div>
                                <EditableText
                                    value={postTitles[0] ?? 'Featured blog post title heading goes here'}
                                    onChange={(v) => { const u = [...postTitles]; u[0] = v; onContentChange?.('postTitles', u) }}
                                    as="h3"
                                    className={`font-bold text-gray-900 ${isMobile ? 'text-base' : 'text-xl'}`}
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
                                <div className="flex items-center gap-2 mt-4">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                                    <EditableText
                                        value={postAuthors[0] ?? 'Full name'}
                                        onChange={(v) => { const u = [...postAuthors]; u[0] = v; onContentChange?.('postAuthors', u) }}
                                        as="span"
                                        className="text-xs font-medium text-gray-700"
                                        editable={editable}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Side posts grid */}
                        <div className={`grid gap-6 ${sideCount >= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                            {Array.from({ length: sideCount }).map((_, i) => {
                                const idx = i + 1
                                return (
                                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <EditableText
                                                    value={postCategories[idx] ?? 'Category'}
                                                    onChange={(v) => { const u = [...postCategories]; u[idx] = v; onContentChange?.('postCategories', u) }}
                                                    as="span"
                                                    className="text-[10px] text-gray-500"
                                                    editable={editable}
                                                />
                                                <span className="text-[10px] text-gray-300">•</span>
                                                <EditableText
                                                    value={postDates[idx] ?? '11 Jan 2022'}
                                                    onChange={(v) => { const u = [...postDates]; u[idx] = v; onContentChange?.('postDates', u) }}
                                                    as="span"
                                                    className="text-[10px] text-gray-400"
                                                    editable={editable}
                                                />
                                            </div>
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
                ) : (
                    /* Side layout: featured left, side posts right */
                    <div className="flex gap-6">
                        {/* Featured (large) */}
                        <div className="flex-1">
                            <div className="border border-gray-200 rounded-lg overflow-hidden h-full">
                                <div className="aspect-[16/10] bg-gray-100 flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-gray-300" />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <EditableText
                                            value={postCategories[0] ?? 'Featured'}
                                            onChange={(v) => { const u = [...postCategories]; u[0] = v; onContentChange?.('postCategories', u) }}
                                            as="span"
                                            className="text-[10px] text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full"
                                            editable={editable}
                                        />
                                        <span className="text-[10px] text-gray-300">•</span>
                                        <EditableText
                                            value={postDates[0] ?? '11 Jan 2022'}
                                            onChange={(v) => { const u = [...postDates]; u[0] = v; onContentChange?.('postDates', u) }}
                                            as="span"
                                            className="text-[10px] text-gray-400"
                                            editable={editable}
                                        />
                                    </div>
                                    <EditableText
                                        value={postTitles[0] ?? 'Featured blog post title heading goes here'}
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
                                    <div className="flex items-center gap-2 mt-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
                                        <EditableText
                                            value={postAuthors[0] ?? 'Full name'}
                                            onChange={(v) => { const u = [...postAuthors]; u[0] = v; onContentChange?.('postAuthors', u) }}
                                            as="span"
                                            className="text-xs font-medium text-gray-700"
                                            editable={editable}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side posts */}
                        <div className="w-80 space-y-4">
                            {Array.from({ length: sideCount }).map((_, i) => {
                                const idx = i + 1
                                return (
                                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <div className="p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <EditableText
                                                    value={postCategories[idx] ?? 'Category'}
                                                    onChange={(v) => { const u = [...postCategories]; u[idx] = v; onContentChange?.('postCategories', u) }}
                                                    as="span"
                                                    className="text-[10px] text-gray-500"
                                                    editable={editable}
                                                />
                                                <span className="text-[10px] text-gray-300">•</span>
                                                <EditableText
                                                    value={postDates[idx] ?? '11 Jan 2022'}
                                                    onChange={(v) => { const u = [...postDates]; u[idx] = v; onContentChange?.('postDates', u) }}
                                                    as="span"
                                                    className="text-[10px] text-gray-400"
                                                    editable={editable}
                                                />
                                            </div>
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
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'side', label: 'Side' },
                { value: 'stacked', label: 'Stacked' },
            ],
            defaultValue: 'side',
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
        layout: 'side',
        showExcerpt: true,
    },
    defaultContent: {
        tagline: 'Blog',
        heading: 'Short heading goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
}
