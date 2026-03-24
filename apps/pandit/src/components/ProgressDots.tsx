'use client'

interface ProgressDotsProps {
  total: number
  current: number  // 1-indexed
  onDotClick?: (index: number) => void
}

export default function ProgressDots({ total, current, onDotClick }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {Array.from({ length: total }, (_, i) => {
        const dotNum = i + 1
        const isCompleted = dotNum < current
        const isCurrent = dotNum === current
        return (
          <button
            key={i}
            onClick={() => isCompleted && onDotClick?.(dotNum)}
            className={[
              'rounded-full transition-all duration-300',
              isCurrent
                // P1 FIX: Increased from 12px to 16px for elderly visibility
                ? 'w-4 h-4 bg-primary ring-2 ring-primary/25 ring-offset-1'
                // P1 FIX: Increased from 10px to 14px for elderly visibility
                : isCompleted
                  ? 'w-[14px] h-[14px] bg-primary cursor-pointer'
                  : 'w-[14px] h-[14px] bg-vedic-border cursor-default',
            ].join(' ')}
            aria-label={`Step ${dotNum}`}
            disabled={!isCompleted}
          />
        )
      })}
    </div>
  )
}
