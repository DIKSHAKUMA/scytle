// ============================================================
// Scytle Sync — Auth (JWT verification via Appwrite)
// ============================================================

import type { Env } from './types'

export interface AuthResult {
  userId: string
  email?: string
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
