"use client";

// ─────────────────────────────────────────────────────────────
// PROFILE PHOTO — the pandit puts his own face on the platform.
//
// Ordered 2026-08-02 (Isj), and slotted BEFORE batch 3's card work: the 4b
// Dossier card renders this photo, and building the card against eternal
// initials would be designing around an absence we are about to fill.
//
// TWO EXPLICIT CONTROLS, NOT ONE INPUT WITH A CHOOSER. The 45-70 Galaxy A12
// persona does not navigate an OS chooser sheet — "camera or gallery?" is a
// decision the interface makes him make ONCE, with two labelled buttons, not a
// system popup in someone else's vocabulary. capture="user" opens the selfie
// camera directly; the plain input opens the gallery.
//
// THE STATE FLOW IS pick → preview → save → READ BACK:
//   preview   the local objectURL, labelled a QUESTION ("यह फ़ोटो कैसी है?") —
//             it is a candidate, not a fact;
//   save      downscale (long edge 1024, JPEG) → multipart POST
//             /upload?kind=profile-photo → PUT /pandits/me/photo {key};
//   done      the screen then re-reads /auth/me and renders the presigned
//             STORED object. The local preview is revoked at that moment —
//             SUCCESS SHOWS THE STORED TRUTH, never the preview wearing its
//             face. If the stored image fails to load, that is an ERROR state,
//             not a success with a broken corner.
//
// ERROR ≠ EMPTY: an upload failure names itself and offers retry; it never
// falls back to looking like "no photo yet".
//
// VOICE: the two pickers are located and narrated but CANNOT be pressed by
// voice — a browser will not open a file dialog without a user gesture. That
// is a named platform exception, not an oversight.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { api, API_BASE } from "@/lib/api";
import { getToken } from "@/lib/safeStorage";
import { once, mutateOnce } from "@/lib/mutate";
import { Narrate } from "@/hooks/useScreenVoice";
import { Header } from "@/components/ui/Header";
import { Card } from "@/components/ui/Card";
import { usePresignedUrl } from "@/hooks/usePresignedUrl";
import { downscaleImage } from "@/lib/downscaleImage";

type Phase =
  | { name: "idle" }
  | { name: "preview"; local: string; file: File }
  | { name: "uploading"; local: string }
  | { name: "saving"; local: string }
  | { name: "done" }
  | { name: "error"; message: string; file?: File };

export default function ProfilePhotoPage() {
  const router = useRouter();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>({ name: "idle" });

  const load = React.useCallback(async () => {
    const res = await api("/auth/me");
    if (res.success) {
      setStoredKey(res.data.user?.panditProfile?.profilePhotoUrl || null);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  // the STORED truth, read back through the presign path — never the preview
  const { url: storedUrl } = usePresignedUrl(storedKey);

  const revoke = (p: Phase) => {
    if ("local" in p) URL.revokeObjectURL(p.local);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // allow re-picking the same file: a cleared input fires change again
    e.target.value = "";
    if (!file) return;
    revoke(phase);
    setPhase({ name: "preview", local: URL.createObjectURL(file), file });
  };

  const save = async (file: File, local: string) => {
    setPhase({ name: "uploading", local });
    let jpeg: File;
    try {
      jpeg = (await downscaleImage(file)).file;
    } catch {
      revoke({ name: "preview", local, file });
      setPhase({ name: "error", message: t("profilePhoto.unreadable") });
      return;
    }
    try {
      const token = getToken();
      const fd = new FormData();
      fd.append("file", jpeg);
      // multipart cannot use api() — it forces JSON — but the BASE comes from
      // the one prefix-normalised source (the readiness precedent)
      const res = await once(`photo-upload:${jpeg.size}`, () =>
        fetch(`${API_BASE}/upload?kind=profile-photo`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        }),
      );
      const json = await res.json();
      const key: string | undefined = json?.data?.key;
      if (!json.success || !key) throw new Error("upload failed");

      setPhase({ name: "saving", local });
      // mutateOnce, not raw api() — the L1 exactly-once law: every write from
      // this app carries an idempotency key and cannot double-fire
      const put = await mutateOnce(`photo-save:${key}`, "/pandits/me/photo", {
        method: "PUT",
        body: JSON.stringify({ key }),
      });
      if (!put.success) throw new Error("save failed");

      // READ BACK: success is the stored object rendering, nothing less.
      await load();
      URL.revokeObjectURL(local);
      setPhase({ name: "done" });
    } catch {
      setPhase({ name: "error", message: t("profilePhoto.failed"), file });
    }
  };

  const busy = phase.name === "uploading" || phase.name === "saving";

  const PICKER_BTN =
    "min-h-[56px] w-full rounded-[16px] bg-card shadow-card flex items-center justify-center gap-2 " +
    "text-[19px] font-extrabold font-hindi text-temple-700 active:scale-[0.98] transition-all";

  return (
    <div className="h-[100dvh] flex flex-col max-w-[430px] mx-auto bg-cream text-ink">
      <Header variant="garland" />
      <div className="shrink-0 px-3 pt-1.5">
        <button
          onClick={() => router.push("/profile-view")}
          aria-label={t("common.back")}
          className="w-[52px] h-[52px] min-h-[52px] min-w-[52px] rounded-full bg-card shadow-card flex items-center justify-center active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-saffron-200"
        >
          <span className="material-symbols-outlined text-[24px] leading-none text-saffron-700" aria-hidden="true">
            arrow_back
          </span>
        </button>
      </div>

      <main className="flex-1 overflow-y-auto px-4 pt-1.5 pb-24 flex flex-col gap-4 page-enter">
        <Narrate text={t("profilePhoto.title")} />
        <h1 className="text-[24px] font-black font-hindi text-temple-700 text-center">
          {t("profilePhoto.title")}
        </h1>

        {/* ── THE CURRENT TRUTH, or its honest absence ── */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-[160px] h-[160px] rounded-full border-4 border-gold overflow-hidden flex items-center justify-center bg-[linear-gradient(150deg,#D95F38,#B23A1A)] shadow-[0_8px_20px_rgba(178,58,26,0.3)]">
            {phase.name === "preview" || busy ? (
              /* the CANDIDATE — labelled as a question below, never as done */
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={(phase as { local: string }).local} alt="" className="w-full h-full object-cover" />
            ) : storedUrl ? (
              /* the STORED object, read back through presign */
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={storedUrl}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setPhase({ name: "error", message: t("profilePhoto.failed") })}
              />
            ) : (
              <span className="material-symbols-outlined text-[64px] text-chandan" aria-hidden="true">person</span>
            )}
          </div>
          {phase.name === "idle" && !storedKey && (
            <p className="text-[16px] text-softgrey font-hindi">{t("profilePhoto.none")}</p>
          )}
          {phase.name === "done" && (
            <p className="text-[17px] font-bold text-leaf-600 font-hindi text-center" role="status">
              ✓ {t("profilePhoto.done")}
            </p>
          )}
        </div>

        {/* ── PHASE-DEPENDENT CONTROLS ── */}
        {phase.name === "preview" ? (
          <Card className="px-4 py-4 flex flex-col gap-3">
            <p className="text-[18px] font-bold font-hindi text-temple-700 text-center">
              {t("profilePhoto.preview")}
            </p>
            <button onClick={() => void save(phase.file, phase.local)} className={`${PICKER_BTN} !bg-saffron-500 !text-white`}>
              {t("profilePhoto.save")}
            </button>
            <button
              onClick={() => { revoke(phase); setPhase({ name: "idle" }); }}
              className={PICKER_BTN}
            >
              {t("profilePhoto.retake")}
            </button>
          </Card>
        ) : busy ? (
          /* IN-PROGRESS, NAMED — which half of the journey the photo is on */
          <Card className="px-4 py-5 flex items-center justify-center gap-3">
            <span className="w-5 h-5 border-[3px] border-saffron-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
            <span className="text-[18px] font-bold font-hindi text-temple-700" role="status">
              {phase.name === "uploading" ? t("profilePhoto.uploading") : t("profilePhoto.saving")}
            </span>
          </Card>
        ) : (
          <Card className="px-4 py-4 flex flex-col gap-3">
            {phase.name === "error" && (
              /* ERROR ≠ EMPTY: the failure says its name and offers the way back */
              <p className="text-[17px] font-bold text-terracotta font-hindi text-center" role="alert">
                {phase.message}
              </p>
            )}
            <p className="text-[16px] text-softgrey font-hindi text-center">{t("profilePhoto.intro")}</p>
            <button onClick={() => cameraRef.current?.click()} className={PICKER_BTN}>
              {t("profilePhoto.camera")}
            </button>
            <button onClick={() => galleryRef.current?.click()} className={PICKER_BTN}>
              {t("profilePhoto.gallery")}
            </button>
            {/* TWO inputs, TWO outcomes: capture="user" opens the front camera
                directly; the bare input opens the gallery. Hidden because the
                buttons above ARE the affordance — but real inputs, so the OS
                does the part only it can do. */}
            <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onPick} />
            <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
          </Card>
        )}
      </main>
    </div>
  );
}
