// CORS ORIGIN ALLOWANCE (preview-503 fix, founder P0, 2026-07-23).
//
// Root cause: the origin callback rejected any origin not literally in
// ALLOWED_ORIGINS. Production origins are listed → 200; but Vercel PREVIEW URLs
// are DYNAMIC — `hmarepanditji-pandit-<hash>-<team>.vercel.app` and
// `hmarepanditji-<app>-git-<branch>-<team>.vercel.app` — so no env list can
// enumerate them. Every preview of every branch got its /auth/* calls rejected
// with a 5xx, blocking the entire phone-acceptance loop on preview.
//
// Fix in CODE (not env): allow the explicit list AND any preview of OUR OWN
// Vercel projects, so future previews work without touching env. Scoped to our
// project prefixes (hmarepanditji-pandit|web|admin) so it is NOT a blanket
// `*.vercel.app` allow — another team's vercel.app app is still rejected even
// with credentials enabled.

/** Preview/prod URLs of OUR Vercel projects: prefix + optional suffix + .vercel.app.
 *  Covers production (hmarepanditji-pandit.vercel.app), hash previews
 *  (…-a1b2c3-team.vercel.app) and git previews (…-git-branch-team.vercel.app). */
export const VERCEL_PROJECT_ORIGIN = /^https:\/\/hmarepanditji-(pandit|web|admin)[a-z0-9-]*\.vercel\.app$/;

export function isAllowedOrigin(origin: string | undefined, allowed: string[]): boolean {
  if (!origin) return true;                 // same-origin / server-to-server / curl (no Origin header)
  if (allowed.includes(origin)) return true; // explicit (production origins, localhost dev)
  return VERCEL_PROJECT_ORIGIN.test(origin); // any preview of our own projects (dynamic hostnames)
}
