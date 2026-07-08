// Read-only seed verification — prints ONLY counts, never row data.
// Usage: DATABASE_URL must be set in the environment.
//   node scripts/verify-seed.mjs
// @prisma/client is resolved from packages/db (where it is generated).
import { createRequire } from "node:module";

const requireFromDb = createRequire(new URL("../packages/db/package.json", import.meta.url));
const { PrismaClient } = requireFromDb("@prisma/client");

const prisma = new PrismaClient();

try {
  const [users, panditProfiles, approved, verified, dakshinaRates, samagriPackages, rituals] =
    await Promise.all([
      prisma.user.count(),
      prisma.panditProfile.count(),
      prisma.panditProfile.count({ where: { verificationStatus: "APPROVED" } }),
      prisma.panditProfile.count({ where: { verificationStatus: "VERIFIED" } }),
      prisma.dakshinaRate.count(),
      prisma.samagriPackage.count(),
      prisma.ritual.count(),
    ]);

  console.log("users:", users);
  console.log("panditProfiles:", panditProfiles);
  console.log("  - APPROVED:", approved);
  console.log("  - VERIFIED (treated as approved by the app):", verified);
  console.log("dakshinaRates:", dakshinaRates);
  console.log("samagriPackages:", samagriPackages);
  console.log("rituals:", rituals);

  // booking_readiness migration column — tolerate its absence
  try {
    const ready = await prisma.panditProfile.count({ where: { isBookingReady: true } });
    console.log("profiles with isBookingReady=true:", ready);
  } catch {
    console.log("profiles with isBookingReady=true: (column not present)");
  }
} finally {
  await prisma.$disconnect();
}
