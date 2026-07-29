// NEXT_PUBLIC_API_URL is an ORIGIN on Vercel. Reading it raw and appending a
// route 404s. The 308 shim covers only /auth/* /pandit/* /pandits/* /voice/* —
// never /admin/*, /bookings, /customers, /muhurat, /reviews, or bare /pandits.
import { resolveApiBase } from "@hmarepanditji/utils";
// ─────────────────────────────────────────────────────────────
// THE API MOUNT POINT — server- and client-safe.
//
// This mirrors the normalisation in src/context/auth-context.tsx, which
// cannot be imported from a Server Component (it is a "use client"
// module carrying React context).
//
// The normalisation is not cosmetic. NEXT_PUBLIC_API_URL has been
// deployed WITHOUT the /api/v1 suffix before, and only /auth/* had a 308
// redirect covering for it — so login appeared to work while other calls
// 404'd silently. Appending the suffix when it is absent means a
// half-configured env var can no longer produce that split behaviour.
// ─────────────────────────────────────────────────────────────
const RAW_API_URL = (resolveApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NODE_ENV === "development",
).base).replace(
  /\/+$/,
  ""
);

export const API_BASE = RAW_API_URL.endsWith("/api/v1") ? RAW_API_URL : `${RAW_API_URL}/api/v1`;
