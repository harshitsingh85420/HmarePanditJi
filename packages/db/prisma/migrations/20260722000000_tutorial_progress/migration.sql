-- Per-pandit tutorial deck progress (resume + Deck-B first-home trigger).
-- Additive, nullable — safe under the repo's `prisma db push` apply path.
ALTER TABLE "PanditProfile" ADD COLUMN "tutorialProgress" JSONB;
