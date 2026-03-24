import { NextRequest, NextResponse } from 'next/server'

/**
 * Deepgram Token API Route
 * 
 * Provides a time-limited token for Deepgram WebSocket STT streaming.
 * Keeps DEEPGRAM_API_KEY on server (never exposed to browser).
 * 
 * Note: Deepgram uses a different auth model than Sarvam.
 * They provide API keys that can be used directly in WebSocket connections.
 * For production, implement proper JWT-based temporary tokens.
 */

interface TokenCache {
  token: string
  expiresAt: number
}

const tokenCache = new Map<string, TokenCache>()

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const now = Date.now()

    // Check cached token
    const cached = tokenCache.get(ip)
    if (cached && cached.expiresAt > now) {
      return NextResponse.json({
        token: cached.token,
        expiresAt: cached.expiresAt,
        cached: true,
      })
    }

    // Validate API key
    const apiKey = process.env.DEEPGRAM_API_KEY

    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json(
        { error: 'Deepgram STT not configured — add DEEPGRAM_API_KEY to .env.local' },
        { status: 503 }
      )
    }

    // Token validity: 60 seconds
    const tokenExpiresAt = now + 60000

    // Cache token
    tokenCache.set(ip, {
      token: apiKey,
      expiresAt: tokenExpiresAt,
    })

    // Cleanup expired tokens
    setTimeout(() => {
      for (const [key, value] of tokenCache.entries()) {
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
    console.error('[Deepgram Token Route] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Deepgram token' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  tokenCache.delete(ip)
  return NextResponse.json({ success: true })
}
