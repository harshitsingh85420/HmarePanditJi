// ─────────────────────────────────────────────────────────────
// A3 — शिष्य PUPPET (Guide Mode). Shishya performs registry actions VISIBLY so
// the pandit WATCHES and learns: a glowing lotus cursor animates from the orb
// to the target, the target presses, the action fires through the SAME registry
// dispatch (never a new code path — confirm flows still trigger), and Shishya
// narrates each step.
//
// THE LAW (guard-tested in shishyaPuppet.test.ts): the puppet may
//   navigate · open · scroll · focus · highlight · FILL a field with the
//   pandit's own spoken value
// but it may NEVER COMPLETE a MONEY or IDENTITY action — accept / reject /
// complete / bank-save / aadhaar-submit / dakshina-save always STOP at the
// confirm step and hand control back ("यहाँ आप ख़ुद हाँ बोलिए — पैसे का मामला
// है"). Filling the dakshina INPUT is `field` (allowed); SAVING it is `money`
// (forbidden) — the terminal press is the pandit's, always.
//
// This module is a LEAF: it takes injected hooks (speak / highlight / handBack)
// and the registry closures as `run`, so it never imports voiceController and
// the dependency direction stays clean.
// ─────────────────────────────────────────────────────────────

/** Per-action taxonomy. `category` drives the puppet deny-list AND the
 *  agent's locate-vs-act fork. Unknown/absent = treated as forbidden. */
export type ActionCategory =
  | "nav" // route change (my-poojas, home)
  | "open" // open a sheet/modal/section
  | "toggle" // online/offline, a preference switch
  | "field" // focus + fill an input with the pandit's OWN value
  | "money" // accept/reject/complete, dakshina-save, payout — TERMINAL, forbidden
  | "identity"; // aadhaar submit, bank-save, KYC — TERMINAL, forbidden

/** The puppet may fully perform every category EXCEPT these; for these it may
 *  only approach (locate + highlight + narrate) and then hand back. */
export const PUPPET_FORBIDDEN_CATEGORIES: readonly ActionCategory[] = ["money", "identity"] as const;

/** THE SINGLE SOURCE OF TRUTH for the money/identity boundary. Every
 *  completion vector consults this one predicate — the puppet (runPuppet), the
 *  agent's tool list (voiceController.buildAgentActions), and any future
 *  actor — so the boundary can never be defined in two places and drift (the
 *  BB1 schism class). An EXPLICITLY money/identity action is a terminal press
 *  only the pandit may make. Unknown/absent is NOT "forbidden" here (a legacy
 *  uncategorised nav/toggle must still be agent-actable) — the puppet's extra
 *  fail-safe for the unknown case lives in canPuppetComplete. */
export function isForbiddenCategory(category: ActionCategory | undefined | null): boolean {
  return !!category && PUPPET_FORBIDDEN_CATEGORIES.includes(category);
}

/** True only when the puppet may fire this category's TERMINAL press itself.
 *  Stricter than !isForbiddenCategory: fails safe so an unknown/absent
 *  category is never auto-completed by the puppet. */
export function canPuppetComplete(category: ActionCategory | undefined | null): boolean {
  if (!category) return false;
  return !isForbiddenCategory(category);
}

export interface PuppetStep {
  actionId: string;
  category: ActionCategory;
  label?: string;
  /** The registry dispatch — the EXACT closure a spoken/tapped match runs
   *  (runCommand/onSelect). Never a bespoke code path. */
  run: () => void;
  /** Line spoken as this step performs ("यह दबा रहा हूँ… अब यहाँ लिखते हैं…"). */
  narrate?: string;
}

export interface PuppetHooks {
  /** Narrate a step (one-voice law: goes through the controller's speak). */
  speak: (line: string) => void;
  /** Scroll the target into view + animate the lotus cursor + press ripple.
   *  Awaited so steps stay sequential and watchable. */
  highlight: (step: PuppetStep) => void | Promise<void>;
  /** Stop-and-hand-back: a forbidden terminal action, or DEMO's final press.
   *  The target is left highlighted; the pandit does the press himself. */
  onHandBack: (step: PuppetStep, reason: string) => void;
  /** A4 DEMO mode: teach, don't do — the FINAL step's press is replaced by
   *  "अब आप दबाइए" and the ring stays until the pandit does it. */
  demo?: boolean;
}

export interface PuppetResult {
  completed: boolean;
  /** index the run stopped at, or -1 when it completed the whole script. */
  stoppedAt: number;
  /** why it stopped: the forbidden category, "demo", or undefined if completed. */
  reason?: string;
}

/**
 * Run a puppet script step-by-step, visibly. Each step is highlighted +
 * narrated; allowed steps then dispatch through their real registry closure.
 * The instant a step is a forbidden MONEY/IDENTITY terminal action, the puppet
 * STOPS — it locates and highlights the control but NEVER dispatches it — and
 * hands back to the pandit. In DEMO mode the final step also hands back.
 */
export async function runPuppet(
  steps: readonly PuppetStep[],
  hooks: PuppetHooks,
): Promise<PuppetResult> {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    // Always LOCATE first — the pandit's eye follows the cursor to the control.
    await hooks.highlight(step);
    if (step.narrate) hooks.speak(step.narrate);

    // THE LAW: a money/identity terminal action is never completed by the
    // puppet. Locate + highlight only, then hand the press back.
    if (!canPuppetComplete(step.category)) {
      hooks.onHandBack(step, step.category);
      return { completed: false, stoppedAt: i, reason: step.category };
    }

    // A4 DEMO: the very last press is the pandit's — teach, don't do.
    if (hooks.demo && i === steps.length - 1) {
      hooks.onHandBack(step, "demo");
      return { completed: false, stoppedAt: i, reason: "demo" };
    }

    // Dispatch through the SAME registry path a tap/voice match takes, so any
    // confirmSpeech / confirm-dialog still triggers exactly as normal.
    step.run();
  }
  return { completed: true, stoppedAt: -1 };
}
