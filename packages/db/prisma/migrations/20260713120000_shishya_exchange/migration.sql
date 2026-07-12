-- W2: agent exchange telemetry — the prompt-iteration corpus.
CREATE TABLE "ShishyaExchange" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "say" TEXT NOT NULL,
    "act" TEXT,
    "route" TEXT NOT NULL,
    "lang" TEXT NOT NULL DEFAULT 'hi',
    "ms" INTEGER NOT NULL DEFAULT 0,
    "model" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShishyaExchange_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ShishyaExchange_createdAt_idx" ON "ShishyaExchange"("createdAt");
