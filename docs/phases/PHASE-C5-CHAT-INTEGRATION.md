# Phase C5 — Chat + AI Iteration

> **Status**: 🔲 Not started
> **Priority**: High — this is how users refine designs after initial generation
> **Dependencies**: C1 (parser), C2 (AI generation), C4 (workspace layout)
> **Demo**: `src/app/demo/flow/workspace/page.tsx` → Chat tab section
> **Existing code**: `src/store/chat-store.ts` (335 LOC), `src/app/api/chat/route.ts`

## Purpose

Enable conversational design iteration. Users chat with the AI to request changes to generated designs — "make the hero section darker", "add a testimonials section", "change the font to Playfair Display". The AI modifies the HTML, which gets re-parsed into updated ScytleNodes.

## User Flow

```
1. User types "make the hero bigger and add a gradient background"
2. Chat sends message to AI with:
   - The instruction
   - Current page HTML (exported from ScytleNodes via C8, or stored from last generation)
   - Style guide context
   - Which page is targeted (contextPage)
3. AI returns modified HTML via SSE stream
4. Parser converts HTML → ScytleNode tree
5. Canvas updates the targeted page frame's children
6. Chat shows AI response: "I've updated the hero section with a larger layout and gradient."
```

## Chat Tab UI (from Demo)

### Message Types

```typescript
type ChatMessage = {
    id: string
    role: 'system' | 'user' | 'assistant'
    content: string
    timestamp: Date
    // Metadata for AI messages
    pageTarget?: string      // Which page this message modified
    generatedHtml?: string   // The HTML output (stored for iteration)
}
```

### Message Rendering

| Role | Style |
|------|-------|
| **System** | Centered `bg-muted/50 text-muted-foreground text-xs rounded-full px-3 py-1` — e.g., "Project created", "Sitemap generated" |
| **User** | Right-aligned, `bg-foreground text-background rounded-2xl rounded-br-md px-4 py-2.5 text-sm max-w-[85%]` |
| **Assistant** | Left-aligned with gradient avatar (w-6 h-6, `bg-gradient-to-br from-accent to-accent/70`), `bg-muted/30 border border-border/40 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm`, shows timestamp in `text-[10px] text-muted-foreground/40` |

### Context Indicator

A pill at the bottom of the message list, above the input:

```
┌─────────────────────────────────────┐
│  Context: Dashboard ▼               │  ← accent-colored pill
└─────────────────────────────────────┘
```

- Shows which page the AI will target
- Clicking opens a dropdown to switch pages
- Stored as `contextPage` in state
- AI receives this as the page to modify

### Input Area

```
┌─────────────────────────────────────┐
│  [textarea              ] [📎] [➤] │
└─────────────────────────────────────┘
```

- `bg-muted/30 rounded-xl border border-border/40`
- Textarea: auto-resize, placeholder "Ask AI to modify..."
- Attach button: `text-muted-foreground/40 hover:text-muted-foreground`
- Send button: round `bg-accent text-white w-7 h-7`, disabled when empty

## API Integration

### POST `/api/ai/generate-page` (reuse from C2)

The same endpoint handles both initial generation and edits:

```typescript
// For chat-based iteration:
const response = await authFetch('/api/ai/generate-page', {
    method: 'POST',
    body: JSON.stringify({
        prompt: originalProjectPrompt,
        productType: project.productType,
        pageName: contextPage,
        styleGuide: themeStore.getActiveTheme(),
        existingHtml: currentPageHtml,        // ← current state
        editInstruction: userMessage.content,  // ← what to change
    }),
})
```

### Response Handling

```typescript
async function handleChatSend(message: string) {
    // 1. Add user message to chat
    chatStore.addMessage({ role: 'user', content: message })

    // 2. Get current page HTML
    const pageFrame = getPageFrame(contextPage)
    const currentHtml = exportNodesToHtml(pageFrame.children)  // C8

    // 3. Call AI with edit instruction
    const html = await streamAiGeneration({
        existingHtml: currentHtml,
        editInstruction: message,
        pageName: contextPage,
    })

    // 4. Parse new HTML to nodes
    const newNodes = parseHtmlToNodes(html)

    // 5. Replace page frame children
    editorStore.updateNode(pageFrame.id, { children: newNodes })

    // 6. Add AI response to chat
    chatStore.addMessage({
        role: 'assistant',
        content: generateAiSummary(message),  // "I've updated the hero..."
        pageTarget: contextPage,
        generatedHtml: html,
    })
}
```

## Chat Store Updates

The existing `useChatStore` needs rewiring:

```typescript
interface ChatState {
    messages: ChatMessage[]
    isStreaming: boolean
    contextPage: string | null       // NEW: which page AI targets
    conversationId: string | null

    // Actions
    addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
    setContextPage: (page: string) => void
    setStreaming: (streaming: boolean) => void
    clearMessages: () => void
}
```

## Quick Actions

Predefined buttons that appear when a page is selected but before user types:

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 🎨 Redesign  │ │ ✏️ Edit copy │ │ 📱 Mobile    │
└──────────────┘ └──────────────┘ └──────────────┘
┌──────────────┐ ┌──────────────┐
│ ➕ Add section│ │ 🎯 Simplify │
└──────────────┘ └──────────────┘
```

Clicking a quick action fills the input with a preset instruction and sends it.

## File Structure

```
src/components/workspace/
  chat-tab.tsx                ← Main chat component
  chat-message.tsx            ← Individual message renderer
  chat-input.tsx              ← Input area with send/attach
  context-indicator.tsx       ← Page context pill
  quick-actions.tsx           ← Predefined action chips

src/store/
  chat-store.ts               ← UPDATE: add contextPage, rewire for new flow

src/app/api/ai/generate-page/
  route.ts                    ← Handles both initial gen + edit iterations
```

## Streaming UX

While AI is generating:
1. Show a typing indicator in chat (three animated dots)
2. The canvas shows the page frame with a shimmer/skeleton overlay
3. Once complete, shimmer fades and new design appears
4. AI message appears in chat with summary

## Error Handling

- AI failure → "Sorry, generation failed. Try again." system message
- Network error → "Connection lost. Retrying..." with auto-retry
- Rate limit → "Too many requests. Please wait a moment." with cooldown timer
