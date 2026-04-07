/**
 * POST /api/tailwind-to-inline
 *
 * Converts HTML with Tailwind classes to HTML with inline styles.
 * Used by the DOMParser pipeline — DOMParser only reads element.style,
 * so Tailwind classes must be resolved to inline styles first.
 */

import { NextRequest, NextResponse } from 'next/server'
import { convertTailwindToInline } from '@/lib/parser/tailwind-to-inline'

export const runtime = 'nodejs'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { html } = await req.json()
    if (!html || typeof html !== 'string') {
      return NextResponse.json({ error: 'Missing html field' }, { status: 400 })
    }

    const result = await convertTailwindToInline(html)

    if (result.unresolvedClasses.length > 0) {
      console.log(
        `[tailwind-to-inline] ${result.unresolvedClasses.length} unresolved:`,
        result.unresolvedClasses.slice(0, 10).join(', ')
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[tailwind-to-inline] Error:', error.message)
    return NextResponse.json(
      { error: 'Conversion failed', details: error.message },
      { status: 500 }
    )
  }
}
