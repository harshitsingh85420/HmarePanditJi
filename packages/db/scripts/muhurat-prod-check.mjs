// READ-ONLY production check: how many MuhuratDate rows exist, and what do
// they claim? Prints no credentials — only the host, so the DB is identifiable.
//
// Usage: node scripts/muhurat-prod-check.mjs <envFile> <KEY_NAME>
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const envFile = process.argv[2];
const key = process.argv[3] || "DATABASE_URL";
const txt = readFileSync(envFile, "utf8");
const line = txt.split(/\r?\n/).find((l) => l.trim().startsWith(key + "="));
if (!line) {
  console.log(`no ${key} in ${envFile}`);
  process.exit(0);
}
const url = line.slice(line.indexOf("=") + 1).trim().replace(/^"|"$/g, "");
process.env.DATABASE_URL = url;
const host = url.replace(/^.*@/, "").split("/")[0];
console.log(`DB host: ${host}`);

const prisma = new PrismaClient();
try {
  const [muhurats, bookings, pandits, users] = await Promise.all([
    prisma.muhuratDate.count(),
    prisma.booking.count(),
    prisma.panditProfile.count(),
    prisma.user.count(),
  ]);
  console.log(JSON.stringify({ muhuratDateRows: muhurats, bookings, pandits, users }));
  if (muhurats > 0) {
    const rows = await prisma.muhuratDate.findMany({
      orderBy: { date: "asc" },
      select: { date: true, pujaType: true, timeWindow: true, significance: true, source: true },
    });
    console.log("ALL ROWS:");
    for (const r of rows) {
      console.log(
        `  ${r.date.toISOString().slice(0, 10)} · ${r.pujaType} · ${r.timeWindow} · "${r.significance}" · source="${r.source}"`,
      );
    }
  }
} catch (e) {
  console.log("QUERY FAILED:", String(e).split("\n")[0].slice(0, 220));
} finally {
  await prisma.$disconnect();
}
