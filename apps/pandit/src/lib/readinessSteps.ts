/** F-J5-1 — the identity step of the readiness wizard.
 *
 *  It lives HERE and not in the hub's page.tsx because a Next.js page module
 *  may only export a fixed set of names (`default`, `dynamic`, `metadata`, …).
 *  Exporting a constant from a page compiles cleanly under `tsc --noEmit` and
 *  FAILS `next build` — which is precisely the gap the pre-push gate exists to
 *  catch, and did.
 *
 *  Named rather than spelled `5` at each use, because it is the ONE step
 *  exempt from the sequential gate (hub) and from the deep-link clamp
 *  (wizard), and that exemption should be legible at both sites.
 */
export const IDENTITY_STEP = 5;
