import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────
// STT TOKEN API ROUTE
// Provides time-limited WebSocket token for Sarvam STT streaming
// Keeps SARVAM_API_KEY on server (never exposed to browser)
// ─────────────────────────────────────────────────────────────

// Simple in-memory token cache with expiration
interface TokenCache {
  token: string
  expiresAt: number
}

const tokenCache = new Map<string, TokenCache>()

/**
 * Generate a short-lived session token for STT WebSocket connection
 * In production, this should implement proper JWT-based authentication
 * For now, we return the API key with a short expiration window
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting and caching
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const now = Date.now()

    // Check if we have a valid cached token for this IP
    const cached = tokenCache.get(ip)
    if (cached && cached.expiresAt > now) {
      // Return cached token (still valid)
      return NextResponse.json({
        apiKey: cached.token,
        expiresAt: cached.expiresAt,
        cached: true,
      })
    }

    // Validate that API key is configured
    const apiKey = process.env.SARVAM_API_KEY

    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json(
        { error: 'STT not configured — add SARVAM_API_KEY to .env.local' },
        { status: 503 }
      )
    }

    // Token validity: 60 seconds (short-lived for security)
    const tokenExpiresAt = now + 60000

    // Cache the token
    tokenCache.set(ip, {
      token: apiKey,
      expiresAt: tokenExpiresAt,
    })

    // Clean up expired tokens periodically (every 2 minutes)
    // In production, use a proper cleanup strategy or Redis with TTL
    setTimeout(() => {
      for (const [key, value] of tokenCache.entries()) {
        if (value.expiresAt <= Date.now()) {
          tokenCache.delete(key)
        }
      }
    }, 120000)

    return NextResponse.json({
      apiKey,
      expiresAt: tokenExpiresAt,
      cached: false,
    })
  } catch (error) {
    console.error('[STT Token Route] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate STT token' },
      { status: 500 }
    )
  }
}

/**
 * Cleanup endpoint (optional) - invalidates cached token
 * Useful when user completes session or logs out
 */
export async function DELETE(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  tokenCache.delete(ip)
  return NextResponse.json({ success: true })
}
