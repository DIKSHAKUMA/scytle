'use client'

/**
 * Blog List Family — Vertical blog post list with thumbnails.
 *
 * Controls:
 * - itemCount: 3 | 4 | 5 | 6
 * - showImage: boolean
 * - showDividers: boolean
 * - showExcerpt: boolean
 * - layout: horizontal | stacked
 *
 * Editable content arrays: postTitles, postCategories, postExcerpts, postAuthors, postDates
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

const defaultTitles = Array.from({ length: 6 }, () => 'Blog post title heading will go here')
const defaultCategories = Array.from({ length: 6 }, () => 'Category')
const defaultExcerpts = Array.from({ length: 6 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.')
const defaultAuthors = Array.from({ length: 6 }, () => 'Full name')
const defaultDates = Array.from({ length: 6 }, () => '11 Jan 2022')

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const itemCount = Number(controls?.itemCount ?? 4)
    const showImage = controls?.showImage !== false
    const showDividers = controls?.showDividers !== false
    const showExcerpt = controls?.showExcerpt !== false
    const layout = (controls?.layout as string) ?? 'horizontal'

    const postTitles = (content?.postTitles as string[]) ?? defaultTitles
    const postCategories = (content?.postCategories as string[]) ?? defaultCategories
    const postExcerpts = (content?.postExcerpts as string[]) ?? defaultExcerpts
    const postAuthors = (content?.postAuthors as string[]) ?? defaultAuthors
    const postDates = (content?.postDates as string[]) ?? defaultDates

    const isStacked = layout === 'stacked' || isMobile

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="mb-10">
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
                        className={`text-gray-500 mt-4 ${isMobile ? 'text-sm' : 'text-base'}`}
                        editable={editable}
                    />
                </div>

                {/* List */}
                <div className="space-y-0">
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i}>
                            <div className={`flex gap-5 ${isStacked ? 'flex-col' : ''} py-6`}>
                                {showImage && (
                                    <div className={`${isStacked ? 'w-full aspect-[16/9]' : 'w-56 h-36'} bg-gray-100 border border-gray-200 flex items-center justify-center rounded flex-shrink-0`}>
                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                    </div>
                                )}
                                <div className="flex-1">
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
                                            value={postExcerpts[i] ?? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                                            onChange={(v) => { const u = [...postExcerpts]; u[i] = v; onContentChange?.('postExcerpts', u) }}
                                            as="p"
                                            className="text-xs text-gray-500 mt-1.5 line-clamp-2"
                                            editable={editable}
                                            multiline
                                        />
                                    )}
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
    description: 'Vertical list of blog posts with thumbnails',
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
                { value: '6', label: '6' },
            ],
            defaultValue: '4',
        },
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'horizontal', label: 'Row' },
                { value: 'stacked', label: 'Stacked' },
            ],
            defaultValue: 'horizontal',
        },
        {
            key: 'showImage',
            label: 'Show Thumbnail',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showExcerpt',
            label: 'Show Excerpt',
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
        layout: 'horizontal',
        showImage: true,
        showExcerpt: true,
        showDividers: true,
    },
    defaultContent: {
        tagline: 'Blog',
        heading: 'Short heading goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
}
