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
      className={`flex w-full items-center ${className}`}
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
              className="flex flex-shrink-0 flex-col items-center"
              role="listitem"
              aria-current={isActive ? "step" : undefined}
            >
              {/* ACC-009 & ACC-010 FIX: Larger step indicators for elderly users */}
              <div
                className={[
                  "border-3 flex h-14 w-14 items-center justify-center rounded-full transition-all",
                  isDone
                    ? "bg-primary border-primary text-white"
                    : isActive
                      ? "border-primary text-primary bg-white dark:bg-slate-900"
                      : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900",
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
                className={`mt-2 max-w-[100px] text-center text-base font-bold leading-tight ${
                  isActive
                    ? "text-primary"
                    : isDone
                      ? "text-slate-600 dark:text-slate-300"
                      : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="max-w-[100px] text-center text-sm leading-tight text-slate-400">
                  {step.description}
                </span>
              )}
            </div>

            {!isLast && (
              <div
                className={`mx-2 mt-[-20px] h-1 flex-1 transition-all ${
                  isDone ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
