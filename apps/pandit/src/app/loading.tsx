'use client'

import { PageLoading } from '@/components/ui/LoadingOverlay'

/**
 * Global Loading Page
 * 
 * Shown during route transitions.
 * Uses React Suspense under the hood.
 * 
 * This file is automatically picked up by Next.js
 * for the app/pandit/src/app/loading.tsx route
 */
export default function Loading() {
  return <PageLoading />
}
