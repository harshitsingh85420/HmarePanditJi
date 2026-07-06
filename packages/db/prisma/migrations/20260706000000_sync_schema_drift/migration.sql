-- Sync migration generated with 'prisma migrate diff' against the live schema:
-- earlier migrations were hand-written against a drifted dev database and
-- omitted these columns and tables entirely.
-- AlterEnum
ALTER TYPE "TravelStatus" ADD VALUE 'ADMIN_CALCULATING';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "calculatedTravelCost" INTEGER,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "travelBookingDetails" JSONB,
ADD COLUMN     "travelBreakdown" JSONB,
ADD COLUMN     "travelDocumentUrls" TEXT[];

-- AlterTable
ALTER TABLE "PanditProfile" ADD COLUMN     "aadhaarEncrypted" TEXT,
ADD COLUMN     "aadhaarLastFour" TEXT,
ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "bankAccountAdded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canBringSamagri" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "certificatesVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deviceInfo" JSONB,
ADD COLUMN     "displayName" TEXT,
ADD COLUMN     "gotra" TEXT,
ADD COLUMN     "profileCompletionPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "sect" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" TEXT;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "photoUrls" TEXT[],
ADD COLUMN     "valueForMoneyRating" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "preferredLanguage" TEXT,
ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "relatedBookingId" TEXT,
    "relatedUserId" TEXT,
    "resolution" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "nakshatra" TEXT,
    "rashi" TEXT,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerRating" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "panditId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "punctuality" INTEGER NOT NULL,
    "hospitality" INTEGER NOT NULL,
    "foodArrangement" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ritual" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameHindi" TEXT,
    "description" TEXT,
    "descriptionHindi" TEXT,
    "category" TEXT,
    "basePriceMin" INTEGER,
    "basePriceMax" INTEGER,
    "durationHours" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "iconUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ritual_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX "SupportTicket_priority_idx" ON "SupportTicket"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerRating_bookingId_key" ON "CustomerRating"("bookingId");

-- CreateIndex
CREATE INDEX "OTP_phone_idx" ON "OTP"("phone");

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

