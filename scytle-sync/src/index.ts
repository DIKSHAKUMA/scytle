// ============================================================
// Scytle Sync — Worker Entry Point
// ============================================================
//
// Routes incoming WebSocket requests to the correct Durable Object
// based on the projectId in the URL path.
//
// URL format: wss://scytle-sync.<account>.workers.dev/room/:projectId
// ============================================================

import type { Env } from './types'

// Re-export the Durable Object class so Cloudflare can find it
export { CanvasRoom } from './canvas-room'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // ── CORS preflight ──────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return handleCORS(request, env)
    }

    // ── Health check ────────────────────────────────────────
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response('scytle-sync OK', {
        status: 200,
        headers: corsHeaders(request, env),
      })
    }

    // ── WebSocket room route: /room/:projectId ──────────────
    const match = url.pathname.match(/^\/room\/([a-zA-Z0-9_-]+)$/)
    if (!match) {
      return new Response('Not found. Use /room/:projectId', {
        status: 404,
        headers: corsHeaders(request, env),
      })
    }

    const projectId = match[1]

    // Get or create the Durable Object for this project
    const roomId = env.CANVAS_ROOM.idFromName(projectId)
    const room = env.CANVAS_ROOM.get(roomId)

    // Forward the request to the Durable Object
    return room.fetch(request)
  },
}

// ============================================================
// CORS Helpers
// ============================================================

function getAllowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get('Origin')
  if (!origin) return null

  const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  if (allowed.includes(origin)) return origin

  // In dev, allow any localhost
  if (origin.startsWith('http://localhost:')) return origin

  return null
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = getAllowedOrigin(request, env)
  if (!origin) return {}

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Upgrade, Sec-WebSocket-Protocol',
    'Access-Control-Max-Age': '86400',
  }
}

function handleCORS(request: Request, env: Env): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request, env),
  })
}
