import { prisma } from "@hmarepanditji/db";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { OTP as OTP_CONFIG, JWT } from "../config/constants";
import { AppError } from "../middleware/errorHandler";
import { logger } from "../utils/logger";
import { formatPhoneE164, maskPhone } from "../utils/helpers";
import { notifyOtp } from "./notification.service";

// ─── Token helpers ────────────────────────────────────────────────────────────

function signAccessToken(user: {
  id: string;
  phone: string;
  role: string;
  isVerified: boolean;
}): string {
  return jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
    },
    env.JWT_SECRET,
    { expiresIn: JWT.EXPIRY, algorithm: JWT.ALGORITHM },
  );
}

function signRefreshToken(userId: string): string {
  return jwt.sign({ id: userId, type: "refresh" }, env.JWT_SECRET, {
    expiresIn: JWT.REFRESH_EXPIRY,
    algorithm: JWT.ALGORITHM,
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a 6-digit OTP, save to DB, and send via Twilio (dev: log only).
 * Returns the OTP code in development mode for easy testing.
 */
export async function requestOtp(
  phone: string,
): Promise<{ devOtp?: string }> {
  const e164Phone = formatPhoneE164(phone);
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

  // Invalidate previous unused OTPs for this phone
  await prisma.oTP.updateMany({
    where: { phone: e164Phone, isUsed: false },
    data: { isUsed: true },
  });

  const otpRecord = await prisma.oTP.create({
    data: { phone: e164Phone, otp: otpCode, expiresAt },
  });

  // Find or create a placeholder user for notification (phone may not have an account yet)
  const user = await prisma.user.findUnique({ where: { phone: e164Phone } });

  if (user && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN) {
    // Send via Twilio SMS (non-blocking — don't fail OTP request if SMS fails)
    notifyOtp(e164Phone, user.id, otpCode).catch((err) =>
      logger.error(`[OTP] SMS delivery failed for ${maskPhone(e164Phone)}: ${err.message}`),
    );
  } else {
    // Dev fallback: log to console
    logger.info(`[DEV] OTP for ${maskPhone(e164Phone)}: ${otpCode} (id: ${otpRecord.id})`);
  }

  // In development, return the OTP so the UI can display it without checking logs
  if (env.NODE_ENV === "development") {
    return { devOtp: otpCode };
  }
  return {};
}

/**
 * Verify OTP, upsert User record, return access + refresh tokens.
 */
export async function verifyOtp(
  phone: string,
  otp: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: object;
}> {
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
    throw new AppError("Too many OTP attempts. Request a new OTP.", 429, "OTP_MAX_ATTEMPTS");
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

  // Check if user already existed before upsert
  const existingUser = await prisma.user.findUnique({ where: { phone: e164Phone } });
  const isNewUser = !existingUser;

  // Upsert user
  const user = await prisma.user.upsert({
    where: { phone: e164Phone },
    create: {
      phone: e164Phone,
      role: "CUSTOMER",
      isVerified: true,
    },
    update: { isVerified: true },
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user.id);

  return { accessToken, refreshToken, isNewUser, user };
}

/**
 * Verify a refresh token and issue a new access token.
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string }> {
  let payload: { id: string; type: string };

  try {
    payload = jwt.verify(refreshToken, env.JWT_SECRET) as {
      id: string;
      type: string;
    };
  } catch {
    throw new AppError("Invalid or expired refresh token", 401, "TOKEN_INVALID");
  }

  if (payload.type !== "refresh") {
    throw new AppError("Invalid token type", 401, "TOKEN_INVALID");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");

  const accessToken = signAccessToken(user);
  return { accessToken };
}

/**
 * Get full user profile from DB.
 */
export async function getFullUser(userId: string): Promise<object> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      phone: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
      profileCompleted: true,
      avatarUrl: true,
      preferredLanguage: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  return user;
}

/**
 * Update user profile (name + optional email).
 */
export async function updateUserProfile(
  userId: string,
  data: { name?: string; email?: string | null },
): Promise<object> {
  const updateData: {
    name?: string;
    email?: string | null;
    profileCompleted?: boolean;
  } = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;

  // Mark profile complete if name is being set
  if (data.name) updateData.profileCompleted = true;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      phone: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
      profileCompleted: true,
      avatarUrl: true,
    },
  });

  return user;
}
