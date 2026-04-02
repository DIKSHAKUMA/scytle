// ============================================================
// Single Section Generator
// Generates one section's HTML via AI. Designed to be called
// in parallel for all sections on a page.
// ============================================================

import { generate } from '../client'
import { buildSectionPrompt, type SectionContext } from '../prompts/section'
import { autofixHtml } from '../autofix'
import type { AIModel } from '../config'

export interface GenerateSectionOptions {
    section: {
        type: string
        layout: string
        imageQuery: string | null
        description: string
    }
    context: Omit<SectionContext, 'type' | 'layout' | 'description'>
    model?: string
}

/**
 * Generate a single section's HTML.
 * Returns autofixed HTML string, or an empty fallback on failure.
 */
export async function generateSection(opts: GenerateSectionOptions): Promise<string> {
    const { section, context, model } = opts

    const sectionContext: SectionContext = {
        ...context,
        type: section.type,
        layout: section.layout,
        description: section.description,
    }

    const systemPrompt = buildSectionPrompt(sectionContext)

    try {
        const isClaudeModel = (model || '').includes('claude')
        const html = await generate(
            `Generate the ${section.type} section HTML now. Output raw HTML only.`,
            [],
            {
                model: (model || 'gemini-flash') as AIModel,
                systemPrompt,
                temperature: 0.9,
                // Claude proxy is slower — use smaller token budget per section
                maxTokens: isClaudeModel ? 2048 : 4096,
                // No thinking mode for individual sections — prompt is focused enough
                thinking: false,
            }
        )

        return autofixHtml(html)
    } catch (error) {
        console.error(`⚠️ Section "${section.type}" generation failed:`, error instanceof Error ? error.message : error)
        // Return a minimal fallback section so the page isn't broken
        return `<section class="flex flex-col gap-4 w-full px-16 py-20 bg-gray-50">
  <p class="text-gray-400 text-center">Section: ${section.type}</p>
</section>`
    }
}
