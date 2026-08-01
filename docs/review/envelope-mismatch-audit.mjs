export const meta = {
  name: 'envelope-mismatch-audit',
  description: 'Find every API consumption site whose parse disagrees with the endpoint\'s real response envelope (the twin-envelope class)',
  phases: [
    { title: 'Map', detail: 'API envelope table + every fetch call site across all three apps' },
    { title: 'Cross-check', detail: 'match each consumption site against its endpoint\'s real envelope' },
    { title: 'Verify', detail: 'adversarially refute each candidate mismatch' },
  ],
}

const REPO = 'C:/Users/Lenovo/Desktop/accouting/HmarePanditJi'

const ENVELOPE_SCHEMA = {
  type: 'object',
  properties: {
    endpoints: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          method: { type: 'string' },
          path: { type: 'string' },
          controllerFile: { type: 'string' },
          replyShape: { type: 'string', description: 'the literal shape sent, e.g. {success,data:{pandits:[],pagination}} or {success,data:[...]}' },
          payloadIsArrayAt: { type: 'string', description: 'the exact JS expression from the parsed body that yields the ARRAY, e.g. "j.data.pandits" or "j.data" or "NONE - not a list endpoint"' },
        },
        required: ['method', 'path', 'replyShape', 'payloadIsArrayAt'],
      },
    },
  },
  required: ['endpoints'],
}

const CALLSITE_SCHEMA = {
  type: 'object',
  properties: {
    sites: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          line: { type: 'number' },
          urlExpression: { type: 'string' },
          parseExpression: { type: 'string', description: 'verbatim source of how the body is unwrapped, e.g. "const data = j.data ?? j.pandits ?? j"' },
          guardExpression: { type: 'string', description: 'verbatim guard applied before use, e.g. "if (Array.isArray(data) && data.length)" or "NONE"' },
          onFailureBehaviour: { type: 'string', description: 'what happens on error/empty: silent fallback to a literal, error state, nothing' },
        },
        required: ['file', 'line', 'urlExpression', 'parseExpression', 'guardExpression', 'onFailureBehaviour'],
      },
    },
  },
  required: ['sites'],
}

phase('Map')

const [api, webSites, otherSites] = await parallel([
  () => agent(
    `Repo: ${REPO}. Read EVERY route file in services/api/src/routes/*.ts and the controllers they import ` +
    `(services/api/src/controllers/*.ts). For each HTTP endpoint, determine the EXACT shape of the success ` +
    `response body that reaches the client.\n\n` +
    `CRITICAL: many controllers use a helper like successBody(data) => {success, data, message}. Some pass an ` +
    `ARRAY as data. Others pass an OBJECT that CONTAINS the array, e.g. reply.send(successBody({pandits, pagination})). ` +
    `That difference is the entire subject of this audit — record it precisely per endpoint.\n\n` +
    `For each endpoint report payloadIsArrayAt: the exact JS expression, starting from the parsed JSON body ` +
    `(call it j), that yields the ARRAY a client would iterate. Examples: "j.data" when data IS the array; ` +
    `"j.data.pandits" when data is an envelope; "NONE - not a list endpoint" for single-object or mutation routes.\n` +
    `Also note the route PREFIX each router is registered under (see services/api/src/app.ts register calls) so ` +
    `paths are full, e.g. /api/v1/pandits.\n\n` +
    `Do not guess. Open the files. Be exhaustive — every route file, every endpoint.`,
    { label: 'map:api-envelopes', phase: 'Map', schema: ENVELOPE_SCHEMA },
  ),
  () => agent(
    `Repo: ${REPO}. Find EVERY place the CUSTOMER app calls the backend API. The LIVE tree is apps/web/app ` +
    `plus files it imports (which reaches apps/web/src/components and apps/web/components). ` +
    `apps/web/src/app is a DEAD tree — scan it too but mark those sites clearly as file paths under src/app.\n\n` +
    `For each call site record VERBATIM source: the URL expression, how the JSON body is unwrapped, the guard ` +
    `applied before the data is used, and what happens on failure or on an empty result.\n\n` +
    `The pattern of interest, for calibration (this is a KNOWN defect, already found — use it to check your own ` +
    `coverage, and DO include it): apps/web/app/booking/new/booking-wizard-client.tsx around line 300 has ` +
    `"const data = j.data ?? j.pandits ?? j" followed by "if (Array.isArray(data) && data.length)". If your scan ` +
    `does not surface that site, your scan is incomplete — widen it and say so.\n\n` +
    `Be exhaustive. Use grep for fetch(, axios, useSWR, useQuery, and any API helper wrappers you discover.`,
    { label: 'map:web-callsites', phase: 'Map', schema: CALLSITE_SCHEMA },
  ),
  () => agent(
    `Repo: ${REPO}. Same task as a sibling agent but for the OTHER two frontends: apps/pandit and apps/admin. ` +
    `Find EVERY backend API call site. For each record VERBATIM: URL expression, how the JSON body is unwrapped, ` +
    `the guard applied before use, and behaviour on failure/empty.\n\n` +
    `Pay special attention to any site that unwraps with a "??" chain, or that indexes into .data without ` +
    `checking which level holds the array, or that silently keeps a hardcoded literal when parsing yields ` +
    `nothing. Be exhaustive; use grep for fetch(, axios, useSWR, useQuery and any shared api-client helper.`,
    { label: 'map:pandit-admin-callsites', phase: 'Map', schema: CALLSITE_SCHEMA },
  ),
])

const apiTable = api?.endpoints ?? []
const allSites = [...(webSites?.sites ?? []), ...(otherSites?.sites ?? [])]
log(`mapped ${apiTable.length} endpoints and ${allSites.length} consumption sites`)

// BARRIER JUSTIFIED: the cross-check needs the FULL endpoint table to resolve
// any single call site's URL, so it cannot start before Map completes.
phase('Cross-check')

const CANDIDATE_SCHEMA = {
  type: 'object',
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          line: { type: 'number' },
          endpoint: { type: 'string' },
          apiSays: { type: 'string', description: 'where the array actually lives in the response' },
          clientAssumes: { type: 'string', description: 'where the client looks for it' },
          consequence: { type: 'string', description: 'concrete: what the user sees when this mismatch fires' },
          severity: { type: 'string', enum: ['P0', 'HIGH', 'MEDIUM', 'LOW'] },
          firesOnSuccess: { type: 'boolean', description: 'true if the mismatch fires even on a fully successful response' },
        },
        required: ['file', 'line', 'endpoint', 'apiSays', 'clientAssumes', 'consequence', 'severity', 'firesOnSuccess'],
      },
    },
  },
  required: ['candidates'],
}

const crossed = await agent(
  `Repo: ${REPO}. You are given (A) a table of API endpoints with the EXACT expression at which each response's ` +
  `array payload lives, and (B) a list of client call sites with their verbatim unwrapping expressions.\n\n` +
  `A) ENDPOINTS:\n${JSON.stringify(apiTable, null, 1)}\n\n` +
  `B) CALL SITES:\n${JSON.stringify(allSites, null, 1)}\n\n` +
  `For each call site, resolve which endpoint it hits and decide whether its unwrap expression actually yields ` +
  `the payload the API sends. Report every MISMATCH.\n\n` +
  `The severity-defining question for each: does the mismatch fire even on a FULLY SUCCESSFUL response? A parse ` +
  `that silently falls back to hardcoded data on success is P0 — the user is shown invented data while the real ` +
  `data was fetched and discarded. A parse that only misbehaves on error is lower.\n\n` +
  `Open the actual files to confirm each one; do not rely solely on the tables. Report ONLY real mismatches — ` +
  `an empty list is a legitimate and valuable answer. Do not pad.`,
  { label: 'cross-check', phase: 'Cross-check', schema: CANDIDATE_SCHEMA, effort: 'high' },
)

const candidates = (crossed?.candidates ?? []).slice(0, 10)
log(`${candidates.length} candidate mismatches to verify`)

phase('Verify')

const VERDICT_SCHEMA = {
  type: 'object',
  properties: {
    refuted: { type: 'boolean', description: 'true if the claimed mismatch is NOT real' },
    reasoning: { type: 'string' },
    correctedClaim: { type: 'string', description: 'if partially right, the accurate version' },
  },
  required: ['refuted', 'reasoning'],
}

const verified = await parallel(candidates.map((c) => () =>
  parallel([
    () => agent(
      `Repo: ${REPO}. ADVERSARIAL CHECK. A colleague claims this is a real defect:\n\n` +
      `  file: ${c.file}:${c.line}\n  endpoint: ${c.endpoint}\n  API sends array at: ${c.apiSays}\n` +
      `  client looks at: ${c.clientAssumes}\n  claimed consequence: ${c.consequence}\n\n` +
      `Your job is to REFUTE it. Open the client file AND the API controller. Trace the actual runtime values. ` +
      `Common reasons a claim like this is WRONG: a response interceptor or helper already unwraps the envelope; ` +
      `the endpoint has a different shape than assumed; the code path is dead/unreachable; a later line corrects it. ` +
      `Default to refuted=true if you cannot positively confirm the mismatch from the source.`,
      { label: `refute:${c.file.split('/').pop()}`, phase: 'Verify', schema: VERDICT_SCHEMA, effort: 'high' },
    ),
    () => agent(
      `Repo: ${REPO}. REACHABILITY CHECK on a claimed defect at ${c.file}:${c.line} (endpoint ${c.endpoint}).\n\n` +
      `Ignore whether the parse is wrong. Answer only: can a real user REACH this code path in the deployed app? ` +
      `Trace inbound navigation to the containing route/component. Note that apps/web/src/app is a DEAD tree ` +
      `(apps/web/app is live) — a site in the dead tree is unreachable and the claim should be refuted as ` +
      `not-user-facing (say so explicitly in reasoning). Set refuted=true if unreachable.`,
      { label: `reach:${c.file.split('/').pop()}`, phase: 'Verify', schema: VERDICT_SCHEMA, effort: 'high' },
    ),
  ]).then((votes) => {
    const good = votes.filter(Boolean)
    const refutedCount = good.filter((v) => v.refuted).length
    return { ...c, survives: good.length > 0 && refutedCount === 0, votes: good }
  })
))

const confirmed = verified.filter(Boolean).filter((v) => v.survives)
const killed = verified.filter(Boolean).filter((v) => !v.survives)
log(`CONFIRMED ${confirmed.length} · refuted ${killed.length}`)

return {
  endpointsMapped: apiTable.length,
  callSitesMapped: allSites.length,
  confirmed,
  refuted: killed.map((k) => ({ file: k.file, line: k.line, why: k.votes.filter((v) => v.refuted).map((v) => v.reasoning) })),
  endpointTable: apiTable,
}
