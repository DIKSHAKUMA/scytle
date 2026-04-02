// ============================================================
// Client-side Page Generation Pipeline (v2)
// Calls plan-pages → search-images → generate-sections API routes.
// Assembles HTML, autofixes, and parses into ScytleNode tree.
// ============================================================

import { createJWT } from '@/lib/appwrite'
import { parseHtmlToNodesViaIframe } from '@/lib/parser'
import { assemblePage, autofixHtml } from '@/lib/ai/autofix'
import type { FrameNode } from '@/types/canvas'
import { useStyleGuideStore } from '@/store'
import type { ProductType } from '@/types'
import type { PagePlan, PlannedPage } from '@/lib/ai/prompts/planner'

/** Map full model IDs → route keys (for backwards compat) */
const MODEL_KEY_MAP: Record<string, string> = {
    'gemini-3.1-pro-preview': 'gemini-pro',
    'gemini-2.5-pro': 'gemini-pro',
    'gemini-2.5-flash': 'gemini-flash',
    'gemini-2.0-flash': 'gemini-flash',
    'fast': 'gemini-flash',
    'balanced': 'gemini-pro',
    'powerful': 'gemini-pro',
    'claude-sonnet-4-6': 'claude-sonnet',
    'claude-sonnet': 'claude-sonnet',
}

export interface GeneratePageOptions {
    pageName: string
    pageDescription?: string
    projectDescription?: string
    industry?: string
    productType?: ProductType
    model?: string
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
    /** Called with section progress: (completed, total) */
    onSectionProgress?: (completed: number, total: number) => void
    /** @deprecated Use onSectionProgress instead */
    onProgress?: (partialHtml: string) => void
    /** Pre-resolved sections (skip planning, go straight to generation) */
    _sections?: PlannedPage['sections']
    /** Pre-resolved images map */
    _images?: Record<string, Array<{ url: string; alt: string }>>
}

// ── Helpers ──────────────────────────────────────────────────

async function authFetch(url: string, body: unknown): Promise<Response> {
    const jwt = await createJWT()
    if (!jwt) throw new Error('Not authenticated')

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwt.jwt}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText)
        throw new Error(`${url} failed (${res.status}): ${text}`)
    }

    return res
}

function resolveModelKey(model?: string): string {
    return MODEL_KEY_MAP[model || ''] || model || 'gemini-flash'
}

function getThemeFromStore(): GeneratePageOptions['themeContext'] {
    const sgState = useStyleGuideStore.getState()
    const table = sgState.variableTable
    const mode = sgState.themeMode

    if (Object.keys(table).length === 0) return undefined

    return {
        primary: table['accent']?.[mode] || '#2563eb',
        secondary: table['bg/secondary']?.[mode] || '#f5f5f5',
        accent: deriveAccentVariant(table['accent']?.[mode] || '#2563eb'),
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
    }
}

// ── Single Page Generation ────────────────────────────────────

/**
 * Generate a single page via AI and return a parsed FrameNode.
 *
 * v2 flow: generate-sections (parallel) → assemblePage → autofix → iframe parse
 *
 * If _sections + _images are provided, skips planning and generates directly.
 * Otherwise, creates a simple plan with generic sections for the page.
 */
export async function generatePage(options: GeneratePageOptions): Promise<FrameNode> {
    const modelKey = resolveModelKey(options.model)
    const themeContext = options.themeContext || getThemeFromStore()

    const theme = themeContext ? {
        primary: themeContext.primary,
        secondary: themeContext.secondary,
        accent: themeContext.accent,
        bg: themeContext.bg,
        text: themeContext.text,
    } : {
        primary: '#2563eb',
        secondary: '#f5f5f5',
        accent: '#7c3aed',
        bg: '#ffffff',
        text: '#111827',
    }

    const fonts = themeContext?.fonts

    // Use pre-resolved sections or create default ones for a single page
    let sections = options._sections
    let images = options._images || {}

    if (!sections) {
        // For standalone page generation, create sensible default sections
        sections = buildDefaultSections(options.pageName, options.pageDescription)

        // Search images for sections that need them
        const imageQueries = sections
            .filter(s => s.imageQuery)
            .map(s => ({
                key: s.imageQuery!,
                query: s.imageQuery!,
                count: 2,
            }))

        if (imageQueries.length > 0) {
            try {
                const imgRes = await authFetch('/api/ai/search-images', { queries: imageQueries })
                const imgData = await imgRes.json()
                images = imgData.images || {}
            } catch (e) {
                console.warn('Image search failed, continuing without images:', e)
            }
        }
    }

    // Generate all sections in parallel
    const totalSections = sections.length
    const res = await authFetch('/api/ai/generate-sections', {
        pageName: options.pageName,
        brandName: options.projectDescription || options.pageName,
        brandDescription: options.pageDescription || options.projectDescription,
        productType: options.productType ?? 'web',
        model: modelKey,
        theme,
        fonts,
        sections,
        images,
    })

    const data = await res.json()
    const sectionHtmls: string[] = data.sections || []

    // Fire progress callback
    options.onSectionProgress?.(totalSections, totalSections)

    // Assemble + autofix
    const html = assemblePage(sectionHtmls, options.pageName)

    if (!html.trim()) {
        throw new Error('AI returned empty response')
    }

    console.log(`✅ Generated ${sectionHtmls.length} sections → ${html.length} chars for "${options.pageName}"`)

    // For legacy onProgress consumers
    options.onProgress?.(html)

    // Parse HTML → ScytleNode tree via hidden iframe
    const sgState = useStyleGuideStore.getState()
    const frame = await parseHtmlToNodesViaIframe(html, options.pageName, {
        rootWidth: 1440,
        variableTable: sgState.variableTable,
        themeMode: sgState.themeMode,
        fonts: extractFontFamilies(html, sgState),
    })

    return frame
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
    onSectionProgress?: (pageIndex: number, completed: number, total: number) => void
}

export interface GenerateProjectResult {
    plan: PagePlan
    pages: Array<{ name: string; frame: FrameNode }>
}

/**
 * Generate a full multi-page project via AI.
 *
 * v2 flow:
 * 1. POST /api/ai/plan-pages → plan with sections per page
 * 2. POST /api/ai/search-images → batch search all image queries
 * 3. For each page: POST /api/ai/generate-sections (parallel sections)
 *    → assemblePage → autofix → iframe parse
 */
export async function generateProject(options: GenerateProjectOptions): Promise<GenerateProjectResult> {
    const modelKey = resolveModelKey(options.model)

    // ── Step 1: Plan pages ──────────────────────────────────────
    console.log('📋 Step 1: Planning pages...')

    const planRes = await authFetch('/api/ai/plan-pages', {
        description: options.projectDescription,
        productType: options.productType ?? 'web',
        model: modelKey,
    })

    const { plan } = (await planRes.json()) as { plan: PagePlan }
    console.log(`✅ Plan ready: "${plan.projectName}" — ${plan.pages.length} pages`)
    options.onPlanReady?.(plan)

    // ── Step 2: Batch image search ──────────────────────────────
    console.log('🖼️ Step 2: Searching images...')

    const imageQueries = plan.pages
        .flatMap(p => p.sections)
        .filter(s => s.imageQuery)
        .map(s => ({
            key: s.imageQuery!,
            query: s.imageQuery!,
            count: 2,
        }))

    // Deduplicate queries by key
    const uniqueQueries = Array.from(
        new Map(imageQueries.map(q => [q.key, q])).values()
    )

    let images: Record<string, Array<{ url: string; alt: string }>> = {}
    if (uniqueQueries.length > 0) {
        try {
            const imgRes = await authFetch('/api/ai/search-images', { queries: uniqueQueries })
            const imgData = await imgRes.json()
            images = imgData.images || {}
            console.log(`✅ Found images for ${Object.keys(images).length} queries`)
        } catch (e) {
            console.warn('Image search failed, continuing without images:', e)
        }
    }

    // ── Step 3: Generate pages ──────────────────────────────────
    console.log('🏗️ Step 3: Generating pages...')

    const sortedPages = [...plan.pages].sort((a, b) => a.priority - b.priority)
    const results: Array<{ name: string; frame: FrameNode }> = []

    // Generate pages sequentially to avoid overwhelming rate limits
    // (each page already generates its sections in parallel on the server)
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
                onSectionProgress: (completed, total) => {
                    options.onSectionProgress?.(i, completed, total)
                },
                onProgress: options.onPageProgress
                    ? (html) => options.onPageProgress!(i, html)
                    : undefined,
                // Pass pre-resolved sections + images so generatePage skips planning
                _sections: page.sections,
                _images: images,
            })

            results.push({ name: page.name, frame })
            options.onPageComplete?.(i, page.name, frame)
            console.log(`✅ Page ${i + 1}/${sortedPages.length}: "${page.name}"`)
        } catch (error) {
            console.error(`⚠️ Page "${page.name}" failed:`, error instanceof Error ? error.message : error)
        }
    }

    if (results.length === 0) {
        throw new Error('All page generations failed. Please try again.')
    }

    console.log(`🎉 Project complete: ${results.length}/${sortedPages.length} pages generated`)
    return { plan, pages: results }
}

// ── Internal Helpers ─────────────────────────────────────────

/**
 * Build default sections for standalone page generation
 * when no pre-planned sections are provided.
 */
function buildDefaultSections(pageName: string, description?: string): PlannedPage['sections'] {
    const lower = pageName.toLowerCase()

    // Common page patterns
    if (lower.includes('landing') || lower.includes('home') || lower === 'main') {
        return [
            { type: 'hero', layout: 'split-hero', imageQuery: description ? `${description} hero` : 'modern website hero', description: `Hero section for ${pageName}` },
            { type: 'features', layout: 'bento-grid', imageQuery: null, description: `Key features highlight` },
            { type: 'testimonials', layout: 'card-mosaic', imageQuery: 'professional headshot portrait', description: `Customer testimonials` },
            { type: 'cta', layout: 'centered-hero', imageQuery: null, description: `Call to action` },
            { type: 'footer', layout: 'stacked-cards', imageQuery: null, description: `Footer with links and info` },
        ]
    }

    if (lower.includes('about')) {
        return [
            { type: 'hero', layout: 'centered-hero', imageQuery: description ? `${description} team` : 'team office workspace', description: `About hero` },
            { type: 'team', layout: 'card-mosaic', imageQuery: 'professional headshot', description: `Team members` },
            { type: 'stats', layout: 'bento-grid', imageQuery: null, description: `Company stats and milestones` },
            { type: 'footer', layout: 'stacked-cards', imageQuery: null, description: `Footer` },
        ]
    }

    if (lower.includes('pricing')) {
        return [
            { type: 'hero', layout: 'centered-hero', imageQuery: null, description: `Pricing page header` },
            { type: 'pricing', layout: 'card-mosaic', imageQuery: null, description: `Pricing plans comparison` },
            { type: 'faq', layout: 'stacked-cards', imageQuery: null, description: `Frequently asked questions` },
            { type: 'footer', layout: 'stacked-cards', imageQuery: null, description: `Footer` },
        ]
    }

    if (lower.includes('contact')) {
        return [
            { type: 'hero', layout: 'centered-hero', imageQuery: null, description: `Contact page header` },
            { type: 'contact', layout: 'split-hero', imageQuery: 'modern office building', description: `Contact form and info` },
            { type: 'footer', layout: 'stacked-cards', imageQuery: null, description: `Footer` },
        ]
    }

    // Generic fallback
    return [
        { type: 'hero', layout: 'split-hero', imageQuery: description ? `${description}` : 'modern abstract design', description: `Hero section for ${pageName}` },
        { type: 'features', layout: 'zigzag', imageQuery: null, description: `Main content for ${pageName}` },
        { type: 'cta', layout: 'centered-hero', imageQuery: null, description: `Call to action` },
        { type: 'footer', layout: 'stacked-cards', imageQuery: null, description: `Footer` },
    ]
}

/**
 * Extract Google Font families from HTML and the active style guide.
 */
function extractFontFamilies(
    html: string,
    sgState: { variableTable: Record<string, { light: string; dark: string }>; themeMode: 'light' | 'dark' },
): string[] {
    const families = new Set<string>()

    // From Tailwind arbitrary font-[] classes
    const fontClasses = html.match(/font-\[([^\]]+)\]/g)
    if (fontClasses) {
        for (const fc of fontClasses) {
            const family = fc.slice(6, -1).replace(/_/g, ' ').replace(/['"]/g, '')
            if (family) families.add(family)
        }
    }

    // From inline style font-family
    const inlineFont = html.match(/font-family:\s*['"]?([^;'"]+)/gi)
    if (inlineFont) {
        for (const match of inlineFont) {
            const family = match.replace(/font-family:\s*/i, '').split(',')[0].trim().replace(/['"]/g, '')
            if (family) families.add(family)
        }
    }

    // From the active style guide
    const table = sgState.variableTable
    const mode = sgState.themeMode
    if (table['font/heading']?.[mode]) families.add(table['font/heading'][mode])
    if (table['font/body']?.[mode]) families.add(table['font/body'][mode])

    const systemFonts = new Set(['Inter', 'sans-serif', 'serif', 'monospace', 'mono', 'system-ui', 'Arial', 'Helvetica'])
    return Array.from(families).filter(f => !systemFonts.has(f))
}

/**
 * Derive a distinct accent color from a primary hex by shifting hue ~80°.
 */
function deriveAccentVariant(hex: string): string {
    const h = hex.replace('#', '')
    const r = parseInt(h.slice(0, 2), 16) / 255
    const g = parseInt(h.slice(2, 4), 16) / 255
    const b = parseInt(h.slice(4, 6), 16) / 255

    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const l = (max + min) / 2
    let hue = 0, s = 0

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6
        else if (max === g) hue = ((b - r) / d + 2) / 6
        else hue = ((r - g) / d + 4) / 6
    }

    const newHue = (hue + 0.22) % 1
    const newSat = Math.min(1, s * 1.1)

    const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
    }

    const q2 = l < 0.5 ? l * (1 + newSat) : l + newSat - l * newSat
    const p2 = 2 * l - q2
    const nr = Math.round(hue2rgb(p2, q2, newHue + 1 / 3) * 255)
    const ng = Math.round(hue2rgb(p2, q2, newHue) * 255)
    const nb = Math.round(hue2rgb(p2, q2, newHue - 1 / 3) * 255)

    return '#' + [nr, ng, nb].map(c => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0')).join('')
}
