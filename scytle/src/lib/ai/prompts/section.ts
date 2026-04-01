// ============================================================
// Per-Section Prompt Generator
// Each section type gets a focused, specific prompt instead of
// one monolithic 270-line blob. This is the core quality lever.
// ============================================================

import { getSharedSystemRules } from './system'
import { getLayoutById } from './layouts'

export interface SectionContext {
    /** Section type: hero, features, testimonials, pricing, etc. */
    type: string
    /** Layout archetype for this section */
    layout: string
    /** What this section should contain */
    description: string
    /** Page name this section belongs to */
    pageName: string
    /** Brand/product name */
    brandName: string
    /** Brand/product description */
    brandDescription?: string
    /** Theme colors */
    theme: {
        primary: string
        secondary: string
        accent: string
        bg: string
        text: string
    }
    /** Theme fonts (optional) */
    fonts?: { heading: string; body: string }
    /** Pre-searched Unsplash image URLs for this section */
    images?: Array<{ url: string; alt: string }>
    /** What section comes before */
    prevSection?: { type: string; description: string }
    /** What section comes after */
    nextSection?: { type: string; description: string }
    /** Product type: web or app */
    productType?: 'web' | 'app'
}

/** Section-specific design guidance */
const SECTION_GUIDANCE: Record<string, string> = {
    hero: `HERO SECTION DESIGN:
- This is the FIRST thing visitors see. Make it count.
- Lead with the value proposition, not the product name.
- Use a strong headline (text-5xl or text-6xl) paired with a clear subheading.
- Include 1-2 CTA buttons: primary (filled) + secondary (outline/ghost).
- If images are provided, use them prominently — don't hide them in a corner.
- Background can be: dark (gray-950), light with tinted bg, or gradient.
- Add a small badge/label above the headline (e.g., "Now in beta", "Trusted by 500+ teams").`,

    features: `FEATURES SECTION DESIGN:
- Show 3-6 features with clear icons, titles, and descriptions.
- Each feature card should feel distinct — vary the content, don't repeat patterns.
- Use real, specific feature names (not "Feature 1", "Feature 2").
- Icons: use simple SVG icons. Each feature gets a unique icon.
- Consider: bento grid (asymmetric), uniform cards, or zigzag layout.
- Add subtle visual variety: different background tints, icon colors, or card sizes.`,

    testimonials: `TESTIMONIALS SECTION DESIGN:
- Show 2-3 testimonials with realistic quotes.
- Include: avatar (initials in colored circle), full name, role, and company.
- Quotes should be specific and believable, not generic praise.
- Good: "Cut our deployment time from 3 hours to 15 minutes"
- Bad: "Amazing product, would recommend to everyone!"
- Consider star ratings or a highlight metric per testimonial.`,

    pricing: `PRICING SECTION DESIGN:
- Show 2-3 pricing tiers: Starter, Pro (highlighted), Enterprise.
- Each tier: name, price (/mo), description, feature list (4-6 items), CTA button.
- The middle/recommended tier should visually stand out (colored bg or border).
- Use checkmark icons for included features.
- Add a toggle for monthly/annual pricing if space allows.
- Include a "Most popular" or "Recommended" badge on the featured plan.`,

    cta: `CTA SECTION DESIGN:
- This is a conversion section. Be bold and direct.
- Strong headline + one clear action. Don't give too many choices.
- Use contrasting background (dark, or brand color) to stand out from the rest.
- Button should be large and prominent.
- Optional: add social proof (e.g., "Join 2,400+ teams") or urgency.
- Keep it short — 3-4 lines max.`,

    faq: `FAQ SECTION DESIGN:
- Show 4-6 commonly asked questions with answers.
- Use a clean list format — each Q&A as a distinct block.
- Questions in bold/semibold, answers in regular weight.
- Keep answers concise (2-3 sentences each).
- Questions should address real concerns (pricing, setup, support, security).`,

    footer: `FOOTER SECTION DESIGN:
- Multi-column layout: 3-4 columns of links.
- Column categories: Product, Company, Resources, Legal.
- Include: logo/brand name, brief description, social links.
- Bottom row: copyright notice + legal links (Privacy, Terms).
- Use muted colors (gray-500, gray-600) — footer should be understated.
- Background: gray-50 (light) or gray-950 (dark).`,

    nav: `NAVIGATION SECTION DESIGN:
- Horizontal nav bar with: logo (left), links (center or left), CTA button (right).
- Keep it clean and minimal — 4-6 nav links max.
- Logo: brand name in bold text or a simple icon + name.
- CTA button should use the primary/accent color.
- Background: white with subtle bottom border, or transparent.`,

    stats: `STATS SECTION DESIGN:
- Show 3-4 impressive metrics in a row.
- Each stat: large bold number (text-4xl+), descriptive label below.
- Use specific, believable numbers — not round numbers.
- Good: "2,847 teams", "$4.2M processed", "99.97% uptime"
- Bad: "1000+ users", "100% satisfaction"
- Consider: trend indicators (↑ ↓), comparison text ("+12% vs last quarter").`,

    contact: `CONTACT SECTION DESIGN:
- Contact form with: name, email, message fields.
- Include company contact info alongside: email, phone, address.
- Form fields: rounded inputs with labels, clear submit button.
- Keep it professional but approachable.`,

    team: `TEAM SECTION DESIGN:
- Show 4-6 team members in a grid.
- Each: avatar (initials circle or photo), name, role, optional short bio.
- Use consistent avatar style across all members.
- Add subtle visual distinction for leadership (larger cards, different layout).`,

    dashboard: `DASHBOARD SECTION DESIGN:
- App-style UI with metric cards, charts, and data.
- Top row: 3-4 KPI cards with large numbers, labels, and trend indicators.
- Below: chart area (use colored div bars for chart representation) or data table.
- Use clean lines, subtle borders, minimal color.
- This should look like a real SaaS product, not a mockup.`,
}

/**
 * Build a focused prompt for generating a single section.
 * Returns the complete system prompt string.
 */
export function buildSectionPrompt(ctx: SectionContext): string {
    const sharedRules = getSharedSystemRules()
    const layout = getLayoutById(ctx.layout)

    // Section-specific guidance
    const sectionType = ctx.type.toLowerCase()
    const guidance = SECTION_GUIDANCE[sectionType]
        || `Generate a "${ctx.type}" section that matches the description below. Use high-quality, production-ready design.`

    // Theme colors block
    const themeBlock = `COLOR PALETTE (use these colors):
- Primary: ${ctx.theme.primary} (buttons, links, active states)
- Secondary: ${ctx.theme.secondary} (secondary elements, borders)
- Accent: ${ctx.theme.accent} (highlights, badges, decorative)
- Background: ${ctx.theme.bg} (section/card backgrounds)
- Text: ${ctx.theme.text} (headings, body text)
- Muted text: use opacity like text-gray-500 or text-gray-600
- For dark sections: use bg-gray-950 or bg-[${ctx.theme.text}] with text-white.`

    // Font block
    const fontBlock = ctx.fonts
        ? `FONTS: Use style="font-family: '${ctx.fonts.heading}', sans-serif" on headings, style="font-family: '${ctx.fonts.body}', sans-serif" on body text.`
        : ''

    // Image block
    const imageBlock = ctx.images?.length
        ? `IMAGES (use these exact URLs):\n${ctx.images.map((img, i) => `- Image ${i + 1}: ${img.url} (${img.alt})`).join('\n')}`
        : 'IMAGES: Use simple SVG icons or colored shapes. No external image URLs for this section.'

    // Adjacent section context for visual flow
    const adjacentBlock = [
        ctx.prevSection ? `Previous section: ${ctx.prevSection.type} — "${ctx.prevSection.description}"` : null,
        ctx.nextSection ? `Next section: ${ctx.nextSection.type} — "${ctx.nextSection.description}"` : null,
    ].filter(Boolean).join('\n')

    const adjacentContext = adjacentBlock
        ? `VISUAL FLOW:\n${adjacentBlock}\nEnsure smooth visual transition between sections. Alternate backgrounds for rhythm.`
        : ''

    // Layout skeleton as few-shot example
    const layoutExample = layout
        ? `LAYOUT REFERENCE (adapt this pattern, don't copy verbatim):\n\`\`\`html\n${layout.skeleton}\n\`\`\``
        : ''

    const isApp = ctx.productType === 'app'
    const viewportHint = isApp
        ? 'Design for a mobile screen (390px wide). Use compact spacing.'
        : 'Design for desktop (1440px wide). Use generous spacing.'

    return `You are generating a single ${ctx.type.toUpperCase()} section for "${ctx.pageName}" page.
Brand: ${ctx.brandName}${ctx.brandDescription ? ` — ${ctx.brandDescription}` : ''}
${viewportHint}

${sharedRules}

${guidance}

${themeBlock}

${fontBlock}

${imageBlock}

${adjacentContext}

${layoutExample}

SECTION DESCRIPTION: ${ctx.description}

Generate ONLY the HTML for this ONE section. Wrap in a <section> tag. Output raw HTML only.`
}
