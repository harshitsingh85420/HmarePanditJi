// Deploy-verification marker (2026-07-23). Returns the deployed git SHA so a
// push can be VERIFIED live — poll /version and confirm the commit matches,
// instead of assuming "deployed" (Vercel silently keeps serving the last good
// build, so a push proves nothing). See docs/review/credential-rotations.md.
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA || "unknown",
    ref: process.env.VERCEL_GIT_COMMIT_REF || "unknown",
  });
}
