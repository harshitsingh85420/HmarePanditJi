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
          <div key={i} className="flex gap-3">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div
                className={[
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                  step.isActive
                    ? "bg-amber-500 border-amber-500 text-white"
                    : step.isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400",
                ].join(" ")}
              >
                {step.isCompleted ? (
                  <span className="material-symbols-outlined text-sm">check</span>
                ) : step.icon ? (
                  <span className="material-symbols-outlined text-sm">{step.icon}</span>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[24px] mt-1 ${
                    step.isCompleted
                      ? "bg-green-400 dark:bg-green-600"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
              <p
                className={`text-sm font-semibold ${
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
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.description}</p>
              )}
              {ts && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{ts}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
