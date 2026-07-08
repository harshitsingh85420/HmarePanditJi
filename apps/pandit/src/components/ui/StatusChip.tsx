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
  let chipStyles = "bg-[#EFE8DC] text-softgrey";
  let label: string = t("status.cancelled");

  switch (status) {
    case "REQUESTED":
      chipStyles = "bg-[#FDEBD2] text-[#8A5410]";
      label = t("status.requested");
      break;
    case "ACCEPTED":
      // Literals exception allowed: #E8F0FE for bg, #1A56DB for text
      chipStyles = "bg-[#E7ECF7] text-[#2C4A8A]";
      label = t("status.accepted");
      break;
    case "IN_PROGRESS":
      // Literals exception allowed: #FEF3C7 for bg, #92400E for text
      chipStyles = "bg-[#FBE9CF] text-[#9A5B12]";
      label = t("status.inProgress");
      break;
    case "COMPLETED":
      chipStyles = "bg-leaf-100 text-leaf-700";
      label = t("status.completed");
      break;
    case "REJECTED":
    case "CANCELLED":
    default:
      chipStyles = "bg-[#EFE8DC] text-softgrey";
      label = t("status.cancelled");
      break;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center h-9 px-4 rounded-full text-[16px] font-semibold select-none",
        chipStyles,
        className
      )}
    >
      {label}
    </div>
  );
}
