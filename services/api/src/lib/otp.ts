// ─────────────────────────────────────────────────────────────
// OTP CORE (hardening v2, 2026-07-23) — generation, static-gate, hashing,
// MSG91 template delivery. THE one module both send paths use.
//
// STATIC BYPASS: the six-digit dev convenience code exists ONLY behind
// isStaticOtpAllowed(), which is HARD-false in production regardless of flags
// (and env.ts refuses to even boot prod with OTP_DEV_MODE/MOCK_OTP true —
// belt and braces). otp-static-kill.test.ts pins exactly ONE occurrence of the
// literal in this file, gated — comments must not repeat it.
//
// DELIVERY: DLT-approved template flow — MSG91 renders the approved template
// (template ids per app) with the {#var#} slots named `otp`; we never send a
// free-text body. buildOtpSms (constants.ts) remains the byte-exact record of
// the approved text for portal submission + drift-guarding. A 200 from MSG91
// means ACCEPTED, not delivered — getOtpDeliveryStatus exists because a DLT
// template mismatch fails SILENTLY; go-live proof requires status DELIVERED.
// ─────────────────────────────────────────────────────────────
import crypto from "node:crypto";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export type OtpApp = "PANDIT" | "WEB";

/** The ONLY gate for the static dev OTP. HARD-false in production. */
export function isStaticOtpAllowed(
  nodeEnv: string = env.NODE_ENV,
  devMode: string = env.OTP_DEV_MODE,
): boolean {
  if (nodeEnv === "production") return false;
  return devMode === "true";
}

/** Random 6-digit OTP; the static dev value only where isStaticOtpAllowed(). */
export function generateOtp(): string {
  if (isStaticOtpAllowed()) return "123456";
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export function templateIdForApp(app: OtpApp): string {
  return app === "PANDIT" ? env.MSG91_OTP_TEMPLATE_ID_PANDIT : env.MSG91_OTP_TEMPLATE_ID_WEB;
}

/**
 * Deliver the OTP via the app's DLT-approved MSG91 template.
 * Returns the MSG91 request id (LOGGED — it is the handle for the delivery
 * report). Never throws into the auth flow: a send failure is logged and
 * reported as sent:false so the handler can respond honestly.
 */
export async function sendOtpSms(
  phone: string,
  otp: string,
  app: OtpApp,
): Promise<{ sent: boolean; requestId?: string }> {
  const templateId = templateIdForApp(app);
  if (!env.MSG91_AUTH_KEY || !templateId) {
    // dev-only grace: prod cannot reach here (env.ts fatal-boots on missing
    // MSG91 config). Never log the OTP itself outside the static-dev mode.
    logger.info(`[OTP-SMS stub] app=${app} to=${phone.slice(0, 6)}… (MSG91 not configured${isStaticOtpAllowed() ? `; dev OTP ${otp}` : ""})`);
    return { sent: false };
  }
  try {
    const res = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: { authkey: env.MSG91_AUTH_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        template_id: templateId,
        sender: env.MSG91_SENDER_ID,
        short_url: "0",
        // both {#var#} slots in the approved template are named `otp`
        recipients: [{ mobiles: phone.replace(/^\+/, ""), otp }],
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { type?: string; message?: string };
    if (res.ok && body.type === "success") {
      // item F: the request id is the delivery-report handle — always logged.
      logger.info(`[OTP-SMS] app=${app} accepted requestId=${body.message}`);
      return { sent: true, requestId: body.message };
    }
    logger.error(`[OTP-SMS] app=${app} MSG91 rejected: ${res.status} ${JSON.stringify(body).slice(0, 200)}`);
    return { sent: false };
  } catch (err) {
    logger.error(`[OTP-SMS] app=${app} send failed: ${(err as Error).message}`);
    return { sent: false };
  }
}

/**
 * item F: MSG91's 200 means ACCEPTED, not delivered — a DLT template mismatch
 * fails silently downstream. This queries the delivery report for a request id;
 * the GO-LIVE proof requires DELIVERED here (or in the MSG91 dashboard), never
 * the send-time 200.
 */
export async function getOtpDeliveryStatus(requestId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://control.msg91.com/api/v5/report/${encodeURIComponent(requestId)}`,
      { headers: { authkey: env.MSG91_AUTH_KEY } },
    );
    const text = await res.text();
    return `${res.status}: ${text.slice(0, 500)}`;
  } catch (err) {
    return `report-fetch-failed: ${(err as Error).message}`;
  }
}
