import { describe, it, expect } from "vitest";
import {
  canPuppetComplete,
  runPuppet,
  PUPPET_FORBIDDEN_CATEGORIES,
  type PuppetStep,
} from "./shishyaPuppet";

// A3 LAW — THE PUPPET MAY NEVER COMPLETE A MONEY OR IDENTITY ACTION.
// Guide Mode lets शिष्य visibly perform actions FOR the pandit; the one thing
// that would be catastrophic is the puppet auto-accepting a booking, saving a
// dakshina, or submitting Aadhaar/bank on his behalf. This behavioral guard
// drives the REAL runPuppet state machine and FAILS THE BUILD if a money/
// identity terminal step ever dispatches, or if the deny-list is weakened.

describe("A3 shishyaPuppet — money/identity deny-list", () => {
  it("money + identity are forbidden; nav/open/toggle/field are completable", () => {
    expect([...PUPPET_FORBIDDEN_CATEGORIES].sort()).toEqual(["identity", "money"]);
    expect(canPuppetComplete("money")).toBe(false);
    expect(canPuppetComplete("identity")).toBe(false);
    for (const c of ["nav", "open", "toggle", "field"] as const) {
      expect(canPuppetComplete(c)).toBe(true);
    }
    // fail-safe: an unknown/absent category is never auto-completed
    expect(canPuppetComplete(undefined)).toBe(false);
    expect(canPuppetComplete(null)).toBe(false);
  });

  it("runPuppet fires allowed steps but NEVER dispatches a money step", async () => {
    const fired: string[] = [];
    const handBacks: Array<[string, string]> = [];
    const steps: PuppetStep[] = [
      { actionId: "nav-poojas", category: "nav", run: () => fired.push("nav-poojas") },
      { actionId: "open-add-sheet", category: "open", run: () => fired.push("open-add-sheet") },
      { actionId: "fill-dakshina-input", category: "field", run: () => fired.push("fill-dakshina-input") },
      { actionId: "dakshina-save", category: "money", run: () => fired.push("dakshina-save") },
      { actionId: "should-never-reach", category: "nav", run: () => fired.push("should-never-reach") },
    ];
    const res = await runPuppet(steps, {
      speak: () => {},
      highlight: () => {},
      onHandBack: (s, r) => handBacks.push([s.actionId, r]),
    });
    // the field FILL runs (the pandit's own value), the SAVE never does
    expect(fired).toEqual(["nav-poojas", "open-add-sheet", "fill-dakshina-input"]);
    expect(fired).not.toContain("dakshina-save");
    expect(fired).not.toContain("should-never-reach"); // stopped at the money step
    expect(handBacks).toEqual([["dakshina-save", "money"]]);
    expect(res).toEqual({ completed: false, stoppedAt: 3, reason: "money" });
  });

  it("an identity terminal step (aadhaar submit) hands back, never fires", async () => {
    const fired: string[] = [];
    let handBack = "";
    const steps: PuppetStep[] = [
      { actionId: "nav-aadhaar", category: "nav", run: () => fired.push("nav-aadhaar") },
      { actionId: "aadhaar-submit", category: "identity", run: () => fired.push("aadhaar-submit") },
    ];
    const res = await runPuppet(steps, {
      speak: () => {},
      highlight: () => {},
      onHandBack: (s) => { handBack = s.actionId; },
    });
    expect(fired).toEqual(["nav-aadhaar"]);
    expect(handBack).toBe("aadhaar-submit");
    expect(res.reason).toBe("identity");
  });

  it("A4 DEMO mode hands over the FINAL press even for an allowed action", async () => {
    const fired: string[] = [];
    let handBack = "";
    const steps: PuppetStep[] = [
      { actionId: "nav-settings", category: "nav", run: () => fired.push("nav-settings") },
      { actionId: "toggle-online", category: "toggle", run: () => fired.push("toggle-online") },
    ];
    const res = await runPuppet(steps, {
      speak: () => {},
      highlight: () => {},
      onHandBack: (s) => { handBack = s.actionId; },
      demo: true,
    });
    // demo teaches: the nav runs, but the final toggle press is the pandit's
    expect(fired).toEqual(["nav-settings"]);
    expect(handBack).toBe("toggle-online");
    expect(res.reason).toBe("demo");
  });

  it("highlight (locate) runs for the forbidden step BEFORE handing back", async () => {
    const highlighted: string[] = [];
    const steps: PuppetStep[] = [
      { actionId: "accept-booking", category: "money", run: () => { throw new Error("must not run"); } },
    ];
    await runPuppet(steps, {
      speak: () => {},
      highlight: (s) => { highlighted.push(s.actionId); },
      onHandBack: () => {},
    });
    // the pandit still SEES where the button is — locate happens, dispatch doesn't
    expect(highlighted).toEqual(["accept-booking"]);
  });
});
