# Scytle Build Plan - Detailed Phase Breakdown

## Overview

**Total Timeline:** 12-16 weeks (3-4 months)
**Team Size:** 1-2 developers
**Tech Stack:** Next.js 15, React 19, Tailwind CSS 4, Appwrite, OpenClaw, ReactFlow

---

## Phase 1: Foundation & Core Setup (Week 1-2)

### **Goals:**
- Set up development environment
- Create base application structure
- Implement authentication system
- Design system foundation

### **Detailed Tasks:**

#### 1.1 Project Setup & Configuration
- [x] **1.1.1** Initialize Next.js 15 project with TypeScript ✅
  - Run `npx create-next-app@latest scytle --typescript --tailwind --app`
  - Configure `next.config.ts` with strict mode, image domains
  - Set up `.env.local` with environment variables
  - Create `.env.example` template

- [x] **1.1.2** Configure Tailwind CSS 4 ✅
  - Install Tailwind CSS 4 beta: `npm install tailwindcss@next`
  - Set up `tailwind.config.ts` with custom theme
  - Create `globals.css` with CSS variables for colors
  - Define color palette: Primary (black), secondary, accent colors
  - Set up font families (Poppins, Inter, JetBrains Mono)

- [x] **1.1.3** Set up development tools ✅
  - Configure ESLint with strict rules
  - Set up Prettier for code formatting
  - Install VS Code extensions (ESLint, Prettier, Tailwind CSS IntelliSense)
  - Create `.vscode/settings.json` for workspace config
  - Set up Git hooks with Husky for pre-commit linting

- [x] **1.1.4** Install core dependencies ✅
  ```bash
  npm install zustand immer zod
  npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
  npm install lucide-react clsx tailwind-merge
  npm install reactflow
  npm install @monaco-editor/react
  npm install date-fns
  ```

#### 1.2 Database & Backend Setup (Appwrite)
- [x] **1.2.1** Set up Appwrite instance ✅
  - Create Appwrite Cloud account or self-host
  - Create new project "Scytle Production"
  - Note project ID, endpoint, API key
  - Configure CORS settings for localhost and production domain

- [x] **1.2.2** Create database schema ✅
  - **Database:** scytle_db
  - **Collections:**
    - `users` (userId, email, name, plan, createdAt)
    - `projects` (projectId, userId, name, description, status, createdAt, updatedAt)
    - `pages` (pageId, projectId, name, slug, parentId, order, sections)
    - `sections` (sectionId, pageId, type, content, order, config)
    - `style_guides` (styleGuideId, projectId, colors, fonts, spacing, components)
    - `research_data` (researchId, projectId, competitors, insights, opportunities)
    - `ai_conversations` (conversationId, projectId, messages, context)

- [x] **1.2.3** Set up collection permissions ✅
  - Users: Read own documents, create, update, delete
  - Projects: Read own, create, update, delete
  - Implement role-based access (owner, collaborator, viewer)

- [x] **1.2.4** Create Appwrite helper functions ✅
  - `lib/appwrite.ts` - Client SDK initialization
  - `lib/appwrite-server.ts` - Server SDK with API key
  - `lib/appwrite-helpers.ts` - CRUD operations for each collection
  - `lib/appwrite-types.ts` - TypeScript types for documents

#### 1.3 Authentication System
- [x] **1.3.1** Set up Appwrite Auth ✅
  - Configure email/password authentication
  - Set up OAuth providers (Google, GitHub)
  - Configure email templates (verification, password reset)
  - Set up session management (30-day expiry)

- [x] **1.3.2** Create auth pages ✅
  - `app/login/page.tsx` - Login form with email/password
  - `app/signup/page.tsx` - Signup form with validation
  - `app/forgot-password/page.tsx` - Password reset flow
  - Add "Continue with Google" and "Continue with GitHub" buttons
  - Implement form validation with Zod schemas

- [x] **1.3.3** Implement auth middleware ✅
  - Create `middleware.ts` for route protection
  - Protect `/app/*` routes (require authentication)
  - Redirect authenticated users from `/login`, `/signup` to `/app/dashboard`
  - Handle session refresh on token expiry

- [x] **1.3.4** Create auth store ✅
  - `store/auth-store.ts` using Zustand
  - State: `user`, `session`, `isLoading`, `isAuthenticated`
  - Actions: `login()`, `logout()`, `signup()`, `checkAuth()`
  - Persist session in localStorage

- [x] **1.3.5** Build auth components ✅
  - `components/auth/login-form.tsx` - Email/password form
  - `components/auth/signup-form.tsx` - Registration form
  - `components/auth/oauth-buttons.tsx` - Google/GitHub login
  - `components/auth/auth-guard.tsx` - Client-side route protection
  - Add loading states, error handling, success messages

#### 1.4 Design System Components (Shadcn/ui)
- [x] **1.4.1** Initialize Shadcn/ui ✅
  ```bash
  npx shadcn-ui@latest init
  ```
  - Choose style: New York
  - Choose base color: Neutral
  - Set up CSS variables in `globals.css`

- [x] **1.4.2** Install base components ✅
  ```bash
  npx shadcn-ui@latest add button
  npx shadcn-ui@latest add input
  npx shadcn-ui@latest add dialog
  npx shadcn-ui@latest add dropdown-menu
  npx shadcn-ui@latest add card
  npx shadcn-ui@latest add badge
  npx shadcn-ui@latest add avatar
  npx shadcn-ui@latest add separator
  npx shadcn-ui@latest add tabs
  npx shadcn-ui@latest add tooltip
  npx shadcn-ui@latest add scroll-area
  npx shadcn-ui@latest add select
  npx shadcn-ui@latest add textarea
  ```

- [x] **1.4.3** Customize components for Scytle brand ✅
  - Update `components/ui/button.tsx` with custom variants
  - Add primary, secondary, ghost, outline variants
  - Customize hover states, focus rings
  - Add loading state with spinner

- [x] **1.4.4** Create custom components ✅
  - `components/ui/logo.tsx` - Scytle logo component
  - `components/ui/loading-spinner.tsx` - Loading indicator
  - `components/ui/empty-state.tsx` - Empty state placeholder
  - `components/ui/error-boundary.tsx` - Error handling wrapper

#### 1.5 Application Shell
- [x] **1.5.1** Create root layout ✅
  - `app/layout.tsx` - Root layout with metadata
  - Add Google Fonts (Poppins, Inter)
  - Set up viewport, theme-color meta tags
  - Add analytics script placeholder

- [x] **1.5.2** Create app layout structure ✅
  - `app/app/layout.tsx` - Authenticated app layout
  - Add top navigation bar
  - Add user avatar, dropdown menu
  - Add "Settings", "Help", "Logout" options

- [x] **1.5.3** Build navigation components ✅
  - `components/navigation/top-bar.tsx` - Main app nav bar
  - `components/navigation/user-menu.tsx` - User dropdown
  - `components/navigation/breadcrumbs.tsx` - Breadcrumb navigation

### **Deliverables Phase 1:** ✅ COMPLETE
- ✅ Fully configured Next.js + Tailwind project
- ✅ Working authentication system (email + OAuth)
- ✅ Appwrite database with all collections
- ✅ Base design system components
- ✅ Protected routes and middleware
- ✅ Application shell with navigation

### **Time Estimate:** 8-10 days ✅ DONE

---

## Phase 2: Dashboard & Project Management (Week 3-4)

### **Goals:**
- Build dashboard homepage
- Implement project CRUD operations
- Create project list view
- Set up project state management

### **Detailed Tasks:**

#### 2.1 Dashboard Page
- [x] **2.1.1** Create dashboard layout ✅
  - `app/app/dashboard/page.tsx` - Main dashboard
  - Grid layout: Quick Start, Recent Projects, Templates
  - Responsive design (mobile, tablet, desktop)

- [x] **2.1.2** Build Quick Start section ✅
  - Large CTA: "Start New Project"
  - Quick action buttons:
    - "Build from idea" (AI-guided flow)
    - "Import from URL" (URL analyzer)
    - "Use template" (Pre-built templates)
  - Add onboarding tooltip for first-time users

- [x] **2.1.3** Create project grid ✅
  - `components/dashboard/project-grid.tsx`
  - Card-based layout with project thumbnail
  - Show: Project name, last edited, status badge
  - Hover actions: Open, Duplicate, Delete
  - Empty state when no projects exist

- [x] **2.1.4** Add search and filter ✅
  - Search projects by name/description
  - Filter by status (All, Draft, In Progress, Completed)
  - View mode toggle (Grid/List)

#### 2.2 Project Creation Flow
- [x] **2.2.1** Create "New Project" page ✅
  - `app/dashboard/new/page.tsx`
  - Hero section with Vercel-style design
  - 4-step process preview (Think, Research, Design, Build)
  - AI-guided project creation form

- [x] **2.2.2** Build template selector ✅
  - `app/dashboard/templates/page.tsx`
  - Grid of pre-built templates:
    - SaaS Application
    - Portfolio Website
    - E-commerce Store
    - Agency Website
    - Blog Platform
    - Restaurant Website
  - Template cards with descriptions and page previews

- [ ] **2.2.3** Build URL analyzer (Future)
  - `components/dashboard/url-analyzer.tsx`
  - Input field for URL
  - Validate URL format with Zod
  - Show loading state while analyzing
  - Display extracted info: Title, description, detected pages

- [x] **2.2.4** Implement project creation logic ✅
  - `lib/api/projects.ts` - API helper functions
  - `createProject()` - Create new project document
  - `updateProject()` - Update project details
  - `deleteProject()` - Delete project

#### 2.3 Project State Management
- [x] **2.3.1** Create project store ✅
  - `store/project-store.ts` using Zustand
  - State:
    - `currentProject` - Active project object
    - `projects` - List of all user projects
    - `isLoading` - Loading state
    - `error` - Error message
  - Actions:
    - `loadProjects()` - Fetch all projects from Appwrite
    - `selectProject(id)` - Set current project
    - `createProject(data)` - Create new project
    - `updateProject(id, data)` - Update project
    - `deleteProject(id)` - Delete project

- [ ] **2.3.2** Set up real-time sync (Future)
  - Implement optimistic updates
  - Real-time sync with Appwrite subscriptions

#### 2.4 Project Settings (Future Phase)
- [ ] **2.4.1** Create settings page
- [ ] **2.4.2** General settings
- [ ] **2.4.3** Team settings
- [ ] **2.4.4** Danger zone

#### 2.5 API Routes for Projects
- [x] **2.5.1** Create project API routes ✅
  - `app/api/projects/route.ts` - GET (list), POST (create)
  - `app/api/projects/[id]/route.ts` - GET, PATCH (update), DELETE
  - JWT authentication on all routes
  - Input validation with Zod schemas

- [x] **2.5.2** Implement error handling ✅
  - Try-catch blocks for all database operations
  - Return consistent error format
  - Log errors to console in development

- [ ] **2.5.3** Add rate limiting (Future)

### **Deliverables Phase 2:** ✅ COMPLETE
- ✅ Fully functional dashboard with search/filter
- ✅ Project creation with AI-guided flow
- ✅ Template selection page
- ✅ Project state management
- ✅ API routes with auth and validation
- ✅ Fixed auth flow (middleware + client-side)

### **Time Estimate:** 8-10 days ✅ DONE

---

## Phase 3: Chat Interface & AI Integration (Week 5-6)

### **Goals:**
- Build chat interface (left sidebar)
- Integrate OpenRouter/Gemini AI
- Implement streaming responses
- Create AI conversation management

### **Detailed Tasks:**

#### 3.1 Chat Interface Components
- [x] **3.1.1** Create chat layout ✅
  - `components/chat/chat-sidebar.tsx` - Main chat container (1/3 width)
  - Sticky header with project name
  - Scrollable message area
  - Input area at bottom (sticky)
  - Responsive: Full-screen on mobile, sidebar on desktop

- [x] **3.1.2** Build message components ✅
  - `components/chat/message.tsx` - Single message container
  - User message: Right-aligned, primary background
  - AI message: Left-aligned, gray background
  - Support Markdown rendering in AI messages
  - Add timestamp (formatted with date-fns)
  - Add copy button for AI responses

- [x] **3.1.3** Create input area ✅
  - `components/chat/chat-input.tsx`
  - Textarea with auto-resize (max 5 lines)
  - Send button (disabled when empty)
  - Keyboard shortcuts: Enter to send, Shift+Enter for new line
  - Character counter (max 2000 chars)
  - Stop generation button

- [x] **3.1.4** Add chat features ✅
  - `components/chat/typing-indicator.tsx` - "AI is typing..." animation
  - `components/chat/quick-actions.tsx` - Suggested prompts
    - "Generate sitemap"
    - "Create Design"
    - "Export code"
    - "Suggest Ideas"
  - Streaming cursor animation

- [x] **3.1.5** Implement streaming UI ✅
  - Word-by-word animation for AI responses
  - SSE-based streaming from API
  - Show progress indicators for long operations
  - Cancel button to stop generation (AbortController)

#### 3.2 AI Service Setup
- [x] **3.2.1** Create AI configuration ✅
  - `lib/ai/config.ts` - AI provider settings
  - Gemini API key configuration
  - Model options:
    1. `gemini-2.0-flash` (fast - default)
    2. `gemini-2.5-flash` (balanced)
    3. `gemini-2.5-pro` (powerful)

- [x] **3.2.2** Build AI client wrapper ✅
  - `lib/ai/client.ts` - Unified AI client
  - `generate(prompt, history, options)` - Non-streaming response
  - `generateStream(prompt, history, options)` - Async generator for streaming
  - `createStreamResponse(message, history, options)` - ReadableStream for SSE
  - `buildPrompt(message, history, systemPrompt)` - Context assembly

- [x] **3.2.3** Create system prompts ✅
  - `lib/ai/config.ts` - SYSTEM_PROMPTS object
  - `default` - General assistant for Scytle
  - `think` - Idea clarification prompts
  - `research` - Competitor analysis prompts
  - `sitemap` - Sitemap generation prompts
  - `design` - Design generation prompts
  - `code` - Code generation prompts

- [x] **3.2.4** Implement context management ✅
  - Conversation history passed to AI
  - Last 10 messages for context
  - System prompt injection
  - Token limit management

#### 3.3 AI API Routes
- [x] **3.3.1** Create chat API endpoint ✅
  - `app/api/chat/route.ts` - POST endpoint
  - Accept: `{ projectId, message }`
  - JWT authentication required
  - Validate input with Zod

- [x] **3.3.2** Implement streaming response ✅
  - Use `ReadableStream` for Server-Sent Events (SSE)
  - Stream AI responses token by token
  - Send typing indicators
  - Handle connection drops gracefully
  - Content-Type: text/event-stream

- [x] **3.3.3** Save conversation history ✅
  - Store messages in `ai_conversations` collection
  - Each message: `{ role: 'user' | 'assistant', content, timestamp }`
  - JSON string storage for Appwrite compatibility
  - Load previous conversation on project open

- [ ] **3.3.4** Add intent detection (Future)
  - `lib/ai/intent-detector.ts` - Classify user intent
  - Intents: BUILD_FULL, DESIGN_ONLY, CODE_ONLY, QUESTION, EDIT_REQUEST
  - Return: `{ intent, confidence, suggestedAction }`
  - Route to appropriate handler based on intent

#### 3.4 Chat State Management
- [x] **3.4.1** Create chat store ✅
  - `store/chat-store.ts` using Zustand with immer
  - State:
    - `messages` - Array of chat messages
    - `isTyping` - AI typing indicator
    - `isStreaming` - Streaming in progress
    - `error` - Error message
    - `abortController` - For canceling requests
  - Actions:
    - `sendMessage(content, projectId)` - Send user message
    - `loadHistory(projectId)` - Load previous chat
    - `addMessage(role, content)` - Add message
    - `updateLastMessage(content)` - Update streaming message
    - `clearMessages()` - Clear conversation
    - `stopGeneration()` - Cancel current generation

- [x] **3.4.2** Implement optimistic updates ✅
  - Add user message to UI immediately
  - Show typing indicator while waiting
  - Stream AI response word by word
  - Handle errors (show error message)
  - Handle abort (stop streaming gracefully)

#### 3.5 AI Features (Future)
- [ ] **3.5.1** Implement suggested replies
- [ ] **3.5.2** Add conversation shortcuts
- [ ] **3.5.3** Build feedback system

### **Deliverables Phase 3:** ✅ COMPLETE
- ✅ Working chat interface with sidebar layout
- ✅ AI integration with Gemini streaming
- ✅ Conversation history (saved to Appwrite)
- ✅ Typing indicator and streaming animation
- ✅ Quick action buttons
- ✅ Error handling and generation cancellation

### **Time Estimate:** 10-12 days ✅ DONE

---

## Phase 4: Canvas & Sitemap Editor (Week 7-8)

### **Goals:**
- Build canvas workspace (right side, 2/3 width)
- Implement ReactFlow sitemap editor
- Create top bar with view switcher
- Add bottom toolbar with Figma-style tools

### **Detailed Tasks:**

#### 4.1 Canvas Layout Structure
- [ ] **4.1.1** Create canvas container
  - `components/canvas/canvas-workspace.tsx` - Main 2/3 container
  - Full-height, scrollable
  - Background: Light gray (#F8F9FA)
  - Border-left to separate from chat

- [ ] **4.1.2** Build top bar (Relume-style)
  - `components/canvas/top-bar.tsx` - View switcher
  - Tabs: [Sitemap] [Wireframe] [Style Guide] [Design]
  - Active tab indicator (underline, blue)
  - Toggle button: [👨‍💻 Dev Mode] on right side
  - When Dev Mode: [Code] [Preview] [Deploy] [Analytics]
  - Smooth tab transitions

- [ ] **4.1.3** Create bottom toolbar (Figma-style)
  - `components/canvas/bottom-toolbar.tsx` - Tool palette
  - Always visible, sticky to bottom
  - Tools: [✋ Hand] [➤ Select] [⊕ Add] [🔍 Zoom] [⟲ Undo] [⟳ Redo]
  - Keyboard shortcuts tooltip on hover
  - Context-specific tools appear based on active view

- [ ] **4.1.4** Implement view state management
  - `store/canvas-store.ts` using Zustand
  - State:
    - `activeView` - 'sitemap' | 'wireframe' | 'style-guide' | 'design'
    - `isDevelopmentMode` - boolean
    - `activeTool` - Current selected tool
    - `zoomLevel` - Canvas zoom (50% - 200%)
    - `canvasPosition` - Pan offset { x, y }
  - Actions:
    - `setView(view)` - Switch view
    - `toggleDevMode()` - Switch to dev mode
    - `setTool(tool)` - Set active tool
    - `zoom(delta)` - Zoom in/out
    - `resetView()` - Reset zoom and pan

#### 4.2 ReactFlow Sitemap Editor
- [ ] **4.2.1** Set up ReactFlow
  - Install: `npm install reactflow`
  - `components/canvas/views/sitemap-view.tsx` - Main sitemap canvas
  - Configure ReactFlow with custom node types
  - Set up MiniMap, Controls, Background components
  - Custom styling to match Scytle theme

- [ ] **4.2.2** Create custom node components
  - `components/canvas/nodes/page-node.tsx` - Page node
    - Display: Page name, icon, section count
    - Hover: Show edit, delete, add child buttons
    - Connection handles (top and bottom)
    - Visual states: Default, selected, hover, error
  
  - `components/canvas/nodes/project-node.tsx` - Root project node
    - Larger than page nodes
    - Show project name and icon
    - Connection handle at bottom only
    - Non-deletable, non-editable position

- [ ] **4.2.3** Implement node interactions
  - Click node: Select (highlight, show details panel)
  - Double-click: Edit node name inline
  - Drag: Move node position
  - Ctrl+Click: Multi-select nodes
  - Delete key: Remove selected nodes
  - Hover: Show quick action buttons

- [ ] **4.2.4** Build edge (connection) system
  - Custom edge component: Curved, animated
  - Color: Gray (default), blue (selected)
  - Arrow marker at end
  - Click edge: Select, show delete button
  - Prevent circular connections (validation)

- [ ] **4.2.5** Add sitemap features
  - Auto-layout button: Organize nodes in tree structure
  - Zoom to fit: Center all nodes in viewport
  - Add page button in toolbar: Create new node
  - Search/filter nodes by name
  - Export sitemap as JSON or image (PNG)

#### 4.3 Node Details Panel
- [ ] **4.3.1** Create side panel
  - `components/canvas/details-panel.tsx` - Right-side drawer
  - Slide out when node selected
  - Close button, or click outside to close
  - Tabs: Details, Sections, SEO

- [ ] **4.3.2** Build Details tab
  - Page name (editable input)
  - Page slug (auto-generated from name)
  - Parent page (dropdown selector)
  - Page icon picker
  - Description textarea
  - Save button

- [ ] **4.3.3** Build Sections tab
  - List of sections on this page
  - Drag to reorder sections
  - Add section button: Opens section picker
  - Section cards show: Type, title, preview
  - Edit/delete buttons per section

- [ ] **4.3.4** Build SEO tab
  - Meta title (input)
  - Meta description (textarea, char counter)
  - OG image upload
  - Canonical URL
  - Robots meta (index/noindex)

#### 4.4 Sitemap State Management
- [ ] **4.4.1** Create sitemap store
  - `store/sitemap-store.ts` using Zustand with immer
  - State:
    - `nodes` - Array of ReactFlow nodes
    - `edges` - Array of ReactFlow edges
    - `selectedNodeId` - Currently selected node
    - `history` - Undo/redo stack
  - Actions:
    - `addNode(data)` - Add new page node
    - `updateNode(id, data)` - Update node data
    - `deleteNode(id)` - Remove node and connected edges
    - `connectNodes(sourceId, targetId)` - Create edge
    - `undo()`, `redo()` - History navigation
    - `autoLayout()` - Auto-arrange nodes

- [ ] **4.4.2** Sync sitemap with backend
  - Save sitemap to Appwrite on changes (debounced)
  - Load sitemap from database on project open
  - Real-time sync if multiple users editing
  - Conflict resolution: Last write wins

#### 4.5 Toolbar Tools Implementation
- [ ] **4.5.1** Hand tool (Pan)
  - Activate: Click hand icon or press H
  - Drag canvas to pan
  - Cursor: grab (default), grabbing (dragging)
  - Deactivate: Click another tool

- [ ] **4.5.2** Select tool
  - Activate: Click select icon or press V
  - Click nodes/edges to select
  - Drag to create selection rectangle
  - Multi-select with Ctrl/Cmd

- [ ] **4.5.3** Add tool
  - Activate: Click add icon or press A
  - Shows dropdown: Add Page, Add Connection
  - Click canvas to place new page node
  - Connects to nearest node automatically (optional)

- [ ] **4.5.4** Zoom controls
  - Zoom in: Ctrl/Cmd + Plus
  - Zoom out: Ctrl/Cmd + Minus
  - Zoom to fit: Ctrl/Cmd + 0
  - Zoom percentage display: 50%, 75%, 100%, 125%, 150%, 200%

- [ ] **4.5.5** Undo/Redo
  - Undo: Ctrl/Cmd + Z
  - Redo: Ctrl/Cmd + Shift + Z
  - History stack: Store last 50 actions
  - Action types: Add, delete, move, edit, connect

### **Deliverables Phase 4:**
- ✅ Full canvas workspace with top/bottom bars
- ✅ Interactive ReactFlow sitemap editor
- ✅ Custom page nodes with hover actions
- ✅ Node details panel
- ✅ All toolbar tools working
- ✅ Undo/redo functionality
- ✅ Auto-layout algorithm

### **Time Estimate:** 12-14 days

---

## Phase 5: AI Agents & Background Processing (Week 9-10)

### **Goals:**
- Integrate OpenClaw or build custom agent system
- Create phase-specific AI agents
- Implement background research and generation
- Build progress tracking UI

### **Detailed Tasks:**

#### 5.1 Agent Architecture Setup
- [ ] **5.1.1** Decide on approach
  - **Option A:** Integrate OpenClaw (if available)
  - **Option B:** Build custom agent system (recommended for MVP)
  - Decision: Build custom lightweight agent system

- [ ] **5.1.2** Create agent framework
  - `lib/agents/base-agent.ts` - Abstract Agent class
    ```typescript
    abstract class Agent {
      abstract name: string
      abstract run(input: any, context: any): Promise<any>
      protected callAI(prompt: string): Promise<string>
      protected updateProgress(percent: number, message: string): void
    }
    ```

- [ ] **5.1.3** Set up agent registry
  - `lib/agents/registry.ts` - Agent manager
  - Register all agents: Think, Research, Define, Flow, Design, Build
  - `getAgent(name)` - Retrieve agent by name
  - `runAgent(name, input, context)` - Execute agent

- [ ] **5.1.4** Implement progress tracking
  - `store/progress-store.ts` - Track agent progress
  - State: `{ agentName, progress: 0-100, message, status }`
  - WebSocket or polling to update UI in real-time
  - Show progress bar in chat area

#### 5.2 Think Agent (Idea Clarification)
- [ ] **5.2.1** Create Think Agent
  - `lib/agents/think-agent.ts`
  - Input: User's initial idea (raw text)
  - Process:
    1. Analyze idea for clarity and completeness
    2. Identify missing information (target users, features, etc.)
    3. Generate 2-3 clarifying questions
    4. Wait for user responses or use smart defaults
  - Output: Refined idea summary + key attributes

- [ ] **5.2.2** Build question generator
  - Use AI to create contextual questions
  - Question types: Multiple choice, short answer
  - Example questions:
    - "Who is your target audience?"
    - "What's your main goal?"
    - "Any key features in mind?"

- [ ] **5.2.3** Implement default inference
  - If user skips questions, infer answers from idea
  - Use AI to make educated guesses
  - Mark inferred data as "assumed" (can be edited later)

#### 5.3 Research Agent (Competitor Analysis)
- [ ] **5.3.1** Create Research Agent
  - `lib/agents/research-agent.ts`
  - Input: Refined idea, product type
  - Process:
    1. Generate search queries based on product
    2. Scrape web for competitors (Google search)
    3. Extract competitor data (name, URL, features, pricing)
    4. Analyze patterns and gaps
    5. Identify opportunities
  - Output: Competitor list, market insights, USP suggestions

- [ ] **5.3.2** Build web scraper
  - `lib/scraper/index.ts` - Web scraping utility
  - Use Cheerio or Puppeteer for scraping
  - Rate limit: Max 10 requests per minute
  - Handle errors gracefully (timeout, 404, etc.)
  - Extract: Title, description, pricing, features from competitor sites

- [ ] **5.3.3** Create data analyzer
  - `lib/agents/research-analyzer.ts`
  - Analyze competitor data with AI
  - Find common features across competitors
  - Identify pricing patterns (average, min, max)
  - Suggest unique positioning

- [ ] **5.3.4** Build research UI components
  - `components/research/competitor-card.tsx` - Display competitor info
  - `components/research/insights-panel.tsx` - Show key insights
  - `components/research/opportunity-badge.tsx` - Highlight gaps

#### 5.4 Define Agent (USP & Personas)
- [ ] **5.4.1** Create Define Agent
  - `lib/agents/define-agent.ts`
  - Input: Idea summary, research data
  - Process:
    1. Generate unique value proposition (USP)
    2. Create 2-3 user personas
    3. Define key features based on research
    4. Suggest product positioning
  - Output: USP statement, persona cards, feature list

- [ ] **5.4.2** Build USP generator
  - Use AI to craft compelling USP
  - Format: "[Product Name] - [One-liner]"
  - Include: Target audience, key benefit, differentiator
  - Example: "DogWalk - Fair marketplace for dog walking with 15% lower commission"

- [ ] **5.4.3** Create persona generator
  - Generate 2-3 detailed personas
  - Include: Name, age, job, goals, pain points, motivations
  - Use stock photos for persona images
  - Store in `research_data` collection

- [ ] **5.4.4** Build UI for Define phase
  - `components/define/usp-card.tsx` - Editable USP display
  - `components/define/persona-card.tsx` - Persona profile card
  - `components/define/feature-list.tsx` - Prioritized feature list

#### 5.5 Flow Agent (Sitemap Generation)
- [ ] **5.5.1** Create Flow Agent
  - `lib/agents/flow-agent.ts`
  - Input: USP, personas, features
  - Process:
    1. Determine site structure based on product type
    2. Generate page hierarchy (Home, Features, Pricing, etc.)
    3. Define sections for each page
    4. Create page connections
  - Output: Sitemap nodes and edges for ReactFlow

- [ ] **5.5.2** Build sitemap generator
  - Use predefined templates for common site types
  - Templates: E-commerce, SaaS, Portfolio, Blog, Restaurant
  - Customize based on specific features
  - Generate: Page name, slug, parent, sections

- [ ] **5.5.3** Create section generator
  - For each page, generate appropriate sections
  - Example Home page: Hero, Features, How It Works, Testimonials, CTA
  - Section types: Hero, Feature Grid, Testimonial, Pricing Table, FAQ, Contact Form
  - Store section config: Layout, content placeholders

- [ ] **5.5.4** Auto-apply to canvas
  - After generation, automatically populate ReactFlow canvas
  - Position nodes in tree layout
  - Create edges between parent/child pages
  - Auto-zoom to fit all nodes

#### 5.6 Design Agent (Style Guide & Mockups)
- [ ] **5.6.1** Create Design Agent
  - `lib/agents/design-agent.ts`
  - Input: Project info, sitemap, brand preferences
  - Process:
    1. Generate style guide (colors, fonts, spacing)
    2. Create wireframes for each page
    3. Generate high-fidelity mockups (3 variations)
    4. Export design tokens
  - Output: Style guide, wireframes, mockups

- [ ] **5.6.2** Build style guide generator
  - Use AI to suggest color palette (5-6 colors)
  - Primary, secondary, accent, neutral colors
  - Ensure WCAG AA contrast compliance
  - Suggest font pairings (heading + body)
  - Define spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)

- [ ] **5.6.3** Integrate design API
  - **Option 1:** Use Ideogram API for image generation
  - **Option 2:** Use Figma API + AI prompt
  - **Option 3:** Use Replicate for Stable Diffusion
  - Generate: Hero images, icons, backgrounds

- [ ] **5.6.4** Create design variations
  - Generate 3 design styles: Modern, Minimal, Playful
  - Each variation: Different color scheme, font choice
  - Allow user to select or mix & match

#### 5.7 Build Agent (Code Generation)
- [ ] **5.7.1** Create Build Agent
  - `lib/agents/build-agent.ts`
  - Input: Sitemap, design, style guide
  - Process:
    1. Generate file structure
    2. Create component files for each section
    3. Generate page files with component imports
    4. Create global styles and config
    5. Add package.json with dependencies
  - Output: Complete Next.js project codebase

- [ ] **5.7.2** Build code generator
  - Use AI (GPT-4 or Claude) for code generation
  - Templates for common components
  - Output format: `{ path, content }` for each file
  - Ensure: TypeScript, Tailwind classes, proper imports

- [ ] **5.7.3** Implement code formatter
  - Use Prettier to format generated code
  - Ensure consistent style
  - Validate syntax before returning

### **Deliverables Phase 5:**
- ✅ Complete agent system working
- ✅ Think → Research → Define → Flow agents functional
- ✅ AI-powered sitemap generation
- ✅ Competitor research automation
- ✅ Progress tracking UI
- ✅ Error handling and retries

### **Time Estimate:** 12-14 days

---

## Phase 6: Design Views & Code Editor (Week 11-12)

### **Goals:**
- Build Wireframe view
- Create Style Guide editor
- Implement Design mockup view
- Add Code Editor with Monaco
- Create Preview mode

### **Detailed Tasks:**

#### 6.1 Wireframe View
- [ ] **6.1.1** Create wireframe canvas
  - `components/canvas/views/wireframe-view.tsx`
  - Display low-fidelity blocks for each section
  - Drag-and-drop to reorder sections
  - Click section to edit content

- [ ] **6.1.2** Build section library
  - `components/wireframe/section-library.tsx` - Section picker
  - Categories: Hero, Features, Content, Social Proof, CTA
  - Thumbnail preview of each section type
  - Drag from library to canvas to add

- [ ] **6.1.3** Create section block components
  - `components/wireframe/section-block.tsx` - Generic block
  - Props: `type`, `title`, `config`
  - Visual: Gray box with section icon and name
  - Hover: Show edit, delete, duplicate buttons

- [ ] **6.1.4** Implement section editor
  - Modal or side panel to edit section
  - Fields based on section type:
    - Hero: Headline, subheadline, CTA text, image URL
    - Features: Title, feature list (array of { title, description, icon })
    - Testimonial: Quote, author name, author photo, rating
  - Save changes to project database

#### 6.2 Style Guide View
- [ ] **6.2.1** Create style guide editor
  - `components/canvas/views/style-guide-view.tsx`
  - Sections: Colors, Typography, Spacing, Components

- [ ] **6.2.2** Build color picker
  - `components/style-guide/color-picker.tsx`
  - Show primary, secondary, accent, neutral colors
  - Click to edit: Opens color picker modal
  - Hex input field
  - Real-time preview of color changes
  - AI suggestion button: "Generate new palette"

- [ ] **6.2.3** Build typography editor
  - `components/style-guide/typography-editor.tsx`
  - Heading font selector (Google Fonts dropdown)
  - Body font selector
  - Font size scale (h1 to h6, body, small)
  - Line height, letter spacing sliders
  - Live preview of font changes

- [ ] **6.2.4** Build spacing editor
  - `components/style-guide/spacing-editor.tsx`
  - Define spacing scale (xs, sm, md, lg, xl, 2xl)
  - Visual ruler showing pixel values
  - Used in: Padding, margin, gap throughout site

- [ ] **6.2.5** Add export functionality
  - Export as Figma design tokens (JSON)
  - Export as Tailwind config
  - Export as CSS variables
  - Download button with format selector

#### 6.3 Design Mockup View
- [ ] **6.3.1** Create design canvas
  - `components/canvas/views/design-view.tsx`
  - Display high-fidelity mockups
  - Zoom and pan controls
  - Device selector: Desktop, Tablet, Mobile

- [ ] **6.3.2** Build design gallery
  - `components/design/design-gallery.tsx`
  - Show 3 design variations side-by-side
  - Click to expand full-screen
  - Select design button
  - Regenerate button (calls Design Agent again)

- [ ] **6.3.3** Implement design viewer
  - `components/design/design-viewer.tsx`
  - Full-screen modal to view single design
  - Scroll through all pages
  - Zoom in/out
  - Download as PNG or PDF
  - "Use This Design" button

- [ ] **6.3.4** Add design customization
  - Click any element to edit
  - Change text, images, colors
  - Swap sections
  - Save customizations to project

#### 6.4 Code Editor (Development Mode)
- [ ] **6.4.1** Integrate Monaco Editor
  - Install: `npm install @monaco-editor/react`
  - `components/canvas/views/code-view.tsx`
  - Configure Monaco with TypeScript, JSX support
  - Syntax highlighting for Next.js, React, Tailwind
  - Auto-complete, IntelliSense

- [ ] **6.4.2** Build file tree sidebar
  - `components/code/file-tree.tsx`
  - Show project file structure
  - Collapsible folders
  - Click file to open in editor
  - Icons for file types (ts, tsx, css, json)
  - Search files (Ctrl/Cmd + P)

- [ ] **6.4.3** Implement tabs system
  - `components/code/editor-tabs.tsx`
  - Open multiple files in tabs
  - Click tab to switch
  - Close button per tab
  - Unsaved indicator (dot) if file modified
  - Max 10 tabs open

- [ ] **6.4.4** Add code features
  - Format code button (Prettier)
  - Run ESLint (show errors inline)
  - Search and replace (Ctrl/Cmd + F)
  - Go to definition (Ctrl/Cmd + Click)
  - Undo/redo per file

- [ ] **6.4.5** Implement code sync
  - Save changes to database (debounced, every 2 seconds)
  - Load code from database on open
  - Lock files if another user editing (future)

#### 6.5 Preview Mode
- [ ] **6.5.1** Create preview iframe
  - `components/canvas/views/preview-view.tsx`
  - Embed generated site in iframe
  - Responsive preview: Desktop, tablet, mobile
  - Device frame selector at top
  - Refresh button to reload

- [ ] **6.5.2** Build preview server
  - `app/api/preview/route.ts` - Serve preview HTML
  - Compile Next.js code to static HTML (simplified)
  - Inject styles from style guide
  - Return HTML in response
  - Cache preview for 5 minutes

- [ ] **6.5.3** Add preview features
  - Click elements to highlight in code
  - Inspect mode: Show HTML structure
  - Console output (show errors, logs)
  - Network tab (show requests)

#### 6.6 Bottom Toolbar Updates
- [ ] **6.6.1** Context-specific tools
  - Wireframe view: [📦 Add Section] [📋 Templates] [⬆️⬇️ Reorder]
  - Style Guide: [🎨 Pick Color] [📝 Add Font] [📏 Spacing]
  - Design view: [🖼️ Add Image] [T Text] [🔲 Shape] [📱 Device]
  - Code view: [▶️ Run] [🐛 Debug] [📤 Export] [🔄 Format]

- [ ] **6.6.2** Implement tool actions
  - Each tool triggers specific modal or action
  - Example: Click "Add Section" → Opens section library
  - Example: Click "Pick Color" → Opens color picker
  - Example: Click "Format" → Formats current code file

### **Deliverables Phase 6:**
- ✅ Wireframe editor with section library
- ✅ Style guide editor with color/font pickers
- ✅ Design mockup viewer
- ✅ Full code editor with Monaco
- ✅ File tree and tabs
- ✅ Live preview iframe
- ✅ Context-specific toolbar tools

### **Time Estimate:** 12-14 days

---

## Phase 7: Export, Deploy & Polish (Week 13-14)

### **Goals:**
- Implement export functionality (Figma, GitHub)
- Add one-click deployment (Vercel)
- Polish UI/UX
- Add onboarding flow
- Performance optimization

### **Detailed Tasks:**

#### 7.1 Export Functionality
- [ ] **7.1.1** Export to Figma
  - `lib/export/figma-exporter.ts`
  - Use Figma API to create new file
  - Convert sitemap → Figma frames
  - Convert style guide → Figma styles
  - Convert designs → Figma components
  - Return Figma file URL

- [ ] **7.1.2** Export to GitHub
  - `lib/export/github-exporter.ts`
  - Create new GitHub repository (via API)
  - Push all code files to repo
  - Create README.md with setup instructions
  - Add .gitignore, package.json
  - Return GitHub repo URL

- [ ] **7.1.3** Export as ZIP
  - `app/api/export/zip/route.ts`
  - Zip all project files
  - Include: Code, assets, README
  - Return ZIP file download
  - Trigger browser download

- [ ] **7.1.4** Build export modal
  - `components/export/export-dialog.tsx`
  - Options: Figma, GitHub, ZIP, Deploy
  - Show progress during export
  - Success: Show link to exported resource
  - Error: Show error message, retry button

#### 7.2 Deployment Integration
- [ ] **7.2.1** Vercel integration
  - `lib/deploy/vercel-deployer.ts`
  - Use Vercel API to create deployment
  - Push code to Vercel
  - Configure environment variables
  - Return deployment URL

- [ ] **7.2.2** Netlify integration
  - `lib/deploy/netlify-deployer.ts`
  - Similar to Vercel
  - Create site, deploy code
  - Return deployment URL

- [ ] **7.2.3** Build deploy modal
  - `components/deploy/deploy-dialog.tsx`
  - Choose platform: Vercel or Netlify
  - Connect account (OAuth)
  - Configure: Site name, custom domain
  - Deploy button
  - Show deployment progress
  - Success: Show live URL, "Visit Site" button

- [ ] **7.2.4** Add domain management
  - Custom domain input
  - DNS configuration instructions
  - SSL certificate auto-provisioning
  - Domain verification status

#### 7.3 Onboarding Flow
- [ ] **7.3.1** Create welcome screen
  - Show on first login
  - 3-step walkthrough:
    1. "Create your first project"
    2. "Chat with AI to build"
    3. "Export and deploy"
  - "Skip" button
  - "Get Started" button

- [ ] **7.3.2** Build interactive tutorial
  - `components/onboarding/tutorial.tsx`
  - Highlight features with tooltips
  - Step-by-step guide through first project
  - Sample project: "Dog Walking App" (pre-filled)
  - Completion: Badge, confetti animation

- [ ] **7.3.3** Add help tooltips
  - "?" icon throughout app
  - Click to show contextual help
  - Examples: "What is a sitemap?", "How to add sections?"
  - Link to docs/video tutorials

#### 7.4 Performance Optimization
- [ ] **7.4.1** Code splitting
  - Lazy load routes: `const CodeEditor = dynamic(() => import('./code-editor'))`
  - Split large components
  - Reduce initial bundle size to < 300KB

- [ ] **7.4.2** Image optimization
  - Use Next.js `<Image>` component everywhere
  - Lazy load images below fold
  - Optimize uploaded images (compress, resize)
  - Use WebP format

- [ ] **7.4.3** Database query optimization
  - Add indexes on frequently queried fields
  - Implement pagination for project lists
  - Cache frequently accessed data (Redis)
  - Reduce API calls with batching

- [ ] **7.4.4** Lighthouse audit
  - Run Lighthouse on key pages
  - Fix: Performance, Accessibility, Best Practices, SEO
  - Target: 90+ score on all metrics
  - Optimize: LCP, FID, CLS

#### 7.5 UI/UX Polish
- [ ] **7.5.1** Loading states
  - Add skeleton loaders for all async content
  - Smooth transitions between states
  - Progress indicators for long operations
  - "Loading..." text with animation

- [ ] **7.5.2** Error handling UI
  - User-friendly error messages
  - Error boundaries for crash recovery
  - "Something went wrong" page with retry
  - Toast notifications for errors

- [ ] **7.5.3** Empty states
  - Custom illustrations for empty states
  - "No projects yet" → CTA to create first project
  - "No messages" in chat → Suggested prompts
  - "No designs generated" → "Generate Now" button

- [ ] **7.5.4** Micro-interactions
  - Button hover effects
  - Click animations (ripple effect)
  - Smooth page transitions
  - Confetti on deployment success
  - Toast notifications for actions

- [ ] **7.5.5** Responsive design
  - Test on mobile, tablet, desktop
  - Hamburger menu on mobile
  - Collapsible sidebars
  - Touch-friendly tap targets (44x44px min)
  - Horizontal scroll for tables

#### 7.6 Testing & Bug Fixes
- [ ] **7.6.1** Manual testing
  - Test all user flows end-to-end
  - Create project → Generate sitemap → Export code
  - Test on different browsers (Chrome, Firefox, Safari)
  - Test on different devices (iOS, Android)

- [ ] **7.6.2** Bug tracking
  - Set up bug tracking (Linear, GitHub Issues)
  - Prioritize: Critical, High, Medium, Low
  - Fix critical bugs first
  - Create regression tests

- [ ] **7.6.3** User testing
  - Recruit 5-10 beta users
  - Give them tasks to complete
  - Observe where they struggle
  - Collect feedback, iterate

#### 7.7 Documentation
- [ ] **7.7.1** Create user docs
  - Getting started guide
  - Feature tutorials (How to create sitemap, etc.)
  - FAQ
  - Troubleshooting
  - Host on separate docs site (GitBook, Notion)

- [ ] **7.7.2** Create developer docs
  - README.md: Setup instructions
  - Contributing guidelines
  - Architecture overview
  - API documentation
  - Code comments for complex logic

### **Deliverables Phase 7:**
- ✅ Export to Figma, GitHub, ZIP working
- ✅ One-click deployment to Vercel/Netlify
- ✅ Onboarding flow for new users
- ✅ Optimized performance (90+ Lighthouse)
- ✅ Polished UI with animations
- ✅ All bugs fixed
- ✅ Documentation complete

### **Time Estimate:** 10-12 days

---

## Phase 8: Launch Preparation (Week 15-16)

### **Goals:**
- Set up marketing site
- Create pricing page
- Add payment integration (Stripe)
- Set up analytics
- Prepare for launch

### **Detailed Tasks:**

#### 8.1 Marketing Landing Page
- [ ] **8.1.1** Design landing page
  - Hero: "From idea to live—with AI that thinks before it builds"
  - Problem section: Pain points of current tools
  - 7-Phase journey visualization
  - Feature highlights with animations
  - Comparison table: Scytle vs competitors
  - Testimonials (use beta user feedback)
  - Pricing preview
  - CTA: "Start Building Free"

- [ ] **8.1.2** Build landing page components
  - `app/page.tsx` - Marketing homepage
  - Sections: Hero, Problem, Journey, Features, Comparison, Testimonials, Pricing, CTA
  - Animations: Scroll-triggered, fade-ins, slide-ins
  - Optimize for SEO: Meta tags, Open Graph, structured data

- [ ] **8.1.3** Add waitlist form
  - Email input with validation
  - "Join Waitlist" button
  - Store emails in Appwrite database
  - Send confirmation email (Resend or SendGrid)
  - Show success message: "You're on the list!"

#### 8.2 Pricing Page
- [ ] **8.2.1** Create pricing page
  - `app/pricing/page.tsx`
  - 4 tiers: Free, Maker ($29), Pro ($59), Agency ($149)
  - Feature comparison table
  - FAQ section
  - "Start Free" CTA

- [ ] **8.2.2** Build pricing cards
  - `components/pricing/pricing-card.tsx`
  - Show: Plan name, price, features, CTA button
  - Highlight "Most Popular" plan
  - Annual/monthly toggle (save 20% annually)

#### 8.3 Stripe Integration
- [ ] **8.3.1** Set up Stripe account
  - Create Stripe account
  - Get API keys (test + live)
  - Create products and prices in Stripe Dashboard
  - Configure webhooks

- [ ] **8.3.2** Build checkout flow
  - Install: `npm install stripe @stripe/stripe-js`
  - `app/api/checkout/route.ts` - Create checkout session
  - Redirect to Stripe Checkout
  - Handle success/cancel redirects

- [ ] **8.3.3** Implement subscription management
  - `app/api/webhooks/stripe/route.ts` - Webhook handler
  - Handle events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
  - Update user plan in database
  - Send confirmation emails

- [ ] **8.3.4** Build billing portal
  - `app/app/settings/billing/page.tsx`
  - Show: Current plan, next billing date
  - Manage subscription button → Stripe Customer Portal
  - Update payment method
  - View invoices

#### 8.4 Analytics & Tracking
- [ ] **8.4.1** Set up Google Analytics
  - Create GA4 property
  - Add GA script to `app/layout.tsx`
  - Track: Page views, button clicks, conversions
  - Set up goals: Signup, project creation, export

- [ ] **8.4.2** Set up Plausible (privacy-friendly alternative)
  - Add Plausible script
  - Track custom events
  - No cookie consent needed

- [ ] **8.4.3** Set up error tracking (Sentry)
  - Install: `npm install @sentry/nextjs`
  - Configure Sentry in `next.config.ts`
  - Add environment-specific DSN
  - Test error reporting

- [ ] **8.4.4** Add feature flags (PostHog or similar)
  - Install PostHog
  - Set up feature flags for gradual rollout
  - A/B testing setup (future)

#### 8.5 Email System
- [ ] **8.5.1** Set up email service
  - Choose: Resend, SendGrid, or Mailgun
  - Configure SMTP settings
  - Verify domain for email sending

- [ ] **8.5.2** Create email templates
  - Welcome email (on signup)
  - Project export email (with download link)
  - Deployment success email (with live URL)
  - Weekly digest (future)

- [ ] **8.5.3** Build email notification system
  - `lib/email/sender.ts` - Email utility
  - Queue emails (Bull or Inngest)
  - Handle bounces and unsubscribes

#### 8.6 Launch Checklist
- [ ] **8.6.1** Pre-launch testing
  - [ ] All features working end-to-end
  - [ ] No console errors
  - [ ] Mobile responsive
  - [ ] Page speed optimized
  - [ ] SEO metadata correct
  - [ ] Payment flow working (test mode)
  - [ ] Emails sending correctly

- [ ] **8.6.2** Set up production environment
  - [ ] Vercel production deployment
  - [ ] Environment variables set
  - [ ] Custom domain connected
  - [ ] SSL certificate active
  - [ ] CDN configured

- [ ] **8.6.3** Marketing preparation
  - [ ] Product Hunt page draft
  - [ ] Social media posts scheduled
  - [ ] Demo video recorded (2-3 min)
  - [ ] Press release written
  - [ ] Email list ready (waitlist)

- [ ] **8.6.4** Launch day tasks
  - [ ] Post on Product Hunt
  - [ ] Tweet launch announcement
  - [ ] Send email to waitlist
  - [ ] Post on Reddit, Hacker News, Indie Hackers
  - [ ] Monitor analytics, fix issues
  - [ ] Respond to feedback quickly

### **Deliverables Phase 8:**
- ✅ Marketing landing page live
- ✅ Pricing page with Stripe integration
- ✅ Analytics and error tracking set up
- ✅ Email notifications working
- ✅ Production environment ready
- ✅ Launch checklist complete

### **Time Estimate:** 10-12 days

---

## Summary Timeline

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1: Foundation | 8-10 days | Auth, Database, Design System |
| Phase 2: Dashboard | 8-10 days | Project CRUD, Dashboard UI |
| Phase 3: Chat & AI | 10-12 days | Chat interface, AI integration |
| Phase 4: Canvas | 12-14 days | Sitemap editor, Toolbar |
| Phase 5: AI Agents | 12-14 days | All agents, Background processing |
| Phase 6: Design & Code | 12-14 days | Wireframe, Style Guide, Code Editor |
| Phase 7: Export & Polish | 10-12 days | Export, Deploy, Optimization |
| Phase 8: Launch | 10-12 days | Marketing site, Stripe, Launch |

**Total: 82-98 days (12-14 weeks, ~3-3.5 months)**

---

## Tech Stack Summary

**Frontend:**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Shadcn/ui components
- ReactFlow (sitemap editor)
- Monaco Editor (code editor)
- Zustand (state management)
- Zod (validation)

**Backend:**
- Next.js API Routes
- Appwrite (BaaS)
- OpenRouter / Gemini (AI)
- Stripe (payments)

**Deployment:**
- Vercel (hosting)
- Appwrite Cloud (database)
- Cloudflare (CDN)

**Tooling:**
- ESLint, Prettier (linting/formatting)
- Husky (Git hooks)
- Sentry (error tracking)
- Plausible (analytics)

---

## Development Tips

1. **Work incrementally**: Complete each phase fully before moving to next
2. **Test frequently**: Don't accumulate bugs, fix as you go
3. **Use AI**: Let ChatGPT/Claude help write boilerplate code
4. **Ship early**: Launch Phase 1-4 as MVP, iterate based on feedback
5. **Document**: Write README, comments as you build
6. **Version control**: Commit often, use meaningful commit messages
7. **User feedback**: Show to users after Phase 4, incorporate feedback

---

## MVP Scope (If Time-Constrained)

**Priority 1 (Must Have - 6-8 weeks):**
- Phase 1: Foundation ✅
- Phase 2: Dashboard ✅
- Phase 3: Chat & AI ✅
- Phase 4: Canvas (Sitemap only) ✅
- Phase 5: Think + Research + Flow agents ✅
- Export as JSON

**Priority 2 (Should Have - 8-10 weeks):**
- Phase 6: Wireframe + Style Guide
- Phase 5: Design agent
- Export to GitHub

**Priority 3 (Nice to Have - 10-14 weeks):**
- Phase 6: Code editor
- Phase 7: Deploy integration
- Phase 8: Full launch

**Start with Priority 1, launch MVP, gather feedback, then add Priority 2/3 features.**
