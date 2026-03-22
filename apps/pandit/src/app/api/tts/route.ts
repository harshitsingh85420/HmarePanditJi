import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────────────────────
// TTS API PROXY ROUTE
// Proxies requests to Sarvam AI Bulbul v3 TTS
// Uses server-side SARVAM_API_KEY (never exposed to browser)
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
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
    const sarvamResponse = await fetch('https://api.sarvam.ai/text-to-speech', {
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
