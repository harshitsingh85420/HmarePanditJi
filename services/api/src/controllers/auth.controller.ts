import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";

// Cookie configuration for HttpOnly tokens
const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

// Phase 1 simplification: In-memory OTP store
type OTPRecord = {
  phone: string;
  role: "CUSTOMER" | "PANDIT";
  otp: string;
  expiresAt: number;
};
const OTPStore = new Map<string, OTPRecord>();

const phoneRegex = /^\+91[6-9]\d{9}$/;

export const sendOtp = async (request: FastifyRequest, reply: FastifyReply) => {
  const req = request as any;
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
    console.log(`[MOCK OTP] Phone: ${phone}, OTP: ${otp} (Fallback since mock is off)`);
  }

  OTPStore.set(phone, {
    phone,
    role,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  });

  return reply.send({ success: true, data: { message: "OTP sent", expiresIn: 600 }, message: "Success" });
};

export const verifyOtp = async (request: FastifyRequest, reply: FastifyReply) => {
  const req = request as any;
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
    // @ts-ignore
    profileCompleted = user.customerProfile.addresses && user.customerProfile.addresses.length > 0;
  }

  // MIGRATION 2: Set HttpOnly cookie instead of returning token in response
  await reply.setCookie("hpj_token", token, AUTH_COOKIE_OPTIONS);

  return reply.send({
    success: true,
    data: {
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
    },
    message: "Success"
  });
};

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
  const req = request as any;
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

  return reply.send({ success: true, data: { user }, message: "Success" });
};

export const updateMe = async (request: FastifyRequest, reply: FastifyReply) => {
  const req = request as any;
  const userId = req.user?.id || req.user?.userId;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const schema = z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional().nullable(),
  });

  const { name, email } = schema.parse(req.body);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, email },
    include: {
      customerProfile: {
        include: {
          addresses: true,
        },
      },
      panditProfile: true,
    },
  });

  return reply.send({ success: true, data: { user }, message: "Success" });
};

export const logout = async (_request: FastifyRequest, reply: FastifyReply) => {
  // Clear HttpOnly cookie
  await reply.clearCookie("hpj_token", { path: "/" });
  return reply.send({ success: true, data: { message: "Logged out successfully" }, message: "Success" });
};

export const adminLogin = async (request: FastifyRequest, reply: FastifyReply) => {
  const req = request as any;
  const { username, password } = req.body;

  const adminUsers = JSON.parse(env.ADMIN_USERS) as Array<{ username: string; password: string }>;
  const adminUser = adminUsers.find(
    (u: { username: string; password: string }) => u.username === username && u.password === password
  );

  if (!adminUser) {
    throw new AppError("Invalid admin credentials", 401);
  }

  const token = jwt.sign(
    {
      id: "admin",
      userId: "admin",
      phone: "",
      role: "ADMIN",
      name: adminUser.username,
      isVerified: true,
    },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Set HttpOnly cookie
  await reply.setCookie("hpj_token", token, AUTH_COOKIE_OPTIONS);

  return reply.send({
    success: true,
    data: {
      token,
      user: {
        id: "admin",
        name: adminUser.username,
        role: "ADMIN",
        isVerified: true,
      },
    },
    message: "Success"
  });
};
