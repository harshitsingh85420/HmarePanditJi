/**
 * Hydration Guard - Prevents SSR/CSR mismatch
 *
 * Usage:
 * <HydrationGuard fallback={<LoadingSkeleton />}>
 *   <YourComponent />
 * </HydrationGuard>
 */

'use client'

import { useEffect, useState, ReactNode } from 'react'
import { FullScreenLoader } from '@/components/skeletons'

interface HydrationGuardProps {
  children: ReactNode
  fallback?: ReactNode
  showLoader?: boolean
  delay?: number
}

export function HydrationGuard({
  children,
  fallback,
  showLoader = false,
  delay = 0,
}: HydrationGuardProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Optional delay for smoother transitions
    const timer = setTimeout(() => {
      setMounted(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!mounted) {
    return fallback ? (
      <>{fallback}</>
    ) : showLoader ? (
      <FullScreenLoader />
    ) : null
  }

  return <>{children}</>
}

/**
 * Hook to check if component is mounted
 * 
 * Usage:
 * const mounted = useMounted()
 * if (!mounted) return <Skeleton />
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}

/**
 * Higher-order component for hydration safety
 * 
 * Usage:
 * const SafeComponent = withHydrationGuard(HeavyComponent)
 */
export function withHydrationGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function HydrationGuardWrapper(props: P) {
    const mounted = useMounted()

    if (!mounted) {
      return fallback ? <>{fallback}</> : null
    }

    return <WrappedComponent {...props} />
  }
}
