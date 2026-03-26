// ============================================================
// Client-side Page Generation Pipeline
// Calls the generate-html API (SSE), collects HTML, parses
// into ScytleNode tree. Used by the workspace page.
// ============================================================

import { createJWT } from '@/lib/appwrite'
import { parseHtmlToNodes } from '@/lib/parser'
import type { FrameNode } from '@/types/canvas'
import { useStyleGuideStore } from '@/store'

import type { ProductType } from '@/types'
import type { PagePlan } from '@/lib/ai/prompts/page-planner'

/** Map full model IDs → route keys (for backwards compat) */
const MODEL_KEY_MAP: Record<string, string> = {
    // New Gemini models
    'gemini-3.1-pro-preview': 'gemini-pro',
    'gemini-2.5-pro': 'gemini-pro',
    'gemini-2.5-flash': 'gemini-flash',
    'gemini-2.0-flash': 'gemini-flash',
    // Legacy aliases
    'fast': 'gemini-flash',
    'balanced': 'gemini-pro',
    'powerful': 'gemini-pro',
    // Old Claude references → redirect to gemini-pro
    'claude-sonnet': 'gemini-pro',
    'claude-opus': 'gemini-pro',
    'claude-sonnet-4-20250514': 'gemini-pro',
    'claude-opus-4-20250514': 'gemini-pro',
}

export interface GeneratePageOptions {
    pageName: string
    pageDescription?: string
    projectDescription?: string
    industry?: string
    productType?: ProductType   // 'web' | 'app'
    model?: string // Model key (gemini-pro, gemini-flash, fast, balanced, etc.)
    themeContext?: {
        primary: string
        secondary: string
        accent: string
        bg: string
        text: string
        tone?: string
        fonts?: { heading: string; body: string }
        radius?: { sm: number; md: number; lg: number }
        spacing?: { sm: number; md: number; lg: number; gap: number }
        shadows?: { sm: string; md: string }
        fontSizes?: { h1: number; h2: number; body: number }
    }
    siblingPages?: Array<{ name: string; description: string }>
    onProgress?: (partialHtml: string) => void
}

/**
 * Generate a full page via AI and return a parsed FrameNode.
 *
 * Flow: POST /api/ai/generate-html → consume SSE stream → collect HTML
 * → stripMarkdownFences → parseHtmlToNodes → FrameNode
 */
export async function generatePage(options: GeneratePageOptions): Promise<FrameNode> {
    const jwt = await createJWT()
    if (!jwt) throw new Error('Not authenticated')

    const modelKey = MODEL_KEY_MAP[options.model || ''] || options.model || 'gemini-flash'

    // Build themeContext from variable table if not explicitly provided
    const sgState = useStyleGuideStore.getState()
    const table = sgState.variableTable
    const mode = sgState.themeMode
    const themeContext = options.themeContext || (Object.keys(table).length > 0 ? {
        primary: table['accent']?.[mode] || '#2563eb',
        secondary: table['bg/secondary']?.[mode] || '#f5f5f5',
        accent: table['accent']?.[mode] || '#10b981',
        bg: table['bg/primary']?.[mode] || '#ffffff',
        text: table['text/primary']?.[mode] || '#111827',
        fonts: table['font/heading'] ? {
            heading: table['font/heading'][mode],
            body: table['font/body']?.[mode] || table['font/heading'][mode],
        } : undefined,
        radius: table['radius/sm'] ? {
            sm: parseInt(table['radius/sm'][mode]) || 4,
            md: parseInt(table['radius/md'][mode]) || 8,
            lg: parseInt(table['radius/lg'][mode]) || 16,
        } : undefined,
        spacing: table['spacing/sm'] ? {
            sm: parseInt(table['spacing/sm'][mode]) || 16,
            md: parseInt(table['spacing/md'][mode]) || 24,
            lg: parseInt(table['spacing/lg'][mode]) || 48,
            gap: parseInt(table['spacing/gap'][mode]) || 16,
        } : undefined,
        shadows: table['shadow/sm'] ? {
            sm: table['shadow/sm'][mode],
            md: table['shadow/md'][mode],
        } : undefined,
        fontSizes: table['fontSize/h1'] ? {
            h1: parseInt(table['fontSize/h1'][mode]) || 48,
            h2: parseInt(table['fontSize/h2'][mode]) || 32,
            body: parseInt(table['fontSize/body'][mode]) || 16,
        } : undefined,
    } : undefined)

    const response = await fetch('/api/ai/generate-html', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwt.jwt}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            pageName: options.pageName,
            pageDescription: options.pageDescription,
            projectDescription: options.projectDescription,
            industry: options.industry,
            productType: options.productType ?? 'web',
            themeContext,
            siblingPages: options.siblingPages,
            model: modelKey,
        }),
    })

    if (!response.ok) {
        const text = await response.text().catch(() => response.statusText)
        throw new Error(`Generation failed (${response.status}): ${text}`)
    }

    if (!response.body) {
        throw new Error('No response body — SSE streaming not supported')
    }

    // Consume SSE stream
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let html = ''
    let buffer = ''

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE lines (delimited by \n\n)
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || '' // Keep incomplete part in buffer

        for (const part of parts) {
            for (const line of part.split('\n')) {
                if (!line.startsWith('data: ')) continue

                let data: { text?: string; done?: boolean; error?: string }
                try {
                    data = JSON.parse(line.slice(6))
                } catch {
                    continue
                }

                if (data.error) {
                    throw new Error(data.error)
                }

                if (data.text) {
                    html += data.text
                    options.onProgress?.(html)
                }
            }
        }
    }

    // Process any remaining buffer
    if (buffer) {
        for (const line of buffer.split('\n')) {
            if (!line.startsWith('data: ')) continue
            try {
                const data = JSON.parse(line.slice(6))
                if (data.text) html += data.text
                if (data.error) throw new Error(data.error)
            } catch {
                // skip malformed trailing data
            }
        }
    }

    if (!html.trim()) {
        throw new Error('AI returned empty response')
    }

    console.log(`✅ Received ${html.length} chars of HTML for "${options.pageName}"`)

    // Strip markdown fences if AI wrapped the output
    html = stripMarkdownFences(html)

    // Parse HTML → ScytleNode tree (with single-pass ref assignment)
    return parseHtmlToNodes(html, options.pageName, {
        variableTable: sgState.variableTable,
        themeMode: sgState.themeMode,
    })
}

/** Remove ```html ... ``` fencing that models sometimes output */
function stripMarkdownFences(html: string): string {
    const trimmed = html.trim()
    const fenceMatch = trimmed.match(/^```(?:html)?\s*\n([\s\S]*?)```\s*$/)
    if (fenceMatch) return fenceMatch[1].trim()
    return trimmed
}

// ── Multi-Page Project Generation ────────────────────────────

export interface GenerateProjectOptions {
    projectDescription: string
    productType?: ProductType
    model?: string
    onPlanReady?: (plan: PagePlan) => void
    onPageStart?: (index: number, pageName: string, total: number) => void
    onPageComplete?: (index: number, pageName: string, frame: FrameNode) => void
    onPageProgress?: (index: number, partialHtml: string) => void
}

export interface GenerateProjectResult {
    plan: PagePlan
    pages: Array<{ name: string; frame: FrameNode }>
}

/**
 * Generate a full multi-page project via AI.
 *
 * Flow:
 * 1. POST /api/ai/plan-pages → get plan (3-5 pages with shared theme)
 * 2. For each page (sequential, to avoid rate limits):
 *    a. Call generatePage() with themeContext + siblingPages
 *    b. Callback: onPageComplete(index, frame)
 * 3. Return all pages
 */
export async function generateProject(options: GenerateProjectOptions): Promise<GenerateProjectResult> {
    const jwt = await createJWT()
    if (!jwt) throw new Error('Not authenticated')

    const modelKey = MODEL_KEY_MAP[options.model || ''] || options.model || 'gemini-flash'

    // Step 1: Get page plan from AI
    const planResponse = await fetch('/api/ai/plan-pages', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwt.jwt}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            description: options.projectDescription,
            productType: options.productType ?? 'web',
            model: modelKey,
        }),
    })

    if (!planResponse.ok) {
        const text = await planResponse.text().catch(() => planResponse.statusText)
        throw new Error(`Page planning failed (${planResponse.status}): ${text}`)
    }

    const { plan } = (await planResponse.json()) as { plan: PagePlan }

    console.log(`📋 Plan ready: "${plan.projectName}" — ${plan.pages.length} pages`)
    options.onPlanReady?.(plan)

    // Sort pages by priority (1 = first)
    const sortedPages = [...plan.pages].sort((a, b) => a.priority - b.priority)

    // Build sibling page list (used for nav context)
    const siblingPages = sortedPages.map(p => ({
        name: p.name,
        description: p.description,
    }))

    // Step 2: Generate each page sequentially
    const results: Array<{ name: string; frame: FrameNode }> = []

    for (let i = 0; i < sortedPages.length; i++) {
        const page = sortedPages[i]
        options.onPageStart?.(i, page.name, sortedPages.length)

        try {
            const frame = await generatePage({
                pageName: page.name,
                pageDescription: page.description,
                projectDescription: options.projectDescription,
                productType: options.productType ?? 'web',
                model: options.model,
                themeContext: plan.theme,
                siblingPages,
                onProgress: options.onPageProgress
                    ? (html) => options.onPageProgress!(i, html)
                    : undefined,
            })

            results.push({ name: page.name, frame })
            options.onPageComplete?.(i, page.name, frame)

            console.log(`✅ Page ${i + 1}/${sortedPages.length} generated: "${page.name}"`)
        } catch (error) {
            console.error(`⚠️ Page ${i + 1}/${sortedPages.length} failed: "${page.name}"`, error instanceof Error ? error.message : error)
            // Continue with remaining pages — don't abort the whole project
        }
    }

    if (results.length === 0) {
        throw new Error('All page generations failed. Please try again.')
    }

    return { plan, pages: results }
}
