import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { voiceController } from "./voiceController";
import { UNDO_PHRASES } from "./voiceGrammar";

// H6 UNDO LAW — the last human silent-death: a mis-heard "हाँ" must be
// reversible by voice. THREE laws, all build-failing here:
//  (a) undo NEVER reverses a money/identity terminal action (accept/reject/
//      complete/bank/aadhaar) — reuse the SAME deny-list as the puppet/agent.
//  (b) undo is idempotent — a double "वापस करो" is not a double revert.
//  (c) a money/identity action can NEVER register an undo (registerUndo refuses).

describe("H6 undo — reversible toggle/value, idempotent, money/identity never undoable", () => {
  it("a reversible (toggle/field) commit is reverted by 'वापस करो'", () => {
    const revert = vi.fn();
    voiceController.registerUndo("toggle:online", revert, "ऑनलाइन", "toggle");
    const acted = voiceController.handleTranscript("वापस करो");
    expect(acted).toBe(true);
    expect(revert).toHaveBeenCalledTimes(1);
  });

  it("LAW (b): a SECOND 'वापस करो' does NOT revert again (idempotent)", () => {
    const revert = vi.fn();
    voiceController.registerUndo("field:दक्षिणा", revert, "दक्षिणा", "field");
    voiceController.handleTranscript("गलत हो गया");
    voiceController.handleTranscript("वापस करो"); // second undo — no-op
    expect(revert).toHaveBeenCalledTimes(1);
  });

  it("LAW (a)+(c): a MONEY action never registers an undo → 'वापस करो' can't revert it", () => {
    const revert = vi.fn();
    voiceController.registerUndo("accept:booking", revert, "बुकिंग स्वीकार", "money");
    voiceController.handleTranscript("वापस करो");
    expect(revert).not.toHaveBeenCalled();
  });

  it("LAW (a)+(c): an IDENTITY action never registers an undo", () => {
    const revert = vi.fn();
    voiceController.registerUndo("aadhaar:submit", revert, "आधार", "identity");
    voiceController.handleTranscript("वापस करो");
    expect(revert).not.toHaveBeenCalled();
  });

  it("undo phrases are full ('वापस करो'), never bare 'वापस' (which stays BACK/nav)", () => {
    expect(UNDO_PHRASES).toContain("वापस करो");
    expect(UNDO_PHRASES).toContain("गलत हो गया");
    expect(UNDO_PHRASES).toContain("रद्द करो");
    expect(UNDO_PHRASES).not.toContain("वापस");
  });

  it("LAW (c) enforcement point: registerUndo consults the SHARED deny-list", () => {
    const src = readFileSync(join(__dirname, "voiceController.ts"), "utf8");
    const idx = src.indexOf("registerUndo(actionId");
    expect(idx).toBeGreaterThan(0);
    // the refusal uses the one shared predicate (never a second deny-list)
    expect(src.slice(idx, idx + 320)).toMatch(/isForbiddenCategory\(category\)/);
  });
});
