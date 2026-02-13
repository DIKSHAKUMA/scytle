/**
 * Blog Section Designs — Barrel Export
 */

// Families
export { BlogGridFamily } from './families/blog-grid'
export { BlogListFamily } from './families/blog-list'
export { BlogFeaturedFamily } from './families/blog-featured'
export { BlogHorizontalFamily } from './families/blog-horizontal'
export { BlogSidebarFamily } from './families/blog-sidebar'
export { BlogSectionGridFamily } from './families/blog-section-grid'
export { BlogSectionHorizontalFamily } from './families/blog-section-horizontal'
export { BlogSectionLargeFamily } from './families/blog-section-large'
export { BlogSectionSplitFamily } from './families/blog-section-split'
export { BlogSectionCarouselFamily } from './families/blog-section-carousel'
export { BlogPostHeaderFamily } from './families/blog-post-header'

// Presets
export { blogPresets } from './presets'

// Aggregate exports for registry
import { BlogGridFamily } from './families/blog-grid'
import { BlogListFamily } from './families/blog-list'
import { BlogFeaturedFamily } from './families/blog-featured'
import { BlogHorizontalFamily } from './families/blog-horizontal'
import { BlogSidebarFamily } from './families/blog-sidebar'
import { BlogSectionGridFamily } from './families/blog-section-grid'
import { BlogSectionHorizontalFamily } from './families/blog-section-horizontal'
import { BlogSectionLargeFamily } from './families/blog-section-large'
import { BlogSectionSplitFamily } from './families/blog-section-split'
import { BlogSectionCarouselFamily } from './families/blog-section-carousel'
import { BlogPostHeaderFamily } from './families/blog-post-header'
import type { TemplateFamily } from '../types'

export const blogFamilies: TemplateFamily[] = [
    BlogGridFamily,
    BlogListFamily,
    BlogFeaturedFamily,
    BlogHorizontalFamily,
    BlogSidebarFamily,
    BlogSectionGridFamily,
    BlogSectionHorizontalFamily,
    BlogSectionLargeFamily,
    BlogSectionSplitFamily,
    BlogSectionCarouselFamily,
    BlogPostHeaderFamily,
]

export { blogPresets as blogPresetsArray } from './presets'
