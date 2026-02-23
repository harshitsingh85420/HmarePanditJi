import { Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { sendSuccess } from "../utils/response";
import { AppError } from "../middleware/errorHandler";

// Phase 1 simplification: In-memory OTP store
type OTPRecord = {
  phone: string;
  role: "CUSTOMER" | "PANDIT";
  otp: string;
  expiresAt: number;
};
const OTPStore = new Map<string, OTPRecord>();

const phoneRegex = /^\+91[6-9]\d{9}$/;

export const sendOtp = async (req: Request, res: Response) => {
  const { phone, role } = req.body;

  if (!phone || !phoneRegex.test(phone)) {
    throw new AppError("Invalid Indian mobile number", 400);
  }
  if (role !== "CUSTOMER" && role !== "PANDIT") {
    throw new AppError("Role must be CUSTOMER or PANDIT", 400);
  }

  const otp = "123456"; // Default for phase 1 or mock

  if (env.MOCK_OTP === "true") {
    console.log(`[MOCK OTP] Phone: ${phone}, OTP: ${otp}`);
  } else {
    // In production: use Firebase Admin SDK to send real OTP
    console.log(`[MOCK OTP] Phone: ${phone}, OTP: ${otp} (Fallback since mock is off)`);
  }

  OTPStore.set(phone, {
    phone,
    role,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  return sendSuccess(res, { message: "OTP sent", expiresIn: 600 });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { phone, otp, role, name } = req.body;

  if (!phone || !otp) {
    throw new AppError("Phone and OTP are required", 400);
  }

  const record = OTPStore.get(phone);
  if (!record) {
    throw new AppError("OTP_NOT_FOUND", 400);
  }

  if (Date.now() > record.expiresAt) {
    OTPStore.delete(phone);
    throw new AppError("OTP_EXPIRED", 400);
  }

  // In mock mode: otp === '123456' always passes
  if (otp !== "123456" && otp !== record.otp) {
    throw new AppError("INVALID_OTP", 400);
  }

  OTPStore.delete(phone);

  const requestRole = role || record.role;

  // Find user by phone
  let user = await prisma.user.findUnique({
    where: { phone },
    include: {
      customerProfile: true,
      panditProfile: true,
    }
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = await prisma.user.create({
      data: {
        phone,
        role: requestRole,
        name: name || null,
        isVerified: true,
      },
      include: {
        customerProfile: true,
        panditProfile: true,
      }
    });

    if (requestRole === "PANDIT") {
      await prisma.panditProfile.create({
        data: {
          userId: user.id,
          verificationStatus: "PENDING",
          location: "",
        },
      });
    } else if (requestRole === "CUSTOMER") {
      await prisma.customerProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Refetch to include newly created profiles
    user = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        customerProfile: { include: { addresses: true } },
        panditProfile: true,
      }
    });
  } else {
    // If new user and name provided: update name
    if (!user.name && name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name },
        include: {
          customerProfile: { include: { addresses: true } },
          panditProfile: true,
        }
      });
    }

    // Check if profiles are missing
    if (user.role === "PANDIT" && !user.panditProfile) {
      await prisma.panditProfile.create({
        data: {
          userId: user.id,
          verificationStatus: "PENDING",
          location: "",
        },
      });
    }
    if (user.role === "CUSTOMER" && !user.customerProfile) {
      await prisma.customerProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Refetch to include newly created profiles
    user = (await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        customerProfile: { include: { addresses: true } },
        panditProfile: true,
      }
    }))!;
  }

  if (!user) {
    throw new AppError("Failed to fetch user after upsert", 500);
  }

  const token = jwt.sign(
    {
      id: user.id,
      userId: user.id, // Backward compatibility for handlers still reading userId
      phone: user.phone,
      role: user.role,
      name: user.name,
      isVerified: user.isVerified,
    },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  let profileCompleted = false;
  if (user.role === "PANDIT" && user.panditProfile) {
    profileCompleted = user.panditProfile.verificationStatus !== "PENDING";
  } else if (user.role === "CUSTOMER" && user.customerProfile) {
    // any addresses?
    // @ts-ignore
    profileCompleted = user.customerProfile.addresses && user.customerProfile.addresses.length > 0;
  }

  return sendSuccess(res, {
    token,
    user: {
      id: user.id,
      phone: user.phone,
      role: user.role,
      name: user.name,
      isVerified: user.isVerified,
      isNewUser,
      profileCompleted,
      ...(user.role === "PANDIT" && user.panditProfile ? {
        panditProfile: {
          verificationStatus: user.panditProfile.verificationStatus,
          completedSteps: 0
        }
      } : {})
    },
  });
};

export const getMe = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id || req.user?.userId;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customerProfile: {
        include: {
          addresses: true,
        },
      },
      panditProfile: {
        include: {
          // count only for perf
          _count: {
            select: {
              pujaServices: true,
              samagriPackages: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return sendSuccess(res, { user });
};

export const updateMe = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user?.id || req.user?.userId;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { name, email, preferredLanguages, gotra } = req.body;

  let existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name !== undefined ? name : undefined,
      email: email !== undefined ? email : undefined,
    },
    include: {
      customerProfile: true,
      panditProfile: true,
    }
  });

  if (existingUser.role === "CUSTOMER" && (preferredLanguages || gotra)) {
    const updateData: any = {};
    if (preferredLanguages) updateData.preferredLanguages = preferredLanguages;
    if (gotra) updateData.gotra = gotra;

    await prisma.customerProfile.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    });
  }

  // fetch full updated obj
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      customerProfile: true,
      panditProfile: true,
    }
  });

  return sendSuccess(res, { user });
};
