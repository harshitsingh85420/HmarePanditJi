import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// LAW L-C — NO ACTION FROM AN UNTRUSTED TRANSCRIPT.
// Root class it kills: "command/action executed without a trust gate" (matrix
// E1, confirmed SILENT_DEATH). The field-VALUE path had a 0.55 confidence floor;
// the COMMAND / nav / option / SLEEP-mute path had NONE — a conf=0.3 noise blob
// Deepgram rendered as a grammar word (आगे / हाँ / सो जाओ) executed with no floor
// and no surfaced error. This grep-guard FAILS THE BUILD if handleTranscript
// stops gating on confidence, or if an STT caller reverts to passing bare text.
const SRC = join(__dirname, "..");
const read = (rel: string) => readFileSync(join(SRC, rel), "utf-8");

describe("L-C command trust gate — sub-floor transcripts never act", () => {
  const vc = read("lib/voiceController.ts");

  it("handleTranscript takes a confidence and defines the command floor", () => {
    expect(vc).toMatch(/handleTranscript\(text:\s*string,\s*confidence\s*=\s*1\)/);
    expect(vc).toContain("COMMAND_CONFIDENCE_FLOOR = 0.55");
  });

  it("gates BEFORE any command/option/nav dispatch (returns false sub-floor)", () => {
    const htIdx = vc.indexOf("handleTranscript(text: string, confidence");
    expect(htIdx).toBeGreaterThan(0);
    const floorIdx = vc.indexOf("confidence < this.COMMAND_CONFIDENCE_FLOOR", htIdx);
    const dispatchIdx = vc.indexOf("this.activeVoiceScreen()", htIdx);
    expect(floorIdx).toBeGreaterThan(0);
    // the floor check must precede the screen-command / grammar dispatch
    expect(floorIdx).toBeLessThan(dispatchIdx);
    expect(vc.slice(floorIdx, floorIdx + 300)).toMatch(/return false/);
  });

  it("both STT-driven callers pass the real confidence (no bare-text command dispatch)", () => {
    const uvs = read("hooks/useVoiceScreen.ts");
    expect(uvs).toMatch(/handleTranscript\(text,\s*voiceInput\.confidence/);

    const vf = read("components/voice/VoiceField.tsx");
    // every command fallthrough passes conf; none dispatch bare (text) as a command
    expect(vf).not.toMatch(/handleTranscript\(text\)\)/);
    const confCalls = (vf.match(/handleTranscript\(text,\s*conf\)/g) || []).length;
    expect(confCalls).toBeGreaterThanOrEqual(4);
  });
});
