"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { t } from "../../lib/i18n";

function cn(...inputs: (string | undefined | false | null)[]) {
  return twMerge(clsx(inputs));
}

export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export interface StatusChipProps {
  status: BookingStatus | string;
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  // CANON CHIP FIELDS. Canon uses exactly three status pills, always
  // border-radius:999px + font-weight:800, and always a tinted field with a
  // same-family dark ink:
  //   sindoor  #B23A1A on #FDEEE7   — new / awaiting the pandit
  //   gold     #B8860B on #FBF0D8   — in flight
  //   leaf     #155C34 on #E4F3E9   — done
  // The app's fields were near-misses of all three (#FDEBD2/#FBE9CF/…), which
  // is why chips never quite belonged to the surface they sat on.
  // INK IS DARKENED FROM CANON — see the AAA note on each line below.
  let chipStyles = "bg-[#EFE8DC] text-temple-700";
  let label: string = t("status.cancelled");

  switch (status) {
    case "REQUESTED":
      // canon ink #B23A1A on this field is 5.1:1 — AA, not AAA. saffron-700
      // (#7A250E) is canon's own on-cream ink and clears AAA at 8.7:1.
      chipStyles = "bg-saffron-50 text-saffron-700";
      label = t("status.requested");
      break;
    case "ACCEPTED":
      // Canon has no blue; keep the app's existing accepted pair.
      chipStyles = "bg-[#E7ECF7] text-[#2C4A8A]";
      label = t("status.accepted");
      break;
    case "IN_PROGRESS":
      // canon ink #B8860B on #FBF0D8 is 2.8:1 — fails even AA. Field kept
      // (goldpale is canon), ink darkened to #6B4A08 for 7.1:1 AAA.
      chipStyles = "bg-goldpale text-[#6B4A08]";
      label = t("status.inProgress");
      break;
    case "COMPLETED":
      chipStyles = "bg-leaf-100 text-leaf-700";
      label = t("status.completed");
      break;
    case "REJECTED":
    case "CANCELLED":
    default:
      // softgrey (#8A6F5C) on #EFE8DC is 3.4:1 — under AA. temple-700 keeps
      // the muted read while clearing AAA.
      chipStyles = "bg-[#EFE8DC] text-temple-700";
      label = t("status.cancelled");
      break;
  }

  return (
    <div
      className={cn(
        // canon: radius 999px, weight 800. Canon sets these labels at 12-14px;
        // held at 16px for the 18sp-floor persona (see lawConflicts).
        "inline-flex items-center justify-center h-9 px-4 rounded-chip text-[16px] font-extrabold select-none",
        chipStyles,
        className
      )}
    >
      {label}
    </div>
  );
}
