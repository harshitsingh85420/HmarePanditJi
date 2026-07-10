// L3/L4 live checks for English-as-a-language (run: node scripts/check-english-live.mjs)
// 1. /voice/translate target=en — proves the server's Sarvam Mayura
//    en-IN target mapping works against the LIVE API.
// 2. pandit /api/tts languageCode=en-IN — proves Sarvam bulbul v3
//    synthesizes English live (aditya speaker ladder applies).
// Prints statuses, timing, and sample text only — NEVER secrets.

const API = "https://hmarepanditji-api.onrender.com/api/v1";
const PANDIT = "https://hmarepanditji-pandit.vercel.app";

async function timedFetch(label, url, init, timeoutMs = 90000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    const ms = Date.now() - started;
    let body = null;
    try { body = await res.json(); } catch { /* non-json */ }
    return { label, status: res.status, ms, body };
  } catch (err) {
    return { label, status: `ERR:${err.name}`, ms: Date.now() - started, body: null };
  } finally {
    clearTimeout(timer);
  }
}

// a) translate hi → en (includes a brand token to show its treatment)
const tr = await timedFetch(
  "translate en",
  `${API}/voice/translate`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      texts: ["नमस्ते पंडित जी! मैं शिष्य हूँ, आपका सहायक।", "आगे बढ़ें"],
      target: "en",
    }),
  },
);
console.log(`[${tr.label}] status=${tr.status} in ${tr.ms}ms (cold start possible)`);
if (tr.body?.data?.translations) {
  tr.body.data.translations.forEach((t, i) => console.log(`  [${i}] ${t}`));
} else if (tr.body?.error) {
  console.log(`  error: ${tr.body.error.code || ""} ${tr.body.error.message || ""}`);
}

// b) live English TTS via the pandit app's Sarvam proxy
const tts = await timedFetch(
  "tts en-IN",
  `${PANDIT}/api/tts`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "Hello Pandit ji! I will speak with you in English from now on.",
      languageCode: "en-IN",
    }),
  },
);
const audioLen = tts.body?.audioBase64?.length ?? 0;
console.log(`[${tts.label}] status=${tts.status} in ${tts.ms}ms audioBase64=${audioLen} chars${audioLen > 1000 ? " ✓ real audio" : ""}`);
