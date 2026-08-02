"use client";

import React, { useCallback, useEffect, useState } from "react";
import { VIDEO_REJECTION_REASONS, OTHER_CODE } from "@hmarepanditji/types";
import { resolveApiBase, ADMIN_TOKEN_KEY } from "@hmarepanditji/utils";

/* ─────────────────────────────────────────────────────────────
   THE PER-POOJA QUEUE — the claim that had NO screen.

   `GET /admin/pooja-verifications`, `PATCH …/:id/approve` and
   `PATCH …/:id/reject` have existed for weeks. ZERO admin files called
   any of them, so Isj could not mark a single pooja verified — while
   the customer app rendered "पूजा सत्यापन बाकी" on every service and
   the badge had no way of ever becoming true.

   IT IS DELIBERATELY NOT THE IDENTITY QUEUE. Different heading,
   different verb, different colour, and the word "verified" is never
   used here — that word belongs to identity alone. This is "watched by
   our team": a judgement about ONE recording of ONE ceremony, not
   about the man.
   ───────────────────────────────────────────────────────────── */

interface PoojaRow {
  id: string;
  poojaType: string;
  poojaName: string | null;
  status: string;
  videoProvider: string | null;
  videoId: string | null;
  videoUrl: string | null;
  publicUrl: string | null;
  createdAt: string;
  pandit?: { user?: { name: string | null; phone: string | null } | null } | null;
}

// resolveApiBase, NOT the raw env var. The deployed NEXT_PUBLIC_API_URL is a
// BARE ORIGIN, so appending a route to it 404s — and the 308 shim covers
// "/pandits/*" but not the admin paths. The api-base guard caught this in
// this very file before it shipped; it is the fourth sighting of the class.
const API = resolveApiBase(
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NODE_ENV === "development",
).base;

export default function PoojaQueue() {
  const [rows, setRows] = useState<PoojaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<PoojaRow | null>(null);
  const [reasonCode, setReasonCode] = useState(VIDEO_REJECTION_REASONS[0].code);
  const [otherText, setOtherText] = useState("");

  const token = () => (typeof window !== "undefined" ? localStorage.getItem(ADMIN_TOKEN_KEY) : null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/admin/pooja-verifications?status=PENDING`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        // P0 (2026-08-02): this threw `json?.error?.message || json?.error` —
        // but this API's envelope is {success, message, error:{code}}: the
        // human message is TOP-LEVEL and error is an OBJECT without .message.
        // So every failure (here: the expired 12h admin JWT's 401) rendered as
        // "[object Object]" over "No videos waiting" while two PENDING rows
        // sat in the table. The identity queue one tab over already reads
        // `error?.message || message`; this tab alone was written against an
        // envelope this API never sends. ERROR-SWALLOWED-AS-EMPTY, on the
        // approval path.
        const code = json?.error?.code;
        const msg =
          code === "UNAUTHORIZED"
            ? "Your session has expired — log in again to see the queue."
            : json?.error?.message ||
              json?.message ||
              (typeof json?.error === "string" ? json.error : "") ||
              `Could not load the queue (HTTP ${res.status})`;
        throw new Error(msg);
      }
      setRows(json.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the queue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function approve(row: PoojaRow) {
    if (!confirm(`Publish "${row.poojaName || row.poojaType}" as watched by our team?`)) return;
    setBusyId(row.id);
    try {
      const res = await fetch(`${API}/admin/pooja-verifications/${row.id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
      });
      if (!res.ok) throw new Error((await res.json())?.error?.message || "Approve failed");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setBusyId(null);
    }
  }

  async function submitReject() {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    try {
      // THE CODE, not the sentence. The pandit-facing Hindi lives in
      // packages/types where the register guards can see it.
      const res = await fetch(`${API}/admin/pooja-verifications/${rejecting.id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ reasonCode, otherText: reasonCode === OTHER_CODE ? otherText : undefined }),
      });
      if (!res.ok) throw new Error((await res.json())?.error?.message || "Reject failed");
      setRejecting(null);
      setOtherText("");
      setReasonCode(VIDEO_REJECTION_REASONS[0].code);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reject failed");
    } finally {
      setBusyId(null);
    }
  }

  const chosen = VIDEO_REJECTION_REASONS.find((r) => r.code === reasonCode);
  const otherEmpty = reasonCode === OTHER_CODE && !otherText.trim();

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">Ceremony sample videos</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Watch the recording and decide whether it is a fair sample of that ceremony. This is
          <strong> not an identity check</strong> — it never sets, changes or implies the pandit&rsquo;s
          identity status.
        </p>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* AN ERRORED QUEUE MUST NEVER LOOK EMPTY. The old render put the error
          banner ABOVE the "No videos waiting" card, so a failed load read as a
          truthful nothing — fail-by-omission on the approval path, the exact
          class the widened identity queue was built against. "No videos
          waiting" may render only when the server actually said so. */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading…</div>
      ) : error ? (
        <div className="py-10 text-center">
          <button onClick={load} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700">
            Try again
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-3xl mb-2">🎥</div>
          <p className="font-semibold text-slate-700">No videos waiting</p>
          <p className="text-sm text-slate-500 mt-1">
            Nothing to watch right now. New submissions appear here as pandits add ceremonies.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((row) => {
            const canPlay = row.videoProvider === "YOUTUBE" && row.videoId;
            // P0 (2026-08-02): the WhatsApp path is a RULED, mandatory
            // submission route — the wizard stamps videoUrl with the wa.me
            // marker and provider UPLOAD. This card had no branch for it, so
            // the marker fell through to the generic "no playable video
            // (UPLOAD)" dead-end with publish DISABLED: a pooja submitted the
            // ruled way could never be approved. The marker is structural
            // (wa.me prefix), not inferred from copy.
            const isWhatsApp = !!row.videoUrl && row.videoUrl.startsWith("https://wa.me/");
            // Judging a WhatsApp submission happens OFF-PLATFORM by design,
            // so the platform must not gate publish on an inline player it
            // was never going to have.
            const canPublish = canPlay || isWhatsApp;
            return (
              <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900">{row.poojaName || row.poojaType}</div>
                    <div className="text-sm text-slate-500">
                      {row.pandit?.user?.name || "(no name)"} · {row.pandit?.user?.phone || "—"}
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
                    Waiting to be watched
                  </span>
                </div>

                <div className="mt-4">
                  {canPlay ? (
                    <iframe
                      title={`sample-${row.id}`}
                      width="100%"
                      height="240"
                      src={`https://www.youtube.com/embed/${row.videoId}`}
                      allowFullScreen
                      className="rounded-lg border border-slate-200"
                    />
                  ) : isWhatsApp ? (
                    // THE RULED SHAPE: say honestly where the video lives, no
                    // fake player expectation. The judging happens on WhatsApp;
                    // this panel is the pointer, not a substitute player.
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-6 text-center">
                      <p className="text-[15px] font-semibold text-emerald-900">
                        यह वीडियो WhatsApp पर भेजा गया है — वहाँ देखकर यहीं फ़ैसला कीजिए।
                      </p>
                      <a
                        href={row.videoUrl!}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800"
                      >
                        WhatsApp खोलिए
                      </a>
                    </div>
                  ) : (
                    // TRUTHFUL-NULL: an UPLOAD row exposes no playable media
                    // identifier, so we say what we have rather than drawing a
                    // dead player.
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                      This submission has no playable video ({row.videoProvider || "unknown source"}).
                      It cannot be judged from here yet.
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => approve(row)}
                    disabled={busyId === row.id || !canPublish}
                    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                  >
                    {busyId === row.id ? "Saving…" : "Watched — publish it"}
                  </button>
                  <button
                    onClick={() => setRejecting(row)}
                    disabled={busyId === row.id}
                    className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-40"
                  >
                    Ask for a new video
                  </button>
                  {!canPublish && (
                    // DISABLED CONTROLS PRINT THEIR REASON, and the reason
                    // names the unlock.
                    <span className="self-center text-xs text-slate-500">
                      Cannot publish what cannot be played — ask for a new video instead.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6">
            <h3 className="text-lg font-bold text-slate-900">Ask for a new video</h3>
            <p className="mt-1 text-sm text-slate-500">
              &ldquo;{rejecting.poojaName || rejecting.poojaType}&rdquo; · {rejecting.pandit?.user?.name || "(no name)"}
            </p>

            <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</label>
            <select
              value={reasonCode}
              onChange={(e) => setReasonCode(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {VIDEO_REJECTION_REASONS.map((r) => (
                <option key={r.code} value={r.code}>{r.adminLabel}</option>
              ))}
            </select>

            {/* HE READS THIS, NOT YOUR LABEL. Showing the exact Hindi the
                pandit will receive is the only way ops can tell whether the
                reason fits before sending it. */}
            {chosen && chosen.code !== OTHER_CODE && (
              <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">He will read</div>
                <div className="mt-1 text-[15px] text-slate-800">{chosen.panditText}</div>
              </div>
            )}

            {reasonCode === OTHER_CODE && (
              <div className="mt-3">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Write it in Hindi — he reads this exactly as typed
                </label>
                <textarea
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  rows={3}
                  placeholder="वीडियो में …"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setRejecting(null)} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600">
                Cancel
              </button>
              <div>
                <button
                  onClick={submitReject}
                  disabled={otherEmpty || busyId === rejecting.id}
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
                >
                  {busyId === rejecting.id ? "Sending…" : "Send"}
                </button>
                {otherEmpty && (
                  <div className="mt-2 text-xs text-slate-500">Type the Hindi reason first — then you can send.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
