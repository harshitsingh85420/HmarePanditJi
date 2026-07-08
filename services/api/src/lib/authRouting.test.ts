import assert from "node:assert";
import { isProfileComplete, authLanding } from "./authRouting";

console.log("Running authRouting unit tests...");

// Branch 1: completed profile → HOME, even with PENDING verification.
// (Verification gates features via the home banner, never entry.)
{
  const r = authLanding({ fullName: "पंडित रमेश शर्मा", isNewUser: false });
  assert.strictEqual(r.profileComplete, true);
  assert.strictEqual(r.landing, "HOME");
  // isNewUser is irrelevant once the profile is complete
  assert.strictEqual(authLanding({ fullName: "पंडित रमेश शर्मा", isNewUser: true }).landing, "HOME");
}

// Branch 2: existing account, incomplete profile → wizard resumes its saved step
{
  const r = authLanding({ fullName: "", isNewUser: false });
  assert.strictEqual(r.profileComplete, false);
  assert.strictEqual(r.landing, "WIZARD_RESUME");
  assert.strictEqual(authLanding({ fullName: null, isNewUser: false }).landing, "WIZARD_RESUME");
  assert.strictEqual(authLanding({ fullName: "   ", isNewUser: false }).landing, "WIZARD_RESUME");
}

// Branch 3: brand-new account → wizard step 1
{
  const r = authLanding({ fullName: null, isNewUser: true });
  assert.strictEqual(r.profileComplete, false);
  assert.strictEqual(r.landing, "WIZARD_NEW");
}

// isProfileComplete edge cases (Devanagari, whitespace, undefined)
{
  assert.strictEqual(isProfileComplete("पंडित सुरेश त्रिपाठी"), true);
  assert.strictEqual(isProfileComplete(undefined), false);
  assert.strictEqual(isProfileComplete(null), false);
  assert.strictEqual(isProfileComplete(""), false);
  assert.strictEqual(isProfileComplete("  "), false);
}

console.log("✓ authRouting tests passed");
