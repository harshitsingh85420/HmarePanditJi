'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'

/**
 * Hook to track page views and navigation events
 */
export function usePageViewTracking() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return

    const url = searchParams.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname

    // Track page view in Sentry
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${url}`,
      level: 'info',
    })

    // Set transaction for performance monitoring (Sentry v8 API)
    Sentry.startSpan({
      op: 'navigation',
      name: url,
    }, () => {})
  }, [pathname, searchParams])
}

/**
 * Hook to track user interactions
 */
export function useUserActionTracking() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const interactiveElement = target.closest('button, a, [role="button"]')

      if (interactiveElement) {
        const element = interactiveElement as HTMLElement
        const actionType = element.tagName.toLowerCase()
        const actionName =
          element.getAttribute('data-tracking-name') ||
          element.textContent?.trim().slice(0, 50) ||
          'unknown'

        Sentry.addBreadcrumb({
          category: 'ui.click',
          message: `${actionType}: ${actionName}`,
          level: 'info',
          data: {
            element: actionType,
            name: actionName,
          },
        })
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])
}

/**
 * Component to wrap the app for tracking
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  usePageViewTracking()
  useUserActionTracking()

  return <>{children}</> as JSX.Element
}
