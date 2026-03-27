/**
 * Skeleton Components - Loading states for all major UI components
 * 
 * Usage:
 * import { CardSkeleton, FormScreenSkeleton, DashboardSkeleton } from '@/components/skeletons'
 */

export { CardSkeleton } from './CardSkeleton'
export { FormScreenSkeleton } from './FormScreenSkeleton'
export { DashboardSkeleton } from './DashboardSkeleton'
export { TutorialScreenSkeleton } from './TutorialScreenSkeleton'
export { ListItemSkeleton } from './ListItemSkeleton'
export { TextSkeleton } from './TextSkeleton'
export { ImageSkeleton } from './ImageSkeleton'
export { ButtonSkeleton } from './ButtonSkeleton'

/**
 * Generic Loading Spinner Component
 */
export function LoadingSpinner({
  className = '',
  size = 'default',
  showText = false,
  text = 'लोड हो रहा है...',
}: {
  className?: string
  size?: 'sm' | 'default' | 'lg'
  showText?: boolean
  text?: string
}) {
  const sizeMap = {
    sm: 'w-8 h-8',
    default: 'w-16 h-16',
    lg: 'w-24 h-24',
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeMap[size]} border-4 border-saffron border-t-transparent rounded-full animate-spin`}
      />
      {showText && (
        <p className="mt-4 text-text-secondary font-devanagari animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

/**
 * Full Screen Loading State
 */
export function FullScreenLoader({
  message = 'लोड हो रहा है...',
}: {
  message?: string
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-surface-base">
      <div className="text-center space-y-6">
        {/* Sacred Om symbol with loading animation */}
        <div className="text-7xl animate-glow-pulse" aria-label="Loading">
          ॐ
        </div>
        
        {/* Loading text in Hindi */}
        <p className="font-devanagari text-text-secondary text-lg animate-pulse">
          {message}
        </p>
        
        {/* Spinning indicator */}
        <div className="w-16 h-16 border-4 border-saffron border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )
}
