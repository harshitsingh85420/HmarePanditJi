"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { t } from "@/lib/i18n";
import { useVoice } from "@/hooks/useVoice";

// Display order of the pragati path (shubh sankhya — intentional numbers)
export const MILESTONE_ORDER = [
  "FIRST_BOOKING",
  "BOOKINGS_5",
  "BOOKINGS_11",
  "BOOKINGS_21",
  "BOOKINGS_51",
  "EARNED_11K",
  "EARNED_51K",
  "EARNED_1L",
] as const;

type MilestoneKind = (typeof MILESTONE_ORDER)[number] | "PROFILE_COMPLETE";

export function milestoneEmoji(kind: string): string {
  const label = t(`milestones.${kind}`);
  // Labels all start with their emoji
  return Array.from(label)[0] || "⭐";
}

export function milestoneLabel(kind: string): string {
  return t(`milestones.${kind}`);
}

export interface PragatiCardProps {
  earnedKinds: string[];
}

export function PragatiCard({ earnedKinds }: PragatiCardProps) {
  const { speak } = useVoice();
  const earned = new Set(earnedKinds);
  const next = MILESTONE_ORDER.find((k) => !earned.has(k));

  const speakProgress = () => {
    const parts = MILESTONE_ORDER.filter((k) => earned.has(k)).map((k) =>
      milestoneLabel(k).replace(/^[^\s]+\s/, ""),
    );
    const spoken =
      parts.length > 0
        ? `${t("milestones.title")}: ${parts.join(", ")}। ${next ? `${t("milestones.nextLabel")} ${milestoneLabel(next).replace(/^[^\s]+\s/, "")}` : ""}`
        : `${next ? `${t("milestones.nextLabel")} ${milestoneLabel(next).replace(/^[^\s]+\s/, "")}` : t("milestones.title")}`;
    speak(spoken);
  };

  return (
    <Card
      accent="gold"
      className="p-4 bg-white cursor-pointer active:scale-[0.97] transition-transform"
      onClick={speakProgress}
    >
      <div className="flex flex-col gap-2">
        <span className="text-[18px] font-bold text-temple-600 font-hindi">
          {t("milestones.title")}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {MILESTONE_ORDER.map((k) => (
            <span
              key={k}
              className={`text-[28px] leading-none select-none ${earned.has(k) ? "" : "grayscale opacity-30"}`}
              role="img"
              aria-label={milestoneLabel(k)}
            >
              {milestoneEmoji(k)}
            </span>
          ))}
        </div>
        {next && (
          /* LAW > CANON: the 18sp floor — `t-hint` is 16px. */
          <span className="text-[18px] text-softgrey font-hindi leading-snug">
            {t("milestones.nextLabel")} {milestoneLabel(next as MilestoneKind)}
          </span>
        )}
      </div>
    </Card>
  );
}

export default PragatiCard;
