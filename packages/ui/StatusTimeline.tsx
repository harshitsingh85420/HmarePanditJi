import React from 'react';

export interface TimelineStep {
    label: string;
    description?: string;
    timestamp?: string | Date;
    status: 'completed' | 'active' | 'pending';
}

export interface StatusTimelineProps {
    steps: TimelineStep[];
    className?: string;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ steps, className = '' }) => {
    return (
        <div className={`relative ${className}`}>
            {steps.map((step, index) => {
                const isLast = index === steps.length - 1;

                return (
                    <div key={index} className="flex relative pb-8 last:pb-0">
                        {/* Connecting line */}
                        {!isLast && (
                            <div
                                className={`absolute top-8 left-4 w-0.5 h-full -ml-px ${step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                                    }`}
                            />
                        )}

                        {/* Status Icon */}
                        <div className="flex-shrink-0 relative z-10 w-8 h-8 flex items-center justify-center mr-4">
                            {step.status === 'completed' && (
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-2 border-white shadow-sm inset-0 absolute">
                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                            {step.status === 'active' && (
                                <>
                                    <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-75"></div>
                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center border-2 border-white shadow-sm relative z-10">
                                        <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                    </div>
                                </>
                            )}
                            {step.status === 'pending' && (
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border-2 border-gray-300 relative z-10">
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                            <h4 className={`text-base font-medium ${step.status === 'pending' ? 'text-gray-500' : 'text-gray-900'
                                }`}>
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
