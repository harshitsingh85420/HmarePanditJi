"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { hi } from "../../lib/strings";

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
  let chipStyles = "bg-gray-100 text-softgrey";
  let label: string = hi.status.cancelled;

  switch (status) {
    case "REQUESTED":
      chipStyles = "bg-saffron-100 text-saffron-700";
      label = hi.status.requested;
      break;
    case "ACCEPTED":
      // Literals exception allowed: #E8F0FE for bg, #1A56DB for text
      chipStyles = "bg-[#E8F0FE] text-[#1A56DB]";
      label = hi.status.accepted;
      break;
    case "IN_PROGRESS":
      // Literals exception allowed: #FEF3C7 for bg, #92400E for text
      chipStyles = "bg-[#FEF3C7] text-[#92400E]";
      label = hi.status.inProgress;
      break;
    case "COMPLETED":
      chipStyles = "bg-leaf-100 text-leaf-700";
      label = hi.status.completed;
      break;
    case "REJECTED":
    case "CANCELLED":
    default:
      chipStyles = "bg-gray-100 text-softgrey";
      label = hi.status.cancelled;
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
