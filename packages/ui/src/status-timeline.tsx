"use client";
import React from "react";

export interface TimelineStep {
  label: string;
  description?: string;
  timestamp?: string | Date;
  isActive?: boolean;
  isCompleted?: boolean;
  icon?: string; // material symbol name
}

export interface StatusTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function StatusTimeline({ steps, className = "" }: StatusTimelineProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const ts =
          step.timestamp instanceof Date
            ? step.timestamp.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : step.timestamp;

        return (
          <div key={i} className="flex gap-4">
            {/* Dot + line - ACC-009 & ACC-010 FIX: Larger indicators for elderly */}
            <div className="flex flex-col items-center">
              <div
                className={[
                  "border-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors",
                  step.isActive
                    ? "border-amber-500 bg-amber-500 text-white"
                    : step.isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800",
                ].join(" ")}
              >
                {step.isCompleted ? (
                  <span className="material-symbols-outlined text-xl">
                    check
                  </span>
                ) : step.icon ? (
                  <span className="material-symbols-outlined text-xl">
                    {step.icon}
                  </span>
                ) : (
                  <span className="h-3 w-3 rounded-full bg-current" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`mt-2 min-h-[32px] w-1 flex-1 ${
                    step.isCompleted
                      ? "bg-green-400 dark:bg-green-600"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}
            </div>

            {/* Content - ACC-010 FIX: Larger text for elderly readability */}
            <div className={`min-w-0 flex-1 pb-8 ${isLast ? "pb-0" : ""}`}>
              <p
                className={`text-base font-semibold ${
                  step.isActive
                    ? "text-amber-600 dark:text-amber-400"
                    : step.isCompleted
                      ? "text-slate-800 dark:text-slate-200"
                      : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
                  {step.description}
                </p>
              )}
              {ts && (
                <p className="mt-1 text-base text-slate-400 dark:text-slate-500">
                  {ts}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
