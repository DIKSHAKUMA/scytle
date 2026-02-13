'use client'

/**
 * Blog Presets — Named snapshots of Blog family control values.
 * Mapped to Relume Figma designs Blog 1–68 + Blog Post Header 1–5.
 */

import { ImageIcon } from 'lucide-react'
import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Blog Grid: 3-col with images */
function BlogGridThumb3() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Latest articles</div>
            </div>
            <div className="grid grid-cols-3 gap-0.5 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded overflow-hidden">
                        <div className="aspect-[16/9] bg-gray-100" />
                        <div className="p-0.5">
                            <div className="text-[2.5px] text-gray-400">Category</div>
                            <div className="text-[3px] font-medium text-gray-700">Post title</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Blog Grid: 2-col */
function BlogGridThumb2() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Blog</div>
            </div>
            <div className="grid grid-cols-2 gap-0.5 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded overflow-hidden">
                        <div className="aspect-[16/9] bg-gray-100" />
                        <div className="p-0.5">
                            <div className="text-[3px] font-medium text-gray-700">Post title</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Blog List */
function BlogListThumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="mb-1">
                <div className="text-[7px] font-semibold text-gray-800">All posts</div>
            </div>
            <div className="flex-1 space-y-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-1 pb-0.5 border-b border-gray-100">
                        <div className="w-6 h-4 bg-gray-100 border border-gray-200 rounded flex-shrink-0" />
                        <div className="flex-1">
                            <div className="text-[3px] font-medium text-gray-700">Post title goes here</div>
                            <div className="text-[2.5px] text-gray-400">Excerpt text...</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Blog Featured */
function BlogFeaturedThumb() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Featured</div>
            </div>
            <div className="flex gap-0.5 flex-1">
                <div className="flex-1 border border-gray-200 rounded overflow-hidden">
                    <div className="aspect-[16/10] bg-gray-100" />
                    <div className="p-0.5">
                        <div className="text-[3px] font-medium text-gray-700">Featured post</div>
                    </div>
                </div>
                <div className="w-8 space-y-0.5">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="border border-gray-200 rounded overflow-hidden">
                            <div className="aspect-[16/9] bg-gray-100" />
                            <div className="p-0.5">
                                <div className="text-[2.5px] font-medium text-gray-700">Post</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/** Blog Horizontal */
function BlogHorizontalThumb() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Blog</div>
            </div>
            <div className="flex-1 space-y-0.5">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex gap-0.5 border border-gray-200 rounded overflow-hidden">
                        <div className="w-8 h-5 bg-gray-100 flex-shrink-0" />
                        <div className="p-0.5 flex-1">
                            <div className="text-[2.5px] text-gray-400">Category</div>
                            <div className="text-[3px] font-medium text-gray-700">Post title</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Blog Sidebar */
function BlogSidebarThumb() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex gap-0.5">
            <div className="flex-1 space-y-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-0.5">
                        <div className="w-5 h-3 bg-gray-100 border border-gray-200 rounded flex-shrink-0" />
                        <div className="flex-1">
                            <div className="text-[3px] font-medium text-gray-700">Title</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="w-6 space-y-0.5 flex-shrink-0">
                <div className="text-[3px] font-medium text-gray-700">Categories</div>
                <div className="h-1 bg-gray-100 rounded" />
                <div className="h-1 bg-gray-100 rounded" />
                <div className="border border-gray-200 rounded p-0.5">
                    <div className="text-[2.5px] text-gray-400">Newsletter</div>
                </div>
            </div>
        </div>
    )
}

/** Blog Section Grid */
function BlogSectionGridThumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[5px] text-gray-400">Blog</div>
                <div className="text-[6px] font-semibold text-gray-800">Latest posts</div>
            </div>
            <div className="grid grid-cols-3 gap-0.5 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                        <div className="aspect-[16/9] bg-gray-100 border border-gray-200 rounded mb-0.5" />
                        <div className="text-[3px] font-medium text-gray-700">Title</div>
                        <div className="text-[2.5px] text-gray-500 mt-0.5">Read more →</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Blog Section Horizontal */
function BlogSectionHorizThumb() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="flex justify-between items-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Blog</div>
                <div className="text-[3px] border border-gray-300 px-1 py-0.5 text-gray-600">View all</div>
            </div>
            <div className="flex-1 space-y-0.5">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex gap-0.5 py-0.5 border-t border-gray-100">
                        <div className="w-6 h-4 bg-gray-100 border border-gray-200 rounded flex-shrink-0" />
                        <div className="flex-1">
                            <div className="text-[3px] font-medium text-gray-700">Post title</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Blog Section Large */
function BlogSectionLargeThumb() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Featured</div>
            </div>
            <div className="flex-1 space-y-0.5">
                <div className="border border-gray-200 rounded overflow-hidden">
                    <div className="h-5 bg-gray-100" />
                    <div className="p-0.5 text-[3px] font-medium text-gray-700">Featured title</div>
                </div>
                <div className="grid grid-cols-2 gap-0.5">
                    {[0, 1].map((i) => (
                        <div key={i}>
                            <div className="aspect-[16/9] bg-gray-100 border border-gray-200 rounded" />
                            <div className="text-[2.5px] text-gray-700 mt-0.5">Title</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/** Blog Section Split */
function BlogSectionSplitThumb() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex gap-1">
            <div className="w-1/3 flex-shrink-0">
                <div className="text-[5px] font-semibold text-gray-800">Blog</div>
                <div className="text-[3px] text-gray-400 mt-0.5">Latest posts</div>
                <div className="text-[3px] border border-gray-300 px-0.5 py-0.5 text-gray-600 mt-1 inline-block">View all</div>
            </div>
            <div className="flex-1 space-y-1">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i}>
                        <div className="aspect-[16/9] bg-gray-100 border border-gray-200 rounded mb-0.5" />
                        <div className="text-[3px] font-medium text-gray-700">Post title</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Blog Section Carousel */
function BlogSectionCarouselThumb() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="flex justify-between items-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Blog</div>
                <div className="flex gap-0.5">
                    <div className="w-2 h-2 rounded-full border border-gray-300 flex items-center justify-center text-[5px] text-gray-400">‹</div>
                    <div className="w-2 h-2 rounded-full border border-gray-300 flex items-center justify-center text-[5px] text-gray-400">›</div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-0.5 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                        <div className="aspect-[16/9] bg-gray-100 border border-gray-200 rounded" />
                        <div className="text-[3px] font-medium text-gray-700 mt-0.5">Title</div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center gap-0.5 mt-1">
                {[0, 1].map((i) => <div key={i} className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-gray-800' : 'bg-gray-200'}`} />)}
            </div>
        </div>
    )
}

/** Blog Post Header */
function BlogPostHeaderThumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[3px] text-gray-400">Blog › Category</div>
                <div className="text-[6px] font-semibold text-gray-800 mt-0.5">Post title goes here</div>
                <div className="text-[3px] text-gray-400 mt-0.5">By Author · 5 min read</div>
            </div>
            <div className="flex-1 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-gray-300" />
            </div>
        </div>
    )
}

// ===== PRESETS =====
// Blog Headers (Blog 1–32)

export const Blog1Preset: DesignPreset = { id: 'blog-1', familyId: 'blog-grid', name: 'Blog 1', description: '3-col grid, images, center-aligned, excerpts', controls: { columns: '3', itemCount: '3', alignment: 'center', showImage: true, showExcerpt: true, showAuthor: true, cardBorder: false, metaStyle: 'badge' }, Thumbnail: BlogGridThumb3 }
export const Blog2Preset: DesignPreset = { id: 'blog-2', familyId: 'blog-grid', name: 'Blog 2', description: '3-col grid, images, center, no excerpt', controls: { columns: '3', itemCount: '3', alignment: 'center', showImage: true, showExcerpt: false, showAuthor: true, cardBorder: false, metaStyle: 'badge' }, Thumbnail: BlogGridThumb3 }
export const Blog3Preset: DesignPreset = { id: 'blog-3', familyId: 'blog-grid', name: 'Blog 3', description: '3-col grid, images, center, with card border', controls: { columns: '3', itemCount: '3', alignment: 'center', showImage: true, showExcerpt: true, showAuthor: true, cardBorder: true, metaStyle: 'badge' }, Thumbnail: BlogGridThumb3 }
export const Blog4Preset: DesignPreset = { id: 'blog-4', familyId: 'blog-grid', name: 'Blog 4', description: '3-col grid, images, center, plain meta', controls: { columns: '3', itemCount: '3', alignment: 'center', showImage: true, showExcerpt: true, showAuthor: true, cardBorder: false, metaStyle: 'plain' }, Thumbnail: BlogGridThumb3 }
export const Blog5Preset: DesignPreset = { id: 'blog-5', familyId: 'blog-grid', name: 'Blog 5', description: '3-col grid, left-aligned, excerpts', controls: { columns: '3', itemCount: '3', alignment: 'left', showImage: true, showExcerpt: true, showAuthor: true, cardBorder: false, metaStyle: 'badge' }, Thumbnail: BlogGridThumb3 }
export const Blog6Preset: DesignPreset = { id: 'blog-6', familyId: 'blog-grid', name: 'Blog 6', description: '3-col grid, left, no excerpt', controls: { columns: '3', itemCount: '3', alignment: 'left', showImage: true, showExcerpt: false, showAuthor: true, cardBorder: false, metaStyle: 'badge' }, Thumbnail: BlogGridThumb3 }
export const Blog7Preset: DesignPreset = { id: 'blog-7', familyId: 'blog-grid', name: 'Blog 7', description: '3-col grid, left, card border', controls: { columns: '3', itemCount: '3', alignment: 'left', showImage: true, showExcerpt: true, showAuthor: true, cardBorder: true, metaStyle: 'badge' }, Thumbnail: BlogGridThumb3 }
export const Blog8Preset: DesignPreset = { id: 'blog-8', familyId: 'blog-grid', name: 'Blog 8', description: '3-col grid, left, plain meta', controls: { columns: '3', itemCount: '3', alignment: 'left', showImage: true, showExcerpt: true, showAuthor: true, cardBorder: false, metaStyle: 'plain' }, Thumbnail: BlogGridThumb3 }

export const Blog9Preset: DesignPreset = { id: 'blog-9', familyId: 'blog-featured', name: 'Blog 9', description: 'Featured + 2 side posts, side layout', controls: { sideCount: '2', layout: 'side', showExcerpt: true }, Thumbnail: BlogFeaturedThumb }
export const Blog10Preset: DesignPreset = { id: 'blog-10', familyId: 'blog-featured', name: 'Blog 10', description: 'Featured + 3 side posts, side layout', controls: { sideCount: '3', layout: 'side', showExcerpt: true }, Thumbnail: BlogFeaturedThumb }

export const Blog11Preset: DesignPreset = { id: 'blog-11', familyId: 'blog-grid', name: 'Blog 11', description: '2-col grid, center, with images', controls: { columns: '2', itemCount: '4', alignment: 'center', showImage: true, showExcerpt: true, showAuthor: true, cardBorder: false, metaStyle: 'badge' }, Thumbnail: BlogGridThumb2 }
export const Blog12Preset: DesignPreset = { id: 'blog-12', familyId: 'blog-grid', name: 'Blog 12', description: '2-col grid, center, no excerpt', controls: { columns: '2', itemCount: '4', alignment: 'center', showImage: true, showExcerpt: false, showAuthor: true, cardBorder: false, metaStyle: 'badge' }, Thumbnail: BlogGridThumb2 }
export const Blog13Preset: DesignPreset = { id: 'blog-13', familyId: 'blog-grid', name: 'Blog 13', description: '2-col grid, left-aligned', controls: { columns: '2', itemCount: '4', alignment: 'left', showImage: true, showExcerpt: true, showAuthor: true, cardBorder: false, metaStyle: 'badge' }, Thumbnail: BlogGridThumb2 }
export const Blog14Preset: DesignPreset = { id: 'blog-14', familyId: 'blog-grid', name: 'Blog 14', description: '2-col grid, card border', controls: { columns: '2', itemCount: '4', alignment: 'center', showImage: true, showExcerpt: true, showAuthor: true, cardBorder: true, metaStyle: 'badge' }, Thumbnail: BlogGridThumb2 }

export const Blog15Preset: DesignPreset = { id: 'blog-15', familyId: 'blog-horizontal', name: 'Blog 15', description: 'Horizontal cards with excerpt', controls: { itemCount: '3', showExcerpt: true, showAuthor: true }, Thumbnail: BlogHorizontalThumb }
export const Blog16Preset: DesignPreset = { id: 'blog-16', familyId: 'blog-horizontal', name: 'Blog 16', description: 'Horizontal cards, no excerpt', controls: { itemCount: '3', showExcerpt: false, showAuthor: true }, Thumbnail: BlogHorizontalThumb }

export const Blog17Preset: DesignPreset = { id: 'blog-17', familyId: 'blog-sidebar', name: 'Blog 17', description: 'Posts with sidebar right', controls: { itemCount: '4', sidebarPosition: 'right', showExcerpt: true, showNewsletter: true }, Thumbnail: BlogSidebarThumb }
export const Blog18Preset: DesignPreset = { id: 'blog-18', familyId: 'blog-sidebar', name: 'Blog 18', description: 'Posts with sidebar left', controls: { itemCount: '4', sidebarPosition: 'left', showExcerpt: true, showNewsletter: true }, Thumbnail: BlogSidebarThumb }
export const Blog19Preset: DesignPreset = { id: 'blog-19', familyId: 'blog-sidebar', name: 'Blog 19', description: 'Posts with sidebar, no newsletter', controls: { itemCount: '4', sidebarPosition: 'right', showExcerpt: true, showNewsletter: false }, Thumbnail: BlogSidebarThumb }
export const Blog20Preset: DesignPreset = { id: 'blog-20', familyId: 'blog-sidebar', name: 'Blog 20', description: 'Posts with sidebar left, no newsletter', controls: { itemCount: '6', sidebarPosition: 'left', showExcerpt: false, showNewsletter: false }, Thumbnail: BlogSidebarThumb }

export const Blog21Preset: DesignPreset = { id: 'blog-21', familyId: 'blog-grid', name: 'Blog 21', description: '3-col, 6 posts, no author', controls: { columns: '3', itemCount: '6', alignment: 'center', showImage: true, showExcerpt: true, showAuthor: false, cardBorder: false, metaStyle: 'badge' }, Thumbnail: BlogGridThumb3 }
export const Blog22Preset: DesignPreset = { id: 'blog-22', familyId: 'blog-grid', name: 'Blog 22', description: '3-col, 9 posts', controls: { columns: '3', itemCount: '9', alignment: 'center', showImage: true, showExcerpt: false, showAuthor: true, cardBorder: false, metaStyle: 'badge' }, Thumbnail: BlogGridThumb3 }
export const Blog23Preset: DesignPreset = { id: 'blog-23', familyId: 'blog-grid', name: 'Blog 23', description: '2-col, 6 posts', controls: { columns: '2', itemCount: '6', alignment: 'left', showImage: true, showExcerpt: true, showAuthor: true, cardBorder: false, metaStyle: 'badge' }, Thumbnail: BlogGridThumb2 }
export const Blog24Preset: DesignPreset = { id: 'blog-24', familyId: 'blog-grid', name: 'Blog 24', description: '3-col, no images', controls: { columns: '3', itemCount: '6', alignment: 'center', showImage: false, showExcerpt: true, showAuthor: true, cardBorder: false, metaStyle: 'badge' }, Thumbnail: BlogGridThumb3 }

export const Blog25Preset: DesignPreset = { id: 'blog-25', familyId: 'blog-featured', name: 'Blog 25', description: 'Featured stacked + 2 side', controls: { sideCount: '2', layout: 'stacked', showExcerpt: true }, Thumbnail: BlogFeaturedThumb }
export const Blog26Preset: DesignPreset = { id: 'blog-26', familyId: 'blog-featured', name: 'Blog 26', description: 'Featured stacked + 3 side', controls: { sideCount: '3', layout: 'stacked', showExcerpt: true }, Thumbnail: BlogFeaturedThumb }

export const Blog27Preset: DesignPreset = { id: 'blog-27', familyId: 'blog-list', name: 'Blog 27', description: 'List with thumbnails, 4 posts', controls: { itemCount: '4', layout: 'horizontal', showImage: true, showExcerpt: true, showDividers: true }, Thumbnail: BlogListThumb }
export const Blog28Preset: DesignPreset = { id: 'blog-28', familyId: 'blog-list', name: 'Blog 28', description: 'List with thumbnails, no excerpt', controls: { itemCount: '4', layout: 'horizontal', showImage: true, showExcerpt: false, showDividers: true }, Thumbnail: BlogListThumb }
export const Blog29Preset: DesignPreset = { id: 'blog-29', familyId: 'blog-list', name: 'Blog 29', description: 'List, no thumbnails', controls: { itemCount: '5', layout: 'horizontal', showImage: false, showExcerpt: true, showDividers: true }, Thumbnail: BlogListThumb }
export const Blog30Preset: DesignPreset = { id: 'blog-30', familyId: 'blog-list', name: 'Blog 30', description: 'Stacked list with images', controls: { itemCount: '3', layout: 'stacked', showImage: true, showExcerpt: true, showDividers: true }, Thumbnail: BlogListThumb }
export const Blog31Preset: DesignPreset = { id: 'blog-31', familyId: 'blog-list', name: 'Blog 31', description: 'List, 6 posts, no dividers', controls: { itemCount: '6', layout: 'horizontal', showImage: true, showExcerpt: true, showDividers: false }, Thumbnail: BlogListThumb }
export const Blog32Preset: DesignPreset = { id: 'blog-32', familyId: 'blog-list', name: 'Blog 32', description: 'Stacked list, 4 posts', controls: { itemCount: '4', layout: 'stacked', showImage: true, showExcerpt: false, showDividers: true }, Thumbnail: BlogListThumb }

// Blog Sections (Blog 33–68)

export const Blog33Preset: DesignPreset = { id: 'blog-33', familyId: 'blog-section-grid', name: 'Blog 33', description: 'Section grid, 3-col, center', controls: { columns: '3', itemCount: '3', alignment: 'center', showImage: true, showExcerpt: true, showAuthor: true, showCta: true }, Thumbnail: BlogSectionGridThumb }
export const Blog34Preset: DesignPreset = { id: 'blog-34', familyId: 'blog-section-grid', name: 'Blog 34', description: 'Section grid, 3-col, left', controls: { columns: '3', itemCount: '3', alignment: 'left', showImage: true, showExcerpt: true, showAuthor: true, showCta: true }, Thumbnail: BlogSectionGridThumb }
export const Blog35Preset: DesignPreset = { id: 'blog-35', familyId: 'blog-section-grid', name: 'Blog 35', description: 'Section grid, 3-col, no author', controls: { columns: '3', itemCount: '3', alignment: 'center', showImage: true, showExcerpt: true, showAuthor: false, showCta: true }, Thumbnail: BlogSectionGridThumb }
export const Blog36Preset: DesignPreset = { id: 'blog-36', familyId: 'blog-section-grid', name: 'Blog 36', description: 'Section grid, 2-col', controls: { columns: '2', itemCount: '2', alignment: 'center', showImage: true, showExcerpt: true, showAuthor: true, showCta: true }, Thumbnail: BlogSectionGridThumb }
export const Blog37Preset: DesignPreset = { id: 'blog-37', familyId: 'blog-section-grid', name: 'Blog 37', description: 'Section grid, 3-col, 6 posts', controls: { columns: '3', itemCount: '6', alignment: 'center', showImage: true, showExcerpt: true, showAuthor: true, showCta: true }, Thumbnail: BlogSectionGridThumb }
export const Blog38Preset: DesignPreset = { id: 'blog-38', familyId: 'blog-section-grid', name: 'Blog 38', description: 'Section grid, 2-col, no excerpt', controls: { columns: '2', itemCount: '4', alignment: 'left', showImage: true, showExcerpt: false, showAuthor: true, showCta: true }, Thumbnail: BlogSectionGridThumb }
export const Blog39Preset: DesignPreset = { id: 'blog-39', familyId: 'blog-section-grid', name: 'Blog 39', description: 'Section grid, no images', controls: { columns: '3', itemCount: '3', alignment: 'center', showImage: false, showExcerpt: true, showAuthor: true, showCta: true }, Thumbnail: BlogSectionGridThumb }
export const Blog40Preset: DesignPreset = { id: 'blog-40', familyId: 'blog-section-grid', name: 'Blog 40', description: 'Section grid, 3-col, no CTA', controls: { columns: '3', itemCount: '3', alignment: 'center', showImage: true, showExcerpt: true, showAuthor: true, showCta: false }, Thumbnail: BlogSectionGridThumb }
export const Blog41Preset: DesignPreset = { id: 'blog-41', familyId: 'blog-section-grid', name: 'Blog 41', description: 'Section grid, left, no CTA', controls: { columns: '3', itemCount: '3', alignment: 'left', showImage: true, showExcerpt: false, showAuthor: true, showCta: false }, Thumbnail: BlogSectionGridThumb }
export const Blog42Preset: DesignPreset = { id: 'blog-42', familyId: 'blog-section-grid', name: 'Blog 42', description: 'Section grid, 2-col, 4 posts', controls: { columns: '2', itemCount: '4', alignment: 'center', showImage: true, showExcerpt: true, showAuthor: false, showCta: true }, Thumbnail: BlogSectionGridThumb }
export const Blog43Preset: DesignPreset = { id: 'blog-43', familyId: 'blog-section-grid', name: 'Blog 43', description: 'Section grid, 3-col, left, all features', controls: { columns: '3', itemCount: '6', alignment: 'left', showImage: true, showExcerpt: true, showAuthor: true, showCta: true }, Thumbnail: BlogSectionGridThumb }
export const Blog44Preset: DesignPreset = { id: 'blog-44', familyId: 'blog-section-grid', name: 'Blog 44', description: 'Section grid, minimal', controls: { columns: '3', itemCount: '3', alignment: 'center', showImage: true, showExcerpt: false, showAuthor: false, showCta: false }, Thumbnail: BlogSectionGridThumb }

export const Blog45Preset: DesignPreset = { id: 'blog-45', familyId: 'blog-section-horizontal', name: 'Blog 45', description: 'Section horizontal, 3 posts, dividers', controls: { itemCount: '3', showExcerpt: true, showAuthor: true, showCta: true, showDividers: true }, Thumbnail: BlogSectionHorizThumb }
export const Blog46Preset: DesignPreset = { id: 'blog-46', familyId: 'blog-section-horizontal', name: 'Blog 46', description: 'Section horizontal, no excerpt', controls: { itemCount: '3', showExcerpt: false, showAuthor: true, showCta: true, showDividers: true }, Thumbnail: BlogSectionHorizThumb }
export const Blog47Preset: DesignPreset = { id: 'blog-47', familyId: 'blog-section-horizontal', name: 'Blog 47', description: 'Section horizontal, 2 posts', controls: { itemCount: '2', showExcerpt: true, showAuthor: true, showCta: true, showDividers: true }, Thumbnail: BlogSectionHorizThumb }
export const Blog48Preset: DesignPreset = { id: 'blog-48', familyId: 'blog-section-horizontal', name: 'Blog 48', description: 'Section horizontal, 4 posts', controls: { itemCount: '4', showExcerpt: true, showAuthor: true, showCta: true, showDividers: true }, Thumbnail: BlogSectionHorizThumb }
export const Blog49Preset: DesignPreset = { id: 'blog-49', familyId: 'blog-section-horizontal', name: 'Blog 49', description: 'Section horizontal, no dividers', controls: { itemCount: '3', showExcerpt: true, showAuthor: true, showCta: true, showDividers: false }, Thumbnail: BlogSectionHorizThumb }
export const Blog50Preset: DesignPreset = { id: 'blog-50', familyId: 'blog-section-horizontal', name: 'Blog 50', description: 'Section horizontal, no author', controls: { itemCount: '3', showExcerpt: true, showAuthor: false, showCta: true, showDividers: true }, Thumbnail: BlogSectionHorizThumb }

export const Blog51Preset: DesignPreset = { id: 'blog-51', familyId: 'blog-section-horizontal', name: 'Blog 51', description: 'Section horizontal, no CTA', controls: { itemCount: '3', showExcerpt: true, showAuthor: true, showCta: false, showDividers: true }, Thumbnail: BlogSectionHorizThumb }
export const Blog52Preset: DesignPreset = { id: 'blog-52', familyId: 'blog-section-horizontal', name: 'Blog 52', description: 'Section horizontal, minimal', controls: { itemCount: '2', showExcerpt: false, showAuthor: false, showCta: false, showDividers: true }, Thumbnail: BlogSectionHorizThumb }

export const Blog53Preset: DesignPreset = { id: 'blog-53', familyId: 'blog-section-large', name: 'Blog 53', description: 'Large featured top + 2 grid', controls: { sideCount: '2', layout: 'topFeatured', showExcerpt: true, showAuthor: true }, Thumbnail: BlogSectionLargeThumb }
export const Blog54Preset: DesignPreset = { id: 'blog-54', familyId: 'blog-section-large', name: 'Blog 54', description: 'Large featured top + 3 grid', controls: { sideCount: '3', layout: 'topFeatured', showExcerpt: true, showAuthor: true }, Thumbnail: BlogSectionLargeThumb }
export const Blog55Preset: DesignPreset = { id: 'blog-55', familyId: 'blog-section-large', name: 'Blog 55', description: 'Large featured side + 2 stacked', controls: { sideCount: '2', layout: 'sideFeatured', showExcerpt: true, showAuthor: true }, Thumbnail: BlogSectionLargeThumb }
export const Blog56Preset: DesignPreset = { id: 'blog-56', familyId: 'blog-section-large', name: 'Blog 56', description: 'Large featured side + 3 stacked', controls: { sideCount: '3', layout: 'sideFeatured', showExcerpt: true, showAuthor: true }, Thumbnail: BlogSectionLargeThumb }

export const Blog57Preset: DesignPreset = { id: 'blog-57', familyId: 'blog-section-split', name: 'Blog 57', description: 'Split — heading left, 3 posts right', controls: { itemCount: '3', showImage: true, showExcerpt: true, showAuthor: true }, Thumbnail: BlogSectionSplitThumb }
export const Blog58Preset: DesignPreset = { id: 'blog-58', familyId: 'blog-section-split', name: 'Blog 58', description: 'Split — heading left, 2 posts', controls: { itemCount: '2', showImage: true, showExcerpt: true, showAuthor: true }, Thumbnail: BlogSectionSplitThumb }
export const Blog59Preset: DesignPreset = { id: 'blog-59', familyId: 'blog-section-split', name: 'Blog 59', description: 'Split — no images', controls: { itemCount: '3', showImage: false, showExcerpt: true, showAuthor: true }, Thumbnail: BlogSectionSplitThumb }
export const Blog60Preset: DesignPreset = { id: 'blog-60', familyId: 'blog-section-split', name: 'Blog 60', description: 'Split — 4 posts, no excerpt', controls: { itemCount: '4', showImage: true, showExcerpt: false, showAuthor: true }, Thumbnail: BlogSectionSplitThumb }

export const Blog61Preset: DesignPreset = { id: 'blog-61', familyId: 'blog-section-carousel', name: 'Blog 61', description: 'Carousel section, 6 posts', controls: { itemCount: '6', showExcerpt: true, showAuthor: true }, Thumbnail: BlogSectionCarouselThumb }
export const Blog62Preset: DesignPreset = { id: 'blog-62', familyId: 'blog-section-carousel', name: 'Blog 62', description: 'Carousel section, 8 posts', controls: { itemCount: '8', showExcerpt: true, showAuthor: true }, Thumbnail: BlogSectionCarouselThumb }
export const Blog63Preset: DesignPreset = { id: 'blog-63', familyId: 'blog-section-carousel', name: 'Blog 63', description: 'Carousel section, no excerpt', controls: { itemCount: '6', showExcerpt: false, showAuthor: true }, Thumbnail: BlogSectionCarouselThumb }
export const Blog64Preset: DesignPreset = { id: 'blog-64', familyId: 'blog-section-carousel', name: 'Blog 64', description: 'Carousel section, minimal', controls: { itemCount: '4', showExcerpt: false, showAuthor: false }, Thumbnail: BlogSectionCarouselThumb }

// Blog Post Headers (Blog Post Header 1–5)

export const BlogPostHeader1Preset: DesignPreset = { id: 'blog-post-header-1', familyId: 'blog-post-header', name: 'Blog Post Header 1', description: 'Centered header with image below', controls: { layout: 'centered', showBreadcrumb: true, showMeta: true, showAuthorBio: false }, Thumbnail: BlogPostHeaderThumb }
export const BlogPostHeader2Preset: DesignPreset = { id: 'blog-post-header-2', familyId: 'blog-post-header', name: 'Blog Post Header 2', description: 'Left-aligned header with image below', controls: { layout: 'leftAligned', showBreadcrumb: true, showMeta: true, showAuthorBio: false }, Thumbnail: BlogPostHeaderThumb }
export const BlogPostHeader3Preset: DesignPreset = { id: 'blog-post-header-3', familyId: 'blog-post-header', name: 'Blog Post Header 3', description: 'Full-width image hero with text below', controls: { layout: 'fullWidth', showBreadcrumb: true, showMeta: true, showAuthorBio: false }, Thumbnail: BlogPostHeaderThumb }
export const BlogPostHeader4Preset: DesignPreset = { id: 'blog-post-header-4', familyId: 'blog-post-header', name: 'Blog Post Header 4', description: 'Dark overlay with text on image', controls: { layout: 'overlay', showBreadcrumb: true, showMeta: true, showAuthorBio: false }, Thumbnail: BlogPostHeaderThumb }
export const BlogPostHeader5Preset: DesignPreset = { id: 'blog-post-header-5', familyId: 'blog-post-header', name: 'Blog Post Header 5', description: 'Split layout — image left, text right', controls: { layout: 'split', showBreadcrumb: true, showMeta: true, showAuthorBio: true }, Thumbnail: BlogPostHeaderThumb }

export const blogPresets: DesignPreset[] = [
    Blog1Preset, Blog2Preset, Blog3Preset, Blog4Preset,
    Blog5Preset, Blog6Preset, Blog7Preset, Blog8Preset,
    Blog9Preset, Blog10Preset, Blog11Preset, Blog12Preset,
    Blog13Preset, Blog14Preset, Blog15Preset, Blog16Preset,
    Blog17Preset, Blog18Preset, Blog19Preset, Blog20Preset,
    Blog21Preset, Blog22Preset, Blog23Preset, Blog24Preset,
    Blog25Preset, Blog26Preset, Blog27Preset, Blog28Preset,
    Blog29Preset, Blog30Preset, Blog31Preset, Blog32Preset,
    Blog33Preset, Blog34Preset, Blog35Preset, Blog36Preset,
    Blog37Preset, Blog38Preset, Blog39Preset, Blog40Preset,
    Blog41Preset, Blog42Preset, Blog43Preset, Blog44Preset,
    Blog45Preset, Blog46Preset, Blog47Preset, Blog48Preset,
    Blog49Preset, Blog50Preset, Blog51Preset, Blog52Preset,
    Blog53Preset, Blog54Preset, Blog55Preset, Blog56Preset,
    Blog57Preset, Blog58Preset, Blog59Preset, Blog60Preset,
    Blog61Preset, Blog62Preset, Blog63Preset, Blog64Preset,
    BlogPostHeader1Preset, BlogPostHeader2Preset, BlogPostHeader3Preset,
    BlogPostHeader4Preset, BlogPostHeader5Preset,
]
