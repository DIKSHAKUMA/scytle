/**
 * Wireframe Generation Prompts
 * 
 * AI prompts for generating wireframe content:
 * - Section generation for new pages
 * - Copy generation for sections
 * - Content suggestions
 */

export const WIREFRAME_SECTION_PROMPT = `You are an expert UI/UX designer and product strategist. Generate wireframe sections for a web page.

Given a page name and context, generate appropriate sections with:
1. A logical order that guides users through the content
2. Industry best practices for this type of page
3. Essential content sections users expect
4. Placeholder copy that's specific to the product

For each section, include:
- id: unique kebab-case identifier
- type: hero, features, testimonials, pricing, faq, cta, contact, team, stats, logos, gallery, blog, footer, navbar
- name: descriptive section name
- description: brief purpose description
- componentId: format "{type}-{number}" (e.g., "hero-1", "features-3")
- content: object with heading, subheading, body, cta, items (array)
- controls: default settings for the section type

Return ONLY valid JSON array. Be creative but practical.
Start with navbar, end with footer for most pages.`

export const SECTION_COPY_PROMPT = `You are an expert copywriter specializing in web content. Generate compelling copy for a wireframe section.

Given the section type and product context, generate:
- heading: Primary headline (compelling, benefit-focused, 5-12 words)
- subheading: Supporting text (clarifies the headline, 10-20 words)
- body: Main content (informative, scannable, 2-4 sentences)
- cta: Call-to-action text (action-oriented, 2-4 words)

For sections with items (features, testimonials, etc.), generate 3-6 items with:
- heading: Item title
- body: Item description
- icon (optional): Lucide icon name

Write in the tone appropriate for the product. Be specific, not generic.
Return ONLY valid JSON object with the content fields.`

export const PAGE_COPY_PROMPT = `You are an expert copywriter. Generate copy for all sections on a page.

Given the page structure and product context, generate compelling copy for each section.

For each section, generate:
- heading: Primary headline 
- subheading: Supporting text
- body: Main content
- cta: Call-to-action (if applicable)
- items: Array of items (if applicable)

Match the copy to:
1. The section type and purpose
2. The overall product/brand
3. The page's role in the user journey
4. Industry best practices

Return a JSON object with section IDs as keys and content objects as values.
Keep copy concise, benefit-focused, and action-oriented.`

export const SHUFFLE_PROMPT = `You are a UI/UX designer. Given a section type, suggest alternative component layouts.

For the given section type, return 3-5 alternative componentIds that would work well:
- Consider different layouts (grid, list, carousel, etc.)
- Consider different visual styles (minimal, detailed, image-heavy, etc.)
- Consider different content densities

Return ONLY a JSON array of componentId strings.`

/**
 * Build the generation prompt with context
 */
export function buildSectionGenerationPrompt(
    pageName: string,
    pageDescription?: string,
    projectContext?: {
        productName?: string
        productDescription?: string
        targetAudience?: string
    }
): string {
    let prompt = `Generate wireframe sections for this page:

Page: ${pageName}`

    if (pageDescription) {
        prompt += `\nDescription: ${pageDescription}`
    }

    if (projectContext) {
        prompt += `\n\nProduct Context:`
        if (projectContext.productName) {
            prompt += `\n- Product: ${projectContext.productName}`
        }
        if (projectContext.productDescription) {
            prompt += `\n- About: ${projectContext.productDescription}`
        }
        if (projectContext.targetAudience) {
            prompt += `\n- Audience: ${projectContext.targetAudience}`
        }
    }

    prompt += `\n\nGenerate 5-8 sections. Return ONLY valid JSON array.`

    return prompt
}

/**
 * Build copy generation prompt for a single section
 */
export function buildSectionCopyPrompt(
    sectionType: string,
    sectionName: string,
    productContext?: {
        productName?: string
        productDescription?: string
        targetAudience?: string
        pageName?: string
    }
): string {
    let prompt = `Generate compelling copy for this section:

Section Type: ${sectionType}
Section Name: ${sectionName}`

    if (productContext) {
        prompt += `\n\nContext:`
        if (productContext.pageName) {
            prompt += `\n- Page: ${productContext.pageName}`
        }
        if (productContext.productName) {
            prompt += `\n- Product: ${productContext.productName}`
        }
        if (productContext.productDescription) {
            prompt += `\n- About: ${productContext.productDescription}`
        }
        if (productContext.targetAudience) {
            prompt += `\n- Audience: ${productContext.targetAudience}`
        }
    }

    prompt += `\n\nGenerate content that matches this section type. Return ONLY valid JSON.`

    return prompt
}

/**
 * Build copy generation prompt for entire page
 */
export function buildPageCopyPrompt(
    pageName: string,
    sections: Array<{ id: string; type: string; name: string }>,
    productContext?: {
        productName?: string
        productDescription?: string
        targetAudience?: string
    }
): string {
    const sectionList = sections
        .map(s => `- ${s.id}: ${s.type} (${s.name})`)
        .join('\n')

    let prompt = `Generate copy for all sections on this page:

Page: ${pageName}

Sections:
${sectionList}`

    if (productContext) {
        prompt += `\n\nProduct Context:`
        if (productContext.productName) {
            prompt += `\n- Product: ${productContext.productName}`
        }
        if (productContext.productDescription) {
            prompt += `\n- About: ${productContext.productDescription}`
        }
        if (productContext.targetAudience) {
            prompt += `\n- Audience: ${productContext.targetAudience}`
        }
    }

    prompt += `\n\nReturn JSON object with section IDs as keys.`

    return prompt
}
