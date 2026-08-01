export const meta = {
  name: 'premise-audit-same-origin-fetch',
  description: 'Every same-origin/relative fetch across all three apps that does NOT resolve through resolveApiBase — 404-in-production candidates of F-J4-5 shape',
  phases: [
    { title: 'Sweep', detail: 'per-app hunt for relative/same-origin API calls' },
    { title: 'Classify', detail: 'separate genuine Next route handlers from API-server calls' },
    { title: 'Verify', detail: 'two adversarial verifiers per candidate: served-ness and reachability' },
  ],
}

const REPO = 'C:/Users/Lenovo/Desktop/accouting/HmarePanditJi'

const SITE_SCHEMA = {
  type: 'object',
  properties: {
    sites: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          line: { type: 'number' },
          urlLiteral: { type: 'string', description: 'the verbatim URL expression passed to fetch' },
          usesResolveApiBase: { type: 'boolean' },
          usesApiBaseConst: { type: 'boolean', description: 'true if it interpolates API_BASE/API_URL derived from resolveApiBase' },
          looksLikeNextRouteHandler: { type: 'boolean', description: 'true if a matching app/api/**/route.ts exists IN THE SAME APP' },
          matchingRouteHandlerPath: { type: 'string', description: 'path of the route.ts that serves it, or "NONE FOUND"' },
          onFailureBehaviour: { type: 'string', description: 'verbatim: what the else/catch does — silent hardcoded fallback, error state, nothing' },
        },
        required: ['file', 'line', 'urlLiteral', 'usesResolveApiBase', 'usesApiBaseConst', 'looksLikeNextRouteHandler', 'matchingRouteHandlerPath', 'onFailureBehaviour'],
      },
    },
    coverageNote: { type: 'string', description: 'what you searched for and anything you could NOT cover' },
  },
  required: ['sites', 'coverageNote'],
}

phase('Sweep')

// THE PREMISE THAT WAS NEVER CHECKED: when the un-prefixed 308 forgiveness
// shim was deleted (services/api/src/app.ts, 2026-07-29), the stated reason
// was "all 26 client call sites now resolve through resolveApiBase". At least
// one did not — apps/web/app/pandit/[id]/TravelOptionsTab.tsx — and it has
// 404'd on 100% of traffic ever since. This sweep sizes that class.
const SWEEP = (app, extra) =>
  `Repo: ${REPO}. Find EVERY fetch/XHR call in ${app} whose URL is SAME-ORIGIN or RELATIVE — ` +
  `i.e. it starts with "/" or is otherwise not built from resolveApiBase / an API_BASE constant / an ` +
  `absolute http(s) origin.\n\n` +
  `WHY: the backend lives at a DIFFERENT origin (services/api on Render, prefix /api/v1). A relative ` +
  `"/api/..." fetch hits the Next app's own origin. Unless a matching route handler exists inside that ` +
  `same Next app under app/api/**/route.ts, the request 404s in production on every single call. A Next ` +
  `404 RETURNS a response rather than throwing, so res.ok is false and the ELSE branch runs — not the ` +
  `catch. If that else branch substitutes hardcoded data, the app renders invented data forever.\n\n` +
  `KNOWN MEMBER, for calibrating your own coverage — you MUST surface it or declare your sweep incomplete: ` +
  `apps/web/app/pandit/[id]/TravelOptionsTab.tsx line ~33 calls fetch("/api/travel/calculate").\n\n` +
  `CRITICAL DISTINCTION: some relative /api/... calls are CORRECT because the app genuinely hosts that ` +
  `route handler itself (e.g. an app/api/tts/route.ts inside the same app). For each site you MUST check ` +
  `whether a matching route.ts exists IN THAT SAME APP and report the path or "NONE FOUND". Do not ` +
  `report a served route as a defect.\n\n` +
  `Also record, verbatim, what the failure branch does — especially any hardcoded fallback data.\n\n` +
  `${extra}\n\nSearch thoroughly: grep for fetch(", fetch(\`, fetch('/ , axios, XMLHttpRequest, and any ` +
  `shared api helper. Be exhaustive and state your coverage honestly in coverageNote.`

const [web, pandit, admin] = await parallel([
  () => agent(SWEEP('apps/web (the CUSTOMER app)',
    'NOTE ON TREES: apps/web/app is the LIVE tree. apps/web/src/app is DEAD (Next resolves root app/). ' +
    'Scan BOTH but mark src/app sites clearly — they matter far less. apps/web also has apps/web/components ' +
    'and apps/web/src/components, both reachable from the live tree by import.'),
    { label: 'sweep:web', phase: 'Sweep', schema: SITE_SCHEMA }),
  () => agent(SWEEP('apps/pandit (the PANDIT app)',
    'NOTE ON TREES: for apps/pandit the LIVE tree IS src/app — the apps/web src/app-is-dead rule does NOT ' +
    'transfer here. apps/pandit legitimately hosts some of its own Next route handlers (look under ' +
    'apps/pandit/src/app/api/**) such as tts and stt-token; those relative calls are CORRECT. Separate them ' +
    'carefully from calls meant for the backend API.'),
    { label: 'sweep:pandit', phase: 'Sweep', schema: SITE_SCHEMA }),
  () => agent(SWEEP('apps/admin (the OPS panel)',
    'Check which tree apps/admin actually uses before reporting reachability.'),
    { label: 'sweep:admin', phase: 'Sweep', schema: SITE_SCHEMA }),
])

const all = [...(web?.sites ?? []), ...(pandit?.sites ?? []), ...(admin?.sites ?? [])]
log(`swept ${all.length} same-origin/relative fetch sites across three apps`)

// A site is a CANDIDATE only if nothing in its own app serves it.
const candidates = all.filter((s) => !s.usesResolveApiBase && !s.usesApiBaseConst && !s.looksLikeNextRouteHandler)
log(`${candidates.length} unserved candidates (of ${all.length} relative sites)`)

phase('Verify')

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    refuted: { type: 'boolean' },
    reasoning: { type: 'string' },
  },
  required: ['refuted', 'reasoning'],
}

const verified = await parallel(candidates.slice(0, 12).map((c) => () =>
  parallel([
    () => agent(
      `Repo: ${REPO}. ADVERSARIAL CHECK — "NOTHING SERVES IT".\n\n` +
      `Claim: ${c.file}:${c.line} calls ${c.urlLiteral}, and NO route handler in its own Next app serves ` +
      `that path, so it 404s in production.\n\n` +
      `REFUTE IT. Check, in this order: (1) does app/api/** in THAT SAME app contain a matching route.ts ` +
      `(including dynamic segments)? (2) does that app's next.config.js declare rewrites() or redirects() ` +
      `that would map it? (3) is there a middleware.ts that proxies it? (4) is there a vercel.json with ` +
      `routes/rewrites? (5) does services/api still register an un-prefixed forgiveness route for this path ` +
      `(the 308 shim — check whether it was deleted and whether this path was in its list)?\n` +
      `If ANY of those serves the path, the claim is refuted. Default refuted=true if you cannot positively ` +
      `establish that nothing serves it.`,
      { label: `served:${c.file.split('/').pop()}:${c.line}`, phase: 'Verify', schema: VERDICT_SCHEMA, effort: 'high' },
    ),
    () => agent(
      `Repo: ${REPO}. REACHABILITY CHECK on ${c.file}:${c.line}.\n\n` +
      `Ignore whether the URL resolves. Answer only: can a real user in the DEPLOYED app reach this line? ` +
      `Trace importers and inbound navigation to the containing component/route.\n\n` +
      `TREE RULES, apply the right one: apps/web — LIVE tree is apps/web/app, and apps/web/src/app is DEAD. ` +
      `apps/pandit — LIVE tree IS src/app. Check apps/admin's own layout before assuming. A component with ` +
      `ZERO importers is unreachable regardless of which tree it sits in — check importers explicitly.\n` +
      `Set refuted=true if unreachable, and say WHICH reason (dead tree / zero importers / dev-only guard).`,
      { label: `reach:${c.file.split('/').pop()}:${c.line}`, phase: 'Verify', schema: VERDICT_SCHEMA, effort: 'high' },
    ),
  ]).then((votes) => {
    const good = votes.filter(Boolean)
    return { ...c, survives: good.length === 2 && good.every((v) => !v.refuted), votes: good }
  })
))

const confirmed = verified.filter(Boolean).filter((v) => v.survives)
const killed = verified.filter(Boolean).filter((v) => !v.survives)
if (candidates.length > 12) log(`NOTE: ${candidates.length - 12} candidates beyond the 12 verified were NOT verified — not silently dropped`)
log(`CONFIRMED ${confirmed.length} · refuted ${killed.length}`)

return {
  totalRelativeSites: all.length,
  unservedCandidates: candidates.length,
  verifiedCount: Math.min(candidates.length, 12),
  notVerified: Math.max(0, candidates.length - 12),
  confirmed: confirmed.map((c) => ({ file: c.file, line: c.line, url: c.urlLiteral, onFailure: c.onFailureBehaviour })),
  refuted: killed.map((k) => ({ file: k.file, line: k.line, url: k.urlLiteral, why: k.votes.filter((v) => v.refuted).map((v) => v.reasoning.slice(0, 400)) })),
  servedCorrectly: all.filter((s) => s.looksLikeNextRouteHandler).map((s) => ({ file: s.file, line: s.line, url: s.urlLiteral, servedBy: s.matchingRouteHandlerPath })),
  coverage: { web: web?.coverageNote, pandit: pandit?.coverageNote, admin: admin?.coverageNote },
}
