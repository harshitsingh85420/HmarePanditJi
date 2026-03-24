import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────
// TTS API PROXY ROUTE
// Proxies requests to Sarvam AI Bulbul v3 TTS
// Uses server-side SARVAM_API_KEY (never exposed to browser)
// ─────────────────────────────────────────────────────────────

// BUG-048 FIX: Simple in-memory rate limiting (10 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10;

  const limit = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > limit.resetTime) {
    // Reset window
    limit.count = 1;
    limit.resetTime = now + windowMs;
  } else if (limit.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  } else {
    limit.count += 1;
  }

  rateLimitMap.set(ip, limit);
  return { allowed: true, remaining: maxRequests - limit.count };
}

// BUG-049 FIX: Retry logic with exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 2
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.ok) {
        return response;
      }

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      lastError = new Error(`Attempt ${attempt + 1} failed with status ${response.status}`);
      console.warn(`[TTS Route] Retry attempt ${attempt + 1}/${maxRetries} failed:`, lastError.message);

      // Exponential backoff: 500ms, 1000ms
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

export async function POST(request: NextRequest) {
  // BUG-048 FIX: Rate limiting
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  // Rate limit check (basic)
  const body = await request.json() as {
    text?: string;
    languageCode?: string;
    speaker?: string;
    pace?: number;
    pitch?: number;
    loudness?: number;
  };

  if (!body.text || typeof body.text !== 'string' || body.text.trim().length === 0) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  if (body.text.length > 2000) {
    return NextResponse.json({ error: 'text too long (max 2000 chars)' }, { status: 400 });
  }

  const apiKey = process.env.SARVAM_API_KEY;

  // If no API key configured, return 503 so client falls back to Web Speech
  if (!apiKey || apiKey.trim() === '') {
    return NextResponse.json(
      { error: 'TTS not configured — add SARVAM_API_KEY to .env.local' },
      { status: 503 }
    );
  }

  try {
    // BUG-049 FIX: Use retry logic for TTS fetch
    const sarvamResponse = await fetchWithRetry('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [body.text.trim()],
        target_language_code: body.languageCode ?? 'hi-IN',
        speaker: body.speaker ?? 'ratan',
        pitch: body.pitch ?? 0,
        pace: body.pace ?? 0.9,
        loudness: body.loudness ?? 1.0,
        speech_sample_rate: 22050,
        enable_preprocessing: true,   // handles numbers, abbreviations
        model: 'bulbul:v3',
      }),
    });

    if (!sarvamResponse.ok) {
      const errorText = await sarvamResponse.text();
      console.error('[TTS Route] Sarvam error:', sarvamResponse.status, errorText);
      return NextResponse.json(
        { error: 'TTS upstream failed' },
        { status: 502 }
      );
    }

    const data = await sarvamResponse.json() as { audios?: string[] };

    if (!data.audios || data.audios.length === 0) {
      return NextResponse.json({ error: 'No audio in response' }, { status: 502 });
    }

    return NextResponse.json({ audio: data.audios[0] });

  } catch (error) {
    console.error('[TTS Route] Fetch error:', error);
    return NextResponse.json({ error: 'TTS error' }, { status: 500 });
  }
}
