'use client'

import { PageLoading } from '@/components/ui/LoadingOverlay'

/**
 * Global Loading Page
 *
 * Shown during route transitions (React Suspense).
 *
 * PageLoading renders canon artboard 28 — the radial screen wash, the
 * breathing kindle halo behind the brass Diya at 92, "एक क्षण…" and the
 * three twinkling dots. Picked up automatically by the Next.js router.
 */
export default function Loading() {
  return <PageLoading />
}
