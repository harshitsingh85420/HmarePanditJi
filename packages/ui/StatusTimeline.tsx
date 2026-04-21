export interface TimelineStep {
  label: string;
  description?: string;
  timestamp?: string | Date;
  status: "completed" | "active" | "pending";
}

export interface StatusTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export const StatusTimeline = ({
  steps,
  className = "",
}: StatusTimelineProps) => {
  return (
    <div className={`relative ${className}`}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="relative flex pb-8 last:pb-0">
            {/* Connecting line */}
            {!isLast && (
              <div
                className={`absolute left-4 top-8 -ml-px h-full w-0.5 ${step.status === "completed" ? "bg-green-500" : "bg-gray-200"
                  }`}
              />
            )}

            {/* Status Icon */}
            <div className="relative z-10 mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center">
              {step.status === "completed" && (
                <div className="absolute inset-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-green-500 shadow-sm">
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              {step.status === "active" && (
                <>
                  <div className="absolute inset-0 animate-ping rounded-full bg-orange-400 opacity-75"></div>
                  <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-orange-500 shadow-sm">
                    <div className="h-2.5 w-2.5 rounded-full bg-white"></div>
                  </div>
                </>
              )}
              {step.status === "pending" && (
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white"></div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <h4
                className={`text-base font-medium ${step.status === "pending" ? "text-gray-500" : "text-gray-900"
                  }`}
              >
                {step.label}
              </h4>
              {step.description && (
                <p className="mt-1 text-sm text-gray-600">{step.description}</p>
              )}
              {step.timestamp && (
                <p className="mt-1 text-xs text-gray-500">
                  {step.timestamp instanceof Date
                    ? step.timestamp.toLocaleString()
                    : step.timestamp}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
