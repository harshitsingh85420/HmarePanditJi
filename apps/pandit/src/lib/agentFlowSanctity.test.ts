import { describe, it, expect } from "vitest";
import { voiceController } from "@/lib/voiceController";

// ─────────────────────────────────────────────────────────────
// L7 AGENT-FLOW-SANCTITY — BUILD-FAILING BEHAVIORAL GUARD.
// On a critical money/KYC flow (booking accept-confirm, the readiness
// wizard's dakshina + Aadhaar/bank step) the Shishya agent must get ZERO
// tools — it may answer a question but can never accept a booking, submit
// KYC, or navigate away. This asserts the real controller behavior: a
// critical screen yields an empty agent action list; a normal screen
// exposes its command as a tool. If a future change lets a critical
// screen leak tools to the agent, this fails the build.
// ─────────────────────────────────────────────────────────────

describe("L7 agent-flow-sanctity", () => {
  it("a critical screen contributes ZERO agent tools", () => {
    const unregister = voiceController.registerVoiceScreen(
      [{ keywords: ["accept"], action: () => {}, id: "accept-booking", label: "Accept" }],
      "help",
      { critical: true },
    );
    try {
      expect(voiceController.isActiveScreenCritical()).toBe(true);
      expect(voiceController.agentActionsForActiveScreen()).toEqual([]);
    } finally {
      unregister();
    }
  });

  it("a NORMAL screen exposes its command as an agent tool (control)", () => {
    const unregister = voiceController.registerVoiceScreen(
      [{ keywords: ["online"], action: () => {}, id: "go-online", label: "Online" }],
      "help",
    );
    try {
      expect(voiceController.isActiveScreenCritical()).toBe(false);
      const actions = voiceController.agentActionsForActiveScreen();
      expect(actions.some((a) => a.id === "go-online")).toBe(true);
    } finally {
      unregister();
    }
  });
});
