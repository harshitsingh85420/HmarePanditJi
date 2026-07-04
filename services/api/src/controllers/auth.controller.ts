import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import crypto from "crypto";
import { storeOtpHash, getOtpHash, deleteOtpHash, checkRateLimit } from "../lib/redis";
import { DEFAULT_SAMAGRI } from "@hmarepanditji/db";
import { computeEarnings } from "../lib/earnings";

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
      pandit: true,
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
        pandit: true,
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
        pandit: true,
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
          pandit: true,
        }
      });
    }

    // Check if profiles are missing
    if (user.role === "PANDIT" && !user.pandit) {
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
        pandit: true,
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
  if (user.role === "PANDIT" && user.pandit) {
    profileCompleted = user.pandit.verificationStatus !== "PENDING";
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
        ...(user.role === "PANDIT" && user.pandit ? {
          panditProfile: {
            verificationStatus: user.pandit.verificationStatus,
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
      pandit: {
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

  const mappedUser = {
    ...user,
    panditProfile: (user as any).pandit,
  };
  delete (mappedUser as any).pandit;

  return reply.send({ success: true, data: { user: mappedUser }, message: "Success" });
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
      pandit: true,
    },
  });

  const mappedUser = {
    ...user,
    panditProfile: (user as any).pandit,
  };
  delete (mappedUser as any).pandit;

  return reply.send({ success: true, data: { user: mappedUser }, message: "Success" });
};

export const logout = async (_request: FastifyRequest, reply: FastifyReply) => {
  // Clear HttpOnly cookie
  await reply.clearCookie("hpj_token", { path: "/" });
  return reply.send({ success: true, data: { message: "Logged out successfully" }, message: "Success" });
};

export const adminLogin = async (request: FastifyRequest, reply: FastifyReply) => {
  const req = request as any;
  const { email, username, password } = req.body || {};
  const inputEmail = email || username;

  if (!inputEmail || !password) {
    throw new AppError("Email and password are required", 400);
  }

  if (inputEmail !== env.ADMIN_EMAIL) {
    throw new AppError("Invalid admin credentials", 401);
  }

  const isMatch = bcrypt.compareSync(password, env.ADMIN_PASSWORD_HASH);
  if (!isMatch) {
    throw new AppError("Invalid admin credentials", 401);
  }

  const token = jwt.sign(
    {
      id: "admin",
      userId: "admin",
      phone: "",
      role: "ADMIN",
      name: "Admin",
      isVerified: true,
    },
    env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  // Set HttpOnly cookie
  await reply.setCookie("hpj_token", token, AUTH_COOKIE_OPTIONS);

  return reply.send({
    success: true,
    data: {
      token,
      user: {
        id: "admin",
        name: "Admin",
        role: "ADMIN",
        isVerified: true,
      },
    },
    message: "Success"
  });
};

export const sendOtpNew = async (request: FastifyRequest, reply: FastifyReply) => {
  const { phone } = request.body as { phone: string };

  const phoneRegex = /^\+91[6-9]\d{9}$/;
  if (!phone || !phoneRegex.test(phone)) {
    return reply.status(400).send({
      success: false,
      error: {
        code: "invalid_phone_number",
        message: "Invalid phone number format. Must start with +91 followed by 10 digits."
      }
    });
  }

  // Rate Limit check: Max 3 sends per phone per 10 minutes (600 seconds)
  const allowed = await checkRateLimit(phone, 3, 600);
  if (!allowed) {
    return reply.status(429).send({
      success: false,
      error: {
        code: "rate_limit_exceeded",
        message: "Max 3 sends per 10 minutes exceeded."
      }
    });
  }

  // Generate OTP
  let otp = "123456";
  if (env.OTP_DEV_MODE !== "true") {
    // Generate secure random 6 digit code
    otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[PRODUCTION OTP] Phone: ${phone}, OTP: ${otp}`);
  } else {
    console.log(`[DEV OTP] Phone: ${phone}, OTP: ${otp}`);
  }

  // Hash OTP using SHA-256
  const hash = crypto.createHash("sha256").update(otp).digest("hex");

  // Store OTP hash in Redis key otp:{phone} with 5-minute TTL (300 seconds)
  await storeOtpHash(phone, hash, 300);

  return reply.send({
    success: true,
    data: {
      message: "OTP sent successfully."
    }
  });
};

export const verifyOtpNew = async (request: FastifyRequest, reply: FastifyReply) => {
  const { phone, otp, role } = request.body as { phone: string; otp: string; role: string };

  if (!phone || !otp) {
    return reply.status(400).send({
      success: false,
      error: {
        code: "missing_fields",
        message: "Phone and OTP are required."
      }
    });
  }

  if (role !== "PANDIT") {
    return reply.status(400).send({
      success: false,
      error: {
        code: "invalid_role",
        message: "Only PANDIT role is supported by this endpoint."
      }
    });
  }

  // Retrieve hash from Redis key otp:{phone}
  const storedHash = await getOtpHash(phone);
  if (!storedHash) {
    return reply.status(400).send({
      success: false,
      error: {
        code: "otp_not_found",
        message: "OTP expired or not found. Please request a new one."
      }
    });
  }

  // Compute incoming OTP hash
  const incomingHash = crypto.createHash("sha256").update(otp).digest("hex");

  if (incomingHash !== storedHash) {
    return reply.status(400).send({
      success: false,
      error: {
        code: "invalid_otp",
        message: "The entered OTP is incorrect."
      }
    });
  }

  // Delete the OTP hash so it can't be reused
  await deleteOtpHash(phone);

  // Find user by phone
  let user = await prisma.user.findUnique({
    where: { phone },
    include: { pandit: true }
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = await prisma.user.create({
      data: {
        phone,
        role: "PANDIT",
        isVerified: true,
      },
      include: { pandit: true }
    });
  }

  // Create empty PanditProfile if none
  let panditProfile = user.pandit;
  if (!panditProfile) {
    panditProfile = await prisma.panditProfile.create({
      data: {
        userId: user.id,
        verificationStatus: "PENDING",
        location: "",
      }
    });
  }

  // Token signed with env.JWT_SECRET, payload { userId, role }, expiry 30 days
  const token = jwt.sign(
    {
      userId: user.id,
      id: user.id, // compatibility
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
    },
    env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  return reply.send({
    success: true,
    data: {
      token,
      isNewUser,
      verificationStatus: panditProfile.verificationStatus
    }
  });
};

export const getSamagriPackages = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { pujaType } = request.query as { pujaType?: string };
  if (!pujaType) {
    return reply.status(400).send({ success: false, error: "pujaType is required" });
  }

  // Find PanditProfile for the user
  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  // Find saved packages for this pandit and pujaType
  const packages = await prisma.samagriPackage.findMany({
    where: {
      panditId: profile.id,
      pujaType,
      isActive: true
    }
  });

  // If no packages are saved, return default samagri list
  if (packages.length === 0) {
    const defaultItems = DEFAULT_SAMAGRI[pujaType] || DEFAULT_SAMAGRI["SATYANARAYAN"];
    return reply.send({
      success: true,
      data: {
        pujaType,
        tiers: [
          { tier: "BASIC", price: null, items: defaultItems },
          { tier: "STANDARD", price: null, items: defaultItems },
          { tier: "PREMIUM", price: null, items: defaultItems }
        ]
      }
    });
  }

  // Otherwise, map packages to the tier structure
  const tiers = ["BASIC", "STANDARD", "PREMIUM"].map((t) => {
    const pkg = packages.find((p) => p.tier === t);
    return {
      tier: t,
      price: pkg ? pkg.price : null,
      items: pkg ? (pkg.items as any) : (packages[0]?.items || DEFAULT_SAMAGRI[pujaType])
    };
  });

  return reply.send({
    success: true,
    data: {
      pujaType,
      tiers
    }
  });
};

export const saveSamagriPackages = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { pujaType, tiers } = request.body as {
    pujaType: string;
    tiers: Array<{ tier: "BASIC" | "STANDARD" | "PREMIUM"; price: number | null; items: any }>;
  };

  if (!pujaType || !tiers || !Array.isArray(tiers)) {
    return reply.status(400).send({ success: false, error: "pujaType and tiers are required" });
  }

  // Find PanditProfile
  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  // Process each tier
  for (const tierData of tiers) {
    const { tier, price, items } = tierData;
    const numericPrice = price ? Number(price) : 0;

    if (numericPrice > 0) {
      // Upsert
      await prisma.samagriPackage.upsert({
        where: {
          panditId_pujaType_tier: {
            panditId: profile.id,
            pujaType,
            tier: tier as any
          }
        },
        update: {
          price: numericPrice,
          items: items as any,
          isActive: true
        },
        create: {
          panditId: profile.id,
          pujaType,
          tier: tier as any,
          price: numericPrice,
          items: items as any,
          isActive: true
        }
      });
    } else {
      // If price is cleared/empty/0, delete that tier package
      await prisma.samagriPackage.deleteMany({
        where: {
          panditId: profile.id,
          pujaType,
          tier: tier as any
        }
      });
    }
  }

  return reply.send({
    success: true,
    data: {
      message: "Samagri packages saved successfully."
    }
  });
};

export const patchPanditStatus = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { isOnline } = request.body as { isOnline: boolean };
  if (isOnline === undefined) {
    return reply.status(400).send({ success: false, error: "isOnline is required" });
  }

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const updated = await prisma.panditProfile.update({
    where: { id: profile.id },
    data: { isOnline },
    include: {
      user: {
        select: { phone: true, email: true, name: true }
      }
    }
  });

  return reply.send({
    success: true,
    data: updated
  });
};

export const getPanditBookings = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { date, status } = request.query as { date?: string; status?: string };

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const where: any = { panditId: profile.id };

  if (status) {
    where.status = status as any;
  }

  if (date === "today") {
    where.eventDate = {
      gte: todayStart,
      lte: todayEnd
    };
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: {
      eventDate: "asc"
    }
  });

  return reply.send({
    success: true,
    data: bookings
  });
};

export const getPanditBookingById = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { id } = request.params as { id: string };
  if (!id) {
    return reply.status(400).send({ success: false, error: "Booking ID is required" });
  }

  // Find PanditProfile
  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  // Find Booking
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: {
        select: { name: true, phone: true }
      }
    }
  });

  if (!booking) {
    return reply.status(404).send({ success: false, error: "Booking not found" });
  }

  if (booking.panditId !== profile.id) {
    return reply.status(403).send({ success: false, error: "Unauthorized access to this booking" });
  }

  // Compute earnings
  const earnings = computeEarnings(booking);

  let journeyTimestamps = {};
  if (booking.travelNotes) {
    try {
      journeyTimestamps = JSON.parse(booking.travelNotes);
    } catch (e) {
      // ignore
    }
  }

  return reply.send({
    success: true,
    data: {
      booking: {
        ...booking,
        earnings,
        journeyTimestamps
      }
    }
  });
};

export const getPanditEarningsSummary = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const weekStart = new Date();
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // today = sum of Payout.amount for payouts created today
  const todayPayouts = await prisma.payout.findMany({
    where: {
      panditId: profile.id,
      createdAt: {
        gte: todayStart,
        lte: todayEnd
      }
    },
    select: { amount: true }
  });
  const today = todayPayouts.reduce((sum, p) => sum + p.amount, 0);

  // week = sum of Payout.amount for payouts created this week
  const weekPayouts = await prisma.payout.findMany({
    where: {
      panditId: profile.id,
      createdAt: {
        gte: weekStart,
        lte: todayEnd
      }
    },
    select: { amount: true }
  });
  const week = weekPayouts.reduce((sum, p) => sum + p.amount, 0);

  // month = current calendar month
  const monthPayouts = await prisma.payout.findMany({
    where: {
      panditId: profile.id,
      createdAt: {
        gte: monthStart,
        lte: todayEnd
      }
    },
    select: { amount: true }
  });
  const month = monthPayouts.reduce((sum, p) => sum + p.amount, 0);

  // pendingPayout = sum where status=PENDING
  const pendingPayouts = await prisma.payout.findMany({
    where: {
      panditId: profile.id,
      status: "PENDING"
    },
    select: { amount: true }
  });
  const pendingPayout = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

  return reply.send({
    success: true,
    data: {
      today,
      week,
      month,
      pendingPayout
    }
  });
};

export const acceptBooking = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { id } = request.params as { id: string };
  if (!id) {
    return reply.status(400).send({ success: false, error: "Booking ID is required" });
  }

  // Find PanditProfile
  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  // Find Booking
  const booking = await prisma.booking.findUnique({
    where: { id }
  });
  if (!booking) {
    return reply.status(404).send({ success: false, error: "Booking not found" });
  }

  // Guards: only the assigned pandit, only from status REQUESTED, else 409
  if (booking.panditId !== profile.id) {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "This booking is not assigned to you." }
    });
  }

  if (booking.status !== "REQUESTED") {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "Only bookings in REQUESTED state can be accepted." }
    });
  }

  // Update status to ACCEPTED and acceptedAt to now
  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "ACCEPTED",
      acceptedAt: new Date()
    }
  });

  return reply.send({
    success: true,
    data: updated
  });
};

export const rejectBooking = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { id } = request.params as { id: string };
  if (!id) {
    return reply.status(400).send({ success: false, error: "Booking ID is required" });
  }

  // Find PanditProfile
  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  // Find Booking
  const booking = await prisma.booking.findUnique({
    where: { id }
  });
  if (!booking) {
    return reply.status(404).send({ success: false, error: "Booking not found" });
  }

  // Guards: only the assigned pandit, only from status REQUESTED, else 409
  if (booking.panditId !== profile.id) {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "This booking is not assigned to you." }
    });
  }

  if (booking.status !== "REQUESTED") {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "Only bookings in REQUESTED state can be rejected." }
    });
  }

  // Update status to REJECTED
  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: "REJECTED"
    }
  });

  return reply.send({
    success: true,
    data: updated
  });
};

export const postBookingJourney = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { id } = request.params as { id: string };
  if (!id) {
    return reply.status(400).send({ success: false, error: "Booking ID is required" });
  }

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const booking = await prisma.booking.findUnique({
    where: { id }
  });
  if (!booking) {
    return reply.status(404).send({ success: false, error: "Booking not found" });
  }

  if (booking.panditId !== profile.id) {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "This booking is not assigned to you." }
    });
  }

  if (booking.status === "COMPLETED" || booking.status === "CANCELLED" || booking.status === "REJECTED") {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "Cannot update journey for a finalized booking." }
    });
  }

  const nextStep = booking.journeyStep + 1;
  if (nextStep > 3) {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "Journey is already completed." }
    });
  }

  // Parse and update timestamps JSON map inside travelNotes
  let timestamps: any = {};
  if (booking.travelNotes) {
    try {
      timestamps = JSON.parse(booking.travelNotes);
    } catch (e) {
      // ignore
    }
  }
  timestamps[nextStep] = new Date().toISOString();

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      journeyStep: nextStep,
      status: nextStep === 1 ? "IN_PROGRESS" : booking.status,
      travelNotes: JSON.stringify(timestamps)
    }
  });

  return reply.send({
    success: true,
    data: updated
  });
};

export const completeBooking = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { id } = request.params as { id: string };
  if (!id) {
    return reply.status(400).send({ success: false, error: "Booking ID is required" });
  }

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const booking = await prisma.booking.findUnique({
    where: { id }
  });
  if (!booking) {
    return reply.status(404).send({ success: false, error: "Booking not found" });
  }

  if (booking.panditId !== profile.id) {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "This booking is not assigned to you." }
    });
  }

  // Guard: journey step must be 3 to complete
  if (booking.journeyStep !== 3) {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "Cannot complete booking until journey step 3 is reached." }
    });
  }

  // Double complete guard
  if (booking.status === "COMPLETED") {
    return reply.status(409).send({
      success: false,
      error: { code: "invalid_state", message: "Booking is already completed." }
    });
  }

  // Compute earnings
  const earnings = computeEarnings(booking);

  // Perform updates inside a transaction
  const [updatedBooking] = await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date()
      }
    }),
    prisma.payout.create({
      data: {
        bookingId: id,
        panditId: profile.id,
        amount: earnings.totalToPandit,
        status: "PENDING"
      }
    })
  ]);

  return reply.send({
    success: true,
    data: updatedBooking
  });
};

export const getPanditPayouts = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { status } = request.query as { status?: string };

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const where: any = { panditId: profile.id };
  if (status) {
    where.status = status as any;
  }

  const payouts = await prisma.payout.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    },
    take: 50
  });

  const bookingIds = payouts.map((p) => p.bookingId);
  const bookings = await prisma.booking.findMany({
    where: {
      id: { in: bookingIds }
    },
    select: {
      id: true,
      pujaType: true,
      eventType: true,
      eventDate: true
    }
  });

  const bookingsMap = new Map(bookings.map((b) => [b.id, b]));

  const payoutsWithBookings = payouts.map((p) => ({
    ...p,
    booking: bookingsMap.get(p.bookingId) || null
  }));

  return reply.send({
    success: true,
    data: payoutsWithBookings
  });
};

export const getBlockedDates = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const dates = await prisma.blockedDate.findMany({
    where: { panditId: profile.id }
  });

  return reply.send({
    success: true,
    data: dates
  });
};

export const createBlockedDate = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { date } = request.body as { date: string };
  if (!date) {
    return reply.status(400).send({ success: false, error: "Date is required" });
  }

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  // Set date to UTC midnight
  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  // Guard: cannot block a date with an ACCEPTED or IN_PROGRESS booking!
  const todayStart = new Date(targetDate);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(targetDate);
  todayEnd.setHours(23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      panditId: profile.id,
      eventDate: {
        gte: todayStart,
        lte: todayEnd
      },
      status: {
        in: ["ACCEPTED", "IN_PROGRESS", "PUJA_IN_PROGRESS"]
      }
    }
  });

  if (bookings.length > 0) {
    return reply.status(409).send({
      success: false,
      error: { code: "has_booking", message: "इस दिन बुकिंग है" }
    });
  }

  const entry = await prisma.blockedDate.upsert({
    where: {
      panditId_date: {
        panditId: profile.id,
        date: targetDate
      }
    },
    create: {
      panditId: profile.id,
      date: targetDate
    },
    update: {}
  });

  return reply.send({
    success: true,
    data: entry
  });
};

export const deleteBlockedDate = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    return reply.status(411).send({ success: false, error: "Unauthorized" });
  }

  const { date } = request.params as { date: string };
  if (!date) {
    return reply.status(400).send({ success: false, error: "Date is required" });
  }

  const profile = await prisma.panditProfile.findUnique({
    where: { userId }
  });
  if (!profile) {
    return reply.status(404).send({ success: false, error: "Pandit profile not found" });
  }

  const targetDate = new Date(date);
  targetDate.setUTCHours(0, 0, 0, 0);

  await prisma.blockedDate.deleteMany({
    where: {
      panditId: profile.id,
      date: targetDate
    }
  });

  return reply.send({
    success: true,
    data: { message: "Blocked date removed" }
  });
};
