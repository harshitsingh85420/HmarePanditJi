import { prisma } from "@hmarepanditji/db";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { OTP as OTP_CONFIG, JWT } from "../config/constants";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";
import { formatPhoneE164, maskPhone } from "../utils/helpers";

// ─── Stub implementations — replace in Sprint 2 ──────────────────────────────

/**
 * Generate a 6-digit OTP, save to DB, and "send" via Twilio (stubbed).
 */
export async function requestOtp(phone: string): Promise<void> {
  const e164Phone = formatPhoneE164(phone);
  const otpCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();
  const expiresAt = new Date(
    Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000,
  );

  // Invalidate previous unused OTPs for this phone
  await prisma.oTP.updateMany({
    where: { phone: e164Phone, isUsed: false },
    data: { isUsed: true },
  });

  await prisma.oTP.create({
    data: { phone: e164Phone, otp: otpCode, expiresAt },
  });

  // TODO sprint 2: send via Twilio
  logger.info(`OTP for ${maskPhone(e164Phone)}: ${otpCode} (dev only)`);
}

/**
 * Verify OTP, upsert User record, return signed JWT.
 */
export async function verifyOtp(
  phone: string,
  otp: string,
): Promise<{ accessToken: string; user: object }> {
  const e164Phone = formatPhoneE164(phone);

  const record = await prisma.oTP.findFirst({
    where: {
      phone: e164Phone,
      isUsed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) throw new AppError("OTP expired or not found", 400, "OTP_INVALID");
  if (record.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
    throw new AppError("Too many attempts", 429, "OTP_MAX_ATTEMPTS");
  }
  if (record.otp !== otp) {
    await prisma.oTP.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw new AppError("Invalid OTP", 400, "OTP_INVALID");
  }

  // Mark OTP as used
  await prisma.oTP.update({ where: { id: record.id }, data: { isUsed: true } });

  // Upsert user
  const user = await prisma.user.upsert({
    where: { phone: e164Phone },
    create: {
      phone: e164Phone,
      role: "CUSTOMER",
      isPhoneVerified: true,
    },
    update: { isPhoneVerified: true },
  });

  const accessToken = jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      role: user.role,
      isPhoneVerified: user.isPhoneVerified,
    },
    env.JWT_SECRET,
    { expiresIn: JWT.EXPIRY, algorithm: JWT.ALGORITHM },
  );

  return { accessToken, user };
}
