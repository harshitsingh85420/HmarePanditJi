import assert from "node:assert";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// BUILD-FAILING GUARD — per-pandit tutorial progress persistence.
// Deck A/B resume + skip recording is server-side (PanditProfile.tutorialProgress).
// This guard pins: the routes are on the SINGULAR /pandit side, role-gated; the
// resume pointer is monotonic; and completed/skipped are STICKY (a pandit's
// having-seen/-skipped a deck must never be un-recorded, so Deck B never
// re-auto-starts after it was done/skipped once).
console.log("Running tutorial-progress guard…");

const SRC = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(SRC, rel), "utf8");

// 1. routes registered on the SINGULAR side, auth + roleGuard('PANDIT')
const appTs = read("app.ts");
for (const m of ["get", "patch"]) {
  const rx = new RegExp(
    `app\\.${m}\\(\`\\$\\{API_PREFIX\\}/pandit/tutorial\`,\\s*\\{ preHandler: \\[authenticate, roleGuard\\("PANDIT"\\)\\] \\}`,
  );
  assert.ok(rx.test(appTs), `/pandit/tutorial ${m.toUpperCase()} must be role-gated on the singular side`);
}

// 2. controller discipline
const ctrl = read("controllers/tutorial.controller.ts");
// monotonic resume pointer
assert.ok(/Math\.max\(prev\.slide[^)]*\)/.test(ctrl), "resume slide must advance monotonically (Math.max)");
// completed/skipped are STICKY (set true, never cleared by a PATCH)
assert.ok(/body\.completed === true\)\s*next\.completed = true/.test(ctrl), "completed must be sticky (set-true only)");
assert.ok(/body\.skipped === true\)\s*next\.skipped = true/.test(ctrl), "skipped must be sticky (set-true only)");
// the first-home trigger derives from deckB completed/skipped
assert.ok(/deckBFirstArrival:\s*!deckB\.completed\s*&&\s*!deckB\.skipped/.test(ctrl), "deckBFirstArrival must derive from deckB completed/skipped");
// profile resolved via userId (never the user id as PanditProfile PK)
assert.ok(/findUnique\(\{ where: \{ userId \} \}\)/.test(ctrl), "profile must be resolved via userId");

console.log("tutorial-progress guard: singular role-gated routes, monotonic resume, sticky completed/skipped ✅");
