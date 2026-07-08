// Verifies SARVAM_TTS_SPEAKER against the live Sarvam TTS API.
// Reads SARVAM_API_KEY + SARVAM_TTS_SPEAKER from services/api/.env,
// falling back to the monorepo root .env (which services/api actually
// loads). Calls bulbul:v3 once with "नमस्ते" and prints the verdict;
// on a 4xx the full error body is printed (Sarvam enumerates the valid
// speaker list there). Never prints the API key.
//   node scripts/check-sarvam-speaker.mjs [speakerOverride]
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envFiles = [path.join(root, "services", "api", ".env"), path.join(root, ".env")];

const env = {};
for (const file of envFiles) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    if (!(key in env)) env[key] = m[2].replace(/^["']|["']$/g, "").trim();
  }
}

const apiKey = process.env.SARVAM_API_KEY || env.SARVAM_API_KEY || "";
const speaker = process.argv[2] || process.env.SARVAM_TTS_SPEAKER || env.SARVAM_TTS_SPEAKER || "abhilash";

if (!apiKey) {
  console.error("VERDICT: NO KEY — SARVAM_API_KEY not found in services/api/.env, root .env, or process env.");
  console.error("Add it (never commit it), then re-run: node scripts/check-sarvam-speaker.mjs");
  process.exit(2);
}

console.log(`Checking speaker "${speaker}" against Sarvam bulbul:v3 …`);
const res = await fetch("https://api.sarvam.ai/text-to-speech", {
  method: "POST",
  headers: { "api-subscription-key": apiKey, "Content-Type": "application/json" },
  body: JSON.stringify({
    inputs: ["नमस्ते"],
    target_language_code: "hi-IN",
    speaker,
    pace: 0.9,
    speech_sample_rate: 22050,
    enable_preprocessing: true,
    model: "bulbul:v3",
  }),
});

console.log(`HTTP ${res.status}`);
if (res.ok) {
  const data = await res.json();
  const audio = data?.audios?.[0];
  console.log(`VERDICT: VALID — speaker "${speaker}" produced ${audio ? audio.length : 0} base64 chars of audio.`);
} else {
  const body = await res.text();
  console.log("VERDICT: REJECTED — full error body follows (valid speakers are usually enumerated here):");
  console.log(body);
  process.exit(1);
}
