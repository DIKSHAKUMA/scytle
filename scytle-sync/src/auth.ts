// ============================================================
// Scytle Sync — Auth (JWT verification via Appwrite)
// ============================================================

import type { Env } from './types'

export interface AuthResult {
  userId: string
  email?: string
}

export interface ShareAuthResult {
  projectId: string
  shareId: string
  scope: 'share:read'
}

export class AuthError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Auth failed: ${status}`)
    this.name = 'AuthError'
    this.status = status
  }
}

/**
 * Verify an Appwrite JWT by calling the Appwrite Account API.
 * The JWT is a session token created via `account.createJWT()` on the client.
 * We validate it by using it to fetch the current user from Appwrite.
 */
export async function verifyToken(token: string, env: Env): Promise<AuthResult> {
  const res = await fetch(`${env.APPWRITE_ENDPOINT}/account`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': env.APPWRITE_PROJECT_ID,
      'X-Appwrite-JWT': token,
    },
  })

  if (!res.ok) {
    throw new AuthError(res.status)
  }

  const user = (await res.json()) as { $id: string; email?: string }
  return { userId: user.$id, email: user.email }
}

interface ShareTokenHeader {
  alg: 'HS256'
  typ: 'SCYTLE_SHARE'
}

interface ShareTokenPayload {
  v: 1
  pid: string
  sid: string
  scope: 'share:read'
  iat: number
  exp: number
}

function decodeBase64Url(input: string): Uint8Array {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4
  const padded = padding === 0 ? normalized : `${normalized}${'='.repeat(4 - padding)}`
  const raw = atob(padded)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

function decodeJson<T>(input: string): T {
  const bytes = decodeBase64Url(input)
  const text = new TextDecoder().decode(bytes)
  return JSON.parse(text) as T
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}

function getShareSigningSecret(env: Env): string | null {
  const secret = env.SHARE_SYNC_TOKEN_SECRET || env.INTERNAL_SYNC_SECRET
  return secret && secret.length > 0 ? secret : null
}

/**
 * Verify a short-lived, read-only share token issued by the app server.
 */
export async function verifyShareToken(token: string, env: Env): Promise<ShareAuthResult> {
  const secret = getShareSigningSecret(env)
  if (!secret) {
    throw new AuthError(503)
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new AuthError(401)
  }

  const [headerB64, payloadB64, signatureB64] = parts

  let header: ShareTokenHeader
  let payload: ShareTokenPayload
  let receivedSig: Uint8Array
  try {
    header = decodeJson<ShareTokenHeader>(headerB64)
    payload = decodeJson<ShareTokenPayload>(payloadB64)
    receivedSig = decodeBase64Url(signatureB64)
  } catch {
    throw new AuthError(401)
  }

  if (header.alg !== 'HS256' || header.typ !== 'SCYTLE_SHARE') {
    throw new AuthError(401)
  }

  if (payload.v !== 1 || payload.scope !== 'share:read') {
    throw new AuthError(401)
  }

  if (!payload.pid || !payload.sid) {
    throw new AuthError(401)
  }

  const now = Math.floor(Date.now() / 1000)
  if (!Number.isFinite(payload.exp) || payload.exp <= now) {
    throw new AuthError(401)
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const body = `${headerB64}.${payloadB64}`
  const expectedSig = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  )

  if (!timingSafeEqual(expectedSig, receivedSig)) {
    throw new AuthError(401)
  }

  return {
    projectId: payload.pid,
    shareId: payload.sid,
    scope: payload.scope,
  }
}
