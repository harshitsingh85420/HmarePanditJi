import { NextRequest, NextResponse } from 'next/server'

// ─────────────────────────────────────────────────────────────
// TRANSLATE API ROUTE
// Proxies requests to Sarvam AI Mayura Translation API
// Uses server-side SARVAM_API_KEY (never exposed to browser)
// Features: LRU cache (500 entries), retry logic
// ─────────────────────────────────────────────────────────────

// LRU Cache implementation (500 entries max)
class LRUCache<K, V> {
  private cache: Map<K, V>
  private maxSize: number

  constructor(maxSize: number = 500) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined
    }
    // Re-insert to move to end (most recently used)
    const value = this.cache.get(key)!
    this.cache.delete(key)
    this.cache.set(key, value)
    return value
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.maxSize) {
      // Delete least recently used (first item)
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(key, value)
  }

  has(key: K): boolean {
    return this.cache.has(key)
  }

  size(): number {
    return this.cache.size
  }

  clear(): void {
    this.cache.clear()
  }
}

// Translation result cache
interface TranslationResult {
  translatedText: string
  confidence: number
}

const translationCache = new LRUCache<string, TranslationResult>(500)

// Rate limiting (100 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute window
  const maxRequests = 100

  const limit = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs }

  if (now > limit.resetTime) {
    // Reset window
    limit.count = 1
    limit.resetTime = now + windowMs
  } else if (limit.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  } else {
    limit.count += 1
  }

  rateLimitMap.set(ip, limit)
  return { allowed: true, remaining: maxRequests - limit.count }
}

// Retry logic with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 2
): Promise<Response> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)

      if (response.ok) {
        return response
      }

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response
      }

      lastError = new Error(`Attempt ${attempt + 1} failed with status ${response.status}`)
      console.warn(`[Translate Route] Retry attempt ${attempt + 1}/${maxRetries} failed:`, lastError.message)

      // Exponential backoff: 500ms, 1000ms
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)))
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)))
      }
    }
  }

  throw lastError || new Error('All retry attempts failed')
}

/**
 * POST /api/translate
 * Translate text between Indian languages using Sarvam Mayura API
 *
 * Input: {
 *   text: string,
 *   sourceLanguage: string (e.g., 'en-IN'),
 *   targetLanguage: string (e.g., 'hi-IN')
 * }
 *
 * Output: {
 *   translatedText: string,
 *   confidence: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { text, sourceLanguage, targetLanguage } = body

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: 'text too long (max 5000 chars)' }, { status: 400 })
    }

    if (!sourceLanguage || typeof sourceLanguage !== 'string') {
      return NextResponse.json({ error: 'sourceLanguage is required' }, { status: 400 })
    }

    if (!targetLanguage || typeof targetLanguage !== 'string') {
      return NextResponse.json({ error: 'targetLanguage is required' }, { status: 400 })
    }

    // Check cache first
    const cacheKey = `${sourceLanguage}:${targetLanguage}:${text}`
    const cached = translationCache.get(cacheKey)
    if (cached) {
      return NextResponse.json({
        translatedText: cached.translatedText,
        confidence: cached.confidence,
        cached: true,
      })
    }

    // Validate API key
    const apiKey = process.env.SARVAM_API_KEY

    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json(
        { error: 'Translation not configured — add SARVAM_API_KEY to .env.local' },
        { status: 503 }
      )
    }

    // Call Sarvam Mayura Translation API
    const sarvamResponse = await fetchWithRetry('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [text.trim()],
        source_language_code: sourceLanguage,
        target_language_code: targetLanguage,
        model: 'mayura:v1',
      }),
    })

    if (!sarvamResponse.ok) {
      const errorText = await sarvamResponse.text()
      console.error('[Translate Route] Sarvam error:', sarvamResponse.status, errorText)
      return NextResponse.json(
        { error: 'Translation upstream failed' },
        { status: 502 }
      )
    }

    const data = await sarvamResponse.json() as { translated_texts?: string[]; confidence_scores?: number[] }

    if (!data.translated_texts || data.translated_texts.length === 0) {
      return NextResponse.json({ error: 'No translation in response' }, { status: 502 })
    }

    const translatedText = data.translated_texts[0]
    const confidence = data.confidence_scores?.[0] ?? 0.92

    // Cache the result
    translationCache.set(cacheKey, {
      translatedText,
      confidence,
    })

    return NextResponse.json({
      translatedText,
      confidence,
      cached: false,
    })
  } catch (error) {
    console.error('[Translate Route] Error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/translate
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Translation API is running',
    cacheSize: translationCache.size(),
  })
}
