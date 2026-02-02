# Scytle.ai Workspace - AI Agent Instructions

> **Multi-Project Workspace**: This repo contains two projects. Route to the correct one based on file paths.

---

## Project Routing

| Path | Project | Description |
|------|---------|-------------|
| `scytle/` | **Scytle** | Next.js 15 AI product studio |
| `openclaw/` | **OpenClaw** | CLI/gateway with messaging channels |
| `docs/` | Scytle docs | Build phases, UX flows |

**When working on OpenClaw**, also reference `openclaw/CLAUDE.md` and `openclaw/AGENTS.md` for project-specific conventions.

---

# Scytle (scytle/)

> **Architecture Philosophy**: Skills pattern for dynamic, context-aware AI assistance. Skills load on-demand from `.github/skills/`.

## Overview

**Scytle** is an AI-powered product studio: idea → research → design → code → deployment.

**Vision**: "From idea to live—with AI that thinks before it builds"

**Tech Stack**: 
- Frontend: Next.js 15, React 19, Tailwind CSS 4
- Backend: Next.js API Routes, Appwrite (BaaS)
- State: Zustand with immer
- Validation: Zod schemas
- AI: Gemini 2.0 Flash (primary), OpenRouter (fallback)
- Canvas: ReactFlow (sitemap), Monaco Editor (code)

---

## Architecture

```
scytle/
├── src/
│   ├── app/
│   │   ├── api/                    # JWT-authenticated endpoints
│   │   │   ├── chat/               # AI conversation streaming
│   │   │   ├── agents/             # Phase agents (Think, Research, etc.)
│   │   │   └── projects/[id]/      # Project CRUD + export/deploy
│   │   ├── app/
│   │   │   ├── dashboard/          # Project list
│   │   │   └── project/[id]/       # Main workspace
│   │   ├── login/                  # Auth pages
│   │   └── page.tsx                # Marketing landing page
│   ├── components/
│   │   ├── chat/                   # Chat sidebar (1/3 width)
│   │   ├── canvas/                 # Canvas workspace (2/3 width)
│   │   │   ├── views/              # Sitemap, Wireframe, Design, Code views
│   │   │   ├── top-bar.tsx         # Relume-style view switcher
│   │   │   └── bottom-toolbar.tsx  # Figma-style tools
│   │   └── ui/                     # Shadcn/ui components
│   ├── lib/
│   │   ├── agents/                 # AI agent system
│   │   │   ├── base-agent.ts       # Abstract agent class
│   │   │   ├── think-agent.ts      # Idea clarification
│   │   │   ├── research-agent.ts   # Competitor analysis
│   │   │   ├── flow-agent.ts       # Sitemap generation
│   │   │   └── design-agent.ts     # UI mockup generation
│   │   ├── ai/                     # AI utilities
│   │   │   ├── client.ts           # Unified AI client
│   │   │   ├── prompts/            # Phase-specific prompts
│   │   │   └── context-builder.ts  # Context management
│   │   ├── appwrite.ts             # Client auth
│   │   └── appwrite-server.ts      # Server auth + DB ops
│   └── store/
│       ├── auth-store.ts           # User session
│       ├── project-store.ts        # Current project state
│       ├── chat-store.ts           # Conversation history
│       └── canvas-store.ts         # View state, zoom, pan
└── docs/
    ├── SCYTLE-UX-FLOW.md          # Complete UX flow scenarios
    └── SCYTLE-BUILD-PHASES.md      # 8-phase build plan (295 tasks)
```

---

## Core Patterns

### 1. Skills-Based Architecture

**What are Skills?**
Skills are specialized instruction sets that load dynamically based on task context. Instead of bloating every request with all possible instructions, skills activate only when needed.

**When to Load Skills:**
- **Frontend work** → Load `frontend_aesthetics` skill
- **React/Next.js** → Load `react_best_practices` skill  
- **UI review** → Load `web_design_guidelines` skill
- **Component building** → Load `composition_patterns` skill
- **Scytle features** → Load `scytle_patterns` skill

**How Skills Work:**
1. Agent detects task type (e.g., "build a landing page")
2. Agent loads relevant skill(s) from `.github/skills/` directory
3. Skill instructions enhance agent's context for that task
4. After task completion, skill context is released

**Benefits:**
- No permanent context overhead
- Specialized guidance exactly when needed
- Reusable across projects
- Team-wide consistency

### 2. API Route Authentication

Every protected endpoint validates JWT:
```typescript
// app/api/chat/route.ts
const jwt = request.headers.get('Authorization')?.replace('Bearer ', '')
if (!jwt) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const user = await getUserFromJWT(jwt)
if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

const validation = ChatMessageSchema.safeParse(await request.json())
if (!validation.success) {
  return NextResponse.json({ error: validation.error }, { status: 400 })
}
```

### 3. Client → API Communication

Client components fetch JWT from Appwrite, then call API routes:
```typescript
import { account } from '@/lib/appwrite'

const session = await account.createJWT()
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.jwt}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ message, projectId })
})
```

### 4. AI Agent System

**Agent Architecture:**
```typescript
// lib/agents/base-agent.ts
abstract class Agent {
  abstract name: string
  abstract run(input: any, context: any): Promise<any>
  
  protected async callAI(prompt: string): Promise<string> {
    // OpenRouter → Gemini fallback chain
  }
  
  protected updateProgress(percent: number, message: string): void {
    // Stream progress to frontend via WebSocket/SSE
  }
}
```

**Available Agents:**
- `ThinkAgent`: Clarifies user idea, asks smart questions
- `ResearchAgent`: Scrapes web for competitors, finds gaps
- `DefineAgent`: Generates USP, personas, features
- `FlowAgent`: Creates sitemap structure
- `DesignAgent`: Generates style guide + mockups
- `BuildAgent`: Generates production-ready code

**Agent Flow:**
```
User types "dog walking app" 
  → ThinkAgent (2-3 questions)
  → ResearchAgent (scrape Rover, Wag)
  → FlowAgent (generate sitemap)
  → DesignAgent (3 variations)
  → BuildAgent (Next.js code)
```

### 5. Canvas + Chat Layout

**Interface Structure:**
```
┌──────────────────────────────────────────────────────────┐
│  SCYTLE          [project-name]         [@user] [⚙]     │
├────────────┬─────────────────────────────────────────────┤
│            │ TOP BAR: [Sitemap] [Wireframe] [Design]    │
│            │          [👨‍💻 Dev Mode]                       │
│  CHAT      ├─────────────────────────────────────────────┤
│  (1/3)     │         CANVAS WORKSPACE (2/3)              │
│            │                                             │
│  💬 AI     │  • Sitemap: ReactFlow editor                │
│  Messages  │  • Wireframe: Section blocks                │
│            │  • Design: Mockup gallery                   │
│  [Input]   │  • Dev Mode: Monaco code editor             │
│            │                                             │
│            ├─────────────────────────────────────────────┤
│            │ BOTTOM: [✋Hand] [➤Select] [⊕Add] [🔍Zoom] │
└────────────┴─────────────────────────────────────────────┘
```

**Key Features:**
- Chat sidebar always visible (conversations persist)
- Canvas updates automatically as AI works
- Top bar switches views (Relume-style tabs)
- Bottom toolbar has context-specific tools (Figma-style)
- No phase tracking visible to user (backend handles silently)

### 6. State Management Strategy

**Zustand Stores:**
```typescript
// store/auth-store.ts
interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// store/project-store.ts  
interface ProjectState {
  currentProject: Project | null
  projects: Project[]
  selectProject: (id: string) => Promise<void>
  createProject: (data: CreateProjectInput) => Promise<Project>
  updateProject: (id: string, data: Partial<Project>) => Promise<void>
}

// store/chat-store.ts
interface ChatState {
  messages: Message[]
  isTyping: boolean
  sendMessage: (content: string) => Promise<void>
  loadHistory: (projectId: string) => Promise<void>
}

// store/canvas-store.ts
interface CanvasState {
  activeView: 'sitemap' | 'wireframe' | 'design' | 'code'
  isDevelopmentMode: boolean
  zoomLevel: number
  setView: (view: CanvasView) => void
  zoom: (delta: number) => void
}
```

**State Principles:**
- Zustand for global state (user, projects, chat)
- URL state for shareable state (view mode, filters)
- React state for local UI (modals, forms, hover states)
- Optimistic updates for better UX
- Real-time sync with Appwrite subscriptions

---

## Database Schema (Appwrite)

**Collections:**
```typescript
// users
{
  userId: string          // Appwrite user ID
  email: string
  name: string
  plan: 'free' | 'maker' | 'pro' | 'agency'
  createdAt: string
}

// projects
{
  projectId: string
  userId: string          // Owner
  name: string
  description: string
  status: 'draft' | 'in-progress' | 'completed'
  createdAt: string
  updatedAt: string
}

// pages
{
  pageId: string
  projectId: string
  name: string            // "Home", "About", etc.
  slug: string            // "home", "about"
  parentId: string | null // For nested pages
  order: number           // Display order
  sections: string[]      // Array of section IDs
}

// sections
{
  sectionId: string
  pageId: string
  type: 'hero' | 'features' | 'testimonials' | 'cta' | ...
  content: JSON           // Section-specific data
  order: number
  config: JSON            // Layout, colors, etc.
}

// style_guides
{
  styleGuideId: string
  projectId: string
  colors: {
    primary: string
    secondary: string
    accent: string
    neutral: string[]
  }
  fonts: {
    heading: string
    body: string
  }
  spacing: number[]
  components: JSON        // Design tokens
}

// research_data
{
  researchId: string
  projectId: string
  competitors: Array<{
    name: string
    url: string
    features: string[]
    pricing: string
  }>
  insights: string[]
  opportunities: string[]
}

// ai_conversations
{
  conversationId: string
  projectId: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
  context: JSON           // Accumulated context
}
```

---

## Key Commands

```bash
# Development
npm run dev              # Start dev server on :3000
npm run build            # TypeScript strict build
npm run lint             # ESLint check
npm run type-check       # TypeScript validation

# Testing (future)
npm run test             # Jest unit tests
npm run test:e2e         # Playwright E2E tests

# Database
npm run db:push          # Sync Appwrite schema
npm run db:seed          # Seed sample data
```

---

## Conventions

### Code Style
- **TypeScript**: Strict mode, no `any` types
- **Components**: `PascalCase` for files and exports
- **Utilities**: `camelCase` for functions
- **Constants**: `UPPER_SNAKE_CASE`
- **CSS**: Use Tailwind classes, CSS variables for theme colors
- **Imports**: Absolute imports with `@/` alias

### File Organization
```
components/
  ├── feature-name/          # Feature-specific components
  │   ├── component-name.tsx
  │   └── index.ts           # Re-export
  └── ui/                    # Shared UI components (Shadcn)
```

### Logging
Use emoji prefixes for console logs:
- 🤖 AI operations
- 📦 Project operations  
- ✅ Success
- ❌ Error
- ⚠️ Warning
- 📊 Analytics

### Component Patterns
```typescript
// Prefer this:
export function ChatMessage({ message, isUser }: ChatMessageProps) {
  return (
    <div className={cn(
      "rounded-lg p-4",
      isUser ? "bg-primary text-white" : "bg-gray-100"
    )}>
      {message}
    </div>
  )
}

// Avoid this:
export function ChatMessage({ 
  message, 
  isPrimary, 
  isLarge, 
  hasIcon 
}: ChatMessageProps) {
  // Boolean prop explosion
}
```

---

## Anti-Patterns

❌ **DON'T**:
- Write database queries in client components (use API routes)
- Trust AI output without Zod validation
- Create JWT on server (validate incoming JWT instead)
- Import `node-appwrite` in client components (use `appwrite` client lib)
- Use `any` type (use `unknown` and type guards)
- Hardcode API keys in code (use environment variables)
- Skip error handling (always try-catch async operations)
- Ignore accessibility (test with keyboard, screen reader)

✅ **DO**:
- Validate all user input with Zod schemas
- Use TypeScript's type system fully
- Write meaningful commit messages
- Test on multiple browsers and devices
- Optimize images and bundles
- Use semantic HTML (`<button>` not `<div onClick>`)
- Handle loading and error states
- Implement optimistic updates for better UX

---

## Skills Directory

**Location**: `.github/skills/`

**Available Skills:**
1. `frontend_aesthetics.md` - Typography, color, motion, backgrounds
2. `react_best_practices.md` - Performance, data fetching, rendering
3. `web_design_guidelines.md` - Accessibility, forms, navigation
4. `composition_patterns.md` - Component architecture
5. `scytle_patterns.md` - Project-specific conventions

**How to Use:**
When working on a specific task, the AI agent should autonomously load relevant skills. For example:
- Building UI → Load `frontend_aesthetics` + `scytle_patterns`
- Optimizing code → Load `react_best_practices`
- Reviewing accessibility → Load `web_design_guidelines`

**Creating New Skills:**
1. Identify repetitive guidance you provide
2. Create markdown file in `.github/skills/`
3. Structure: Problem → Principles → Examples → Anti-patterns
4. Keep focused (300-500 tokens ideal)
5. Make actionable (specific instructions, not vague advice)

---

## Development Workflow

### Phase-Based Development
The project is divided into 8 phases (see `docs/SCYTLE-BUILD-PHASES.md`):
1. **Foundation** (Week 1-2): Auth, database, design system
2. **Dashboard** (Week 3-4): Project CRUD, templates
3. **Chat & AI** (Week 5-6): Chat interface, AI streaming
4. **Canvas** (Week 7-8): Sitemap editor, toolbars
5. **AI Agents** (Week 9-10): All agents working
6. **Design & Code** (Week 11-12): Views, code editor
7. **Export & Polish** (Week 13-14): Export, deploy, optimization
8. **Launch** (Week 15-16): Marketing, Stripe, launch

### Current Phase
**Status**: [Update as project progresses]
**Next Tasks**: [Reference SCYTLE-BUILD-PHASES.md]

### Git Workflow
```bash
# Feature branch naming
git checkout -b feature/chat-interface
git checkout -b fix/auth-redirect
git checkout -b refactor/agent-system

# Commit message format
feat: add chat streaming with SSE
fix: resolve JWT validation error
refactor: extract AI client logic
docs: update skills documentation
```

---

## Testing Strategy

### Unit Tests (Jest)
- Test pure functions (utilities, helpers)
- Test custom hooks
- Test Zustand stores

### Integration Tests (React Testing Library)
- Test component interactions
- Test form submissions
- Test API route handlers

### E2E Tests (Playwright)
- Test critical user flows:
  - Signup → Create project → Generate sitemap → Export code
  - Login → View dashboard → Open project → Chat with AI

### Manual Testing Checklist
- [ ] Mobile responsive (iOS Safari, Android Chrome)
- [ ] Keyboard navigation works
- [ ] Screen reader accessible
- [ ] All error states handled
- [ ] Loading states smooth
- [ ] No console errors
- [ ] Lighthouse score 90+ on all metrics

---

## Performance Targets

**Lighthouse Scores (Minimum):**
- Performance: 90+
- Accessibility: 100
- Best Practices: 100
- SEO: 90+

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Bundle Size:**
- Initial JS: < 300KB (gzipped)
- Initial CSS: < 50KB (gzipped)
- Total page weight: < 1MB

---

## Deployment

**Production Environment:**
- Hosting: Vercel
- Database: Appwrite Cloud
- CDN: Cloudflare
- Domain: scytle.ai

**Environment Variables:**
```bash
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=xxx
APPWRITE_API_KEY=xxx

# AI
OPENROUTER_API_KEY=xxx
GEMINI_API_KEY=xxx

# Stripe
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=xxx

# Analytics
NEXT_PUBLIC_GA_ID=xxx
SENTRY_DSN=xxx
```

---

## Resources

**Documentation:**
- [UX Flow](./docs/SCYTLE-UX-FLOW.md) - Complete user flow scenarios
- [Build Phases](./docs/SCYTLE-BUILD-PHASES.md) - 8-phase plan with 295 tasks
- [Skills Guide](https://www.anthropic.com/engineering/skills) - How skills work

**External References:**
- [Next.js Docs](https://nextjs.org/docs)
- [Appwrite Docs](https://appwrite.io/docs)
- [ReactFlow Docs](https://reactflow.dev)
- [Shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

**Inspiration:**
- [Relume](https://relume.io) - Sitemap → Wireframe workflow
- [v0.dev](https://v0.dev) - AI UI generation
- [Bolt.new](https://bolt.new) - Full-stack code generation

---

## Agent Behavior Guidelines

### When to Load Skills
**Frontend Task:** Load `frontend_aesthetics` + `scytle_patterns`
**Code Review:** Load `react_best_practices` + `web_design_guidelines`  
**Building Components:** Load `composition_patterns`
**Unfamiliar Task:** Ask user which skills to load

### Communication Style
- **Be concise**: 1-3 sentences for simple answers
- **Be specific**: Reference exact file paths, line numbers
- **Be proactive**: Suggest improvements, not just fixes
- **Be transparent**: Explain trade-offs, not just solutions

### Error Handling
- Always provide actionable error messages
- Include stack trace in development
- Log errors to Sentry in production
- Never expose sensitive data in errors

### Code Generation
- Generate complete, runnable code (no `// TODO` comments)
- Include TypeScript types
- Add JSDoc comments for public APIs
- Follow existing patterns in codebase
- Optimize for readability first, performance second

---

**Last Updated**: February 2, 2026  
**Version**: 3.0 (Multi-project workspace)  
**Maintainer**: Scytle Team

---

# OpenClaw (openclaw/)

> **For full details**, see `openclaw/CLAUDE.md` and `openclaw/AGENTS.md`.

## Overview

**OpenClaw** is a messaging gateway CLI that bridges AI agents to multiple chat platforms (WhatsApp, Telegram, Discord, Slack, Signal, iMessage, etc.).

## Key Commands

```bash
cd openclaw
pnpm install           # Install deps (Node 22+)
pnpm build             # TypeScript build (tsc)
pnpm lint              # Oxlint
pnpm test              # Vitest (70% coverage threshold)
pnpm openclaw ...      # Run CLI in dev mode
```

## Project Structure

```
openclaw/
├── src/                    # Core source (TypeScript ESM)
│   ├── cli/                # CLI wiring
│   ├── commands/           # CLI commands
│   ├── channels/           # Shared channel logic
│   ├── gateway/            # Gateway server
│   ├── plugins/            # Plugin loader
│   ├── telegram/discord/slack/signal/  # Channel implementations
│   └── ...
├── extensions/             # Workspace packages (channel plugins)
│   ├── msteams/matrix/zalo/voice-call/...
├── apps/                   # Native apps (iOS, macOS, Android)
├── docs/                   # Mintlify docs (docs.openclaw.ai)
└── scripts/                # Build, release, utilities
```

## Critical Patterns

### Plugin/Extension Architecture
- Extensions live under `extensions/*` (workspace packages)
- Keep plugin-only deps in extension's `package.json`, not root
- Avoid `workspace:*` in `dependencies` (breaks npm install)
- Put `openclaw` in `devDependencies` or `peerDependencies`

### Multi-Agent Safety
- **Never** create/drop `git stash` entries unless explicitly requested
- **Never** switch branches unless explicitly requested
- When committing, scope to your changes only
- When pushing, `git pull --rebase` first (never discard other agents' work)
- Use `scripts/committer "<msg>" <file...>` instead of manual `git add/commit`

### Messaging Channels
When refactoring shared logic, consider **all** built-in + extension channels:
- Core: `src/telegram`, `src/discord`, `src/slack`, `src/signal`, `src/imessage`, `src/web`
- Extensions: `extensions/msteams`, `extensions/matrix`, `extensions/zalo`, etc.

### Code Style
- TypeScript ESM, strict typing, avoid `any`
- Use Oxlint + Oxfmt (`pnpm lint`, `pnpm format`)
- Keep files under ~700 LOC; extract helpers
- Use `src/cli/progress.ts` for spinners (not hand-rolled)
- Use `src/terminal/palette.ts` for colors (no hardcoded ANSI)

### Testing
- Colocated `*.test.ts` files; e2e in `*.e2e.test.ts`
- Live tests: `CLAWDBOT_LIVE_TEST=1 pnpm test:live`
- Before using simulators, check for real connected devices

### PR Workflow
- **Review mode**: `gh pr view/diff` only, don't switch branches
- **Landing mode**: Create temp branch from `main`, squash/rebase, run full gate before commit
- Always add changelog entry with PR # and thank contributor
- After merging, run `bun scripts/update-clawtributors.ts` for new contributors

### Version Locations
- CLI: `package.json`
- Android: `apps/android/app/build.gradle.kts`
- iOS: `apps/ios/Sources/Info.plist`
- macOS: `apps/macos/Sources/OpenClaw/Resources/Info.plist`

## Anti-Patterns

❌ **DON'T**:
- Edit `node_modules` (ever)
- Update the Carbon dependency
- Patch dependencies without explicit approval
- Set test workers above 16
- Send streaming/partial replies to external messaging (WhatsApp, Telegram)
- Rebuild macOS app over SSH (must be run directly on Mac)

---

## Shared Conventions (Both Projects)

### Commit Messages
```bash
feat: add chat streaming
fix: resolve auth redirect
refactor: extract AI client
docs: update agent instructions
```

### Error Investigation
- Read source code of npm deps and local code before concluding
- Aim for high-confidence root cause, don't guess

### Code Generation
- Generate complete, runnable code (no `// TODO`)
- Include TypeScript types
- Follow existing patterns in codebase
