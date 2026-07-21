import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// ─────────────────────────────────────────────────────────────
// L3 ONE-VOICE-OWNER — BUILD-FAILING GUARD.
// The microphone LISTEN loop has exactly one owner: the voiceController
// (fed through hooks/useVoiceInput), which alone holds mic custody, the
// wake lock, track-health resurrection, the zombie watchdog, and the
// never-hear-itself lock. A route screen or component that starts its own
// listen loop (the legacy startListeningWithSarvam / voice-engine cascade)
// gets NONE of that — it goes deaf on backgrounding and can speak + listen
// at once. identity/page.tsx did exactly this (reached live via a referral
// link). LAW: no screen or component may start an off-controller listen.
// A future screen wiring startListeningWithSarvam fails the build here.
//
// SCOPE NOTE: raw getUserMedia still appears in onboarding permission
// prompts (ParichayScreen/TutorialV2) and the engine/hooks — routing those
// through the controller's prewarm path is tracked debt, not this law. This
// guard targets the off-controller LISTEN-LOOP primitive, which is the
// deaf-on-background danger.
// ─────────────────────────────────────────────────────────────

const SRC = join(__dirname, "..");
const norm = (p: string) => p.split("\\").join("/");
// screens + components must not import or call the off-controller listen loop
const FORBIDDEN = /\bstartListeningWithSarvam\b/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") continue;
      walk(p, out);
    } else if (/\.(tsx?|jsx?)$/.test(entry) && !/\.(test|spec)\.(tsx?|jsx?)$/.test(entry)) {
      out.push(p);
    }
  }
  return out;
}

describe("L3 one-voice-owner guard", () => {
  it("no screen or component starts an off-controller listen loop", () => {
    const violations: string[] = [];
    for (const file of walk(SRC)) {
      const n = norm(file);
      // the listen loop may live ONLY in the engine lib. (useVoiceCascade, the
      // dead wrapper once excluded here, was DELETED by the F02 build — its
      // doc-shaped ladder strings now live for real in voiceFieldMachine.)
      if (n.includes("/lib/voice-engine")) continue;
      // only police route screens + components (where the deaf-on-bg danger lives)
      const isScreenOrComponent = /\/app\//.test(n) || /\/components\//.test(n);
      if (!isScreenOrComponent) continue;
      if (FORBIDDEN.test(readFileSync(file, "utf8"))) {
        violations.push(n.replace(norm(SRC), "src"));
      }
    }
    expect(
      violations,
      `screen/component hand-rolls its own mic listen (startListeningWithSarvam) — route it through the controller:\n${violations.join("\n")}`,
    ).toEqual([]);
  });
});
