# Multi-Project Workspace

Two projects share this repo. **Always `cd` into the correct directory before running commands.**

## Scytle (`scytle/`) — AI Product Studio

Idea → Sitemap → Wireframe → Design → Code. UI: chat sidebar (1/3) + canvas workspace (2/3) with tab switcher (Sitemap, Wireframe, Design, Code).

**Stack**: Next.js 16 · React 19 · TypeScript strict · Tailwind CSS 4 · Zustand+immer · Appwrite (auth/DB) · Vertex AI Gemini (`@google-cloud/vertexai`) · ReactFlow (`@xyflow/react`) · Zod · Radix/shadcn

```bash
cd scytle && npm run dev   # localhost:3000
npm run build              # strict TS check + production build
```

### Key directories

- `src/app/api/` — JWT-authenticated routes. Every route: `getUserFromJWT()` → Zod `.safeParse()` → verify ownership → process. Canonical example: `src/app/api/chat/route.ts`.
- `src/store/` — Zustand + immer stores, barrel-exported from `index.ts`. **`unified-store.ts`** is the single source of truth for pages/sections shared by sitemap and wireframe views.
- `src/lib/ai/` — Vertex AI client (`client.ts`): `generate()`, `generateStream()`, `createStreamResponse()` with model fallback chain (fast→balanced→powerful) and retry logic. Config/prompts in `config.ts` and `prompts/`.
- `src/lib/designs/` — Two-tier design system: `TemplateFamily` (parametric Canvas component + controls) → `DesignPreset` (frozen control snapshots). Each category (`hero/`, `pricing/`, etc.) registers families + presets in `registry.ts`.
- `src/lib/appwrite.ts` — Client SDK (`'use client'`): auth, `createJWT()`. `appwrite-server.ts` — Server SDK (node-appwrite): `createAdminClient()`, `getUserFromJWT()`, CRUD helpers.
- `src/types/index.ts` — All Zod schemas + inferred TS types. Add new types here, never in component files.

### Patterns to follow

- **API routes**: Always `export const runtime = 'nodejs'` and `export const dynamic = 'force-dynamic'`. Auth → Validate → Ownership check → Process.
- **Stores**: `create<State>()(immer((set, get) => ({ ... })))`. Use `authFetch()` helper (creates JWT, adds `Authorization` header) for API calls from stores.
- **Streaming AI**: API returns SSE via `createStreamResponse()`. Client consumes with `EventSource` pattern.
- **Middleware**: Pass-through only (`src/middleware.ts`). Appwrite uses localStorage, not cookies — auth is client-side.
- **Logging**: Emoji prefixes: 🤖 AI, 📦 Project, ✅ Success, ❌ Error, ⚠️ Warning, 🔄 State.
- **Env vars**: Vertex AI uses `GOOGLE_CLOUD_PROJECT` + ADC (not API key). Appwrite needs both `NEXT_PUBLIC_*` (client) and `APPWRITE_API_KEY` (server).

### Conventions

- Strict TypeScript, no `any`. Zod schemas for all API I/O. `@/` absolute imports.
- `'use client'` only when hooks/stores/event handlers are used. Default = server component.
- UI components: `src/components/ui/` (shadcn pattern with `cn()` from `src/lib/utils.ts`).
- Feature components: `src/components/{feature}/` with `index.ts` barrel export.
- Files: PascalCase components, kebab-case utilities, UPPER_SNAKE_CASE constants.

### Key specs (in `docs/`)

`SCYTLE-BUILD-PHASES.md` (roadmap) · `SITEMAP-RELUME-SPEC.md` (sitemap gen) · `WIREFRAME-SPEC.md` · `SCYTLE-UX-FLOW.md`

---

## OpenClaw (`openclaw/`) — AI Messaging Gateway CLI

Bridges AI agents to WhatsApp, Telegram, Discord, Slack, Signal, iMessage, etc.

```bash
cd openclaw && pnpm install   # Node 22+
pnpm build                    # tsc
pnpm lint                     # Oxlint
pnpm test                     # Vitest (70% coverage)
```

### Architecture

- `src/` — Core: CLI (`cli/`, `commands/`), gateway server (`gateway/`), channel impls (`telegram/`, `discord/`, `slack/`, `signal/`, `imessage/`, `web/`), plugin loader (`plugins/`).
- `extensions/` — Workspace packages for additional channels (msteams, matrix, whatsapp, etc.). Keep deps in each extension's `package.json`. Use `devDependencies`/`peerDependencies` for `openclaw`, never `workspace:*` in `dependencies`.
- `apps/` — Native apps (iOS, macOS, Android).
- TypeScript ESM, strict. Oxlint + Oxfmt. Files < 700 LOC.
- Colocated tests (`*.test.ts`); e2e in `*.e2e.test.ts`.

### Safety rules

- Never `git stash`/branch-switch without explicit request. Use `scripts/committer` for commits.
- Never send streaming/partial replies to external messaging platforms.
- Never edit `node_modules`, update Carbon dep, or patch deps without approval.
- `git pull --rebase` before push. Scope commits to your changes only.

---

## Shared

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- Generate complete runnable code, no `// TODO` placeholders.
- Read source of deps before concluding on errors — aim for high-confidence root cause.
