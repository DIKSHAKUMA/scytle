/**
 * GET /api/credits — Return current user's credit status
 */

import { getUserFromJWT } from '@/lib/appwrite-server'
import { checkCredits, PLAN_LIMITS, ACTION_WEIGHTS } from '@/lib/credits'
import { MODELS } from '@/lib/ai/model-defs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const user = await getUserFromJWT(req.headers.get('authorization'))
  if (!user) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const credit = await checkCredits(user.$id)
  const limits = PLAN_LIMITS[credit.plan]

  return Response.json({
    plan: credit.plan,
    creditsUsed: credit.creditsUsedMonth,
    creditsLimit: limits.monthlyCredits,
    dailyUsed: credit.dailyUsed,
    dailyCap: limits.dailyCap,
    remaining: credit.remaining,
    // Cost info for UI tooltips
    actionWeights: ACTION_WEIGHTS,
    modelMultipliers: Object.fromEntries(
      MODELS.map(m => [m.key, m.creditMultiplier])
    ),
  })
}
