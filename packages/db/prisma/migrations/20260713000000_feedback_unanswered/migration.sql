-- S6d: शिष्य brain-miss telemetry. Every question the brain could not
-- answer lands here verbatim — the curation queue for brain v2.
CREATE TABLE "FeedbackUnanswered" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackUnanswered_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FeedbackUnanswered_createdAt_idx" ON "FeedbackUnanswered"("createdAt");
