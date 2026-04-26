/**
 * Credits Store — Client-side credit state for UI
 *
 * Fetches from /api/credits and provides reactive state
 * for credit counter, upgrade modal visibility, etc.
 *
 * Supports model-aware optimistic updates:
 *   incrementUsed(modelKey?) estimates cost based on model multiplier
 */

import { create } from 'zustand'
import { createJWT } from '@/lib/appwrite'

// Client-side model multiplier lookup (mirrors model-defs.ts creditMultiplier)
const MODEL_MULTIPLIERS: Record<string, number> = {
  'gemini-pro': 1,
  'gemini-2.5-pro': 1,
  'claude-sonnet': 2,
  'claude-opus': 3,
}

interface CreditState {
  // State
  plan: 'free' | 'pro'
  creditsUsed: number
  creditsLimit: number
  dailyUsed: number
  dailyCap: number | null
  remaining: number
  isLoading: boolean
  showUpgradeModal: boolean

  // Actions
  fetchCredits: () => Promise<void>
  incrementUsed: (modelKey?: string) => void
  openUpgradeModal: () => void
  closeUpgradeModal: () => void
}

export const useCreditStore = create<CreditState>()((set, get) => ({
  // Initial state
  plan: 'free',
  creditsUsed: 0,
  creditsLimit: 50,
  dailyUsed: 0,
  dailyCap: 10,
  remaining: 50,
  isLoading: false,
  showUpgradeModal: false,

  // Fetch from server
  fetchCredits: async () => {
    set({ isLoading: true })

    try {
      const jwt = await createJWT()
      if (!jwt) return

      const res = await fetch('/api/credits', {
        headers: { Authorization: `Bearer ${jwt.jwt}` },
      })

      if (!res.ok) return

      const data = await res.json()
      set({
        plan: data.plan,
        creditsUsed: data.creditsUsed,
        creditsLimit: data.creditsLimit,
        dailyUsed: data.dailyUsed,
        dailyCap: data.dailyCap,
        remaining: data.remaining,
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  // Optimistic increment after sending a message
  // Uses model multiplier × 1 (assumes at least one edit action)
  // The periodic server refresh will correct any drift
  incrementUsed: (modelKey?: string) => {
    const multiplier = modelKey ? (MODEL_MULTIPLIERS[modelKey] ?? 1) : 1
    // Optimistic estimate: assume 1 editNode action as minimum cost
    const estimate = multiplier * 1
    const state = get()
    set({
      creditsUsed: state.creditsUsed + estimate,
      dailyUsed: state.dailyUsed + estimate,
      remaining: Math.max(0, state.remaining - estimate),
    })
  },

  openUpgradeModal: () => set({ showUpgradeModal: true }),
  closeUpgradeModal: () => set({ showUpgradeModal: false }),
}))
