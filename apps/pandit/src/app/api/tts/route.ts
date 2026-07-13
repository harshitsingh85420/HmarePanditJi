import { NextRequest, NextResponse } from 'next/server';
import { VOICE_PROFILE } from "@/lib/voiceProfile";

// Y1 ONE-VOICE DOOR: the profile is the ONLY source of speaker+pace.
// Env vars may still override for ops emergencies, but a CALLER can
// never pick a voice — any body.speaker/body.pace is rejected + logged.
function resolveVoice(): { speaker: string; pace: number } {
  const speaker = process.env.SARVAM_TTS_SPEAKER || VOICE_PROFILE.speaker;
  const envPace = Number.parseFloat(process.env.SARVAM_TTS_PACE ?? String(VOICE_PROFILE.pace));
  const pace = Math.min(2.0, Math.max(0.5, Number.isFinite(envPace) ? envPace : VOICE_PROFILE.pace));
  return { speaker, pace };
}

// ─────────────────────────────────────────────────────────────
// TTS API PROXY ROUTE
// Proxies requests to Sarvam AI Bulbul v3 TTS
// Uses server-side SARVAM_API_KEY (never exposed to browser)
// ─────────────────────────────────────────────────────────────

// BUG-048 FIX: Simple in-memory rate limiting (100 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 100;

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

  // Y1: reject (never honor) any caller attempt to pick the voice/speed.
  if (body.speaker != null) {
    console.warn(`[TTS Route] VOICE OVERRIDE REJECTED: speaker="${body.speaker}" — profile is the only source`);
  }
  if (body.pace != null) {
    console.warn(`[TTS Route] VOICE OVERRIDE REJECTED: pace="${body.pace}" — profile is the only source`);
  }

  if (!body.text || typeof body.text !== 'string' || body.text.trim().length === 0) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }

  if (body.text.length > 2500) {
    return NextResponse.json({ error: 'text too long (max 2500 chars)' }, { status: 400 });
  }

  const apiKey = process.env.SARVAM_API_KEY;

  // No API key (dev without Sarvam): fail FAST with a typed code so the
  // client falls back to speechSynthesis instead of waiting/hanging.
  if (!apiKey || apiKey.trim() === '') {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'tts_unconfigured', message: 'TTS not configured — add SARVAM_API_KEY to .env.local' },
      },
      { status: 501 }
    );
  }

  try {
    // BUG-049 FIX: Use retry logic for TTS fetch
    // NOTE: Bulbul V3 does NOT support pitch and loudness parameters
    // D4: शिष्य is male — speaker comes from SARVAM_TTS_SPEAKER (male
    // default). Valid speaker names vary by model/language, so an
    // invalid-speaker 4xx logs Sarvam's error body (it enumerates the
    // valid options) and retries ONCE without the speaker field so
    // speech never breaks.
    // 'aditya' = first male option in Sarvam's bulbul:v3 speaker list
    // (verified live via scripts/check-sarvam-speaker.mjs). Y1: speaker
    // and pace come ONLY from the profile/env — body values are ignored.
    const { speaker, pace } = resolveVoice();
    const basePayload: Record<string, unknown> = {
      inputs: [body.text.trim()],
      target_language_code: body.languageCode ?? 'hi-IN',
      pace,
      speech_sample_rate: 22050,
      enable_preprocessing: true,   // handles numbers, abbreviations
      model: 'bulbul:v3',
    };
    const callSarvam = (payload: Record<string, unknown>) =>
      fetchWithRetry('https://api.sarvam.ai/text-to-speech', {
        method: 'POST',
        headers: {
          'api-subscription-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

    let sarvamResponse = await callSarvam({ ...basePayload, speaker });

    if (!sarvamResponse.ok && sarvamResponse.status >= 400 && sarvamResponse.status < 500) {
      const errorText = await sarvamResponse.text();
      if (/speaker/i.test(errorText)) {
        console.warn(
          `[TTS Route] Sarvam rejected speaker "${speaker}" — retrying with the API default. ` +
          `Set SARVAM_TTS_SPEAKER to a valid MALE option from this API response: ${errorText}`
        );
        sarvamResponse = await callSarvam(basePayload);
      } else {
        console.error('[TTS Route] Sarvam error:', sarvamResponse.status, errorText);
        return NextResponse.json({ error: 'TTS upstream failed' }, { status: 502 });
      }
    }

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

    return NextResponse.json({ audioBase64: data.audios[0] }, { headers: { 'x-voice': `${speaker}@${pace}` } });

  } catch (error) {
    console.error('[TTS Route] Fetch error:', error);
    return NextResponse.json({ error: 'TTS error' }, { status: 500 });
  }
}
