import { z } from "zod";
import dotenv from "dotenv";
import path from "path";
import process from "process";

// Load .env from monorepo root (gracefully skip if not found — e.g. Render/Vercel)
try {
  dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });
} catch {
  // env vars already set by hosting platform
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL URL"),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .default("dev_jwt_secret_min_32_characters_long_placeholder"),
  JWT_EXPIRY: z.string().default("7d"),

  WEB_URL: z.string().default("http://localhost:3000"),
  PANDIT_URL: z.string().default("http://localhost:3001"),
  ADMIN_URL: z.string().default("http://localhost:3002"),

  RAZORPAY_KEY_ID: z.string().default(""),
  RAZORPAY_KEY_SECRET: z.string().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().default(""),

  TWILIO_ACCOUNT_SID: z.string().default(""),
  TWILIO_AUTH_TOKEN: z.string().default(""),
  TWILIO_PHONE_NUMBER: z.string().default(""),
  TWILIO_WHATSAPP_NUMBER: z.string().default(""),

  FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY: z.string().default(""),

  // Aadhaar AES-256 encryption key (64 hex chars = 32 bytes)
  ENCRYPTION_KEY: z.string().default("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"),

  // Bhashini Voice AI
  BHASHINI_USER_ID: z.string().default(""),
  BHASHINI_API_KEY: z.string().default(""),
  BHASHINI_PIPELINE_ID: z.string().default(""),

  // MSG91 OTP + SMS
  MSG91_AUTH_KEY: z.string().default(""),
  MSG91_SENDER_ID: z.string().default("HMPANDIT"),
  MSG91_OTP_TEMPLATE_ID: z.string().default(""),

  // AWS S3
  AWS_REGION: z.string().default("ap-south-1"),
  AWS_ACCESS_KEY_ID: z.string().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().default(""),
  S3_BUCKET_NAME: z.string().default("hmarepanditji-uploads"),
  CLOUDFRONT_URL: z.string().default(""),

  // Google Maps
  GOOGLE_MAPS_API_KEY: z.string().default(""),

  // Platform Business Config (paise)
  PLATFORM_COMMISSION_PERCENT: z.coerce.number().default(20),
  TRAVEL_SERVICE_FEE_PERCENT: z.coerce.number().default(10),
  SAMAGRI_SERVICE_FEE_PERCENT: z.coerce.number().default(8),
  GST_PERCENT: z.coerce.number().default(18),
  FOOD_ALLOWANCE_PER_DAY_PAISE: z.coerce.number().default(100000),
  SELF_DRIVE_RATE_PER_KM_PAISE: z.coerce.number().default(1200),
  BACKUP_FEE_PAISE: z.coerce.number().default(50000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌  Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data!;
export type Env = typeof env;
