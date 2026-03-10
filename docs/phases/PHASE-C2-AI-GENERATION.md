# Phase C2 — AI Page Generation

> **Status**: 🔲 Not started
> **Priority**: Critical — generates the designs that the parser converts
> **Dependencies**: C1 (parser must exist to process AI output)
> **Estimated LOC**: ~500-800

## Purpose

API route that takes a user prompt + context (product type, style guide, sitemap page info) and returns a complete HTML+Tailwind page design. The AI generates a full, unique page — not template fills.

## Architecture

```
Client                            Server (API Route)
  │                                    │
  ├─ POST /api/ai/generate-page ──────┤
  │   { prompt, pageInfo,             │
  │     styleGuide, productType }     │
  │                                    ├── Build system prompt
  │                                    ├── Call Vertex AI (Gemini)
  │                                    ├── Stream SSE response
  │◄── SSE: data: <partial html>... ──┤
  │◄── SSE: data: [DONE] ────────────┤
  │                                    │
  ├─ parseHtmlToNodes(fullHtml) ──────┤ (client-side)
  ├─ editorStore.setNodes(nodes) ─────┤ (client-side)
```

## API Route

### Endpoint: `POST /api/ai/generate-page`

```typescript
// src/app/api/ai/generate-page/route.ts

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface GeneratePageRequest {
    prompt: string                    // User's description
    productType: 'web' | 'app'       // Website or application
    pageName: string                  // "Home", "Dashboard", "Pricing"
    pageDescription?: string          // From sitemap node
    sitemapContext?: {                 // Other pages for navigation context
        pages: { name: string; path: string }[]
    }
    styleGuide?: {                    // Theme preferences
        primaryColor: string
        backgroundColor: string
        textColor: string
        accentColor: string
        headingFont: string
        bodyFont: string
        borderRadius: number
        buttonStyle: 'solid' | 'outline' | 'ghost' | 'pill'
        cardStyle: 'bordered' | 'shadow' | 'flat'
    }
    attachments?: string[]            // Base64 reference images (future)
    existingHtml?: string             // For iteration — current page HTML to modify
    editInstruction?: string          // "Make the hero bigger" — for chat refinement
}
```

### Response: Server-Sent Events (SSE)

```
data: <section class="flex flex-col items-center
data:  py-20 px-8 bg-white">
data:   <h1 class="text-5xl font-bold
data: [DONE]
```

Client collects all `data:` chunks, joins into full HTML, then passes to `parseHtmlToNodes()`.

## System Prompt Architecture

### Base System Prompt

The system prompt instructs Gemini to:
1. Output ONLY valid HTML with Tailwind CSS classes
2. Use semantic HTML elements (`<section>`, `<nav>`, `<header>`, `<footer>`)
3. Design for **desktop-first** (1440px viewport)
4. Use the provided style guide colors/fonts
5. Create realistic content (not Lorem Ipsum)
6. Include proper image placeholders with descriptive `alt` text
7. Structure the page as a series of `<section>` elements inside a root `<div>`

### Prompt Template Structure

```typescript
function buildSystemPrompt(req: GeneratePageRequest): string {
    return `
You are a world-class web designer. Generate a complete HTML page using Tailwind CSS classes.

RULES:
- Output ONLY the HTML. No markdown, no code fences, no explanations.
- Use Tailwind CSS utility classes for ALL styling.
- Design for a ${req.productType === 'web' ? 'website' : 'web application'}.
- Desktop-first layout (1440px width).
- Use semantic HTML: <section>, <nav>, <header>, <footer>, <main>.
- Write realistic copy — no "Lorem ipsum".
- For images, use <img src="/placeholder-{description}.jpg" alt="descriptive alt text" />.
- Wrap the entire page in a single <div> root.

${req.styleGuide ? `
STYLE GUIDE:
- Primary color: ${req.styleGuide.primaryColor}
- Background: ${req.styleGuide.backgroundColor}
- Text color: ${req.styleGuide.textColor}
- Accent: ${req.styleGuide.accentColor}
- Heading font: ${req.styleGuide.headingFont}
- Body font: ${req.styleGuide.bodyFont}
- Border radius: ${req.styleGuide.borderRadius}px
- Button style: ${req.styleGuide.buttonStyle}
- Card style: ${req.styleGuide.cardStyle}
Use these colors as Tailwind arbitrary values like bg-[${req.styleGuide.primaryColor}].
` : ''}

${req.sitemapContext ? `
NAVIGATION CONTEXT:
This website has these pages: ${req.sitemapContext.pages.map(p => p.name).join(', ')}.
Include appropriate navigation links.
` : ''}

PAGE TO DESIGN: "${req.pageName}"
${req.pageDescription ? `Description: ${req.pageDescription}` : ''}
`
}
```

### Edit/Iteration Prompt

For chat-based refinement (C5), the system prompt includes the existing HTML:

```typescript
function buildEditPrompt(req: GeneratePageRequest): string {
    return `
You are editing an existing HTML page. The user wants changes.

CURRENT HTML:
${req.existingHtml}

EDIT INSTRUCTION: "${req.editInstruction}"

RULES:
- Output the COMPLETE modified HTML (not a diff).
- Keep all existing structure unless the edit specifically changes it.
- Apply the requested changes precisely.
- Output ONLY the HTML. No markdown, no explanations.
`
}
```

## Model Selection

Uses the existing AI client with fallback chain:

```typescript
// src/lib/ai/client.ts — existing
// gemini-2.0-flash (fast) → gemini-2.5-flash (balanced) → gemini-2.5-pro (powerful)

// For initial generation: use 2.5-flash (needs creativity + speed)
// For iteration/edits: use 2.0-flash (simpler changes, faster response)
// For complex multi-section pages: use 2.5-pro (best quality)
```

## File Structure

```
src/app/api/ai/generate-page/
  route.ts                    ← POST handler with SSE streaming

src/lib/ai/prompts/
  page-generation.ts          ← System prompt builder
  page-edit.ts                ← Edit/iteration prompt builder

src/lib/ai/
  client.ts                   ← (existing) Vertex AI client
  config.ts                   ← (existing) Model config
```

## Client-Side Integration

```typescript
// In workspace component or chat handler:

async function generatePage(prompt: string, pageInfo: PageInfo) {
    const response = await authFetch('/api/ai/generate-page', {
        method: 'POST',
        body: JSON.stringify({
            prompt,
            productType: 'web',
            pageName: pageInfo.name,
            pageDescription: pageInfo.description,
            styleGuide: themeStore.getActiveTheme(),
        }),
    })

    // Collect SSE stream
    const html = await collectStream(response)

    // Parse to nodes
    const nodes = parseHtmlToNodes(html)

    // Place on canvas as a page frame
    const pageFrame = createFrame({
        name: pageInfo.name,
        width: 1440,
        height: estimateHeight(nodes),
        x: pageInfo.canvasX,
        y: pageInfo.canvasY,
        children: nodes,
        layout: { mode: 'flex', direction: 'column' },
    })

    editorStore.getState().addNode(pageFrame)
}
```

## What the AI Outputs (Examples)

### Website Landing Page
```html
<div>
  <nav class="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 bg-blue-600 rounded-lg"></div>
      <span class="text-xl font-bold text-gray-900">FreelanceHub</span>
    </div>
    <div class="flex items-center gap-8">
      <a class="text-sm text-gray-600 hover:text-gray-900" href="/features">Features</a>
      <a class="text-sm text-gray-600 hover:text-gray-900" href="/pricing">Pricing</a>
      <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">Get Started</button>
    </div>
  </nav>
  <section class="flex flex-col items-center text-center py-24 px-8 bg-gradient-to-b from-blue-50 to-white">
    <h1 class="text-6xl font-bold text-gray-900 max-w-3xl">Manage your freelance business in one place</h1>
    <p class="mt-6 text-xl text-gray-600 max-w-2xl">Track time, send invoices, and manage clients — all from a single dashboard.</p>
    <div class="flex gap-4 mt-10">
      <button class="px-8 py-3 text-base font-medium text-white bg-blue-600 rounded-lg">Start Free Trial</button>
      <button class="px-8 py-3 text-base font-medium text-gray-700 border border-gray-300 rounded-lg">Watch Demo</button>
    </div>
  </section>
  <!-- ... more sections ... -->
</div>
```

### Dashboard App Screen
```html
<div class="flex h-screen bg-gray-50">
  <aside class="w-64 bg-gray-900 text-white flex flex-col">
    <div class="px-6 py-5 border-b border-gray-800">
      <span class="text-lg font-bold">ProjectHub</span>
    </div>
    <nav class="flex flex-col gap-1 p-3 mt-2">
      <a class="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 text-sm">Dashboard</a>
      <a class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 text-sm">Projects</a>
      <!-- ... -->
    </nav>
  </aside>
  <main class="flex-1 flex flex-col overflow-auto">
    <header class="flex items-center justify-between px-8 py-4 bg-white border-b">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
    </header>
    <div class="p-8 grid grid-cols-4 gap-6">
      <!-- Stat cards, charts, tables ... -->
    </div>
  </main>
</div>
```

## Guardrails

1. **Output validation**: Verify the AI output is valid HTML before passing to parser
2. **Size limits**: Cap output at ~50KB — reject if AI outputs a novel
3. **No script tags**: Strip `<script>` and event handlers for security
4. **Rate limiting**: Max 10 generations per minute per user
5. **Fallback**: If AI fails after all model retries, show "Generation failed — try again" with the error

## Future Enhancements

- **Reference image analysis**: Attach screenshots → AI uses vision to mimic the design
- **Component library**: AI reuses project-specific components defined by the user
- **Multi-page consistency**: Feed AI the first generated page as context for subsequent pages
- **Responsive variants**: Generate mobile + tablet HTML in the same response
