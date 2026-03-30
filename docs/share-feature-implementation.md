# Share Feature — Implementation Plan

## Overview

MVP share feature for Scytle.ai that allows project owners to generate a public read-only link to their design. Viewers can see the design without authentication. Inspired by Figma's sharing model but scoped to what we need now.

## Current System Context

| Aspect | Current State |
|--------|--------------|
| **Auth** | Appwrite sessions (localStorage), JWT for API routes |
| **Database** | `projects` collection — JSON blobs for sitemap/wireframe data |
| **Canvas** | Editor store (localStorage per project), ScytleNode tree |
| **Routing** | `/project/[id]` (editor), `/dashboard` (listing) |
| **Security** | `userId` ownership check on all API routes |
| **Collaboration** | None — 100% single-user |

## MVP Scope

### In Scope
- Share button + dialog in editor toolbar
- Unique shareable URL per project (`/share/[shareId]`)
- Public read-only viewer (no auth required)
- Access control toggle: public vs private
- Open Graph metadata for link previews in Slack/Discord
- Auth-aware routing (owner → editor, visitor → viewer, private → wall)

### Out of Scope (Future)
- Edit permissions for others
- Team/org/workspace sharing
- Invite by email
- Password-protected links
- Link expiration
- Embed/iframe system
- Real-time collaboration
- Comments from viewers
- Viewer restrictions (copy/export controls)
- Thumbnail generation for OG image

---

## Database Schema

### New Appwrite Collection: `shares`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `shareId` | string (16) | Yes | Short unique ID for URL (nanoid) |
| `projectId` | string | Yes | References `projects` collection |
| `userId` | string | Yes | Owner who created the share |
| `isPublic` | boolean | Yes | Whether anyone with link can view |
| `createdAt` | datetime | Yes | When share was created |

**Indexes:**
- Unique index on `shareId`
- Index on `projectId` (for lookup by project)
- Index on `userId` (for listing user's shares)

**Permissions:**
- Read: Any (public shares need to be readable without auth)
- Write: Owner only (via server-side API with admin SDK)

---

## URL Scheme

| URL | Auth Required | Who Sees It | What They See |
|-----|---------------|-------------|---------------|
| `/project/[id]` | Yes (owner) | Project owner | Full editor |
| `/share/[shareId]` | No | Anyone | Read-only viewer (if public) |
| `/share/[shareId]` | No | Anyone | "Private design" wall (if not public) |

The `shareId` is a short nanoid (e.g., `xK9_bQ2mNpL4`) — not the Appwrite document ID. This keeps URLs clean and doesn't leak internal IDs.

---

## API Routes

### 1. `POST /api/shares` — Create or update share

**Auth:** Required (JWT)
**Body:** `{ projectId: string }`
**Logic:**
1. Verify user owns the project
2. Check if share already exists for this project
3. If exists, return existing share
4. If not, generate `shareId` via nanoid, create document
5. Return share record

**Response:** `{ shareId, projectId, isPublic, createdAt }`

### 2. `GET /api/shares/[shareId]` — Get shared project data

**Auth:** NOT required (public endpoint)
**Logic:**
1. Look up share by `shareId`
2. If not found → 404
3. If `isPublic: false` → 403 with `{ error: "private" }`
4. Fetch the project data (sitemapData, wireframeData, name)
5. Fetch editor canvas data (pages + nodes) — need to also persist this to Appwrite
6. Return project data for rendering

**Response:** `{ projectName, canvasData, shareId }`

### 3. `PATCH /api/shares/[shareId]` — Toggle public/private

**Auth:** Required (JWT, must be owner)
**Body:** `{ isPublic: boolean }`
**Logic:**
1. Verify user owns the share
2. Update `isPublic` field
3. Return updated share

### 4. `DELETE /api/shares/[shareId]` — Revoke share

**Auth:** Required (JWT, must be owner)
**Logic:**
1. Verify user owns the share
2. Delete the share document
3. Return success

### 5. `GET /api/shares/project/[projectId]` — Get share for a project

**Auth:** Required (JWT, must be owner)
**Logic:**
1. Look up share by `projectId` and `userId`
2. Return share record or null

---

## Auth-Aware Flow

```
User visits /share/[shareId]
  → Server: fetch share record by shareId
  → Share not found?
     → Show 404 page
  → isPublic === true?
     → Load project data
     → Render read-only viewer
  → isPublic === false?
     → Is user authenticated?
        → YES: Is user the owner?
           → YES: Redirect to /project/[projectId]
           → NO: Show "This design is private" page
        → NO: Show "This design is private" + login CTA
```

---

## Component Architecture

### 1. Share Dialog (`src/components/share/share-dialog.tsx`)

Radix UI Dialog triggered from editor toolbar:
- Toggle switch: Public / Private
- When public: show share URL + "Copy link" button with success toast
- Status text: "Anyone with the link can view" / "Only you can access"
- Loading/error states

### 2. Read-Only Canvas (`src/components/share/read-only-canvas.tsx`)

Reuses existing canvas rendering but strips all editing:
- Renders ScytleNode tree (frames, text, images, vectors)
- Pan & zoom enabled (mouse wheel + drag)
- NO: selection, dragging, resizing, property panel, toolbar, layers panel
- Minimal header: project name + "View on Scytle.ai" CTA

Key renderer files to reuse:
- `src/components/editor/frame-renderer.tsx`
- `src/components/editor/text-renderer.tsx`
- `src/components/editor/render-utils.ts`

### 3. Share Page (`src/app/share/[shareId]/page.tsx`)

Server component that:
1. Fetches share data via API
2. Passes canvas data to read-only canvas client component
3. Sets OG metadata via `generateMetadata()`

### 4. Share Button in Toolbar

Add a "Share" button to the editor toolbar that opens the share dialog.

---

## Open Graph Metadata

On `/share/[shareId]`, Next.js `generateMetadata()` returns:

```typescript
{
  title: `${projectName} — Scytle.ai`,
  description: 'View this design on Scytle.ai',
  openGraph: {
    title: `${projectName} — Scytle.ai`,
    description: 'View this design on Scytle.ai',
    type: 'website',
    images: ['/og-share-default.png'], // Static branded image for v1
  },
  twitter: {
    card: 'summary_large_image',
    title: `${projectName} — Scytle.ai`,
    description: 'View this design on Scytle.ai',
  }
}
```

---

## Data Flow for Shared Viewing

**Problem:** Canvas node data is currently stored in `localStorage` only. Shared viewers can't access the owner's localStorage.

**Solution:** When sharing is enabled, persist the editor canvas data to Appwrite alongside the project. Options:

1. **Store in `projects` collection** — Add a `canvasData` JSON field (similar to `sitemapData`)
2. **Store in `shares` collection** — Snapshot the canvas at share time

**Recommended: Option 1** — Store in `projects.canvasData`. This means:
- Auto-save already syncs to Appwrite (extend existing debounced save)
- Shared viewer always sees latest version
- No separate snapshot management

This is the most critical piece — without it, shared viewers see nothing.

---

## File Changes

| File | Type | Purpose |
|------|------|---------|
| `src/app/share/[shareId]/page.tsx` | **New** | Public viewer page (server component) |
| `src/app/share/[shareId]/layout.tsx` | **New** | Minimal layout, no sidebar/toolbar |
| `src/app/api/shares/route.ts` | **New** | POST — create share |
| `src/app/api/shares/[shareId]/route.ts` | **New** | GET (public), PATCH, DELETE |
| `src/app/api/shares/project/[projectId]/route.ts` | **New** | GET share by project |
| `src/components/share/share-dialog.tsx` | **New** | Share modal UI |
| `src/components/share/read-only-canvas.tsx` | **New** | View-only canvas renderer |
| `src/components/share/share-button.tsx` | **New** | Toolbar share button |
| `src/lib/share-utils.ts` | **New** | nanoid generation, URL helpers |
| `src/lib/appwrite-server.ts` | **Edit** | Add shares collection ID constant |
| `src/store/editor-store.ts` | **Edit** | Add canvasData sync to Appwrite |
| `src/app/api/projects/[id]/route.ts` | **Edit** | Include canvasData in project CRUD |
| Editor toolbar component | **Edit** | Add Share button |

---

## Build Order

### Phase 1: Foundation
1. Create `shares` collection in Appwrite (manual or script)
2. Add collection constants to `appwrite-server.ts`
3. Create `share-utils.ts` with nanoid and URL helpers
4. Install `nanoid` dependency

### Phase 2: API Routes
5. `POST /api/shares` — create share
6. `GET /api/shares/[shareId]` — public fetch
7. `PATCH /api/shares/[shareId]` — toggle public/private
8. `DELETE /api/shares/[shareId]` — revoke
9. `GET /api/shares/project/[projectId]` — lookup by project

### Phase 3: Canvas Data Persistence
10. Add `canvasData` field to Appwrite `projects` collection
11. Extend editor-store auto-save to sync canvasData to Appwrite
12. Extend project API to read/write canvasData

### Phase 4: Share UI
13. Build `share-dialog.tsx`
14. Build `share-button.tsx`
15. Integrate into editor toolbar

### Phase 5: Read-Only Viewer
16. Build `read-only-canvas.tsx`
17. Build `/share/[shareId]/page.tsx` and `layout.tsx`
18. Add OG metadata via `generateMetadata()`

### Phase 6: Polish
19. Loading states, error boundaries
20. 404 and "private design" pages
21. Toast notifications
22. Test all auth states (owner, logged-in non-owner, anonymous)

---

## Dependencies

- `nanoid` — for generating short unique share IDs
- Existing: Radix UI (dialog), Zustand, Appwrite SDK

---

## Figma Research Reference

Full research on Figma's sharing system conducted before planning. Key takeaways that shaped this plan:

1. **Figma has no public API for sharing** — they built it all custom. We do the same.
2. **Three user states matter**: unauthenticated+public, unauthenticated+private, authenticated
3. **Prototype links are separate from editor links** — we mirror this with `/share/` vs `/project/`
4. **OG metadata is essential** for link previews
5. **Start simple**: Figma started with basic sharing too. We can iterate.
