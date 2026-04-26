/**
 * POST /api/billing/verify-payment — Verify Razorpay payment signature & activate Pro
 */

import { getUserFromJWT } from '@/lib/appwrite-server'
import { verifyPaymentSignature } from '@/lib/razorpay'
import { upgradeToPro } from '@/lib/credits'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const user = await getUserFromJWT(req.headers.get('authorization'))
  if (!user) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json()
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return Response.json(
      { error: 'Missing payment verification fields' },
      { status: 400 }
    )
  }

  // Verify signature
  const isValid = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  )

  if (!isValid) {
    console.error('❌ Razorpay signature mismatch for order:', razorpay_order_id)
    return Response.json(
      { error: 'Payment verification failed — signature mismatch' },
      { status: 400 }
    )
  }

  // Signature verified — activate Pro plan
  try {
    await upgradeToPro(user.$id, razorpay_order_id, 30) // 30 days

    console.log(`✅ User ${user.email} upgraded to Pro (order: ${razorpay_order_id})`)

    return Response.json({
      success: true,
      message: 'Payment verified. You are now on the Pro plan!',
      plan: 'pro',
    })
  } catch (error) {
    console.error('❌ Failed to activate Pro plan:', error)
    return Response.json(
      { error: 'Payment verified but failed to activate plan. Please contact support.' },
      { status: 500 }
    )
  }
}
