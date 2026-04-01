// ============================================================
// Single Page Generator (Parallel Sections)
// Takes a planned page + images, fires all sections in parallel,
// assembles them into a full page HTML string.
// ============================================================

import { generateSection } from './generate-section'
import { assemblePage } from '../autofix'
import type { PlannedPage } from '../prompts/planner'
import type { ImageMap, UnsplashImage } from '../unsplash'

export interface GeneratePageOptions {
    page: PlannedPage
    /** Pre-searched images keyed by imageQuery */
    images: ImageMap
    /** Brand/product context */
    brandName: string
    brandDescription?: string
    /** Theme colors (from planner) */
    theme: {
        primary: string
        secondary: string
        accent: string
        bg: string
        text: string
    }
    /** Theme fonts */
    fonts?: { heading: string; body: string }
    /** AI model key */
    model?: string
    /** Product type */
    productType?: 'web' | 'app'
    /** Progress callback: called when each section completes */
    onSectionComplete?: (index: number, total: number, sectionType: string) => void
}

/**
 * Generate a full page by firing all sections in parallel.
 * Returns assembled + autofixed HTML.
 */
export async function generatePageParallel(opts: GeneratePageOptions): Promise<string> {
    const { page, images, brandName, brandDescription, theme, fonts, model, productType, onSectionComplete } = opts
    const sections = page.sections

    // Build section generation promises — all fire in parallel
    const sectionPromises = sections.map((section, i) => {
        // Resolve images for this section
        const sectionImages: UnsplashImage[] = section.imageQuery
            ? (images[section.imageQuery] || [])
            : []

        return generateSection({
            section,
            context: {
                pageName: page.name,
                brandName,
                brandDescription,
                theme,
                fonts,
                images: sectionImages.length > 0 ? sectionImages : undefined,
                prevSection: i > 0 ? { type: sections[i - 1].type, description: sections[i - 1].description } : undefined,
                nextSection: i < sections.length - 1 ? { type: sections[i + 1].type, description: sections[i + 1].description } : undefined,
                productType,
            },
            model,
        }).then(html => {
            onSectionComplete?.(i, sections.length, section.type)
            return html
        })
    })

    // Wait for all sections to complete
    const sectionHtmls = await Promise.all(sectionPromises)

    // Assemble into full page (autofix is applied inside assemblePage)
    return assemblePage(sectionHtmls, page.name)
}
