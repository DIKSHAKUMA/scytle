// ============================================================
// Scytle Sync — Shared Types
// ============================================================

/**
 * Minimal node representation for the sync layer.
 * The DO stores nodes as opaque JSON — it doesn't need to know
 * every property, just id + pageId for routing.
 */
export interface SyncNode {
  id: string
  [key: string]: unknown // all ScytleNode properties
}

export interface SyncPage {
  id: string
  name: string
  canvasColor: string
  zoom: number
  panX: number
  panY: number
}

// ============================================================
// Client → Server Messages
// ============================================================

export type ClientMessage =
  | { type: 'join'; projectId: string; token: string }
  | { type: 'update'; nodeId: string; changes: Record<string, unknown> }
  | { type: 'add'; node: SyncNode; pageId: string }
  | { type: 'delete'; nodeId: string; pageId: string }
  | { type: 'reorder'; pageId: string; nodeIds: string[] }
  | { type: 'page:add'; page: SyncPage }
  | { type: 'page:delete'; pageId: string }
  | { type: 'page:rename'; pageId: string; name: string }
  | { type: 'page:update'; pageId: string; changes: Partial<SyncPage> }
  | { type: 'page:reorder'; pageIds: string[] }
  | { type: 'page:switch'; pageId: string }
  | { type: 'viewport'; zoom: number; panX: number; panY: number }
  // Chat thread sync (broadcast-only, no DO storage)
  | { type: 'chat:thread:create'; thread: { remoteId: string; status: string; title?: string } }
  | { type: 'chat:thread:delete'; threadId: string }
  | { type: 'chat:thread:rename'; threadId: string; title: string }
  | { type: 'chat:thread:archive'; threadId: string; status: 'regular' | 'archived' }

// ============================================================
// Server → Client Messages
// ============================================================

export interface InitState {
  pages: Array<SyncPage & { nodes: SyncNode[] }>
  activePageId: string
}

export type ServerMessage =
  | { type: 'init'; state: InitState }
  | { type: 'update'; nodeId: string; changes: Record<string, unknown>; userId: string }
  | { type: 'add'; node: SyncNode; pageId: string; userId: string }
  | { type: 'delete'; nodeId: string; pageId: string; userId: string }
  | { type: 'reorder'; pageId: string; nodeIds: string[]; userId: string }
  | { type: 'page:add'; page: SyncPage; userId: string }
  | { type: 'page:delete'; pageId: string; userId: string }
  | { type: 'page:rename'; pageId: string; name: string; userId: string }
  | { type: 'page:update'; pageId: string; changes: Partial<SyncPage>; userId: string }
  | { type: 'page:reorder'; pageIds: string[]; userId: string }
  | { type: 'presence'; users: Array<{ userId: string; pageId: string }> }
  | { type: 'error'; message: string }
  // Chat thread sync (broadcast-only)
  | { type: 'chat:thread:create'; thread: { remoteId: string; status: string; title?: string }; userId: string }
  | { type: 'chat:thread:delete'; threadId: string; userId: string }
  | { type: 'chat:thread:rename'; threadId: string; title: string; userId: string }
  | { type: 'chat:thread:archive'; threadId: string; status: 'regular' | 'archived'; userId: string }

// ============================================================
// Environment Bindings
// ============================================================

export interface Env {
  CANVAS_ROOM: DurableObjectNamespace
  APPWRITE_ENDPOINT: string
  APPWRITE_PROJECT_ID: string
  ALLOWED_ORIGINS: string
}
