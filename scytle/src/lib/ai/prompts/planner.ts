// ============================================================
// Enhanced Page Planner Prompt (v2)
// Outputs richer JSON: layout archetypes per page, section-level
// layout + imageQuery + description. The planner is the brain
// that drives the entire parallel pipeline.
// ============================================================

// Layout summary removed — old pipeline dependency

// ── Types ────────────────────────────────────────────────────

export interface PlannedSection {
    type: string
    layout: string
    imageQuery: string | null
    description: string
}

export interface PlannedPage {
    name: string
    slug: string
    description: string
    pageType: 'marketing' | 'application' | 'auth' | 'content'
    layoutArchetype: string
    priority: number
    sections: PlannedSection[]
}

export interface PagePlan {
    projectName: string
    theme: {
        primary: string
        secondary: string
        accent: string
        bg: string
        text: string
        tone: string
    }
    pages: PlannedPage[]
}

// ── Prompt Builder ───────────────────────────────────────────

export function buildPagePlannerPrompt(productType: 'web' | 'app'): string {
    const isApp = productType === 'app'
    return `You are an expert product designer and information architect. Given a user's product description, plan the pages, layout archetypes, and sections for their ${isApp ? 'mobile application' : 'website'}.

OUTPUT: Valid JSON only. No markdown fences, no explanation, no extra text.

JSON SCHEMA:
{
  "projectName": "string — short product name (2-4 words)",
  "theme": {
    "primary": "#hex — main brand color",
    "secondary": "#hex — supporting color",
    "accent": "#hex — highlight/action color",
    "bg": "#hex — background color (usually #ffffff or #fafafa)",
    "text": "#hex — primary text color (usually #111827 or #0f172a)",
    "tone": "modern | playful | professional | minimal | bold | elegant"
  },
  "pages": [
    {
      "name": "string — page name (e.g., 'Home', 'Dashboard', 'Pricing')",
      "slug": "string — URL slug (e.g., '/', '/pricing', '/dashboard')",
      "description": "string — 2-3 sentences about what this page shows",
      "pageType": "marketing | application | auth | content",
      "layoutArchetype": "string — one of the layout archetype IDs above",
      "priority": 1,
      "sections": [
        {
          "type": "string — section type: hero, features, testimonials, pricing, cta, faq, footer, nav, stats, contact, team, dashboard, gallery, blog",
          "layout": "string — layout archetype for THIS section (can differ from page archetype)",
          "imageQuery": "string | null — Unsplash search query for images needed, or null if no images",
          "description": "string — specific visual description of what this section contains"
        }
      ]
    }
  ]
}

RULES:
1. Generate ${isApp ? '3-4' : '3-5'} pages. Priority 1 is generated first (main page).
2. Each page MUST have 3-7 sections. Every section needs a specific description.
3. Pick DIFFERENT layout archetypes for different pages — variety is key.
4. Mix section layouts within a page — don't use the same layout for every section.
5. Image queries should be specific and relevant: "aerial view modern office" not "office". Use null for sections that don't need photos (pricing, FAQ, stats).
6. Section descriptions must be HIGHLY SPECIFIC about UI elements:
   GOOD: "Hero with split layout: left side has badge 'Now in Beta', large headline, subtext, two CTA buttons. Right side shows product screenshot."
   BAD: "Hero section with headline and buttons."
7. Color palette rules:
   - Choose colors that match the product's industry and vibe.
   - Don't always default to blue. Consider: emerald for health/eco, violet for creative, amber for food, rose for fashion.
   - Background should usually be white (#ffffff) or very light (#fafafa, #f8fafc).
   - Text should be very dark (#111827, #0f172a, #18181b).
8. The FIRST section of the first page should be "nav" (navigation). The LAST section of marketing pages should be "footer".
${isApp ? '9. For mobile apps: no nav/footer sections. Use app-specific sections: dashboard, stats, cards, lists.' : ''}

Output ONLY the JSON object.`
}

export function buildPagePlannerMessage(description: string): string {
    return `Design the complete page structure for this product: ${description}

Output valid JSON only.`
}
