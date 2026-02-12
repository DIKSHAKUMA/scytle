# Scytle — AI Product Studio

Idea → Sitemap → Wireframe → Design → Code. UI: chat sidebar (1/3) + canvas workspace (2/3) with tab switcher (Sitemap, Wireframe, Design, Code).

## Quick Reference

**Stack**: Next.js 16 · React 19 (compiler enabled) · TypeScript strict · Tailwind CSS 4 (CSS-based config, oklch colors) · Zustand 5 + immer · Appwrite (auth/DB) · Vertex AI Gemini (`@google-cloud/vertexai`) · ReactFlow (`@xyflow/react`) · Zod 4 · Radix/shadcn · dnd-kit

```bash
cd scytle && npm run dev   # localhost:3000
npm run build              # strict TS check + production build
npm run lint               # eslint
```

## Architecture & Key Directories

- `src/app/api/` — JWT-authenticated API routes. Pattern: `getUserFromJWT()` → Zod `.safeParse()` → verify ownership → process. **Canonical example**: `src/app/api/chat/route.ts`.
  - AI sub-routes under `api/ai/` (generate-sitemap, generate-copy, generate-page, rewrite-text, suggest-section)
  - CRUD under `api/projects/`, streaming chat under `api/chat/`, wireframe under `api/wireframe/`
- `src/store/` — 6 Zustand+immer stores barrel-exported from `index.ts`: `useAuthStore`, `useProjectStore`, `useChatStore`, `useCanvasStore`, `useSitemapStore`, `useUnifiedStore`. **`unified-store.ts`** (~1800 LOC) is the single source of truth for pages/sections shared by sitemap and wireframe views (includes undo/redo history, autosave, ReactFlow state).
- `src/lib/ai/` — Vertex AI client (`client.ts`): `generate()`, `generateStream()`, `createStreamResponse()` with model fallback chain (`gemini-2.0-flash` → `gemini-2.5-flash` → `gemini-2.5-pro`) and exponential backoff retry. Config in `config.ts`, prompts in `prompts/`.
- `src/lib/designs/` — Two-tier design system with 15 section categories (hero, cta, navbar, footer, features, testimonials, pricing, faq, contact, content, gallery, team, blog, stats, logos). `TemplateFamily` (parametric Canvas component + `controlsDef`) → `DesignPreset` (frozen control snapshot). Each category dir exports `*Families` + `*Presets`, aggregated in `registry.ts`.
- `src/lib/appwrite.ts` — Client SDK (`'use client'`): auth, `createJWT()`. `appwrite-server.ts` — Server SDK (`node-appwrite`): `createAdminClient()`, `getUserFromJWT()`, CRUD helpers. Collections: `USERS`, `PROJECTS`, `PAGES`, `SECTIONS`, `STYLE_GUIDES`, `RESEARCH_DATA`, `AI_CONVERSATIONS`.
- `src/types/index.ts` — **All** Zod schemas + `z.infer<>` TS types. Add new types here, never in component files.
- `src/lib/utils.ts` — `cn()` (clsx + twMerge), `formatDate()`, `formatRelativeTime()`, `generateId()`, `debounce()`, `throttle()`.
- `src/components/ui/` — shadcn primitives (button, dialog, tabs, select, etc.) using `cva` + `cn()`.
- `src/components/{canvas,chat,wireframe}/` — Feature components with `index.ts` barrel exports.

## Patterns (follow these exactly)

### API Routes
```typescript
import { getUserFromJWT, createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// 1. Auth: getUserFromJWT(request.headers.get('Authorization'))
// 2. Validate: SomeSchema.safeParse(body) → return 400 with validation.error.issues
// 3. Ownership: databases.getDocument → check project.userId === user.$id
// 4. Process
```

### Stores
```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
export const useFooStore = create<FooState>()(immer((set, get) => ({ ... })))
// Some stores also use `persist` and/or `devtools` middleware (wrapped inside immer)
// API calls use authFetch() — creates JWT via createJWT(), sets Authorization: Bearer header
```

### Types
```typescript
import { z } from 'zod'
export const FooSchema = z.object({ ... })
export type Foo = z.infer<typeof FooSchema>
```

### AI Streaming
API routes return SSE via `createStreamResponse(generateStream(...))`. Client consumes with `EventSource` + `data:` line parsing.

### Appwrite Auth
Middleware is pass-through only (`src/middleware.ts`). Appwrite uses localStorage, not cookies — auth is entirely client-side. Server routes authenticate via JWT in `Authorization` header.

## Conventions

- **TypeScript**: Strict mode, no `any`. `@/` absolute imports (maps to `src/`).
- **React**: `'use client'` only when hooks/stores/event handlers are used. Default = server component. React Compiler is enabled in `next.config.ts`.
- **CSS**: Tailwind v4 with CSS-based config in `globals.css` (no `tailwind.config.ts`). oklch color space. Three font families: Inter (sans), JetBrains Mono (mono), Bricolage Grotesque (display).
- **Files**: PascalCase components, kebab-case utilities, UPPER_SNAKE_CASE constants.
- **Logging**: Emoji prefixes: 🤖 AI, 📦 Project, ✅ Success, ❌ Error, ⚠️ Warning, 🔄 State, 🔐 Auth.
- **Env vars**: Vertex AI uses `GOOGLE_CLOUD_PROJECT` + ADC (not API key). Appwrite needs `NEXT_PUBLIC_APPWRITE_ENDPOINT`, `NEXT_PUBLIC_APPWRITE_PROJECT_ID` (client) and `APPWRITE_API_KEY` (server).

### Adding a New Design Section Category
1. Create `src/lib/designs/{category}/` with `families/`, `presets.tsx`, and `index.ts`
2. `TemplateFamily`: define `Canvas` component (receives `CanvasProps`), `controlsDef`, `defaultControls`, `defaultContent`
3. `DesignPreset`: frozen control snapshot with `Thumbnail` component
4. Register in `src/lib/designs/registry.ts` — add to `FAMILY_REGISTRY` and `PRESET_REGISTRY`

## Key Specs (in `docs/`)
`SCYTLE-BUILD-PHASES.md` (roadmap) · `SITEMAP-RELUME-SPEC.md` (sitemap gen) · `WIREFRAME-SPEC.md` · `WIREFRAME-DEVELOPMENT-PLAN.md` · `SCYTLE-UX-FLOW.md` · `DESIGN-SYSTEM-MIGRATION.md`

## General Rules
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- Generate complete runnable code, no `// TODO` placeholders.
- Read source of deps before concluding on errors — aim for high-confidence root cause.
- Never `git stash`/branch-switch without explicit request.
