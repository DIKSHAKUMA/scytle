// ============================================================
// Scytle Sync — Canvas Room Durable Object
// ============================================================
//
// One instance per project. Manages:
// - WebSocket connections for all users in this project
// - In-memory canvas state (pages + nodes)
// - SQLite persistence (survives hibernation/eviction)
// - Broadcasting changes to all connected clients
//
// Uses Cloudflare Hibernation API with WebSocket tags to
// survive DO hibernation. Tags store userId so connections
// can be restored after wake.
// ============================================================

import { DurableObject } from 'cloudflare:workers'
import { verifyToken, type AuthResult, AuthError } from './auth'
import type {
  Env,
  ClientMessage,
  ServerMessage,
  SyncNode,
  SyncPage,
  InitState,
} from './types'

// ============================================================
// Durable Object
// ============================================================

export class CanvasRoom extends DurableObject<Env> {
  // In-memory state (rebuilt from SQLite on cold start / hibernation wake)
  private pages: Map<string, SyncPage> = new Map()
  private nodesByPage: Map<string, Map<string, SyncNode>> = new Map()
  private nodeOrder: Map<string, string[]> = new Map()
  private pageOrder: string[] = []
  private stateLoaded = false

  // ============================================================
  // SQLite Schema Setup
  // ============================================================

  private ensureSchema(): void {
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY,
        page_id TEXT NOT NULL,
        data TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_nodes_page ON nodes(page_id);

      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        canvas_color TEXT DEFAULT '#F5F5F5',
        zoom REAL DEFAULT 1,
        pan_x REAL DEFAULT 0,
        pan_y REAL DEFAULT 0,
        sort_order INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `)
  }

  // ============================================================
  // Load state from SQLite into memory
  // ============================================================

  private ensureStateLoaded(): void {
    if (this.stateLoaded) return
    this.ensureSchema()

    // Load pages
    const pageRows = this.ctx.storage.sql
      .exec('SELECT * FROM pages ORDER BY sort_order ASC')
      .toArray()

    this.pages.clear()
    this.pageOrder = []

    for (const row of pageRows) {
      const page: SyncPage = {
        id: row.id as string,
        name: row.name as string,
        canvasColor: row.canvas_color as string,
        zoom: row.zoom as number,
        panX: row.pan_x as number,
        panY: row.pan_y as number,
      }
      this.pages.set(page.id, page)
      this.pageOrder.push(page.id)
    }

    // Load nodes grouped by page
    this.nodesByPage.clear()
    this.nodeOrder.clear()

    const nodeRows = this.ctx.storage.sql
      .exec('SELECT id, page_id, data, sort_order FROM nodes ORDER BY sort_order ASC')
      .toArray()

    for (const row of nodeRows) {
      const pageId = row.page_id as string
      const node: SyncNode = JSON.parse(row.data as string)

      if (!this.nodesByPage.has(pageId)) {
        this.nodesByPage.set(pageId, new Map())
        this.nodeOrder.set(pageId, [])
      }
      this.nodesByPage.get(pageId)!.set(node.id, node)
      this.nodeOrder.get(pageId)!.push(node.id)
    }

    this.stateLoaded = true
  }

  // ============================================================
  // Build init state to send to a new client
  // ============================================================

  private getInitState(): InitState {
    const pages: InitState['pages'] = []

    for (const pageId of this.pageOrder) {
      const page = this.pages.get(pageId)!
      const nodeMap = this.nodesByPage.get(pageId)
      const order = this.nodeOrder.get(pageId) ?? []

      const nodes: SyncNode[] = []
      for (const nid of order) {
        const n = nodeMap?.get(nid)
        if (n) nodes.push(n)
      }

      pages.push({ ...page, nodes })
    }

    let activePageId = this.pageOrder[0] ?? ''
    try {
      const metaRow = this.ctx.storage.sql
        .exec("SELECT value FROM meta WHERE key = 'activePageId'")
        .toArray()
      if (metaRow.length > 0) activePageId = metaRow[0].value as string
    } catch {
      // ignore
    }

    return { pages, activePageId }
  }

  // ============================================================
  // WebSocket Handler (Cloudflare Hibernation API)
  // ============================================================

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // Internal snapshot endpoint used by the Next.js server.
    if (request.method === 'GET' && /^\/snapshot\/[a-zA-Z0-9_-]+$/.test(url.pathname)) {
      this.ensureStateLoaded()
      return Response.json(
        { state: this.getInitState() },
        {
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      )
    }

    const upgrade = request.headers.get('Upgrade')
    if (upgrade !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 })
    }

    const pair = new WebSocketPair()
    const [client, server] = [pair[0], pair[1]]

    // Accept with hibernation support (no tags yet — added on join)
    this.ctx.acceptWebSocket(server)

    return new Response(null, { status: 101, webSocket: client })
  }

  // ============================================================
  // WebSocket Event Handlers (Hibernation API)
  // ============================================================

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    const msgStr = typeof raw === 'string' ? raw : new TextDecoder().decode(raw)
    let msg: ClientMessage

    try {
      msg = JSON.parse(msgStr)
    } catch {
      this.sendTo(ws, { type: 'error', message: 'Invalid JSON' })
      return
    }

    // Always load state from SQLite (handles hibernation wake)
    this.ensureStateLoaded()

    // Handle join (auth) — must be first message
    if (msg.type === 'join') {
      await this.handleJoin(ws, msg.token)
      return
    }

    // Check if this WebSocket is authenticated (attachment survives hibernation)
    const attachment = this.getAttachment(ws)
    if (!attachment) {
      this.sendTo(ws, { type: 'error', message: 'Not authenticated. Send join first.' })
      return
    }

    // Create a user object for the handlers
    const user = { userId: attachment.userId }

    switch (msg.type) {
      case 'update':
        this.handleUpdate(ws, user, msg.nodeId, msg.changes)
        break
      case 'add':
        this.handleAdd(ws, user, msg.node, msg.pageId)
        break
      case 'delete':
        this.handleDelete(ws, user, msg.nodeId, msg.pageId)
        break
      case 'reorder':
        this.handleReorder(ws, user, msg.pageId, msg.nodeIds)
        break
      case 'page:add':
        this.handlePageAdd(ws, user, msg.page)
        break
      case 'page:delete':
        this.handlePageDelete(ws, user, msg.pageId)
        break
      case 'page:rename':
        this.handlePageRename(ws, user, msg.pageId, msg.name)
        break
      case 'page:update':
        this.handlePageUpdate(ws, user, msg.pageId, msg.changes)
        break
      case 'page:reorder':
        this.handlePageReorder(ws, user, msg.pageIds)
        break
      case 'page:switch':
        // Presence only — not critical
        break
      case 'viewport':
        break
      // Chat thread sync — broadcast-only (no DO storage, Appwrite is the DB)
      case 'chat:thread:create':
      case 'chat:thread:delete':
      case 'chat:thread:rename':
      case 'chat:thread:archive':
        this.broadcast(ws, { ...msg, userId: user.userId } as ServerMessage)
        break
      default:
        this.sendTo(ws, { type: 'error', message: `Unknown message type` })
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    // Broadcast updated presence
    this.broadcastPresence()
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    this.broadcastPresence()
  }

  // ============================================================
  // Join / Auth
  // ============================================================

  private async handleJoin(ws: WebSocket, token: string): Promise<void> {
    let auth: AuthResult
    try {
      auth = await verifyToken(token, this.env)
    } catch (err) {
      const statusSuffix = err instanceof AuthError ? ` (${err.status})` : ''
      this.sendTo(ws, { type: 'error', message: `Authentication failed${statusSuffix}` })
      ws.close(4001, 'Unauthorized')
      return
    }

    // Store userId in WebSocket's serializable attachment (survives hibernation)
    ws.serializeAttachment({ userId: auth.userId, pageId: this.pageOrder[0] ?? '' })

    // Load state from SQLite
    this.ensureStateLoaded()

    // Send full state to the newly connected client
    const initState = this.getInitState()
    this.sendTo(ws, { type: 'init', state: initState })

    // Broadcast updated presence
    this.broadcastPresence()
  }

  // ============================================================
  // Get userId from WebSocket (using serialized attachment)
  // ============================================================

  private getAttachment(ws: WebSocket): { userId: string; pageId: string } | null {
    try {
      const attachment = ws.deserializeAttachment()
      if (attachment && typeof attachment === 'object' && 'userId' in attachment) {
        return attachment as { userId: string; pageId: string }
      }
    } catch {
      // No attachment
    }
    return null
  }

  // ============================================================
  // Node Operations
  // ============================================================

  /** Recursively find a node by ID (handles children nested inside frames) */
  private findNodeDeep(nodes: SyncNode[], id: string): SyncNode | null {
    for (const node of nodes) {
      if (node.id === id) return node
      const children = node.children as SyncNode[] | undefined
      if (Array.isArray(children)) {
        const found = this.findNodeDeep(children, id)
        if (found) return found
      }
    }
    return null
  }

  private handleUpdate(
    ws: WebSocket,
    user: { userId: string },
    nodeId: string,
    changes: Record<string, unknown>
  ): void {
    for (const [, nodeMap] of this.nodesByPage) {
      // First try direct lookup (top-level node)
      let node = nodeMap.get(nodeId)
      let parentNode: SyncNode | null = null

      if (!node) {
        // Search inside children of all top-level nodes (nested child update)
        for (const [, topNode] of nodeMap) {
          const children = topNode.children as SyncNode[] | undefined
          if (!Array.isArray(children)) continue
          const found = this.findNodeDeep(children, nodeId)
          if (found) {
            node = found
            parentNode = topNode
            break
          }
        }
      }

      if (!node) continue

      // Apply changes to the in-memory node
      Object.assign(node, changes)

      // Persist: save the top-level node (which contains the modified child)
      const nodeToSave = parentNode ?? node
      const now = Date.now()
      this.ctx.storage.sql.exec(
        'UPDATE nodes SET data = ?, updated_at = ? WHERE id = ?',
        JSON.stringify(nodeToSave),
        now,
        nodeToSave.id
      )

      this.broadcast(ws, {
        type: 'update',
        nodeId,
        changes,
        userId: user.userId,
      })
      return
    }
  }

  private handleAdd(
    ws: WebSocket,
    user: { userId: string },
    node: SyncNode,
    pageId: string
  ): void {
    if (!this.pages.has(pageId)) return

    if (!this.nodesByPage.has(pageId)) {
      this.nodesByPage.set(pageId, new Map())
      this.nodeOrder.set(pageId, [])
    }

    this.nodesByPage.get(pageId)!.set(node.id, node)
    const order = this.nodeOrder.get(pageId)!
    order.push(node.id)

    const now = Date.now()
    this.ctx.storage.sql.exec(
      'INSERT OR REPLACE INTO nodes (id, page_id, data, sort_order, updated_at) VALUES (?, ?, ?, ?, ?)',
      node.id,
      pageId,
      JSON.stringify(node),
      order.length - 1,
      now
    )

    this.broadcast(ws, {
      type: 'add',
      node,
      pageId,
      userId: user.userId,
    })
  }

  private handleDelete(
    ws: WebSocket,
    user: { userId: string },
    nodeId: string,
    pageId: string
  ): void {
    const nodeMap = this.nodesByPage.get(pageId)
    if (!nodeMap) return

    nodeMap.delete(nodeId)
    const order = this.nodeOrder.get(pageId)
    if (order) {
      const idx = order.indexOf(nodeId)
      if (idx !== -1) order.splice(idx, 1)
    }

    this.ctx.storage.sql.exec('DELETE FROM nodes WHERE id = ?', nodeId)

    this.broadcast(ws, {
      type: 'delete',
      nodeId,
      pageId,
      userId: user.userId,
    })
  }

  private handleReorder(
    ws: WebSocket,
    user: { userId: string },
    pageId: string,
    nodeIds: string[]
  ): void {
    if (!this.pages.has(pageId)) return

    this.nodeOrder.set(pageId, nodeIds)

    for (let i = 0; i < nodeIds.length; i++) {
      this.ctx.storage.sql.exec(
        'UPDATE nodes SET sort_order = ? WHERE id = ?',
        i,
        nodeIds[i]
      )
    }

    this.broadcast(ws, {
      type: 'reorder',
      pageId,
      nodeIds,
      userId: user.userId,
    })
  }

  // ============================================================
  // Page Operations
  // ============================================================

  private handlePageAdd(ws: WebSocket, user: { userId: string }, page: SyncPage): void {
    this.pages.set(page.id, page)
    this.pageOrder.push(page.id)
    this.nodesByPage.set(page.id, new Map())
    this.nodeOrder.set(page.id, [])

    const now = Date.now()
    this.ctx.storage.sql.exec(
      'INSERT OR REPLACE INTO pages (id, name, canvas_color, zoom, pan_x, pan_y, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      page.id,
      page.name,
      page.canvasColor,
      page.zoom,
      page.panX,
      page.panY,
      this.pageOrder.length - 1,
      now
    )

    this.broadcast(ws, {
      type: 'page:add',
      page,
      userId: user.userId,
    })
  }

  private handlePageDelete(ws: WebSocket, user: { userId: string }, pageId: string): void {
    if (this.pages.size <= 1) return

    this.pages.delete(pageId)
    this.nodesByPage.delete(pageId)
    this.nodeOrder.delete(pageId)
    this.pageOrder = this.pageOrder.filter((id) => id !== pageId)

    this.ctx.storage.sql.exec('DELETE FROM nodes WHERE page_id = ?', pageId)
    this.ctx.storage.sql.exec('DELETE FROM pages WHERE id = ?', pageId)

    this.broadcast(ws, {
      type: 'page:delete',
      pageId,
      userId: user.userId,
    })
  }

  private handlePageRename(
    ws: WebSocket,
    user: { userId: string },
    pageId: string,
    name: string
  ): void {
    const page = this.pages.get(pageId)
    if (!page) return

    page.name = name
    this.ctx.storage.sql.exec('UPDATE pages SET name = ? WHERE id = ?', name, pageId)

    this.broadcast(ws, {
      type: 'page:rename',
      pageId,
      name,
      userId: user.userId,
    })
  }

  private handlePageUpdate(
    ws: WebSocket,
    user: { userId: string },
    pageId: string,
    changes: Partial<SyncPage>
  ): void {
    const page = this.pages.get(pageId)
    if (!page) return

    if (changes.canvasColor !== undefined) {
      page.canvasColor = changes.canvasColor
      this.ctx.storage.sql.exec(
        'UPDATE pages SET canvas_color = ? WHERE id = ?',
        changes.canvasColor,
        pageId
      )
    }
    if (changes.name !== undefined) {
      page.name = changes.name
      this.ctx.storage.sql.exec('UPDATE pages SET name = ? WHERE id = ?', changes.name, pageId)
    }

    this.broadcast(ws, {
      type: 'page:update',
      pageId,
      changes,
      userId: user.userId,
    })
  }

  private handlePageReorder(ws: WebSocket, user: { userId: string }, pageIds: string[]): void {
    this.pageOrder = pageIds

    for (let i = 0; i < pageIds.length; i++) {
      this.ctx.storage.sql.exec(
        'UPDATE pages SET sort_order = ? WHERE id = ?',
        i,
        pageIds[i]
      )
    }

    this.broadcast(ws, {
      type: 'page:reorder',
      pageIds,
      userId: user.userId,
    })
  }

  // ============================================================
  // Broadcasting
  // ============================================================

  private sendTo(ws: WebSocket, msg: ServerMessage): void {
    try {
      ws.send(JSON.stringify(msg))
    } catch {
      // Connection probably closed
    }
  }

  /** Broadcast to all connected clients EXCEPT the sender */
  private broadcast(sender: WebSocket, msg: ServerMessage): void {
    const payload = JSON.stringify(msg)
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === sender) continue
      // Only send to authenticated sockets
      if (!this.getAttachment(ws)) continue
      try {
        ws.send(payload)
      } catch {
        // Dead socket, will be cleaned up on close
      }
    }
  }

  /** Broadcast presence info to ALL connected clients */
  private broadcastPresence(): void {
    const sockets = this.ctx.getWebSockets()
    const users: Array<{ userId: string; pageId: string }> = []

    for (const ws of sockets) {
      const att = this.getAttachment(ws)
      if (att) users.push({ userId: att.userId, pageId: att.pageId })
    }

    const msg: ServerMessage = { type: 'presence', users }
    const payload = JSON.stringify(msg)

    for (const ws of sockets) {
      if (!this.getAttachment(ws)) continue
      try {
        ws.send(payload)
      } catch {
        // Dead socket
      }
    }
  }
}
