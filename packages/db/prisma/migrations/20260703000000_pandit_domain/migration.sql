-- CreateEnum
CREATE TYPE "PackageTier" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- AlterEnum
ALTER TYPE "VerificationStatus" ADD VALUE 'APPROVED';

-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'REQUESTED';
ALTER TYPE "BookingStatus" ADD VALUE 'ACCEPTED';
ALTER TYPE "BookingStatus" ADD VALUE 'REJECTED';
ALTER TYPE "BookingStatus" ADD VALUE 'IN_PROGRESS';

-- AlterEnum
ALTER TYPE "PayoutStatus" ADD VALUE 'PAID';

-- DropForeignKey
ALTER TABLE "SamagriPackage" DROP CONSTRAINT "SamagriPackage_panditProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_panditId_fkey";

-- DropIndex
DROP INDEX "Booking_panditId_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'hi';

-- AlterTable
ALTER TABLE "PanditProfile" ADD COLUMN     "aadhaarDocUrl" TEXT,
ADD COLUMN     "bankIfsc" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "teamSize" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "yearsExperience" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "city" SET DEFAULT '';

-- AlterTable
ALTER TABLE "SamagriPackage" ADD COLUMN     "panditId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tier" "PackageTier" NOT NULL DEFAULT 'BASIC',
ALTER COLUMN "panditProfileId" DROP NOT NULL,
ALTER COLUMN "packageName" DROP NOT NULL,
ALTER COLUMN "packageType" DROP NOT NULL,
ALTER COLUMN "fixedPrice" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "customerName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "customerPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "eventAddress" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "foodAllowance" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "journeyStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "panditUserId" TEXT,
ADD COLUMN     "pujaType" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "travelAmount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "panditId" SET NOT NULL,
ALTER COLUMN "panditId" SET DEFAULT '',
ALTER COLUMN "status" SET DEFAULT 'REQUESTED';

-- CreateTable
CREATE TABLE "DakshinaRate" (
    "id" TEXT NOT NULL,
    "panditId" TEXT NOT NULL,
    "pujaType" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "DakshinaRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedDate" (
    "id" TEXT NOT NULL,
    "panditId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "panditId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DakshinaRate_panditId_pujaType_key" ON "DakshinaRate"("panditId", "pujaType");

-- CreateIndex
CREATE UNIQUE INDEX "BlockedDate_panditId_date_key" ON "BlockedDate"("panditId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_bookingId_key" ON "Payout"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "SamagriPackage_panditId_pujaType_tier_key" ON "SamagriPackage"("panditId", "pujaType", "tier");

-- CreateIndex
CREATE INDEX "Booking_panditUserId_idx" ON "Booking"("panditUserId");

-- AddForeignKey
ALTER TABLE "DakshinaRate" ADD CONSTRAINT "DakshinaRate_panditId_fkey" FOREIGN KEY ("panditId") REFERENCES "PanditProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SamagriPackage" ADD CONSTRAINT "SamagriPackage_panditProfileId_fkey" FOREIGN KEY ("panditProfileId") REFERENCES "PanditProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SamagriPackage" ADD CONSTRAINT "SamagriPackage_panditId_fkey" FOREIGN KEY ("panditId") REFERENCES "PanditProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedDate" ADD CONSTRAINT "BlockedDate_panditId_fkey" FOREIGN KEY ("panditId") REFERENCES "PanditProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_panditUserId_fkey" FOREIGN KEY ("panditUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_panditId_fkey" FOREIGN KEY ("panditId") REFERENCES "PanditProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
