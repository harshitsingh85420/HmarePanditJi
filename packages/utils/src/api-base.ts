/**
 * NEXT_PUBLIC_API_URL — THE ONE CONTRACT, for all three apps.
 *
 * THE RULE, stated once: **the env var is an ORIGIN. The client owns the
 * `/api/v1` prefix.**
 *
 * Before this file the repo carried FOUR values for one variable and TWO
 * incompatible contracts for what it means:
 *
 *   .env.example         http://localhost:8080          "ORIGIN only"
 *   .env.vercel          https://api…/api/v1            prefix included
 *   apps/web/.env.local  http://localhost:3001/api/v1   prefix included
 *   many code fallbacks  http://localhost:3001          origin only
 *
 * That ambiguity is the root cause under three separate breaks: the homepage
 * appending a second `/api/v1`, eleven customer-dashboard calls hardcoding
 * `/api/customers/...`, and twenty-eight raw concatenations in the admin app.
 *
 * The cure already existed — commented, with the failure mode spelled out —
 * in apps/pandit/src/lib/api.ts. It sat there for months while the two
 * sibling apps went without it. This is that cure, lifted to a place all
 * three can import, so a fourth value cannot appear.
 *
 * Accepts BOTH env shapes and resolves them identically:
 *   https://api.example.com          → https://api.example.com/api/v1
 *   https://api.example.com/api/v1   → https://api.example.com/api/v1
 */

export const API_PREFIX = "/api/v1";

/**
 * @param rawEnv the value of process.env.NEXT_PUBLIC_API_URL
 * @param isDev  when true, an empty env falls back to localhost:3001
 */
export function resolveApiBase(rawEnv: string | undefined, isDev = false) {
  const raw = (rawEnv || "").trim();
  const trimmed = (raw || (isDev ? "http://localhost:3001" : "")).replace(/\/+$/, "");

  /** Origin with NO prefix — the root /health lives here. */
  const origin = trimmed.endsWith(API_PREFIX)
    ? trimmed.slice(0, -API_PREFIX.length)
    : trimmed;

  /** Prefixed base — every /api/v1 route call goes through this. */
  const base = trimmed === "" ? "" : `${origin}${API_PREFIX}`;

  return {
    origin,
    base,
    /**
     * TRUE when the app was deployed with no API base at all. Fail LOUD on
     * this: the old silent fallback to http://localhost:3001 is blocked by an
     * https page as mixed content BEFORE any request leaves the browser —
     * err:network in <100ms with zero entries in the network tool, which is
     * indistinguishable from "the server is down" unless you know to look.
     */
    missing: base === "",
  };
}
