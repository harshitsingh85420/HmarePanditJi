import { prisma } from "@hmarepanditji/db";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { OTP as OTP_CONFIG, JWT } from "../config/constants";
import { AppError } from "../middleware/errorHandler";
import { formatPhoneE164 } from "../utils/helpers";

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

// (OTP hardening v2, 2026-07-23: the dead DB+Twilio requestOtp was DELETED —
//  it was unrouted, and its Twilio SMS promised DOUBLE the real TTL. The
//  anywhere-scan in otp-ttl.test.ts exists so a divergent OTP-minutes value
//  like that can never return, comments included.)

/**
 * Verify OTP, upsert User record, return access + refresh tokens.
 * Optional roleOverride allows creating/updating users as PANDIT / ADMIN as well.
 */
export async function verifyOtp(
  phone: string,
  otp: string,
  roleOverride?: "CUSTOMER" | "PANDIT" | "ADMIN",
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
  const targetRole = roleOverride ?? "CUSTOMER";
  const user = await prisma.user.upsert({
    where: { phone: e164Phone },
    create: {
      phone: e164Phone,
      role: targetRole,
      isVerified: true,
    },
    update: {
      isVerified: true,
      ...(roleOverride ? { role: targetRole } : {}),
    },
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
