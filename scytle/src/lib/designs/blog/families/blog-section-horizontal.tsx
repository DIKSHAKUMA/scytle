'use client'

/**
 * Blog Section Horizontal Family — Blog section with horizontal card rows.
 * Image left, text right (or reversed). For embedding in pages.
 *
 * Controls:
 * - itemCount: 2 | 3 | 4
 * - showExcerpt: boolean
 * - showAuthor: boolean
 * - showCta: boolean
 * - showDividers: boolean
 *
 * Editable content arrays: postTitles, postCategories, postExcerpts, postAuthors, postDates
 */

import { ImageIcon, ArrowRight } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

const defaultTitles = Array.from({ length: 4 }, () => 'Blog post title heading will go here')
const defaultCategories = Array.from({ length: 4 }, () => 'Category')
const defaultExcerpts = Array.from({ length: 4 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.')
const defaultAuthors = Array.from({ length: 4 }, () => 'Full name')
const defaultDates = Array.from({ length: 4 }, () => '11 Jan 2022')

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const itemCount = Number(controls?.itemCount ?? 3)
    const showExcerpt = controls?.showExcerpt !== false
    const showAuthor = controls?.showAuthor !== false
    const showCta = controls?.showCta !== false
    const showDividers = controls?.showDividers !== false

    const postTitles = (content?.postTitles as string[]) ?? defaultTitles
    const postCategories = (content?.postCategories as string[]) ?? defaultCategories
    const postExcerpts = (content?.postExcerpts as string[]) ?? defaultExcerpts
    const postAuthors = (content?.postAuthors as string[]) ?? defaultAuthors
    const postDates = (content?.postDates as string[]) ?? defaultDates

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
                        <div>
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
                        {showCta && !isMobile && (
                            <EditableText
                                value={(content?.ctaButton as string) || 'View all articles'}
                                onChange={(v) => onContentChange?.('ctaButton', v)}
                                as="span"
                                className="inline-block border border-gray-900 text-gray-900 px-5 py-2.5 text-sm font-medium flex-shrink-0"
                                editable={editable}
                            />
                        )}
                    </div>
                </div>

                {/* Horizontal Posts */}
                <div className="space-y-0">
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i}>
                            {showDividers && i === 0 && <div className="border-t border-gray-200" />}
                            <div className={`flex gap-6 py-6 ${isMobile ? 'flex-col' : ''}`}>
                                <div className={`${isMobile ? 'w-full aspect-[16/9]' : 'w-64 h-44'} bg-gray-100 border border-gray-200 rounded flex items-center justify-center flex-shrink-0`}>
                                    <ImageIcon className="w-6 h-6 text-gray-300" />
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
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
                                        className="font-semibold text-gray-900 text-base leading-snug"
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
                                    <div className="flex items-center gap-4 mt-3">
                                        {showAuthor && (
                                            <div className="flex items-center gap-2">
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
                                        <div className="flex items-center gap-1 text-xs font-medium text-gray-900">
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
                                </div>
                            </div>
                            {showDividers && <div className="border-t border-gray-200" />}
                        </div>
                    ))}
                </div>

                {/* Mobile CTA */}
                {showCta && isMobile && (
                    <div className="mt-8 text-center">
                        <EditableText
                            value={(content?.ctaButton as string) || 'View all articles'}
                            onChange={(v) => onContentChange?.('ctaButton', v)}
                            as="span"
                            className="inline-block border border-gray-900 text-gray-900 px-5 py-2.5 text-sm font-medium"
                            editable={editable}
                        />
                    </div>
                )}
            </div>
        </section>
    )
}

export const BlogSectionHorizontalFamily: TemplateFamily = {
    id: 'blog-section-horizontal',
    category: 'blog',
    name: 'Blog Section Horizontal',
    description: 'Blog section with horizontal post rows — for embedding in pages',
    tags: ['blog', 'section', 'horizontal', 'embedded'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'itemCount',
            label: 'Posts',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
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
        {
            key: 'showCta',
            label: 'Show CTA',
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
        itemCount: '3',
        showExcerpt: true,
        showAuthor: true,
        showCta: true,
        showDividers: true,
    },
    defaultContent: {
        tagline: 'Blog',
        heading: 'Short heading goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        readMoreLabel: 'Read more',
        ctaButton: 'View all articles',
    },
}
