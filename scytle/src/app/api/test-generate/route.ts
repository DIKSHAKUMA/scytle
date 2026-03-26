import { NextRequest, NextResponse } from 'next/server'
import { generate } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { prompt, colors, fonts, radius, spacing, shadows, fontSizes } = await req.json()

    const systemPrompt = `You are a web designer. Generate a single-page HTML layout.

CRITICAL RULES:
1. Use ONLY inline styles. No Tailwind, no classes, no <style> tags.
2. Use ONLY these exact hex colors (do NOT invent new colors):
   - Primary background: ${colors.bgPrimary}
   - Secondary background: ${colors.bgSecondary}
   - Primary text: ${colors.textPrimary}
   - Secondary text: ${colors.textSecondary}
   - Accent (buttons, highlights, badges): ${colors.accent}
   - Text on accent backgrounds: ${colors.textOnAccent}
   - Borders: ${colors.border}
3. Use ONLY these fonts:
   - Headings (h1-h6, nav brand): ${fonts.heading}
   - Body text (p, span, li, button text): ${fonts.body}
4. Use ONLY these border-radius values:
   - Small elements (badges, tags, small inputs): ${radius.sm}px
   - Medium elements (buttons, cards, inputs): ${radius.md}px
   - Large elements (hero sections, large cards, modals): ${radius.lg}px
5. Use ONLY these padding values:
   - Small containers (card inner padding, small sections): ${spacing.sm}px
   - Medium containers (cards, content sections): ${spacing.md}px
   - Large containers (hero sections, major page sections): ${spacing.lg}px
6. Use this gap between flex children: ${spacing.gap}px
7. Use these box-shadows:
   - On buttons and small elements: ${shadows.sm}
   - On cards and larger containers: ${shadows.md}
8. Use these font sizes:
   - h1 headings: ${fontSizes.h1}px
   - h2 headings: ${fontSizes.h2}px
   - Body text, paragraphs, button text: ${fontSizes.body}px
9. Return ONLY raw HTML. No markdown fences, no explanation, no comments.
10. Use display:flex for all layouts. Use flex-direction, gap, padding, align-items, justify-content.
11. Every visible element MUST have inline style with background-color OR color set to one of the palette colors above.
12. Use realistic content - real names, real descriptions, real numbers.
13. Include these sections: nav bar, hero section, features/cards section (3 cards), CTA banner, footer.
14. Use <img src="https://placehold.co/600x400/eeeeee/999999?text=Image" /> for images.
15. The root element should be a single <div> that wraps everything.
16. Set font-family on EVERY text element explicitly (headings get "${fonts.heading}", body gets "${fonts.body}").
17. ALWAYS set box-shadow on cards. ALWAYS set border-radius on buttons, cards, and sections.`

    const userMessage = `Create a landing page for: ${prompt}`

    const html = await generate(userMessage, [], {
      systemPrompt,
      temperature: 0.9,
      maxTokens: 8192,
    })

    // Strip markdown fences if AI adds them
    const cleaned = html
      .replace(/^```html?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()

    return NextResponse.json({ html: cleaned })
  } catch (error: any) {
    console.error('Test generate error:', error)
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    )
  }
}
