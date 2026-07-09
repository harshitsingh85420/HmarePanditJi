// Live auth diagnosis ladder (DEFECT 1). Run: node scripts/check-auth-live.mjs
// Probes the LIVE Render API exactly as the Vercel pandit app would.
// Prints statuses, bodies, response times, and CORS preflight headers.
// No secrets: uses the dev OTP flow only.

const API = "https://hmarepanditji-api.onrender.com";
const ORIGIN = "https://hmarepanditji-pandit.vercel.app";
const PHONE = "+919999999999";

const PATHS = {
  send: ["/api/v1/auth/otp/send", "/auth/otp/send"],
  verify: ["/api/v1/auth/otp/verify", "/auth/otp/verify"],
};

async function timedFetch(label, url, init, timeoutMs = 90000) {
  const t0 = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    const ms = Date.now() - t0;
    const body = await res.text();
    console.log(`\n[${label}] ${init?.method || "GET"} ${url}`);
    console.log(`  status=${res.status}  time=${ms}ms`);
    console.log(`  body=${body.slice(0, 300)}`);
    return { res, ms, body };
  } catch (e) {
    const ms = Date.now() - t0;
    console.log(`\n[${label}] ${init?.method || "GET"} ${url}`);
    console.log(`  FAILED after ${ms}ms: ${e.name}: ${e.message}`);
    return { res: null, ms, body: null };
  } finally {
    clearTimeout(timer);
  }
}

async function preflight(label, url) {
  const { res } = await timedFetch(label, url, {
    method: "OPTIONS",
    headers: {
      Origin: ORIGIN,
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });
  if (res) {
    for (const h of [
      "access-control-allow-origin",
      "access-control-allow-methods",
      "access-control-allow-headers",
      "access-control-allow-credentials",
      "vary",
    ]) {
      console.log(`  ${h}: ${res.headers.get(h)}`);
    }
  }
}

const json = (o) => ({
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: ORIGIN },
  body: JSON.stringify(o),
});

console.log("═══ DEFECT-1 LIVE AUTH LADDER ═══");
console.log(`API=${API}  origin=${ORIGIN}  phone=${PHONE}`);

// resolve which path prefix is live
let sendPath = null;
for (const p of PATHS.send) {
  const { res } = await timedFetch(`probe ${p}`, API + p, json({ phone: PHONE }));
  if (res && res.status !== 404) {
    sendPath = p;
    break;
  }
}
if (!sendPath) {
  console.log("\n!! Neither send path exists — routing/prefix problem. STOP.");
  process.exit(1);
}
const verifyPath = sendPath.replace("/send", "/verify");

// (a) cold vs warm send
console.log("\n── (a) send: repeat immediately (cold vs warm) ──");
await timedFetch("send WARM-1", API + sendPath, json({ phone: PHONE }));
await timedFetch("send WARM-2", API + sendPath, json({ phone: PHONE }));

// (b) verify with the dev OTP
console.log("\n── (b) verify (OTP_DEV_MODE check) ──");
const v = await timedFetch("verify", API + verifyPath, json({ phone: PHONE, otp: "123456", role: "PANDIT" }));
if (v.body) {
  try {
    const parsed = JSON.parse(v.body);
    console.log(`  → token present: ${!!parsed?.data?.token}  profileComplete=${parsed?.data?.profileComplete}  landing=${parsed?.data?.landing}`);
  } catch { /* body printed above */ }
}

// (c) CORS preflights
console.log("\n── (c) CORS preflight (Origin: vercel app) ──");
await preflight("preflight send", API + sendPath);
await preflight("preflight verify", API + verifyPath);

console.log("\n═══ LADDER COMPLETE ═══");
