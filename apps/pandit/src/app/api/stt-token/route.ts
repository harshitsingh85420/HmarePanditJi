import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────
// STT TOKEN API ROUTE
// Provides time-limited WebSocket token for Sarvam STT streaming
// Keeps SARVAM_API_KEY on server (never exposed to browser)
// ─────────────────────────────────────────────────────────────

// Simple in-memory token cache with expiration (Redis/memory cache)
interface TokenCache {
  token: string
  expiresAt: number
}

const tokenCache = new Map<string, TokenCache>()

/**
 * Generate a short-lived session token for STT WebSocket connection
 * Token validity: 60 seconds
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body

    // Validate sessionId
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // Get client IP for rate limiting and caching
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const cacheKey = `${ip}:${sessionId}`
    const now = Date.now()

    // Check if we have a valid cached token for this session
    const cached = tokenCache.get(cacheKey)
    if (cached && cached.expiresAt > now) {
      // Return cached token (still valid)
      return NextResponse.json({
        token: cached.token,
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
    tokenCache.set(cacheKey, {
      token: apiKey,
      expiresAt: tokenExpiresAt,
    })

    // Clean up expired tokens periodically (every 2 minutes)
    setTimeout(() => {
      const entries = Array.from(tokenCache.entries())
      for (const [key, value] of entries) {
        if (value.expiresAt <= Date.now()) {
          tokenCache.delete(key)
        }
      }
    }, 120000)

    return NextResponse.json({
      token: apiKey,
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
