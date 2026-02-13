'use client'

/**
 * Blog Section Grid Family — Small blog section with posts in a grid.
 * Designed as an embedded section within a page (not a full blog page header).
 *
 * Controls:
 * - columns: 2 | 3
 * - itemCount: 2 | 3 | 4 | 6
 * - alignment: center | left
 * - showImage: boolean
 * - showExcerpt: boolean
 * - showAuthor: boolean
 * - showCta: boolean
 *
 * Editable content arrays: postTitles, postCategories, postExcerpts, postAuthors, postDates
 */

import { ImageIcon, ArrowRight } from 'lucide-react'
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
    const columns = Number(controls?.columns ?? 3)
    const itemCount = Number(controls?.itemCount ?? 3)
    const alignment = (controls?.alignment as string) ?? 'center'
    const showImage = controls?.showImage !== false
    const showExcerpt = controls?.showExcerpt !== false
    const showAuthor = controls?.showAuthor !== false
    const showCta = controls?.showCta !== false
    const isCenter = alignment === 'center'

    const gridCols = isMobile ? 1 : isTablet ? 2 : columns

    const postTitles = (content?.postTitles as string[]) ?? defaultTitles
    const postCategories = (content?.postCategories as string[]) ?? defaultCategories
    const postExcerpts = (content?.postExcerpts as string[]) ?? defaultExcerpts
    const postAuthors = (content?.postAuthors as string[]) ?? defaultAuthors
    const postDates = (content?.postDates as string[]) ?? defaultDates

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className={`mb-12 ${isCenter ? 'text-center max-w-2xl mx-auto' : ''}`}>
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

                {/* Grid */}
                <div
                    className="grid gap-8"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i}>
                            {showImage && (
                                <div className="aspect-[16/9] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
                                    <ImageIcon className="w-8 h-8 text-gray-300" />
                                </div>
                            )}
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
                                <div className="flex items-center gap-2 mt-4">
                                    <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
                                    <div>
                                        <EditableText
                                            value={postAuthors[i] ?? 'Full name'}
                                            onChange={(v) => { const u = [...postAuthors]; u[i] = v; onContentChange?.('postAuthors', u) }}
                                            as="span"
                                            className="text-xs font-medium text-gray-700 block"
                                            editable={editable}
                                        />
                                        <EditableText
                                            value={postDates[i] ?? '11 Jan 2022'}
                                            onChange={(v) => { const u = [...postDates]; u[i] = v; onContentChange?.('postDates', u) }}
                                            as="span"
                                            className="text-[10px] text-gray-400 block"
                                            editable={editable}
                                        />
                                    </div>
                                </div>
                            )}
                            {/* Read more link */}
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
                    ))}
                </div>

                {/* CTA */}
                {showCta && (
                    <div className="mt-12 text-center">
                        <EditableText
                            value={(content?.ctaButton as string) || 'View all'}
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

export const BlogSectionGridFamily: TemplateFamily = {
    id: 'blog-section-grid',
    category: 'blog',
    name: 'Blog Section Grid',
    description: 'Blog section with posts in a grid — for embedding in pages',
    tags: ['blog', 'section', 'grid', 'embedded'],
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
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '6', label: '6' },
            ],
            defaultValue: '3',
        },
        {
            key: 'alignment',
            label: 'Alignment',
            type: 'toggle-group',
            options: [
                { value: 'center', label: 'Center' },
                { value: 'left', label: 'Left' },
            ],
            defaultValue: 'center',
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
    ],
    defaultControls: {
        columns: '3',
        itemCount: '3',
        alignment: 'center',
        showImage: true,
        showExcerpt: true,
        showAuthor: true,
        showCta: true,
    },
    defaultContent: {
        tagline: 'Blog',
        heading: 'Short heading goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        readMoreLabel: 'Read more',
        ctaButton: 'View all',
    },
}
