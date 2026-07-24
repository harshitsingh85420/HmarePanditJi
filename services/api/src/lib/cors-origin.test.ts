import assert from "node:assert";
import { isAllowedOrigin, VERCEL_PROJECT_ORIGIN } from "./cors-origin";

// ─────────────────────────────────────────────────────────────
// BUILD-FAILING GUARD — CORS preview allowance (founder P0, 2026-07-23).
// The preview-503: dynamic Vercel preview origins weren't in ALLOWED_ORIGINS,
// so the origin callback rejected them → 5xx on every /auth/* call from every
// preview branch. Fix: allow the explicit list AND any preview of OUR OWN Vercel
// projects. This pins:
//   · production + hash previews + git previews of our projects → allowed;
//   · OTHER teams' vercel.app apps + lookalikes + random origins → rejected
//     (credentials:true makes a blanket allow dangerous);
//   · THE EXACT BUG: a preview origin with an EMPTY allowlist is allowed (it was
//     rejected before → the 503).
// Proven-to-fail: narrow the regex back to a fixed host and the preview cases
// go red.
// ─────────────────────────────────────────────────────────────

console.log("Running cors-origin guard (preview allowance + no blanket vercel.app)…");

// no origin (curl / same-origin / server-to-server) — always allowed
assert.ok(isAllowedOrigin(undefined, []), "missing Origin must be allowed");

// production origins of our projects — allowed even with an empty env list
for (const o of [
  "https://hmarepanditji-pandit.vercel.app",
  "https://hmarepanditji-web.vercel.app",
  "https://hmarepanditji-admin.vercel.app",
]) {
  assert.ok(isAllowedOrigin(o, []), `production origin must be allowed: ${o}`);
}

// DYNAMIC PREVIEWS — the exact class that 503'd. Allowed with an EMPTY list.
for (const o of [
  "https://hmarepanditji-pandit-a1b2c3d4-myteam.vercel.app",       // hash preview
  "https://hmarepanditji-web-git-fix-fee-disclosure-myteam.vercel.app", // git preview
  "https://hmarepanditji-admin-xyz9.vercel.app",
]) {
  assert.ok(isAllowedOrigin(o, []), `preview origin must be allowed (was the 503): ${o}`);
}

// NOT ours / attacks — rejected (blanket *.vercel.app would be a hole)
for (const o of [
  "https://evil-app.vercel.app",                       // another team's project
  "https://not-hmarepanditji-pandit.vercel.app",       // prefix must match at start
  "https://hmarepanditji-pandit.vercel.app.evil.com",  // must END .vercel.app
  "https://hmarepanditji-pandit.evil.com",             // wrong TLD
  "https://attacker.com",
  "http://hmarepanditji-pandit.vercel.app",            // http (not https) — preview is https
]) {
  assert.ok(!isAllowedOrigin(o, []), `must be REJECTED: ${o}`);
}

// explicit allowlist still works (localhost dev, or any listed origin)
assert.ok(isAllowedOrigin("http://localhost:3002", ["http://localhost:3002"]), "explicit localhost must be allowed");
assert.ok(!isAllowedOrigin("http://localhost:9999", ["http://localhost:3002"]), "unlisted localhost must be rejected");

// the regex is anchored (no substring escapes)
assert.ok(VERCEL_PROJECT_ORIGIN.test("https://hmarepanditji-pandit-x.vercel.app"));
assert.ok(!VERCEL_PROJECT_ORIGIN.test("https://x-hmarepanditji-pandit.vercel.app"));

console.log("cors-origin guard: previews allowed, our projects only, no blanket vercel.app ✅");
