-- Dignity-first progress milestones for pandits (shubh sankhya: 5/11/21/51)
CREATE TABLE "PanditMilestone" (
    "id" TEXT NOT NULL,
    "panditId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seenAt" TIMESTAMP(3),
    CONSTRAINT "PanditMilestone_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PanditMilestone_panditId_kind_key" ON "PanditMilestone"("panditId", "kind");
CREATE INDEX "PanditMilestone_panditId_idx" ON "PanditMilestone"("panditId");
