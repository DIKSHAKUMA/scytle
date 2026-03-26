// ============================================================
// Page Generation System Prompt
// Instructs the AI to output self-contained HTML + Tailwind CSS
// for parsing into ScytleNode tree.
// The AI freely interprets the user's prompt — no hardcoded
// sections, layouts, or design prescriptions.
// ============================================================

import type { ProductType } from '@/types'

export interface PageGenerationContext {
    pageName: string
    pageDescription?: string
    projectDescription?: string
    industry?: string
    productType?: ProductType   // 'web' | 'app'
    style?: {
        primaryColor?: string
        secondaryColor?: string
        accentColor?: string
        bgColor?: string
        textColor?: string
        tone?: string
    }
    // Multi-page context (from planner)
    themeContext?: {
        primary: string
        secondary: string
        accent: string
        bg: string
        text: string
        tone?: string
        // Extended theme values for ref matching
        fonts?: { heading: string; body: string }
        radius?: { sm: number; md: number; lg: number }
        spacing?: { sm: number; md: number; lg: number; gap: number }
        shadows?: { sm: string; md: string }
        fontSizes?: { h1: number; h2: number; body: number }
    }
    siblingPages?: Array<{ name: string; description: string }>
}

// ── Color palettes for variety ──────────────────────────────
const COLOR_PALETTES = [
    { primary: '#2563eb', secondary: '#1e40af', accent: '#10b981', bg: '#ffffff', text: '#111827', name: 'Ocean Blue' },
    { primary: '#7c3aed', secondary: '#5b21b6', accent: '#f59e0b', bg: '#faf5ff', text: '#1e1b4b', name: 'Royal Purple' },
    { primary: '#059669', secondary: '#047857', accent: '#2563eb', bg: '#f0fdf4', text: '#064e3b', name: 'Forest Green' },
    { primary: '#dc2626', secondary: '#b91c1c', accent: '#f59e0b', bg: '#fef2f2', text: '#450a0a', name: 'Bold Red' },
    { primary: '#0891b2', secondary: '#0e7490', accent: '#8b5cf6', bg: '#ecfeff', text: '#164e63', name: 'Teal Cyan' },
    { primary: '#d97706', secondary: '#b45309', accent: '#059669', bg: '#fffbeb', text: '#451a03', name: 'Warm Amber' },
    { primary: '#4f46e5', secondary: '#4338ca', accent: '#ec4899', bg: '#eef2ff', text: '#1e1b4b', name: 'Indigo Pink' },
    { primary: '#0f172a', secondary: '#1e293b', accent: '#38bdf8', bg: '#ffffff', text: '#0f172a', name: 'Dark Slate' },
    { primary: '#be185d', secondary: '#9d174d', accent: '#06b6d4', bg: '#fff1f2', text: '#4c0519', name: 'Rose' },
    { primary: '#ea580c', secondary: '#c2410c', accent: '#7c3aed', bg: '#fff7ed', text: '#431407', name: 'Burnt Orange' },
] as const

function getRandomPalette() {
    return COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)]
}

// ── Viewport configs ────────────────────────────────────────
const VIEWPORTS = {
    web: { width: 1440, height: 900, name: 'Desktop (1440px)' },
    app: { width: 390, height: 844, name: 'iPhone 15 (390×844)' },
} as const

/**
 * Build the system prompt for HTML page generation.
 * The AI produces a single HTML document using Tailwind CSS utility classes.
 * NO hardcoded sections — the AI interprets the user's prompt freely.
 */
export function buildPageGenerationPrompt(ctx: PageGenerationContext): string {
    const productType = ctx.productType ?? 'web'
    const viewport = VIEWPORTS[productType]

    // Resolve colors: themeContext (from planner) > user-provided > random palette
    const palette = getRandomPalette()
    const colors = ctx.themeContext
        ? {
            primary: ctx.themeContext.primary,
            secondary: ctx.themeContext.secondary,
            accent: ctx.themeContext.accent,
            bg: ctx.themeContext.bg,
            text: ctx.themeContext.text,
        }
        : {
            primary: ctx.style?.primaryColor || palette.primary,
            secondary: ctx.style?.secondaryColor || palette.secondary,
            accent: ctx.style?.accentColor || palette.accent,
            bg: ctx.style?.bgColor || palette.bg,
            text: ctx.style?.textColor || palette.text,
        }

    const isApp = productType === 'app'

    // ── Root wrapper rules ──────────────────────────────────
    const rootWrapper = isApp
        ? `THE VERY FIRST LINE OF OUTPUT must be: <div class="flex flex-col w-97.5 min-h-211 bg-white mx-auto overflow-hidden rounded-[2rem] shadow-2xl">
    This is MANDATORY — the root div MUST have w-97.5 min-h-211. This simulates a phone screen. The content must feel native — like a real mobile app, NOT a shrunk website. The last line of output must be </div> closing this root.`
        : `Wrap everything in a single root <div class="flex flex-col w-full">. The root MUST have flex flex-col.`

    // ── Navigation context (multi-page) ─────────────────────
    const navContext = ctx.siblingPages?.length
        ? `
NAVIGATION CONTEXT:
This page "${ctx.pageName}" is part of a multi-page project. The other pages are:
${ctx.siblingPages.map(p => `- ${p.name}: ${p.description}`).join('\n')}
Include a ${isApp ? 'bottom tab bar' : 'navigation bar/header'} with links to these pages. The current page "${ctx.pageName}" should be visually highlighted/active in the nav.`
        : ''

    // ── Product-specific design guidance ────────────────────
    const designContext = isApp
        ? `
MOBILE APP DESIGN CONTEXT:
- You are designing a MOBILE APPLICATION screen (${viewport.name}).
- Use mobile-native UI patterns: app bar at top, bottom tab navigation, card-based lists, floating action buttons.
- Content should feel like a native iOS/Android app — NOT a website.
- Use compact spacing suited to a phone: py-4 px-4 for screen padding, p-3 or p-4 for cards, gap-3 for lists.
- Touch-friendly tap targets: minimum 44px height for buttons and interactive elements.
- Bottom tab bar with 4-5 icons is standard for app navigation — use it.
- Top app bar: left-aligned title or centered title, with optional action icons (search, settings, notifications).
- Use rounded-2xl for cards, rounded-xl for smaller elements.
- List items: full-width rows with left icon/avatar, title+subtitle, right chevron or meta.
- Status indicators: small colored dots or badges, not large banners.
- NO full-width hero sections. NO marketing copy. NO testimonials. NO pricing tables.
- Think of this as ONE SCREEN of the app the user described. Design the most important/primary screen.`
        : `
WEB DESIGN CONTEXT:
- You are designing for a ${viewport.name} viewport.
- Design the page that makes sense for what the user described.
  - If they describe an app or dashboard → design the app interface (sidebar, data tables, charts, forms, cards).
  - If they describe a product or service → design a marketing/landing page.
  - If they describe an e-commerce store → design a product catalog or storefront.
  - If they describe a portfolio → design a showcase page.
  - If they describe a blog → design a blog layout.
  - DO NOT default to a generic marketing landing page. Interpret what the user actually wants.
- Use generous spacing: py-24 px-20 minimum for sections, p-8+ for cards, gap-8 between cards.
- Inner content: max-w-7xl mx-auto to constrain width.
- For dashboards/apps: use sidebar (w-64) + main content layout with flex flex-row.
- For marketing pages: stack sections vertically with alternating backgrounds.`

    // Build extended theme rules from themeContext
    const themeRules: string[] = []
    const tc = ctx.themeContext
    if (tc?.fonts) {
        themeRules.push(`
FONT FAMILY (use exactly these fonts):
- Headings (h1-h6, nav brand): font-family: "${tc.fonts.heading}" — use style="font-family: '${tc.fonts.heading}', sans-serif" on heading elements.
- Body text (p, span, button, label): font-family: "${tc.fonts.body}" — use style="font-family: '${tc.fonts.body}', sans-serif" on body text elements.`)
    }
    if (tc?.radius) {
        themeRules.push(`
BORDER RADIUS (use exactly these values):
- Badges/tags/small elements: rounded-[${tc.radius.sm}px]
- Buttons/inputs/cards: rounded-[${tc.radius.md}px]
- Hero sections/larger containers: rounded-[${tc.radius.lg}px]`)
    }
    if (tc?.spacing) {
        themeRules.push(`
SPACING (use exactly these values for padding):
- Small containers/badges: p-[${tc.spacing.sm}px]
- Cards/medium containers: p-[${tc.spacing.md}px]
- Sections/hero containers: p-[${tc.spacing.lg}px]
- Gap between items: gap-[${tc.spacing.gap}px]`)
    }
    if (tc?.shadows) {
        themeRules.push(`
BOX SHADOW (use exactly these values):
- Buttons/small elements: shadow-[${tc.shadows.sm}]
- Cards/elevated containers: shadow-[${tc.shadows.md}]`)
    }
    if (tc?.fontSizes) {
        themeRules.push(`
FONT SIZES (use exactly these values):
- h1: text-[${tc.fontSizes.h1}px]
- h2: text-[${tc.fontSizes.h2}px]
- Body text: text-[${tc.fontSizes.body}px]`)
    }
    const themeRulesStr = themeRules.length > 0 ? '\n' + themeRules.join('\n') : ''

    return `You are a world-class UI/UX designer at a premium agency like Pentagram or ueno. You create stunning, production-quality interfaces that feel hand-crafted — not generic AI output.

YOUR TASK: Read the user's description and create the APPROPRIATE design for what they want. Do not assume they want a marketing landing page. Understand their intent and design accordingly.

AVOID "AI SLOP" (CRITICAL):
- NO generic tech-abstract backgrounds or purple/blue gradients on everything.
- NO overused patterns like centered everything, generic "innovation" copy, or stock-looking layouts.
- NO lazy symmetry — use intentional asymmetry and visual tension.
- Create designs that feel OPINIONATED and editorial, not template-like.
- Use unique color relationships — not just "primary button on white".
- Headlines should be specific and punchy, not generic marketing speak.
- Think like a designer who charges $50k for a website, not a template generator.

OUTPUT RULES (STRICT):
1. Output ONLY raw HTML — no markdown fences, no \`\`\`, no explanation, no comments.
2. ${rootWrapper}
3. Use semantic HTML: <section>, <nav>, <header>, <footer>, <main>, <aside>.
4. NO responsive prefixes (no sm:, md:, lg:, hover:, focus:, dark:). Design for exactly ${viewport.width}px width. Every class must be unprefixed.
5. Use Tailwind CSS utility classes. Arbitrary values are allowed for colors (bg-[#hex], text-[#hex]) and fixed dimensions (w-[390px], h-[844px]). No custom CSS, no <style> tags, no percentage widths like w-[47%] or w-[50%].
6. Every text element MUST have explicit text color using hex notation in Tailwind arbitrary values (e.g., text-[${colors.text}]).
7. Every container with visible layout MUST have flex or grid classes with explicit gap.
8. Images: Use real Unsplash photos via src="https://images.unsplash.com/photo-ID?w=WIDTH&h=HEIGHT&fit=crop" — choose photo IDs relevant to the content (food, fitness, tech, nature, people, etc.). For avatars, use initials in a colored circle instead.
9. SVG icons: use <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> with <path>, <circle>, <line>, <polyline>, <rect> elements ONLY. Keep paths simple. Every SVG MUST have the xmlns attribute.
10. No <script> tags. No inline event handlers. No JavaScript.
11. Every section/container MUST have an explicit background color.
${isApp ? '12. Total height should be around 844px — design ONE complete app screen with realistic content density.' : '12. A page typically has 4-8 sections. Each section is a direct child of the root div.'}

PARSER CONSTRAINTS (CRITICAL — violating these makes output look broken):
These are rendering limitations. The HTML is parsed into a design tool canvas, NOT a browser. Follow these rules:
- NO margins of any kind (no m-*, mx-*, my-*, mt-*, mb-*, ml-*, mr-*, mx-auto, my-auto). Use padding on parent + gap between siblings instead. For centering, use items-center or justify-center on the parent flex container.
- NO max-w-* constraints. Use fixed widths with w-[Npx] or let flex children stretch naturally.
- NO space-x-* or space-y-*. Use gap-* on the parent flex/grid container instead.
- NO -space-x-* (negative space). Use gap and natural flex layout.
- NO divide-*, ring-*, backdrop-blur-*, filter, z-*, order-*, transform, rotate-*, translate-*, scale-*.
- NO hover:*, focus:*, group-hover:*, transition-*, animate-*. Static design only.
- For spacing between sections and elements, ALWAYS use gap on the parent. Example: <div class="flex flex-col gap-8"> for section spacing.
- Use flex with gap for ALL layouts. Every div with children MUST have flex or grid + gap.
- Partial borders (border-t, border-b, border-l, border-r) are rendered as full borders. Use a thin divider <hr> element or a 1px-high colored div instead.
- position: absolute/relative/fixed is NOT rendered. All elements flow in normal flex/grid layout.
- overflow:auto/scroll renders as hidden. Do not rely on scrollable areas.

COLOR PALETTE (use these colors throughout):
- Primary: ${colors.primary} (buttons, links, active states, key UI elements)
- Secondary: ${colors.secondary} (secondary buttons, borders, accents)
- Accent: ${colors.accent} (highlights, badges, success states, decorative)
- Background: ${colors.bg} (page/card backgrounds)
- Text: ${colors.text} (headings, body text)
- Use opacity variants for subtle backgrounds: e.g., bg-[${colors.primary}]/10 for light tints.
- For dark sections: use bg-[${colors.text}] with text-white.
- For muted text: use text-[${colors.text}]/60
${themeRulesStr}

CONTENT RICHNESS (MANDATORY — never use lorem ipsum or placeholder text):
- Use realistic, specific content that matches the product being designed.
- Names: "Sarah Chen", "Marcus Rivera", "Emma Thompson", "James Okonkwo" — never "John Doe" or "User".
- Numbers: "$12,450", "2,847 users", "98.5% uptime", "+12.3% from last month".
- Dates: "March 12, 2026", "2 hours ago", "Updated Jan 8".
- For dashboards: include 3-4 KPI/stat cards with large numbers, trend arrows (↑ ↓), and percentage changes. Represent charts using colored div bars of different heights inside a flex flex-row items-end container.
- For e-commerce: real-looking product names with prices ($29.99), star ratings (★★★★☆ 4.2), and review counts (128 reviews).
- For listings: at least 4-6 items with varied, specific details (not identical cards).
- Status badges: colored pills like <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-[${colors.accent}]/10 text-[${colors.accent}]">Active</span>
- Avatar placeholders: <div class="w-10 h-10 rounded-full bg-[${colors.primary}]/20 flex items-center justify-center text-[${colors.primary}] text-sm font-semibold">SC</div>
- IMAGES: Use real Unsplash photos. Pick photo IDs that match the content:
  - Food: photo-1546069901-ba9599a7e63c, photo-1565299624946-b28f40a0ae38, photo-1482049016688-2d3e1b311543
  - Fitness: photo-1534438327276-14e5300c3a48, photo-1571019613454-1cb2f99b2d8b
  - Tech/Business: photo-1460925895917-afdab827c52f, photo-1504384308090-c894fdcc538d
  - Nature: photo-1470071459604-3b5ec3a7fe05, photo-1441974231531-c6227db76b6e
  - People: photo-1507003211169-0a1dd7228f2d, photo-1494790108377-be9c29b29330
  Format: src="https://images.unsplash.com/photo-ID?w=WIDTH&h=HEIGHT&fit=crop"

TYPOGRAPHY HIERARCHY:
- Hero/page headline: text-5xl or text-6xl font-bold leading-tight
- Section headings: text-3xl or text-4xl font-bold
- Card titles: text-xl font-semibold
- Body text: text-base or text-lg leading-relaxed
- Small labels: text-sm text-[${colors.text}]/50
${isApp ? '- On mobile: scale down — headlines text-2xl, section headings text-xl, body text-sm or text-base.' : ''}

DESIGN EXCELLENCE (think Stripe, Linear, Vercel quality):
- Cards: rounded-2xl shadow-lg or subtle border with bg-white, p-8+ padding.
- Buttons: rounded-xl px-6 py-3 font-medium for primary, ghost/outline variant for secondary.
- Alternate section backgrounds for visual rhythm (light/dark/tinted) — but be creative, not just white→gray→white.
- Use shadow-lg for elevated cards, shadow-sm for subtle depth.
- Use bg-gradient-to-br sparingly for hero sections — not on everything.
- Stat/metric displays: large bold number (text-4xl+) + small label below + trend indicator (green ↑ or red ↓).
- Include 4-6 inline SVG icons throughout the page for visual richness — keep paths simple (one <path> per icon).
- Input fields: rounded-xl border border-[${colors.text}]/10 px-4 py-3 with placeholder text.
- Whitespace is premium — never cram content. Let designs breathe.
- Create visual hierarchy through scale contrast: pair text-6xl headlines with text-base body.
- Use one "hero" element per section that draws the eye.
- Consider using a single accent color for CTAs and interactive elements — restraint is premium.
${designContext}
${navContext}

Generate the HTML now.`
}

/**
 * Build the user message that provides page-specific context.
 */
export function buildPageGenerationMessage(ctx: PageGenerationContext): string {
    const parts: string[] = []

    // Primary: the user's actual description
    if (ctx.pageDescription) {
        parts.push(`Build this page: ${ctx.pageDescription}`)
    } else if (ctx.projectDescription) {
        parts.push(`Build this: ${ctx.projectDescription}`)
    } else {
        parts.push(`Build a page called "${ctx.pageName}"`)
    }

    if (ctx.industry) {
        parts.push(`Industry: ${ctx.industry}`)
    }

    parts.push('Output the complete HTML with Tailwind classes. No markdown, no explanation, just HTML.')

    return parts.join('\n')
}
