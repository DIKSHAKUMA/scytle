import { NextRequest, NextResponse } from 'next/server'
import { generate } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { prompt, colors, fonts } = await req.json()

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
4. Return ONLY raw HTML. No markdown fences, no explanation, no comments.
5. Use display:flex for all layouts. Use flex-direction, gap, padding, align-items, justify-content.
6. Every visible element MUST have inline style with background-color OR color set to one of the palette colors above.
7. Use realistic content - real names, real descriptions, real numbers.
8. Include these sections: nav bar, hero section, features/cards section (3 cards), CTA banner, footer.
9. Use <img src="https://placehold.co/600x400/eeeeee/999999?text=Image" /> for images.
10. Keep it visually polished — use padding, border-radius, box-shadow where appropriate.
11. The root element should be a single <div> that wraps everything.
12. Set font-family on EVERY text element explicitly (headings get "${fonts.heading}", body gets "${fonts.body}").`

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
