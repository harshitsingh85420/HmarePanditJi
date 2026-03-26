import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/referral/validate
 * Validate referral code
 * 
 * Input: { code: string }
 * Output: { valid: boolean, referrerName?: string, benefit?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    // Validate input
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Invalid code format' },
        { status: 400 }
      )
    }

    // Validate format: 6-10 alphanumeric characters
    const codeFormat = /^[A-Za-z0-9]{6,10}$/
    if (!codeFormat.test(code)) {
      return NextResponse.json(
        { valid: false, error: 'Code must be 6-10 alphanumeric characters' },
        { status: 400 }
      )
    }

    // In production, query database to verify code exists
    // For now, mock validation - accept any code that meets format requirements
    const normalizedCode = code.toUpperCase()

    // Mock referrer names for demo
    const mockReferrers: Record<string, string> = {
      'PANDIT2024': 'Pandit Ramesh Sharma',
      'SHARMA123': 'Pandit Sharma Ji',
      'KASHI42': 'Pandit Kashi Nath',
      'VARANASI': 'Pandit Varanasi Wale',
    }

    const referrerName = mockReferrers[normalizedCode] || `Pandit ${normalizedCode.slice(0, 3)}...`

    return NextResponse.json({
      valid: true,
      referrerName,
      benefit: '₹100 welcome bonus + 10% off on first booking',
      referrerBenefit: '₹50 for referrer',
    })
  } catch (error) {
    console.error('[Referral API] Validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/referral/validate
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Referral validation API is running' })
}
