// AUTH BRANCHING LAW (pandit app) — the single source of the routing
// hints the client uses after OTP verify. A finished pandit is NEVER
// re-onboarded: verification status gates features (amber banner on
// home), not entry. Landing:
//   profile complete            → HOME  (even while PENDING)
//   profile incomplete, existing→ WIZARD_RESUME (saved step)
//   brand-new account           → WIZARD_NEW (step 1)

export function isProfileComplete(fullName: string | null | undefined): boolean {
  return typeof fullName === "string" && fullName.trim().length > 0;
}

export type AuthLanding = "HOME" | "WIZARD_RESUME" | "WIZARD_NEW";

export function authLanding(input: {
  fullName: string | null | undefined;
  isNewUser: boolean;
}): { profileComplete: boolean; landing: AuthLanding } {
  const profileComplete = isProfileComplete(input.fullName);
  if (profileComplete) return { profileComplete, landing: "HOME" };
  return { profileComplete, landing: input.isNewUser ? "WIZARD_NEW" : "WIZARD_RESUME" };
}
