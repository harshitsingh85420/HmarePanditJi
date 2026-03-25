import React from "react";

export interface Step {
  label: string;
  description?: string;
  icon?: string;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  className?: string;
}

export function StepIndicator({
  steps,
  currentStep,
  completedSteps,
  className = "",
}: StepIndicatorProps) {
  return (
    <div
      className={`flex items-center w-full ${className}`}
      role="list"
      aria-label="Progress steps"
    >
      {steps.map((step, idx) => {
        const isDone = completedSteps
          ? completedSteps.includes(idx)
          : idx < currentStep;
        const isActive = idx === currentStep;
        const isLast = idx === steps.length - 1;

        return (
          <React.Fragment key={idx}>
            <div
              className="flex flex-col items-center flex-shrink-0"
              role="listitem"
              aria-current={isActive ? "step" : undefined}
            >
              {/* ACC-009 & ACC-010 FIX: Larger step indicators for elderly users */}
              <div
                className={[
                  "w-14 h-14 rounded-full flex items-center justify-center border-3 transition-all",
                  isDone
                    ? "bg-primary border-primary text-white"
                    : isActive
                      ? "bg-white border-primary text-primary dark:bg-slate-900"
                      : "bg-white border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-700",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {isDone ? (
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                ) : step.icon ? (
                  <span className="material-symbols-outlined text-2xl">
                    {step.icon}
                  </span>
                ) : (
                  <span className="text-lg font-bold">{idx + 1}</span>
                )}
              </div>
              <span
                className={`mt-2 text-base font-bold text-center max-w-[100px] leading-tight ${isActive
                    ? "text-primary"
                    : isDone
                      ? "text-slate-600 dark:text-slate-300"
                      : "text-slate-400"
                  }`}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="text-sm text-slate-400 text-center max-w-[100px] leading-tight">
                  {step.description}
                </span>
              )}
            </div>

            {!isLast && (
              <div
                className={`flex-1 h-1 mt-[-20px] mx-2 transition-all ${isDone ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                  }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
