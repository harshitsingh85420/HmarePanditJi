'use client'

interface ProgressDotsProps {
  total: number
  current: number
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
                ? 'w-3 h-3 bg-[#F09942] ring-2 ring-[#F09942]/25 ring-offset-1'
                : isCompleted
                ? 'w-2.5 h-2.5 bg-[#F09942] cursor-pointer'
                : 'w-2.5 h-2.5 bg-[#F0E6D3] cursor-default',
            ].join(' ')}
            aria-label={`Step ${dotNum}`}
            disabled={!isCompleted}
          />
        )
      })}
    </div>
  )
}
