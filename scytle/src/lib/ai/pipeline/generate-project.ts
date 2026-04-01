// ============================================================
// Project Generator (Parallel Pages)
// Full orchestrator: plan → image search → parallel pages.
// This is the top-level entry point for multi-page generation.
// ============================================================

import { generate } from '../client'
import { buildPagePlannerPrompt, buildPagePlannerMessage, type PagePlan, type PlannedPage } from '../prompts/planner'
import { batchSearchImages, type ImageQuery, type ImageMap } from '../unsplash'
import { generatePageParallel } from './generate-page'
import type { AIModel } from '../config'

export interface GenerateProjectPipelineOptions {
    projectDescription: string
    productType?: 'web' | 'app'
    model?: string
    /** Called when the plan JSON is ready */
    onPlanReady?: (plan: PagePlan) => void
    /** Called when image search completes */
    onImagesReady?: (imageCount: number) => void
    /** Called when a page starts generating */
    onPageStart?: (index: number, pageName: string, total: number) => void
    /** Called when a section within a page completes */
    onSectionComplete?: (pageIndex: number, sectionIndex: number, sectionTotal: number, sectionType: string) => void
    /** Called when a full page is done */
    onPageComplete?: (index: number, pageName: string, html: string) => void
}

export interface GenerateProjectResult {
    plan: PagePlan
    pages: Array<{ name: string; html: string }>
}

/**
 * Generate a full multi-page project.
 *
 * Pipeline:
 * 1. Plan pages (AI) → JSON with sections, layouts, image queries
 * 2. Batch image search (Unsplash) → all queries in parallel
 * 3. Generate pages (parallel, max 3 concurrent) → each page's sections in parallel
 * 4. Return assembled HTML per page
 */
export async function generateProjectPipeline(opts: GenerateProjectPipelineOptions): Promise<GenerateProjectResult> {
    const { projectDescription, productType = 'web', model } = opts
    const modelKey = (model || 'gemini-flash') as AIModel

    // ── Step 1: Plan pages ──────────────────────────────────
    console.log('📋 Step 1: Planning pages...')

    const plannerSystem = buildPagePlannerPrompt(productType)
    const plannerMessage = buildPagePlannerMessage(projectDescription)

    const rawPlan = await generate(plannerMessage, [], {
        model: modelKey,
        systemPrompt: plannerSystem,
        temperature: 0.7,
        maxTokens: 4096,
    })

    // Parse plan JSON
    let plan: PagePlan
    try {
        let json = rawPlan.trim()
        const fenceMatch = json.match(/^```(?:json)?\s*\n([\s\S]*?)```\s*$/)
        if (fenceMatch) json = fenceMatch[1].trim()
        plan = JSON.parse(json)
    } catch (error) {
        console.error('❌ Failed to parse plan JSON:', rawPlan.slice(0, 500))
        throw new Error('AI returned invalid page plan format. Please try again.')
    }

    console.log(`✅ Plan ready: "${plan.projectName}" — ${plan.pages.length} pages`)
    opts.onPlanReady?.(plan)

    // ── Step 2: Batch image search ──────────────────────────
    console.log('🖼️ Step 2: Searching images...')

    const imageQueries: ImageQuery[] = plan.pages
        .flatMap(p => p.sections)
        .filter(s => s.imageQuery)
        .map(s => ({
            key: s.imageQuery!,
            query: s.imageQuery!,
            count: 2,
        }))

    const images: ImageMap = await batchSearchImages(imageQueries)
    const totalImages = Object.values(images).flat().length
    console.log(`✅ Found ${totalImages} images for ${imageQueries.length} queries`)
    opts.onImagesReady?.(totalImages)

    // ── Step 3: Generate pages (parallel, max 3 at a time) ──
    console.log('🏗️ Step 3: Generating pages...')

    const sortedPages = [...plan.pages].sort((a, b) => a.priority - b.priority)
    const results: Array<{ name: string; html: string }> = []

    // Process pages in batches of 3 to avoid overwhelming the API
    const PAGE_CONCURRENCY = 3
    for (let batch = 0; batch < sortedPages.length; batch += PAGE_CONCURRENCY) {
        const batchPages = sortedPages.slice(batch, batch + PAGE_CONCURRENCY)

        const batchResults = await Promise.all(
            batchPages.map(async (page, batchIdx) => {
                const globalIdx = batch + batchIdx
                opts.onPageStart?.(globalIdx, page.name, sortedPages.length)

                try {
                    const html = await generatePageParallel({
                        page,
                        images,
                        brandName: plan.projectName,
                        brandDescription: opts.projectDescription,
                        theme: plan.theme,
                        model,
                        productType,
                        onSectionComplete: (sIdx, sTotal, sType) => {
                            opts.onSectionComplete?.(globalIdx, sIdx, sTotal, sType)
                        },
                    })

                    console.log(`✅ Page ${globalIdx + 1}/${sortedPages.length}: "${page.name}" (${html.length} chars)`)
                    opts.onPageComplete?.(globalIdx, page.name, html)

                    return { name: page.name, html }
                } catch (error) {
                    console.error(`⚠️ Page "${page.name}" failed:`, error instanceof Error ? error.message : error)
                    return null
                }
            })
        )

        // Collect successful results
        for (const r of batchResults) {
            if (r) results.push(r)
        }
    }

    if (results.length === 0) {
        throw new Error('All page generations failed. Please try again.')
    }

    console.log(`🎉 Project complete: ${results.length}/${sortedPages.length} pages generated`)

    return { plan, pages: results }
}
