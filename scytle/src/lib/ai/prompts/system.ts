// ============================================================
// Shared System Rules
// Every generation call prepends these rules.
// Inspired by v0's constrained output, Claude Artifacts' XML
// structure, and Stitch's DESIGN.md approach.
// ============================================================

export const SHARED_OUTPUT_RULES = `OUTPUT RULES (STRICT — violating these breaks rendering):
1. Return ONLY raw HTML. No markdown fences, no backticks, no explanation, no comments.
2. Use Tailwind CSS utility classes exclusively. No <style> blocks, no inline CSS properties.
3. NO arbitrary Tailwind values for colors — use standard Tailwind color classes (bg-blue-600, text-gray-900) OR hex via bg-[#hex] ONLY for the theme colors provided.
4. All images: <img src="UNSPLASH_URL" alt="descriptive alt text" class="w-full h-auto object-cover">
5. No position:fixed/sticky. No margin on root. No max-w-* on root section.
6. All text must be realistic placeholder content — NEVER "Lorem ipsum" or "placeholder text".
7. Use semantic HTML: <section>, <header>, <nav>, <article>, <footer>.
8. NO responsive prefixes (no sm:, md:, lg:, hover:, focus:, dark:). Design for exactly one viewport.
9. NO <script> tags. No inline event handlers. No JavaScript.
10. Every element with children MUST have flex or grid + gap classes.

PARSER CONSTRAINTS (the HTML is parsed into a design canvas, NOT a browser):
- NO margins (no m-*, mx-*, my-*, mt-*, mb-*, ml-*, mr-*, mx-auto). Use padding + gap instead.
- NO max-w-* constraints. Use w-full or fixed w-[Npx] widths.
- NO space-x-*, space-y-*, divide-*, ring-*, backdrop-blur-*.
- NO hover:*, focus:*, transition-*, animate-*, transform, rotate-*, translate-*, scale-*.
- NO position: absolute/relative/fixed — all elements flow in normal flex/grid layout.
- NO overflow:auto/scroll. Partial borders (border-t) render as full borders — use <hr> or thin divs instead.
- For centering: use items-center/justify-center on the parent flex, NOT mx-auto.
- For section spacing: use gap on the parent. Example: <div class="flex flex-col gap-0">.`

export const ANTI_SLOP_RULES = `ANTI-SLOP RULES (avoid generic AI output):
- Never use "Unlock", "Elevate", "Supercharge", "Revolutionize", "Unleash" in headlines.
- Never use "Trusted by 10,000+ companies" — use specific, believable numbers.
- Never start with "Welcome to [Product Name]" — start with the value proposition.
- Vary button text: not every CTA should say "Get Started". Use specific actions.
- No purple-blue gradient on everything. Use the provided color palette intentionally.
- No centered-everything layouts unless the archetype calls for it.
- Headlines should be specific and punchy, not generic marketing speak.
- Design like a $50k agency project, not a template generator.`

export const TYPOGRAPHY_RULES = `TYPOGRAPHY HIERARCHY:
- h1: text-5xl or text-6xl font-bold tracking-tight leading-tight
- h2: text-3xl or text-4xl font-semibold leading-snug
- h3: text-xl or text-2xl font-semibold
- Body: text-base or text-lg leading-relaxed
- Small/labels: text-sm text-gray-500
- Use font-bold for headlines, font-medium for buttons, font-normal for body.
- Create visual hierarchy through scale contrast: pair text-6xl headlines with text-base body.`

export const CONTENT_RULES = `CONTENT RICHNESS (MANDATORY):
- Use realistic, specific content that matches the product being designed.
- Names: "Sarah Chen", "Marcus Rivera", "Emma Thompson" — never "John Doe".
- Numbers: "$12,450", "2,847 users", "98.5% uptime", "+12.3%".
- Dates: "March 12, 2026", "2 hours ago", "Updated Jan 8".
- For e-commerce: real product names, prices ($29.99), star ratings, review counts.
- For listings: at least 4-6 items with varied details (not identical cards).
- Status badges: colored pills with text — <span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>
- Avatars: <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-semibold">SC</div>
- SVG icons: use <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> with simple paths.`

/**
 * Build the full shared system context that's prepended to every section generation.
 */
export function getSharedSystemRules(): string {
    return [SHARED_OUTPUT_RULES, ANTI_SLOP_RULES, TYPOGRAPHY_RULES, CONTENT_RULES].join('\n\n')
}
