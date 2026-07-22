import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "@hmarepanditji/db";

// ─────────────────────────────────────────────────────────────
// TUTORIAL DECK PROGRESS (per-pandit, resumable). Deck A (9 slides,
// pre-registration) and Deck B (5 slides, first-home) each track a resume
// pointer + completed/skipped, in the one `tutorialProgress` Json column.
// Deck B auto-starts on the FIRST होम arrival ⇔ it is neither completed nor
// skipped. Mirrors readiness.controller (loadProfile → merge → update).
// Client cursors are the source of truth for WHICH slide; the server just
// persists so a re-login resumes and Deck B never re-auto-starts.
// ─────────────────────────────────────────────────────────────

interface DeckProgress {
  slide: number;
  completed: boolean;
  skipped: boolean;
}
type TutorialProgress = { deckA?: DeckProgress; deckB?: DeckProgress };

const EMPTY: DeckProgress = { slide: 1, completed: false, skipped: false };
const MAX_SLIDES = 20; // generous cap (Deck A is 9, Deck B is 5)

function badRequest(reply: FastifyReply, message: string) {
  return reply.status(400).send({ success: false, error: { code: "validation_error", message } });
}

async function loadProfile(request: FastifyRequest, reply: FastifyReply) {
  const userId = (request as any).user?.id || (request as any).user?.userId;
  if (!userId) {
    reply.status(401).send({ success: false, error: { code: "unauthorized", message: "Unauthorized" } });
    return null;
  }
  const profile = await prisma.panditProfile.findUnique({ where: { userId } });
  if (!profile) {
    reply.status(404).send({ success: false, error: { code: "not_found", message: "Pandit profile not found" } });
    return null;
  }
  return profile;
}

function snapshot(tp: TutorialProgress) {
  const deckA = tp.deckA ?? EMPTY;
  const deckB = tp.deckB ?? EMPTY;
  return {
    deckA,
    deckB,
    // convenience flag the client uses to decide the first-home auto-start.
    deckBFirstArrival: !deckB.completed && !deckB.skipped,
  };
}

/** GET /pandit/tutorial — resume state for both decks */
export const getTutorialProgress = async (request: FastifyRequest, reply: FastifyReply) => {
  const profile = await loadProfile(request, reply);
  if (!profile) return;
  const tp = ((profile as any).tutorialProgress as TutorialProgress) || {};
  return reply.send({ success: true, data: snapshot(tp) });
};

/** PATCH /pandit/tutorial — record one deck's progress
 *  body: { deck: 'A' | 'B', slide?: number, completed?: boolean, skipped?: boolean } */
export const patchTutorialProgress = async (request: FastifyRequest, reply: FastifyReply) => {
  const profile = await loadProfile(request, reply);
  if (!profile) return;

  const body = (request.body || {}) as { deck?: string; slide?: number; completed?: boolean; skipped?: boolean };
  const deck = String(body.deck || "").toUpperCase();
  if (deck !== "A" && deck !== "B") return badRequest(reply, "deck must be 'A' or 'B'.");
  const key = deck === "A" ? "deckA" : "deckB";

  const current = (((profile as any).tutorialProgress as TutorialProgress) || {}) as TutorialProgress;
  const prev: DeckProgress = current[key] ?? { ...EMPTY };
  const next: DeckProgress = { ...prev };

  if (body.slide !== undefined) {
    const s = Number(body.slide);
    if (!Number.isInteger(s) || s < 1 || s > MAX_SLIDES) {
      return badRequest(reply, `slide must be an integer between 1 and ${MAX_SLIDES}.`);
    }
    next.slide = Math.max(prev.slide || 1, s); // monotonic resume pointer
  }
  // completed + skipped are STICKY once true — a booking-ready pandit's history
  // of having seen/skipped a deck must not be un-recorded by a later PATCH.
  if (body.completed === true) next.completed = true;
  if (body.skipped === true) next.skipped = true;

  const merged: TutorialProgress = { ...current, [key]: next };
  await prisma.panditProfile.update({ where: { id: profile.id }, data: { tutorialProgress: merged } as any });

  return reply.send({ success: true, data: snapshot(merged) });
};
