/**
 * POST /api/billing/create-order — Create Razorpay order for Pro upgrade
 */

import { getUserFromJWT } from '@/lib/appwrite-server'
import { createOrder, PRO_PLAN } from '@/lib/razorpay'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const user = await getUserFromJWT(req.headers.get('authorization'))
  if (!user) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const order = await createOrder(user.$id)

    return Response.json({
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: PRO_PLAN.name,
      description: PRO_PLAN.description,
      prefill: {
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('❌ Failed to create Razorpay order:', error)
    return Response.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
