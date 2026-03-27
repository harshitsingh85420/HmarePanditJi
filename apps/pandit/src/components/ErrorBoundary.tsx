'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect, useState } from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const errorHandler = (errorEvent: ErrorEvent) => {
      setError(errorEvent.error)
      setHasError(true)

      // Report to Sentry
      Sentry.captureException(errorEvent.error, {
        tags: {
          error_type: 'runtime_error',
          component: 'ErrorBoundary',
        },
      })
    }

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)))
      setHasError(true)

      // Report to Sentry
      Sentry.captureException(event.reason, {
        tags: {
          error_type: 'unhandled_rejection',
          component: 'ErrorBoundary',
        },
      })
    }

    window.addEventListener('error', errorHandler)
    window.addEventListener('unhandledrejection', unhandledRejectionHandler)

    return () => {
      window.removeEventListener('error', errorHandler)
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler)
    }
  }, [])

  if (hasError) {
    if (fallback) {
      return fallback
    }

    return (
      <div className="flex min-h-[400px] items-center justify-center p-4">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            कुछ गड़बड़ हो गई | कुछ गलत हो गया
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            कृपया पृष्ठ को रीफ्रेश करें | कृपया पेज को रिफ्रेश करें
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            रिफ्रेश करें | Refresh
          </button>
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-gray-500">
                Error Details
              </summary>
              <pre className="mt-2 max-w-md overflow-auto rounded bg-gray-100 p-2 text-xs text-red-600">
                {error.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  return children
}
