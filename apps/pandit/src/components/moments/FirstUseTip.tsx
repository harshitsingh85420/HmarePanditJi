"use client";

// One-shot contextual tip: shows the CoachSpotlight for a registered
// coachTips entry the FIRST time the pandit lands on the screen, and
// never again after [समझा].

import React, { useEffect, useState } from "react";
import { CoachSpotlight } from "./CoachSpotlight";
import { COACH_TIPS, isTipSeen, markTipSeen } from "@/lib/coachTips";

export function FirstUseTip({
  tipId,
  targetRef,
  delayMs = 900,
}: {
  tipId: keyof typeof COACH_TIPS;
  targetRef: React.RefObject<HTMLElement | null>;
  delayMs?: number;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (isTipSeen(tipId)) return;
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [tipId, delayMs]);

  const tip = COACH_TIPS[tipId];
  if (!show || !tip) return null;
  return (
    <CoachSpotlight
      targetRef={targetRef}
      title={tip.title}
      line={tip.line}
      onDone={() => {
        markTipSeen(tipId);
        setShow(false);
      }}
    />
  );
}

export default FirstUseTip;
