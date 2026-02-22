import React from 'react';

export interface SkeletonProps {
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    count?: number;
    className?: string;
    style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    variant = 'text',
    width,
    height,
    count = 1,
    className = '',
    style,
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'circular':
                return 'rounded-full w-10 h-10'; // Default size
            case 'rectangular':
                return 'rounded-md w-full h-24'; // Default size
            case 'text':
            default:
                return 'rounded w-full h-4 mt-1 mb-1';
        }
    };

    const getStyleObj = () => {
        let s: React.CSSProperties = { ...style };
        if (width) s.width = typeof width === 'number' ? `${width}px` : width;
        if (height) s.height = typeof height === 'number' ? `${height}px` : height;
        return s;
    };

    const elements = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            style={getStyleObj()}
            className={`bg-gray-200 animate-pulse ${getVariantStyles()} ${className}`}
        />
    ));

    if (count === 1) return <>{elements[0]}</>;
    return <div className="space-y-2">{elements}</div>;
};

// Preset Skeleton for PanditCard
export const PanditCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col ${className}`}>
            <div className="flex">
                {/* Avatar Area */}
                <div className="mr-4 mt-1">
                    <Skeleton variant="circular" width={64} height={64} />
                </div>

                {/* Info Area */}
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div className="w-full">
                            <Skeleton variant="text" width="60%" height={24} className="mb-2" />
                            <Skeleton variant="text" width="40%" height={16} />
                        </div>
                        <Skeleton variant="circular" width={32} height={32} />
                    </div>

                    <Skeleton variant="text" width="50%" height={20} className="mt-4" />
                </div>
            </div>

            {/* Tags Section */}
            <div className="mt-5 space-y-3">
                <div className="flex gap-2">
                    <Skeleton variant="rectangular" width={80} height={28} className="rounded-full" />
                    <Skeleton variant="rectangular" width={100} height={28} className="rounded-full" />
                    <Skeleton variant="rectangular" width={70} height={28} className="rounded-full" />
                </div>

                <div className="flex gap-1.5 mt-2">
                    <Skeleton variant="rectangular" width={60} height={24} className="rounded-md" />
                    <Skeleton variant="rectangular" width={60} height={24} className="rounded-md" />
                </div>
            </div>

            {/* Bottom Actions Footer */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                <Skeleton variant="rectangular" height={40} className="flex-1 !w-auto" />
                <Skeleton variant="rectangular" height={40} className="flex-1 !w-auto" />
            </div>
        </div>
    );
};
