'use client'

interface ProgressDotsProps {
  total: number
  current: number // 1-indexed
}

export default function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-3 justify-center py-1">
      {Array.from({ length: total }, (_, i) => {
        const dotNum = i + 1
        const isCompleted = dotNum < current
        const isCurrent = dotNum === current

        if (isCurrent) {
          return (
            <div
              key={i}
              className="w-4 h-4 rounded-full ring-4 ring-[#F09942]/20 flex-shrink-0"
              style={{ backgroundColor: '#F09942' }}
            />
          )
        }
        if (isCompleted) {
          return (
            <div
              key={i}
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: '#F09942' }}
            />
          )
        }
        return (
          <div
            key={i}
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: 'rgba(240,153,66,0.20)' }}
          />
        )
      })}
    </div>
  )
}
