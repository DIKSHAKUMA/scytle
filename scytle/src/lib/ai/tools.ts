/**
 * AI Tool Definitions — Scytle
 *
 * These are the "hands" the AI uses to interact with the canvas + theme.
 *
 * ARCHITECTURE:
 *   - Tools execute on the SERVER (in streamText within route.ts)
 *   - Canvas/theme tools return structured data as results
 *   - The CLIENT (chat-panel.tsx) intercepts tool results via onToolCall
 *     and applies them to Zustand stores (editor-store, style-guide-store)
 *   - Server-side tools (searchImages) execute fully on the server
 *
 * IMPORTANT: AI SDK v6 uses `inputSchema` not `parameters` in tool().
 */

import { tool } from 'ai'
import { z } from 'zod'
import { searchImages as unsplashSearch } from '@/lib/ai/unsplash'

// ═══════════════════════════════════════════════════════════
// Tool: UPDATE THEME — AI decides the full visual identity
// ═══════════════════════════════════════════════════════════
//
// Flow: AI calls updateTheme → returns theme params as result
//       → client onToolCall picks up result → writes to useStyleGuideStore
//       → theme tab updates live → variableTable recalculates
//       → AI generates HTML using exact hex values
//       → parser matches hex → stores as variable refs
//       → user changes color in theme tab → all nodes update
//
export const updateTheme = tool({
  description: `Set the full visual identity for the design. Call this FIRST before generating any HTML.
This writes directly to the theme panel — the user will see colors, fonts, and styles update live.
All generated HTML must use the exact hex values you set here. The parser links them to theme variables,
so if the user later changes a color in the theme panel, all nodes update automatically.

Choose colors contextually:
- Fitness → warm oranges/reds, energetic
- Legal → navy/gold, trustworthy
- Kids → bright candy colors, playful
- Luxury → muted blacks, gold, elegant serifs
- Tech → clean blues/teals, modern sans-serif
Never use generic defaults. Every project deserves unique colors.`,
  inputSchema: z.object({
    mode: z.enum(['light', 'dark']).describe('Light or dark mode'),
    bgPrimary: z.string().describe('Main background. Use warm whites (#FAFAF8) or deep darks (#0A0A0F), never pure #fff/#000'),
    bgSecondary: z.string().describe('Alternate section background for visual rhythm'),
    textPrimary: z.string().describe('Main text color. Warm darks (#1A1A1A) or soft whites (#F5F5F5)'),
    textSecondary: z.string().describe('Secondary text for descriptions and captions'),
    textMuted: z.string().describe('Muted text for timestamps and meta'),
    accent: z.string().describe('Primary accent — the ONE bold color defining the brand'),
    accentName: z.string().describe('Human name: "Coral", "Electric Blue", "Forest Green"'),
    textOnAccent: z.string().describe('Text on accent backgrounds, usually #ffffff or #000000'),
    border: z.string().describe('Border/divider color, subtle'),
    headingFont: z.string().describe('Heading font from Google Fonts: "Raleway", "Space Grotesk", etc.'),
    bodyFont: z.string().describe('Body font from Google Fonts: "Inter", "DM Sans", etc.'),
    headingWeight: z.enum(['400', '500', '600', '700', '800']),
    bodyWeight: z.enum(['300', '400', '500']),
    sizeScale: z.enum(['0.875', '1', '1.125']).describe('Font size multiplier'),
    buttonStyle: z.enum(['solid', 'outline', 'ghost', 'brick', 'gradient']),
    buttonRadius: z.enum(['0', '4', '8', '12', '9999']),
    cardStyle: z.enum(['default', 'outlined', 'flat']),
    cardRadius: z.enum(['0', '4', '8', '12', '9999']),
    imageRadius: z.enum(['0', '4', '8', '12', '9999']),
    accent2: z.string().optional().describe('Optional secondary accent'),
    accent2Name: z.string().optional(),
    direction: z.string().describe('One sentence visual direction: "Dark editorial with warm orange energy"'),
  }),
  execute: async (params) => {
    // Returns theme data — client applies to useStyleGuideStore
    return {
      success: true,
      action: 'updateTheme' as const,
      message: `Theme set: ${params.mode} mode, accent ${params.accent} (${params.accentName}), ${params.headingFont}/${params.bodyFont}`,
      theme: params,
    }
  },
})

// ═══════════════════════════════════════════════════════════
// Tool: READ CURRENT THEME
// ═══════════════════════════════════════════════════════════
export const getThemeContext = tool({
  description: `Read the current theme from the theme panel. Call ONLY when:
- User says "use my current theme" or "keep the current colors"
- Editing an existing design (don't overwrite user's choices)
Do NOT call for new designs — use updateTheme instead.`,
  inputSchema: z.object({}),
  execute: async () => {
    // Returns marker — client reads from useStyleGuideStore and returns data
    return {
      action: 'getThemeContext' as const,
      message: 'Reading theme from store...',
    }
  },
})

// ═══════════════════════════════════════════════════════════
// Tool: GENERATE SECTION — Write HTML to canvas
// ═══════════════════════════════════════════════════════════
export const generateSection = tool({
  description: `Generate HTML+Tailwind for ONE visual section and add it to the canvas.
Call once per section: nav, hero, features, stats, testimonials, pricing, cta, footer.
CRITICAL: Use the EXACT hex color values from your updateTheme call.
The parser links these values to theme variables for live editing later.`,
  inputSchema: z.object({
    sectionType: z.string().describe('Section type: "nav", "hero", "features", "stats", "cta", "footer", etc.'),
    html: z.string().describe('Complete HTML+Tailwind. Use exact hex colors from updateTheme. Include inline font-family styles.'),
    parentNodeId: z.string().default('root').describe('Canvas node ID to append to. Use "root" for top-level.'),
  }),
  execute: async ({ sectionType, html, parentNodeId }) => {
    // Returns HTML — client parses via iframe and adds to editor-store
    return {
      action: 'generateSection' as const,
      sectionType,
      html,
      parentNodeId,
    }
  },
})

// ═══════════════════════════════════════════════════════════
// Tool: EDIT NODE — Replace existing node HTML
// ═══════════════════════════════════════════════════════════
export const editNode = tool({
  description: 'Replace the HTML of an existing canvas node. Use for refinements and fixes. Keep the same theme colors.',
  inputSchema: z.object({
    nodeId: z.string().describe('ID of the node to replace'),
    html: z.string().describe('New HTML+Tailwind for this node'),
    reason: z.string().describe('Brief explanation: "Increased heading size", "Fixed spacing"'),
  }),
  execute: async ({ nodeId, html, reason }) => {
    // Returns HTML + nodeId — client parses and replaces
    return {
      action: 'editNode' as const,
      nodeId,
      html,
      reason,
    }
  },
})

// ═══════════════════════════════════════════════════════════
// Tool: TAKE SCREENSHOT — AI sees the canvas
// ═══════════════════════════════════════════════════════════
export const takeScreenshot = tool({
  description: `Take a screenshot of the canvas to verify the design visually.
Call this every 2-3 sections. Check: spacing, typography, contrast, alignment, clipping.
IMPORTANT: Use this regularly to catch issues early.`,
  inputSchema: z.object({
    nodeId: z.string().optional().describe('Specific node to screenshot, or omit for full canvas'),
  }),
  execute: async ({ nodeId }) => {
    // Returns marker — client captures screenshot and returns base64
    return {
      action: 'takeScreenshot' as const,
      nodeId,
      message: 'Capturing screenshot...',
    }
  },
})

// ═══════════════════════════════════════════════════════════
// Tool: GET CANVAS STATE — Read current nodes
// ═══════════════════════════════════════════════════════════
export const getCanvasState = tool({
  description: 'Read the current canvas node tree. Use before editing existing designs to understand what exists.',
  inputSchema: z.object({}),
  execute: async () => {
    // Returns marker — client reads from editor-store
    return {
      action: 'getCanvasState' as const,
      message: 'Reading canvas state...',
    }
  },
})

// ═══════════════════════════════════════════════════════════
// Tool: SEARCH IMAGES — Unsplash (fully server-side)
// ═══════════════════════════════════════════════════════════
export const searchImages = tool({
  description: 'Search Unsplash for a relevant photo. Returns a URL for img tags.',
  inputSchema: z.object({
    query: z.string().describe('Search: "aerial office", "woman laptop", "sushi platter"'),
    count: z.number().default(1).describe('Number of images to return'),
  }),
  execute: async ({ query, count }) => {
    // This executes fully server-side — Unsplash API
    const images = await unsplashSearch(query, { count: count || 1 })
    if (images.length === 0) {
      return {
        action: 'searchImages' as const,
        query,
        images: [],
        message: 'No images found. Use a placeholder or SVG icon instead.',
      }
    }
    return {
      action: 'searchImages' as const,
      query,
      images: images.map(img => ({
        url: img.url,
        alt: img.alt,
        credit: img.credit,
      })),
    }
  },
})

// ═══════════════════════════════════════════════════════════
// Tool: PLAN PAGES — Multi-page structure
// ═══════════════════════════════════════════════════════════
export const planPages = tool({
  description: 'Plan the structure of a multi-page website or app. Returns page names and section breakdown.',
  inputSchema: z.object({
    productDescription: z.string(),
    productType: z.enum(['web', 'app']).default('web'),
    pageCount: z.number().min(1).max(8).default(3),
  }),
  execute: async ({ productDescription, productType, pageCount }) => {
    // This is purely informational — AI uses the result to guide generation
    return {
      action: 'planPages' as const,
      productDescription,
      productType,
      pageCount,
      message: `Plan ${pageCount} ${productType} pages for: ${productDescription}`,
    }
  },
})

// ─── Export all tools ────────────────────────────────────────────
export const ALL_TOOLS = {
  updateTheme,
  getThemeContext,
  generateSection,
  editNode,
  takeScreenshot,
  getCanvasState,
  searchImages,
  planPages,
} as const
